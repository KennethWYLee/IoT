import importlib
import json

import pytest


def load_bridge(monkeypatch):
    monkeypatch.setenv("IOT_API_BASE_URL", "http://127.0.0.1:8000")
    from examples.course_backend import mqtt_bridge

    return importlib.reload(mqtt_bridge)


def test_telemetry_is_mapped_to_event(monkeypatch):
    bridge = load_bridge(monkeypatch)
    routed = bridge.route_message(
        "course/unit-03/telemetry",
        json.dumps(
            {
                "device_id": "unit-03",
                "event_type": "light_sample",
                "value": 456,
                "unit": "adc_raw",
                "state": "idle",
                "valid": True,
                "uptime_ms": 5000,
                "device_timestamp": "2026-11-11T03:00:00+00:00",
            }
        ).encode(),
    )
    assert routed.kind == "event"
    assert routed.target_url.endswith("/api/events")
    assert routed.body["device_id"] == "unit-03"
    assert routed.body["value"] == 456
    assert routed.body["timestamp"] == "2026-11-11T03:00:00+00:00"


def test_ack_is_mapped_to_command_result(monkeypatch):
    bridge = load_bridge(monkeypatch)
    command_id = "123e4567-e89b-12d3-a456-426614174000"
    routed = bridge.route_message(
        "course/unit-03/acks",
        json.dumps(
            {
                "device_id": "unit-03",
                "command_id": command_id,
                "result": "done",
                "message": "safe",
            }
        ).encode(),
    )
    assert routed.kind == "ack"
    assert routed.target_url.endswith(f"/api/commands/{command_id}/result")
    assert routed.body["result"] == "done"


def test_backend_command_is_mapped_to_non_retained_device_topic(monkeypatch):
    bridge = load_bridge(monkeypatch)
    outgoing = bridge.command_to_mqtt(
        {
            "device_id": "unit-03",
            "command_id": "command-123",
            "command": "stop",
            "parameters": {"source": "phone"},
        }
    )
    assert outgoing.topic == "course/unit-03/commands"
    payload = json.loads(outgoing.payload)
    assert payload["command_id"] == "command-123"
    assert payload["parameters"] == {"source": "phone"}


@pytest.mark.parametrize(
    ("topic", "payload"),
    [
        ("public/unit-03/telemetry", b"{}"),
        ("course/unit-03/commands", b'{"device_id":"unit-03"}'),
        ("course/unit-03/telemetry", b'{"device_id":"unit-99"}'),
        ("course/unit-03/telemetry", b"not-json"),
        ("course/unit-03/telemetry", b'{"device_id":"unit-03","valid":"false"}'),
        ("course/unit-03/telemetry", b'{"device_id":"unit-03","uptime_ms":true}'),
        ("course/unit+03/telemetry", b'{"device_id":"unit+03"}'),
        ("course/unit-03/events", b'{"device_id":"unit-03","event_type":"bad/type"}'),
        ("course/unit-03/acks", b'{"device_id":"unit-03","result":"done"}'),
        ("course/unit-03/acks", b'{"device_id":"unit-03","command_id":"../bad","result":"done"}'),
        ("course/unit-03/events", b"{" + b" " * 4096 + b"}"),
    ],
)
def test_invalid_mqtt_message_is_rejected(monkeypatch, topic, payload):
    bridge = load_bridge(monkeypatch)
    with pytest.raises(ValueError):
        bridge.route_message(topic, payload)
