'use client'

import { useState } from 'react'
import { useRealtimeTeam } from '@/hooks/use-realtime-team'
import { TeamHeader } from './team-header'
import { TeamMembers } from './team-members'
import { TeamChat } from './team-chat'
import { CreateTeamForm } from './create-team-form'
import { InviteUserForm } from './invite-user-form'

export function TeamPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'chat'>('members')
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showInviteUser, setShowInviteUser] = useState(false)
  const { team, teamMembers, teamMessages, loading, error } = useRealtimeTeam()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados da equipe...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Erro ao carregar equipe</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Você não está em uma equipe
          </h3>
          <p className="text-muted-foreground mb-6">
            Crie uma nova equipe ou aguarde um convite para participar de uma
            equipe existente.
          </p>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
          >
            Criar Equipe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TeamHeader
        team={team}
        memberCount={teamMembers.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onInviteUser={() => setShowInviteUser(true)}
      />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'members' ? (
          <TeamMembers
            team={team}
            members={teamMembers}
            onInviteUser={() => setShowInviteUser(true)}
          />
        ) : (
          <TeamChat team={team} messages={teamMessages} members={teamMembers} />
        )}
      </div>

      {showCreateTeam && (
        <CreateTeamForm
          onClose={() => setShowCreateTeam(false)}
          onSuccess={() => setShowCreateTeam(false)}
        />
      )}

      {showInviteUser && (
        <InviteUserForm
          onClose={() => setShowInviteUser(false)}
          onSuccess={() => setShowInviteUser(false)}
        />
      )}
    </div>
  )
}
