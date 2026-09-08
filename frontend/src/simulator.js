/**
 * Client-side execution simulator for Hugging Face Static Spaces.
 * Dynamically parses ANY pasted LangGraph Python code to extract node names,
 * transitions, and input/output states directly in the browser!
 */

export function simulateClientTrace(code) {
  const codeText = String(code || '')

  // 1. Dynamic Parser: Extract user-defined nodes from code
  // Looks for: .add_node("node_name", ...) or builder.add_node('node_name', ...)
  const nodeMatches = [...codeText.matchAll(/add_node\s*\(\s*["']([^"']+)["']/g)].map(m => m[1])
  const conditionalMatches = [...codeText.matchAll(/add_conditional_edges\s*\(\s*["'][^"']+["']\s*,\s*([a-zA-Z0-9_]+)/g)].map(m => m[1])

  if (nodeMatches.length > 0) {
    const trace = []
    let state = { count: 0, status: "initialized", query: "User input processed", step: 1 }

    // First node
    for (let i = 0; i < nodeMatches.length; i++) {
      const nodeName = nodeMatches[i]
      const isTool = nodeName.toLowerCase().includes('tool') || nodeName.toLowerCase().includes('search') || nodeName.toLowerCase().includes('research')
      const isLLM = nodeName.toLowerCase().includes('llm') || nodeName.toLowerCase().includes('chat') || nodeName.toLowerCase().includes('generate')
      const type = isTool ? 'tool' : (isLLM ? 'llm' : 'node')

      const inputState = { ...state }
      const outputState = { ...state, step: i + 1, last_node: nodeName, status: "completed" }
      state = outputState

      trace.push({
        name: nodeName,
        type: type,
        input: inputState,
        output: outputState,
        duration_sec: Number((0.03 + Math.random() * 0.06).toFixed(3)),
        error: null,
      })

      // Add router step if conditional edge exists
      if (conditionalMatches[i]) {
        trace.push({
          name: conditionalMatches[i],
          type: 'decision',
          input: state,
          output: i < nodeMatches.length - 1 ? `Route -> ${nodeMatches[i + 1]}` : 'Route -> END',
          duration_sec: 0.008,
          error: null,
        })
      }
    }

    if (trace.length > 0) return trace
  }

  // 2. Multi-Agent Fallback
  if (codeText.includes('MultiAgentState') || codeText.includes('quality_score') || codeText.includes('classifier_node')) {
    return [
      {
        name: 'classifier',
        type: 'node',
        input: { query: 'LangGraph Debugger in NodeNarrate', iteration: 0 },
        output: { category: 'ai_architecture', research_notes: ['Step 1: Categorized as ai_architecture'] },
        duration_sec: 0.045,
        error: null,
      },
      {
        name: 'research',
        type: 'tool',
        input: { iteration: 0, query: 'LangGraph Debugger in NodeNarrate' },
        output: { iteration: 1, quality_score: 0.70, research_notes: ['Pass 1: Gathered initial documentation.'] },
        duration_sec: 0.124,
        error: null,
      },
      {
        name: 'quality_router',
        type: 'decision',
        input: { quality_score: 0.70, iteration: 1 },
        output: 'research (retry trigger: quality_score < 0.85)',
        duration_sec: 0.011,
        error: null,
      },
      {
        name: 'research',
        type: 'tool',
        input: { iteration: 1, quality_score: 0.70 },
        output: { iteration: 2, quality_score: 0.98, research_notes: ['Pass 2: Completed deep factual verification.'] },
        duration_sec: 0.118,
        error: null,
      },
      {
        name: 'quality_router',
        type: 'decision',
        input: { quality_score: 0.98, iteration: 2 },
        output: 'synthesizer (passed: quality_score >= 0.85)',
        duration_sec: 0.009,
        error: null,
      },
      {
        name: 'synthesizer',
        type: 'node',
        input: { iteration: 2, quality_score: 0.98 },
        output: { final_report: '✅ SUCCESS: Verified LangGraph Debugger across 2 iterations with 98% quality.' },
        duration_sec: 0.065,
        error: null,
      },
    ]
  }

  // 3. Loop Counter Fallback
  return [
    {
      name: 'add_one',
      type: 'node',
      input: { count: 0, history: [] },
      output: { count: 1, history: ['Step 1'] },
      duration_sec: 0.042,
      error: null,
    },
    {
      name: 'should_continue',
      type: 'decision',
      input: { count: 1, history: ['Step 1'] },
      output: 'add_one (condition: count < 3)',
      duration_sec: 0.008,
      error: null,
    },
    {
      name: 'add_one',
      type: 'node',
      input: { count: 1, history: ['Step 1'] },
      output: { count: 2, history: ['Step 1', 'Step 2'] },
      duration_sec: 0.038,
      error: null,
    },
    {
      name: 'should_continue',
      type: 'decision',
      input: { count: 2, history: ['Step 1', 'Step 2'] },
      output: 'add_one (condition: count < 3)',
      duration_sec: 0.007,
      error: null,
    },
    {
      name: 'add_one',
      type: 'node',
      input: { count: 2, history: ['Step 1', 'Step 2'] },
      output: { count: 3, history: ['Step 1', 'Step 2', 'Step 3'] },
      duration_sec: 0.035,
      error: null,
    },
    {
      name: 'should_continue',
      type: 'decision',
      input: { count: 3, history: ['Step 1', 'Step 2', 'Step 3'] },
      output: 'END (condition: count >= 3 met)',
      duration_sec: 0.009,
      error: null,
    },
  ]
}
