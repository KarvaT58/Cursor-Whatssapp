'use client'

import { Button } from '@/components/ui/button'
import { User, Zap, Shield, Bell, Settings as SettingsIcon, UserCheck } from 'lucide-react'

type SettingsTab = 'profile' | 'z-api' | 'security' | 'notifications' | 'admin'

interface SettingsSidebarProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

const settingsTabs = [
  {
    id: 'profile' as const,
    label: 'Perfil',
    icon: User,
    description: 'Informações pessoais e preferências',
  },
  {
    id: 'z-api' as const,
    label: 'Z-API',
    icon: Zap,
    description: 'Configurações da API do WhatsApp',
  },
  {
    id: 'security' as const,
    label: 'Segurança',
    icon: Shield,
    description: 'Senha e configurações de segurança',
  },
  {
    id: 'notifications' as const,
    label: 'Notificações',
    icon: Bell,
    description: 'Preferências de notificações',
  },
  {
    id: 'admin' as const,
    label: 'Administrador',
    icon: UserCheck,
    description: 'Configurações do administrador',
  },
]

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/20 p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Configurações</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerencie suas preferências e configurações
        </p>
      </div>

      <nav className="space-y-1">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start h-auto p-3"
              onClick={() => onTabChange(tab.id)}
            >
              <div className="flex items-start gap-3">
                {Icon && <Icon className="size-4 mt-0.5" />}
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {tab.description}
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
