'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, UserPlus, UserMinus, Phone, Search } from 'lucide-react'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface GroupParticipantsProps {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddParticipant?: (phone: string) => void
  onRemoveParticipant?: (phone: string) => void
}

export function GroupParticipants({
  group,
  open,
  onOpenChange,
  onAddParticipant,
  onRemoveParticipant,
}: GroupParticipantsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [newParticipant, setNewParticipant] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 11) {
      return `+55${cleanPhone}`
    } else if (cleanPhone.length === 10) {
      return `+55${cleanPhone}`
    }
    return phone
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  const handleAddParticipant = () => {
    if (!newParticipant.trim()) return

    const formattedPhone = formatPhoneNumber(newParticipant)

    if (!validatePhoneNumber(newParticipant)) {
      return
    }

    onAddParticipant?.(formattedPhone)
    setNewParticipant('')
    setShowAddForm(false)
  }

  const handleRemoveParticipant = (phone: string) => {
    onRemoveParticipant?.(phone)
  }

  const filteredParticipants =
    group.participants?.filter((participant) =>
      participant.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const getParticipantInitials = (phone: string) => {
    // Extract last 4 digits for initials
    const digits = phone.replace(/\D/g, '').slice(-4)
    return digits.slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participantes do Grupo
          </DialogTitle>
          <DialogDescription>
            Gerencie os participantes do grupo &quot;{group.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Add */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar participantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {/* Add Participant Form */}
          {showAddForm && (
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div>
                <Label htmlFor="newParticipant">Número do Telefone</Label>
                <Input
                  id="newParticipant"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddParticipant} size="sm">
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewParticipant('')
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>
                    {searchTerm
                      ? 'Nenhum participante encontrado'
                      : 'Nenhum participante no grupo'}
                  </p>
                </div>
              ) : (
                filteredParticipants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getParticipantInitials(participant)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-mono text-sm">{participant}</div>
                        <div className="text-xs text-muted-foreground">
                          Participante
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          window.open(`https://wa.me/${participant}`, '_blank')
                        }
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveParticipant(participant)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {group.participants?.length || 0} participantes
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredParticipants.length} de {group.participants?.length || 0}{' '}
              mostrados
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
