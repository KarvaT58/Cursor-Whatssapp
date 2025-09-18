'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useContacts } from '@/hooks/use-contacts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, User, Phone, Mail, Tag, X } from 'lucide-react'
import { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']

interface ContactSearchProps {
  selectedContacts: Contact[]
  onSelectionChange: (contacts: Contact[]) => void
  maxSelections?: number
}

export function ContactSearch({ 
  selectedContacts, 
  onSelectionChange, 
  maxSelections 
}: ContactSearchProps) {
  const { contacts, isLoading } = useContacts()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)

  // Filtrar contatos baseado na busca
  const filteredContacts = useMemo(() => {
    if (!contacts) return []

    const term = searchTerm.toLowerCase().trim()
    if (!term) return showAll ? contacts : contacts.slice(0, 10)

    return contacts.filter(contact => {
      const name = contact.name.toLowerCase()
      const phone = contact.phone.toLowerCase()
      const email = contact.email?.toLowerCase() || ''
      const tags = contact.tags.join(' ').toLowerCase()

      return (
        name.includes(term) ||
        phone.includes(term) ||
        email.includes(term) ||
        tags.includes(term)
      )
    })
  }, [contacts, searchTerm, showAll])

  // Verificar se um contato está selecionado
  const isSelected = useCallback((contact: Contact) => {
    return selectedContacts.some(selected => selected.id === contact.id)
  }, [selectedContacts])

  // Alternar seleção de contato
  const toggleContact = useCallback((contact: Contact) => {
    if (isSelected(contact)) {
      // Remover contato
      onSelectionChange(selectedContacts.filter(c => c.id !== contact.id))
    } else {
      // Adicionar contato (verificar limite)
      if (maxSelections && selectedContacts.length >= maxSelections) {
        return
      }
      onSelectionChange([...selectedContacts, contact])
    }
  }, [selectedContacts, onSelectionChange, maxSelections, isSelected])

  // Formatar telefone para exibição
  const formatPhone = useCallback((phone: string) => {
    // Remover caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Formatar como (XX) XXXXX-XXXX para números brasileiros
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    return phone
  }, [])

  // Obter iniciais do nome
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6">
        <div className="text-center text-muted-foreground">
          Carregando contatos...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, telefone, email ou etiqueta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contatos selecionados */}
      {selectedContacts.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Contatos selecionados ({selectedContacts.length})
            {maxSelections && ` / ${maxSelections}`}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedContacts.map(contact => (
              <Badge key={contact.id} variant="secondary" className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {getInitials(contact.name)}
                  </span>
                </div>
                <span className="text-xs">{contact.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => toggleContact(contact)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lista de contatos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato disponível'}
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div 
              key={contact.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 border rounded-lg p-4 ${
                isSelected(contact) ? 'ring-2 ring-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => toggleContact(contact)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected(contact)}
                  onChange={() => toggleContact(contact)}
                  disabled={!isSelected(contact) && maxSelections && selectedContacts.length >= maxSelections}
                  className="h-4 w-4"
                />
                
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {getInitials(contact.name)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{contact.name}</h4>
                    {isSelected(contact) && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Selecionado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{formatPhone(contact.phone)}</span>
                    </div>
                    
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>
                  
                  {contact.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">
                        {contact.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs border border-border px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="text-xs border border-border px-2 py-1 rounded">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão para mostrar mais */}
      {!searchTerm && contacts && contacts.length > 10 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Mostrar menos' : `Mostrar todos (${contacts.length})`}
          </Button>
        </div>
      )}
    </div>
  )
}
