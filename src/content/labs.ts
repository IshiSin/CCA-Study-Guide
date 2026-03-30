import type { Lab, DomainId } from '@/lib/types'

export interface LabContent extends Lab {
  starterCode: string
  solutionCode: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const labs: LabContent[] = [
  {
    id: 'lab-01-agentic-loop',
    title: 'Agentic Loop',
    description: 'Implement a correct tool-use agentic loop that checks stop_reason and keeps running until end_turn.',
    domains: [1] as DomainId[],
    estimatedMinutes: 30,
    difficulty: 'beginner',
    objectives: [
      'Understand how stop_reason drives the loop',
      'Append assistant messages before tool results',
      'Process multiple tool_use blocks in one response',
      'Return the final text when stop_reason is end_turn',
    ],
    prerequisites: [
      'study/domain-1/agentic-loops',
    ],
    starterFile: 'local/labs/lab-01-agentic-loop/starter.py',
    solutionFile: 'local/labs/lab-01-agentic-loop/solution.py',
    starterCode: `import anthropic
import json

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "calculator",
        "description": "Perform arithmetic: add or multiply two numbers.",
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {"type": "string", "enum": ["add", "multiply"]},
                "a": {"type": "number"},
                "b": {"type": "number"},
            },
            "required": ["operation", "a", "b"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web for a query. Returns a short summary.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
]


def process_tool_call(name: str, tool_input: dict) -> str:
    """Dispatch a tool call and return the result as a string."""
    if name == "calculator":
        a, b = tool_input["a"], tool_input["b"]
        if tool_input["operation"] == "add":
            return str(a + b)
        elif tool_input["operation"] == "multiply":
            return str(a * b)
        return "Unknown operation"
    elif name == "web_search":
        # Simulated search result
        return f"Search results for '{tool_input['query']}': [Result 1] [Result 2]"
    return "Unknown tool"


def run_agent(user_message: str) -> str:
    """
    TODO: Implement the agentic loop.

    Steps:
    1. Start with messages = [{"role": "user", "content": user_message}]
    2. Call client.messages.create with model, max_tokens, tools, messages
    3. While response.stop_reason == "tool_use":
       a. Collect all tool_use blocks from response.content
       b. Call process_tool_call for each and collect results
       c. Append the assistant message to messages
       d. Append a user message with all tool_results
       e. Call the API again
    4. When stop_reason == "end_turn", return the text content
    """
    messages = [{"role": "user", "content": user_message}]

    # TODO: implement the loop here
    raise NotImplementedError("Implement the agentic loop")


if __name__ == "__main__":
    result = run_agent("What is 42 multiplied by 17, and then search for 'Claude AI'?")
    print(result)
`,
    solutionCode: `import anthropic

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "calculator",
        "description": "Perform arithmetic: add or multiply two numbers.",
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {"type": "string", "enum": ["add", "multiply"]},
                "a": {"type": "number"},
                "b": {"type": "number"},
            },
            "required": ["operation", "a", "b"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web for a query. Returns a short summary.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
]


def process_tool_call(name: str, tool_input: dict) -> str:
    if name == "calculator":
        a, b = tool_input["a"], tool_input["b"]
        if tool_input["operation"] == "add":
            return str(a + b)
        elif tool_input["operation"] == "multiply":
            return str(a * b)
        return "Unknown operation"
    elif name == "web_search":
        return f"Search results for '{tool_input['query']}': [Result 1] [Result 2]"
    return "Unknown tool"


def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )

        # If the model is done, extract and return the text
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        # Otherwise, process every tool_use block in this response
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = process_tool_call(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,  # must match the request id
                    "content": result,
                })

        # CRITICAL: append the full assistant message BEFORE the tool results
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    result = run_agent("What is 42 multiplied by 17, then search for 'Claude AI'?")
    print(result)
`,
  },
  {
    id: 'lab-02-hub-and-spoke',
    title: 'Hub-and-Spoke',
    description: 'Build a coordinator that explicitly passes context between isolated subagents.',
    domains: [1] as DomainId[],
    estimatedMinutes: 35,
    difficulty: 'intermediate',
    objectives: [
      'Understand why subagents have isolated context windows',
      'Explicitly package context for each subagent call',
      'Pass upstream results into downstream subagents',
      'Use cheaper models (Haiku) for subagents, Opus for coordinator',
    ],
    prerequisites: [
      'study/domain-1/hub-and-spoke',
      'study/domain-1/agentic-loops',
    ],
    starterFile: 'local/labs/lab-02-hub-and-spoke/starter.py',
    solutionFile: 'local/labs/lab-02-hub-and-spoke/solution.py',
    starterCode: `import anthropic

client = anthropic.Anthropic()


def run_subagent(task_spec: str, context_data: dict) -> str:
    """
    Call a subagent with an explicit task and context.
    The subagent only knows what you put in context_data —
    it cannot see the coordinator's conversation or other subagents.
    """
    context_str = "\\n".join(f"  {k}: {v}" for k, v in context_data.items())
    user_message = f"""Task: {task_spec}

Context:
{context_str}

Complete the task and return your result."""

    response = client.messages.create(
        model="claude-haiku-4-5",  # cheap model for focused subtasks
        max_tokens=512,
        system="You are a specialized assistant. Complete the assigned task concisely.",
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


def coordinator_agent(goal: str) -> str:
    """
    Coordinator: decompose, delegate, aggregate.

    TODO: Complete the delegation steps.
    Each run_subagent call must EXPLICITLY pass all context the subagent needs.
    Remember: subagent_b cannot see subagent_a's result unless you pass it.
    """
    # Step 1: Plan (coordinator uses a powerful model)
    plan_response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        system="You are a coordinator. Briefly acknowledge the goal in one sentence.",
        messages=[{"role": "user", "content": goal}],
    )
    print(f"Plan: {plan_response.content[0].text}")

    # Step 2: Research subagent
    # TODO: call run_subagent for research
    # Pass: goal and focus area
    research_result = None  # replace with actual call

    # Step 3: Analysis subagent
    # TODO: call run_subagent for analysis
    # IMPORTANT: pass research_result explicitly — the analyst cannot see it otherwise
    analysis_result = None  # replace with actual call

    # Step 4: Aggregate
    # TODO: aggregate research_result and analysis_result into a final answer
    raise NotImplementedError("Complete the coordinator")


if __name__ == "__main__":
    result = coordinator_agent("Evaluate whether Python is a good choice for building AI agents")
    print("\\nFinal:", result)
`,
    solutionCode: `import anthropic

client = anthropic.Anthropic()


def run_subagent(task_spec: str, context_data: dict) -> str:
    context_str = "\\n".join(f"  {k}: {v}" for k, v in context_data.items())
    user_message = f"""Task: {task_spec}

Context:
{context_str}

Complete the task and return your result."""

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=512,
        system="You are a specialized assistant. Complete the assigned task concisely.",
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


def coordinator_agent(goal: str) -> str:
    # Step 1: Coordinator plans
    plan_response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        system="You are a coordinator. Briefly acknowledge the goal.",
        messages=[{"role": "user", "content": goal}],
    )
    print(f"Plan: {plan_response.content[0].text}")

    # Step 2: Research subagent — only needs the goal and focus
    research_result = run_subagent(
        task_spec="Research the key advantages and ecosystem of this technology",
        context_data={"goal": goal, "focus": "strengths, libraries, community"},
    )

    # Step 3: Analysis subagent — needs goal AND research_result explicitly
    # Without passing research_result here, this subagent would have zero context
    analysis_result = run_subagent(
        task_spec="Analyze the tradeoffs and produce a recommendation",
        context_data={
            "goal": goal,
            "research": research_result,  # ← explicit injection of upstream result
        },
    )

    # Step 4: Coordinator aggregates — it sees everything, subagents saw only their slice
    final = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Synthesize the research and analysis into a concise final recommendation.",
        messages=[{
            "role": "user",
            "content": f"Goal: {goal}\\n\\nResearch:\\n{research_result}\\n\\nAnalysis:\\n{analysis_result}",
        }],
    )
    return final.content[0].text


if __name__ == "__main__":
    result = coordinator_agent("Evaluate whether Python is a good choice for building AI agents")
    print("\\nFinal:", result)
`,
  },
  {
    id: 'lab-03-structured-output',
    title: 'Structured Output',
    description: 'Validate JSON output with Pydantic and implement a retry loop when validation fails.',
    domains: [4] as DomainId[],
    estimatedMinutes: 25,
    difficulty: 'beginner',
    objectives: [
      'Define a Pydantic model for Claude output',
      'Parse JSON from Claude responses',
      'Retry with error feedback when validation fails',
      'Cap retries to prevent infinite loops',
    ],
    prerequisites: [
      'study/domain-4/structured-output',
      'study/domain-4/validation-retry',
    ],
    starterFile: 'local/labs/lab-03-structured-output/starter.py',
    solutionFile: 'local/labs/lab-03-structured-output/solution.py',
    starterCode: `import anthropic
import json
from pydantic import BaseModel, field_validator
from typing import Literal

client = anthropic.Anthropic()


class ProductReview(BaseModel):
    sentiment: Literal["positive", "neutral", "negative"]
    score: int  # 1-5
    summary: str
    key_points: list[str]

    @field_validator("score")
    @classmethod
    def score_in_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("score must be 1-5")
        return v


SYSTEM_PROMPT = """Extract a product review as JSON with this exact schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <integer 1-5>,
  "summary": "<one sentence>",
  "key_points": ["<point 1>", "<point 2>"]
}
Return ONLY the JSON object, no other text."""


def extract_review(review_text: str, max_retries: int = 3) -> ProductReview:
    """
    TODO: Implement the extraction loop.

    Steps:
    1. Call Claude with SYSTEM_PROMPT and review_text
    2. Try to json.loads the response text
    3. Try to ProductReview(**data) to validate
    4. If either fails, retry — pass the error back to Claude
       so it can correct its output
    5. After max_retries, raise the last exception
    """
    raise NotImplementedError("Implement extract_review")


if __name__ == "__main__":
    sample = """This laptop is fantastic! Battery lasts 12 hours, keyboard feels great,
    and the display is stunning. Only minor issue is it runs a bit warm under load.
    Definitely worth the price."""
    review = extract_review(sample)
    print(review.model_dump_json(indent=2))
`,
    solutionCode: `import anthropic
import json
from pydantic import BaseModel, ValidationError, field_validator
from typing import Literal

client = anthropic.Anthropic()


class ProductReview(BaseModel):
    sentiment: Literal["positive", "neutral", "negative"]
    score: int
    summary: str
    key_points: list[str]

    @field_validator("score")
    @classmethod
    def score_in_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("score must be 1-5")
        return v


SYSTEM_PROMPT = """Extract a product review as JSON with this exact schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <integer 1-5>,
  "summary": "<one sentence>",
  "key_points": ["<point 1>", "<point 2>"]
}
Return ONLY the JSON object, no other text."""


def extract_review(review_text: str, max_retries: int = 3) -> ProductReview:
    messages = [{"role": "user", "content": review_text}]
    last_error: Exception = RuntimeError("No attempts made")

    for attempt in range(max_retries):
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        raw = response.content[0].text.strip()

        try:
            data = json.loads(raw)
            return ProductReview(**data)  # raises ValidationError if invalid
        except (json.JSONDecodeError, ValidationError) as e:
            last_error = e
            if attempt < max_retries - 1:
                # Feed the error back so Claude can self-correct
                messages.append({"role": "assistant", "content": raw})
                messages.append({
                    "role": "user",
                    "content": f"That response had an error: {e}\\nPlease return valid JSON only.",
                })

    raise last_error


if __name__ == "__main__":
    sample = """This laptop is fantastic! Battery lasts 12 hours, keyboard feels great,
    and the display is stunning. Only minor issue is it runs a bit warm under load."""
    review = extract_review(sample)
    print(review.model_dump_json(indent=2))
`,
  },
  {
    id: 'lab-04-prompt-caching',
    title: 'Prompt Caching',
    description: 'Add cache_control headers to a large system prompt and observe the token savings.',
    domains: [4] as DomainId[],
    estimatedMinutes: 20,
    difficulty: 'beginner',
    objectives: [
      'Add cache_control: {type: ephemeral} to a system message block',
      'Read cache_read_input_tokens and cache_creation_input_tokens from usage',
      'Compare cached vs uncached token costs',
      'Understand when caching applies (prompt must be ≥1024 tokens)',
    ],
    prerequisites: [
      'study/domain-4/prompt-caching',
    ],
    starterFile: 'local/labs/lab-04-prompt-caching/starter.py',
    solutionFile: 'local/labs/lab-04-prompt-caching/solution.py',
    starterCode: `import anthropic

client = anthropic.Anthropic()

# A long system prompt (simulates a large knowledge base or codebase context).
# In production this might be thousands of tokens of documentation.
LONG_SYSTEM_PROMPT = """
You are an expert assistant for the ACME Corp internal systems.

## Product Catalog
Product A: Enterprise widget, SKU-001, $299, in stock.
Product B: Professional gadget, SKU-002, $149, in stock.
Product C: Basic tool, SKU-003, $49, limited stock.

## Support Policies
- Returns accepted within 30 days with receipt.
- Warranty: 1 year parts and labor.
- Priority support available for Enterprise tier customers.
- Escalation path: Tier 1 -> Tier 2 -> Engineering.

## Technical Specifications
[... imagine 500 more lines of documentation here ...]
All products are UL listed and FCC certified.
Voltage: 100-240V AC, 50/60Hz.
Operating temperature: 0-40°C.
Storage temperature: -20-60°C.
""" * 6  # repeat to make it long enough to cache (>1024 tokens)


def ask_question(question: str, use_cache: bool = True) -> dict:
    """
    TODO: Ask a question using the long system prompt.

    When use_cache=True, wrap the system prompt in a list with
    cache_control: {"type": "ephemeral"} so the API caches it.

    Return a dict with keys:
      text, input_tokens, cache_read_tokens, cache_creation_tokens
    """
    raise NotImplementedError("Implement ask_question with caching")


if __name__ == "__main__":
    print("First call (creates cache):")
    r1 = ask_question("What is the return policy?", use_cache=True)
    print(f"  cache_creation: {r1['cache_creation_tokens']} tokens")

    print("Second call (reads cache):")
    r2 = ask_question("What products are in stock?", use_cache=True)
    print(f"  cache_read: {r2['cache_read_tokens']} tokens (saved!)")
`,
    solutionCode: `import anthropic

client = anthropic.Anthropic()

LONG_SYSTEM_PROMPT = """
You are an expert assistant for the ACME Corp internal systems.

## Product Catalog
Product A: Enterprise widget, SKU-001, $299, in stock.
Product B: Professional gadget, SKU-002, $149, in stock.
Product C: Basic tool, SKU-003, $49, limited stock.

## Support Policies
- Returns accepted within 30 days with receipt.
- Warranty: 1 year parts and labor.
- Priority support available for Enterprise tier customers.
- Escalation path: Tier 1 -> Tier 2 -> Engineering.

## Technical Specifications
All products are UL listed and FCC certified.
Voltage: 100-240V AC, 50/60Hz.
Operating temperature: 0-40°C.
""" * 6  # repeat to exceed the 1024-token minimum for caching


def ask_question(question: str, use_cache: bool = True) -> dict:
    # When caching, the system must be a list of content blocks,
    # not a plain string — the cache_control field goes on the last block
    if use_cache:
        system = [
            {
                "type": "text",
                "text": LONG_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ]
    else:
        system = LONG_SYSTEM_PROMPT  # plain string — no caching

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        system=system,
        messages=[{"role": "user", "content": question}],
    )

    usage = response.usage
    return {
        "text": response.content[0].text,
        "input_tokens": usage.input_tokens,
        # These fields are 0 when caching is not used or on the first call
        "cache_read_tokens": getattr(usage, "cache_read_input_tokens", 0),
        "cache_creation_tokens": getattr(usage, "cache_creation_input_tokens", 0),
    }


if __name__ == "__main__":
    print("First call (creates cache):")
    r1 = ask_question("What is the return policy?", use_cache=True)
    print(f"  text: {r1['text'][:80]}...")
    print(f"  cache_creation: {r1['cache_creation_tokens']} tokens")

    print("\\nSecond call (reads cache — same system prompt):")
    r2 = ask_question("What products are in stock?", use_cache=True)
    print(f"  text: {r2['text'][:80]}...")
    print(f"  cache_read: {r2['cache_read_tokens']} tokens saved!")
`,
  },
  {
    id: 'lab-05-mcp-server',
    title: 'MCP Server',
    description: 'Build a working MCP server with two tools using FastMCP.',
    domains: [2] as DomainId[],
    estimatedMinutes: 40,
    difficulty: 'intermediate',
    objectives: [
      'Initialize a FastMCP server with a name',
      'Register tools with the @mcp.tool() decorator',
      'Return structured data from tools',
      'Handle invalid inputs with informative errors',
    ],
    prerequisites: [
      'study/domain-2/mcp-fundamentals',
      'study/domain-2/mcp-servers',
      'study/domain-2/tool-descriptions',
    ],
    starterFile: 'local/labs/lab-05-mcp-server/starter.py',
    solutionFile: 'local/labs/lab-05-mcp-server/solution.py',
    starterCode: `from mcp.server.fastmcp import FastMCP

# Initialize the MCP server with a descriptive name
mcp = FastMCP("cca-study-tools")


# TODO: Register a tool called get_topic_summary
# It should accept a topic: str and return a str
# Use the @mcp.tool() decorator
# Include a docstring — it becomes the tool description Claude sees
# Return summaries for at least: "agentic-loops", "hub-and-spoke", "prompt-caching"
# Return a helpful "not found" message for unknown topics


# TODO: Register a tool called calculate_exam_score
# It should accept correct: int, total: int and return a dict
# The dict should have: percentage (float), passed (bool), correct (int), total (int)
# passed = percentage >= 70
# Raise ValueError if total == 0


if __name__ == "__main__":
    # Run the server — Claude Code or any MCP client can connect to it
    mcp.run()
`,
    solutionCode: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("cca-study-tools")

TOPIC_SUMMARIES = {
    "agentic-loops": (
        "An agentic loop calls the API, checks stop_reason, processes tool_use blocks, "
        "appends results, and loops until stop_reason is end_turn."
    ),
    "hub-and-spoke": (
        "A coordinator (hub) decomposes a goal and delegates to isolated subagents (spokes). "
        "Each subagent has its own context window — the coordinator must pass all context explicitly."
    ),
    "prompt-caching": (
        "Add cache_control: {type: ephemeral} to system message blocks to cache prompts ≥1024 tokens. "
        "Cached reads cost ~10% of normal input token price."
    ),
    "structured-output": (
        "Use a system prompt that demands JSON, parse with json.loads, validate with Pydantic. "
        "On failure, retry and pass the error back to Claude so it can self-correct."
    ),
    "tool-descriptions": (
        "Tool descriptions are part of the system prompt. Be precise about inputs, outputs, "
        "and side effects. Ambiguous descriptions lead to incorrect tool calls."
    ),
}


@mcp.tool()
def get_topic_summary(topic: str) -> str:
    """Return a concise summary of a CCA exam topic.

    Args:
        topic: The topic slug, e.g. 'agentic-loops', 'hub-and-spoke', 'prompt-caching'
    """
    key = topic.lower().strip()
    if key in TOPIC_SUMMARIES:
        return TOPIC_SUMMARIES[key]
    available = ", ".join(TOPIC_SUMMARIES.keys())
    return f"No summary for '{topic}'. Available topics: {available}"


@mcp.tool()
def calculate_exam_score(correct: int, total: int) -> dict:
    """Calculate exam score and pass/fail status.

    Args:
        correct: Number of correct answers
        total: Total number of questions
    """
    if total == 0:
        raise ValueError("total cannot be zero")
    percentage = round((correct / total) * 100, 1)
    return {
        "percentage": percentage,
        "passed": percentage >= 70,
        "correct": correct,
        "total": total,
    }


if __name__ == "__main__":
    mcp.run()
`,
  },
  {
    id: 'lab-06-tool-errors',
    title: 'Tool Error Handling',
    description: 'Return structured errors from tools so the model can recover gracefully.',
    domains: [2] as DomainId[],
    estimatedMinutes: 25,
    difficulty: 'intermediate',
    objectives: [
      'Return {success: false, error: CODE, message: str} instead of raising',
      'Let the model read the error and decide what to do next',
      'Use is_error: true in tool_result for hard failures',
      'Write error messages that give Claude enough info to self-correct',
    ],
    prerequisites: [
      'study/domain-2/structured-errors',
      'study/domain-2/tool-descriptions',
    ],
    starterFile: 'local/labs/lab-06-tool-errors/starter.py',
    solutionFile: 'local/labs/lab-06-tool-errors/solution.py',
    starterCode: `import anthropic
import os

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a file and return its contents.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string", "description": "File path to read"}},
            "required": ["path"],
        },
    }
]


