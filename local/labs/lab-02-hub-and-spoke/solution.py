"""
Lab 02: Hub-and-Spoke Multi-Agent System — SOLUTION
=====================================================
Key pattern: the coordinator explicitly injects the research output into the
analysis subagent's context. Each subagent is isolated — it cannot reach back
to read earlier results on its own.
"""

import json
import anthropic

client = anthropic.Anthropic()


def run_subagent(task_spec: str, context_data: dict) -> str:
    """
    Run a stateless subagent with an explicit, self-contained context payload.

    Serializing context_data as JSON makes it unambiguous — the subagent
    receives structured data, not vague instructions to "remember earlier work".
    """
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
    Coordinate research and analysis via a hub-and-spoke pattern.

    The coordinator (hub) is the only stateful entity.  Each subagent
    (spoke) receives exactly the data it needs — no more, no less.
    """
    # ------------------------------------------------------------------
    # Step 1: Plan — ask the powerful model to outline the approach
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
    # Context includes the goal and a focus area.  The subagent's output
    # will be stored in `research_result` so it can be injected later.
    # ------------------------------------------------------------------
    research_result = run_subagent(
        task_spec="Research competitors and market dynamics relevant to this goal.",
        context_data={
            "goal": goal,
            "focus": "competitors",
            "instructions": "List 3-5 key competitors and one sentence about each.",
        },
    )

    # ------------------------------------------------------------------
    # Step 2b: Analysis subagent
    # Explicit injection: research_result is passed in context_data.
    # This is the defining feature of hub-and-spoke — the coordinator
    # bridges the gap between subagents by relaying their outputs.
    # ------------------------------------------------------------------
    analysis_result = run_subagent(
        task_spec="Analyze the research findings and identify strategic implications.",
        context_data={
            "goal": goal,
            "research": research_result,  # <-- explicit context passing
            "instructions": (
                "Based on the research above, identify 2-3 strategic implications "
                "and any gaps or opportunities."
            ),
        },
    )

    # ------------------------------------------------------------------
    # Step 3: Aggregate — coordinator synthesizes the full picture
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
