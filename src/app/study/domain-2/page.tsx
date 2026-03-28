import Link from "next/link"
import { domains, domainColorMap } from "@/content/domains"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle } from "lucide-react"

export default function Domain2Page() {
  const domain = domains[1]
  const colors = domainColorMap[domain.color]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-2">
        <Badge className={`${colors.badge} mb-3`}>Domain {domain.id} · {domain.weight}% of exam</Badge>
        <h1 className="text-3xl font-bold">{domain.name}</h1>
        <p className="text-muted-foreground mt-2">{domain.description}</p>
      </div>

      <div className="my-6 p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">0 / {domain.topics.length} topics</span>
        </div>
        <Progress value={0} />
      </div>

      <h2 className="text-xl font-semibold mb-4">Topics</h2>
      <div className="grid gap-3">
        {domain.topics.map((topic) => (
          <Link key={topic.slug} href={`/study/${domain.slug}/${topic.slug}`}>
            <Card className="border hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-muted-foreground/30" />
                  <span className="font-medium group-hover:text-primary transition-colors">{topic.title}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {topic.estimatedMinutes} min
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
