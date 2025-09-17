'use client'

import { useWebVitals } from '@/hooks/use-web-vitals'

interface WebVitalsProviderProps {
  children: React.ReactNode
}

export function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  const mounted = useWebVitals()

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
