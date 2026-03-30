"""
Lab 05: MCP Server — SOLUTION
==============================
Both tools are pure Python functions decorated with @mcp.tool().
No Anthropic API call is needed — the MCP server exposes these to Claude;
Claude decides when to call them.
"""

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("study-tools")


@mcp.tool()
def get_topic_summary(topic: str) -> str:
    """Return a short summary for a CCA exam topic."""
    summaries = {
        "agentic-loops": (
            "An agentic loop runs until stop_reason is end_turn. "
            "The model requests tools; you execute them and loop."
        ),
        "hub-and-spoke": (
            "A coordinator (hub) delegates tasks to isolated subagents (spokes). "
            "Context is passed explicitly — subagents share no state."
        ),
        "structured-output": (
            "Ask Claude for JSON, validate with Pydantic, and retry with error "
            "feedback if validation fails."
        ),
        "prompt-caching": (
            "Add cache_control to large system prompt blocks. "
            "Cache-read tokens are cheaper than freshly computed tokens."
        ),
        "tool-errors": (
            "Return structured error dicts instead of raising exceptions. "
            "The model can read and react to structured errors gracefully."
        ),
        "context-summarization": (
            "When the conversation grows long, summarize old turns and keep "
            "only recent messages to stay within the context window."
        ),
        "human-in-the-loop": (
            "Pause before risky tool calls and ask the operator for approval. "
            "Denied calls return an error tool result."
        ),
        "task-decomposition": (
            "Ask Claude to break a goal into dependency-ordered tasks, then "
            "execute them in topological order, injecting deps as context."
        ),
    }

    # Normalize to lowercase with hyphens so "Agentic Loops" matches "agentic-loops"
    normalized = topic.lower().replace(" ", "-")
    result = summaries.get(normalized)
    if result is not None:
        return result
    return "No summary available for '{topic}'. Known topics: {topics}".format(
        topic=topic,
        topics=", ".join(summaries.keys()),
    )


@mcp.tool()
def calculate_exam_score(correct: int, total: int) -> dict:
    """Calculate exam score percentage and pass/fail status."""
    if total == 0:
        # Raise immediately — this is a programming error, not a recoverable state.
        raise ValueError("Total questions cannot be zero.")

    percentage = round((correct / total) * 100, 1)

    return {
        "percentage": percentage,
        "passed": percentage >= 70.0,
        "correct": correct,
        "total": total,
    }


if __name__ == "__main__":
    mcp.run()
