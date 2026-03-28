import { X, Check } from "lucide-react"

interface AntiPatternCardProps {
  title?: string
  wrongLabel?: string
  rightLabel?: string
  wrong: React.ReactNode
  right: React.ReactNode
  explanation?: React.ReactNode
}

export function AntiPatternCard({
  title,
  wrongLabel = "Anti-Pattern",
  rightLabel = "Best Practice",
  wrong,
  right,
  explanation,
}: AntiPatternCardProps) {
  return (
    <div className="my-6 rounded-lg border border-border overflow-hidden">
      {title && (
        <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
          <p className="font-semibold text-sm">{title}</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Wrong */}
        <div className="p-4 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
              <X className="h-3 w-3 text-red-400" />
            </div>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">{wrongLabel}</span>
          </div>
          <div className="text-sm [&_pre]:my-0 [&_pre]:text-xs [&_code:not(pre_code)]:bg-red-900/20 [&_code:not(pre_code)]:text-red-300 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:rounded [&_p]:text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0">
            {wrong}
          </div>
        </div>

        {/* Right */}
        <div className="p-4 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20">
              <Check className="h-3 w-3 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">{rightLabel}</span>
          </div>
          <div className="text-sm [&_pre]:my-0 [&_pre]:text-xs [&_code:not(pre_code)]:bg-emerald-900/20 [&_code:not(pre_code)]:text-emerald-300 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:rounded [&_p]:text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0">
            {right}
          </div>
        </div>
      </div>
      {explanation && (
        <div className="px-4 py-3 bg-muted/30 border-t border-border text-sm text-muted-foreground">
          {explanation}
        </div>
      )}
    </div>
  )
}
