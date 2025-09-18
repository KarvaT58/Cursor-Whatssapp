'use client'

import { useState, useCallback } from 'react'
import { LogOut, AlertTriangle, Users, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { useGroupLeave } from '@/hooks/use-group-leave'

interface GroupLeaveButtonProps {
  group: {
    id: string
    name: string
    participants: string[]
    admins?: string[]
  }
  currentUserPhone?: string
  onGroupLeft?: () => void
}

export function GroupLeaveButton({ 
  group, 
  currentUserPhone, 
  onGroupLeft 
}: GroupLeaveButtonProps) {
  const { leaveGroup, isLoading, error, clearError } = useGroupLeave()

  // Estados locais
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [notifyMembers, setNotifyMembers] = useState(true)
  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error'
    message: string
    details?: any
  } | null>(null)

  // Verificar se o usuário é participante do grupo
  const isParticipant = group.participants.includes(currentUserPhone || '')
  const isAdmin = group.admins?.includes(currentUserPhone || '') || false
  const isLastAdmin = isAdmin && group.admins?.length === 1

  // Sair do grupo
  const handleLeaveGroup = useCallback(async () => {
    if (!currentUserPhone) return

    try {
      const result = await leaveGroup({
        groupId: group.id,
        reason: reason.trim() || undefined,
        notifyMembers: notifyMembers,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      // Fechar dialog e chamar callback
      setIsDialogOpen(false)
      onGroupLeft?.()
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao sair do grupo',
      })
    }
  }, [group.id, currentUserPhone, reason, notifyMembers, leaveGroup, onGroupLeft])

  // Limpar resultado da operação
  const clearOperationResult = useCallback(() => {
    setOperationResult(null)
    clearError()
  }, [clearError])

  // Resetar formulário
  const resetForm = useCallback(() => {
    setReason('')
    setNotifyMembers(true)
    setOperationResult(null)
    clearError()
  }, [clearError])

  // Fechar dialog
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    resetForm()
  }, [resetForm])

  if (!isParticipant) {
    return null // Não mostrar o botão se não for participante
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
            disabled={isLastAdmin}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair do Grupo
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Sair do Grupo
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Aviso sobre ser último admin */}
            {isLastAdmin && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você é o último administrador do grupo. Promova outro administrador antes de sair.
                </AlertDescription>
              </Alert>
            )}

            {/* Informações do grupo */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">{group.name}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Participantes: {group.participants.length}</p>
                <p>Administradores: {group.admins?.length || 0}</p>
                {isAdmin && <p className="text-amber-600">Você é administrador</p>}
              </div>
            </div>

            {/* Erro geral */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Resultado da operação */}
            {operationResult && (
              <Alert variant={operationResult.type === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{operationResult.message}</p>
                    {operationResult.details && (
                      <div className="text-xs space-y-1">
                        <p>📊 Participantes restantes: {operationResult.details.group?.participants_count}</p>
                        <p>👑 Administradores restantes: {operationResult.details.group?.admins_count}</p>
                        {operationResult.details.notifications?.sent && (
                          <p>📢 Notificações enviadas: {operationResult.details.notifications.recipients_count} membros</p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Motivo da saída */}
            <div className="space-y-2">
              <Label htmlFor="leave-reason">Motivo da saída (opcional)</Label>
              <Textarea
                id="leave-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Digite o motivo da sua saída..."
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">
                {reason.length}/500 caracteres
              </div>
            </div>

            {/* Notificar membros */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-members"
                checked={notifyMembers}
                onCheckedChange={(checked) => setNotifyMembers(checked === true)}
              />
              <Label htmlFor="notify-members" className="flex items-center gap-2">
                {notifyMembers ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                Notificar outros membros sobre sua saída
              </Label>
            </div>

            {/* Aviso final */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. Você precisará ser adicionado novamente ao grupo para participar.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveGroup}
              disabled={isLoading || isLastAdmin}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? 'Saindo...' : 'Confirmar Saída'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card de informações adicionais (opcional) */}
      {isLastAdmin && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-amber-800">Último Administrador</p>
                <p className="text-sm text-amber-700">
                  Você é o único administrador deste grupo. Para sair, primeiro promova outro membro a administrador.
                </p>
                <div className="text-xs text-amber-600">
                  <p>• Vá em "Gerenciar Administradores"</p>
                  <p>• Promova um participante a administrador</p>
                  <p>• Depois você poderá sair do grupo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