def read_file(path: str) -> str:
    """
    TODO: Fix this function to return structured errors instead of raising.

    Current (broken) behavior: raises Python exceptions.
    Goal: return a dict with success/error info so Claude can handle it.

    Return format on success:  {"success": True, "content": "...", "path": path}
    Return format on error:    {"success": False, "error": "ERROR_CODE",
                                "path": path, "message": "human-readable hint"}

    Error codes to handle:
      FILE_NOT_FOUND  — FileNotFoundError
      PERMISSION_DENIED — PermissionError
    """
    # BROKEN: raw exceptions crash the loop
    with open(path) as f:
        return f.read()


def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]
    while True:
        response = client.messages.create(
            model="claude-haiku-4-5", max_tokens=512, tools=TOOLS, messages=messages
        )
        if response.stop_reason == "end_turn":
            return response.content[0].text
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = read_file(block.input["path"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    print(run_agent("Read the file at /tmp/notes.txt"))
`,
    solutionCode: `import anthropic
import os

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a file and return its contents.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string", "description": "File path to read"}},
            "required": ["path"],
        },
    }
]


def read_file(path: str) -> dict:
    """Return file contents or a structured error — never raise."""
    try:
        with open(path) as f:
            return {"success": True, "content": f.read(), "path": path}
    except FileNotFoundError:
        return {
            "success": False,
            "error": "FILE_NOT_FOUND",
            "path": path,
            "message": f"'{path}' does not exist. Check the path and try again.",
        }
    except PermissionError:
        return {
            "success": False,
            "error": "PERMISSION_DENIED",
            "path": path,
            "message": f"No read permission for '{path}'.",
        }


