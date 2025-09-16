'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

export function useRealtimeGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const supabase = createClient()

  useEffect(() => {
    const fetchGroups = async () => {
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
          .from('whatsapp_groups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setGroups(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar grupos')
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [supabase])

  useEffect(() => {
    if (!isConnected) return

    const channel = subscribe('whatsapp_groups', (payload) => {
      console.log('Mudança em grupos:', payload)

      if (payload.eventType === 'INSERT') {
        const newGroup = payload.new as Group
        setGroups((prev) => [newGroup, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        const updatedGroup = payload.new as Group
        setGroups((prev) =>
          prev.map((group) =>
            group.id === updatedGroup.id ? updatedGroup : group
          )
        )
      } else if (payload.eventType === 'DELETE') {
        const deletedGroup = payload.old as Group
        setGroups((prev) =>
          prev.filter((group) => group.id !== deletedGroup.id)
        )
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [isConnected, subscribe, unsubscribe])

  const addGroup = async (
    groupData: Omit<
      Group,
      'id' | 'created_at' | 'updated_at' | 'user_id' | 'participants'
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
        .from('whatsapp_groups')
        .insert({
          ...groupData,
          user_id: user.id,
          participants: [],
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo')
      throw err
    }
  }

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_groups')
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

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar grupo')
      throw err
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_groups')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar grupo')
      throw err
    }
  }

  const syncGroupFromWhatsApp = async (whatsappId: string) => {
    try {
      // TODO: Implementar integração com Z-API para sincronizar grupo
      // Por enquanto, apenas retorna um placeholder
      console.log('Sincronizando grupo do WhatsApp:', whatsappId)

      // Aqui seria feita a chamada para a Z-API para obter dados do grupo
      // const groupData = await zApiClient.getGroupInfo(whatsappId)

      return {
        success: true,
        message: 'Grupo sincronizado com sucesso',
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sincronizar grupo')
      throw err
    }
  }

  return {
    groups,
    loading,
    error,
    isConnected,
    addGroup,
    updateGroup,
    deleteGroup,
    syncGroupFromWhatsApp,
  }
}
