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


def exported_files(week: int | None = None) -> dict[Path, str]:
    http = ROOT / "IOT_Introduction/docs/teaching_drafts/week11_answers/lesson.md"
    files = {}
    for number, name, document, load in [
        (11, "week11_http_device", http, lambda: extract_only_complete_sketch(http)),
        (12, "week12_mqtt_device", MQTT_WEEK, lambda: extract_only_complete_sketch(MQTT_WEEK)),
        (15, "week15_automation_device", AUTOMATION_WEEK, build_week15_sketch),
    ]:
        if week is not None and number != week:
            continue
        sketch = load()
        folder = ROOT / "IOT_Introduction/examples" / name
        files[folder / f"{name}.ino"] = (
            "// Generated from the maintained lesson; do not edit this repository copy.\n"
            "// Save a personal sketch before entering settings or secrets.\n" + sketch
        )
        secrets_source = document
        blocks = re.findall(r"```cpp\s*\n(.*?)\n```", secrets_source.read_text(encoding="utf-8"), re.S)
        secret_blocks = [block for block in blocks if block.startswith("#pragma once")]
        if len(secret_blocks) != 1:
            raise ValueError(f"Expected one secrets template in {secrets_source}")
        files[folder / "secrets.example.h"] = secret_blocks[0] + "\n"
        if number == 15:
            alternate = sketch
            for old, new in [
                ("REQUIRED_DARK_SAMPLES = 3, REQUIRED_LIGHT_SAMPLES = 3", "REQUIRED_DARK_SAMPLES = 4, REQUIRED_LIGHT_SAMPLES = 2"),
                ("dark_three_confirmed", "dark_four_confirmed"),
                ("light_three_confirmed", "light_two_confirmed"),
            ]:
                if alternate.count(old) != 1:
                    raise ValueError(f"Week15 alternate replacement is not unique: {old}")
                alternate = alternate.replace(old, new)
            target = AUTOMATION_WEEK.parent / "asymmetric_samples/asymmetric_samples.ino"
            files[target] = "// Generated Q5 variant; edit a personal copy, not this export.\n" + alternate
    return files


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check exports without writing")
    parser.add_argument("--week", type=int, choices=(11, 12, 15), help="Export only the selected week")
    args = parser.parse_args()
    for path, expected in exported_files(args.week).items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != expected:
                raise SystemExit(f"Out of sync: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected, encoding="utf-8", newline="\n")
        print(f"{'Checked' if args.check else 'Exported'} {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
