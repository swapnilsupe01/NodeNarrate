import { useState } from 'react'
import CodeEditor from './components/CodeEditor.jsx'
import FlowDiagram from './components/FlowDiagram.jsx'
import TraceViewer from './components/TraceViewer.jsx'
import StatusBar from './components/StatusBar.jsx'
import { runCode } from './api/client.js'

const EXAMPLE_CODE = `from langgraph.graph import StateGraph, END
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
`

export default function App() {
  const [code, setCode] = useState(EXAMPLE_CODE)
  const [trace, setTrace] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', message }

  async function handleRun() {
    setIsRunning(true)
    setStatus(null)
    try {
      const result = await runCode(code)
      setTrace(result.trace || [])
      if (result.ok) {
        setStatus({ type: 'success', message: `✅ Run completed — ${result.trace.length} steps captured.` })
      } else {
        setStatus({ type: 'error', message: `❌ Run failed: ${result.error}` })
      }
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Could not reach backend: ${err.message}` })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 NodeNarrate</h1>
        <p>See exactly how your LangGraph agent thinks, step by step.</p>
      </header>

      <CodeEditor code={code} onChange={setCode} onRun={handleRun} isRunning={isRunning} />

      <StatusBar status={status?.type} message={status?.message} />

      <section className="results-section">
        <h2>Execution Flow</h2>
        <FlowDiagram trace={trace} />

        <h2>Step Details</h2>
        <TraceViewer trace={trace} />
      </section>
    </div>
  )
}
