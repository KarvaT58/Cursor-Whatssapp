import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SendMessageSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  channel: z.string().default('general'),
})

// GET /api/teams/messages - Listar mensagens da equipe
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

    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel') || 'general'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verificar se o usuário está em uma equipe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!userData?.team_id) {
      return NextResponse.json(
        { error: 'User is not in a team' },
        { status: 400 }
      )
    }

    // Buscar mensagens da equipe
    const { data: messagesData, error: messagesError } = await supabase
      .from('team_messages')
      .select(
        `
        *,
        user:users!team_messages_user_id_fkey(
          id,
          name,
          email,
          role
        )
      `
      )
      .eq('team_id', userData.team_id)
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Error fetching team messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch team messages' },
        { status: 500 }
      )
    }

    // Buscar total de mensagens para paginação
    const { count, error: countError } = await supabase
      .from('team_messages')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', userData.team_id)
      .eq('channel', channel)

    if (countError) {
      console.error('Error counting team messages:', countError)
    }

    return NextResponse.json({
      messages: (messagesData || []).reverse(), // Reverter para ordem cronológica
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Error in teams/messages GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/teams/messages - Enviar mensagem para a equipe
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = SendMessageSchema.parse(body)

    // Verificar se o usuário está em uma equipe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!userData?.team_id) {
      return NextResponse.json(
        { error: 'User is not in a team' },
        { status: 400 }
      )
    }

    // Enviar mensagem
    const { data: messageData, error: messageError } = await supabase
      .from('team_messages')
      .insert({
        content: validatedData.content,
        channel: validatedData.channel,
        team_id: userData.team_id,
        user_id: user.id,
      })
      .select(
        `
        *,
        user:users!team_messages_user_id_fkey(
          id,
          name,
          email,
          role
        )
      `
      )
      .single()

    if (messageError) {
      console.error('Error sending team message:', messageError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json(messageData, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in teams/messages POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
