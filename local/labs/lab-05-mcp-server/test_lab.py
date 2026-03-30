"""
Tests for Lab 05: MCP Server
Pure logic tests — no API call or MCP transport needed.
"""

import os
import importlib
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_05", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


class TestGetTopicSummary:
    def setup_method(self):
        self.solution = load_solution()

    def test_known_topic_returns_non_empty_string(self):
        result = self.solution.get_topic_summary("agentic-loops")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_known_topic_case_insensitive(self):
        lower = self.solution.get_topic_summary("agentic-loops")
        upper = self.solution.get_topic_summary("Agentic-Loops")
        assert lower == upper

    def test_spaces_normalized_to_hyphens(self):
        with_hyphen = self.solution.get_topic_summary("hub-and-spoke")
        with_spaces = self.solution.get_topic_summary("hub and spoke")
        assert with_hyphen == with_spaces

    def test_unknown_topic_returns_helpful_message(self):
        result = self.solution.get_topic_summary("quantum-computing")
        # Should not raise; should return a string mentioning the unknown topic
        assert isinstance(result, str)
        assert len(result) > 0

    def test_all_known_topics_return_summaries(self):
        known_topics = [
            "agentic-loops",
            "hub-and-spoke",
            "structured-output",
            "prompt-caching",
            "tool-errors",
            "context-summarization",
            "human-in-the-loop",
            "task-decomposition",
        ]
        for topic in known_topics:
            result = self.solution.get_topic_summary(topic)
            assert isinstance(result, str) and len(result) > 10, (
                f"Expected non-trivial summary for topic '{topic}'"
            )


class TestCalculateExamScore:
    def setup_method(self):
        self.solution = load_solution()

    def test_perfect_score(self):
        result = self.solution.calculate_exam_score(10, 10)
        assert result["percentage"] == 100.0
        assert result["passed"] is True
        assert result["correct"] == 10
        assert result["total"] == 10

    def test_passing_score_at_threshold(self):
        result = self.solution.calculate_exam_score(7, 10)
        assert result["percentage"] == 70.0
        assert result["passed"] is True

    def test_failing_score_below_threshold(self):
        result = self.solution.calculate_exam_score(6, 10)
        assert result["percentage"] == 60.0
        assert result["passed"] is False

    def test_zero_correct(self):
        result = self.solution.calculate_exam_score(0, 10)
        assert result["percentage"] == 0.0
        assert result["passed"] is False

    def test_zero_total_raises_value_error(self):
        with pytest.raises(ValueError):
            self.solution.calculate_exam_score(0, 0)

    def test_percentage_rounded_to_one_decimal(self):
        result = self.solution.calculate_exam_score(1, 3)
        # 1/3 * 100 = 33.333... should round to 33.3
        assert result["percentage"] == 33.3

    def test_return_dict_has_all_keys(self):
        result = self.solution.calculate_exam_score(8, 10)
        assert "percentage" in result
        assert "passed" in result
        assert "correct" in result
        assert "total" in result
