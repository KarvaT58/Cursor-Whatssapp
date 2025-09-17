'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { processPhoneForStorage, arePhoneNumbersEqual } from '@/lib/phone-utils'
import type { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchContacts = useCallback(async () => {
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

      console.log(
        'Contacts fetched successfully:',
        data?.length || 0,
        'contacts'
      )
      setContacts(data)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setContacts(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

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

      // Validate and normalize phone number
      const phoneValidation = processPhoneForStorage(contactData.phone)
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.error || 'Número de telefone inválido')
      }

      // Check for duplicate phone numbers in database
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('phone')
        .eq('user_id', user.id)

      if (existingContacts) {
        const isDuplicate = existingContacts.some((contact) =>
          arePhoneNumbersEqual(contact.phone, phoneValidation.normalized!)
        )

        if (isDuplicate) {
          throw new Error('Já existe um contato com este número de telefone')
        }
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          phone: phoneValidation.normalized!,
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
      // Get user for validation
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // If phone is being updated, validate and normalize it
      if (updates.phone) {
        const phoneValidation = processPhoneForStorage(updates.phone)
        if (!phoneValidation.isValid) {
          throw new Error(
            phoneValidation.error || 'Número de telefone inválido'
          )
        }

        // Check for duplicate phone numbers in database (excluding current contact)
        const { data: existingContacts } = await supabase
          .from('contacts')
          .select('id, phone')
          .eq('user_id', user.id)

        if (existingContacts) {
          const isDuplicate = existingContacts.some(
            (contact) =>
              contact.id !== id &&
              arePhoneNumbersEqual(contact.phone, phoneValidation.normalized!)
          )

          if (isDuplicate) {
            throw new Error('Já existe um contato com este número de telefone')
          }
        }

        updates.phone = phoneValidation.normalized!
      }

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

      // Buscar todos os contatos existentes UMA VEZ (fora do loop)
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('phone')
        .eq('user_id', user.id)

      // Validate and normalize all phone numbers
      const validatedContacts = []
      const errors = []

      for (let i = 0; i < contactsData.length; i++) {
        const contact = contactsData[i]
        const phoneValidation = processPhoneForStorage(contact.phone)

        if (!phoneValidation.isValid) {
          errors.push(`Linha ${i + 1}: ${phoneValidation.error}`)
          continue
        }

        // Check for duplicates within the import data
        const isDuplicateInImport = validatedContacts.some((validatedContact) =>
          arePhoneNumbersEqual(
            validatedContact.phone,
            phoneValidation.normalized!
          )
        )

        if (isDuplicateInImport) {
          errors.push(
            `Linha ${i + 1}: Número duplicado nos dados de importação`
          )
          continue
        }

        // Check for duplicates with existing contacts in database
        if (existingContacts) {
          const isDuplicateWithExisting = existingContacts.some(
            (existingContact) =>
              arePhoneNumbersEqual(
                existingContact.phone,
                phoneValidation.normalized!
              )
          )

          if (isDuplicateWithExisting) {
            errors.push(`Linha ${i + 1}: Número já existe nos contatos`)
            continue
          }
        }

        validatedContacts.push({
          ...contact,
          phone: phoneValidation.normalized!,
          user_id: user.id,
        })
      }

      if (errors.length > 0) {
        throw new Error(`Erros na importação:\n${errors.join('\n')}`)
      }

      if (validatedContacts.length === 0) {
        throw new Error('Nenhum contato válido para importar')
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert(validatedContacts)
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
          contact?.name || '',
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
  }, [fetchContacts])

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
  }, [supabase])

  const syncContactsFromWhatsApp = async (instanceId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/contacts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao sincronizar contatos')
      }

      // Recarregar contatos após sincronização
      await fetchContacts()

      return {
        success: true,
        results: data.results,
        message: data.message,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao sincronizar contatos'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
    exportContacts,
    fetchContacts,
    syncContactsFromWhatsApp,
    refetch: fetchContacts,
  }
}
