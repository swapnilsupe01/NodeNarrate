import { TEMPLATES } from '../templates.js'

export default function CodeEditor({
  code,
  onChange,
  onRun,
  isRunning,
  selectedTemplate,
  onSelectTemplate,
}) {
  const lineCount = (code.match(/\n/g) || []).length + 1

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter to run
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!isRunning) onRun()
    }
  }

  return (
    <div className="code-editor-card">
      <div className="card-top-bar">
        <div className="editor-left-controls">
          <div className="pill-tag">
            <span className="dot green"></span> Python 3.10
          </div>
          <select
            className="template-select"
            value={selectedTemplate}
            onChange={(e) => onSelectTemplate(e.target.value)}
            disabled={isRunning}
            title="Choose a LangGraph template"
          >
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>
                📁 {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="editor-right-controls">
          <span className="hotkey-hint">
            <kbd>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</kbd> + <kbd>Enter</kbd>
          </span>
          <button
            className="run-btn"
            onClick={onRun}
            disabled={isRunning}
            title="Execute graph and capture trace"
          >
            {isRunning ? (
              <>
                <span className="spinner"></span>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Run Agent</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="line-numbers" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
        <textarea
          className="code-area"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          placeholder="# Define your LangGraph graph and input_data here..."
        />
      </div>

      <div className="card-footer-info">
        <span>💡 Defines <code>graph</code> (compiled StateGraph) and <code>input_data</code> (dict)</span>
        <span>{lineCount} lines</span>
      </div>
    </div>
  )
}
