import type { UserProgress, QuizAttempt, FlashcardProgress } from './types'

const STORAGE_KEY = 'cca-study-progress'

const defaultProgress: UserProgress = {
  topicProgress: {},
  quizAttempts: [],
  flashcardProgress: {},
  studyStreak: {
    current: 0,
    longest: 0,
    lastStudyDate: '',
  },
  lastUpdated: new Date().toISOString(),
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultProgress
    return { ...defaultProgress, ...JSON.parse(stored) }
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  try {
    progress.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

export function markTopicComplete(slug: string): void {
  const progress = getProgress()
  progress.topicProgress[slug] = {
    slug,
    completed: true,
    completedAt: new Date().toISOString(),
  }
  updateStreak(progress)
  saveProgress(progress)
}

export function recordQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): QuizAttempt {
  const progress = getProgress()
  const full: QuizAttempt = {
    ...attempt,
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString(),
  }
  progress.quizAttempts.push(full)
  updateStreak(progress)
  saveProgress(progress)
  return full
}

export function updateFlashcardProgress(cardProgress: FlashcardProgress): void {
  const progress = getProgress()
  progress.flashcardProgress[cardProgress.cardId] = cardProgress
  updateStreak(progress)
  saveProgress(progress)
}

export function getTopicCompletionRate(domainSlug: string, topicSlugs: string[]): number {
  const progress = getProgress()
  if (topicSlugs.length === 0) return 0
  const completed = topicSlugs.filter(slug =>
    progress.topicProgress[`${domainSlug}/${slug}`]?.completed
  ).length
  return Math.round((completed / topicSlugs.length) * 100)
}

export function getAverageQuizScore(domainId?: number | 'exam'): number {
  const progress = getProgress()
  const attempts = domainId !== undefined
    ? progress.quizAttempts.filter(a => a.domainId === domainId)
    : progress.quizAttempts
  if (attempts.length === 0) return 0
  const total = attempts.reduce((sum, a) => sum + a.score, 0)
  return Math.round(total / attempts.length)
}

function updateStreak(progress: UserProgress): void {
  const today = new Date().toISOString().split('T')[0]
  const lastDate = progress.studyStreak.lastStudyDate

  if (lastDate === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastDate === yesterdayStr) {
    progress.studyStreak.current += 1
  } else {
    progress.studyStreak.current = 1
  }

  if (progress.studyStreak.current > progress.studyStreak.longest) {
    progress.studyStreak.longest = progress.studyStreak.current
  }

  progress.studyStreak.lastStudyDate = today
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
