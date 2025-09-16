import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().optional(),
  senderId: z.string().uuid().optional(),
  messageType: z.enum(['text', 'image', 'file', 'system']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  channel: z.string().default('general'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)

    const {
      query,
      senderId,
      messageType,
      dateFrom,
      dateTo,
      channel,
      limit,
      offset,
    } = searchSchema.parse({
      query: searchParams.get('query'),
      senderId: searchParams.get('senderId'),
      messageType: searchParams.get('messageType'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      channel: searchParams.get('channel'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member of the team
    const { data: teamMember, error: memberError } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', user.id)
      .eq('team_id', teamId)
      .single()

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build query
    let dbQuery = supabase
      .from('team_messages')
      .select(
        `
        *,
        sender:users!team_messages_sender_id_fkey (
          id,
          name,
          email,
          role
        )
      `,
        { count: 'exact' }
      )
      .eq('team_id', teamId)
      .eq('channel', channel)

    // Apply filters
    if (query) {
      dbQuery = dbQuery.textSearch('content', query)
    }

    if (senderId) {
      dbQuery = dbQuery.eq('sender_id', senderId)
    }

    if (messageType) {
      dbQuery = dbQuery.eq('message_type', messageType)
    }

    if (dateFrom) {
      dbQuery = dbQuery.gte('created_at', dateFrom)
    }

    if (dateTo) {
      dbQuery = dbQuery.lte('created_at', dateTo)
    }

    // Execute query
    const {
      data: messages,
      error: messagesError,
      count,
    } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Error searching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to search messages' },
        { status: 500 }
      )
    }

    const formattedMessages =
      messages?.map((msg) => ({
        ...msg,
        sender: msg.sender,
      })) || []

    return NextResponse.json({
      messages: formattedMessages,
      total: count || 0,
      query: query || '',
      filters: {
        query,
        senderId,
        messageType,
        dateFrom,
        dateTo,
        channel,
      },
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Error in GET /api/teams/[teamId]/messages/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
