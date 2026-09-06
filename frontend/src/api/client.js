const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

/**
 * Sends the user's LangGraph code to the backend and returns the
 * execution trace (or an error).
 */
export async function runCode(code) {
  const response = await fetch(`${API_BASE}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`)
  }

  return response.json() // { ok, error, trace }
}
