import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCampaignMessagesQueue,
  getCampaignNotificationsQueue,
} from '@/lib/queues/queue-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get campaign details
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if campaign can be started
    if (campaign.status === 'running') {
      return NextResponse.json(
        { error: 'Campaign is already running' },
        { status: 400 }
      )
    }

    if (campaign.status === 'completed') {
      return NextResponse.json(
        { error: 'Campaign is already completed' },
        { status: 400 }
      )
    }

    if (!campaign.recipients || campaign.recipients.length === 0) {
      return NextResponse.json(
        { error: 'Campaign has no recipients' },
        { status: 400 }
      )
    }

    // Get Z-API instance for the user
    const { data: zApiInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (instanceError || !zApiInstance) {
      return NextResponse.json(
        { error: 'No active Z-API instance found' },
        { status: 400 }
      )
    }

    // Update campaign status to running
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating campaign status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update campaign status' },
        { status: 500 }
      )
    }

    // Add campaign notification job
    const campaignNotificationsQueue = getCampaignNotificationsQueue()
    await campaignNotificationsQueue.add('campaign-started', {
      campaignId: id,
      status: 'started',
    })

    // Add individual message jobs for each recipient
    const campaignMessagesQueue = getCampaignMessagesQueue()
    const messageJobs = campaign.recipients.map((contactId: string) => ({
      campaignId: id,
      contactId,
      phone: '', // Will be fetched from contact
      message: campaign.message,
      instanceId: zApiInstance.instance_id,
      instanceToken: zApiInstance.instance_token,
      clientToken: zApiInstance.client_token,
      user_id: user.id,
    }))

    // Fetch contact phone numbers
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, phone')
      .in('id', campaign.recipients)
      .eq('user_id', user.id)

    const contactPhoneMap = new Map(contacts?.map((c) => [c.id, c.phone]) || [])

    // Add jobs with phone numbers
    const jobsWithPhones = messageJobs
      .filter((job: { contactId: string }) =>
        contactPhoneMap.has(job.contactId)
      )
      .map((job: { contactId: string; [key: string]: unknown }) => ({
        ...job,
        phone: contactPhoneMap.get(job.contactId)!,
      }))

    // Add all message jobs to the queue
    await Promise.all(
      jobsWithPhones.map((job: { contactId: string; [key: string]: unknown }) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        campaignMessagesQueue.add('send-campaign-message', job as any, {
          priority: 1,
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Campaign started successfully',
      jobsQueued: jobsWithPhones.length,
    })
  } catch (error) {
    console.error('Error starting campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
