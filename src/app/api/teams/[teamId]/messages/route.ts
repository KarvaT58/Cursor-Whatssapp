import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  channel: z.string().default('general'),
  replyToId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const getMessagesSchema = z.object({
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

    const { channel, limit, offset } = getMessagesSchema.parse({
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

    // Get messages with sender information
    const {
      data: messages,
      error: messagesError,
      count,
    } = await supabase
      .from('team_messages')
      .select(
        `
        *,
        sender:users!team_messages_sender_id_fkey (
          id,
          name,
          email,
          role
        ),
        replyTo:team_messages!team_messages_reply_to_id_fkey (
          id,
          content,
          sender:users!team_messages_sender_id_fkey (
            id,
            name
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('team_id', teamId)
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    const formattedMessages =
      messages?.map((msg) => ({
        ...msg,
        sender: msg.sender,
        replyTo: msg.replyTo
          ? {
              ...msg.replyTo,
              sender: msg.replyTo.sender,
            }
          : undefined,
      })) || []

    return NextResponse.json({
      messages: formattedMessages,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Error in GET /api/teams/[teamId]/messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const body = await request.json()

    const { content, messageType, channel, replyToId, metadata } =
      sendMessageSchema.parse(body)

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

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('team_messages')
      .insert({
        team_id: teamId,
        sender_id: user.id,
        content,
        message_type: messageType,
        channel,
        reply_to_id: replyToId,
        metadata: metadata || {},
      })
      .select(
        `
        *,
        sender:users!team_messages_sender_id_fkey (
          id,
          name,
          email,
          role
        )
      `
      )
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: {
          ...message,
          sender: message.sender,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/teams/[teamId]/messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
