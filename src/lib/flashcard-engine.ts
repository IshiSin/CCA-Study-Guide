import type { Flashcard, ConfidenceLevel } from './types'

const STORAGE_KEY = 'cca-flashcard-states'

export interface CardState {
  cardId: string
  easeFactor: number    // 1.3–3.0, default 2.5
  interval: number      // days until next review
  repetitions: number   // consecutive non-again reviews
  nextReview: string    // YYYY-MM-DD
  lastConfidence: ConfidenceLevel | null
}

const DEFAULT_EASE = 2.5
const MIN_EASE = 1.3
const MAX_EASE = 3.0

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + Math.max(1, Math.round(days)))
  return d.toISOString().split('T')[0]
}

export function getAllStates(): Record<string, CardState> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveStates(states: Record<string, CardState>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
  } catch (e) {
    console.error('Failed to save flashcard states:', e)
  }
}

export function getCardState(cardId: string): CardState | null {
  return getAllStates()[cardId] ?? null
}

export function applyConfidence(cardId: string, confidence: ConfidenceLevel): CardState {
  const states = getAllStates()
  const cur = states[cardId] ?? {
    cardId,
    easeFactor: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    nextReview: todayStr(),
    lastConfidence: null,
  }

  let { easeFactor, interval, repetitions } = cur

  switch (confidence) {
    case 'again':
      interval = 1
      repetitions = 0
      easeFactor = Math.max(MIN_EASE, easeFactor - 0.2)
      break

    case 'hard':
      interval = repetitions === 0 ? 1 : Math.max(1, Math.round(interval * 1.2))
      repetitions = Math.max(1, repetitions)
      easeFactor = Math.max(MIN_EASE, easeFactor - 0.15)
      break

    case 'good':
      if (repetitions === 0) interval = 1
      else if (repetitions === 1) interval = 6
      else interval = Math.round(interval * easeFactor)
      repetitions += 1
      break

    case 'easy':
      if (repetitions === 0) interval = 4
      else if (repetitions === 1) interval = 10
      else interval = Math.round(interval * easeFactor * 1.3)
      repetitions += 1
      easeFactor = Math.min(MAX_EASE, easeFactor + 0.15)
      break
  }

  const next: CardState = {
    cardId,
    easeFactor,
    interval,
    repetitions,
    nextReview: addDays(interval),
    lastConfidence: confidence,
  }

  states[cardId] = next
  saveStates(states)
  return next
}

export type CardCategory = 'due' | 'new' | 'learning' | 'mastered'

export function getCardCategory(cardId: string): CardCategory {
  const state = getCardState(cardId)
  if (!state) return 'new'
  if (state.interval >= 21) return 'mastered'
  if (state.nextReview <= todayStr()) return 'due'
  return 'learning'
}

export interface DeckStats {
  total: number
  due: number
  new: number
  learning: number
  mastered: number
}

export function getDeckStats(cards: Flashcard[]): DeckStats {
  const stats: DeckStats = { total: cards.length, due: 0, new: 0, learning: 0, mastered: 0 }
  for (const card of cards) {
    stats[getCardCategory(card.id)] += 1
  }
  return stats
}

export function getMasteryPercent(cards: Flashcard[]): number {
  if (cards.length === 0) return 0
  const mastered = cards.filter(c => getCardCategory(c.id) === 'mastered').length
  return Math.round((mastered / cards.length) * 100)
}

export function getSessionCards(cards: Flashcard[], limit = 20): Flashcard[] {
  const due: Flashcard[] = []
  const newCards: Flashcard[] = []
  for (const card of cards) {
    const cat = getCardCategory(card.id)
    if (cat === 'due') due.push(card)
    else if (cat === 'new') newCards.push(card)
  }
  return [...due, ...newCards].slice(0, limit)
}
