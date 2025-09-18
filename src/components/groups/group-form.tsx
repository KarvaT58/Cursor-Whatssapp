'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Switch } from '@/components/ui/switch'
// Removido imports não utilizados
import {
  Users,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactSearch } from '@/components/contacts/contact-search'
import { ImageUpload } from '@/components/ui/image-upload'
import { GroupManagement } from '@/components/groups/GroupManagement'
import { Separator } from '@/components/ui/separator'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']
type GroupInsert = Database['public']['Tables']['whatsapp_groups']['Insert']
type GroupUpdate = Database['public']['Tables']['whatsapp_groups']['Update']

interface GroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  onSubmit: (data: (Partial<GroupInsert> | Partial<GroupUpdate>) & { settings?: GroupSettings }) => Promise<{
    success: boolean
    data?: Group | null
    message?: string
    warning?: string
    whatsapp_id?: string
    error?: string
  }>
  loading?: boolean
  error?: string | null
}

interface FormData {
  name: string
  description: string
  participants: string[]
  whatsapp_id: string
  image_url: string | null
  // Configurações do grupo
  adminOnlyMessage: boolean
  adminOnlySettings: boolean
  requireAdminApproval: boolean
  adminOnlyAddMember: boolean
}

interface GroupSettings {
  adminOnlyMessage: boolean
  adminOnlySettings: boolean
  requireAdminApproval: boolean
  adminOnlyAddMember: boolean
}

