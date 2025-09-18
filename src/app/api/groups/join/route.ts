import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de aceitar convite
const JoinGroupSchema = z.object({
  invite_code: z.string().min(1, 'Código de convite é obrigatório'),
})

// POST /api/groups/join - Aceitar convite via código
export async function POST(request: NextRequest) {
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

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { invite_code } = JoinGroupSchema.parse(body)

    // Buscar link de convite ativo
    const { data: inviteLink, error: inviteError } = await supabase
      .from('group_invite_links')
      .select(`
        *,
        whatsapp_groups (
          id,
          name,
          description,
          participants,
          admins,
          whatsapp_id,
          user_id
        )
      `)
      .eq('invite_code', invite_code)
      .eq('is_active', true)
      .single()

    if (inviteError || !inviteLink) {
      return NextResponse.json(
        { error: 'Código de convite inválido ou expirado' },
        { status: 404 }
      )
    }

    const group = inviteLink.whatsapp_groups

    // Verificar se o link expirou
    if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
      // Marcar como inativo
      await supabase
        .from('group_invite_links')
        .update({ is_active: false })
        .eq('id', inviteLink.id)

      return NextResponse.json(
        { error: 'Este link de convite expirou' },
        { status: 400 }
      )
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
    if (inviteLink.max_uses && currentUses >= inviteLink.max_uses) {
      // Marcar como inativo
      await supabase
        .from('group_invite_links')
        .update({ is_active: false })
        .eq('id', inviteLink.id)

      return NextResponse.json(
        { error: 'Este link de convite atingiu o limite de usos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já é participante do grupo
    const userPhone = user.phone || user.email
    const isAlreadyParticipant = group.participants?.includes(userPhone)
    
    if (isAlreadyParticipant) {
      return NextResponse.json(
        { error: 'Você já é participante deste grupo' },
        { status: 400 }
      )
    }

    // Verificar se o grupo tem limite de participantes (WhatsApp: 1024)
    if (group.participants && group.participants.length >= 1024) {
      return NextResponse.json(
        { error: 'Este grupo atingiu o limite máximo de participantes' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já usou este link
    const { data: existingUsage, error: existingUsageError } = await supabase
      .from('group_invite_usage')
      .select('*')
      .eq('invite_link_id', inviteLink.id)
      .eq('user_phone', userPhone)
      .single()

    if (existingUsage) {
      return NextResponse.json(
        { error: 'Você já usou este link de convite' },
        { status: 400 }
      )
    }

    // Adicionar usuário ao grupo
    const updatedParticipants = [...(group.participants || []), userPhone]
    
    const { data: updatedGroup, error: updateGroupError } = await supabase
      .from('whatsapp_groups')
      .update({
        participants: updatedParticipants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', group.id)
      .select()
      .single()

    if (updateGroupError) {
      console.error('Erro ao adicionar usuário ao grupo:', updateGroupError)
      return NextResponse.json(
        { error: 'Erro ao entrar no grupo' },
        { status: 500 }
      )
    }

    // Registrar uso do link de convite
    const { error: usageCreateError } = await supabase
      .from('group_invite_usage')
      .insert({
        invite_link_id: inviteLink.id,
        user_phone: userPhone,
        used_at: new Date().toISOString(),
      })

    if (usageCreateError) {
      console.error('Erro ao registrar uso do link:', usageCreateError)
      // Não falhar a operação se o registro de uso falhar
    }

    // Verificar se o link atingiu o limite de usos após este uso
    const newUsageCount = currentUses + 1
    if (inviteLink.max_uses && newUsageCount >= inviteLink.max_uses) {
      // Marcar como inativo
      await supabase
        .from('group_invite_links')
        .update({ is_active: false })
        .eq('id', inviteLink.id)
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await addParticipantToWhatsAppGroup(group.whatsapp_id, userPhone)
        console.log(`TODO: Adicionar ${userPhone} ao grupo ${group.whatsapp_id} via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Você entrou no grupo com sucesso',
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        participants_count: updatedParticipants.length,
      },
      invite_link: {
        id: inviteLink.id,
        description: inviteLink.description,
        remaining_uses: inviteLink.max_uses ? inviteLink.max_uses - newUsageCount : null,
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

    console.error('Erro na API de aceitar convite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
