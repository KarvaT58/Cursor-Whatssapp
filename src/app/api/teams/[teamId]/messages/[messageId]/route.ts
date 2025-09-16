import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const editMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; messageId: string }> }
) {
  try {
    const { teamId, messageId } = await params
    const body = await request.json()

    const { content, metadata } = editMessageSchema.parse(body)

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

    // Get the message to verify ownership
    const { data: message, error: messageError } = await supabase
      .from('team_messages')
      .select('sender_id')
      .eq('id', messageId)
      .eq('team_id', teamId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is the sender of the message
    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('team_messages')
      .update({
        content,
        metadata: metadata || {},
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
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

    if (updateError) {
      console.error('Error updating message:', updateError)
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: {
        ...updatedMessage,
        sender: updatedMessage.sender,
      },
    })
  } catch (error) {
    console.error(
      'Error in PUT /api/teams/[teamId]/messages/[messageId]:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; messageId: string }> }
) {
  try {
    const { teamId, messageId } = await params

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

    // Get the message to verify ownership
    const { data: message, error: messageError } = await supabase
      .from('team_messages')
      .select('sender_id')
      .eq('id', messageId)
      .eq('team_id', teamId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is the sender of the message
    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete message
    const { error: deleteError } = await supabase
      .from('team_messages')
      .delete()
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      'Error in DELETE /api/teams/[teamId]/messages/[messageId]:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
