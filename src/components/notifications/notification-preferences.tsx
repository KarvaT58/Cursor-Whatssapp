'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
  enabled: boolean
  sound: boolean
  desktop: boolean
  mobile: boolean
  email: boolean
  chat: boolean
  campaigns: boolean
  messages: boolean
  groups: boolean
  system: boolean
}

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({
  className,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    sound: true,
    desktop: true,
    mobile: false,
    email: false,
    chat: true,
    campaigns: true,
    messages: true,
    groups: true,
    system: true,
  })

  const [isLoading, setIsLoading] = useState(false)

  // Load preferences from localStorage or API
  useEffect(() => {
    const saved = localStorage.getItem('notification-preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem(
        'notification-preferences',
        JSON.stringify(newPreferences)
      )

      // Here you would typically save to your API/database
      // await api.notifications.updatePreferences(newPreferences)

      setPreferences(newPreferences)
      toast.success('Preferências salvas com sucesso!')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Erro ao salvar preferências')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    const newPreferences = { ...preferences, [key]: value }

    // If disabling main notifications, disable all sub-options
    if (key === 'enabled' && !value) {
      newPreferences.sound = false
      newPreferences.desktop = false
      newPreferences.mobile = false
      newPreferences.email = false
      newPreferences.chat = false
      newPreferences.campaigns = false
      newPreferences.messages = false
      newPreferences.groups = false
      newPreferences.system = false
    }

    // If enabling any sub-option, enable main notifications
    if (key !== 'enabled' && value) {
      newPreferences.enabled = true
    }

    savePreferences(newPreferences)
  }

  const resetToDefaults = () => {
    const defaultPreferences: NotificationPreferences = {
      enabled: true,
      sound: true,
      desktop: true,
      mobile: false,
      email: false,
      chat: true,
      campaigns: true,
      messages: true,
      groups: true,
      system: true,
    }
    savePreferences(defaultPreferences)
  }

  const testNotification = () => {
    if (preferences.enabled) {
      toast.success('Notificação de teste enviada!')
    } else {
      toast.warning('Notificações estão desabilitadas')
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências de Notificação
          </CardTitle>
          <CardDescription>
            Configure como e quando você deseja receber notificações
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base font-medium">
                Notificações
              </Label>
              <p className="text-sm text-muted-foreground">
                Ativar ou desativar todas as notificações
              </p>
            </div>
            <Switch
              id="enabled"
              checked={preferences.enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('enabled', checked)
              }
              disabled={isLoading}
            />
          </div>

          <Separator />

          {/* Delivery Methods */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Métodos de Entrega</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Label htmlFor="sound">Som</Label>
                </div>
                <Switch
                  id="sound"
                  checked={preferences.sound}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('sound', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <Label htmlFor="desktop">Desktop</Label>
                </div>
                <Switch
                  id="desktop"
                  checked={preferences.desktop}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('desktop', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="mobile">Mobile</Label>
                </div>
                <Switch
                  id="mobile"
                  checked={preferences.mobile}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('mobile', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <Switch
                  id="email"
                  checked={preferences.email}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('email', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Tipos de Notificação</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="chat">Chat</Label>
                  <Badge variant="secondary" className="text-xs">
                    Mensagens
                  </Badge>
                </div>
                <Switch
                  id="chat"
                  checked={preferences.chat}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('chat', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="campaigns">Campanhas</Label>
                  <Badge variant="secondary" className="text-xs">
                    Envios
                  </Badge>
                </div>
                <Switch
                  id="campaigns"
                  checked={preferences.campaigns}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('campaigns', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="messages">Mensagens</Label>
                  <Badge variant="secondary" className="text-xs">
                    WhatsApp
                  </Badge>
                </div>
                <Switch
                  id="messages"
                  checked={preferences.messages}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('messages', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="groups">Grupos</Label>
                  <Badge variant="secondary" className="text-xs">
                    Atualizações
                  </Badge>
                </div>
                <Switch
                  id="groups"
                  checked={preferences.groups}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('groups', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="system">Sistema</Label>
                  <Badge variant="secondary" className="text-xs">
                    Alertas
                  </Badge>
                </div>
                <Switch
                  id="system"
                  checked={preferences.system}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('system', checked)
                  }
                  disabled={!preferences.enabled || isLoading}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={testNotification}
              disabled={isLoading}
              className="flex-1"
            >
              Testar Notificação
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isLoading}
              className="flex-1"
            >
              Restaurar Padrões
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
