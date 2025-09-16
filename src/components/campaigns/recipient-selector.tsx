'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Users,
  Filter,
  UserCheck,
  UserX,
  Calendar,
  Phone,
  Mail,
  Tag,
  MapPin,
  Download,
  Upload,
} from 'lucide-react'
import { useContacts } from '@/hooks/use-contacts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Contact {
  id: string
  name: string
  phone: string
  email?: string | null
  tags?: string[] | null
  notes?: string | null
  last_interaction?: string | null
  created_at: string
  updated_at?: string | null
  user_id?: string | null
  whatsapp_id?: string | null
}

interface RecipientSelectorProps {
  selectedRecipients: string[]
  onSelectionChange: (recipients: string[]) => void
  onImportContacts?: () => void
  onExportSelection?: (contacts: Contact[]) => void
}

export function RecipientSelector({
  selectedRecipients,
  onSelectionChange,
  onImportContacts,
  onExportSelection,
}: RecipientSelectorProps) {
  const { contacts, isLoading } = useContacts()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'old'>('all')

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!contacts) return []
    const tags = new Set<string>()
    contacts.forEach((contact) => {
      contact.tags?.forEach((tag: string) => tags.add(tag))
    })
    return Array.from(tags)
  }, [contacts])

  // Filter contacts based on search and filters
  const filteredContacts = useMemo(() => {
    if (!contacts) return []

    return contacts.filter((contact) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => contact.tags?.includes(tag))

      // Date filter
      let matchesDate = true
      if (dateFilter !== 'all' && contact.last_interaction) {
        const interactionDate = new Date(contact.last_interaction)
        const daysDiff =
          (Date.now() - interactionDate.getTime()) / (1000 * 60 * 60 * 24)

        if (dateFilter === 'recent') {
          matchesDate = daysDiff <= 30
        } else if (dateFilter === 'old') {
          matchesDate = daysDiff > 30
        }
      }

      return matchesSearch && matchesTags && matchesDate
    })
  }, [contacts, searchTerm, selectedTags, dateFilter])

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: Contact[] } = {}

    filteredContacts.forEach((contact) => {
      const firstLetter = contact.name[0].toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(contact)
    })

    // Sort groups alphabetically
    const sortedGroups: { [key: string]: Contact[] } = {}
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      })

    return sortedGroups
  }, [filteredContacts])

  const handleContactToggle = (contactId: string) => {
    const newSelection = selectedRecipients.includes(contactId)
      ? selectedRecipients.filter((id) => id !== contactId)
      : [...selectedRecipients, contactId]

    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    const allContactIds = filteredContacts.map((contact) => contact.id)
    onSelectionChange(allContactIds)
  }

  const handleDeselectAll = () => {
    onSelectionChange([])
  }

  const handleTagFilter = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]

    setSelectedTags(newTags)
  }

  const selectedContacts = useMemo(() => {
    if (!contacts) return []
    return contacts.filter((contact) => selectedRecipients.includes(contact.id))
  }, [contacts, selectedRecipients])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando contatos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seleção de Destinatários
            <Badge variant="secondary">
              {selectedRecipients.length} selecionados
            </Badge>
          </CardTitle>
          <CardDescription>
            Escolha os contatos que receberão sua campanha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Selecionar Contatos</TabsTrigger>
              <TabsTrigger value="selected">
                Selecionados ({selectedRecipients.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, telefone ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={onImportContacts}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onExportSelection?.(selectedContacts)}
                    disabled={selectedContacts.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filtros:</span>
                  </div>

                  {/* Date Filter */}
                  <select
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(e.target.value as 'all' | 'recent' | 'old')
                    }
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">Todos os períodos</option>
                    <option value="recent">Últimos 30 dias</option>
                    <option value="old">Mais de 30 dias</option>
                  </select>

                  {/* Tag Filters */}
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleTagFilter(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>

                {/* Bulk Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Selecionar Todos ({filteredContacts.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Desmarcar Todos
                  </Button>
                </div>
              </div>

              {/* Contact List */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {Object.keys(groupedContacts).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Nenhum contato encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou importar novos contatos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {Object.entries(groupedContacts).map(
                      ([letter, contacts]) => (
                        <div key={letter}>
                          <div className="sticky top-0 bg-background border-b pb-2 mb-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              {letter}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {contacts.map((contact) => (
                              <div
                                key={contact.id}
                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                              >
                                <Checkbox
                                  checked={selectedRecipients.includes(
                                    contact.id
                                  )}
                                  onCheckedChange={() =>
                                    handleContactToggle(contact.id)
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">
                                      {contact.name}
                                    </h4>
                                    {contact.tags?.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {contact.phone}
                                    </span>
                                    {contact.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {contact.email}
                                      </span>
                                    )}
                                    {contact.last_interaction && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(
                                          new Date(contact.last_interaction),
                                          'dd/MM/yyyy',
                                          { locale: ptBR }
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              {selectedContacts.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum contato selecionado
                  </h3>
                  <p className="text-muted-foreground">
                    Vá para a aba &quot;Selecionar Contatos&quot; para escolher
                    os destinatários
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {selectedContacts.length} contatos selecionados
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => onExportSelection?.(selectedContacts)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Lista
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">
                            {contact.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {contact.phone}
                          </p>
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {contact.tags.map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleContactToggle(contact.id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
