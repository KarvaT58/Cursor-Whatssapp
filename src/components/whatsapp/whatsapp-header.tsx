'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MessageCircle, Phone, Video, MoreVertical } from 'lucide-react'

interface WhatsAppHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  totalContacts: number
  filteredCount: number
}

export function WhatsAppHeader({
  searchTerm,
  onSearchChange,
  totalContacts,
  filteredCount,
}: WhatsAppHeaderProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-green-600" />
            <h1 className="text-xl font-semibold">WhatsApp Chat</h1>
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

          <Button variant="outline" size="sm">
            <Phone className="size-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Video className="size-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
