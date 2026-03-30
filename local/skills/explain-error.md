---
name: explain-error
description: Explain a Python error or traceback in plain English, identify the root cause, and suggest a fix
---

Explain the error in $ARGUMENTS (paste an error message or full traceback) in plain English.

Provide:

1. **What happened** — one sentence describing what went wrong, without jargon
2. **Root cause** — the specific line or condition that triggered the error, not just the exception type name
3. **Fix** — the minimal code change to resolve it; show a before/after snippet if helpful

If the error is an Anthropic SDK error (such as overloaded_error, rate_limit_error, or invalid_request_error), also note:
- What typically causes this error in agentic systems
- How to handle it gracefully (retry logic, structured fallback, user-facing message)
- Whether it is something the CCA exam expects candidates to handle programmatically
