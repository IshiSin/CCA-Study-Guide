"""
Tests for Lab 08: Human-in-the-Loop
Tests mock the Anthropic client and builtins.input — no real API key or
interactive terminal required.
"""

import os
import importlib
from unittest.mock import MagicMock, patch
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_08", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def _make_tool_block(tool_name: str, tool_input: dict, block_id: str = "toolu_001"):
    block = MagicMock()
    block.type = "tool_use"
    block.name = tool_name
    block.input = tool_input
    block.id = block_id
    return block


def _make_text_block(text: str):
    block = MagicMock()
    block.type = "text"
    block.text = text
    return block


def _make_response(stop_reason: str, content):
    resp = MagicMock()
    resp.stop_reason = stop_reason
    resp.content = content
    return resp


class TestRiskyToolDetection:
    def setup_method(self):
        self.solution = load_solution()

    def test_risky_tools_set_contains_expected_tools(self):
        """The RISKY_TOOLS set must include delete_file, send_email, deploy_code."""
        assert "delete_file" in self.solution.RISKY_TOOLS
        assert "send_email" in self.solution.RISKY_TOOLS
        assert "deploy_code" in self.solution.RISKY_TOOLS

    def test_read_file_not_in_risky_tools(self):
        """read_file is a safe tool — it must NOT be in RISKY_TOOLS."""
        assert "read_file" not in self.solution.RISKY_TOOLS


class TestApprovalGate:
    def setup_method(self):
        self.solution = load_solution()

    def test_risky_tool_denied_returns_error_result(self):
        """When user enters 'n', the tool result must have is_error=True."""
        tool_block = _make_tool_block("delete_file", {"path": "/tmp/foo.txt"})
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response(
            "end_turn", [_make_text_block("I could not delete the file.")]
        )

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        with patch("builtins.input", return_value="n"):
            self.solution.run_with_approval("Delete /tmp/foo.txt", auto_approve=False)

        # Inspect the second API call for the tool result
        second_kwargs = mock_client.messages.create.call_args_list[1][1]
        messages = second_kwargs["messages"]
        user_msg = next(m for m in messages if m["role"] == "user" and isinstance(m["content"], list))
        result_block = user_msg["content"][0]

        assert result_block.get("is_error") is True
        assert "denied" in result_block["content"].lower()

    def test_risky_tool_approved_executes_without_error(self):
        """When user enters 'y', the tool executes and result has no is_error."""
        tool_block = _make_tool_block("delete_file", {"path": "/tmp/foo.txt"})
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response("end_turn", [_make_text_block("File deleted.")])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        with patch("builtins.input", return_value="y"):
            self.solution.run_with_approval("Delete /tmp/foo.txt", auto_approve=False)

        second_kwargs = mock_client.messages.create.call_args_list[1][1]
        messages = second_kwargs["messages"]
        user_msg = next(m for m in messages if m["role"] == "user" and isinstance(m["content"], list))
        result_block = user_msg["content"][0]

        # Approved tool should NOT have is_error
        assert result_block.get("is_error", False) is False

    def test_auto_approve_bypasses_input_prompt(self):
        """auto_approve=True must never call input()."""
        tool_block = _make_tool_block("deploy_code", {"repo": "myapp", "branch": "main"})
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response("end_turn", [_make_text_block("Deployed.")])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        with patch("builtins.input") as mock_input:
            self.solution.run_with_approval("Deploy main branch", auto_approve=True)

        mock_input.assert_not_called()

    def test_safe_tool_never_prompts_user(self):
        """read_file is safe — input() must never be called."""
        tool_block = _make_tool_block("read_file", {"path": "/tmp/readme.txt"})
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response("end_turn", [_make_text_block("File read.")])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        with patch("builtins.input") as mock_input:
            self.solution.run_with_approval("Read /tmp/readme.txt", auto_approve=False)

        mock_input.assert_not_called()

    def test_denied_tool_result_has_tool_use_id(self):
        """Denied tool result must reference the correct tool_use_id."""
        tool_block = _make_tool_block("send_email", {"to": "x@y.com", "subject": "Hi", "body": "Hello"}, "toolu_abc")
        first_response = _make_response("tool_use", [tool_block])
        second_response = _make_response("end_turn", [_make_text_block("Email not sent.")])

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        with patch("builtins.input", return_value="n"):
            self.solution.run_with_approval("Send email", auto_approve=False)

        second_kwargs = mock_client.messages.create.call_args_list[1][1]
        messages = second_kwargs["messages"]
        user_msg = next(m for m in messages if m["role"] == "user" and isinstance(m["content"], list))
        result_block = user_msg["content"][0]

        assert result_block["tool_use_id"] == "toolu_abc"
