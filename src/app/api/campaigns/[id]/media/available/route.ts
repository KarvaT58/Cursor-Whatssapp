import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get campaign media availability
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get available media for this campaign
    const { data: media, error: mediaError } = await supabase
      .from('campaign_media')
      .select('*')
      .eq('campaign_id', params.id)

    if (mediaError) {
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching campaign media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
