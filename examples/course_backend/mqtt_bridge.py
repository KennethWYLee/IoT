"""Forward validated course MQTT messages to the HTTP/SQLite backend.

Run this process beside app.py during Week 10.  The bridge deliberately accepts
only the documented course topic tree and never executes a device command.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import uuid
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

import paho.mqtt.client as mqtt


MQTT_HOST = os.environ.get("MQTT_HOST", "127.0.0.1")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
MQTT_USERNAME = os.environ.get("MQTT_USERNAME", "")
MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", "")
API_BASE_URL = os.environ.get("IOT_API_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$")


@dataclass(frozen=True)
class RoutedMessage:
    kind: str
    target_url: str
    body: dict[str, Any]


@dataclass(frozen=True)
class MqttCommand:
    topic: str
    payload: str


def log(action: str, **fields: Any) -> None:
    print(json.dumps({"action": action, **fields}, ensure_ascii=False), flush=True)


def parse_json_object(payload: bytes) -> dict[str, Any]:
    if len(payload) > 4096:
        raise ValueError("payload exceeds 4096 bytes")
    try:
        decoded = payload.decode("utf-8")
        value = json.loads(decoded)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("payload must be one UTF-8 JSON object") from exc
    if not isinstance(value, dict):
        raise ValueError("payload root must be a JSON object")
    return value


def route_message(topic: str, payload: bytes) -> RoutedMessage:
    """Validate a topic/payload pair and map it to one backend request."""
    parts = topic.split("/")
    if len(parts) != 3 or parts[0] != "course":
        raise ValueError("topic must be course/<device_id>/<message_type>")

    _, topic_device_id, message_type = parts
    if not IDENTIFIER_PATTERN.fullmatch(topic_device_id):
        raise ValueError("device_id in topic contains unsupported characters")

    data = parse_json_object(payload)
    payload_device_id = data.get("device_id")
    if payload_device_id != topic_device_id:
        raise ValueError("payload device_id does not match topic device_id")

    if message_type in {"events", "telemetry", "presence"}:
        event_type = data.get("event_type", message_type.rstrip("s"))
        if not isinstance(event_type, str) or not IDENTIFIER_PATTERN.fullmatch(event_type):
            raise ValueError("event_type contains unsupported characters")
        valid = data.get("valid")
        if valid is not None and not isinstance(valid, bool):
            raise ValueError("valid must be a JSON boolean or null")
        uptime_ms = data.get("uptime_ms")
        if uptime_ms is not None and (
            not isinstance(uptime_ms, int) or isinstance(uptime_ms, bool) or uptime_ms < 0
        ):
            raise ValueError("uptime_ms must be a non-negative integer or null")
        body = {
            "device_id": topic_device_id,
            "event_type": event_type,
            "value": data.get("value"),
            "unit": data.get("unit"),
            "state": data.get("state"),
            "valid": valid,
            "reason": data.get("reason"),
            "uptime_ms": uptime_ms,
            "timestamp": data.get("device_timestamp"),
        }
        return RoutedMessage("event", f"{API_BASE_URL}/api/events", body)

    if message_type == "acks":
        command_id = data.get("command_id")
        result = data.get("result")
        if not isinstance(command_id, str) or not command_id:
            raise ValueError("ack requires command_id")
        try:
            uuid.UUID(command_id)
        except ValueError as exc:
            raise ValueError("ack command_id must be a UUID") from exc
        if result not in {"accepted", "done", "error", "timeout", "rejected"}:
            raise ValueError("ack result is not allowed")
        body = {"result": result, "message": str(data.get("message", ""))}
        return RoutedMessage(
            "ack",
            f"{API_BASE_URL}/api/commands/{command_id}/result",
            body,
        )

    raise ValueError(f"unsupported message type: {message_type}")


def post_json(routed: RoutedMessage) -> None:
    request = urllib.request.Request(
        routed.target_url,
        data=json.dumps(routed.body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=3) as response:
        if response.status not in {200, 201}:
            raise RuntimeError(f"backend returned HTTP {response.status}")


def get_pending_commands() -> list[dict[str, Any]]:
    url = f"{API_BASE_URL}/api/commands?status=requested&limit=200"
    with urllib.request.urlopen(url, timeout=3) as response:
        data = json.loads(response.read().decode("utf-8"))
    if not isinstance(data, list):
        raise RuntimeError("backend command response is not a list")
    return data


def command_to_mqtt(command: dict[str, Any]) -> MqttCommand:
    device_id = command.get("device_id")
    command_id = command.get("command_id")
    command_name = command.get("command")
    if not all(isinstance(value, str) and value for value in (device_id, command_id, command_name)):
        raise ValueError("backend command is missing an identity or command name")
    if not IDENTIFIER_PATTERN.fullmatch(device_id):
        raise ValueError("backend command device_id cannot be used in an MQTT topic")
    payload = json.dumps(
        {
            "device_id": device_id,
            "command_id": command_id,
            "command": command_name,
            "parameters": command.get("parameters", {}),
        },
        separators=(",", ":"),
    )
    return MqttCommand(f"course/{device_id}/commands", payload)


def on_connect(client: mqtt.Client, userdata: Any, flags: Any, reason_code: Any, properties: Any) -> None:
    if reason_code != 0:
        log("mqtt_connect_failed", reason_code=str(reason_code))
        return
    for suffix in ("events", "telemetry", "presence", "acks"):
        client.subscribe(f"course/+/{suffix}", qos=1)
    log("mqtt_connected", host=MQTT_HOST, port=MQTT_PORT)


def on_message(client: mqtt.Client, userdata: Any, message: mqtt.MQTTMessage) -> None:
    try:
        routed = route_message(message.topic, message.payload)
        post_json(routed)
        log("mqtt_forwarded", topic=message.topic, kind=routed.kind)
    except (ValueError, RuntimeError, urllib.error.URLError) as exc:
        log("mqtt_message_rejected", topic=message.topic, error=str(exc))


def main() -> int:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="course-backend-bridge")
    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_message = on_message

    published_at: dict[str, float] = {}
    try:
        client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
        client.loop_start()
        while True:
            try:
                pending = get_pending_commands()
                pending_ids = {str(item.get("command_id", "")) for item in pending}
                published_at = {
                    command_id: sent_at
                    for command_id, sent_at in published_at.items()
                    if command_id in pending_ids
                }
                now = time.monotonic()
                for item in pending:
                    command_id = str(item.get("command_id", ""))
                    if now - published_at.get(command_id, 0.0) < 5.0:
                        continue
                    outgoing = command_to_mqtt(item)
                    info = client.publish(outgoing.topic, outgoing.payload, qos=1, retain=False)
                    if info.rc == mqtt.MQTT_ERR_SUCCESS:
                        published_at[command_id] = now
                        log("mqtt_command_published", topic=outgoing.topic, command_id=command_id)
                    else:
                        log("mqtt_command_publish_failed", command_id=command_id, rc=info.rc)
            except (ValueError, RuntimeError, urllib.error.URLError, json.JSONDecodeError) as exc:
                log("mqtt_command_poll_failed", error=str(exc))
            time.sleep(0.5)
    except KeyboardInterrupt:
        log("mqtt_bridge_stopped", reason="keyboard_interrupt")
        client.loop_stop()
        client.disconnect()
        return 0
    except OSError as exc:
        log("mqtt_bridge_failed", error=str(exc))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
