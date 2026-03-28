import { Info, AlertTriangle, XCircle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

type CalloutVariant = "info" | "warning" | "danger" | "tip"

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}

const variantConfig: Record<CalloutVariant, {
  icon: React.ComponentType<{ className?: string }>
  containerClass: string
  iconClass: string
  titleClass: string
  borderClass: string
}> = {
  info: {
    icon: Info,
    containerClass: "bg-blue-500/5 border-blue-500/30",
    iconClass: "text-blue-400",
    titleClass: "text-blue-300",
    borderClass: "border-l-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-500/5 border-amber-500/30",
    iconClass: "text-amber-400",
    titleClass: "text-amber-300",
    borderClass: "border-l-amber-500",
  },
  danger: {
    icon: XCircle,
    containerClass: "bg-red-500/5 border-red-500/30",
    iconClass: "text-red-400",
    titleClass: "text-red-300",
    borderClass: "border-l-red-500",
  },
  tip: {
    icon: Lightbulb,
    containerClass: "bg-emerald-500/5 border-emerald-500/30",
    iconClass: "text-emerald-400",
    titleClass: "text-emerald-300",
    borderClass: "border-l-emerald-500",
  },
}

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "my-4 rounded-r-lg border border-l-4 p-4",
        config.containerClass,
        config.borderClass
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconClass)} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn("font-semibold text-sm mb-1", config.titleClass)}>{title}</p>
          )}
          <div className="text-sm text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
