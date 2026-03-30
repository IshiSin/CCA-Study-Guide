'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, RotateCcw, BookOpen, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { domains, domainColorMap } from '@/content/domains'
import type { DomainScore, IncorrectEntry } from '@/lib/quiz-engine'

interface ScoreSummaryProps {
  score: number
  total: number
  percent: number
  passed: boolean
  domainScores: DomainScore[]
  incorrectQuestions: IncorrectEntry[]
  onRetry?: () => void
}

export function ScoreSummary({
  score,
  total,
  percent,
  passed,
  domainScores,
  incorrectQuestions,
  onRetry,
}: ScoreSummaryProps) {
  const showDomainBreakdown = domainScores.length > 1

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Score banner */}
      <div className={cn(
        'rounded-xl border-2 p-8 text-center',
        passed
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-red-500/40 bg-red-500/5'
      )}>
        <div className="flex justify-center mb-4">
          {passed
            ? <Trophy className="h-12 w-12 text-emerald-400" />
            : <XCircle className="h-12 w-12 text-red-400" />
          }
        </div>
        <p className={cn(
          'text-5xl font-bold font-mono mb-2',
          passed ? 'text-emerald-400' : 'text-red-400'
        )}>
          {percent}%
        </p>
        <p className="text-muted-foreground text-sm mb-3">
          {score} of {total} correct
        </p>
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
          passed
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        )}>
          {passed
            ? <><CheckCircle2 className="h-3.5 w-3.5" /> Passed — 70% threshold met</>
            : <><XCircle className="h-3.5 w-3.5" /> Not passed — 70% required</>
          }
        </div>
      </div>

      {/* Domain breakdown */}
      {showDomainBreakdown && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Domain Breakdown
          </h3>
          <div className="space-y-4">
            {domainScores.map(({ domain, correct, total: t, percent: p }) => {
              const domainMeta = domains.find(d => d.id === domain)
              const colors = domainMeta ? domainColorMap[domainMeta.color] : null
              return (
                <div key={domain} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-mono font-bold', colors?.text ?? 'text-foreground')}>
                        D{domain}
                      </span>
                      <span className="text-muted-foreground">
                        {domainMeta?.name ?? `Domain ${domain}`}
                      </span>
                    </div>
                    <span className={cn(
                      'font-mono font-semibold',
                      p >= 70 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {correct}/{t} ({p}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        p >= 70 ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  {domainMeta && (
                    <p className="text-xs text-muted-foreground/60 font-mono">
                      {domainMeta.weight}% of exam
                      {p < 70 && (
                        <Link
                          href={`/study/${domainMeta.slug}`}
                          className="ml-2 text-primary hover:underline"
                        >
                          → study this domain
                        </Link>
                      )}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Incorrect questions */}
      {incorrectQuestions.length > 0 && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            Review Needed ({incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''})
          </h3>
          <div className="space-y-3">
            {incorrectQuestions.map(({ question, answer, index }) => (
              <div
                key={question.id}
                className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-2"
              >
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="text-xs text-muted-foreground font-mono mr-2">Q{index + 1}</span>
                  {question.question.length > 120
                    ? question.question.slice(0, 120) + '…'
                    : question.question
                  }
                </p>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle className="h-3 w-3" />
                      You: {answer} — {question.options[answer]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-emerald-400 font-mono">
                      ✓ {question.correct}
                    </span>
                    <Link
                      href={question.relatedTopic}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <BookOpen className="h-3 w-3" />
                      Study
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All correct! */}
      {incorrectQuestions.length === 0 && score > 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-400 font-semibold text-sm">Perfect score!</p>
          <p className="text-muted-foreground text-xs mt-1">You answered every question correctly.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        )}
        <Button asChild>
          <Link href="/quiz">Back to Quizzes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/progress">View Progress</Link>
        </Button>
        {!passed && (
          <Button asChild variant="outline">
            <Link href="/study">Study Materials</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
