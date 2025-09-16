'use client'

import { useState, useRef, useEffect } from 'react'
import { Database } from '@/types/database'
import { useGroupMessages } from '@/hooks/use-group-messages'
import { useZApi } from '@/hooks/use-z-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  MoreVertical,
  Users,
  MessageCircle,
  Phone,
  Video,
  Info,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface GroupChatProps {
  group: Group
  onClose?: () => void
}

export function GroupChat({ group, onClose }: GroupChatProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [, setShowParticipants] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, loading, error, sendMessage } = useGroupMessages(group.id)
  const { sendGroupMessage } = useZApi()

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    setSending(true)
    try {
      // Send to database first
      await sendMessage(message.trim())

      // Then send via Z-API if group has whatsapp_id
      if (group.whatsapp_id) {
        await sendGroupMessage('default', group.whatsapp_id, message.trim())
      }

      setMessage('')
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Agora'
    }
  }

  const getGroupInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getParticipantCount = () => {
    return group.participants?.length || 0
  }

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={`https://api.whatsapp.com/img/${group.whatsapp_id}`}
                alt={group.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getGroupInitials(group.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{getParticipantCount()} participantes</span>
                <Badge variant="secondary" className="text-xs">
                  Grupo
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowParticipants(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Participantes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  Informações do Grupo
                </DropdownMenuItem>
                {onClose && (
                  <>
                    <Separator />
                    <DropdownMenuItem onClick={onClose}>
                      Fechar Chat
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma mensagem ainda
                </h3>
                <p className="text-muted-foreground">
                  Envie a primeira mensagem para começar a conversa
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.direction === 'outbound'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.direction === 'outbound'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">{msg.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.direction === 'outbound'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatMessageTime(msg.created_at || '')}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={!message.trim() || sending}>
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 pb-4">
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
            {error}
          </div>
        </div>
      )}
    </Card>
  )
}
