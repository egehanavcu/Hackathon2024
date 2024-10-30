import os
import uvicorn
from app.main import asgi_app, fastapi_app
from app.routers import auth, classes, tasks, chat
from dotenv import load_dotenv

load_dotenv()

routers = [auth.router, classes.router, tasks.router, chat.router]

for router in routers:
    fastapi_app.include_router(router)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(asgi_app, host=host, port=port)