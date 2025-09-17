'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users, RefreshCw } from 'lucide-react'

interface ContactsHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddContact: () => void
  onSyncContacts?: () => void
  totalContacts: number
  filteredCount: number
  importComponent?: React.ReactNode
  syncing?: boolean
  canSync?: boolean
}

export function ContactsHeader({
  searchTerm,
  onSearchChange,
  onAddContact,
  onSyncContacts,
  totalContacts,
  filteredCount,
  importComponent,
  syncing = false,
  canSync = true,
}: ContactsHeaderProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <h1 className="text-xl font-semibold">Contatos</h1>
            <span className="text-sm text-muted-foreground">
              {filteredCount === totalContacts
                ? `${totalContacts} contatos`
                : `${filteredCount} de ${totalContacts} contatos`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-8"
            />
          </div>
          {onSyncContacts && (
            <Button
              onClick={onSyncContacts}
              variant="outline"
              disabled={syncing || !canSync}
              className="flex items-center gap-2"
              title={
                !canSync ? 'Configure uma instância Z-API primeiro' : undefined
              }
            >
              <RefreshCw
                className={`size-4 ${syncing ? 'animate-spin' : ''}`}
              />
              {syncing ? 'Sincronizando...' : 'Sincronizar WhatsApp'}
            </Button>
          )}
          <Button onClick={onAddContact} className="flex items-center gap-2">
            <Plus className="size-4" />
            Adicionar Contato
          </Button>
          {importComponent}
        </div>
      </div>
    </div>
  )
}
