from fastapi import APIRouter, Depends, HTTPException
from app.models import User
from app.schemas import ChatBot
from app.gemini.chatbot import send_message
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/chat-bot")
async def post_message(request: ChatBot, current_user: User = Depends(get_current_user)):
    if not current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Bu işlemi yalnızca öğretmenler gerçekleştirebilir")
    
    message = request.message
    conversation = request.conversation

    new_history = []
    response = await send_message(message, conversation)
    for content in response["conversation"]:
        text = content._pb.parts[0].text if content._pb.parts else None
        role = content.role

        new_history.append({"role": role, "parts": [text]})
    response["conversation"] = new_history

    return response