import importlib

from fastapi.testclient import TestClient


def load_app(tmp_path, monkeypatch):
    monkeypatch.setenv("IOT_DB_PATH", str(tmp_path / "test.db"))
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
                "state": "active",
            },
        )
        assert response.status_code == 201

        events = client.get("/api/events").json()
        assert len(events) == 1
        assert events[0]["device_id"] == "demo-device"
        assert events[0]["value"] == 1


def test_command_result_is_tracked(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        created = client.post(
            "/api/commands",
            json={"device_id": "demo-device", "command": "start"},
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


def test_unknown_command_result_is_not_updated(tmp_path, monkeypatch):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        response = client.post(
            "/api/commands/missing/result",
            json={"result": "error", "message": "not found"},
        )
        assert response.status_code == 200
        assert response.json() == {"updated": False, "command_id": "missing"}
