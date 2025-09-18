'use client'

import { useState } from 'react'
import { useAdvancedSync } from '@/hooks/use-advanced-sync'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw, 
  Download, 
  Upload, 
  Users, 
  Shield, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface AdvancedSyncPanelProps {
  instanceId?: string
}

export function AdvancedSyncPanel({ instanceId }: AdvancedSyncPanelProps) {
  const {
    isSyncing,
    syncError,
    lastSyncResult,
    syncGroupsFromWhatsApp,
    syncGroupsToWhatsApp,
    syncCommunitiesFromWhatsApp,
    syncCommunitiesToWhatsApp,
    syncAllFromWhatsApp,
    syncAllToWhatsApp,
    clearError
  } = useAdvancedSync()

  const [syncOptions, setSyncOptions] = useState({
    forceUpdate: false,
    includeParticipants: true,
    includeAdmins: true,
    includeMessages: false,
    includeAnnouncements: false,
    batchSize: 50
  })

  const [selectedDirection, setSelectedDirection] = useState<'from_whatsapp' | 'to_whatsapp' | 'bidirectional'>('from_whatsapp')

  const handleSync = async (type: string) => {
    if (!instanceId) {
      alert('Instância Z-API não configurada')
      return
    }

    try {
      let result
      
      switch (type) {
        case 'groups_from':
          result = await syncGroupsFromWhatsApp(syncOptions)
          break
        case 'groups_to':
          result = await syncGroupsToWhatsApp(syncOptions)
          break
        case 'communities_from':
          result = await syncCommunitiesFromWhatsApp(syncOptions)
          break
        case 'communities_to':
          result = await syncCommunitiesToWhatsApp(syncOptions)
          break
        case 'all_from':
          result = await syncAllFromWhatsApp(syncOptions)
          break
        case 'all_to':
          result = await syncAllToWhatsApp(syncOptions)
          break
        default:
          return
      }

      if (result.success) {
        console.log('Sincronização concluída:', result)
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
    }
  }

  const getStatusIcon = () => {
    if (isSyncing) return <Clock className="h-4 w-4 animate-spin" />
    if (syncError) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (lastSyncResult?.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <RefreshCw className="h-4 w-4" />
  }

  const getStatusColor = () => {
    if (isSyncing) return 'bg-blue-500'
    if (syncError) return 'bg-red-500'
    if (lastSyncResult?.success) return 'bg-green-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Sincronização Avançada
          </CardTitle>
          <CardDescription>
            Gerencie a sincronização bidirecional entre o sistema e o WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={getStatusColor()}>
              {isSyncing ? 'Sincronizando...' : syncError ? 'Erro' : lastSyncResult?.success ? 'Concluído' : 'Pronto'}
            </Badge>
            {lastSyncResult?.stats && (
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>Criados: {lastSyncResult.stats.created}</span>
                <span>Atualizados: {lastSyncResult.stats.updated}</span>
                <span>Removidos: {lastSyncResult.stats.deleted}</span>
                {lastSyncResult.stats.errors > 0 && (
                  <span className="text-red-500">Erros: {lastSyncResult.stats.errors}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opções de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Sincronização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direção</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedDirection === 'from_whatsapp' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDirection('from_whatsapp')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Do WhatsApp
                </Button>
                <Button
                  variant={selectedDirection === 'to_whatsapp' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDirection('to_whatsapp')}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Para WhatsApp
                </Button>
                <Button
                  variant={selectedDirection === 'bidirectional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDirection('bidirectional')}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Bidirecional
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tamanho do Lote</Label>
              <input
                type="number"
                min="1"
                max="100"
                value={syncOptions.batchSize}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 50 }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forceUpdate"
                  checked={syncOptions.forceUpdate}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, forceUpdate: !!checked }))}
                />
                <Label htmlFor="forceUpdate">Forçar Atualização</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeParticipants"
                  checked={syncOptions.includeParticipants}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, includeParticipants: !!checked }))}
                />
                <Label htmlFor="includeParticipants" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Incluir Participantes
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAdmins"
                  checked={syncOptions.includeAdmins}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, includeAdmins: !!checked }))}
                />
                <Label htmlFor="includeAdmins" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Incluir Administradores
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMessages"
                  checked={syncOptions.includeMessages}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, includeMessages: !!checked }))}
                />
                <Label htmlFor="includeMessages" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Incluir Mensagens
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Sincronização */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sincronização de Grupos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grupos</CardTitle>
            <CardDescription>Sincronizar grupos do WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => handleSync('groups_from')}
              disabled={isSyncing}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Do WhatsApp
            </Button>
            <Button
              onClick={() => handleSync('groups_to')}
              disabled={isSyncing}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Para WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Sincronização de Comunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comunidades</CardTitle>
            <CardDescription>Sincronizar comunidades do WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => handleSync('communities_from')}
              disabled={isSyncing}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Do WhatsApp
            </Button>
            <Button
              onClick={() => handleSync('communities_to')}
              disabled={isSyncing}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Para WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Sincronização Completa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sincronização Completa</CardTitle>
            <CardDescription>Sincronizar tudo de uma vez</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => handleSync('all_from')}
              disabled={isSyncing}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Tudo do WhatsApp
            </Button>
            <Button
              onClick={() => handleSync('all_to')}
              disabled={isSyncing}
              className="w-full"
              variant="secondary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Tudo para WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progresso */}
      {isSyncing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sincronizando...</span>
                <span>Processando dados</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagens de Erro */}
      {syncError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {syncError}
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Limpar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Resultado da Última Sincronização */}
      {lastSyncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastSyncResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Última Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{lastSyncResult.stats?.created || 0}</div>
                  <div className="text-muted-foreground">Criados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{lastSyncResult.stats?.updated || 0}</div>
                  <div className="text-muted-foreground">Atualizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{lastSyncResult.stats?.deleted || 0}</div>
                  <div className="text-muted-foreground">Removidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{lastSyncResult.stats?.errors || 0}</div>
                  <div className="text-muted-foreground">Erros</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
