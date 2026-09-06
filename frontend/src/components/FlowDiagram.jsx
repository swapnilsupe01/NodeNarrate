// Simple SVG-based flow diagram of the execution path, in run order.
// No external graph library needed — keeps the project dependency-light.

const BOX_WIDTH = 140
const BOX_HEIGHT = 56
const GAP_X = 60
const ROW_Y = 40

const TYPE_COLORS = {
  node: '#3b82f6',
  decision: '#f59e0b',
  tool: '#10b981',
  llm: '#8b5cf6',
}

export default function FlowDiagram({ trace }) {
  if (!trace || trace.length === 0) {
    return <div className="flow-empty">Run your code to see the execution flow.</div>
  }

  const width = trace.length * (BOX_WIDTH + GAP_X) + GAP_X
  const height = ROW_Y * 2 + BOX_HEIGHT

  return (
    <div className="flow-diagram-wrapper">
      <svg width={width} height={height} className="flow-diagram-svg">
        {trace.map((step, i) => {
          const x = GAP_X + i * (BOX_WIDTH + GAP_X)
          const y = ROW_Y
          const color = TYPE_COLORS[step.type] || '#6b7280'
          const isError = Boolean(step.error)

          return (
            <g key={i}>
              {i < trace.length - 1 && (
                <line
                  x1={x + BOX_WIDTH}
                  y1={y + BOX_HEIGHT / 2}
                  x2={x + BOX_WIDTH + GAP_X}
                  y2={y + BOX_HEIGHT / 2}
                  stroke="#9ca3af"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
              )}
              <rect
                x={x}
                y={y}
                width={BOX_WIDTH}
                height={BOX_HEIGHT}
                rx={8}
                fill={isError ? '#fee2e2' : '#fff'}
                stroke={isError ? '#ef4444' : color}
                strokeWidth={2}
              />
              <text x={x + BOX_WIDTH / 2} y={y + 22} textAnchor="middle" fontSize="12" fontWeight="600">
                {step.name.length > 16 ? step.name.slice(0, 14) + '…' : step.name}
              </text>
              <text x={x + BOX_WIDTH / 2} y={y + 40} textAnchor="middle" fontSize="10" fill={color}>
                {step.type}
              </text>
            </g>
          )
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}
