
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/study/mdx-components"
import { TopicLayout } from "@/components/study/topic-layout"
import { getMdxContent } from "@/lib/mdx"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Hub-and-Spoke Orchestration — CCA Study Guide",
}

export default async function HubAndSpokePage() {
  const mdx = getMdxContent("domain-1/hub-and-spoke")
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
      prev={{ title: "Agentic Loops", href: "/study/domain-1/agentic-loops" }}
      next={{ title: "Task Decomposition", href: "/study/domain-1/task-decomposition" }}
    >
      {content}
    </TopicLayout>
  )
}