def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]
    while True:
        response = client.messages.create(
            model="claude-haiku-4-5", max_tokens=512, tools=TOOLS, messages=messages
        )
        if response.stop_reason == "end_turn":
            return response.content[0].text

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = read_file(block.input["path"])
                # Pass the structured error back — Claude reads it and can suggest a fix
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                    # is_error=True signals a hard failure to the model
                    "is_error": not result.get("success", True),
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    print(run_agent("Try to read /tmp/notes.txt and tell me what happened"))
`,
  },
  {
    id: 'lab-07-context-summarization',
    title: 'Context Summarization',
    description: 'Implement rolling summarization to prevent context window overflow in long conversations.',
    domains: [5] as DomainId[],
    estimatedMinutes: 30,
    difficulty: 'intermediate',
    objectives: [
      'Detect when message count exceeds a threshold',
      'Summarize older messages and replace them with a summary',
      'Prepend the summary to the system prompt',
      'Keep the most recent messages verbatim for coherence',
    ],
    prerequisites: [
      'study/domain-5/context-window',
      'study/domain-5/context-degradation',
    ],
    starterFile: 'local/labs/lab-07-context-summarization/starter.py',
    solutionFile: 'local/labs/lab-07-context-summarization/solution.py',
    starterCode: `import anthropic

