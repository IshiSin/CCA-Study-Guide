"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import type { Flashcard } from "@/lib/types"
import type { ConfidenceLevel } from "@/lib/types"
import { Flashcard as FlashcardCard } from "./flashcard"
import { ConfidenceButtons } from "./confidence-buttons"
import { DeckStats } from "./deck-stats"
import {
  applyConfidence,
  getDeckStats,
  getSessionCards,
  type DeckStats as DeckStatsType,
} from "@/lib/flashcard-engine"

interface DeckViewerProps {
  cards: Flashcard[]
}

export function DeckViewer({ cards }: DeckViewerProps) {
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [stats, setStats] = useState<DeckStatsType | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const session = getSessionCards(cards, 20)
    setSessionCards(session)
    setStats(getDeckStats(cards))
    if (session.length === 0) setDone(true)
  }, [cards])

  const refreshStats = useCallback(() => {
    setStats(getDeckStats(cards))
  }, [cards])

  const handleFlip = useCallback(() => {
    setIsFlipped(f => !f)
  }, [])

  const handleRate = useCallback(
    (level: ConfidenceLevel) => {
      const card = sessionCards[currentIndex]
      if (!card) return
      applyConfidence(card.id, level)
      refreshStats()

      const next = currentIndex + 1
      if (next >= sessionCards.length) {
        setDone(true)
      } else {
        setCurrentIndex(next)
        setIsFlipped(false)
      }
    },
    [sessionCards, currentIndex, refreshStats]
  )

  if (!stats) return null

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <CheckCircle className="h-12 w-12 text-emerald-400" />
        <h2 className="text-xl font-semibold">Session complete</h2>
        <p className="text-sm text-muted-foreground font-mono">
          {stats.mastered} mastered · {stats.learning} learning · {stats.due} due
        </p>
        <Link
          href="/flashcards"
          className="mt-4 text-sm text-primary font-mono hover:underline"
        >
          ← Back to all decks
        </Link>
      </div>
    )
  }

  const card = sessionCards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <DeckStats
        stats={stats}
        current={currentIndex + 1}
        total={sessionCards.length}
      />

      <FlashcardCard
        front={card.front}
        back={card.back}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        tags={card.tags}
      />

      {/* Progress bar */}
      <div className="h-0.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/60 transition-all duration-500"
          style={{
            width: `${(currentIndex / sessionCards.length) * 100}%`,
          }}
        />
      </div>

      {/* Confidence buttons — only after flipping */}
      <div
        className={`transition-all duration-200 ${
          isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <ConfidenceButtons onRate={handleRate} />
      </div>

      {!isFlipped && (
        <p className="text-center text-xs text-muted-foreground font-mono">
          Flip to reveal, then rate your confidence
        </p>
      )}
    </div>
  )
}
