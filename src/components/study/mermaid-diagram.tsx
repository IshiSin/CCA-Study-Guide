"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface MermaidDiagramProps {
  chart: string
  title?: string
  className?: string
}

export function MermaidDiagram({ chart, title, className }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!chart) return
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#0d1117",
            primaryColor: "#1e40af",
            primaryTextColor: "#e6edf3",
            primaryBorderColor: "#3b82f6",
            lineColor: "#4b5563",
            secondaryColor: "#1f2937",
            tertiaryColor: "#111827",
            fontSize: "14px",
          },
          flowchart: { curve: "basis", htmlLabels: false },
        })

        // Clean up any temp element mermaid left from a previous render (React StrictMode)
        const stale = document.getElementById(idRef.current)
        if (stale) stale.remove()

        const { svg } = await mermaid.render(idRef.current, chart)
        if (!cancelled) setSvg(svg)
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  return (
    <div className={cn("my-6 rounded-lg border border-border overflow-hidden", className)}>
      {title && (
        <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <div className="p-4 bg-[#0d1117] flex justify-center overflow-x-auto">
        {error ? (
          <div className="text-sm text-red-400 font-mono p-2">
            Diagram error: {error}
          </div>
        ) : svg ? (
          <div
            ref={ref}
            dangerouslySetInnerHTML={{ __html: svg }}
            className="[&_svg]:max-w-full [&_svg]:h-auto"
          />
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
            Loading diagram…
          </div>
        )}
      </div>
    </div>
  )
}
