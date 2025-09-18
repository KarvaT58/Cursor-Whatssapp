'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface RateLimitNotificationProps {
  isVisible: boolean
  onClose: () => void
  retryAfter?: number // segundos para aguardar
}

export function RateLimitNotification({ 
  isVisible, 
  onClose, 
  retryAfter = 60 
}: RateLimitNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(retryAfter)

  useEffect(() => {
    if (!isVisible) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible, onClose])

  if (!isVisible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        Rate Limit Atingido
      </AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="space-y-2">
          <p>
            Você atingiu o limite de requisições da Z-API. 
            Aguarde alguns minutos antes de tentar criar novos grupos.
          </p>
          
          {timeLeft > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3" />
              <span>Tente novamente em: {formatTime(timeLeft)}</span>
            </div>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              Entendi
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
