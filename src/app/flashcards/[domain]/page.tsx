import { domains } from "@/content/domains"
import { flashcards as d1 } from "@/content/flashcards/domain-1"
import { flashcards as d2 } from "@/content/flashcards/domain-2"
import { flashcards as d3 } from "@/content/flashcards/domain-3"
import { flashcards as d4 } from "@/content/flashcards/domain-4"
import { flashcards as d5 } from "@/content/flashcards/domain-5"
import { domainColorMap } from "@/content/domains"
import type { Flashcard } from "@/lib/types"
import { DomainFlashcardsClient } from "./client"

const cardsByDomain: Record<string, Flashcard[]> = {
  "domain-1": d1,
  "domain-2": d2,
  "domain-3": d3,
  "domain-4": d4,
  "domain-5": d5,
}

interface Props {
  params: Promise<{ domain: string }>
}

export default async function DomainFlashcardsPage({ params }: Props) {
  const { domain: domainSlug } = await params
  const domain = domains.find(d => d.slug === domainSlug)
  const cards = cardsByDomain[domainSlug] ?? []
  const colors = domain ? domainColorMap[domain.color] : null

  return (
    <DomainFlashcardsClient
      domain={domain ?? null}
      cards={cards}
      colors={colors}
    />
  )
}

export function generateStaticParams() {
  return ["domain-1", "domain-2", "domain-3", "domain-4", "domain-5"].map(
    domain => ({ domain })
  )
}
