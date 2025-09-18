'use client'

import { useState, useCallback } from 'react'
import { AtSign, Reply, MoreVertical, Phone, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MessageReactions } from './message-reactions'

interface GroupMessageDisplayProps {
  message: {
    id: string
    content: string
    sender_phone: string
    mentions?: string[]
    reply_to_message_id?: string
    created_at: string
    type: 'text' | 'image' | 'document' | 'audio'
    direction: 'inbound' | 'outbound'
    status: 'sent' | 'delivered' | 'read' | 'failed'
  }
  groupId: string
  currentUserPhone?: string
  onReply?: (message: any) => void
  onDelete?: (messageId: string) => void
  canDelete?: boolean
}

export function GroupMessageDisplay({ 
  message, 
  groupId,
  currentUserPhone, 
  onReply, 
  onDelete, 
  canDelete = false 
}: GroupMessageDisplayProps) {
  const [showMentions, setShowMentions] = useState(false)

  // Verificar se é mensagem do usuário atual
  const isOwnMessage = message.sender_phone === currentUserPhone

  // Processar conteúdo com menções
  const processContentWithMentions = useCallback((content: string, mentions: string[] = []) => {
    if (mentions.length === 0) return content

    let processedContent = content
    
    // Destacar menções
    mentions.forEach(mention => {
      const mentionText = mention === '@grupo' ? '@grupo' : `@${mention}`
      const regex = new RegExp(`\\b${mentionText}\\b`, 'g')
      processedContent = processedContent.replace(regex, `**${mentionText}**`)
    })

    return processedContent
  }, [])

  // Formatar data
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Agora'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }, [])

  // Obter cor do status
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'sent': return 'text-muted-foreground'
      case 'delivered': return 'text-blue-500'
      case 'read': return 'text-green-500'
      case 'failed': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }, [])

  // Obter ícone do status
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'read': return '✓✓'
      case 'failed': return '✗'
      default: return '?'
    }
  }, [])

  const processedContent = processContentWithMentions(message.content, message.mentions)

  return (
    <Card className={`w-full ${isOwnMessage ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}>
      <CardContent className="p-3">
        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {message.sender_phone.slice(-2)}
            </AvatarFallback>
          </Avatar>

          {/* Conteúdo da mensagem */}
          <div className={`flex-1 space-y-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {/* Cabeçalho da mensagem */}
            <div className={`flex items-center gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm font-medium font-mono">
                {message.sender_phone}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(message.created_at)}
              </span>
              {isOwnMessage && (
                <span className={`text-xs ${getStatusColor(message.status)}`}>
                  {getStatusIcon(message.status)}
                </span>
              )}
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              {/* Mensagem de resposta */}
              {message.reply_to_message_id && (
                <div className="p-2 bg-muted rounded-md border-l-4 border-primary text-sm">
                  <div className="flex items-center gap-2">
                    <Reply className="h-3 w-3" />
                    <span className="text-muted-foreground">Respondendo para uma mensagem</span>
                  </div>
                </div>
              )}

              {/* Conteúdo principal */}
              <div className="text-sm whitespace-pre-wrap break-words">
                {processedContent.split('**').map((part, index) => {
                  if (index % 2 === 1) {
                    // É uma menção
                    return (
                      <Badge key={index} variant="secondary" className="mx-1">
                        <AtSign className="h-3 w-3 mr-1" />
                        {part}
                      </Badge>
                    )
                  }
                  return part
                })}
              </div>

              {/* Menções */}
              {message.mentions && message.mentions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {message.mentions.map((mention) => (
                    <Badge key={mention} variant="outline" className="text-xs">
                      <AtSign className="h-3 w-3 mr-1" />
                      {mention === '@grupo' ? 'Grupo' : mention}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Reações */}
            <MessageReactions
              groupId={groupId}
              messageId={message.id}
              className="mt-2"
            />

            {/* Ações da mensagem */}
            <div className={`flex items-center gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(message)}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Responder
              </Button>

              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(message.id)}
                      className="text-destructive"
                    >
                      Apagar mensagem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
