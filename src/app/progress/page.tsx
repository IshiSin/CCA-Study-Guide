'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Flame, Trophy, CheckCircle2, XCircle, BookOpen, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProgress } from '@/lib/progress'
import { domains, domainColorMap } from '@/content/domains'
import { cn } from '@/lib/utils'
import type { UserProgress, QuizAttempt, DomainId } from '@/lib/types'

function computeDomainStats(attempts: QuizAttempt[]) {
  const map = new Map<DomainId | 'exam', { scores: number[]; attempts: number }>()

  for (const a of attempts) {
    const key = a.domainId
    if (!map.has(key)) map.set(key, { scores: [], attempts: 0 })
    const entry = map.get(key)!
    entry.scores.push(Math.round((a.score / a.total) * 100))
    entry.attempts++
  }

  return map
}

function avgScore(scores: number[]) {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  if (!progress) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-muted/30 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted/20 rounded animate-pulse" />
      </div>
    )
  }

  const { quizAttempts, studyStreak, topicProgress } = progress
  const domainStats = computeDomainStats(quizAttempts)

  const totalTopics = domains.reduce((sum, d) => sum + d.topics.length, 0)
  const completedTopics = Object.values(topicProgress).filter(t => t.completed).length
  const topicPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const allScores = quizAttempts.map(a => Math.round((a.score / a.total) * 100))
  const overallAvg = avgScore(allScores)

  const recentAttempts = [...quizAttempts].reverse().slice(0, 8)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground text-sm font-mono">
          {`// All data stored locally in your browser`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-muted/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <Flame className="h-4 w-4 text-orange-400" />
            Study Streak
          </div>
          <p className="text-3xl font-bold font-mono text-orange-400">
            {studyStreak.current}
          </p>
          <p className="text-xs text-muted-foreground">
            day{studyStreak.current !== 1 ? 's' : ''} · best: {studyStreak.longest}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <Brain className="h-4 w-4 text-primary" />
            Quizzes Taken
          </div>
          <p className="text-3xl font-bold font-mono text-primary">
            {quizAttempts.length}
          </p>
          <p className="text-xs text-muted-foreground">
            avg score: {overallAvg}%
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Topics Done
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-400">
            {completedTopics}
          </p>
          <p className="text-xs text-muted-foreground">
            of {totalTopics} topics ({topicPercent}%)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            Readiness
          </div>
          <p className={cn(
            'text-3xl font-bold font-mono',
            overallAvg >= 70 ? 'text-emerald-400' : overallAvg >= 50 ? 'text-amber-400' : 'text-red-400'
          )}>
            {quizAttempts.length === 0 ? '—' : `${overallAvg}%`}
          </p>
          <p className="text-xs text-muted-foreground">
            {quizAttempts.length === 0 ? 'take a quiz' : overallAvg >= 70 ? 'on track' : 'keep studying'}
          </p>
        </div>
      </div>

      {/* Domain quiz scores */}
      <div className="rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Quiz Scores by Domain
        </h2>
        <div className="space-y-5">
          {domains.map((domain) => {
            const stats = domainStats.get(domain.id)
            const avg = stats ? avgScore(stats.scores) : null
            const colors = domainColorMap[domain.color]
            const topicSlugs = domain.topics.map(t => t.slug)
            const completed = topicSlugs.filter(s =>
              topicProgress[`${domain.slug}/${s}`]?.completed
            ).length

            return (
              <div key={domain.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-mono font-bold', colors.text)}>
                      D{domain.id}
                    </span>
                    <span className="text-sm text-foreground">{domain.name}</span>
                    <Badge className={`${colors.badge} text-xs font-mono`}>
                      {domain.weight}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{completed}/{domain.topics.length} topics</span>
                    {avg !== null ? (
                      <span className={cn(
                        'font-mono font-semibold',
                        avg >= 70 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        avg {avg}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">no attempts</span>
                    )}
                  </div>
                </div>

                {avg !== null ? (
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        avg >= 70 ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-2 rounded-full bg-muted/20" />
                )}

                <div className="flex items-center gap-3 text-xs">
                  <Link
                    href={`/quiz/domain/${domain.id}`}
                    className="text-primary hover:underline font-mono"
                  >
                    Take quiz →
                  </Link>
                  <Link
                    href={`/study/${domain.slug}`}
                    className="text-muted-foreground hover:text-foreground font-mono flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    Study
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent attempts */}
      {recentAttempts.length > 0 && (
        <div className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Quiz History</h2>
          <div className="space-y-2">
            {recentAttempts.map((attempt) => {
              const percent = Math.round((attempt.score / attempt.total) * 100)
              const passed = percent >= 70
              const label = attempt.domainId === 'exam'
                ? 'Mock Exam'
                : `Domain ${attempt.domainId} Quiz`
              const date = new Date(attempt.completedAt).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {passed
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-mono font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-mono font-bold text-sm', passed ? 'text-emerald-400' : 'text-red-400')}>
                      {percent}%
                    </p>
                    <p className="text-xs text-muted-foreground">{attempt.score}/{attempt.total}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {quizAttempts.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-4">
          <Brain className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-semibold">No quiz attempts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Take a domain quiz or mock exam to start tracking your progress.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="sm">
              <Link href="/quiz">Start a Quiz</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/study">Study First</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
