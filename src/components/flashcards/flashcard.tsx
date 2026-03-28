"use client"

import { useEffect } from "react"

interface FlashcardProps {
  front: string
  back: string
  isFlipped: boolean
  onFlip: () => void
  tags?: string[]
}

export function Flashcard({ front, back, isFlipped, onFlip, tags }: FlashcardProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        onFlip()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onFlip])

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: "1200px", height: "300px" }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onFlip()}
      aria-label={isFlipped ? "Card showing answer — click to flip back" : "Card showing question — click or press Space to flip"}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-lg border border-border bg-card shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">Question</p>
          <p className="text-center text-base font-medium leading-relaxed max-w-lg">{front}</p>
          <p className="absolute bottom-4 text-xs text-muted-foreground/50 font-mono">
            Space or click to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-lg border border-primary/30 bg-primary/5 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-6">Answer</p>
          <div className="overflow-y-auto max-h-52 w-full flex justify-center">
            <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-center max-w-lg">
              {back}
            </p>
          </div>
          {tags && tags.length > 0 && (
            <div className="absolute bottom-4 flex gap-1.5 flex-wrap justify-center">
              {tags.map(t => (
                <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary/60">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
