import { createAnthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

const anthropic = createAnthropic()

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a helpful study assistant for the Claude Certified Associate (CCA) exam.
You help students understand agentic AI concepts, Claude's architecture, tool use, MCP, prompt engineering, and context management.
Keep answers concise and exam-focused. Reference the five exam domains when relevant:
1. Agentic Architecture & Orchestration (27%)
2. Tool Design & MCP Integration (18%)
3. Claude Code Configuration & Workflows (20%)
4. Prompt Engineering & Structured Output (20%)
5. Context Management & Reliability (15%)`,
    messages,
  })

  return result.toDataStreamResponse()
}
