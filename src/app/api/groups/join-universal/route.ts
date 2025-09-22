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

    // 1. Buscar todos os grupos da família
    console.log('🔍 JOIN-UNIVERSAL: Executando query no Supabase...')
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('group_family', familyId)
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
    const MAX_PARTICIPANTS = 3 // Limite para teste (mudar para 1024 em produção)

    console.log(`🔍 JOIN-UNIVERSAL: Verificando vagas com limite de ${MAX_PARTICIPANTS} participantes...`)

    for (const group of groups) {
      const currentParticipants = group.participants?.length || 0

      console.log(`📊 JOIN-UNIVERSAL: Grupo "${group.name}" - Participantes: ${currentParticipants}/${MAX_PARTICIPANTS}`)

      if (currentParticipants < MAX_PARTICIPANTS) {
        availableGroup = group
        console.log(`✅ JOIN-UNIVERSAL: Vaga encontrada no grupo "${group.name}" (${currentParticipants}/${MAX_PARTICIPANTS})`)
        break
      } else {
        console.log(`❌ JOIN-UNIVERSAL: Grupo "${group.name}" está cheio (${currentParticipants}/${MAX_PARTICIPANTS})`)
      }
    }

    // 3. Se não há vagas, criar novo grupo
    if (!availableGroup) {
      console.log('🚀 JOIN-UNIVERSAL: Nenhuma vaga disponível, criando novo grupo...')

      // Buscar dados do primeiro grupo para copiar configurações
      const firstGroup = groups[0]
      console.log(`📋 JOIN-UNIVERSAL: Copiando configurações do grupo "${firstGroup.name}"`)
      console.log(`🔍 JOIN-UNIVERSAL: DADOS COMPLETOS DO PRIMEIRO GRUPO:`, JSON.stringify(firstGroup, null, 2))

      // Buscar instância Z-API ativa
      console.log(`🔍 JOIN-UNIVERSAL: Buscando instância Z-API para user_id: ${firstGroup.user_id}`)
      const { data: zApiInstance, error: instanceError } = await supabase
        .from('z_api_instances')
        .select('*')
        .eq('user_id', firstGroup.user_id)
        .eq('is_active', true)
        .single()

      if (instanceError || !zApiInstance) {
        console.error('❌ JOIN-UNIVERSAL: Instância Z-API não encontrada:', instanceError)
        return NextResponse.json(
          { error: 'Instância Z-API não encontrada' },
          { status: 500 }
        )
      }

      console.log('📱 JOIN-UNIVERSAL: Instância Z-API encontrada:', {
        instance_id: zApiInstance.instance_id,
        phone_number: zApiInstance.phone_number || 'Não configurado',
        client_token: zApiInstance.client_token ? 'Presente' : 'Ausente'
      })
      console.log(`🔍 JOIN-UNIVERSAL: DADOS COMPLETOS DA INSTÂNCIA Z-API:`, JSON.stringify(zApiInstance, null, 2))

      // PROBLEMA IDENTIFICADO: Z-API pode estar validando se o número pertence à instância
      console.log(`🔍 JOIN-UNIVERSAL: Investigando problema do número de telefone...`)
      console.log(`📱 JOIN-UNIVERSAL: phone_number da instância: "${zApiInstance.phone_number}"`)
      console.log(`📱 JOIN-UNIVERSAL: instance_id: "${zApiInstance.instance_id}"`)
      console.log(`📱 JOIN-UNIVERSAL: instance_token: "${zApiInstance.instance_token}"`)
      
      // CORREÇÃO: A tabela z_api_instances NÃO TEM phone_number!
      // Vamos usar o primeiro participante do grupo original como admin
      let adminPhoneNumber = firstGroup.participants && firstGroup.participants.length > 0 
        ? firstGroup.participants[0] 
        : '554599854508' // Fallback para o número que sabemos que funciona
      
      // Normalizar número de telefone para formato Z-API (DDI DDD NUMBER)
      const normalizePhoneForZApi = (phone: string): string => {
        // Remover todos os caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '')
        
        // Se não começar com 55, adicionar código do Brasil
        if (!cleaned.startsWith('55')) {
          return `55${cleaned}`
        }
        
        return cleaned
      }
      
      const normalizedAdminPhone = normalizePhoneForZApi(adminPhoneNumber)
      
      // Declarar variável participants no escopo correto
      let participants: string[] = []
      
      // Verificar se o número existe no WhatsApp antes de criar o grupo
      console.log(`🔍 JOIN-UNIVERSAL: Verificando se o número ${normalizedAdminPhone} existe no WhatsApp...`)
      
      try {
        const phoneExistsResponse = await fetch(
          `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/phone-exists/${normalizedAdminPhone}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Client-Token': zApiInstance.client_token || '',
            }
          }
        )
        
        const phoneExistsResult = await phoneExistsResponse.json()
        console.log(`📱 JOIN-UNIVERSAL: Resultado da verificação de existência:`, phoneExistsResult)
        
        if (!phoneExistsResult.exists) {
          console.warn(`⚠️ JOIN-UNIVERSAL: Número ${normalizedAdminPhone} não existe no WhatsApp`)
          // Usar um número de fallback que sabemos que funciona
          const fallbackPhone = '554599854508'
          console.log(`🔄 JOIN-UNIVERSAL: Usando número de fallback: ${fallbackPhone}`)
          participants = [fallbackPhone]
        } else {
          console.log(`✅ JOIN-UNIVERSAL: Número ${normalizedAdminPhone} existe no WhatsApp`)
          participants = [normalizedAdminPhone]
        }
      } catch (phoneCheckError) {
        console.error(`❌ JOIN-UNIVERSAL: Erro ao verificar existência do número:`, phoneCheckError)
        // Em caso de erro, usar o número normalizado mesmo assim
        participants = [normalizedAdminPhone]
      }
      
      console.log(`✅ JOIN-UNIVERSAL: Usando primeiro participante do grupo como admin: ${adminPhoneNumber}`)
      console.log(`📱 JOIN-UNIVERSAL: Número normalizado para Z-API: ${normalizedAdminPhone}`)
      console.log(`📱 JOIN-UNIVERSAL: Participantes do grupo original:`, firstGroup.participants)
      console.log(`📱 JOIN-UNIVERSAL: Participantes finais:`, participants)

      // Criar novo grupo via Z-API com configurações do primeiro grupo
      const newGroupNumber = groups.length + 1
      
      // TESTE EXTREMO: Nome de 1 caractere
      const newGroupName = `A`
      
      console.log(`🧪 JOIN-UNIVERSAL: TESTE EXTREMO - Nome de 1 caractere: "${newGroupName}"`)
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

      if (!inviteLinkResult.success || !inviteLinkResult.data?.link) {
        console.error('❌ Erro ao obter link de convite:', inviteLinkResult)
        return NextResponse.json(
          { error: 'Erro ao obter link de convite', details: inviteLinkResult.error || 'Erro desconhecido' },
          { status: 500 }
        )
      }

      // Salvar novo grupo no banco de dados
      const { data: newGroup, error: saveError } = await supabase
        .from('whatsapp_groups')
        .insert({
          name: newGroupName,
          whatsapp_id: createGroupResult.data.phone,
          invite_link: inviteLinkResult.data.link,
          description: firstGroup.description || `Grupo ${familyName}`,
          participants: participants,
          max_participants: MAX_PARTICIPANTS,
          group_family: familyId,
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

      console.log(`✅ JOIN-UNIVERSAL: Novo grupo criado: "${newGroupName}" (${createGroupResult.groupId})`)
      console.log(`🔗 JOIN-UNIVERSAL: Link de convite: ${inviteLinkResult.link}`)

      return NextResponse.json({
        success: true,
        groupId: createGroupResult.groupId,
        groupName: newGroupName,
        inviteLink: inviteLinkResult.link,
        isNewGroup: true,
        message: `Novo grupo "${newGroupName}" criado com sucesso!`
      })
    }

    // 4. Se há vaga, usar grupo existente
    console.log(`✅ JOIN-UNIVERSAL: Usando grupo existente: "${availableGroup.name}"`)
    console.log(`🔗 JOIN-UNIVERSAL: Link de convite: ${availableGroup.invite_link}`)

    return NextResponse.json({
      success: true,
      groupId: availableGroup.whatsapp_id,
      groupName: availableGroup.name,
      inviteLink: availableGroup.invite_link,
      isNewGroup: false,
      message: `Vaga encontrada no grupo "${availableGroup.name}"!`
    })

  } catch (error) {
    console.error('❌ JOIN-UNIVERSAL: Erro interno:', error)
    console.error('❌ JOIN-UNIVERSAL: Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}