from __future__ import annotations

import asyncio
import json
import os
import secrets
import sqlite3
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import (
    FastAPI,
    Header,
    HTTPException,
    Path as ApiPath,
    Query,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("IOT_DB_PATH", BASE_DIR / "runtime" / "iot_course.db"))
OPERATOR_KEY = os.environ.get("IOT_OPERATOR_KEY", "")
COMMAND_TIMEOUT_SECONDS = max(3, int(os.environ.get("IOT_COMMAND_TIMEOUT_SECONDS", "20")))
STATIC_DIR = BASE_DIR / "static"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def structured_log(action: str, **fields: Any) -> None:
    record = {"timestamp": utc_now(), "action": action, **fields}
    print(json.dumps(record, ensure_ascii=False, separators=(",", ":")), flush=True)


def connect_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def ensure_column(db: sqlite3.Connection, table: str, definition: str) -> None:
    column_name = definition.split()[0]
    existing = {row["name"] for row in db.execute(f"PRAGMA table_info({table})")}
    if column_name not in existing:
        db.execute(f"ALTER TABLE {table} ADD COLUMN {definition}")


def init_db() -> None:
    with connect_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                value_json TEXT,
                unit TEXT,
                state TEXT,
                valid INTEGER,
                reason TEXT,
                uptime_ms INTEGER,
                device_timestamp TEXT,
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

            CREATE INDEX IF NOT EXISTS idx_events_device_time
            ON events(device_id, recorded_at);

            CREATE INDEX IF NOT EXISTS idx_events_type_time
            ON events(event_type, recorded_at);

            CREATE INDEX IF NOT EXISTS idx_commands_device_status
            ON commands(device_id, status, requested_at);
            """
        )

        # Keep old classroom databases readable when this example is updated.
        ensure_column(db, "events", "unit TEXT")
        ensure_column(db, "events", "valid INTEGER")
        ensure_column(db, "events", "reason TEXT")
        ensure_column(db, "events", "uptime_ms INTEGER")
        ensure_column(db, "events", "device_timestamp TEXT")


IDENTIFIER_PATTERN = r"^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$"


class EventInput(BaseModel):
    device_id: str = Field(pattern=IDENTIFIER_PATTERN)
    event_type: str = Field(pattern=IDENTIFIER_PATTERN)
    value: Any | None = None
    unit: str | None = Field(default=None, max_length=40)
    state: str | None = Field(default=None, max_length=80)
    valid: bool | None = None
    reason: str | None = Field(default=None, max_length=160)
    uptime_ms: int | None = Field(default=None, ge=0)
    timestamp: datetime | None = None


class CommandInput(BaseModel):
    device_id: str = Field(pattern=IDENTIFIER_PATTERN)
    command: str = Field(pattern=IDENTIFIER_PATTERN)
    parameters: dict[str, Any] = Field(default_factory=dict)


class CommandResultInput(BaseModel):
    result: str = Field(pattern="^(accepted|done|error|timeout|rejected)$")
    message: str | None = Field(default=None, max_length=500)


def require_operator_key(provided_key: str | None) -> None:
    if not OPERATOR_KEY:
        structured_log("command_denied", reason="operator_key_not_configured")
        raise HTTPException(status_code=503, detail="operator key is not configured")
    if provided_key is None or not secrets.compare_digest(provided_key, OPERATOR_KEY):
        structured_log("command_denied", reason="operator_permission_required")
        raise HTTPException(status_code=403, detail="operator permission required")


def event_row(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "device_id": row["device_id"],
        "event_type": row["event_type"],
        "value": json.loads(row["value_json"]),
        "unit": row["unit"],
        "state": row["state"],
        "valid": None if row["valid"] is None else bool(row["valid"]),
        "reason": row["reason"],
        "uptime_ms": row["uptime_ms"],
        "device_timestamp": row["device_timestamp"],
        "recorded_at": row["recorded_at"],
    }


def command_row(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "command_id": row["command_id"],
        "device_id": row["device_id"],
        "command": row["command"],
        "parameters": json.loads(row["parameters_json"]),
        "status": row["status"],
        "message": row["message"],
        "requested_at": row["requested_at"],
        "completed_at": row["completed_at"],
    }


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


async def expire_timed_out_commands() -> None:
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=COMMAND_TIMEOUT_SECONDS)).isoformat()
    completed_at = utc_now()
    with connect_db() as db:
        rows = db.execute(
            """
            SELECT command_id, device_id FROM commands
            WHERE status IN ('requested', 'accepted') AND requested_at < ?
            """,
            (cutoff,),
        ).fetchall()
        db.execute(
            """
            UPDATE commands
            SET status = 'timeout', message = 'device did not complete before deadline',
                completed_at = ?
            WHERE status IN ('requested', 'accepted') AND requested_at < ?
            """,
            (completed_at, cutoff),
        )
    for row in rows:
        result = {
            "updated": True,
            "command_id": row["command_id"],
            "device_id": row["device_id"],
            "result": "timeout",
            "message": "device did not complete before deadline",
            "completed_at": completed_at,
        }
        structured_log("command_result", **result)
        await manager.broadcast({"type": "command_result", "data": result})


async def command_timeout_worker() -> None:
    while True:
        await asyncio.sleep(1)
        await expire_timed_out_commands()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    structured_log("backend_started", database=str(DB_PATH))
    timeout_task = asyncio.create_task(command_timeout_worker())
    try:
        yield
    finally:
        timeout_task.cancel()
        try:
            await timeout_task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="IoT Course Backend", lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request, exception: RequestValidationError
) -> JSONResponse:
    errors = jsonable_encoder(exception.errors())
    structured_log("request_validation_failed", path=request.url.path, errors=errors)
    return JSONResponse(status_code=422, content={"detail": errors})


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/manifest.json")
def manifest() -> FileResponse:
    return FileResponse(STATIC_DIR / "manifest.json", media_type="application/manifest+json")


@app.get("/sw.js")
def service_worker() -> FileResponse:
    return FileResponse(STATIC_DIR / "sw.js", media_type="application/javascript")


@app.get("/icon.svg")
def icon() -> FileResponse:
    return FileResponse(STATIC_DIR / "icon.svg", media_type="image/svg+xml")


@app.post("/api/events", status_code=201)
async def create_event(event: EventInput) -> dict[str, Any]:
    recorded_at = utc_now()
    if event.timestamp is not None and event.timestamp.tzinfo is None:
        raise HTTPException(
            status_code=422, detail="event timestamp must include a timezone"
        )
    device_timestamp = event.timestamp.isoformat() if event.timestamp else None
    try:
        value_json = json.dumps(event.value, allow_nan=False, separators=(",", ":"))
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="event value must be finite JSON") from exc
    if len(value_json.encode("utf-8")) > 2048:
        raise HTTPException(status_code=413, detail="event value exceeds 2048 bytes")
    with connect_db() as db:
        cursor = db.execute(
            """
            INSERT INTO events(
                device_id, event_type, value_json, unit, state, valid, reason,
                uptime_ms, device_timestamp, recorded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.device_id,
                event.event_type,
                value_json,
                event.unit,
                event.state,
                None if event.valid is None else int(event.valid),
                event.reason,
                event.uptime_ms,
                device_timestamp,
                recorded_at,
            ),
        )
        event_id = cursor.lastrowid

    result = {
        "id": event_id,
        **event.model_dump(exclude={"timestamp"}),
        "device_timestamp": device_timestamp,
        "recorded_at": recorded_at,
    }
    structured_log(
        "event_created",
        event_id=event_id,
        device_id=event.device_id,
        event_type=event.event_type,
        valid=event.valid,
        reason=event.reason,
    )
    await manager.broadcast({"type": "event", "data": result})
    return result


