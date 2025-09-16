import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCampaignNotificationsQueue } from '@/lib/queues/queue-manager'

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

    // Check if campaign can be stopped
    if (campaign.status === 'completed') {
      return NextResponse.json(
        { error: 'Campaign is already completed' },
        { status: 400 }
      )
    }

    if (campaign.status === 'failed') {
      return NextResponse.json(
        { error: 'Campaign is already stopped' },
        { status: 400 }
      )
    }

    // Update campaign status to failed (stopped)
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
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
    await campaignNotificationsQueue.add('campaign-stopped', {
      campaignId: id,
      status: 'failed',
      message: 'Campaign stopped by user',
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign stopped successfully',
    })
  } catch (error) {
    console.error('Error stopping campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
