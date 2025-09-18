'use client'

import { useState, useEffect } from 'react'
import { Settings, Shield, Users, MessageSquare, Bell, Lock, Globe, Save, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGroupUpdates } from '@/hooks/use-group-updates'

interface AdminSettingsProps {
  group: {
    id: string
    name: string
    description: string
    image_url: string | null
    is_public: boolean
    max_participants: number
    created_at: string
  }
  isAdmin: boolean
  className?: string
}

export function AdminSettings({ group, isAdmin, className }: AdminSettingsProps) {
  const { updateGroupName, updateGroupDescription, updateGroupImage, isLoading, error, clearError } = useGroupUpdates()
  const { toast } = useToast()

  // Estados locais
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    is_public: group.is_public,
    max_participants: group.max_participants,
    approval_required: false,
    only_admins_can_message: false,
    only_admins_can_edit_info: false,
    allow_member_invites: true,
    allow_member_leave: true,
    allow_member_join: true,
    auto_delete_messages: false,
    auto_delete_days: 7,
    welcome_message: '',
    goodbye_message: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(group.image_url)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Detectar mudanças
  useEffect(() => {
    const hasFormChanges = 
      formData.name !== group.name ||
      formData.description !== (group.description || '') ||
      formData.is_public !== group.is_public ||
      formData.max_participants !== group.max_participants ||
      imageFile !== null

    setHasChanges(hasFormChanges)
  }, [formData, imageFile, group])

  // Validar formulário
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome do grupo é obrigatório'
    } else if (formData.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres'
    } else if (formData.name.length > 100) {
      errors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Descrição deve ter no máximo 500 caracteres'
    }

    if (formData.max_participants < 2 || formData.max_participants > 1024) {
      errors.max_participants = 'Máximo de participantes deve estar entre 2 e 1024'
    }

    if (formData.auto_delete_messages && (formData.auto_delete_days < 1 || formData.auto_delete_days > 365)) {
      errors.auto_delete_days = 'Dias para auto-deleção deve estar entre 1 e 365'
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
        return
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
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
  }

  // Salvar configurações
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Atualizar nome se mudou
      if (formData.name !== group.name) {
        await updateGroupName(group.id, formData.name)
      }

      // Atualizar descrição se mudou
      if (formData.description !== (group.description || '')) {
        await updateGroupDescription(group.id, formData.description)
      }

      // Atualizar imagem se mudou
      if (imageFile) {
        await updateGroupImage(group.id, imageFile)
      }

      // Configurações salvas com sucesso

      setHasChanges(false)
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
    }
  }

  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar as configurações do grupo
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Grupo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações e permissões do grupo
        </p>
      </CardHeader>

      <CardContent>
        {/* Erro */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
                Limpar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Nome do grupo */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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

            {/* Imagem do grupo */}
            <div className="space-y-2">
              <Label>Imagem do Grupo</Label>
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
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="group-image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('group-image')?.click()}
                  >
                    {imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, GIF ou WebP. Máximo 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Visibilidade */}
            <div className="space-y-2">
              <Label>Visibilidade</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public" className="text-sm">
                  Grupo público
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Grupos públicos podem ser descobertos por outros usuários
              </p>
            </div>

            {/* Máximo de participantes */}
            <div className="space-y-2">
              <Label htmlFor="max_participants">Máximo de Participantes</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 2)}
                min={2}
                max={1024}
                className={validationErrors.max_participants ? 'border-red-500' : ''}
              />
              {validationErrors.max_participants && (
                <p className="text-sm text-red-500">{validationErrors.max_participants}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Número máximo de participantes no grupo (2-1024)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            {/* Aprovação necessária */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="approval_required"
                  checked={formData.approval_required}
                  onCheckedChange={(checked) => handleInputChange('approval_required', checked)}
                />
                <Label htmlFor="approval_required" className="text-sm">
                  Aprovação necessária para entrar
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Novos membros precisam ser aprovados por um administrador
              </p>
            </div>

            {/* Apenas admins podem enviar mensagens */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="only_admins_can_message"
                  checked={formData.only_admins_can_message}
                  onCheckedChange={(checked) => handleInputChange('only_admins_can_message', checked)}
                />
                <Label htmlFor="only_admins_can_message" className="text-sm">
                  Apenas administradores podem enviar mensagens
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Restringe o envio de mensagens apenas para administradores
              </p>
            </div>

            {/* Apenas admins podem editar informações */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="only_admins_can_edit_info"
                  checked={formData.only_admins_can_edit_info}
                  onCheckedChange={(checked) => handleInputChange('only_admins_can_edit_info', checked)}
                />
                <Label htmlFor="only_admins_can_edit_info" className="text-sm">
                  Apenas administradores podem editar informações
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Restringe a edição de nome, descrição e imagem apenas para administradores
              </p>
            </div>

            {/* Membros podem convidar */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_member_invites"
                  checked={formData.allow_member_invites}
                  onCheckedChange={(checked) => handleInputChange('allow_member_invites', checked)}
                />
                <Label htmlFor="allow_member_invites" className="text-sm">
                  Membros podem convidar outros
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Permite que membros convidem outras pessoas para o grupo
              </p>
            </div>

            {/* Membros podem sair */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_member_leave"
                  checked={formData.allow_member_leave}
                  onCheckedChange={(checked) => handleInputChange('allow_member_leave', checked)}
                />
                <Label htmlFor="allow_member_leave" className="text-sm">
                  Membros podem sair do grupo
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Permite que membros saiam do grupo voluntariamente
              </p>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            {/* Auto-deleção de mensagens */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_delete_messages"
                  checked={formData.auto_delete_messages}
                  onCheckedChange={(checked) => handleInputChange('auto_delete_messages', checked)}
                />
                <Label htmlFor="auto_delete_messages" className="text-sm">
                  Auto-deleção de mensagens
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Mensagens são automaticamente deletadas após um período
              </p>
            </div>

            {formData.auto_delete_messages && (
              <div className="space-y-2">
                <Label htmlFor="auto_delete_days">Dias para auto-deleção</Label>
                <Input
                  id="auto_delete_days"
                  type="number"
                  value={formData.auto_delete_days}
                  onChange={(e) => handleInputChange('auto_delete_days', parseInt(e.target.value) || 7)}
                  min={1}
                  max={365}
                  className={validationErrors.auto_delete_days ? 'border-red-500' : ''}
                />
                {validationErrors.auto_delete_days && (
                  <p className="text-sm text-red-500">{validationErrors.auto_delete_days}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mensagens serão deletadas após este número de dias (1-365)
                </p>
              </div>
            )}

            {/* Mensagem de boas-vindas */}
            <div className="space-y-2">
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                placeholder="Digite uma mensagem de boas-vindas para novos membros..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.welcome_message.length}/500 caracteres
              </p>
            </div>

            {/* Mensagem de despedida */}
            <div className="space-y-2">
              <Label htmlFor="goodbye_message">Mensagem de Despedida</Label>
              <Textarea
                id="goodbye_message"
                value={formData.goodbye_message}
                onChange={(e) => handleInputChange('goodbye_message', e.target.value)}
                placeholder="Digite uma mensagem de despedida para membros que saem..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.goodbye_message.length}/500 caracteres
              </p>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                As funcionalidades de automação serão implementadas em versões futuras.
                Por enquanto, apenas as configurações básicas estão disponíveis.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Funcionalidades avançadas de automação serão adicionadas em breve
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botão de salvar */}
        {hasChanges && (
          <div className="flex justify-end pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
