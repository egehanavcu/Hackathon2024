from app.main import sio

@sio.event
async def join_room(sid, data):
    room_id = data.get("room_id")
    if room_id:
        await sio.enter_room(sid, room_id)
        await sio.emit("joined_room", {"message": f"Joined room {room_id}"}, room=sid)
    else:
        await sio.emit("error", {"message": "Room ID is missing"}, room=sid)

async def emit_code_update(socket_key, data):
    await sio.emit("code_update", data, room=socket_key)

async def emit_code_analyze(socket_key, data):
    await sio.emit("code_analyze", data, room=socket_key)