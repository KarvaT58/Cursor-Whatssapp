'use client'

import { useState, useRef, useEffect } from 'react'
import { Database } from '@/types/database'
import { useRealtimeTeam } from '@/hooks/use-realtime-team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, MessageSquare, Users } from 'lucide-react'

type Team = Database['public']['Tables']['teams']['Row']
type TeamMessage = Database['public']['Tables']['team_messages']['Row']
type User = Database['public']['Tables']['users']['Row']

interface TeamChatProps {
  team: Team
  messages: TeamMessage[]
  members: User[]
}

export function TeamChat({ team, messages, members }: TeamChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendTeamMessage } = useRealtimeTeam()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await sendTeamMessage(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (dateString: string | null) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getMemberById = (userId: string | null) => {
    return members.find((member) => member.id === userId)
  }

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      default:
        return 'Membro'
    }
  }

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="size-5 text-primary" />
              <div>
                <h3 className="font-semibold">Chat da Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  {team.name} • {members.length} membro
                  {members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="size-3" />
              {members.length} online
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Nenhuma mensagem ainda</h3>
                <p className="text-sm text-muted-foreground">
                  Inicie uma conversa enviando uma mensagem para a equipe
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const member = getMemberById(message.user_id)
                if (!member) return null

                return (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      {getInitials(member?.name || 'Usuário')}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {member?.name || 'Usuário'}
                        </span>
                        <Badge
                          className={`${getRoleColor(member.role)} text-xs`}
                        >
                          {getRoleLabel(member.role)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t bg-background p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem para a equipe..."
                disabled={sending}
              />
            </div>

            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-64 border-l bg-muted/20 p-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="size-4" />
          Membros Online
        </h4>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                {getInitials(member?.name || 'Usuário')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member?.name || 'Usuário'}</p>
                <Badge className={`${getRoleColor(member.role)} text-xs`}>
                  {getRoleLabel(member.role)}
                </Badge>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
