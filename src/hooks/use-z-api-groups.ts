'use client'

import { useState, useCallback } from 'react'
import { ZApiClient, ZApiGroup, ZApiGroupParticipant, ZApiGroupMessage, ZApiGroupStats } from '@/lib/z-api/client'
import { useZApiInstances } from '@/lib/z-api/client'

export interface UseZApiGroupsReturn {
  // Estados
  groups: ZApiGroup[]
  isLoading: boolean
  error: string | null
  
  // Métodos de busca
  searchGroups: (params?: {
    name?: string
    description?: string
    participants?: string[]
    limit?: number
    offset?: number
  }) => Promise<ZApiGroup[]>
  
  getGroupInfo: (groupId: string) => Promise<ZApiGroup | null>
  
  // Métodos de atualização
  updateGroupName: (groupId: string, name: string) => Promise<boolean>
  updateGroupDescription: (groupId: string, description: string) => Promise<boolean>
  updateGroupImage: (groupId: string, imageUrl: string) => Promise<boolean>
  
  // Métodos de participantes
  getGroupParticipants: (groupId: string) => Promise<ZApiGroupParticipant[]>
  addGroupParticipants: (groupId: string, participants: string[]) => Promise<boolean>
  removeGroupParticipants: (groupId: string, participants: string[]) => Promise<boolean>
  
  // Métodos de administradores
  getGroupAdmins: (groupId: string) => Promise<ZApiGroupParticipant[]>
  promoteGroupAdmin: (groupId: string, participantPhone: string) => Promise<boolean>
  demoteGroupAdmin: (groupId: string, participantPhone: string) => Promise<boolean>
  
  // Métodos de grupo
  createGroup: (data: {
    name: string
    description?: string
    participants: string[]
    imageUrl?: string
  }) => Promise<ZApiGroup | null>
  
  leaveGroup: (groupId: string) => Promise<boolean>
  
  // Métodos de convite
  getGroupInviteLink: (groupId: string) => Promise<string | null>
  generateGroupInviteLink: (groupId: string, expiresIn?: number) => Promise<string | null>
  revokeGroupInviteLink: (groupId: string) => Promise<boolean>
  acceptGroupInvite: (inviteLink: string) => Promise<boolean>
  
  // Métodos de mensagens
  sendGroupMessage: (
    groupId: string,
    message: string,
    type?: 'text' | 'image' | 'document' | 'audio',
    mediaUrl?: string,
    fileName?: string
  ) => Promise<boolean>
  
  getGroupMessages: (
    groupId: string,
    params?: {
      limit?: number
      offset?: number
      before?: string
      after?: string
    }
  ) => Promise<ZApiGroupMessage[]>
  
  deleteGroupMessage: (groupId: string, messageId: string) => Promise<boolean>
  
  // Métodos de estatísticas
  getGroupStats: (groupId: string) => Promise<ZApiGroupStats | null>
  
  // Utilitários
  clearError: () => void
  refreshGroups: () => Promise<void>
}

