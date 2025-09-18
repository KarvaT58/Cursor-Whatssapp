'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus, Phone, AlertTriangle, Upload, Download, FileText, Users } from 'lucide-react'
import { toast } from 'sonner'
import BlacklistImportModal from './blacklist-import-modal'

interface BlacklistEntry {
  id: string
  phone: string
  reason?: string
  created_at: string
}

export default function BlacklistManager() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newReason, setNewReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    fetchBlacklist()
  }, [])

  const fetchBlacklist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blacklist')
      const data = await response.json()

      if (data.success) {
        setBlacklist(data.data)
      } else {
        console.error('Erro ao buscar blacklist:', data.error)
        toast.error('Erro ao carregar blacklist')
      }
    } catch (error) {
      console.error('Erro ao buscar blacklist:', error)
      toast.error('Erro ao carregar blacklist')
    } finally {
      setLoading(false)
    }
  }

  const addToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPhone.trim()) {
      toast.error('Número de telefone é obrigatório')
      return
    }

    try {
      setAdding(true)
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: newPhone.trim(),
          reason: newReason.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Número adicionado à blacklist com sucesso!')
        setNewPhone('')
        setNewReason('')
        setIsDialogOpen(false)
        fetchBlacklist()
      } else {
        console.error('Erro na resposta:', data)
        if (data.details && data.details.length > 0) {
          const errorMessage = data.details.map((detail: any) => detail.message).join(', ')
          toast.error(`Erro de validação: ${errorMessage}`)
        } else {
          toast.error(data.error || 'Erro ao adicionar à blacklist')
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar à blacklist:', error)
      toast.error('Erro ao adicionar à blacklist')
    } finally {
      setAdding(false)
    }
  }

  const removeFromBlacklist = async (id: string, phone: string) => {
    if (!confirm(`Tem certeza que deseja remover ${phone} da blacklist?`)) {
      return
    }

    try {
      const response = await fetch(`/api/blacklist/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Número removido da blacklist com sucesso!')
        fetchBlacklist()
      } else {
        toast.error(data.error || 'Erro ao remover da blacklist')
      }
    } catch (error) {
      console.error('Erro ao remover da blacklist:', error)
      toast.error('Erro ao remover da blacklist')
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})/, '($1) $2')
        .replace(/(\d{2})/, '($1')
    }
    
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setNewPhone(formatted)
  }


  const exportCsv = () => {
    const csvContent = [
      'phone,reason,created_at',
      ...blacklist.map(entry => 
        `"${entry.phone}","${entry.reason || ''}","${entry.created_at}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `blacklist_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Blacklist exportada com sucesso!')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Blacklist</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blacklist</h2>
          <p className="text-gray-600 mt-1">
            Gerencie números bloqueados para entrada em grupos via links universais
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Users className="h-4 w-4 mr-1" />
          {blacklist.length} {blacklist.length === 1 ? 'número' : 'números'}
        </Badge>
      </div>

      {/* Ações principais */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Número
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar à Blacklist</DialogTitle>
              <DialogDescription>
                Números na blacklist não poderão entrar em grupos via links universais
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addToBlacklist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número do WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={newPhone}
                  onChange={handlePhoneChange}
                  required
                  disabled={adding}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo (opcional)</Label>
                <Input
                  id="reason"
                  type="text"
                  placeholder="Ex: Spam, comportamento inadequado"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={adding || !newPhone.trim()}>
                  {adding ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => setShowImportModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Importar CSV
        </Button>

        <Button variant="outline" onClick={exportCsv} disabled={blacklist.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Lista da blacklist */}
      {blacklist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Blacklist vazia
            </h3>
            <p className="text-gray-500 text-center">
              Adicione números à blacklist para impedir que entrem em grupos via links universais.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Explicação sobre como funciona a blacklist */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona a blacklist:</strong><br/>
              Números adicionados à blacklist não poderão entrar em grupos via links universais. Isso é útil para bloquear spammers, usuários problemáticos ou números indesejados.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Números Bloqueados</h3>
            <Badge variant="outline">{blacklist.length} números</Badge>
          </div>
          
          <div className="grid gap-3">
            {blacklist.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                        <Phone className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.phone}</p>
                        {entry.reason && (
                          <p className="text-sm text-gray-500">{entry.reason}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Adicionado em {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromBlacklist(entry.id, entry.phone)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}



      {/* Modal de Importação */}
      <BlacklistImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          fetchBlacklist()
          setShowImportModal(false)
        }}
      />
    </div>
  )
}