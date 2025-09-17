'use client'

import { useState, useEffect } from 'react'
import { useContacts } from '@/hooks/use-contacts'
import { useRealtimeContacts } from '@/hooks/use-realtime-contacts'
import { Contact } from '@/types/contacts'
import { ContactsList } from './contacts-list'
import { ContactForm } from './contact-form'
import { ContactsHeader } from './contacts-header'
import { ContactsImport } from './contacts-import'

export function ContactsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Use the actual contacts hook
  const {
    contacts,
    isLoading: loading,
    error,
    fetchContacts,
    syncContactsFromWhatsApp,
  } = useContacts()
  const [syncing, setSyncing] = useState(false)

  // Initialize contacts loading
  useEffect(() => {
    fetchContacts()
  }, [])

  // Use realtime updates
  useRealtimeContacts()

  const filteredContacts = (contacts || []).filter(
    (contact) =>
      contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      (contact.email &&
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEditContact = (contactId: string) => {
    setEditingContact(contactId)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingContact(null)
  }

  const handleAddContact = () => {
    setEditingContact(null)
    setShowForm(true)
  }

  const handleSyncContacts = async () => {
    // TODO: Get active Z-API instance ID from settings
    // For now, we'll show a message that Z-API needs to be configured
    setSyncing(true)
    try {
      const result = await syncContactsFromWhatsApp('default-instance')
      if (result.success) {
        console.log('Contacts synced successfully:', result.results)
      } else {
        console.error('Failed to sync contacts:', result.error)
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ContactsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddContact={handleAddContact}
        onSyncContacts={handleSyncContacts}
        totalContacts={contacts?.length || 0}
        filteredCount={filteredContacts.length}
        syncing={syncing}
        importComponent={<ContactsImport />}
      />

      <div className="flex-1 overflow-hidden">
        {showForm ? (
          <ContactForm
            contactId={editingContact}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        ) : (
          <ContactsList
            contacts={filteredContacts}
            loading={loading}
            error={error}
            onEditContact={handleEditContact}
          />
        )}
      </div>
    </div>
  )
}
