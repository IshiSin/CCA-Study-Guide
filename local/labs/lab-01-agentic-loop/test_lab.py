"""
Tests for Lab 01: Agentic Loop
Tests mock the Anthropic client — no real API key required.
"""

from unittest.mock import MagicMock, patch, call
import pytest

# ---------------------------------------------------------------------------
# Import both modules under test
# ---------------------------------------------------------------------------
import importlib
import sys
import os

# Make sure labs directory is on the path
LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_01", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def load_starter():
    spec = importlib.util.spec_from_file_location(
        "starter_01", os.path.join(LAB_DIR, "starter.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


# ---------------------------------------------------------------------------
# Tests for process_tool_call (present in both starter and solution)
# ---------------------------------------------------------------------------

class TestProcessToolCall:
    def setup_method(self):
        self.solution = load_solution()

    def test_calculator_add(self):
        result = self.solution.process_tool_call("calculator", {"operation": "add", "a": 3, "b": 7})
        assert result == "10"

    def test_calculator_multiply(self):
        result = self.solution.process_tool_call("calculator", {"operation": "multiply", "a": 4, "b": 5})
        assert result == "20"

    def test_calculator_unknown_operation(self):
        result = self.solution.process_tool_call("calculator", {"operation": "divide", "a": 10, "b": 2})
        assert "Unknown" in result

    def test_web_search_returns_string(self):
        result = self.solution.process_tool_call("web_search", {"query": "agentic loops"})
        assert isinstance(result, str)
        assert "agentic loops" in result

    def test_unknown_tool_returns_error_string(self):
        result = self.solution.process_tool_call("nonexistent_tool", {})
        assert "Unknown" in result


# ---------------------------------------------------------------------------
# Tests for run_agent (solution only, since starter raises NotImplementedError)
# ---------------------------------------------------------------------------

def _make_tool_use_block(tool_name: str, tool_input: dict, block_id: str = "toolu_001"):
    """Helper: create a mock tool_use content block."""
    block = MagicMock()
    block.type = "tool_use"
    block.name = tool_name
    block.input = tool_input
    block.id = block_id
    return block


def _make_text_block(text: str):
    """Helper: create a mock text content block."""
    block = MagicMock()
    block.type = "text"
    block.text = text
    return block


def _make_response(stop_reason: str, content):
    """Helper: create a mock API response."""
    resp = MagicMock()
    resp.stop_reason = stop_reason
    resp.content = content
    return resp


class TestRunAgentSolution:
    def setup_method(self):
        self.solution = load_solution()

    @patch("anthropic.Anthropic")
    def test_end_turn_immediately(self, mock_anthropic_cls):
        """When the first response is end_turn, return the text directly."""
        text_block = _make_text_block("The answer is 42.")
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _make_response("end_turn", [text_block])

        # Patch the module-level client
        self.solution.client = mock_client

        result = self.solution.run_agent("What is 6 times 7?")
        assert result == "The answer is 42."
        assert mock_client.messages.create.call_count == 1

    @patch("anthropic.Anthropic")
    def test_tool_use_then_end_turn(self, mock_anthropic_cls):
        """Loop runs once with tool_use, then returns text on end_turn."""
        tool_block = _make_tool_use_block("calculator", {"operation": "add", "a": 3, "b": 7})
        first_response = _make_response("tool_use", [tool_block])

        final_text = _make_text_block("3 + 7 = 10")
        second_response = _make_response("end_turn", [final_text])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        result = self.solution.run_agent("What is 3 + 7?")
        assert result == "3 + 7 = 10"
        # The loop should have called the API exactly twice
        assert mock_client.messages.create.call_count == 2

    @patch("anthropic.Anthropic")
    def test_tool_result_appended_with_correct_id(self, mock_anthropic_cls):
        """Tool result must reference the same tool_use_id as the request block."""
        tool_block = _make_tool_use_block(
            "calculator", {"operation": "multiply", "a": 4, "b": 5}, block_id="toolu_xyz"
        )
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response("end_turn", [_make_text_block("Result: 20")])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        self.solution.run_agent("What is 4 * 5?")

        # Inspect the second call to messages.create to verify the tool result
        second_call_kwargs = mock_client.messages.create.call_args_list[1][1]
        user_messages = second_call_kwargs["messages"]

        # The last user message should carry the tool result
        tool_result_msg = user_messages[-1]
        assert tool_result_msg["role"] == "user"
        results = tool_result_msg["content"]
        assert len(results) == 1
        assert results[0]["tool_use_id"] == "toolu_xyz"
        assert results[0]["type"] == "tool_result"

    @patch("anthropic.Anthropic")
    def test_assistant_message_appended_before_tool_result(self, mock_anthropic_cls):
        """The assistant message (tool request) must be appended before tool results."""
        tool_block = _make_tool_use_block("web_search", {"query": "test"})
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response("end_turn", [_make_text_block("Done")])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        self.solution.run_agent("Search for test")

        second_call_kwargs = mock_client.messages.create.call_args_list[1][1]
        messages = second_call_kwargs["messages"]

        # messages[-2] = assistant tool request, messages[-1] = user tool result
        assert messages[-2]["role"] == "assistant"
        assert messages[-1]["role"] == "user"
