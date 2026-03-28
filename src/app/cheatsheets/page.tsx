import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export default function CheatsheetsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cheatsheets</h1>
        <p className="text-muted-foreground">Quick-reference summaries for all exam domains</p>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Coming Soon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Printable cheatsheets condensing the most important concepts, patterns, and anti-patterns
            from each domain. Perfect for last-minute review before the exam.
          </p>
          <div className="flex flex-wrap gap-2">
            {["API reference", "Pattern library", "Anti-pattern guide", "Decision trees"].map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
