'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, Zap, Key, Hash, User } from 'lucide-react'

type ZApiInstance = Database['public']['Tables']['z_api_instances']['Row']

interface ZApiInstanceFormProps {
  instance?: ZApiInstance | null
  onClose: () => void
  onSuccess: () => void
}

export function ZApiInstanceForm({
  instance,
  onClose,
  onSuccess,
}: ZApiInstanceFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    instance_id: '',
    instance_token: '',
    client_token: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createZApiInstance, updateZApiInstance } = useSettings()

  const isEditing = !!instance

  useEffect(() => {
    if (instance) {
      setFormData({
        name: instance.name,
        instance_id: instance.instance_id,
        instance_token: instance.instance_token,
        client_token: instance.client_token,
      })
    }
  }, [instance])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome da instância é obrigatório')
      return false
    }
    if (!formData.instance_id.trim()) {
      setError('Instance ID é obrigatório')
      return false
    }
    if (!formData.instance_token.trim()) {
      setError('Instance Token é obrigatório')
      return false
    }
    if (!formData.client_token.trim()) {
      setError('Client Token é obrigatório')
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
      if (isEditing && instance) {
        await updateZApiInstance(instance.id, {
          name: formData.name.trim(),
          instance_id: formData.instance_id.trim(),
          instance_token: formData.instance_token.trim(),
          client_token: formData.client_token.trim(),
        })
      } else {
        await createZApiInstance({
          name: formData.name.trim(),
          instance_id: formData.instance_id.trim(),
          instance_token: formData.instance_token.trim(),
          client_token: formData.client_token.trim(),
        })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar instância')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-4" />
              {isEditing ? 'Editar Instância Z-API' : 'Nova Instância Z-API'}
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

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Instância *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: WhatsApp Business Principal"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instance_id">Instance ID *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="instance_id"
                  value={formData.instance_id}
                  onChange={(e) =>
                    handleInputChange('instance_id', e.target.value)
                  }
                  placeholder="Ex: 3C8A2B1D4E5F6G7H"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ID único da sua instância no Z-API
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instance_token">Instance Token *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="instance_token"
                  type="password"
                  value={formData.instance_token}
                  onChange={(e) =>
                    handleInputChange('instance_token', e.target.value)
                  }
                  placeholder="Token de autenticação da instância"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Token de autenticação fornecido pelo Z-API
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_token">Client Token *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="client_token"
                  type="password"
                  value={formData.client_token}
                  onChange={(e) =>
                    handleInputChange('client_token', e.target.value)
                  }
                  placeholder="Token do cliente Z-API"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Token do cliente fornecido pelo Z-API
              </p>
            </div>

            <div className="bg-muted/50 rounded-md p-4">
              <h4 className="font-medium text-sm mb-2">
                Como obter essas informações:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Acesse o painel do Z-API</li>
                <li>2. Crie uma nova instância ou selecione uma existente</li>
                <li>3. Copie o Instance ID e os tokens fornecidos</li>
                <li>4. Cole as informações nos campos acima</li>
              </ol>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="size-4 mr-2" />
                {loading
                  ? 'Salvando...'
                  : isEditing
                    ? 'Atualizar'
                    : 'Criar Instância'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
