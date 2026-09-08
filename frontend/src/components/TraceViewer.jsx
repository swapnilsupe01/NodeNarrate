import { useState } from 'react'

const TYPE_CONFIG = {
  node: { label: 'Node', badgeClass: 'badge-node' },
  decision: { label: 'Router', badgeClass: 'badge-decision' },
  tool: { label: 'Tool Call', badgeClass: 'badge-tool' },
  llm: { label: 'LLM Call', badgeClass: 'badge-llm' },
  error: { label: 'Error', badgeClass: 'badge-error' },
}

function StepCard({ step, index, isSelected, onSelect }) {
  const [copiedField, setCopiedField] = useState(null)
  const isError = Boolean(step.error)
  const typeKey = isError ? 'error' : (step.type || 'node')
  const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.node

  const copyToClipboard = (text, field) => {
    const content = typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text)
    navigator.clipboard.writeText(content)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1800)
  }

  const renderDataBlock = (data) => {
    if (data === null || data === undefined) {
      return <span className="null-val">null</span>
    }
    if (typeof data === 'object') {
      return <pre className="json-block">{JSON.stringify(data, null, 2)}</pre>
    }
    return <pre className="json-block">{String(data)}</pre>
  }

  return (
    <div
      className={`step-card ${isError ? 'step-error' : ''} ${isSelected ? 'step-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="step-card-header">
        <span className="step-index">#{index + 1}</span>
        <span className={`type-badge ${config.badgeClass}`}>{config.label}</span>
        <span className="step-title">{step.name}</span>

        {step.duration_sec !== null && step.duration_sec !== undefined && (
          <span className="step-duration" title="Execution duration">
            ⚡ {step.duration_sec}s
          </span>
        )}
      </div>

      <div className="step-card-body">
        {/* Input Section */}
        <div className="data-section">
          <div className="section-label-row">
            <span className="section-label">INPUT STATE / PAYLOAD</span>
            <button
              className="copy-mini-btn"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(step.input, 'input')
              }}
            >
              {copiedField === 'input' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {renderDataBlock(step.input)}
        </div>

        {/* Output Section */}
        <div className="data-section">
          <div className="section-label-row">
            <span className="section-label">OUTPUT STATE / UPDATE</span>
            <button
              className="copy-mini-btn"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(step.output, 'output')
              }}
            >
              {copiedField === 'output' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {renderDataBlock(step.output)}
        </div>

        {/* Error Section */}
        {isError && (
          <div className="data-section error-section">
            <div className="section-label-row">
              <span className="section-label error-label">EXCEPTION DETAILS</span>
            </div>
            <pre className="error-trace">{step.error}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TraceViewer({ trace, activeStepIndex, onSelectStep }) {
  const [filterType, setFilterType] = useState('all')

  if (!trace || trace.length === 0) {
    return null
  }

  const filteredTrace = trace
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => {
      if (filterType === 'all') return true
      if (filterType === 'errors') return Boolean(step.error)
      return step.type === filterType
    })

  return (
    <div className="trace-viewer-section">
      <div className="trace-controls-bar">
        <div className="filter-chips">
          <button
            className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Steps ({trace.length})
          </button>
          <button
            className={`filter-chip ${filterType === 'node' ? 'active' : ''}`}
            onClick={() => setFilterType('node')}
          >
            Nodes
          </button>
          <button
            className={`filter-chip ${filterType === 'decision' ? 'active' : ''}`}
            onClick={() => setFilterType('decision')}
          >
            Routers
          </button>
          <button
            className={`filter-chip ${filterType === 'tool' ? 'active' : ''}`}
            onClick={() => setFilterType('tool')}
          >
            Tools
          </button>
          <button
            className={`filter-chip ${filterType === 'llm' ? 'active' : ''}`}
            onClick={() => setFilterType('llm')}
          >
            LLMs
          </button>
        </div>
      </div>

      <div className="trace-list">
        {filteredTrace.map(({ step, index }) => (
          <StepCard
            key={index}
            step={step}
            index={index}
            isSelected={activeStepIndex === index}
            onSelect={() => onSelectStep(index)}
          />
        ))}
      </div>
    </div>
  )
}
