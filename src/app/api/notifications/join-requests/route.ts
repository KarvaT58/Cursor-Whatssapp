import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

const ApproveJoinRequestSchema = z.object({
  notificationId: z.string().uuid(),
  groupId: z.string().uuid(),
  requesterPhone: z.string().min(1),
})

const RejectJoinRequestSchema = z.object({
  notificationId: z.string().uuid(),
  groupId: z.string().uuid(),
  requesterPhone: z.string().min(1),
})

// POST /api/notifications/join-requests/approve - Aprovar solicitação de entrada
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, groupId, requesterPhone } = ApproveJoinRequestSchema.parse(body)

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado ou sem permissão' },
        { status: 404 }
      )
    }

    // Buscar instância ativa da Z-API
    const { data: userInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (instanceError || !userInstance) {
      return NextResponse.json(
        { error: 'Instância Z-API não encontrada' },
        { status: 404 }
      )
    }

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      userInstance.instance_id,
      userInstance.instance_token,
      userInstance.client_token || ''
    )

    // Adicionar participante ao grupo via Z-API
    const addResult = await zApiClient.addGroupParticipants(group.whatsapp_id, [requesterPhone])
    
    if (!addResult.success) {
      console.error('Erro ao adicionar participante via Z-API:', addResult.error)
      return NextResponse.json(
        { error: `Erro ao adicionar participante: ${addResult.error}` },
        { status: 500 }
      )
    }

    // Marcar notificação como lida
    const { error: updateError } = await supabase
      .from('group_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Erro ao marcar notificação como lida:', updateError)
    }

    // Criar notificação de sucesso
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: groupId,
        user_id: user.id,
        type: 'member_added',
        title: 'Solicitação aprovada',
        message: `O usuário ${requesterPhone} foi adicionado ao grupo "${group.name}" com sucesso.`,
        data: { 
          requester_phone: requesterPhone, 
          action: 'approved',
          group_name: group.name
        }
      })

    if (notificationError) {
      console.error('Erro ao criar notificação de sucesso:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação aprovada com sucesso',
      data: {
        requesterPhone,
        groupName: group.name
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao aprovar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/join-requests/reject - Rejeitar solicitação de entrada
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, groupId, requesterPhone } = RejectJoinRequestSchema.parse(body)

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado ou sem permissão' },
        { status: 404 }
      )
    }

    // Marcar notificação como lida
    const { error: updateError } = await supabase
      .from('group_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Erro ao marcar notificação como lida:', updateError)
    }

    // Criar notificação de rejeição
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: groupId,
        user_id: user.id,
        type: 'member_removed',
        title: 'Solicitação rejeitada',
        message: `A solicitação de entrada do usuário ${requesterPhone} no grupo "${group.name}" foi rejeitada.`,
        data: { 
          requester_phone: requesterPhone, 
          action: 'rejected',
          group_name: group.name
        }
      })

    if (notificationError) {
      console.error('Erro ao criar notificação de rejeição:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação rejeitada com sucesso',
      data: {
        requesterPhone,
        groupName: group.name
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao rejeitar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
