'use client'

import { useState, useEffect } from 'react'
import { useRealtimeCampaigns } from '@/hooks/use-realtime-campaigns'
import { useRealtimeContacts } from '@/hooks/use-realtime-contacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  X,
  Save,
  ArrowLeft,
  Megaphone,
  Users,
  MessageSquare,
} from 'lucide-react'

interface CampaignFormProps {
  campaignId?: string | null
  onClose: () => void
  onSuccess: () => void
}

export function CampaignForm({
  campaignId,
  onClose,
  onSuccess,
}: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    recipients: [] as string[],
    scheduled_at: '',
    status: 'draft' as
      | 'draft'
      | 'scheduled'
      | 'running'
      | 'completed'
      | 'failed',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectAll, setSelectAll] = useState(false)

  // Note: These hooks are for realtime updates only, not for data fetching
  useRealtimeCampaigns()
  useRealtimeContacts()

  const isEditing = !!campaignId
  // Note: currentCampaign would need to be fetched from API or passed as prop
  const currentCampaign = null

  // Note: useEffect for currentCampaign would be needed when editing
  // useEffect(() => {
  //   if (currentCampaign) {
  //     setFormData({
  //       name: currentCampaign.name,
  //       message: currentCampaign.message,
  //       recipients: currentCampaign.recipients || [],
  //       scheduled_at: currentCampaign.scheduled_at
  //         ? new Date(currentCampaign.scheduled_at).toISOString().slice(0, 16)
  //         : '',
  //       status: currentCampaign.status || 'draft',
  //     })
  //   }
  // }, [currentCampaign])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleRecipientToggle = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(contactId)
        ? prev.recipients.filter((id) => id !== contactId)
        : [...prev.recipients, contactId],
    }))
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setFormData((prev) => ({ ...prev, recipients: [] }))
      setSelectAll(false)
    } else {
      setFormData((prev) => ({
        ...prev,
        recipients: [], // Note: Would need contacts data
      }))
      setSelectAll(true)
    }
  }

  // Note: useEffect would need contacts data
  // useEffect(() => {
  //   setSelectAll(
  //     formData.recipients.length === contacts.length && contacts.length > 0
  //   )
  // }, [formData.recipients.length, contacts.length])

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome da campanha é obrigatório')
      return false
    }
    if (!formData.message.trim()) {
      setError('Mensagem é obrigatória')
      return false
    }
    if (formData.recipients.length === 0) {
      setError('Selecione pelo menos um destinatário')
      return false
    }
    if (formData.status === 'scheduled' && !formData.scheduled_at) {
      setError('Data de agendamento é obrigatória para campanhas agendadas')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      const campaignData = {
        name: formData.name.trim(),
        message: formData.message.trim(),
        recipients: formData.recipients,
        scheduled_at: formData.scheduled_at
          ? new Date(formData.scheduled_at).toISOString()
          : null,
        status: formData.status,
      }

      // Note: These functions would need to be implemented or imported
      // if (isEditing && campaignId) {
      //   await updateCampaign(campaignId, campaignData)
      // } else {
      //   await createCampaign(campaignData)
      // }

      // For now, just show success message
      console.log('Campaign data:', campaignData)

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar campanha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <Megaphone className="size-4" />
              {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome da campanha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="running">Em Execução</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Digite a mensagem que será enviada..."
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.message.length} caracteres
              </p>
            </div>

            {formData.status === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Data e Hora de Envio *</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    handleInputChange('scheduled_at', e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="size-4" />
                  Destinatários *
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Selecionar todos
                  </Label>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                {false ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum contato disponível. Adicione contatos primeiro.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {/* Contatos serão carregados aqui quando disponíveis */}
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Carregando contatos...
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="size-4" />
                <span>
                  {formData.recipients.length} destinatário(s) selecionado(s)
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="size-4 mr-2" />
                {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
