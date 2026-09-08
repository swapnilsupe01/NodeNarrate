import { useState } from 'react'

export default function Header({ onExportTrace, onImportTrace, hasTrace }) {
  const [copied, setCopied] = useState(false)

  const copyPip = () => {
    navigator.clipboard.writeText('pip install nodenarrate')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        onImportTrace(json)
      } catch (err) {
        alert('Invalid trace JSON file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3"></circle>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="18" r="3"></circle>
            <line x1="9" y1="6" x2="15" y2="6"></line>
            <line x1="6" y1="9" x2="6" y2="15"></line>
            <path d="M18 9v6"></path>
            <path d="M9 18h6"></path>
          </svg>
        </div>
        <div className="brand-text">
          <div className="title-row">
            <h1>NodeNarrate</h1>
            <span className="version-pill">v0.1.0</span>
            <span className="space-pill">Hugging Face Space</span>
          </div>
          <p className="subtitle">Visual Step-by-Step Debugger & Execution Studio for LangGraph Agents</p>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="pip-button" 
          onClick={copyPip} 
          title="Click to copy pip command"
        >
          <span className="pip-prompt">$</span>
          <code>pip install nodenarrate</code>
          <span className="copy-tag">{copied ? '✓ Copied!' : 'Copy'}</span>
        </button>

        <label className="secondary-btn import-btn" title="Import trace JSON">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Import
          <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        {hasTrace && (
          <button className="secondary-btn" onClick={onExportTrace} title="Export current trace as JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export JSON
          </button>
        )}

        <a 
          href="https://github.com/swapnilsupe01/NodeNarrate" 
          target="_blank" 
          rel="noreferrer" 
          className="icon-link-btn"
          title="GitHub Repository"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
          </svg>
        </a>
      </div>
    </header>
  )
}
