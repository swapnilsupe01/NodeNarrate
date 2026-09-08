# ==========================================
# Multi-stage Dockerfile for Hugging Face Spaces
# 1. Build React / Vite frontend
# 2. Package FastAPI backend + Python SDK
# ==========================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python Backend Runtime ---
FROM python:3.10-slim

# Create standard non-root user (UID 1000) for Hugging Face Spaces security
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR /home/user/app

# Install backend dependencies & SDK
COPY --chown=user backend/requirements.txt ./backend/
COPY --chown=user pyproject.toml ./
COPY --chown=user nodenarrate/ ./nodenarrate/

RUN pip install --no-cache-dir --user -r backend/requirements.txt
RUN pip install --no-cache-dir --user -e .

# Copy backend application
COPY --chown=user backend/ ./backend/

# Copy built frontend assets from Stage 1 into FastAPI's static folder
COPY --from=frontend-builder --chown=user /app/frontend/dist ./backend/static

WORKDIR /home/user/app/backend

# Hugging Face Spaces default port is 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
