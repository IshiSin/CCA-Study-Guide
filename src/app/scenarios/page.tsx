import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

export default function ScenariosPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scenarios</h1>
        <p className="text-muted-foreground">Real-world system design walkthroughs and decision trees</p>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Coming Soon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Interactive scenario walkthroughs are being built. Each scenario presents a real-world
            architectural challenge and guides you through the decision-making process step by step.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Multi-agent pipeline design", "MCP server architecture", "Context management strategy", "Failure recovery patterns"].map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
