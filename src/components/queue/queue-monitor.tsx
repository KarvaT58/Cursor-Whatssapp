'use client'

import { useState } from 'react'
import { useQueue } from '@/hooks/use-queue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export function QueueMonitor() {
  const {
    stats,
    loading,
    error,
    fetchQueueStats,
    clearQueue,
    pauseQueue,
    resumeQueue,
  } = useQueue()

  const [clearingQueue, setClearingQueue] = useState<string | null>(null)
  const [pausingQueue, setPausingQueue] = useState<string | null>(null)
  const [resumingQueue, setResumingQueue] = useState<string | null>(null)

  const handleClearQueue = async (queueName: string) => {
    setClearingQueue(queueName)
    try {
      await clearQueue(queueName)
    } catch (err) {
      console.error('Error clearing queue:', err)
    } finally {
      setClearingQueue(null)
    }
  }

  const handlePauseQueue = async (queueName: string) => {
    setPausingQueue(queueName)
    try {
      await pauseQueue(queueName)
    } catch (err) {
      console.error('Error pausing queue:', err)
    } finally {
      setPausingQueue(null)
    }
  }

  const handleResumeQueue = async (queueName: string) => {
    setResumingQueue(queueName)
    try {
      await resumeQueue(queueName)
    } catch (err) {
      console.error('Error resuming queue:', err)
    } finally {
      setResumingQueue(null)
    }
  }

  const getQueueDisplayName = (queueName: string) => {
    switch (queueName) {
      case 'campaignMessages':
        return 'Mensagens de Campanha'
      case 'campaignNotifications':
        return 'Notificações de Campanha'
      case 'messageRetry':
        return 'Tentativas de Mensagem'
      default:
        return queueName
    }
  }

  const getTotalJobs = (queueStats: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }) => {
    return (
      queueStats.waiting +
      queueStats.active +
      queueStats.completed +
      queueStats.failed +
      queueStats.delayed
    )
  }

  const getProgressPercentage = (queueStats: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }) => {
    const total = getTotalJobs(queueStats)
    if (total === 0) return 0
    return Math.round((queueStats.completed / total) * 100)
  }

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Filas
          </CardTitle>
          <CardDescription>
            Carregando estatísticas das filas...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Filas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitor de Filas
            </CardTitle>
            <CardDescription>
              Status das filas de processamento de campanhas
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueueStats}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats &&
          Object.entries(stats).map(([queueName, queueStats]) => (
            <div key={queueName} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {getQueueDisplayName(queueName)}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePauseQueue(queueName)}
                    disabled={pausingQueue === queueName}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    {pausingQueue === queueName ? 'Pausando...' : 'Pausar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResumeQueue(queueName)}
                    disabled={resumingQueue === queueName}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {resumingQueue === queueName ? 'Retomando...' : 'Retomar'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={clearingQueue === queueName}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {clearingQueue === queueName ? 'Limpando...' : 'Limpar'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar Fila</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja limpar a fila &quot;
                          {getQueueDisplayName(queueName)}&quot;? Esta ação não
                          pode ser desfeita e removerá todos os jobs pendentes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleClearQueue(queueName)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Limpar Fila
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Aguardando</span>
                  </div>
                  <Badge variant="secondary">{queueStats.waiting}</Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Ativo</span>
                  </div>
                  <Badge variant="secondary">{queueStats.active}</Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Concluído</span>
                  </div>
                  <Badge variant="secondary">{queueStats.completed}</Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Falhou</span>
                  </div>
                  <Badge variant="secondary">{queueStats.failed}</Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Atrasado</span>
                  </div>
                  <Badge variant="secondary">{queueStats.delayed}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{getProgressPercentage(queueStats)}%</span>
                </div>
                <Progress
                  value={getProgressPercentage(queueStats)}
                  className="h-2"
                />
              </div>
            </div>
          ))}

        {stats && Object.keys(stats).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma fila ativa encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
