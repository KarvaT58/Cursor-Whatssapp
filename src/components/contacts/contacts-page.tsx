'use client'

import { useState, useEffect } from 'react'
import { useContacts } from '@/hooks/use-contacts'
import { useRealtimeContacts } from '@/hooks/use-realtime-contacts'
import { useSettings } from '@/hooks/use-settings'
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
    addContact,
    updateContact,
    deleteContact,
    setContacts,
  } = useContacts()
  const [syncing, setSyncing] = useState(false)

  // Get Z-API instances for sync functionality
  const { zApiInstances } = useSettings()

  // Initialize contacts loading
  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Temporariamente removido para testar se há conflito com o realtime do useContacts
  // useRealtimeContacts({
  //   onContactAdded: (contact) => {
  //     console.log('🔔 useRealtimeContacts: onContactAdded', contact)
  //     setContacts((prev) => (prev ? [...prev, contact] : [contact]))
  //   },
  //   onContactUpdated: (updatedContact) => {
  //     console.log('🔔 useRealtimeContacts: onContactUpdated', updatedContact)
  //     setContacts((prev) =>
  //       prev ? prev.map(contact =>
  //         contact.id === updatedContact.id ? updatedContact : contact
  //       ) : [updatedContact]
  //     )
  //   },
  //   onContactDeleted: (contactId) => {
  //     console.log('🔔 useRealtimeContacts: onContactDeleted', contactId)
  //     setContacts((prev) =>
  //       prev ? prev.filter(contact => contact.id !== contactId) : []
  //     )
  //   },
  //   onContactImported: (count) => {
  //     console.log('🔔 useRealtimeContacts: onContactImported', count)
  //     // Refresh the entire contacts list when import is completed
  //     fetchContacts()
  //   }
  // })

  // Callback para quando a importação for concluída
  const handleImportCompleted = (result: {
    imported: number
    updated: number
    skipped: number
    errors: Array<{
      index: number
      error: string
      contact: Record<string, unknown>
    }>
  }) => {
    // Refresh the contacts list to show the newly imported contacts
    fetchContacts()
  }

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
    // Get the active Z-API instance
    const activeInstance = zApiInstances?.find((instance) => instance.is_active)

    if (!activeInstance) {
      console.error(
        'No active Z-API instance found. Please configure a Z-API instance first.'
      )
      return
    }

    setSyncing(true)
    try {
      const result = await syncContactsFromWhatsApp(activeInstance.id)
      if (result.success) {
        console.log('Contacts synced successfully:', result.results)
        // Refresh contacts after successful sync
        await fetchContacts()
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
        canSync={!!zApiInstances?.find((instance) => instance.is_active)}
        importComponent={
          <ContactsImport onImportCompleted={handleImportCompleted} />
        }
      />

      <div className="flex-1 overflow-hidden">
        {showForm ? (
          <ContactForm
            contactId={editingContact}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
            contacts={contacts || []}
            addContact={addContact}
            updateContact={updateContact}
          />
        ) : (
          <ContactsList
            contacts={filteredContacts}
            loading={loading}
            error={error}
            onEditContact={handleEditContact}
            onDeleteContact={deleteContact}
          />
        )}
      </div>
    </div>
  )
}
