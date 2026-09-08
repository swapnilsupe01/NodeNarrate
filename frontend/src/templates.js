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
}
