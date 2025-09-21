import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'

export interface GroupLink {
  id: string
  universal_link: string
  group_family: string
  active_groups: string[]
  total_participants: number
  created_at: string
  updated_at: string
}

export interface GroupFamily {
  id: string
  name: string
  base_name: string
  current_groups: string[]
  max_participants_per_group: number
  total_participants: number
  created_at: string
  updated_at: string
}

export interface ParticipantFilter {
  phone: string
  name?: string
  isBlacklisted: boolean
  isDuplicate: boolean
  targetGroup?: string
}

export class GroupLinkSystem {
  private supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
  private zApiClient: ZApiClient

  constructor() {
    // Inicializar supabase de forma assíncrona
    // ZApiClient será inicializado quando necessário
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  private async getZApiClient(): Promise<ZApiClient> {
    if (!this.zApiClient) {
      const supabase = await this.getSupabase()
      
      // Buscar a instância Z-API ativa do usuário
      const { data: zApiInstance, error } = await supabase
        .from('z_api_instances')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error || !zApiInstance) {
        throw new Error('Instância Z-API não encontrada ou não está ativa')
      }

      this.zApiClient = new ZApiClient(
        zApiInstance.instance_id,
        zApiInstance.instance_token,
        zApiInstance.client_token
      )
    }
    return this.zApiClient
  }

