---
name: write-tests
description: Write pytest tests for a Python file, mocking the Anthropic client
---

Write pytest tests for $ARGUMENTS.

Requirements:
- Use `unittest.mock.MagicMock` and `unittest.mock.patch` to mock the Anthropic client — tests must NOT make real API calls or require ANTHROPIC_API_KEY
- Cover the happy path and at least two error or edge cases per public function
- Use `pytest.raises` for exception assertions
- Name tests descriptively: `test_<function>_<scenario>`
- Keep each test focused on one behavior
- Add `# type: ignore` comments on lines where the mock replaces a typed object
- Do NOT use f-strings with backslashes inside the expression (Python <3.12 limitation) — assign to a variable first

Write the tests to a new file named `test_<original_filename>.py` in the same directory as the source file.
