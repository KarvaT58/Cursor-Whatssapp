'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Download, File, Image, Video, Music, FileText, Archive, Compress, Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGroupFiles, GroupFile, FileFilters } from '@/hooks/use-group-files'

interface FileManagerProps {
  groupId: string
  groupName: string
  className?: string
}

export function FileManager({ groupId, groupName, className }: FileManagerProps) {
  const { 
    startUpload, 
    confirmUpload, 
    getFiles, 
    downloadFile, 
    compressFile,
    isLoading, 
    error, 
    clearError 
  } = useGroupFiles()
  const { toast } = useToast()

  // Estados locais
  const [files, setFiles] = useState<GroupFile[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
  })
  const [statistics, setStatistics] = useState({
    total_files: 0,
    total_size: 0,
    file_types: {} as Record<string, number>,
    average_size: 0,
  })
  const [filters, setFilters] = useState<FileFilters>({
    page: 1,
    limit: 20,
    search: '',
    type: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar arquivos ao montar o componente
  useEffect(() => {
    loadFiles()
  }, [groupId, filters])

  // Carregar arquivos
  const loadFiles = async () => {
    try {
      const result = await getFiles(groupId, filters)
      setFiles(result.files || [])
      setPagination(result.pagination || pagination)
      setStatistics(result.statistics || statistics)
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err)
    }
  }

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Obter ícone do tipo de arquivo
  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (contentType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (contentType.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (contentType.startsWith('text/') || contentType.includes('document')) return <FileText className="h-4 w-4" />
    if (contentType.includes('zip') || contentType.includes('rar')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  // Obter cor do badge baseado no tipo
  const getTypeColor = (contentType: string) => {
    if (contentType.startsWith('image/')) return 'bg-green-100 text-green-800'
    if (contentType.startsWith('video/')) return 'bg-blue-100 text-blue-800'
    if (contentType.startsWith('audio/')) return 'bg-purple-100 text-purple-800'
    if (contentType.startsWith('text/') || contentType.includes('document')) return 'bg-orange-100 text-orange-800'
    if (contentType.includes('zip') || contentType.includes('rar')) return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Selecionar arquivo para upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadingFile(file)
      setShowUploadForm(true)
    }
  }

  // Upload de arquivo
  const handleUpload = async () => {
    if (!uploadingFile) return

    try {
      // Verificar tamanho do arquivo (máximo 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
      if (uploadingFile.size > maxSize) {
        toast({
          title: 'Erro',
          description: 'Arquivo muito grande (máximo 2GB)',
          variant: 'destructive',
        })
        return
      }

      // Iniciar upload
      const uploadData = await startUpload(groupId, {
        filename: uploadingFile.name,
        content_type: uploadingFile.type,
        size: uploadingFile.size,
        description: '',
      })

      // Simular upload com progresso
      setUploadProgress(0)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Simular upload real (em produção, usar a URL de upload)
      setTimeout(async () => {
        try {
          await confirmUpload(groupId, uploadData.file.id)
          
          toast({
            title: 'Upload concluído!',
            description: 'Arquivo enviado com sucesso',
          })

          setShowUploadForm(false)
          setUploadingFile(null)
          setUploadProgress(0)
          await loadFiles()
        } catch (err) {
          console.error('Erro ao confirmar upload:', err)
        }
      }, 2000)

    } catch (err) {
      console.error('Erro ao fazer upload:', err)
    }
  }

  // Download de arquivo
  const handleDownload = async (file: GroupFile) => {
    try {
      const result = await downloadFile(groupId, file.id)
      
      // Abrir URL de download em nova aba
      window.open(result.download_url, '_blank')
      
      toast({
        title: 'Download iniciado!',
        description: 'O arquivo está sendo baixado',
      })
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err)
    }
  }

  // Comprimir arquivo
  const handleCompress = async (file: GroupFile) => {
    try {
      const result = await compressFile(groupId, file.id, {
        compression_level: 6,
        quality: 0.8,
      })
      
      toast({
        title: 'Compressão iniciada!',
        description: result.message,
      })

      await loadFiles()
    } catch (err) {
      console.error('Erro ao comprimir arquivo:', err)
    }
  }

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<FileFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  // Mudar página
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Gerenciador de Arquivos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compartilhe arquivos de até 2GB com o grupo "{groupName}"
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{statistics.total_files}</div>
            <div className="text-sm text-muted-foreground">Arquivos</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{formatFileSize(statistics.total_size)}</div>
            <div className="text-sm text-muted-foreground">Tamanho Total</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{formatFileSize(statistics.average_size)}</div>
            <div className="text-sm text-muted-foreground">Tamanho Médio</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{Object.keys(statistics.file_types).length}</div>
            <div className="text-sm text-muted-foreground">Tipos</div>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar arquivos..."
                value={filters.search}
                onChange={(e) => applyFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => applyFilters({ type: e.target.value as any })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todos os tipos</option>
              <option value="image">Imagens</option>
              <option value="video">Vídeos</option>
              <option value="audio">Áudios</option>
              <option value="document">Documentos</option>
              <option value="archive">Arquivos</option>
              <option value="text">Textos</option>
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => applyFilters({ sortBy: e.target.value as any })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="created_at">Data</option>
              <option value="filename">Nome</option>
              <option value="size">Tamanho</option>
              <option value="download_count">Downloads</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Botão de upload */}
        <div className="flex justify-between items-center">
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Enviar Arquivo
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />
        </div>

        {/* Formulário de upload */}
        {showUploadForm && uploadingFile && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Enviando arquivo</h3>
            
            <div className="space-y-2">
              <Label>Arquivo selecionado</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                {getFileIcon(uploadingFile.type)}
                <span className="text-sm">{uploadingFile.name}</span>
                <Badge variant="outline">{formatFileSize(uploadingFile.size)}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-description">Descrição (opcional)</Label>
              <Textarea
                id="file-description"
                placeholder="Descreva o arquivo..."
                rows={2}
              />
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <Label>Progresso do upload</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">{uploadProgress}% concluído</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isLoading || uploadProgress > 0}
                className="flex-1"
              >
                {uploadProgress > 0 ? 'Enviando...' : 'Enviar'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false)
                  setUploadingFile(null)
                  setUploadProgress(0)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de arquivos */}
        {files.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum arquivo</h3>
            <p className="text-muted-foreground">
              {filters.search || filters.type 
                ? 'Nenhum arquivo encontrado com os filtros aplicados.'
                : 'Nenhum arquivo foi compartilhado neste grupo ainda.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <Card key={file.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getFileIcon(file.content_type)}
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium">{file.filename}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Enviado por {file.uploaded_by_phone}</span>
                          <span>•</span>
                          <span>{formatDate(file.created_at)}</span>
                        </div>
                        
                        {file.description && (
                          <p className="text-sm text-muted-foreground">{file.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(file.content_type)}>
                            {file.content_type.split('/')[0]}
                          </Badge>
                          
                          {file.is_compressed && (
                            <Badge variant="outline" className="text-green-600">
                              <Compress className="h-3 w-3 mr-1" />
                              Comprimido
                            </Badge>
                          )}
                          
                          {file.download_count > 0 && (
                            <Badge variant="outline">
                              {file.download_count} downloads
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                      
                      {!file.is_compressed && file.size > 1024 * 1024 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompress(file)}
                        >
                          <Compress className="h-4 w-4 mr-1" />
                          Comprimir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Paginação */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
