import asyncio
import importlib

from fastapi.testclient import TestClient


def load_app(tmp_path, monkeypatch):
    monkeypatch.setenv("IOT_DB_PATH", str(tmp_path / "test.db"))
    monkeypatch.setenv("IOT_OPERATOR_KEY", "classroom-test-key")
    from examples.course_backend import app

    importlib.reload(app)
    return app.app


def test_event_is_stored_and_listed(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        response = client.post(
            "/api/events",
            json={
                "device_id": "demo-device",
                "event_type": "button_pressed",
                "value": 1,
                "unit": "pressed",
                "state": "active",
                "valid": True,
                "reason": "physical_input",
                "uptime_ms": 1234,
            },
        )
        assert response.status_code == 201

        events = client.get("/api/events").json()
        assert len(events) == 1
        assert events[0]["device_id"] == "demo-device"
        assert events[0]["value"] == 1
        assert events[0]["unit"] == "pressed"
        assert events[0]["valid"] is True


def test_command_result_is_tracked(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        created = client.post(
            "/api/commands",
            json={"device_id": "demo-device", "command": "start"},
            headers={"X-IoT-Key": "classroom-test-key"},
        )
        assert created.status_code == 201
        command_id = created.json()["command_id"]

        completed = client.post(
            f"/api/commands/{command_id}/result",
            json={"result": "done", "message": "action completed"},
        )
        assert completed.json()["updated"] is True

        commands = client.get("/api/commands").json()
        assert commands[0]["status"] == "done"
        assert commands[0]["message"] == "action completed"


def test_operator_key_is_required(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        missing = client.post(
            "/api/commands",
            json={"device_id": "demo-device", "command": "start"},
        )
        assert missing.status_code == 403

        wrong = client.post(
            "/api/commands",
            json={"device_id": "demo-device", "command": "start"},
            headers={"X-IoT-Key": "wrong-key"},
        )
        assert wrong.status_code == 403


def test_device_polls_and_acknowledges_one_command(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        created = client.post(
            "/api/commands",
            json={"device_id": "unit-07", "command": "stop"},
            headers={"X-IoT-Key": "classroom-test-key"},
        ).json()

        polled = client.get("/api/devices/unit-07/commands/next")
        assert polled.status_code == 200
        assert polled.json()["command_id"] == created["command_id"]

        accepted = client.post(
            f"/api/commands/{created['command_id']}/result",
            json={"result": "accepted", "message": "received by unit-07"},
        )
        assert accepted.status_code == 200

        empty = client.get("/api/devices/unit-07/commands/next")
        assert empty.status_code == 204

        done = client.post(
            f"/api/commands/{created['command_id']}/result",
            json={"result": "done", "message": "output is safe"},
        )
        assert done.json()["updated"] is True


def test_event_filters_and_stats(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        for device_id, valid in (("unit-a", True), ("unit-a", False), ("unit-b", True)):
            response = client.post(
                "/api/events",
                json={
                    "device_id": device_id,
                    "event_type": "light_sample",
                    "value": 321,
                    "unit": "adc_raw",
                    "state": "idle",
                    "valid": valid,
                    "reason": "ok" if valid else "out_of_range",
                },
            )
            assert response.status_code == 201

        events = client.get("/api/events", params={"device_id": "unit-a"}).json()
        assert len(events) == 2
        assert {event["device_id"] for event in events} == {"unit-a"}

        stats = client.get("/api/stats", params={"device_id": "unit-a"}).json()
        assert stats["event_count"] == 2
        assert stats["invalid_event_count"] == 1
        assert stats["device_count"] == 1


def test_unknown_command_result_is_not_updated(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        response = client.post(
            "/api/commands/missing/result",
            json={"result": "error", "message": "not found"},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "command not found"


def test_websocket_receives_new_event(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        with client.websocket_connect("/ws") as websocket:
            assert websocket.receive_json() == {
                "type": "connection",
                "data": {"status": "connected"},
            }
            response = client.post(
                "/api/events",
                json={"device_id": "unit-ws", "event_type": "button_pressed", "value": 1},
            )
            assert response.status_code == 201
            message = websocket.receive_json()
            assert message["type"] == "event"
            assert message["data"]["device_id"] == "unit-ws"


def test_stale_requested_command_becomes_timeout(tmp_path, monkeypatch):
    monkeypatch.setenv("IOT_DB_PATH", str(tmp_path / "timeout.db"))
    monkeypatch.setenv("IOT_OPERATOR_KEY", "classroom-test-key")
    from examples.course_backend import app

    module = importlib.reload(app)
    with TestClient(module.app) as client:
        created = client.post(
            "/api/commands",
            json={"device_id": "unit-timeout", "command": "reset"},
            headers={"X-IoT-Key": "classroom-test-key"},
        ).json()
        with module.connect_db() as db:
            db.execute(
                "UPDATE commands SET requested_at = ? WHERE command_id = ?",
                ("2000-01-01T00:00:00+00:00", created["command_id"]),
            )

        asyncio.run(module.expire_timed_out_commands())
        command = client.get(
            "/api/commands", params={"device_id": "unit-timeout"}
        ).json()[0]
        assert command["status"] == "timeout"
        assert command["completed_at"] is not None

        late = client.post(
            f"/api/commands/{created['command_id']}/result",
            json={"result": "done", "message": "late result"},
        )
        assert late.status_code == 409
        assert "already terminal" in late.json()["detail"]
        unchanged = client.get(
            "/api/commands", params={"device_id": "unit-timeout"}
        ).json()[0]
        assert unchanged["status"] == "timeout"


def test_event_time_filters_require_valid_order_and_timezone(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        invalid = client.get("/api/events", params={"since": "not-a-time"})
        assert invalid.status_code == 422

        no_timezone = client.get("/api/events", params={"since": "2026-11-18T10:00:00"})
        assert no_timezone.status_code == 422

        reversed_range = client.get(
            "/api/events",
            params={
                "since": "2026-11-18T11:00:00+00:00",
                "until": "2026-11-18T10:00:00+00:00",
            },
        )
        assert reversed_range.status_code == 422


def test_device_timestamp_requires_timezone(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        no_timezone = client.post(
            "/api/events",
            json={
                "device_id": "unit-time",
                "event_type": "light_sample",
                "timestamp": "2026-11-18T10:00:00",
            },
        )
        assert no_timezone.status_code == 422

        accepted = client.post(
            "/api/events",
            json={
                "device_id": "unit-time",
                "event_type": "light_sample",
                "timestamp": "2026-11-18T18:00:00+08:00",
            },
        )
        assert accepted.status_code == 201
        assert accepted.json()["device_timestamp"] == "2026-11-18T18:00:00+08:00"


def test_device_identifiers_reject_topic_unsafe_characters(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        event = client.post(
            "/api/events",
            json={"device_id": "unit/unsafe", "event_type": "button_pressed"},
        )
        assert event.status_code == 422

        command = client.post(
            "/api/commands",
            json={"device_id": "unit+unsafe", "command": "start"},
            headers={"X-IoT-Key": "classroom-test-key"},
        )
        assert command.status_code == 422

        event_filter = client.get("/api/events", params={"device_id": "unit/unsafe"})
        assert event_filter.status_code == 422

        command_filter = client.get("/api/commands", params={"status": "finished"})
        assert command_filter.status_code == 422

        poll = client.get("/api/devices/unit+unsafe/commands/next")
        assert poll.status_code == 422


def test_static_frontend_assets_are_served(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        assert client.get("/").status_code == 200
        assert client.get("/manifest.json").headers["content-type"].startswith(
            "application/manifest+json"
        )
        assert client.get("/sw.js").status_code == 200
        assert client.get("/icon.svg").status_code == 200
