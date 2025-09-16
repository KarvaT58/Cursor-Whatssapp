'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  Smile,
  X,
  Upload,
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: 'text' | 'image' | 'document' | 'audio',
    mediaUrl?: string
  ) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showMediaDialog, setShowMediaDialog] = useState(false)
  const [mediaType, setMediaType] = useState<'image' | 'document' | 'audio'>(
    'image'
  )
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    if (!message.trim() && !mediaUrl.trim()) return

    if (mediaUrl.trim()) {
      onSendMessage(message, mediaType, mediaUrl)
    } else {
      onSendMessage(message, 'text')
    }

    setMessage('')
    setMediaUrl('')
    setMediaFile(null)
    setShowMediaDialog(false)
  }, [message, mediaUrl, mediaType, onSendMessage])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMediaFile(file)

    // Simular upload e obter URL
    const reader = new FileReader()
    reader.onload = () => {
      setMediaUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    // TODO: Implementar gravação de áudio
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    // TODO: Finalizar gravação e obter URL do áudio
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  const emojis = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
    '🤪',
    '🤨',
    '🧐',
    '🤓',
    '😎',
    '🤩',
    '🥳',
    '😏',
    '😒',
    '😞',
    '😔',
    '😟',
    '😕',
    '🙁',
    '☹️',
    '😣',
    '😖',
    '😫',
    '😩',
    '🥺',
    '😢',
    '😭',
    '😤',
    '😠',
    '😡',
    '🤬',
    '🤯',
    '😳',
    '🥵',
    '🥶',
    '😱',
    '😨',
    '😰',
    '😥',
    '😓',
    '🤗',
    '🤔',
    '🤭',
    '🤫',
    '🤥',
    '😶',
    '😐',
    '😑',
    '😬',
    '🙄',
    '😯',
    '😦',
    '😧',
    '😮',
    '😲',
    '🥱',
    '😴',
    '🤤',
    '😪',
    '😵',
    '🤐',
    '🥴',
    '🤢',
    '🤮',
    '🤧',
    '😷',
    '🤒',
    '🤕',
    '🤑',
    '🤠',
    '😈',
    '👿',
    '👹',
    '👺',
    '🤡',
    '💩',
    '👻',
    '💀',
    '☠️',
    '👽',
    '👾',
    '🤖',
    '🎃',
    '😺',
    '😸',
    '😹',
    '😻',
    '😼',
    '😽',
    '🙀',
    '😿',
    '😾',
  ]

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        {/* Botão de anexo */}
        <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={disabled}>
              <Paperclip className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Mídia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Mídia</Label>
                <div className="flex gap-2">
                  <Button
                    variant={mediaType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMediaType('image')}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagem
                  </Button>
                  <Button
                    variant={mediaType === 'document' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMediaType('document')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Documento
                  </Button>
                  <Button
                    variant={mediaType === 'audio' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMediaType('audio')}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Áudio
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL da Mídia</Label>
                <Input
                  placeholder="https://exemplo.com/arquivo.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ou selecione um arquivo</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    mediaType === 'image'
                      ? 'image/*'
                      : mediaType === 'document'
                        ? '.pdf,.doc,.docx,.txt'
                        : 'audio/*'
                  }
                  onChange={handleFileSelect}
                />
              </div>

              {mediaFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{mediaFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMediaFile(null)
                      setMediaUrl('')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMediaDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSend} disabled={!mediaUrl.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Input de texto */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-32 resize-none pr-20"
            rows={1}
          />

          {/* Botão de emoji */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-12 top-1/2 -translate-y-1/2"
                disabled={disabled}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Emojis</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                {emojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Botão de gravação ou envio */}
        {isRecording ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStopRecording}
            disabled={disabled}
          >
            <Mic className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !mediaUrl.trim())}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Indicador de gravação */}
      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          Gravando... Clique no microfone para parar
        </div>
      )}
    </div>
  )
}
