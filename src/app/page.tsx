import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TerminalCard } from "@/components/ui/terminal-card"
import { domains, domainColorMap } from "@/content/domains"

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative px-6 py-16 md:py-24 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30 font-mono">
            $ cca --study-guide
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Master the{" "}
            <span className="text-primary">CCA Exam</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            The only study guide built specifically for the Claude Certified Architect exam.
            Interactive quizzes, flashcards, real-world scenarios, and hands-on labs — everything
            you need to pass with confidence.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">35+</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">study_topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">120+</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">quiz_questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">9</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">hands_on_labs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Cards */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Exam Domains</h2>
              <p className="text-muted-foreground mt-1 font-mono text-sm">{`// 5 domains · full CCA coverage`}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => {
              const colors = domainColorMap[domain.color]
              return (
                <Link key={domain.id} href={`/study/${domain.slug}`} className="group block">
                  <TerminalCard
                    title={`domain-${domain.id}.ts`}
                    accentColor={colors.text}
                    className="h-full transition-all hover:border-primary/50 hover:shadow-primary/10 cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className={`${colors.badge} font-mono text-xs`}>
                          D{domain.id}
                        </Badge>
                        <span className={`text-xs font-mono font-semibold ${colors.text}`}>
                          {domain.weight}%
                        </span>
                      </div>

                      <div>
                        <p className={`text-sm font-mono font-semibold group-hover:text-primary transition-colors ${colors.text}`}>
                          <span className="text-muted-foreground">const </span>
                          domain{domain.id}
                          <span className="text-muted-foreground"> = </span>
                          <span className="text-foreground">&ldquo;</span>
                        </p>
                        <p className="text-xs text-foreground font-mono pl-4 mt-0.5">
                          {domain.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">&rdquo;</p>
                      </div>

                      <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2">
                        {`// ${domain.description}`}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                          <span>{domain.topics.length} topics</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1" />
                      </div>
                    </div>
                  </TerminalCard>
                </Link>
              )
            })}

            {/* Exam weight summary */}
            <TerminalCard title="exam-config.json" accentColor="text-primary">
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  <span className="text-primary">{`{`}</span>
                </p>
                <p className="text-xs font-mono text-muted-foreground pl-2">
                  <span className="text-foreground">&quot;questions&quot;</span>: <span className="text-amber-400">60</span>,
                </p>
                <p className="text-xs font-mono text-muted-foreground pl-2">
                  <span className="text-foreground">&quot;minutes&quot;</span>: <span className="text-amber-400">120</span>,
                </p>
                <p className="text-xs font-mono text-muted-foreground pl-2">
                  <span className="text-foreground">&quot;passing&quot;</span>: <span className="text-amber-400">&quot;70%&quot;</span>,
                </p>
                <p className="text-xs font-mono text-muted-foreground pl-2">
                  <span className="text-foreground">&quot;domains&quot;</span>: <span className="text-primary">{`[`}</span>
                </p>
                {domains.map((d) => {
                  const colors = domainColorMap[d.color]
                  return (
                    <p key={d.id} className="text-xs font-mono pl-4">
                      <span className={colors.text}>&quot;D{d.id}&quot;</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="text-amber-400">{d.weight}</span>
                      <span className="text-muted-foreground">%{d.id < 5 ? ',' : ''}</span>
                    </p>
                  )
                })}
                <p className="text-xs font-mono text-primary pl-2">{`]`}</p>
                <p className="text-xs font-mono text-primary">{`}`}</p>
              </div>
            </TerminalCard>
          </div>
        </div>
      </section>

    </div>
  )
}
