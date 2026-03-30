"""
Tests for Lab 09: Task Decomposition
Tests patch run_subagent — no real API call needed.
"""

import os
import importlib
from unittest.mock import MagicMock, patch
import pytest

LAB_DIR = os.path.dirname(__file__)


def load_solution():
    spec = importlib.util.spec_from_file_location(
        "solution_09", os.path.join(LAB_DIR, "solution.py")
    )
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


class TestExecuteInOrder:
    def setup_method(self):
        self.solution = load_solution()

    def test_tasks_with_no_deps_execute_first(self):
        """Tasks with empty depends_on run before tasks that depend on them."""
        tasks = [
            {"id": "b", "description": "Step B", "depends_on": ["a"]},
            {"id": "a", "description": "Step A", "depends_on": []},
        ]
        with patch.object(self.solution, "run_subagent", return_value="output"):
            results = self.solution.execute_in_order(tasks)

        assert "a" in results
        assert "b" in results

    def test_dependency_result_injected_into_context(self):
        """The result of task A must be passed to task B's context_data."""
        tasks = [
            {"id": "a", "description": "Research phase", "depends_on": []},
            {"id": "b", "description": "Write phase", "depends_on": ["a"]},
        ]
        call_contexts = []

        def fake_subagent(task_description, context_data):
            call_contexts.append(dict(context_data))
            return "done: " + task_description

        with patch.object(self.solution, "run_subagent", side_effect=fake_subagent):
            self.solution.execute_in_order(tasks)

        # Task A has no deps — its context should be empty
        assert call_contexts[0] == {}
        # Task B depends on A — its context must include A's result
        assert "a" in call_contexts[1]

    def test_circular_dependency_raises_value_error(self):
        """A->B->A cycle must raise ValueError mentioning circular dependency."""
        tasks = [
            {"id": "a", "description": "A", "depends_on": ["b"]},
            {"id": "b", "description": "B", "depends_on": ["a"]},
        ]
        with patch.object(self.solution, "run_subagent", return_value="x"):
            with pytest.raises(ValueError, match="[Cc]ircular"):
                self.solution.execute_in_order(tasks)

    def test_independent_tasks_all_complete(self):
        """Three independent tasks (no deps) should all appear in the result."""
        tasks = [
            {"id": "x", "description": "X", "depends_on": []},
            {"id": "y", "description": "Y", "depends_on": []},
            {"id": "z", "description": "Z", "depends_on": []},
        ]
        with patch.object(self.solution, "run_subagent", return_value="ok"):
            results = self.solution.execute_in_order(tasks)

        assert set(results.keys()) == {"x", "y", "z"}

    def test_chain_of_three_executes_in_order(self):
        """A->B->C: C must receive B's output and B must receive A's output."""
        tasks = [
            {"id": "a", "description": "First", "depends_on": []},
            {"id": "b", "description": "Second", "depends_on": ["a"]},
            {"id": "c", "description": "Third", "depends_on": ["b"]},
        ]
        execution_order = []

        def fake_subagent(task_description, context_data):
            execution_order.append(task_description)
            return "result_" + task_description.lower().split()[0]

        with patch.object(self.solution, "run_subagent", side_effect=fake_subagent):
            results = self.solution.execute_in_order(tasks)

        assert execution_order == ["First", "Second", "Third"]
        assert "a" in results and "b" in results and "c" in results

    def test_only_dependency_outputs_injected(self):
        """Only the direct dependencies' results should appear in context_data."""
        tasks = [
            {"id": "a", "description": "A", "depends_on": []},
            {"id": "b", "description": "B", "depends_on": []},
            # C depends only on A, not B
            {"id": "c", "description": "C", "depends_on": ["a"]},
        ]
        call_contexts = []

        def fake_subagent(task_description, context_data):
            call_contexts.append((task_description, dict(context_data)))
            return "done"

        with patch.object(self.solution, "run_subagent", side_effect=fake_subagent):
            self.solution.execute_in_order(tasks)

        # Find the context passed to task C
        c_context = next(ctx for desc, ctx in call_contexts if desc == "C")
        assert "a" in c_context        # direct dependency
        assert "b" not in c_context   # not a dependency of C
