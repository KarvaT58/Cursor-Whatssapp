'use client'

import { useState, useEffect } from 'react'
import { Users, UserMinus, UserPlus, Search, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Database } from '@/types/database'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface ParticipantManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group | null
  onAddParticipant: (groupId: string, participantPhone: string) => Promise<void>
  onRemoveParticipant: (groupId: string, participantPhone: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function ParticipantManager({ 
  open, 
  onOpenChange, 
  group, 
  onAddParticipant, 
  onRemoveParticipant, 
  loading = false, 
  error = null 
}: ParticipantManagerProps) {
  const { toast } = useToast()

  // Estados locais
  const [participants, setParticipants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [newParticipantPhone, setNewParticipantPhone] = useState('')

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (open && group) {
      loadParticipants()
    }
  }, [open, group])

  // Carregar participantes
  const loadParticipants = async () => {
    try {
      // Usar os participantes do grupo diretamente
      setParticipants(group.participants || [])
    } catch (err) {
      console.error('Erro ao carregar participantes:', err)
    }
  }

  // Filtrar participantes
  const filteredParticipants = participants.filter(participant =>
    typeof participant === 'string' 
      ? participant.includes(searchTerm)
      : participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.phone?.includes(searchTerm) ||
        participant?.pushname?.toLowerCase().includes(searchTerm.toLowerCase())
  )


  // Adicionar participante
  const handleAddParticipant = async () => {
    if (!newParticipantPhone.trim()) {
      return
    }

    try {
      await onAddParticipant(group.id, newParticipantPhone.trim())
      
      // Participante adicionado com sucesso
      
      setNewParticipantPhone('')
      setShowAddParticipant(false)
      await loadParticipants()
    } catch (err) {
      console.error('Erro ao adicionar participante:', err)
    }
  }

  // Remover participante
  const handleRemoveParticipant = async (participantPhone: string) => {
    try {
      await onRemoveParticipant(group.id, participantPhone)
      
      // Participante removido com sucesso
      
      await loadParticipants()
    } catch (err) {
      console.error('Erro ao remover participante:', err)
    }
  }



  // Não renderizar se não houver grupo
  if (!group) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Participantes - {group.name}
          </DialogTitle>
          <DialogDescription>
            Gerencie membros do grupo WhatsApp
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Busca e ações */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar participantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddParticipant(!showAddParticipant)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Formulário para adicionar participante */}
          {showAddParticipant && (
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Digite o número do participante (ex: 5541999999999)"
                      value={newParticipantPhone}
                      onChange={(e) => setNewParticipantPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddParticipant}
                      disabled={loading || !newParticipantPhone.trim()}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddParticipant(false)
                        setNewParticipantPhone('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de participantes */}
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum participante</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Nenhum participante encontrado com os filtros aplicados.'
                  : 'Não há participantes no grupo.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Participantes */}
              {filteredParticipants.map((participant, index) => {
                const participantPhone = typeof participant === 'string' ? participant : participant.phone || participant.id
                const participantName = typeof participant === 'string' ? 'Usuário' : (participant.name || participant.pushname || 'Usuário')
                
                return (
                  <Card key={participantPhone || index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">
                              {participantName}
                            </h4>
                            
                            <Badge className="bg-blue-100 text-blue-800">
                              <Users className="h-3 w-3 mr-1" />
                              Membro
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{participantPhone}</span>
                          </div>
                        </div>
                        
                        {/* Ações do participante */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participantPhone)}
                          className="text-red-600 hover:text-red-700"
                          disabled={loading}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}