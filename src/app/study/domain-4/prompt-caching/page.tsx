export const dynamic = "force-dynamic"

import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/study/mdx-components"
import { TopicLayout } from "@/components/study/topic-layout"
import { getMdxContent } from "@/lib/mdx"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Prompt Caching — CCA Study Guide",
}

export default async function PromptCachingPage() {
  const mdx = getMdxContent("domain-4/prompt-caching")
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
      domainName="Domain 4: Prompt Engineering & Structured Output"
      domainSlug="domain-4"
      breadcrumbs={[
        { label: "Domain 4", href: "/study/domain-4" },
        { label: mdx.frontmatter.title },
      ]}
      prev={{ title: "Batch API", href: "/study/domain-4/batch-api" }}
      next={{ title: "Domain 5 Overview", href: "/study/domain-5" }}
    >
      {content}
    </TopicLayout>
  )
}
