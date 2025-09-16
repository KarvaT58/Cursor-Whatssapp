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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar contato')
      throw err
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contato')
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)

      if (error) {
        throw error
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