type Contact = Database['public']['Tables']['contacts']['Row']

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
    image_url: null,
    // Configurações padrão do grupo
    adminOnlyMessage: false,
    adminOnlySettings: false,
    requireAdminApproval: false,
    adminOnlyAddMember: false,
  })
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  // Reset form when dialog opens/closes or group changes
  useEffect(() => {
    if (open) {
      if (group) {
        setFormData({
          name: group.name || '',
          description: group.description || '',
          participants: group.participants || [],
          whatsapp_id: group.whatsapp_id || '',
          image_url: group.image_url || null,
          // Carregar configurações existentes do grupo
          adminOnlyMessage: group.admin_only_message || false,
          adminOnlySettings: group.admin_only_settings || false,
          requireAdminApproval: group.require_admin_approval || false,
          adminOnlyAddMember: group.admin_only_add_member || false,
        })
      } else {
        setFormData({
          name: '',
          description: '',
          participants: [],
          whatsapp_id: '',
          image_url: null,
          // Configurações padrão do grupo
          adminOnlyMessage: false,
          adminOnlySettings: false,
          requireAdminApproval: false,
          adminOnlyAddMember: false,
        })
      }
      setSelectedContacts([])
      setImageFile(null)
      setSuccessMessage(null)
      setWarningMessage(null)
    }
  }, [open, group])


  // Lidar com mudança de seleção de contatos
  const handleContactSelectionChange = useCallback((contacts: Contact[]) => {
    setSelectedContacts(contacts)
    // Converter contatos para telefones
    const phoneNumbers = contacts.map(contact => {
      // Formatar telefone para o formato esperado
      const cleanPhone = contact.phone.replace(/\D/g, '')
      if (cleanPhone.length === 11) {
        return `+55${cleanPhone}`
      } else if (cleanPhone.length === 10) {
        return `+55${cleanPhone}`
      }
      return contact.phone
    })
    
    setFormData((prev) => ({
      ...prev,
      participants: phoneNumbers,
    }))
  }, [])

  // Lidar com mudança de imagem
  const handleImageChange = useCallback((file: File | null, previewUrl: string | null) => {
    setImageFile(file)
    setFormData((prev) => ({
      ...prev,
      image_url: previewUrl,
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    // Se estivermos editando um grupo existente, passar apenas os campos que mudaram
    let submitData: Partial<GroupInsert> | Partial<GroupUpdate> = {}
    
    if (group) {
      // Para edição, incluir apenas campos que mudaram
      if (formData.name.trim() !== group.name) {
        submitData.name = formData.name.trim()
      }
      if (formData.description.trim() !== (group.description || '')) {
        submitData.description = formData.description.trim() || undefined
      }
      if (JSON.stringify(formData.participants) !== JSON.stringify(group.participants || [])) {
        submitData.participants = formData.participants
      }
      if (formData.whatsapp_id.trim() !== (group.whatsapp_id || '')) {
        submitData.whatsapp_id = formData.whatsapp_id.trim() || undefined
      }
      if (formData.image_url !== (group.image_url || '')) {
        submitData.image_url = formData.image_url || undefined
      }
    } else {
      // Para criação, incluir todos os campos
      submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        participants: formData.participants || [],
        whatsapp_id: formData.whatsapp_id.trim() || '',
        image_url: formData.image_url || null,
      }
    }

    try {
      console.log('📝 GroupForm: Dados sendo enviados:', submitData)
      console.log('📝 GroupForm: Configurações do formulário:', {
        adminOnlyMessage: formData.adminOnlyMessage,
        adminOnlySettings: formData.adminOnlySettings,
        requireAdminApproval: formData.requireAdminApproval,
        adminOnlyAddMember: formData.adminOnlyAddMember,
      })
      
      // Incluir configurações diretamente nos dados do grupo
      const finalData = {
        ...submitData,
        admin_only_message: formData.adminOnlyMessage,
        admin_only_settings: formData.adminOnlySettings,
        require_admin_approval: formData.requireAdminApproval,
        admin_only_add_member: formData.adminOnlyAddMember,
      }
      
      console.log('📝 GroupForm: Dados finais sendo enviados:', finalData)
      console.log('📝 GroupForm: Tipos dos dados finais:', {
        name: typeof finalData.name,
        description: typeof finalData.description,
        participants: Array.isArray(finalData.participants) ? 'array' : typeof finalData.participants,
        whatsapp_id: typeof finalData.whatsapp_id,
        image_url: typeof finalData.image_url,
        admin_only_message: typeof finalData.admin_only_message,
        admin_only_settings: typeof finalData.admin_only_settings,
        require_admin_approval: typeof finalData.require_admin_approval,
        admin_only_add_member: typeof finalData.admin_only_add_member,
      })
      
      const result = await onSubmit(finalData)
      
      if (result.success) {
        // Se há uma imagem para fazer upload e o grupo foi criado com sucesso
        if (imageFile && result.data?.id) {
          try {
            const formData = new FormData()
            formData.append('image', imageFile)
            
            const uploadResponse = await fetch(`/api/groups/${result.data.id}/image`, {
              method: 'PATCH',
              body: formData,
            })
            
            if (!uploadResponse.ok) {
              console.warn('Grupo criado, mas falha ao fazer upload da imagem')
            }
          } catch (uploadError) {
            console.warn('Grupo criado, mas falha ao fazer upload da imagem:', uploadError)
          }
        }
        
        setSuccessMessage(result.message || 'Grupo criado com sucesso!')
        if (result.warning) {
          setWarningMessage(result.warning)
        }
        
        // Fechar o modal após um pequeno delay para mostrar a mensagem
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
      } else {
        console.error('Erro ao salvar grupo:', result.error)
      }
    } catch (err) {
      console.error('Erro ao salvar grupo:', err)
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

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {warningMessage && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {warningMessage}
              </AlertDescription>
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

          {/* Foto do Grupo */}
          <ImageUpload
            value={formData.image_url}
            onChange={handleImageChange}
            disabled={loading}
            maxSize={5 * 1024 * 1024} // 5MB
            acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
          />

          {/* Configurações do Grupo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <Label className="text-base font-semibold">Configurações do Grupo</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure as permissões e comportamentos do grupo no WhatsApp
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adminOnlyMessage">Somente admins podem enviar mensagens</Label>
                  <p className="text-xs text-muted-foreground">
                    Apenas administradores poderão enviar mensagens no grupo
                  </p>
                </div>
                <Switch
                  id="adminOnlyMessage"
                  checked={formData.adminOnlyMessage}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, adminOnlyMessage: checked }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adminOnlySettings">Somente admins podem alterar configurações</Label>
                  <p className="text-xs text-muted-foreground">
                    Apenas administradores poderão modificar as configurações do grupo
                  </p>
                </div>
                <Switch
                  id="adminOnlySettings"
                  checked={formData.adminOnlySettings}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, adminOnlySettings: checked }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireAdminApproval">Aprovação de admin para entrar</Label>
                  <p className="text-xs text-muted-foreground">
                    Novos membros precisam ser aprovados por um administrador
                  </p>
                </div>
                <Switch
                  id="requireAdminApproval"
                  checked={formData.requireAdminApproval}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, requireAdminApproval: checked }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adminOnlyAddMember">Somente admins podem adicionar membros</Label>
                  <p className="text-xs text-muted-foreground">
                    Apenas administradores poderão adicionar novos participantes
                  </p>
                </div>
                <Switch
                  id="adminOnlyAddMember"
                  checked={formData.adminOnlyAddMember}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, adminOnlyAddMember: checked }))
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Participantes - apenas para criação de grupo */}
          {!group && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <Label className="text-base font-semibold">Participantes</Label>
              <Badge variant="secondary">{selectedContacts.length}</Badge>
            </div>

            <ContactSearch
              selectedContacts={selectedContacts}
              onSelectionChange={handleContactSelectionChange}
              maxSelections={256} // Limite do WhatsApp
            />
          </div>
          )}

          {/* Gerenciamento de Grupo - apenas para edição */}
          {group && group.whatsapp_id && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <Label className="text-base font-semibold">Gerenciamento do Grupo</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gerencie participantes, administradores e links de convite do grupo no WhatsApp
                </p>
                
                <GroupManagement
                  groupId={group.whatsapp_id}
                  groupName={group.name}
                  participants={group.participants?.map(phone => ({
                    phone,
                    isAdmin: false,
                    isSuperAdmin: false
                  })) || []}
                  onUpdate={() => {
                    // Recarregar dados do grupo se necessário
                    console.log('Grupo atualizado, recarregando dados...')
                  }}
                />
              </div>
            </>
          )}

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
