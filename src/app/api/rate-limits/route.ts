import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  whatsappRateLimiter,
  campaignRateLimiter,
  apiRateLimiter,
} from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Z-API instance
    const { data: zApiInstance } = await supabase
      .from('z_api_instances')
      .select('instance_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const instanceId = zApiInstance?.instance_id || 'default'

    // Get rate limit status for different services
    const [whatsappLimit, campaignLimit, apiLimit] = await Promise.all([
      whatsappRateLimiter.getRemaining(instanceId),
      campaignRateLimiter.getRemaining(user.id),
      apiRateLimiter.getRemaining(user.id),
    ])

    const rateLimits = {
      whatsapp: {
        remaining: whatsappLimit,
        limit: 20, // messages per minute
        window: '1 minute',
      },
      campaign: {
        remaining: campaignLimit,
        limit: 100, // campaign messages per minute
        window: '1 minute',
      },
      api: {
        remaining: apiLimit,
        limit: 1000, // API requests per minute
        window: '1 minute',
      },
    }

    return NextResponse.json(rateLimits)
  } catch (error) {
    console.error('Error fetching rate limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
