'use client'

import { useState, useCallback } from 'react'
import { ZApiClient, ZApiCommunity, ZApiCommunityGroup, ZApiCommunityMember, ZApiCommunityAnnouncement, ZApiCommunityStats } from '@/lib/z-api/client'
import { useZApiInstances } from '@/lib/z-api/client'

export interface UseZApiCommunitiesReturn {
  // Estados
  communities: ZApiCommunity[]
  isLoading: boolean
  error: string | null
  
  // Métodos de busca
  searchCommunities: (params?: {
    name?: string
    description?: string
    limit?: number
    offset?: number
  }) => Promise<ZApiCommunity[]>
  
  getCommunityInfo: (communityId: string) => Promise<ZApiCommunity | null>
  
  // Métodos de gerenciamento
  createCommunity: (data: {
    name: string
    description?: string
    imageUrl?: string
  }) => Promise<ZApiCommunity | null>
  
  updateCommunityName: (communityId: string, name: string) => Promise<boolean>
  updateCommunityDescription: (communityId: string, description: string) => Promise<boolean>
  updateCommunityImage: (communityId: string, imageUrl: string) => Promise<boolean>
  deactivateCommunity: (communityId: string) => Promise<boolean>
  
  // Métodos para grupo de avisos
  getCommunityAnnouncementGroup: (communityId: string) => Promise<ZApiCommunityGroup | null>
  createCommunityAnnouncementGroup: (communityId: string, data: {
    name: string
    description?: string
  }) => Promise<ZApiCommunityGroup | null>
  
  sendCommunityAnnouncement: (communityId: string, data: {
    content: string
    type?: 'text' | 'image' | 'document'
    mediaUrl?: string
    fileName?: string
  }) => Promise<boolean>
  
  sendCommunityAnnouncementToGroups: (communityId: string, data: {
    content: string
    groupIds: string[]
    type?: 'text' | 'image' | 'document'
    mediaUrl?: string
    fileName?: string
  }) => Promise<boolean>
  
  // Métodos para vincular grupos
  getCommunityGroups: (communityId: string) => Promise<ZApiCommunityGroup[]>
  addGroupToCommunity: (communityId: string, data: {
    groupId: string
    isAnnouncementGroup?: boolean
  }) => Promise<boolean>
  removeGroupFromCommunity: (communityId: string, groupId: string) => Promise<boolean>
  setGroupAsAnnouncementGroup: (communityId: string, groupId: string) => Promise<boolean>
  unsetGroupAsAnnouncementGroup: (communityId: string, groupId: string) => Promise<boolean>
  
  // Métodos para membros
  getCommunityMembers: (communityId: string) => Promise<ZApiCommunityMember[]>
  addCommunityMember: (communityId: string, data: {
    phone: string
    role?: 'admin' | 'member'
  }) => Promise<boolean>
  removeCommunityMember: (communityId: string, phone: string) => Promise<boolean>
  promoteCommunityMember: (communityId: string, phone: string) => Promise<boolean>
  demoteCommunityMember: (communityId: string, phone: string) => Promise<boolean>
  
  // Métodos para convites
  getCommunityInviteLink: (communityId: string) => Promise<string | null>
  generateCommunityInviteLink: (communityId: string, expiresIn?: number) => Promise<string | null>
  revokeCommunityInviteLink: (communityId: string) => Promise<boolean>
  acceptCommunityInvite: (inviteLink: string) => Promise<boolean>
  
  // Métodos para estatísticas
  getCommunityStats: (communityId: string) => Promise<ZApiCommunityStats | null>
  getCommunityAnnouncementStats: (communityId: string) => Promise<ZApiCommunityAnnouncement[]>
  
  // Utilitários
  clearError: () => void
  refreshCommunities: () => Promise<void>
}

