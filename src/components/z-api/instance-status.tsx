'use client'

import { useState, useEffect } from 'react'
import { useZApi } from '@/hooks/use-z-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Wifi,
  WifiOff,
  Smartphone,
  Battery,
  QrCode,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface InstanceStatusProps {
  instanceId: string
  instanceName: string
  onStatusChange?: (status: {
    connected: boolean
    phone?: string
    name?: string
    profilePic?: string
    battery?: number
  }) => void
}

export function InstanceStatus({
  instanceId,
  instanceName,
  onStatusChange,
}: InstanceStatusProps) {
  const [status, setStatus] = useState<{
    connected: boolean
    phone?: string
    name?: string
    profilePic?: string
    battery?: number
  } | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQrCode, setShowQrCode] = useState(false)
  const { loading, error, getStatus, getQrCode } = useZApi()

  const fetchStatus = async () => {
    const result = await getStatus(instanceId)
    if (result.success && result.status) {
      setStatus(result.status)
      onStatusChange?.(result.status)
    }
  }

  const fetchQrCode = async () => {
    const result = await getQrCode(instanceId)
    if (result.success && result.qrCode) {
      setQrCode(result.qrCode)
      setShowQrCode(true)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [instanceId, fetchStatus])

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="size-4" />

    if (status.connected) {
      return <CheckCircle className="size-4 text-green-500" />
    } else {
      return <XCircle className="size-4 text-red-500" />
    }
  }

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary">Verificando...</Badge>

    if (status.connected) {
      return (
        <Badge variant="default" className="bg-green-500">
          Conectado
        </Badge>
      )
    } else {
      return <Badge variant="destructive">Desconectado</Badge>
    }
  }

  const getBatteryColor = (battery?: number) => {
    if (!battery) return 'text-muted-foreground'
    if (battery > 50) return 'text-green-500'
    if (battery > 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {instanceName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
            >
              <RefreshCw
                className={`size-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="size-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {status && (
          <>
            {status.connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wifi className="size-4 text-green-500" />
                  <span className="text-sm font-medium">
                    WhatsApp Conectado
                  </span>
                </div>

                {status.phone && (
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4" />
                    <span className="text-sm">{status.phone}</span>
                  </div>
                )}

                {status.name && (
                  <div className="text-sm text-muted-foreground">
                    Nome: {status.name}
                  </div>
                )}

                {status.battery !== undefined && (
                  <div className="flex items-center gap-2">
                    <Battery
                      className={`size-4 ${getBatteryColor(status.battery)}`}
                    />
                    <span
                      className={`text-sm ${getBatteryColor(status.battery)}`}
                    >
                      {status.battery}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <WifiOff className="size-4 text-red-500" />
                  <span className="text-sm font-medium">
                    WhatsApp Desconectado
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Conecte seu WhatsApp escaneando o QR Code
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchQrCode}
                  disabled={loading}
                  className="w-full"
                >
                  <QrCode className="size-4 mr-2" />
                  Obter QR Code
                </Button>
              </div>
            )}
          </>
        )}

        {showQrCode && qrCode && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-center">
                <h4 className="font-medium mb-2">QR Code para Conectar</h4>
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Escaneie este QR Code com seu WhatsApp
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQrCode(false)}
                className="w-full"
              >
                Fechar QR Code
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
