"""
NodeNarrate: Visual step-by-step debugger and execution tracer for LangGraph agents.
"""

from nodenarrate.tracer import NodeNarrateTracer, GraphTracer, TraceStep
from nodenarrate.html_template import generate_trace_html

__version__ = "0.1.0"
__all__ = ["NodeNarrateTracer", "GraphTracer", "TraceStep", "generate_trace_html"]
