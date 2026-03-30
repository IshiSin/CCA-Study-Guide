import { Star } from "lucide-react"

interface KeyTakeawayProps {
  children: React.ReactNode
  title?: string
}

export function KeyTakeaway({ children, title = "Key Takeaways" }: KeyTakeawayProps) {
  return (
    <div className="my-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary fill-primary" />
        <h3 className="font-bold text-primary text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="text-sm space-y-1 [&_ul]:space-y-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-muted-foreground [&_li::marker]:hidden [&_li]:before:content-['→'] [&_li]:before:text-primary [&_li]:before:shrink-0 [&_li]:before:mt-px [&_strong]:text-foreground [&_code]:text-primary [&_code]:font-mono [&_code]:font-semibold">
        {children}
      </div>
    </div>
  )
}
