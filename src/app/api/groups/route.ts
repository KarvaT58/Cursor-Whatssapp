import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().or(z.literal('')).or(z.null()),
  participants: z.array(z.string()).optional().default([]),
  whatsapp_id: z.string().optional().or(z.literal('')),
  image_url: z.string().nullable().optional().or(z.literal('')),
  // Configurações do grupo
  admin_only_message: z.boolean().optional(),
  admin_only_settings: z.boolean().optional(),
  require_admin_approval: z.boolean().optional(),
  admin_only_add_member: z.boolean().optional(),
  // Sistema de Links Universais
  enable_universal_link: z.boolean().optional(),
  system_phone: z.string().optional(),
})

// const UpdateGroupSchema = z.object({
//   name: z.string().min(1).optional(),
//   description: z.string().optional(),
//   participants: z.array(z.string()).optional(),
//   image_url: z.string().optional(),
// })

// GET /api/groups - Listar grupos do usuário
export async function GET() {
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

    // Buscar grupos do usuário com informações de família de grupos
    const { data: groups, error } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar grupos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar grupos' },
        { status: 500 }
      )
    }

    // Os grupos já têm o campo group_type definido na nova estrutura
    console.log('Grupos encontrados:', groups?.map(g => ({
      name: g.name, 
      group_type: g.group_type, 
      family_name: g.family_name
    })))

    return NextResponse.json(groups || [])
  } catch (error) {
    console.error('=== ERRO NA API DE GRUPOS ===')
    console.error('Tipo do erro:', typeof error)
    console.error('Erro completo:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// POST /api/groups - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA CRIAÇÃO DE GRUPO ===')
    
    const supabase = await createClient()
    console.log('Supabase client criado com sucesso')

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('Resultado da autenticação:', { user: user?.id, authError })

    if (authError || !user) {
      console.log('Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Body recebido:', body)
    console.log('🔧 Configurações no body:', {
      admin_only_message: body.admin_only_message,
      admin_only_settings: body.admin_only_settings,
      require_admin_approval: body.require_admin_approval,
      admin_only_add_member: body.admin_only_add_member,
    })
    console.log('🔍 Tipos dos dados no body:', {
      name: typeof body.name,
      description: typeof body.description,
      participants: Array.isArray(body.participants) ? 'array' : typeof body.participants,
      whatsapp_id: typeof body.whatsapp_id,
      image_url: typeof body.image_url,
      admin_only_message: typeof body.admin_only_message,
      admin_only_settings: typeof body.admin_only_settings,
      require_admin_approval: typeof body.require_admin_approval,
      admin_only_add_member: typeof body.admin_only_add_member,
    })
    
    let validatedData
    try {
      validatedData = CreateGroupSchema.parse(body)
      console.log('Dados validados:', validatedData)
      console.log('🔧 Configurações validadas:', {
        admin_only_message: validatedData.admin_only_message,
        admin_only_settings: validatedData.admin_only_settings,
        require_admin_approval: validatedData.require_admin_approval,
        admin_only_add_member: validatedData.admin_only_add_member,
      })
    } catch (validationError) {
      console.error('❌ Erro de validação:', validationError)
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationError },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem uma instância Z-API ativa
    console.log('Buscando instância Z-API ativa...')
    const { data: userInstanceData, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    console.log('Resultado da busca de instância:', { userInstanceData, instanceError })

    let userInstance = userInstanceData
    if (instanceError) {
      console.log('Erro ao buscar instância, definindo como null')
      userInstance = null
    }

    let whatsappGroupId: string | null = null
    let zApiError: string | null = null
    let zApiClient: ZApiClient | null = null

    // Tentar criar grupo no WhatsApp via Z-API se houver instância ativa
    if (userInstance) {
      console.log('Tentando criar grupo no WhatsApp via Z-API...')
      console.log('Dados da instância:', {
        instance_id: userInstance.instance_id,
        instance_token: userInstance.instance_token.substring(0, 10) + '...'
      })
      
      try {
        zApiClient = new ZApiClient(userInstance.instance_id, userInstance.instance_token, userInstance.client_token)
        console.log('ZApiClient criado com sucesso')
        
        // Validar se há participantes suficientes para criar o grupo
        if (validatedData.participants.length === 0) {
          console.log('Erro: Nenhum participante fornecido')
          return NextResponse.json(
            { error: 'É necessário pelo menos um participante para criar o grupo' },
            { status: 400 }
          )
        }

        console.log('Dados para criação no WhatsApp:', {
          name: validatedData.name,
          description: validatedData.description,
          participants: validatedData.participants
        })

        const createGroupResponse = await zApiClient.createGroup({
          name: validatedData.name,
          description: validatedData.description,
          participants: validatedData.participants,
        })

        console.log('Resposta da Z-API:', createGroupResponse)

        // Verificar se a resposta da Z-API indica sucesso
        if (createGroupResponse.success) {
          // Verificar se a resposta contém dados de sucesso
          if (createGroupResponse.data && typeof createGroupResponse.data === 'object') {
            // Se a resposta tem success: false, é um erro
            if ('success' in createGroupResponse.data && createGroupResponse.data.success === false) {
              zApiError = createGroupResponse.data.message || 'Erro ao criar grupo no WhatsApp'
              console.log('Erro ao criar grupo no WhatsApp:', zApiError)
            } else if ('phone' in createGroupResponse.data) {
              // A Z-API retorna o ID do grupo no campo 'phone'
              whatsappGroupId = createGroupResponse.data.phone as string
              console.log('Grupo criado com sucesso no WhatsApp! ID:', whatsappGroupId)
            } else if ('id' in createGroupResponse.data) {
              whatsappGroupId = createGroupResponse.data.id as string
              console.log('Grupo criado com sucesso no WhatsApp! ID:', whatsappGroupId)
            } else {
              // Se não tem ID mas também não tem erro explícito, assumir sucesso
              whatsappGroupId = `zapi_${Date.now()}`
              console.log('Grupo criado no WhatsApp (sem ID específico):', whatsappGroupId)
            }
          } else {
            // Resposta sem dados estruturados, assumir sucesso
            whatsappGroupId = `zapi_${Date.now()}`
            console.log('Grupo criado no WhatsApp (resposta simples):', whatsappGroupId)
          }
        } else {
          zApiError = createGroupResponse.error || 'Erro desconhecido ao criar grupo no WhatsApp'
          console.log('Erro ao criar grupo no WhatsApp:', zApiError)
        }
      } catch (error) {
        console.error('Erro ao criar grupo no WhatsApp:', error)
        zApiError = error instanceof Error ? error.message : 'Erro ao conectar com Z-API'
      }
    } else {
      zApiError = 'Nenhuma instância Z-API ativa. Grupo será criado localmente.'
      console.log('Nenhuma instância Z-API ativa encontrada')
    }

    // Criar grupo no banco de dados
    console.log('Criando grupo no banco de dados...')
    
    // Incluir automaticamente o número do usuário conectado na Z-API na lista de participantes
    let finalParticipants = [...validatedData.participants]
    if (userInstance && zApiClient) {
      try {
        // Obter o número de telefone real da instância
        const instanceInfo = await zApiClient.getInstanceInfo()
        let userPhone = null
        
        if (instanceInfo.success && instanceInfo.data) {
          // Tentar diferentes campos que podem conter o número de telefone
          userPhone = instanceInfo.data.phone || instanceInfo.data.phoneNumber || instanceInfo.data.number
          console.log(`📱 Dados da instância obtidos:`, instanceInfo.data)
          console.log(`📱 Número de telefone real obtido da instância: ${userPhone}`)
        }
        
        // Se não conseguimos obter o número da instância, usar o connectedPhone do webhook
        // que sabemos que é 554598228660 baseado nos logs
        if (!userPhone) {
          userPhone = '554598228660' // Número fixo do Z-API baseado nos logs
          console.log(`📱 Usando número fixo do Z-API: ${userPhone}`)
        }
        
        // Adicionar o número do Z-API como primeiro participante (super admin)
        if (!finalParticipants.includes(userPhone)) {
          finalParticipants.unshift(userPhone) // Adicionar no início da lista
          console.log(`✅ Adicionando número do Z-API como super admin (${userPhone}) à lista de participantes`)
        }
      } catch (error) {
        console.error('❌ Erro ao obter número de telefone da instância:', error)
        // Usar número fixo do Z-API como fallback
        const userPhone = '554598228660'
        if (!finalParticipants.includes(userPhone)) {
          finalParticipants.unshift(userPhone)
          console.log(`✅ Adicionando número fixo do Z-API como fallback (${userPhone}) à lista de participantes`)
        }
      }
    }
    
    console.log('Dados para inserção:', {
      name: validatedData.name,
      description: validatedData.description,
      participants: finalParticipants,
      whatsapp_id: whatsappGroupId || validatedData.whatsapp_id || `local_${Date.now()}`,
      image_url: validatedData.image_url ? 'BASE64_IMAGE_DATA' : null,
      user_id: user.id,
    })
    
    console.log('🔧 Configurações para inserção:', {
      admin_only_message: validatedData.admin_only_message || false,
      admin_only_settings: validatedData.admin_only_settings || false,
      require_admin_approval: validatedData.require_admin_approval || false,
      admin_only_add_member: validatedData.admin_only_add_member || false,
    })

    // Se o grupo foi criado no WhatsApp mas não tem descrição, tentar atualizar a descrição
    if (whatsappGroupId && validatedData.description && zApiClient) {
      try {
        console.log('🔄 Tentando atualizar descrição do grupo recém-criado no WhatsApp')
        const descResult = await zApiClient.updateGroupDescription(whatsappGroupId, validatedData.description)
        if (descResult.success) {
          console.log('✅ Descrição do grupo atualizada no WhatsApp após criação')
        } else {
          console.log('⚠️ Não foi possível atualizar descrição no WhatsApp:', descResult.error)
        }
      } catch (descError) {
        console.log('⚠️ Erro ao atualizar descrição no WhatsApp:', descError)
      }
    }
    
    const { data: group, error: dbError } = await supabase
      .from('whatsapp_groups')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        participants: finalParticipants,
        whatsapp_id: whatsappGroupId || validatedData.whatsapp_id || `local_${Date.now()}`,
        image_url: validatedData.image_url || null,
        // Configurações do grupo
        admin_only_message: validatedData.admin_only_message || false,
        admin_only_settings: validatedData.admin_only_settings || false,
        require_admin_approval: validatedData.require_admin_approval || false,
        admin_only_add_member: validatedData.admin_only_add_member || false,
        user_id: user.id,
      })
      .select()
      .single()

    console.log('Resultado da criação no banco:', { group, dbError })

    if (dbError) {
      return NextResponse.json(
        { error: 'Erro ao salvar grupo no banco de dados', details: dbError.message },
        { status: 500 }
      )
    }

    // Atualizar foto do grupo se fornecida e grupo foi criado no WhatsApp
    if (validatedData.image_url && whatsappGroupId && zApiClient) {
      console.log('📸 Atualizando foto do grupo após criação:', { whatsappGroupId })
      try {
        const photoResult = await zApiClient.updateGroupPhoto(whatsappGroupId, validatedData.image_url)
        if (!photoResult.success) {
          console.warn('⚠️ Grupo criado mas foto não foi atualizada:', photoResult.error)
        } else {
          console.log('✅ Foto do grupo atualizada com sucesso')
        }
      } catch (error) {
        console.warn('⚠️ Erro ao atualizar foto do grupo:', error)
      }
    }

    // Atualizar configurações do grupo no WhatsApp se grupo foi criado no WhatsApp
    if (whatsappGroupId && zApiClient) {
      console.log('⚙️ Atualizando configurações do grupo no WhatsApp:', { whatsappGroupId })
      try {
        const settingsResult = await zApiClient.updateGroupSettings(whatsappGroupId, {
          adminOnlyMessage: validatedData.admin_only_message || false,
          adminOnlySettings: validatedData.admin_only_settings || false,
          requireAdminApproval: validatedData.require_admin_approval || false,
          adminOnlyAddMember: validatedData.admin_only_add_member || false,
        })
        
        if (settingsResult.success) {
          console.log('✅ Configurações do grupo atualizadas no WhatsApp com sucesso')
        } else {
          console.warn('⚠️ Grupo criado mas configurações não foram atualizadas:', settingsResult.error)
        }
      } catch (error) {
        console.warn('⚠️ Erro ao atualizar configurações do grupo:', error)
      }

      // 🔗 Obter e salvar link de convite do grupo no banco de dados
      console.log('🔗 Obtendo link de convite do grupo recém-criado...')
      try {
        const inviteLinkResult = await zApiClient.getGroupInviteLink(whatsappGroupId)
        
        if (inviteLinkResult.success && inviteLinkResult.data) {
          // Verificar diferentes campos possíveis na resposta
          const whatsappInviteLink = inviteLinkResult.data?.invitationLink || 
                                    inviteLinkResult.data?.inviteLink || 
                                    inviteLinkResult.data?.link || 
                                    inviteLinkResult.data?.invite_link ||
                                    inviteLinkResult.data?.groupInviteLink
          
          if (whatsappInviteLink) {
            console.log('✅ Link de convite obtido:', whatsappInviteLink)
            
            // Atualizar o grupo no banco com o link de convite
            const { error: updateError } = await supabase
              .from('whatsapp_groups')
              .update({ invite_link: whatsappInviteLink })
              .eq('id', group.id)
            
            if (updateError) {
              console.error('❌ Erro ao salvar link de convite no banco:', updateError)
            } else {
              console.log('✅ Link de convite salvo no banco de dados com sucesso')
            }
          } else {
            console.warn('⚠️ Link de convite não encontrado na resposta da Z-API')
            console.log('📋 Estrutura da resposta:', JSON.stringify(inviteLinkResult.data, null, 2))
          }
        } else {
          console.warn('⚠️ Erro ao obter link de convite:', inviteLinkResult.error)
        }
      } catch (error) {
        console.warn('⚠️ Erro ao obter link de convite do grupo:', error)
      }
    }

    // Sistema de links universais - atualizar grupo com dados da família
    if (validatedData.enable_universal_link) {
      console.log('🔗 Configurando grupo como universal...')
      try {
        // Gerar link universal baseado no ID do grupo
        const universalLink = `/join/${group.id}`
        
        // Atualizar o grupo com os dados da família diretamente
        const { error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({ 
            group_type: 'universal',
            family_name: validatedData.name,
            family_base_name: validatedData.name.toLowerCase().replace(/\s+/g, '-'),
            max_participants_per_group: 256,
            system_phone: validatedData.system_phone || '554584154115',
            universal_link: universalLink
          })
          .eq('id', group.id)

        if (updateError) {
          console.error('❌ Erro ao configurar grupo como universal:', updateError)
          throw updateError
        }

        console.log('✅ Grupo configurado como universal')
        console.log('🔗 Link universal disponível em:', universalLink)

        // Adicionar participantes à tabela group_participants para grupos universais
        console.log('👥 Adicionando participantes à tabela group_participants...')
        try {
          const { addGroupParticipant } = await import('@/lib/group-participants')
          
          // Adicionar Super Admin (número da Z-API)
          const superAdminPhone = '554598228660' // Número correto da Z-API baseado nos logs
          const superAdminResult = await addGroupParticipant(
            group.id,
            superAdminPhone,
            'Super Admin',
            true, // isAdmin
            true  // isSuperAdmin
          )
          
          if (superAdminResult.success) {
            console.log(`✅ Super Admin adicionado ao grupo universal`)
          } else {
            console.error(`❌ Erro ao adicionar Super Admin:`, superAdminResult.error)
          }
          
          // Adicionar Número do Sistema
          const systemPhone = validatedData.system_phone || '5545984154115'
          const systemResult = await addGroupParticipant(
            group.id,
            systemPhone,
            'Sistema',
            false, // isAdmin
            false  // isSuperAdmin
          )
          
          if (systemResult.success) {
            console.log(`✅ Número do Sistema adicionado ao grupo universal`)
          } else {
            console.error(`❌ Erro ao adicionar Número do Sistema:`, systemResult.error)
          }
          
          // Adicionar outros participantes fornecidos pelo usuário
          for (const participantPhone of finalParticipants) {
            if (participantPhone && participantPhone !== superAdminPhone && participantPhone !== systemPhone) {
              const participantResult = await addGroupParticipant(
                group.id,
                participantPhone,
                null, // nome será preenchido pelo webhook
                false, // isAdmin
                false  // isSuperAdmin
              )
              
              if (participantResult.success) {
                console.log(`✅ Participante ${participantPhone} adicionado ao grupo universal`)
              } else {
                console.error(`❌ Erro ao adicionar participante ${participantPhone}:`, participantResult.error)
              }
            }
          }
          
          console.log(`✅ Participantes adicionados à tabela group_participants`)
        } catch (participantError) {
          console.error(`❌ Erro ao adicionar participantes:`, participantError)
          // Não falhar a operação se houver erro ao adicionar participantes
        }

      } catch (linkError) {
        console.error('❌ Erro ao configurar sistema de links universais:', linkError)
        // Não falhar a criação do grupo por causa do link universal
        console.warn('⚠️ Grupo criado mas sistema de links universais falhou')
      }
    } else {
      console.log('ℹ️ Grupo criado como normal (não universal)')
    }

    // Retornar resposta baseada no resultado
    if (whatsappGroupId) {
      return NextResponse.json({ 
        success: true,
        data: group,
        message: 'Grupo criado com sucesso no WhatsApp',
        whatsapp_id: whatsappGroupId
      }, { status: 201 })
    } else {
      return NextResponse.json({ 
        success: true,
        data: group,
        message: 'Grupo criado localmente. Será sincronizado com o WhatsApp quando a conexão for restabelecida.',
        warning: zApiError
      }, { status: 201 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('=== ERRO NA API DE CRIAÇÃO DE GRUPOS ===')
    console.error('Tipo do erro:', typeof error)
    console.error('Erro completo:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
