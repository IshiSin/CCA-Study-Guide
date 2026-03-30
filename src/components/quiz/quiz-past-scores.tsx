'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { getProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import type { QuizAttempt } from '@/lib/types'

export function QuizPastScores() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    const progress = getProgress()
    // Show last 6 attempts, newest first
    setAttempts([...progress.quizAttempts].reverse().slice(0, 6))
  }, [])

  if (attempts.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 font-mono">{`// Recent Scores`}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attempts.map((attempt) => {
          const percent = Math.round((attempt.score / attempt.total) * 100)
          const passed = percent >= 70
          const label = attempt.domainId === 'exam'
            ? 'Mock Exam'
            : `Domain ${attempt.domainId} Quiz`
          const date = new Date(attempt.completedAt).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric',
          })

          return (
            <div
              key={attempt.id}
              className={cn(
                'rounded-lg border p-4 space-y-2',
                passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-foreground">{label}</span>
                {passed
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  : <XCircle className="h-4 w-4 text-red-400" />
                }
              </div>
              <p className={cn('text-2xl font-bold font-mono', passed ? 'text-emerald-400' : 'text-red-400')}>
                {percent}%
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{attempt.score}/{attempt.total} correct</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />{date}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground font-mono">
        <Link href="/progress" className="text-primary hover:underline">
          View full progress dashboard →
        </Link>
      </p>
    </div>
  )
}
