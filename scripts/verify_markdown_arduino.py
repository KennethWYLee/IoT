"""Compile every complete Arduino sketch embedded in course materials."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MQTT_WEEK = ROOT / "IoT_Introduction/Week_12_MQTT_Database_and_Logs/week12_main.md"
SOURCES = (
    ROOT / "IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb",
    ROOT / "IoT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb",
    ROOT / "IoT_Introduction/Week_04_Sensors_and_Data_Quality/week4_main.ipynb",
    ROOT / "docs/archive/week4_actuators/week4_main.md",
    ROOT / "docs/archive/week5_standalone/week5_main.md",
    ROOT / "IoT_Introduction/Week_05_RGB_OLED_Countdown/week5_main.ipynb",
    ROOT / "IoT_Introduction/Week_06_Servo_Pointer/week6_main.ipynb",
    ROOT / "IoT_Introduction/Week_07_Traffic_Light_Challenge/week7_main.ipynb",
    ROOT / "IoT_Introduction/Week_11_HTTP_WebSocket_Backend/week11_main.md",
    MQTT_WEEK,
    ROOT / "docs/course_materials/starter_code_snippets.md",
)
WEEK3 = ROOT / "IoT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb"
WEEK3_EXAMPLES = (
    ROOT / "examples/week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino",
    ROOT / "examples/week03_ky018_raw/week03_ky018_raw.ino",
    ROOT / "examples/week03_light_classifier/week03_light_classifier.ino",
)
AUTOMATION_WEEK = ROOT / "IoT_Introduction/Week_15_Automation_and_Safety/week15_main.md"
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


def source_content(document: Path) -> str:
    if document.suffix.lower() != ".ipynb":
        return document.read_text(encoding="utf-8")
    notebook = json.loads(document.read_text(encoding="utf-8"))
    default_language = notebook.get("metadata", {}).get("language_info", {}).get(
        "name", ""
    )
    parts: list[str] = []
    for cell in notebook.get("cells", []):
        source = cell.get("source", "")
        if isinstance(source, list):
            source = "".join(source)
        if cell.get("cell_type") == "markdown":
            parts.append(source)
        elif cell.get("cell_type") == "code":
            language = cell.get("metadata", {}).get("language", default_language)
            parts.append(f"```{language}\n{source.rstrip()}\n```")
    return "\n\n".join(parts)


def extract_complete_sketches(markdown: Path) -> list[str]:
    content = source_content(markdown)
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


def verify_week3_example_sync() -> None:
    notebook_sketches = extract_complete_sketches(WEEK3)
    if len(notebook_sketches) != len(WEEK3_EXAMPLES):
        raise ValueError(
            "Week 3 notebook/example count differs: "
            f"{len(notebook_sketches)} notebook, {len(WEEK3_EXAMPLES)} examples"
        )
    for index, (notebook_source, example_path) in enumerate(
        zip(notebook_sketches, WEEK3_EXAMPLES), start=1
    ):
        example_source = example_path.read_text(encoding="utf-8")
        if notebook_source != example_source:
            raise ValueError(
                f"Week 3 sketch {index} differs from {example_path.relative_to(ROOT)}"
            )


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


def build_week15_sketch() -> str:
    source = extract_only_complete_sketch(MQTT_WEEK)
    content = AUTOMATION_WEEK.read_text(encoding="utf-8")
    blocks = re.findall(r"```cpp\s*\n(.*?)\n```", content, flags=re.DOTALL)
    if len(blocks) != 7:
        raise ValueError(f"expected seven Week 15 modification blocks, found {len(blocks)}")

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


def compile_week15(cli: str, temporary_root: Path) -> None:
    sketch_dir = temporary_root / "week_15_automation"
    sketch_dir.mkdir()
    (sketch_dir / "week_15_automation.ino").write_text(
        build_week15_sketch(), encoding="utf-8"
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
    print(f"[{AUTOMATION_WEEK.parent.name}] exit={result.returncode}")
    print(result.stdout.rstrip())
    if result.returncode != 0:
        raise RuntimeError("Arduino compile failed for composed Week 15 sketch")


def main() -> int:
    try:
        cli = find_cli()
        verify_week3_example_sync()
        with tempfile.TemporaryDirectory(prefix="iot-course-arduino-") as directory:
            temporary_root = Path(directory)
            for markdown in SOURCES:
                for index, source in enumerate(
                    extract_complete_sketches(markdown), start=1
                ):
                    compile_sketch(cli, markdown, source, index, temporary_root)
            compile_week15(cli, temporary_root)
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        print(f"verification error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
