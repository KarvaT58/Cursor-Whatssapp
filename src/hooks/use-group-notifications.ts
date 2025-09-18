'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type GroupNotification = Database['public']['Tables']['group_notifications']['Row']
type GroupNotificationInsert = Database['public']['Tables']['group_notifications']['Insert']
type GroupNotificationUpdate = Database['public']['Tables']['group_notifications']['Update']

export function useGroupNotifications() {
  const [notifications, setNotifications] = useState<GroupNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Buscar notificações do usuário
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      const { data, error } = await supabase
        .from('group_notifications')
        .select(`
          *,
          whatsapp_groups (
            id,
            name,
            whatsapp_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar notificações:', error)
        setError(error.message)
        return
      }

      setNotifications(data || [])
    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Criar nova notificação
  const createNotification = useCallback(async (
    notification: Omit<GroupNotificationInsert, 'user_id'>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('group_notifications')
        .insert({
          ...notification,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar notificação:', error)
        throw error
      }

      // Atualizar lista local
      setNotifications(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
      throw err
    }
  }, [supabase])

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('group_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error)
        throw error
      }

      // Atualizar lista local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
      throw err
    }
  }, [supabase])

  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('group_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error)
        throw error
      }

      // Atualizar lista local
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err)
      throw err
    }
  }, [supabase])

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('group_notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Erro ao deletar notificação:', error)
        throw error
      }

      // Atualizar lista local
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      )
    } catch (err) {
      console.error('Erro ao deletar notificação:', err)
      throw err
    }
  }, [supabase])

  // Deletar todas as notificações
  const deleteAllNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('group_notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar todas as notificações:', error)
        throw error
      }

      setNotifications([])
    } catch (err) {
      console.error('Erro ao deletar todas as notificações:', err)
      throw err
    }
  }, [supabase])

  // Aprovar solicitação de entrada no grupo
  const approveJoinRequest = useCallback(async (
    notificationId: string,
    groupId: string,
    requesterPhone: string
  ) => {
    try {
      // Aqui você pode implementar a lógica para aprovar a entrada no grupo
      // Por exemplo, chamar a API da Z-API para adicionar o participante
      
      // Marcar notificação como lida
      await markAsRead(notificationId)
      
      // Criar notificação de sucesso
      await createNotification({
        group_id: groupId,
        type: 'member_added',
        title: 'Solicitação aprovada',
        message: `O usuário ${requesterPhone} foi adicionado ao grupo com sucesso.`,
        data: { requester_phone: requesterPhone, action: 'approved' }
      })

      return { success: true }
    } catch (err) {
      console.error('Erro ao aprovar solicitação:', err)
      throw err
    }
  }, [markAsRead, createNotification])

  // Rejeitar solicitação de entrada no grupo
  const rejectJoinRequest = useCallback(async (
    notificationId: string,
    groupId: string,
    requesterPhone: string
  ) => {
    try {
      // Marcar notificação como lida
      await markAsRead(notificationId)
      
      // Criar notificação de rejeição
      await createNotification({
        group_id: groupId,
        type: 'member_removed',
        title: 'Solicitação rejeitada',
        message: `A solicitação de entrada do usuário ${requesterPhone} foi rejeitada.`,
        data: { requester_phone: requesterPhone, action: 'rejected' }
      })

      return { success: true }
    } catch (err) {
      console.error('Erro ao rejeitar solicitação:', err)
      throw err
    }
  }, [markAsRead, createNotification])

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length

  // Buscar notificações na inicialização
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    approveJoinRequest,
    rejectJoinRequest,
  }
}
