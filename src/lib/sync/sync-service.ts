'use client'

import { ZApiClient, ZApiGroup, ZApiCommunity, ZApiGroupParticipant, ZApiCommunityMember } from '@/lib/z-api/client'
import { createClient } from '@/lib/supabase/client'

export interface SyncResult {
  success: boolean
  data?: any
  error?: string
  stats?: {
    created: number
    updated: number
    deleted: number
    errors: number
  }
}

export interface SyncOptions {
  forceUpdate?: boolean
  includeParticipants?: boolean
  includeAdmins?: boolean
  includeMessages?: boolean
  batchSize?: number
}

export class SyncService {
  private zApiClient: ZApiClient
  private supabase: any

  constructor(zApiClient: ZApiClient) {
    this.zApiClient = zApiClient
    this.supabase = createClient()
  }

  // ===== SINCRONIZAÇÃO BIDIRECIONAL DE GRUPOS =====

  /**
   * Sincroniza grupos do WhatsApp para o banco de dados
   */
  async syncGroupsFromWhatsApp(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }
      const syncedGroups = []

      // Obter grupos do WhatsApp via Z-API
      const whatsappGroupsResponse = await this.zApiClient.getAllGroups()
      
      if (!whatsappGroupsResponse.success) {
        throw new Error(whatsappGroupsResponse.error || 'Erro ao obter grupos do WhatsApp')
      }

      const whatsappGroups = whatsappGroupsResponse.data as ZApiGroup[] || []

