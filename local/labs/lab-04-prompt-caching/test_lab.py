"""
Tests for Lab 04: Prompt Caching
Tests mock the Anthropic client — no real API key required.
"""

import os
import importlib
from unittest.mock import MagicMock
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_04", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def _mock_response(text: str, cache_read: int = 0, cache_creation: int = 0, input_tokens: int = 10):
    block = MagicMock()
    block.text = text

    usage = MagicMock()
    usage.input_tokens = input_tokens
    usage.cache_read_input_tokens = cache_read
    usage.cache_creation_input_tokens = cache_creation

    resp = MagicMock()
    resp.content = [block]
    resp.usage = usage
    return resp


class TestAskQuestion:
    def setup_method(self):
        self.solution = load_solution()

    def test_cached_system_is_list_with_cache_control(self):
        """When use_cache=True, the system parameter must be a list with cache_control."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response("Answer", cache_creation=500)
        self.solution.client = mock_client

        self.solution.ask_question("What is authentication?", use_cache=True)

        call_kwargs = mock_client.messages.create.call_args[1]
        system_param = call_kwargs["system"]

        # Must be a list (not a plain string) when caching is enabled
        assert isinstance(system_param, list), "system must be a list when use_cache=True"
        assert len(system_param) == 1

        block = system_param[0]
        assert block["type"] == "text"
        assert "cache_control" in block
        assert block["cache_control"]["type"] == "ephemeral"

    def test_uncached_system_is_plain_string(self):
        """When use_cache=False, the system parameter should be a plain string."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response("Answer")
        self.solution.client = mock_client

        self.solution.ask_question("What is authentication?", use_cache=False)

        call_kwargs = mock_client.messages.create.call_args[1]
        system_param = call_kwargs["system"]

        assert isinstance(system_param, str), "system must be a plain string when use_cache=False"
        assert "cache_control" not in system_param

    def test_return_dict_has_required_keys(self):
        """Return value must include text, input_tokens, cache_read_tokens, cache_creation_tokens."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response(
            "Here is the answer.", cache_read=300, cache_creation=0, input_tokens=5
        )
        self.solution.client = mock_client

        result = self.solution.ask_question("Question?", use_cache=True)

        assert "text" in result
        assert "input_tokens" in result
        assert "cache_read_tokens" in result
        assert "cache_creation_tokens" in result

    def test_cache_read_tokens_extracted_from_usage(self):
        """cache_read_tokens should reflect cache_read_input_tokens from the API."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response(
            "Cached response", cache_read=800, cache_creation=0
        )
        self.solution.client = mock_client

        result = self.solution.ask_question("Question?", use_cache=True)
        assert result["cache_read_tokens"] == 800

    def test_missing_cache_attrs_default_to_zero(self):
        """If the usage object lacks cache attributes, default to 0 (no error)."""
        mock_client = MagicMock()
        usage = MagicMock(spec=["input_tokens"])  # no cache attrs
        usage.input_tokens = 42
        resp = MagicMock()
        resp.content = [MagicMock(text="ok")]
        resp.usage = usage
        mock_client.messages.create.return_value = resp
        self.solution.client = mock_client

        result = self.solution.ask_question("Question?", use_cache=True)
        assert result["cache_read_tokens"] == 0
        assert result["cache_creation_tokens"] == 0

    def test_long_system_prompt_in_cached_block(self):
        """The LONG_SYSTEM_PROMPT text must appear inside the cached content block."""
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_response("ok")
        self.solution.client = mock_client

        self.solution.ask_question("Any question?", use_cache=True)

        call_kwargs = mock_client.messages.create.call_args[1]
        system_block = call_kwargs["system"][0]
        assert self.solution.LONG_SYSTEM_PROMPT in system_block["text"]
