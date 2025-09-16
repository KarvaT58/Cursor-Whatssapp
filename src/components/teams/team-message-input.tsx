'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, Smile, Image, File, X } from 'lucide-react'
import { SendMessageData } from '@/types/teams'
import { cn } from '@/lib/utils'

interface TeamMessageInputProps {
  onSendMessage: (data: SendMessageData) => Promise<void>
  onTyping?: () => void
  replyToMessage?: {
    id: string
    content: string
    senderName: string
  } | null
  onCancelReply?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TeamMessageInput({
  onSendMessage,
  onTyping,
  replyToMessage,
  onCancelReply,
  placeholder = 'Digite sua mensagem...',
  disabled = false,
  className,
}: TeamMessageInputProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() && attachments.length === 0) return

    try {
      const messageData: SendMessageData = {
        content: message.trim(),
        messageType: attachments.length > 0 ? 'file' : 'text',
        channel: 'general',
        replyToId: replyToMessage?.id,
        metadata: {
          attachments: attachments.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        },
      }

      await onSendMessage(messageData)
      setMessage('')
      setAttachments([])
      setIsExpanded(false)

      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [message, attachments, replyToMessage, onSendMessage])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (value: string) => {
    setMessage(value)
    if (onTyping) {
      onTyping()
    }

    // Auto-expand textarea if message is long
    if (value.length > 50 && !isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEmojiClick = () => {
    // TODO: Implement emoji picker
    console.log('Emoji picker clicked')
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Reply to message */}
      {replyToMessage && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded border-l-2 border-primary/50">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">
              Respondendo para {replyToMessage.senderName}
            </div>
            <div className="text-sm truncate">{replyToMessage.content}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted rounded-md"
            >
              <div className="flex items-center gap-1">
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
                <span className="text-sm truncate max-w-32">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAttachment(index)}
                className="h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          {isExpanded ? (
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-32 resize-none"
              rows={1}
            />
          ) : (
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="h-10"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmojiClick}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageClick}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Image className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && attachments.length === 0) || disabled}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
    </div>
  )
}
