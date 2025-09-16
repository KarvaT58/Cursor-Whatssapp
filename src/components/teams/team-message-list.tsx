'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { TeamMessageWithUser } from '@/types/teams'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TeamMessageListProps {
  messages: TeamMessageWithUser[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onEditMessage: (messageId: string, newContent: string) => void
  onDeleteMessage: (messageId: string) => void
  onReplyToMessage: (messageId: string) => void
  isOnline: (userId: string) => boolean
  className?: string
}

export function TeamMessageList({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage,
  isOnline,
  className,
}: TeamMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const handleEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditContent(currentContent)
  }

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      onEditMessage(editingMessageId, editContent.trim())
      setEditingMessageId(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <ScrollArea ref={scrollAreaRef} className={cn('h-full', className)}>
      <div className="p-4 space-y-4">
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Carregar mais mensagens'}
            </Button>
          </div>
        )}

        {/* Messages List */}
        {messages.map((message) => (
          <TeamMessageItem
            key={message.id}
            message={message}
            isOnline={isOnline(message.sender.id)}
            isEditing={editingMessageId === message.id}
            editContent={editContent}
            onEdit={handleEdit}
            onDelete={onDeleteMessage}
            onReply={onReplyToMessage}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditContentChange={setEditContent}
            onKeyPress={handleKeyPress}
          />
        ))}

        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-muted-foreground">
              Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// Message Item Component
interface TeamMessageItemProps {
  message: TeamMessageWithUser
  isOnline: boolean
  isEditing: boolean
  editContent: string
  onEdit: (messageId: string, currentContent: string) => void
  onDelete: (messageId: string) => void
  onReply: (messageId: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditContentChange: (content: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

function TeamMessageItem({
  message,
  isOnline,
  isEditing,
  editContent,
  onEdit,
  onDelete,
  onReply,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
  onKeyPress,
}: TeamMessageItemProps) {
  const [showActions, setShowActions] = useState(false)

  const handleEdit = () => {
    onEdit(message.id, message.content)
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      onDelete(message.id)
    }
  }

  const handleReply = () => {
    onReply(message.id)
  }

  return (
    <div
      className="group hover:bg-muted/50 p-3 rounded-lg transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{message.sender.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                onKeyDown={onKeyPress}
                className="w-full p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSaveEdit}>
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Reply to message */}
          {message.replyTo && (
            <div className="mt-2 p-2 bg-muted/50 rounded border-l-2 border-primary/50">
              <div className="text-xs text-muted-foreground mb-1">
                Respondendo para {message.replyTo.sender.name}
              </div>
              <div className="text-sm truncate">{message.replyTo.content}</div>
            </div>
          )}

          {/* Message Actions */}
          {showActions && !isEditing && (
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="h-6 px-2 text-xs"
              >
                Responder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-6 px-2 text-xs"
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
