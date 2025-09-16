import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SyncGroupsSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID é obrigatório'),
})

// POST /api/groups/sync - Sincronizar grupos do WhatsApp
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

    const body = await request.json()
    const { instanceId } = SyncGroupsSchema.parse(body)

    // TODO: Implementar sincronização real com Z-API
    // Por enquanto, vamos simular a sincronização
    const mockGroups = [
      {
        name: 'Grupo de Trabalho',
        whatsapp_id: '120363123456789012@g.us',
        description: 'Grupo para discussões de trabalho',
        participants: ['5511999999999', '5511888888888'],
      },
      {
        name: 'Família',
        whatsapp_id: '120363123456789013@g.us',
        description: 'Grupo da família',
        participants: ['5511777777777', '5511666666666'],
      },
      {
        name: 'Amigos',
        whatsapp_id: '120363123456789014@g.us',
        description: 'Grupo dos amigos',
        participants: ['5511555555555', '5511444444444', '5511333333333'],
      },
    ]

    const syncedGroups = []
    let createdCount = 0
    let updatedCount = 0

    for (const groupData of mockGroups) {
      // Verificar se o grupo já existe
      const { data: existingGroup } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('whatsapp_id', groupData.whatsapp_id)
        .eq('user_id', user.id)
        .single()

      if (existingGroup) {
        // Atualizar grupo existente
        const { data: updatedGroup, error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({
            name: groupData.name,
            description: groupData.description,
            participants: groupData.participants,
          })
          .eq('id', existingGroup.id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Erro ao atualizar grupo:', updateError)
          continue
        }

        syncedGroups.push(updatedGroup)
        updatedCount++
      } else {
        // Criar novo grupo
        const { data: newGroup, error: createError } = await supabase
          .from('whatsapp_groups')
          .insert({
            name: groupData.name,
            whatsapp_id: groupData.whatsapp_id,
            description: groupData.description,
            participants: groupData.participants,
            user_id: user.id,
          })
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar grupo:', createError)
          continue
        }

        syncedGroups.push(newGroup)
        createdCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: syncedGroups,
      stats: {
        syncedCount: syncedGroups.length,
        createdCount,
        updatedCount,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro na API de sincronização de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
