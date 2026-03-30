"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  Brain,
  Zap,
  FlipHorizontal,
  FileText,
  FlaskConical,
  BarChart3,
  Home,
  BookOpen,
  Settings,
  Puzzle,
  GitBranch,
  Layers,
  Terminal,
  RefreshCw,
  AlertTriangle,
  Database,
  MessageSquare,
  Cpu,
  Network,
  Shield,
  Clock,
  Code,
  Layout,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { domains } from "@/content/domains"

type FileItem = { label: string; href: string; icon?: React.ElementType }
type FolderItem = { label: string; href: string; children: NavItem[]; defaultOpen?: boolean }
type NavItem = FileItem | FolderItem

function isFolder(item: NavItem): item is FolderItem {
  return "children" in item
}

const domainShortNames: Record<number, string> = {
  1: "agentic-arch",
  2: "tool-design",
  3: "claude-code",
  4: "prompting",
  5: "context",
}

const topicIconMap: Record<string, React.ElementType> = {
  "agentic-loops": RefreshCw,
  "hub-and-spoke": Network,
  "task-decomposition": Layers,
  "agent-sdk": Cpu,
  "session-state": Database,
  "failure-recovery": Shield,
  "anti-patterns": AlertTriangle,
  "mcp-fundamentals": Puzzle,
  "tool-descriptions": FileText,
  "mcp-servers": Terminal,
  "mcp-clients": MessageSquare,
  "tool-scoping": Settings,
  "structured-errors": AlertTriangle,
  "claude-md-hierarchy": GitBranch,
  "slash-commands": Code,
  "agent-skills": Cpu,
  "plan-mode": Layout,
  "ci-cd-integration": GitBranch,
  "mcp-config": Settings,
  "system-prompts": MessageSquare,
  "few-shot-prompting": BookOpen,
  "structured-output": Layers,
  "validation-retry": RefreshCw,
  "batch-api": Activity,
  "prompt-caching": Clock,
  "context-window": Layout,
  "context-degradation": Activity,
  "escalation-design": Shield,
  "human-in-the-loop": Brain,
  "error-propagation": AlertTriangle,
}

const navTree: NavItem[] = [
  { label: "home.tsx", href: "/", icon: Home },
  {
    label: "study",
    href: "/study",
    defaultOpen: true,
    children: domains.map((d) => ({
      label: `domain-${d.id} — ${domainShortNames[d.id]}`,
      href: `/study/${d.slug}`,
      children: d.topics.map((t) => ({
        label: `${t.slug}.md`,
        href: `/study/${d.slug}/${t.slug}`,
        icon: topicIconMap[t.slug] ?? FileCode2,
      })),
    })),
  },
  { label: "quiz.tsx", href: "/quiz", icon: Brain },
  { label: "scenarios.tsx", href: "/scenarios", icon: Zap },
  { label: "flashcards.tsx", href: "/flashcards", icon: FlipHorizontal },

  { label: "labs.tsx", href: "/labs", icon: FlaskConical },
  { label: "progress.tsx", href: "/progress", icon: BarChart3 },
]

function FileRow({ item, depth = 0 }: { item: FileItem; depth?: number }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  const Icon = item.icon ?? FileCode2

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2 py-1 pr-2 rounded transition-colors",
        isActive
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      )}
      style={{ paddingLeft: `${depth * 14 + 8}px` }}
    >
      <Icon
        className={cn(
          "h-[13px] w-[13px] shrink-0",
          isActive ? "opacity-90" : "opacity-60"
        )}
      />
      <span className="font-mono text-[11.5px] leading-snug truncate">{item.label}</span>
    </Link>
  )
}

function FolderRow({ item, depth = 0 }: { item: FolderItem; depth?: number }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  const [open, setOpen] = useState(item.defaultOpen ?? isActive)
  const FolderIcon = open ? FolderOpen : Folder

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 pr-2 rounded transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
        style={{ paddingLeft: `${depth * 14 + 2}px` }}
      >
        {open ? (
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
        )}
        <FolderIcon className="h-[14px] w-[14px] shrink-0 text-primary/70" />
        <span className="font-mono text-[11.5px] leading-snug truncate">{item.label}</span>
      </button>

      {open && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 border-l border-border/40"
            style={{ left: `${depth * 14 + 9}px` }}
          />
          {item.children.map((child) =>
            isFolder(child) ? (
              <FolderRow key={child.href} item={child} depth={depth + 1} />
            ) : (
              <FileRow key={child.href} item={child} depth={depth + 1} />
            )
          )}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-border bg-card/20">
      {/* Explorer header */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 font-mono">
          Explorer
        </p>
      </div>

      {/* Project root */}
      <button className="flex items-center gap-1.5 px-2 py-1 mb-0.5 w-full hover:bg-muted/20 rounded transition-colors">
        <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        <FolderOpen className="h-[14px] w-[14px] text-primary/70" />
        <span className="text-[11px] font-mono font-semibold tracking-wide uppercase text-muted-foreground/80">
          CCA-Study-Guide
        </span>
      </button>

      {/* File tree */}
      <nav className="flex-1 px-1.5 overflow-y-auto pb-4 space-y-px">
        {navTree.map((item) =>
          isFolder(item) ? (
            <FolderRow key={item.href} item={item} depth={0} />
          ) : (
            <FileRow key={item.href} item={item} depth={0} />
          )
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground/40 font-mono">
          src: docs.anthropic.com
        </p>
      </div>
    </aside>
  )
}
