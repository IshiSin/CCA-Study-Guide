'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Send, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestionCard } from './question-card'
import { ExplanationPanel } from './explanation-panel'
import { QuestionNavigator } from './question-navigator'
import { ExamTimer } from './exam-timer'
import { ScoreSummary } from './score-summary'
import { useQuizEngine } from '@/lib/quiz-engine'
import { recordQuizAttempt } from '@/lib/progress'
import type { QuizQuestion } from '@/lib/types'

interface ExamQuizClientProps {
  questions: QuizQuestion[]
  examId: 1 | 2
}

type Phase = 'start' | 'exam' | 'review' | 'results'

const EXAM_SECONDS = 7200 // 120 minutes

export function ExamQuizClient({ questions, examId }: ExamQuizClientProps) {
  const [phase, setPhase] = useState<Phase>('start')
  const [timerPaused, setTimerPaused] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [key, setKey] = useState(0)
  const savedRef = useRef(false)

  const engine = useQuizEngine(questions)
  const {
    currentIndex,
    answers,
    flagged,
    examSubmitted,
    selectAnswer,
    submitExam,
    jump,
    toggleFlag,
    results,
    answersForSave,
  } = engine

  const currentQuestion = questions[currentIndex]
  const selectedAnswer = answers[currentIndex] ?? null

  // Save to localStorage when exam is submitted (once)
  useEffect(() => {
    if (examSubmitted && !savedRef.current) {
      savedRef.current = true
      recordQuizAttempt({
        domainId: 'exam',
        score: results.score,
        total: results.total,
        answers: answersForSave(),
      })
    }
  }, [examSubmitted, results, answersForSave])

  function handleStart() {
    setPhase('exam')
  }

  function handleTimerExpire() {
    if (!examSubmitted) {
      submitExam()
      setPhase('review')
    }
  }

  function handleSubmitConfirm() {
    setShowSubmitDialog(false)
    setTimerPaused(true)
    submitExam()
    setPhase('review')
  }

  function handleRetry() {
    savedRef.current = false
    setKey(k => k + 1)
    setPhase('start')
  }

  // Answers map for navigator (Record<number, QuizOption | null>)
  const answersForNav = Object.fromEntries(
    Array.from({ length: questions.length }, (_, i) => [i, answers[i] ?? null])
  )

  if (phase === 'start') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/quiz" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ChevronLeft className="h-3 w-3" /> Back to Quizzes
          </Link>
          <h1 className="text-3xl font-bold mb-2">Mock Exam {examId}</h1>
          <p className="text-muted-foreground text-sm">Simulate the real CCA exam experience</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/5 p-6 space-y-6">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { value: '60', label: 'Questions' },
              { value: '120', label: 'Minutes' },
              { value: '70%', label: 'Pass mark' },
              { value: '5', label: 'Domains' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-lg bg-muted/20 p-3">
                <p className="text-xl font-bold font-mono text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              60 scenario-based questions weighted by domain
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              120-minute countdown timer — warning at 10 min
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              Navigate freely and flag questions for review
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">→</span>
              Explanations and score breakdown after submission
            </li>
          </ul>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Once you start the exam the timer begins and cannot be paused.</span>
          </div>

          <Button onClick={handleStart} className="w-full gap-2" size="lg">
            <Play className="h-4 w-4" />
            Begin Exam
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
          <h1 className="text-2xl font-bold mt-3 mb-1">Exam Results</h1>
          <p className="text-muted-foreground text-sm font-mono">Mock Exam {examId} — {questions.length} questions</p>
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

  // exam and review phases share the same layout
  const isReview = phase === 'review'

  return (
    <div key={key} className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/quiz" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Exit
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            {isReview ? 'Review Mode' : `Mock Exam ${examId}`}
          </span>
          {isReview && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
              Submitted — {results.score}/{results.total} ({results.percent}%)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isReview && (
            <ExamTimer
              totalSeconds={EXAM_SECONDS}
              onExpire={handleTimerExpire}
              paused={timerPaused}
            />
          )}
          {!isReview ? (
            <Button
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
              className="gap-1.5 font-mono"
            >
              <Send className="h-3.5 w-3.5" />
              Submit
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setPhase('results')}
              className="gap-1.5 font-mono"
            >
              See Score Summary
            </Button>
          )}
        </div>
      </div>

      {/* Submit confirmation */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="rounded-xl border border-border bg-card p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Submit Exam?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {results.answeredCount} of {questions.length} questions answered.
                  {results.answeredCount < questions.length && (
                    <span className="text-amber-400"> {questions.length - results.answeredCount} unanswered.</span>
                  )}
                  {' '}This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSubmitConfirm} size="sm" className="flex-1">
                Submit Exam
              </Button>
              <Button
                onClick={() => setShowSubmitDialog(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Keep Working
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-border overflow-y-auto p-4 space-y-4 hidden lg:block">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answersForNav}
            flagged={flagged}
            onJump={jump}
          />
          {isReview && (
            <div className="rounded-lg border border-border bg-muted/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</p>
              <p className="text-2xl font-bold font-mono text-primary">{results.percent}%</p>
              <p className="text-xs text-muted-foreground">{results.score}/{results.total} correct</p>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${results.passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${results.percent}%` }}
                />
              </div>
              <p className={`text-xs font-mono font-semibold ${results.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {results.passed ? '✓ Passed' : '✗ Not passed'}
              </p>
            </div>
          )}
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mobile navigator */}
          <div className="mb-4 lg:hidden">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentIndex={currentIndex}
              answers={answersForNav}
              flagged={flagged}
              onJump={jump}
            />
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              onSelect={(answer) => !isReview && selectAnswer(currentIndex, answer)}
              onSubmit={() => {}}
              submitted={isReview}
              isFlagged={flagged.has(currentIndex)}
              onFlag={isReview ? undefined : () => toggleFlag(currentIndex)}
              showSubmitButton={false}
            />

            {isReview && selectedAnswer && (
              <ExplanationPanel
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isLast={currentIndex === questions.length - 1}
                mode="exam"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => jump(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground font-mono">
                {currentIndex + 1} / {questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => jump(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === questions.length - 1}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