  /**
   * Cria um novo sistema de links universais para um grupo
   */
  async createUniversalLinkSystem(
    groupId: string,
    groupName: string,
    userId: string,
    systemPhone?: string,
    requestUrl?: string
  ): Promise<{ success: boolean; data?: GroupLink; error?: string }> {
    try {
      console.log('🔗 CRIANDO SISTEMA DE LINKS UNIVERSAIS ===')
      console.log('Group ID:', groupId)
      console.log('Group Name:', groupName)
      console.log('System Phone:', systemPhone || 'Não fornecido')

      // 1. Extrair nome base (ex: "faculdade 01" -> "faculdade")
      const baseName = this.extractBaseName(groupName)
      console.log('Base Name:', baseName)

      // 2. Verificar se já existe uma família de grupos
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      // 2.1. Verificar se já existe um link universal para este grupo
      const { data: existingGroupLink } = await supabase
        .from('group_links')
        .select('*')
        .eq('group_family', (await supabase
          .from('group_families')
          .select('id')
          .eq('base_name', baseName)
          .eq('user_id', userId)
          .single()).data?.id)
        .single()

      if (existingGroupLink) {
        console.log('✅ Link universal já existe para esta família de grupos')
        return {
          success: true,
          data: existingGroupLink
        }
      }

      const { data: existingFamily } = await supabase
        .from('group_families')
        .select('*')
        .eq('base_name', baseName)
        .eq('user_id', userId)
        .single()

      let familyId: string

      if (existingFamily) {
        // Adicionar grupo à família existente
        familyId = existingFamily.id
        const updatedGroups = [...existingFamily.current_groups, groupId]
        
        const { error: updateError } = await supabase
          .from('group_families')
          .update({
            current_groups: updatedGroups,
            updated_at: new Date().toISOString()
          })
          .eq('id', familyId)

        if (updateError) throw updateError
      } else {
        // Criar nova família de grupos
        const { data: newFamily, error: createError } = await supabase
          .from('group_families')
          .insert({
            name: groupName,
            base_name: baseName,
            current_groups: [groupId],
            max_participants_per_group: 1024,
            total_participants: 0,
            system_phone: systemPhone || '554584154115',
            user_id: userId
          })
          .select()
          .single()

        if (createError) throw createError
        familyId = newFamily.id
      }

      // 3. Gerar link universal
      const universalLink = this.generateUniversalLink(baseName, familyId, requestUrl)
      console.log('Universal Link:', universalLink)

      // 3.1. Verificar se o link já existe
      const { data: existingLink } = await supabase
        .from('group_links')
        .select('id, universal_link, group_family')
        .eq('universal_link', universalLink)
        .single()

      let groupLink: any

      if (existingLink) {
        // Link já existe, usar o existente
        console.log('✅ Link universal já existe, usando o existente:', existingLink.id)
        groupLink = existingLink
        
        // Atualizar grupos ativos se necessário
        const { data: currentLink } = await supabase
          .from('group_links')
          .select('active_groups')
          .eq('id', existingLink.id)
          .single()
        
        if (currentLink && !currentLink.active_groups.includes(groupId)) {
          const updatedGroups = [...currentLink.active_groups, groupId]
          await supabase
            .from('group_links')
            .update({ 
              active_groups: updatedGroups,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLink.id)
        }
      } else {
        // 4. Criar registro do link universal
        const { data: newGroupLink, error: linkError } = await supabase
          .from('group_links')
          .insert({
            universal_link: universalLink,
            group_family: familyId,
            active_groups: [groupId],
            total_participants: 0,
            user_id: userId
          })
          .select()
          .single()

        if (linkError) throw linkError
        groupLink = newGroupLink
      }

      // 5. Atualizar grupo com link universal
      const { error: groupUpdateError } = await supabase
        .from('whatsapp_groups')
        .update({
          universal_link: universalLink,
          group_family: familyId,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (groupUpdateError) throw groupUpdateError

      console.log('✅ Sistema de links universais criado com sucesso')
      return { success: true, data: groupLink }

    } catch (error) {
      console.error('❌ Erro ao criar sistema de links universais:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Processa entrada de participante via link universal
   */
  async processUniversalLinkEntry(
    universalLink: string,
    participantPhone: string,
    participantName?: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    systemPhone?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      console.log('🔗 PROCESSANDO ENTRADA VIA LINK UNIVERSAL ===')
      console.log('Universal Link:', universalLink)
      console.log('Participant Phone:', participantPhone)
      console.log('System Phone:', systemPhone || 'Não fornecido')

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      // 1. Buscar informações do link universal
      const { data: groupLink, error: linkError } = await supabase
        .from('group_links')
        .select(`
          *,
          group_families (
            *,
            whatsapp_groups (
              id,
              whatsapp_id,
              name,
              description,
              image_url,
              participants,
              user_id,
              admin_only_message,
              admin_only_settings,
              require_admin_approval,
              admin_only_add_member
            )
          )
        `)
        .like('universal_link', `%/join/${universalLink.split('/').pop()}`)
        .single()

      if (linkError || !groupLink) {
        return { success: false, error: 'Link universal não encontrado' }
      }

      // 1.1. Buscar TODOS os grupos da família usando current_groups
      const { data: allFamilyGroups, error: groupsError } = await supabase
        .from('whatsapp_groups')
        .select('id, whatsapp_id, name, description, image_url, participants, user_id, admin_only_message, admin_only_settings, require_admin_approval, admin_only_add_member')
        .in('id', groupLink.group_families.current_groups)

      if (groupsError) {
        console.error('Erro ao buscar grupos da família:', groupsError)
        return { success: false, error: 'Erro ao buscar grupos da família' }
      }

      // Substituir os grupos na estrutura
      groupLink.group_families.whatsapp_groups = allFamilyGroups || []

      // 2. Verificar blacklist
      const isBlacklisted = await this.checkBlacklist(participantPhone, groupLink.user_id)
      if (isBlacklisted) {
        return { success: false, error: 'Número está na blacklist' }
      }

      // 3. Verificar duplicatas
      console.log('🔍 Verificando duplicatas para:', participantPhone)
      console.log('Grupos da família:', groupLink.group_families.whatsapp_groups.map(g => ({ name: g.name, participants: g.participants })))
      
      const isDuplicate = await this.checkDuplicateInFamily(
        participantPhone,
        groupLink.group_families.whatsapp_groups
      )
      if (isDuplicate) {
        console.log('❌ Participante já está em algum grupo da família')
        return { success: false, error: `Este número já está em algum grupo da família ${groupLink.group_families.base_name.toUpperCase()}. Não é possível entrar em outro grupo da mesma família.` }
      }
      console.log('✅ Número não está em nenhum grupo da família')

      // 4. Detectar vagas liberadas antes de buscar grupo
      await this.detectAndFixVacantSpots(groupLink.group_families.id)
      
      // 5. Encontrar grupo com espaço livre
      let targetGroup = await this.findAvailableGroup(groupLink.group_families.whatsapp_groups)
      
      // Se não há grupo disponível, criar um novo
      if (!targetGroup) {
        console.log('🆕 Nenhum grupo disponível, criando novo grupo...')
        const newGroupResult = await this.createNewGroupInFamily(groupLink.group_families, systemPhone)
        
        if (!newGroupResult.success) {
          return { success: false, error: newGroupResult.error }
        }
        
        targetGroup = newGroupResult.data
        console.log('✅ Novo grupo criado:', targetGroup.name)
      }

      // 6. Gerar link específico do WhatsApp para o grupo
      console.log('🔗 Gerando link específico do WhatsApp para o grupo')
      
      const zApiClient = await this.getZApiClient()
      const inviteLinkResult = await zApiClient.getGroupInviteLink(targetGroup.whatsapp_id)
      
      if (!inviteLinkResult.success) {
        console.error('❌ Erro ao gerar link de convite:', inviteLinkResult.error)
        return { success: false, error: 'Erro ao gerar link de convite do grupo' }
      }

      const whatsappInviteLink = inviteLinkResult.data?.inviteLink || inviteLinkResult.data?.link
      
      if (!whatsappInviteLink) {
        console.error('❌ Link de convite não encontrado na resposta')
        return { success: false, error: 'Link de convite não foi gerado' }
      }

      console.log('✅ Link específico do WhatsApp gerado:', whatsappInviteLink)
      return { 
        success: true, 
        data: { 
          groupId: targetGroup.id,
          groupName: targetGroup.name,
          whatsappId: targetGroup.whatsapp_id,
          whatsappInviteLink: whatsappInviteLink,
          message: `Grupo "${targetGroup.name}" disponível. Use o link específico para entrar.`
        } 
      }

    } catch (error) {
      console.error('❌ Erro ao processar entrada via link universal:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verifica se grupo precisa ser expandido (criar novo grupo)
   */
  async checkAndExpandGroupFamily(familyId: string): Promise<{ success: boolean; data?: any; error?: string }> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      console.log('🔍 VERIFICANDO EXPANSÃO DA FAMÍLIA DE GRUPOS ===')
      console.log('Family ID:', familyId)

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { data: family, error: familyError } = await supabase
        .from('group_families')
        .select(`
          *,
          whatsapp_groups (
            id,
            whatsapp_id,
            name,
            description,
            image_url,
            participants,
            user_id,
            admin_only_message,
            admin_only_settings,
            require_admin_approval,
            admin_only_add_member
          )
        `)
        .eq('id', familyId)
        .single()

      if (familyError || !family) {
        return { success: false, error: 'Família de grupos não encontrada' }
      }

      // Verificar se algum grupo está próximo do limite
      const groupsNearLimit = family.whatsapp_groups.filter(
        (group: any) => group.participants.length >= family.max_participants_per_group * 0.9 // eslint-disable-line @typescript-eslint/no-explicit-any
      )

      if (groupsNearLimit.length > 0) {
        // Criar novo grupo automaticamente
        const newGroupResult = await this.createNewGroupInFamily(family)
        return newGroupResult
      }

      return { success: true, data: { needsExpansion: false } }

    } catch (error) {
      console.error('❌ Erro ao verificar expansão da família:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cria novo grupo automaticamente na família
   */
  private async createNewGroupInFamily(family: any, systemPhone?: string): Promise<{ success: boolean; data?: any; error?: string }> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      console.log('🆕 CRIANDO NOVO GRUPO NA FAMÍLIA ===')
      console.log('Family:', family.name)

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      // 1. Gerar nome do novo grupo
      const nextGroupNumber = family.current_groups.length + 1
      const newGroupName = `${family.base_name} ${nextGroupNumber.toString().padStart(2, '0')}`
      console.log('New Group Name:', newGroupName)

      // 2. Buscar configurações do primeiro grupo da família para replicar
        const firstGroup = family.whatsapp_groups?.[0] // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!firstGroup) {
        return { success: false, error: 'Não foi possível encontrar grupo base para replicar configurações' }
      }

      // Debug: verificar dados do primeiro grupo
      console.log('🔍 Dados do primeiro grupo para replicação:', {
        name: firstGroup.name,
        description: firstGroup.description,
        image_url: firstGroup.image_url,
        admin_only_message: firstGroup.admin_only_message,
        admin_only_settings: firstGroup.admin_only_settings,
        require_admin_approval: firstGroup.require_admin_approval,
        admin_only_add_member: firstGroup.admin_only_add_member
      })

      // 3. Criar grupo no WhatsApp via Z-API
      const zApiClient = await this.getZApiClient()
      
      // Incluir AMBOS os números: o fixo do sistema e o conectado no Z-API
      const defaultSystemPhone = '554584154115' // Número padrão do sistema
      const finalSystemPhone = systemPhone || defaultSystemPhone
      const zApiPhone = '554598228660'   // Número conectado no Z-API
      const initialParticipants = [finalSystemPhone, zApiPhone]
      
      // Debug: verificar dados que serão enviados para Z-API
      console.log('📤 Dados sendo enviados para Z-API:', {
        name: newGroupName,
        description: firstGroup.description || '',
        participants: initialParticipants,
        imageUrl: firstGroup.image_url || undefined
      })

      const createResult = await zApiClient.createGroup({
        name: newGroupName,
        description: firstGroup.description || '',
        participants: initialParticipants, // Adicionar ambos os números
        imageUrl: undefined // Não enviar imagem na criação, vamos atualizar depois
      })
      
      if (!createResult.success) {
        return { success: false, error: createResult.error }
      }

      console.log('✅ Grupo criado no WhatsApp:', createResult.data)

      // 3.1. Atualizar descrição do grupo se houver uma no grupo original
      if (firstGroup.description) {
        console.log('📝 Atualizando descrição do grupo com a descrição do grupo original...')
        const descriptionResult = await zApiClient.updateGroupDescription(createResult.data.phone, firstGroup.description)
        
        if (descriptionResult.success) {
          console.log('✅ Descrição do grupo atualizada com sucesso')
        } else {
          console.warn('⚠️ Erro ao atualizar descrição do grupo:', descriptionResult.error)
          // Não falhar a operação se a descrição não puder ser atualizada
        }
      }

      // 3.2. Atualizar foto do grupo se houver uma no grupo original
      if (firstGroup.image_url) {
        console.log('📸 Atualizando foto do grupo com a imagem do grupo original...')
        const photoResult = await zApiClient.updateGroupPhoto(createResult.data.phone, firstGroup.image_url)
        
        if (photoResult.success) {
          console.log('✅ Foto do grupo atualizada com sucesso')
        } else {
          console.warn('⚠️ Erro ao atualizar foto do grupo:', photoResult.error)
          // Não falhar a operação se a foto não puder ser atualizada
        }
      }

      // 4. Buscar o link universal da família para associar ao novo grupo
      const { data: familyLink, error: linkError } = await supabase
        .from('group_links')
        .select('universal_link')
        .eq('group_family', family.id)
        .single()

      if (linkError) {
        console.warn('⚠️ Erro ao buscar link da família:', linkError)
      }

      // 5. Salvar grupo no banco replicando configurações
      const { data: newGroup, error: groupError } = await supabase
        .from('whatsapp_groups')
        .insert({
          name: newGroupName,
          whatsapp_id: createResult.data.phone,
          description: firstGroup.description || '',
          participants: initialParticipants,
          user_id: family.user_id,
          image_url: firstGroup.image_url || null,
          admin_only_message: firstGroup.admin_only_message || false,
          admin_only_settings: firstGroup.admin_only_settings || false,
          require_admin_approval: firstGroup.require_admin_approval || false,
          admin_only_add_member: firstGroup.admin_only_add_member || false,
          group_family: family.id, // ✅ ASSOCIAR À FAMÍLIA!
          universal_link: familyLink?.universal_link || null // ✅ ASSOCIAR LINK UNIVERSAL!
        })
        .select()
        .single()

      if (groupError) throw groupError

      // 6. Aplicar configurações do grupo (replicar do primeiro grupo)
      if (firstGroup.admin_only_message !== undefined || 
          firstGroup.admin_only_settings !== undefined || 
          firstGroup.require_admin_approval !== undefined || 
          firstGroup.admin_only_add_member !== undefined) {
        
        const settingsResult = await zApiClient.updateGroupSettings(createResult.data.phone, {
          adminOnlyMessage: firstGroup.admin_only_message || false,
          adminOnlySettings: firstGroup.admin_only_settings || false,
          requireAdminApproval: firstGroup.require_admin_approval || false,
          adminOnlyAddMember: firstGroup.admin_only_add_member || false
        })

        if (!settingsResult.success) {
          console.warn('⚠️ Erro ao aplicar configurações do grupo:', settingsResult.error)
        }
      }

      // 7. Atualizar família com novo grupo
      const updatedGroups = [...family.current_groups, newGroup.id]
      const { error: updateError } = await supabase
        .from('group_families')
        .update({
          current_groups: updatedGroups,
          updated_at: new Date().toISOString()
        })
        .eq('id', family.id)

      if (updateError) throw updateError

      // 8. Atualizar link universal com novo grupo
      const { error: linkUpdateError } = await supabase
        .from('group_links')
        .update({
          active_groups: updatedGroups,
          updated_at: new Date().toISOString()
        })
        .eq('group_family', family.id)

      if (linkUpdateError) throw linkUpdateError

      console.log('✅ Novo grupo criado automaticamente:', newGroupName)
      return { success: true, data: newGroup }

    } catch (error) {
      console.error('❌ Erro ao criar novo grupo na família:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Utilitários privados
   */
  private extractBaseName(groupName: string): string {
    try {
      // Remove números e espaços extras (ex: "faculdade 01" -> "faculdade")
      return groupName.replace(/\s+\d+$/, '').trim()
    } catch (error) {
      console.error('Erro ao extrair nome base:', error)
      return groupName
    }
  }

  private generateUniversalLink(baseName: string, familyId: string, requestUrl?: string): string {
    try {
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL
      
      // Se não tiver a variável de ambiente, tentar detectar da requisição
      if (!baseUrl && requestUrl) {
        try {
          const url = new URL(requestUrl)
          baseUrl = `${url.protocol}//${url.host}`
        } catch (urlError) {
          console.warn('Erro ao extrair URL base da requisição:', urlError)
        }
      }
      
      // Fallback para localhost se não conseguir detectar
      if (!baseUrl) {
        baseUrl = 'http://localhost:3000'
        console.warn('⚠️ Usando localhost como fallback. Configure NEXT_PUBLIC_APP_URL no Vercel.')
      }
      
      const encodedName = encodeURIComponent(baseName.toLowerCase().replace(/\s+/g, '-'))
      const universalLink = `${baseUrl}/join/${encodedName}-${familyId}`
      
      console.log('🔗 Link universal gerado:', universalLink)
      return universalLink
    } catch (error) {
      console.error('Erro ao gerar link universal:', error)
      return `http://localhost:3000/join/${baseName}-${familyId}`
    }
  }

  /**
   * Excluir grupo universal e todos os dados relacionados
   */
  async deleteUniversalGroup(
    groupId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ EXCLUINDO GRUPO UNIVERSAL E DADOS RELACIONADOS ===')
      console.log('Group ID:', groupId)
      console.log('User ID:', userId)

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      // 1. Buscar informações do grupo para identificar a família
      console.log('🔍 Buscando dados do grupo para exclusão...')
      const { data: group, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select(`
          id,
          whatsapp_id,
          name,
          group_family,
          universal_link,
          group_families (
            id,
            name,
            base_name,
            current_groups
          )
        `)
        .eq('id', groupId)
        .eq('user_id', userId)
        .single()

      if (groupError) {
        console.error('❌ Erro ao buscar grupo:', groupError)
        return { success: false, error: `Erro ao buscar grupo: ${groupError.message}` }
      }

      if (!group) {
        console.error('❌ Grupo não encontrado')
        return { success: false, error: 'Grupo não encontrado' }
      }

      console.log('📋 Dados do grupo encontrado:', {
        id: group.id,
        name: group.name,
        group_family: group.group_family,
        universal_link: group.universal_link,
        has_group_families: !!group.group_families,
        family_groups: group.group_families?.current_groups,
        family_id: group.group_families?.id
      })

      // 2. Se o grupo tem família, processar exclusão da família
      if (group.group_family && group.group_families) {
        const family = group.group_families
        const updatedGroups = family.current_groups.filter((id: string) => id !== groupId)
        
        console.log('👥 Atualizando família de grupos:', {
          family_id: family.id,
          grupos_anteriores: family.current_groups.length,
          grupos_restantes: updatedGroups.length
        })

        if (updatedGroups.length === 0) {
          // Se não há mais grupos na família, excluir a família e o link universal
          console.log('🗑️ Família vazia, excluindo família e link universal...')
          
          // Excluir link universal
          console.log('🗑️ Excluindo link universal da família:', family.id)
          const { error: linkDeleteError } = await supabase
            .from('group_links')
            .delete()
            .eq('group_family', family.id)
            .eq('user_id', userId)

          if (linkDeleteError) {
            console.error('❌ Erro ao excluir link universal:', linkDeleteError)
          } else {
            console.log('✅ Link universal excluído com sucesso')
          }

          // Excluir família
          console.log('🗑️ Excluindo família de grupos:', family.id)
          const { error: familyDeleteError } = await supabase
            .from('group_families')
            .delete()
            .eq('id', family.id)
            .eq('user_id', userId)

          if (familyDeleteError) {
            console.error('❌ Erro ao excluir família:', familyDeleteError)
          } else {
            console.log('✅ Família de grupos excluída com sucesso')
          }
        } else {
          // Atualizar lista de grupos da família
          console.log('🔄 Atualizando lista de grupos da família...')
          const { error: familyUpdateError } = await supabase
            .from('group_families')
            .update({
              current_groups: updatedGroups,
              updated_at: new Date().toISOString()
            })
            .eq('id', family.id)

          if (familyUpdateError) {
            console.error('❌ Erro ao atualizar família:', familyUpdateError)
          } else {
            console.log('✅ Família atualizada com sucesso')
          }

          // Atualizar grupos ativos no link universal
          const { data: currentLink } = await supabase
            .from('group_links')
            .select('active_groups')
            .eq('group_family', family.id)
            .single()

          if (currentLink) {
            const updatedActiveGroups = currentLink.active_groups.filter((id: string) => id !== groupId)
            const { error: linkUpdateError } = await supabase
              .from('group_links')
              .update({
                active_groups: updatedActiveGroups,
                updated_at: new Date().toISOString()
              })
              .eq('group_family', family.id)

            if (linkUpdateError) {
              console.error('❌ Erro ao atualizar link universal:', linkUpdateError)
            } else {
              console.log('✅ Link universal atualizado')
            }
          }
        }
      }

      // 3. Excluir o grupo principal
      console.log('🗑️ Excluindo grupo principal...')
      const { error: groupDeleteError } = await supabase
        .from('whatsapp_groups')
        .delete()
        .eq('id', groupId)
        .eq('user_id', userId)

      if (groupDeleteError) {
        console.error('❌ Erro ao excluir grupo:', groupDeleteError)
        return { success: false, error: 'Erro ao excluir grupo' }
      }

      console.log('✅ Grupo universal excluído com sucesso!')
      return { success: true }

    } catch (error: any) {
      console.error('❌ Erro na exclusão do grupo universal:', error)
      return { 
        success: false, 
        error: error.message || 'Erro interno na exclusão' 
      }
    }
  }

  /**
   * Sincronizar participantes de um grupo com o WhatsApp
   * Detecta automaticamente quem saiu do grupo
   */
  async syncGroupParticipants(
    groupId: string,
    userId: string,
    options: { 
      autoSync?: boolean,
      forceUpdate?: boolean,
      createNotifications?: boolean 
    } = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🔄 SINCRONIZANDO PARTICIPANTES DO GRUPO ===')
      console.log('Group ID:', groupId)
      console.log('User ID:', userId)

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      // 1. Buscar dados do grupo
      const { data: group, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('id', groupId)
        .eq('user_id', userId)
        .single()

      if (groupError || !group) {
        console.error('❌ Grupo não encontrado:', groupError)
        return { success: false, error: 'Grupo não encontrado' }
      }

      if (!group.whatsapp_id) {
        console.error('❌ Grupo não tem whatsapp_id')
        return { success: false, error: 'Grupo não está conectado ao WhatsApp' }
      }

      console.log('📋 Dados do grupo:', {
        name: group.name,
        whatsapp_id: group.whatsapp_id,
        participants_count: group.participants?.length || 0
      })

      // 2. Obter participantes reais do WhatsApp via Z-API
      const zApiClient = await this.getZApiClient()
      const participantsResult = await zApiClient.getGroupParticipants(group.whatsapp_id)

      if (!participantsResult.success) {
        console.error('❌ Erro ao obter participantes do WhatsApp:', participantsResult.error)
        return { success: false, error: participantsResult.error }
      }

      const realParticipants = participantsResult.data?.participants || []
      const realParticipantPhones = realParticipants.map((p: any) => p.phone || p.id).filter(Boolean)

      console.log('📱 Participantes reais do WhatsApp:', {
        count: realParticipantPhones.length,
        phones: realParticipantPhones
      })

      // 3. Comparar com participantes no banco
      const dbParticipants = group.participants || []
      const participantsWhoLeft = dbParticipants.filter((phone: string) => 
        !realParticipantPhones.includes(phone)
      )
      const newParticipants = realParticipantPhones.filter((phone: string) => 
        !dbParticipants.includes(phone)
      )

      console.log('🔍 Análise de diferenças:', {
        db_count: dbParticipants.length,
        whatsapp_count: realParticipantPhones.length,
        left: participantsWhoLeft,
        new: newParticipants
      })

      // 4. Atualizar banco de dados se houver diferenças
      if (participantsWhoLeft.length > 0 || newParticipants.length > 0) {
        console.log('🔄 Atualizando participantes no banco de dados...')
        
        const { error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({
            participants: realParticipantPhones,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId)

        if (updateError) {
          console.error('❌ Erro ao atualizar participantes:', updateError)
          return { success: false, error: 'Erro ao atualizar participantes no banco' }
        }

        console.log('✅ Participantes atualizados no banco de dados')

        // 4.1. Criar notificações se habilitado
        if (options.createNotifications !== false) {
          await this.createParticipantChangeNotifications(
            supabase,
            group,
            participantsWhoLeft,
            newParticipants,
            userId
          )
        }
      } else {
        console.log('✅ Participantes já estão sincronizados')
      }

      // 5. Se é grupo universal, atualizar contadores da família
      if (group.group_family) {
        console.log('🔗 Atualizando contadores da família de grupos...')
        await this.updateParticipantCounters(group.group_family, groupId)
      }

      return {
        success: true,
        data: {
          groupId: group.id,
          groupName: group.name,
          previousCount: dbParticipants.length,
          currentCount: realParticipantPhones.length,
          participantsWhoLeft,
          newParticipants,
          realParticipants: realParticipantPhones
        }
      }

    } catch (error: any) {
      console.error('❌ Erro na sincronização de participantes:', error)
      return { 
        success: false, 
        error: error.message || 'Erro interno na sincronização' 
      }
    }
  }

  /**
   * Criar notificações quando participantes saem ou entram
   */
  private async createParticipantChangeNotifications(
    supabase: any,
    group: any,
    participantsWhoLeft: string[],
    newParticipants: string[],
    userId: string
  ): Promise<void> {
    try {
      console.log('🔔 Criando notificações de mudanças de participantes...')

      // Notificações para quem saiu
      for (const phone of participantsWhoLeft) {
        const { error: leftError } = await supabase
          .from('group_notifications')
          .insert({
            group_id: group.id,
            user_id: userId,
            type: 'member_removed',
            title: 'Participante saiu do grupo',
            message: `O usuário ${phone} saiu do grupo "${group.name}".`,
            data: {
              participant_phone: phone,
              group_whatsapp_id: group.whatsapp_id,
              group_name: group.name,
              timestamp: Date.now(),
              sync_type: 'automatic'
            }
          })

        if (leftError) {
          console.error('❌ Erro ao criar notificação de saída:', leftError)
        } else {
          console.log(`✅ Notificação criada: ${phone} saiu do grupo`)
        }
      }

      // Notificações para quem entrou
      for (const phone of newParticipants) {
        const { error: joinedError } = await supabase
          .from('group_notifications')
          .insert({
            group_id: group.id,
            user_id: userId,
            type: 'member_added',
            title: 'Novo participante no grupo',
            message: `O usuário ${phone} entrou no grupo "${group.name}".`,
            data: {
              participant_phone: phone,
              group_whatsapp_id: group.whatsapp_id,
              group_name: group.name,
              timestamp: Date.now(),
              sync_type: 'automatic'
            }
          })

        if (joinedError) {
          console.error('❌ Erro ao criar notificação de entrada:', joinedError)
        } else {
          console.log(`✅ Notificação criada: ${phone} entrou no grupo`)
        }
      }

    } catch (error) {
      console.error('❌ Erro ao criar notificações:', error)
    }
  }

  /**
   * Sincronização automática de todos os grupos do usuário
   */
  async autoSyncAllGroups(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🔄 SINCRONIZAÇÃO AUTOMÁTICA DE TODOS OS GRUPOS ===')
      console.log('User ID:', userId)

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      // Buscar todos os grupos do usuário
      const { data: groups, error: groupsError } = await supabase
        .from('whatsapp_groups')
        .select('id, name, whatsapp_id, group_family')
        .eq('user_id', userId)
        .not('whatsapp_id', 'is', null)

      if (groupsError) {
        console.error('❌ Erro ao buscar grupos:', groupsError)
        return { success: false, error: 'Erro ao buscar grupos' }
      }

      if (!groups || groups.length === 0) {
        console.log('ℹ️ Nenhum grupo encontrado para sincronizar')
        return { success: true, data: { syncedGroups: 0, message: 'Nenhum grupo para sincronizar' } }
      }

      console.log(`📋 Encontrados ${groups.length} grupos para sincronizar`)

      const results = []
      let totalChanges = 0

      // Sincronizar cada grupo
      for (const group of groups) {
        console.log(`🔄 Sincronizando grupo: ${group.name} (${group.id})`)
        
        const syncResult = await this.syncGroupParticipants(
          group.id,
          userId,
          { 
            autoSync: true,
            createNotifications: true 
          }
        )

        if (syncResult.success && syncResult.data) {
          const changes = (syncResult.data.participantsWhoLeft?.length || 0) + 
                         (syncResult.data.newParticipants?.length || 0)
          totalChanges += changes
          
          results.push({
            groupId: group.id,
            groupName: group.name,
            success: true,
            changes: changes,
            data: syncResult.data
          })
        } else {
          results.push({
            groupId: group.id,
            groupName: group.name,
            success: false,
            error: syncResult.error
          })
        }
      }

      console.log(`✅ Sincronização automática concluída: ${totalChanges} mudanças em ${groups.length} grupos`)

      return {
        success: true,
        data: {
          totalGroups: groups.length,
          totalChanges,
          results,
          timestamp: new Date().toISOString()
        }
      }

    } catch (error: any) {
      console.error('❌ Erro na sincronização automática:', error)
      return { 
        success: false, 
        error: error.message || 'Erro interno na sincronização automática' 
      }
    }
  }

  private async checkBlacklist(phone: string, userId: string): Promise<boolean> {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      console.log('🔍 Verificando blacklist para:', { phone, userId })
      
      const { data, error } = await supabase
        .from('blacklist')
        .select('id')
        .eq('phone', phone)
        .eq('user_id', userId)
        .single()

      if (error) {
        // Se não encontrou registro, não está na blacklist
        if (error.code === 'PGRST116') {
          console.log('✅ Número não está na blacklist')
          return false
        }
        console.error('Erro ao verificar blacklist:', error)
        return false
      }

      const isBlacklisted = !!data
      console.log(isBlacklisted ? '❌ Número está na blacklist' : '✅ Número não está na blacklist')
      return isBlacklisted
    } catch (error) {
      console.error('Erro ao verificar blacklist:', error)
      return false
    }
  }

  private async checkDuplicateInFamily(phone: string, groups: any[]): Promise<boolean> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      console.log('🔍 Verificando duplicatas em', groups.length, 'grupos')
      
      for (const group of groups) {
        console.log(`Grupo ${group.name}:`, group.participants)
        if (group.participants && group.participants.includes(phone)) {
          console.log(`❌ Número ${phone} encontrado no grupo ${group.name}`)
          return true
        }
      }
      
      console.log(`✅ Número ${phone} não encontrado em nenhum grupo da família`)
      return false
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error)
      return false
    }
  }

  private async findAvailableGroup(groups: any[]): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      console.log('🔍 BUSCANDO GRUPO COM VAGA DISPONÍVEL ===')
      console.log('Total de grupos na família:', groups.length)
      
      // 1. Primeiro, verificar se há grupos com vagas liberadas
      const groupsWithSpace = groups.filter(group => {
        const hasSpace = group.participants.length < 2 // LIMITE TEMPORÁRIO: 2 participantes
        console.log(`Grupo ${group.name}: ${group.participants.length}/2 participantes - ${hasSpace ? 'TEM VAGA' : 'CHEIO'}`)
        return hasSpace
      })
      
      if (groupsWithSpace.length > 0) {
        // 2. Ordenar por número de participantes (menor primeiro) para preencher grupos mais vazios
        const sortedGroups = groupsWithSpace.sort((a, b) => a.participants.length - b.participants.length)
        const targetGroup = sortedGroups[0]
        console.log(`✅ VAGA ENCONTRADA no grupo: ${targetGroup.name} (${targetGroup.participants.length}/2 participantes)`)
        return targetGroup
      }
      
      // 3. Se não há vagas, retornar null para criar novo grupo
      console.log('❌ NENHUMA VAGA DISPONÍVEL - será criado novo grupo')
      return null
    } catch (error) {
      console.error('Erro ao encontrar grupo disponível:', error)
      return null
    }
  }

  /**
   * Detecta e corrige vagas liberadas nos grupos da família
   */
  private async detectAndFixVacantSpots(familyId: string): Promise<void> {
    try {
      console.log('🔍 DETECTANDO VAGAS LIBERADAS ===')
      
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      // 1. Buscar todos os grupos da família
      const { data: family, error: familyError } = await supabase
        .from('group_families')
        .select(`
          *,
          whatsapp_groups (
            id,
            whatsapp_id,
            name,
            description,
            image_url,
            participants,
            user_id,
            admin_only_message,
            admin_only_settings,
            require_admin_approval,
            admin_only_add_member
          )
        `)
        .eq('id', familyId)
        .single()

      if (familyError || !family) {
        console.error('Erro ao buscar família:', familyError)
        return
      }

      // 2. Verificar cada grupo para detectar vagas
      for (const group of family.whatsapp_groups) {
        const currentParticipants = group.participants || []
        const maxParticipants = 2 // LIMITE TEMPORÁRIO
        const availableSpots = maxParticipants - currentParticipants.length
        
        if (availableSpots > 0) {
          console.log(`✅ VAGA DETECTADA no grupo ${group.name}: ${availableSpots} vaga(s) disponível(is)`)
        } else {
          console.log(`❌ Grupo ${group.name} está cheio: ${currentParticipants.length}/${maxParticipants}`)
        }
      }
      
    } catch (error) {
      console.error('Erro ao detectar vagas liberadas:', error)
    }
  }

  private async updateParticipantCounters(linkId: string, groupId: string): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
    try {
      // TODO: Implementar contadores de participantes
      console.log('Contadores de participantes não implementados ainda')
    } catch (error) {
      console.error('Erro ao atualizar contadores:', error)
    }
  }
}
