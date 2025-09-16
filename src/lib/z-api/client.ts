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

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: Record<string, unknown>
  ): Promise<ZApiResponse> {
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}${endpoint}`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': this.clientToken,
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Erro na requisição Z-API',
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
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

  // Enviar mensagem de texto
  async sendTextMessage(phone: string, message: string): Promise<ZApiResponse> {
    return this.makeRequest('/send-text', 'POST', {
      phone,
      message,
    })
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
    return this.makeRequest('/info')
  }

  // Obter contatos
  async getContacts(): Promise<ZApiResponse> {
    return this.makeRequest('/contacts')
  }

  // Obter grupos
  async getGroups(): Promise<ZApiResponse> {
    return this.makeRequest('/groups')
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
