'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface ExamTimerProps {
  totalSeconds: number // 7200 for 120 minutes
  onExpire: () => void
  paused?: boolean
}

export function ExamTimer({ totalSeconds, onExpire, paused = false }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (paused) return
    if (remaining <= 0) {
      onExpireRef.current()
      return
    }
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [paused, remaining])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isWarning = remaining <= 600 // 10 minutes

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold tabular-nums transition-colors',
      isWarning
        ? 'border-red-500/40 bg-red-500/10 text-red-400'
        : 'border-border bg-muted/20 text-foreground'
    )}>
      <Clock className={cn('h-4 w-4 flex-shrink-0', isWarning ? 'text-red-400' : 'text-muted-foreground')} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isWarning && (
        <span className="text-xs font-sans font-normal text-red-400/80 ml-1">
          Time running out!
        </span>
      )}
    </div>
  )
}
