'use client'

import { useState, useRef } from 'react'
import { Plus, Upload, X, Users, MessageSquare, Settings, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useCommunities } from '@/hooks/use-communities'

interface CommunityFormProps {
  community?: {
    id: string
    name: string
    description: string
    image_url: string | null
    announcement_group_id: string | null
    max_groups: number
    is_public: boolean
    created_at: string
  }
  onSuccess?: (community: any) => void
  onCancel?: () => void
  className?: string
}

export function CommunityForm({ community, onSuccess, onCancel, className }: CommunityFormProps) {
  const { createCommunity, updateCommunity, isLoading, error, clearError } = useCommunities()
  const { toast } = useToast()

  // Estados locais
  const [formData, setFormData] = useState({
    name: community?.name || '',
    description: community?.description || '',
    max_groups: community?.max_groups || 50,
    is_public: community?.is_public || false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(community?.image_url || null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validar formulário
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome da comunidade é obrigatório'
    } else if (formData.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres'
    } else if (formData.name.length > 100) {
      errors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Descrição deve ter no máximo 500 caracteres'
    }

    if (formData.max_groups < 1 || formData.max_groups > 100) {
      errors.max_groups = 'Máximo de grupos deve estar entre 1 e 100'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manipular mudanças no formulário
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Manipular seleção de imagem
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Erro',
          description: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.',
          variant: 'destructive',
        })
        return
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          title: 'Erro',
          description: 'Arquivo muito grande. Máximo 5MB.',
          variant: 'destructive',
        })
        return
      }

      setImageFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remover imagem
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      let result
      
      if (community) {
        // Atualizar comunidade existente
        result = await updateCommunity(community.id, {
          name: formData.name,
          description: formData.description,
          max_groups: formData.max_groups,
          is_public: formData.is_public,
          image_file: imageFile,
        })
      } else {
        // Criar nova comunidade
        result = await createCommunity({
          name: formData.name,
          description: formData.description,
          max_groups: formData.max_groups,
          is_public: formData.is_public,
          image_file: imageFile,
        })
      }

      toast({
        title: community ? 'Comunidade atualizada!' : 'Comunidade criada!',
        description: result.message,
      })

      onSuccess?.(result.community)
    } catch (err) {
      console.error('Erro ao salvar comunidade:', err)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {community ? 'Editar Comunidade' : 'Criar Nova Comunidade'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {community 
            ? 'Atualize as informações da sua comunidade'
            : 'Crie uma nova comunidade para organizar seus grupos'
          }
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
                  Limpar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Nome da comunidade */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Comunidade *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome da comunidade..."
              className={validationErrors.name ? 'border-red-500' : ''}
              maxLength={100}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500">{validationErrors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o propósito da comunidade..."
              className={validationErrors.description ? 'border-red-500' : ''}
              rows={3}
              maxLength={500}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Imagem da comunidade */}
          <div className="space-y-2">
            <Label>Imagem da Comunidade</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF ou WebP. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Configurações</span>
            </div>

            {/* Máximo de grupos */}
            <div className="space-y-2">
              <Label htmlFor="max_groups">Máximo de Grupos</Label>
              <Input
                id="max_groups"
                type="number"
                value={formData.max_groups}
                onChange={(e) => handleInputChange('max_groups', parseInt(e.target.value) || 1)}
                min={1}
                max={100}
                className={validationErrors.max_groups ? 'border-red-500' : ''}
              />
              {validationErrors.max_groups && (
                <p className="text-sm text-red-500">{validationErrors.max_groups}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Número máximo de grupos que podem ser adicionados à comunidade
              </p>
            </div>

            {/* Visibilidade */}
            <div className="space-y-2">
              <Label>Visibilidade</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_public" className="text-sm">
                  Comunidade pública
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Comunidades públicas podem ser descobertas por outros usuários
              </p>
            </div>
          </div>

          {/* Informações da comunidade existente */}
          {community && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Informações da Comunidade</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Criada em:</span>
                  <p>{new Date(community.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-mono text-xs">{community.id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {community ? 'Atualizar' : 'Criar'} Comunidade
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
