'use client'

import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export function RealtimeStatus() {
  const { isConnected, lastEvent, connect, disconnect } = useRealtimeNotifications()
  const [isManualReconnecting, setIsManualReconnecting] = useState(false)

  const handleReconnect = async () => {
    setIsManualReconnecting(true)
    disconnect()
    
    // Aguardar um pouco antes de reconectar
    setTimeout(() => {
      connect()
      setIsManualReconnecting(false)
    }, 1000)
  }

  const getStatusColor = () => {
    if (isManualReconnecting) return 'bg-yellow-500'
    return isConnected ? 'bg-green-500' : 'bg-red-500'
  }

  const getStatusText = () => {
    if (isManualReconnecting) return 'Reconectando...'
    return isConnected ? 'Conectado' : 'Desconectado'
  }

  const getStatusIcon = () => {
    if (isManualReconnecting) return <RefreshCw className="h-3 w-3 animate-spin" />
    return isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className={`${getStatusColor()} text-white border-0 flex items-center gap-1`}
      >
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      
      {!isConnected && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          disabled={isManualReconnecting}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isManualReconnecting ? 'animate-spin' : ''}`} />
          Reconectar
        </Button>
      )}
      
      {lastEvent && (
        <div className="text-xs text-muted-foreground">
          Última atualização: {new Date(lastEvent.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
