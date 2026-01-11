"""
WebSocket event handling

Implements real-time event streaming for alerts and process monitoring.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to connection: {e}")


# Global connection manager
manager = ConnectionManager()


@router.websocket("/events")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time events

    Clients connect to this endpoint to receive:
    - alert.new: New alert events
    - process.status_changed: Process status updates
    - camera.status_changed: Camera status changes
    """
    await manager.connect(websocket)

    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to CCTV monitoring events"
        })

        # Keep connection alive and handle incoming messages
        while True:
            # Receive message from client (for ping/pong)
            data = await websocket.receive_text()

            # Echo back (heartbeat)
            if data == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


async def broadcast_alert(alert_data: dict):
    """
    Broadcast new alert to all connected clients

    Example:
        await broadcast_alert({
            "id": "alert_001",
            "cameraId": 1,
            "type": "person_detected",
            "severity": "high",
            "timestamp": "2024-01-12T10:00:00Z"
        })
    """
    await manager.broadcast({
        "type": "alert.new",
        "data": alert_data
    })


async def broadcast_process_status(process_data: dict):
    """
    Broadcast process status change to all connected clients

    Example:
        await broadcast_process_status({
            "name": "video_processor",
            "status": "running",
            "cpuPercent": 45.2
        })
    """
    await manager.broadcast({
        "type": "process.status_changed",
        "data": process_data
    })


async def broadcast_camera_status(camera_id: int, status: str, message: str = None):
    """
    Broadcast camera status change to all connected clients

    Example:
        await broadcast_camera_status(1, "active", "Camera reconnected")
    """
    await manager.broadcast({
        "type": "camera.status_changed",
        "data": {
            "cameraId": camera_id,
            "status": status,
            "message": message
        }
    })
