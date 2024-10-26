from fastapi import FastAPI
from app.database import engine, Base
from app.models import User, StudentTask, Class
import socketio

Base.metadata.create_all(bind=engine)

sio = socketio.AsyncServer(async_mode="asgi")
fastapi_app = FastAPI()

asgi_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)