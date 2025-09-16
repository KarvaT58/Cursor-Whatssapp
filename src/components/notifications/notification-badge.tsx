'use client'

import { Badge } from '@/components/ui/badge'
import { Bell, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count: number
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function NotificationBadge({
  count,
  variant = 'destructive',
  size = 'md',
  showIcon = true,
  className,
}: NotificationBadgeProps) {
  if (count === 0) {
    return showIcon ? (
      <Bell className={cn('h-5 w-5 text-muted-foreground', className)} />
    ) : null
  }

  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base',
  }

  const badgeSizeClasses = {
    sm: 'h-4 min-w-4 px-1 text-xs',
    md: 'h-5 min-w-5 px-1.5 text-xs',
    lg: 'h-6 min-w-6 px-2 text-sm',
  }

  return (
    <div className="relative">
      {showIcon && (
        <BellRing
          className={cn(sizeClasses[size], 'text-primary', className)}
        />
      )}
      <Badge
        variant={variant}
        className={cn(
          'absolute -top-2 -right-2 rounded-full',
          badgeSizeClasses[size],
          'flex items-center justify-center'
        )}
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </div>
  )
}
