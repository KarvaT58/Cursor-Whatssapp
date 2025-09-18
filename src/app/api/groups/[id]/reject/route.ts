import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de rejeição
const RejectParticipantSchema = z.object({
  participant_phone: z.string().min(1, 'Telefone do participante é obrigatório'),
  rejected_by: z.string().min(1, 'Rejeitador é obrigatório'),
  reason: z.string().optional(),
})

// POST /api/groups/[id]/reject - Rejeitar participante para entrar no grupo
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
    const { participant_phone, rejected_by, reason } = RejectParticipantSchema.parse(body)

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
        { error: 'Apenas administradores podem rejeitar participantes' },
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

    // Remover da fila de pendentes
    const updatedPendingParticipants = pendingParticipants.filter(phone => phone !== participant_phone)

    // Atualizar o grupo no banco
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        pending_participants: updatedPendingParticipants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao rejeitar participante:', updateError)
      return NextResponse.json(
        { error: 'Erro ao rejeitar participante' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para rejeitar o participante no WhatsApp
        // await rejectParticipantInWhatsAppGroup(existingGroup.whatsapp_id, participant_phone)
        console.log(`TODO: Rejeitar participante ${participant_phone} no grupo ${existingGroup.whatsapp_id} via Z-API`)
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
          action: 'participant_rejected',
          performed_by: userPhone,
          target_participant: participant_phone,
          details: {
            rejected_by: rejected_by,
            reason: reason || 'Sem motivo especificado',
            previous_pending_count: pendingParticipants.length,
            new_pending_count: updatedPendingParticipants.length,
          },
          created_at: new Date().toISOString(),
        })
    } catch (auditError) {
      console.error('Erro ao criar log de auditoria:', auditError)
      // Não falhar a operação se o log falhar
    }

    return NextResponse.json({
      message: 'Participante rejeitado com sucesso',
      participant: {
        phone: participant_phone,
        rejected_by: rejected_by,
        reason: reason || 'Sem motivo especificado',
        rejected_at: new Date().toISOString(),
      },
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        participants_count: existingGroup.participants?.length || 0,
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

    console.error('Erro na API de rejeição de participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
