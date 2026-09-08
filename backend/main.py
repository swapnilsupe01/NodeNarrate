"""
main.py
FastAPI entry point for NodeNarrate's backend.
Serves /api endpoints and mounts the React frontend build for Hugging Face Spaces Docker deployment.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.routes import router as api_router

app = FastAPI(
    title="NodeNarrate API",
    description="Visual LangGraph agent debugger and execution tracer backend.",
    version="0.1.0"
)

# CORS middleware for local Vite dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix="/api")

# Serve React static assets if built (for Hugging Face Docker Space or production)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": "NodeNarrate API",
            "status": "online",
            "docs": "/docs",
            "message": "Frontend not mounted in dev mode. Run Vite dev server on port 5173."
        }
