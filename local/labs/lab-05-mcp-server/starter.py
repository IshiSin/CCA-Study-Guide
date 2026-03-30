"""
Lab 05: MCP Server
==================
Learning objective: Build a working MCP server with two tools using the `mcp`
library's FastMCP helper.

MCP (Model Context Protocol) lets Claude call tools hosted in a separate
process. The server declares its tools; Claude discovers and invokes them.

Your task: Implement the two tools below — `get_topic_summary` and
`calculate_exam_score` — by filling in the TODO sections.
"""

from mcp.server.fastmcp import FastMCP

# FastMCP creates the server and handles all protocol machinery for you.
mcp = FastMCP("study-tools")


@mcp.tool()
def get_topic_summary(topic: str) -> str:
    """Return a short summary for a CCA exam topic.

    TODO: Look up `topic` in the `summaries` dict below (case-insensitive).
    If the topic is not found, return a helpful "no summary" message.
    """
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

    # TODO: implement the lookup and return
    pass  # remove this line when you implement the function


@mcp.tool()
def calculate_exam_score(correct: int, total: int) -> dict:
    """Calculate exam score as a percentage and return pass/fail status.

    Passing threshold: 70%.

    TODO: Validate inputs, compute the percentage, and return a dict with
    keys: percentage, passed, correct, total.
    Raise ValueError if total is 0 (cannot divide by zero).
    """
    # TODO: implement the calculation and return
    pass  # remove this line when you implement the function


if __name__ == "__main__":
    mcp.run()
