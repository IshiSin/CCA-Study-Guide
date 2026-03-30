"""
Tests for Lab 06: Tool Error Handling
Tests mock the Anthropic client — no real API key required.
"""

import os
import importlib
import tempfile
from unittest.mock import MagicMock
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_06", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


class TestFileReader:
    def setup_method(self):
        self.solution = load_solution()

    def test_existing_file_returns_success(self):
        """Reading an existing file should return success=True with content."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("hello world")
            path = f.name

        try:
            result = self.solution.file_reader(path)
            assert result["success"] is True
            assert result["content"] == "hello world"
            assert result["path"] == path
        finally:
            os.unlink(path)

    def test_missing_file_returns_structured_error(self):
        """Missing file must NOT raise — return success=False with error code."""
        result = self.solution.file_reader("/nonexistent/path/file.txt")
        assert result["success"] is False
        assert result["error"] == "FILE_NOT_FOUND"
        assert "path" in result
        assert "message" in result

    def test_missing_file_does_not_raise(self):
        """file_reader must never raise FileNotFoundError."""
        try:
            self.solution.file_reader("/nonexistent/path/file.txt")
        except FileNotFoundError:
            pytest.fail("file_reader raised FileNotFoundError — should return structured error")

    def test_error_dict_has_required_keys(self):
        """Error dict must include success, error, path, and message keys."""
        result = self.solution.file_reader("/does/not/exist.txt")
        for key in ("success", "error", "path", "message"):
            assert key in result, f"Missing key '{key}' in error dict"

    def test_success_result_has_content_key(self):
        """Success dict must include the content key."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("test content")
            path = f.name
        try:
            result = self.solution.file_reader(path)
            assert "content" in result
        finally:
            os.unlink(path)


class TestRunAgent:
    def setup_method(self):
        self.solution = load_solution()

    def _make_tool_use_block(self, path: str, block_id: str = "toolu_001"):
        block = MagicMock()
        block.type = "tool_use"
        block.name = "file_reader"
        block.input = {"path": path}
        block.id = block_id
        return block

    def _make_text_block(self, text: str):
        block = MagicMock()
        block.type = "text"
        block.text = text
        return block

    def _make_response(self, stop_reason: str, content):
        resp = MagicMock()
        resp.stop_reason = stop_reason
        resp.content = content
        return resp

    def test_tool_error_dict_passed_as_tool_result(self):
        """When file_reader returns an error dict, it should be in the tool result."""
        tool_block = self._make_tool_use_block("/does/not/exist.txt")
        first_response = self._make_response("tool_use", [tool_block])
        second_response = self._make_response(
            "end_turn", [self._make_text_block("I could not read the file.")]
        )

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [first_response, second_response]
        self.solution.client = mock_client

        # Should not raise, even though the file doesn't exist
        result = self.solution.run_agent("Read /does/not/exist.txt")
        assert isinstance(result, str)

        # Verify the second API call carried a tool result
        second_kwargs = mock_client.messages.create.call_args_list[1][1]
        messages = second_kwargs["messages"]
        tool_result_msg = messages[-1]
        assert tool_result_msg["role"] == "user"
        content = tool_result_msg["content"]
        assert len(content) == 1
        assert content[0]["type"] == "tool_result"
        # The error dict string should mention FILE_NOT_FOUND
        assert "FILE_NOT_FOUND" in content[0]["content"]
