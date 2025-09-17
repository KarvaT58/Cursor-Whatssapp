'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/types/database'
import {
  Search,
  Users,
  MessageCircle,
  Phone,
  Mail,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Edit,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Contact = Database['public']['Tables']['contacts']['Row']

interface ContactSelectorProps {
  contacts: Contact[]
  loading: boolean
  selectedContact: Contact | null
  selectedGroup: string | null
  onContactSelect: (contact: Contact) => void
  onGroupSelect: (groupId: string) => void
}

export function ContactSelector({
  contacts,
  loading,
  selectedContact,
  selectedGroup,
  onContactSelect,
  onGroupSelect,
}: ContactSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups'>('contacts')

  // Filtrar contatos baseado na busca
  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        (contact.email &&
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [contacts, searchTerm])

  // Agrupar contatos por inicial
  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: Contact[] } = {}

    filteredContacts.forEach((contact) => {
      const initial = contact?.name?.charAt(0).toUpperCase() || '?'
      if (!groups[initial]) {
        groups[initial] = []
      }
      groups[initial].push(contact)
    })

    return Object.keys(groups)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = groups[key]
          return result
        },
        {} as { [key: string]: Contact[] }
      )
  }, [filteredContacts])

  const formatLastInteraction = (dateString: string | null) => {
    if (!dateString) return 'Nunca'

    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`

    return date.toLocaleDateString('pt-BR')
  }

  const handleContactAction = (action: string, contact: Contact) => {
    switch (action) {
      case 'star':
        // TODO: Implementar favoritar contato
        console.log('Star contact:', contact.id)
        break
      case 'archive':
        // TODO: Implementar arquivar contato
        console.log('Archive contact:', contact.id)
        break
      case 'edit':
        // TODO: Implementar editar contato
        console.log('Edit contact:', contact.id)
        break
      case 'delete':
        // TODO: Implementar excluir contato
        console.log('Delete contact:', contact.id)
        break
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversas</h2>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('contacts')}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Contatos
          </Button>
          <Button
            variant={activeTab === 'groups' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('groups')}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Grupos
          </Button>
        </div>
      </div>

      {/* Lista de contatos */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'contacts' ? (
          <div className="p-2">
            {Object.keys(groupedContacts).length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Nenhum contato encontrado'
                    : 'Nenhum contato ainda'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Adicione contatos para começar a conversar
                  </p>
                )}
              </div>
            ) : (
              Object.entries(groupedContacts).map(([initial, contacts]) => (
                <div key={initial} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                    {initial}
                  </div>
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => onContactSelect(contact)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={
                            contact.whatsapp_id
                              ? `https://api.whatsapp.com/img/${contact.whatsapp_id}`
                              : undefined
                          }
                        />
                        <AvatarFallback>
                          {contact?.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {contact?.name || 'Contato'}
                          </h3>
                          <span
                            className={`text-xs ${
                              selectedContact?.id === contact.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatLastInteraction(contact.last_interaction)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs truncate">
                              {contact.phone}
                            </span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs truncate">
                                {contact.email}
                              </span>
                            </div>
                          )}
                        </div>

                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contact.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleContactAction('star', contact)}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Favoritar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleContactAction('edit', contact)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleContactAction('archive', contact)
                            }
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Arquivar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleContactAction('delete', contact)
                            }
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Grupos - TODO: Implementar quando tiver grupos */
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Grupos em breve</p>
            <p className="text-sm text-muted-foreground mt-1">
              Funcionalidade de grupos será implementada em breve
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
