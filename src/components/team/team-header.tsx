'use client'

import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, UserPlus, Settings } from 'lucide-react'

type Team = Database['public']['Tables']['teams']['Row']

interface TeamHeaderProps {
  team: Team
  memberCount: number
  activeTab: 'members' | 'chat'
  onTabChange: (tab: 'members' | 'chat') => void
  onInviteUser: () => void
}

export function TeamHeader({
  team,
  memberCount,
  activeTab,
  onTabChange,
  onInviteUser,
}: TeamHeaderProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">{team?.name || 'Equipe'}</h1>
              {team.description && (
                <p className="text-sm text-muted-foreground">
                  {team.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="size-3" />
            {memberCount} membro{memberCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Button
              variant={activeTab === 'members' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('members')}
              className="flex items-center gap-2"
            >
              <Users className="size-4" />
              Membros
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('chat')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="size-4" />
              Chat
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={onInviteUser}>
            <UserPlus className="size-4 mr-2" />
            Convidar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
