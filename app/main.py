from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import User, StudentTask, Class
import socketio

origins = [
    "http://localhost",
    "http://localhost:3000",
]

Base.metadata.create_all(bind=engine)

sio = socketio.AsyncServer(async_mode="asgi")
fastapi_app = FastAPI()
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


asgi_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)