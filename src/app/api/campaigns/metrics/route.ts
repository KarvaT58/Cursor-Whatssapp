import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get campaign counts by status
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('status, stats')
      .eq('user_id', user.id)

    if (campaignsError) {
      console.error('Error fetching campaign metrics:', campaignsError)
      return NextResponse.json(
        { error: 'Failed to fetch campaign metrics' },
        { status: 500 }
      )
    }

    // Calculate metrics
    const total_campaigns = campaigns.length
    const active_campaigns = campaigns.filter(
      (c) => c.status === 'running'
    ).length
    const completed_campaigns = campaigns.filter(
      (c) => c.status === 'completed'
    ).length
    const failed_campaigns = campaigns.filter(
      (c) => c.status === 'failed'
    ).length

    // Calculate message statistics
    let total_messages_sent = 0
    let total_recipients = 0
    let total_delivered = 0
    let total_read = 0
    let total_failed = 0

    campaigns.forEach((campaign) => {
      if (campaign.stats) {
        total_messages_sent += campaign.stats.sent || 0
        total_recipients += campaign.stats.total || 0
        total_delivered += campaign.stats.delivered || 0
        total_read += campaign.stats.read || 0
        total_failed += campaign.stats.failed || 0
      }
    })

    // Calculate success rate
    const success_rate =
      total_messages_sent > 0
        ? Math.round(
            ((total_delivered + total_read) / total_messages_sent) * 100
          )
        : 0

    const metrics = {
      total_campaigns,
      active_campaigns,
      completed_campaigns,
      failed_campaigns,
      total_messages_sent,
      total_recipients,
      success_rate,
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error in campaign metrics GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
