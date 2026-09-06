# Paste this into the Space's code box to see a working example.
# Your code must define a compiled graph as `graph`, and optionally
# `input_data` for the initial state.

from langgraph.graph import StateGraph, END
from typing import TypedDict


class State(TypedDict):
    count: int


def add_one(state: State) -> State:
    return {"count": state["count"] + 1}


def should_continue(state: State) -> str:
    return "add_one" if state["count"] < 3 else END


builder = StateGraph(State)
builder.add_node("add_one", add_one)
builder.set_entry_point("add_one")
builder.add_conditional_edges("add_one", should_continue)

graph = builder.compile()
input_data = {"count": 0}
