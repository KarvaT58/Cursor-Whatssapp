'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { InstanceStatus } from './instance-status'
import { SendMessageForm } from './send-message-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Zap,
  Settings,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

export function ZApiTestPage() {
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)
  const [instances, setInstances] = useState<
    {
      id: string
      name: string
      instance_id: string
    }[]
  >([])
  const { zApiInstances, loading, error } = useSettings()

  useEffect(() => {
    if (zApiInstances && zApiInstances.length > 0) {
      setInstances(zApiInstances)
      if (!selectedInstance) {
        setSelectedInstance(zApiInstances[0].id)
      }
    }
  }, [zApiInstances, selectedInstance])

  const currentInstance = instances.find((inst) => inst.id === selectedInstance)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar instâncias Z-API: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!instances || instances.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="size-6" />
              Teste Z-API
            </h1>
            <p className="text-muted-foreground">
              Teste a integração com a Z-API para envio de mensagens WhatsApp
            </p>
          </div>
        </div>

        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Nenhuma instância Z-API configurada. Vá para as configurações para
            adicionar uma instância.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Como configurar uma instância Z-API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Acesse as Configurações</h4>
              <p className="text-sm text-muted-foreground">
                Vá para a página de configurações e clique em &quot;Z-API&quot;
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">2. Adicione uma Nova Instância</h4>
              <p className="text-sm text-muted-foreground">
                Clique em &quot;Adicionar Instância&quot; e preencha os dados da
                sua instância Z-API
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">3. Configure os Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Insira o Instance ID, Instance Token e Client Token fornecidos
                pela Z-API
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">4. Teste a Conexão</h4>
              <p className="text-sm text-muted-foreground">
                Volte para esta página para testar o envio de mensagens
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="size-6" />
            Teste Z-API
          </h1>
          <p className="text-muted-foreground">
            Teste a integração com a Z-API para envio de mensagens WhatsApp
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seleção de Instância */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Instância</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Instância Z-API</label>
              <div className="grid gap-2">
                {instances.map((instance) => (
                  <Button
                    key={instance.id}
                    variant={
                      selectedInstance === instance.id ? 'default' : 'outline'
                    }
                    className="justify-start"
                    onClick={() => setSelectedInstance(instance.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="size-4" />
                      <div className="text-left">
                        <div className="font-medium">{instance.name}</div>
                        <div className="text-xs opacity-70">
                          {instance.instance_id}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status da Instância */}
        {currentInstance && (
          <InstanceStatus
            instanceId={currentInstance.id}
            instanceName={currentInstance.name}
          />
        )}
      </div>

      {/* Formulário de Envio */}
      {currentInstance && (
        <SendMessageForm
          instanceId={currentInstance.id}
          instanceName={currentInstance.name}
        />
      )}

      {/* Informações sobre a Z-API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Sobre a Z-API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Tipos de Mensagem Suportados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Texto simples</li>
                <li>• Imagens com legenda</li>
                <li>• Documentos (PDF, DOC, etc.)</li>
                <li>• Áudios</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recursos Disponíveis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Envio em massa</li>
                <li>• Status de entrega</li>
                <li>• QR Code para conexão</li>
                <li>• Histórico de mensagens</li>
              </ul>
            </div>
          </div>

          <Separator />

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de que sua instância Z-API está ativa e conectada ao
              WhatsApp antes de enviar mensagens.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
