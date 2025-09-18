import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de participantes
const AddParticipantsSchema = z.object({
  participants: z.array(z.string().min(1, 'Telefone é obrigatório')).min(1, 'Pelo menos um participante é necessário'),
})

const RemoveParticipantsSchema = z.object({
  participants: z.array(z.string().min(1, 'Telefone é obrigatório')).min(1, 'Pelo menos um participante é necessário'),
})

// POST /api/groups/[id]/participants - Adicionar participantes ao grupo
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
    const { participants } = AddParticipantsSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar participantes já existentes
    const currentParticipants = existingGroup.participants || []
    const newParticipants = participants.filter(phone => !currentParticipants.includes(phone))
    const duplicateParticipants = participants.filter(phone => currentParticipants.includes(phone))

    if (newParticipants.length === 0) {
      return NextResponse.json(
        { 
          error: 'Todos os participantes já estão no grupo',
          duplicates: duplicateParticipants 
        },
        { status: 400 }
      )
    }

    // Verificar limite de participantes (WhatsApp: 256)
    const totalParticipants = currentParticipants.length + newParticipants.length
    if (totalParticipants > 256) {
      return NextResponse.json(
        { 
          error: 'Limite de participantes excedido. Máximo 256 participantes.',
          current: currentParticipants.length,
          trying_to_add: newParticipants.length,
          max_allowed: 256 - currentParticipants.length
        },
        { status: 400 }
      )
    }

    // Atualizar participantes no banco
    const updatedParticipants = [...currentParticipants, ...newParticipants]
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        participants: updatedParticipants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao adicionar participantes:', updateError)
      return NextResponse.json(
        { error: 'Erro ao adicionar participantes' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para adicionar participantes no WhatsApp
        // await addParticipantsToWhatsAppGroup(existingGroup.whatsapp_id, newParticipants)
        console.log(`TODO: Adicionar participantes ao grupo ${existingGroup.whatsapp_id} no WhatsApp:`, newParticipants)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: `${newParticipants.length} participante(s) adicionado(s) com sucesso`,
      group: updatedGroup,
      added: newParticipants,
      duplicates: duplicateParticipants,
      total_participants: updatedParticipants.length,
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

    console.error('Erro na API de adição de participantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/participants - Remover participantes do grupo
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
    const { participants } = RemoveParticipantsSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar participantes existentes
    const currentParticipants = existingGroup.participants || []
    const participantsToRemove = participants.filter(phone => currentParticipants.includes(phone))
    const notFoundParticipants = participants.filter(phone => !currentParticipants.includes(phone))

    if (participantsToRemove.length === 0) {
      return NextResponse.json(
        { 
          error: 'Nenhum dos participantes está no grupo',
          not_found: notFoundParticipants 
        },
        { status: 400 }
      )
    }

    // Remover participantes
    const updatedParticipants = currentParticipants.filter(phone => !participantsToRemove.includes(phone))
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        participants: updatedParticipants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao remover participantes:', updateError)
      return NextResponse.json(
        { error: 'Erro ao remover participantes' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para remover participantes do WhatsApp
        // await removeParticipantsFromWhatsAppGroup(existingGroup.whatsapp_id, participantsToRemove)
        console.log(`TODO: Remover participantes do grupo ${existingGroup.whatsapp_id} no WhatsApp:`, participantsToRemove)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: `${participantsToRemove.length} participante(s) removido(s) com sucesso`,
      group: updatedGroup,
      removed: participantsToRemove,
      not_found: notFoundParticipants,
      total_participants: updatedParticipants.length,
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

    console.error('Erro na API de remoção de participantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}