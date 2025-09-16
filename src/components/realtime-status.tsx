'use client'

import { useRealtime } from '@/providers/realtime-provider'
import { Badge } from '@/components/ui/badge'
import { IconWifi, IconWifiOff } from '@tabler/icons-react'

export function RealtimeStatus() {
  const { isConnected } = useRealtime()

  return (
    <Badge
      variant={isConnected ? 'default' : 'destructive'}
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <>
          <IconWifi className="size-3" />
          Conectado
        </>
      ) : (
        <>
          <IconWifiOff className="size-3" />
          Desconectado
        </>
      )}
    </Badge>
  )
}
