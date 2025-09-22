'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'

interface RealtimeEvent {
  type: 'connected' | 'group_update' | 'notification' | 'heartbeat'
  event?: string
  data?: any
  message?: string
  timestamp: string
}

interface UseRealtimeNotificationsReturn {
  isConnected: boolean
  lastEvent: RealtimeEvent | null
  connect: () => void
  disconnect: () => void
}

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return // Já conectado
    }

    console.log('🔌 Conectando ao sistema de notificações em tempo real...')
    
    const eventSource = new EventSource('/api/realtime/notifications')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('✅ Conectado ao sistema de notificações')
      setIsConnected(true)
      reconnectAttempts.current = 0
    }

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data)
        setLastEvent(data)
        
        console.log('📨 Evento recebido:', data)

        // Processar diferentes tipos de eventos
        switch (data.type) {
          case 'connected':
            console.log('🎉 Conectado ao sistema de notificações')
            break
            
          case 'group_update':
            handleGroupUpdate(data)
            break
            
          case 'notification':
            handleNotification(data)
            break
            
          case 'heartbeat':
            // Manter conexão viva
            break
            
          default:
            console.log('❓ Evento desconhecido:', data.type)
        }
      } catch (error) {
        console.error('❌ Erro ao processar evento:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ Erro na conexão SSE:', error)
      setIsConnected(false)
      
      // Tentar reconectar
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        
        console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts.current}/${maxReconnectAttempts})`)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      } else {
        console.error('❌ Máximo de tentativas de reconexão atingido')
        toast.error('Conexão com notificações em tempo real perdida')
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsConnected(false)
    console.log('🔌 Desconectado do sistema de notificações')
  }, [])

  const handleGroupUpdate = (event: RealtimeEvent) => {
    const { event: eventType, data } = event
    
    if (!data) return

    switch (eventType) {
      case 'UPDATE':
        if (data.participants) {
          toast.success(`Grupo "${data.name}" atualizado - ${data.participants.length} participantes`)
        }
        break
        
      case 'INSERT':
        toast.success(`Novo grupo "${data.name}" criado`)
        break
        
      case 'DELETE':
        toast.info(`Grupo "${data.name}" removido`)
        break
        
      default:
        console.log('📝 Grupo atualizado:', data.name)
    }
  }

  const handleNotification = (event: RealtimeEvent) => {
    const { data } = event
    
    if (!data) return

    // Mostrar notificação baseada no tipo
    switch (data.type) {
      case 'participant_join':
        toast.success(`${data.sender_name} entrou no grupo "${data.group_name}"`)
        break
        
      case 'participant_leave':
        toast.info(`${data.sender_name} saiu do grupo "${data.group_name}"`)
        break
        
      case 'new_message':
        if (data.is_group) {
          toast.info(`Nova mensagem em "${data.group_name}"`)
        }
        break
        
      case 'group_created':
        toast.success(`Grupo "${data.group_name}" criado automaticamente`)
        break
        
      default:
        toast.info(data.message || 'Nova notificação')
    }
  }

  // Conectar automaticamente quando o hook for montado
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Limpar timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect
  }
}