export function useZApiCommunities(): UseZApiCommunitiesReturn {
  const { getActiveInstance } = useZApiInstances()
  const [communities, setCommunities] = useState<ZApiCommunity[]>([])
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

  // Buscar comunidades
  const searchCommunities = useCallback(async (params?: {
    name?: string
    description?: string
    limit?: number
    offset?: number
  }): Promise<ZApiCommunity[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.searchCommunities(params)
      
      if (!response.success) {
        setError(response.error || 'Erro ao buscar comunidades')
        return []
      }

      const communitiesData = response.data?.communities as ZApiCommunity[] || []
      setCommunities(communitiesData)
      return communitiesData
    } catch (err) {
      setError('Erro ao buscar comunidades')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter informações de uma comunidade
  const getCommunityInfo = useCallback(async (communityId: string): Promise<ZApiCommunity | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getCommunityInfo(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter informações da comunidade')
        return null
      }

      return response.data as ZApiCommunity
    } catch (err) {
      setError('Erro ao obter informações da comunidade')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Criar comunidade
  const createCommunity = useCallback(async (data: {
    name: string
    description?: string
    imageUrl?: string
  }): Promise<ZApiCommunity | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.createCommunity(data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao criar comunidade')
        return null
      }

      return response.data as ZApiCommunity
    } catch (err) {
      setError('Erro ao criar comunidade')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar nome da comunidade
  const updateCommunityName = useCallback(async (communityId: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.updateCommunityName(communityId, name)
      
      if (!response.success) {
        setError(response.error || 'Erro ao atualizar nome da comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao atualizar nome da comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar descrição da comunidade
  const updateCommunityDescription = useCallback(async (communityId: string, description: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.updateCommunityDescription(communityId, description)
      
      if (!response.success) {
        setError(response.error || 'Erro ao atualizar descrição da comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao atualizar descrição da comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar imagem da comunidade
  const updateCommunityImage = useCallback(async (communityId: string, imageUrl: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.updateCommunityImage(communityId, imageUrl)
      
      if (!response.success) {
        setError(response.error || 'Erro ao atualizar imagem da comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao atualizar imagem da comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Desativar comunidade
  const deactivateCommunity = useCallback(async (communityId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.deactivateCommunity(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao desativar comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao desativar comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter grupo de avisos da comunidade
  const getCommunityAnnouncementGroup = useCallback(async (communityId: string): Promise<ZApiCommunityGroup | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getCommunityAnnouncementGroup(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter grupo de avisos')
        return null
      }

      return response.data as ZApiCommunityGroup
    } catch (err) {
      setError('Erro ao obter grupo de avisos')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Criar grupo de avisos para a comunidade
  const createCommunityAnnouncementGroup = useCallback(async (communityId: string, data: {
    name: string
    description?: string
  }): Promise<ZApiCommunityGroup | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.createCommunityAnnouncementGroup(communityId, data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao criar grupo de avisos')
        return null
      }

      return response.data as ZApiCommunityGroup
    } catch (err) {
      setError('Erro ao criar grupo de avisos')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Enviar anúncio para toda a comunidade
  const sendCommunityAnnouncement = useCallback(async (communityId: string, data: {
    content: string
    type?: 'text' | 'image' | 'document'
    mediaUrl?: string
    fileName?: string
  }): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.sendCommunityAnnouncement(communityId, data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao enviar anúncio')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao enviar anúncio')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Enviar anúncio para grupos específicos da comunidade
  const sendCommunityAnnouncementToGroups = useCallback(async (communityId: string, data: {
    content: string
    groupIds: string[]
    type?: 'text' | 'image' | 'document'
    mediaUrl?: string
    fileName?: string
  }): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.sendCommunityAnnouncementToGroups(communityId, data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao enviar anúncio para grupos')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao enviar anúncio para grupos')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter grupos da comunidade
  const getCommunityGroups = useCallback(async (communityId: string): Promise<ZApiCommunityGroup[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.getCommunityGroups(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter grupos da comunidade')
        return []
      }

      return response.data?.groups as ZApiCommunityGroup[] || []
    } catch (err) {
      setError('Erro ao obter grupos da comunidade')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Adicionar grupo à comunidade
  const addGroupToCommunity = useCallback(async (communityId: string, data: {
    groupId: string
    isAnnouncementGroup?: boolean
  }): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.addGroupToCommunity(communityId, data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao adicionar grupo à comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao adicionar grupo à comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Remover grupo da comunidade
  const removeGroupFromCommunity = useCallback(async (communityId: string, groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.removeGroupFromCommunity(communityId, groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao remover grupo da comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao remover grupo da comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Definir grupo como grupo de avisos
  const setGroupAsAnnouncementGroup = useCallback(async (communityId: string, groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.setGroupAsAnnouncementGroup(communityId, groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao definir grupo como grupo de avisos')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao definir grupo como grupo de avisos')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Remover grupo de avisos
  const unsetGroupAsAnnouncementGroup = useCallback(async (communityId: string, groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.unsetGroupAsAnnouncementGroup(communityId, groupId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao remover grupo de avisos')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao remover grupo de avisos')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter membros da comunidade
  const getCommunityMembers = useCallback(async (communityId: string): Promise<ZApiCommunityMember[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.getCommunityMembers(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter membros da comunidade')
        return []
      }

      return response.data?.members as ZApiCommunityMember[] || []
    } catch (err) {
      setError('Erro ao obter membros da comunidade')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Adicionar membro à comunidade
  const addCommunityMember = useCallback(async (communityId: string, data: {
    phone: string
    role?: 'admin' | 'member'
  }): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.addCommunityMember(communityId, data)
      
      if (!response.success) {
        setError(response.error || 'Erro ao adicionar membro à comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao adicionar membro à comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Remover membro da comunidade
  const removeCommunityMember = useCallback(async (communityId: string, phone: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.removeCommunityMember(communityId, phone)
      
      if (!response.success) {
        setError(response.error || 'Erro ao remover membro da comunidade')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao remover membro da comunidade')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Promover membro a administrador
  const promoteCommunityMember = useCallback(async (communityId: string, phone: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.promoteCommunityMember(communityId, phone)
      
      if (!response.success) {
        setError(response.error || 'Erro ao promover membro')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao promover membro')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Remover privilégios de administrador
  const demoteCommunityMember = useCallback(async (communityId: string, phone: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.demoteCommunityMember(communityId, phone)
      
      if (!response.success) {
        setError(response.error || 'Erro ao remover privilégios de administrador')
        return false
      }

      return true
    } catch (err) {
      setError('Erro ao remover privilégios de administrador')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter link de convite da comunidade
  const getCommunityInviteLink = useCallback(async (communityId: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getCommunityInviteLink(communityId)
      
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

  // Gerar novo link de convite da comunidade
  const generateCommunityInviteLink = useCallback(async (communityId: string, expiresIn?: number): Promise<string | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.generateCommunityInviteLink(communityId, expiresIn)
      
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

  // Revogar link de convite da comunidade
  const revokeCommunityInviteLink = useCallback(async (communityId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.revokeCommunityInviteLink(communityId)
      
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

  // Aceitar convite da comunidade
  const acceptCommunityInvite = useCallback(async (inviteLink: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return false

      const response = await client.acceptCommunityInvite(inviteLink)
      
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

  // Obter estatísticas da comunidade
  const getCommunityStats = useCallback(async (communityId: string): Promise<ZApiCommunityStats | null> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return null

      const response = await client.getCommunityStats(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter estatísticas da comunidade')
        return null
      }

      return response.data as ZApiCommunityStats
    } catch (err) {
      setError('Erro ao obter estatísticas da comunidade')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Obter estatísticas de anúncios da comunidade
  const getCommunityAnnouncementStats = useCallback(async (communityId: string): Promise<ZApiCommunityAnnouncement[]> => {
    try {
      setIsLoading(true)
      clearError()

      const client = await getActiveClient()
      if (!client) return []

      const response = await client.getCommunityAnnouncementStats(communityId)
      
      if (!response.success) {
        setError(response.error || 'Erro ao obter estatísticas de anúncios')
        return []
      }

      return response.data?.announcements as ZApiCommunityAnnouncement[] || []
    } catch (err) {
      setError('Erro ao obter estatísticas de anúncios')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getActiveClient, clearError])

  // Atualizar lista de comunidades
  const refreshCommunities = useCallback(async (): Promise<void> => {
    await searchCommunities()
  }, [searchCommunities])

  return {
    // Estados
    communities,
    isLoading,
    error,
    
    // Métodos de busca
    searchCommunities,
    getCommunityInfo,
    
    // Métodos de gerenciamento
    createCommunity,
    updateCommunityName,
    updateCommunityDescription,
    updateCommunityImage,
    deactivateCommunity,
    
    // Métodos para grupo de avisos
    getCommunityAnnouncementGroup,
    createCommunityAnnouncementGroup,
    sendCommunityAnnouncement,
    sendCommunityAnnouncementToGroups,
    
    // Métodos para vincular grupos
    getCommunityGroups,
    addGroupToCommunity,
    removeGroupFromCommunity,
    setGroupAsAnnouncementGroup,
    unsetGroupAsAnnouncementGroup,
    
    // Métodos para membros
    getCommunityMembers,
    addCommunityMember,
    removeCommunityMember,
    promoteCommunityMember,
    demoteCommunityMember,
    
    // Métodos para convites
    getCommunityInviteLink,
    generateCommunityInviteLink,
    revokeCommunityInviteLink,
    acceptCommunityInvite,
    
    // Métodos para estatísticas
    getCommunityStats,
    getCommunityAnnouncementStats,
    
    // Utilitários
    clearError,
    refreshCommunities,
  }
}
