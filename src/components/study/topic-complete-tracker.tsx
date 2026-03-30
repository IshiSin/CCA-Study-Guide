'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { markTopicComplete } from '@/lib/progress'

// Automatically marks the current topic as complete when the page is visited.
// Reads the path (/study/domain-1/agentic-loops) and derives the key (domain-1/agentic-loops).
export function TopicCompleteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const match = pathname.match(/^\/study\/(.+\/.+)$/)
    if (match) {
      markTopicComplete(match[1])
    }
  }, [pathname])

  return null
}
