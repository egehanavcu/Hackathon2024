import os
import uvicorn
from app.main import asgi_app, fastapi_app
from app.routers import users
from dotenv import load_dotenv

load_dotenv()

routers = [users.router]

for router in routers:
    fastapi_app.include_router(router)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(asgi_app, host=host, port=port)