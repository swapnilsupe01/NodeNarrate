# LangGraph Debugger 🔍

Watch your LangGraph AI agent think, step by step — see exactly which node
ran, what input it got, what it returned, and where it failed. No local
setup needed: paste your code and run it right in the browser.

## Why

LangGraph agents are normally a black box — you get the final answer with
no visibility into how the agent got there. This tool captures every step
in between and shows it as a simple, readable trace.

## Try it

Paste code that defines a compiled graph as `graph` (and optionally
`input_data` for the initial state), then click **Run & Debug**.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    count: int

def add_one(state: State) -> State:
    return {"count": state["count"] + 1}

builder = StateGraph(State)
builder.add_node("add_one", add_one)
builder.set_entry_point("add_one")
builder.add_edge("add_one", END)

graph = builder.compile()
input_data = {"count": 0}
```

## Run locally

```bash
pip install -r requirements.txt
python app.py
```

## How it works

- `core/tracer.py` — a LangChain callback handler that records every
  node/tool/LLM call as it happens.
- `core/sandbox_runner.py` — runs pasted code in a separate process with
  a timeout and restricted imports, so it can't hang or harm the host.
- `app.py` — the Gradio UI that ties it together.

## Roadmap

- [ ] Visual flow diagram (not just a step list)
- [ ] `pip install langgraph-debugger` package for use in your own project
- [ ] Webhook mode for tracing a live, remotely running agent
- [ ] Regional-language (Marathi/Hindi) explanations for learners

## License

Apache License 2.0 — see [LICENSE](LICENSE).
