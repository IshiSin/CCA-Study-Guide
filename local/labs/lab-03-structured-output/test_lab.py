"""
Tests for Lab 03: Structured Output
Tests mock the Anthropic client — no real API key required.
"""

import json
import os
import importlib
from unittest.mock import MagicMock
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_03", os.path.join(LAB_DIR, "solution.py")
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


VALID_JSON = json.dumps({
    "sentiment": "positive",
    "score": 5,
    "summary": "Great product overall.",
    "key_points": ["Battery life is excellent", "Display is sharp"],
})

INVALID_JSON = "Sorry, I cannot analyze that right now."

BAD_SCHEMA_JSON = json.dumps({
    "sentiment": "amazing",  # not in allowed literals
    "score": "five",         # wrong type (string instead of int)
    "summary": "Good",
    "key_points": [],
})


class TestExtractReview:
    def setup_method(self):
        self.solution = load_solution()

    def test_valid_json_returns_product_review(self):
        """Happy path: valid JSON should return a ProductReview instance."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response(VALID_JSON)
        self.solution.client = mock_client

        result = self.solution.extract_review("Great product!")
        assert result.__class__.__name__ == "ProductReview"
        assert result.sentiment == "positive"
        assert result.score == 5
        assert isinstance(result.key_points, list)

    def test_invalid_json_triggers_retry(self):
        """First call returns garbage JSON; second call returns valid JSON."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [
            _mock_response(INVALID_JSON),  # attempt 1 — bad
            _mock_response(VALID_JSON),    # attempt 2 — good
        ]
        self.solution.client = mock_client

        result = self.solution.extract_review("Some review", max_retries=3)
        assert result.__class__.__name__ == "ProductReview"
        assert mock_client.messages.create.call_count == 2

    def test_bad_schema_triggers_retry(self):
        """Pydantic validation failure should also trigger a retry."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [
            _mock_response(BAD_SCHEMA_JSON),  # fails Pydantic validation
            _mock_response(VALID_JSON),
        ]
        self.solution.client = mock_client

        result = self.solution.extract_review("Some review", max_retries=3)
        assert result.__class__.__name__ == "ProductReview"
        assert mock_client.messages.create.call_count == 2

    def test_max_retries_raises_after_exhaustion(self):
        """When all retries fail, the exception should propagate."""
        mock_client = MagicMock()
        # Return invalid JSON on every attempt
        mock_client.messages.create.return_value = _mock_response("not json at all {{{")
        self.solution.client = mock_client

        with pytest.raises(Exception):
            self.solution.extract_review("Some review", max_retries=2)

        # Should have called the API exactly max_retries times
        assert mock_client.messages.create.call_count == 2

    def test_retry_includes_error_in_followup_message(self):
        """After a failure, the retry message should include the bad response."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = [
            _mock_response(INVALID_JSON),
            _mock_response(VALID_JSON),
        ]
        self.solution.client = mock_client

        self.solution.extract_review("Some review", max_retries=3)

        # The second API call should carry a message mentioning the failure
        second_call_kwargs = mock_client.messages.create.call_args_list[1][1]
        messages = second_call_kwargs["messages"]
        all_content = " ".join(str(m.get("content", "")) for m in messages)
        # The corrective turn should mention the previous bad response
        assert INVALID_JSON in all_content or "previous response" in all_content.lower()
