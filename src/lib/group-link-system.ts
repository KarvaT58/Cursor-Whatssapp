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

      // 4. Criar registro do link universal
      const { data: groupLink, error: linkError } = await supabase
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
              participants,
              user_id
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
        .select('id, whatsapp_id, name, participants, user_id')
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

      // 6. Adicionar participante ao grupo
      const zApiClient = await this.getZApiClient()
      const addResult = await zApiClient.addGroupParticipants(
        targetGroup.whatsapp_id,
        [participantPhone]
      )

      if (!addResult.success) {
        return { success: false, error: addResult.error }
      }

      // 7. Atualizar lista de participantes no banco
      const updatedParticipants = [...(targetGroup.participants || []), participantPhone]
      const { error: updateError } = await supabase
        .from('whatsapp_groups')
        .update({ 
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetGroup.id)

      if (updateError) {
        console.warn('⚠️ Erro ao atualizar participantes no banco:', updateError)
      } else {
        console.log('✅ Participante adicionado ao banco:', participantPhone)
      }

      // 8. Atualizar contadores (desabilitado temporariamente)
      // await this.updateParticipantCounters(groupLink.id, targetGroup.id)

      console.log('✅ Participante adicionado via link universal')
      return { 
        success: true, 
        data: { 
          groupId: targetGroup.id,
          groupName: targetGroup.name,
          participantPhone: participantPhone
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

      const { data: family, error: familyError } = await supabase
        .from('group_families')
        .select(`
          *,
          whatsapp_groups (
            id,
            whatsapp_id,
            name,
            participants,
            user_id
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

      // 3. Criar grupo no WhatsApp via Z-API
      const zApiClient = await this.getZApiClient()
      
      // Incluir AMBOS os números: o fixo do sistema e o conectado no Z-API
      const defaultSystemPhone = '554584154115' // Número padrão do sistema
      const finalSystemPhone = systemPhone || defaultSystemPhone
      const zApiPhone = '554598228660'   // Número conectado no Z-API
      const initialParticipants = [finalSystemPhone, zApiPhone]
      
      const createResult = await zApiClient.createGroup({
        name: newGroupName,
        description: firstGroup.description || '',
        participants: initialParticipants, // Adicionar ambos os números
        imageUrl: firstGroup.image_url || undefined
      })
      
      if (!createResult.success) {
        return { success: false, error: createResult.error }
      }

      console.log('✅ Grupo criado no WhatsApp:', createResult.data)

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
            participants,
            user_id
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
