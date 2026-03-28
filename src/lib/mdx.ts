import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface MDXFrontmatter {
  title: string
  description?: string
  estimatedMinutes?: number
  domain?: number
  topics?: string[]
  [key: string]: unknown
}

export interface MDXContent {
  frontmatter: MDXFrontmatter
  content: string
  slug: string
}

const contentRoot = path.join(process.cwd(), "src", "content", "topics")

export function getMdxContent(relativePath: string): MDXContent | null {
  try {
    const fullPath = path.join(contentRoot, `${relativePath}.mdx`)
    if (!fs.existsSync(fullPath)) return null

    const raw = fs.readFileSync(fullPath, "utf-8")
    const { data, content } = matter(raw)

    return {
      frontmatter: data as MDXFrontmatter,
      content,
      slug: relativePath,
    }
  } catch {
    return null
  }
}

export function getMdxSlugs(domainSlug: string): string[] {
  try {
    const dir = path.join(contentRoot, domainSlug)
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(".mdx", ""))
  } catch {
    return []
  }
}
