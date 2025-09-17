'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Save,
  Trash2,
  Copy,
  Edit,
  MessageSquare,
  Star,
  Clock,
  User,
  Building,
  Phone,
} from 'lucide-react'

interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  category: 'marketing' | 'support' | 'notification' | 'other'
  isFavorite: boolean
  createdAt: string
  usageCount: number
}

interface MessageTemplateProps {
  templates?: MessageTemplate[]
  onSave?: (
    template: Omit<MessageTemplate, 'id' | 'createdAt' | 'usageCount'>
  ) => void
  onEdit?: (template: MessageTemplate) => void
  onDelete?: (templateId: string) => void
  onSelect?: (template: MessageTemplate) => void
  selectedTemplate?: MessageTemplate
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Boas-vindas',
    content:
      'Olá {{nome}}! Seja bem-vindo(a) à {{empresa}}. Estamos felizes em tê-lo(a) conosco!',
    variables: ['nome', 'empresa'],
    category: 'notification',
    isFavorite: true,
    createdAt: '2024-01-15',
    usageCount: 45,
  },
  {
    id: '2',
    name: 'Promoção Black Friday',
    content:
      'Oi {{nome}}! 🔥 BLACK FRIDAY chegou! Aproveite 50% OFF em todos os produtos até {{data}}. Use o cupom: BLACKFRIDAY50',
    variables: ['nome', 'data'],
    category: 'marketing',
    isFavorite: false,
    createdAt: '2024-01-10',
    usageCount: 123,
  },
  {
    id: '3',
    name: 'Lembrete de Pagamento',
    content:
      'Olá {{nome}}, este é um lembrete amigável de que sua fatura no valor de R$ {{valor}} vence em {{dias}} dias. Para mais detalhes, entre em contato conosco.',
    variables: ['nome', 'valor', 'dias'],
    category: 'notification',
    isFavorite: false,
    createdAt: '2024-01-08',
    usageCount: 67,
  },
]

const variableOptions = [
  { key: 'nome', label: 'Nome do Cliente', icon: User },
  { key: 'empresa', label: 'Nome da Empresa', icon: Building },
  { key: 'telefone', label: 'Telefone', icon: Phone },
  { key: 'data', label: 'Data', icon: Clock },
  { key: 'valor', label: 'Valor', icon: Clock },
  { key: 'dias', label: 'Dias', icon: Clock },
]

export function MessageTemplate({
  templates = defaultTemplates,
  onSave,
  onEdit,
  onDelete,
  onSelect,
  selectedTemplate,
}: MessageTemplateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'other' as MessageTemplate['category'],
    isFavorite: false,
  })

  const handleOpenDialog = (template?: MessageTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        content: template.content,
        category: template.category,
        isFavorite: template.isFavorite,
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        content: '',
        category: 'other',
        isFavorite: false,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const variables = extractVariables(formData.content)

    if (editingTemplate && onEdit) {
      onEdit({
        ...editingTemplate,
        ...formData,
        variables,
      })
    } else if (onSave) {
      onSave({
        ...formData,
        variables,
      })
    }

    setIsDialogOpen(false)
  }

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g)
    if (!matches) return []

    return [...new Set(matches.map((match) => match.replace(/[{}]/g, '')))]
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      'template-content'
    ) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newText = before + `{{${variable}}}` + after

    setFormData((prev) => ({ ...prev, content: newText }))

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + variable.length + 4,
        start + variable.length + 4
      )
    }, 0)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'marketing':
        return 'bg-purple-100 text-purple-800'
      case 'support':
        return 'bg-blue-100 text-blue-800'
      case 'notification':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'marketing':
        return 'Marketing'
      case 'support':
        return 'Suporte'
      case 'notification':
        return 'Notificação'
      default:
        return 'Outros'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Templates de Mensagem</h3>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie templates reutilizáveis para suas campanhas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>
                Crie um template reutilizável com variáveis dinâmicas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  placeholder="Ex: Boas-vindas, Promoção, Lembrete..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-content">Conteúdo da Mensagem</Label>
                <Textarea
                  id="template-content"
                  placeholder="Digite sua mensagem aqui... Use {{variavel}} para campos dinâmicos"
                  className="min-h-32"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />
                <div className="text-sm text-muted-foreground">
                  Use {`{{variavel}}`} para inserir campos dinâmicos
                </div>
              </div>

              <div className="space-y-2">
                <Label>Variáveis Disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {variableOptions.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.key)}
                      className="text-xs"
                    >
                      <variable.icon className="w-3 h-3 mr-1" />
                      {variable.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-category">Categoria</Label>
                  <select
                    id="template-category"
                    className="w-full p-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as MessageTemplate['category'],
                      }))
                    }
                  >
                    <option value="marketing">Marketing</option>
                    <option value="support">Suporte</option>
                    <option value="notification">Notificação</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFavorite}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFavorite: e.target.checked,
                        }))
                      }
                    />
                    <Star className="w-4 h-4" />
                    Marcar como favorito
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name.trim() || !formData.content.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-colors ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect?.(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {template.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {template?.name || 'Template'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(template.category)}>
                      {getCategoryLabel(template.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {template.usageCount} usos
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDialog(template)
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(template.content)
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(template.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {template.content}
              </p>

              {template.variables.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Variáveis:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="text-xs"
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seu primeiro template de mensagem para agilizar suas
              campanhas
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
