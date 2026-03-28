import type { Flashcard } from "@/lib/types"

export const flashcards: Flashcard[] = [
  // ── Context Window ───────────────────────────────────────────────────────
  {
    id: "d5-fc1",
    domainId: 5,
    front: "What is a context window and why is it a hard constraint?",
    back: "The context window is the total number of tokens Claude can process in a single API call — both input (messages, system prompt, tool results) and output combined.\n\nHard constraint: Claude cannot reference tokens outside the current context window. No memory of prior sessions exists unless you explicitly include it.\n\nCurrent limits vary by model (100K–200K tokens for Claude). Exceeding the limit requires truncation, summarization, or redesign.",
    tags: ["context-window"],
  },
  {
    id: "d5-fc2",
    domainId: 5,
    front: "What counts toward the context window in a typical API call?",
    back: "All of:\n- System prompt\n- All messages in the conversation (user + assistant turns)\n- Tool definitions (JSON schemas)\n- Tool call inputs and results\n- Files or documents attached/injected\n- The response Claude is generating (output tokens)\n\nTotal = input tokens + output tokens ≤ context window limit\n\nFor long agentic loops: tool results accumulate rapidly. Each tool call adds input+output tokens to the growing context.",
    tags: ["context-window"],
  },
  {
    id: "d5-fc3",
    domainId: 5,
    front: "What is the difference between input tokens and output tokens, and how are they priced differently?",
    back: "Input tokens: tokens Claude reads — system prompt, messages, tool results, documents\n→ Charged at the input token rate (lower)\n\nOutput tokens: tokens Claude generates — its response text, tool calls\n→ Charged at the output token rate (higher, typically 3-5x input)\n\nImplication: long chain-of-thought responses or verbose tool calls cost more. Design prompts to elicit concise, structured outputs when cost matters.",
    tags: ["context-window"],
  },

  // ── Context Degradation ──────────────────────────────────────────────────
  {
    id: "d5-fc4",
    domainId: 5,
    front: "What is context degradation and when does it occur?",
    back: "Context degradation: Claude's performance on a task decreases as the context window fills with previous conversation, tool results, and irrelevant content.\n\nOccurs when:\n- A long agentic loop accumulates many tool results\n- Multi-turn conversations grow very long\n- Large documents are injected without pruning\n\nSymptoms:\n- Claude 'forgets' earlier instructions or constraints\n- Responses become less focused or accurate\n- Claude references the wrong parts of context",
    tags: ["context-degradation"],
  },
  {
    id: "d5-fc5",
    domainId: 5,
    front: "What is the 'lost in the middle' problem?",
    back: "Claude (like most LLMs) attends more reliably to content at the beginning and end of the context window than to content in the middle.\n\nWhen context is very long:\n- Instructions at the very start of the system prompt: high attention\n- Content in the middle: lower attention, more likely to be 'forgotten'\n- Most recent content: high attention\n\nImplication: put your most critical instructions at the start of the system prompt (or at the end of the last user message), not buried in the middle.",
    tags: ["context-degradation"],
  },
  {
    id: "d5-fc6",
    domainId: 5,
    front: "What strategies reduce context degradation in long agentic loops?",
    back: "1. Compress completed steps: summarize intermediate results, discard raw tool outputs\n2. Store externally: write intermediate results to files/DB, reference by ID not full content\n3. Checkpoint + restart: save state, start a fresh session with compact summary\n4. Prune irrelevant history: remove tool call/result pairs that are no longer needed\n5. Use targeted retrieval: don't load full documents — retrieve only relevant chunks",
    tags: ["context-degradation"],
  },

  // ── Escalation Design ────────────────────────────────────────────────────
  {
    id: "d5-fc7",
    domainId: 5,
    front: "What is escalation in an agentic system?",
    back: "Escalation: the agent pauses autonomous operation and requests human input or higher-authority approval before proceeding.\n\nNot the same as failure — escalation is a designed decision point.\n\nWhen to escalate:\n- Irreversible action about to be taken\n- Confidence below threshold\n- Unexpected state or ambiguity\n- Task scope exceeds what the agent was authorized for\n\nEscalation is a feature, not a bug — it keeps humans appropriately in control.",
    tags: ["escalation-design"],
  },
  {
    id: "d5-fc8",
    domainId: 5,
    front: "What should an escalation message include?",
    back: "An effective escalation message includes:\n1. What the agent was doing (context)\n2. What it found / what decision point it reached\n3. Why it's escalating (specific uncertainty or constraint)\n4. The options available (with tradeoffs)\n5. What it needs from the human (approve option A/B, provide missing info, etc.)\n\nPoor escalation: 'I'm not sure what to do. Please help.'\nGood escalation: 'I was about to delete 1,247 records matching X. This is irreversible. Should I proceed? (Yes/No, or provide a filter to narrow the set)'",
    tags: ["escalation-design"],
  },
  {
    id: "d5-fc9",
    domainId: 5,
    front: "What is a 'confidence threshold' in escalation design?",
    back: "A confidence threshold is a defined minimum confidence level below which the agent escalates rather than proceeding autonomously.\n\nExample:\n- If Claude is >90% confident in its classification → proceed\n- If 70-90% → flag for review but continue\n- If <70% → halt and escalate\n\nThresholds are domain-dependent:\n- Medical diagnosis: escalate at any uncertainty\n- Document categorization: proceed unless very uncertain\n\nThe threshold defines the human-in-the-loop boundary for that use case.",
    tags: ["escalation-design"],
  },

  // ── Human-in-the-Loop ────────────────────────────────────────────────────
  {
    id: "d5-fc10",
    domainId: 5,
    front: "What is the spectrum of human-in-the-loop involvement?",
    back: "Fully autonomous ←──────────────────────────────→ Fully manual\n\n1. Fully autonomous: Claude acts without any human approval\n2. Review output: human sees result after completion, can reject\n3. Checkpoint approval: human approves at defined decision points\n4. Step-by-step: human approves each action before execution\n5. Fully supervised: human watches and can intervene at any time\n\nThe right level depends on: reversibility of actions, stakes of errors, frequency of operation, and trust established over time.",
    tags: ["human-in-the-loop"],
  },
  {
    id: "d5-fc11",
    domainId: 5,
    front: "What types of actions should always require human approval?",
    back: "Actions that should never be fully autonomous:\n- Irreversible destructive operations (delete data, drop tables)\n- External communications (send email, post to social media, notify customers)\n- Financial transactions (payments, refunds, fee waivers)\n- Security changes (modify permissions, create admin accounts)\n- Production deployments in critical systems\n\nHeuristic: if you'd require a second person's approval in a human workflow, require human approval in an agentic workflow.",
    tags: ["human-in-the-loop"],
  },
  {
    id: "d5-fc12",
    domainId: 5,
    front: "How does human-in-the-loop interact with agentic loops in practice?",
    back: "Implementation pattern:\n\n1. Agent reaches a decision point requiring approval\n2. Agent packages context into an approval request\n3. Request sent to human via: UI prompt, email, Slack, ticketing system\n4. Human reviews and responds (approve/deny/modify)\n5. Agent resumes with human's decision\n\nThe agent must be able to PAUSE and RESUME — it cannot block synchronously waiting for human input in most production systems.\n\nDesign implication: agentic loops must support async approval workflows, not just synchronous execution.",
    tags: ["human-in-the-loop"],
  },

  // ── Error Propagation ────────────────────────────────────────────────────
  {
    id: "d5-fc13",
    domainId: 5,
    front: "What is error propagation in multi-agent systems?",
    back: "Error propagation: an error at one step silently flows downstream, corrupting subsequent steps.\n\nExample:\n- Agent A fails to retrieve data → returns None instead of raising\n- Agent B receives None, generates analysis of 'no data'\n- Orchestrator presents 'analysis' to user without flagging the missing data\n- User makes decisions based on incomplete analysis\n\nPrevention:\n- Never pass error states as if they were success states\n- Validate outputs at each step before passing downstream\n- Use typed result objects that distinguish success from failure",
    tags: ["error-propagation"],
  },
  {
    id: "d5-fc14",
    domainId: 5,
    front: "What is the difference between silent failure and explicit failure?",
    back: "Silent failure: the agent encounters an error but continues as if nothing happened\n→ Returns empty results, None, or partial data without flagging the issue\n→ Downstream agents and humans are unaware of the problem\n→ Most dangerous failure mode\n\nExplicit failure: the agent raises an error, returns a failure result, or escalates\n→ The failure is visible and can be handled\n→ Prevents error propagation\n\nRule: always prefer explicit failure. Silent failure is an anti-pattern.",
    tags: ["error-propagation"],
  },
  {
    id: "d5-fc15",
    domainId: 5,
    front: "What is the Result type pattern and why is it better than exceptions for agent outputs?",
    back: "Result type: a structured return value that represents either success OR failure:\n\n```python\nclass Result:\n    success: bool\n    data: Any | None\n    error: str | None\n    error_type: str | None\n```\n\nBetter than exceptions because:\n- Forces callers to handle both success and failure paths\n- Exceptions can be accidentally swallowed\n- Result types are serializable (can be passed between agents)\n- Callers can inspect error_type to decide on retry vs. escalate vs. abort\n- Works across process/service boundaries where exceptions don't serialize",
    tags: ["error-propagation"],
  },

  // ── Cross-Topic ──────────────────────────────────────────────────────────
  {
    id: "d5-fc16",
    domainId: 5,
    front: "How does context window size affect the design of multi-turn agentic systems?",
    back: "A finite context window means:\n1. Long agentic loops eventually run out of space\n2. You must design for context management from the start\n\nDesign implications:\n- Summarize completed steps, don't keep raw history\n- Store intermediate results externally\n- Plan session boundaries: when will the loop 'check in' to a fresh context?\n- Monitor token usage during execution; escalate before hitting limits\n\nThe context window is a resource like memory — manage it actively, don't ignore it.",
    tags: ["context-window", "context-degradation"],
  },
  {
    id: "d5-fc17",
    domainId: 5,
    front: "What is 'graceful degradation' in the context of agent reliability?",
    back: "Graceful degradation: the system continues to provide value even when some components fail, rather than failing completely.\n\nExamples:\n- If external API is down: return cached data with a freshness warning instead of failing\n- If a subagent fails: return partial results from successful subagents with error info\n- If context window fills: summarize and continue in a fresh session rather than aborting\n- If a tool is unavailable: fall back to alternative approach and note the limitation\n\nContrast with brittle design: any single failure cascades to total failure.",
    tags: ["error-propagation", "failure-recovery"],
  },
  {
    id: "d5-fc18",
    domainId: 5,
    front: "How does prompt caching affect context management strategy?",
    back: "Prompt caching caches stable portions of the context (system prompt, documents) across requests.\n\nContext management benefit: if your large reference document is cached, you can include it without paying full input token costs on every request — reduces the effective cost of 'context-heavy' designs.\n\nBut: the cache doesn't increase the context window size. It reduces cost, not the token ceiling. You still need to manage what's in the active context window.\n\nCaching is a cost optimization; context management is a design concern — they address different problems.",
    tags: ["context-window"],
  },
  {
    id: "d5-fc19",
    domainId: 5,
    front: "What is 'context stuffing' and why is it harmful?",
    back: "Context stuffing: injecting large amounts of data (full database dumps, entire conversation histories, complete file trees) into the context window 'just in case' Claude needs it.\n\nHarms:\n1. Consumes tokens for irrelevant information → cost\n2. Degrades Claude's attention on relevant content ('lost in the middle')\n3. Approaches context limits faster\n4. Makes responses slower and more expensive\n\nBetter approach: use targeted retrieval — inject only the specific data Claude needs for the current step, fetched via tools.",
    tags: ["context-degradation"],
  },
  {
    id: "d5-fc20",
    domainId: 5,
    front: "What are the key signals that an agentic system needs a human-in-the-loop checkpoint?",
    back: "Design checkpoints when:\n1. Confidence is uncertain — Claude isn't sure its understanding is correct\n2. Scope ambiguity — the task could mean multiple things with different consequences\n3. Irreversible action — cannot undo if wrong\n4. External impact — affects systems, people, or data outside the immediate task\n5. Threshold crossing — size/volume/cost exceeds a defined limit\n6. Novel situation — task type not seen before, no established pattern\n\nRule of thumb: when the cost of being wrong exceeds the cost of asking, ask.",
    tags: ["human-in-the-loop", "escalation-design"],
  },
]
