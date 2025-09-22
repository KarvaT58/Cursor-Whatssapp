import { ZApiClient, ZApiGroup, ZApiCommunity, ZApiGroupParticipant, ZApiCommunityMember } from '@/lib/z-api/client'
import { createClient } from '@/lib/supabase/server'

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

export class SyncServiceServer {
  private zApiClient: ZApiClient
  private userId: string

  constructor(zApiClient: ZApiClient, userId: string) {
    this.zApiClient = zApiClient
    this.userId = userId
  }

  private async getSupabase() {
    return await createClient()
  }

  // ===== SINCRONIZAÇÃO BIDIRECIONAL DE GRUPOS =====

  /**
   * Sincroniza grupos do WhatsApp para o banco de dados
   */
  async syncGroupsFromWhatsApp(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      console.log('=== INÍCIO DA SINCRONIZAÇÃO DE GRUPOS ===')
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }
      const syncedGroups = []

      // Obter grupos do WhatsApp via Z-API
      console.log('Buscando grupos do WhatsApp via Z-API...')
      const whatsappGroupsResponse = await this.zApiClient.getAllGroups()
      console.log('Resposta da Z-API para grupos:', whatsappGroupsResponse)
      
      if (!whatsappGroupsResponse.success) {
        throw new Error(whatsappGroupsResponse.error || 'Erro ao obter grupos do WhatsApp')
      }

      // A Z-API retorna os grupos diretamente no array data, não em data.groups
      const zApiGroups = whatsappGroupsResponse.data as any[] || []

      // Mapear dados da Z-API para o formato esperado
      const whatsappGroups = zApiGroups.map(group => ({
        id: group.phone, // Z-API usa 'phone' como ID do grupo
        name: group.name,
        description: group.about || '',
        participants: [], // Será preenchido posteriormente se necessário
        admins: [], // Será preenchido posteriormente se necessário
        createdAt: new Date(parseInt(group.lastMessageTime)).toISOString(),
        updatedAt: new Date(parseInt(group.lastMessageTime)).toISOString()
      }))

      // Obter grupos do banco de dados
      const supabase = await this.getSupabase()
      const { data: dbGroups } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', this.userId)

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
            const newGroup = await this.createGroupInDatabase(whatsappGroup, options)
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
        // Como não há campo is_active, vamos apenas marcar como atualizado
        const supabase = await this.getSupabase()
        await supabase
          .from('whatsapp_groups')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', removedGroup.id)
            
            stats.deleted++
          } catch (error) {
            console.error(`Erro ao atualizar grupo ${removedGroup.id}:`, error)
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
      const supabase = await this.getSupabase()
      const { data: dbGroups } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', this.userId)

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

  // ===== SINCRONIZAÇÃO DE PARTICIPANTES =====

  /**
   * Sincroniza participantes de um grupo específico
   */
  async syncGroupParticipants(groupId: string, options: SyncOptions = {}): Promise<SyncResult> {
    try {
      const stats = { created: 0, updated: 0, deleted: 0, errors: 0 }

      // Obter grupo do banco de dados primeiro para pegar o whatsapp_id
      const supabase = await this.getSupabase()
      const { data: group } = await supabase
        .from('whatsapp_groups')
        .select('whatsapp_id')
        .eq('id', groupId)
        .eq('user_id', this.userId)
        .single()

      if (!group || !group.whatsapp_id) {
        throw new Error('Grupo não encontrado ou sem whatsapp_id')
      }

      // Obter participantes do WhatsApp via Z-API usando o whatsapp_id
      const participantsResponse = await this.zApiClient.getGroupParticipants(group.whatsapp_id)
      
      if (!participantsResponse.success) {
        throw new Error(participantsResponse.error || 'Erro ao obter participantes do grupo')
      }

      const whatsappParticipants = participantsResponse.data?.participants as ZApiGroupParticipant[] || []

      // Buscar dados completos do grupo
      const { data: fullGroup } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('id', groupId)
        .eq('user_id', this.userId)
        .single()

      if (!fullGroup) {
        throw new Error('Grupo não encontrado')
      }

      // Atualizar lista de participantes no banco
      const participantPhones = whatsappParticipants.map(p => p.phone)
      
      const { error: updateError } = await supabase
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

  // ===== MÉTODOS AUXILIARES =====

  private async createGroupInDatabase(whatsappGroup: ZApiGroup, options: SyncOptions) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('whatsapp_groups')
      .insert({
        name: whatsappGroup.name,
        whatsapp_id: whatsappGroup.id,
        description: whatsappGroup.description,
        participants: whatsappGroup.participants.map(p => p.phone),
        user_id: this.userId,
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
    const supabase = await this.getSupabase()
    const updateData: any = {
      name: whatsappGroup.name,
      description: whatsappGroup.description,
      updated_at: new Date().toISOString()
    }

    if (options.includeParticipants) {
      updateData.participants = whatsappGroup.participants.map(p => p.phone)
    }

    const { data, error } = await supabase
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
