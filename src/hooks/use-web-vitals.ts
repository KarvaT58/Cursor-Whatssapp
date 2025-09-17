'use client'

import { useEffect, useState } from 'react'
import { reportWebVitals } from '@/lib/metrics/performance-metrics'

export function useWebVitals() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only run in browser environment
    if (typeof window === 'undefined') return

    // Import and use web-vitals library
    import('web-vitals')
      .then(({ onCLS, onFCP, onLCP, onTTFB }) => {
        onCLS(reportWebVitals)
        onFCP(reportWebVitals)
        onLCP(reportWebVitals)
        onTTFB(reportWebVitals)
      })
      .catch((error) => {
        console.error('Failed to load web-vitals:', error)
      })
  }, [])

  return mounted
}
