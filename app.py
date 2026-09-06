"""
app.py
Hugging Face Space entry point. Paste LangGraph code, run it in a sandbox,
and see a step-by-step execution trace.
"""

import gradio as gr
from core.sandbox_runner import run_user_code

EXAMPLE_CODE = '''\
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    count: int

def add_one(state: State) -> State:
    return {"count": state["count"] + 1}

def should_continue(state: State) -> str:
    return "add_one" if state["count"] < 3 else END

builder = StateGraph(State)
builder.add_node("add_one", add_one)
builder.set_entry_point("add_one")
builder.add_conditional_edges("add_one", should_continue)

graph = builder.compile()
input_data = {"count": 0}
'''


def debug_trace(code: str):
    if not code or not code.strip():
        return "Paste some LangGraph code first.", []

    result = run_user_code(code)

    if not result["ok"]:
        summary = f"❌ Run failed:\n\n{result['error']}"
    else:
        summary = f"✅ Run completed — {len(result['trace'])} steps captured."

    return summary, result["trace"]


with gr.Blocks(title="LangGraph Debugger") as demo:
    gr.Markdown(
        "# 🔍 LangGraph Debugger\n"
        "Paste LangGraph code that defines a compiled graph as `graph` "
        "(and optionally `input_data`), then run it to see a step-by-step "
        "execution trace — no local setup needed."
    )

    with gr.Row():
        code_input = gr.Code(
            label="Your LangGraph code",
            language="python",
            value=EXAMPLE_CODE,
            lines=20,
        )

    run_btn = gr.Button("▶ Run & Debug", variant="primary")
    status_output = gr.Textbox(label="Status", interactive=False)
    trace_output = gr.JSON(label="Execution Trace")

    run_btn.click(fn=debug_trace, inputs=code_input, outputs=[status_output, trace_output])

if __name__ == "__main__":
    demo.launch()
