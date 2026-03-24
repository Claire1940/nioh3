'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = (window.scrollY / scrollHeight) * 100
      setProgress(Math.min(100, Math.max(0, scrolled)))

      // Scroll depth tracking for GA4
      if (typeof window.gtag !== 'undefined') {
        if (scrolled >= 90 && !window.scrollDepth90) {
          window.scrollDepth90 = true
          window.gtag('event', 'scroll_depth', { depth: 90 })
        } else if (scrolled >= 75 && !window.scrollDepth75) {
          window.scrollDepth75 = true
          window.gtag('event', 'scroll_depth', { depth: 75 })
        } else if (scrolled >= 50 && !window.scrollDepth50) {
          window.scrollDepth50 = true
          window.gtag('event', 'scroll_depth', { depth: 50 })
        } else if (scrolled >= 25 && !window.scrollDepth25) {
          window.scrollDepth25 = true
          window.gtag('event', 'scroll_depth', { depth: 25 })
        }
      }
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-800">
      <div
        className="h-full bg-gradient-to-r from-[#F4B860] to-[#D99B3C] transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
