import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateNotificationSchema = z.object({
  group_id: z.string().uuid(),
  type: z.enum(['join_request', 'admin_promotion', 'member_added', 'member_removed', 'group_updated']),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  data: z.record(z.any()).optional(),
})

const UpdateNotificationSchema = z.object({
  read: z.boolean().optional(),
})

// GET /api/notifications - Buscar notificações do usuário
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    let query = supabase
      .from('group_notifications')
      .select(`
        *,
        whatsapp_groups (
          id,
          name,
          whatsapp_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar notificações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications?.length || 0
    })
  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Criar nova notificação
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
    const validatedData = CreateNotificationSchema.parse(body)

    const { data: notification, error } = await supabase
      .from('group_notifications')
      .insert({
        ...validatedData,
        user_id: user.id
      })
      .select(`
        *,
        whatsapp_groups (
          id,
          name,
          whatsapp_id
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar notificação:', error)
      return NextResponse.json(
        { error: 'Erro ao criar notificação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Atualizar notificações (marcar como lidas)
export async function PATCH(request: NextRequest) {
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
    const validatedData = UpdateNotificationSchema.parse(body)

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const markAll = searchParams.get('mark_all') === 'true'

    if (markAll) {
      // Marcar todas as notificações como lidas
      const { error } = await supabase
        .from('group_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error)
        return NextResponse.json(
          { error: 'Erro ao marcar notificações como lidas' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      )
    }

    // Marcar notificação específica como lida
    const { error } = await supabase
      .from('group_notifications')
      .update(validatedData)
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao atualizar notificação:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar notificação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação atualizada com sucesso'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Deletar notificações
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

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('delete_all') === 'true'

    if (deleteAll) {
      // Deletar todas as notificações
      const { error } = await supabase
        .from('group_notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar todas as notificações:', error)
        return NextResponse.json(
          { error: 'Erro ao deletar notificações' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Todas as notificações foram deletadas'
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      )
    }

    // Deletar notificação específica
    const { error } = await supabase
      .from('group_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar notificação:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar notificação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
