'use client'

import { Database } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle, Phone } from 'lucide-react'

type Contact = Database['public']['Tables']['contacts']['Row']

interface ContactsListProps {
  contacts: Contact[]
  loading: boolean
  selectedContact: string | null
  onSelectContact: (contactId: string) => void
}

export function ContactsList({
  contacts,
  loading,
  selectedContact,
  onSelectContact,
}: ContactsListProps) {
  const formatLastInteraction = (dateString: string | null) => {
    if (!dateString) return 'Nunca'

    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <MessageCircle className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhum contato encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Adicione contatos para começar a conversar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 space-y-1">
        {contacts.map((contact) => (
          <Card
            key={contact.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedContact === contact.id
                ? 'bg-primary/10 border-primary'
                : ''
            }`}
            onClick={() => onSelectContact(contact.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {getInitials(contact?.name || 'Contato')}
                  </div>
                  {/* Status indicator - você pode implementar lógica de status aqui */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>

                {/* Contact info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {contact.name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatLastInteraction(contact.last_interaction)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.phone}
                    </p>
                    {/* Unread count - você pode implementar lógica de mensagens não lidas */}
                    {Math.random() > 0.7 && (
                      <Badge
                        variant="destructive"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {Math.floor(Math.random() * 5) + 1}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-1 hover:bg-muted rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Implementar chamada
                    }}
                  >
                    <Phone className="size-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
