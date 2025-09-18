'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, Minus, Users, Phone, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useGroupParticipants } from '@/hooks/use-group-participants'
import { processPhoneForStorage } from '@/lib/phone-utils'

interface GroupParticipantsManagerProps {
  group: {
    id: string
    name: string
    participants: string[]
  }
  onParticipantsUpdated?: (updatedGroup: any) => void
  onClose?: () => void
}

export function GroupParticipantsManager({ group, onParticipantsUpdated, onClose }: GroupParticipantsManagerProps) {
  const { addParticipants, removeParticipants, isLoading, error, clearError } = useGroupParticipants()
  
  // Estados locais
  const [newParticipantPhone, setNewParticipantPhone] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
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

  // Adicionar participante
  const handleAddParticipant = useCallback(async () => {
    if (!validatePhone(newParticipantPhone)) {
      return
    }

    try {
      const validation = processPhoneForStorage(newParticipantPhone)
      const normalizedPhone = validation.normalized!

      const result = await addParticipants({
        groupId: group.id,
        participants: [normalizedPhone],
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      setNewParticipantPhone('')
      onParticipantsUpdated?.(result.group)
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao adicionar participante',
      })
    }
  }, [newParticipantPhone, group.id, addParticipants, onParticipantsUpdated, validatePhone])

  // Remover participantes selecionados
  const handleRemoveSelected = useCallback(async () => {
    if (selectedParticipants.length === 0) {
      setOperationResult({
        type: 'error',
        message: 'Selecione pelo menos um participante para remover',
      })
      return
    }

    try {
      const result = await removeParticipants({
        groupId: group.id,
        participants: selectedParticipants,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      setSelectedParticipants([])
      onParticipantsUpdated?.(result.group)
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao remover participantes',
      })
    }
  }, [selectedParticipants, group.id, removeParticipants, onParticipantsUpdated])

  // Selecionar/deselecionar participante
  const toggleParticipantSelection = useCallback((phone: string) => {
    setSelectedParticipants(prev => 
      prev.includes(phone) 
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    )
  }, [])

  // Selecionar todos
  const selectAllParticipants = useCallback(() => {
    setSelectedParticipants(group.participants)
  }, [group.participants])

  // Desmarcar todos
  const deselectAllParticipants = useCallback(() => {
    setSelectedParticipants([])
  }, [])

  // Limpar resultado da operação
  const clearOperationResult = useCallback(() => {
    setOperationResult(null)
    clearError()
  }, [clearError])

  // Estatísticas dos participantes
  const participantStats = useMemo(() => {
    const total = group.participants.length
    const selected = selectedParticipants.length
    const maxParticipants = 256
    const remaining = maxParticipants - total

    return { total, selected, maxParticipants, remaining }
  }, [group.participants.length, selectedParticipants.length])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Participantes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {participantStats.total}/{participantStats.maxParticipants}
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {group.name} • {participantStats.remaining} vagas disponíveis
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
                    {operationResult.details.added && (
                      <p>✅ Adicionados: {operationResult.details.added.join(', ')}</p>
                    )}
                    {operationResult.details.removed && (
                      <p>❌ Removidos: {operationResult.details.removed.join(', ')}</p>
                    )}
                    {operationResult.details.duplicates && (
                      <p>⚠️ Já existiam: {operationResult.details.duplicates.join(', ')}</p>
                    )}
                    {operationResult.details.not_found && (
                      <p>⚠️ Não encontrados: {operationResult.details.not_found.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Adicionar participante */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Adicionar Participante</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={newParticipantPhone}
                onChange={(e) => {
                  setNewParticipantPhone(e.target.value)
                  if (phoneError) setPhoneError(null)
                }}
                placeholder="Digite o telefone (ex: 4599987654321)"
                className={phoneError ? 'border-destructive' : ''}
              />
              {phoneError && (
                <p className="text-xs text-destructive mt-1">{phoneError}</p>
              )}
            </div>
            <Button 
              onClick={handleAddParticipant} 
              disabled={isLoading || !newParticipantPhone.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Lista de participantes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Participantes ({participantStats.total})
            </label>
            <div className="flex gap-2">
              {selectedParticipants.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSelected}
                    disabled={isLoading}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remover ({selectedParticipants.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAllParticipants}
                  >
                    Desmarcar
                  </Button>
                </>
              )}
              {selectedParticipants.length < participantStats.total && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllParticipants}
                >
                  Selecionar Todos
                </Button>
              )}
            </div>
          </div>

          {group.participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum participante no grupo</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {group.participants.map((phone, index) => (
                <div
                  key={phone}
                  className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                    selectedParticipants.includes(phone)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleParticipantSelection(phone)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedParticipants.includes(phone)
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedParticipants.includes(phone) && (
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 font-mono text-sm">{phone}</span>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

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
