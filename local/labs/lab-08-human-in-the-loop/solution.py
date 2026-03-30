"""
Lab 08: Human-in-the-Loop — SOLUTION
======================================
The key pattern: before executing any tool in RISKY_TOOLS, pause and ask
the human for explicit confirmation. If denied, return an is_error tool
result so the model knows to stop or adapt — never silently skip it.
"""

import anthropic

client = anthropic.Anthropic()

RISKY_TOOLS = {"delete_file", "send_email", "deploy_code"}

TOOLS = [
    {
        "name": "delete_file",
        "description": "Permanently delete a file. IRREVERSIBLE.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
    },
    {
        "name": "send_email",
        "description": "Send an email to the given address.",
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["to", "subject", "body"],
        },
    },
    {
        "name": "deploy_code",
        "description": "Deploy code to production.",
        "input_schema": {
            "type": "object",
            "properties": {"repo": {"type": "string"}, "branch": {"type": "string"}},
            "required": ["repo", "branch"],
        },
    },
    {
        "name": "read_file",
        "description": "Read a file (safe -- no approval needed).",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
    },
]


def execute_tool(tool_name: str, tool_input: dict) -> str:
    """Simulate tool execution (fake results for demo purposes)."""
    if tool_name == "delete_file":
        return "File deleted: " + tool_input["path"]
    elif tool_name == "send_email":
        return "Email sent to " + tool_input["to"]
    elif tool_name == "deploy_code":
        return "Deployed " + tool_input["repo"] + "@" + tool_input["branch"]
    elif tool_name == "read_file":
        return "Contents of " + tool_input["path"] + ": [simulated content]"
    return "Unknown tool."


def run_with_approval(goal: str, auto_approve: bool = False) -> str:
    """
    Run the agent with a human-in-the-loop approval gate for risky tools.

    auto_approve=True skips the interactive prompt (used in tests and CI).
    """
    messages = [{"role": "user", "content": goal}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
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

            if block.name in RISKY_TOOLS and not auto_approve:
                # Pause the loop and show the operator exactly what is about to happen.
                # The tool name and full input are shown so the decision is informed.
                print("\nRisky action requested: " + block.name)
                print("Inputs: " + str(block.input))
                confirm = input("Approve? [y/N]: ").strip().lower()

                if confirm != "y":
                    # Return an is_error tool result — the model sees this and can
                    # explain to the user that the action was denied, or propose
                    # a safer alternative.
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": "Action denied by user.",
                        "is_error": True,
                    })
                    continue  # skip execute_tool for this block

            # Safe tool or human-approved risky tool — execute normally.
            result = execute_tool(block.name, block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result,
            })

        # Assistant message MUST come before the tool results in the messages list.
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    result = run_with_approval(
        "Delete the file /tmp/old_log.txt and then send a summary email to admin@example.com",
        auto_approve=False,
    )
    print(result)
