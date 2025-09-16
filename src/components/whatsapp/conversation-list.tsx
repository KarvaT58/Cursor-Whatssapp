'use client'

import { useState } from 'react'
import {
  useConversationHistory,
  type ConversationSummary,
} from '@/hooks/use-conversation-history'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Database } from '@/types/database'

type Message = Database['public']['Tables']['whatsapp_messages']['Row']
import {
  Search,
  Archive,
  Trash2,
  MoreVertical,
  Phone,
  Video,
  MessageCircle,
  Users,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Contact = Database['public']['Tables']['contacts']['Row']

interface ConversationListProps {
  onContactSelect?: (contact: Contact) => void
  onGroupSelect?: (groupId: string) => void
  selectedContactId?: string
  selectedGroupId?: string
}

export function ConversationList({
  onContactSelect,
  onGroupSelect,
  selectedContactId,
  selectedGroupId,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  const {
    conversations,
    loading,
    error,
    markConversationAsRead,
    archiveConversation,
    deleteConversation,
    searchConversations,
  } = useConversationHistory({ userId: user?.id })

  const filteredConversations = searchTerm
    ? searchConversations(searchTerm)
    : conversations

  const handleContactClick = (conversation: ConversationSummary) => {
    if (conversation.contact) {
      onContactSelect?.(conversation.contact)
      markConversationAsRead(conversation.contact.id)
    } else if (conversation.groupId) {
      onGroupSelect?.(conversation.groupId)
      markConversationAsRead(undefined, conversation.groupId)
    }
  }

  const handleArchive = (conversation: ConversationSummary) => {
    if (conversation.contact) {
      archiveConversation(conversation.contact.id)
    } else if (conversation.groupId) {
      archiveConversation(undefined, conversation.groupId)
    }
  }

  const handleDelete = (conversation: ConversationSummary) => {
    if (conversation.contact) {
      deleteConversation(conversation.contact.id)
    } else if (conversation.groupId) {
      deleteConversation(undefined, conversation.groupId)
    }
  }

  const formatLastMessage = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Há muito tempo'
    }
  }

  const getMessagePreview = (message: Message | undefined) => {
    if (!message) return 'Nenhuma mensagem'

    const content = message.content || ''
    const maxLength = 50

    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-2">
              Erro ao carregar conversas
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com busca */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Nenhuma conversa encontrada'
                : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const isSelected =
                (conversation.contact &&
                  selectedContactId === conversation.contact.id) ||
                (conversation.groupId &&
                  selectedGroupId === conversation.groupId)

              return (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    isSelected ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                  onClick={() => handleContactClick(conversation)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={
                          conversation.contact?.whatsapp_id
                            ? `https://api.whatsapp.com/img/${conversation.contact.whatsapp_id}`
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {conversation.contact ? (
                          conversation.contact.name.charAt(0).toUpperCase()
                        ) : (
                          <Users className="w-6 h-6" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Indicador de mensagens não lidas */}
                    {conversation.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {conversation.unreadCount > 9
                          ? '9+'
                          : conversation.unreadCount}
                      </Badge>
                    )}
                  </div>

                  {/* Informações da conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conversation.contact?.name || 'Grupo do WhatsApp'}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatLastMessage(conversation.lastActivity)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {getMessagePreview(conversation.lastMessage)}
                      </p>

                      {/* Ações rápidas */}
                      <div className="flex items-center gap-1">
                        {conversation.contact?.phone && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (conversation.contact?.phone) {
                                  window.open(
                                    `tel:${conversation.contact.phone}`,
                                    '_self'
                                  )
                                }
                              }}
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Implementar chamada de vídeo
                              }}
                            >
                              <Video className="w-3 h-3" />
                            </Button>
                          </>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleArchive(conversation)}
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(conversation)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
