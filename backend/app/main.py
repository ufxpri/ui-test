"""
FastAPI main application for CCTV Monitoring System

This is the entry point for the backend API server.
API specification is defined in api-schema/openapi.yaml
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.api import cameras, alerts, process_monitor, search, settings
from app.websockets import events

# Create FastAPI app
app = FastAPI(
    title="CCTV Monitoring System API",
    description="Backend API for CCTV monitoring with real-time alerts and video processing",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:*"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(cameras.router, prefix="/api/v1/cameras", tags=["cameras"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(process_monitor.router, prefix="/api/v1/process", tags=["process"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["settings"])

# WebSocket endpoint
app.include_router(events.router, prefix="/ws")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CCTV Monitoring System API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "cctv-backend"
    }


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting CCTV Monitoring System Backend")
    # TODO: Initialize database connection
    # TODO: Start video processing workers
    # TODO: Initialize WebSocket manager


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down CCTV Monitoring System Backend")
    # TODO: Close database connections
    # TODO: Stop video processing workers
    # TODO: Close WebSocket connections


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload in development
        log_level="info"
    )
