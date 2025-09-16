'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, MessageSquare, RefreshCw } from 'lucide-react'

interface GroupsHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddGroup: () => void
  totalGroups: number
  filteredCount: number
}

export function GroupsHeader({
  searchTerm,
  onSearchChange,
  onAddGroup,
  totalGroups,
  filteredCount,
}: GroupsHeaderProps) {
  const handleSyncGroups = () => {
    // TODO: Implementar sincronização com WhatsApp
    console.log('Sincronizando grupos com WhatsApp...')
  }

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            <h1 className="text-xl font-semibold">Grupos WhatsApp</h1>
            <span className="text-sm text-muted-foreground">
              {filteredCount === totalGroups
                ? `${totalGroups} grupos`
                : `${filteredCount} de ${totalGroups} grupos`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-8"
            />
          </div>
          <Button
            onClick={handleSyncGroups}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Sincronizar
          </Button>
          <Button onClick={onAddGroup} className="flex items-center gap-2">
            <Plus className="size-4" />
            Adicionar Grupo
          </Button>
        </div>
      </div>
    </div>
  )
}
