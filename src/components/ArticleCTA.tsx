'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Fireworks } from './Fireworks'

export function ArticleCTA() {
  const t = useTranslations('articleCTA')

  return (
    <div className="mt-12 bg-gradient-to-br from-[#F4B860]/10 via-[#D99B3C]/10 to-[#1C162D]/50 rounded-xl p-8 border border-[#F4B860]/30">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#F4B860]/20 px-4 py-2 rounded-full mb-4">
          <span className="text-2xl">🏠</span>
          <span className="text-[#F4B860] font-semibold text-sm">{t('badge')}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">
          {t('title')}
        </h3>
        <p className="text-gray-300 mb-6">
          {t('description')}
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-[#F4B860] hover:bg-[#D99B3C] text-black font-bold rounded-lg transition-colors text-lg"
          >
            🏠 {t('button')}
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          {t('footer')}
        </p>
      </div>
    </div>
  )
}

export function FloatingCTA() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, moved: 0 })
  const linkRef = useRef<HTMLAnchorElement>(null)

  // Load position from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('floating-cta-position')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPosition(parsed)
      } catch (e) {
        // Invalid saved position, use default
      }
    }
  }, [])

  // Save position to localStorage
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    localStorage.setItem('floating-cta-position', JSON.stringify(pos))
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
      moved: 0
    }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    dragStartRef.current.moved = Math.abs(dx) + Math.abs(dy)

    // Calculate new position with boundary constraints
    const newX = dragStartRef.current.startX + dx
    const newY = dragStartRef.current.startY + dy

    // Get window dimensions for boundary check
    const maxX = window.innerWidth - 200 // button width ~200px
    const maxY = window.innerHeight - 200 // button height ~200px
    const minX = -100
    const minY = -100

    setPosition({
      x: Math.max(minX, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY))
    })
  }, [isDragging])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (dragStartRef.current.moved > 5) {
      // Was dragging, save position
      savePosition(position)
      e.preventDefault()
      e.stopPropagation()
    }
    setIsDragging(false)
  }, [position, savePosition])

  const handleClick = (e: React.MouseEvent) => {
    if (dragStartRef.current.moved > 5) {
      // Was dragging, prevent click
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // Prevent default navigation
    e.preventDefault()

    // Show celebration and fireworks
    setShowCelebration(true)
    setShowFireworks(true)
    setIsNavigating(true)

    // Track click event
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'floating_cta_click', {
        location: 'article_sidebar'
      })
    }

    // Navigate after 1 second
    setTimeout(() => {
      if (linkRef.current) {
        window.location.href = linkRef.current.href
      }
    }, 1000)

    // Hide celebration card after 900ms (before navigation)
    setTimeout(() => setShowCelebration(false), 900)
  }

  // Add/remove global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <>
      <div
        className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) translateY(-50%)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onMouseDown={handleMouseDown}
      >
        <Link
          ref={linkRef}
          href="/tools/code-finder"
          className={`flex flex-col items-center gap-2 bg-gradient-to-br from-[#F4B860] to-[#D99B3C] text-black px-6 py-4 rounded-lg shadow-2xl hover:shadow-[#F4B860]/50 transition-all ${
            isDragging ? 'scale-105 shadow-[#F4B860]/70' : 'hover:scale-105'
          }`}
          onClick={handleClick}
          draggable={false}
        >
          <span className="text-3xl">🎁</span>
          <span className="font-bold text-sm text-center leading-tight">
            Code<br />Finder
          </span>
        </Link>
      </div>

      {/* Fireworks Effect */}
      {showFireworks && (
        <Fireworks onComplete={() => setShowFireworks(false)} duration={1500} />
      )}

      {/* Celebration Message */}
      {showCelebration && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-2xl px-8 py-6 border-4 border-white shadow-2xl min-w-[320px]">
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl animate-spin">🎉</span>
              <div className="text-center">
                <p className="text-xl font-bold text-white mb-1">Great Choice!</p>
                <p className="text-sm text-white">Master Nioh 3 Strategy ⚔️</p>
              </div>
              <span className="text-4xl animate-pulse">🎁</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
