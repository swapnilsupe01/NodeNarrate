const TYPE_LABELS = {
  node: 'Node',
  decision: 'Decision',
  tool: 'Tool Call',
  llm: 'LLM Call',
}

function StepCard({ step, index }) {
  const isError = Boolean(step.error)
  return (
    <div className={`step-card ${isError ? 'step-card-error' : ''}`}>
      <div className="step-card-header">
        <span className="step-index">#{index + 1}</span>
        <span className="step-type-badge">{TYPE_LABELS[step.type] || step.type}</span>
        <span className="step-name">{step.name}</span>
        {step.duration_sec !== null && (
          <span className="step-duration">{step.duration_sec}s</span>
        )}
      </div>
      <div className="step-card-body">
        <div>
          <strong>Input:</strong> <code>{step.input}</code>
        </div>
        <div>
          <strong>Output:</strong> <code>{step.output}</code>
        </div>
        {isError && (
          <div className="step-error">
            <strong>Error:</strong> <pre>{step.error}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TraceViewer({ trace }) {
  if (!trace || trace.length === 0) {
    return <div className="trace-empty">No trace yet — run your code to see the steps.</div>
  }

  return (
    <div className="trace-viewer">
      {trace.map((step, i) => (
        <StepCard key={i} step={step} index={i} />
      ))}
    </div>
  )
}
