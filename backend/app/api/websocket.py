"""
WebSocket endpoint for real-time alerts.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.alerts.channels.websocket import ws_manager

router = APIRouter()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time alerts."""
    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive, listen for pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
    except Exception as e:
        ws_manager.disconnect(user_id, websocket)
