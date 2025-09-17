'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Users,
  UserPlus,
  UserMinus,
  Phone,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface ParticipantManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  onAddParticipant: (groupId: string, participantPhone: string) => Promise<void>
  onRemoveParticipant: (
    groupId: string,
    participantPhone: string
  ) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function ParticipantManager({
  open,
  onOpenChange,
  group,
  onAddParticipant,
  onRemoveParticipant,
  error = null,
}: ParticipantManagerProps) {
  const [newParticipant, setNewParticipant] = useState('')
  const [participantError, setParticipantError] = useState<string | null>(null)
  const [removingParticipant, setRemovingParticipant] = useState<string | null>(
    null
  )
  const [actionLoading, setActionLoading] = useState(false)

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 11) {
      return `+55${cleanPhone}`
    } else if (cleanPhone.length === 10) {
      return `+55${cleanPhone}`
    }
    return phone
  }

  const handleAddParticipant = async () => {
    if (!newParticipant.trim()) {
      setParticipantError('Telefone é obrigatório')
      return
    }

    const formattedPhone = formatPhoneNumber(newParticipant)

    if (!validatePhoneNumber(newParticipant)) {
      setParticipantError('Telefone inválido. Use o formato: (11) 99999-9999')
      return
    }

    if (group.participants?.includes(formattedPhone)) {
      setParticipantError('Participante já está no grupo')
      return
    }

    setActionLoading(true)
    try {
      await onAddParticipant(group.id, formattedPhone)
      setNewParticipant('')
      setParticipantError(null)
    } catch (err) {
      console.error('Erro ao adicionar participante:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveParticipant = async (participant: string) => {
    setActionLoading(true)
    try {
      await onRemoveParticipant(group.id, participant)
      setRemovingParticipant(null)
    } catch (err) {
      console.error('Erro ao remover participante:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddParticipant()
    }
  }

  const getParticipantCount = () => {
    return group.participants?.length || 0
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Participantes
            </DialogTitle>
            <DialogDescription>
              Adicione ou remova participantes do grupo &quot;
              {group?.name || 'Grupo'}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Estatísticas do grupo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Estatísticas do Grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{getParticipantCount()}</Badge>
                    <span className="text-sm text-muted-foreground">
                      participantes
                    </span>
                  </div>
                  {group.whatsapp_id && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">
                        Sincronizado com WhatsApp
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Adicionar participante */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newParticipant">Adicionar Participante</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="newParticipant"
                      value={newParticipant}
                      onChange={(e) => {
                        setNewParticipant(e.target.value)
                        setParticipantError(null)
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite o telefone (11) 99999-9999"
                      className={participantError ? 'border-destructive' : ''}
                      disabled={actionLoading}
                    />
                    {participantError && (
                      <p className="text-xs text-destructive mt-1">
                        {participantError}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleAddParticipant}
                    disabled={!newParticipant.trim() || actionLoading}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de participantes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Participantes Atuais
                </Label>
                <Badge variant="outline">{getParticipantCount()}</Badge>
              </div>

              {group.participants && group.participants.length > 0 ? (
                <div className="space-y-2">
                  {group.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-mono text-sm font-medium">
                            {participant}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Participante
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemovingParticipant(participant)}
                        disabled={actionLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum participante no grupo</p>
                  <p className="text-xs">Adicione participantes para começar</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de remoção */}
      <AlertDialog
        open={removingParticipant !== null}
        onOpenChange={() => setRemovingParticipant(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Participante</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o participante &quot;
              {removingParticipant}&quot; do grupo &quot;
              {group?.name || 'Grupo'}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                removingParticipant &&
                handleRemoveParticipant(removingParticipant)
              }
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
