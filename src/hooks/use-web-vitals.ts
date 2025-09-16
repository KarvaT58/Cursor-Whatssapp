'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/metrics/performance-metrics'

export function useWebVitals() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    // Import and use web-vitals library
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals)
      getFID(reportWebVitals)
      getFCP(reportWebVitals)
      getLCP(reportWebVitals)
      getTTFB(reportWebVitals)
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error)
    })
  }, [])
}
