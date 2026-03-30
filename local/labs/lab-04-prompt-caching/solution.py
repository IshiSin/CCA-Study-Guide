"""
Lab 04: Prompt Caching — SOLUTION
===================================
When use_cache=True, the system parameter becomes a list of content blocks
instead of a plain string. The cache_control field marks the block as
ephemeral, meaning the platform will cache it for ~5 minutes.

On the first call: cache_creation_input_tokens > 0, cache_read_input_tokens = 0.
On subsequent calls with the same cached block: cache_read_input_tokens > 0.
"""

import anthropic

client = anthropic.Anthropic()

LONG_SYSTEM_PROMPT = """
You are a helpful assistant for Acme Corp's internal developer platform.

## Platform Overview
The Acme Developer Platform (ADP) is a unified interface for deploying, monitoring,
and scaling microservices. It supports Kubernetes-native workloads, serverless
functions, and traditional VM-based deployments. Teams interact with it through
the ADP CLI, the web console, or the REST API.

## Authentication
All API requests require a Bearer token. Tokens are issued by the Identity Service
and expire after 8 hours. To refresh a token, call POST /auth/refresh with your
current token in the Authorization header. Tokens carry scopes: read, write, deploy,
and admin. Most operations require at least write scope.

## Deployments
A Deployment describes the desired state of a service: the container image, replica
count, resource limits, environment variables, and health-check configuration.
Submit a deployment via POST /deployments with a JSON body matching the DeploymentSpec
schema. The platform validates the spec, schedules the rollout, and returns a
deployment ID. Poll GET /deployments/{id} for status. Terminal statuses are:
RUNNING, FAILED, and CANCELLED.

### Rolling Updates
By default, ADP performs rolling updates: it brings up new pods before tearing down
old ones, so traffic is never interrupted. You can override this with the
rollout_strategy field: "recreate" stops all old pods first (causes downtime but
uses fewer resources during the update), or "blue_green" spins up a full new
environment before switching the load balancer (zero downtime, but doubles resource
usage temporarily).

## Networking
Each service gets a stable internal DNS name: <service-name>.<namespace>.svc.cluster.
External traffic is routed through the Ingress controller. To expose a service
externally, create an Ingress rule via POST /ingress with the service name, port,
and hostname. TLS termination is handled automatically if you set tls: true; the
platform fetches a certificate from Let's Encrypt.

## Observability
Metrics are collected automatically for all services. View them in the console under
the Metrics tab or query them via GET /metrics/{service-name}. The platform emits
latency (p50/p95/p99), error rate, and throughput. Logs are streamed to the central
log aggregator; query via GET /logs/{service-name}?since=<ISO8601>.

Distributed traces are available if your service emits OpenTelemetry spans. The
platform auto-injects the OTEL_EXPORTER_OTLP_ENDPOINT environment variable.

## Databases
Managed databases (Postgres, MySQL, Redis) can be provisioned via POST /databases.
The platform creates the instance, sets up automated backups (daily snapshots, 30-day
retention), and injects connection credentials as environment variables into any
service that lists the database in its dependencies field.

## Secrets
Store sensitive values in the Secrets Vault: POST /secrets/{name} with the value.
Reference them in a DeploymentSpec as {"secretRef": "<name>"}. Secrets are encrypted
at rest with AES-256 and decrypted only at pod startup. They are never logged.

## Autoscaling
Horizontal Pod Autoscaler (HPA) rules can be attached to any deployment. Specify
min_replicas, max_replicas, and a target metric (cpu_percent, memory_percent, or a
custom Prometheus metric). The platform evaluates the rule every 15 seconds.

## CLI Reference (abbreviated)
  adp login                     Authenticate and store token
  adp deploy <spec.yaml>        Submit a deployment
  adp rollback <id>             Roll back to previous version
  adp logs <service>            Tail logs
  adp exec <service> -- <cmd>   Run command in a running pod
  adp secrets set <name>        Interactively set a secret

## Cost Model
Resources are billed per vCPU-hour and GB-hour. Spot instances cost 60% less but
may be preempted. Reserved capacity (1-year commitment) costs 40% less than on-demand.
Egress within the same region is free; cross-region egress is $0.02/GB.

## Support
Open tickets via the console or email platform-support@acme.example. P1 incidents
(production down) are responded to within 15 minutes; P2 within 2 hours; P3 within
1 business day.

## Glossary
  ADP       Acme Developer Platform
  HPA       Horizontal Pod Autoscaler
  OTEL      OpenTelemetry
  SLO       Service Level Objective
  VPC       Virtual Private Cloud
""".strip()


def ask_question(question: str, use_cache: bool = True) -> dict:
    """
    Ask a question and return the answer along with token usage details.

    cache_control must be on the content block, not the top-level parameter.
    The system parameter becomes a list when caching is used.
    """
    if use_cache:
        # List form: each element is a content block with an optional cache_control.
        # "ephemeral" means the cache lives for ~5 minutes.
        system_param: object = [
            {
                "type": "text",
                "text": LONG_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ]
    else:
        # Plain string — no caching, all tokens are computed fresh every time.
        system_param = LONG_SYSTEM_PROMPT

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        system=system_param,  # type: ignore
        messages=[{"role": "user", "content": question}],
    )

    return {
        "text": response.content[0].text,
        "input_tokens": response.usage.input_tokens,
        # These attributes exist only when caching is enabled; getattr is safe fallback
        "cache_read_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
        "cache_creation_tokens": getattr(response.usage, "cache_creation_input_tokens", 0),
    }


if __name__ == "__main__":
    print("=== First call (cache creation) ===")
    r1 = ask_question("How do I expose a service externally?", use_cache=True)
    print(r1)

    print("\n=== Second call (should read from cache) ===")
    r2 = ask_question("What autoscaling metrics are supported?", use_cache=True)
    print(r2)

    print("\n=== No cache (all tokens computed fresh) ===")
    r3 = ask_question("What is the cost of spot instances?", use_cache=False)
    print(r3)
