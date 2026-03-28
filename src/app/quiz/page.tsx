import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TerminalCard } from "@/components/ui/terminal-card"
import { Brain, Trophy, Clock } from "lucide-react"
import { domains, domainColorMap } from "@/content/domains"

export default function QuizPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Quizzes</h1>
        <p className="text-muted-foreground font-mono text-sm">{`// Test by domain or run the full mock exam`}</p>
      </div>

      {/* Mock Exam CTA */}
      <TerminalCard
        title="mock-exam.sh"
        accentColor="text-primary"
        className="mb-6 border-primary/30"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded bg-primary/10 border border-primary/20">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-mono font-bold">Full Mock Exam</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                <span className="text-primary">$</span> exam --questions 60 --timer 120 --domains all
              </p>
            </div>
          </div>
          <Button asChild className="font-mono">
            <Link href="/quiz/exam">./run-exam</Link>
          </Button>
        </div>
      </TerminalCard>

      {/* Domain Quizzes */}
      <h2 className="text-xl font-semibold mb-4 font-mono">{`// Domain Quizzes`}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => {
          const colors = domainColorMap[domain.color]
          return (
            <Link key={domain.id} href={`/quiz/domain/${domain.id}`} className="group block">
              <TerminalCard
                title={`domain-${domain.id}-quiz.ts`}
                accentColor={colors.text}
                className="h-full transition-all hover:border-primary/50 cursor-pointer"
              >
                <div className="space-y-2">
                  <Badge className={`${colors.badge} font-mono text-xs`}>
                    Domain {domain.id}
                  </Badge>
                  <p className={`text-sm font-mono font-semibold group-hover:text-primary transition-colors mt-1 ${colors.text}`}>
                    {domain.name}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      12–15 questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~15 min
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground/60 pt-1">
                    <span className="text-primary">$</span> run quiz --domain {domain.id}
                  </p>
                </div>
              </TerminalCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
