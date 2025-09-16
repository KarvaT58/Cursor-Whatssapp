'use client'

import { useState, useRef, useEffect } from 'react'
import { Database } from '@/types/database'
import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Image,
  FileText,
  Mic,
  MessageCircle,
} from 'lucide-react'

type Contact = Database['public']['Tables']['contacts']['Row']
type Message = Database['public']['Tables']['whatsapp_messages']['Row']

interface ChatInterfaceProps {
  contact: Contact
  messages: Message[]
  loading: boolean
}

export function ChatInterface({
  contact,
  messages,
  loading,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendMessage } = useRealtimeMessages(contact.id)

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
      await sendMessage(newMessage.trim(), contact.id)
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
    return date.toLocaleTimeString('pt-BR', {
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

  const getMessageStatusIcon = (status: string | null) => {
    switch (status) {
      case 'sent':
        return '✓'
      case 'delivered':
        return '✓✓'
      case 'read':
        return '✓✓'
      default:
        return ''
    }
  }

  const getMessageStatusColor = (status: string | null) => {
    switch (status) {
      case 'sent':
        return 'text-muted-foreground'
      case 'delivered':
        return 'text-muted-foreground'
      case 'read':
        return 'text-blue-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {getInitials(contact.name)}
            </div>
            <div>
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="size-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="size-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhuma mensagem ainda</h3>
              <p className="text-sm text-muted-foreground">
                Inicie uma conversa enviando uma mensagem
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.direction === 'outbound' ? 'flex-row-reverse' : ''
                }`}
              >
                {message.direction === 'inbound' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {getInitials(contact.name)}
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${
                    message.direction === 'outbound'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } rounded-lg p-3`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {message.direction === 'outbound' && (
                      <span
                        className={`text-xs ${getMessageStatusColor(message.status)}`}
                      >
                        {getMessageStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm">
            <Paperclip className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm">
            <Image className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm">
            <FileText className="size-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="pr-10"
              disabled={sending}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Smile className="size-4" />
            </Button>
          </div>

          {newMessage.trim() ? (
            <Button type="submit" disabled={sending} size="sm">
              <Send className="size-4" />
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm">
              <Mic className="size-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
