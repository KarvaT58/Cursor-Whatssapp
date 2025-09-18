'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileText, Check, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface ImportPreviewData {
  phone: string
  reason?: string
}

interface ImportResult {
  imported: number
  errors: number
  errorDetails: string[]
  message: string
}

interface BlacklistImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export default function BlacklistImportModal({ 
  isOpen, 
  onClose, 
  onImportComplete 
}: BlacklistImportModalProps) {
  const [step, setStep] = useState<'select' | 'preview' | 'result'>('select')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreviewData[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      parseCSVFile(file)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setCsvFile(file)
      parseCSVFile(file)
    } else {
      toast.error('Por favor, selecione um arquivo CSV válido')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const parseCSVFile = async (file: File) => {
    try {
      setLoading(true)
      const content = await file.text()
      const lines = content.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV deve ter pelo menos um cabeçalho e uma linha de dados')
        return
      }

      // Parsear cabeçalho
      const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const phoneIndex = header.findIndex(h => h.toLowerCase() === 'phone')
      const reasonIndex = header.findIndex(h => h.toLowerCase() === 'reason')

      if (phoneIndex === -1) {
        toast.error('CSV deve ter uma coluna "phone"')
        return
      }

      // Parsear dados
      const data: ImportPreviewData[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = parseCSVLine(line)
        const phone = values[phoneIndex]
        const reason = reasonIndex !== -1 ? values[reasonIndex] : undefined

        if (phone) {
          data.push({
            phone: phone.replace(/\D/g, ''), // Remove formatação
            reason: reason || undefined
          })
        }
      }

      setPreviewData(data)
      setStep('preview')
    } catch (error) {
      console.error('Erro ao processar CSV:', error)
      toast.error('Erro ao processar arquivo CSV')
    } finally {
      setLoading(false)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const handleImport = async () => {
    if (!csvFile) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('csv', csvFile)

      const response = await fetch('/api/blacklist/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setImportResult({
          imported: data.imported,
          errors: data.errors,
          errorDetails: data.errorDetails || [],
          message: data.message
        })
        setStep('result')
        onImportComplete()
      } else {
        toast.error(data.error || 'Erro ao importar CSV')
      }
    } catch (error) {
      console.error('Erro ao importar:', error)
      toast.error('Erro ao importar CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('select')
    setCsvFile(null)
    setPreviewData([])
    setImportResult(null)
    setOverwriteExisting(false)
    onClose()
  }

  const handleBack = () => {
    if (step === 'preview') {
      setStep('select')
    } else if (step === 'result') {
      setStep('preview')
    }
  }

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    return phone
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <DialogTitle>Importar Blacklist</DialogTitle>
          </div>
          <p className="text-sm text-gray-600">
            Importe números de um arquivo CSV para sua blacklist
          </p>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            {/* Área de seleção de arquivo */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um arquivo CSV
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                O arquivo deve conter as colunas: <strong>phone, reason</strong>
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Escolher arquivo'}
                </Button>
                <span className="text-sm text-gray-500">
                  {csvFile ? csvFile.name : 'Nenhum arquivo escolhido'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Informações sobre o formato */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Formato do CSV:</h4>
              <div className="bg-white p-3 rounded border font-mono text-sm">
                <div className="text-gray-600 mb-2">Para importar números via CSV, use o seguinte formato:</div>
                <div className="text-gray-800">
                  phone,reason<br/>
                  "5511999999999","Spam"<br/>
                  "5511888888888","Comportamento inadequado"<br/>
                  "5511777777777",""
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                • A coluna "phone" é obrigatória<br/>
                • A coluna "reason" é opcional<br/>
                • Use aspas duplas para valores com vírgulas
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            {/* Cabeçalho da pré-visualização */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Pré-visualização</h3>
                <p className="text-sm text-gray-600">
                  {previewData.length} números encontrados
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep('select')
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                Trocar Arquivo
              </Button>
            </div>

            {/* Tabela de pré-visualização */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Telefone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatPhone(item.phone)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                  ... e mais {previewData.length - 10} números
                </div>
              )}
            </div>

            {/* Opções */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwrite"
                checked={overwriteExisting}
                onCheckedChange={setOverwriteExisting}
              />
              <Label htmlFor="overwrite" className="text-sm">
                Sobrescrever números existentes com o mesmo telefone
              </Label>
            </div>

            {/* Botões */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Importando...' : `Importar ${previewData.length} Números`}
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && importResult && (
          <div className="space-y-6">
            {/* Ícone de sucesso */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Importação Concluída
              </h3>
              <p className="text-sm text-gray-600">
                Processamento finalizado com sucesso
              </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.imported}
                </div>
                <div className="text-sm text-green-700">Importados</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.imported}
                </div>
                <div className="text-sm text-blue-700">Atualizados</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {importResult.errors}
                </div>
                <div className="text-sm text-orange-700">Ignorados</div>
              </div>
            </div>

            {/* Detalhes dos erros */}
            {importResult.errorDetails.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Erros encontrados:</h4>
                <div className="space-y-1">
                  {importResult.errorDetails.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      • {error}
                    </p>
                  ))}
                  {importResult.errorDetails.length > 5 && (
                    <p className="text-sm text-red-600">
                      ... e mais {importResult.errorDetails.length - 5} erros
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end">
              <Button 
                onClick={handleClose}
                className="bg-gray-900 hover:bg-gray-800"
              >
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
