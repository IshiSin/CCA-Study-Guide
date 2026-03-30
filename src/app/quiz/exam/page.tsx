'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExamQuizClient } from '@/components/quiz/exam-quiz-client'
import { exam1Questions } from '@/content/quizzes/exam-1'
import { exam2Questions } from '@/content/quizzes/exam-2'

export default function ExamPage() {
  const [selectedExam, setSelectedExam] = useState<1 | 2 | null>(null)

  if (selectedExam === 1) {
    return <ExamQuizClient questions={exam1Questions} examId={1} />
  }
  if (selectedExam === 2) {
    return <ExamQuizClient questions={exam2Questions} examId={2} />
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/quiz" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ChevronLeft className="h-3 w-3" /> Back to Quizzes
        </Link>
        <h1 className="text-3xl font-bold mb-2">Full Mock Exam</h1>
        <p className="text-muted-foreground text-sm">
          60 questions · 120 minutes · All domains · 70% passing
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            id: 1 as const,
            title: 'Mock Exam 1',
            description: 'Domain questions weighted by exam percentages. Best starting point.',
            domains: 'D1: 15q · D2: 11q · D3: 12q · D4: 12q · D5: 10q',
          },
          {
            id: 2 as const,
            title: 'Mock Exam 2',
            description: 'Fresh set of 60 questions — different from Exam 1. No question overlap.',
            domains: 'D1: 16q · D2: 11q · D3: 12q · D4: 12q · D5: 9q',
          },
        ].map((exam) => (
          <button
            key={exam.id}
            onClick={() => setSelectedExam(exam.id)}
            className="group text-left rounded-xl border border-border bg-muted/5 p-6 space-y-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div>
              <p className="font-mono font-bold group-hover:text-primary transition-colors">
                {exam.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {exam.description}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { value: '60', label: 'Questions' },
                { value: '120', label: 'Minutes' },
                { value: '70%', label: 'Pass' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-md bg-muted/20 p-2">
                  <p className="text-sm font-bold font-mono text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-mono">{exam.domains}</p>
            <Button size="sm" className="w-full mt-1 font-mono">
              Start {exam.title}
            </Button>
          </button>
        ))}
      </div>
    </div>
  )
}
