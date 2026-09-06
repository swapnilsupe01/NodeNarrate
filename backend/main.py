"""
main.py
FastAPI entry point for NodeNarrate's backend. Serves the /api routes
that the React frontend calls to run and debug LangGraph code.

Run with:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router

app = FastAPI(title="NodeNarrate API", version="0.1.0")

# Allow the React dev server (and later, your deployed frontend) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "NodeNarrate API is running. See /docs for endpoints."}