client = anthropic.Anthropic()


class ConversationManager:
    """
    Manages a conversation and trims context when it gets too long.
    """

    def __init__(self, max_messages: int = 10):
        self.messages: list[dict] = []
        self.summary: str = ""
        self.max_messages = max_messages

    def add_message(self, role: str, content: str) -> None:
        """
        Add a message and summarize if over the limit.

        TODO: append the message, then call _summarize_and_trim()
        if len(self.messages) > self.max_messages
        """
        raise NotImplementedError

    def _summarize_and_trim(self) -> None:
        """
        TODO: Summarize the older messages and keep only the recent ones.

        Steps:
        1. Take messages[:-4] as the ones to summarize (keep last 4 verbatim)
        2. Build a prompt that includes self.summary and the messages to summarize
        3. Call Claude (haiku) to produce a new summary
        4. Store it in self.summary
        5. Set self.messages = self.messages[-4:]
        """
        raise NotImplementedError

    def get_system_prompt(self) -> str:
        """Return a system prompt that includes the rolling summary if any."""
        base = "You are a helpful assistant."
        if self.summary:
            return f"{base}\\n\\nConversation history so far:\\n{self.summary}"
        return base

    def chat(self, user_input: str) -> str:
        """Send a message and get a response."""
        self.add_message("user", user_input)
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system=self.get_system_prompt(),
            messages=self.messages,
        )
        reply = response.content[0].text
        self.add_message("assistant", reply)
        return reply


