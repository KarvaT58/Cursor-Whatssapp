'use client'

import { useState, useEffect, useRef } from 'react'
import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import { useRealtimeContacts } from '@/hooks/use-realtime-contacts'
import { useZApi } from '@/hooks/use-z-api'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ContactSelector } from './contact-selector'
import { ChatHeader } from './chat-header'
import { TypingIndicator } from './typing-indicator'
import { Card, CardContent } from '@/components/ui/card'
import { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']
type Message = Database['public']['Tables']['whatsapp_messages']['Row']

interface WhatsAppChatProps {
  className?: string
}

export function WhatsAppChat({ className }: WhatsAppChatProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingContact, setTypingContact] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { contacts, loading: contactsLoading } = useRealtimeContacts()
  const {
    messages,
    loading: messagesLoading,
    sendMessage: sendMessageToDB,
  } = useRealtimeMessages(
    selectedContact?.id || undefined,
    selectedGroup || undefined
  )
  const { sendMessage: sendMessageViaZApi, loading: sendingMessage } = useZApi()

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simular indicador de digitação
  useEffect(() => {
    if (selectedContact) {
      const typingTimeout = setTimeout(() => {
        setIsTyping(false)
        setTypingContact(null)
      }, 3000)

      return () => clearTimeout(typingTimeout)
    }
  }, [selectedContact])

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'image' | 'document' | 'audio' = 'text',
    mediaUrl?: string
  ) => {
    if (!selectedContact && !selectedGroup) return

    try {
      // Enviar mensagem via Z-API (se configurado)
      if (selectedContact?.phone) {
        await sendMessageViaZApi('default-instance', {
          phone: selectedContact.phone,
          message: content,
          type,
          mediaUrl,
        })
      }

      // Salvar mensagem no banco de dados
      await sendMessageToDB(
        content,
        selectedContact?.id,
        selectedGroup || undefined
      )

      // Simular resposta automática (opcional)
      if (selectedContact && Math.random() > 0.7) {
        setTimeout(() => {
          setIsTyping(true)
          setTypingContact(selectedContact.name)
        }, 1000)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setSelectedGroup(null)
    setIsTyping(false)
    setTypingContact(null)
  }

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId)
    setSelectedContact(null)
    setIsTyping(false)
    setTypingContact(null)
  }

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sidebar com contatos */}
      <div className="w-80 border-r bg-background">
        <ContactSelector
          contacts={contacts}
          loading={contactsLoading}
          selectedContact={selectedContact}
          selectedGroup={selectedGroup}
          onContactSelect={handleContactSelect}
          onGroupSelect={handleGroupSelect}
        />
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact || selectedGroup ? (
          <>
            {/* Header do chat */}
            <ChatHeader
              contact={selectedContact}
              groupId={selectedGroup}
              isOnline={true} // TODO: Implementar status real
            />

            {/* Lista de mensagens */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                loading={messagesLoading}
                contact={selectedContact}
                groupId={selectedGroup}
              />

              {/* Indicador de digitação */}
              {isTyping && typingContact && (
                <TypingIndicator contactName={typingContact} />
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensagem */}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={sendingMessage}
              placeholder={
                selectedContact
                  ? `Enviar mensagem para ${selectedContact.name}...`
                  : 'Enviar mensagem para o grupo...'
              }
            />
          </>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">WhatsApp Chat</h3>
                    <p className="text-muted-foreground">
                      Selecione um contato ou grupo para começar a conversar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
