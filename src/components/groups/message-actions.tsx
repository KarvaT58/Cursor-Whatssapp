'use client'

import { useState } from 'react'
import { MoreHorizontal, Copy, Reply, Trash2, Flag, Heart, Smile, ThumbsUp, ThumbsDown, MessageSquare, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useGroupModeration } from '@/hooks/use-group-moderation'

interface MessageActionsProps {
  message: {
    id: string
    content: string
    sender_name: string
    sender_id: string
    created_at: string
    message_type: string
    is_deleted?: boolean
  }
  groupId: string
  currentUserId: string
  isAdmin: boolean
  onReply?: (message: any) => void
  onCopy?: (content: string) => void
  onReact?: (messageId: string, emoji: string) => void
  className?: string
}

export function MessageActions({ 
  message, 
  groupId, 
  currentUserId, 
  isAdmin, 
  onReply, 
  onCopy, 
  onReact,
  className 
}: MessageActionsProps) {
  const { deleteMessage, createReport, isLoading } = useGroupModeration()
  const { toast } = useToast()

  // Estados locais
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  // Verificar se o usuário pode deletar a mensagem
  const canDelete = isAdmin || message.sender_id === currentUserId

  // Verificar se o usuário pode reportar a mensagem
  const canReport = message.sender_id !== currentUserId && !message.is_deleted

  // Copiar mensagem
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast({
      title: 'Mensagem copiada!',
      description: 'Conteúdo copiado para a área de transferência',
    })
    onCopy?.(message.content)
  }

  // Responder mensagem
  const handleReply = () => {
    onReply?.(message)
  }

  // Reagir à mensagem
  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji)
  }

  // Deletar mensagem
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteMessage(groupId, message.id)
      
      toast({
        title: 'Mensagem excluída!',
        description: 'A mensagem foi removida com sucesso',
      })
      
      setShowDeleteDialog(false)
    } catch (err) {
      console.error('Erro ao excluir mensagem:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Reportar mensagem
  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: 'Erro',
        description: 'Selecione um motivo para a denúncia',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsReporting(true)
      await createReport(groupId, {
        message_id: message.id,
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      })
      
      toast({
        title: 'Denúncia enviada!',
        description: 'Sua denúncia foi enviada para os administradores',
      })
      
      setShowReportDialog(false)
      setReportReason('')
      setReportDescription('')
    } catch (err) {
      console.error('Erro ao reportar mensagem:', err)
    } finally {
      setIsReporting(false)
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

  // Emojis de reação
  const reactionEmojis = [
    { emoji: '👍', label: 'Curtir' },
    { emoji: '❤️', label: 'Coração' },
    { emoji: '😂', label: 'Risada' },
    { emoji: '😮', label: 'Surpreso' },
    { emoji: '😢', label: 'Triste' },
    { emoji: '😡', label: 'Bravo' },
    { emoji: '👏', label: 'Palmas' },
    { emoji: '🔥', label: 'Fogo' },
  ]

  // Motivos de denúncia
  const reportReasons = [
    { value: 'spam', label: 'Spam' },
    { value: 'inappropriate_content', label: 'Conteúdo Inadequado' },
    { value: 'harassment', label: 'Assédio' },
    { value: 'hate_speech', label: 'Discurso de Ódio' },
    { value: 'violence', label: 'Violência' },
    { value: 'fake_news', label: 'Fake News' },
    { value: 'other', label: 'Outro' },
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          {/* Ações básicas */}
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleReply}>
            <Reply className="h-4 w-4 mr-2" />
            Responder
          </DropdownMenuItem>
          
          {/* Reações */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Smile className="h-4 w-4 mr-2" />
              Reagir
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <div className="grid grid-cols-4 gap-1 p-2">
                {reactionEmojis.map((reaction) => (
                  <Button
                    key={reaction.emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleReact(reaction.emoji)}
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </Button>
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          {/* Ações de moderação */}
          {canDelete && (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          )}
          
          {canReport && (
            <DropdownMenuItem 
              onClick={() => setShowReportDialog(true)}
              className="text-orange-600 hover:text-orange-700"
            >
              <Flag className="h-4 w-4 mr-2" />
              Denunciar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mensagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{message.sender_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(message.created_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {message.content}
            </p>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de denúncia */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar Mensagem</AlertDialogTitle>
            <AlertDialogDescription>
              Reporte esta mensagem para os administradores do grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {/* Mensagem sendo reportada */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{message.sender_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(message.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {message.content}
              </p>
            </div>
            
            {/* Motivo da denúncia */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da denúncia *</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione um motivo</option>
                {reportReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Descrição adicional */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição adicional (opcional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Forneça mais detalhes sobre o problema..."
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {reportDescription.length}/500 caracteres
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReporting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={isReporting || !reportReason.trim()}
            >
              {isReporting ? 'Enviando...' : 'Enviar Denúncia'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}