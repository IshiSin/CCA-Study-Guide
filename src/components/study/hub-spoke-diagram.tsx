export function HubSpokeDiagram() {
  const spokes = [
    { label: "Research Agent", sub: "task_spec → research_report" },
    { label: "Writer Agent", sub: "task_spec + report → draft" },
    { label: "Reviewer Agent", sub: "task_spec + draft → feedback" },
  ]

  return (
    <div className="my-6 rounded-xl border border-border/60 bg-card/40 p-6 font-mono text-[12px]">
      {/* User */}
      <div className="flex justify-center mb-3">
        <div className="px-3 py-1.5 rounded border border-primary/40 bg-primary/10 text-primary text-center">
          User Request
        </div>
      </div>

      {/* Arrow down */}
      <div className="flex justify-center mb-3">
        <div className="flex flex-col items-center gap-0.5 text-muted-foreground/50">
          <div className="w-px h-4 bg-border" />
          <span className="text-[10px] rotate-90 leading-none">▼</span>
        </div>
      </div>

      {/* Coordinator */}
      <div className="flex justify-center mb-4">
        <div className="px-4 py-2 rounded-lg border border-primary/60 bg-primary/15 text-primary text-center">
          <div className="text-[11px] text-primary/60 mb-0.5">hub</div>
          <div>Coordinator Agent</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">decompose · delegate · aggregate</div>
        </div>
      </div>

      {/* Fan-out lines */}
      <div className="flex justify-center mb-1">
        <div className="w-[72%] border-t border-border/60" />
      </div>

      {/* Spokes */}
      <div className="grid grid-cols-3 gap-3 mb-1">
        {spokes.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <div className="w-px h-3 bg-border/60" />
            <div className="w-full px-2 py-2 rounded border border-border/60 bg-muted/20 text-center">
              <div className="text-foreground/80">{s.label}</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight">{s.sub}</div>
            </div>
            <div className="w-px h-3 bg-border/60" />
          </div>
        ))}
      </div>

      {/* Fan-in lines */}
      <div className="flex justify-center mt-0 mb-3">
        <div className="w-[72%] border-t border-border/60" />
      </div>

      {/* Arrow down to output */}
      <div className="flex justify-center mb-3">
        <div className="flex flex-col items-center gap-0.5 text-muted-foreground/50">
          <div className="w-px h-4 bg-border" />
          <span className="text-[10px] rotate-90 leading-none">▼</span>
        </div>
      </div>

      {/* Output */}
      <div className="flex justify-center">
        <div className="px-3 py-1.5 rounded border border-border/50 bg-muted/20 text-muted-foreground text-center">
          Final Output
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/40 mt-4">
        Each subagent has an isolated context window — information flows only via explicit passing
      </p>
    </div>
  )
}
