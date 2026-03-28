export type DomainId = 1 | 2 | 3 | 4 | 5
export type QuizOption = 'A' | 'B' | 'C' | 'D'

export interface Domain {
  id: DomainId
  slug: string
  name: string
  weight: number // percentage of exam
  description: string
  color: string // tailwind color class
  topics: TopicMeta[]
}

export interface TopicMeta {
  slug: string
  title: string
  estimatedMinutes: number
}

export interface Topic {
  slug: string
  title: string
  domainId: DomainId
  description: string
  content?: string // MDX content
}

export interface QuizQuestion {
  id: string
  domain: DomainId
  scenario: string // which of the 6 scenario contexts
  question: string
  options: { A: string; B: string; C: string; D: string }
  correct: QuizOption
  explanation: {
    correct: string // why the correct answer is right
    A: string
    B: string
    C: string
    D: string
  }
  relatedTopic: string // e.g. '/study/domain-1/agentic-loops'
}

export interface Flashcard {
  id: string
  domainId: DomainId
  front: string
  back: string
  tags?: string[]
}

export interface ScenarioStep {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  diagramUpdate?: string // Mermaid diagram for this step
}

export interface Scenario {
  slug: string
  title: string
  description: string
  context: string
  domains: DomainId[]
  steps: ScenarioStep[]
  architecture?: string // Mermaid diagram
}

export interface Lab {
  id: string
  title: string
  description: string
  domains: DomainId[]
  estimatedMinutes: number
  objectives: string[]
  prerequisites: string[]
  starterFile: string
  solutionFile: string
}

// Progress tracking
export interface TopicProgress {
  slug: string
  completed: boolean
  completedAt?: string // ISO date
}

export interface QuizAttempt {
  id: string
  domainId: DomainId | 'exam'
  score: number
  total: number
  completedAt: string
  answers: Record<string, QuizOption> // questionId -> 'A'|'B'|'C'|'D'
}

export interface FlashcardProgress {
  cardId: string
  confidence: ConfidenceLevel
  nextReview: string // ISO date
  reviewCount: number
  easeFactor: number // SM-2 ease factor
}

export type ConfidenceLevel = 'again' | 'hard' | 'good' | 'easy'

export interface UserProgress {
  topicProgress: Record<string, TopicProgress>
  quizAttempts: QuizAttempt[]
  flashcardProgress: Record<string, FlashcardProgress>
  studyStreak: {
    current: number
    longest: number
    lastStudyDate: string
  }
  lastUpdated: string
}
