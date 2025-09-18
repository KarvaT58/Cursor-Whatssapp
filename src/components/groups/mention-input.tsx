'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AtSign, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Participant {
  id: string
  phone: string
  name?: string
  is_admin: boolean
  is_creator: boolean
}

interface Mention {
  id: string
  phone: string
  name?: string
  type: 'user' | 'group'
  position: number
  length: number
}

interface MentionInputProps {
  value: string
  onChange: (value: string, mentions: Mention[]) => void
  participants: Participant[]
  placeholder?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  allowGroupMention?: boolean
  currentUserIsAdmin?: boolean
}

export function MentionInput({
  value,
  onChange,
  participants,
  placeholder = "Digite uma mensagem...",
  disabled = false,
  className,
  maxLength = 4096,
  allowGroupMention = true,
  currentUserIsAdmin = false
}: MentionInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentions, setMentions] = useState<Mention[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filtrar participantes baseado na busca
  const filteredParticipants = participants.filter(participant => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const name = participant.name?.toLowerCase() || ''
    const phone = participant.phone.toLowerCase()
    
    return name.includes(query) || phone.includes(query)
  })

  // Detectar menção quando o usuário digita @
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    
    setCursorPosition(cursorPos)
    
    // Verificar se há uma menção sendo digitada
    const beforeCursor = newValue.substring(0, cursorPos)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setSearchQuery(mentionMatch[1])
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSearchQuery('')
    }
    
    // Atualizar menções existentes
    updateMentions(newValue)
    onChange(newValue, mentions)
  }

  // Atualizar posições das menções
  const updateMentions = useCallback((text: string) => {
    const mentionRegex = /@(\w+)/g
    const newMentions: Mention[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const participant = participants.find(p => 
        p.name?.toLowerCase() === match[1].toLowerCase() || 
        p.phone === match[1]
      )
      
      if (participant) {
        newMentions.push({
          id: participant.id,
          phone: participant.phone,
          name: participant.name,
          type: 'user',
          position: match.index,
          length: match[0].length
        })
      }
    }

    setMentions(newMentions)
  }, [participants])

  // Selecionar participante para menção
  const handleParticipantSelect = (participant: Participant) => {
    const beforeCursor = value.substring(0, cursorPosition)
    const afterCursor = value.substring(cursorPosition)
    
    // Encontrar a posição do @ mais recente
    const atIndex = beforeCursor.lastIndexOf('@')
    if (atIndex === -1) return
    
    const beforeAt = beforeCursor.substring(0, atIndex)
    const mentionText = `@${participant.name || participant.phone}`
    const newValue = beforeAt + mentionText + afterCursor
    
    // Atualizar posição do cursor
    const newCursorPos = beforeAt.length + mentionText.length
    
    setValue(newValue, newCursorPos)
    setShowSuggestions(false)
    setSearchQuery('')
  }

  // Menção do grupo inteiro (apenas para administradores)
  const handleGroupMention = () => {
    if (!currentUserIsAdmin || !allowGroupMention) return
    
    const beforeCursor = value.substring(0, cursorPosition)
    const afterCursor = value.substring(cursorPosition)
    
    const atIndex = beforeCursor.lastIndexOf('@')
    if (atIndex === -1) return
    
    const beforeAt = beforeCursor.substring(0, atIndex)
    const mentionText = '@grupo'
    const newValue = beforeAt + mentionText + afterCursor
    
    const newCursorPos = beforeAt.length + mentionText.length
    
    setValue(newValue, newCursorPos)
    setShowSuggestions(false)
    setSearchQuery('')
  }

  // Definir valor e posição do cursor
  const setValue = (newValue: string, cursorPos: number) => {
    onChange(newValue, mentions)
    
    // Atualizar posição do cursor após o estado ser atualizado
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(cursorPos, cursorPos)
      }
    }, 0)
  }

  // Remover menção
  const removeMention = (mentionIndex: number) => {
    const mention = mentions[mentionIndex]
    if (!mention) return
    
    const beforeMention = value.substring(0, mention.position)
    const afterMention = value.substring(mention.position + mention.length)
    const newValue = beforeMention + afterMention
    
    // Recalcular posições das menções restantes
    const newMentions = mentions
      .filter((_, index) => index !== mentionIndex)
      .map(m => {
        if (m.position > mention.position) {
          return {
            ...m,
            position: m.position - mention.length
          }
        }
        return m
      })
    
    setMentions(newMentions)
    onChange(newValue, newMentions)
  }

  // Renderizar menções como badges
  const renderMentions = () => {
    if (mentions.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-1 mb-2">
        {mentions.map((mention, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <AtSign className="h-3 w-3" />
            {mention.name || mention.phone}
            {!disabled && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeMention(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        ))}
      </div>
    )
  }

  // Renderizar sugestões
  const renderSuggestions = () => {
    if (!showSuggestions) return null
    
    return (
      <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
        {/* Menção do grupo (apenas para admins) */}
        {currentUserIsAdmin && allowGroupMention && (
          <div
            className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b"
            onClick={handleGroupMention}
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">@grupo</div>
              <div className="text-sm text-muted-foreground">
                Mencionar todos os membros
              </div>
            </div>
          </div>
        )}
        
        {/* Lista de participantes */}
        {filteredParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
            onClick={() => handleParticipantSelect(participant)}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {participant.name?.charAt(0).toUpperCase() || participant.phone.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">
                {participant.name || participant.phone}
              </div>
              <div className="text-sm text-muted-foreground">
                {participant.phone}
                {participant.is_creator && ' • Criador'}
                {participant.is_admin && !participant.is_creator && ' • Admin'}
              </div>
            </div>
          </div>
        ))}
        
        {filteredParticipants.length === 0 && (
          <div className="p-3 text-center text-muted-foreground">
            Nenhum participante encontrado
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Exibir menções como badges */}
      {renderMentions()}
      
      {/* Input com sugestões */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="pr-10"
        />
        
        {/* Ícone @ */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AtSign className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Sugestões */}
        {renderSuggestions()}
      </div>
      
      {/* Contador de caracteres */}
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <div>
          {mentions.length > 0 && (
            <span>{mentions.length} menção{mentions.length !== 1 ? 'ões' : ''}</span>
          )}
        </div>
        <div>
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  )
}
