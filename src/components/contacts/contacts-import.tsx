'use client'

import { useState, useRef } from 'react'
import { useContactsImportExport } from '@/hooks/use-contacts-import-export'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  // Download, // Removido - não usado
} from 'lucide-react'

interface ImportResult {
  imported: number
  updated: number
  skipped: number
  errors: Array<{
    index: number
    error: string
    contact: Record<string, unknown>
  }>
}

export function ContactsImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([])
  const [overwrite, setOverwrite] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { loading, error, importContacts, handleFileUpload } =
    useContactsImportExport()

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV')
      return
    }

    setFile(selectedFile)

    try {
      const parsedContacts = await handleFileUpload(selectedFile)
      setContacts(parsedContacts)
      setStep('preview')
    } catch (err) {
      alert(
        'Erro ao processar arquivo: ' +
          (err instanceof Error ? err.message : 'Erro desconhecido')
      )
    }
  }

  const handleImport = async () => {
    try {
      const result = await importContacts(contacts, overwrite)
      setImportResult(result)
      setStep('result')
    } catch (err) {
      console.error('Erro na importação:', err)
    }
  }

  const handleReset = () => {
    setFile(null)
    setContacts([])
    setOverwrite(false)
    setImportResult(null)
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(handleReset, 300) // Reset após fechar o modal
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="size-4" />
          Importar Contatos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Importar Contatos
          </DialogTitle>
          <DialogDescription>
            Importe contatos de um arquivo CSV para sua lista de contatos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Selecione um arquivo CSV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O arquivo deve conter as colunas: Nome, Telefone, Email,
                  Notas, Tags
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) {
                      handleFileSelect(selectedFile)
                    }
                  }}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Pré-visualização</h3>
                  <p className="text-sm text-muted-foreground">
                    {contacts.length} contatos encontrados
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Trocar Arquivo
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <div className="grid grid-cols-5 gap-2 p-3 bg-muted font-medium text-sm">
                  <div>Nome</div>
                  <div>Telefone</div>
                  <div>Email</div>
                  <div>Notas</div>
                  <div>Tags</div>
                </div>
                {contacts.slice(0, 10).map((contact, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-2 p-3 text-sm border-t"
                  >
                    <div className="truncate">{String(contact.name || '')}</div>
                    <div className="truncate">
                      {String(contact.phone || '')}
                    </div>
                    <div className="truncate">
                      {String(contact.email || '-')}
                    </div>
                    <div className="truncate">
                      {String(contact.notes || '-')}
                    </div>
                    <div className="truncate">
                      {Array.isArray(contact.tags)
                        ? contact.tags.join(', ')
                        : '-'}
                    </div>
                  </div>
                ))}
                {contacts.length > 10 && (
                  <div className="p-3 text-sm text-muted-foreground text-center border-t">
                    ... e mais {contacts.length - 10} contatos
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite"
                  checked={overwrite}
                  onCheckedChange={(checked) =>
                    setOverwrite(checked as boolean)
                  }
                />
                <Label htmlFor="overwrite" className="text-sm">
                  Sobrescrever contatos existentes com o mesmo telefone
                </Label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="size-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}

          {step === 'result' && importResult && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Importação Concluída</h3>
                <p className="text-sm text-muted-foreground">
                  Processamento finalizado com sucesso
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.imported}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Importados
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResult.updated}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Atualizados
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {importResult.skipped}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ignorados
                    </div>
                  </CardContent>
                </Card>
              </div>

              {importResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <XCircle className="size-5" />
                      Erros ({importResult.errors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {importResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-2 bg-destructive/10 rounded text-sm"
                        >
                          <div className="font-medium">
                            Linha {error.index + 1}: {error.error}
                          </div>
                          <div className="text-muted-foreground">
                            {String(error.contact.name || '')} -{' '}
                            {String(error.contact.phone || '')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Processando...</span>
              </div>
              <Progress
                value={step === 'preview' ? 50 : 100}
                className="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Voltar
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                <Upload className="size-4 mr-2" />
                Importar {contacts.length} Contatos
              </Button>
            </>
          )}

          {step === 'result' && <Button onClick={handleClose}>Concluir</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
