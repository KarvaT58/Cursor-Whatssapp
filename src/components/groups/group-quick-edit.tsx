'use client'

import { useState, useCallback } from 'react'
import { Edit3, Save, X, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGroupUpdates } from '@/hooks/use-group-updates'

interface GroupQuickEditProps {
  group: {
    id: string
    name: string
    description?: string | null
    image_url?: string | null
  }
  onGroupUpdated?: (updatedGroup: any) => void
  onClose?: () => void
}

export function GroupQuickEdit({ group, onGroupUpdated, onClose }: GroupQuickEditProps) {
  const { updateGroupName, updateGroupDescription, updateGroupImageUrl, updateGroupImageFile, isLoading, error, clearError } = useGroupUpdates()
  
  // Estados locais
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(group.name)
  const [editedDescription, setEditedDescription] = useState(group.description || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(group.image_url || null)

  // Iniciar edição
  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
    setEditedName(group.name)
    setEditedDescription(group.description || '')
    setImagePreview(group.image_url || null)
    setImageFile(null)
    clearError()
  }, [group, clearError])

  // Cancelar edição
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditedName(group.name)
    setEditedDescription(group.description || '')
    setImagePreview(group.image_url || null)
    setImageFile(null)
    clearError()
  }, [group, clearError])

  // Salvar alterações
  const handleSave = useCallback(async () => {
    try {
      let updatedGroup = { ...group }

      // Atualizar nome se mudou
      if (editedName !== group.name) {
        updatedGroup = await updateGroupName({
          groupId: group.id,
          name: editedName,
        })
      }

      // Atualizar descrição se mudou
      if (editedDescription !== (group.description || '')) {
        updatedGroup = await updateGroupDescription({
          groupId: group.id,
          description: editedDescription || undefined,
        })
      }

      // Atualizar imagem se mudou
      if (imageFile) {
        updatedGroup = await updateGroupImageFile({
          groupId: group.id,
          file: imageFile,
        })
      }

      setIsEditing(false)
      onGroupUpdated?.(updatedGroup)
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
    }
  }, [group, editedName, editedDescription, imageFile, updateGroupName, updateGroupDescription, updateGroupImageFile, onGroupUpdated])

  // Remover imagem
  const handleRemoveImage = useCallback(async () => {
    try {
      const updatedGroup = await updateGroupImageUrl({
        groupId: group.id,
        remove_image: true,
      })
      setImagePreview(null)
      onGroupUpdated?.(updatedGroup)
    } catch (err) {
      console.error('Erro ao remover imagem:', err)
    }
  }, [group.id, updateGroupImageUrl, onGroupUpdated])

  // Lidar com seleção de arquivo
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edição Rápida</CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Imagem do grupo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagem do Grupo</label>
          <div className="flex items-center gap-3">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                {isEditing && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            
            {isEditing && (
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="group-image-upload"
                />
                <label htmlFor="group-image-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {imageFile ? 'Alterar' : 'Adicionar'}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Nome do grupo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do Grupo</label>
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Nome do grupo"
              maxLength={255}
            />
          ) : (
            <div className="p-2 bg-muted rounded-md">
              <span className="font-medium">{group.name}</span>
            </div>
          )}
        </div>

        {/* Descrição do grupo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          {isEditing ? (
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Descrição do grupo (opcional)"
              maxLength={500}
              rows={3}
            />
          ) : (
            <div className="p-2 bg-muted rounded-md min-h-[60px]">
              {group.description ? (
                <span className="text-sm">{group.description}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Sem descrição</span>
              )}
            </div>
          )}
        </div>

        {/* Informações do grupo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Informações</label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">ID: {group.id.slice(0, 8)}...</Badge>
            <Badge variant="outline">Grupo WhatsApp</Badge>
          </div>
        </div>

        {/* Contador de caracteres para descrição */}
        {isEditing && (
          <div className="text-xs text-muted-foreground text-right">
            {editedDescription.length}/500 caracteres
          </div>
        )}
      </CardContent>
    </Card>
  )
}
