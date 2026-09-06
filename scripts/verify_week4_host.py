"""Compile and execute canonical Week 4 control logic with host-only I/O stubs.

Generated fixtures change only the public pin/gate constants. They are NOT
published GPIO profiles. No serial port, USB device or physical sensor is used.
"""
from pathlib import Path
import os
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_outputs/week4_host"
TEST = ROOT / "scripts/tests/week4"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for tag, name, replacements in [
        ("dual", "week04_dual_sensor_alarm", {
            "const int PIN_LIGHT = -1;": "const int PIN_LIGHT = 4;",
            "const int PIN_DHT = -1;": "const int PIN_DHT = 5;",
            "const int PIN_BUZZER_CONTROL = -1;": "const int PIN_BUZZER_CONTROL = 6;",
            "const bool SENSOR_PROFILES_CONFIRMED = false;": "const bool SENSOR_PROFILES_CONFIRMED = true;",
            "const bool BUZZER_PROFILE_CONFIRMED = false;": "const bool BUZZER_PROFILE_CONFIRMED = true;",
            "const int BUZZER_ON_LEVEL = -1;": "const int BUZZER_ON_LEVEL = HIGH;",
            "const int INDOOR_MIN = -1;": "const int INDOOR_MIN = 300;",
            "const int INDOOR_MAX = -1;": "const int INDOOR_MAX = 320;",
            "const int SHADE_MIN = -1;": "const int SHADE_MIN = 900;",
            "const int SHADE_MAX = -1;": "const int SHADE_MAX = 920;"}),
        ("classifier", "week03_light_classifier", {
            "const int PIN_LIGHT = -1;": "const int PIN_LIGHT = 4;",
            "const int INDOOR_MIN = -1;": "const int INDOOR_MIN = 300;",
            "const int INDOOR_MAX = -1;": "const int INDOOR_MAX = 320;",
            "const int SHADE_MIN = -1;": "const int SHADE_MIN = 900;",
            "const int SHADE_MAX = -1;": "const int SHADE_MAX = 920;"}),
        ("ky", "week04_ky018_quality", {"const int PIN_LIGHT = -1;": "const int PIN_LIGHT = 4;"}),
        ("dht", "week04_dht11_quality", {"const int PIN_DHT = -1;": "const int PIN_DHT = 4;",
                                         "const bool MODULE_PROFILE_CONFIRMED = false;": "const bool MODULE_PROFILE_CONFIRMED = true;"}),
    ]:
        source = (ROOT / f"examples/{name}/{name}.ino").read_text(encoding="utf-8")
        (OUT / f"public_{tag}.inc").write_text(source, encoding="utf-8")
        for old, new in replacements.items():
            assert source.count(old) == 1
            source = source.replace(old, new)
        (OUT / f"enabled_{tag}.inc").write_text(source, encoding="utf-8")
    exe = OUT / ("week4_host.exe" if os.name == "nt" else "week4_host")
    if os.name == "nt":
        vcvars = Path(r"C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat")
        if not vcvars.exists():
            raise SystemExit("NOT RUN: MSVC vcvars64.bat not found; no host pass claimed.")
        args = ["cl", "/nologo", "/std:c++17", "/EHsc", "/utf-8", "/W4", f"/I{TEST}", f"/I{OUT}",
                str(TEST / "host_checks.cpp"), f"/Fe:{exe}", f"/Fo:{OUT / 'week4_host.obj'}"]
        command = f'call "{vcvars}" >nul && ' + subprocess.list2cmdline(args)
        # cmd.exe needs native command-line quoting, not argv's C-runtime \" escapes.
        result = subprocess.run('cmd /d /s /c "' + command + '"', cwd=OUT, capture_output=True,
                                text=True, encoding="utf-8", errors="replace",
                                env={**os.environ, "VSLANG": "1033"})
    else:
        compiler = shutil.which("g++") or shutil.which("clang++")
        if not compiler:
            raise SystemExit("NOT RUN: C++ compiler unavailable.")
        result = subprocess.run([compiler, "-std=c++17", f"-I{TEST}", f"-I{OUT}", str(TEST / "host_checks.cpp"),
                                 "-o", str(exe)], cwd=OUT, capture_output=True, text=True, encoding="utf-8")
    print(result.stdout, result.stderr)
    result.check_returncode()
    run = subprocess.run([str(exe)], cwd=OUT, capture_output=True, text=True, encoding="utf-8")
    print(run.stdout, run.stderr)
    (OUT / "result.txt").write_text(run.stdout + run.stderr, encoding="utf-8")
    run.check_returncode()


if __name__ == "__main__":
    main()
