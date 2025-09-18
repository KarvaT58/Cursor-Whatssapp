'use client'

import { GroupNotifications } from '@/components/notifications/group-notifications'

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie as notificações dos seus grupos do WhatsApp
          </p>
        </div>
      </div>

      <GroupNotifications />
    </div>
  )
}
