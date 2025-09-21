import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { familyId, familyName } = await request.json()

    if (!familyId || !familyName) {
      return NextResponse.json(
        { error: 'Família ID e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Buscar todos os grupos da família
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (groupsError) {
      console.error('Erro ao buscar grupos:', groupsError)
      return NextResponse.json(
        { error: 'Erro ao buscar grupos' },
        { status: 500 }
      )
    }

    if (!groups || groups.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum grupo encontrado para esta família' },
        { status: 404 }
      )
    }

    // 2. Verificar se há vagas nos grupos existentes
    let availableGroup = null
    for (const group of groups) {
      const currentParticipants = group.participants?.length || 0
      const maxParticipants = group.max_participants || 256 // Limite padrão do WhatsApp
      
      if (currentParticipants < maxParticipants) {
        availableGroup = group
        console.log(`✅ Grupo ${group.name} tem vaga: ${currentParticipants}/${maxParticipants}`)
        break
      }
    }

    // 3. Se não há vagas, criar novo grupo
    if (!availableGroup) {
      console.log('🚀 Nenhuma vaga disponível, criando novo grupo...')
      
      // Buscar dados do primeiro grupo para copiar configurações
      const firstGroup = groups[0]
      
      // Buscar instância Z-API ativa
      const { data: zApiInstance, error: instanceError } = await supabase
        .from('z_api_instances')
        .select('*')
        .eq('user_id', firstGroup.user_id)
        .eq('is_active', true)
        .single()

      if (instanceError || !zApiInstance) {
        console.error('❌ Instância Z-API não encontrada:', instanceError)
        return NextResponse.json(
          { error: 'Instância Z-API não encontrada' },
          { status: 500 }
        )
      }

      // Criar novo grupo via Z-API
      const newGroupNumber = groups.length + 1
      const newGroupName = `${familyName} ${newGroupNumber}`
      
      const createGroupResponse = await fetch(
        `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/create-group`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': zApiInstance.client_token || '',
          },
          body: JSON.stringify({
            name: newGroupName,
            description: firstGroup.description || `Grupo ${familyName} - Conecte-se com pessoas incríveis!`,
            // Adicionar o dono do grupo como primeiro participante
            participants: [zApiInstance.phone_number]
          }),
        }
      )

      const createGroupResult = await createGroupResponse.json()
      console.log('🚀 Resultado da criação do grupo:', createGroupResult)

      if (!createGroupResponse.ok || !createGroupResult.groupId) {
        console.error('❌ Erro ao criar grupo:', createGroupResult)
        return NextResponse.json(
          { error: 'Erro ao criar novo grupo' },
          { status: 500 }
        )
      }

      // Obter link de convite do novo grupo
      const inviteLinkResponse = await fetch(
        `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/group-invite-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': zApiInstance.client_token || '',
          },
          body: JSON.stringify({
            groupId: createGroupResult.groupId
          }),
        }
      )

      const inviteLinkResult = await inviteLinkResponse.json()
      console.log('🔗 Resultado do link de convite:', inviteLinkResult)

      if (!inviteLinkResponse.ok || !inviteLinkResult.link) {
        console.error('❌ Erro ao obter link de convite:', inviteLinkResult)
        return NextResponse.json(
          { error: 'Erro ao obter link de convite' },
          { status: 500 }
        )
      }

      // Salvar novo grupo no banco de dados
      const { data: newGroup, error: saveError } = await supabase
        .from('whatsapp_groups')
        .insert({
          name: newGroupName,
          whatsapp_id: createGroupResult.groupId,
          invite_link: inviteLinkResult.link,
          description: firstGroup.description || `Grupo ${familyName} - Conecte-se com pessoas incríveis!`,
          participants: [zApiInstance.phone_number],
          max_participants: firstGroup.max_participants || 256,
          is_active: true,
          family_id: familyId,
          user_id: firstGroup.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) {
        console.error('❌ Erro ao salvar novo grupo:', saveError)
        return NextResponse.json(
          { error: 'Erro ao salvar novo grupo' },
          { status: 500 }
        )
      }

      console.log(`✅ Novo grupo criado: ${newGroupName} (${createGroupResult.groupId})`)
      
      return NextResponse.json({
        success: true,
        groupId: createGroupResult.groupId,
        groupName: newGroupName,
        inviteLink: inviteLinkResult.link,
        isNewGroup: true,
        message: 'Novo grupo criado com sucesso!'
      })
    }

    // 4. Se há vaga, usar grupo existente
    console.log(`✅ Usando grupo existente: ${availableGroup.name}`)
    
    return NextResponse.json({
      success: true,
      groupId: availableGroup.whatsapp_id,
      groupName: availableGroup.name,
      inviteLink: availableGroup.invite_link,
      isNewGroup: false,
      message: 'Vaga encontrada em grupo existente!'
    })

  } catch (error) {
    console.error('❌ Erro no join-universal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
