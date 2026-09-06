export default function CodeEditor({ code, onChange, onRun, isRunning }) {
  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <span>Your LangGraph code</span>
        <button onClick={onRun} disabled={isRunning} className="run-button">
          {isRunning ? 'Running…' : '▶ Run & Debug'}
        </button>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="code-textarea"
        placeholder="Paste code that defines a compiled graph as `graph`..."
      />
    </div>
  )
}
