"""
Lab 08: Human-in-the-Loop
===========================
Learning objective: Implement an approval gate that pauses before risky tool
calls and asks the operator for confirmation.

Why this matters: autonomous agents can take irreversible actions (delete files,
send emails, deploy code). A human approval gate keeps the operator in control
without requiring them to supervise every safe action.

Pattern:
  - Classify tools as "risky" or "safe" based on a known set.
  - Before executing a risky tool, print the action and ask for y/N.
  - If denied: return an error tool result so the model can explain to the user.
  - If approved (or auto_approve=True): execute normally.

Your task: Add the approval gate inside the run_with_approval function (TODO section).
"""

import anthropic

client = anthropic.Anthropic()

# Tools that require human approval before execution
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

            # TODO: Add the approval gate here.
            #
            # If block.name is in RISKY_TOOLS AND auto_approve is False:
            #   1. Print a warning showing the tool name and its input.
            #   2. Prompt the user: input("Approve? [y/N]: ")
            #   3. If the answer is NOT "y":
            #        Append a tool_result with is_error=True and content="Action denied by user."
            #        Use continue to skip execute_tool.
            #
            # Otherwise, fall through to execute_tool below.

            result = execute_tool(block.name, block.input)
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                }
            )

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    result = run_with_approval(
        "Delete the file /tmp/old_log.txt and then send a summary email to admin@example.com",
        auto_approve=False,
    )
    print(result)