if __name__ == "__main__":
    mgr = ConversationManager(max_messages=6)
    for i in range(10):
        reply = mgr.chat(f"Remember this number: {i * 7}. What is {i} * 7?")
        print(f"Turn {i+1}: {reply[:60]}")
    print(f"\\nMessages in memory: {len(mgr.messages)}")
    print(f"Summary exists: {bool(mgr.summary)}")
`,
    solutionCode: `import anthropic

client = anthropic.Anthropic()


class ConversationManager:
    def __init__(self, max_messages: int = 10):
        self.messages: list[dict] = []
        self.summary: str = ""
        self.max_messages = max_messages

    def add_message(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.max_messages:
            self._summarize_and_trim()

    def _summarize_and_trim(self) -> None:
        # Keep the last 4 messages verbatim — they provide immediate context
        to_summarize = self.messages[:-4]
        recent = self.messages[-4:]

        # Build a prompt that chains on any existing summary
        history_text = "\\n".join(
            f"{m['role'].upper()}: {m['content']}" for m in to_summarize
        )
        prompt = f"Previous summary:\\n{self.summary}\\n\\nNew messages to add to summary:\\n{history_text}"

        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system="Produce a concise rolling summary of the conversation. Keep key facts.",
            messages=[{"role": "user", "content": prompt}],
        )
        self.summary = response.content[0].text
        self.messages = recent  # discard the summarized messages

    def get_system_prompt(self) -> str:
        base = "You are a helpful assistant."
        if self.summary:
            return f"{base}\\n\\nConversation history so far:\\n{self.summary}"
        return base

    def chat(self, user_input: str) -> str:
        self.add_message("user", user_input)
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system=self.get_system_prompt(),
            messages=self.messages,
        )
        reply = response.content[0].text
        self.add_message("assistant", reply)
        return reply


