---
title: NodeNarrate 🔍
emoji: ⚡
colorFrom: indigo
colorTo: purple
sdk: static
pinned: true
license: apache-2.0
---

# NodeNarrate 🔍
> **See exactly how your LangGraph agent thinks, step by step — free, open-source, and self-hosted. No LangSmith account required.**

[![Python SDK](https://img.shields.io/badge/pip%20install-nodenarrate-blue.svg)](https://github.com/swapnilsupe01/NodeNarrate)
[![Hugging Face Spaces](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-yellow)](https://huggingface.co/spaces/swapnilsupe01/NodeNarrate)
[![License](https://img.shields.io/badge/License-Apache%202.0-indigo.svg)](LICENSE)

---

## ✨ Features

- 🐍 **`nodenarrate` Python SDK**: 2-line drop-in callback handler for any LangGraph agent in your local environment.
- 🎨 **Visual Execution Studio**: Modern dark-mode web studio with interactive SVG flow diagrams, state diffs, and latency telemetry.
- 📄 **Standalone HTML Reports**: Export self-contained, shareable HTML trace reports with zero external dependencies.
- 🔒 **Safe Sandboxed Execution**: Runs pasted code in isolated subprocesses with import guards and execution timeouts.
- 🐳 **Hugging Face Docker Space Ready**: Deploys the full FastAPI backend + React Vite frontend on Hugging Face's 100% free CPU tier.

---

## 🚀 1. Python SDK Usage (`pip install nodenarrate`)

Install in your local environment:

```bash
pip install nodenarrate
```

Add `NodeNarrateTracer` directly into your LangGraph invocation:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict
from nodenarrate import NodeNarrateTracer

# 1. Initialize Tracer
tracer = NodeNarrateTracer()

# 2. Define your LangGraph agent
class State(TypedDict):
    count: int

def step_node(state: State) -> State:
    return {"count": state["count"] + 1}

builder = StateGraph(State)
builder.add_node("step_node", step_node)
builder.set_entry_point("step_node")
builder.add_edge("step_node", END)
graph = builder.compile()

# 3. Invoke with callback
result = graph.invoke({"count": 0}, config={"callbacks": [tracer]})

# 4. Export trace to JSON or standalone visual HTML
tracer.export_html("trace.html")  # Open in any browser!
tracer.export_json("trace.json")  # Load into NodeNarrate Web Studio
```

---

## 🌐 2. Hosted Web Studio

Try the live visual studio on Hugging Face Spaces:
👉 **[https://huggingface.co/spaces/swapnilsupe01/NodeNarrate](https://huggingface.co/spaces/swapnilsupe01/NodeNarrate)**

---

## 🛠️ 3. Run Locally (Full Studio)

### Backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
pip install -e ..
uvicorn main:app --reload --port 8000
```

### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🚢 4. Deploying to Hugging Face Spaces

1. Create a new Space on **Hugging Face** and choose **Docker** as the SDK.
2. Push this repository to your Hugging Face Space Git remote:
```bash
git remote add space https://huggingface.co/spaces/swapnilsupe01/NodeNarrate
git push space main
```
Hugging Face will automatically build the multi-stage `Dockerfile` and serve both the React frontend and FastAPI backend on port `7860`.

---

## 📂 Project Architecture

```
NodeNarrate/
├── nodenarrate/          # Python SDK package (pip installable)
│   ├── tracer.py         # LangGraph callback handler & trace engine
│   ├── html_template.py  # Standalone HTML report generator
│   └── __init__.py
├── backend/              # FastAPI backend
│   ├── api/routes.py     # Sandbox execution endpoint (/api/run)
│   ├── core/             # Sandbox process runner
│   └── main.py           # API & Static SPA server
├── frontend/             # React + Vite studio interface
│   ├── src/components/   # CodeEditor, FlowDiagram, TraceViewer, Header
│   ├── src/templates.js  # Built-in LangGraph agent examples
│   └── src/index.css     # Dark mode design system
├── Dockerfile            # Hugging Face Spaces multi-stage container
├── pyproject.toml        # Python packaging metadata
└── README.md
```

---

## 📜 License

Apache License 2.0 — see [LICENSE](LICENSE).
