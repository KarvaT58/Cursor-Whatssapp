'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Zap,
  Copy,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { ZApiInstanceForm } from './z-api-instance-form'

type ZApiInstance = Database['public']['Tables']['z_api_instances']['Row']

interface ZApiSettingsProps {
  instances: ZApiInstance[]
}

export function ZApiSettings({ instances }: ZApiSettingsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingInstance, setEditingInstance] = useState<ZApiInstance | null>(
    null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [instanceToDelete, setInstanceToDelete] = useState<ZApiInstance | null>(
    null
  )
  const [testingConnection, setTestingConnection] = useState<string | null>(
    null
  )
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; error?: string; data?: unknown }>
  >({})

  const {
    updateZApiInstance,
    deleteZApiInstance,
    setActiveZApiInstance,
    testZApiConnection,
  } = useSettings()

  const handleCreateInstance = () => {
    setEditingInstance(null)
    setShowForm(true)
  }

  const handleEditInstance = (instance: ZApiInstance) => {
    setEditingInstance(instance)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingInstance(null)
  }

  const handleDeleteClick = (instance: ZApiInstance) => {
    setInstanceToDelete(instance)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (instanceToDelete) {
      try {
        await deleteZApiInstance(instanceToDelete.id)
        setDeleteDialogOpen(false)
        setInstanceToDelete(null)
      } catch (err) {
        console.error('Erro ao deletar instância:', err)
      }
    }
  }

  const handleToggleActive = async (instance: ZApiInstance) => {
    try {
      if (instance.is_active) {
        // Desativar instância
        await updateZApiInstance(instance.id, { is_active: false })
      } else {
        // Ativar instância
        await setActiveZApiInstance(instance.id)
      }
    } catch (error) {
      console.error('Erro ao alterar status da instância:', error)
    }
  }

  const handleTestConnection = async (instance: ZApiInstance) => {
    setTestingConnection(instance.id)
    try {
      const result = await testZApiConnection(instance)
      setTestResults((prev) => ({
        ...prev,
        [instance.id]: result,
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [instance.id]: {
          success: false,
          error: 'Erro ao testar conexão',
        },
      }))
    } finally {
      setTestingConnection(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não disponível'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (isActive: boolean | null) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  const getStatusLabel = (isActive: boolean | null) => {
    return isActive ? 'Ativa' : 'Inativa'
  }

  const getStatusIcon = (isActive: boolean | null) => {
    return isActive ? (
      <CheckCircle className="size-4" />
    ) : (
      <XCircle className="size-4" />
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Instâncias Z-API</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie suas instâncias do WhatsApp Business API
            </p>
          </div>
          <Button
            onClick={handleCreateInstance}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Nova Instância
          </Button>
        </div>

        {/* Instances List */}
        {instances.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                Nenhuma instância configurada
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure uma instância Z-API para começar a usar o WhatsApp
              </p>
              <Button onClick={handleCreateInstance}>
                <Plus className="size-4 mr-2" />
                Configurar Primeira Instância
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instances.map((instance) => (
              <Card
                key={instance.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="size-4" />
                        {instance.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`${getStatusColor(instance.is_active)} flex items-center gap-1`}
                        >
                          {getStatusIcon(instance.is_active)}
                          {getStatusLabel(instance.is_active)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditInstance(instance)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(instance)}
                        >
                          {instance.is_active ? (
                            <>
                              <Pause className="size-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Play className="size-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTestConnection(instance)}
                          disabled={testingConnection === instance.id}
                        >
                          <ExternalLink className="size-4 mr-2" />
                          {testingConnection === instance.id
                            ? 'Testando...'
                            : 'Testar Conexão'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(instance)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Instance ID:
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(instance.instance_id)}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                      <Input
                        value={instance.instance_id}
                        readOnly
                        className="text-xs bg-muted"
                      />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>
                          Criada em: {formatDate(instance.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Test Results */}
                    {testResults[instance.id] && (
                      <div className="mt-2">
                        {testResults[instance.id].success ? (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="size-4" />
                            <span>Conexão OK</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <XCircle className="size-4" />
                            <span>Erro: {testResults[instance.id].error}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleTestConnection(instance)}
                        disabled={testingConnection === instance.id}
                      >
                        <ExternalLink className="size-3 mr-1" />
                        {testingConnection === instance.id
                          ? 'Testando...'
                          : 'Testar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Instance Form Modal */}
      {showForm && (
        <ZApiInstanceForm
          instance={editingInstance}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir instância Z-API</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a instância &quot;
              {instanceToDelete?.name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
