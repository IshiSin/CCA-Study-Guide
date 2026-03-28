'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ExternalLink, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { QuizQuestion, QuizOption } from '@/lib/types'

const OPTION_KEYS: QuizOption[] = ['A', 'B', 'C', 'D']

interface ExplanationPanelProps {
  question: QuizQuestion
  selectedAnswer: QuizOption
  onNext?: () => void
  isLast: boolean
  mode: 'domain' | 'exam'
}

export function ExplanationPanel({
  question,
  selectedAnswer,
  onNext,
  isLast,
  mode,
}: ExplanationPanelProps) {
  const isCorrect = selectedAnswer === question.correct

  return (
    <div className={cn(
      'rounded-lg border-2 overflow-hidden',
      isCorrect ? 'border-emerald-500/40' : 'border-red-500/40'
    )}>
      {/* Result banner */}
      <div className={cn(
        'flex items-center gap-3 px-5 py-4',
        isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'
      )}>
        {isCorrect
          ? <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        }
        <div>
          <p className={cn('font-semibold text-sm', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          {!isCorrect && (
            <p className="text-xs text-muted-foreground mt-0.5">
              The correct answer is <span className="font-semibold text-emerald-400">
                {question.correct}: {question.options[question.correct]}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Explanation body */}
      <div className="p-5 space-y-5 bg-muted/5">
        {/* Why correct is correct */}
        <div>
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">
            Why {question.correct} is correct
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.explanation.correct}
          </p>
        </div>

        {/* Per-option breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            All options explained
          </h4>
          <div className="space-y-2">
            {OPTION_KEYS.map((key) => {
              const isThisCorrect = key === question.correct
              const isSelected = key === selectedAnswer
              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-md p-3 text-sm',
                    isThisCorrect
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : isSelected
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-muted/20 border border-border'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      'font-bold text-xs mt-0.5 flex-shrink-0',
                      isThisCorrect ? 'text-emerald-400' : isSelected ? 'text-red-400' : 'text-muted-foreground'
                    )}>
                      {key}{isThisCorrect ? ' ✓' : isSelected ? ' ✗' : ''}
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {question.explanation[key]}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Related topic link */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href={question.relatedTopic}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Study related topic
          </Link>

          {mode === 'domain' && onNext && (
            <Button size="sm" onClick={onNext}>
              {isLast ? 'See Results' : (
                <span className="flex items-center gap-1.5">
                  Next Question <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
