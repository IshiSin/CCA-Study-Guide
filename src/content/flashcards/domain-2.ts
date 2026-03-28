import type { Flashcard } from "@/lib/types"

export const flashcards: Flashcard[] = [
  // ── MCP Fundamentals ─────────────────────────────────────────────────────
  {
    id: "d2-fc1",
    domainId: 2,
    front: "What is MCP (Model Context Protocol) and what problem does it solve?",
    back: "MCP is an open protocol that standardizes how AI models connect to external tools and data sources.\n\nProblem it solves: before MCP, every application needed custom integrations to connect Claude to databases, APIs, and tools. MCP provides a universal interface — build one MCP server, connect to any MCP-compatible host.\n\nAnalogy: like USB for AI tools — one standard connector for many devices.",
    tags: ["mcp-fundamentals"],
  },
  {
    id: "d2-fc2",
    domainId: 2,
    front: "What are the three primitive types that MCP servers can expose?",
    back: "1. Tools — executable functions Claude can call\n   Example: search_database(query), send_email(to, subject, body)\n\n2. Resources — data sources Claude can read\n   Example: file contents, database records, API responses\n\n3. Prompts — reusable prompt templates\n   Example: pre-written prompts for common tasks with placeholders\n\nTools are the most commonly tested in the CCA exam.",
    tags: ["mcp-fundamentals"],
  },
  {
    id: "d2-fc3",
    domainId: 2,
    front: "What is the difference between an MCP host and an MCP server?",
    back: "MCP host: the application that embeds Claude and manages MCP connections\nExamples: Claude Code, Claude Desktop, your custom application\n\nMCP server: a process that exposes tools/resources/prompts via the MCP protocol\nExamples: a filesystem server, a database server, a GitHub server\n\nThe host manages the lifecycle of MCP server connections and passes available tools to Claude's context.",
    tags: ["mcp-fundamentals"],
  },
  {
    id: "d2-fc4",
    domainId: 2,
    front: "What transport mechanisms does MCP support?",
    back: "1. stdio — subprocess communication over stdin/stdout\n   Use for: local processes, Claude Code extensions\n\n2. SSE (Server-Sent Events) — HTTP-based streaming\n   Use for: remote servers, web-accessible services, multi-client scenarios\n\nstdio: simpler, lower latency for local tools\nSSE: enables remote MCP servers accessible over the network",
    tags: ["mcp-fundamentals"],
  },

  // ── Tool Descriptions ────────────────────────────────────────────────────
  {
    id: "d2-fc5",
    domainId: 2,
    front: "What makes a tool description effective vs. ineffective?",
    back: "Effective:\n- States clearly WHAT the tool does, WHEN to use it, and WHAT it returns\n- Includes units, formats, constraints (e.g., 'date in YYYY-MM-DD format')\n- Notes side effects: 'This sends an email — use only when explicitly requested'\n- Short enough to not waste tokens\n\nIneffective:\n- Too vague: 'Gets data'\n- Too verbose: paragraph-long descriptions that obscure the key info\n- Missing format info: 'Returns a date' (what format?)\n\nClaude reads descriptions at inference time to decide which tool to call.",
    tags: ["tool-descriptions"],
  },
  {
    id: "d2-fc6",
    domainId: 2,
    front: "Why are parameter descriptions in tool schemas important?",
    back: "Claude reads parameter descriptions to understand how to populate each parameter correctly.\n\nWithout description: Claude guesses based on parameter name and type — inconsistent results.\n\nWith description:\n```json\n'start_date': {\n  'type': 'string',\n  'description': 'Start of date range in ISO 8601 (YYYY-MM-DD). If only year given, use Jan 1.'\n}\n```\n\nRule: every parameter that has a non-obvious usage should have a description. Don't omit descriptions to save tokens — they pay for themselves in accuracy.",
    tags: ["tool-descriptions"],
  },
  {
    id: "d2-fc7",
    domainId: 2,
    front: "How do you document side effects in a tool description?",
    back: "Include an explicit warning in the tool description:\n\n```json\n{\n  'name': 'send_email',\n  'description': 'Send an email to the specified recipient. WARNING: This action sends a real email and cannot be undone. Only call this tool when the user explicitly requests sending an email.'\n}\n```\n\nClaude treats these warnings seriously — they influence whether and when the tool is called. Side effect warnings are especially important for: sending messages, deleting data, making payments, deploying code.",
    tags: ["tool-descriptions"],
  },

  // ── MCP Servers ──────────────────────────────────────────────────────────
  {
    id: "d2-fc8",
    domainId: 2,
    front: "What is the minimal structure of an MCP server in Python using the SDK?",
    back: "```python\nfrom mcp.server import Server\nfrom mcp.server.stdio import stdio_server\n\napp = Server('my-server')\n\n@app.tool()\nasync def my_tool(param: str) -> str:\n    \"\"\"Tool description for Claude.\"\"\"\n    return f'Result: {param}'\n\nif __name__ == '__main__':\n    import asyncio\n    asyncio.run(stdio_server(app))\n```\n\nKey parts: Server instance, @app.tool() decorator, async function with docstring, stdio_server() for transport.",
    tags: ["mcp-servers"],
  },
  {
    id: "d2-fc9",
    domainId: 2,
    front: "How does the MCP server communicate its available tools to the host?",
    back: "Via the MCP protocol's tool discovery mechanism:\n1. Host connects to MCP server\n2. Host sends `tools/list` request\n3. Server responds with a list of tool definitions (name, description, inputSchema)\n4. Host passes these definitions to Claude as available tools\n\nThis happens at session startup, not per-request. Adding a new tool to the server requires reconnecting (or re-discovering tools).",
    tags: ["mcp-servers"],
  },
  {
    id: "d2-fc10",
    domainId: 2,
    front: "What is the difference between a stateless and stateful MCP server?",
    back: "Stateless: each tool call is independent — no shared memory between calls\n→ Easier to scale, restart, and test\n→ Most MCP servers should be stateless\n\nStateful: the server maintains state between tool calls (e.g., open database connections, session cookies, file handles)\n→ Required when: operations need to be in the same session (e.g., multi-step database transactions)\n→ Risk: state can become stale or corrupt; harder to scale\n\nPrefer stateless; use stateful only when the protocol requires it.",
    tags: ["mcp-servers"],
  },

  // ── MCP Clients ──────────────────────────────────────────────────────────
  {
    id: "d2-fc11",
    domainId: 2,
    front: "How do you configure an MCP server in Claude Code's settings?",
    back: "In `.claude/settings.json` (project-level) or `~/.claude/settings.json` (global):\n\n```json\n{\n  'mcpServers': {\n    'my-server': {\n      'command': 'python',\n      'args': ['path/to/server.py'],\n      'env': { 'API_KEY': 'sk-...' }\n    }\n  }\n}\n```\n\nFor SSE-based servers:\n```json\n{\n  'mcpServers': {\n    'remote-server': {\n      'url': 'http://localhost:8080/sse'\n    }\n  }\n}\n```",
    tags: ["mcp-clients", "mcp-config"],
  },
  {
    id: "d2-fc12",
    domainId: 2,
    front: "What is the lifecycle of an MCP server connection in Claude Code?",
    back: "1. Claude Code starts → reads settings.json for mcpServers\n2. For each server: spawns subprocess (stdio) or connects (SSE)\n3. Sends tools/list to discover available tools\n4. Tools appear in Claude's available tool list for the session\n5. When Claude calls a tool: routes call to correct MCP server\n6. Server executes tool, returns result\n7. Result injected into Claude's context as tool_result\n8. Claude Code exits → MCP server processes are terminated",
    tags: ["mcp-clients"],
  },

  // ── Tool Scoping ─────────────────────────────────────────────────────────
  {
    id: "d2-fc13",
    domainId: 2,
    front: "What is tool scoping and why is it important?",
    back: "Tool scoping: giving Claude only the tools it needs for a specific task, not all available tools.\n\nWhy important:\n1. Security — Claude can't accidentally call tools it shouldn't have access to\n2. Focus — fewer tools reduces decision fatigue and prompt injection attack surface\n3. Cost — tool schemas consume input tokens\n4. Clarity — Claude chooses more accurately when the toolset is purpose-built\n\nIn the API: pass only the relevant subset of tools per request.",
    tags: ["tool-scoping"],
  },
  {
    id: "d2-fc14",
    domainId: 2,
    front: "What is the principle of least privilege applied to tool access?",
    back: "Give each agent/task access only to the tools needed for that specific task — nothing more.\n\nExample:\n- Code review task: Read, Glob, Grep (read-only)\n- Auto-fix task: Read, Edit, Glob (write, no bash)\n- Test runner: Read, Bash (run tests, no edit)\n\nNot: give all tasks access to all tools 'just in case'\n\nBenefit: if the agent misbehaves or is injected, it can only cause damage within its allowed tool scope.",
    tags: ["tool-scoping", "security"],
  },
  {
    id: "d2-fc15",
    domainId: 2,
    front: "How does tool scoping affect Claude's decision-making during tool selection?",
    back: "Claude selects tools based on:\n1. Which tools are available (provided in the API call)\n2. Tool descriptions and how well they match the task\n\nWith a large, undifferentiated toolset: Claude may make suboptimal choices, call wrong tools, or get confused by too many options.\n\nWith a scoped toolset: Claude's choice space is smaller, descriptions are more specific to the task, selection is more accurate.\n\nExam point: tool scoping improves both security AND accuracy.",
    tags: ["tool-scoping"],
  },

  // ── Structured Errors ────────────────────────────────────────────────────
  {
    id: "d2-fc16",
    domainId: 2,
    front: "What should a well-designed tool error response include?",
    back: "A well-designed tool error includes:\n1. error_type — machine-readable error category\n2. message — human-readable description of what went wrong\n3. actionable — what Claude should do next (retry? change parameters? escalate?)\n4. context — relevant data (e.g., which record failed, what constraint was violated)\n\nExample:\n```json\n{\n  'error_type': 'not_found',\n  'message': 'Customer ID 12345 does not exist',\n  'suggestion': 'Verify the customer ID or search by email'\n}\n```",
    tags: ["structured-errors"],
  },
  {
    id: "d2-fc17",
    domainId: 2,
    front: "What is the difference between a hard error and a soft error in tool responses?",
    back: "Hard error: the tool definitively failed — no point retrying without changing something\nExamples: record not found, invalid parameter, permission denied\n→ Return structured error, tell Claude what to do differently\n\nSoft error: transient failure — might succeed if retried\nExamples: network timeout, database locked, rate limited\n→ Return error with retry suggestion and backoff hint\n\nDistinction is important: Claude should retry soft errors but not blindly retry hard errors.",
    tags: ["structured-errors"],
  },
  {
    id: "d2-fc18",
    domainId: 2,
    front: "Why should tools return structured errors rather than raising exceptions?",
    back: "When a tool raises an unhandled exception:\n- The MCP protocol may surface it as a generic 'tool failed' message\n- Claude has no actionable information about what went wrong\n- Claude may retry inappropriately or get confused\n\nWith structured error returns:\n- Claude sees the specific error type and message\n- Claude can make intelligent decisions: retry with different params, escalate, or abort\n- The agent loop remains in control rather than failing opaquely\n\nRule: catch exceptions in tool implementations; return structured error dicts.",
    tags: ["structured-errors"],
  },
  {
    id: "d2-fc19",
    domainId: 2,
    front: "What is 'error propagation' in multi-agent tool chains and how do you handle it?",
    back: "Error propagation: a tool failure at one step causes a cascade of failures downstream.\n\nExample: agent A calls tool → fails → returns generic error → agent B receives no data → B's tool call fails → orchestrator gets corrupted state\n\nHandling:\n1. Each tool returns structured errors, not None/exceptions\n2. Each agent validates tool results before using them\n3. Orchestrator checks for error type before passing results to next agent\n4. Fail fast at the earliest point; don't pass error states downstream as if they were success states",
    tags: ["structured-errors", "failure-recovery"],
  },
  {
    id: "d2-fc20",
    domainId: 2,
    front: "How do you design a tool to handle partial failures gracefully?",
    back: "For tools processing multiple items, return partial success:\n\n```python\nreturn {\n    'succeeded': [\n        {'id': 1, 'result': 'processed'},\n        {'id': 3, 'result': 'processed'}\n    ],\n    'failed': [\n        {'id': 2, 'error': 'invalid_format', 'message': '...'}\n    ],\n    'total': 3,\n    'success_count': 2\n}\n```\n\nThis lets Claude report partial success accurately and retry only the failed items — instead of treating the whole batch as failed.",
    tags: ["structured-errors"],
  },

  // ── Cross-Topic ──────────────────────────────────────────────────────────
  {
    id: "d2-fc21",
    domainId: 2,
    front: "What is the MCP 'resources' primitive and when would you use it instead of a tool?",
    back: "Resources: read-only data that Claude can access without calling a function\nExample: a code file, a database record, documentation pages\n\nUse resources when:\n- The data is static or read-only\n- Claude needs to read and understand content, not trigger computation\n- Multiple tools/contexts might need the same data\n\nUse tools when:\n- Action must be taken (write, compute, call external API)\n- The operation has side effects\n- Parameters determine what gets fetched (dynamic queries)",
    tags: ["mcp-fundamentals", "tool-scoping"],
  },
  {
    id: "d2-fc22",
    domainId: 2,
    front: "What is an MCP 'prompt' primitive and when is it useful?",
    back: "MCP prompts: reusable prompt templates exposed by an MCP server, optionally with arguments.\n\nUseful for:\n- Standardizing complex prompts across teams\n- Providing domain-specific workflow prompts\n- Allowing server-side prompt management (update without client changes)\n\nExample: a 'code_review' prompt template that includes company-specific review criteria, exposed by the MCP server.\n\nDiffers from tools: prompts don't execute logic — they return prompt text for Claude to use.",
    tags: ["mcp-fundamentals"],
  },
  {
    id: "d2-fc23",
    domainId: 2,
    front: "What is the security boundary between Claude Code and an MCP server?",
    back: "MCP servers run as separate processes — they're not trusted extensions of Claude Code.\n\nSecurity implications:\n- MCP servers can only do what their code does — they can't directly read Claude's context\n- Claude Code validates MCP server connections and tool schemas\n- Environment variables (API keys) passed to MCP servers are isolated to that process\n- A compromised MCP server can return malicious tool results (prompt injection)\n\nBest practice: treat MCP server results the same as any external data — potentially untrusted.",
    tags: ["mcp-servers", "security"],
  },
  {
    id: "d2-fc24",
    domainId: 2,
    front: "What is the difference between `tool_choice: 'auto'` and `tool_choice: 'any'` in the API?",
    back: "auto: Claude decides whether to call a tool or respond in prose\n→ Use when: Claude should use tools only when helpful\n\nany: Claude MUST call one of the provided tools (cannot respond in prose)\n→ Use when: you always need structured output, tool call is mandatory\n\nThere's also `tool_choice: {'type': 'tool', 'name': 'specific_tool'}` to force a specific tool.\n\nFor extraction pipelines: always use 'any' to guarantee structured output.",
    tags: ["tool-descriptions", "structured-output"],
  },
  {
    id: "d2-fc25",
    domainId: 2,
    front: "What happens if a tool definition has no 'required' fields listed in its input_schema?",
    back: "If 'required' is omitted or empty, all parameters are treated as optional.\n\nConsequence: Claude may omit parameters that are actually necessary, producing incomplete tool calls that fail at runtime.\n\nFix: explicitly list required parameters:\n```json\n{\n  'type': 'object',\n  'properties': { ... },\n  'required': ['customer_id', 'action']  // These must always be provided\n}\n```\n\nRule: any parameter your tool function requires should be in 'required'.",
    tags: ["tool-descriptions", "mcp-servers"],
  },
]