@app.get("/api/events")
def list_events(
    limit: int = Query(default=50, ge=1, le=200),
    device_id: str | None = Query(default=None, pattern=IDENTIFIER_PATTERN),
    event_type: str | None = Query(default=None, pattern=IDENTIFIER_PATTERN),
    since: datetime | None = Query(default=None),
    until: datetime | None = Query(default=None),
) -> list[dict[str, Any]]:
    clauses: list[str] = []
    parameters: list[Any] = []
    if device_id:
        clauses.append("device_id = ?")
        parameters.append(device_id)
    if event_type:
        clauses.append("event_type = ?")
        parameters.append(event_type)
    if since and since.tzinfo is None:
        raise HTTPException(status_code=422, detail="since must include a timezone")
    if until and until.tzinfo is None:
        raise HTTPException(status_code=422, detail="until must include a timezone")
    if since and until and since > until:
        raise HTTPException(status_code=422, detail="since must not be later than until")
    if since:
        clauses.append("recorded_at >= ?")
        parameters.append(since.astimezone(timezone.utc).isoformat())
    if until:
        clauses.append("recorded_at <= ?")
        parameters.append(until.astimezone(timezone.utc).isoformat())

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    parameters.append(limit)
    with connect_db() as db:
        rows = db.execute(
            f"SELECT * FROM events {where} ORDER BY id DESC LIMIT ?", parameters
        ).fetchall()
    return [event_row(row) for row in rows]


@app.post("/api/commands", status_code=201)
async def create_command(
    command: CommandInput,
    x_iot_key: str | None = Header(default=None),
) -> dict[str, Any]:
    require_operator_key(x_iot_key)
    command_id = str(uuid.uuid4())
    requested_at = utc_now()
    try:
        parameters_json = json.dumps(
            command.parameters, allow_nan=False, separators=(",", ":")
        )
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=422, detail="command parameters must be finite JSON"
        ) from exc
    if len(parameters_json.encode("utf-8")) > 2048:
        raise HTTPException(status_code=413, detail="command parameters exceed 2048 bytes")
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
                parameters_json,
                requested_at,
            ),
        )

    result = {
        "command_id": command_id,
        **command.model_dump(),
        "status": "requested",
        "requested_at": requested_at,
    }
    structured_log(
        "command_created",
        command_id=command_id,
        device_id=command.device_id,
        command=command.command,
    )
    await manager.broadcast({"type": "command", "data": result})
    return result


