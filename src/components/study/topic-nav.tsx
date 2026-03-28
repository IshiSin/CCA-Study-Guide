import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopicLink {
  title: string
  href: string
}

interface TopicNavProps {
  prev?: TopicLink
  next?: TopicLink
  className?: string
}

export function TopicNav({ prev, next, className }: TopicNavProps) {
  return (
    <nav
      className={cn(
        "mt-12 pt-8 border-t border-border grid grid-cols-2 gap-4",
        className
      )}
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </span>
          <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col gap-1 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-right ml-auto w-full"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
