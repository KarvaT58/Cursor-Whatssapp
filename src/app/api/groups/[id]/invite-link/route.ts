import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de criação de link de convite
const CreateInviteLinkSchema = z.object({
  expires_in_hours: z.number().min(1, 'Mínimo 1 hora').max(168, 'Máximo 168 horas (7 dias)').default(24),
  max_uses: z.number().min(1, 'Mínimo 1 uso').max(1000, 'Máximo 1000 usos').default(100),
  description: z.string().max(200, 'Descrição muito longa').optional(),
})

// GET /api/groups/[id]/invite-link - Obter link de convite existente
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
        { error: 'Apenas administradores podem gerenciar links de convite' },
        { status: 403 }
      )
    }

    // Buscar link de convite ativo
    const { data: inviteLink, error: inviteError } = await supabase
      .from('group_invite_links')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (inviteError && inviteError.code !== 'PGRST116') {
      console.error('Erro ao buscar link de convite:', inviteError)
      return NextResponse.json(
        { error: 'Erro ao buscar link de convite' },
        { status: 500 }
      )
    }

    // Se não há link ativo, retornar null
    if (!inviteLink) {
      return NextResponse.json({
        message: 'Nenhum link de convite ativo encontrado',
        invite_link: null,
      })
    }

    // Verificar se o link expirou
    const isExpired = inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()
    
    if (isExpired) {
      // Marcar como inativo
      await supabase
        .from('group_invite_links')
        .update({ is_active: false })
        .eq('id', inviteLink.id)

      return NextResponse.json({
        message: 'Link de convite expirado',
        invite_link: null,
      })
    }

    // Verificar se atingiu o limite de usos
    const { data: usageCount, error: usageError } = await supabase
      .from('group_invite_usage')
      .select('id', { count: 'exact' })
      .eq('invite_link_id', inviteLink.id)

    if (usageError) {
      console.error('Erro ao contar usos do link:', usageError)
    }

    const currentUses = usageCount?.length || 0
    const isMaxUsesReached = inviteLink.max_uses && currentUses >= inviteLink.max_uses

    if (isMaxUsesReached) {
      // Marcar como inativo
      await supabase
        .from('group_invite_links')
        .update({ is_active: false })
        .eq('id', inviteLink.id)

      return NextResponse.json({
        message: 'Link de convite atingiu o limite de usos',
        invite_link: null,
      })
    }

    return NextResponse.json({
      message: 'Link de convite obtido com sucesso',
      invite_link: {
        ...inviteLink,
        current_uses: currentUses,
        remaining_uses: inviteLink.max_uses ? inviteLink.max_uses - currentUses : null,
        is_expired: isExpired,
        is_max_uses_reached: isMaxUsesReached,
      },
    })
  } catch (error) {
    console.error('Erro na API de obtenção de link de convite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/groups/[id]/invite-link - Criar novo link de convite
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
    const { expires_in_hours, max_uses, description } = CreateInviteLinkSchema.parse(body)

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
        { error: 'Apenas administradores podem criar links de convite' },
        { status: 403 }
      )
    }

    // Desativar links de convite existentes
    await supabase
      .from('group_invite_links')
      .update({ is_active: false })
      .eq('group_id', groupId)
      .eq('is_active', true)

    // Gerar código único para o link
    const inviteCode = generateInviteCode()
    
    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours)

    // Criar novo link de convite
    const { data: newInviteLink, error: createError } = await supabase
      .from('group_invite_links')
      .insert({
        group_id: groupId,
        invite_code: inviteCode,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        max_uses: max_uses,
        description: description || null,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar link de convite:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar link de convite' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await createWhatsAppInviteLink(group.whatsapp_id, newInviteLink)
        console.log(`TODO: Criar link de convite ${newInviteLink.id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Link de convite criado com sucesso',
      invite_link: {
        ...newInviteLink,
        current_uses: 0,
        remaining_uses: max_uses,
        is_expired: false,
        is_max_uses_reached: false,
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

    console.error('Erro na API de criação de link de convite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/invite-link - Revogar link de convite
export async function DELETE(
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
        { error: 'Apenas administradores podem revogar links de convite' },
        { status: 403 }
      )
    }

    // Desativar link de convite ativo
    const { data: updatedLink, error: updateError } = await supabase
      .from('group_invite_links')
      .update({ is_active: false })
      .eq('group_id', groupId)
      .eq('is_active', true)
      .select()
      .single()

    if (updateError && updateError.code !== 'PGRST116') {
      console.error('Erro ao revogar link de convite:', updateError)
      return NextResponse.json(
        { error: 'Erro ao revogar link de convite' },
        { status: 500 }
      )
    }

    if (!updatedLink) {
      return NextResponse.json(
        { error: 'Nenhum link de convite ativo encontrado' },
        { status: 404 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await revokeWhatsAppInviteLink(group.whatsapp_id, updatedLink)
        console.log(`TODO: Revogar link de convite ${updatedLink.id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Link de convite revogado com sucesso',
      invite_link: updatedLink,
    })
  } catch (error) {
    console.error('Erro na API de revogação de link de convite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para gerar código único de convite
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
