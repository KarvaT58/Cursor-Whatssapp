import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GroupLinkSystem } from '@/lib/group-link-system'
import { z } from 'zod'

const UpdateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  participants: z.array(z.string()).optional(),
})

// GET /api/groups/[id] - Obter grupo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params

    // Buscar grupo específico
    const { data: group, error } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Grupo não encontrado' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar grupo:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar grupo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Erro na API de grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/groups/[id] - Atualizar grupo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateGroupSchema.parse(body)

    // Atualizar grupo
    const { data: group, error } = await supabase
      .from('whatsapp_groups')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Grupo não encontrado' },
          { status: 404 }
        )
      }
      console.error('Erro ao atualizar grupo:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar grupo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ group })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro na API de grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id] - Excluir grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params

    // 1. Verificar se é um grupo universal antes de excluir
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, group_family, universal_link')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (groupError) {
      console.error('Erro ao buscar grupo:', groupError)
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // 2. Verificar se é grupo universal (tem group_family ou universal_link)
    const isUniversalGroup = !!(group.group_family || group.universal_link)
    
    console.log('🗑️ EXCLUINDO GRUPO - DADOS COMPLETOS:', {
      id: group.id,
      name: group.name,
      isUniversal: isUniversalGroup,
      hasGroupFamily: !!group.group_family,
      hasUniversalLink: !!group.universal_link,
      group_family: group.group_family,
      universal_link: group.universal_link,
      user_id: user.id
    })

    if (isUniversalGroup) {
      // 3. Usar método específico para grupos universais
      console.log('🔗 Grupo universal detectado, usando exclusão completa...')
      const groupLinkSystem = new GroupLinkSystem()
      const deleteResult = await groupLinkSystem.deleteUniversalGroup(id, user.id)
      
      if (!deleteResult.success) {
        console.error('Erro ao excluir grupo universal:', deleteResult.error)
        return NextResponse.json(
          { error: deleteResult.error || 'Erro ao excluir grupo universal' },
          { status: 500 }
        )
      }
      
      console.log('✅ Grupo universal excluído com sucesso')
    } else {
      // 4. Exclusão normal para grupos não-universais
      console.log('📱 Grupo normal detectado, usando exclusão simples...')
      const { error } = await supabase
        .from('whatsapp_groups')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao excluir grupo:', error)
        return NextResponse.json(
          { error: 'Erro ao excluir grupo' },
          { status: 500 }
        )
      }
      
      console.log('✅ Grupo normal excluído com sucesso')
    }

    return NextResponse.json({ 
      success: true,
      message: isUniversalGroup 
        ? 'Grupo universal e todos os dados relacionados foram excluídos com sucesso'
        : 'Grupo excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
