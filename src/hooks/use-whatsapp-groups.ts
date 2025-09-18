'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']
type GroupInsert = Database['public']['Tables']['whatsapp_groups']['Insert']
type GroupUpdate = Database['public']['Tables']['whatsapp_groups']['Update']

interface UseWhatsAppGroupsProps {
  userId?: string
  excludeUniversal?: boolean // Novo parâmetro para excluir grupos universais
}

export function useWhatsAppGroups({ userId, excludeUniversal = false }: UseWhatsAppGroupsProps) {
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

      let query = supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('user_id', userId)

      // Se excludeUniversal for true, filtrar apenas grupos sem group_family
      if (excludeUniversal) {
        query = query.is('group_family', null)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setGroups(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos')
    } finally {
      setLoading(false)
    }
  }, [userId, excludeUniversal])

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
  }, [userId])

  // Criar grupo
  const createGroup = useCallback(
    async (groupData: Omit<GroupInsert, 'user_id'>) => {
      try {
        setError(null)
        
        // Validar dados obrigatórios
        if (!groupData.name?.trim()) {
          throw new Error('Nome do grupo é obrigatório')
        }

        if (!groupData.participants || groupData.participants.length === 0) {
          throw new Error('É necessário pelo menos um participante para criar o grupo')
        }

        // Fazer requisição para a API
        const response = await fetch('/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(groupData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar grupo')
        }

        // Se o grupo foi criado com sucesso, recarregar a lista para garantir que está atualizada
        if (result.success) {
          await loadGroups()
        }
        
        return { 
          success: result.success,
          data: result.data,
          message: result.message,
          warning: result.warning,
          whatsapp_id: result.whatsapp_id
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao criar grupo'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [userId]
  )

  // Atualizar grupo
  const updateGroup = useCallback(
    async (groupId: string, updates: GroupUpdate) => {
      try {
        // Se estiver atualizando apenas o nome, usar a API route específica
        if (updates.name && Object.keys(updates).length === 1) {
          const response = await fetch(`/api/groups/${groupId}/name`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: updates.name }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao atualizar nome do grupo')
          }

          const result = await response.json()
          // Recarregar a lista para garantir que está atualizada
          await loadGroups()
          return { success: true, data: result.group }
        }

        // Se estiver atualizando apenas a descrição, usar a API route específica
        if (updates.description !== undefined && Object.keys(updates).length === 1) {
          const response = await fetch(`/api/groups/${groupId}/description`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: updates.description }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao atualizar descrição do grupo')
          }

          const result = await response.json()
          // Recarregar a lista para garantir que está atualizada
          await loadGroups()
          return { success: true, data: result.group }
        }

        // Para outras atualizações, usar o método direto do Supabase
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

        // Recarregar a lista para garantir que está atualizada
        await loadGroups()
        return { success: true, data }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao atualizar grupo'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [userId]
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

        // Recarregar a lista para garantir que está atualizada
        await loadGroups()
        return { success: true }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao excluir grupo'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [userId]
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
    [groups, userId]
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
    [groups, userId]
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
