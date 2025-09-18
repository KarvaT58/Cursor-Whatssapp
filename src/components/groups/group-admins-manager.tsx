'use client'

import { useState, useCallback, useMemo } from 'react'
import { Crown, Shield, Users, Phone, AlertCircle, CheckCircle, X, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useGroupAdmins } from '@/hooks/use-group-admins'
import { processPhoneForStorage } from '@/lib/phone-utils'

interface GroupAdminsManagerProps {
  group: {
    id: string
    name: string
    participants: string[]
    admins?: string[]
  }
  onAdminsUpdated?: (updatedGroup: any) => void
  onClose?: () => void
}

export function GroupAdminsManager({ group, onAdminsUpdated, onClose }: GroupAdminsManagerProps) {
  const { promoteAdmin, demoteAdmin, isLoading, error, clearError } = useGroupAdmins()
  
  // Estados locais
  const [newAdminPhone, setNewAdminPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error'
    message: string
    details?: any
  } | null>(null)

  // Validar telefone
  const validatePhone = useCallback((phone: string) => {
    if (!phone.trim()) {
      setPhoneError('Telefone é obrigatório')
      return false
    }

    const validation = processPhoneForStorage(phone)
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Telefone inválido')
      return false
    }

    setPhoneError(null)
    return true
  }, [])

  // Promover administrador
  const handlePromoteAdmin = useCallback(async () => {
    if (!validatePhone(newAdminPhone)) {
      return
    }

    try {
      const validation = processPhoneForStorage(newAdminPhone)
      const normalizedPhone = validation.normalized!

      const result = await promoteAdmin({
        groupId: group.id,
        phone: normalizedPhone,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      setNewAdminPhone('')
      onAdminsUpdated?.(result.group)
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao promover administrador',
      })
    }
  }, [newAdminPhone, group.id, promoteAdmin, onAdminsUpdated, validatePhone])

  // Remover administrador
  const handleDemoteAdmin = useCallback(async (phone: string) => {
    try {
      const result = await demoteAdmin({
        groupId: group.id,
        phone,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      onAdminsUpdated?.(result.group)
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao remover administrador',
      })
    }
  }, [group.id, demoteAdmin, onAdminsUpdated])

  // Limpar resultado da operação
  const clearOperationResult = useCallback(() => {
    setOperationResult(null)
    clearError()
  }, [clearError])

  // Estatísticas dos administradores
  const adminStats = useMemo(() => {
    const admins = group.admins || []
    const participants = group.participants || []
    const regularMembers = participants.filter(p => !admins.includes(p))
    
    return {
      totalAdmins: admins.length,
      totalMembers: participants.length,
      regularMembers: regularMembers.length,
      canPromote: regularMembers.length > 0,
      canDemote: admins.length > 1,
    }
  }, [group.admins, group.participants])

  // Participantes que podem ser promovidos
  const promotableParticipants = useMemo(() => {
    const admins = group.admins || []
    return group.participants.filter(p => !admins.includes(p))
  }, [group.participants, group.admins])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Gerenciar Administradores
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {adminStats.totalAdmins} admin{adminStats.totalAdmins !== 1 ? 's' : ''}
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {group.name} • {adminStats.totalMembers} membros total
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
                    {operationResult.details.promoted_admin && (
                      <p>✅ Promovido: {operationResult.details.promoted_admin}</p>
                    )}
                    {operationResult.details.demoted_admin && (
                      <p>❌ Removido: {operationResult.details.demoted_admin}</p>
                    )}
                    <p>👑 Total de administradores: {operationResult.details.total_admins}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Promover administrador */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Promover Administrador</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={newAdminPhone}
                onChange={(e) => {
                  setNewAdminPhone(e.target.value)
                  if (phoneError) setPhoneError(null)
                }}
                placeholder="Digite o telefone do participante"
                className={phoneError ? 'border-destructive' : ''}
              />
              {phoneError && (
                <p className="text-xs text-destructive mt-1">{phoneError}</p>
              )}
            </div>
            <Button 
              onClick={handlePromoteAdmin} 
              disabled={isLoading || !newAdminPhone.trim() || !adminStats.canPromote}
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              Promover
            </Button>
          </div>
          {!adminStats.canPromote && (
            <p className="text-xs text-muted-foreground">
              Todos os participantes já são administradores
            </p>
          )}
        </div>

        <Separator />

        {/* Lista de administradores */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Administradores ({adminStats.totalAdmins})
          </label>
          
          {adminStats.totalAdmins === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum administrador no grupo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(group.admins || []).map((phone, index) => (
                <div
                  key={phone}
                  className="flex items-center gap-3 p-3 rounded-md border bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                >
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 font-mono text-sm font-medium">{phone}</span>
                  <Badge variant="secondary" className="text-xs">
                    Admin #{index + 1}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoteAdmin(phone)}
                    disabled={isLoading || !adminStats.canDemote}
                    className="text-destructive hover:text-destructive"
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Lista de participantes que podem ser promovidos */}
        {promotableParticipants.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Participantes Disponíveis ({promotableParticipants.length})
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {promotableParticipants.map((phone, index) => (
                <div
                  key={phone}
                  className="flex items-center gap-3 p-2 rounded-md border bg-muted/50"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1 font-mono text-xs">{phone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewAdminPhone(phone)
                      handlePromoteAdmin()
                    }}
                    disabled={isLoading}
                    className="h-6 px-2 text-xs"
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Promover
                  </Button>
                </div>
              ))}
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
    </Card>
  )
}
