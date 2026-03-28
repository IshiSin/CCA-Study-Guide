"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

type Segment = { text: string; isComment: boolean }

function parseLineForComments(line: string, language: string): Segment[] {
  const isPython = language === "python"
  const isJsLike = ["javascript", "typescript", "js", "ts", "tsx", "jsx"].includes(language)

  if (!isPython && !isJsLike) return [{ text: line, isComment: false }]

  let inSingle = false
  let inDouble = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === "'" && !inDouble) inSingle = !inSingle
    if (ch === '"' && !inSingle) inDouble = !inDouble

    if (!inSingle && !inDouble) {
      if (isPython && ch === "#") {
        return [
          { text: line.slice(0, i), isComment: false },
          { text: line.slice(i), isComment: true },
        ]
      }
      if (isJsLike && ch === "/" && line[i + 1] === "/") {
        return [
          { text: line.slice(0, i), isComment: false },
          { text: line.slice(i), isComment: true },
        ]
      }
    }
  }

  return [{ text: line, isComment: false }]
}

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
}

export function CodeBlock({
  code,
  language = "typescript",
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4 rounded-lg border border-border overflow-hidden bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#161b22]">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs text-muted-foreground font-mono">{filename}</span>
          )}
          {language && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/5"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre
        className={cn(
          "overflow-x-auto p-4 text-sm leading-relaxed",
          showLineNumbers && "pl-2"
        )}
      >
        {showLineNumbers ? (
          <code>
            {code.split("\n").map((line, i) => (
              <div key={i} className="flex gap-4 hover:bg-white/[0.03] px-2 -mx-2 rounded">
                <span className="select-none text-muted-foreground/40 w-6 text-right shrink-0 text-xs leading-6">
                  {i + 1}
                </span>
                <span className="font-mono">
                  {parseLineForComments(line, language).map((seg, j) =>
                    seg.isComment ? (
                      <span key={j} className="text-blue-400">{seg.text}</span>
                    ) : (
                      <span key={j} className="text-[#e6edf3]">{seg.text || " "}</span>
                    )
                  )}
                </span>
              </div>
            ))}
          </code>
        ) : (
          <code className="font-mono whitespace-pre">
            {code.split("\n").map((line, i, arr) => (
              <span key={i}>
                {parseLineForComments(line, language).map((seg, j) =>
                  seg.isComment ? (
                    <span key={j} className="text-blue-400">{seg.text}</span>
                  ) : (
                    <span key={j} className="text-[#e6edf3]">{seg.text}</span>
                  )
                )}
                {i < arr.length - 1 ? "\n" : ""}
              </span>
            ))}
          </code>
        )}
      </pre>
    </div>
  )
}

// MDX-compatible wrapper that accepts children as string
interface MdxCodeBlockProps {
  children: string
  className?: string
  filename?: string
  showLineNumbers?: boolean
}

export function MdxCodeBlock({ children, className, filename, showLineNumbers }: MdxCodeBlockProps) {
  const language = className?.replace("language-", "") ?? "text"
  const code = typeof children === "string" ? children.trim() : ""

  return (
    <CodeBlock
      code={code}
      language={language}
      filename={filename}
      showLineNumbers={showLineNumbers}
    />
  )
}
