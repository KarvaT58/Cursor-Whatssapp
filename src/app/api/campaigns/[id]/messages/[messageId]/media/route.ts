import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const supabase = createClient()
    
    // Get message media
    const { data: message, error: messageError } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('id', params.messageId)
      .eq('campaign_id', params.id)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Get media associated with this message
    const { data: media, error: mediaError } = await supabase
      .from('campaign_media')
      .select('*')
      .eq('message_id', params.messageId)

    if (mediaError) {
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching message media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
