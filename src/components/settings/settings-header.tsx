'use client'

import { Badge } from '@/components/ui/badge'
import { User, Zap, Shield, Bell, UserCheck } from 'lucide-react'

type SettingsTab = 'profile' | 'z-api' | 'security' | 'notifications' | 'admin'

interface SettingsHeaderProps {
  activeTab: SettingsTab
}

const tabConfig = {
  profile: {
    title: 'Perfil',
    icon: User,
    description: 'Gerencie suas informações pessoais e preferências',
  },
  'z-api': {
    title: 'Z-API',
    icon: Zap,
    description: 'Configure suas instâncias do WhatsApp',
  },
  security: {
    title: 'Segurança',
    icon: Shield,
    description: 'Proteja sua conta com configurações de segurança',
  },
  notifications: {
    title: 'Notificações',
    icon: Bell,
    description: 'Configure como você recebe notificações',
  },
  admin: {
    title: 'Administrador',
    icon: UserCheck,
    description: 'Configure o número do administrador para mensagens de banimento',
  },
}

export function SettingsHeader({ activeTab }: SettingsHeaderProps) {
  const config = tabConfig[activeTab]
  const Icon = config?.icon

  if (!config) {
    return (
      <div className="border-b bg-background p-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Configurações</h1>
            <p className="text-muted-foreground">Aba não encontrada</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b bg-background p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          {Icon && <Icon className="size-5 text-primary" />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Configurações
          </Badge>
        </div>
      </div>
    </div>
  )
}