if __name__ == "__main__":
    mgr = ConversationManager(max_messages=6)
    for i in range(10):
        reply = mgr.chat(f"Remember this number: {i * 7}. What is {i} * 7?")
        print(f"Turn {i+1}: {reply[:60]}")
    print(f"\\nMessages in memory: {len(mgr.messages)}")
    print(f"Summary: {mgr.summary[:100]}...")
`,
  },
  {
    id: 'lab-08-human-in-the-loop',
    title: 'Human-in-the-Loop',
    description: 'Add an approval gate that pauses before risky tool calls and asks for confirmation.',
    domains: [5] as DomainId[],
    estimatedMinutes: 25,
    difficulty: 'intermediate',
    objectives: [
      'Identify risky tool calls before executing them',
      'Pause the loop and prompt the user for approval',
      'Return a denial result if the user says no',
      'Allow auto_approve mode for non-interactive contexts',
    ],
    prerequisites: [
      'study/domain-5/human-in-the-loop',
      'study/domain-5/escalation-design',
    ],
    starterFile: 'local/labs/lab-08-human-in-the-loop/starter.py',
    solutionFile: 'local/labs/lab-08-human-in-the-loop/solution.py',
    starterCode: `import anthropic

client = anthropic.Anthropic()

# These tool names require human approval before execution
RISKY_TOOLS = {"delete_file", "send_email", "deploy_code"}

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a file.",
        "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]},
    },
    {
        "name": "delete_file",
        "description": "Permanently delete a file.",
        "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]},
    },
    {
        "name": "send_email",
        "description": "Send an email.",
        "input_schema": {
            "type": "object",
            "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}},
            "required": ["to", "subject", "body"],
        },
    },
]


