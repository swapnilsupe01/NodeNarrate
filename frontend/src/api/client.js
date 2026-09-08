// In production (bundled with FastAPI), API is served from the same origin.
// In local dev, defaults to http://127.0.0.1:8000 or custom VITE_API_BASE.
const API_BASE = import.meta.env.VITE_API_BASE || (window.location.port === '5173' ? 'http://127.0.0.1:8000' : '')

/**
 * Sends LangGraph code to the backend for sandboxed execution & tracing.
 */
export async function runCode(code) {
  const url = `${API_BASE}/api/run`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`)
  }

  return response.json() // { ok, error, trace }
}
