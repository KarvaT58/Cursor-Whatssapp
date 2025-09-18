'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMessageReactions, MessageReaction } from '@/hooks/use-message-reactions'
import { ReactionPicker } from './reaction-picker'

interface MessageReactionsProps {
  groupId: string
  messageId: string
  className?: string
}

export function MessageReactions({ groupId, messageId, className }: MessageReactionsProps) {
  const { addReaction, removeReaction, getReactions, isLoading, error } = useMessageReactions()
  const [reactions, setReactions] = useState<MessageReaction[]>([])
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [isLoadingReactions, setIsLoadingReactions] = useState(false)

  // Carregar reações iniciais
  useEffect(() => {
    loadReactions()
  }, [groupId, messageId])

  const loadReactions = async () => {
    try {
      setIsLoadingReactions(true)
      const result = await getReactions(groupId, messageId)
      setReactions(result.reactions || [])
      setUserReaction(result.user_reaction)
    } catch (err) {
      console.error('Erro ao carregar reações:', err)
    } finally {
      setIsLoadingReactions(false)
    }
  }

  const handleReactionSelect = async (emoji: string) => {
    try {
      if (userReaction === emoji) {
        // Remover reação se for a mesma
        await removeReaction(groupId, messageId)
        setUserReaction(null)
        // Atualizar contadores
        setReactions(prev => 
          prev.map(reaction => 
            reaction.emoji === emoji 
              ? { ...reaction, count: Math.max(0, reaction.count - 1), userReacted: false }
              : reaction
          ).filter(reaction => reaction.count > 0)
        )
      } else {
        // Adicionar/alterar reação
        await addReaction(groupId, messageId, emoji)
        
        // Atualizar estado local
        setReactions(prev => {
          const newReactions = [...prev]
          
          // Remover reação anterior se existir
          if (userReaction) {
            const prevReactionIndex = newReactions.findIndex(r => r.emoji === userReaction)
            if (prevReactionIndex !== -1) {
              newReactions[prevReactionIndex] = {
                ...newReactions[prevReactionIndex],
                count: Math.max(0, newReactions[prevReactionIndex].count - 1),
                userReacted: false
              }
            }
          }
          
          // Adicionar/atualizar nova reação
          const existingReactionIndex = newReactions.findIndex(r => r.emoji === emoji)
          if (existingReactionIndex !== -1) {
            newReactions[existingReactionIndex] = {
              ...newReactions[existingReactionIndex],
              count: newReactions[existingReactionIndex].count + 1,
              userReacted: true
            }
          } else {
            newReactions.push({
              emoji,
              count: 1,
              users: [],
              userReacted: true
            })
          }
          
          // Filtrar reações com count > 0
          return newReactions.filter(reaction => reaction.count > 0)
        })
        
        setUserReaction(emoji)
      }
    } catch (err) {
      console.error('Erro ao processar reação:', err)
    }
  }

  const handleReactionClick = async (emoji: string) => {
    await handleReactionSelect(emoji)
  }

  if (isLoadingReactions) {
    return (
      <div className={className}>
        <div className="flex gap-1">
          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (reactions.length === 0 && !userReaction) {
    return (
      <div className={className}>
        <ReactionPicker
          onReactionSelect={handleReactionSelect}
          currentReaction={userReaction}
          disabled={isLoading}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1 flex-wrap">
        {/* Exibir reações existentes */}
        {reactions.map((reaction) => (
          <Button
            key={reaction.emoji}
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 py-0 text-xs hover:bg-muted",
              reaction.userReacted && "bg-primary/10 border border-primary/20"
            )}
            onClick={() => handleReactionClick(reaction.emoji)}
            disabled={isLoading}
          >
            <span className="mr-1">{reaction.emoji}</span>
            <span className="text-muted-foreground">{reaction.count}</span>
          </Button>
        ))}
        
        {/* Botão para adicionar nova reação */}
        <ReactionPicker
          onReactionSelect={handleReactionSelect}
          currentReaction={userReaction}
          disabled={isLoading}
          className="h-6 w-6"
        />
      </div>
      
      {/* Exibir erro se houver */}
      {error && (
        <div className="text-xs text-destructive mt-1">
          {error}
        </div>
      )}
    </div>
  )
}

// Função auxiliar para cn (className utility)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
