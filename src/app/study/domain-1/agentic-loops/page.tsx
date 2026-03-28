
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/study/mdx-components"
import { TopicLayout } from "@/components/study/topic-layout"
import { getMdxContent } from "@/lib/mdx"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Agentic Loops — CCA Study Guide",
}

export default async function AgenticLoopsPage() {
  const mdx = getMdxContent("domain-1/agentic-loops")
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
      domainName="Domain 1: Agentic Architecture & Orchestration"
      domainSlug="domain-1"
      breadcrumbs={[
        { label: "Domain 1", href: "/study/domain-1" },
        { label: mdx.frontmatter.title },
      ]}
      prev={{ title: "Domain 1 Overview", href: "/study/domain-1" }}
      next={{ title: "Hub-and-Spoke Orchestration", href: "/study/domain-1/hub-and-spoke" }}
    >
      {content}
    </TopicLayout>
  )
}
