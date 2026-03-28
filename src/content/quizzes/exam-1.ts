/**
 * Mock Exam 1 — 60 questions weighted by domain
 * D1 (27%): 15q  D2 (18%): 11q  D3 (20%): 12q  D4 (20%): 12q  D5 (15%): 10q
 */
import { domain1Questions } from './domain-1'
import { domain2Questions } from './domain-2'
import { domain3Questions } from './domain-3'
import { domain4Questions } from './domain-4'
import { domain5Questions } from './domain-5'
import type { QuizQuestion } from '@/lib/types'

export const exam1Questions: QuizQuestion[] = [
  // Domain 1 — 15 questions (27%)
  ...domain1Questions,
  // Domain 2 — 11 questions (18%) — drop last one for weighting
  ...domain2Questions.slice(0, 11),
  // Domain 3 — 12 questions (20%)
  ...domain3Questions,
  // Domain 4 — 12 questions (20%)
  ...domain4Questions,
  // Domain 5 — 10 questions (15%)
  ...domain5Questions,
]
