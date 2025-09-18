import { createClient } from '@/lib/supabase/client'

export interface ZApiInstance {
  id: string
  user_id: string
  instance_id: string
  instance_token: string
  client_token: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ZApiMessage {
  phone: string
  message: string
  type?: 'text' | 'image' | 'document' | 'audio'
  mediaUrl?: string
  fileName?: string
}

export interface ZApiGroup {
  id: string
  name: string
  description?: string
  imageUrl?: string
  inviteLink?: string
  inviteLinkExpiresAt?: string
  maxParticipants: number
  isCommunityGroup: boolean
  communityId?: string
  settings: ZApiGroupSettings
  participants: ZApiGroupParticipant[]
  admins: ZApiGroupParticipant[]
  createdAt: string
  updatedAt: string
}

export interface ZApiGroupSettings {
  allowMemberInvites: boolean
  allowMemberMessages: boolean
  allowMemberMedia: boolean
  allowMemberPolls: boolean
  requireAdminApproval: boolean
  muteNotifications: boolean
}

export interface ZApiGroupParticipant {
  id: string
  phone: string
  name?: string
  isAdmin: boolean
  isCreator: boolean
  joinedAt: string
  leftAt?: string
  status: 'active' | 'pending' | 'banned'
}

export interface ZApiGroupMessage {
  id: string
  groupId: string
  senderPhone: string
  content: string
  messageType: 'text' | 'image' | 'document' | 'audio' | 'poll'
  whatsappMessageId?: string
  replyToMessageId?: string
  isAnnouncement: boolean
  isDeleted: boolean
  deletedBy?: string
  deletedAt?: string
  createdAt: string
}

export interface ZApiGroupStats {
  totalMessages: number
  totalParticipants: number
  totalAdmins: number
  messagesToday: number
  messagesThisWeek: number
  messagesThisMonth: number
  lastActivity: string
}

export interface ZApiCommunity {
  id: string
  name: string
  description?: string
  imageUrl?: string
  whatsappCommunityId?: string
  announcementGroupId?: string
  maxGroups: number
  settings: ZApiCommunitySettings
  groups: ZApiCommunityGroup[]
  members: ZApiCommunityMember[]
  createdAt: string
  updatedAt: string
}

export interface ZApiCommunitySettings {
  allowMemberInvites: boolean
  requireAdminApproval: boolean
  maxGroups: number
  allowAnnouncements: boolean
}

export interface ZApiCommunityGroup {
  id: string
  communityId: string
  groupId: string
  addedBy: string
  addedAt: string
  isAnnouncementGroup: boolean
  group?: ZApiGroup
}

export interface ZApiCommunityMember {
  id: string
  communityId: string
  phone: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  invitedBy?: string
  isActive: boolean
}

export interface ZApiCommunityAnnouncement {
  id: string
  communityId: string
  sentBy: string
  content: string
  type: 'text' | 'image' | 'document'
  sentAt: string
  recipientsCount: number
  status: 'pending' | 'sent' | 'failed'
}

export interface ZApiCommunityStats {
  totalGroups: number
  totalMembers: number
  activeMembers: number
  announcementGroups: number
  totalAnnouncements: number
  announcementsToday: number
  announcementsThisWeek: number
  announcementsThisMonth: number
  lastActivity: string
}

export interface ZApiResponse {
  success: boolean
  message?: string
  data?: Record<string, unknown>
  error?: string
}

export class ZApiClient {
  private instanceId: string
  private instanceToken: string
  private clientToken: string
  private baseUrl: string

