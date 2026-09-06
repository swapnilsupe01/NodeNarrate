# NodeNarrate 🔍

See exactly how your LangGraph agent thinks, step by step — free,
open-source, and self-hosted. No LangSmith account needed.

## Why

LangGraph agents are normally a black box — you get the final answer
with no visibility into how the agent got there. NodeNarrate captures
every step (nodes, decisions, tool calls, LLM calls) and shows it in
plain, readable form — built especially for people newer to LangGraph
who need to *understand* what happened, not just see raw logs.

## Project layout

```
NodeNarrate/
├── space/          # Hugging Face Space — Gradio demo, self-contained, zero install
├── backend/        # FastAPI backend used by the React frontend
├── frontend/       # React app — visual flow diagram + step viewer
└── examples/       # Sample LangGraph agents to try
```

## Try the hosted demo

👉 https://huggingface.co/spaces/swapnilsupe01/NodeNarrate

## Run locally — Gradio Space version (fastest)

```bash
cd space
pip install -r requirements.txt
python app.py
```

## Run locally — full React + FastAPI version

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend (separate terminal):**
```bash
cd frontend
npm install
npm run dev
```
Then open http://localhost:5173

## How it works

- `core/tracer.py` — a LangChain callback handler that records every
  node, decision, tool call, and LLM call as it happens.
- `core/sandbox_runner.py` — runs pasted code in a separate process
  with a timeout and restricted imports, so it can't hang or harm the host.
- `backend/api/routes.py` — exposes the tracer/sandbox as a `POST /api/run` endpoint.
- `frontend/src/components/FlowDiagram.jsx` — renders the execution path visually.

## Roadmap

- [ ] Distinguish conditional-edge decision points from regular nodes
- [ ] Capture and display LangGraph checkpoints (save points)
- [ ] `pip install nodenarrate` package for use in your own project
- [ ] Webhook mode for tracing a live, remotely running agent
- [ ] Regional-language (Marathi/Hindi) plain-English explanations

## License

Apache License 2.0 — see [LICENSE](LICENSE).
