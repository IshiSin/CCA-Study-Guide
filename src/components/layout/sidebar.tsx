"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

type FileItem = { label: string; href: string; icon?: React.ElementType }
type FolderItem = { label: string; href: string; children: FileItem[]; defaultOpen?: boolean }
type NavItem = FileItem | FolderItem

function isFolder(item: NavItem): item is FolderItem {
  return "children" in item
}

const navTree: NavItem[] = [
  { label: "home.tsx", href: "/", icon: Home },
  {
    label: "study",
    href: "/study/domain-1",
    defaultOpen: true,
    children: [
{ label: "domain-1 — agentic-arch", href: "/study/domain-1" },
      { label: "domain-2 — tool-design", href: "/study/domain-2" },
      { label: "domain-3 — claude-code", href: "/study/domain-3" },
      { label: "domain-4 — prompting", href: "/study/domain-4" },
      { label: "domain-5 — context", href: "/study/domain-5" },
    ],
  },
  { label: "quiz.tsx", href: "/quiz", icon: Brain },
  { label: "scenarios.tsx", href: "/scenarios", icon: Zap },
  { label: "flashcards.tsx", href: "/flashcards", icon: FlipHorizontal },
  { label: "cheatsheets.tsx", href: "/cheatsheets", icon: FileText },
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
        "flex items-center gap-1.5 py-[3px] pr-2 text-[13px] rounded-sm transition-colors",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <Icon className="h-[14px] w-[14px] shrink-0 opacity-70" />
      <span className="truncate font-mono text-[12px]">{item.label}</span>
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
          "w-full flex items-center gap-1.5 py-[3px] pr-2 rounded-sm transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <ChevronRight
          className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-90")}
        />
        <FolderIcon className="h-[14px] w-[14px] shrink-0 text-primary/70" />
        <span className="truncate font-mono text-[12px]">{item.label}</span>
      </button>

      {open && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 border-l border-border/50"
            style={{ left: `${depth * 12 + 11}px` }}
          />
          {item.children.map((child) => (
            <FileRow key={child.href} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border bg-card/30">
      {/* Explorer header */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60 font-mono">
          Explorer
        </p>
      </div>

      {/* Project root */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
        <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
        <FileCode2 className="h-3.5 w-3.5 text-primary/60" />
        <span className="text-[11px] font-mono font-semibold tracking-wide uppercase text-muted-foreground">
          cca-study-guide
        </span>
      </div>

      {/* File tree */}
      <nav className="flex-1 px-1.5 overflow-y-auto pb-4">
        {navTree.map((item) =>
          isFolder(item) ? (
            <FolderRow key={item.href} item={item} depth={0} />
          ) : (
            <FileRow key={item.href} item={item} depth={0} />
          )
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground/50 font-mono">
          src: docs.anthropic.com
        </p>
      </div>
    </aside>
  )
}
