import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string; associationId: string } }
) {
  try {
    const supabase = createClient()
    
    // Get specific media association
    const { data: association, error: associationError } = await supabase
      .from('campaign_media_associations')
      .select('*')
      .eq('id', params.associationId)
      .eq('message_id', params.messageId)
      .eq('campaign_id', params.id)
      .single()

    if (associationError || !association) {
      return NextResponse.json({ error: 'Media association not found' }, { status: 404 })
    }

    return NextResponse.json({ association })
  } catch (error) {
    console.error('Error fetching media association:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
