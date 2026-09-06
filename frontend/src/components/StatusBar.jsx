export default function StatusBar({ status, message }) {
  if (!message) return null

  const statusClass =
    status === 'success' ? 'status-success' : status === 'error' ? 'status-error' : 'status-info'

  return <div className={`status-bar ${statusClass}`}>{message}</div>
}
