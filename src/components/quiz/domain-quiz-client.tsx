'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuestionCard } from './question-card'
import { ExplanationPanel } from './explanation-panel'
import { ScoreSummary } from './score-summary'
import { useQuizEngine } from '@/lib/quiz-engine'
import { recordQuizAttempt } from '@/lib/progress'
import { domainColorMap } from '@/content/domains'
import type { QuizQuestion } from '@/lib/types'
import type { Domain } from '@/lib/types'

interface DomainQuizClientProps {
  questions: QuizQuestion[]
  domain: Domain
}

type Phase = 'start' | 'quiz' | 'results'

export function DomainQuizClient({ questions, domain }: DomainQuizClientProps) {
  const [phase, setPhase] = useState<Phase>('start')
  const [key, setKey] = useState(0) // increment to reset
  const savedRef = useRef(false)

  const colors = domainColorMap[domain.color]

  const engine = useQuizEngine(questions)
  const {
    currentIndex,
    answers,
    submittedSet,
    selectAnswer,
    submitCurrent,
    next,
    prev,
    results,
    answersForSave,
  } = engine

  const currentQuestion = questions[currentIndex]
  const isCurrentSubmitted = submittedSet.has(currentIndex)
  const selectedAnswer = answers[currentIndex] ?? null
  const isLast = currentIndex === questions.length - 1

  // Save result to localStorage when results phase starts (once)
  useEffect(() => {
    if (phase === 'results' && !savedRef.current) {
      savedRef.current = true
      recordQuizAttempt({
        domainId: domain.id,
        score: results.score,
        total: results.total,
        answers: answersForSave(),
      })
    }
  }, [phase, results, domain.id, answersForSave])

  function handleStart() {
    setPhase('quiz')
  }

  function handleNext() {
    if (isLast) {
      setPhase('results')
    } else {
      next()
    }
  }

  function handleRetry() {
    savedRef.current = false
    setKey(k => k + 1)
    setPhase('start')
  }

  if (phase === 'start') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/quiz" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ChevronLeft className="h-3 w-3" /> Back to Quizzes
          </Link>
          <Badge className={`${colors.badge} mb-3 font-mono`}>Domain {domain.id}</Badge>
          <h1 className="text-3xl font-bold mb-2">{domain.name}</h1>
          <p className="text-muted-foreground text-sm">{domain.description}</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/5 p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted/20 p-3">
              <p className="text-2xl font-bold font-mono text-primary">{questions.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Questions</p>
            </div>
            <div className="rounded-lg bg-muted/20 p-3">
              <p className="text-2xl font-bold font-mono text-primary">~{Math.ceil(questions.length * 1.5)} min</p>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated</p>
            </div>
            <div className="rounded-lg bg-muted/20 p-3">
              <p className="text-2xl font-bold font-mono text-primary">70%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pass mark</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              Scenario-based questions with 4 options
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              Detailed explanation shown after each answer
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              No timer — take your time
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              Results saved to your progress dashboard
            </li>
          </ul>

          <Button onClick={handleStart} className="w-full gap-2" size="lg">
            <Play className="h-4 w-4" />
            Start Quiz
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/quiz" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Back to Quizzes
          </Link>
          <h1 className="text-2xl font-bold mt-3 mb-1">Quiz Results</h1>
          <p className="text-muted-foreground text-sm font-mono">Domain {domain.id}: {domain.name}</p>
        </div>
        <ScoreSummary
          score={results.score}
          total={results.total}
          percent={results.percent}
          passed={results.passed}
          domainScores={results.domainScores}
          incorrectQuestions={results.incorrectQuestions}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  // quiz phase
  return (
    <div key={key} className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/quiz" className="hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Back
          </Link>
          <span className="font-mono">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onSelect={(answer) => selectAnswer(currentIndex, answer)}
        onSubmit={() => submitCurrent(currentIndex)}
        submitted={isCurrentSubmitted}
      />

      {isCurrentSubmitted && selectedAnswer && (
        <ExplanationPanel
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onNext={handleNext}
          isLast={isLast}
          mode="domain"
        />
      )}

      {/* Prev/Next nav (before submission) */}
      {!isCurrentSubmitted && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={prev}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={isLast}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
