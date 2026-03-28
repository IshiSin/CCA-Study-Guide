
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/study/mdx-components"
import { TopicLayout } from "@/components/study/topic-layout"
import { getMdxContent } from "@/lib/mdx"
import { notFound } from "next/navigation"

export const metadata = {
  title: "MCP Configuration — CCA Study Guide",
}

export default async function McpConfigPage() {
  const mdx = getMdxContent("domain-3/mcp-config")
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
      domainName="Domain 3: Claude Code Configuration & Workflows"
      domainSlug="domain-3"
      breadcrumbs={[
        { label: "Domain 3", href: "/study/domain-3" },
        { label: mdx.frontmatter.title },
      ]}
      prev={{ title: "CI/CD Integration", href: "/study/domain-3/ci-cd-integration" }}
      next={{ title: "Domain 3 Overview", href: "/study/domain-3" }}
    >
      {content}
    </TopicLayout>
  )
}
