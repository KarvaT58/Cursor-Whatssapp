'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Users,
  Hash,
  Bell,
  BellOff,
} from 'lucide-react'
import { useTeamMessages, useTeamPresence } from '@/hooks/use-team-messages'
import { useTeam } from '@/hooks/use-teams'
import { TeamMessageWithUser, SendMessageData } from '@/types/teams'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TeamChatProps {
  teamId: string
  className?: string
}

export function TeamChat({ teamId, className }: TeamChatProps) {
  const [message, setMessage] = useState('')
  const [channel, setChannel] = useState('general')
  const [isTyping, setIsTyping] = useState(false)
  const [showOnlineMembers, setShowOnlineMembers] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { team } = useTeam({ teamId })
  const {
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    refresh,
  } = useTeamMessages({ teamId, channel })

  const { onlineMembers, isOnline } = useTeamPresence(teamId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  // Handle typing indicator
  const handleTyping = () => {
    setIsTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      const messageData: SendMessageData = {
        content: message.trim(),
        messageType: 'text',
        channel,
        metadata: {},
      }

      await sendMessage(messageData)
      setMessage('')
      setIsTyping(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await editMessage(messageId, { content: newContent })
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMore()
    }
  }

  if (error) {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-destructive mb-2">Erro ao carregar chat</p>
            <Button onClick={refresh} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <CardTitle className="text-lg">
              {team?.team?.name || 'Chat da Equipe'}
            </CardTitle>
            <Badge variant="secondary" className="ml-2">
              {channel}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOnlineMembers(!showOnlineMembers)}
            >
              <Users className="h-4 w-4" />
              <span className="ml-1">{onlineMembers.size}</span>
            </Button>

            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Online Members */}
        {showOnlineMembers && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Online:</span>
            <div className="flex items-center gap-1">
              {Array.from(onlineMembers)
                .slice(0, 5)
                .map((userId) => (
                  <div
                    key={userId}
                    className="w-6 h-6 rounded-full bg-green-500 border-2 border-background"
                    title={`Usuário ${userId}`}
                  />
                ))}
              {onlineMembers.size > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{onlineMembers.size - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-4">
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Carregar mais mensagens'}
                </Button>
              </div>
            )}

            {/* Messages List */}
            {messages.map((msg) => (
              <TeamMessageItem
                key={msg.id}
                message={msg}
                isOnline={isOnline(msg.sender.id)}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
                <span>Alguém está digitando...</span>
              </div>
            )}

            {/* Empty State */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Message Input */}
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />

          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Message Item Component
interface TeamMessageItemProps {
  message: TeamMessageWithUser
  isOnline: boolean
  onEdit: (messageId: string, newContent: string) => void
  onDelete: (messageId: string) => void
}

function TeamMessageItem({
  message,
  isOnline,
  onEdit,
  onDelete,
}: TeamMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const handleEdit = () => {
    if (isEditing) {
      onEdit(message.id, editContent)
      setIsEditing(false)
    } else {
      setEditContent(message.content)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  return (
    <div className="group hover:bg-muted/50 p-2 rounded-lg transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {message.sender?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{message.sender?.name || 'Usuário'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm">{message.content}</div>
          )}

          {/* Reply to message */}
          {message.replyTo && (
            <div className="mt-2 p-2 bg-muted/50 rounded border-l-2 border-primary/50">
              <div className="text-xs text-muted-foreground mb-1">
                Respondendo para {message.replyTo?.sender?.name || 'Usuário'}
              </div>
              <div className="text-sm truncate">{message.replyTo.content}</div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-6 w-6 p-0"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
