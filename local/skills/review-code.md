---
name: review-code
description: Review Python code for correctness, style, and CCA exam patterns
---

Review the code in $ARGUMENTS (or the most recently edited file if none given) and:

1. **Correctness** — Check for logic errors, off-by-one issues, missing edge cases, and incorrect API usage (e.g., wrong stop_reason check, tool_use_id mismatch, missing message append before tool results).

2. **CCA exam patterns** — Verify the code matches exam expectations:
   - Agentic loops: checks `stop_reason`, appends assistant message before tool results, handles all tool_use blocks in one pass
   - Hub-and-spoke: subagents receive context explicitly via arguments, not shared state
   - Structured output: has a retry loop with error feedback, not just a single attempt
   - Prompt caching: `cache_control` is on a content block inside a list, not a top-level string
   - Tool errors: returns `{"success": False, "error": "..."}` dicts, does not raise raw exceptions
   - Context summarization: trims messages AND stores summary separately; summary is injected via system prompt
   - Human-in-the-loop: risky tool check happens before `execute_tool`, denial returns `is_error: True`
   - Task decomposition: topological sort detects cycles, only injects direct dependency outputs

3. **Style** — Flag unnecessary complexity, missing type hints, or misleading variable names. Keep suggestions concise — one line each.

Output format:
- What's correct (bullet list)
- Issues found (with line numbers if possible)
- Suggestions (optional improvements, not required fixes)
