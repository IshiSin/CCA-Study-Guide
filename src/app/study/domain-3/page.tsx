import { domains, domainColorMap } from "@/content/domains"
import { Badge } from "@/components/ui/badge"
import { DomainProgressClient } from "@/components/study/domain-progress-client"

export default function Domain3Page() {
  const domain = domains[2]
  const colors = domainColorMap[domain.color]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-2">
        <Badge className={`${colors.badge} mb-3`}>Domain {domain.id} · {domain.weight}% of exam</Badge>
        <h1 className="text-3xl font-bold">{domain.name}</h1>
        <p className="text-muted-foreground mt-2">{domain.description}</p>
      </div>
      <DomainProgressClient domain={domain} />
    </div>
  )
}
