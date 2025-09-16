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
  const { contacts, loading: contactsLoading } = useRealtimeContacts()
  const { messages, loading: messagesLoading } = useRealtimeMessages(
    selectedContact || undefined
  )

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  )

  const selectedContactData = selectedContact
    ? contacts.find((c) => c.id === selectedContact)
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
            contacts={filteredContacts}
            loading={contactsLoading}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        </div>

        {/* Área principal do chat */}
        <div className="flex-1 flex flex-col">
          {selectedContactData ? (
            <ChatInterface
              contact={selectedContactData}
              messages={messages}
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
