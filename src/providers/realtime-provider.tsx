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
    callback: (payload: Record<string, unknown>) => void
  ) => RealtimeChannel
  unsubscribe: (channel: RealtimeChannel) => void
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
    callback: (payload: Record<string, unknown>) => void
  ) => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
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

  const unsubscribe = (channel: RealtimeChannel) => {
    channel.unsubscribe()
    setChannels((prev) => prev.filter((c) => c !== channel))
  }

  return (
    <RealtimeContext.Provider value={{ isConnected, subscribe, unsubscribe }}>
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
