import type { Flashcard } from "@/lib/types"

export const flashcards: Flashcard[] = [
  // ── System Prompts ────────────────────────────────────────────────────────
  {
    id: "d4-fc1",
    domainId: 4,
    front: "What are the four layers of a well-structured system prompt, in order?",
    back: "1. Role/Persona — who Claude is\n2. Context/Purpose — what the app does and for whom\n3. Constraints — what Claude must/must not do\n4. Output Format — how responses should be structured",
    tags: ["system-prompts", "structure"],
  },
  {
    id: "d4-fc2",
    domainId: 4,
    front: "What is prompt injection, and how do you prevent it in system prompts?",
    back: "Prompt injection: a malicious user embeds instructions in their input that override your system prompt (e.g., 'Ignore all previous instructions...').\n\nPrevention: keep system prompts static — never interpolate unsanitized user input into the system prompt. Pass dynamic user data as structured content in the human turn.",
    tags: ["system-prompts", "security"],
  },
  {
    id: "d4-fc3",
    domainId: 4,
    front: "What is the difference between a hard constraint and a soft constraint in a system prompt?",
    back: "Hard constraint: never violated — use 'Never...', 'Always...', 'Under no circumstances...'\nExample: 'Never reveal internal pricing.'\n\nSoft constraint: a default with override — use 'By default...', 'Unless asked otherwise...'\nExample: 'By default, respond in English. If the user writes in another language, match it.'",
    tags: ["system-prompts", "constraints"],
  },
  {
    id: "d4-fc4",
    domainId: 4,
    front: "Why should dynamic per-user data stay out of the system prompt, even if it's injected safely?",
    back: "Two reasons:\n1. Security: user-controlled content in the system prompt is a prompt injection attack surface.\n2. Caching: the prompt cache key is the exact bytes of the cached prefix. Any variation (different user IDs) causes a cache miss — you pay the write surcharge with no benefit.",
    tags: ["system-prompts", "prompt-caching"],
  },

  // ── Few-Shot Prompting ────────────────────────────────────────────────────
  {
    id: "d4-fc5",
    domainId: 4,
    front: "Where should few-shot examples be placed in an API call — system prompt or messages array?",
    back: "Messages array, as alternating user/assistant turns:\n\n{role: 'user', content: 'example input'}\n{role: 'assistant', content: 'example output'}\n{role: 'user', content: 'actual input'}\n\nNot in the system prompt — alternating turns leverage conversation structure, which is more reliable.",
    tags: ["few-shot", "api-structure"],
  },
  {
    id: "d4-fc6",
    domainId: 4,
    front: "When instructions and few-shot examples conflict, which does Claude follow?",
    back: "Claude follows the examples.\n\nExamples are demonstration — they override prose instructions. If your system prompt says 'one word only' but examples produce multi-sentence answers, Claude will produce multi-sentence answers.",
    tags: ["few-shot", "behavior"],
  },
  {
    id: "d4-fc7",
    domainId: 4,
    front: "How many few-shot examples are typically sufficient for most tasks?",
    back: "2–5 examples for most tasks. Beyond 5–6, returns diminish rapidly.\n\nIf you need more than 6 examples to get consistent output, the problem is usually the schema or instructions — not the number of examples.",
    tags: ["few-shot", "best-practices"],
  },
  {
    id: "d4-fc8",
    domainId: 4,
    front: "What type of examples should you prioritize in few-shot prompting — obvious cases or edge cases?",
    back: "Edge cases and ambiguous inputs.\n\nObvious cases (clearly positive/negative, clearly one category) are already handled well by zero-shot. Few-shot adds the most value by calibrating Claude on the hard cases where instructions alone are ambiguous.",
    tags: ["few-shot", "example-selection"],
  },

  // ── Structured Output ────────────────────────────────────────────────────
  {
    id: "d4-fc9",
    domainId: 4,
    front: "What is tool_choice: {type: 'any'} and when should you use it?",
    back: "tool_choice: {type: 'any'} forces Claude to call one of the provided tools instead of responding in prose.\n\nUse it whenever you always need structured output — extraction pipelines, classification systems, any context where a prose response is an error condition.",
    tags: ["structured-output", "tool-use"],
  },
  {
    id: "d4-fc10",
    domainId: 4,
    front: "After Claude calls a tool, where is the structured data in the API response?",
    back: "In the tool_use content block's .input property — already a Python dict, no json.loads() needed.\n\nPattern:\ntool_block = next(b for b in response.content if b.type == 'tool_use')\ndata = tool_block.input  # Already a dict",
    tags: ["structured-output", "tool-use", "api"],
  },
  {
    id: "d4-fc11",
    domainId: 4,
    front: "What JSON Schema keyword prevents Claude from inventing values for a constrained field?",
    back: "'enum' — lists the only allowed values:\n\n'priority': {\n  'type': 'string',\n  'enum': ['critical', 'high', 'medium', 'low']\n}\n\nWithout enum, Claude may produce 'urgent', 'p0', 'HIGH', or other variants.",
    tags: ["structured-output", "json-schema"],
  },
  {
    id: "d4-fc12",
    domainId: 4,
    front: "What is the assistant prefill technique and when does it help with JSON output?",
    back: "Add a partial assistant message to start Claude's response:\n\nmessages = [\n  {role: 'user', content: prompt},\n  {role: 'assistant', content: '{'}  # Claude continues from here\n]\n\nUse when you need JSON but can't use tool_use. It guarantees the response starts with '{' — Claude cannot add preamble before the JSON.",
    tags: ["structured-output", "json"],
  },
  {
    id: "d4-fc13",
    domainId: 4,
    front: "When should you use tool_use vs. direct JSON prompting for structured output?",
    back: "tool_use: production extraction pipelines, deep nesting, multiple schemas, need for schema enforcement at the API level.\n\nDirect JSON prompting: streaming contexts, simple schemas (1-2 levels, few fields), contexts where tools API isn't available.\n\nKey difference: tool_use enforces at the protocol level; JSON prompting enforces by instruction only.",
    tags: ["structured-output", "tool-use"],
  },

  // ── Validation & Retry ────────────────────────────────────────────────────
  {
    id: "d4-fc14",
    domainId: 4,
    front: "What are the two stages of output validation and what can fail at each?",
    back: "Stage 1 — Parse: can the text be deserialized? (json.loads() succeeds)\nFailure: invalid JSON syntax, markdown code fences, prose preamble\n\nStage 2 — Validate: does the parsed object match the schema?\nFailure: wrong types, missing required fields, values outside enum, constraint violations",
    tags: ["validation-retry", "validation"],
  },
  {
    id: "d4-fc15",
    domainId: 4,
    front: "Why does retrying with the identical prompt almost never fix a JSON parse error?",
    back: "Claude is approximately deterministic — the same input produces similar outputs. If the first call produced invalid JSON, retrying with the same prompt will likely produce the same invalid JSON.\n\nFix: append the error and bad output to the conversation before retrying. New information → different output.",
    tags: ["validation-retry", "retry"],
  },
  {
    id: "d4-fc16",
    domainId: 4,
    front: "What is the correct error feedback pattern for tool_use validation failures?",
    back: "1. Append the assistant's tool_use response to the conversation\n2. Append a tool_result message with is_error: true\n\n{role: 'user', content: [{\n  type: 'tool_result',\n  tool_use_id: tool_block.id,\n  content: 'Validation failed: {error}. Please re-extract.',\n  is_error: True\n}]}\n\nThis maintains protocol-correct conversation structure.",
    tags: ["validation-retry", "tool-use"],
  },
  {
    id: "d4-fc17",
    domainId: 4,
    front: "How do you handle rate limit errors (429) vs. validation errors in a retry loop?",
    back: "Rate limit (429): wait with exponential backoff + jitter, then retry the SAME request. Do NOT extend the conversation.\n\nValidation error: extend the conversation with error feedback, then retry. Do NOT simply wait.\n\nKey: rate limits are transient capacity issues; validation errors are content problems requiring new information.",
    tags: ["validation-retry", "error-handling"],
  },
  {
    id: "d4-fc18",
    domainId: 4,
    front: "What should a batch processing pipeline do when it hits the max retry limit for one document?",
    back: "Return a failure sentinel and continue processing the rest of the batch — don't abort the entire pipeline.\n\nOptions:\n1. Return ExtractionResult(success=False, error=msg, data=None)\n2. Send to human review queue\n3. Log to a failures file for later analysis\n\nNever silently return None or {} — callers need to know extraction failed.",
    tags: ["validation-retry", "batch-processing"],
  },

  // ── Batch API ─────────────────────────────────────────────────────────────
  {
    id: "d4-fc19",
    domainId: 4,
    front: "What are the Batch API limits and cost characteristics?",
    back: "Limits:\n- Max 10,000 requests per batch\n- Max 32 MB batch size\n- Results expire after 29 days\n\nCost:\n- ~50% reduction vs. synchronous API\n- Tradeoff: results in minutes to hours, not milliseconds",
    tags: ["batch-api", "limits"],
  },
  {
    id: "d4-fc20",
    domainId: 4,
    front: "What are the three Batch API result types and how should each be handled?",
    back: "succeeded: request completed. Extract from result.message.content[0].text\n\nerrored: API error (invalid request, content policy). Log error for that custom_id, continue processing others.\n\nexpired: request timed out within the batch. Retry this specific request in a new batch.",
    tags: ["batch-api", "results"],
  },
  {
    id: "d4-fc21",
    domainId: 4,
    front: "What does the custom_id field do in a Batch API request?",
    back: "custom_id is a developer-supplied identifier that matches results back to inputs.\n\nBatch results can arrive in any order — the custom_id is the only way to know which result corresponds to which input document.\n\nMust be unique within the batch.",
    tags: ["batch-api", "api-structure"],
  },
  {
    id: "d4-fc22",
    domainId: 4,
    front: "What processing_status values indicate a batch is still running vs. complete?",
    back: "In progress: processing_status == 'in_progress'\n\nComplete: processing_status == 'ended'\n\nPoll with client.beta.messages.batches.retrieve(batch_id) until status == 'ended', then call .results() to stream results.",
    tags: ["batch-api", "polling"],
  },

  // ── Prompt Caching ────────────────────────────────────────────────────────
  {
    id: "d4-fc23",
    domainId: 4,
    front: "How do you mark content for prompt caching in the Anthropic API?",
    back: "Add cache_control: {type: 'ephemeral'} to the last content block of the section you want cached:\n\nsystem = [{\n  'type': 'text',\n  'text': 'Your stable system prompt...',\n  'cache_control': {'type': 'ephemeral'}\n}]\n\nEverything up to and including that block is cached.",
    tags: ["prompt-caching", "api"],
  },
  {
    id: "d4-fc24",
    domainId: 4,
    front: "What is the prompt cache TTL and how does it renew?",
    back: "TTL: 5 minutes\nRenewal: refreshed on each cache HIT\n\nFor applications with continuous traffic, the cache stays warm indefinitely. For low-frequency traffic, the cache expires between sessions, and the first request after expiry triggers a cache miss (and a cache write surcharge).",
    tags: ["prompt-caching", "ttl"],
  },
  {
    id: "d4-fc25",
    domainId: 4,
    front: "What is the cost model for prompt caching?",
    back: "Cache write (first request / cache miss): +~25% surcharge on cached input tokens\nCache read (cache hit): ~90% discount on cached input tokens\n\nBreak-even: ~2 requests (1 write + 1 read)\nAt 100+ requests: massive savings on large cached prefixes",
    tags: ["prompt-caching", "cost"],
  },
  {
    id: "d4-fc26",
    domainId: 4,
    front: "What minimum token count is required for content to be eligible for prompt caching?",
    back: "1,024 tokens minimum.\n\nContent shorter than 1,024 tokens is never cached regardless of cache_control settings. The cache_control marker is silently ignored for short content.",
    tags: ["prompt-caching", "limits"],
  },
  {
    id: "d4-fc27",
    domainId: 4,
    front: "How can you verify that prompt caching is working?",
    back: "Check the response usage fields:\n- usage.cache_creation_input_tokens: tokens written to cache (cache miss)\n- usage.cache_read_input_tokens: tokens read from cache (cache hit)\n\nIf cache_read_input_tokens is always 0, the cached prefix is not being reused — usually because it contains dynamic content that changes per request.",
    tags: ["prompt-caching", "debugging"],
  },
  {
    id: "d4-fc28",
    domainId: 4,
    front: "What content should go in the cached section vs. the non-cached section of a prompt?",
    back: "Cache: stable, large content\n- Core system prompt / role\n- Reference documentation\n- Tool definitions\n- Few-shot examples\n- Large context documents (updated infrequently)\n\nDon't cache: dynamic, per-request content\n- User-specific data\n- Per-request metadata\n- The user's query\n- Conversation history (changes every turn)\n- Frequently updated data",
    tags: ["prompt-caching", "design"],
  },
]
