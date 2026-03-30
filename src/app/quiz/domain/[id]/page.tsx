import { notFound } from 'next/navigation'
import { domains } from '@/content/domains'
import { domain1Questions } from '@/content/quizzes/domain-1'
import { domain2Questions } from '@/content/quizzes/domain-2'
import { domain3Questions } from '@/content/quizzes/domain-3'
import { domain4Questions } from '@/content/quizzes/domain-4'
import { domain5Questions } from '@/content/quizzes/domain-5'
import { DomainQuizClient } from '@/components/quiz/domain-quiz-client'
import type { QuizQuestion } from '@/lib/types'

const questionsByDomain: Record<number, QuizQuestion[]> = {
  1: domain1Questions,
  2: domain2Questions,
  3: domain3Questions,
  4: domain4Questions,
  5: domain5Questions,
}

interface Props {
  params: { id: string }
}

export default function DomainQuizPage({ params }: Props) {
  const domainId = parseInt(params.id)
  const domain = domains.find(d => d.id === domainId)
  const questions = questionsByDomain[domainId]

  if (!domain || !questions) {
    notFound()
  }

  return <DomainQuizClient questions={questions} domain={domain} />
}

export function generateStaticParams() {
  return [1, 2, 3, 4, 5].map(id => ({ id: String(id) }))
}
