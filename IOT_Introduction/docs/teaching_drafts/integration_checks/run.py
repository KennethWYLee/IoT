"""Compile/run the exact teaching sketches with explicit host-only settings."""
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
COURSE = HERE.parents[2]
sys.path.insert(0, str(COURSE / "scripts"))
from host_compiler import find_vcvars

names = {3: "button_light_capture", 4: "button_environment_log", 5: "button_oled_timer"}
results = []
for week, name in names.items():
    original = (HERE.parent / f"week{week}_redesign" / name / f"{name}.ino").read_text(encoding="utf-8")
    settings = {
        "const bool PROFILE_CONFIRMED = false;": "const bool PROFILE_CONFIRMED = true;",
        "const int PIN_LIGHT = -1;": "const int PIN_LIGHT = 4;",
        "const int PIN_BUTTON = -1;": "const int PIN_BUTTON = 5;",
        "const int PIN_DHT = -1;": "const int PIN_DHT = 6;",
        "const int PIN_ADD = -1, PIN_START = -1;": "const int PIN_ADD = 4, PIN_START = 5;",
        "const int PIN_SDA = -1, PIN_SCL = -1;": "const int PIN_SDA = 8, PIN_SCL = 9;",
        "const int OLED_ADDRESS = -1;": "const int OLED_ADDRESS = 0x3c;",
    }
    solution = {
        3: {"const int SAMPLES_PER_PRESS = 1;": "const int SAMPLES_PER_PRESS = 3;"},
        4: {"const bool REQUIRE_VALID_DHT = false;": "const bool REQUIRE_VALID_DHT = true;"},
        5: {"const uint32_t STEP_SECONDS = 10;": "const uint32_t STEP_SECONDS = 5;",
            "const uint32_t MAX_SECONDS = 60;": "const uint32_t MAX_SECONDS = 30;"},
    }[week]
    for variant in ["blocked", "base", "solution"] + (["oled1315"] if week == 5 else []):
        source = original
        if variant != "blocked":
            for old, new in settings.items():
                if old in source:
                    assert source.count(old) == 1
                    source = source.replace(old, new)
        if variant == "solution":
            for old, new in solution.items():
                assert source.count(old) == 1
                source = source.replace(old, new)
        out = HERE / "tmp" / f"week{week}_{variant}"
        out.mkdir(parents=True, exist_ok=True)
        (out / "sketch.inc").write_text(source, encoding="utf-8")
        exe = out / ("checks.exe" if os.name == "nt" else "checks")
        macros = [f"TASK_WEEK={week}", f"BLOCKED={int(variant == 'blocked')}"]
        if variant == "oled1315":
            macros.append("OLED_CONTROLLER=1315")
        if os.name == "nt":
            args = ["cl", "/nologo", "/std:c++17", "/EHsc", "/utf-8", "/W4",
                    *["/D" + m for m in macros], f"/I{HERE / 'fakes'}", f"/I{out}",
                    str(HERE / "checks.cpp"), f"/Fe:{exe}", f"/Fo:{out / 'checks.obj'}"]
            command = f'call "{find_vcvars()}" >nul && ' + subprocess.list2cmdline(args)
            build = subprocess.run('cmd /d /s /c "' + command + '"', cwd=out, capture_output=True,
                                   text=True, encoding="utf-8", errors="replace")
        else:
            compiler = shutil.which("g++") or shutil.which("clang++")
            assert compiler, "No host C++ compiler"
            build = subprocess.run([compiler, "-std=c++17", *["-D" + m for m in macros],
                                    f"-I{HERE / 'fakes'}", f"-I{out}", str(HERE / "checks.cpp"),
                                    "-o", str(exe)], capture_output=True, text=True)
        (out / "compile.txt").write_text(build.stdout + build.stderr, encoding="utf-8")
        if build.returncode:
            print(build.stdout, build.stderr)
        build.check_returncode()
        run = subprocess.run([str(exe)], capture_output=True, text=True)
        print(variant, run.stdout, run.stderr, end="")
        run.check_returncode()
        results.append({"week": week, "variant": variant, "output": run.stdout.strip()})
(HERE / "tmp/results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
