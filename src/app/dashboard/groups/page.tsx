'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useWhatsAppGroups } from '@/hooks/use-whatsapp-groups'
import { useGroupSync } from '@/hooks/use-group-sync'
import { GroupList } from '@/components/groups/group-list'
import { GroupsSearch } from '@/components/groups/groups-search'
import { GroupForm } from '@/components/groups/group-form'
import { ParticipantManager } from '@/components/groups/participant-manager'
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
} from 'lucide-react'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [showParticipantManager, setShowParticipantManager] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    addParticipant,
    removeParticipant,
  } = useWhatsAppGroups({ userId: user?.id })

  const { syncing, syncError, syncGroupsFromWhatsApp, syncGroupParticipants } =
    useGroupSync({
      userId: user?.id,
      instanceId: 'default', // TODO: Get from user's active instance
    })

  // Reset error when component mounts
  useEffect(() => {
    setActionError(null)
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

  const handleCreateGroup = async (
    data: Partial<Database['public']['Tables']['whatsapp_groups']['Insert']>
  ) => {
    setActionLoading(true)
    setActionError(null)
    try {
      // Ensure required fields are present
      if (!data.name) {
        throw new Error('Nome é obrigatório')
      }

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const groupData: Database['public']['Tables']['whatsapp_groups']['Insert'] =
        {
          name: data.name,
          whatsapp_id: data.whatsapp_id || `temp_${Date.now()}`, // Temporary ID if not provided
          description: data.description || null,
          participants: data.participants || [],
          user_id: user.id,
        }

      await createGroup(groupData)
      setShowGroupForm(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao criar grupo')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateGroup = async (
    data: Partial<Database['public']['Tables']['whatsapp_groups']['Update']>
  ) => {
    if (!selectedGroup) return

    setActionLoading(true)
    setActionError(null)
    try {
      const updateData: Database['public']['Tables']['whatsapp_groups']['Update'] =
        {
          name: data.name,
          description: data.description,
          participants: data.participants,
          whatsapp_id: data.whatsapp_id,
          updated_at: new Date().toISOString(),
        }

      await updateGroup(selectedGroup.id, updateData)
      setShowGroupForm(false)
      setSelectedGroup(null)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao atualizar grupo'
      )
    } finally {
      setActionLoading(false)
    }
  }

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
      await syncGroupsFromWhatsApp()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao sincronizar grupos'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditGroup = (group: Group) => {
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

  const handleViewMessages = (groupId: string) => {
    // Navigate to group chat
    window.location.href = `/dashboard/groups/${groupId}/chat`
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
        </TabsList>
        
        <TabsContent value="list">
          <GroupList
            groups={groups}
            loading={loading}
            error={error}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
            onAddParticipant={handleManageParticipants}
            onRemoveParticipant={handleRemoveParticipant}
            onSync={handleSyncGroup}
            onSyncAll={handleSyncAll}
            onViewMessages={handleViewMessages}
            onCreateGroup={() => setShowGroupForm(true)}
          />
        </TabsContent>
        
        <TabsContent value="search">
          <GroupsSearch
            onGroupSelect={handleEditGroup}
            onGroupEdit={handleEditGroup}
            onGroupDelete={handleDeleteGroup}
          />
        </TabsContent>
      </Tabs>

      {/* Group Form Dialog */}
      <GroupForm
        open={showGroupForm}
        onOpenChange={(open) => {
          setShowGroupForm(open)
          if (!open) setSelectedGroup(null)
        }}
        group={selectedGroup}
        onSubmit={selectedGroup ? handleUpdateGroup : handleCreateGroup}
        loading={actionLoading}
        error={actionError}
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
    </div>
  )
}
