import { domains } from "@/content/domains"
import { flashcards as d1 } from "@/content/flashcards/domain-1"
import { flashcards as d2 } from "@/content/flashcards/domain-2"
import { flashcards as d3 } from "@/content/flashcards/domain-3"
import { flashcards as d4 } from "@/content/flashcards/domain-4"
import { flashcards as d5 } from "@/content/flashcards/domain-5"
import { FlashcardHub } from "@/components/flashcards/flashcard-hub"
import type { Flashcard } from "@/lib/types"

export const metadata = {
  title: "Flashcards — CCA Study Guide",
}

const allCards: Record<number, Flashcard[]> = {
  1: d1,
  2: d2,
  3: d3,
  4: d4,
  5: d5,
}

export default function FlashcardsPage() {
  return <FlashcardHub domains={domains} allCards={allCards} />
}
