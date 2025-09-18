import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/groups/[id]/pending - Listar participantes pendentes de aprovação
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
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants, admins, pending_participants, created_at')
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
        { error: 'Apenas administradores podem visualizar participantes pendentes' },
        { status: 403 }
      )
    }

    const pendingParticipants = existingGroup.pending_participants || []

    // Buscar informações adicionais dos participantes pendentes (se existirem na tabela de contatos)
    const { data: contactInfo, error: contactError } = await supabase
      .from('contacts')
      .select('phone, name, pushname')
      .in('phone', pendingParticipants)
      .eq('user_id', user.id)

    // Criar mapa de informações dos contatos
    const contactMap = new Map()
    if (contactInfo && !contactError) {
      contactInfo.forEach(contact => {
        contactMap.set(contact.phone, {
          name: contact.name,
          pushname: contact.pushname,
        })
      })
    }

    // Formatar lista de participantes pendentes com informações adicionais
    const formattedPendingParticipants = pendingParticipants.map(phone => ({
      phone,
      name: contactMap.get(phone)?.name || null,
      pushname: contactMap.get(phone)?.pushname || null,
      display_name: contactMap.get(phone)?.name || contactMap.get(phone)?.pushname || phone,
    }))

    return NextResponse.json({
      group: {
        id: existingGroup.id,
        name: existingGroup.name,
        whatsapp_id: existingGroup.whatsapp_id,
        participants_count: existingGroup.participants?.length || 0,
        admins_count: admins.length,
        created_at: existingGroup.created_at,
      },
      pending_participants: formattedPendingParticipants,
      pending_count: pendingParticipants.length,
      can_approve: true, // O usuário já foi verificado como admin
    })
  } catch (error) {
    console.error('Erro na API de participantes pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
