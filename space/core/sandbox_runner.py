"""
sandbox_runner.py
Executes user-submitted LangGraph code in a restricted namespace with a
timeout, so the Space can't be crashed or abused by arbitrary code.
"""

import multiprocessing
import traceback
from typing import Dict, Any

from core.tracer import GraphTracer

# Modules the user's pasted code is allowed to import.
ALLOWED_IMPORTS = {
    "langgraph", "langchain", "langchain_core", "langchain_openai",
    "typing", "operator", "json", "math",
}

DEFAULT_TIMEOUT_SEC = 20


def _restricted_import(name, globals=None, locals=None, fromlist=(), level=0):
    root = name.split(".")[0]
    if root not in ALLOWED_IMPORTS:
        raise ImportError(f"Import of '{name}' is not allowed in the sandbox.")
    return __import__(name, globals, locals, fromlist, level)


def _run_in_subprocess(code: str, result_queue: multiprocessing.Queue):
    """Runs inside a separate process so a hang/crash can't take down the app."""
    tracer = GraphTracer()
    safe_builtins = dict(__builtins__) if isinstance(__builtins__, dict) else vars(__builtins__).copy()
    safe_builtins["__import__"] = _restricted_import
    sandbox_globals = {"__builtins__": safe_builtins, "tracer": tracer}

    try:
        exec(code, sandbox_globals)

        graph = sandbox_globals.get("graph")
        if graph is None:
            result_queue.put({
                "ok": False,
                "error": "No variable named `graph` was found. "
                         "Your code must define a compiled LangGraph as `graph`.",
                "trace": [],
            })
            return

        input_data = sandbox_globals.get("input_data", {})
        graph.invoke(input_data, config={"callbacks": [tracer]})

        result_queue.put({"ok": True, "error": None, "trace": tracer.get_trace()})

    except Exception:
        result_queue.put({
            "ok": False,
            "error": traceback.format_exc(),
            "trace": tracer.get_trace(),
        })


def run_user_code(code: str, timeout_sec: int = DEFAULT_TIMEOUT_SEC) -> Dict[str, Any]:
    """
    Runs the user's pasted code (must define `graph` and optionally
    `input_data`) in a sandboxed subprocess and returns the trace.
    """
    result_queue = multiprocessing.Queue()
    process = multiprocessing.Process(target=_run_in_subprocess, args=(code, result_queue))
    process.start()
    process.join(timeout_sec)

    if process.is_alive():
        process.terminate()
        process.join()
        return {"ok": False, "error": f"Execution timed out after {timeout_sec}s.", "trace": []}

    if not result_queue.empty():
        return result_queue.get()

    return {"ok": False, "error": "Execution failed with no output.", "trace": []}
