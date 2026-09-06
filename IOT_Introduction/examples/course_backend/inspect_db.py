"""Read-only SQLite inspection commands used by the Week 11 laboratory."""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("IOT_DB_PATH", BASE_DIR / "runtime" / "iot_course.db"))


def connect_read_only() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"database does not exist: {DB_PATH}")
    connection = sqlite3.connect(f"file:{DB_PATH.as_posix()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    return connection


def print_json(value: Any) -> None:
    print(json.dumps(value, ensure_ascii=False, indent=2))


def show_schema(connection: sqlite3.Connection) -> None:
    result: dict[str, list[dict[str, Any]]] = {}
    for table in ("events", "commands"):
        rows = connection.execute(f"PRAGMA table_info({table})").fetchall()
        result[table] = [dict(row) for row in rows]
    print_json(result)


def show_events(
    connection: sqlite3.Connection,
    device_id: str | None,
    event_type: str | None,
    limit: int,
) -> None:
    clauses: list[str] = []
    parameters: list[Any] = []
    if device_id:
        clauses.append("device_id = ?")
        parameters.append(device_id)
    if event_type:
        clauses.append("event_type = ?")
        parameters.append(event_type)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    parameters.append(limit)
    rows = connection.execute(
        f"SELECT * FROM events {where} ORDER BY id DESC LIMIT ?", parameters
    ).fetchall()
    print_json([dict(row) for row in rows])


def show_commands(
    connection: sqlite3.Connection,
    device_id: str | None,
    status: str | None,
    limit: int,
) -> None:
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
    rows = connection.execute(
        f"SELECT * FROM commands {where} ORDER BY requested_at DESC LIMIT ?", parameters
    ).fetchall()
    print_json([dict(row) for row in rows])


def show_summary(connection: sqlite3.Connection) -> None:
    event_count = connection.execute("SELECT COUNT(*) FROM events").fetchone()[0]
    invalid_count = connection.execute(
        "SELECT COUNT(*) FROM events WHERE valid = 0"
    ).fetchone()[0]
    devices = connection.execute(
        "SELECT device_id, COUNT(*) AS count FROM events GROUP BY device_id ORDER BY count DESC"
    ).fetchall()
    statuses = connection.execute(
        "SELECT status, COUNT(*) AS count FROM commands GROUP BY status ORDER BY status"
    ).fetchall()
    print_json(
        {
            "event_count": event_count,
            "invalid_event_count": invalid_count,
            "events_by_device": {row["device_id"]: row["count"] for row in devices},
            "commands_by_status": {row["status"]: row["count"] for row in statuses},
        }
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Read the course SQLite database safely")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("schema")
    subparsers.add_parser("summary")

    events = subparsers.add_parser("events")
    events.add_argument("--device")
    events.add_argument("--type")
    events.add_argument("--limit", type=int, default=10, choices=range(1, 201), metavar="1..200")

    commands = subparsers.add_parser("commands")
    commands.add_argument("--device")
    commands.add_argument("--status")
    commands.add_argument("--limit", type=int, default=10, choices=range(1, 201), metavar="1..200")
    return parser


def main() -> int:
    arguments = build_parser().parse_args()
    try:
        with connect_read_only() as connection:
            if arguments.command == "schema":
                show_schema(connection)
            elif arguments.command == "events":
                show_events(connection, arguments.device, arguments.type, arguments.limit)
            elif arguments.command == "commands":
                show_commands(connection, arguments.device, arguments.status, arguments.limit)
            else:
                show_summary(connection)
    except (FileNotFoundError, sqlite3.Error) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
