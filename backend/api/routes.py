"""
routes.py
API endpoints that let the React frontend run pasted LangGraph code
and get back a structured execution trace — same core logic the
Gradio Space uses, just exposed over HTTP instead.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from core.sandbox_runner import run_user_code

router = APIRouter()


class RunRequest(BaseModel):
    code: str
    timeout_sec: Optional[int] = 20


class RunResponse(BaseModel):
    ok: bool
    error: Optional[str] = None
    trace: List[Dict[str, Any]] = []


@router.post("/run", response_model=RunResponse)
def run_code(request: RunRequest):
    """
    Executes the submitted LangGraph code in a sandbox and returns
    the full step-by-step execution trace.
    """
    result = run_user_code(request.code, timeout_sec=request.timeout_sec)
    return RunResponse(ok=result["ok"], error=result["error"], trace=result["trace"])


@router.get("/health")
def health_check():
    return {"status": "ok"}
