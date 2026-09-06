"""
tracer.py
Hooks into LangGraph/LangChain's callback system to capture a step-by-step
execution trace: which node ran, what input it got, what it returned,
and how long it took.
"""

import time
import traceback
from typing import Any, Dict, List
from langchain_core.callbacks.base import BaseCallbackHandler


class TraceStep:
    """A single captured step in the agent's execution."""

    def __init__(self, name: str, step_type: str):
        self.name = name
        self.step_type = step_type          # "node", "tool", "llm", "error"
        self.input = None
        self.output = None
        self.start_time = time.time()
        self.end_time = None
        self.error = None

    def finish(self, output: Any = None, error: str = None):
        self.output = output
        self.error = error
        self.end_time = time.time()

    def to_dict(self) -> Dict:
        duration = None
        if self.end_time:
            duration = round(self.end_time - self.start_time, 4)
        return {
            "name": self.name,
            "type": self.step_type,
            "input": _safe_str(self.input),
            "output": _safe_str(self.output),
            "duration_sec": duration,
            "error": self.error,
        }


def _safe_str(value: Any, limit: int = 500) -> str:
    """Convert any value to a short, safe string for display."""
    try:
        text = str(value)
    except Exception:
        text = "<unprintable value>"
    return text if len(text) <= limit else text[:limit] + "...(truncated)"


class GraphTracer(BaseCallbackHandler):
    """
    A LangChain callback handler that records every chain/tool/LLM call
    as a TraceStep, so the whole run can be replayed step by step.
    """

    def __init__(self):
        self.steps: List[TraceStep] = []
        self._active: Dict[str, TraceStep] = {}

    # ---- Chain / node events ----
    def on_chain_start(self, serialized, inputs, *, run_id, **kwargs):
        # LangGraph puts the real node name in kwargs["name"], not `serialized`.
        name = kwargs.get("name") or (serialized or {}).get("name", "node")
        step = TraceStep(name=name, step_type="node")
        step.input = inputs
        self._active[str(run_id)] = step
        self.steps.append(step)

    def on_chain_end(self, outputs, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(output=outputs)

    def on_chain_error(self, error, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(error="".join(traceback.format_exception_only(type(error), error)))

    # ---- Tool call events ----
    def on_tool_start(self, serialized, input_str, *, run_id, **kwargs):
        name = kwargs.get("name") or (serialized or {}).get("name", "tool")
        step = TraceStep(name=name, step_type="tool")
        step.input = input_str
        self._active[str(run_id)] = step
        self.steps.append(step)

    def on_tool_end(self, output, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(output=output)

    def on_tool_error(self, error, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(error="".join(traceback.format_exception_only(type(error), error)))

    # ---- LLM call events ----
    def on_llm_start(self, serialized, prompts, *, run_id, **kwargs):
        step = TraceStep(name="llm_call", step_type="llm")
        step.input = prompts
        self._active[str(run_id)] = step
        self.steps.append(step)

    def on_llm_end(self, response, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(output=response)

    def on_llm_error(self, error, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(error="".join(traceback.format_exception_only(type(error), error)))

    # ---- Export ----
    def get_trace(self) -> List[Dict]:
        return [s.to_dict() for s in self.steps]

    def reset(self):
        self.steps = []
        self._active = {}
