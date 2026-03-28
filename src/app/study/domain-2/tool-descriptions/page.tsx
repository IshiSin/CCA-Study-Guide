export const dynamic = "force-dynamic"

import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/study/mdx-components"
import { TopicLayout } from "@/components/study/topic-layout"
import { getMdxContent } from "@/lib/mdx"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Tool Descriptions — CCA Study Guide",
}

export default async function ToolDescriptionsPage() {
  const mdx = getMdxContent("domain-2/tool-descriptions")
  if (!mdx) notFound()

  const { content } = await compileMDX({
    source: mdx.content,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components: mdxComponents as any,
    options: { mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [] } },
  })

  return (
    <TopicLayout
      title={mdx.frontmatter.title}
      description={mdx.frontmatter.description}
      estimatedMinutes={mdx.frontmatter.estimatedMinutes}
      domainName="Domain 2: Tool Design & MCP Integration"
      domainSlug="domain-2"
      breadcrumbs={[
        { label: "Domain 2", href: "/study/domain-2" },
        { label: mdx.frontmatter.title },
      ]}
      prev={{ title: "MCP Fundamentals", href: "/study/domain-2/mcp-fundamentals" }}
      next={{ title: "MCP Servers", href: "/study/domain-2/mcp-servers" }}
    >
      {content}
    </TopicLayout>
  )
}
