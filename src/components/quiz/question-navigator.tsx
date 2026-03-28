'use client'

import { cn } from '@/lib/utils'
import { Flag } from 'lucide-react'
import type { QuizOption } from '@/lib/types'

interface QuestionNavigatorProps {
  totalQuestions: number
  currentIndex: number
  answers: Record<number, QuizOption | null>
  flagged: Set<number>
  onJump: (index: number) => void
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  onJump,
}: QuestionNavigatorProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Questions
        </h3>
        <span className="text-xs text-muted-foreground">
          {Object.values(answers).filter(a => a !== null).length}/{totalQuestions} answered
        </span>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isCurrent = i === currentIndex
          const isAnswered = answers[i] !== null && answers[i] !== undefined
          const isFlagged = flagged.has(i)

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              title={`Question ${i + 1}${isFlagged ? ' (flagged)' : ''}`}
              className={cn(
                'relative h-7 w-full rounded text-xs font-semibold transition-all',
                isCurrent
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background'
                  : isAnswered
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-muted/30 text-muted-foreground border border-border hover:bg-muted/50'
              )}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-background" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-primary/80 inline-block" />
          Current
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30 inline-block" />
          Answered
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-muted/30 border border-border inline-block" />
          Unanswered
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative w-3 h-3 inline-block">
            <span className="absolute inset-0 rounded-sm bg-muted/30 border border-border" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
          </span>
          Flagged
        </div>
      </div>
    </div>
  )
}
