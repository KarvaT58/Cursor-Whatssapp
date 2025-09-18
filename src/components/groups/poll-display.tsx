'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Square, Clock, Users, BarChart3, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGroupPolls, GroupPoll } from '@/hooks/use-group-polls'

interface PollDisplayProps {
  groupId: string
  poll: GroupPoll
  onPollUpdated?: (poll: GroupPoll) => void
  className?: string
}

export function PollDisplay({ groupId, poll, onPollUpdated, className }: PollDisplayProps) {
  const { votePoll, removeVote, isLoading, error } = useGroupPolls()
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [isVoting, setIsVoting] = useState(false)

  // Inicializar opções selecionadas se o usuário já votou
  useEffect(() => {
    if (poll.stats.has_user_voted) {
      setSelectedOptions(poll.stats.user_vote)
    } else {
      setSelectedOptions([])
    }
  }, [poll.stats.has_user_voted, poll.stats.user_vote])

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

  // Verificar se a enquete expirou
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()

  // Verificar se pode votar
  const canVote = !isExpired && !poll.stats.has_user_voted

  // Verificar se pode alterar voto
  const canChangeVote = !isExpired && poll.stats.has_user_voted

  // Alternar seleção de opção
  const toggleOption = (optionIndex: number) => {
    if (isExpired) return

    if (poll.allow_multiple) {
      // Múltiplas opções permitidas
      setSelectedOptions(prev => 
        prev.includes(optionIndex)
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      )
    } else {
      // Apenas uma opção permitida
      setSelectedOptions([optionIndex])
    }
  }

  // Votar
  const handleVote = async () => {
    if (selectedOptions.length === 0) return

    try {
      setIsVoting(true)
      await votePoll(groupId, poll.id, selectedOptions)
      
      // Atualizar estado local
      const updatedPoll = {
        ...poll,
        stats: {
          ...poll.stats,
          has_user_voted: true,
          user_vote: selectedOptions,
        }
      }
      
      onPollUpdated?.(updatedPoll)
    } catch (err) {
      console.error('Erro ao votar:', err)
    } finally {
      setIsVoting(false)
    }
  }

  // Remover voto
  const handleRemoveVote = async () => {
    try {
      setIsVoting(true)
      await removeVote(groupId, poll.id)
      
      // Atualizar estado local
      const updatedPoll = {
        ...poll,
        stats: {
          ...poll.stats,
          has_user_voted: false,
          user_vote: [],
        }
      }
      
      setSelectedOptions([])
      onPollUpdated?.(updatedPoll)
    } catch (err) {
      console.error('Erro ao remover voto:', err)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{poll.question}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{poll.stats.total_votes} votos</span>
              {poll.expires_at && (
                <>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>
                    {isExpired ? 'Expirada' : `Expira em ${formatDate(poll.expires_at)}`}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {poll.allow_multiple && (
              <Badge variant="outline">Múltiplas opções</Badge>
            )}
            {isExpired && (
              <Badge variant="secondary">Expirada</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Opções */}
        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const optionStats = poll.stats.option_votes.find(v => v.index === index)
            const votes = optionStats?.votes || 0
            const percentage = optionStats?.percentage || 0
            const isSelected = selectedOptions.includes(index)
            const isUserVote = poll.stats.has_user_voted && poll.stats.user_vote.includes(index)

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleOption(index)}
                    disabled={isExpired || isVoting}
                  >
                    {poll.allow_multiple ? (
                      isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`} />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option}</span>
                      {poll.stats.has_user_voted && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {votes} votos ({percentage}%)
                          </span>
                          {isUserVote && (
                            <Badge variant="default" className="text-xs">
                              Seu voto
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {poll.stats.has_user_voted && (
                      <Progress value={percentage} className="mt-1 h-2" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ações */}
        {!isExpired && (
          <div className="flex gap-2 pt-2">
            {canVote && (
              <Button
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || isVoting}
                className="flex-1"
              >
                {isVoting ? 'Votando...' : 'Votar'}
              </Button>
            )}
            
            {canChangeVote && (
              <>
                <Button
                  onClick={handleVote}
                  disabled={selectedOptions.length === 0 || isVoting}
                  variant="outline"
                  className="flex-1"
                >
                  {isVoting ? 'Alterando...' : 'Alterar Voto'}
                </Button>
                
                <Button
                  onClick={handleRemoveVote}
                  disabled={isVoting}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Estatísticas */}
        {poll.stats.has_user_voted && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Resultados da enquete</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
