"""
Tests for Lab 02: Hub-and-Spoke
Tests mock the Anthropic client — no real API key required.
"""

import json
import os
import importlib
from unittest.mock import MagicMock, patch

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_02", os.path.join(LAB_DIR, "solution.py")
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


class TestRunSubagent:
    def setup_method(self):
        self.solution = load_solution()

    def test_builds_correct_message_format(self):
        """run_subagent should include task_spec and context_data in the user message."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response("subagent output")
        self.solution.client = mock_client

        self.solution.run_subagent(
            "Do some research",
            {"goal": "test goal", "focus": "competitors"},
        )

        call_kwargs = mock_client.messages.create.call_args[1]
        user_content = call_kwargs["messages"][0]["content"]

        assert "Do some research" in user_content
        assert "test goal" in user_content
        assert "competitors" in user_content

    def test_returns_text_from_response(self):
        """run_subagent returns the text from the API response."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response("Research complete.")
        self.solution.client = mock_client

        result = self.solution.run_subagent("Task", {"key": "value"})
        assert result == "Research complete."

    def test_context_data_serialized_as_json(self):
        """Context data must be JSON-serialized so it is structured and readable."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response("ok")
        self.solution.client = mock_client

        context = {"goal": "my goal", "focus": "market"}
        self.solution.run_subagent("Task", context)

        call_kwargs = mock_client.messages.create.call_args[1]
        user_content = call_kwargs["messages"][0]["content"]

        # The JSON-serialized context should appear in the prompt
        for key in context:
            assert key in user_content


class TestCoordinatorAgent:
    def setup_method(self):
        self.solution = load_solution()

    def test_research_result_passed_to_analysis_subagent(self):
        """
        The coordinator must inject research_result into the analysis subagent's
        context. This is the defining feature of hub-and-spoke.
        """
        call_count = 0
        responses = [
            _mock_response("Plan: step 1, step 2"),           # plan
            _mock_response("Research: Competitor A, B, C"),   # research subagent
            _mock_response("Analysis: strategic implication"), # analysis subagent
            _mock_response("Final summary"),                   # aggregate
        ]

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = responses
        self.solution.client = mock_client

        self.solution.coordinator_agent("Test goal")

        # There should be 4 API calls total
        assert mock_client.messages.create.call_count == 4

        # The third call (index 2) is the analysis subagent.
        # Its user message must contain the research output.
        third_call_kwargs = mock_client.messages.create.call_args_list[2][1]
        analysis_content = third_call_kwargs["messages"][0]["content"]
        assert "Research: Competitor A, B, C" in analysis_content

    def test_context_data_keys_for_research_subagent(self):
        """Research subagent context should include 'goal' and 'focus'."""
        responses = [
            _mock_response("Plan"),
            _mock_response("Research output"),
            _mock_response("Analysis output"),
            _mock_response("Summary"),
        ]
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = responses
        self.solution.client = mock_client

        self.solution.coordinator_agent("My goal")

        # Second call (index 1) is the research subagent
        second_call_kwargs = mock_client.messages.create.call_args_list[1][1]
        content = second_call_kwargs["messages"][0]["content"]
        assert "My goal" in content
        # Should mention competitors or focus
        assert "competitor" in content.lower() or "focus" in content.lower()

    def test_final_summary_returned(self):
        """coordinator_agent should return the text of the final aggregate call."""
        responses = [
            _mock_response("Plan"),
            _mock_response("Research"),
            _mock_response("Analysis"),
            _mock_response("This is the final answer."),
        ]
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = responses
        self.solution.client = mock_client

        result = self.solution.coordinator_agent("Goal")
        assert result == "This is the final answer."
