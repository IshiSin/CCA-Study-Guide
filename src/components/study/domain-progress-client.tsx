'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import type { Domain } from '@/lib/types'

interface DomainProgressClientProps {
  domain: Domain
}

export function DomainProgressClient({ domain }: DomainProgressClientProps) {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const progress = getProgress()
    const done = new Set<string>()
    for (const [key, val] of Object.entries(progress.topicProgress)) {
      if (val.completed) done.add(key)
    }
    setCompletedSlugs(done)
  }, [])

  const completedCount = domain.topics.filter(t =>
    completedSlugs.has(`${domain.slug}/${t.slug}`)
  ).length
  const percent = domain.topics.length > 0
    ? Math.round((completedCount / domain.topics.length) * 100)
    : 0

  return (
    <>
      {/* Progress bar */}
      <div className="my-6 p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completedCount} / {domain.topics.length} topics</span>
        </div>
        <Progress value={percent} />
      </div>

      {/* Topic list */}
      <h2 className="text-xl font-semibold mb-4">Topics</h2>
      <div className="grid gap-3">
        {domain.topics.map((topic) => {
          const isDone = completedSlugs.has(`${domain.slug}/${topic.slug}`)
          return (
            <Link key={topic.slug} href={`/study/${domain.slug}/${topic.slug}`}>
              <Card className="border hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={cn(
                      'h-4 w-4 transition-colors',
                      isDone ? 'text-emerald-400' : 'text-muted-foreground/30'
                    )} />
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {topic.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {topic.estimatedMinutes} min
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </>
  )
}
