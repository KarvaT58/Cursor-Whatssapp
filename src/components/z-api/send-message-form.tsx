'use client'

import { useState } from 'react'
import { useZApi } from '@/hooks/use-z-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  Image,
  FileText,
  Mic,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface SendMessageFormProps {
  instanceId: string
  instanceName: string
  defaultPhone?: string
  onMessageSent?: (result: {
    success: boolean
    message?: string
    error?: string
  }) => void
}

export function SendMessageForm({
  instanceId,
  instanceName,
  defaultPhone = '',
  onMessageSent,
}: SendMessageFormProps) {
  const [formData, setFormData] = useState({
    phone: defaultPhone,
    message: '',
    type: 'text' as 'text' | 'image' | 'document' | 'audio',
    mediaUrl: '',
    fileName: '',
  })
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)

  const { loading, error, sendMessage } = useZApi()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setResult(null)
  }

  const validateForm = () => {
    if (!formData.phone.trim()) {
      setResult({ success: false, message: 'Telefone é obrigatório' })
      return false
    }
    if (!formData.message.trim() && formData.type === 'text') {
      setResult({ success: false, message: 'Mensagem é obrigatória' })
      return false
    }
    if (
      (formData.type === 'image' ||
        formData.type === 'document' ||
        formData.type === 'audio') &&
      !formData.mediaUrl.trim()
    ) {
      setResult({ success: false, message: 'URL da mídia é obrigatória' })
      return false
    }
    if (formData.type === 'document' && !formData.fileName.trim()) {
      setResult({ success: false, message: 'Nome do arquivo é obrigatório' })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const messageData = {
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      type: formData.type,
      ...(formData.mediaUrl && { mediaUrl: formData.mediaUrl.trim() }),
      ...(formData.fileName && { fileName: formData.fileName.trim() }),
    }

    const response = await sendMessage(instanceId, messageData)

    if (response.success) {
      setResult({ success: true, message: 'Mensagem enviada com sucesso!' })
      setFormData((prev) => ({
        ...prev,
        message: '',
        mediaUrl: '',
        fileName: '',
      }))
      onMessageSent?.({
        success: true,
        message: 'Mensagem enviada com sucesso!',
      })
    } else {
      setResult({
        success: false,
        message: response.error || 'Erro ao enviar mensagem',
      })
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="size-4" />
      case 'document':
        return <FileText className="size-4" />
      case 'audio':
        return <Mic className="size-4" />
      default:
        return <Send className="size-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="size-5" />
          Enviar Mensagem - {instanceName}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+5511999999999"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Mensagem</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Send className="size-4" />
                      Texto
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="size-4" />
                      Imagem
                    </div>
                  </SelectItem>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4" />
                      Documento
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Mic className="size-4" />
                      Áudio
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                required
              />
            </div>
          )}

          {(formData.type === 'image' ||
            formData.type === 'document' ||
            formData.type === 'audio') && (
            <div className="space-y-2">
              <Label htmlFor="mediaUrl">URL da Mídia</Label>
              <Input
                id="mediaUrl"
                type="url"
                placeholder="https://exemplo.com/arquivo.jpg"
                value={formData.mediaUrl}
                onChange={(e) => handleInputChange('mediaUrl', e.target.value)}
                required
              />
            </div>
          )}

          {formData.type === 'document' && (
            <div className="space-y-2">
              <Label htmlFor="fileName">Nome do Arquivo</Label>
              <Input
                id="fileName"
                placeholder="documento.pdf"
                value={formData.fileName}
                onChange={(e) => handleInputChange('fileName', e.target.value)}
                required
              />
            </div>
          )}

          {(formData.type === 'image' || formData.type === 'document') && (
            <div className="space-y-2">
              <Label htmlFor="message">Legenda (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Legenda da mídia..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={2}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="size-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                result.success
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {result.success ? (
                <CheckCircle className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          <Separator />

          <Button type="submit" disabled={loading} className="w-full">
            {getMessageTypeIcon(formData.type)}
            <span className="ml-2">
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
