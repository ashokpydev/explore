from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.ai import ai_service

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/assistant")
async def assistant_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            response = await ai_service.answer(message)
            await websocket.send_json(response)
    except WebSocketDisconnect:
        return

