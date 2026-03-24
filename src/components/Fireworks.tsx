'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
}

interface FireworksProps {
  onComplete?: () => void
  duration?: number
}

export function Fireworks({ onComplete, duration = 3000 }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const colors = ['#F4B860', '#D99B3C', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D']

    // Create firework explosion
    const createFirework = (x: number, y: number) => {
      const particleCount = 50 + Math.random() * 50
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const velocity = 2 + Math.random() * 6
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3
        })
      }
    }

    // Launch multiple fireworks
    const launchFireworks = () => {
      const count = 3 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const x = window.innerWidth * (0.2 + Math.random() * 0.6)
          const y = window.innerHeight * (0.2 + Math.random() * 0.4)
          createFirework(x, y)
        }, i * 200)
      }
    }

    // Initial fireworks
    launchFireworks()

    // More fireworks after delay
    const timer1 = setTimeout(() => launchFireworks(), 800)
    const timer2 = setTimeout(() => launchFireworks(), 1600)

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Apply gravity
        p.vy += 0.1

        // Air resistance
        p.vx *= 0.99
        p.vy *= 0.99

        // Fade out
        p.alpha -= 0.01

        // Remove dead particles
        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        // Draw particle
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = 15
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Continue animation if within duration
      if (Date.now() - startTimeRef.current < duration) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onComplete?.()
      }
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', handleResize)
    }
  }, [onComplete, duration])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ background: 'transparent' }}
    />
  )
}
