'use client'

import { Check, CheckCheck, Clock, X } from 'lucide-react'

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read' | 'failed' | null
}

export function MessageStatus({ status }: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <X className="w-3 h-3 text-destructive" />
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getStatusTooltip = () => {
    switch (status) {
      case 'sent':
        return 'Enviado'
      case 'delivered':
        return 'Entregue'
      case 'read':
        return 'Lido'
      case 'failed':
        return 'Falha no envio'
      default:
        return 'Enviando...'
    }
  }

  return (
    <div className="flex items-center" title={getStatusTooltip()}>
      {getStatusIcon()}
    </div>
  )
}
