'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  X,
  Plus,
  Users,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']
type GroupInsert = Database['public']['Tables']['whatsapp_groups']['Insert']
type GroupUpdate = Database['public']['Tables']['whatsapp_groups']['Update']

interface GroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  onSubmit: (data: Partial<GroupInsert> | Partial<GroupUpdate>) => Promise<void>
  loading?: boolean
  error?: string | null
}

interface FormData {
  name: string
  description: string
  participants: string[]
  whatsapp_id: string
}

export function GroupForm({
  open,
  onOpenChange,
  group,
  onSubmit,
  loading = false,
  error = null,
}: GroupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    participants: [],
    whatsapp_id: '',
  })
  const [newParticipant, setNewParticipant] = useState('')
  const [participantError, setParticipantError] = useState<string | null>(null)

  // Reset form when dialog opens/closes or group changes
  useEffect(() => {
    if (open) {
      if (group) {
        setFormData({
          name: group.name || '',
          description: group.description || '',
          participants: group.participants || [],
          whatsapp_id: group.whatsapp_id || '',
        })
      } else {
        setFormData({
          name: '',
          description: '',
          participants: [],
          whatsapp_id: '',
        })
      }
      setNewParticipant('')
      setParticipantError(null)
    }
  }, [open, group])

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '')
    // Check if it's a valid Brazilian phone number (10-11 digits)
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

  const handleAddParticipant = () => {
    if (!newParticipant.trim()) {
      setParticipantError('Telefone é obrigatório')
      return
    }

    const formattedPhone = formatPhoneNumber(newParticipant)

    if (!validatePhoneNumber(newParticipant)) {
      setParticipantError('Telefone inválido. Use o formato: (11) 99999-9999')
      return
    }

    if (formData.participants.includes(formattedPhone)) {
      setParticipantError('Participante já está na lista')
      return
    }

    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, formattedPhone],
    }))
    setNewParticipant('')
    setParticipantError(null)
  }

  const handleRemoveParticipant = (participant: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p !== participant),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      participants: formData.participants,
      whatsapp_id: formData.whatsapp_id.trim() || undefined,
    }

    try {
      await onSubmit(submitData)
      onOpenChange(false)
    } catch (err) {
      console.error('Erro ao salvar grupo:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddParticipant()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Editar Grupo' : 'Criar Novo Grupo'}
          </DialogTitle>
          <DialogDescription>
            {group
              ? 'Atualize as informações do grupo WhatsApp'
              : 'Crie um novo grupo para gerenciar conversas no WhatsApp'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Grupo de Trabalho"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descrição opcional do grupo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_id">ID do WhatsApp (opcional)</Label>
              <Input
                id="whatsapp_id"
                value={formData.whatsapp_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    whatsapp_id: e.target.value,
                  }))
                }
                placeholder="Ex: 120363123456789012@g.us"
              />
              <p className="text-xs text-muted-foreground">
                ID único do grupo no WhatsApp (será preenchido automaticamente
                na sincronização)
              </p>
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <Label className="text-base font-semibold">Participantes</Label>
              <Badge variant="secondary">{formData.participants.length}</Badge>
            </div>

            {/* Adicionar participante */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={newParticipant}
                  onChange={(e) => {
                    setNewParticipant(e.target.value)
                    setParticipantError(null)
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite o telefone (11) 99999-9999"
                  className={participantError ? 'border-destructive' : ''}
                />
                {participantError && (
                  <p className="text-xs text-destructive mt-1">
                    {participantError}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={handleAddParticipant}
                disabled={!newParticipant.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de participantes */}
            {formData.participants.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Participantes Adicionados
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {formData.participants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-mono text-sm">
                            {participant}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.participants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum participante adicionado</p>
                <p className="text-xs">Adicione telefones para criar o grupo</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {group ? 'Atualizar' : 'Criar'} Grupo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
