"""
Lab 01: Agentic Loop — SOLUTION
================================
This file shows the complete, correct implementation.
Study it after attempting the starter on your own.
"""

import anthropic

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "calculator",
        "description": "Perform basic arithmetic. Supports add and multiply.",
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "multiply"],
                    "description": "The arithmetic operation to perform.",
                },
                "a": {"type": "number", "description": "First operand."},
                "b": {"type": "number", "description": "Second operand."},
            },
            "required": ["operation", "a", "b"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web and return fake results (for demo purposes).",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query."},
            },
            "required": ["query"],
        },
    },
]


def process_tool_call(tool_name: str, tool_input: dict) -> str:
    """Dispatch a tool call and return its result as a string."""
    if tool_name == "calculator":
        a = tool_input["a"]
        b = tool_input["b"]
        op = tool_input["operation"]
        if op == "add":
            return str(a + b)
        elif op == "multiply":
            return str(a * b)
        else:
            return f"Unknown operation: {op}"

    elif tool_name == "web_search":
        query = tool_input["query"]
        return f"Top result for '{query}': This is a simulated search result."

    else:
        return f"Unknown tool: {tool_name}"


def run_agent(user_message: str) -> str:
    """
    Run the agentic loop until Claude signals end_turn.

    Key rules that the CCA exam tests:
    - You must check stop_reason, not guess when the model is done.
    - You must append BOTH the assistant message AND the tool results before looping.
    - tool_use_id in the result must match the id in the request block — this is
      how the model correlates which result belongs to which tool call.
    - Multiple tool calls in one response are all processed before the next API call.
    """
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )

        # The model is finished — extract the final text answer and return it.
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            # Fallback: no text block (shouldn't normally happen)
            return ""

        # The model wants to use one or more tools before answering.
        if response.stop_reason == "tool_use":
            tool_results = []

            # Process every tool_use block in this response (there may be several).
            for block in response.content:
                if block.type != "tool_use":
                    # Skip text blocks that might appear alongside tool calls.
                    continue

                result = process_tool_call(block.name, block.input)

                # The tool_use_id must mirror block.id so the model can match
                # results back to the correct call.
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    }
                )

            # Assistant turn must be appended FIRST (the model's tool request),
            # then the user turn carrying the results.  Order matters for the
            # alternating role constraint in the Messages API.
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

            # Loop: Claude will now read the results and either answer or call
            # more tools.


if __name__ == "__main__":
    answer = run_agent("What is (3 + 7) multiplied by 5? Also search for 'agentic loops'.")
    print(answer)
