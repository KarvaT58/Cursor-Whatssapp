'use client'

import { useState, useEffect } from 'react'
import { Link, Copy, Trash2, Clock, Users, Shield, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGroupInviteLinks, GroupInviteLink, CreateInviteLinkData } from '@/hooks/use-group-invite-links'

interface InviteLinkManagerProps {
  groupId: string
  groupName: string
  className?: string
}

export function InviteLinkManager({ groupId, groupName, className }: InviteLinkManagerProps) {
  const { getInviteLink, createInviteLink, revokeInviteLink, isLoading, error, clearError } = useGroupInviteLinks()
  const { toast } = useToast()

  // Estados locais
  const [currentLink, setCurrentLink] = useState<GroupInviteLink | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createData, setCreateData] = useState<CreateInviteLinkData>({
    expires_in_hours: 24,
    max_uses: 100,
    description: '',
  })

  // Carregar link atual ao montar o componente
  useEffect(() => {
    loadCurrentLink()
  }, [groupId])

  // Carregar link de convite atual
  const loadCurrentLink = async () => {
    try {
      const result = await getInviteLink(groupId)
      setCurrentLink(result.invite_link)
    } catch (err) {
      console.error('Erro ao carregar link:', err)
    }
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

  // Copiar link para área de transferência
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Link copiado!',
        description: 'O link de convite foi copiado para a área de transferência.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  // Criar novo link
  const handleCreateLink = async () => {
    try {
      const result = await createInviteLink(groupId, createData)
      setCurrentLink(result.invite_link)
      setShowCreateForm(false)
      setCreateData({
        expires_in_hours: 24,
        max_uses: 100,
        description: '',
      })
      
      toast({
        title: 'Link criado!',
        description: 'Novo link de convite foi criado com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao criar link:', err)
    }
  }

  // Revogar link
  const handleRevokeLink = async () => {
    try {
      await revokeInviteLink(groupId)
      setCurrentLink(null)
      
      toast({
        title: 'Link revogado!',
        description: 'O link de convite foi revogado com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao revogar link:', err)
    }
  }

  // Gerar URL do link de convite
  const generateInviteUrl = (inviteCode: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/groups/join?code=${inviteCode}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Links de Convite
        </CardTitle>
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

        {/* Link atual */}
        {currentLink ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Link Ativo</h3>
              <div className="flex gap-2">
                {currentLink.is_expired && (
                  <Badge variant="destructive">Expirado</Badge>
                )}
                {currentLink.is_max_uses_reached && (
                  <Badge variant="destructive">Limite atingido</Badge>
                )}
                {!currentLink.is_expired && !currentLink.is_max_uses_reached && (
                  <Badge variant="default">Ativo</Badge>
                )}
              </div>
            </div>

            {/* Informações do link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Código do Convite</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={currentLink.invite_code}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(currentLink.invite_code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Link Completo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={generateInviteUrl(currentLink.invite_code)}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateInviteUrl(currentLink.invite_code))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {currentLink.current_uses || 0} / {currentLink.max_uses || '∞'} usos
                </span>
              </div>
              
              {currentLink.expires_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {currentLink.is_expired ? 'Expirado' : `Expira em ${formatDate(currentLink.expires_at)}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Criado em {formatDate(currentLink.created_at)}</span>
              </div>
            </div>

            {/* Descrição */}
            {currentLink.description && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground">{currentLink.description}</p>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generateInviteUrl(currentLink.invite_code))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(generateInviteUrl(currentLink.invite_code), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Testar Link
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleRevokeLink}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Revogar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum link ativo</h3>
            <p className="text-muted-foreground mb-4">
              Crie um link de convite para permitir que outros usuários entrem no grupo.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Criar Link de Convite
            </Button>
          </div>
        )}

        {/* Formulário de criação */}
        {showCreateForm && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Criar Novo Link</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires_in_hours">Expira em (horas)</Label>
                <Input
                  id="expires_in_hours"
                  type="number"
                  min="1"
                  max="168"
                  value={createData.expires_in_hours}
                  onChange={(e) => setCreateData({
                    ...createData,
                    expires_in_hours: parseInt(e.target.value) || 24
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 1 hora, máximo 168 horas (7 dias)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Máximo de usos</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  max="1000"
                  value={createData.max_uses}
                  onChange={(e) => setCreateData({
                    ...createData,
                    max_uses: parseInt(e.target.value) || 100
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 1 uso, máximo 1000 usos
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição do link de convite..."
                value={createData.description}
                onChange={(e) => setCreateData({
                  ...createData,
                  description: e.target.value
                })}
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {createData.description?.length || 0}/200 caracteres
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateLink}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Criando...' : 'Criar Link'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Botão para criar novo link quando já existe um */}
        {currentLink && !showCreateForm && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              Criar Novo Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