def execute_tool(name: str, tool_input: dict) -> str:
    """Simulate tool execution (no real side effects in this lab)."""
    return f"[{name}] executed with {tool_input}"


def run_agent(goal: str, auto_approve: bool = False) -> str:
    """
    TODO: Implement the agent loop with approval gate.

    For each tool_use block:
    - If block.name is in RISKY_TOOLS AND auto_approve is False:
        - Print a warning with the tool name and inputs
        - Ask the user: input("Approve? [y/N]: ")
        - If not "y", add a tool_result with content="Action denied by user."
          and is_error=True — then continue to the next tool
    - Otherwise: call execute_tool and add the result normally
    """
    raise NotImplementedError("Implement the approval gate")


if __name__ == "__main__":
    run_agent("Read /tmp/readme.txt, then delete /tmp/old-logs.txt", auto_approve=False)
`,
    solutionCode: `import anthropic

client = anthropic.Anthropic()

RISKY_TOOLS = {"delete_file", "send_email", "deploy_code"}

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a file.",
        "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]},
    },
    {
        "name": "delete_file",
        "description": "Permanently delete a file.",
        "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]},
    },
    {
        "name": "send_email",
        "description": "Send an email.",
        "input_schema": {
            "type": "object",
            "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}},
            "required": ["to", "subject", "body"],
        },
    },
]


def execute_tool(name: str, tool_input: dict) -> str:
    return f"[{name}] executed with {tool_input}"


def run_agent(goal: str, auto_approve: bool = False) -> str:
    messages = [{"role": "user", "content": goal}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5", max_tokens=512, tools=TOOLS, messages=messages
        )
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue

            if block.name in RISKY_TOOLS and not auto_approve:
                # Pause — show the user what's about to happen
                print(f"\\n⚠️  Risky action requested: {block.name}")
                print(f"   Inputs: {block.input}")
                confirm = input("   Approve? [y/N]: ").strip().lower()

                if confirm != "y":
                    # Deny — return an error result so Claude knows to stop or adapt
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": "Action denied by user.",
                        "is_error": True,
                    })
                    continue

            # Approved or non-risky — execute normally
            result = execute_tool(block.name, block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result,
            })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    result = run_agent("Read /tmp/readme.txt, then delete /tmp/old-logs.txt")
    print("\\nAgent result:", result)
`,
  },
  {
    id: 'lab-09-task-decomposition',
    title: 'Task Decomposition',
    description: 'Ask Claude to decompose a goal into tasks with dependencies, then execute them in topological order.',
    domains: [1] as DomainId[],
    estimatedMinutes: 30,
    difficulty: 'advanced',
    objectives: [
      'Ask Claude to produce a JSON task list with depends_on arrays',
      'Implement topological sort to respect dependencies',
      'Inject completed task results into dependent tasks',
      'Detect and raise on circular dependencies',
    ],
    prerequisites: [
      'study/domain-1/task-decomposition',
      'study/domain-1/hub-and-spoke',
    ],
    starterFile: 'local/labs/lab-09-task-decomposition/starter.py',
    solutionFile: 'local/labs/lab-09-task-decomposition/solution.py',
    starterCode: `import anthropic
