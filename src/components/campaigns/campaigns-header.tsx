'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Megaphone, Filter } from 'lucide-react'

interface CampaignsHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onAddCampaign: () => void
  totalCampaigns: number
  filteredCount: number
}

export function CampaignsHeader({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddCampaign,
  totalCampaigns,
  filteredCount,
}: CampaignsHeaderProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="size-5" />
            <h1 className="text-xl font-semibold">Campanhas</h1>
            <span className="text-sm text-muted-foreground">
              {filteredCount === totalCampaigns
                ? `${totalCampaigns} campanhas`
                : `${filteredCount} de ${totalCampaigns} campanhas`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar campanhas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-8"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="running">Em Execução</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onAddCampaign} className="flex items-center gap-2">
            <Plus className="size-4" />
            Nova Campanha
          </Button>
        </div>
      </div>
    </div>
  )
}
