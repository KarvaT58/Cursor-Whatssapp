'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useWhatsAppGroups } from '@/hooks/use-whatsapp-groups'
import { useGroupNotifications } from '@/hooks/use-group-notifications'
// import { ZApiClient } from '@/lib/z-api/client'
import { useGroupSync } from '@/hooks/use-group-sync'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks/use-pagination'
import { GroupList } from '@/components/groups/group-list'
import { GroupsSearch } from '@/components/groups/groups-search'
import { GroupForm } from '@/components/groups/group-form'
import { ParticipantManager } from '@/components/groups/participant-manager'
import { GroupManagement } from '@/components/groups/GroupManagement'
import { GroupsPagination } from '@/components/groups/groups-pagination'
import { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Link,
} from 'lucide-react'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [showParticipantManager, setShowParticipantManager] = useState(false)
  const [showGroupManagement, setShowGroupManagement] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  
  // Estados para grupos universais
  const [universalGroups, setUniversalGroups] = useState<Group[]>([])
  const [universalLoading, setUniversalLoading] = useState(false)
  const [universalError, setUniversalError] = useState<string | null>(null)
  const [isCreatingUniversal, setIsCreatingUniversal] = useState(false)

  const {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    addParticipant,
    removeParticipant,
    refreshGroups,
  } = useWhatsAppGroups({ userId: user?.id, excludeUniversal: true })

  // Configuração da paginação
  const ITEMS_PER_PAGE = 50
  
  // Paginação para grupos normais
  const groupsPagination = usePagination({
    totalItems: groups.length,
    itemsPerPage: ITEMS_PER_PAGE,
  })
  
  // Paginação para grupos universais
  const universalGroupsPagination = usePagination({
    totalItems: universalGroups.length,
    itemsPerPage: ITEMS_PER_PAGE,
  })

  // Grupos da página atual
  const currentPageGroups = groups.slice(
    groupsPagination.startIndex,
    groupsPagination.endIndex
  )
  
  // Grupos universais da página atual
  const currentPageUniversalGroups = universalGroups.slice(
    universalGroupsPagination.startIndex,
    universalGroupsPagination.endIndex
  )

  const { notifications } = useGroupNotifications()

  // Processar notificações por grupo
  const groupNotifications = notifications.reduce((acc, notification) => {
    if (!notification.read && notification.group_id) {
      acc[notification.group_id] = (acc[notification.group_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const [activeInstanceId, setActiveInstanceId] = useState<string | undefined>()

  // Buscar instância Z-API ativa do usuário
  useEffect(() => {
    const fetchActiveInstance = async () => {
      if (!user?.id) return

      try {
        const { data: instance } = await supabase
          .from('z_api_instances')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (instance) {
          setActiveInstanceId(instance.id)
        }
      } catch (error) {
        console.error('Erro ao buscar instância ativa:', error)
      }
    }

    fetchActiveInstance()
  }, [user?.id, supabase])

  const { syncing, syncError, syncGroupsFromWhatsApp, syncGroupParticipants } =
    useGroupSync({
      userId: user?.id,
      instanceId: activeInstanceId,
    })

  // Reset error when component mounts
  useEffect(() => {
    setActionError(null)
  }, [])

  // Função para buscar grupos universais
  const fetchUniversalGroups = async () => {
    if (!user?.id) return

    try {
      setUniversalLoading(true)
      setUniversalError(null)

      const { data, error: fetchError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_type', 'universal') // Buscar apenas grupos universais
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setUniversalGroups(data || [])
    } catch (err) {
      setUniversalError(err instanceof Error ? err.message : 'Erro ao carregar grupos universais')
    } finally {
      setUniversalLoading(false)
    }
  }

  // Carregar grupos universais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchUniversalGroups()
    }
  }, [user])

  // Função para correção automática de grupos universais
  const autoFixUniversalGroups = async () => {
    try {
      console.log('🔧 Executando correção automática de grupos universais...')
      const response = await fetch('/api/groups/auto-fix-universal-groups', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success && result.fixedCount > 0) {
        console.log(`✅ Correção automática concluída: ${result.fixedCount} grupos corrigidos`)
        // Recarregar grupos universais após correção
        await fetchUniversalGroups()
      }
    } catch (error) {
      console.warn('⚠️ Erro na correção automática:', error)
      // Não mostrar erro para o usuário, é um processo em background
    }
  }

  // Memoize all callback functions before any conditional returns
  const handleCreateGroup = useCallback(async (
    data: Partial<Database['public']['Tables']['whatsapp_groups']['Insert']> & { settings?: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    setActionLoading(true)
    setActionError(null)
    try {
      // Garantir que o nome seja uma string válida
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Nome do grupo é obrigatório')
      }
      
      // Criar objeto com tipos corretos
      const createData: Database['public']['Tables']['whatsapp_groups']['Insert'] = {
        name: data.name,
        whatsapp_id: data.whatsapp_id || '',
        description: data.description || null,
        participants: data.participants || [],
        image_url: data.image_url || null,
        // Incluir configurações diretamente
        admin_only_message: data.admin_only_message || false,
        admin_only_settings: data.admin_only_settings || false,
        require_admin_approval: data.require_admin_approval || false,
        admin_only_add_member: data.admin_only_add_member || false,
        user_id: user?.id || '',
      }
      
      // Incluir campos do sistema de links universais se estiverem presentes
      const requestData = {
        ...createData,
        enable_universal_link: data.enable_universal_link,
        system_phone: data.system_phone,
      }
      
      console.log('🔧 DEBUG: Dados sendo enviados para createGroup:', requestData)
      console.log('🔧 DEBUG: enable_universal_link:', data.enable_universal_link)
      console.log('🔧 DEBUG: system_phone:', data.system_phone)
      
      const result = await createGroup(requestData)
      
      if (result.success) {
        setShowGroupForm(false)
        setIsCreatingUniversal(false)
        
        // Recarregar grupos universais se foi criado um grupo universal
        if (isCreatingUniversal) {
          await fetchUniversalGroups()
        }
        
        // Grupo criado com sucesso
        
        // Aviso se houver
        if (result.warning) {
          console.warn('Aviso:', result.warning)
        }
      } else {
        setActionError(result.error || 'Erro ao criar grupo')
      }
      
      // Retornar o resultado para o GroupForm
      return result
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao criar grupo')
      // Retornar erro para o GroupForm
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar grupo' }
    } finally {
      setActionLoading(false)
    }
  }, [createGroup, toast, user?.id])

  const handleUpdateGroup = useCallback(async (
    data: Partial<Database['public']['Tables']['whatsapp_groups']['Update']> & { settings?: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    console.log('🔧 DEBUG: handleUpdateGroup chamado com data:', data)
    console.log('🔧 DEBUG: selectedGroup:', selectedGroup)
    
    if (!selectedGroup) return { success: false, error: 'Nenhum grupo selecionado' }

    setActionLoading(true)
    setActionError(null)
    try {
      console.log('🔧 DEBUG: Verificando condições de atualização...')
      console.log('🔧 DEBUG: data.name:', data.name, 'tipo:', typeof data.name)
      console.log('🔧 DEBUG: data.description:', data.description)
      console.log('🔧 DEBUG: Object.keys(data).length:', Object.keys(data).length)
      
      // Se apenas o nome está sendo atualizado, usar a API específica
      if (data.name && typeof data.name === 'string' && data.description === undefined) {
        console.log('🔄 Atualizando apenas o nome do grupo via API específica')
        const result = await updateGroup(selectedGroup.id, { name: data.name })
        
        if (result.success) {
          setShowGroupForm(false)
          setSelectedGroup(null)
          
          // Nome do grupo atualizado com sucesso
        }
        
        return result
      }

      // Se apenas a descrição está sendo atualizada, usar a API específica
      if (data.description !== undefined && !data.name) {
        console.log('🔄 Atualizando apenas a descrição do grupo via API específica')
        const result = await updateGroup(selectedGroup.id, { description: data.description })
        
        if (result.success) {
          setShowGroupForm(false)
          setSelectedGroup(null)
          
          // Descrição do grupo atualizada com sucesso
        }
        
        return result
      }

      // Se nome e descrição estão sendo atualizados, usar APIs específicas
      if (data.name && data.description !== undefined) {
        console.log('🔄 Atualizando nome e descrição do grupo via APIs específicas')
        
        // Atualizar nome primeiro
        const nameResult = await updateGroup(selectedGroup.id, { name: data.name })
        if (!nameResult.success) {
          return nameResult
        }
        
        // Atualizar descrição
        const descResult = await updateGroup(selectedGroup.id, { description: data.description })
        if (!descResult.success) {
          return descResult
        }
        
        setShowGroupForm(false)
        setSelectedGroup(null)
        
        // Grupo atualizado com sucesso
        
        return { success: true, data: descResult.data }
      }
      
      // Para outras atualizações, usar o método completo
      const updateData: Database['public']['Tables']['whatsapp_groups']['Update'] =
        {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.participants && { participants: data.participants }),
          ...(data.whatsapp_id && { whatsapp_id: data.whatsapp_id }),
          // Incluir configurações diretamente do objeto data
          ...(data.admin_only_message !== undefined && { admin_only_message: data.admin_only_message }),
          ...(data.admin_only_settings !== undefined && { admin_only_settings: data.admin_only_settings }),
          ...(data.require_admin_approval !== undefined && { require_admin_approval: data.require_admin_approval }),
          ...(data.admin_only_add_member !== undefined && { admin_only_add_member: data.admin_only_add_member }),
          updated_at: new Date().toISOString(),
        }

      const result = await updateGroup(selectedGroup.id, updateData)
      
      if (result.success) {
        // Aplicar configurações do grupo se fornecidas
        if ((data.admin_only_message !== undefined || data.admin_only_settings !== undefined || 
             data.require_admin_approval !== undefined || data.admin_only_add_member !== undefined) 
            && selectedGroup.whatsapp_id) {
          try {
            console.log('⚙️ Aplicando configurações do grupo:', {
              admin_only_message: data.admin_only_message,
              admin_only_settings: data.admin_only_settings,
              require_admin_approval: data.require_admin_approval,
              admin_only_add_member: data.admin_only_add_member,
            })
            
            // Usar a nova API route para atualizar configurações
            const settingsResponse = await fetch(`/api/groups/${selectedGroup.id}/settings`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                admin_only_message: data.admin_only_message,
                admin_only_settings: data.admin_only_settings,
                require_admin_approval: data.require_admin_approval,
                admin_only_add_member: data.admin_only_add_member,
              })
            })

            const settingsResult = await settingsResponse.json()
            
            if (settingsResponse.ok) {
              console.log('✅ Configurações do grupo aplicadas com sucesso via API')
            } else {
              console.warn('⚠️ Erro ao aplicar configurações do grupo via API:', settingsResult.error)
            }
          } catch (error) {
            console.error('❌ Erro ao aplicar configurações do grupo:', error)
          }
        }
        
        setShowGroupForm(false)
        setSelectedGroup(null)
        
        // Grupo atualizado com sucesso
      }
      
      // Retornar o resultado para o GroupForm
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar grupo'
      setActionError(errorMessage)
      // Retornar erro para o GroupForm
      return { success: false, error: errorMessage }
    } finally {
      setActionLoading(false)
    }
  }, [selectedGroup, updateGroup, toast])

  const handleDeleteGroup = async (groupId: string) => {
    setActionLoading(true)
    setActionError(null)
    try {
      await deleteGroup(groupId)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao excluir grupo'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    setActionLoading(true)
    setActionError(null)
    try {
      console.log('🚪 Saindo do grupo:', groupId)
      
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao sair do grupo')
      }

      if (result.success) {
        // Usuário saiu do grupo com sucesso
        
        // Remover o grupo da lista local
        // A lista será atualizada automaticamente pelo hook useWhatsAppGroups
      } else {
        throw new Error(result.error || 'Erro ao sair do grupo')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sair do grupo'
      setActionError(errorMessage)
      // Erro ao sair do grupo
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddParticipant = async (
    groupId: string,
    participantPhone: string
  ) => {
    setActionLoading(true)
    setActionError(null)
    try {
      await addParticipant(groupId, participantPhone)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao adicionar participante'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveParticipant = async (
    groupId: string,
    participantPhone: string
  ) => {
    setActionLoading(true)
    setActionError(null)
    try {
      await removeParticipant(groupId, participantPhone)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao remover participante'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleSyncGroup = async (groupId: string) => {
    setActionLoading(true)
    setActionError(null)
    try {
      await syncGroupParticipants(groupId)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao sincronizar grupo'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleSyncAll = async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      const result = await syncGroupsFromWhatsApp()
      
      if (result.success) {
        // Recarregar grupos após sincronização
        await refreshGroups()
      } else {
        setActionError(result.error || 'Erro ao sincronizar grupos')
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao sincronizar grupos'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditGroup = (group: Group) => {
    console.log('🔧 DEBUG: handleEditGroup chamado com group:', group)
    setSelectedGroup(group)
    setShowGroupForm(true)
  }

  const handleManageParticipants = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      setSelectedGroup(group)
      setShowParticipantManager(true)
    }
  }

  const handleManageGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      setSelectedGroup(group)
      setShowGroupManagement(true)
    }
  }

  const handleViewMessages = (groupId: string) => {
    // Navigate to group chat
    window.location.href = `/dashboard/groups/${groupId}/chat`
  }

  const handleViewNotifications = (groupId: string) => {
    // Navigate to notifications page filtered by group
    window.location.href = `/dashboard/notifications?group=${groupId}`
  }

  const getTotalParticipants = () => {
    return groups.reduce(
      (total, group) => total + (group.participants?.length || 0),
      0
    )
  }

  const getActiveGroups = () => {
    return groups.filter(
      (group) => group.participants && group.participants.length > 0
    ).length
  }

  // Memoize the onOpenChange callback for GroupForm
  const handleGroupFormOpenChange = useCallback((open: boolean) => {
    setShowGroupForm(open)
    if (!open) {
      setSelectedGroup(null)
      setIsCreatingUniversal(false)
    }
  }, [])

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Show error if no user
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupos WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie seus grupos e participantes do WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refreshGroups}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncAll}
            disabled={syncing || actionLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`}
            />
            Sincronizar
          </Button>
          <Button onClick={() => setShowGroupForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {(error || actionError || syncError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || actionError || syncError}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Grupos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveGroups()} grupos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Participantes
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalParticipants()}</div>
            <p className="text-xs text-muted-foreground">Em todos os grupos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status da Sincronização
            </CardTitle>
            {syncing ? (
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncing ? 'Sincronizando...' : 'Conectado'}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncing ? 'Atualizando grupos' : 'Pronto para sincronizar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Grupos
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar Grupos
          </TabsTrigger>
          <TabsTrigger value="universal" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Grupos WhatsApp Universal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <GroupList
            groups={currentPageGroups}
            loading={loading}
            error={error}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
            onSync={handleSyncGroup}
            onSyncAll={handleSyncAll}
            onViewMessages={handleViewMessages}
            onLeave={handleLeaveGroup}
            onCreateGroup={() => setShowGroupForm(true)}
            groupNotifications={groupNotifications}
            onViewNotifications={handleViewNotifications}
          />
          {groups.length > ITEMS_PER_PAGE && (
            <GroupsPagination
              pagination={groupsPagination}
              totalItems={groups.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </TabsContent>
        
        <TabsContent value="search">
          <GroupsSearch
            onGroupSelect={handleEditGroup}
            onGroupEdit={handleEditGroup}
            onGroupDelete={handleDeleteGroup}
          />
        </TabsContent>

        <TabsContent value="universal">
          <div className="space-y-4">
            {/* Estatísticas dos Grupos Universais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{universalGroups.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Grupos com link universal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {universalGroups.reduce((total, group) => total + (group.participants?.length || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em todos os grupos universais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Famílias Ativas</CardTitle>
                  <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(universalGroups.map(g => g.family_name).filter(Boolean)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Famílias de grupos universais
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Botão para criar grupo universal */}
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  setSelectedGroup(null)
                  setIsCreatingUniversal(true)
                  setShowGroupForm(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Grupo Universal
              </Button>
            </div>

            {/* Lista de Grupos Universais */}
            {universalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{universalError}</AlertDescription>
              </Alert>
            )}

            {universalLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Carregando grupos universais...</p>
                </div>
              </div>
            ) : universalGroups.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Link className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum grupo universal encontrado
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Você ainda não criou nenhum grupo com link universal.
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedGroup(null)
                      setIsCreatingUniversal(true)
                      setShowGroupForm(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Grupo Universal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <GroupList
                  groups={currentPageUniversalGroups}
                  loading={universalLoading}
                  error={universalError}
                  onEdit={handleEditGroup}
                  onDelete={handleDeleteGroup}
                  onSync={handleSyncGroup}
                  onSyncAll={handleSyncAll}
                  onViewMessages={handleViewMessages}
                  onLeave={handleLeaveGroup}
                  onCreateGroup={() => {
                    setSelectedGroup(null)
                    setIsCreatingUniversal(true)
                    setShowGroupForm(true)
                  }}
                  groupNotifications={groupNotifications}
                  onViewNotifications={handleViewNotifications}
                />
                {universalGroups.length > ITEMS_PER_PAGE && (
                  <GroupsPagination
                    pagination={universalGroupsPagination}
                    totalItems={universalGroups.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Group Form Dialog */}
      <GroupForm
        open={showGroupForm}
        onOpenChange={handleGroupFormOpenChange}
        group={selectedGroup}
        onSubmit={(data) => {
          console.log('🔧 DEBUG: onSubmit chamado, selectedGroup:', selectedGroup)
          console.log('🔧 DEBUG: Usando função:', selectedGroup ? 'handleUpdateGroup' : 'handleCreateGroup')
          return selectedGroup ? handleUpdateGroup(data) : handleCreateGroup(data)
        }}
        loading={actionLoading}
        error={actionError}
        disableUniversalLink={!isCreatingUniversal}
      />
      

      {/* Participant Manager Dialog */}
      <ParticipantManager
        open={showParticipantManager}
        onOpenChange={(open) => {
          setShowParticipantManager(open)
          if (!open) setSelectedGroup(null)
        }}
        group={selectedGroup!}
        onAddParticipant={handleAddParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        loading={actionLoading}
        error={actionError}
      />

      {/* Group Management Dialog */}
      {selectedGroup && showGroupManagement && (
        <GroupManagement
          groupId={selectedGroup.whatsapp_id || selectedGroup.id}
          groupName={selectedGroup.name}
          participants={selectedGroup.participants?.map(phone => ({
            phone,
            isAdmin: false, // Será atualizado quando os metadados forem carregados
            isSuperAdmin: false // Será atualizado quando os metadados forem carregados
          })) || []}
          onUpdate={() => {
            refreshGroups()
            setShowGroupManagement(false)
            setSelectedGroup(null)
          }}
        />
      )}
    </div>
  )
}
