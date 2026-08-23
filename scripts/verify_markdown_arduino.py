"""Compile every complete Arduino sketch embedded in course materials."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEEK10 = ROOT / "IoT_Introduction/Week_10_MQTT_Multi_Device/week10_main.md"
SOURCES = (
    ROOT / "IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.md",
    ROOT / "IoT_Introduction/Week_03_Sensors_Input_Quality/week3_main.md",
    ROOT / "IoT_Introduction/Week_04_Actuators_and_Power/week4_main.md",
    ROOT / "IoT_Introduction/Week_05_Standalone_Interaction/week5_main.md",
    ROOT / "IoT_Introduction/Week_06_HTTP_WebSocket_Backend/week6_main.md",
    WEEK10,
    ROOT / "docs/course_materials/starter_code_snippets.md",
)
WEEK14 = ROOT / "IoT_Introduction/Week_14_Automation_and_Safety/week14_main.md"
WINDOWS_CLI = Path(
    r"C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe"
)
FQBN = "esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi"
SECRETS = """#pragma once
const char WIFI_SSID[] = "compile-test";
const char WIFI_PASSWORD[] = "compile-test";
const char API_BASE_URL[] = "http://127.0.0.1:8000";
const char MQTT_HOST[] = "127.0.0.1";
const int MQTT_PORT = 1883;
const char MQTT_USERNAME[] = "compile-test";
const char MQTT_PASSWORD[] = "compile-test";
"""


def find_cli() -> str:
    executable = shutil.which("arduino-cli")
    if executable:
        return executable
    if WINDOWS_CLI.exists():
        return str(WINDOWS_CLI)
    raise FileNotFoundError("arduino-cli was not found")


def extract_complete_sketches(markdown: Path) -> list[str]:
    content = markdown.read_text(encoding="utf-8")
    blocks = re.findall(r"```cpp\s*\n(.*?)\n```", content, flags=re.DOTALL)
    complete = [block for block in blocks if "void setup()" in block and "void loop()" in block]
    if not complete:
        raise ValueError(f"expected at least one complete sketch in {markdown}")
    return [block + "\n" for block in complete]


def extract_only_complete_sketch(markdown: Path) -> str:
    complete = extract_complete_sketches(markdown)
    if len(complete) != 1:
        raise ValueError(f"expected one complete sketch in {markdown}, found {len(complete)}")
    return complete[0]


def function_span(source: str, signature: str) -> tuple[int, int]:
    start = source.index(signature)
    opening = source.index("{", start)
    depth = 0
    for index in range(opening, len(source)):
        if source[index] == "{":
            depth += 1
        elif source[index] == "}":
            depth -= 1
            if depth == 0:
                return start, index + 1
    raise ValueError(f"function is not balanced: {signature}")


def replace_function(source: str, signature: str, replacement: str) -> str:
    start, end = function_span(source, signature)
    return source[:start] + replacement + source[end:]


def build_week14_sketch() -> str:
    source = extract_only_complete_sketch(WEEK10)
    content = WEEK14.read_text(encoding="utf-8")
    blocks = re.findall(r"```cpp\s*\n(.*?)\n```", content, flags=re.DOTALL)
    if len(blocks) != 7:
        raise ValueError(f"expected seven Week 14 modification blocks, found {len(blocks)}")

    source = source.replace(
        "const unsigned long TELEMETRY_MS = 2000;",
        "const unsigned long TELEMETRY_MS = 2000;\n\n" + blocks[0],
        1,
    )
    _, profile_end = function_span(source, "bool profileReady()")
    source = source[:profile_end] + "\n\n" + blocks[1] + source[profile_end:]
    source = replace_function(source, "void enterState(", blocks[2])
    source = replace_function(source, "void executeCommand(", blocks[4])
    physical_start, _ = function_span(source, "void readPhysicalInputs(")
    source = source[:physical_start] + blocks[3] + "\n\n" + source[physical_start:]
    source = replace_function(source, "void readPhysicalInputs(", blocks[5])
    loop_start, loop_end = function_span(source, "void loop()")
    loop = source[loop_start:loop_end]
    loop = loop.replace("  readPhysicalInputs();", "  readPhysicalInputs();\n  " + blocks[6], 1)
    source = source[:loop_start] + loop + source[loop_end:]
    return source


def compile_sketch(
    cli: str, markdown: Path, source: str, index: int, temporary_root: Path
) -> None:
    sketch_name = f"{markdown.parent.name.lower()}_{index}"
    sketch_dir = temporary_root / sketch_name
    sketch_dir.mkdir()
    (sketch_dir / f"{sketch_name}.ino").write_text(
        source, encoding="utf-8"
    )
    (sketch_dir / "secrets.h").write_text(SECRETS, encoding="utf-8")
    result = subprocess.run(
        [cli, "compile", "--fqbn", FQBN, str(sketch_dir)],
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    print(f"[{markdown.parent.name} sketch {index}] exit={result.returncode}")
    print(result.stdout.rstrip())
    if result.returncode != 0:
        raise RuntimeError(f"Arduino compile failed for {markdown}")


def compile_week14(cli: str, temporary_root: Path) -> None:
    sketch_dir = temporary_root / "week_14_automation"
    sketch_dir.mkdir()
    (sketch_dir / "week_14_automation.ino").write_text(
        build_week14_sketch(), encoding="utf-8"
    )
    (sketch_dir / "secrets.h").write_text(SECRETS, encoding="utf-8")
    result = subprocess.run(
        [cli, "compile", "--fqbn", FQBN, str(sketch_dir)],
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    print(f"[{WEEK14.parent.name}] exit={result.returncode}")
    print(result.stdout.rstrip())
    if result.returncode != 0:
        raise RuntimeError("Arduino compile failed for composed Week 14 sketch")


def main() -> int:
    try:
        cli = find_cli()
        with tempfile.TemporaryDirectory(prefix="iot-course-arduino-") as directory:
            temporary_root = Path(directory)
            for markdown in SOURCES:
                for index, source in enumerate(
                    extract_complete_sketches(markdown), start=1
                ):
                    compile_sketch(cli, markdown, source, index, temporary_root)
            compile_week14(cli, temporary_root)
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        print(f"verification error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
