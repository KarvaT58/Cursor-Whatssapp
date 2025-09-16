'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Download,
  Image as ImageIcon,
  FileText,
  Mic,
  Play,
  Pause,
  MoreVertical,
  Reply,
  Forward,
  Copy,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Message = Database['public']['Tables']['whatsapp_messages']['Row']
type Contact = Database['public']['Tables']['contacts']['Row']

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  contact?: Contact | null
  showAvatar?: boolean
}

export function MessageBubble({
  message,
  isOwn,
  contact,
  showAvatar = false,
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ptBR })
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      case 'audio':
        return <Mic className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
  }

  const handleDownloadMedia = () => {
    // TODO: Implementar download de mídia
    console.log('Download media:', message.content)
  }

  const handleReply = () => {
    // TODO: Implementar resposta
    console.log('Reply to message:', message.id)
  }

  const handleForward = () => {
    // TODO: Implementar encaminhamento
    console.log('Forward message:', message.id)
  }

  const handleDelete = () => {
    // TODO: Implementar exclusão
    console.log('Delete message:', message.id)
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative group">
              <img
                src={message.content}
                alt="Imagem"
                className="max-w-xs rounded-lg cursor-pointer"
                onClick={() => setShowFullImage(true)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadMedia}
                  className="text-white hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        )

      case 'document':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Documento</p>
                <p className="text-xs text-muted-foreground">
                  {message.content}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDownloadMedia}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1">
                <p className="text-sm font-medium">Áudio</p>
                <p className="text-xs text-muted-foreground">
                  {message.content || 'Mensagem de áudio'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDownloadMedia}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )
    }
  }

  return (
    <>
      <div
        className={`flex gap-3 max-w-[70%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage
              src={
                contact?.whatsapp_id
                  ? `https://api.whatsapp.com/img/${contact.whatsapp_id}`
                  : undefined
              }
            />
            <AvatarFallback>
              {contact?.name?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Mensagem */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className="relative group">
            <Card
              className={`${
                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  {renderMessageContent()}

                  {/* Timestamp e tipo */}
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isOwn
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {getMessageTypeIcon(message.type || 'text')}
                    <span>{formatTime(message.created_at || '')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReply}>
                  <Reply className="w-4 h-4 mr-2" />
                  Responder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleForward}>
                  <Forward className="w-4 h-4 mr-2" />
                  Encaminhar
                </DropdownMenuItem>
                {(message.type === 'image' ||
                  message.type === 'document' ||
                  message.type === 'audio') && (
                  <DropdownMenuItem onClick={handleDownloadMedia}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modal para imagem em tela cheia */}
      {showFullImage && message.type === 'image' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={message.content}
              alt="Imagem em tela cheia"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:text-white"
              onClick={() => setShowFullImage(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
