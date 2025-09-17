'use client'

import { useState } from 'react'
import { useRealtimeContacts } from '@/hooks/use-realtime-contacts'
import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import { WhatsAppHeader } from './whatsapp-header'
import { ContactsList } from './contacts-list'
import { ChatInterface } from './chat-interface'
import { ZApiStatus } from './z-api-status'

export function WhatsAppPage() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  // Note: contacts and messages data would need to be fetched separately
  const contacts: unknown[] = []
  const contactsLoading = false
  const messages: unknown[] = []
  const messagesLoading = false

  const filteredContacts = contacts.filter((contact) => {
    const c = contact as { name: string; phone: string }
    return (
      c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    )
  })

  const selectedContactData = selectedContact
    ? contacts.find((c) => (c as { id: string }).id === selectedContact)
    : null

  return (
    <div className="flex h-full flex-col">
      <WhatsAppHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalContacts={contacts.length}
        filteredCount={filteredContacts.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar com lista de contatos */}
        <div className="w-80 border-r bg-background flex flex-col">
          <ZApiStatus />
          <ContactsList
            contacts={
              filteredContacts as {
                id: string
                name: string
                phone: string
                email: string | null
                tags: string[]
                notes: string | null
                last_interaction: string | null
                whatsapp_id: string | null
                user_id: string
                created_at: string
                updated_at: string
              }[]
            }
            loading={contactsLoading}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        </div>

        {/* Área principal do chat */}
        <div className="flex-1 flex flex-col">
          {selectedContactData ? (
            <ChatInterface
              contact={
                selectedContactData as {
                  id: string
                  name: string
                  phone: string
                  email: string | null
                  tags: string[]
                  notes: string | null
                  last_interaction: string | null
                  whatsapp_id: string | null
                  user_id: string
                  created_at: string
                  updated_at: string
                }
              }
              messages={
                messages as {
                  id: string
                  contact_id: string | null
                  group_id: string | null
                  content: string
                  type: 'text' | 'image' | 'document' | 'audio'
                  direction: 'inbound' | 'outbound'
                  status: 'sent' | 'delivered' | 'read' | 'failed'
                  whatsapp_message_id: string | null
                  user_id: string
                  created_at: string
                }[]
              }
              loading={messagesLoading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
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
                <h3 className="text-lg font-semibold mb-2">
                  Selecione um contato
                </h3>
                <p className="text-muted-foreground">
                  Escolha um contato da lista para iniciar uma conversa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
