import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de denúncia
const CreateReportSchema = z.object({
  message_id: z.string().uuid('ID da mensagem inválido'),
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate_content',
    'violence',
    'hate_speech',
    'fake_news',
    'other'
  ], {
    errorMap: () => ({ message: 'Motivo da denúncia inválido' })
  }),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  evidence: z.array(z.string().url('URL de evidência inválida')).max(5, 'Máximo 5 evidências').optional(),
})

// POST /api/groups/[id]/reports - Criar denúncia
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
    const { message_id, reason, description, evidence } = CreateReportSchema.parse(body)

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

    // Verificar se a mensagem existe e pertence ao grupo
    const { data: message, error: messageError } = await supabase
      .from('group_messages')
      .select('*')
      .eq('id', message_id)
      .eq('group_id', groupId)
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a mensagem já foi apagada
    if (message.is_deleted) {
      return NextResponse.json(
        { error: 'Não é possível denunciar uma mensagem apagada' },
        { status: 400 }
      )
    }

    // Verificar se o usuário não está denunciando sua própria mensagem
    if (message.sender_phone === userPhone) {
      return NextResponse.json(
        { error: 'Você não pode denunciar suas próprias mensagens' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já denunciou esta mensagem
    const { data: existingReport, error: existingReportError } = await supabase
      .from('group_reports')
      .select('*')
      .eq('group_id', groupId)
      .eq('message_id', message_id)
      .eq('reporter_phone', userPhone)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'Você já denunciou esta mensagem' },
        { status: 400 }
      )
    }

    // Criar a denúncia
    const { data: newReport, error: createError } = await supabase
      .from('group_reports')
      .insert({
        group_id: groupId,
        message_id: message_id,
        reporter_phone: userPhone,
        reported_user_phone: message.sender_phone,
        reason: reason,
        description: description || null,
        evidence: evidence || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar denúncia:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar denúncia' },
        { status: 500 }
      )
    }

    // Notificar administradores sobre a nova denúncia
    const admins = group.admins || []
    if (admins.length > 0) {
      try {
        // await notifyAdminsAboutReport(groupId, newReport, admins)
        console.log(`TODO: Notificar administradores sobre denúncia ${newReport.id}`)
      } catch (notificationError) {
        console.error('Erro ao notificar administradores:', notificationError)
        // Não falhar a operação se a notificação falhar
      }
    }

    return NextResponse.json({
      message: 'Denúncia criada com sucesso',
      report: {
        id: newReport.id,
        status: newReport.status,
        created_at: newReport.created_at,
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

    console.error('Erro na API de criar denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/reports - Listar denúncias do grupo
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

    // Verificar se o usuário é administrador do grupo
    const userPhone = user.phone || user.email
    const isAdmin = group.admins?.includes(userPhone)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem ver denúncias' },
        { status: 403 }
      )
    }

    // Buscar parâmetros de query
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Buscar denúncias do grupo
    const { data: reports, error: reportsError } = await supabase
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
      .eq('group_id', groupId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (reportsError) {
      console.error('Erro ao buscar denúncias:', reportsError)
      return NextResponse.json(
        { error: 'Erro ao buscar denúncias' },
        { status: 500 }
      )
    }

    // Buscar total de denúncias
    const { count, error: countError } = await supabase
      .from('group_reports')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', status)

    if (countError) {
      console.error('Erro ao contar denúncias:', countError)
    }

    return NextResponse.json({
      message: 'Denúncias obtidas com sucesso',
      reports: reports || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de listar denúncias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
