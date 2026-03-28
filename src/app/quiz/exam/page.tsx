import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ExamPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Full Mock Exam</h1>
        <p className="text-muted-foreground">60 questions · 120 minutes · All domains · 70% passing</p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Mock Exam Coming Soon</CardTitle>
              <CardDescription>Full timed exam mode is being built</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            The full mock exam will simulate the actual CCA exam experience with a 120-minute timer,
            60 questions across all 5 domains weighted by exam percentages, and a detailed score report.
          </p>
          <Button asChild variant="outline">
            <Link href="/quiz">Take a Domain Quiz Instead</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
