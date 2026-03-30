import { useState, useCallback, useMemo } from 'react'
import type { QuizQuestion, QuizOption, DomainId } from './types'

export interface DomainScore {
  domain: DomainId
  correct: number
  total: number
  percent: number
}

export interface IncorrectEntry {
  question: QuizQuestion
  answer: QuizOption
  index: number
}

export interface QuizResults {
  score: number
  total: number
  percent: number
  passed: boolean
  domainScores: DomainScore[]
  incorrectQuestions: IncorrectEntry[]
  answeredCount: number
}

export function useQuizEngine(questions: QuizQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, QuizOption | null>>({})
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set())
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [examSubmitted, setExamSubmitted] = useState(false)

  const selectAnswer = useCallback((index: number, answer: QuizOption) => {
    setAnswers(prev => ({ ...prev, [index]: answer }))
  }, [])

  const submitCurrent = useCallback((index: number) => {
    setSubmittedSet(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  const submitExam = useCallback(() => {
    setExamSubmitted(true)
  }, [])

  const next = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))
  }, [questions.length])

  const prev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const jump = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const toggleFlag = useCallback((index: number) => {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const results = useMemo((): QuizResults => {
    let score = 0
    const domainMap = new Map<DomainId, { correct: number; total: number }>()
    const incorrectQuestions: IncorrectEntry[] = []

    questions.forEach((q, i) => {
      if (!domainMap.has(q.domain)) {
        domainMap.set(q.domain, { correct: 0, total: 0 })
      }
      const dm = domainMap.get(q.domain)!
      dm.total++

      const answer = answers[i]
      if (answer === q.correct) {
        score++
        dm.correct++
      } else if (answer) {
        incorrectQuestions.push({ question: q, answer, index: i })
      }
    })

    const total = questions.length
    const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined).length
    const percent = total > 0 ? Math.round((score / total) * 100) : 0

    const domainScores: DomainScore[] = Array.from(domainMap.entries())
      .map(([domain, { correct, total: t }]) => ({
        domain,
        correct,
        total: t,
        percent: t > 0 ? Math.round((correct / t) * 100) : 0,
      }))
      .sort((a, b) => a.domain - b.domain)

    return { score, total, percent, passed: percent >= 70, domainScores, incorrectQuestions, answeredCount }
  }, [questions, answers])

  // Convert answers to the format expected by recordQuizAttempt
  const answersForSave = useCallback((): Record<string, QuizOption> => {
    const out: Record<string, QuizOption> = {}
    questions.forEach((q, i) => {
      const a = answers[i]
      if (a) out[q.id] = a
    })
    return out
  }, [questions, answers])

  return {
    currentIndex,
    answers,
    flagged,
    examSubmitted,
    submittedSet,
    selectAnswer,
    submitCurrent,
    submitExam,
    next,
    prev,
    jump,
    toggleFlag,
    results,
    answersForSave,
  }
}
