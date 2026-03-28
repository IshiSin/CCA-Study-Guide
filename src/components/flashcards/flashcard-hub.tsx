"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Brain } from "lucide-react"
import type { Domain } from "@/lib/types"
import type { Flashcard } from "@/lib/types"
import { getDeckStats, getMasteryPercent } from "@/lib/flashcard-engine"
import { domainColorMap } from "@/content/domains"

interface FlashcardHubProps {
  domains: Domain[]
  allCards: Record<number, Flashcard[]>
}

interface DomainCardInfo {
  domain: Domain
  due: number
  new: number
  mastery: number
  total: number
}

export function FlashcardHub({ domains, allCards }: FlashcardHubProps) {
  const [domainInfo, setDomainInfo] = useState<DomainCardInfo[]>([])

  useEffect(() => {
    const info = domains.map(domain => {
      const cards = allCards[domain.id] ?? []
      const stats = getDeckStats(cards)
      return {
        domain,
        due: stats.due,
        new: stats.new,
        mastery: getMasteryPercent(cards),
        total: cards.length,
      }
    })
    setDomainInfo(info)
  }, [domains, allCards])

  const totalDue = domainInfo.reduce((s, d) => s + d.due, 0)
  const totalCards = domainInfo.reduce((s, d) => s + d.total, 0)
  const overallMastery =
    domainInfo.length > 0
      ? Math.round(domainInfo.reduce((s, d) => s + d.mastery, 0) / domainInfo.length)
      : 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Flashcards</h1>
        <p className="text-muted-foreground text-sm">
          SM-2 spaced repetition · {totalCards} cards across 5 domains
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex gap-6 mb-8 p-4 rounded-lg border border-border bg-card text-sm font-mono">
        <div>
          <span className="text-red-400 font-semibold">{totalDue}</span>
          <span className="text-muted-foreground ml-1.5">due today</span>
        </div>
        <div className="text-border">|</div>
        <div>
          <span className="text-emerald-400 font-semibold">{overallMastery}%</span>
          <span className="text-muted-foreground ml-1.5">overall mastery</span>
        </div>
      </div>

      <div className="grid gap-4">
        {domainInfo.map(({ domain, due, new: newCount, mastery, total }) => {
          const colors = domainColorMap[domain.color]
          const sessionCount = due + newCount

          return (
            <Link
              key={domain.id}
              href={`/flashcards/${domain.slug}`}
              className="group block"
            >
              <div className="rounded-lg border border-border bg-card hover:border-primary/50 transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-sm ${colors.badge}`}>
                        Domain {domain.id}
                      </span>
                      {due > 0 && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-red-500/15 text-red-400">
                          {due} due
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {domain.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {total} cards · {newCount} new · {mastery}% mastered
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-colors ${
                        sessionCount > 0
                          ? "bg-primary/10 text-primary group-hover:bg-primary/20"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      <Brain className="h-3.5 w-3.5" />
                      {sessionCount > 0 ? `Study ${sessionCount}` : "All caught up"}
                    </div>
                  </div>
                </div>

                {/* Mastery bar */}
                <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/60 transition-all duration-500"
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
