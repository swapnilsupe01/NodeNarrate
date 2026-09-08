"""
NodeNarrate Tracer
Hooks into LangGraph / LangChain callback architecture to record step-by-step
execution traces, state transitions, tool calls, and LLM queries.
"""

import json
import os
import time
import traceback
from typing import Any, Dict, List, Optional
from langchain_core.callbacks.base import BaseCallbackHandler
from nodenarrate.html_template import generate_trace_html


class TraceStep:
    """A single captured execution step."""

    def __init__(self, name: str, step_type: str):
        self.name = name
        self.step_type = step_type  # "node", "tool", "llm", "decision", "error"
        self.input = None
        self.output = None
        self.start_time = time.time()
        self.end_time = None
        self.error = None

    def finish(self, output: Any = None, error: Optional[str] = None):
        self.output = output
        self.error = error
        self.end_time = time.time()

    def to_dict(self) -> Dict[str, Any]:
        duration = None
        if self.end_time:
            duration = round(self.end_time - self.start_time, 4)
        return {
            "name": self.name,
            "type": self.step_type,
            "input": _safe_serialize(self.input),
            "output": _safe_serialize(self.output),
            "duration_sec": duration,
            "error": self.error,
        }


def _safe_serialize(value: Any, limit: int = 1500) -> Any:
    """Safely format values for JSON and frontend display."""
    if value is None:
        return None
    try:
        # Check if it's already dict/list/primitive
        if isinstance(value, (int, float, bool)):
            return value
        if isinstance(value, str):
            return value if len(value) <= limit else value[:limit] + " ...(truncated)"
        if isinstance(value, (dict, list)):
            # Test JSON serializability
            text = json.dumps(value, default=str)
            if len(text) <= limit:
                return json.loads(text)
            return json.loads(text[:limit] + '..."') if text.startswith('"') else str(value)[:limit] + "..."
        return str(value)[:limit]
    except Exception:
        return str(value)[:limit]


class NodeNarrateTracer(BaseCallbackHandler):
    """
    LangGraph / LangChain callback handler.
    
    Usage:
        from nodenarrate import NodeNarrateTracer
        
        tracer = NodeNarrateTracer()
        graph.invoke({"count": 0}, config={"callbacks": [tracer]})
        
        # Export as interactive HTML report
        tracer.export_html("trace.html")
        
        # Export as JSON
        tracer.export_json("trace.json")
    """

    def __init__(self, verbose: bool = False):
        super().__init__()
        self.steps: List[TraceStep] = []
        self._active: Dict[str, TraceStep] = {}
        self.verbose = verbose

    # ---- Node / Chain Events ----
    def on_chain_start(self, serialized, inputs, *, run_id, **kwargs):
        name = kwargs.get("name") or (serialized or {}).get("name", "node")
        # Identify conditional edge or router if specified in tags/metadata
        tags = kwargs.get("tags", [])
        step_type = "decision" if "conditional" in tags else "node"
        
        step = TraceStep(name=name, step_type=step_type)
        step.input = inputs
        self._active[str(run_id)] = step
        self.steps.append(step)
        if self.verbose:
            print(f"[NodeNarrate] ▶ Step Start: {name} ({step_type})")

    def on_chain_end(self, outputs, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(output=outputs)
            if self.verbose:
                print(f"[NodeNarrate] ✔ Step End: {step.name}")

    def on_chain_error(self, error, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            err_msg = "".join(traceback.format_exception_only(type(error), error)).strip()
            step.finish(error=err_msg)
            if self.verbose:
                print(f"[NodeNarrate] ✖ Step Error: {step.name} -> {err_msg}")

    # ---- Tool Call Events ----
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
            step.finish(error=str(error))

    # ---- LLM Call Events ----
    def on_llm_start(self, serialized, prompts, *, run_id, **kwargs):
        name = (serialized or {}).get("name") or "LLM"
        step = TraceStep(name=name, step_type="llm")
        step.input = prompts
        self._active[str(run_id)] = step
        self.steps.append(step)

    def on_llm_end(self, response, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            # Extract generation text if available
            gen_text = None
            if hasattr(response, "generations") and response.generations:
                try:
                    gen_text = [g.text for gen_list in response.generations for g in gen_list]
                except Exception:
                    gen_text = str(response)
            step.finish(output=gen_text or str(response))

    def on_llm_error(self, error, *, run_id, **kwargs):
        step = self._active.pop(str(run_id), None)
        if step:
            step.finish(error=str(error))

    # ---- Trace Data & Exports ----
    def get_trace(self) -> List[Dict[str, Any]]:
        """Returns the execution trace as a list of dictionaries."""
        return [s.to_dict() for s in self.steps]

    def export_json(self, file_path: str = "trace.json") -> str:
        """Saves trace as a formatted JSON file."""
        data = self.get_trace()
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return os.path.abspath(file_path)

    def export_html(self, file_path: str = "trace.html") -> str:
        """Saves trace as an interactive standalone HTML report file."""
        html = generate_trace_html(self.get_trace())
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html)
        return os.path.abspath(file_path)

    def reset(self):
        """Clears all recorded steps."""
        self.steps = []
        self._active = {}


# Backward compatibility alias
GraphTracer = NodeNarrateTracer
