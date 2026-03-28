"use client"

import type { ConfidenceLevel } from "@/lib/types"

interface ConfidenceButtonsProps {
  onRate: (level: ConfidenceLevel) => void
}

const buttons: {
  level: ConfidenceLevel
  label: string
  sublabel: string
  className: string
}[] = [
  {
    level: "again",
    label: "Again",
    sublabel: "1 day",
    className:
      "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70",
  },
  {
    level: "hard",
    label: "Hard",
    sublabel: "~3 days",
    className:
      "border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/70",
  },
  {
    level: "good",
    label: "Good",
    sublabel: "~7 days",
    className:
      "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70",
  },
  {
    level: "easy",
    label: "Easy",
    sublabel: "~14 days",
    className:
      "border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/70",
  },
]

export function ConfidenceButtons({ onRate }: ConfidenceButtonsProps) {
  return (
    <div className="flex gap-3 justify-center">
      {buttons.map(({ level, label, sublabel, className }) => (
        <button
          key={level}
          onClick={() => onRate(level)}
          className={`flex flex-col items-center px-5 py-3 rounded-sm border font-mono text-sm transition-all ${className}`}
        >
          <span className="font-semibold">{label}</span>
          <span className="text-xs opacity-60 mt-0.5">{sublabel}</span>
        </button>
      ))}
    </div>
  )
}
