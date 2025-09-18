'use client'

import { useState, useEffect } from 'react'
import { Phone, PhoneOff, Users, Clock, Mic, MicOff, Volume2, VolumeX, Settings, UserPlus, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGroupAudioCalls, GroupAudioCall, StartCallData } from '@/hooks/use-group-audio-calls'

interface AudioCallManagerProps {
  groupId: string
  groupName: string
  groupParticipants: string[]
  className?: string
}

export function AudioCallManager({ groupId, groupName, groupParticipants, className }: AudioCallManagerProps) {
  const { 
    startCall, 
    getActiveCall, 
    endCall, 
    joinCall, 
    leaveCall, 
    inviteParticipants,
    isLoading, 
    error, 
    clearError 
  } = useGroupAudioCalls()
  const { toast } = useToast()

  // Estados locais
  const [activeCall, setActiveCall] = useState<GroupAudioCall | null>(null)
  const [showStartCallForm, setShowStartCallForm] = useState(false)
  const [callData, setCallData] = useState<StartCallData>({
    participants: [],
    title: '',
    description: '',
  })
  const [audioSettings, setAudioSettings] = useState({
    micMuted: false,
    speakerMuted: false,
  })

  // Carregar chamada ativa ao montar o componente
  useEffect(() => {
    loadActiveCall()
  }, [groupId])

  // Carregar chamada ativa
  const loadActiveCall = async () => {
    try {
      const result = await getActiveCall(groupId)
      setActiveCall(result.call)
    } catch (err) {
      console.error('Erro ao carregar chamada ativa:', err)
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

  // Calcular duração da chamada
  const getCallDuration = (startedAt: string) => {
    const start = new Date(startedAt)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  // Iniciar chamada
  const handleStartCall = async () => {
    if (callData.participants.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um participante',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await startCall(groupId, callData)
      setActiveCall(result.call)
      setShowStartCallForm(false)
      setCallData({
        participants: [],
        title: '',
        description: '',
      })
      
      toast({
        title: 'Chamada iniciada!',
        description: result.message,
      })
    } catch (err) {
      console.error('Erro ao iniciar chamada:', err)
    }
  }

  // Entrar na chamada
  const handleJoinCall = async () => {
    if (!activeCall) return

    try {
      await joinCall(groupId, activeCall.id)
      await loadActiveCall() // Recarregar para atualizar status
      
      toast({
        title: 'Entrou na chamada!',
        description: 'Você está conectado à chamada de áudio',
      })
    } catch (err) {
      console.error('Erro ao entrar na chamada:', err)
    }
  }

  // Sair da chamada
  const handleLeaveCall = async () => {
    if (!activeCall) return

    try {
      await leaveCall(groupId, activeCall.id)
      await loadActiveCall() // Recarregar para atualizar status
      
      toast({
        title: 'Saiu da chamada!',
        description: 'Você foi desconectado da chamada',
      })
    } catch (err) {
      console.error('Erro ao sair da chamada:', err)
    }
  }

  // Encerrar chamada
  const handleEndCall = async () => {
    if (!activeCall) return

    try {
      await endCall(groupId, activeCall.id, {
        reason: 'Chamada encerrada pelo criador',
        notify_participants: true,
      })
      setActiveCall(null)
      
      toast({
        title: 'Chamada encerrada!',
        description: 'A chamada foi encerrada com sucesso',
      })
    } catch (err) {
      console.error('Erro ao encerrar chamada:', err)
    }
  }

  // Alternar microfone
  const toggleMic = () => {
    setAudioSettings(prev => ({
      ...prev,
      micMuted: !prev.micMuted
    }))
    
    // TODO: Implementar controle real do microfone
    console.log('Microfone:', audioSettings.micMuted ? 'Ativado' : 'Desativado')
  }

  // Alternar alto-falante
  const toggleSpeaker = () => {
    setAudioSettings(prev => ({
      ...prev,
      speakerMuted: !prev.speakerMuted
    }))
    
    // TODO: Implementar controle real do alto-falante
    console.log('Alto-falante:', audioSettings.speakerMuted ? 'Ativado' : 'Desativado')
  }

  // Adicionar/remover participante da lista
  const toggleParticipant = (phone: string) => {
    setCallData(prev => ({
      ...prev,
      participants: prev.participants.includes(phone)
        ? prev.participants.filter(p => p !== phone)
        : [...prev.participants, phone]
    }))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Chamadas de Áudio
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie chamadas de áudio em grupo (até 32 participantes)
        </p>
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

        {/* Chamada ativa */}
        {activeCall ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{activeCall.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{activeCall.participants_count || 0} participantes</span>
                  </div>
                  {activeCall.started_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getCallDuration(activeCall.started_at)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Badge variant="default" className="bg-green-100 text-green-800">
                Ativa
              </Badge>
            </div>

            {/* Controles de áudio */}
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Button
                variant={audioSettings.micMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMic}
              >
                {audioSettings.micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={audioSettings.speakerMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleSpeaker}
              >
                {audioSettings.speakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Ações da chamada */}
            <div className="flex gap-2">
              {activeCall.user_status === 'joined' ? (
                <Button
                  variant="outline"
                  onClick={handleLeaveCall}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Sair da Chamada
                </Button>
              ) : (
                <Button
                  onClick={handleJoinCall}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Entrar na Chamada
                </Button>
              )}
              
              {activeCall.can_manage && (
                <Button
                  variant="destructive"
                  onClick={handleEndCall}
                  disabled={isLoading}
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Encerrar
                </Button>
              )}
            </div>

            {/* Lista de participantes */}
            {activeCall.audio_call_participants && (
              <div className="space-y-2">
                <h4 className="font-medium">Participantes:</h4>
                <div className="space-y-1">
                  {activeCall.audio_call_participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{participant.participant_phone}</span>
                      <Badge 
                        variant={
                          participant.status === 'joined' ? 'default' :
                          participant.status === 'invited' ? 'secondary' : 'outline'
                        }
                      >
                        {participant.status === 'joined' ? 'Conectado' :
                         participant.status === 'invited' ? 'Convidado' : 'Desconectado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma chamada ativa</h3>
            <p className="text-muted-foreground mb-4">
              Inicie uma chamada de áudio para conversar com os membros do grupo.
            </p>
            <Button onClick={() => setShowStartCallForm(true)}>
              Iniciar Chamada
            </Button>
          </div>
        )}

        {/* Formulário para iniciar chamada */}
        {showStartCallForm && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Iniciar Nova Chamada</h3>
            
            <div className="space-y-2">
              <Label htmlFor="call-title">Título da chamada</Label>
              <Input
                id="call-title"
                placeholder="Digite o título da chamada..."
                value={callData.title}
                onChange={(e) => setCallData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="call-description">Descrição (opcional)</Label>
              <Textarea
                id="call-description"
                placeholder="Descreva o propósito da chamada..."
                value={callData.description}
                onChange={(e) => setCallData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Participantes ({callData.participants.length}/32)</Label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {groupParticipants.map((phone) => (
                  <div key={phone} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`participant-${phone}`}
                      checked={callData.participants.includes(phone)}
                      onChange={() => toggleParticipant(phone)}
                      className="rounded"
                    />
                    <label htmlFor={`participant-${phone}`} className="text-sm">
                      {phone}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStartCall}
                disabled={isLoading || callData.participants.length === 0}
                className="flex-1"
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Chamada'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowStartCallForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
