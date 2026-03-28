"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DeckViewer } from "@/components/flashcards/deck-viewer"
import type { Flashcard, Domain } from "@/lib/types"

interface Props {
  domain: Domain | null
  cards: Flashcard[]
  colors: { badge: string } | null
}

export function DomainFlashcardsClient({ domain, cards, colors }: Props) {
  if (!domain || !colors) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Domain not found.</p>
        <Link href="/flashcards" className="text-primary text-sm mt-2 inline-block">
          ← Back
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/flashcards"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All decks
        </Link>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-sm ${colors.badge}`}>
          Domain {domain.id} · {domain.weight}% of exam
        </span>
        <h1 className="text-2xl font-bold mt-2">{domain.name}</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {cards.length} cards · SM-2 spaced repetition
        </p>
      </div>

      <DeckViewer cards={cards} />
    </div>
  )
}
