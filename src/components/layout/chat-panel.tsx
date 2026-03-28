"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatPanel() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <>
      {/* Slide-out tab toggle on right edge */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 px-2.5 py-6 rounded-l-md border border-r-0 font-mono transition-all duration-200",
          open
            ? "opacity-0 pointer-events-none"
            : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-lg"
        )}
        aria-label="Open Ask Chat"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest text-xs font-semibold">ask chat</span>
      </button>

      {/* Full-height right panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen z-50 flex flex-col w-80 sm:w-96 border-l border-border bg-card shadow-2xl transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-semibold">CCA Study Assistant</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-xs font-mono py-12 space-y-2">
              <Bot className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Ask anything about the CCA exam.</p>
              <p className="opacity-60">e.g. "What is hub-and-spoke?" or "How does MCP work?"</p>
            </div>
          )}

          {messages.map((msg) => {
            const text = msg.parts
              ?.filter((p) => p.type === "text")
              .map((p) => p.type === "text" ? p.text : "")
              .join("") ?? (typeof msg.content === "string" ? msg.content : "")
            return (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <Bot className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-sm px-3 py-2 text-xs leading-relaxed font-mono whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {text}
                </div>
                {msg.role === "user" && (
                  <User className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                )}
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-2 items-center">
              <Bot className="h-4 w-4 shrink-0 text-primary" />
              <div className="bg-secondary rounded-sm px-3 py-2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive font-mono px-1">
              Error: {error.message || "Something went wrong."}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-secondary/50 border border-border rounded-sm px-3 py-2 text-xs font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-sm bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </>
  )
}