  constructor(instanceId: string, instanceToken: string, clientToken: string) {
    this.instanceId = instanceId
    this.instanceToken = instanceToken
    this.clientToken = clientToken
    this.baseUrl = process.env.Z_API_URL || 'https://api.z-api.io'
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Client-Token': this.clientToken,
    }
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: Record<string, unknown>
  ): Promise<ZApiResponse> {
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}${endpoint}`
      
      console.log('Z-API Request:', {
        url,
        method,
        data,
        instanceId: this.instanceId,
        instanceToken: this.instanceToken.substring(0, 10) + '...',
        clientToken: this.clientToken.substring(0, 10) + '...'
      })

      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      console.log('Z-API Response Status:', response.status)
      const result = await response.json()
      console.log('Z-API Response:', result)

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `Erro na requisição Z-API (${response.status})`,
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error('Z-API Request Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  // Verificar status da instância
  async getInstanceStatus(): Promise<ZApiResponse> {
    return this.makeRequest('/status')
  }

  // Verificar status (alias para getInstanceStatus)
  async getStatus(): Promise<ZApiResponse> {
    return this.getInstanceStatus()
  }

  // Enviar mensagem de texto
  async sendTextMessage(phone: string, message: string): Promise<ZApiResponse> {
    return this.makeRequest('/send-text', 'POST', {
      phone,
      message,
    })
  }

  // Enviar mensagem (método genérico)
  async sendMessage(messageData: {
    phone: string
    message: string
    type?: 'text' | 'image' | 'document' | 'audio'
    mediaUrl?: string
    fileName?: string
  }): Promise<ZApiResponse> {
    const { phone, message, type = 'text', mediaUrl, fileName } = messageData

    if (type === 'text') {
      return this.sendTextMessage(phone, message)
    } else if (type === 'image' && mediaUrl) {
      return this.sendImageMessage(phone, message, mediaUrl)
    } else if (type === 'document' && mediaUrl && fileName) {
      return this.sendDocumentMessage(phone, message, mediaUrl, fileName)
    } else if (type === 'audio' && mediaUrl) {
      return this.sendAudioMessage(phone, mediaUrl)
    } else {
      return {
        success: false,
        error: 'Tipo de mensagem não suportado ou parâmetros inválidos',
      }
    }
  }

  // Enviar mensagem com mídia
  async sendMediaMessage(
    phone: string,
    message: string,
    mediaUrl: string,
    fileName?: string
  ): Promise<ZApiResponse> {
    return this.makeRequest('/send-media', 'POST', {
      phone,
      message,
      mediaUrl,
      fileName,
    })
  }

  // Enviar mensagem de imagem
  async sendImageMessage(
    phone: string,
    message: string,
    imageUrl: string
  ): Promise<ZApiResponse> {
    return this.makeRequest('/send-image', 'POST', {
      phone,
      image: imageUrl,
      caption: message,
    })
  }

  // Enviar mensagem de documento
  async sendDocumentMessage(
    phone: string,
    message: string,
    documentUrl: string,
    fileName: string
  ): Promise<ZApiResponse> {
    return this.makeRequest('/send-document', 'POST', {
      phone,
      document: documentUrl,
      fileName,
      caption: message,
    })
  }

  // Enviar mensagem de áudio
  async sendAudioMessage(
    phone: string,
    audioUrl: string
  ): Promise<ZApiResponse> {
    return this.makeRequest('/send-audio', 'POST', {
      phone,
      audio: audioUrl,
    })
  }

  // Enviar mensagem para grupo
  async sendGroupMessage(
    groupId: string,
    message: string
  ): Promise<ZApiResponse> {
    return this.makeRequest('/send-group-text', 'POST', {
      groupId,
      message,
    })
  }

  // Obter mensagens
  async getMessages(params?: {
    phone?: string
    limit?: number
    offset?: number
  }): Promise<ZApiResponse> {
    const queryParams = new URLSearchParams()

    if (params?.phone) {
      queryParams.append('phone', params.phone)
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString())
    }

    const endpoint = queryParams.toString()
      ? `/messages?${queryParams.toString()}`
      : '/messages'

    return this.makeRequest(endpoint, 'GET')
  }

  // Obter QR Code
  async getQrCode(): Promise<ZApiResponse> {
    return this.makeRequest('/qr-code')
  }

  // Desconectar instância
  async disconnect(): Promise<ZApiResponse> {
    return this.makeRequest('/disconnect', 'POST')
  }

  // Conectar instância
  async connect(): Promise<ZApiResponse> {
    return this.makeRequest('/connect', 'POST')
  }

  // Obter informações da instância
  async getInstanceInfo(): Promise<ZApiResponse> {
    return this.makeRequest('/status')
  }

  // Obter contatos com paginação
  async getContacts(params?: {
    page?: number
    pageSize?: number
  }): Promise<ZApiResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }

    const endpoint = queryParams.toString()
      ? `/contacts?${queryParams.toString()}`
      : '/contacts'

    return this.makeRequest(endpoint)
  }

  // Obter grupos
  async getGroups(params?: {
    page?: number
    pageSize?: number
  }): Promise<ZApiResponse> {
    let endpoint = '/groups'
    
    if (params?.page || params?.pageSize) {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      endpoint = `/groups?${queryParams.toString()}`
    }
    
    return this.makeRequest(endpoint)
  }

  // Obter todos os grupos (com paginação automática)
  async getAllGroups(): Promise<ZApiResponse> {
    console.log('📋 Obtendo todos os grupos com paginação...')
    
    try {
      const allGroups = []
      let page = 1
      const pageSize = 50 // Tamanho maior para reduzir requisições
      let hasMore = true

      while (hasMore) {
        console.log(`📄 Buscando página ${page} (${pageSize} grupos por página)...`)
        
        const response = await this.getGroups({ page, pageSize })
        
        if (!response.success) {
          console.error(`❌ Erro ao buscar página ${page}:`, response.error)
          return response
        }

        const groups = response.data as any[] || []
        console.log(`✅ Página ${page}: ${groups.length} grupos encontrados`)
        
        if (groups.length === 0) {
          hasMore = false
        } else {
          allGroups.push(...groups)
          page++
          
          // Se retornou menos que o pageSize, provavelmente é a última página
          if (groups.length < pageSize) {
            hasMore = false
          }
        }
      }

      console.log(`🎉 Total de grupos obtidos: ${allGroups.length}`)
      
      return {
        success: true,
        data: allGroups
      }
    } catch (error: any) {
      console.error('❌ Erro ao obter todos os grupos:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Buscar grupos com filtros
  async searchGroups(params?: {
    name?: string
    description?: string
    participants?: string[]
    limit?: number
    offset?: number
  }): Promise<ZApiResponse> {
    const queryParams = new URLSearchParams()

    if (params?.name) {
      queryParams.append('name', params.name)
    }
    if (params?.description) {
      queryParams.append('description', params.description)
    }
    if (params?.participants && params.participants.length > 0) {
      queryParams.append('participants', params.participants.join(','))
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString())
    }

    const endpoint = queryParams.toString()
      ? `/groups/search?${queryParams.toString()}`
      : '/groups/search'

    return this.makeRequest(endpoint)
  }

  // Obter informações de um grupo específico
  async getGroupInfo(groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}`)
  }

  // Atualizar nome do grupo
  async updateGroupName(groupId: string, name: string): Promise<ZApiResponse> {
    console.log('📝 Atualizando nome do grupo:', { groupId, name })
    
    try {
      const requestData = {
        groupId,
        groupName: name
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/update-group-name`
      
      console.log('📤 Enviando requisição para atualizar nome do grupo:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao atualizar nome do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Nome do grupo atualizado:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao atualizar nome do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Atualizar descrição do grupo
  async updateGroupDescription(groupId: string, description: string): Promise<ZApiResponse> {
    console.log('📝 Atualizando descrição do grupo:', { groupId, description })
    
    try {
      const requestData = {
        groupId,
        groupDescription: description
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/update-group-description`
      
      console.log('📤 Enviando requisição para atualizar descrição do grupo:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao atualizar descrição do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Descrição do grupo atualizada:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao atualizar descrição do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Atualizar imagem do grupo
  async updateGroupImage(groupId: string, imageUrl: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/image`, 'PUT', { image: imageUrl })
  }

  // Obter participantes do grupo
  async getGroupParticipants(groupId: string): Promise<ZApiResponse> {
    console.log('👥 Obtendo participantes do grupo:', { groupId })
    
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/group-metadata/${groupId}`
      
      console.log('📤 Enviando requisição para obter participantes do grupo:', { url })

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao obter participantes do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Participantes do grupo obtidos:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao obter participantes do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Adicionar participantes ao grupo
  async addGroupParticipants(groupId: string, participants: string[]): Promise<ZApiResponse> {
    console.log('👥 Adicionando participantes ao grupo:', { groupId, participants })
    
    try {
      const requestData = {
        groupId,
        phones: participants
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/add-participant`
      
      console.log('📤 Enviando requisição para adicionar participantes:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao adicionar participantes:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Participantes adicionados:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao adicionar participantes:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Remover participantes do grupo
  async removeGroupParticipants(groupId: string, participants: string[]): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/participants`, 'DELETE', { participants })
  }

  // Obter administradores do grupo
  async getGroupAdmins(groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/admins`)
  }

  // Promover participante a administrador
  async promoteGroupAdmin(groupId: string, participantPhone: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/admins`, 'POST', { phone: participantPhone })
  }

  // Remover administrador do grupo
  async demoteGroupAdmin(groupId: string, participantPhone: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/admins`, 'DELETE', { phone: participantPhone })
  }

  // Remover foto do grupo
  async removeGroupPhoto(groupId: string): Promise<ZApiResponse> {
    console.log('🗑️ Removendo foto do grupo:', { groupId })
    
    try {
      const requestData = {
        groupId,
        groupPhoto: '' // URL vazia para remover a foto
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/update-group-photo`
      
      console.log('📤 Enviando requisição para remover foto:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao remover foto do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Foto do grupo removida:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao remover foto do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Atualizar foto do grupo
  async updateGroupPhoto(groupId: string, photoUrl: string): Promise<ZApiResponse> {
    console.log('📸 Atualizando foto do grupo:', { groupId, photoUrl: photoUrl.substring(0, 50) + '...' })
    
    // Aguardar mais tempo para o grupo ser criado completamente (baseado na documentação Z-API)
    console.log('⏳ Aguardando 5 segundos para o grupo ser criado completamente...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const maxRetries = 3
    let lastError: string | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} de atualizar foto do grupo`)
        
        const requestData = {
          groupId,
          groupPhoto: photoUrl
        }

        // Usar o endpoint correto da Z-API com a instância
        const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/update-group-photo`
        
        console.log('📤 Enviando requisição para atualizar foto:', {
          url,
          data: { groupId, groupPhoto: photoUrl.substring(0, 50) + '...' }
        })

        const response = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(requestData)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Erro ao atualizar foto do grupo (tentativa ${attempt}):`, response.status, errorText)
          
          lastError = `Erro ${response.status}: ${errorText}`
          
          // Se for timeout, aguardar mais tempo antes da próxima tentativa
          if (errorText.includes('timeout') && attempt < maxRetries) {
            const waitTime = attempt * 2000 // 2s, 4s, 6s
            console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
          
          return {
            success: false,
            error: lastError
          }
        }

        const result = await response.json()
        console.log('✅ Foto do grupo atualizada:', result)

        return {
          success: true,
          data: result
        }

      } catch (error) {
        console.error(`❌ Erro ao atualizar foto do grupo (tentativa ${attempt}):`, error)
        lastError = error instanceof Error ? error.message : 'Erro desconhecido'
        
        // Se não for a última tentativa, aguardar antes de tentar novamente
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000
          console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    return {
      success: false,
      error: lastError || 'Erro interno ao atualizar foto do grupo'
    }
  }

  // Criar grupo
  async createGroup(data: {
    name: string
    description?: string
    participants: string[]
    imageUrl?: string
  }): Promise<ZApiResponse> {
    console.log('👥 Criando grupo:', data)
    
    try {
      // Formatar dados conforme documentação Z-API (baseado no sistema que funciona)
      const requestData = {
        groupName: data.name,
        phones: data.participants,  // ✅ Enviar números sem formatação, como no sistema que funciona
        autoInvite: true
      }

      console.log('📤 Dados enviados para Z-API:', JSON.stringify(requestData, null, 2))

      // Usar o endpoint correto da Z-API com a instância
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/create-group`

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao criar grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Grupo criado:', result)

      return {
        success: true,
        data: result,
        message: 'Grupo criado com sucesso'
      }

    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error)
      return {
        success: false,
        error: 'Erro ao criar grupo'
      }
    }
  }

  // Sair do grupo
  async leaveGroup(groupId: string): Promise<ZApiResponse> {
    console.log('🚪 Saindo do grupo:', { groupId })
    
    try {
      const requestData = {
        groupId
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/leave-group`
      
      console.log('📤 Enviando requisição para sair do grupo:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao sair do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Resposta ao sair do grupo:', result)

      // A Z-API retorna { value: boolean }
      if (result.value === true) {
        return {
          success: true,
          data: result
        }
      } else {
        return {
          success: false,
          error: 'Falha ao sair do grupo'
        }
      }
    } catch (error: any) {
      console.error('❌ Exceção ao sair do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Obter metadados do grupo
  async getGroupMetadata(groupId: string): Promise<ZApiResponse> {
    console.log('📋 Obtendo metadados do grupo:', { groupId })
    
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/group-metadata/${groupId}`
      
      console.log('📤 Enviando requisição para obter metadados do grupo:', { url })

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao obter metadados do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Metadados do grupo obtidos:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao obter metadados do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Obter link de convite do grupo
  async getGroupInviteLink(groupId: string): Promise<ZApiResponse> {
    console.log('🔗 Obtendo link de convite do grupo:', { groupId })
    
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/group-metadata/${groupId}`
      
      console.log('📤 Enviando requisição para obter link de convite:', { url })

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao obter link de convite:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Link de convite obtido:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao obter link de convite:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Gerar novo link de convite
  async generateGroupInviteLink(groupId: string, expiresIn?: number): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/invite-link`, 'POST', { expiresIn })
  }

  // Revogar link de convite
  async revokeGroupInviteLink(groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/invite-link`, 'DELETE')
  }

  // Atualizar configurações do grupo
  async updateGroupSettings(
    groupId: string, 
    settings: {
      adminOnlyMessage?: boolean
      adminOnlySettings?: boolean
      requireAdminApproval?: boolean
      adminOnlyAddMember?: boolean
    }
  ): Promise<ZApiResponse> {
    console.log('⚙️ Atualizando configurações do grupo:', { groupId, settings })
    
    try {
      const requestData = {
        phone: groupId,
        adminOnlyMessage: settings.adminOnlyMessage,
        adminOnlySettings: settings.adminOnlySettings,
        requireAdminApproval: settings.requireAdminApproval,
        adminOnlyAddMember: settings.adminOnlyAddMember
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/update-group-settings`
      
      console.log('📤 Enviando requisição para atualizar configurações do grupo:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao atualizar configurações do grupo:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Configurações do grupo atualizadas:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao atualizar configurações do grupo:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Remover participantes do grupo
  async removeParticipants(groupId: string, phones: string[]): Promise<ZApiResponse> {
    console.log('🗑️ Removendo participantes do grupo:', { groupId, phones })
    
    try {
      const requestData = {
        groupId,
        phones
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/remove-participant`
      
      console.log('📤 Enviando requisição para remover participantes:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao remover participantes:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Participantes removidos:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao remover participantes:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Adicionar administradores ao grupo
  async addAdmins(groupId: string, phones: string[]): Promise<ZApiResponse> {
    console.log('👑 Adicionando administradores ao grupo:', { groupId, phones })
    
    try {
      const requestData = {
        groupId,
        phones
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/add-admin`
      
      console.log('📤 Enviando requisição para adicionar administradores:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao adicionar administradores:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Administradores adicionados:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao adicionar administradores:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Remover administradores do grupo
  async removeAdmins(groupId: string, phones: string[]): Promise<ZApiResponse> {
    console.log('👑 Removendo administradores do grupo:', { groupId, phones })
    
    try {
      const requestData = {
        groupId,
        phones
      }

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/remove-admin`
      
      console.log('📤 Enviando requisição para remover administradores:', {
        url,
        data: requestData
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao remover administradores:', response.status, errorText)
        return {
          success: false,
          error: `Erro ${response.status}: ${errorText}`
        }
      }

      const result = await response.json()
      console.log('✅ Administradores removidos:', result)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      console.error('❌ Exceção ao remover administradores:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Aceitar convite de grupo
  async acceptGroupInvite(inviteLink: string): Promise<ZApiResponse> {
    return this.makeRequest('/groups/join', 'POST', { inviteLink })
  }

  // Enviar mensagem para grupo
  async sendGroupMessage(
    groupId: string,
    message: string,
    type: 'text' | 'image' | 'document' | 'audio' = 'text',
    mediaUrl?: string,
    fileName?: string
  ): Promise<ZApiResponse> {
    const data: Record<string, unknown> = {
      groupId,
      message,
      type,
    }

    if (mediaUrl) {
      data.mediaUrl = mediaUrl
    }
    if (fileName) {
      data.fileName = fileName
    }

    return this.makeRequest('/groups/send-message', 'POST', data)
  }

  // Obter mensagens do grupo
  async getGroupMessages(
    groupId: string,
    params?: {
      limit?: number
      offset?: number
      before?: string
      after?: string
    }
  ): Promise<ZApiResponse> {
    const queryParams = new URLSearchParams()

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString())
    }
    if (params?.before) {
      queryParams.append('before', params.before)
    }
    if (params?.after) {
      queryParams.append('after', params.after)
    }

    const endpoint = queryParams.toString()
      ? `/groups/${groupId}/messages?${queryParams.toString()}`
      : `/groups/${groupId}/messages`

    return this.makeRequest(endpoint)
  }

  // Apagar mensagem do grupo
  async deleteGroupMessage(groupId: string, messageId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/messages/${messageId}`, 'DELETE')
  }

  // Obter estatísticas do grupo
  async getGroupStats(groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/groups/${groupId}/stats`)
  }

  // ===== MÉTODOS PARA COMUNIDADES =====

  // Obter comunidades
  async getCommunities(): Promise<ZApiResponse> {
    return this.makeRequest('/communities')
  }

  // Buscar comunidades com filtros
  async searchCommunities(params?: {
    name?: string
    description?: string
    limit?: number
    offset?: number
  }): Promise<ZApiResponse> {
    const queryParams = new URLSearchParams()

    if (params?.name) {
      queryParams.append('name', params.name)
    }
    if (params?.description) {
      queryParams.append('description', params.description)
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString())
    }

    const endpoint = queryParams.toString()
      ? `/communities/search?${queryParams.toString()}`
      : '/communities/search'

    return this.makeRequest(endpoint)
  }

  // Obter informações de uma comunidade específica
  async getCommunityInfo(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}`)
  }

  // Criar comunidade
  async createCommunity(data: {
    name: string
    description?: string
    imageUrl?: string
  }): Promise<ZApiResponse> {
    return this.makeRequest('/communities', 'POST', data)
  }

  // Atualizar nome da comunidade
  async updateCommunityName(communityId: string, name: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/name`, 'PUT', { name })
  }

  // Atualizar descrição da comunidade
  async updateCommunityDescription(communityId: string, description: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/description`, 'PUT', { description })
  }

  // Atualizar imagem da comunidade
  async updateCommunityImage(communityId: string, imageUrl: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/image`, 'PUT', { image: imageUrl })
  }

  // Desativar comunidade
  async deactivateCommunity(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}`, 'DELETE')
  }

  // ===== MÉTODOS PARA GRUPO DE AVISOS =====

  // Obter grupo de avisos da comunidade
  async getCommunityAnnouncementGroup(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/announcement-group`)
  }

  // Criar grupo de avisos para a comunidade
  async createCommunityAnnouncementGroup(communityId: string, data: {
    name: string
    description?: string
  }): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/announcement-group`, 'POST', data)
  }

  // Enviar anúncio para toda a comunidade
  async sendCommunityAnnouncement(communityId: string, data: {
    content: string
    type?: 'text' | 'image' | 'document'
    mediaUrl?: string
    fileName?: string
  }): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/announcement`, 'POST', data)
  }

  // Enviar anúncio para grupos específicos da comunidade
  async sendCommunityAnnouncementToGroups(communityId: string, data: {
    content: string
    groupIds: string[]
    type?: 'text' | 'image' | 'document'
    mediaUrl?: string
    fileName?: string
  }): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/announcement/groups`, 'POST', data)
  }

  // ===== MÉTODOS PARA VINCULAR GRUPOS =====

  // Obter grupos da comunidade
  async getCommunityGroups(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/groups`)
  }

  // Adicionar grupo à comunidade
  async addGroupToCommunity(communityId: string, data: {
    groupId: string
    isAnnouncementGroup?: boolean
  }): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/groups`, 'POST', data)
  }

  // Remover grupo da comunidade
  async removeGroupFromCommunity(communityId: string, groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/groups/${groupId}`, 'DELETE')
  }

  // Definir grupo como grupo de avisos
  async setGroupAsAnnouncementGroup(communityId: string, groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/groups/${groupId}/announcement`, 'POST')
  }

  // Remover grupo de avisos
  async unsetGroupAsAnnouncementGroup(communityId: string, groupId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/groups/${groupId}/announcement`, 'DELETE')
  }

  // ===== MÉTODOS PARA MEMBROS DA COMUNIDADE =====

  // Obter membros da comunidade
  async getCommunityMembers(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/members`)
  }

  // Adicionar membro à comunidade
  async addCommunityMember(communityId: string, data: {
    phone: string
    role?: 'admin' | 'member'
  }): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/members`, 'POST', data)
  }

  // Remover membro da comunidade
  async removeCommunityMember(communityId: string, phone: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/members/${phone}`, 'DELETE')
  }

  // Promover membro a administrador
  async promoteCommunityMember(communityId: string, phone: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/members/${phone}/promote`, 'POST')
  }

  // Remover privilégios de administrador
  async demoteCommunityMember(communityId: string, phone: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/members/${phone}/demote`, 'POST')
  }

  // ===== MÉTODOS PARA CONVITES DA COMUNIDADE =====

  // Obter link de convite da comunidade
  async getCommunityInviteLink(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/invite-link`)
  }

  // Gerar novo link de convite da comunidade
  async generateCommunityInviteLink(communityId: string, expiresIn?: number): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/invite-link`, 'POST', { expiresIn })
  }

  // Revogar link de convite da comunidade
  async revokeCommunityInviteLink(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/invite-link`, 'DELETE')
  }

  // Aceitar convite da comunidade
  async acceptCommunityInvite(inviteLink: string): Promise<ZApiResponse> {
    return this.makeRequest('/communities/join', 'POST', { inviteLink })
  }

  // ===== MÉTODOS PARA ESTATÍSTICAS DA COMUNIDADE =====

  // Obter estatísticas da comunidade
  async getCommunityStats(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/stats`)
  }

  // Obter estatísticas de anúncios da comunidade
  async getCommunityAnnouncementStats(communityId: string): Promise<ZApiResponse> {
    return this.makeRequest(`/communities/${communityId}/announcement-stats`)
  }

  // Obter mensagens não lidas
  async getUnreadMessages(): Promise<ZApiResponse> {
    return this.makeRequest('/unread-messages')
  }
}

