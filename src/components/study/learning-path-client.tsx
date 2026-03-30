"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, CheckSquare, Square, ExternalLink, Clock, BookOpen, Brain, FlaskConical, Zap } from "lucide-react"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { TopicNav } from "./topic-nav"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  label: string
  href?: string
  type: "read" | "quiz" | "lab" | "practice"
  minutes?: number
}

interface Week {
  id: string
  week: string | string[]
  title: string
  subtitle: string
  totalMinutes: number
  focus: string
  tasks: Task[]
}

const typeIcon = {
  read: BookOpen,
  quiz: Brain,
  lab: FlaskConical,
  practice: Zap,
}

const typeColor = {
  read: "text-blue-400",
  quiz: "text-purple-400",
  lab: "text-emerald-400",
  practice: "text-amber-400",
}

const weeks: Week[] = [
  {
    id: "week-1",
    week: "Week 1",
    title: "Agentic Architecture Foundations",
    subtitle: "Domain 1 Core — 27% of exam",
    totalMinutes: 210,
    focus: "Understand how multi-agent systems are structured. This is the exam's largest domain.",
    tasks: [
{ id: "w1-t2", label: "Agentic Loops", href: "/study/domain-1/agentic-loops", type: "read", minutes: 20 },
      { id: "w1-t3", label: "Hub-and-Spoke Orchestration", href: "/study/domain-1/hub-and-spoke", type: "read", minutes: 25 },
      { id: "w1-t4", label: "Task Decomposition", href: "/study/domain-1/task-decomposition", type: "read", minutes: 20 },
      { id: "w1-t5", label: "Claude Agent SDK", href: "/study/domain-1/agent-sdk", type: "read", minutes: 30 },
      { id: "w1-t6", label: "Session & State Management", href: "/study/domain-1/session-state", type: "read", minutes: 20 },
      { id: "w1-t7", label: "Failure Recovery", href: "/study/domain-1/failure-recovery", type: "read", minutes: 20 },
      { id: "w1-t8", label: "Domain 1 Anti-Patterns", href: "/study/domain-1/anti-patterns", type: "read", minutes: 15 },
      { id: "w1-t9", label: "Domain 1 Quiz", href: "/quiz/domain/1", type: "quiz", minutes: 20 },
      { id: "w1-t10", label: "Lab 06: Agentic Loop", href: "/labs/lab-06", type: "lab", minutes: 30 },
    ],
  },
  {
    id: "week-2",
    week: "Week 2",
    title: "Tool Design & MCP Integration",
    subtitle: "Domain 2 — 18% of exam",
    totalMinutes: 195,
    focus: "Learn the Model Context Protocol and how to design reliable, well-scoped tools.",
    tasks: [
      { id: "w2-t1", label: "MCP Fundamentals", href: "/study/domain-2/mcp-fundamentals", type: "read", minutes: 25 },
      { id: "w2-t2", label: "Tool Descriptions", href: "/study/domain-2/tool-descriptions", type: "read", minutes: 20 },
      { id: "w2-t3", label: "MCP Servers", href: "/study/domain-2/mcp-servers", type: "read", minutes: 30 },
      { id: "w2-t4", label: "MCP Clients", href: "/study/domain-2/mcp-clients", type: "read", minutes: 20 },
      { id: "w2-t5", label: "Tool Scoping", href: "/study/domain-2/tool-scoping", type: "read", minutes: 15 },
      { id: "w2-t6", label: "Structured Errors", href: "/study/domain-2/structured-errors", type: "read", minutes: 15 },
      { id: "w2-t7", label: "Domain 2 Quiz", href: "/quiz/domain/2", type: "quiz", minutes: 20 },
      { id: "w2-t8", label: "Lab 02: Tool Use", href: "/labs/lab-02", type: "lab", minutes: 30 },
      { id: "w2-t9", label: "Lab 04: MCP Server", href: "/labs/lab-04", type: "lab", minutes: 20 },
    ],
  },
  {
    id: "week-3",
    week: "Week 3",
    title: "Claude Code Configuration",
    subtitle: "Domain 3 — 20% of exam",
    totalMinutes: 195,
    focus: "Configure Claude Code for real projects. CLAUDE.md hierarchy, skills, plan mode, and CI/CD.",
    tasks: [
      { id: "w3-t1", label: "CLAUDE.md Hierarchy", href: "/study/domain-3/claude-md-hierarchy", type: "read", minutes: 20 },
      { id: "w3-t2", label: "Slash Commands", href: "/study/domain-3/slash-commands", type: "read", minutes: 15 },
      { id: "w3-t3", label: "Agent Skills", href: "/study/domain-3/agent-skills", type: "read", minutes: 20 },
      { id: "w3-t4", label: "Plan Mode", href: "/study/domain-3/plan-mode", type: "read", minutes: 15 },
      { id: "w3-t5", label: "CI/CD Integration", href: "/study/domain-3/ci-cd-integration", type: "read", minutes: 20 },
      { id: "w3-t6", label: "MCP Configuration", href: "/study/domain-3/mcp-config", type: "read", minutes: 20 },
      { id: "w3-t7", label: "Domain 3 Quiz", href: "/quiz/domain/3", type: "quiz", minutes: 20 },
      { id: "w3-t8", label: "Lab 08: Claude Code Config", href: "/labs/lab-08", type: "lab", minutes: 45 },
      { id: "w3-t9", label: "Domain 3 Flashcards", href: "/flashcards", type: "practice", minutes: 10 },
    ],
  },
  {
    id: "week-4",
    week: "Week 4",
    title: "Prompt Engineering & Structured Output",
    subtitle: "Domain 4 — 20% of exam",
    totalMinutes: 185,
    focus: "Master system prompts, few-shot examples, schema-validated output, and cost-efficiency patterns.",
    tasks: [
      { id: "w4-t1", label: "System Prompts", href: "/study/domain-4/system-prompts", type: "read", minutes: 20 },
      { id: "w4-t2", label: "Few-Shot Prompting", href: "/study/domain-4/few-shot-prompting", type: "read", minutes: 20 },
      { id: "w4-t3", label: "Structured Output", href: "/study/domain-4/structured-output", type: "read", minutes: 25 },
      { id: "w4-t4", label: "Validation & Retry", href: "/study/domain-4/validation-retry", type: "read", minutes: 20 },
      { id: "w4-t5", label: "Batch API", href: "/study/domain-4/batch-api", type: "read", minutes: 15 },
      { id: "w4-t6", label: "Prompt Caching", href: "/study/domain-4/prompt-caching", type: "read", minutes: 20 },
      { id: "w4-t7", label: "Domain 4 Quiz", href: "/quiz/domain/4", type: "quiz", minutes: 20 },
      { id: "w4-t8", label: "Lab 03: Structured Extraction", href: "/labs/lab-03", type: "lab", minutes: 30 },
      { id: "w4-t9", label: "Lab 05: Validation & Retry", href: "/labs/lab-05", type: "lab", minutes: 15 },
    ],
  },
  {
    id: "week-5",
    week: "Week 5",
    title: "Context Management & Reliability",
    subtitle: "Domain 5 — 15% of exam",
    totalMinutes: 165,
    focus: "Understand context window limits, degradation patterns, and human-in-the-loop design.",
    tasks: [
      { id: "w5-t1", label: "Context Window", href: "/study/domain-5/context-window", type: "read", minutes: 20 },
      { id: "w5-t2", label: "Context Degradation", href: "/study/domain-5/context-degradation", type: "read", minutes: 15 },
      { id: "w5-t3", label: "Escalation Design", href: "/study/domain-5/escalation-design", type: "read", minutes: 20 },
      { id: "w5-t4", label: "Human-in-the-Loop", href: "/study/domain-5/human-in-the-loop", type: "read", minutes: 20 },
      { id: "w5-t5", label: "Error Propagation", href: "/study/domain-5/error-propagation", type: "read", minutes: 15 },
      { id: "w5-t6", label: "Domain 5 Quiz", href: "/quiz/domain/5", type: "quiz", minutes: 20 },
      { id: "w5-t7", label: "Scenarios: Multi-Agent Research", href: "/scenarios/multi-agent-research", type: "practice", minutes: 25 },
      { id: "w5-t8", label: "Scenarios: Customer Support", href: "/scenarios/customer-support", type: "practice", minutes: 20 },
      { id: "w5-t9", label: "Domain 5 Flashcards", href: "/flashcards", type: "practice", minutes: 10 },
    ],
  },
  {
    id: "week-6",
    week: "Week 6",
    title: "Scenarios & Advanced Labs",
    subtitle: "Applied practice across all domains",
    totalMinutes: 210,
    focus: "Tie concepts together through scenario walkthroughs and the remaining hands-on labs.",
    tasks: [
      { id: "w6-t1", label: "Scenario: Code Generation", href: "/scenarios/code-generation", type: "practice", minutes: 25 },
      { id: "w6-t2", label: "Scenario: Developer Productivity", href: "/scenarios/developer-productivity", type: "practice", minutes: 25 },
      { id: "w6-t3", label: "Scenario: CI/CD Pipeline", href: "/scenarios/ci-cd-pipeline", type: "practice", minutes: 25 },
      { id: "w6-t4", label: "Scenario: Structured Extraction", href: "/scenarios/structured-extraction", type: "practice", minutes: 20 },
      { id: "w6-t5", label: "Lab 07: Multi-Agent System", href: "/labs/lab-07", type: "lab", minutes: 45 },
      { id: "w6-t6", label: "Lab 09: Capstone Project", href: "/labs/lab-09", type: "lab", minutes: 60 },
      { id: "w6-t7", label: "Anti-Patterns review", href: "/study/domain-1/anti-patterns", type: "read", minutes: 10 },
    ],
  },
  {
    id: "week-7",
    week: "Week 7",
    title: "Mock Exams & Weak Area Review",
    subtitle: "Exam-mode practice",
    totalMinutes: 300,
    focus: "Two timed full mock exams. Review your wrong answers by domain and re-read those topics.",
    tasks: [
      { id: "w7-t1", label: "Mock Exam 1 (60 questions, timed)", href: "/quiz/exam", type: "quiz", minutes: 120 },
      { id: "w7-t2", label: "Review Exam 1 results by domain", href: "/progress", type: "practice", minutes: 30 },
      { id: "w7-t3", label: "Re-read weak domain topics", type: "read", minutes: 60 },
      { id: "w7-t4", label: "Flashcard review — all domains", href: "/flashcards", type: "practice", minutes: 30 },
      { id: "w7-t5", label: "Mock Exam 2 (60 questions, timed)", href: "/quiz/exam", type: "quiz", minutes: 120 },
    ],
  },
  {
    id: "week-8",
    week: "Week 8",
    title: "Final Review & Exam Day",
    subtitle: "Consolidation and confidence",
    totalMinutes: 120,
    focus: "Light review only — you've done the work. Focus on confidence and logistics.",
    tasks: [
      { id: "w8-t1", label: "Flashcard review — all domains", href: "/flashcards", type: "practice", minutes: 30 },
      { id: "w8-t2", label: "Flashcards — cards rated 'Again' or 'Hard'", href: "/flashcards", type: "practice", minutes: 20 },
      { id: "w8-t3", label: "Domain 1 & 3 anti-patterns quick review", href: "/study/domain-1/anti-patterns", type: "read", minutes: 15 },
      { id: "w8-t4", label: "Progress dashboard — confirm readiness", href: "/progress", type: "practice", minutes: 10 },
      { id: "w8-t5", label: "Test your Pearson VUE setup", type: "practice", minutes: 15 },
      { id: "w8-t6", label: "Take the exam!", type: "practice", minutes: 120 },
    ],
  },
]

