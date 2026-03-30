"""
Lab 06: Tool Error Handling — SOLUTION
========================================
file_reader catches OS-level exceptions and returns structured dicts.
The model receives these dicts as tool results and decides how to respond —
it might suggest the user check the path, try an alternative, or explain the
failure in plain English.
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
    Read a file and return its contents, or a structured error dict on failure.

    Using a dict with a "success" key lets the model parse the result without
    needing special handling in the agent loop. The error code (FILE_NOT_FOUND,
    PERMISSION_DENIED) gives the model semantic information to act on.
    """
    try:
        with open(path) as f:
            return {
                "success": True,
                "content": f.read(),
                "path": path,
            }

    except FileNotFoundError:
        # Return structured data — do NOT re-raise. The model can handle this.
        return {
            "success": False,
            "error": "FILE_NOT_FOUND",
            "path": path,
            "message": (
                "File '{path}' does not exist. "
                "Please check the path and try again.".format(path=path)
            ),
        }

    except PermissionError:
        return {
            "success": False,
            "error": "PERMISSION_DENIED",
            "path": path,
            "message": "No read permission for '{path}'.".format(path=path),
        }

    except OSError as e:
        # Catch-all for other OS errors (e.g., is a directory, I/O error)
        return {
            "success": False,
            "error": "OS_ERROR",
            "path": path,
            "message": str(e),
        }


def run_agent(goal: str) -> str:
    """
    Agentic loop that passes structured tool errors back to the model.

    Because file_reader never raises, the loop never crashes — the error dict
    is passed as the tool result content and the model reads it.
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

            if block.name == "file_reader":
                result = file_reader(block.input["path"])
                # str(result) gives the model a readable representation of the dict.
                # In a production system you might JSON-encode it instead.
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
