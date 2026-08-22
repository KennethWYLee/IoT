# Course Backend Example

This classroom prototype demonstrates the common software path without paid
cloud services:

```text
ESP32 HTTP event -> FastAPI -> SQLite -> WebSocket -> phone browser
phone command -> FastAPI/WebSocket -> ESP32 result -> SQLite/WebSocket
```

It has no production authentication, authorization, TLS, rate limiting, backup,
or secret management. Use it only on a trusted classroom network with harmless
outputs.

## Run on Windows 11

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

Open `http://127.0.0.1:8000` on the server computer. A phone on the same hotspot
or LAN uses `http://<computer-ip>:8000`. Windows Firewall may ask for permission;
allow only the trusted network profile used for the lab.

Runtime data is stored in `runtime/iot_course.db`, which is ignored by Git.

## API

```text
POST /api/events
GET  /api/events?limit=50
POST /api/commands
POST /api/commands/{command_id}/result
GET  /api/commands?limit=50
WS   /ws
```

Example event:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/events `
  -ContentType application/json `
  -Body '{"device_id":"demo-device","event_type":"button_pressed","value":1,"state":"active"}'
```

## Verification

```powershell
python -m pytest -q
```

The commands above assume the current directory is `examples/course_backend`.
From the repository root, run tests with:

```powershell
python -m pytest examples/course_backend/tests -q
```

Passing host tests verifies API and database behavior only. ESP32 compilation,
target upload, wiring, and physical behavior must be recorded separately.
