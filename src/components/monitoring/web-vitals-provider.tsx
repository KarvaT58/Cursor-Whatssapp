'use client'

import { useWebVitals } from '@/hooks/use-web-vitals'

interface WebVitalsProviderProps {
  children: React.ReactNode
}

export function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  useWebVitals()
  
  return <>{children}</>
}
