'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { SettingsHeader } from './settings-header'
import { SettingsSidebar } from './settings-sidebar'
import { ProfileSettings } from './profile-settings'
import { ZApiSettings } from './z-api-settings'
import { SecuritySettings } from './security-settings'
import { NotificationSettings } from './notification-settings'
import { AdminConfigForm } from '@/components/admin-config-form'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings, AlertCircle } from 'lucide-react'

type SettingsTab = 'profile' | 'z-api' | 'security' | 'notifications' | 'admin'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const { user, zApiInstances, loading, error } = useSettings()

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r bg-muted/20 p-4">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              Erro ao carregar configurações
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Settings className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Usuário não encontrado</h3>
            <p className="text-muted-foreground">
              Não foi possível carregar os dados do usuário.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} />
      case 'z-api':
        return <ZApiSettings instances={zApiInstances} />
      case 'security':
        return <SecuritySettings user={user} />
      case 'notifications':
        return <NotificationSettings user={user} />
      case 'admin':
        return <AdminConfigForm />
      default:
        return <ProfileSettings user={user} />
    }
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <SettingsHeader activeTab={activeTab} />
        <div className="flex-1 overflow-y-auto p-6">{renderActiveTab()}</div>
      </div>
    </div>
  )
}
