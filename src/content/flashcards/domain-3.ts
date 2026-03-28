import type { Flashcard } from "@/lib/types"

export const flashcards: Flashcard[] = [
  // ── CLAUDE.md Hierarchy ──────────────────────────────────────────────────
  {
    id: "d3-fc1",
    domainId: 3,
    front: "What are the three levels of the CLAUDE.md hierarchy and their precedence?",
    back: "1. Global (~/.claude/CLAUDE.md) — applies to all projects on the machine\n2. Project (./CLAUDE.md) — applies to the current project (checked into git)\n3. Subdirectory (./src/CLAUDE.md) — applies when working in that directory\n\nPrecedence: more specific wins. Subdirectory > Project > Global.\n\nAll three are loaded and merged — they're additive, not exclusive.",
    tags: ["claude-md-hierarchy"],
  },
  {
    id: "d3-fc2",
    domainId: 3,
    front: "What types of content should go in a project CLAUDE.md?",
    back: "Best candidates for CLAUDE.md:\n- Build/test/deploy commands (npm run test, etc.)\n- Code style conventions and naming rules\n- Architecture overview (what's where, key patterns)\n- What NOT to touch (legacy code, generated files)\n- Security/safety rules specific to this codebase\n- Links to key documentation\n\nNot in CLAUDE.md:\n- Secrets or credentials\n- Per-user preferences (use global CLAUDE.md)\n- Task-specific instructions (put in the prompt)",
    tags: ["claude-md-hierarchy"],
  },
  {
    id: "d3-fc3",
    domainId: 3,
    front: "When is a subdirectory CLAUDE.md useful?",
    back: "When a subdirectory has materially different conventions from the rest of the project.\n\nExamples:\n- /scripts/ — 'These are bash scripts, not Node.js. Run with sh, not node.'\n- /legacy/ — 'This code is deprecated. Do not modify. Read-only reference only.'\n- /infra/ — 'Terraform files. Never run terraform apply without explicit confirmation.'\n- /frontend/ — 'This uses Vue 3 Composition API, not React. Different conventions apply.'\n\nDon't use subdirectory CLAUDE.md just to repeat what's in the project CLAUDE.md.",
    tags: ["claude-md-hierarchy"],
  },
  {
    id: "d3-fc4",
    domainId: 3,
    front: "Is CLAUDE.md checked into source control? Should it be?",
    back: "Project CLAUDE.md: YES — commit it. It's shared team context. Every team member and CI run benefits from it.\n\nGlobal (~/.claude/CLAUDE.md): NO — it's personal, on your local machine.\n\nCLAUDE.md is like a README for Claude — it should evolve with the codebase, be reviewed in PRs, and be treated as important documentation.",
    tags: ["claude-md-hierarchy"],
  },

  // ── Slash Commands ───────────────────────────────────────────────────────
  {
    id: "d3-fc5",
    domainId: 3,
    front: "Where do slash commands live and how are they invoked?",
    back: "Location: .claude/commands/*.md (project-level) or ~/.claude/commands/*.md (global)\n\nInvocation: type /filename in Claude Code (without the .md extension)\nExample: .claude/commands/review-pr.md → /review-pr\n\nClaude Code shows all available commands when you type /\n\nThey're just Markdown prompt files — Claude reads them and executes accordingly.",
    tags: ["slash-commands"],
  },
  {
    id: "d3-fc6",
    domainId: 3,
    front: "What is the $ARGUMENTS placeholder in slash commands?",
    back: "$ARGUMENTS is a special placeholder in slash command files that gets replaced with whatever the user types after the command name.\n\nExample command file (.claude/commands/explain.md):\n'Explain this concept in simple terms: $ARGUMENTS'\n\nUsage: /explain dependency injection\n→ Claude receives: 'Explain this concept in simple terms: dependency injection'\n\nAllows one command to be parameterized rather than needing one command per use case.",
    tags: ["slash-commands"],
  },
  {
    id: "d3-fc7",
    domainId: 3,
    front: "What is the difference between a slash command and an agent skill?",
    back: "Slash commands: simple prompt files, always manually invoked by typing /command-name\n- No metadata, no trigger conditions\n- Just a prompt template with optional $ARGUMENTS\n\nSkills: structured prompt files with trigger conditions and optional personas\n- Can be invoked manually (like slash commands)\n- Can also auto-activate based on trigger descriptions\n- Claude reads trigger conditions and decides when to apply the skill automatically\n\nBoth live in .claude/commands/ — skills have more structure.",
    tags: ["slash-commands", "agent-skills"],
  },

  // ── Agent Skills ─────────────────────────────────────────────────────────
  {
    id: "d3-fc8",
    domainId: 3,
    front: "What makes a skill trigger condition effective?",
    back: "Effective trigger conditions:\n- Specific: describes exactly what user inputs activate this skill\n- Natural language: Claude reads and matches against them\n- Include synonyms and phrasings users actually type\n\nExample:\n'Use this skill when the user shares an error message, stack trace, or exception. Also trigger when they ask 'why is this failing?' or describe unexpected behavior.'\n\nIneffective: 'Use this skill for coding tasks' (too broad, ambiguous activation)",
    tags: ["agent-skills"],
  },
  {
    id: "d3-fc9",
    domainId: 3,
    front: "Can a skill adopt a specialized persona? How?",
    back: "Yes. Start the skill file with a role statement:\n\n```markdown\nYou are a security engineer reviewing code exclusively for security issues.\nIgnore style, performance, and non-security concerns.\n\nUse this skill when the user asks for a security review...\n```\n\nThe persona scopes Claude's focus — the security engineer skill won't comment on naming conventions. This is more reliable than asking Claude to 'focus only on security' in a general session.",
    tags: ["agent-skills"],
  },
  {
    id: "d3-fc10",
    domainId: 3,
    front: "What context does a skill have access to automatically?",
    back: "A skill inherits everything in CLAUDE.md automatically.\n\nThis means:\n- Project commands (npm run test, etc.)\n- Code conventions and architecture context\n- Any rules or constraints defined in CLAUDE.md\n\nYou don't need to repeat project context inside skill files. Write skills to define WHAT TO DO — let CLAUDE.md define the environment.\n\nSkills also have access to the current conversation context and any attached files.",
    tags: ["agent-skills"],
  },

  // ── Plan Mode ────────────────────────────────────────────────────────────
  {
    id: "d3-fc11",
    domainId: 3,
    front: "What does Plan Mode do and how do you activate it?",
    back: "Plan Mode separates reasoning from acting:\n- Claude reads files, thinks, and describes its approach\n- Claude does NOT write files, run commands, or take actions with side effects\n\nActivation: Shift+Tab toggles Plan Mode on/off in Claude Code\n\nWhen active: Claude Code shows a visual indicator\n\nUse case: review the plan before any changes are made, especially for large refactors or destructive operations.",
    tags: ["plan-mode"],
  },
  {
    id: "d3-fc12",
    domainId: 3,
    front: "What can Claude do in Plan Mode vs. what is blocked?",
    back: "Allowed:\n- Read files (reads are not side effects)\n- Search/grep the codebase\n- Describe the planned approach\n- Ask clarifying questions\n\nBlocked:\n- Edit or create files\n- Run shell commands (could have side effects)\n- Any action that mutates state\n\nKey insight: reads are allowed because they have no side effects. Plan Mode blocks write-side tools.",
    tags: ["plan-mode"],
  },
  {
    id: "d3-fc13",
    domainId: 3,
    front: "Is Plan Mode a guarantee that Claude will execute exactly as planned?",
    back: "No — it's an alignment checkpoint, not a contract.\n\nWhen Claude exits Plan Mode and executes:\n- It may encounter new information (files differ from expected)\n- A test may fail, requiring a different approach\n- Claude adapts based on actual execution, not just the plan\n\nThe plan is a shared understanding of intent, not a rigid script. It reduces surprises but doesn't eliminate all of them.\n\nUse Plan Mode for: getting alignment before starting, not for guaranteeing exact steps.",
    tags: ["plan-mode"],
  },

  // ── CI/CD Integration ────────────────────────────────────────────────────
  {
    id: "d3-fc14",
    domainId: 3,
    front: "What flag runs Claude Code non-interactively?",
    back: "-p (short for --print): runs a single prompt and exits\n\n```bash\nclaude -p 'Review the staged changes and list bugs'\n```\n\nOutput: goes to stdout\nExit code: 0 on success, non-zero on failure\n\nUsed in: CI/CD pipelines, GitHub Actions, cron jobs, any context without a human at the keyboard.",
    tags: ["ci-cd-integration"],
  },
  {
    id: "d3-fc15",
    domainId: 3,
    front: "What are the three --output-format options and when to use each?",
    back: "text (default): plain text output\n→ Human-readable logs, simple scripts\n\njson: complete response as one JSON object after completion\n→ Downstream parsing, when you need the full result before proceeding\n\nstream-json: newline-delimited JSON events as they happen\n→ Real-time monitoring, progress feedback, long-running tasks\n\nKey distinction: json waits for completion then emits once; stream-json emits continuously.",
    tags: ["ci-cd-integration"],
  },
  {
    id: "d3-fc16",
    domainId: 3,
    front: "What does --allowedTools do in non-interactive mode and why is it important?",
    back: "--allowedTools grants specific tool permissions without asking for confirmation.\n\nIn CI, there's no human to approve tool calls — you must pre-grant permissions.\n\nExamples:\n```bash\n# Code review — read only\nclaude -p '...' --allowedTools 'Read,Glob,Grep'\n\n# Auto-fix — editing allowed\nclaude -p '...' --allowedTools 'Read,Edit,Glob'\n```\n\nPrinciple: grant only what the task needs. A code review task doesn't need Edit or Bash.",
    tags: ["ci-cd-integration"],
  },
  {
    id: "d3-fc17",
    domainId: 3,
    front: "What is --max-turns in Claude Code non-interactive mode?",
    back: "--max-turns N limits the number of back-and-forth turns Claude takes in non-interactive mode.\n\n```bash\nclaude -p 'Fix failing tests' --max-turns 10\n```\n\nPrevents runaway loops in automated contexts — if Claude can't complete in N turns, it stops rather than running indefinitely.\n\nChoosing N: simple tasks (1-3 turns), complex tasks (5-15 turns), open-ended (20+). Default is usually sufficient; set explicitly for predictable CI costs.",
    tags: ["ci-cd-integration"],
  },

  // ── MCP Configuration ────────────────────────────────────────────────────
  {
    id: "d3-fc18",
    domainId: 3,
    front: "What are the two levels of MCP server configuration in Claude Code?",
    back: "Global: ~/.claude/settings.json\n→ Available in all projects on the machine\n→ For personal tools: notes, personal calendar, global search\n\nProject: .claude/settings.json (in the project root)\n→ Available only in that project\n→ For project tools: project database, project-specific APIs\n→ Should be committed to git (shared with team)\n\nProject config takes precedence for conflicting server names.",
    tags: ["mcp-config"],
  },
  {
    id: "d3-fc19",
    domainId: 3,
    front: "How do you pass environment variables (like API keys) to an MCP server?",
    back: "In settings.json, use the 'env' field:\n\n```json\n{\n  'mcpServers': {\n    'my-api-server': {\n      'command': 'python',\n      'args': ['server.py'],\n      'env': {\n        'API_KEY': 'sk-...',\n        'BASE_URL': 'https://api.example.com'\n      }\n    }\n  }\n}\n```\n\nNever hardcode API keys in the server code — use environment variables. For shared settings.json, use a .env file pattern or CI secrets.",
    tags: ["mcp-config"],
  },
  {
    id: "d3-fc20",
    domainId: 3,
    front: "What is the difference between stdio and SSE transport for MCP servers in settings.json?",
    back: "stdio transport: Claude Code spawns the server as a subprocess\n```json\n{ 'command': 'python', 'args': ['server.py'] }\n```\n→ Server starts/stops with Claude Code\n→ Communication via stdin/stdout\n→ Local-only\n\nSSE transport: server runs independently, Claude Code connects via HTTP\n```json\n{ 'url': 'http://localhost:8080/sse' }\n```\n→ Server can serve multiple clients\n→ Can be remote\n→ Must be running before Claude Code connects",
    tags: ["mcp-config"],
  },

  // ── Cross-Topic ──────────────────────────────────────────────────────────
  {
    id: "d3-fc21",
    domainId: 3,
    front: "Why should you commit CLAUDE.md to git but NOT commit .claude/settings.json with hardcoded secrets?",
    back: "CLAUDE.md: contains instructions and context — no secrets, safe to commit. Team benefits from shared context.\n\nsettings.json with secrets: API keys in version control are a security vulnerability. Anyone with repo access (including CI, forks) would have your API keys.\n\nSolution:\n- Commit settings.json without secrets (use env var references)\n- Store actual secrets in CI environment variables or a secrets manager\n- Use .env files (gitignored) for local development",
    tags: ["claude-md-hierarchy", "mcp-config"],
  },
  {
    id: "d3-fc22",
    domainId: 3,
    front: "What is the JSON output schema from claude -p with --output-format json?",
    back: "```json\n{\n  'result': 'string — Claude's response text',\n  'cost_usd': 0.0023,\n  'duration_ms': 4200,\n  'turns': 3,\n  'session_id': 'sess_abc123'\n}\n```\n\nTo extract just the result in a shell pipeline:\n```bash\nclaude -p '...' --output-format json | jq -r '.result'\n```",
    tags: ["ci-cd-integration"],
  },
  {
    id: "d3-fc23",
    domainId: 3,
    front: "Can skills in .claude/commands/ be shared across the team? How?",
    back: "Yes — .claude/commands/ is a directory in the project repository.\n\nWhen committed to git:\n- New team members clone the repo and immediately have all skills\n- Changes to skills go through normal PR review\n- Skills evolve alongside the codebase\n- CI/CD can also use skills via claude -p with custom prompts\n\nThis is a key advantage: skills are team workflows, not personal shortcuts.",
    tags: ["agent-skills"],
  },
  {
    id: "d3-fc24",
    domainId: 3,
    front: "What environment variable is required for Claude Code non-interactive (CI) use?",
    back: "ANTHROPIC_API_KEY — must be set in the environment.\n\n```bash\nexport ANTHROPIC_API_KEY='sk-ant-...'\nclaude -p 'Your prompt here'\n```\n\nIn GitHub Actions:\n```yaml\nenv:\n  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n```\n\nOptional overrides:\n- ANTHROPIC_MODEL — override default model\n- ANTHROPIC_BASE_URL — proxy/custom endpoint",
    tags: ["ci-cd-integration"],
  },
  {
    id: "d3-fc25",
    domainId: 3,
    front: "What is the global ~/.claude/CLAUDE.md best used for?",
    back: "Personal preferences that apply across all projects:\n- Your preferred code style\n- Languages you know vs. are learning\n- Personal workflow preferences ('always explain before editing')\n- Global safety rules ('never push to main directly')\n- Personal context ('I use zsh, not bash')\n\nNot for:\n- Project-specific conventions (use project CLAUDE.md)\n- Team-shared context (commit to project CLAUDE.md)\n- Secrets (never in any CLAUDE.md)\n\nThink of it as your personal AI onboarding doc.",
    tags: ["claude-md-hierarchy"],
  },
]
