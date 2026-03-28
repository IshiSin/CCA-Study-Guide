import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb"
import { TopicNav } from "./topic-nav"
import { Clock, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopicLink {
  title: string
  href: string
}

interface TopicLayoutProps {
  title: string
  description?: string
  estimatedMinutes?: number
  domainName?: string
  domainSlug?: string
  breadcrumbs: BreadcrumbItem[]
  prev?: TopicLink
  next?: TopicLink
  children: React.ReactNode
  className?: string
}

export function TopicLayout({
  title,
  description,
  estimatedMinutes,
  domainName,
  breadcrumbs,
  prev,
  next,
  children,
  className,
}: TopicLayoutProps) {
  return (
    <div className={cn("min-h-full", className)}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Topic header */}
        <header className="mb-8">
          {domainName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              {domainName}
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="text-xl leading-relaxed text-foreground/90 font-light mt-3">{description}</p>
          )}
          {estimatedMinutes && (
            <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground border-b border-border pb-8">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {estimatedMinutes} min read
              </span>
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Last updated: 2025
              </span>
            </div>
          )}
        </header>

        {/* MDX content */}
        <article className="prose-custom">
          {children}
        </article>

        {/* Previous / Next navigation */}
        <TopicNav prev={prev} next={next} />
      </div>
    </div>
  )
}
