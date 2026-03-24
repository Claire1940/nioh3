'use client'

import { useEffect, useState } from 'react'
import { NativeBanner } from './NativeBanner'

interface NativeBannerWrapperProps {
  className?: string
  adKey?: string
}

export function NativeBannerWrapper({ className, adKey }: NativeBannerWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="my-8 h-24 bg-gray-800/30 rounded-lg animate-pulse" />
  }

  return <NativeBanner className={className} adKey={adKey} />
}
