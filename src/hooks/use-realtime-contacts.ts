'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']

export function useRealtimeContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const supabase = createClient()

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Usuário não autenticado')
        }

        const { data, error: fetchError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        setContacts(data || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar contatos'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [supabase])

  useEffect(() => {
    if (!isConnected) return

    const channel = subscribe('contacts', (payload) => {
      console.log('Mudança em contatos:', payload)

      if (payload.eventType === 'INSERT') {
        const newContact = payload.new as Contact
        setContacts((prev) =>
          [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name))
        )
      } else if (payload.eventType === 'UPDATE') {
        const updatedContact = payload.new as Contact
        setContacts((prev) =>
          prev
            .map((contact) =>
              contact.id === updatedContact.id ? updatedContact : contact
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      } else if (payload.eventType === 'DELETE') {
        const deletedContact = payload.old as Contact
        setContacts((prev) =>
          prev.filter((contact) => contact.id !== deletedContact.id)
        )
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [isConnected, subscribe, unsubscribe])

  const addContact = async (
    contactData: Omit<
      Contact,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'user_id'
      | 'last_interaction'
      | 'whatsapp_id'
    >
  ) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar contato')
      }

      const { contact } = await response.json()
      return contact
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar contato')
      throw err
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar contato')
      }

      const { contact } = await response.json()
      return contact
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contato')
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar contato')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar contato')
      throw err
    }
  }

  return {
    contacts,
    loading,
    error,
    isConnected,
    addContact,
    updateContact,
    deleteContact,
  }
}
