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

    // Check if campaign can be paused
    if (campaign.status !== 'running') {
      return NextResponse.json(
        { error: 'Campaign is not running' },
        { status: 400 }
      )
    }

    // Update campaign status to draft (paused)
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'draft',
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
    await campaignNotificationsQueue.add('campaign-paused', {
      campaignId: id,
      status: 'failed', // Using failed status to indicate pause
      message: 'Campaign paused by user',
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign paused successfully',
    })
  } catch (error) {
    console.error('Error pausing campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
