'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      setContacts(data)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setContacts(null)
    } finally {
      setIsLoading(false)
    }
  }

  const addContact = async (
    contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
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

      setContacts((prev) => (prev ? [...prev, data] : [data]))
      return data
    } catch (err) {
      console.error('Error adding contact:', err)
      throw err
    }
  }

  const updateContact = async (
    id: string,
    updates: Partial<Omit<Contact, 'id' | 'created_at' | 'user_id'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setContacts((prev) =>
        prev
          ? prev.map((contact) => (contact.id === id ? data : contact))
          : [data]
      )
      return data
    } catch (err) {
      console.error('Error updating contact:', err)
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)

      if (error) {
        throw error
      }

      setContacts((prev) =>
        prev ? prev.filter((contact) => contact.id !== id) : null
      )
    } catch (err) {
      console.error('Error deleting contact:', err)
      throw err
    }
  }

  const importContacts = async (
    contactsData: Array<
      Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'user_id'>
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const contactsWithUserId = contactsData.map((contact) => ({
        ...contact,
        user_id: user.id,
      }))

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsWithUserId)
        .select()

      if (error) {
        throw error
      }

      setContacts((prev) => (prev ? [...prev, ...data] : data))
      return data
    } catch (err) {
      console.error('Error importing contacts:', err)
      throw err
    }
  }

  const exportContacts = () => {
    if (!contacts) return null

    const csvContent = [
      ['Nome', 'Telefone', 'Email', 'Tags', 'Notas', 'Última Interação'].join(
        ','
      ),
      ...contacts.map((contact) =>
        [
          contact.name,
          contact.phone,
          contact.email || '',
          contact.tags?.join(';') || '',
          contact.notes || '',
          contact.last_interaction || '',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `contatos-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          console.log('Contact change received:', payload)

          switch (payload.eventType) {
            case 'INSERT':
              setContacts((prev) =>
                prev
                  ? [...prev, payload.new as Contact]
                  : [payload.new as Contact]
              )
              break
            case 'UPDATE':
              setContacts((prev) =>
                prev
                  ? prev.map((contact) =>
                      contact.id === payload.new.id
                        ? (payload.new as Contact)
                        : contact
                    )
                  : [payload.new as Contact]
              )
              break
            case 'DELETE':
              setContacts((prev) =>
                prev
                  ? prev.filter((contact) => contact.id !== payload.old.id)
                  : null
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
    exportContacts,
    refetch: fetchContacts,
  }
}
