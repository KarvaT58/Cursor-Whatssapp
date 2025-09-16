'use client'

import { QueueMonitor } from '@/components/queue/queue-monitor'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Database, Clock, CheckCircle } from 'lucide-react'

export default function QueuesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitor de Filas</h1>
          <p className="text-muted-foreground">
            Acompanhe o processamento de campanhas e mensagens em tempo real
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Sistema de Filas Ativo
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filas Ativas</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Mensagens, Notificações e Retry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs Processados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total de mensagens enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0ms</div>
            <p className="text-xs text-muted-foreground">
              Tempo de processamento
            </p>
          </CardContent>
        </Card>
      </div>

      <QueueMonitor />

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema de Filas</CardTitle>
          <CardDescription>
            O sistema de filas utiliza Redis e BullMQ para processar campanhas
            de forma assíncrona e confiável.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Mensagens de Campanha</h4>
              <p className="text-sm text-muted-foreground">
                Processa o envio de mensagens em massa para contatos
                selecionados.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Notificações</h4>
              <p className="text-sm text-muted-foreground">
                Gerencia notificações de status das campanhas (iniciada,
                concluída, falhou).
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Tentativas de Retry</h4>
              <p className="text-sm text-muted-foreground">
                Reprocessa mensagens que falharam com backoff exponencial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
