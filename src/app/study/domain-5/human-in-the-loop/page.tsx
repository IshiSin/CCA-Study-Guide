export const dynamic = "force-dynamic"

import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/study/mdx-components"
import { TopicLayout } from "@/components/study/topic-layout"
import { getMdxContent } from "@/lib/mdx"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Human-in-the-Loop — CCA Study Guide",
}

export default async function HumanInTheLoopPage() {
  const mdx = getMdxContent("domain-5/human-in-the-loop")
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
      domainName="Domain 5: Context Management & Reliability"
      domainSlug="domain-5"
      breadcrumbs={[
        { label: "Domain 5", href: "/study/domain-5" },
        { label: mdx.frontmatter.title },
      ]}
      prev={{ title: "Escalation Design", href: "/study/domain-5/escalation-design" }}
      next={{ title: "Error Propagation", href: "/study/domain-5/error-propagation" }}
    >
      {content}
    </TopicLayout>
  )
}
