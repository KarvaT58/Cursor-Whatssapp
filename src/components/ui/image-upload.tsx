'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null, previewUrl: string | null) => void
  disabled?: boolean
  maxSize?: number // em bytes
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB padrão
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!acceptedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.')
      return
    }

    // Validar tamanho do arquivo
    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo ${formatFileSize(maxSize)}.`)
      return
    }

    setError(null)
    setUploading(true)

    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewUrl(result)
      setUploading(false)
      onChange(file, result)
    }
    reader.onerror = () => {
      setError('Erro ao processar a imagem.')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }


  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Foto do Grupo</Label>
      
      {/* Upload Area */}
      <Card 
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={previewUrl} alt="Preview" />
                <AvatarFallback>
                  <ImageIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Imagem selecionada</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clique para alterar a imagem
                </p>
              </div>
              
            </div>
          ) : (
            <div className="text-center">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Processando imagem...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-muted p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Adicionar foto do grupo</p>
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar uma imagem
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Máximo {formatFileSize(maxSize)}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input oculto */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informações adicionais */}
      <div className="text-xs text-muted-foreground">
        <p>Formatos suportados: JPEG, PNG, GIF, WebP</p>
        <p>Recomendado: Imagem quadrada para melhor visualização</p>
      </div>
    </div>
  )
}
