'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeContextType {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  lastConnectedAt: Date | null
  reconnectAttempts: number
  subscribe: (
    table: string,
    callback: (payload: Record<string, unknown>) => void,
    options?: {
      schema?: string
      table?: string
      filter?: string
    }
  ) => RealtimeChannel
  unsubscribe: (channel: RealtimeChannel) => void
  subscribeToTeamMessages: (
    teamId: string,
    callback: (payload: Record<string, unknown>) => void
  ) => RealtimeChannel
  subscribeToTeamPresence: (
    teamId: string,
    callback: (payload: Record<string, unknown>) => void
  ) => RealtimeChannel
  reconnect: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('connecting')
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [channels, setChannels] = useState<RealtimeChannel[]>([])
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000 // 1 second base delay

  const reconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.warn('Máximo de tentativas de reconexão atingido')
      setConnectionStatus('disconnected')
      return
    }

    setConnectionStatus('reconnecting')
    setReconnectAttempts((prev) => prev + 1)

    // Exponential backoff
    const delay = reconnectDelay * Math.pow(2, reconnectAttempts)

    reconnectTimeoutRef.current = setTimeout(() => {
      checkConnection()
    }, delay)
  }, [reconnectAttempts])

  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus('connecting')
      const { error } = await supabase
        .from('whatsapp_messages')
        .select('id')
        .limit(1)

      if (!error) {
        setIsConnected(true)
        setConnectionStatus('connected')
        setLastConnectedAt(new Date())
        setReconnectAttempts(0)
        console.log('Realtime conectado com sucesso')
      } else {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Erro ao verificar conexão Realtime:', error)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      reconnect()
    }
  }, [reconnect])

  useEffect(() => {
    setMounted(true)

    // Only run on client side
    if (typeof window === 'undefined') return

    checkConnection()

    // Configurar listener para mudanças de conexão
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        checkConnection()
      } else if (event === 'SIGNED_OUT') {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        setLastConnectedAt(null)
        setReconnectAttempts(0)
        // Desconectar todos os canais
        channels.forEach((channel) => channel.unsubscribe())
        setChannels([])
      }
    })

    // Configurar listener para mudanças de conectividade
    const handleOnline = () => {
      console.log('Conexão de rede restaurada')
      if (!isConnected) {
        checkConnection()
      }
    }

    const handleOffline = () => {
      console.log('Conexão de rede perdida')
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      // Limpar todos os canais ao desmontar
      channels.forEach((channel) => channel.unsubscribe())
    }
  }, [supabase, channels, checkConnection, isConnected])

  const subscribe = (
    table: string,
    callback: (payload: Record<string, unknown>) => void,
    options?: {
      schema?: string
      table?: string
      filter?: string
    }
  ) => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: options?.schema || 'public',
          table: options?.table || table,
          filter: options?.filter,
        },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setChannels((prev) => [...prev, channel])
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Erro no canal ${table}:`, status)
          setIsConnected(false)
        }
      })

    return channel
  }

  const subscribeToTeamMessages = (
    teamId: string,
    callback: (payload: Record<string, unknown>) => void
  ) => {
    const channel = supabase
      .channel(`team_messages_${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_messages',
          filter: `team_id=eq.${teamId}`,
        },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setChannels((prev) => [...prev, channel])
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Erro no canal team_messages_${teamId}:`, status)
          setIsConnected(false)
        }
      })

    return channel
  }

  const subscribeToTeamPresence = (
    teamId: string,
    callback: (payload: Record<string, unknown>) => void
  ) => {
    const channel = supabase
      .channel(`team_presence_${teamId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        callback({ type: 'presence_sync', state })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        callback({ type: 'presence_join', key, newPresences })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        callback({ type: 'presence_leave', key, leftPresences })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setChannels((prev) => [...prev, channel])
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Erro no canal team_presence_${teamId}:`, status)
          setIsConnected(false)
        }
      })

    return channel
  }

  const unsubscribe = (channel: RealtimeChannel) => {
    channel.unsubscribe()
    setChannels((prev) => prev.filter((c) => c !== channel))
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <RealtimeContext.Provider
        value={{
          isConnected: false,
          connectionStatus: 'connecting',
          lastConnectedAt: null,
          reconnectAttempts: 0,
          subscribe: () => ({}) as RealtimeChannel,
          unsubscribe: () => {},
          subscribeToTeamMessages: () => ({}) as RealtimeChannel,
          subscribeToTeamPresence: () => ({}) as RealtimeChannel,
          reconnect: () => {},
        }}
      >
        {children}
      </RealtimeContext.Provider>
    )
  }

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        connectionStatus,
        lastConnectedAt,
        reconnectAttempts,
        subscribe,
        unsubscribe,
        subscribeToTeamMessages,
        subscribeToTeamPresence,
        reconnect,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}
