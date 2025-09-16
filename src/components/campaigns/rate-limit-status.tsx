'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useRateLimits } from '@/hooks/use-rate-limits'
import { cn } from '@/lib/utils'

interface RateLimitStatusProps {
  className?: string
  showDetails?: boolean
  autoRefresh?: boolean
}

export function RateLimitStatus({
  className,
  showDetails = true,
  autoRefresh = true,
}: RateLimitStatusProps) {
  const {
    rateLimits,
    isLoading,
    error,
    refresh,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
  } = useRateLimits({
    enabled: autoRefresh,
    refreshInterval: 30000,
  })

  if (isLoading && !rateLimits) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Carregando limites...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500">
            <XCircle className="h-6 w-6 mr-2" />
            <span>Erro ao carregar limites: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rateLimits) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Nenhum limite encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (service: keyof typeof rateLimits) => {
    if (isAtLimit(service)) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (isNearLimit(service)) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = (service: keyof typeof rateLimits) => {
    if (isAtLimit(service)) {
      return 'bg-red-100 text-red-800 border-red-200'
    }
    if (isNearLimit(service)) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getServiceName = (service: keyof typeof rateLimits) => {
    switch (service) {
      case 'whatsapp':
        return 'WhatsApp'
      case 'campaign':
        return 'Campanhas'
      case 'api':
        return 'API'
      default:
        return service
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Limites de Taxa</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {Object.entries(rateLimits).map(([service, limit]) => {
          const serviceKey = service as keyof typeof rateLimits
          const usagePercentage = getUsagePercentage(serviceKey)

          return (
            <div key={service} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {getServiceName(serviceKey)}
                  </span>
                  {getStatusIcon(serviceKey)}
                </div>
                <Badge
                  className={cn('border text-xs', getStatusColor(serviceKey))}
                >
                  {limit.remaining}/{limit.limit}
                </Badge>
              </div>

              <Progress
                value={usagePercentage}
                className={cn(
                  'h-2',
                  isAtLimit(serviceKey) && 'bg-red-100',
                  isNearLimit(serviceKey) &&
                    !isAtLimit(serviceKey) &&
                    'bg-yellow-100'
                )}
              />

              {showDetails && (
                <div className="text-xs text-muted-foreground">
                  {limit.window} • {usagePercentage.toFixed(1)}% usado
                </div>
              )}
            </div>
          )
        })}

        {/* Overall Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status Geral</span>
            <Badge
              variant="outline"
              className={cn(
                Object.keys(rateLimits).some((service) =>
                  isAtLimit(service as keyof typeof rateLimits)
                )
                  ? 'border-red-200 text-red-800'
                  : Object.keys(rateLimits).some((service) =>
                        isNearLimit(service as keyof typeof rateLimits)
                      )
                    ? 'border-yellow-200 text-yellow-800'
                    : 'border-green-200 text-green-800'
              )}
            >
              {Object.keys(rateLimits).some((service) =>
                isAtLimit(service as keyof typeof rateLimits)
              )
                ? 'Limite Atingido'
                : Object.keys(rateLimits).some((service) =>
                      isNearLimit(service as keyof typeof rateLimits)
                    )
                  ? 'Próximo do Limite'
                  : 'Normal'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
