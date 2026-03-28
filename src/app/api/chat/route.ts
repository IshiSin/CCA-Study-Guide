import { streamText, convertToModelMessages } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const SYSTEM_PROMPT = `You are a concise study assistant for the Claude Certified Architect (CCA) exam.
You help candidates understand concepts across the five exam domains:
1. Agentic Architecture & Orchestration (27%)
2. Tool Design & MCP Integration (18%)
3. Claude Code Configuration & Workflows (20%)
4. Prompt Engineering & Structured Output (20%)
5. Context Management & Reliability (15%)

Keep answers short and focused. Use bullet points for lists. When relevant, note if something is commonly tested on the exam.
If asked something unrelated to the CCA exam or Claude/Anthropic, politely redirect to exam topics.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2"
    const ollama = createOpenAI({
      baseURL: "http://localhost:11434/v1",
      apiKey: "ollama",
    })
    const result = streamText({
      model: ollama(ollamaModel),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(body.messages),
    })
    return result.toUIMessageStreamResponse()
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
