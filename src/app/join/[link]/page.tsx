'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Users, Hash } from 'lucide-react'

interface GroupInfo {
  familyName: string
  baseName: string
  totalParticipants: number
  activeGroups: number
  availableSpots: number
}

interface JoinResult {
  success: boolean
  message?: string
  error?: string
  data?: {
    groupId: string
    groupName: string
    participantPhone: string
    whatsappInviteLink?: string
    universalLink?: string
  }
}

export default function JoinGroupPage() {
  const params = useParams()
  const link = params.link as string

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [joinResult, setJoinResult] = useState<JoinResult | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)

  useEffect(() => {
    if (link) {
      fetchGroupInfo()
    }
  }, [link])

  const fetchGroupInfo = async () => {
    try {
      setLoadingInfo(true)
      const response = await fetch(`/api/join/${link}`)
      const data = await response.json()

      if (data.success) {
        setGroupInfo(data.data)
      } else {
        setJoinResult({
          success: false,
          error: data.error || 'Erro ao carregar informações do grupo'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar informações do grupo:', error)
      setJoinResult({
        success: false,
        error: 'Erro ao carregar informações do grupo'
      })
    } finally {
      setLoadingInfo(false)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone.trim()) {
      setJoinResult({
        success: false,
        error: 'Número de telefone é obrigatório'
      })
      return
    }

    try {
      setLoading(true)
      setJoinResult(null)

      const response = await fetch(`/api/join/${link}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          name: name.trim() || undefined,
        }),
      })

      const data = await response.json()
      console.log('📋 Resposta completa da API:', data)
      setJoinResult(data)

      if (data.success) {
        // Limpar formulário
        setPhone('')
        setName('')
        // Atualizar informações do grupo
        fetchGroupInfo()
        
        // 🔗 Redirecionar para o link de convite do WhatsApp se disponível
        if (data.data?.whatsappInviteLink) {
          console.log('🔗 Link de convite encontrado:', data.data.whatsappInviteLink)
          // Aguardar um pouco para mostrar a mensagem de sucesso
          setTimeout(() => {
            console.log('🚀 Redirecionando para o WhatsApp:', data.data.whatsappInviteLink)
            // Usar window.location.href para redirecionamento direto
            window.location.href = data.data.whatsappInviteLink
          }, 2000)
        } else {
          console.warn('⚠️ Link de convite não encontrado na resposta:', data.data)
        }
      }
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error)
      setJoinResult({
        success: false,
        error: 'Erro ao processar solicitação'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Formata como (XX) XXXXX-XXXX
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
    setPhone(formatted)
  }

  if (loadingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando informações do grupo...</p>
        </div>
      </div>
    )
  }

  if (!groupInfo && joinResult?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Link Inválido</CardTitle>
            <CardDescription>
              {joinResult.error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {groupInfo?.familyName}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre no grupo usando o link universal
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informações do grupo */}
            {groupInfo && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Participantes:</span>
                  <span className="font-medium">{groupInfo.totalParticipants}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Grupos ativos:</span>
                  <span className="font-medium">{groupInfo.activeGroups}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Vagas disponíveis:</span>
                  <span className="font-medium text-green-600">{groupInfo.availableSpots}</span>
                </div>
              </div>
            )}

            {/* Resultado da tentativa de entrada */}
            {joinResult && (
              <Alert className={joinResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {joinResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={joinResult.success ? 'text-green-800' : 'text-red-800'}>
                  {joinResult.success ? joinResult.message : joinResult.error}
                  {joinResult.success && joinResult.data && (
                    <div className="mt-2 text-sm space-y-1">
                      <p>Você foi adicionado ao grupo: <strong>{joinResult.data.groupName}</strong></p>
                      {joinResult.data.whatsappInviteLink && (
                        <p className="text-blue-600">
                          🔗 Redirecionando para o WhatsApp em alguns segundos...
                        </p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Formulário de entrada */}
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número do WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Digite seu número com DDD (ex: 11999999999)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !phone.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando no grupo...
                  </>
                ) : (
                  <>
                    <Hash className="mr-2 h-4 w-4" />
                    Entrar no Grupo
                  </>
                )}
              </Button>
            </form>

            {/* Informações adicionais */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>• Você será adicionado automaticamente ao grupo com espaço disponível</p>
              <p>• Seu número será verificado contra nossa blacklist</p>
              <p>• Você não pode estar em múltiplos grupos da mesma família</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
