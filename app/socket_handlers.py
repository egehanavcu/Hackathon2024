from app.main import sio

@sio.event
async def connect(sid, environ):
    print(f"Yeni bir bağlantı: {sid}")
    await sio.emit("message", {"data": "Hello, SocketIO!"}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"Bağlantı sonlandırıldı: {sid}")