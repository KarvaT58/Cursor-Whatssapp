import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 JOIN-UNIVERSAL: Iniciando requisição...')

    const body = await request.json()
    console.log('📥 JOIN-UNIVERSAL: Dados recebidos:', body)

    const { familyId, familyName } = body

    if (!familyId) {
      console.error('❌ JOIN-UNIVERSAL: familyId não fornecido')
      return NextResponse.json(
        { error: 'ID da família é obrigatório' },
        { status: 400 }
      )
    }

    if (!familyName) {
      console.error('❌ JOIN-UNIVERSAL: familyName não fornecido')
      return NextResponse.json(
        { error: 'Nome da família é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`🔍 JOIN-UNIVERSAL: Buscando grupos para família ${familyId} (${familyName})`)

    // Criar cliente Supabase
    const supabase = await createClient()
    console.log('✅ JOIN-UNIVERSAL: Cliente Supabase criado com sucesso')

    // 1. Buscar todos os grupos da família (usando nova estrutura unificada)
    console.log('🔍 JOIN-UNIVERSAL: Executando query no Supabase...')
    
    // Buscar TODOS os grupos da família
    // Primeiro tentar buscar por ID do grupo pai para obter o family_name correto
    let { data: parentGroup, error: parentError } = await supabase
      .from('whatsapp_groups')
      .select('family_name')
      .eq('id', familyId)
      .eq('group_type', 'universal')
      .single()

    let actualFamilyName = familyName

    if (parentGroup && parentGroup.family_name) {
      actualFamilyName = parentGroup.family_name
      console.log(`🔍 JOIN-UNIVERSAL: Grupo pai encontrado, family_name real: "${actualFamilyName}"`)
    } else {
      console.log(`🔍 JOIN-UNIVERSAL: Grupo pai não encontrado por ID, usando familyName fornecido: "${familyName}"`)
    }

    // Buscar TODOS os grupos da família usando o family_name correto
    let { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('group_type', 'universal')
      .eq('family_name', actualFamilyName)
      .order('created_at', { ascending: true })

    console.log('📊 JOIN-UNIVERSAL: Resultado da query:', { groups, groupsError })

    if (groupsError) {
      console.error('❌ JOIN-UNIVERSAL: Erro ao buscar grupos:', groupsError)
      return NextResponse.json(
        { error: 'Erro ao buscar grupos', details: groupsError.message },
        { status: 500 }
      )
    }

    if (!groups || groups.length === 0) {
      console.log('⚠️ JOIN-UNIVERSAL: Nenhum grupo encontrado para esta família')
      return NextResponse.json(
        { error: 'Nenhum grupo encontrado para esta família' },
        { status: 404 }
      )
    }

    console.log(`✅ JOIN-UNIVERSAL: Encontrados ${groups.length} grupos para a família`)

    // 2. Verificar se há vagas nos grupos existentes
    let availableGroup = null
    const firstGroup = groups[0]
    const MAX_PARTICIPANTS = 3 // Limite de teste: 3 participantes por grupo

    console.log(`🔍 JOIN-UNIVERSAL: Verificando vagas com limite de ${MAX_PARTICIPANTS} participantes...`)
    console.log(`📋 JOIN-UNIVERSAL: Grupos encontrados para verificação:`, groups.map((g, index) => ({ 
      index, 
      name: g.name, 
      participant_count: g.participant_count || 0,
      whatsapp_id: g.whatsapp_id,
      created_at: g.created_at
    })))

    // Buscar instância Z-API para verificação em tempo real
    const { data: zApiInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', firstGroup.user_id)
      .eq('is_active', true)
      .single()

    if (instanceError || !zApiInstance) {
      console.error('❌ JOIN-UNIVERSAL: Instância Z-API não encontrada para verificação:', instanceError)
      // Fallback para verificação local se Z-API não estiver disponível
      console.log('📊 JOIN-UNIVERSAL: Usando verificação local (Z-API não disponível)')
      console.log(`🔍 JOIN-UNIVERSAL: Verificando ${groups.length} grupos em ordem...`)
      
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const currentParticipants = group.participant_count || 0
        console.log(`📊 JOIN-UNIVERSAL: [${i+1}/${groups.length}] Grupo "${group.name}" - Participantes (contador): ${currentParticipants}/${MAX_PARTICIPANTS}`)
        console.log(`🔍 JOIN-UNIVERSAL: [${i+1}/${groups.length}] Dados do grupo:`, {
          id: group.id,
          whatsapp_id: group.whatsapp_id,
          created_at: group.created_at
        })
        
        if (currentParticipants < MAX_PARTICIPANTS) {
          availableGroup = group
          console.log(`✅ JOIN-UNIVERSAL: Vaga encontrada no grupo "${group.name}" (${currentParticipants}/${MAX_PARTICIPANTS})`)
          console.log(`🎯 JOIN-UNIVERSAL: SELECIONANDO GRUPO: "${group.name}" com ${currentParticipants} participantes`)
          console.log(`🛑 JOIN-UNIVERSAL: PARANDO VERIFICAÇÃO - Grupo selecionado!`)
          break
        } else {
          console.log(`❌ JOIN-UNIVERSAL: Grupo "${group.name}" está cheio (${currentParticipants}/${MAX_PARTICIPANTS})`)
          console.log(`➡️ JOIN-UNIVERSAL: Continuando para próximo grupo...`)
        }
      }
    } else {
      // Verificação em tempo real usando Z-API
      console.log('📱 JOIN-UNIVERSAL: Verificando vagas em tempo real via Z-API...')
      console.log(`🔍 JOIN-UNIVERSAL: Verificando ${groups.length} grupos via Z-API em ordem...`)
      
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        try {
          // Buscar informações atualizadas do grupo via Z-API
          const groupInfoUrl = `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/group-metadata/${group.whatsapp_id}`
          
          console.log(`🔍 JOIN-UNIVERSAL: [${i+1}/${groups.length}] Verificando grupo "${group.name}" (${group.whatsapp_id}) via Z-API...`)
          
          const groupInfoResponse = await fetch(groupInfoUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })

          if (groupInfoResponse.ok) {
            const groupInfo = await groupInfoResponse.json()
            const realParticipantsCount = groupInfo.participants?.length || 0
            
            console.log(`📊 JOIN-UNIVERSAL: Grupo "${group.name}" - Participantes (real): ${realParticipantsCount}/${MAX_PARTICIPANTS}`)
            console.log(`🔍 JOIN-UNIVERSAL: Dados completos do grupo via Z-API:`, JSON.stringify(groupInfo, null, 2))
            
            if (realParticipantsCount < MAX_PARTICIPANTS) {
              availableGroup = group
              console.log(`✅ JOIN-UNIVERSAL: Vaga encontrada no grupo "${group.name}" (${realParticipantsCount}/${MAX_PARTICIPANTS})`)
              console.log(`🎯 JOIN-UNIVERSAL: SELECIONANDO GRUPO: "${group.name}" com ${realParticipantsCount} participantes`)
              console.log(`🛑 JOIN-UNIVERSAL: PARANDO VERIFICAÇÃO Z-API - Grupo selecionado!`)
              break
            } else {
              console.log(`❌ JOIN-UNIVERSAL: Grupo "${group.name}" está cheio (${realParticipantsCount}/${MAX_PARTICIPANTS})`)
              console.log(`➡️ JOIN-UNIVERSAL: Continuando para próximo grupo via Z-API...`)
            }
          } else {
            console.warn(`⚠️ JOIN-UNIVERSAL: Erro ao verificar grupo "${group.name}" via Z-API, usando contador local`)
            const currentParticipants = group.participant_count || 0
            console.log(`📊 JOIN-UNIVERSAL: Grupo "${group.name}" - Participantes (contador): ${currentParticipants}/${MAX_PARTICIPANTS}`)
            
            if (currentParticipants < MAX_PARTICIPANTS) {
              availableGroup = group
              console.log(`✅ JOIN-UNIVERSAL: Vaga encontrada no grupo "${group.name}" (${currentParticipants}/${MAX_PARTICIPANTS})`)
              console.log(`🎯 JOIN-UNIVERSAL: SELECIONANDO GRUPO: "${group.name}" com ${currentParticipants} participantes`)
              console.log(`🛑 JOIN-UNIVERSAL: PARANDO VERIFICAÇÃO FALLBACK - Grupo selecionado!`)
              break
            } else {
              console.log(`❌ JOIN-UNIVERSAL: Grupo "${group.name}" está cheio (${currentParticipants}/${MAX_PARTICIPANTS})`)
              console.log(`➡️ JOIN-UNIVERSAL: Continuando para próximo grupo no fallback...`)
            }
          }
        } catch (error) {
          console.warn(`⚠️ JOIN-UNIVERSAL: Erro ao verificar grupo "${group.name}" via Z-API:`, error)
          // Fallback para contador local
          const currentParticipants = group.participant_count || 0
          console.log(`📊 JOIN-UNIVERSAL: Grupo "${group.name}" - Participantes (contador): ${currentParticipants}/${MAX_PARTICIPANTS}`)

      if (currentParticipants < MAX_PARTICIPANTS) {
        availableGroup = group
        console.log(`✅ JOIN-UNIVERSAL: Vaga encontrada no grupo "${group.name}" (${currentParticipants}/${MAX_PARTICIPANTS})`)
            console.log(`🎯 JOIN-UNIVERSAL: SELECIONANDO GRUPO: "${group.name}" com ${currentParticipants} participantes`)
            console.log(`🛑 JOIN-UNIVERSAL: PARANDO VERIFICAÇÃO CATCH - Grupo selecionado!`)
        break
      } else {
        console.log(`❌ JOIN-UNIVERSAL: Grupo "${group.name}" está cheio (${currentParticipants}/${MAX_PARTICIPANTS})`)
            console.log(`➡️ JOIN-UNIVERSAL: Continuando para próximo grupo no catch...`)
          }
        }
      }
    }

    // 3. Se não há vagas, criar novo grupo
    if (!availableGroup) {
      console.log('🚀 JOIN-UNIVERSAL: Nenhuma vaga disponível, criando novo grupo...')

      // Buscar dados do primeiro grupo para copiar configurações
      const firstGroup = groups[0]
      console.log(`📋 JOIN-UNIVERSAL: Copiando configurações do grupo "${firstGroup.name}"`)
      console.log(`🔍 JOIN-UNIVERSAL: DADOS COMPLETOS DO PRIMEIRO GRUPO:`, JSON.stringify(firstGroup, null, 2))

      // A instância Z-API já foi buscada acima, reutilizar
      if (!zApiInstance) {
        console.error('❌ JOIN-UNIVERSAL: Instância Z-API não encontrada para criação de grupo')
        return NextResponse.json(
          { error: 'Instância Z-API não encontrada' },
          { status: 500 }
        )
      }

      console.log('📱 JOIN-UNIVERSAL: Usando instância Z-API para criação de grupo:', {
        instance_id: zApiInstance.instance_id,
        phone_number: zApiInstance.phone_number || 'Não configurado',
        client_token: zApiInstance.client_token ? 'Presente' : 'Ausente'
      })

      // Usar participantes fixos para criação de grupos automáticos
      
      // CORREÇÃO: Usar apenas 2 participantes fixos
      // 1. Super Admin (número da Z-API)
      // 2. Número Fixo do Sistema (configurado pelo usuário)
      const superAdminPhone = '554598228660' // Número correto da Z-API baseado nos logs
      const systemPhone = firstGroup.system_phone || '5545984154115' // Número do sistema configurado
      
      const participants = [superAdminPhone, systemPhone]
      console.log(`✅ JOIN-UNIVERSAL: Usando participantes fixos para criação de grupo:`)
      console.log(`👑 Super Admin: ${superAdminPhone}`)
      console.log(`🔧 Sistema: ${systemPhone}`)
      console.log(`📱 Total de participantes: ${participants.length}`)
      
      console.log(`📱 JOIN-UNIVERSAL: Participantes finais para criação:`, participants)

      // Criar novo grupo via Z-API com configurações do primeiro grupo
      // Encontrar o próximo número disponível baseado nos nomes dos grupos existentes
      const existingNumbers = groups.map(group => {
        const match = group.name.match(/\s(\d+)$/)
        return match ? parseInt(match[1]) : 0
      }).filter(num => num > 0)
      
      // Se não há números nos nomes, começar do 2 (primeiro grupo não tem número)
      const newGroupNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 2
      
      // Nome do novo grupo baseado na família
      const newGroupName = `${familyName} ${newGroupNumber}`
      
      console.log(`🔢 JOIN-UNIVERSAL: Números existentes: [${existingNumbers.join(', ')}]`)
      console.log(`🔢 JOIN-UNIVERSAL: Próximo número: ${newGroupNumber}`)
      console.log(`🔍 JOIN-UNIVERSAL: familyName recebido: "${familyName}"`)
      console.log(`🔍 JOIN-UNIVERSAL: firstGroup.family_name: "${firstGroup.family_name}"`)
      
      console.log(`🏗️ JOIN-UNIVERSAL: Nome do novo grupo: "${newGroupName}"`)
      console.log(`🏗️ JOIN-UNIVERSAL: Tamanho do nome: ${newGroupName.length} caracteres`)

      // USAR O ZApiClient que já funciona em vez de fetch direto
      console.log(`🚀 JOIN-UNIVERSAL: Usando ZApiClient para criar grupo...`)
      
      const { ZApiClient } = await import('@/lib/z-api/client')
      const zApiClient = new ZApiClient(
        zApiInstance.instance_id,
        zApiInstance.instance_token,
        zApiInstance.client_token
      )

      console.log(`📤 JOIN-UNIVERSAL: Dados para criação:`, {
        name: newGroupName.trim(),
        description: (firstGroup.description || `Grupo ${familyName}`).trim(),
        participants: participants
      })

      const createGroupResult = await zApiClient.createGroup({
        name: newGroupName.trim(),
        description: (firstGroup.description || `Grupo ${familyName}`).trim(),
        participants: participants
      })

      console.log('🚀 Resultado da criação do grupo via ZApiClient:', createGroupResult)

      if (!createGroupResult.success || !createGroupResult.data?.phone) {
        console.error('❌ Erro ao criar grupo via ZApiClient:', createGroupResult)
        return NextResponse.json(
          { error: 'Erro ao criar novo grupo', details: createGroupResult.error || 'Erro desconhecido' },
          { status: 500 }
        )
      }

      // Obter link de convite do novo grupo usando ZApiClient
      console.log('🔗 Obtendo link de convite via ZApiClient...')
      const inviteLinkResult = await zApiClient.getGroupInviteLink(createGroupResult.data.phone)
      console.log('🔗 Resultado do link de convite:', inviteLinkResult)

      if (!inviteLinkResult.success || !inviteLinkResult.data?.invitationLink) {
        console.error('❌ Erro ao obter link de convite:', inviteLinkResult)
        return NextResponse.json(
          { error: 'Erro ao obter link de convite', details: inviteLinkResult.error || 'Erro desconhecido' },
          { status: 500 }
        )
      }

      // Salvar novo grupo no banco de dados (usando nova estrutura unificada)
      const { data: newGroup, error: saveError } = await supabase
        .from('whatsapp_groups')
        .insert({
          name: newGroupName,
          whatsapp_id: createGroupResult.data.phone,
          invite_link: inviteLinkResult.data.invitationLink,
          description: firstGroup.description || `Grupo ${familyName}`,
          participants: participants,
          image_url: firstGroup.image_url,
          admin_only_message: firstGroup.admin_only_message,
          admin_only_settings: firstGroup.admin_only_settings,
          require_admin_approval: firstGroup.require_admin_approval,
          admin_only_add_member: firstGroup.admin_only_add_member,
          group_type: 'universal',
          family_name: firstGroup.family_name,
          family_base_name: firstGroup.family_base_name,
          max_participants_per_group: firstGroup.max_participants_per_group,
          system_phone: firstGroup.system_phone,
          universal_link: firstGroup.universal_link, // 🔗 CORRIGIDO: Usar o mesmo link universal da família
          group_family: familyId, // Manter para compatibilidade
          user_id: firstGroup.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) {
        console.error('❌ Erro ao salvar novo grupo:', saveError)
        return NextResponse.json(
          { error: 'Erro ao salvar novo grupo', details: saveError.message },
          { status: 500 }
        )
      }

      console.log(`✅ JOIN-UNIVERSAL: Novo grupo criado: "${newGroupName}" (${createGroupResult.data.phone})`)
      console.log(`🔗 JOIN-UNIVERSAL: Link de convite: ${inviteLinkResult.data.invitationLink}`)

      // Adicionar participantes à tabela group_participants
      console.log(`👥 JOIN-UNIVERSAL: Adicionando participantes à tabela group_participants...`)
      try {
        const { addGroupParticipant } = await import('@/lib/group-participants')
        
        // Adicionar Super Admin (primeiro participante)
        const superAdminResult = await addGroupParticipant(
          newGroup.id,
          superAdminPhone,
          'Super Admin',
          true, // isAdmin
          true  // isSuperAdmin
        )
        
        if (superAdminResult.success) {
          console.log(`✅ JOIN-UNIVERSAL: Super Admin adicionado ao grupo`)
        } else {
          console.error(`❌ JOIN-UNIVERSAL: Erro ao adicionar Super Admin:`, superAdminResult.error)
        }
        
        // Adicionar Número do Sistema (segundo participante)
        const systemResult = await addGroupParticipant(
          newGroup.id,
          systemPhone,
          'Sistema',
          false, // isAdmin
          false  // isSuperAdmin
        )
        
        if (systemResult.success) {
          console.log(`✅ JOIN-UNIVERSAL: Número do Sistema adicionado ao grupo`)
        } else {
          console.error(`❌ JOIN-UNIVERSAL: Erro ao adicionar Número do Sistema:`, systemResult.error)
        }
        
        console.log(`✅ JOIN-UNIVERSAL: Participantes adicionados à tabela group_participants`)
      } catch (participantError) {
        console.error(`❌ JOIN-UNIVERSAL: Erro ao adicionar participantes:`, participantError)
        // Não falhar a operação se houver erro ao adicionar participantes
      }

      // Disparar notificação em tempo real para criação de grupo
      try {
        const { error: notificationError } = await supabase
          .from('group_notifications')
          .insert({
            user_id: firstGroup.user_id,
            type: 'group_updated',
            title: newGroupName,
            message: `Grupo "${newGroupName}" criado automaticamente para a família "${familyName}".`,
            group_id: newGroup.id,
            data: {
              group_name: newGroupName,
              family_name: familyName,
              is_group: true,
              action: 'created'
            },
            created_at: new Date().toISOString()
          })

        if (notificationError) {
          console.error('❌ Erro ao criar notificação de grupo criado:', notificationError)
        } else {
          console.log('✅ Notificação em tempo real disparada para grupo criado')
        }
      } catch (notificationError) {
        console.error('❌ Erro ao disparar notificação em tempo real:', notificationError)
      }

      // Aplicar configurações do grupo no WhatsApp
      console.log('⚙️ JOIN-UNIVERSAL: Aplicando configurações do grupo no WhatsApp...')
      
      try {
        // 1. Atualizar nome do grupo (se diferente do padrão)
        if (newGroupName !== 'A') {
          console.log(`📝 JOIN-UNIVERSAL: Atualizando nome do grupo para: "${newGroupName}"`)
          const nameResult = await zApiClient.updateGroupName(createGroupResult.data.phone, newGroupName)
          if (nameResult.success) {
            console.log('✅ JOIN-UNIVERSAL: Nome do grupo atualizado no WhatsApp')
          } else {
            console.error('❌ JOIN-UNIVERSAL: Erro ao atualizar nome do grupo:', nameResult.error)
          }
        }

        // 2. Atualizar descrição do grupo (se existir)
        if (firstGroup.description) {
          console.log(`📝 JOIN-UNIVERSAL: Atualizando descrição do grupo: "${firstGroup.description}"`)
          const descResult = await zApiClient.updateGroupDescription(createGroupResult.data.phone, firstGroup.description)
          if (descResult.success) {
            console.log('✅ JOIN-UNIVERSAL: Descrição do grupo atualizada no WhatsApp')
          } else {
            console.error('❌ JOIN-UNIVERSAL: Erro ao atualizar descrição do grupo:', descResult.error)
          }
        }

        // 3. Atualizar imagem do grupo (se existir)
        if (firstGroup.image_url) {
          console.log(`🖼️ JOIN-UNIVERSAL: Atualizando imagem do grupo: "${firstGroup.image_url}"`)
          const imageResult = await zApiClient.updateGroupImage(createGroupResult.data.phone, firstGroup.image_url)
          if (imageResult.success) {
            console.log('✅ JOIN-UNIVERSAL: Imagem do grupo atualizada no WhatsApp')
          } else {
            console.error('❌ JOIN-UNIVERSAL: Erro ao atualizar imagem do grupo:', imageResult.error)
          }
        }

        // 4. Aplicar configurações do grupo
        console.log('⚙️ JOIN-UNIVERSAL: Aplicando configurações do grupo...')
        const settingsResult = await zApiClient.updateGroupSettings(createGroupResult.data.phone, {
          adminOnlyMessage: firstGroup.admin_only_message,
          adminOnlySettings: firstGroup.admin_only_settings,
          requireAdminApproval: firstGroup.require_admin_approval,
          adminOnlyAddMember: firstGroup.admin_only_add_member
        })
        
        if (settingsResult.success) {
          console.log('✅ JOIN-UNIVERSAL: Configurações do grupo aplicadas no WhatsApp')
        } else {
          console.error('❌ JOIN-UNIVERSAL: Erro ao aplicar configurações do grupo:', settingsResult.error)
        }

      } catch (configError) {
        console.error('❌ JOIN-UNIVERSAL: Erro ao aplicar configurações do grupo:', configError)
        // Não falhar a operação se as configurações falharem
      }

      return NextResponse.json({
        success: true,
        groupId: createGroupResult.data.phone,
        groupName: newGroupName,
        inviteLink: inviteLinkResult.data.invitationLink,
        isNewGroup: true,
        message: `Novo grupo "${newGroupName}" criado com sucesso!`
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
    }

    // 4. Se há vaga, usar grupo existente
    console.log(`✅ JOIN-UNIVERSAL: Usando grupo existente: "${availableGroup.name}"`)
    console.log(`🔗 JOIN-UNIVERSAL: Link de convite: ${availableGroup.invite_link}`)
    console.log(`📊 JOIN-UNIVERSAL: DADOS DO GRUPO SELECIONADO:`, {
      id: availableGroup.id,
      name: availableGroup.name,
      whatsapp_id: availableGroup.whatsapp_id,
      participant_count: availableGroup.participant_count || 0,
      invite_link: availableGroup.invite_link
    })

    return NextResponse.json({
      success: true,
      groupId: availableGroup.whatsapp_id,
      groupName: availableGroup.name,
      inviteLink: availableGroup.invite_link,
      isNewGroup: false,
      message: `Vaga encontrada no grupo "${availableGroup.name}"!`
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('❌ JOIN-UNIVERSAL: Erro interno:', error)
    console.error('❌ JOIN-UNIVERSAL: Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}