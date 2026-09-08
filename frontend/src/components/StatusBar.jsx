export default function StatusBar({ status, message, stepCount, totalDuration }) {
  if (!message) return null

  const isSuccess = status === 'success'

  return (
    <div className={`status-banner ${isSuccess ? 'status-success' : 'status-error'}`}>
      <div className="status-message-content">
        <span className="status-indicator-dot"></span>
        <span className="status-text">{message}</span>
      </div>

      {isSuccess && stepCount > 0 && (
        <div className="status-metrics">
          <span className="metric-badge">📊 {stepCount} Step{stepCount !== 1 ? 's' : ''}</span>
          {totalDuration !== null && totalDuration !== undefined && (
            <span className="metric-badge">⏱️ {totalDuration}s total</span>
          )}
        </div>
      )}
    </div>
  )
}