const STORAGE_KEY = "cca-learning-path-checks"

export function LearningPathClient() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({ "week-1": true })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setChecked(JSON.parse(stored))
    } catch {}
  }, [])

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const toggleWeek = (id: string) => {
    setOpenWeeks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const weekProgress = (week: Week) => {
    const done = week.tasks.filter((t) => checked[t.id]).length
    return { done, total: week.tasks.length, pct: Math.round((done / week.tasks.length) * 100) }
  }

  const totalDone = weeks.reduce((sum, w) => sum + w.tasks.filter((t) => checked[t.id]).length, 0)
  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0)
  const totalPct = Math.round((totalDone / totalTasks) * 100)

  return (
    <div className="min-h-full">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumb
          items={[
            { label: "Study", href: "/study" },
            { label: "Learning Path" },
          ]}
          className="mb-6"
        />

        <header className="mb-8">
          <Badge variant="outline" className="text-primary border-primary/30 mb-3">
            Study Plan
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Interactive Learning Path</h1>
          <p className="text-lg text-muted-foreground">
            An 8-week structured plan from zero to exam-ready. Check off tasks as you complete them
            — progress is saved in your browser.
          </p>
        </header>

        {/* Overall progress */}
        <div className="mb-8 p-5 rounded-lg border border-border bg-card/50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{totalDone} / {totalTasks} tasks</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${totalPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{totalPct}% complete</p>
        </div>

        {/* Weeks */}
        <div className="space-y-3">
          {weeks.map((week) => {
            const { done, total, pct } = weekProgress(week)
            const isOpen = openWeeks[week.id]
            const isComplete = done === total

            return (
              <div
                key={week.id}
                className={cn(
                  "rounded-lg border overflow-hidden transition-colors",
                  isComplete ? "border-emerald-500/40" : "border-border"
                )}
              >
                {/* Week header */}
                <button
                  onClick={() => toggleWeek(week.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30",
                    isComplete ? "bg-emerald-500/5" : "bg-card/50"
                  )}
                >
                  <div className="shrink-0">
                    <div className="text-xs font-medium text-muted-foreground">{week.week}</div>
                    <h2 className="font-semibold text-sm mt-0.5">{week.title}</h2>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{week.subtitle}</span>
                      <span className={cn(
                        "text-xs font-medium shrink-0 ml-2",
                        isComplete ? "text-emerald-400" : "text-muted-foreground"
                      )}>
                        {done}/{total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isComplete ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(week.totalMinutes / 60)}h {week.totalMinutes % 60 > 0 ? `${week.totalMinutes % 60}m` : ""}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Week content */}
                {isOpen && (
                  <div className="border-t border-border">
                    {/* Focus note */}
                    <div className="px-5 py-3 bg-primary/5 border-b border-border text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Focus: </span>
                      {week.focus}
                    </div>

                    {/* Tasks */}
                    <ul className="divide-y divide-border">
                      {week.tasks.map((task) => {
                        const Icon = typeIcon[task.type]
                        const color = typeColor[task.type]
                        const isChecked = !!checked[task.id]

                        return (
                          <li key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                            <button
                              onClick={() => toggleCheck(task.id)}
                              className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                              aria-label={isChecked ? "Uncheck task" : "Check task"}
                            >
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>

                            <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />

                            <span className={cn(
                              "flex-1 text-sm",
                              isChecked ? "line-through text-muted-foreground/50" : "text-foreground"
                            )}>
                              {task.href ? (
                                <Link
                                  href={task.href}
                                  className="hover:text-primary transition-colors flex items-center gap-1 w-fit"
                                >
                                  {task.label}
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </Link>
                              ) : (
                                task.label
                              )}
                            </span>

                            {task.minutes && (
                              <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.minutes}m
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <TopicNav
          prev={{ title: "Study Home", href: "/study" }}
          next={{ title: "Domain 1: Agentic Architecture", href: "/study/domain-1" }}
        />
      </div>
    </div>
  )
}
