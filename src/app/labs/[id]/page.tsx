"use client"

import { useParams, notFound } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { labs } from "@/content/labs"
import { markLabComplete, isLabComplete } from "@/lib/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Clock,
  BookOpen,
  Copy,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
}

function CodePanel({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-xl border border-border/60 bg-[#0d1117] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-card/30">
        <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-slate-300 max-h-[520px] overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function LabPage() {
  const params = useParams()
  const labId = params.id as string
  const lab = labs.find((l) => l.id === labId)

  const [tab, setTab] = useState<"starter" | "solution">("starter")
  const [showSolution, setShowSolution] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLabComplete(labId))
  }, [labId])

  if (!lab) return notFound()

  const handleMarkComplete = () => {
    markLabComplete(labId)
    setCompleted(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/labs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All Labs
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {lab.domains.map((d) => (
            <Badge key={d} variant="secondary" className="text-[11px]">
              Domain {d}
            </Badge>
          ))}
          <span
            className={cn(
              "text-[11px] px-2 py-0.5 rounded-full border font-mono",
              DIFFICULTY_COLORS[lab.difficulty]
            )}
          >
            {lab.difficulty}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <Clock className="h-3 w-3" />
            {lab.estimatedMinutes}m
          </span>
          {completed && (
            <span className="flex items-center gap-1 text-[11px] text-primary font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">{lab.title}</h1>
        <p className="text-muted-foreground">{lab.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Objectives */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/30 p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {lab.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites + complete button */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/60 bg-card/30 p-5">
            <h2 className="text-sm font-semibold mb-3">Prerequisites</h2>
            <ul className="space-y-2">
              {lab.prerequisites.map((p) => (
                <li key={p}>
                  <Link
                    href={`/${p}`}
                    className="text-[12px] font-mono text-primary hover:underline underline-offset-4"
                  >
                    {p.split("/").pop()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleMarkComplete}
            disabled={completed}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all border",
              completed
                ? "border-primary/30 bg-primary/10 text-primary cursor-default"
                : "border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {completed ? "Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>

      {/* Setup reminder */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 mb-6">
        <p className="text-sm text-amber-400/90 font-mono">
          <span className="font-semibold">Local setup required</span> — run these labs in a terminal
          with Python 3.11+ and <code className="bg-amber-500/10 px-1 rounded">ANTHROPIC_API_KEY</code> set.
          See <code className="bg-amber-500/10 px-1 rounded">local/README.md</code> for full instructions.
        </p>
      </div>

      {/* Code Viewer */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {/* Tabs */}
          <div className="flex rounded-lg border border-border/60 overflow-hidden text-sm">
            <button
              onClick={() => setTab("starter")}
              className={cn(
                "px-4 py-1.5 font-mono text-[12px] transition-colors",
                tab === "starter"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              starter.py
            </button>
            <button
              onClick={() => { setTab("solution"); setShowSolution(true) }}
              className={cn(
                "px-4 py-1.5 font-mono text-[12px] transition-colors border-l border-border/60",
                tab === "solution"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              solution.py
            </button>
          </div>

          {/* Solution toggle */}
          {tab === "solution" && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSolution ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showSolution ? "Hide solution" : "Show solution"}
            </button>
          )}
        </div>

        {tab === "starter" && (
          <CodePanel code={lab.starterCode} label={`lab/${lab.id}/starter.py`} />
        )}

        {tab === "solution" && !showSolution && (
          <div className="rounded-xl border border-border/60 bg-card/20 flex flex-col items-center justify-center py-16 gap-4">
            <EyeOff className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">Solution is hidden</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSolution(true)}
              className="gap-2"
            >
              <Eye className="h-3.5 w-3.5" />
              Reveal Solution
            </Button>
          </div>
        )}

        {tab === "solution" && showSolution && (
          <CodePanel code={lab.solutionCode} label={`lab/${lab.id}/solution.py`} />
        )}
      </div>
    </div>
  )
}
