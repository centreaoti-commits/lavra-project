"""
WebSocket Manager — Real-time push notifications to connected clients.
"""

from fastapi import WebSocket
from typing import Dict, Set
import json


class WebSocketManager:
    """Manages WebSocket connections for real-time alerts."""

    def __init__(self):
        # user_id -> set of WebSocket connections
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        """Accept a WebSocket connection for a user."""
        await websocket.accept()
        if user_id not in self.connections:
            self.connections[user_id] = set()
        self.connections[user_id].add(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if user_id in self.connections:
            self.connections[user_id].discard(websocket)
            if not self.connections[user_id]:
                del self.connections[user_id]

    async def send(self, user_id: str, data: dict):
        """Send data to all WebSocket connections for a user."""
        if user_id not in self.connections:
            return

        message = json.dumps(data)
        disconnected = set()

        for websocket in self.connections[user_id]:
            try:
                await websocket.send_text(message)
            except Exception as e:  # noqa: F841
                disconnected.add(websocket)

        # Clean up disconnected clients
        for ws in disconnected:
            self.disconnect(user_id, ws)

    async def send_alert(self, user_id: str, alert_type: str, title: str, message: str, severity: str = "info"):
        """Send an alert via WebSocket."""
        await self.send(user_id, {
            "type": "alert",
            "data": {
                "alert_type": alert_type,
                "title": title,
                "message": message,
                "severity": severity,
            },
        })

    async def broadcast(self, data: dict):
        """Send data to all connected users."""
        for user_id in list(self.connections.keys()):
            await self.send(user_id, data)

    @property
    def active_connections(self) -> int:
        return sum(len(conns) for conns in self.connections.values())


# Global WebSocket manager
ws_manager = WebSocketManager()
