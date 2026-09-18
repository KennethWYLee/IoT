"""Export runnable Arduino folders from the maintained network lesson sources."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from verify_markdown_arduino import (
    AUTOMATION_WEEK,
    MQTT_WEEK,
    ROOT,
    build_week15_sketch,
    extract_only_complete_sketch,
)


def exported_files() -> dict[Path, str]:
    http = ROOT / "IOT_Introduction/Week_11_HTTP_WebSocket_Backend/week11_main.md"
    files = {}
    for name, document, sketch in [
        ("week11_http_device", http, extract_only_complete_sketch(http)),
        ("week12_mqtt_device", MQTT_WEEK, extract_only_complete_sketch(MQTT_WEEK)),
        ("week15_automation_device", AUTOMATION_WEEK, build_week15_sketch()),
    ]:
        folder = ROOT / "IOT_Introduction/examples" / name
        files[folder / f"{name}.ino"] = (
            "// Generated from the maintained lesson; do not edit this repository copy.\n"
            "// Save a personal sketch before entering settings or secrets.\n" + sketch
        )
        secrets_source = http if document == http else MQTT_WEEK
        blocks = re.findall(r"```cpp\s*\n(.*?)\n```", secrets_source.read_text(encoding="utf-8"), re.S)
        secret_blocks = [block for block in blocks if block.startswith("#pragma once")]
        if len(secret_blocks) != 1:
            raise ValueError(f"Expected one secrets template in {secrets_source}")
        files[folder / "secrets.example.h"] = secret_blocks[0] + "\n"
    return files


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check exports without writing")
    args = parser.parse_args()
    for path, expected in exported_files().items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != expected:
                raise SystemExit(f"Out of sync: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected, encoding="utf-8", newline="\n")
        print(f"{'Checked' if args.check else 'Exported'} {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