@app.get("/api/devices/{device_id}/commands/next", response_model=None)
def next_command(
    device_id: str = ApiPath(pattern=IDENTIFIER_PATTERN),
) -> dict[str, Any] | Response:
    with connect_db() as db:
        row = db.execute(
            """
            SELECT * FROM commands
            WHERE device_id = ? AND status = 'requested'
            ORDER BY requested_at ASC
            LIMIT 1
            """,
            (device_id,),
        ).fetchone()
    if row is None:
        return Response(status_code=204)
    return command_row(row)


@app.post("/api/commands/{command_id}/result")
async def complete_command(command_id: str, body: CommandResultInput) -> dict[str, Any]:
    completed_at = None if body.result == "accepted" else utc_now()
    allowed_statuses = ("requested",) if body.result == "accepted" else ("requested", "accepted")
    placeholders = ",".join("?" for _ in allowed_statuses)
    with connect_db() as db:
        cursor = db.execute(
            f"""
            UPDATE commands
            SET status = ?, message = ?, completed_at = ?
            WHERE command_id = ? AND status IN ({placeholders})
            """,
            (body.result, body.message, completed_at, command_id, *allowed_statuses),
        )
        if cursor.rowcount == 0:
            existing = db.execute(
                "SELECT status FROM commands WHERE command_id = ?", (command_id,)
            ).fetchone()
            structured_log(
                "command_result_not_updated",
                command_id=command_id,
                result=body.result,
                current_status=None if existing is None else existing["status"],
            )
            if existing is None:
                raise HTTPException(status_code=404, detail="command not found")
            raise HTTPException(
                status_code=409,
                detail=f"command is already terminal or cannot transition from {existing['status']}",
            )
        command_row_result = db.execute(
            "SELECT device_id FROM commands WHERE command_id = ?", (command_id,)
        ).fetchone()

    result = {
        "updated": True,
        "command_id": command_id,
        "device_id": command_row_result["device_id"],
        "result": body.result,
        "message": body.message,
        "completed_at": completed_at,
    }
    structured_log("command_result", **result)
    await manager.broadcast({"type": "command_result", "data": result})
    return result


@app.get("/api/commands")
def list_commands(
    limit: int = Query(default=50, ge=1, le=200),
    device_id: str | None = Query(default=None, pattern=IDENTIFIER_PATTERN),
    status: str | None = Query(
        default=None, pattern="^(requested|accepted|done|error|timeout|rejected)$"
    ),
) -> list[dict[str, Any]]:
    clauses: list[str] = []
    parameters: list[Any] = []
    if device_id:
        clauses.append("device_id = ?")
        parameters.append(device_id)
    if status:
        clauses.append("status = ?")
        parameters.append(status)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    parameters.append(limit)
    with connect_db() as db:
        rows = db.execute(
            f"SELECT * FROM commands {where} ORDER BY requested_at DESC LIMIT ?",
            parameters,
        ).fetchall()
    return [command_row(row) for row in rows]


@app.get("/api/stats")
def statistics(
    device_id: str | None = Query(default=None, pattern=IDENTIFIER_PATTERN),
) -> dict[str, Any]:
    event_where = "WHERE device_id = ?" if device_id else ""
    command_where = "WHERE device_id = ?" if device_id else ""
    event_params: tuple[Any, ...] = (device_id,) if device_id else ()
    command_params: tuple[Any, ...] = (device_id,) if device_id else ()

    with connect_db() as db:
        event_count = db.execute(
            f"SELECT COUNT(*) AS count FROM events {event_where}", event_params
        ).fetchone()["count"]
        invalid_count = db.execute(
            f"SELECT COUNT(*) AS count FROM events {event_where} "
            + ("AND" if event_where else "WHERE")
            + " valid = 0",
            event_params,
        ).fetchone()["count"]
        device_count = db.execute(
            f"SELECT COUNT(DISTINCT device_id) AS count FROM events {event_where}",
            event_params,
        ).fetchone()["count"]
        event_types = db.execute(
            f"SELECT event_type, COUNT(*) AS count FROM events {event_where} "
            "GROUP BY event_type ORDER BY count DESC",
            event_params,
        ).fetchall()
        command_count = db.execute(
            f"SELECT COUNT(*) AS count FROM commands {command_where}", command_params
        ).fetchone()["count"]
        command_statuses = db.execute(
            f"SELECT status, COUNT(*) AS count FROM commands {command_where} "
            "GROUP BY status ORDER BY status",
            command_params,
        ).fetchall()

    return {
        "device_id": device_id,
        "event_count": event_count,
        "invalid_event_count": invalid_count,
        "device_count": device_count,
        "event_types": {row["event_type"]: row["count"] for row in event_types},
        "command_count": command_count,
        "command_statuses": {row["status"]: row["count"] for row in command_statuses},
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    await websocket.send_json({"type": "connection", "data": {"status": "connected"}})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
