"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { labs } from "@/content/labs"
import { getCompletedLabIds } from "@/lib/progress"
import { Badge } from "@/components/ui/badge"
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  ChevronRight,
  Terminal,
  KeyRound,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
}

const SETUP_STEPS = [
  { icon: Terminal, label: "Clone the repo and open a terminal in the project root" },
  { icon: Package, label: "Run: cd local && pip install -r requirements.txt" },
  { icon: KeyRound, label: "Set your API key: export ANTHROPIC_API_KEY=sk-..." },
]

export default function LabsPage() {
  const [completedIds, setCompletedIds] = useState<string[]>([])

  useEffect(() => {
    setCompletedIds(getCompletedLabIds())
  }, [])

  const completedCount = labs.filter((l) => completedIds.includes(l.id)).length

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Hands-on Labs</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Practical coding exercises that run locally. Each lab pairs directly with an exam domain
          — read the study topic first, then implement it here.
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedCount / labs.length) * 100}%` }}
            />
          </div>
          <span className="text-[12px] font-mono text-muted-foreground shrink-0">
            {completedCount} / {labs.length} complete
          </span>
        </div>
      </div>

      {/* Setup instructions */}
      <div className="rounded-xl border border-border/60 bg-card/30 p-5 mb-8">
        <h2 className="text-sm font-semibold mb-4">Local Setup</h2>
        <div className="space-y-3">
          {SETUP_STEPS.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-primary/15 shrink-0">
                <span className="text-[10px] font-mono font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground font-mono">{label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-[12px] text-muted-foreground">
            Full instructions in{" "}
            <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-[11px]">
              local/README.md
            </code>
            . Run tests with{" "}
            <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-[11px]">
              ./local/run-tests.sh
            </code>
          </p>
        </div>
      </div>

      {/* Lab list */}
      <div className="space-y-3">
        {labs.map((lab) => {
          const done = completedIds.includes(lab.id)
          return (
            <Link
              key={lab.id}
              href={`/labs/${lab.id}`}
              className={cn(
                "group flex items-center gap-4 rounded-xl border p-4 transition-all",
                done
                  ? "border-primary/20 bg-primary/5"
                  : "border-border/60 bg-card/20 hover:border-primary/30 hover:bg-card/40"
              )}
            >
              {/* Status icon */}
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full shrink-0",
                  done ? "bg-primary/20" : "bg-muted/30"
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-muted-foreground/60">{lab.id}</span>
                  {lab.domains.map((d) => (
                    <Badge key={d} variant="secondary" className="text-[10px] py-0">
                      D{d}
                    </Badge>
                  ))}
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full border font-mono",
                      DIFFICULTY_COLORS[lab.difficulty]
                    )}
                  >
                    {lab.difficulty}
                  </span>
                </div>
                <p className="font-medium text-sm">{lab.title}</p>
                <p className="text-[12px] text-muted-foreground truncate">{lab.description}</p>
              </div>

              {/* Time + arrow */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lab.estimatedMinutes}m
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
