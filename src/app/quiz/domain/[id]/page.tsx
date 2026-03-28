import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain } from "lucide-react"
import { domains, domainColorMap } from "@/content/domains"

interface Props {
  params: { id: string }
}

export default function DomainQuizPage({ params }: Props) {
  const domainId = parseInt(params.id)
  const domain = domains.find(d => d.id === domainId)

  if (!domain) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Domain Not Found</h1>
        <Button asChild variant="outline">
          <Link href="/quiz">Back to Quizzes</Link>
        </Button>
      </div>
    )
  }

  const colors = domainColorMap[domain.color]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Badge className={`${colors.badge} mb-3`}>Domain {domain.id}</Badge>
        <h1 className="text-3xl font-bold mb-2">{domain.name} Quiz</h1>
        <p className="text-muted-foreground">12–15 questions · ~15 minutes</p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Quiz Coming Soon</CardTitle>
              <CardDescription>Questions for this domain are being prepared</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This quiz will test your knowledge of {domain.name} with scenario-based questions,
            detailed explanations, and anti-pattern identification.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/quiz">Back to Quizzes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/study/${domain.slug}`}>Study This Domain</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function generateStaticParams() {
  return [1, 2, 3, 4, 5].map(id => ({ id: String(id) }))
}
