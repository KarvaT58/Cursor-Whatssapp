'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Users, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGroupApprovals, PendingParticipant } from '@/hooks/use-group-approvals'

interface GroupApprovalsManagerProps {
  group: {
    id: string
    name: string
    whatsapp_id?: string
    participants: string[]
    admins?: string[]
  }
  currentUserPhone?: string
  onApprovalChange?: () => void
}

export function GroupApprovalsManager({ 
  group, 
  currentUserPhone, 
  onApprovalChange 
}: GroupApprovalsManagerProps) {
  const { 
    approveParticipant, 
    rejectParticipant, 
    getPendingParticipants, 
    isLoading, 
    error, 
    clearError 
  } = useGroupApprovals()

  // Estados locais
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([])
  const [groupInfo, setGroupInfo] = useState<any>(null)
  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error'
    message: string
    details?: any
  } | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean
    participant: PendingParticipant | null
    reason: string
  }>({
    isOpen: false,
    participant: null,
    reason: '',
  })

  // Verificar se o usuário é administrador
  const isAdmin = group.admins?.includes(currentUserPhone || '') || false

  // Carregar participantes pendentes
  const loadPendingParticipants = useCallback(async () => {
    if (!isAdmin) return

    try {
      const result = await getPendingParticipants(group.id)
      setPendingParticipants(result.pending_participants)
      setGroupInfo(result.group)
    } catch (err) {
      console.error('Erro ao carregar participantes pendentes:', err)
    }
  }, [group.id, isAdmin, getPendingParticipants])

  // Carregar dados iniciais
  useEffect(() => {
    loadPendingParticipants()
  }, [loadPendingParticipants])

  // Aprovar participante
  const handleApprove = useCallback(async (participant: PendingParticipant) => {
    if (!currentUserPhone) return

    try {
      const result = await approveParticipant({
        groupId: group.id,
        participantPhone: participant.phone,
        approvedBy: currentUserPhone,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      // Recarregar lista de pendentes
      await loadPendingParticipants()
      onApprovalChange?.()
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao aprovar participante',
      })
    }
  }, [group.id, currentUserPhone, approveParticipant, loadPendingParticipants, onApprovalChange])

  // Rejeitar participante
  const handleReject = useCallback(async () => {
    if (!currentUserPhone || !rejectDialog.participant) return

    try {
      const result = await rejectParticipant({
        groupId: group.id,
        participantPhone: rejectDialog.participant.phone,
        rejectedBy: currentUserPhone,
        reason: rejectDialog.reason || undefined,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      // Fechar dialog e recarregar lista
      setRejectDialog({ isOpen: false, participant: null, reason: '' })
      await loadPendingParticipants()
      onApprovalChange?.()
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao rejeitar participante',
      })
    }
  }, [group.id, currentUserPhone, rejectParticipant, rejectDialog, loadPendingParticipants, onApprovalChange])

  // Abrir dialog de rejeição
  const openRejectDialog = useCallback((participant: PendingParticipant) => {
    setRejectDialog({
      isOpen: true,
      participant,
      reason: '',
    })
  }, [])

  // Limpar resultado da operação
  const clearOperationResult = useCallback(() => {
    setOperationResult(null)
    clearError()
  }, [clearError])

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Apenas administradores podem gerenciar aprovações</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aprovações Pendentes
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPendingParticipants}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {group.name} • {pendingParticipants.length} participantes aguardando aprovação
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Erro geral */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resultado da operação */}
        {operationResult && (
          <Alert variant={operationResult.type === 'success' ? 'default' : 'destructive'}>
            {operationResult.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p>{operationResult.message}</p>
                {operationResult.details && (
                  <div className="text-xs space-y-1">
                    <p>📊 Participantes no grupo: {operationResult.details.group?.participants_count}</p>
                    <p>⏳ Pendentes: {operationResult.details.group?.pending_participants_count}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de participantes pendentes */}
        {pendingParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum participante aguardando aprovação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingParticipants.map((participant) => (
              <div
                key={participant.phone}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {participant.display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{participant.display_name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {participant.phone}
                    </p>
                    {participant.name && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {participant.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRejectDialog(participant)}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(participant)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informações do grupo */}
        {groupInfo && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Participantes ativos</p>
                <p className="font-medium">{groupInfo.participants_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Administradores</p>
                <p className="font-medium">{groupInfo.admins_count}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        {operationResult && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearOperationResult}>
              Limpar
            </Button>
          </div>
        )}
      </CardContent>

      {/* Dialog de rejeição */}
      <Dialog open={rejectDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setRejectDialog({ isOpen: false, participant: null, reason: '' })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Participante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {rejectDialog.participant && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {rejectDialog.participant.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{rejectDialog.participant.display_name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {rejectDialog.participant.phone}
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Motivo da rejeição (opcional)</Label>
              <Textarea
                id="reject-reason"
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Digite o motivo da rejeição..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectDialog({ isOpen: false, participant: null, reason: '' })}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
