# Course Backend Example

This is the shared executable example for Weeks 11, 12, 14, and 15:

```text
ESP32 HTTP event -> FastAPI -> SQLite -> WebSocket -> phone browser
phone HTTP command -> FastAPI -> ESP32 HTTP poll -> result -> WebSocket -> phone
MQTT device message -> MQTT bridge -> FastAPI -> SQLite -> WebSocket -> phone
```

The example is for a trusted classroom LAN and harmless low-power outputs. It
does not provide production-grade identity management, TLS termination, rate
limiting, backup, or internet exposure. Do not configure router port forwarding.

## 1. Create the Python environment on Windows 11

Open PowerShell in `IOT_Introduction/examples/course_backend`, then run each command separately:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation, the environment can still be used without
changing the execution policy:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 2. Start the backend

Set a temporary classroom operator key. Replace the example value:

```powershell
$env:IOT_OPERATOR_KEY="replace-with-a-classroom-key"
$env:IOT_COMMAND_TIMEOUT_SECONDS="20"
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

The key exists only in the current PowerShell process. Do not commit a real key.
Open `http://127.0.0.1:8000` on the computer. A phone on the same trusted LAN uses
`http://<computer-ip>:8000`. If Windows Firewall asks, allow only the trusted
private network used for the laboratory.

The LAN URL uses plain HTTP, so the operator key is not protected by transport
encryption. Use a temporary key, share it only for the supervised exercise, and
discard it when the backend stops. HTTPS plus real device and user authentication
are required before any deployment beyond this isolated classroom prototype.

## 3. Verify the host path before connecting a device

Use a second PowerShell window:

```powershell
$eventBody = @{
  device_id = "host-test"
  event_type = "button_pressed"
  value = 1
  unit = "pressed"
  state = "active"
  valid = $true
  reason = "host_test"
  uptime_ms = 1234
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/events `
  -ContentType application/json -Body $eventBody
```

Refresh the browser and confirm that the event appears. This proves the computer
backend and database path; it does not prove ESP32 wiring or Wi-Fi communication.

## API

```text
POST /api/events
GET  /api/events?limit=50&device_id=<id>&event_type=<type>&since=<ISO>&until=<ISO>
POST /api/commands                 header: X-IoT-Key
GET  /api/devices/{device_id}/commands/next
POST /api/commands/{command_id}/result
GET  /api/commands?limit=50&device_id=<id>&status=<status>
GET  /api/stats?device_id=<id>
WS   /ws
```

Command states are `requested`, `accepted`, `done`, `error`, `timeout`, and
`rejected`. `accepted` means the device received the command; it does not mean
the physical action completed. Requested or accepted commands that do not reach
a terminal result before the configured deadline become `timeout`; a late result
does not overwrite that terminal state and receives HTTP `409 Conflict`. Event time
filters and any device-provided event `timestamp` must use timezone-aware ISO 8601
values, and `since` cannot be later than `until`. Leave the device timestamp null
until the device has a trustworthy clock.

## Week 12 MQTT bridge

Install and start a classroom MQTT broker first. Then set the broker connection
for this PowerShell process and run the bridge:

```powershell
$env:MQTT_HOST="127.0.0.1"
$env:MQTT_PORT="1883"
$env:IOT_API_BASE_URL="http://127.0.0.1:8000"
python mqtt_bridge.py
```

If the broker requires a username and password, also set `MQTT_USERNAME` and
`MQTT_PASSWORD`. The bridge accepts only these topic shapes:

```text
course/<device_id>/events
course/<device_id>/telemetry
course/<device_id>/presence
course/<device_id>/acks
```

It validates the JSON payload and checks that its `device_id` matches the topic
before forwarding data to the backend.

## PWA scope

The page is responsive on a phone over a classroom LAN. Service workers and PWA
installation normally require a secure context (HTTPS) or `localhost`. Therefore
the ordinary `http://<computer-ip>:8000` classroom path demonstrates responsive
mobile control, but must not be reported as a verified installable PWA unless an
HTTPS deployment was separately configured and tested.

## Verification

The local `pytest.ini` supplies the relocated course package path for both commands.

From `IOT_Introduction/examples/course_backend`:

```powershell
python -m pytest -q
```

From the repository root:

```powershell
python -m pytest IOT_Introduction/examples/course_backend/tests -q
```

Runtime data is stored in `runtime/iot_course.db`, which is ignored by Git.
Passing host tests verifies API, MQTT message routing, and database behavior only.
ESP32 compilation, upload, wiring, Wi-Fi, and physical behavior require separate
evidence from the target board.
