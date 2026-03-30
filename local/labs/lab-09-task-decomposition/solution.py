"""
Lab 09: Task Decomposition — SOLUTION
======================================
Topological execution: process tasks whose dependencies are all done,
inject those results explicitly, and loop until all tasks are complete.
A circular dependency is detected when no tasks are ready but some remain.
"""

import json
import anthropic

client = anthropic.Anthropic()


def run_subagent(task_description: str, context_data: dict) -> str:
    """
    Execute a single task as a subagent with explicit context.

    Only the outputs of dependency tasks are passed — keeping context
    minimal and the subagent fully isolated.
    """
    context_lines = []
    for k, v in context_data.items():
        v_str = str(v)
        line = k + ": " + (v_str[:120] + "..." if len(v_str) > 120 else v_str)
        context_lines.append(line)
    context_str = "\n".join(context_lines) if context_lines else "(no prior context)"

    messages = [
        {
            "role": "user",
            "content": (
                "Task: " + task_description + "\n\n"
                "Available context from prior tasks:\n" + context_str + "\n\n"
                "Complete the task using the context provided. Be concise."
            ),
        }
    ]
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        messages=messages,
    )
    return response.content[0].text


def decompose_goal(goal: str) -> list:
    """
    Ask Claude to decompose a goal into a dependency-ordered task list.

    Returns a list of dicts: {id, description, depends_on}.
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system=(
            "Return a JSON array of tasks to accomplish the goal. "
            "Each task must be a JSON object with exactly these keys: "
            '{"id": "<str>", "description": "<str>", "depends_on": [<str>]}. '
            "Respond with ONLY the JSON array -- no explanation before or after."
        ),
        messages=[
            {
                "role": "user",
                "content": "Decompose into 3-5 tasks: " + goal,
            }
        ],
    )
    return json.loads(response.content[0].text)


def execute_in_order(tasks: list) -> dict:
    """
    Execute tasks in dependency order and return a mapping of task_id -> result.

    Algorithm: topological sort via repeated ready-task selection.
    - A task is "ready" when all of its depends_on ids are in completed.
    - If no task is ready but tasks remain, there is a circular dependency.
    """
    completed: dict = {}
    remaining = list(tasks)  # mutable copy — we remove tasks as they finish

    while remaining:
        # Identify tasks that can run now: all their dependencies are done.
        ready = [
            t for t in remaining
            if all(dep in completed for dep in t.get("depends_on", []))
        ]

        if not ready:
            # Deadlock: some tasks are waiting on each other in a cycle.
            stuck_ids = [t["id"] for t in remaining]
            raise ValueError("Circular dependency detected among tasks: " + str(stuck_ids))

        for task in ready:
            # Pass only the outputs this task depends on — not all of completed.
            # This keeps the subagent's context focused and mirrors hub-and-spoke.
            dep_context = {
                dep_id: completed[dep_id]
                for dep_id in task.get("depends_on", [])
            }
            result = run_subagent(task["description"], dep_context)
            completed[task["id"]] = result
            remaining.remove(task)

    return completed


if __name__ == "__main__":
    goal = "Write a short blog post about prompt caching in large language models."
    print("Decomposing goal:", goal)
    tasks = decompose_goal(goal)
    print("Tasks:", json.dumps(tasks, indent=2))

    print("\nExecuting tasks...")
    results = execute_in_order(tasks)
    for task_id, result in results.items():
        print("\n[" + task_id + "] " + result[:200] + "...")
