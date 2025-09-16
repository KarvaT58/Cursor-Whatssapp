'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row']
type TeamMessage = Database['public']['Tables']['team_messages']['Row']
type User = Database['public']['Tables']['users']['Row']

export function useRealtimeTeam() {
  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const supabase = createClient()

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Usuário não autenticado')
        }

        // Buscar dados do usuário para obter team_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('team_id')
          .eq('id', user.id)
          .single()

        if (userError) {
          throw userError
        }

        if (!userData?.team_id) {
          setLoading(false)
          return
        }

        // Buscar dados da equipe
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', userData.team_id)
          .single()

        if (teamError) {
          throw teamError
        }

        setTeam(teamData)

        // Buscar membros da equipe
        const { data: membersData, error: membersError } = await supabase
          .from('users')
          .select('*')
          .eq('team_id', userData.team_id)
          .order('created_at', { ascending: true })

        if (membersError) {
          throw membersError
        }

        setTeamMembers(membersData || [])

        // Buscar mensagens da equipe
        const { data: messagesData, error: messagesError } = await supabase
          .from('team_messages')
          .select('*')
          .eq('team_id', userData.team_id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (messagesError) {
          throw messagesError
        }

        setTeamMessages((messagesData || []).reverse())
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar dados da equipe'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [supabase])

  useEffect(() => {
    if (!isConnected || !team) return

    // Escutar mudanças nos membros da equipe
    const membersChannel = subscribe('users', (payload) => {
      console.log('Mudança em usuários:', payload)

      if (payload.eventType === 'INSERT') {
        const newUser = payload.new as User
        if (newUser.team_id === team.id) {
          setTeamMembers((prev) => [...prev, newUser])
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedUser = payload.new as User
        setTeamMembers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        )
      } else if (payload.eventType === 'DELETE') {
        const deletedUser = payload.old as User
        setTeamMembers((prev) =>
          prev.filter((user) => user.id !== deletedUser.id)
        )
      }
    })

    // Escutar mudanças nas mensagens da equipe
    const messagesChannel = subscribe('team_messages', (payload) => {
      console.log('Mudança em mensagens da equipe:', payload)

      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as TeamMessage
        if (newMessage.team_id === team.id) {
          setTeamMessages((prev) => [...prev, newMessage])
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new as TeamMessage
        setTeamMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        )
      } else if (payload.eventType === 'DELETE') {
        const deletedMessage = payload.old as TeamMessage
        setTeamMessages((prev) =>
          prev.filter((msg) => msg.id !== deletedMessage.id)
        )
      }
    })

    return () => {
      unsubscribe(membersChannel)
      unsubscribe(messagesChannel)
    }
  }, [isConnected, team, subscribe, unsubscribe])

  const createTeam = async (name: string, description?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description: description || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Atualizar usuário com team_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ team_id: data.id })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar equipe')
      throw err
    }
  }

  const inviteUser = async (email: string, role: 'admin' | 'user' = 'user') => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !team) {
        throw new Error('Usuário não autenticado ou equipe não encontrada')
      }

      // Verificar se o usuário já existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (existingUser) {
        // Usuário já existe, adicionar à equipe
        const { error: updateError } = await supabase
          .from('users')
          .update({
            team_id: team.id,
            role: role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id)

        if (updateError) {
          throw updateError
        }
      } else {
        // Usuário não existe, criar convite (implementar sistema de convites)
        // Por enquanto, apenas retornar erro
        throw new Error(
          'Usuário não encontrado. Sistema de convites em desenvolvimento.'
        )
      }

      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao convidar usuário')
      throw err
    }
  }

  const removeUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          team_id: null,
          role: 'user',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover usuário')
      throw err
    }
  }

  const sendTeamMessage = async (
    content: string,
    channel: string = 'general'
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !team) {
        throw new Error('Usuário não autenticado ou equipe não encontrada')
      }

      const { data, error } = await supabase
        .from('team_messages')
        .insert({
          content,
          channel,
          team_id: team.id,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
      throw err
    }
  }

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar função')
      throw err
    }
  }

  return {
    team,
    teamMembers,
    teamMessages,
    loading,
    error,
    isConnected,
    createTeam,
    inviteUser,
    removeUser,
    sendTeamMessage,
    updateUserRole,
  }
}
