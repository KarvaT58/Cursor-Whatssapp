'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']
type GroupInsert = Database['public']['Tables']['whatsapp_groups']['Insert']
type GroupUpdate = Database['public']['Tables']['whatsapp_groups']['Update']

interface UseWhatsAppGroupsProps {
  userId?: string
}

export function useWhatsAppGroups({ userId }: UseWhatsAppGroupsProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Carregar grupos
  const loadGroups = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', userId)
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
  }, [userId, supabase])

  // Carregar grupos inicialmente
  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('whatsapp_groups_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_groups',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
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
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Criar grupo
  const createGroup = useCallback(
    async (groupData: Omit<GroupInsert, 'user_id'>) => {
      try {
        const { data, error: insertError } = await supabase
          .from('whatsapp_groups')
          .insert({
            ...groupData,
            user_id: userId,
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return { success: true, data }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao criar grupo'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [userId, supabase]
  )

  // Atualizar grupo
  const updateGroup = useCallback(
    async (groupId: string, updates: GroupUpdate) => {
      try {
        const { data, error: updateError } = await supabase
          .from('whatsapp_groups')
          .update(updates)
          .eq('id', groupId)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return { success: true, data }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao atualizar grupo'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [userId, supabase]
  )

  // Excluir grupo
  const deleteGroup = useCallback(
    async (groupId: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('whatsapp_groups')
          .delete()
          .eq('id', groupId)
          .eq('user_id', userId)

        if (deleteError) {
          throw deleteError
        }

        return { success: true }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao excluir grupo'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [userId, supabase]
  )

  // Adicionar participante ao grupo
  const addParticipant = useCallback(
    async (groupId: string, participantPhone: string) => {
      try {
        const group = groups.find((g) => g.id === groupId)
        if (!group) {
          throw new Error('Grupo não encontrado')
        }

        const currentParticipants = group.participants || []
        if (currentParticipants.includes(participantPhone)) {
          throw new Error('Participante já está no grupo')
        }

        const updatedParticipants = [...currentParticipants, participantPhone]

        const { data, error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({ participants: updatedParticipants })
          .eq('id', groupId)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return { success: true, data }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao adicionar participante'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [groups, userId, supabase]
  )

  // Remover participante do grupo
  const removeParticipant = useCallback(
    async (groupId: string, participantPhone: string) => {
      try {
        const group = groups.find((g) => g.id === groupId)
        if (!group) {
          throw new Error('Grupo não encontrado')
        }

        const currentParticipants = group.participants || []
        const updatedParticipants = currentParticipants.filter(
          (p) => p !== participantPhone
        )

        const { data, error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({ participants: updatedParticipants })
          .eq('id', groupId)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return { success: true, data }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao remover participante'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [groups, userId, supabase]
  )

  // Buscar grupos
  const searchGroups = useCallback(
    (query: string) => {
      if (!query.trim()) return groups

      const lowercaseQuery = query.toLowerCase()
      return groups.filter(
        (group) =>
          group.name.toLowerCase().includes(lowercaseQuery) ||
          (group.description &&
            group.description.toLowerCase().includes(lowercaseQuery))
      )
    },
    [groups]
  )

  // Obter grupo por ID
  const getGroupById = useCallback(
    (groupId: string) => {
      return groups.find((group) => group.id === groupId)
    },
    [groups]
  )

  // Obter grupos por WhatsApp ID
  const getGroupByWhatsAppId = useCallback(
    (whatsappId: string) => {
      return groups.find((group) => group.whatsapp_id === whatsappId)
    },
    [groups]
  )

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    addParticipant,
    removeParticipant,
    searchGroups,
    getGroupById,
    getGroupByWhatsAppId,
    refreshGroups: loadGroups,
  }
}
