import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de aprovação
const ApproveParticipantSchema = z.object({
  participant_phone: z.string().min(1, 'Telefone do participante é obrigatório'),
  approved_by: z.string().min(1, 'Aprovador é obrigatório'),
})

// POST /api/groups/[id]/approve - Aprovar participante para entrar no grupo
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
    const { participant_phone, approved_by } = ApproveParticipantSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants, admins, pending_participants')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é administrador do grupo
    const admins = existingGroup.admins || []
    const userPhone = user.phone || user.email
    
    if (!admins.includes(userPhone)) {
      return NextResponse.json(
        { error: 'Apenas administradores podem aprovar participantes' },
        { status: 403 }
      )
    }

    // Verificar se o participante está na fila de pendentes
    const pendingParticipants = existingGroup.pending_participants || []
    if (!pendingParticipants.includes(participant_phone)) {
      return NextResponse.json(
        { error: 'Participante não está na fila de aprovação' },
        { status: 400 }
      )
    }

    // Verificar se o participante já não está no grupo
    const participants = existingGroup.participants || []
    if (participants.includes(participant_phone)) {
      return NextResponse.json(
        { error: 'Participante já está no grupo' },
        { status: 400 }
      )
    }

    // Verificar limite de participantes do WhatsApp (1024)
    if (participants.length >= 1024) {
      return NextResponse.json(
        { error: 'Grupo atingiu o limite máximo de participantes (1024)' },
        { status: 400 }
      )
    }

    // Remover da fila de pendentes e adicionar aos participantes
    const updatedPendingParticipants = pendingParticipants.filter(phone => phone !== participant_phone)
    const updatedParticipants = [...participants, participant_phone]

    // Atualizar o grupo no banco
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        participants: updatedParticipants,
        pending_participants: updatedPendingParticipants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao aprovar participante:', updateError)
      return NextResponse.json(
        { error: 'Erro ao aprovar participante' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para aprovar o participante no WhatsApp
        // await approveParticipantInWhatsAppGroup(existingGroup.whatsapp_id, participant_phone)
        console.log(`TODO: Aprovar participante ${participant_phone} no grupo ${existingGroup.whatsapp_id} via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    // Criar log de auditoria
    try {
      await supabase
        .from('group_audit_logs')
        .insert({
          group_id: groupId,
          action: 'participant_approved',
          performed_by: userPhone,
          target_participant: participant_phone,
          details: {
            approved_by: approved_by,
            previous_participants_count: participants.length,
            new_participants_count: updatedParticipants.length,
          },
          created_at: new Date().toISOString(),
        })
    } catch (auditError) {
      console.error('Erro ao criar log de auditoria:', auditError)
      // Não falhar a operação se o log falhar
    }

    return NextResponse.json({
      message: 'Participante aprovado com sucesso',
      participant: {
        phone: participant_phone,
        approved_by: approved_by,
        approved_at: new Date().toISOString(),
      },
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        participants_count: updatedParticipants.length,
        pending_participants_count: updatedPendingParticipants.length,
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

    console.error('Erro na API de aprovação de participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
