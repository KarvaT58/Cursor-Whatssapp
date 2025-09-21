'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function AdminConfigForm() {
  const [adminPhone, setAdminPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Carregar configuração atual
  useEffect(() => {
    loadAdminConfig()
  }, [])

  const loadAdminConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin-config')
      const data = await response.json()

      if (data.success) {
        setAdminPhone(data.data.adminPhone)
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar configuração',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAdminConfig = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminPhone })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Configuração do administrador salva com sucesso!'
        })
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao salvar configuração',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Administrador</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Administrador</CardTitle>
        <CardDescription>
          Configure o número do administrador que será usado nas mensagens de banimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="adminPhone">Número do Administrador</Label>
          <Input
            id="adminPhone"
            type="text"
            placeholder="(45) 91284-3589"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Este número será usado nas mensagens enviadas para contatos banidos
          </p>
        </div>
        
        <Button 
          onClick={saveAdminConfig} 
          disabled={saving || !adminPhone.trim()}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Exemplo de mensagem:</h4>
          <p className="text-sm text-muted-foreground">
            "Você está banido dos grupos do WhatsApp contate o administrado para mais informações {adminPhone || '(45) 91284-3589'}"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
