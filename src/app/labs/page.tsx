import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlaskConical } from "lucide-react"

export default function LabsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hands-on Labs</h1>
        <p className="text-muted-foreground">Practical coding exercises to reinforce exam concepts</p>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Coming Soon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            9 hands-on labs covering real implementation scenarios. Each lab includes a starter file,
            objectives, and a complete reference solution.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Build an MCP server", "Implement agentic loops", "Structured output validation", "Prompt caching", "Context summarization"].map((l) => (
              <Badge key={l} variant="secondary">{l}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
