import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
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
      .select('id, status, stats, recipients, started_at, scheduled_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const stats = campaign.stats || {
      sent: 0,
      failed: 0,
      total: 0,
      delivered: 0,
      read: 0,
    }
    const totalRecipients = campaign.recipients?.length || 0
    const totalProcessed = stats.sent + stats.failed
    const progressPercentage =
      totalRecipients > 0 ? (totalProcessed / totalRecipients) * 100 : 0

    // Calculate estimated completion time
    let estimatedCompletion: Date | undefined
    if (
      campaign.status === 'running' &&
      campaign.started_at &&
      totalProcessed > 0
    ) {
      const startTime = new Date(campaign.started_at)
      const elapsed = Date.now() - startTime.getTime()
      const rate = totalProcessed / elapsed // messages per millisecond
      const remaining = totalRecipients - totalProcessed
      const estimatedTimeRemaining = remaining / rate
      estimatedCompletion = new Date(Date.now() + estimatedTimeRemaining)
    }

    const progress = {
      campaignId: campaign.id,
      stats,
      status: campaign.status,
      progress: Math.min(100, Math.max(0, progressPercentage)),
      estimatedCompletion: estimatedCompletion?.toISOString(),
      totalRecipients,
      totalProcessed,
      successRate:
        totalProcessed > 0 ? ((stats.sent || 0) / totalProcessed) * 100 : 0,
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching campaign progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
