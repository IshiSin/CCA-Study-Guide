"""
Lab 01: Agentic Loop
====================
Learning objective: Implement a correct tool-use agentic loop that checks
`stop_reason` and keeps running until the model signals `end_turn`.

The key insight: Claude may request multiple tool calls in a single response,
and you must process ALL of them before sending results back. Then you loop —
the model decides when it is done, not you.

Your task: Complete the `run_agent` function by filling in the TODO sections.
"""

import anthropic

client = anthropic.Anthropic()

# ---------------------------------------------------------------------------
# Tool definitions (passed to the API so Claude knows what it can call)
# ---------------------------------------------------------------------------
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
    """
    Dispatch a tool call to the correct implementation and return a string result.

    Returning a STRING is important: the API expects tool results as text so
    the model can read them in its next turn.
    """
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
        # Fake results — in a real system you would call an actual search API
        return f"Top result for '{query}': This is a simulated search result."

    else:
        return f"Unknown tool: {tool_name}"


def run_agent(user_message: str) -> str:
    """
    Run an agentic loop for a single user message.

    The loop must:
      1. Call client.messages.create with the current messages list.
      2. Check response.stop_reason.
      3. If stop_reason == "tool_use":
           a. Collect every tool_use block from response.content.
           b. Call process_tool_call for each one.
           c. Append the ASSISTANT message (response.content) to messages.
           d. Append a USER message containing ALL tool results to messages.
           e. Go back to step 1.
      4. If stop_reason == "end_turn":
           Return the text from the final response.
    """
    messages = [{"role": "user", "content": user_message}]

    # TODO: Replace this placeholder with the actual agentic loop.
    #
    # Hint — the structure looks like:
    #
    #   while True:
    #       response = client.messages.create(
    #           model="claude-haiku-4-5",
    #           max_tokens=1024,
    #           tools=TOOLS,
    #           messages=messages,
    #       )
    #
    #       if response.stop_reason == "end_turn":
    #           # Extract the text block from response.content and return it
    #           ...
    #
    #       if response.stop_reason == "tool_use":
    #           tool_results = []
    #           for block in response.content:
    #               if block.type == "tool_use":
    #                   result = process_tool_call(block.name, block.input)
    #                   tool_results.append({
    #                       "type": "tool_result",
    #                       "tool_use_id": block.id,   # must match the request id
    #                       "content": result,
    #                   })
    #
    #           # Append assistant turn FIRST, then the tool results as a user turn
    #           messages.append({"role": "assistant", "content": response.content})
    #           messages.append({"role": "user", "content": tool_results})
    #           # Loop continues — Claude sees the results and decides next step

    raise NotImplementedError("Complete the run_agent function above.")


if __name__ == "__main__":
    answer = run_agent("What is (3 + 7) multiplied by 5? Also search for 'agentic loops'.")
    print(answer)
