'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  BellOff,
  Smartphone,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { NotificationPreferences } from './notification-preferences'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  className?: string
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'preferences' | 'push'>(
    'preferences'
  )

  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  } = usePushNotifications()

  const handleSubscribe = async () => {
    const success = await subscribe()
    if (success) {
      toast.success('Inscrito em notificações push!')
    }
  }

  const handleUnsubscribe = async () => {
    const success = await unsubscribe()
    if (success) {
      toast.success('Desinscrito das notificações push!')
    }
  }

  const handleTestNotification = () => {
    showNotification({
      title: 'Teste de Notificação',
      body: 'Esta é uma notificação de teste do WhatsApp Professional',
      data: { url: '/dashboard' },
    })
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Permitido',
          variant: 'default' as const,
        }
      case 'denied':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          text: 'Negado',
          variant: 'destructive' as const,
        }
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
          text: 'Não solicitado',
          variant: 'secondary' as const,
        }
    }
  }

  const permissionStatus = getPermissionStatus()

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Gerencie suas preferências de notificação e configurações push
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'preferences' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('preferences')}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              Preferências
            </Button>
            <Button
              variant={activeTab === 'push' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('push')}
              className="flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Push
            </Button>
          </div>

          {/* Preferences Tab */}
          {activeTab === 'preferences' && <NotificationPreferences />}

          {/* Push Notifications Tab */}
          {activeTab === 'push' && (
            <div className="space-y-6">
              {/* Support Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Suporte a Notificações Push</p>
                    <p className="text-sm text-muted-foreground">
                      {isSupported
                        ? 'Seu navegador suporta notificações push'
                        : 'Seu navegador não suporta notificações push'}
                    </p>
                  </div>
                </div>
                <Badge variant={isSupported ? 'default' : 'destructive'}>
                  {isSupported ? 'Suportado' : 'Não suportado'}
                </Badge>
              </div>

              {/* Permission Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {permissionStatus.icon}
                  <div>
                    <p className="font-medium">Permissão do Navegador</p>
                    <p className="text-sm text-muted-foreground">
                      Status atual da permissão para notificações
                    </p>
                  </div>
                </div>
                <Badge variant={permissionStatus.variant}>
                  {permissionStatus.text}
                </Badge>
              </div>

              {/* Subscription Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Inscrição em Push</p>
                    <p className="text-sm text-muted-foreground">
                      {isSubscribed
                        ? 'Você está inscrito em notificações push'
                        : 'Você não está inscrito em notificações push'}
                    </p>
                  </div>
                </div>
                <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                  {isSubscribed ? 'Inscrito' : 'Não inscrito'}
                </Badge>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                {!isSupported && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Seu navegador não suporta notificações push. Use um
                        navegador moderno como Chrome, Firefox ou Safari.
                      </p>
                    </div>
                  </div>
                )}

                {isSupported && permission === 'default' && (
                  <Button
                    onClick={requestPermission}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Solicitar Permissão
                  </Button>
                )}

                {isSupported && permission === 'granted' && !isSubscribed && (
                  <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Inscrivendo...' : 'Inscrever-se em Push'}
                  </Button>
                )}

                {isSupported && permission === 'granted' && isSubscribed && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleUnsubscribe}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? 'Desinscrevendo...' : 'Desinscrever-se'}
                    </Button>
                    <Button
                      onClick={handleTestNotification}
                      variant="secondary"
                      className="w-full"
                    >
                      Testar Notificação
                    </Button>
                  </div>
                )}

                {isSupported && permission === 'denied' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-800">
                        Permissão negada. Para habilitar notificações push,
                        acesse as configurações do seu navegador e permita
                        notificações para este site.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
