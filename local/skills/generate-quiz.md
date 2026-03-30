---
name: generate-quiz
description: Generate 3 scenario-based multiple-choice quiz questions about a CCA exam topic
---

Generate 3 scenario-based multiple-choice quiz questions about $ARGUMENTS for the CCA (Claude Code Associate) exam.

Each question must:
- Be scenario-based: describe a realistic situation a developer would encounter, not a definition lookup
- Have exactly 4 options (A, B, C, D)
- Include plausible wrong answers that reflect common misconceptions — not obviously wrong choices
- Include the correct answer label
- Include a one-sentence explanation for each option explaining why it is right or wrong

Use this format for each question:

Q1. [scenario description and question]
A) ...
B) ...
C) ...
D) ...
Correct: [A/B/C/D]
Explanations:
  A: [why right or wrong]
  B: [why right or wrong]
  C: [why right or wrong]
  D: [why right or wrong]

Topics that commonly appear on the exam: agentic loops, stop_reason handling, tool error returns, hub-and-spoke context passing, prompt caching headers, MCP tool design, context window management, human-in-the-loop approval gates, and task decomposition with dependency injection.
