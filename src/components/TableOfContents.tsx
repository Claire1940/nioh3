'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    const extractHeadings = () => {
      const article = document.querySelector('article')
      if (!article) {
        // DOM not ready, retry after 100ms
        setTimeout(extractHeadings, 100)
        return
      }

      const headingElements = article.querySelectorAll('h2, h3')
      if (headingElements.length === 0) {
        // Headings not rendered yet, retry after 100ms
        setTimeout(extractHeadings, 100)
        return
      }

      // Extract headings data
      const headingData: Heading[] = []
      headingElements.forEach((heading, index) => {
        // Clean text: remove ** markdown syntax and trim
        const rawText = heading.textContent || ''
        const text = rawText.replace(/\*\*/g, '').trim()
        const level = parseInt(heading.tagName[1])

        // Create ID from text if it doesn't exist
        if (!heading.id) {
          heading.id = `heading-${index}`
        }

        headingData.push({
          id: heading.id,
          text,
          level
        })
      })

      setHeadings(headingData)

      // Clean up old observer
      if (observer) {
        observer.disconnect()
      }

      // Create new Intersection Observer
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        { rootMargin: '-80px 0px -80% 0px' }
      )

      // Observe all headings
      headingElements.forEach((heading) => {
        observer?.observe(heading)
      })
    }

    // Reset state when route changes
    setHeadings([])
    setActiveId('')
    extractHeadings()

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }
  }, [pathname])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 hidden lg:block ml-auto">
      <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
        <h4 className="text-sm font-semibold text-[#F4B860] mb-4 uppercase tracking-wide">
          On This Page
        </h4>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 3 ? 'ml-4' : ''}
            >
              <a
                href={`#${heading.id}`}
                className={`block text-sm transition-colors ${
                  activeId === heading.id
                    ? 'text-[#F4B860] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  })
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
