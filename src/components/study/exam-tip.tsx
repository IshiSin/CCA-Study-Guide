import { GraduationCap } from "lucide-react"

interface ExamTipProps {
  children: React.ReactNode
  title?: string
}

export function ExamTip({ children, title = "The exam tests this" }: ExamTipProps) {
  return (
    <div className="my-6 rounded-lg border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30">
          <GraduationCap className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-blue-300 text-sm mb-1.5 uppercase tracking-wide">
            {title}
          </p>
          <div className="text-sm text-blue-100/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-blue-200 [&_code]:bg-blue-900/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-blue-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
