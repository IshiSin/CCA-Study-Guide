import type { DeckStats as DeckStatsType } from "@/lib/flashcard-engine"

interface DeckStatsProps {
  stats: DeckStatsType
  current: number
  total: number
}

export function DeckStats({ stats, current, total }: DeckStatsProps) {
  return (
    <div className="flex items-center justify-between text-xs font-mono">
      <div className="flex gap-4 text-muted-foreground">
        <span className="text-red-400">
          <span className="opacity-60">due </span>{stats.due}
        </span>
        <span className="text-sky-400">
          <span className="opacity-60">new </span>{stats.new}
        </span>
        <span className="text-yellow-400">
          <span className="opacity-60">learning </span>{stats.learning}
        </span>
        <span className="text-emerald-400">
          <span className="opacity-60">mastered </span>{stats.mastered}
        </span>
      </div>
      <span className="text-muted-foreground">
        {current} <span className="opacity-40">/</span> {total}
      </span>
    </div>
  )
}
