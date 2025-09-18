'use client'

import { useState } from 'react'
import { Users, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGroupInviteLinks } from '@/hooks/use-group-invite-links'

interface JoinGroupFormProps {
  onJoinSuccess?: (group: any) => void
  className?: string
}

export function JoinGroupForm({ onJoinSuccess, className }: JoinGroupFormProps) {
  const { joinGroup, isLoading, error, clearError } = useGroupInviteLinks()
  const { toast } = useToast()

  // Estados locais
  const [inviteCode, setInviteCode] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [joinedGroup, setJoinedGroup] = useState<any>(null)

  // Validar código de convite
  const validateInviteCode = (code: string): string | null => {
    if (!code.trim()) {
      return 'Código de convite é obrigatório'
    }
    
    if (code.length < 8) {
      return 'Código de convite muito curto'
    }
    
    if (code.length > 20) {
      return 'Código de convite muito longo'
    }
    
    // Verificar se contém apenas caracteres válidos
    const validChars = /^[A-Za-z0-9]+$/
    if (!validChars.test(code)) {
      return 'Código de convite contém caracteres inválidos'
    }
    
    return null
  }

  // Entrar no grupo
  const handleJoinGroup = async () => {
    const validationError = validateInviteCode(inviteCode)
    if (validationError) {
      toast({
        title: 'Código inválido',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await joinGroup(inviteCode.trim())
      
      setJoinedGroup(result.group)
      setIsSuccess(true)
      
      toast({
        title: 'Sucesso!',
        description: `Você entrou no grupo "${result.group.name}" com sucesso.`,
      })
      
      onJoinSuccess?.(result.group)
    } catch (err) {
      console.error('Erro ao entrar no grupo:', err)
    }
  }

  // Limpar formulário
  const handleReset = () => {
    setInviteCode('')
    setIsSuccess(false)
    setJoinedGroup(null)
    clearError()
  }

  // Se sucesso, mostrar informações do grupo
  if (isSuccess && joinedGroup) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Users className="h-5 w-5" />
            Entrou no Grupo!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{joinedGroup.name}</h3>
            
            {joinedGroup.description && (
              <p className="text-muted-foreground mb-4">{joinedGroup.description}</p>
            )}
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{joinedGroup.participants_count} participantes</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleReset} className="flex-1">
              Entrar em Outro Grupo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard/groups'}
            >
              Ver Meus Grupos
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Entrar em um Grupo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
                Limpar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Digite o código de convite que você recebeu para entrar em um grupo.
          </p>
          <p className="text-xs text-muted-foreground">
            O código geralmente tem 12 caracteres e contém letras e números.
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Código de Convite</Label>
            <Input
              id="invite-code"
              placeholder="Digite o código de convite..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={20}
              className="font-mono text-center text-lg tracking-wider"
            />
            <p className="text-xs text-muted-foreground text-center">
              {inviteCode.length}/20 caracteres
            </p>
          </div>

          {/* Validação em tempo real */}
          {inviteCode && validateInviteCode(inviteCode) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validateInviteCode(inviteCode)}
              </AlertDescription>
            </Alert>
          )}

          {/* Botão de ação */}
          <Button
            onClick={handleJoinGroup}
            disabled={isLoading || !!validateInviteCode(inviteCode) || !inviteCode.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              'Entrando...'
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Entrar no Grupo
              </>
            )}
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• O código de convite é válido por tempo limitado</p>
            <p>• Cada código pode ter um limite de usos</p>
            <p>• Você só pode usar cada código uma vez</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
