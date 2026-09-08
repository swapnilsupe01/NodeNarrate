import { useState } from 'react'

const BOX_WIDTH = 150
const BOX_HEIGHT = 64
const GAP_X = 52
const ROW_Y = 32

const TYPE_CONFIG = {
  node: { color: '#3b82f6', bg: '#1e293b', border: '#3b82f6', label: 'Node' },
  decision: { color: '#f59e0b', bg: '#292524', border: '#f59e0b', label: 'Router' },
  tool: { color: '#10b981', bg: '#143126', border: '#10b981', label: 'Tool' },
  llm: { color: '#a855f7', bg: '#2e1b4d', border: '#a855f7', label: 'LLM' },
  error: { color: '#ef4444', bg: '#3a1a1a', border: '#ef4444', label: 'Error' },
}

export default function FlowDiagram({ trace, activeStepIndex, onSelectStep }) {
  if (!trace || trace.length === 0) {
    return (
      <div className="flow-empty-state">
        <div className="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <p className="empty-primary">No execution flow yet</p>
        <p className="empty-secondary">Run your agent code or import a trace JSON to view the live diagram.</p>
      </div>
    )
  }

  const svgWidth = Math.max(600, trace.length * (BOX_WIDTH + GAP_X) + 40)
  const svgHeight = ROW_Y * 2 + BOX_HEIGHT + 20

  return (
    <div className="flow-diagram-container">
      <div className="flow-legend">
        <span className="legend-item"><span className="legend-dot node"></span> Node</span>
        <span className="legend-item"><span className="legend-dot decision"></span> Router</span>
        <span className="legend-item"><span className="legend-dot tool"></span> Tool</span>
        <span className="legend-item"><span className="legend-dot llm"></span> LLM</span>
      </div>

      <div className="flow-scroll-wrapper">
        <svg width={svgWidth} height={svgHeight} className="flow-svg">
          <defs>
            <linearGradient id="activeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#64748b" />
            </marker>
            <marker id="arrowhead-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#818cf8" />
            </marker>
          </defs>

          {trace.map((step, i) => {
            const x = 30 + i * (BOX_WIDTH + GAP_X)
            const y = ROW_Y
            const isError = Boolean(step.error)
            const typeKey = isError ? 'error' : (step.type || 'node')
            const style = TYPE_CONFIG[typeKey] || TYPE_CONFIG.node
            const isSelected = activeStepIndex === i

            return (
              <g 
                key={i} 
                className={`flow-node-group ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectStep(i)}
                style={{ cursor: 'pointer' }}
              >
                {/* Connecting arrow */}
                {i < trace.length - 1 && (
                  <path
                    d={`M ${x + BOX_WIDTH} ${y + BOX_HEIGHT / 2} L ${x + BOX_WIDTH + GAP_X - 2} ${y + BOX_HEIGHT / 2}`}
                    stroke={isSelected ? '#818cf8' : '#475569'}
                    strokeWidth={isSelected ? 2.5 : 2}
                    markerEnd={isSelected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    className="flow-connector"
                  />
                )}

                {/* Node Box */}
                <rect
                  x={x}
                  y={y}
                  width={BOX_WIDTH}
                  height={BOX_HEIGHT}
                  rx={10}
                  fill={isSelected ? '#1e1b4b' : style.bg}
                  stroke={isSelected ? '#818cf8' : style.border}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="flow-rect"
                />

                {/* Step number badge */}
                <rect
                  x={x + 10}
                  y={y + 10}
                  width={22}
                  height={18}
                  rx={4}
                  fill="rgba(255,255,255,0.08)"
                />
                <text
                  x={x + 21}
                  y={y + 23}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="700"
                >
                  #{i + 1}
                </text>

                {/* Step type tag */}
                <text
                  x={x + BOX_WIDTH - 10}
                  y={y + 23}
                  textAnchor="end"
                  fill={style.color}
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="0.5"
                >
                  {style.label.toUpperCase()}
                </text>

                {/* Node Name */}
                <text
                  x={x + BOX_WIDTH / 2}
                  y={y + 45}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="13"
                  fontWeight="600"
                  className="node-label"
                >
                  {step.name.length > 15 ? step.name.slice(0, 13) + '…' : step.name}
                </text>

                {/* Duration indicator */}
                {step.duration_sec !== null && step.duration_sec !== undefined && (
                  <text
                    x={x + BOX_WIDTH / 2}
                    y={y + 57}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9.5"
                  >
                    {step.duration_sec}s
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