export function useZApiGroups(): UseZApiGroupsReturn {
  const { getActiveInstance } = useZApiInstances()
  const [groups, setGroups] = useState<ZApiGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obter cliente Z-API ativo
  const getActiveClient = useCallback(async (): Promise<ZApiClient | null> => {
    try {
      const instance = await getActiveInstance()
      if (!instance) {
        setError('Nenhuma instância Z-API ativa encontrada')
        return null
      }

      return new ZApiClient(
        instance.instance_id,
        instance.instance_token,
        instance.client_token
      )
    } catch (err) {
      setError('Erro ao obter instância Z-API ativa')
      return null
    }
  }, [getActiveInstance])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Buscar grupos
  const searchGroups = useCallback(async (params?: {
    name?: string
    description?: string
    participants?: string[]
    limit?: number
    offset?: number
  }): Promise<ZApiGroup[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.searchGroups(params)
      
      if (!response.success) {
        setError(response.error || 'Erro ao buscar grupos')
        return []
      }

      const groupsData = response.data?.groups as ZApiGroup[] || []
      setGroups(groupsData)
      return groupsData
    } catch (err) {
      setError('Erro ao buscar grupos')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter informações de um grupo
  const getGroupInfo = useCallback(async (groupId: string): Promise<ZApiGroup | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getGroupInfo(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter informações do grupo')
        return null
      }

      return response.data as ZApiGroup
    } catch (err) {
      setError('Erro ao obter informações do grupo')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar nome do grupo
  const updateGroupName = useCallback(async (groupId: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.updateGroupName(groupId, name)
      
      if (!response.success) {
        setError(response.error || 'Erro ao atualizar nome do grupo')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao atualizar nome do grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar descrição do grupo
  const updateGroupDescription = useCallback(async (groupId: string, description: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.updateGroupDescription(groupId, description)
      
      if (!response.success) {
        setError(response.error || 'Erro ao atualizar descrição do grupo')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao atualizar descrição do grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar imagem do grupo
  const updateGroupImage = useCallback(async (groupId: string, imageUrl: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.updateGroupImage(groupId, imageUrl)
      
      if (!response.success) {
        setError(response.error || 'Erro ao atualizar imagem do grupo')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao atualizar imagem do grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter participantes do grupo
  const getGroupParticipants = useCallback(async (groupId: string): Promise<ZApiGroupParticipant[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.getGroupParticipants(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter participantes do grupo')
        return []
      }

      return response.data?.participants as ZApiGroupParticipant[] || []
    } catch (err) {
      setError('Erro ao obter participantes do grupo')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Adicionar participantes ao grupo
  const addGroupParticipants = useCallback(async (groupId: string, participants: string[]): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.addGroupParticipants(groupId, participants)
      
      if (!response.success) {
        setError(response.error || 'Erro ao adicionar participantes ao grupo')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao adicionar participantes ao grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Remover participantes do grupo
  const removeGroupParticipants = useCallback(async (groupId: string, participants: string[]): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.removeGroupParticipants(groupId, participants)
      
      if (!response.success) {
        setError(response.error || 'Erro ao remover participantes do grupo')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao remover participantes do grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter administradores do grupo
  const getGroupAdmins = useCallback(async (groupId: string): Promise<ZApiGroupParticipant[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.getGroupAdmins(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter administradores do grupo')
        return []
      }

      return response.data?.admins as ZApiGroupParticipant[] || []
    } catch (err) {
      setError('Erro ao obter administradores do grupo')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Promover participante a administrador
  const promoteGroupAdmin = useCallback(async (groupId: string, participantPhone: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.promoteGroupAdmin(groupId, participantPhone)
      
      if (!response.success) {
        setError(response.error || 'Erro ao promover administrador')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao promover administrador')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Remover administrador do grupo
  const demoteGroupAdmin = useCallback(async (groupId: string, participantPhone: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.demoteGroupAdmin(groupId, participantPhone)
      
      if (!response.success) {
        setError(response.error || 'Erro ao remover administrador')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao remover administrador')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Criar grupo
  const createGroup = useCallback(async (data: {
    name: string
    description?: string
    participants: string[]
    imageUrl?: string
  }): Promise<ZApiGroup | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.createGroup(data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao criar grupo')
        return null
      }

      return response.data as ZApiGroup
    } catch (err) {
      setError('Erro ao criar grupo')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Sair do grupo
  const leaveGroup = useCallback(async (groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.leaveGroup(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao sair do grupo')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao sair do grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter link de convite do grupo
  const getGroupInviteLink = useCallback(async (groupId: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getGroupInviteLink(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter link de convite')
        return null
      }

      return response.data?.inviteLink as string || null
    } catch (err) {
      setError('Erro ao obter link de convite')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Gerar novo link de convite
  const generateGroupInviteLink = useCallback(async (groupId: string, expiresIn?: number): Promise<string | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.generateGroupInviteLink(groupId, expiresIn)
      
      if (!response.success) {
        setError(response.error || 'Erro ao gerar link de convite')
        return null
      }

      return response.data?.inviteLink as string || null
    } catch (err) {
      setError('Erro ao gerar link de convite')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Revogar link de convite
  const revokeGroupInviteLink = useCallback(async (groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.revokeGroupInviteLink(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao revogar link de convite')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao revogar link de convite')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Aceitar convite de grupo
  const acceptGroupInvite = useCallback(async (inviteLink: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.acceptGroupInvite(inviteLink)
      
      if (!response.success) {
        setError(response.error || 'Erro ao aceitar convite')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao aceitar convite')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Enviar mensagem para grupo
  const sendGroupMessage = useCallback(async (
    groupId: string,
    message: string,
    type: 'text' | 'image' | 'document' | 'audio' = 'text',
    mediaUrl?: string,
    fileName?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.sendGroupMessage(groupId, message, type, mediaUrl, fileName)
      
      if (!response.success) {
        setError(response.error || 'Erro ao enviar mensagem')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao enviar mensagem')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter mensagens do grupo
  const getGroupMessages = useCallback(async (
    groupId: string,
    params?: {
      limit?: number
      offset?: number
      before?: string
      after?: string
    }
  ): Promise<ZApiGroupMessage[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.getGroupMessages(groupId, params)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter mensagens do grupo')
        return []
      }

      return response.data?.messages as ZApiGroupMessage[] || []
    } catch (err) {
      setError('Erro ao obter mensagens do grupo')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Apagar mensagem do grupo
  const deleteGroupMessage = useCallback(async (groupId: string, messageId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.deleteGroupMessage(groupId, messageId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao apagar mensagem')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao apagar mensagem')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter estatísticas do grupo
  const getGroupStats = useCallback(async (groupId: string): Promise<ZApiGroupStats | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getGroupStats(groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter estatísticas do grupo')
        return null
      }

      return response.data as ZApiGroupStats
    } catch (err) {
      setError('Erro ao obter estatísticas do grupo')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar lista de grupos
  const refreshGroups = useCallback(async (): Promise<void> => {
    await searchGroups()
  }, [searchGroups])

  return {
    // Estados
    groups,
    isLoading,
    error,
    
    // Métodos de busca
    searchGroups,
    getGroupInfo,
    
    // Métodos de atualização
    updateGroupName,
    updateGroupDescription,
    updateGroupImage,
    
    // Métodos de participantes
    getGroupParticipants,
    addGroupParticipants,
    removeGroupParticipants,
    
    // Métodos de administradores
    getGroupAdmins,
    promoteGroupAdmin,
    demoteGroupAdmin,
    
    // Métodos de grupo
    createGroup,
    leaveGroup,
    
    // Métodos de convite
    getGroupInviteLink,
    generateGroupInviteLink,
    revokeGroupInviteLink,
    acceptGroupInvite,
    
    // Métodos de mensagens
    sendGroupMessage,
    getGroupMessages,
    deleteGroupMessage,
    
    // Métodos de estatísticas
    getGroupStats,
    
    // Utilitários
    clearError,
    refreshGroups,
  }
}
