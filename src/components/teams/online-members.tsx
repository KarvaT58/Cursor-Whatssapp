'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, ChevronDown, ChevronUp, Circle, Clock } from 'lucide-react'
import { TeamMember } from '@/types/teams'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface OnlineMembersProps {
  members: TeamMember[]
  onlineMembers: Set<string>
  isOnline: (userId: string) => boolean
  className?: string
}

export function OnlineMembers({
  members,
  onlineMembers,
  isOnline,
  className,
}: OnlineMembersProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAllMembers, setShowAllMembers] = useState(false)

  const onlineMembersList = members.filter((member) => isOnline(member.id))
  const offlineMembersList = members.filter((member) => !isOnline(member.id))

  const displayedOfflineMembers = showAllMembers
    ? offlineMembersList
    : offlineMembersList.slice(0, 5)

  const getStatusColor = (member: TeamMember) => {
    if (isOnline(member.id)) {
      return 'bg-green-500'
    }
    return 'bg-gray-400'
  }

  const getStatusText = (member: TeamMember) => {
    if (isOnline(member.id)) {
      return 'Online'
    }
    if (member.lastSeen) {
      return `Visto ${formatDistanceToNow(new Date(member.lastSeen), {
        addSuffix: true,
        locale: ptBR,
      })}`
    }
    return 'Offline'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-sm">Membros da Equipe</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {onlineMembersList.length} online
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="max-h-64">
            <div className="space-y-4">
              {/* Online Members */}
              {onlineMembersList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                    <span className="text-xs font-medium text-green-600">
                      Online ({onlineMembersList.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {onlineMembersList.map((member) => (
                      <MemberItem
                        key={member.id}
                        member={member}
                        isOnline={true}
                        statusText={getStatusText(member)}
                        initials={getInitials(member?.name || 'Usuário')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Members */}
              {offlineMembersList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-3 w-3 text-gray-400 fill-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      Offline ({offlineMembersList.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {displayedOfflineMembers.map((member) => (
                      <MemberItem
                        key={member.id}
                        member={member}
                        isOnline={false}
                        statusText={getStatusText(member)}
                        initials={getInitials(member?.name || 'Usuário')}
                      />
                    ))}

                    {offlineMembersList.length > 5 && !showAllMembers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllMembers(true)}
                        className="w-full text-xs"
                      >
                        Ver mais ({offlineMembersList.length - 5})
                      </Button>
                    )}

                    {showAllMembers && offlineMembersList.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllMembers(false)}
                        className="w-full text-xs"
                      >
                        Ver menos
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {members.length === 0 && (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum membro encontrado
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}

// Member Item Component
interface MemberItemProps {
  member: TeamMember
  isOnline: boolean
  statusText: string
  initials: string
}

function MemberItem({
  member,
  isOnline,
  statusText,
  initials,
}: MemberItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Avatar */}
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
          {initials}
        </div>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{member.name}</span>
          {member.role === 'admin' && (
            <Badge variant="outline" className="text-xs">
              Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isOnline ? (
            <Circle className="h-2 w-2 text-green-500 fill-green-500" />
          ) : (
            <Clock className="h-2 w-2" />
          )}
          <span className="truncate">{statusText}</span>
        </div>
      </div>
    </div>
  )
}
