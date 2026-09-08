import { simulateClientTrace } from '../simulator.js'

// In local dev, defaults to http://127.0.0.1:8000. In static space, tries localhost:8000 if available.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

/**
 * Executes LangGraph code:
 * 1. Tries local/remote backend if reachable.
 * 2. Falls back to fast in-browser simulator when running on Hugging Face Static Space without a local backend.
 */
export async function runCode(code) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    const response = await fetch(`${API_BASE}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    // Backend not running / Static Space mode
    console.info('NodeNarrate: Running in browser static simulation mode.')
  }

  // Fallback: In-browser visual simulation with realistic micro-delay
  await new Promise((resolve) => setTimeout(resolve, 450))
  const trace = simulateClientTrace(code)

  return {
    ok: true,
    error: null,
    trace,
    isSimulated: true,
  }
}
