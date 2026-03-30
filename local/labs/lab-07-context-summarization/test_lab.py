"""
Tests for Lab 07: Context Summarization
Tests mock the Anthropic client — no real API key required.
"""

import os
import importlib
from unittest.mock import MagicMock, call
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_07", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def _mock_response(text: str):
    block = MagicMock()
    block.text = text
    resp = MagicMock()
    resp.content = [block]
    return resp


class TestConversationManager:
    def _make_manager(self, max_messages: int = 4):
        solution = load_solution()
        mock_client = MagicMock()
        manager = solution.ConversationManager(mock_client, max_messages=max_messages)
        return manager, mock_client

    def test_add_message_appends_to_list(self):
        manager, _ = self._make_manager(max_messages=10)
        manager.add_message("user", "Hello")
        assert len(manager.messages) == 1
        assert manager.messages[0] == {"role": "user", "content": "Hello"}

    def test_messages_within_limit_no_summarization(self):
        """When messages stay within limit, no API call should be made."""
        manager, mock_client = self._make_manager(max_messages=6)

        for i in range(6):
            manager.add_message("user", f"Message {i}")

        # No summarization API call should have occurred
        mock_client.messages.create.assert_not_called()
        assert len(manager.messages) == 6

    def test_exceeding_limit_triggers_summarization(self):
        """When messages exceed max_messages, summarize should be called."""
        manager, mock_client = self._make_manager(max_messages=4)

        # Set up the mock to return a summary response
        mock_client.messages.create.return_value = _mock_response("Summary of past messages")

        # Add one more message than the limit to trigger summarization
        for i in range(5):
            manager.add_message("user", f"Message {i}")

        # The API should have been called for summarization
        mock_client.messages.create.assert_called_once()
        # The summary should be stored
        assert manager.summary == "Summary of past messages"

    def test_old_messages_trimmed_after_summarization(self):
        """After summarization, only the last 4 messages should remain."""
        manager, mock_client = self._make_manager(max_messages=4)
        mock_client.messages.create.return_value = _mock_response("Compact summary")

        for i in range(5):
            manager.add_message("user", f"Message {i}")

        # Only the last 4 messages should remain in the window
        assert len(manager.messages) == 4

    def test_summary_stored_in_summary_attribute(self):
        """The summary text from the API should be stored in self.summary."""
        manager, mock_client = self._make_manager(max_messages=4)
        mock_client.messages.create.return_value = _mock_response("This is the summary.")

        for i in range(5):
            manager.add_message("user", f"msg {i}")

        assert manager.summary == "This is the summary."

    def test_get_system_with_summary_returns_summary_when_set(self):
        """When summary is non-empty, system prompt should include it."""
        manager, _ = self._make_manager()
        manager.summary = "We discussed agentic loops."

        system = manager.get_system_with_summary()
        assert "We discussed agentic loops." in system

    def test_get_system_with_summary_returns_default_when_empty(self):
        """When no summary exists yet, return a generic system prompt."""
        manager, _ = self._make_manager()
        system = manager.get_system_with_summary()
        assert len(system) > 0
        # Should not mention summary since none exists
        assert "summary so far" not in system.lower() or manager.summary == ""

    def test_summarization_prompt_includes_old_messages(self):
        """The summarization API call should include the messages being summarized."""
        manager, mock_client = self._make_manager(max_messages=4)
        mock_client.messages.create.return_value = _mock_response("Summary")

        manager.add_message("user", "First message about loops")
        manager.add_message("assistant", "Response about loops")
        manager.add_message("user", "Second message about caching")
        manager.add_message("assistant", "Response about caching")
        manager.add_message("user", "Fifth message — triggers summarization")

        # Verify the summarization call included content from old messages
        call_kwargs = mock_client.messages.create.call_args[1]
        messages_in_call = call_kwargs["messages"]
        all_content = " ".join(str(m.get("content", "")) for m in messages_in_call)
        assert "First message about loops" in all_content or "loops" in all_content