// Hook para gerenciar instâncias Z-API
export function useZApiInstances() {
  const supabase = createClient()

  const getInstances = async (): Promise<ZApiInstance[]> => {
    const { data, error } = await supabase
      .from('z_api_instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar instâncias:', error)
      return []
    }

    return data || []
  }

  const getActiveInstance = async (): Promise<ZApiInstance | null> => {
    const { data, error } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Erro ao buscar instância ativa:', error)
      return null
    }

    return data
  }

  const createInstance = async (
    instanceData: Omit<ZApiInstance, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ZApiInstance | null> => {
    const { data, error } = await supabase
      .from('z_api_instances')
      .insert(instanceData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar instância:', error)
      return null
    }

    return data
  }

  const updateInstance = async (
    id: string,
    updates: Partial<ZApiInstance>
  ): Promise<ZApiInstance | null> => {
    const { data, error } = await supabase
      .from('z_api_instances')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar instância:', error)
      return null
    }

    return data
  }

  const deleteInstance = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('z_api_instances')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar instância:', error)
      return false
    }

    return true
  }

  const setActiveInstance = async (id: string): Promise<boolean> => {
    // Primeiro, desativar todas as instâncias
    await supabase.from('z_api_instances').update({ is_active: false })

    // Depois, ativar a instância selecionada
    const { error } = await supabase
      .from('z_api_instances')
      .update({ is_active: true })
      .eq('id', id)

    if (error) {
      console.error('Erro ao ativar instância:', error)
      return false
    }

    return true
  }

  const testInstanceConnection = async (
    instance: ZApiInstance
  ): Promise<boolean> => {
    const client = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    const response = await client.getInstanceStatus()
    return response.success
  }

  return {
    getInstances,
    getActiveInstance,
    createInstance,
    updateInstance,
    deleteInstance,
    setActiveInstance,
    testInstanceConnection,
  }
}
