/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { MdxCodeBlock } from "./code-block"
import { Callout } from "./callout"
import { ExamTip } from "./exam-tip"
import { AntiPatternCard } from "./anti-pattern-card"
import { KeyTakeaway } from "./key-takeaway"
import { MermaidDiagram } from "./mermaid-diagram"
import { HubSpokeDiagram } from "./hub-spoke-diagram"
import { cn } from "@/lib/utils"

// Local type since 'mdx/types' package is not installed
type MDXComponents = Record<string, React.ComponentType<any>>

export const mdxComponents: MDXComponents = {
  // Custom components available in MDX files
  CodeBlock: MdxCodeBlock,
  Callout,
  ExamTip,
  AntiPatternCard,
  KeyTakeaway,
  MermaidDiagram,
  HubSpokeDiagram,

  // Override default HTML elements
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("text-4xl font-extrabold tracking-tight mt-10 mb-4 first:mt-0 leading-tight", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("text-3xl font-bold tracking-tight mt-12 mb-4 border-b border-border pb-3", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-xl font-bold tracking-tight mt-10 mb-3", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn("text-sm font-semibold mt-6 mb-2 text-muted-foreground uppercase tracking-widest font-mono", className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-7 mb-4 text-muted-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-4 ml-6 list-disc space-y-2 text-muted-foreground [&_li::marker]:text-primary", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-4 ml-6 list-decimal space-y-2 text-muted-foreground", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("leading-7", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className={cn("my-6 border-l-4 border-primary/60 pl-6 pr-4 py-4 bg-primary/5 rounded-r-xl italic text-muted-foreground leading-relaxed", className)} {...props} />
  ),
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // If it has a language class it's a code block (handled by pre/code)
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="relative rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
          {...props}
        >
          {children}
        </code>
      )
    }
    return <code className={className} {...props}>{children}</code>
  },
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => {
    // Extract code content from pre > code
    const codeEl = children as React.ReactElement<{ className?: string; children?: string }>
    const className = codeEl?.props?.className ?? ""
    const code = codeEl?.props?.children ?? ""
    return <MdxCodeBlock className={className} showLineNumbers>{String(code).trim()}</MdxCodeBlock>
  },
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border/60 bg-card/40">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} />
  ),
  th: ({ ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} />
  ),
  td: ({ ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
  a: ({ className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className={cn("text-primary hover:underline underline-offset-4", className)}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),
}
