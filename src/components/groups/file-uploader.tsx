'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, File, Image, Video, Music, FileText, Archive, X, Check, AlertCircle, Compress } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  onUploadStart?: (file: File) => void
  onUploadProgress?: (file: File, progress: number) => void
  onUploadComplete?: (file: File, result: any) => void
  onUploadError?: (file: File, error: string) => void
  maxSize?: number // em bytes
  acceptedTypes?: string[]
  multiple?: boolean
  disabled?: boolean
  className?: string
  showPreview?: boolean
  autoCompress?: boolean
  compressionLevel?: number
}

interface UploadingFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  result?: any
}

export function FileUploader({
  onFileSelect,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB padrão
  acceptedTypes = ['*/*'],
  multiple = false,
  disabled = false,
  className,
  showPreview = true,
  autoCompress = true,
  compressionLevel = 6
}: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Obter ícone do tipo de arquivo
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (file.type.startsWith('text/') || file.type.includes('document')) return <FileText className="h-4 w-4" />
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo permitido: ${formatFileSize(maxSize)}`
    }

    // Verificar tipo (se não for aceitar todos)
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1))
        }
        return file.type === type
      })
      
      if (!isAccepted) {
        return `Tipo de arquivo não suportado. Tipos aceitos: ${acceptedTypes.join(', ')}`
      }
    }

    return null
  }

  // Processar arquivos selecionados
  const processFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files)
    
    fileArray.forEach(file => {
      const validationError = validateFile(file)
      
      if (validationError) {
        onUploadError?.(file, validationError)
        return
      }

      // Adicionar à lista de uploads
      const uploadingFile: UploadingFile = {
        file,
        progress: 0,
        status: 'pending'
      }

      setUploadingFiles(prev => [...prev, uploadingFile])
      onFileSelect(file)
    })
  }, [maxSize, acceptedTypes, onFileSelect, onUploadError])

  // Simular upload (em produção, implementar upload real)
  const simulateUpload = useCallback(async (uploadingFile: UploadingFile) => {
    const { file } = uploadingFile
    
    try {
      // Marcar como iniciado
      setUploadingFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'uploading' }
            : uf
        )
      )
      
      onUploadStart?.(file)

      // Simular progresso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, progress }
              : uf
          )
        )
        
        onUploadProgress?.(file, progress)
      }

      // Marcar como completo
      const result = { id: Date.now().toString(), url: URL.createObjectURL(file) }
      
      setUploadingFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'completed', result }
            : uf
        )
      )
      
      onUploadComplete?.(file, result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      setUploadingFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'error', error: errorMessage }
            : uf
        )
      )
      
      onUploadError?.(file, errorMessage)
    }
  }, [onUploadStart, onUploadProgress, onUploadComplete, onUploadError])

  // Iniciar upload de um arquivo
  const startUpload = (file: File) => {
    const uploadingFile = uploadingFiles.find(uf => uf.file === file)
    if (uploadingFile && uploadingFile.status === 'pending') {
      simulateUpload(uploadingFile)
    }
  }

  // Remover arquivo da lista
  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(uf => uf.file !== file))
  }

  // Limpar todos os arquivos
  const clearAll = () => {
    setUploadingFiles([])
  }

  // Handlers de eventos
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      processFiles(files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files) {
      processFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de upload */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Máximo {formatFileSize(maxSize)} por arquivo
          </p>
          <div className="text-xs text-muted-foreground">
            {acceptedTypes.length > 0 && !acceptedTypes.includes('*/*') && (
              <p>Tipos aceitos: {acceptedTypes.join(', ')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Lista de arquivos sendo enviados */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Arquivos selecionados</h4>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Limpar todos
            </Button>
          </div>
          
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getFileIcon(uploadingFile.file)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{uploadingFile.file.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadingFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploadingFile.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => startUpload(uploadingFile.file)}
                          >
                            Iniciar Upload
                          </Button>
                        )}
                        
                        {uploadingFile.status === 'completed' && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                        
                        {uploadingFile.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadingFile.file)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progresso do upload */}
                    {uploadingFile.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={uploadingFile.progress} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                          {uploadingFile.progress}% concluído
                        </p>
                      </div>
                    )}
                    
                    {/* Erro */}
                    {uploadingFile.status === 'error' && uploadingFile.error && (
                      <Alert variant="destructive">
                        <AlertDescription className="text-sm">
                          {uploadingFile.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Opções de compressão */}
                    {uploadingFile.status === 'pending' && 
                     autoCompress && 
                     uploadingFile.file.size > 1024 * 1024 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Compress className="h-4 w-4" />
                        <span>Arquivo será comprimido automaticamente</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
