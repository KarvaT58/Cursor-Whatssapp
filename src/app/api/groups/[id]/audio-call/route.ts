import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de iniciar chamada de áudio
const StartAudioCallSchema = z.object({
  participants: z.array(z.string().min(1, 'Telefone inválido'))
    .min(1, 'Mínimo 1 participante')
    .max(32, 'Máximo 32 participantes'),
  title: z.string().max(100, 'Título muito longo').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  scheduled_at: z.string().datetime().optional(),
})

// POST /api/groups/[id]/audio-call - Iniciar chamada de áudio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const groupId = params.id
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { participants, title, description, scheduled_at } = StartAudioCallSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Verificar se há uma chamada ativa no grupo
    const { data: activeCall, error: activeCallError } = await supabase
      .from('group_audio_calls')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .single()

    if (activeCall) {
      return NextResponse.json(
        { error: 'Já existe uma chamada ativa neste grupo' },
        { status: 400 }
      )
    }

    // Validar participantes
    const validParticipants = participants.filter(phone => 
      group.participants?.includes(phone)
    )

    if (validParticipants.length !== participants.length) {
      return NextResponse.json(
        { error: 'Alguns participantes não são membros do grupo' },
        { status: 400 }
      )
    }

    // Adicionar o criador da chamada se não estiver na lista
    if (!validParticipants.includes(userPhone)) {
      validParticipants.push(userPhone)
    }

    // Verificar limite de participantes (WhatsApp: 32)
    if (validParticipants.length > 32) {
      return NextResponse.json(
        { error: 'Máximo 32 participantes permitidos' },
        { status: 400 }
      )
    }

    // Verificar se é uma chamada agendada
    const isScheduled = scheduled_at && new Date(scheduled_at) > new Date()
    const callStatus = isScheduled ? 'scheduled' : 'active'

    // Criar a chamada de áudio
    const { data: newCall, error: createError } = await supabase
      .from('group_audio_calls')
      .insert({
        group_id: groupId,
        created_by: user.id,
        created_by_phone: userPhone,
        title: title || `Chamada de áudio - ${group.name}`,
        description: description || null,
        participants: validParticipants,
        status: callStatus,
        scheduled_at: scheduled_at || null,
        started_at: isScheduled ? null : new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar chamada de áudio:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar chamada de áudio' },
        { status: 500 }
      )
    }

    // Criar registros de participação
    const participationRecords = validParticipants.map(phone => ({
      call_id: newCall.id,
      participant_phone: phone,
      status: phone === userPhone ? 'joined' : 'invited',
      joined_at: phone === userPhone ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    }))

    const { error: participationError } = await supabase
      .from('audio_call_participants')
      .insert(participationRecords)

    if (participationError) {
      console.error('Erro ao criar registros de participação:', participationError)
      // Não falhar a operação se os registros de participação falharem
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await startWhatsAppAudioCall(group.whatsapp_id, newCall)
        console.log(`TODO: Iniciar chamada de áudio ${newCall.id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    // TODO: Notificar participantes sobre a chamada
    try {
      // await notifyParticipantsAboutCall(validParticipants, newCall, group.name)
      console.log(`TODO: Notificar participantes sobre chamada ${newCall.id}`)
    } catch (notificationError) {
      console.error('Erro ao notificar participantes:', notificationError)
      // Não falhar a operação se a notificação falhar
    }

    return NextResponse.json({
      message: isScheduled ? 'Chamada agendada com sucesso' : 'Chamada iniciada com sucesso',
      call: {
        ...newCall,
        participants_count: validParticipants.length,
        is_scheduled: isScheduled,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de iniciar chamada de áudio:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/audio-call - Obter chamada ativa do grupo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const groupId = params.id
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Buscar chamada ativa
    const { data: activeCall, error: activeCallError } = await supabase
      .from('group_audio_calls')
      .select(`
        *,
        audio_call_participants (
          id,
          participant_phone,
          status,
          joined_at,
          left_at
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .single()

    if (activeCallError && activeCallError.code !== 'PGRST116') {
      console.error('Erro ao buscar chamada ativa:', activeCallError)
      return NextResponse.json(
        { error: 'Erro ao buscar chamada ativa' },
        { status: 500 }
      )
    }

    if (!activeCall) {
      return NextResponse.json({
        message: 'Nenhuma chamada ativa encontrada',
        call: null,
      })
    }

    // Processar participantes
    const participants = activeCall.audio_call_participants || []
    const joinedParticipants = participants.filter(p => p.status === 'joined')
    const invitedParticipants = participants.filter(p => p.status === 'invited')

    return NextResponse.json({
      message: 'Chamada ativa obtida com sucesso',
      call: {
        ...activeCall,
        participants: {
          total: participants.length,
          joined: joinedParticipants.length,
          invited: invitedParticipants.length,
          list: participants,
        },
        user_status: participants.find(p => p.participant_phone === userPhone)?.status || 'not_invited',
      },
    })
  } catch (error) {
    console.error('Erro na API de obter chamada ativa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
