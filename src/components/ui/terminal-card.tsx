import { cn } from '@/lib/utils'

interface TerminalCardProps {
  title: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
  accentColor?: string // tailwind text-* class for the title color
}

export function TerminalCard({
  title,
  children,
  className,
  headerClassName,
  accentColor = 'text-primary',
}: TerminalCardProps) {
  return (
    <div className={cn(
      'rounded-md border border-border bg-card overflow-hidden',
      'font-mono shadow-lg shadow-black/30',
      className
    )}>
      {/* Title bar */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border',
        headerClassName
      )}>
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className={cn('text-xs truncate flex-1 text-center -ml-6', accentColor)}>
          {title}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
