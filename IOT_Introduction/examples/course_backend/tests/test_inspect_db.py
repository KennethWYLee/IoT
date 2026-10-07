import importlib
import json
import sqlite3
import sys

import pytest
from fastapi.testclient import TestClient

from examples.course_backend import inspect_db
from examples.course_backend.tests.test_api import load_app


def test_same_api_and_read_only_time_filters(tmp_path, monkeypatch, capsys):
    with TestClient(load_app(tmp_path, monkeypatch)) as client:
        for device, value, valid in [("A", 100, True), ("B", 900, True), ("A", 500, False)]:
            assert client.post("/api/events", json={"device_id": device, "event_type": "light_sample", "value": value, "unit": "adc_raw", "valid": valid}).status_code == 201
        db = tmp_path / "test.db"
        with sqlite3.connect(db) as connection:
            for event_id, hour in [(1, "01"), (2, "02"), (3, "03")]:
                connection.execute("UPDATE events SET recorded_at=? WHERE id=?", (f"2026-11-25T{hour}:00:00+00:00", event_id))
        start = inspect_db.utc_time("2026-11-25T10:00:00+08:00")
        end = inspect_db.utc_time("2026-11-25T11:00:00+08:00")
        module = importlib.reload(inspect_db)
        capsys.readouterr()
        with module.connect_read_only() as connection:
            module.show_events(connection, "A", "light_sample", 20, start, end)
            with pytest.raises(sqlite3.OperationalError):
                connection.execute("DELETE FROM events")
        rows = json.loads(capsys.readouterr().out)
        api = client.get("/api/events", params={"device_id": "A", "event_type": "light_sample", "since": start, "until": end, "limit": 20}).json()
        assert [row["id"] for row in rows] == [row["id"] for row in api] == [3]
        assert json.loads(rows[0]["value_json"]) == api[0]["value"] == 500
        assert bool(rows[0]["valid"]) is api[0]["valid"] is False
        capsys.readouterr()
        with module.connect_read_only() as connection:
            module.show_events(connection, None, "light_sample", 20, start, end)
        assert [row["id"] for row in json.loads(capsys.readouterr().out)] == [3, 2]


@pytest.mark.parametrize("value", ["2026-11-25T03:00:00", "not-time"])
def test_reject_time_without_zone_or_invalid(value):
    with pytest.raises(Exception) as error:
        inspect_db.utc_time(value)
    assert "time" in str(error.value)


def test_reject_reversed_range_before_opening_database(monkeypatch):
    monkeypatch.setattr(sys, "argv", ["inspect_db.py", "events", "--since", "2026-11-25T04:00:00Z", "--until", "2026-11-25T03:00:00Z"])
    with pytest.raises(SystemExit) as error:
        inspect_db.main()
    assert error.value.code == 2
