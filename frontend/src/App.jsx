import { useState } from 'react'
import Header from './components/Header.jsx'
import CodeEditor from './components/CodeEditor.jsx'
import FlowDiagram from './components/FlowDiagram.jsx'
import TraceViewer from './components/TraceViewer.jsx'
import StatusBar from './components/StatusBar.jsx'
import { TEMPLATES } from './templates.js'
import { runCode } from './api/client.js'

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState('counter')
  const [code, setCode] = useState(TEMPLATES.counter.code)
  const [trace, setTrace] = useState([])
  const [activeStepIndex, setActiveStepIndex] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }

  const handleSelectTemplate = (templateKey) => {
    setSelectedTemplate(templateKey)
    if (TEMPLATES[templateKey]) {
      setCode(TEMPLATES[templateKey].code)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setStatus(null)
    setActiveStepIndex(null)
    try {
      const result = await runCode(code)
      const capturedTrace = result.trace || []
      setTrace(capturedTrace)

      if (result.ok) {
        setStatus({
          type: 'success',
          message: `Run completed successfully — captured ${capturedTrace.length} execution step${capturedTrace.length !== 1 ? 's' : ''}.`,
        })
        if (capturedTrace.length > 0) {
          setActiveStepIndex(0)
        }
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Execution failed. Check code syntax or graph definition.',
        })
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: `Could not reach execution backend: ${err.message}`,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleExportTrace = () => {
    if (!trace || trace.length === 0) return
    const blob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nodenarrate-trace-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportTrace = (importedTrace) => {
    if (Array.isArray(importedTrace)) {
      setTrace(importedTrace)
      setActiveStepIndex(0)
      setStatus({
        type: 'success',
        message: `Imported trace with ${importedTrace.length} execution steps.`,
      })
    } else {
      alert('Imported file must contain an array of trace step objects.')
    }
  }

  const totalDuration = trace.reduce((acc, s) => acc + (s.duration_sec || 0), 0)

  return (
    <div className="studio-root">
      <Header
        onExportTrace={handleExportTrace}
        onImportTrace={handleImportTrace}
        hasTrace={trace.length > 0}
      />

      <main className="studio-main">
        {/* Left Column: Code Studio */}
        <section className="studio-pane left-pane">
          <div className="pane-header">
            <h2>Agent Code Studio</h2>
            <span className="pane-tag">Sandbox Environment</span>
          </div>

          <CodeEditor
            code={code}
            onChange={setCode}
            onRun={handleRun}
            isRunning={isRunning}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
          />
        </section>

        {/* Right Column: Visualizer & Step Inspector */}
        <section className="studio-pane right-pane">
          <div className="pane-header">
            <h2>Execution Visualizer</h2>
            <span className="pane-tag">Interactive Graph & State Trace</span>
          </div>

          <StatusBar
            status={status?.type}
            message={status?.message}
            stepCount={trace.length}
            totalDuration={totalDuration > 0 ? roundNumber(totalDuration, 4) : null}
          />

          <div className="flow-card-wrapper">
            <FlowDiagram
              trace={trace}
              activeStepIndex={activeStepIndex}
              onSelectStep={(idx) => setActiveStepIndex(idx)}
            />
          </div>

          <div className="inspector-card-wrapper">
            <div className="inspector-header">
              <h3>Step-by-Step Inspector</h3>
              {trace.length > 0 && (
                <span className="inspector-sub">
                  Click any node in the diagram or card below to inspect inputs and state transitions.
                </span>
              )}
            </div>

            <TraceViewer
              trace={trace}
              activeStepIndex={activeStepIndex}
              onSelectStep={(idx) => setActiveStepIndex(idx)}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function roundNumber(num, decimals) {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals)
}
