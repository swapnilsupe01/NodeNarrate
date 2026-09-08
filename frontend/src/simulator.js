/**
 * Client-side execution simulator for Hugging Face Static Spaces.
 * Parses Python LangGraph templates and produces realistic visual trace steps
 * directly in the browser with zero backend dependency!
 */

export function simulateClientTrace(code) {
  const codeText = String(code || '')

  // 1. Loop Counter Simulation
  if (codeText.includes('add_one') || codeText.includes('Loop State') || codeText.includes('count')) {
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

  // 2. Conditional Router Simulation
  if (codeText.includes('classify_query') || codeText.includes('route_category') || codeText.includes('tech_support')) {
    return [
      {
        name: 'classify',
        type: 'node',
        input: { query: 'I found a bug in the production database!' },
        output: { category: 'technical' },
        duration_sec: 0.056,
        error: null,
      },
      {
        name: 'route_category',
        type: 'decision',
        input: { category: 'technical' },
        output: 'Routing to tech_support',
        duration_sec: 0.012,
        error: null,
      },
      {
        name: 'tech_support',
        type: 'node',
        input: { category: 'technical' },
        output: { response: 'Routing to DevOps & Engineering team.' },
        duration_sec: 0.082,
        error: null,
      },
    ]
  }

  // 3. Multi-Agent Self-Correcting Loop
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

  // 4. Multi-Step Pipeline Simulation (Default)
  return [
    {
      name: 'planner',
      type: 'node',
      input: { topic: 'Autonomous Agents in 2026' },
      output: { plan: ['Investigate multi-agent trends', 'Synthesize key breakthroughs'] },
      duration_sec: 0.051,
      error: null,
    },
    {
      name: 'researcher',
      type: 'tool',
      input: { plan: ['Investigate multi-agent trends', 'Synthesize key breakthroughs'] },
      output: { findings: ['1. Multi-agent graphs enable self-correcting loops.', '2. State checkpoints allow instant rollback.'] },
      duration_sec: 0.098,
      error: null,
    },
    {
      name: 'synthesizer',
      type: 'node',
      input: { findings: ['1. Multi-agent graphs enable self-correcting loops.', '2. State checkpoints allow instant rollback.'] },
      output: { summary: 'LangGraph provides robust stateful orchestration for modern LLMs.' },
      duration_sec: 0.074,
      error: null,
    },
  ]
}
