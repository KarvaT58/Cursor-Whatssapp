'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TeamMemberManagement } from './team-member-management'
import { TeamInvites } from './team-invites'
import { TeamActivityLog } from './team-activity-log'
import { TeamSettings } from './team-settings'
import {
  Users,
  Mail,
  Activity,
  Settings,
  Crown,
  Shield,
  User,
} from 'lucide-react'

interface TeamManagementProps {
  teamId: string
  className?: string
}

export function TeamManagement({ teamId, className }: TeamManagementProps) {
  const [activeTab, setActiveTab] = useState('members')

  const tabs = [
    {
      id: 'members',
      label: 'Membros',
      icon: <Users className="h-4 w-4" />,
      component: <TeamMemberManagement teamId={teamId} />,
    },
    {
      id: 'invites',
      label: 'Convites',
      icon: <Mail className="h-4 w-4" />,
      component: <TeamInvites teamId={teamId} />,
    },
    {
      id: 'activity',
      label: 'Atividades',
      icon: <Activity className="h-4 w-4" />,
      component: <TeamActivityLog teamId={teamId} />,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
      component: <TeamSettings teamId={teamId} />,
    },
  ]

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-6 py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0">
                <div className="p-6">{tab.component}</div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
