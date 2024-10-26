from fastapi import APIRouter

router = APIRouter()

@router.get("/users")
async def hello_world():
    return {"message": "Hello World"}