'use client'

import { useState, useEffect } from 'react'
import { useRealtimeGroups } from '@/hooks/use-realtime-groups'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, ArrowLeft, MessageSquare, Info } from 'lucide-react'

interface GroupFormProps {
  groupId?: string | null
  onClose: () => void
  onSuccess: () => void
}

export function GroupForm({ groupId, onClose, onSuccess }: GroupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_id: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { groups, addGroup, updateGroup } = useRealtimeGroups()

  const isEditing = !!groupId
  const currentGroup = isEditing ? groups.find((g) => g.id === groupId) : null

  useEffect(() => {
    if (currentGroup) {
      setFormData({
        name: currentGroup.name,
        whatsapp_id: currentGroup.whatsapp_id,
        description: currentGroup.description || '',
      })
    }
  }, [currentGroup])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome do grupo é obrigatório')
      return false
    }
    if (!formData.whatsapp_id.trim()) {
      setError('ID do WhatsApp é obrigatório')
      return false
    }
    // Validar formato do ID do WhatsApp (exemplo: 120363123456789012@g.us)
    if (!formData.whatsapp_id.includes('@g.us')) {
      setError('ID do WhatsApp deve terminar com @g.us')
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
      const groupData = {
        name: formData.name.trim(),
        whatsapp_id: formData.whatsapp_id.trim(),
        description: formData.description.trim() || null,
      }

      if (isEditing && groupId) {
        await updateGroup(groupId, groupData)
      } else {
        await addGroup(groupData)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar grupo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <MessageSquare className="size-4" />
              {isEditing ? 'Editar Grupo' : 'Novo Grupo'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <div className="flex items-start gap-2">
                <Info className="size-4 mt-0.5" />
                <div>
                  <p className="font-medium">Como obter o ID do grupo:</p>
                  <ol className="mt-1 list-decimal list-inside space-y-1">
                    <li>Abra o WhatsApp Web</li>
                    <li>Vá para o grupo desejado</li>
                    <li>Clique no nome do grupo</li>
                    <li>Copie o ID que termina com @g.us</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do grupo no WhatsApp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_id">ID do WhatsApp *</Label>
              <Input
                id="whatsapp_id"
                value={formData.whatsapp_id}
                onChange={(e) =>
                  handleInputChange('whatsapp_id', e.target.value)
                }
                placeholder="120363123456789012@g.us"
                required
              />
              <p className="text-xs text-muted-foreground">
                O ID do grupo deve terminar com @g.us
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Descrição opcional do grupo"
                rows={3}
              />
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
