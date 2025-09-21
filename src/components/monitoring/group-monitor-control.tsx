'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Play, Square, Clock, Phone, Shield } from 'lucide-react'

interface MonitorStatus {
  isRunning: boolean
  checkInterval: number
  adminPhone: string
}

export function GroupMonitorControl() {
  const [status, setStatus] = useState<MonitorStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [adminPhone, setAdminPhone] = useState('(45) 91284-3589')
  const [checkInterval, setCheckInterval] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Carregar status inicial
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/monitoring/group-monitor')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
        if (data.data.adminPhone) {
          setAdminPhone(data.data.adminPhone)
        }
        if (data.data.checkInterval) {
          setCheckInterval(data.data.checkInterval / 1000) // Converter para segundos
        }
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error)
    }
  }

  const startMonitor = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/monitoring/group-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          adminPhone: adminPhone,
          checkInterval: checkInterval * 1000 // Converter para milissegundos
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Monitor iniciado com sucesso!')
        await fetchStatus()
      } else {
        setError(data.error || 'Erro ao iniciar monitor')
      }
    } catch (error) {
      setError('Erro ao iniciar monitor')
    } finally {
      setIsLoading(false)
    }
  }

  const stopMonitor = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/monitoring/group-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Monitor parado com sucesso!')
        await fetchStatus()
      } else {
        setError(data.error || 'Erro ao parar monitor')
      }
    } catch (error) {
      setError('Erro ao parar monitor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Monitor de Grupos
        </CardTitle>
        <CardDescription>
          Sistema de monitoramento automático que verifica novos participantes e remove automaticamente contatos da blacklist
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status do Monitor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={status?.isRunning ? "default" : "secondary"}>
              {status?.isRunning ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          
          {status?.isRunning && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {checkInterval}s
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {adminPhone}
              </div>
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Telefone do Administrador</Label>
              <Input
                id="adminPhone"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="(45) 91284-3589"
                disabled={status?.isRunning}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkInterval">Intervalo de Verificação (segundos)</Label>
              <Input
                id="checkInterval"
                type="number"
                value={checkInterval}
                onChange={(e) => setCheckInterval(Number(e.target.value))}
                min="10"
                max="300"
                disabled={status?.isRunning}
              />
            </div>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          {!status?.isRunning ? (
            <Button 
              onClick={startMonitor} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Iniciar Monitor
            </Button>
          ) : (
            <Button 
              onClick={stopMonitor} 
              disabled={isLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Parar Monitor
            </Button>
          )}
          
          <Button 
            onClick={fetchStatus} 
            variant="outline"
            disabled={isLoading}
          >
            Atualizar Status
          </Button>
        </div>

        {/* Informações do Sistema */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Como funciona:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verifica todos os grupos ativos a cada {checkInterval} segundos</li>
            <li>Detecta novos participantes que entraram via link de convite</li>
            <li>Verifica automaticamente se estão na blacklist</li>
            <li>Remove imediatamente contatos banidos</li>
            <li>Envia mensagem automática com informações de contato</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
