"use client"

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote"
import { mdxComponents } from "./mdx-components"

interface MDXRendererProps {
  source: MDXRemoteSerializeResult
}

export function MDXRenderer({ source }: MDXRendererProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <MDXRemote {...source} components={mdxComponents as any} />
}
