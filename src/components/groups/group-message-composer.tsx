'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Send, AtSign, Users, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGroupMessages } from '@/hooks/use-group-messages'

interface GroupMessageComposerProps {
  group: {
    id: string
    name: string
    participants: string[]
    admins?: string[]
  }
  currentUserPhone?: string
  onMessageSent?: (message: any) => void
  replyToMessage?: {
    id: string
    content: string
    sender_phone: string
  } | null
  onClearReply?: () => void
}

export function GroupMessageComposer({ 
  group, 
  currentUserPhone, 
  onMessageSent, 
  replyToMessage,
  onClearReply 
}: GroupMessageComposerProps) {
  const { sendMessage, isLoading, error, clearError } = useGroupMessages()
  
  // Estados locais
  const [message, setMessage] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error'
    message: string
    details?: any
  } | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Verificar se o usuário é administrador
  const isAdmin = group.admins?.includes(currentUserPhone || '') || false

  // Participantes que podem ser mencionados
  const mentionableParticipants = group.participants.filter(phone => phone !== currentUserPhone)

  // Detectar menções no texto
  const detectMentions = useCallback((text: string) => {
    const mentionRegex = /@(\w+)/g
    const foundMentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mention = match[1]
      if (mention === 'grupo' && isAdmin) {
        foundMentions.push('@grupo')
      } else if (mentionableParticipants.includes(mention)) {
        foundMentions.push(mention)
      }
    }

    return foundMentions
  }, [mentionableParticipants, isAdmin])

  // Atualizar menções quando o texto muda
  useEffect(() => {
    const newMentions = detectMentions(message)
    setMentions(newMentions)
  }, [message, detectMentions])

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    try {
      const result = await sendMessage({
        groupId: group.id,
        content: message.trim(),
        type: 'text',
        mentions,
        reply_to_message_id: replyToMessage?.id,
      })

      setOperationResult({
        type: 'success',
        message: result.message,
        details: result,
      })

      setMessage('')
      setMentions([])
      onMessageSent?.(result.message_data)
      onClearReply?.()
    } catch (err) {
      setOperationResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao enviar mensagem',
      })
    }
  }, [message, group.id, mentions, replyToMessage, sendMessage, onMessageSent, onClearReply])

  // Adicionar menção
  const addMention = useCallback((phone: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const beforeCursor = message.substring(0, start)
    const afterCursor = message.substring(end)
    
    // Verificar se já está em uma menção
    const beforeMatch = beforeCursor.match(/@\w*$/)
    if (beforeMatch) {
      // Substituir a menção parcial
      const newMessage = beforeCursor.slice(0, -beforeMatch[0].length) + `@${phone} ` + afterCursor
      setMessage(newMessage)
      
      // Posicionar cursor após a menção
      setTimeout(() => {
        const newPosition = start - beforeMatch[0].length + phone.length + 2
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      }, 0)
    } else {
      // Adicionar nova menção
      const newMessage = beforeCursor + `@${phone} ` + afterCursor
      setMessage(newMessage)
      
      // Posicionar cursor após a menção
      setTimeout(() => {
        const newPosition = start + phone.length + 2
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      }, 0)
    }

    setShowMentions(false)
  }, [message])

  // Adicionar menção de grupo
  const addGroupMention = useCallback(() => {
    if (!isAdmin) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const beforeCursor = message.substring(0, start)
    const afterCursor = message.substring(end)
    
    const newMessage = beforeCursor + '@grupo ' + afterCursor
    setMessage(newMessage)
    
    setTimeout(() => {
      const newPosition = start + 7
      textarea.setSelectionRange(newPosition, newPosition)
      textarea.focus()
    }, 0)

    setShowMentions(false)
  }, [message, isAdmin])

  // Lidar com teclas especiais
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === '@') {
      setShowMentions(true)
    }
  }, [handleSendMessage])

  // Limpar resultado da operação
  const clearOperationResult = useCallback(() => {
    setOperationResult(null)
    clearError()
  }, [clearError])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Enviar Mensagem
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {group.name} • {group.participants.length} participantes
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
                {operationResult.details?.mentions && (
                  <div className="text-xs space-y-1">
                    {operationResult.details.mentions.valid.length > 0 && (
                      <p>✅ Menções válidas: {operationResult.details.mentions.valid.join(', ')}</p>
                    )}
                    {operationResult.details.mentions.invalid.length > 0 && (
                      <p>⚠️ Menções inválidas: {operationResult.details.mentions.invalid.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Mensagem de resposta */}
        {replyToMessage && (
          <div className="p-3 bg-muted rounded-md border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Respondendo para {replyToMessage.sender_phone}</p>
                <p className="text-xs text-muted-foreground truncate">{replyToMessage.content}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClearReply}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Compositor de mensagem */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setCursorPosition(e.target.selectionStart)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (use @ para mencionar)"
                className="min-h-[100px] resize-none"
                maxLength={4096}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex gap-2">
                  <Popover open={showMentions} onOpenChange={setShowMentions}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <AtSign className="h-4 w-4 mr-2" />
                        Menções
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Mencionar Participantes</h4>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addGroupMention}
                            className="w-full justify-start"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            @grupo (todos os membros)
                          </Button>
                        )}
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {mentionableParticipants.map((phone) => (
                            <Button
                              key={phone}
                              variant="ghost"
                              size="sm"
                              onClick={() => addMention(phone)}
                              className="w-full justify-start"
                            >
                              <AtSign className="h-4 w-4 mr-2" />
                              @{phone}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-xs text-muted-foreground">
                  {message.length}/4096 caracteres
                </div>
              </div>
            </div>
          </div>

          {/* Menções ativas */}
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Menções:</span>
              {mentions.map((mention) => (
                <Badge key={mention} variant="secondary" className="flex items-center gap-1">
                  <AtSign className="h-3 w-3" />
                  {mention}
                </Badge>
              ))}
            </div>
          )}

          {/* Botão de envio */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
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
