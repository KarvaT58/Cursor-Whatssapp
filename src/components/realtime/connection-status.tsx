'use client'

import { useRealtime } from '@/providers/realtime-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  showDetails?: boolean
  className?: string
}

export function ConnectionStatus({
  showDetails = false,
  className,
}: ConnectionStatusProps) {
  const { connectionStatus, lastConnectedAt, reconnectAttempts, reconnect } =
    useRealtime()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Conectado',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        }
      case 'connecting':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          label: 'Conectando...',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        }
      case 'reconnecting':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          label: `Reconectando... (${reconnectAttempts}/5)`,
          variant: 'secondary' as const,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        }
      case 'disconnected':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Desconectado',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        }
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Desconhecido',
          variant: 'secondary' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        }
    }
  }

  const statusConfig = getStatusConfig()

  if (!showDetails) {
    return (
      <Badge
        variant={statusConfig.variant}
        className={cn('flex items-center gap-1', className)}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={statusConfig.variant}
            className="flex items-center gap-1"
          >
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>

          {connectionStatus === 'disconnected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={reconnect}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reconectar
            </Button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="text-xs text-muted-foreground space-y-1">
          {lastConnectedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última conexão:{' '}
              {formatDistanceToNow(lastConnectedAt, {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          )}

          {reconnectAttempts > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Tentativas de reconexão: {reconnectAttempts}/5
            </div>
          )}

          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Status da rede: {navigator.onLine ? 'Online' : 'Offline'}
          </div>
        </div>
      )}
    </div>
  )
}
