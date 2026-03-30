"""
Lab 02: Hub-and-Spoke Multi-Agent System
=========================================
Learning objective: Build a hub-and-spoke architecture where a coordinator
(hub) explicitly passes context to each subagent (spoke).

The critical rule: subagents are stateless. They have no memory of previous
calls. Every piece of context they need must be explicitly included in their
prompt. This is different from a shared-memory approach and is intentional —
it keeps subagents isolated and composable.

Your task: Complete the TODO sections in `coordinator_agent`.
"""

import json
import anthropic

client = anthropic.Anthropic()


def run_subagent(task_spec: str, context_data: dict) -> str:
    """
    Run a single subagent with a task description and explicit context.

    `task_spec`    — what the subagent should do (plain English)
    `context_data` — all data the subagent needs, passed explicitly in the prompt

    This function builds a self-contained message so the subagent has
    everything it needs without relying on shared state.
    """
    # Serialize context so it is readable inside the prompt string
    context_str = json.dumps(context_data, indent=2)

    messages = [
        {
            "role": "user",
            "content": (
                f"Task: {task_spec}\n\n"
                f"Context:\n{context_str}\n\n"
                "Complete the task using only the context provided above."
            ),
        }
    ]

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=512,
        messages=messages,
    )
    return response.content[0].text


def coordinator_agent(goal: str) -> str:
    """
    Coordinate a multi-step research and analysis workflow.

    Step 1 — Plan:    Ask claude-opus-4-5 to outline the approach.
    Step 2 — Delegate: Run two subagents, passing context explicitly.
    Step 3 — Aggregate: Combine results into a final answer.

    The coordinator is the only entity that accumulates state; subagents
    receive only what they need for their specific task.
    """
    # ------------------------------------------------------------------
    # Step 1: Plan
    # ------------------------------------------------------------------
    plan_response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Goal: {goal}\n\n"
                    "List 2-3 research steps needed to accomplish this goal. "
                    "Be concise — one sentence per step."
                ),
            }
        ],
    )
    plan = plan_response.content[0].text

    # ------------------------------------------------------------------
    # Step 2a: Research subagent
    # TODO: Call run_subagent for the research phase.
    #       The context_data should include at least: goal and focus.
    # ------------------------------------------------------------------
    research_result = None  # TODO: replace with run_subagent(...)

    # ------------------------------------------------------------------
    # Step 2b: Analysis subagent
    # TODO: Call run_subagent for the analysis phase.
    #       IMPORTANT: Pass `research_result` inside context_data so the
    #       analysis subagent can actually use the research output.
    #       Without this, the subagent would have no data to analyze.
    # ------------------------------------------------------------------
    analysis_result = None  # TODO: replace with run_subagent(...)

    # ------------------------------------------------------------------
    # Step 3: Aggregate — coordinator combines everything
    # ------------------------------------------------------------------
    aggregate_response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Goal: {goal}\n\n"
                    f"Plan:\n{plan}\n\n"
                    f"Research findings:\n{research_result}\n\n"
                    f"Analysis:\n{analysis_result}\n\n"
                    "Write a concise final summary that answers the original goal."
                ),
            }
        ],
    )
    return aggregate_response.content[0].text


if __name__ == "__main__":
    result = coordinator_agent("Analyze the competitive landscape for AI coding assistants.")
    print(result)
