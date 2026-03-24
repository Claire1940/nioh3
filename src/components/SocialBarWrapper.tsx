'use client'

import { useEffect, useState } from 'react'
import { SocialBar } from './SocialBar'

interface SocialBarWrapperProps {
  className?: string
  adKey?: string
}

export function SocialBarWrapper({ className, adKey }: SocialBarWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="my-8 h-24 bg-gray-800/30 rounded-lg animate-pulse" />
  }

  return <SocialBar className={className} adKey={adKey} />
}
