import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de administradores
const PromoteAdminSchema = z.object({
  phone: z.string().min(1, 'Telefone é obrigatório'),
})

const DemoteAdminSchema = z.object({
  phone: z.string().min(1, 'Telefone é obrigatório'),
})

// POST /api/groups/[id]/admins - Promover participante a administrador
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
    const { phone } = PromoteAdminSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants, admins')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o participante está no grupo
    const participants = existingGroup.participants || []
    if (!participants.includes(phone)) {
      return NextResponse.json(
        { error: 'Participante não está no grupo' },
        { status: 400 }
      )
    }

    // Verificar se já é administrador
    const currentAdmins = existingGroup.admins || []
    if (currentAdmins.includes(phone)) {
      return NextResponse.json(
        { error: 'Participante já é administrador' },
        { status: 400 }
      )
    }

    // Adicionar administrador
    const updatedAdmins = [...currentAdmins, phone]
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        admins: updatedAdmins,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao promover administrador:', updateError)
      return NextResponse.json(
        { error: 'Erro ao promover administrador' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para promover administrador no WhatsApp
        // await promoteAdminInWhatsAppGroup(existingGroup.whatsapp_id, phone)
        console.log(`TODO: Promover administrador no grupo ${existingGroup.whatsapp_id} no WhatsApp: ${phone}`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Participante promovido a administrador com sucesso',
      group: updatedGroup,
      promoted_admin: phone,
      total_admins: updatedAdmins.length,
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

    console.error('Erro na API de promoção de administrador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/admins - Remover privilégios de administrador
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

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { phone } = DemoteAdminSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants, admins')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se é administrador
    const currentAdmins = existingGroup.admins || []
    if (!currentAdmins.includes(phone)) {
      return NextResponse.json(
        { error: 'Participante não é administrador' },
        { status: 400 }
      )
    }

    // Verificar se não é o último administrador
    if (currentAdmins.length === 1) {
      return NextResponse.json(
        { error: 'Não é possível remover o último administrador do grupo' },
        { status: 400 }
      )
    }

    // Remover administrador
    const updatedAdmins = currentAdmins.filter(admin => admin !== phone)
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        admins: updatedAdmins,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao remover administrador:', updateError)
      return NextResponse.json(
        { error: 'Erro ao remover administrador' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para remover administrador no WhatsApp
        // await demoteAdminInWhatsAppGroup(existingGroup.whatsapp_id, phone)
        console.log(`TODO: Remover administrador do grupo ${existingGroup.whatsapp_id} no WhatsApp: ${phone}`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Privilégios de administrador removidos com sucesso',
      group: updatedGroup,
      demoted_admin: phone,
      total_admins: updatedAdmins.length,
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

    console.error('Erro na API de remoção de administrador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
