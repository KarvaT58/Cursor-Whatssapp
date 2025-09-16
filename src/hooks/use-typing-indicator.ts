'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TypingUser {
  id: string
  name: string
  timestamp: number
}

interface UseTypingIndicatorProps {
  contactId?: string
  groupId?: string
  currentUserId?: string
}

export function useTypingIndicator({
  contactId,
  groupId,
  currentUserId,
}: UseTypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const supabase = createClient()

  // Limpar usuários que pararam de digitar (mais de 3 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTypingUsers((prev) =>
        prev.filter((user) => now - user.timestamp < 3000)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Escutar eventos de digitação via Supabase Realtime
  useEffect(() => {
    if (!contactId && !groupId) return

    const channel = supabase
      .channel(`typing_${contactId || groupId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, userName, isTyping: userIsTyping } = payload.payload

        if (userId === currentUserId) return // Ignorar próprio usuário

        if (userIsTyping) {
          setTypingUsers((prev) => {
            const existing = prev.find((u) => u.id === userId)
            if (existing) {
              return prev.map((u) =>
                u.id === userId ? { ...u, timestamp: Date.now() } : u
              )
            }
            return [
              ...prev,
              { id: userId, name: userName, timestamp: Date.now() },
            ]
          })
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.id !== userId))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contactId, groupId, currentUserId, supabase])

  // Função para indicar que está digitando
  const startTyping = useCallback(
    async (userName: string) => {
      if (!contactId && !groupId) return

      setIsTyping(true)

      const channel = supabase.channel(`typing_${contactId || groupId}`)
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          userName,
          isTyping: true,
        },
      })
    },
    [contactId, groupId, currentUserId, supabase]
  )

  // Função para parar de indicar digitação
  const stopTyping = useCallback(async () => {
    if (!contactId && !groupId) return

    setIsTyping(false)

    const channel = supabase.channel(`typing_${contactId || groupId}`)
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        userName: '',
        isTyping: false,
      },
    })
  }, [contactId, groupId, currentUserId, supabase])

  // Função para obter texto do indicador de digitação
  const getTypingText = () => {
    if (typingUsers.length === 0) return null

    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} está digitando...`
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0].name} e ${typingUsers[1].name} estão digitando...`
    }

    return `${typingUsers.length} pessoas estão digitando...`
  }

  return {
    typingUsers,
    isTyping,
    typingText: getTypingText(),
    startTyping,
    stopTyping,
  }
}
