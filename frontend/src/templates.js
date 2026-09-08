export const TEMPLATES = {
  counter: {
    name: 'Loop State (Counter)',
    description: 'Iterative state graph with conditional loop exit condition',
    code: `from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    count: int
    history: list[str]

def add_one(state: State) -> State:
    current = state.get("count", 0) + 1
    hist = list(state.get("history", []))
    hist.append(f"Step {current}")
    return {"count": current, "history": hist}

def should_continue(state: State) -> str:
    # Exit loop when count reaches 3
    return "add_one" if state["count"] < 3 else END

builder = StateGraph(State)
builder.add_node("add_one", add_one)
builder.set_entry_point("add_one")
builder.add_conditional_edges("add_one", should_continue)

graph = builder.compile()
input_data = {"count": 0, "history": []}
`,
  },
  router: {
    name: 'Conditional Router',
    description: 'Routes queries dynamically to specialized worker nodes',
    code: `from langgraph.graph import StateGraph, END
from typing import TypedDict

class RouterState(TypedDict):
    query: str
    category: str
    response: str

def classify_query(state: RouterState) -> RouterState:
    query = state.get("query", "").lower()
    if "code" in query or "bug" in query:
        cat = "technical"
    elif "price" in query or "refund" in query:
        cat = "billing"
    else:
        cat = "general"
    return {"category": cat}

def route_category(state: RouterState) -> str:
    cat = state.get("category", "general")
    if cat == "technical":
        return "tech_support"
    elif cat == "billing":
        return "billing_support"
    return "general_faq"

def tech_support(state: RouterState) -> RouterState:
    return {"response": "Routing to DevOps & Engineering team."}

def billing_support(state: RouterState) -> RouterState:
    return {"response": "Opening Stripe subscription & invoice lookup."}

def general_faq(state: RouterState) -> RouterState:
    return {"response": "Providing knowledge base documentation."}

builder = StateGraph(RouterState)
builder.add_node("classify", classify_query)
builder.add_node("tech_support", tech_support)
builder.add_node("billing_support", billing_support)
builder.add_node("general_faq", general_faq)

builder.set_entry_point("classify")
builder.add_conditional_edges("classify", route_category)
builder.add_edge("tech_support", END)
builder.add_edge("billing_support", END)
builder.add_edge("general_faq", END)

graph = builder.compile()
input_data = {"query": "I found a bug in the production database!"}
`,
  },
  researcher: {
    name: 'Multi-Step Pipeline',
    description: 'Sequential processing: Plan -> Research -> Synthesize',
    code: `from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    topic: str
    plan: list[str]
    findings: list[str]
    summary: str

def planner_node(state: AgentState) -> AgentState:
    topic = state.get("topic", "AI")
    return {
        "plan": [f"Investigate {topic} trends", "Synthesize key breakthroughs"]
    }

def research_node(state: AgentState) -> AgentState:
    return {
        "findings": [
            "1. Multi-agent graphs enable self-correcting loops.",
            "2. State checkpoints allow instant human-in-the-loop rollback."
        ]
    }

def synthesis_node(state: AgentState) -> AgentState:
    return {
        "summary": "LangGraph provides robust stateful orchestration for modern LLMs."
    }

builder = StateGraph(AgentState)
builder.add_node("planner", planner_node)
builder.add_node("researcher", research_node)
builder.add_node("synthesizer", synthesis_node)

builder.set_entry_point("planner")
builder.add_edge("planner", "researcher")
builder.add_edge("researcher", "synthesizer")
builder.add_edge("synthesizer", END)

graph = builder.compile()
input_data = {"topic": "Autonomous Agents in 2026"}
`,
  },
  multiAgent: {
    name: 'Self-Correcting Quality Loop',
    description: 'Multi-node agent with quality score evaluation & retry loop',
    code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class MultiAgentState(TypedDict):
    query: str
    category: str
    research_notes: List[str]
    iteration: int
    quality_score: float
    final_report: str

def classifier_node(state: MultiAgentState) -> MultiAgentState:
    query = state.get("query", "").lower()
    cat = "ai_architecture" if "langgraph" in query or "agent" in query else "general"
    return {
        "category": cat,
        "iteration": state.get("iteration", 0),
        "research_notes": [f"Query categorized under: {cat}"],
    }

def research_node(state: MultiAgentState) -> MultiAgentState:
    curr_iter = state.get("iteration", 0) + 1
    notes = list(state.get("research_notes", []))
    if curr_iter == 1:
        notes.append(f"Pass {curr_iter}: Drafted initial findings.")
        score = 0.70
    else:
        notes.append(f"Pass {curr_iter}: Completed deep factual verification.")
        score = 0.96
    return {"iteration": curr_iter, "research_notes": notes, "quality_score": score}

def quality_router(state: MultiAgentState) -> str:
    # Retry if quality score < 0.85 on pass 1
    return "research" if state.get("quality_score", 0.0) < 0.85 and state.get("iteration", 0) < 2 else "synthesizer"

def synthesizer_node(state: MultiAgentState) -> MultiAgentState:
    report = f"✅ SUCCESS: Verified '{state.get('query')}' across {state.get('iteration')} iterations with quality {state.get('quality_score')*100}%."
    return {"final_report": report}

builder = StateGraph(MultiAgentState)
builder.add_node("classifier", classifier_node)
builder.add_node("research", research_node)
builder.add_node("synthesizer", synthesizer_node)

builder.set_entry_point("classifier")
builder.add_edge("classifier", "research")
builder.add_conditional_edges("research", quality_router)
builder.add_edge("synthesizer", END)

graph = builder.compile()
input_data = {"query": "LangGraph Debugger in NodeNarrate", "iteration": 0, "research_notes": [], "quality_score": 0.0}
`,
  },
}
