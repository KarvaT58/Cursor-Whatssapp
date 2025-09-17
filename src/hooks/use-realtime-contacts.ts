'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { Contact } from '@/types/contacts'
import { toast } from 'sonner'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeContactsProps {
  onContactAdded?: (contact: Contact) => void
  onContactUpdated?: (contact: Contact) => void
  onContactDeleted?: (contactId: string) => void
  onContactImported?: (count: number) => void
}

export function useRealtimeContacts({
  onContactAdded,
  onContactUpdated,
  onContactDeleted,
  onContactImported,
}: UseRealtimeContactsProps = {}) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  // Subscribe to contacts table
  useEffect(() => {
    if (!isConnected) return

    const contactsChannel = subscribe('contacts', (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const contact = payload.new as Contact
        onContactAdded?.(contact)
        toast.success(`Novo contato adicionado: ${contact?.name || 'Contato'}`)
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const contact = payload.new as Contact
        onContactUpdated?.(contact)
      } else if (payload.eventType === 'DELETE') {
        const contactId = (payload.old as Contact)?.id
        if (contactId) {
          onContactDeleted?.(contactId)
          toast.success('Contato removido')
        }
      }
    })

    setChannels((prev) => [...prev, contactsChannel])

    return () => {
      unsubscribe(contactsChannel)
      setChannels((prev) => prev.filter((c) => c !== contactsChannel))
    }
  }, [isConnected]) // Remove function dependencies to prevent loops

  // Subscribe to contact import jobs
  useEffect(() => {
    if (!isConnected) return

    const importChannel = subscribe('contact_import_jobs', (payload) => {
      console.log('Contact import update:', payload)

      if (payload.eventType === 'UPDATE' && payload.new) {
        const job = payload.new as { status?: string; imported_count?: number }
        if (job.status === 'completed' && job.imported_count) {
          onContactImported?.(job.imported_count)
          toast.success(`${job.imported_count} contatos importados com sucesso`)
        } else if (job.status === 'failed') {
          toast.error('Falha ao importar contatos')
        }
      }
    })

    setChannels((prev) => [...prev, importChannel])

    return () => {
      unsubscribe(importChannel)
      setChannels((prev) => prev.filter((c) => c !== importChannel))
    }
  }, [isConnected]) // Remove function dependencies to prevent loops

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      channels.forEach((channel) => unsubscribe(channel))
    }
  }, []) // Remove dependencies to prevent cleanup loops

  return {
    isConnected,
    channelsCount: channels.length,
  }
}
