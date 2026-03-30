"""
Lab 09: Task Decomposition
===========================
Learning objective: Ask Claude to decompose a goal into a dependency-ordered
task list, then execute each task in topological order — injecting the results
of completed tasks into tasks that depend on them.

Key concepts:
  - Dependency graph: tasks have ids and a depends_on list of other task ids.
  - Topological order: a task runs only after ALL of its dependencies have
    completed. This is determined at runtime, not hardcoded.
  - Explicit context injection: when a task depends on others, those results
    are passed as context_data — the core hub-and-spoke principle applied
    to sequential task pipelines.

Your task: Implement `execute_in_order` by adding the topological sort loop.
"""

import json
import anthropic

client = anthropic.Anthropic()


def run_subagent(task_description: str, context_data: dict) -> str:
    """
    Execute a single task as a subagent with explicit context.

    context_data contains the results of dependency tasks — the subagent
    uses these to do its work without needing shared state.
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

    Returns a list of dicts, each with:
      - id: str          unique identifier (e.g. "task_1")
      - description: str what the task does
      - depends_on: list[str] ids of tasks that must complete first
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

    TODO: Implement the topological sort execution loop.

    Algorithm:
      1. Start with all tasks in `remaining`.
      2. Find tasks whose dependencies are all in `completed` (ready tasks).
      3. Execute each ready task, injecting completed results as context.
      4. Move the task from `remaining` to `completed`.
      5. Repeat until `remaining` is empty.
      6. If a loop iteration finds no ready tasks, there is a circular dependency
         -- raise ValueError.

    Hint:
      completed: dict = {}
      remaining: list = list(tasks)

      while remaining:
          ready = [t for t in remaining if all(d in completed for d in t.get("depends_on", []))]
          if not ready:
              raise ValueError("Circular dependency detected")
          for task in ready:
              dep_context = {dep_id: completed[dep_id] for dep_id in task.get("depends_on", [])}
              result = run_subagent(task["description"], dep_context)
              completed[task["id"]] = result
              remaining.remove(task)
    """
    # TODO: implement the topological execution loop described above
    raise NotImplementedError("Implement execute_in_order")


if __name__ == "__main__":
    goal = "Write a short blog post about prompt caching in large language models."
    print("Decomposing goal:", goal)
    tasks = decompose_goal(goal)
    print("Tasks:", json.dumps(tasks, indent=2))

    print("\nExecuting tasks...")
    results = execute_in_order(tasks)
    for task_id, result in results.items():
        print("\n[" + task_id + "] " + result[:200] + "...")
