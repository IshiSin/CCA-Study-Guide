import Link from "next/link"
import { domains, domainColorMap } from "@/content/domains"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function StudyPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Study Guide</h1>
        <p className="text-muted-foreground">Choose a domain to start studying</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {domains.map((domain) => {
          const colors = domainColorMap[domain.color]
          return (
            <Link key={domain.id} href={`/study/${domain.slug}`}>
              <Card className="h-full border hover:border-primary/50 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={colors.badge}>Domain {domain.id}</Badge>
                    <span className={`text-sm font-semibold ${colors.text}`}>{domain.weight}% of exam</span>
                  </div>
                  <CardTitle className="mt-2 group-hover:text-primary transition-colors">
                    {domain.name}
                  </CardTitle>
                  <CardDescription>{domain.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{domain.topics.length} topics</span>
                      <span>0% complete</span>
                    </div>
                    <Progress value={0} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
