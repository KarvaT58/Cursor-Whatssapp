import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de ação em denúncia
const ReportActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'dismiss'], {
    errorMap: () => ({ message: 'Ação inválida' })
  }),
  moderator_notes: z.string().max(500, 'Notas muito longas').optional(),
  auto_delete_message: z.boolean().default(false),
})

// PUT /api/groups/[id]/reports/[reportId] - Processar denúncia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reportId: string } }
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
    const reportId = params.reportId

    if (!groupId || !reportId) {
      return NextResponse.json({ error: 'IDs do grupo e denúncia são obrigatórios' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { action, moderator_notes, auto_delete_message } = ReportActionSchema.parse(body)

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

    // Verificar se o usuário é administrador do grupo
    const userPhone = user.phone || user.email
    const isAdmin = group.admins?.includes(userPhone)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem processar denúncias' },
        { status: 403 }
      )
    }

    // Buscar a denúncia
    const { data: report, error: reportError } = await supabase
      .from('group_reports')
      .select(`
        *,
        group_messages (
          id,
          content,
          sender_phone,
          created_at,
          is_deleted
        )
      `)
      .eq('id', reportId)
      .eq('group_id', groupId)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Denúncia não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a denúncia já foi processada
    if (report.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta denúncia já foi processada' },
        { status: 400 }
      )
    }

    // Verificar se a mensagem ainda existe
    if (!report.group_messages || report.group_messages.is_deleted) {
      return NextResponse.json(
        { error: 'A mensagem denunciada não existe mais' },
        { status: 400 }
      )
    }

    // Atualizar status da denúncia
    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'dismissed'
    
    const { data: updatedReport, error: updateError } = await supabase
      .from('group_reports')
      .update({
        status: newStatus,
        moderator_id: user.id,
        moderator_phone: userPhone,
        moderator_notes: moderator_notes || null,
        processed_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar denúncia:', updateError)
      return NextResponse.json(
        { error: 'Erro ao processar denúncia' },
        { status: 500 }
      )
    }

    // Se aprovada e auto_delete_message for true, apagar a mensagem
    if (action === 'approve' && auto_delete_message) {
      const { error: deleteMessageError } = await supabase
        .from('group_messages')
        .update({
          is_deleted: true,
          deleted_by: user.id,
          deleted_at: new Date().toISOString(),
          content: '[Mensagem apagada por denúncia]',
        })
        .eq('id', report.message_id)

      if (deleteMessageError) {
        console.error('Erro ao apagar mensagem:', deleteMessageError)
        // Não falhar a operação se a mensagem não puder ser apagada
      }

      // Registrar ação de moderação
      const { error: moderationError } = await supabase
        .from('moderation_actions')
        .insert({
          group_id: groupId,
          message_id: report.message_id,
          action_type: 'delete_message_by_report',
          moderator_id: user.id,
          moderator_phone: userPhone,
          target_user_phone: report.reported_user_phone,
          reason: `Denúncia aprovada: ${report.reason}`,
          created_at: new Date().toISOString(),
        })

      if (moderationError) {
        console.error('Erro ao registrar ação de moderação:', moderationError)
      }
    }

    // TODO: Notificar o denunciante sobre o resultado
    try {
      // await notifyReporterAboutResult(report.reporter_phone, action, group.name)
      console.log(`TODO: Notificar ${report.reporter_phone} sobre resultado da denúncia`)
    } catch (notificationError) {
      console.error('Erro ao notificar denunciante:', notificationError)
    }

    // TODO: Notificar o usuário denunciado se aprovada
    if (action === 'approve') {
      try {
        // await notifyReportedUser(report.reported_user_phone, group.name, report.reason)
        console.log(`TODO: Notificar ${report.reported_user_phone} sobre denúncia aprovada`)
      } catch (notificationError) {
        console.error('Erro ao notificar usuário denunciado:', notificationError)
      }
    }

    return NextResponse.json({
      message: `Denúncia ${action === 'approve' ? 'aprovada' : action === 'reject' ? 'rejeitada' : 'descartada'} com sucesso`,
      report: {
        id: updatedReport.id,
        status: updatedReport.status,
        processed_at: updatedReport.processed_at,
        moderator_notes: updatedReport.moderator_notes,
        message_deleted: action === 'approve' && auto_delete_message,
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

    console.error('Erro na API de processar denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/reports/[reportId] - Obter detalhes da denúncia
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reportId: string } }
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
    const reportId = params.reportId

    if (!groupId || !reportId) {
      return NextResponse.json({ error: 'IDs do grupo e denúncia são obrigatórios' }, { status: 400 })
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

    // Verificar se o usuário é administrador do grupo
    const userPhone = user.phone || user.email
    const isAdmin = group.admins?.includes(userPhone)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem ver detalhes de denúncias' },
        { status: 403 }
      )
    }

    // Buscar a denúncia com detalhes
    const { data: report, error: reportError } = await supabase
      .from('group_reports')
      .select(`
        *,
        group_messages (
          id,
          content,
          sender_phone,
          created_at,
          is_deleted
        )
      `)
      .eq('id', reportId)
      .eq('group_id', groupId)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Denúncia não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Denúncia obtida com sucesso',
      report: {
        ...report,
        can_process: report.status === 'pending',
      },
    })
  } catch (error) {
    console.error('Erro na API de obter denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
