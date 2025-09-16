'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/database'
import {
  Phone,
  Video,
  MoreVertical,
  Search,
  Info,
  Archive,
  VolumeX,
  Star,
  Trash2,
  Edit,
  Users,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Contact = Database['public']['Tables']['contacts']['Row']

interface ChatHeaderProps {
  contact?: Contact | null
  groupId?: string | null
  isOnline?: boolean
}

export function ChatHeader({
  contact,
  groupId,
  isOnline = false,
}: ChatHeaderProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isStarred, setIsStarred] = useState(false)

  const handleCall = () => {
    if (contact?.phone) {
      window.open(`tel:${contact.phone}`, '_self')
    }
  }

  const handleVideoCall = () => {
    // TODO: Implementar chamada de vídeo
    console.log('Video call to:', contact?.phone)
  }

  const handleSearch = () => {
    // TODO: Implementar busca na conversa
    console.log('Search in conversation')
  }

  const handleInfo = () => {
    // TODO: Implementar informações do contato/grupo
    console.log('Show info for:', contact?.id || groupId)
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
    // TODO: Implementar mutar conversa
  }

  const handleStar = () => {
    setIsStarred(!isStarred)
    // TODO: Implementar favoritar conversa
  }

  const handleArchive = () => {
    // TODO: Implementar arquivar conversa
    console.log('Archive conversation')
  }

  const handleDelete = () => {
    // TODO: Implementar excluir conversa
    console.log('Delete conversation')
  }

  const handleEdit = () => {
    // TODO: Implementar editar contato
    console.log('Edit contact:', contact?.id)
  }

  const getStatusText = () => {
    if (groupId) {
      return 'Grupo do WhatsApp'
    }

    if (contact) {
      if (isOnline) {
        return 'Online'
      }
      if (contact.last_interaction) {
        const lastSeen = new Date(contact.last_interaction)
        const now = new Date()
        const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)

        if (diffInMinutes < 1) {
          return 'Visto agora'
        } else if (diffInMinutes < 60) {
          return `Visto há ${Math.floor(diffInMinutes)} min`
        } else if (diffInMinutes < 1440) {
          return `Visto há ${Math.floor(diffInMinutes / 60)}h`
        } else {
          return `Visto há ${Math.floor(diffInMinutes / 1440)}d`
        }
      }
      return 'Última vez visto há muito tempo'
    }

    return ''
  }

  const getStatusColor = () => {
    if (groupId) return 'bg-blue-500'
    if (isOnline) return 'bg-green-500'
    return 'bg-gray-400'
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={
                groupId
                  ? undefined // TODO: Implementar avatar de grupo
                  : contact?.whatsapp_id
                    ? `https://api.whatsapp.com/img/${contact.whatsapp_id}`
                    : undefined
              }
            />
            <AvatarFallback>
              {groupId ? (
                <Users className="w-5 h-5" />
              ) : (
                contact?.name?.charAt(0).toUpperCase() || '?'
              )}
            </AvatarFallback>
          </Avatar>

          {/* Status indicator */}
          {!groupId && (
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor()}`}
            />
          )}
        </div>

        {/* Info do contato/grupo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">
              {groupId ? 'Grupo do WhatsApp' : contact?.name || 'Contato'}
            </h3>
            {isStarred && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            {isMuted && <VolumeX className="w-4 h-4 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleSearch}>
          <Search className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          disabled={!contact?.phone}
        >
          <Phone className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleVideoCall}
          disabled={!contact?.phone}
        >
          <Video className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleInfo}>
              <Info className="w-4 h-4 mr-2" />
              Informações
            </DropdownMenuItem>

            {!groupId && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar contato
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={handleStar}>
              <Star className="w-4 h-4 mr-2" />
              {isStarred ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleMute}>
              <VolumeX className="w-4 h-4 mr-2" />
              {isMuted ? 'Ativar notificações' : 'Silenciar'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Arquivar conversa
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir conversa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