      // Obter grupos do banco de dados
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: dbGroups } = await this.supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', user.id)

      // Processar cada grupo do WhatsApp
      for (const whatsappGroup of whatsappGroups) {
        try {
          const existingGroup = dbGroups?.find(g => g.whatsapp_id === whatsappGroup.id)

          if (existingGroup) {
            // Atualizar grupo existente
            const updatedGroup = await this.updateGroupInDatabase(existingGroup.id, whatsappGroup, options)
            if (updatedGroup) {
              syncedGroups.push(updatedGroup)
              stats.updated++
            }
          } else {
            // Criar novo grupo
            const newGroup = await this.createGroupInDatabase(whatsappGroup, user.id, options)
            if (newGroup) {
              syncedGroups.push(newGroup)
              stats.created++
            }
          }
        } catch (error) {
          console.error(`Erro ao processar grupo ${whatsappGroup.id}:`, error)
          stats.errors++
        }
      }

      // Verificar grupos que foram removidos do WhatsApp
      if (options.forceUpdate) {
        const whatsappGroupIds = whatsappGroups.map(g => g.id)
        const removedGroups = dbGroups?.filter(g => 
          g.whatsapp_id && !whatsappGroupIds.includes(g.whatsapp_id)
        ) || []

        for (const removedGroup of removedGroups) {
          try {
            await this.supabase
              .from('whatsapp_groups')
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', removedGroup.id)
            
            stats.deleted++
          } catch (error) {
            console.error(`Erro ao desativar grupo ${removedGroup.id}:`, error)
            stats.errors++
          }
        }
      }

      return {
        success: true,
        data: syncedGroups,
        stats
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      }
    }
  }

  /**
   * Sincroniza grupos do banco de dados para o WhatsApp
   */
  async syncGroupsToWhatsApp(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }
      const syncedGroups = []

      // Obter grupos do banco de dados
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: dbGroups } = await this.supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Obter grupos do WhatsApp via Z-API
      const whatsappGroupsResponse = await this.zApiClient.getAllGroups()
      const whatsappGroups = whatsappGroupsResponse.success 
        ? (whatsappGroupsResponse.data as ZApiGroup[] || [])
        : []

      // Processar cada grupo do banco de dados
      for (const dbGroup of dbGroups || []) {
        try {
          const whatsappGroup = whatsappGroups.find(g => g.id === dbGroup.whatsapp_id)

          if (!whatsappGroup) {
            // Grupo não existe no WhatsApp, criar
            const newGroup = await this.createGroupInWhatsApp(dbGroup)
            if (newGroup) {
              syncedGroups.push(newGroup)
              stats.created++
            }
          } else {
            // Verificar se precisa atualizar
            if (this.shouldUpdateGroup(dbGroup, whatsappGroup)) {
              const updatedGroup = await this.updateGroupInWhatsApp(dbGroup, whatsappGroup)
              if (updatedGroup) {
                syncedGroups.push(updatedGroup)
                stats.updated++
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar grupo ${dbGroup.id}:`, error)
          stats.errors++
        }
      }

      return {
        success: true,
        data: syncedGroups,
        stats
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      }
    }
  }

  // ===== SINCRONIZAÇÃO DE COMUNIDADES =====

  /**
   * Sincroniza comunidades do WhatsApp para o banco de dados
   */
  async syncCommunitiesFromWhatsApp(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }
      const syncedCommunities = []

      // Obter comunidades do WhatsApp via Z-API
      const whatsappCommunitiesResponse = await this.zApiClient.getCommunities()
      
      if (!whatsappCommunitiesResponse.success) {
        throw new Error(whatsappCommunitiesResponse.error || 'Erro ao obter comunidades do WhatsApp')
      }

      const whatsappCommunities = whatsappCommunitiesResponse.data?.communities as ZApiCommunity[] || []

      // Obter comunidades do banco de dados
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: dbCommunities } = await this.supabase
        .from('whatsapp_communities')
        .select('*')
        .eq('user_id', user.id)

      // Processar cada comunidade do WhatsApp
      for (const whatsappCommunity of whatsappCommunities) {
        try {
          const existingCommunity = dbCommunities?.find(c => c.whatsapp_community_id === whatsappCommunity.id)

          if (existingCommunity) {
            // Atualizar comunidade existente
            const updatedCommunity = await this.updateCommunityInDatabase(existingCommunity.id, whatsappCommunity, options)
            if (updatedCommunity) {
              syncedCommunities.push(updatedCommunity)
              stats.updated++
            }
          } else {
            // Criar nova comunidade
            const newCommunity = await this.createCommunityInDatabase(whatsappCommunity, user.id, options)
            if (newCommunity) {
              syncedCommunities.push(newCommunity)
              stats.created++
            }
          }
        } catch (error) {
          console.error(`Erro ao processar comunidade ${whatsappCommunity.id}:`, error)
          stats.errors++
        }
      }

      return {
        success: true,
        data: syncedCommunities,
        stats
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      }
    }
  }

  // ===== SINCRONIZAÇÃO DE PARTICIPANTES =====

  /**
   * Sincroniza participantes de um grupo específico
   */
  async syncGroupParticipants(groupId: string, options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }

      // Obter participantes do WhatsApp via Z-API
      const participantsResponse = await this.zApiClient.getGroupParticipants(groupId)
      
      if (!participantsResponse.success) {
        throw new Error(participantsResponse.error || 'Erro ao obter participantes do grupo')
      }

      const whatsappParticipants = participantsResponse.data?.participants as ZApiGroupParticipant[] || []

      // Obter grupo do banco de dados
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: group } = await this.supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!group) {
        throw new Error('Grupo não encontrado')
      }

      // Atualizar lista de participantes no banco
      const participantPhones = whatsappParticipants.map(p => p.phone)
      
      const { error: updateError } = await this.supabase
        .from('whatsapp_groups')
        .update({
          participants: participantPhones,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (updateError) {
        throw new Error('Erro ao atualizar participantes no banco de dados')
      }

      stats.updated = 1

      return {
        success: true,
        data: { groupId, participants: whatsappParticipants },
        stats
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      }
    }
  }

  // ===== SINCRONIZAÇÃO DE ADMINISTRADORES =====

  /**
   * Sincroniza administradores de um grupo específico
   */
  async syncGroupAdmins(groupId: string, options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }

      // Obter administradores do WhatsApp via Z-API
      const adminsResponse = await this.zApiClient.getGroupAdmins(groupId)
      
      if (!adminsResponse.success) {
        throw new Error(adminsResponse.error || 'Erro ao obter administradores do grupo')
      }

      const whatsappAdmins = adminsResponse.data?.admins as ZApiGroupParticipant[] || []

      // Obter grupo do banco de dados
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: group } = await this.supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!group) {
        throw new Error('Grupo não encontrado')
      }

      // Atualizar lista de administradores no banco
      const adminPhones = whatsappAdmins.map(a => a.phone)
      
      const { error: updateError } = await this.supabase
        .from('whatsapp_groups')
        .update({
          admins: adminPhones,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (updateError) {
        throw new Error('Erro ao atualizar administradores no banco de dados')
      }

      stats.updated = 1

      return {
        success: true,
        data: { groupId, admins: whatsappAdmins },
        stats
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      }
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  private async createGroupInDatabase(whatsappGroup: ZApiGroup, userId: string, options: SyncOptions) {
    const { data, error } = await this.supabase
      .from('whatsapp_groups')
      .insert({
        name: whatsappGroup.name,
        whatsapp_id: whatsappGroup.id,
        description: whatsappGroup.description,
        participants: whatsappGroup.participants.map(p => p.phone),
        admins: whatsappGroup.admins.map(a => a.phone),
        user_id: userId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar grupo no banco:', error)
      return null
    }

    return data
  }

  private async updateGroupInDatabase(groupId: string, whatsappGroup: ZApiGroup, options: SyncOptions) {
    const updateData: any = {
      name: whatsappGroup.name,
      description: whatsappGroup.description,
      updated_at: new Date().toISOString()
    }

    if (options.includeParticipants) {
      updateData.participants = whatsappGroup.participants.map(p => p.phone)
    }

    if (options.includeAdmins) {
      updateData.admins = whatsappGroup.admins.map(a => a.phone)
    }

    const { data, error } = await this.supabase
      .from('whatsapp_groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar grupo no banco:', error)
      return null
    }

    return data
  }

  private async createCommunityInDatabase(whatsappCommunity: ZApiCommunity, userId: string, options: SyncOptions) {
    const { data, error } = await this.supabase
      .from('whatsapp_communities')
      .insert({
        name: whatsappCommunity.name,
        whatsapp_community_id: whatsappCommunity.id,
        description: whatsappCommunity.description,
        image_url: whatsappCommunity.imageUrl,
        announcement_group_id: whatsappCommunity.announcementGroupId,
        created_by: userId,
        user_id: userId,
        is_active: true,
        settings: {
          allow_member_invites: whatsappCommunity.settings.allowMemberInvites,
          require_admin_approval: whatsappCommunity.settings.requireAdminApproval,
          max_groups: whatsappCommunity.settings.maxGroups,
          allow_announcements: whatsappCommunity.settings.allowAnnouncements
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar comunidade no banco:', error)
      return null
    }

    return data
  }

  private async updateCommunityInDatabase(communityId: string, whatsappCommunity: ZApiCommunity, options: SyncOptions) {
    const updateData: any = {
      name: whatsappCommunity.name,
      description: whatsappCommunity.description,
      image_url: whatsappCommunity.imageUrl,
      announcement_group_id: whatsappCommunity.announcementGroupId,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('whatsapp_communities')
      .update(updateData)
      .eq('id', communityId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar comunidade no banco:', error)
      return null
    }

    return data
  }

  private async createGroupInWhatsApp(dbGroup: any) {
    try {
      const response = await this.zApiClient.createGroup({
        name: dbGroup.name,
        description: dbGroup.description,
        participants: dbGroup.participants || []
      })

      if (response.success) {
        // Atualizar o grupo no banco com o ID do WhatsApp
        await this.supabase
          .from('whatsapp_groups')
          .update({
            whatsapp_id: response.data?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbGroup.id)

        return response.data
      }

      return null
    } catch (error) {
      console.error('Erro ao criar grupo no WhatsApp:', error)
      return null
    }
  }

  private async updateGroupInWhatsApp(dbGroup: any, whatsappGroup: ZApiGroup) {
    try {
      // Verificar se o nome mudou
      if (dbGroup.name !== whatsappGroup.name) {
        await this.zApiClient.updateGroupName(whatsappGroup.id, dbGroup.name)
      }

      // Verificar se a descrição mudou
      if (dbGroup.description !== whatsappGroup.description) {
        await this.zApiClient.updateGroupDescription(whatsappGroup.id, dbGroup.description)
      }

      return whatsappGroup
    } catch (error) {
      console.error('Erro ao atualizar grupo no WhatsApp:', error)
      return null
    }
  }

  private shouldUpdateGroup(dbGroup: any, whatsappGroup: ZApiGroup): boolean {
    return (
      dbGroup.name !== whatsappGroup.name ||
      dbGroup.description !== whatsappGroup.description
    )
  }
}
