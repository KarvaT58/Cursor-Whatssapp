'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './message-bubble'
import { MessageStatus } from './message-status'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Message = Database['public']['Tables']['whatsapp_messages']['Row']
type Contact = Database['public']['Tables']['contacts']['Row']

interface MessageListProps {
  messages: Message[]
  loading: boolean
  contact?: Contact | null
  groupId?: string | null
}

interface GroupedMessage {
  date: string
  messages: Message[]
}

export function MessageList({
  messages,
  loading,
  contact,
  groupId,
}: MessageListProps) {
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessage[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Agrupar mensagens por data
  useEffect(() => {
    const grouped = messages.reduce((acc, message) => {
      const date = new Date(message.created_at || '').toDateString()
      const existingGroup = acc.find((group) => group.date === date)

      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        acc.push({
          date,
          messages: [message],
        })
      }

      return acc
    }, [] as GroupedMessage[])

    // Ordenar mensagens dentro de cada grupo
    grouped.forEach((group) => {
      group.messages.sort(
        (a, b) =>
          new Date(a.created_at || '').getTime() -
          new Date(b.created_at || '').getTime()
      )
    })

    setGroupedMessages(grouped)
  }, [messages])

  // Configurar scroll infinito
  useEffect(() => {
    if (!listRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true)
          // TODO: Implementar carregamento de mensagens mais antigas
          setTimeout(() => setIsLoadingMore(false), 1000)
        }
      },
      { threshold: 0.1 }
    )

    const firstMessage = listRef.current.querySelector(
      '[data-message-index="0"]'
    )
    if (firstMessage) {
      observerRef.current.observe(firstMessage)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [groupedMessages, isLoadingMore])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return format(date, 'dd/MM/yyyy', { locale: ptBR })
    }
  }

  const getMessageStatus = (message: Message) => {
    if (message.direction === 'inbound') return null
    return message.status || 'sent'
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-80">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="font-medium">Nenhuma mensagem ainda</h3>
              <p className="text-sm text-muted-foreground">
                Inicie uma conversa enviando uma mensagem
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-6">
      {isLoadingMore && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Carregando mensagens...
          </div>
        </div>
      )}

      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date} className="space-y-4">
          {/* Separador de data */}
          <div className="flex items-center justify-center">
            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {formatDate(group.date)}
            </div>
          </div>

          {/* Mensagens do dia */}
          <div className="space-y-2">
            {group.messages.map((message, messageIndex) => (
              <div
                key={message.id}
                data-message-index={groupIndex === 0 ? messageIndex : undefined}
                className="flex gap-3"
              >
                <MessageBubble
                  message={message}
                  isOwn={message.direction === 'outbound'}
                  contact={contact}
                  showAvatar={message.direction === 'inbound'}
                />
                <div className="flex flex-col justify-end">
                  {message.direction === 'outbound' && (
                    <MessageStatus status={getMessageStatus(message)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
