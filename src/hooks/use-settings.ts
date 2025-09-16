'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type ZApiInstance = Database['public']['Tables']['z_api_instances']['Row']
type User = Database['public']['Tables']['users']['Row']

export function useSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [zApiInstances, setZApiInstances] = useState<ZApiInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          throw new Error('Usuário não autenticado')
        }

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userError) {
          throw userError
        }

        setUser(userData)

        // Buscar instâncias Z-API
        const { data: instancesData, error: instancesError } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        if (instancesError) {
          throw instancesError
        }

        setZApiInstances(instancesData || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar configurações'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setUser(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
      throw err
    }
  }

  const createZApiInstance = async (instanceData: {
    name: string
    instance_id: string
    instance_token: string
    client_token: string
  }) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('z_api_instances')
        .insert({
          ...instanceData,
          user_id: authUser.id,
          is_active: false, // Nova instância inicia como inativa
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setZApiInstances((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar instância Z-API'
      )
      throw err
    }
  }

  const updateZApiInstance = async (
    id: string,
    updates: Partial<ZApiInstance>
  ) => {
    try {
      const { data, error } = await supabase
        .from('z_api_instances')
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

      setZApiInstances((prev) =>
        prev.map((instance) => (instance.id === id ? data : instance))
      )
      return data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar instância'
      )
      throw err
    }
  }

  const deleteZApiInstance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('z_api_instances')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setZApiInstances((prev) => prev.filter((instance) => instance.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar instância')
      throw err
    }
  }

  const setActiveZApiInstance = async (id: string) => {
    try {
      // Desativar todas as instâncias
      const { error: deactivateError } = await supabase
        .from('z_api_instances')
        .update({ is_active: false })
        .eq('user_id', user?.id)

      if (deactivateError) {
        throw deactivateError
      }

      // Ativar a instância selecionada
      const { data, error } = await supabase
        .from('z_api_instances')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setZApiInstances((prev) =>
        prev.map((instance) => ({
          ...instance,
          is_active: instance.id === id,
        }))
      )

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar instância')
      throw err
    }
  }

  const testZApiConnection = async (instance: ZApiInstance) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_Z_API_URL || 'https://api.z-api.io'}/instances/${instance.instance_id}/status`,
        {
          method: 'GET',
          headers: {
            'Client-Token': instance.client_token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Erro na conexão: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha')
      throw err
    }
  }

  return {
    user,
    zApiInstances,
    loading,
    error,
    updateUserProfile,
    createZApiInstance,
    updateZApiInstance,
    deleteZApiInstance,
    setActiveZApiInstance,
    testZApiConnection,
    changePassword,
  }
}
