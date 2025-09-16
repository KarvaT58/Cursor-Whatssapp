'use client'

import { useState } from 'react'
import { useRealtimeContacts } from '@/hooks/use-realtime-contacts'
import { ContactsList } from './contacts-list'
import { ContactForm } from './contact-form'
import { ContactsHeader } from './contacts-header'
import { ContactsImport } from './contacts-import'

export function ContactsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { contacts, loading, error } = useRealtimeContacts()

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="flex h-full flex-col">
      <ContactsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddContact={handleAddContact}
        totalContacts={contacts.length}
        filteredCount={filteredContacts.length}
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
