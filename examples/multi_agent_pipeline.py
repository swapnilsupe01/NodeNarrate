"""
multi_agent_pipeline.py
A comprehensive multi-node LangGraph agent demonstrating:
- Query Classification & Dynamic Routing
- Automated Research & Tool Simulation
- Self-Correcting Quality Check Loop
- Final Report Synthesis
- NodeNarrateTracer execution with export to trace.html & trace.json
"""

from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from nodenarrate import NodeNarrateTracer


# 1. Define Agent State Schema
class MultiAgentState(TypedDict):
    query: str
    category: str
    research_notes: List[str]
    iteration: int
    quality_score: float
    final_report: Optional[str]


# 2. Define Node Functions
def classifier_node(state: MultiAgentState) -> MultiAgentState:
    """Classifies user intent and sets initial state."""
    query = state.get("query", "").lower()
    if "agent" in query or "langgraph" in query or "ai" in query:
        category = "ai_architecture"
    elif "cloud" in query or "docker" in query:
        category = "infrastructure"
    else:
        category = "general_knowledge"

    return {
        "category": category,
        "iteration": state.get("iteration", 0),
        "research_notes": ["Query classified as: " + category],
    }


def research_node(state: MultiAgentState) -> MultiAgentState:
    """Simulates research and knowledge gathering."""
    current_iter = state.get("iteration", 0) + 1
    notes = list(state.get("research_notes", []))
    
    if current_iter == 1:
        notes.append(f"Iteration {current_iter}: Initial data points gathered on {state['query']}.")
        score = 0.65  # Needs refinement
    else:
        notes.append(f"Iteration {current_iter}: Deep factual verification & benchmark analysis completed.")
        score = 0.95  # High quality pass

    return {
        "iteration": current_iter,
        "research_notes": notes,
        "quality_score": score,
    }


def validator_router(state: MultiAgentState) -> str:
    """
    Self-healing loop:
    If quality score is below 0.85 and under 2 attempts, re-run research.
    Otherwise, proceed to final report synthesis.
    """
    if state.get("quality_score", 0.0) < 0.85 and state.get("iteration", 0) < 2:
        return "research"
    return "synthesizer"


def synthesizer_node(state: MultiAgentState) -> MultiAgentState:
    """Generates the executive summary report."""
    notes_summary = "\n- ".join(state.get("research_notes", []))
    report = (
        f"=== EXECUTIVE SUMMARY: {state['query']} ===\n"
        f"Category: {state['category']}\n"
        f"Validation Score: {state['quality_score'] * 100}%\n"
        f"Iterations Required: {state['iteration']}\n\n"
        f"Key Findings:\n- {notes_summary}\n\n"
        f"Conclusion: Autonomous agent workflow successfully verified with LangGraph."
    )
    return {"final_report": report}


# 3. Assemble the StateGraph
builder = StateGraph(MultiAgentState)

builder.add_node("classifier", classifier_node)
builder.add_node("research", research_node)
builder.add_node("synthesizer", synthesizer_node)

builder.set_entry_point("classifier")
builder.add_edge("classifier", "research")
builder.add_conditional_edges("research", validator_router)
builder.add_edge("synthesizer", END)

# 4. Compile Graph
graph = builder.compile()

# Initial Input State
input_data = {
    "query": "LangGraph stateful agent architecture with NodeNarrate tracing",
    "iteration": 0,
    "research_notes": [],
    "quality_score": 0.0,
}

# 5. Run with NodeNarrate Tracer (when executed directly as a script)
if __name__ == "__main__":
    print("🚀 Starting LangGraph Agent Execution with NodeNarrate...")
    
    tracer = NodeNarrateTracer(verbose=True)
    final_state = graph.invoke(input_data, config={"callbacks": [tracer]})

    print("\n✅ Run Completed! Final Report:\n")
    print(final_state.get("final_report"))

    # Export trace reports
    html_path = tracer.export_html("trace.html")
    json_path = tracer.export_json("trace.json")
    
    print(f"\n📊 Interactive HTML Report generated: {html_path}")
    print(f"📄 Trace JSON exported: {json_path}")
    print("💡 You can also drag and drop trace.json directly into your Hugging Face Space!")
