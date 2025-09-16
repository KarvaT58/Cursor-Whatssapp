'use client'

import { Card, CardContent } from '@/components/ui/card'

interface TypingIndicatorProps {
  contactName: string
}

export function TypingIndicator({ contactName }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 max-w-[70%]">
      <div className="flex flex-col">
        <Card className="bg-muted">
          <CardContent className="p-3">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {contactName} está digitando
              </span>
              <div className="flex gap-1">
                <div
                  className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
