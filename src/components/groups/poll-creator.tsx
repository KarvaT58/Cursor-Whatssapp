'use client'

import { useState } from 'react'
import { Plus, X, Clock, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGroupPolls, CreatePollData } from '@/hooks/use-group-polls'

interface PollCreatorProps {
  groupId: string
  onPollCreated?: (poll: any) => void
  onCancel?: () => void
}

export function PollCreator({ groupId, onPollCreated, onCancel }: PollCreatorProps) {
  const { createPoll, isLoading, error, clearError } = useGroupPolls()

  // Estados locais
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [showExpiration, setShowExpiration] = useState(false)

  // Adicionar nova opção
  const addOption = () => {
    if (options.length < 12) {
      setOptions([...options, ''])
    }
  }

  // Remover opção
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  // Atualizar opção
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  // Validar dados
  const validateData = (): string | null => {
    if (!question.trim()) {
      return 'Pergunta é obrigatória'
    }
    
    if (question.length > 500) {
      return 'Pergunta muito longa (máximo 500 caracteres)'
    }

    if (question.length < 5) {
      return 'Pergunta muito curta (mínimo 5 caracteres)'
    }

    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      return 'Mínimo 2 opções são necessárias'
    }

    if (validOptions.length > 12) {
      return 'Máximo 12 opções permitidas'
    }

    // Verificar se há opções duplicadas
    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()))
    if (uniqueOptions.size !== validOptions.length) {
      return 'Opções duplicadas não são permitidas'
    }

    // Verificar se as opções não estão vazias
    const emptyOptions = validOptions.filter(opt => opt.trim().length === 0)
    if (emptyOptions.length > 0) {
      return 'Todas as opções devem ter conteúdo'
    }

    // Verificar tamanho das opções
    const longOptions = validOptions.filter(opt => opt.trim().length > 100)
    if (longOptions.length > 0) {
      return 'Opções muito longas (máximo 100 caracteres cada)'
    }

    // Verificar expiração
    if (showExpiration && expiresAt) {
      const expirationDate = new Date(expiresAt)
      const now = new Date()
      if (expirationDate <= now) {
        return 'Data de expiração deve ser no futuro'
      }
      
      // Verificar se a expiração não é muito longa (máximo 30 dias)
      const maxExpiration = new Date()
      maxExpiration.setDate(maxExpiration.getDate() + 30)
      if (expirationDate > maxExpiration) {
        return 'Data de expiração não pode ser superior a 30 dias'
      }
    }

    return null
  }

  // Criar enquete
  const handleCreatePoll = async () => {
    const validationError = validateData()
    if (validationError) {
      clearError()
      return
    }

    try {
      const validOptions = options.filter(opt => opt.trim())
      
      const pollData: CreatePollData = {
        question: question.trim(),
        options: validOptions,
        allow_multiple: allowMultiple,
        expires_at: showExpiration && expiresAt ? expiresAt : undefined,
      }

      const result = await createPoll(groupId, pollData)
      
      // Limpar formulário
      setQuestion('')
      setOptions(['', ''])
      setAllowMultiple(false)
      setExpiresAt('')
      setShowExpiration(false)
      
      onPollCreated?.(result.poll)
    } catch (err) {
      console.error('Erro ao criar enquete:', err)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Criar Nova Enquete
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

        {/* Pergunta */}
        <div className="space-y-2">
          <Label htmlFor="question">Pergunta *</Label>
          <Textarea
            id="question"
            placeholder="Digite sua pergunta..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="text-xs text-muted-foreground text-right">
            {question.length}/500 caracteres
          </div>
        </div>

        {/* Opções */}
        <div className="space-y-3">
          <Label>Opções *</Label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="space-y-1">
                  <Input
                    placeholder={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={100}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {option.length}/100 caracteres
                  </div>
                </div>
              </div>
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {options.length < 12 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Opção
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground">
            {options.filter(opt => opt.trim()).length}/12 opções
          </div>
        </div>

        {/* Configurações */}
        <div className="space-y-4">
          {/* Múltiplas opções */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-multiple">Permitir múltiplas opções</Label>
              <p className="text-xs text-muted-foreground">
                Usuários podem selecionar mais de uma opção
              </p>
            </div>
            <Switch
              id="allow-multiple"
              checked={allowMultiple}
              onCheckedChange={setAllowMultiple}
            />
          </div>

          {/* Expiração */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-expiration">Definir expiração</Label>
              <p className="text-xs text-muted-foreground">
                A enquete expira automaticamente
              </p>
            </div>
            <Switch
              id="show-expiration"
              checked={showExpiration}
              onCheckedChange={setShowExpiration}
            />
          </div>

          {showExpiration && (
            <div className="space-y-2">
              <Label htmlFor="expires-at">Data e hora de expiração</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleCreatePoll}
            disabled={isLoading || !!validateData()}
            className="flex-1"
          >
            {isLoading ? 'Criando...' : 'Criar Enquete'}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>

        {/* Validação */}
        {validateData() && (
          <Alert>
            <AlertDescription className="text-sm">
              {validateData()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
