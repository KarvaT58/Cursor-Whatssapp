'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeContextType {
  isConnected: boolean
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
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [channels, setChannels] = useState<RealtimeChannel[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Verificar conexão inicial
    const checkConnection = async () => {
      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .select('id')
          .limit(1)

        if (!error) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Erro ao verificar conexão Realtime:', error)
        setIsConnected(false)
      }
    }

    checkConnection()

    // Configurar listener para mudanças de conexão
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsConnected(true)
      } else if (event === 'SIGNED_OUT') {
        setIsConnected(false)
        // Desconectar todos os canais
        channels.forEach((channel) => channel.unsubscribe())
        setChannels([])
      }
    })

    return () => {
      subscription.unsubscribe()
      // Limpar todos os canais ao desmontar
      channels.forEach((channel) => channel.unsubscribe())
    }
  }, [supabase, channels])

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

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        subscribe,
        unsubscribe,
        subscribeToTeamMessages,
        subscribeToTeamPresence,
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
