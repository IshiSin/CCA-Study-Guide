'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Flag } from 'lucide-react'
import type { QuizQuestion, QuizOption } from '@/lib/types'

const OPTION_KEYS: QuizOption[] = ['A', 'B', 'C', 'D']

interface QuestionCardProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedAnswer: QuizOption | null
  onSelect: (answer: QuizOption) => void
  onSubmit: () => void
  submitted: boolean
  isFlagged?: boolean
  onFlag?: () => void
  showSubmitButton?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelect,
  onSubmit,
  submitted,
  isFlagged,
  onFlag,
  showSubmitButton = true,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Badge variant="outline" className="text-xs">
            Domain {question.domain}
          </Badge>
        </div>
        {onFlag && (
          <button
            onClick={onFlag}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors',
              isFlagged
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <Flag className="h-3 w-3" />
            {isFlagged ? 'Flagged' : 'Flag'}
          </button>
        )}
      </div>

      {/* Question text */}
      <div className="rounded-lg border border-border bg-muted/10 p-5">
        <p className="text-sm leading-relaxed text-foreground">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {OPTION_KEYS.map((key) => {
          const isSelected = selectedAnswer === key
          return (
            <button
              key={key}
              onClick={() => !submitted && onSelect(key)}
              disabled={submitted}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-all text-sm',
                'flex items-start gap-3',
                submitted
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5',
                isSelected && !submitted
                  ? 'border-primary bg-primary/10 text-foreground'
                  : !submitted
                  ? 'border-border bg-background'
                  : 'border-border bg-background opacity-60',
                isSelected && submitted && 'border-primary/50 opacity-100'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                  isSelected && !submitted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : submitted && isSelected
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-muted-foreground/40 text-muted-foreground'
                )}
              >
                {key}
              </span>
              <span className={cn('flex-1 leading-relaxed', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                {question.options[key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Submit button (domain mode only) */}
      {showSubmitButton && !submitted && (
        <Button
          onClick={onSubmit}
          disabled={!selectedAnswer}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  )
}
