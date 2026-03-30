# CCA Study Guide — Local Labs & Skills

Standalone Python labs and Claude Code skills for the Claude Code Associate (CCA) exam.
These files are **independent** of the Next.js web app in the repo root.

---

## Prerequisites

- Python 3.11 or higher
- pip
- An Anthropic API key (`ANTHROPIC_API_KEY`)

---

## Setup

```bash
# 1. Clone the repo (if you haven't already) and navigate to this directory
git clone <repo-url>
cd cca-study-guide/local

# 2. Run the setup script (creates a virtualenv and installs deps)
bash setup.sh

# 3. Activate the virtualenv
source .venv/bin/activate

# 4. Export your API key
export ANTHROPIC_API_KEY=sk-ant-...
```

Or install manually:

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Running a Lab

Each lab has a `starter.py` (for you to complete) and a `solution.py` (reference implementation).

```bash
# Run the starter you're working on
python labs/lab-01-agentic-loop/starter.py

# Compare against the solution
python labs/lab-01-agentic-loop/solution.py
```

---

## Running Tests

Tests mock the Anthropic API — **no real API key required** for testing.

```bash
# Run all labs at once
./run-tests.sh

# Run a single lab's tests
pytest labs/lab-01-agentic-loop/test_lab.py -v

# Run with short tracebacks
pytest labs/ -v --tb=short
```

---

## Lab Index

| # | Directory | Domain | Est. Time |
|---|-----------|--------|-----------|
| 01 | `lab-01-agentic-loop` | Tool-use agentic loop with `stop_reason` handling | 20 min |
| 02 | `lab-02-hub-and-spoke` | Multi-agent hub-and-spoke with explicit context passing | 25 min |
| 03 | `lab-03-structured-output` | Pydantic validation + retry loop for JSON output | 20 min |
| 04 | `lab-04-prompt-caching` | `cache_control` headers and token savings measurement | 15 min |
| 05 | `lab-05-mcp-server` | Building an MCP server with two tools via FastMCP | 20 min |
| 06 | `lab-06-tool-errors` | Structured error returns vs. raw exceptions in tools | 15 min |
| 07 | `lab-07-context-summarization` | Rolling summarization to prevent context overflow | 25 min |
| 08 | `lab-08-human-in-the-loop` | Approval gate for risky tool calls | 20 min |
| 09 | `lab-09-task-decomposition` | Dependency-ordered task decomposition and execution | 30 min |

---

## Skills (Slash Commands)

The `skills/` directory contains Claude Code slash commands. To use them, reference the
skill file path in your Claude Code configuration, or invoke them directly as custom commands.

| File | Purpose |
|------|---------|
| `skills/review-code.md` | Review Python code for CCA exam patterns |
| `skills/write-tests.md` | Generate pytest tests with mocked API |
| `skills/summarize-context.md` | Summarize conversation progress |
| `skills/explain-error.md` | Plain-English error explanation + fix |
| `skills/generate-quiz.md` | Generate scenario-based quiz questions |