import json

client = anthropic.Anthropic()


def decompose_goal(goal: str) -> list[dict]:
    """Ask Claude to break the goal into a dependency-ordered task list."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="""Return ONLY a JSON array of tasks. Each task:
{
  "id": "<short-id>",
  "description": "<what to do>",
  "depends_on": ["<task-id>", ...]  // empty list if no dependencies
}
Return 3-5 tasks.""",
        messages=[{"role": "user", "content": f"Decompose this goal into tasks: {goal}"}],
    )
    return json.loads(response.content[0].text)


def run_subagent(description: str, context: dict) -> str:
    """Execute one task with the given context."""
    context_str = "\\n".join(f"  {k}: {v[:100]}..." if len(str(v)) > 100 else f"  {k}: {v}"
                             for k, v in context.items())
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        system="Complete the assigned task concisely.",
        messages=[{"role": "user", "content": f"Task: {description}\\n\\nContext:\\n{context_str}"}],
    )
    return response.content[0].text


def execute_in_order(tasks: list[dict]) -> dict[str, str]:
    """
    TODO: Execute tasks in dependency order.

    Steps:
    1. Keep a dict of completed results: {task_id: result_str}
    2. While there are remaining tasks:
       a. Find tasks whose depends_on are all in completed
       b. If none are ready but tasks remain → circular dependency → raise ValueError
       c. For each ready task, build dep_context from completed results
       d. Call run_subagent(task["description"], dep_context)
       e. Store result in completed, remove task from remaining
    3. Return completed
    """
    raise NotImplementedError("Implement topological execution")


if __name__ == "__main__":
    goal = "Write a short blog post about prompt caching in Claude"
    print(f"Goal: {goal}\\n")
    tasks = decompose_goal(goal)
    print(f"Tasks: {json.dumps(tasks, indent=2)}\\n")
    results = execute_in_order(tasks)
    last_id = tasks[-1]["id"]
    print("Final result:")
    print(results.get(last_id, list(results.values())[-1]))
`,
    solutionCode: `import anthropic
import json

client = anthropic.Anthropic()


def decompose_goal(goal: str) -> list[dict]:
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="""Return ONLY a JSON array of tasks. Each task:
{
  "id": "<short-id>",
  "description": "<what to do>",
  "depends_on": ["<task-id>", ...]
}
Return 3-5 tasks.""",
        messages=[{"role": "user", "content": f"Decompose this goal into tasks: {goal}"}],
    )
    return json.loads(response.content[0].text)


def run_subagent(description: str, context: dict) -> str:
    ctx_items = []
    for k, v in context.items():
        v_str = str(v)
        ctx_items.append(f"  {k}: {v_str[:100]}..." if len(v_str) > 100 else f"  {k}: {v_str}")
    context_str = "\\n".join(ctx_items)
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        system="Complete the assigned task concisely.",
        messages=[{"role": "user", "content": f"Task: {description}\\n\\nContext:\\n{context_str}"}],
    )
    return response.content[0].text


def execute_in_order(tasks: list[dict]) -> dict[str, str]:
    completed: dict[str, str] = {}
    remaining = list(tasks)

    while remaining:
        # Find tasks whose every dependency has already been completed
        ready = [
            t for t in remaining
            if all(dep in completed for dep in t.get("depends_on", []))
        ]

        if not ready:
            ids = [t["id"] for t in remaining]
            raise ValueError(f"Circular dependency among tasks: {ids}")

        for task in ready:
            # Inject only the results this task depends on — not everything
            dep_context = {
                dep_id: completed[dep_id]
                for dep_id in task.get("depends_on", [])
            }
            result = run_subagent(task["description"], dep_context)
            completed[task["id"]] = result
            remaining.remove(task)

    return completed


if __name__ == "__main__":
    goal = "Write a short blog post about prompt caching in Claude"
    print(f"Goal: {goal}\\n")
    tasks = decompose_goal(goal)
    print(f"Tasks: {json.dumps(tasks, indent=2)}\\n")
    results = execute_in_order(tasks)
    last_result = results[tasks[-1]["id"]] if tasks else ""
    print("Final result:")
    print(last_result)
`,
  },
]

export const labDomainColors: Record<number, string> = {
  1: 'blue',
  2: 'purple',
  3: 'green',
  4: 'orange',
  5: 'red',
}
