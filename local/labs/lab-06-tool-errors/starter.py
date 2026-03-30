"""
Lab 06: Tool Error Handling
============================
Learning objective: Return structured errors from tools instead of raising
raw Python exceptions, so the model can handle them gracefully.

The problem with raw exceptions: if `file_reader` raises FileNotFoundError,
the exception bubbles up through your agent loop and crashes the program.
The model never sees the error and cannot adapt.

The solution: catch every expected error, return a dict with success=False and
a structured error code. The model reads this dict as a tool result and can
decide what to do next (retry with a different path, ask the user, etc.).

Your task:
  1. Fix `file_reader` to return structured errors instead of raising.
  2. In the agent loop, pass the error dict as the tool result so the model
     can read it.
"""

import anthropic

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "file_reader",
        "description": "Read the contents of a file at the given path.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute or relative file path."},
            },
            "required": ["path"],
        },
    }
]


def file_reader(path: str) -> dict:
    """
    Read a file and return its contents.

    TODO: This implementation raises raw exceptions — the BAD pattern.
    Fix it to return structured error dicts instead.
    """
    # BAD: This will crash the agent loop if the file doesn't exist.
    with open(path) as f:
        return {"success": True, "content": f.read(), "path": path}


def run_agent(goal: str) -> str:
    """Simple agentic loop that uses the file_reader tool."""
    messages = [{"role": "user", "content": goal}]

    while True:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            tools=TOOLS,
            messages=messages,
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
            if block.name == "file_reader":
                # TODO: Currently this would crash on missing files because
                # file_reader raises an exception. After you fix file_reader
                # to return structured errors, the result dict will be passed
                # back to the model as a tool result — no crash.
                result = file_reader(block.input["path"])
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result),
                    }
                )

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    result = run_agent("Please read the file at /tmp/nonexistent.txt and summarize it.")
    print(result)
