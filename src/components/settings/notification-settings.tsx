'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  MessageSquare,
  Users,
  Megaphone,
  Shield,
  Save,
} from 'lucide-react'

type User = Database['public']['Tables']['users']['Row']

interface NotificationSettingsProps {
  user: User
}

export function NotificationSettings({}: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState({
    // WhatsApp Notifications
    whatsappMessages: true,
    whatsappGroups: true,
    whatsappStatus: true,

    // Team Notifications
    teamMessages: true,
    teamInvites: true,
    teamUpdates: false,

    // Campaign Notifications
    campaignStarted: true,
    campaignCompleted: true,
    campaignFailed: true,

    // System Notifications
    systemUpdates: true,
    securityAlerts: true,
    maintenanceAlerts: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {} = useSettings()

  const handleNotificationChange = (
    key: keyof typeof notifications,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      // Aqui você salvaria as configurações de notificação
      // Por enquanto, vamos simular o salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar configurações'
      )
    } finally {
      setLoading(false)
    }
  }

  const NotificationSection = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )

  const NotificationItem = ({
    key,
    label,
    description,
  }: {
    key: keyof typeof notifications
    label: string
    description: string
  }) => (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label htmlFor={key} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={key}
        checked={notifications[key]}
        onCheckedChange={(checked) => handleNotificationChange(key, checked)}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Configurações de Notificações
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure como você recebe notificações do sistema
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="size-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
          Configurações salvas com sucesso!
        </div>
      )}

      {/* WhatsApp Notifications */}
      <NotificationSection title="WhatsApp" icon={MessageSquare}>
        <NotificationItem
          key="whatsappMessages"
          label="Mensagens Recebidas"
          description="Notificar quando receber mensagens no WhatsApp"
        />
        <NotificationItem
          key="whatsappGroups"
          label="Atividade em Grupos"
          description="Notificar sobre mensagens em grupos do WhatsApp"
        />
        <NotificationItem
          key="whatsappStatus"
          label="Status de Mensagens"
          description="Notificar sobre mudanças no status das mensagens"
        />
      </NotificationSection>

      {/* Team Notifications */}
      <NotificationSection title="Equipe" icon={Users}>
        <NotificationItem
          key="teamMessages"
          label="Mensagens da Equipe"
          description="Notificar sobre mensagens no chat da equipe"
        />
        <NotificationItem
          key="teamInvites"
          label="Convites para Equipe"
          description="Notificar quando for convidado para uma equipe"
        />
        <NotificationItem
          key="teamUpdates"
          label="Atualizações da Equipe"
          description="Notificar sobre mudanças na equipe"
        />
      </NotificationSection>

      {/* Campaign Notifications */}
      <NotificationSection title="Campanhas" icon={Megaphone}>
        <NotificationItem
          key="campaignStarted"
          label="Campanha Iniciada"
          description="Notificar quando uma campanha for iniciada"
        />
        <NotificationItem
          key="campaignCompleted"
          label="Campanha Concluída"
          description="Notificar quando uma campanha for concluída"
        />
        <NotificationItem
          key="campaignFailed"
          label="Campanha com Erro"
          description="Notificar quando uma campanha falhar"
        />
      </NotificationSection>

      {/* System Notifications */}
      <NotificationSection title="Sistema" icon={Shield}>
        <NotificationItem
          key="systemUpdates"
          label="Atualizações do Sistema"
          description="Notificar sobre atualizações e melhorias"
        />
        <NotificationItem
          key="securityAlerts"
          label="Alertas de Segurança"
          description="Notificar sobre atividades suspeitas na conta"
        />
        <NotificationItem
          key="maintenanceAlerts"
          label="Manutenção Programada"
          description="Notificar sobre manutenções programadas"
        />
      </NotificationSection>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Notificações por Email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações por email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Notificações no Navegador
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações no navegador
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Som de Notificação
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reproduzir som ao receber notificações
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Horário de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Modo Não Perturbe</Label>
                <p className="text-xs text-muted-foreground">
                  Pausar notificações durante horário de descanso
                </p>
              </div>
              <Switch />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Configure horários específicos para receber notificações:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Segunda a Sexta: 08:00 - 18:00</li>
                <li>Sábado: 09:00 - 12:00</li>
                <li>Domingo: Sem notificações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
