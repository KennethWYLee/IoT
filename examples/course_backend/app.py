from __future__ import annotations

import json
import os
import sqlite3
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("IOT_DB_PATH", BASE_DIR / "runtime" / "iot_course.db"))
INDEX_PATH = BASE_DIR / "static" / "index.html"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with connect_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                value_json TEXT,
                state TEXT,
                recorded_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS commands (
                command_id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                command TEXT NOT NULL,
                parameters_json TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT,
                requested_at TEXT NOT NULL,
                completed_at TEXT
            );
            """
        )


class EventInput(BaseModel):
    device_id: str = Field(min_length=1, max_length=80)
    event_type: str = Field(min_length=1, max_length=80)
    value: Any | None = None
    state: str | None = Field(default=None, max_length=80)
    timestamp: str | None = None


class CommandInput(BaseModel):
    device_id: str = Field(min_length=1, max_length=80)
    command: str = Field(min_length=1, max_length=80)
    parameters: dict[str, Any] = Field(default_factory=dict)


class CommandResultInput(BaseModel):
    result: str = Field(pattern="^(done|error|timeout|rejected)$")
    message: str | None = Field(default=None, max_length=500)


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        for connection in self.connections:
            try:
                await connection.send_json(message)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="IoT Course Backend", lifespan=lifespan)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(INDEX_PATH)


@app.post("/api/events", status_code=201)
async def create_event(event: EventInput) -> dict[str, Any]:
    recorded_at = event.timestamp or utc_now()
    with connect_db() as db:
        cursor = db.execute(
            """
            INSERT INTO events(device_id, event_type, value_json, state, recorded_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (event.device_id, event.event_type, json.dumps(event.value), event.state, recorded_at),
        )
        event_id = cursor.lastrowid

    result = {
        "id": event_id,
        "device_id": event.device_id,
        "event_type": event.event_type,
        "value": event.value,
        "state": event.state,
        "recorded_at": recorded_at,
    }
    await manager.broadcast({"type": "event", "data": result})
    return result


@app.get("/api/events")
def list_events(limit: int = Query(default=50, ge=1, le=200)) -> list[dict[str, Any]]:
    with connect_db() as db:
        rows = db.execute(
            "SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    return [
        {
            "id": row["id"],
            "device_id": row["device_id"],
            "event_type": row["event_type"],
            "value": json.loads(row["value_json"]),
            "state": row["state"],
            "recorded_at": row["recorded_at"],
        }
        for row in rows
    ]


@app.post("/api/commands", status_code=201)
async def create_command(command: CommandInput) -> dict[str, Any]:
    command_id = str(uuid.uuid4())
    requested_at = utc_now()
    with connect_db() as db:
        db.execute(
            """
            INSERT INTO commands(
                command_id, device_id, command, parameters_json, status, requested_at
            ) VALUES (?, ?, ?, ?, 'requested', ?)
            """,
            (
                command_id,
                command.device_id,
                command.command,
                json.dumps(command.parameters),
                requested_at,
            ),
        )

    result = {
        "command_id": command_id,
        "device_id": command.device_id,
        "command": command.command,
        "parameters": command.parameters,
        "status": "requested",
        "requested_at": requested_at,
    }
    await manager.broadcast({"type": "command", "data": result})
    return result


@app.post("/api/commands/{command_id}/result")
async def complete_command(command_id: str, body: CommandResultInput) -> dict[str, Any]:
    completed_at = utc_now()
    with connect_db() as db:
        cursor = db.execute(
            """
            UPDATE commands
            SET status = ?, message = ?, completed_at = ?
            WHERE command_id = ?
            """,
            (body.result, body.message, completed_at, command_id),
        )
        if cursor.rowcount == 0:
            return {"updated": False, "command_id": command_id}

    result = {
        "updated": True,
        "command_id": command_id,
        "result": body.result,
        "message": body.message,
        "completed_at": completed_at,
    }
    await manager.broadcast({"type": "command_result", "data": result})
    return result


@app.get("/api/commands")
def list_commands(limit: int = Query(default=50, ge=1, le=200)) -> list[dict[str, Any]]:
    with connect_db() as db:
        rows = db.execute(
            "SELECT * FROM commands ORDER BY requested_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [
        {
            "command_id": row["command_id"],
            "device_id": row["device_id"],
            "command": row["command"],
            "parameters": json.loads(row["parameters_json"]),
            "status": row["status"],
            "message": row["message"],
            "requested_at": row["requested_at"],
            "completed_at": row["completed_at"],
        }
        for row in rows
    ]


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    await websocket.send_json({"type": "connection", "data": {"status": "connected"}})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
