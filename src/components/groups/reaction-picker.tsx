'use client'

import { useState } from 'react'
import { Smile, ThumbsUp, Heart, Laugh, Angry, Sad, Surprised } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ReactionPickerProps {
  onReactionSelect: (emoji: string) => void
  currentReaction?: string | null
  disabled?: boolean
  className?: string
}

// Emojis mais comuns para reações
const COMMON_EMOJIS = [
  { emoji: '👍', label: 'Curtir', icon: ThumbsUp },
  { emoji: '❤️', label: 'Amar', icon: Heart },
  { emoji: '😂', label: 'Rir', icon: Laugh },
  { emoji: '😮', label: 'Surpreso', icon: Surprised },
  { emoji: '😢', label: 'Triste', icon: Sad },
  { emoji: '😡', label: 'Bravo', icon: Angry },
  { emoji: '👏', label: 'Aplaudir' },
  { emoji: '🔥', label: 'Fogo' },
  { emoji: '💯', label: '100' },
  { emoji: '✨', label: 'Brilhante' },
  { emoji: '🎉', label: 'Celebrar' },
  { emoji: '🚀', label: 'Foguete' },
  { emoji: '😍', label: 'Apaixonado' },
  { emoji: '🤔', label: 'Pensativo' },
  { emoji: '😴', label: 'Sonolento' },
  { emoji: '🤯', label: 'Explodindo' },
  { emoji: '💪', label: 'Forte' },
  { emoji: '🙏', label: 'Orando' },
  { emoji: '👀', label: 'Observando' },
  { emoji: '🤝', label: 'Aperto de mão' },
]

export function ReactionPicker({ 
  onReactionSelect, 
  currentReaction, 
  disabled = false,
  className 
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReactionClick = (emoji: string) => {
    onReactionSelect(emoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0 hover:bg-muted",
            currentReaction && "bg-muted",
            className
          )}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Reagir com emoji</h4>
          <div className="grid grid-cols-8 gap-2">
            {COMMON_EMOJIS.map((reaction) => {
              const IconComponent = reaction.icon
              const isSelected = currentReaction === reaction.emoji
              
              return (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0 text-lg hover:bg-muted",
                    isSelected && "bg-primary/10 border border-primary/20"
                  )}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  title={reaction.label}
                >
                  {IconComponent ? (
                    <IconComponent className="h-4 w-4" />
                  ) : (
                    <span>{reaction.emoji}</span>
                  )}
                </Button>
              )
            })}
          </div>
          
          {/* Seção para emojis personalizados */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Ou digite um emoji personalizado:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite um emoji..."
                className="flex-1 px-2 py-1 text-sm border rounded-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const emoji = e.currentTarget.value.trim()
                    if (emoji) {
                      handleReactionClick(emoji)
                      e.currentTarget.value = ''
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
