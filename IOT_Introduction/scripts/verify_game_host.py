"""Compile canonical Arduino logic with host-only I/O; no USB/physical claims."""
from pathlib import Path
import os
import shutil
import subprocess
import sys
from host_compiler import find_vcvars

ROOT = Path(__file__).resolve().parents[2]
TEST = ROOT / "IOT_Introduction/scripts/tests/game"


def main():
    week = int(sys.argv[1])
    assert week in (5, 6, 7)
    out = ROOT / f"_outputs/week{week}_host"
    out.mkdir(parents=True, exist_ok=True)
    fixtures = [
        ("scanner", "week05_i2c_check", {
            "const bool ELECTRICAL_PROFILE_CONFIRMED = false;": "const bool ELECTRICAL_PROFILE_CONFIRMED = true;",
            "const int PIN_SDA = -1;": "const int PIN_SDA = 8;",
            "const int PIN_SCL = -1;": "const int PIN_SCL = 9;"}),
        ("timer", "week05_rgb_oled_timer", {
            "const int LESSON_STAGE = 0;": "const int LESSON_STAGE = 3;",
            "const bool RGB_PROFILE_CONFIRMED = false;": "const bool RGB_PROFILE_CONFIRMED = true;",
            "const bool OLED_PROFILE_CONFIRMED = false;": "const bool OLED_PROFILE_CONFIRMED = true;",
            "const int PIN_RGB_R = -1;": "const int PIN_RGB_R = 4;",
            "const int PIN_RGB_G = -1;": "const int PIN_RGB_G = 5;",
            "const int PIN_RGB_B = -1;": "const int PIN_RGB_B = 6;",
            "const int RGB_ON_LEVEL = -1;": "const int RGB_ON_LEVEL = HIGH;",
            "const int PIN_SDA = -1;": "const int PIN_SDA = 8;",
            "const int PIN_SCL = -1;": "const int PIN_SCL = 9;",
            "const int OLED_ADDRESS_7BIT = -1;": "const int OLED_ADDRESS_7BIT = 0x3c;"})]
    if week == 6:
        values = {"PIN_SERVO": 7, "PIN_STOP": 10, "SERVO_HZ": 50,
                  "SERVO_MIN_US": 1000, "SERVO_MAX_US": 2000,
                  "SAFE_MIN_ANGLE": 30, "SAFE_MAX_ANGLE": 150,
                  "ZERO_ANGLE": 30, "SIX_ANGLE": 150,
                  "PIN_SDA": 8, "PIN_SCL": 9, "OLED_ADDRESS_7BIT": "0x3c"}
        replacements = {f"const int {key} = -1;": f"const int {key} = {value};" for key, value in values.items()}
        for flag in ("SERVO_PROFILE_CONFIRMED", "POWER_AND_FIXTURE_CONFIRMED", "STOP_PROFILE_CONFIRMED",
                     "WITH_OLED", "OLED_PROFILE_CONFIRMED"):
            replacements[f"const bool {flag} = false;"] = f"const bool {flag} = true;"
        fixtures = [("pointer", "week06_servo_pointer", replacements)]
    if week == 7:
        values = {"PIN_LIGHT": 4, "PIN_START": 5, "PIN_FINISH": 6,
                  "PIN_RGB_R": 7, "PIN_RGB_G": 8, "PIN_RGB_B": 9,
                  "PIN_SDA": 10, "PIN_SCL": 11, "OLED_ADDRESS_7BIT": "0x3c",
                  "PIN_SERVO": 12, "PIN_BUZZER": 13, "RGB_ON_LEVEL": "HIGH",
                  "BUZZER_ON_LEVEL": "HIGH", "SERVO_HZ": 50, "SERVO_MIN_US": 1000,
                  "SERVO_MAX_US": 2000, "SAFE_MIN_ANGLE": 30, "SAFE_MAX_ANGLE": 150,
                  "ZERO_ANGLE": 30, "SIX_ANGLE": 150, "INDOOR_MIN": 300, "INDOOR_MAX": 320,
                  "SHADE_MIN": 900, "SHADE_MAX": 920}
        replacements = {f"const int {key} = -1;": f"const int {key} = {value};" for key, value in values.items()}
        for flag in ("LOW_POWER_PROFILE_CONFIRMED", "SERVO_AND_POWER_PROFILE_CONFIRMED", "BUZZER_PROFILE_CONFIRMED"):
            replacements[f"const bool {flag} = false;"] = f"const bool {flag} = true;"
        replacements["const int LESSON_STAGE = 0;"] = "const int LESSON_STAGE = 2;"
        low = dict(replacements)
        low["const int LESSON_STAGE = 0;"] = "const int LESSON_STAGE = 1;"
        fixtures = [("game", "week07_traffic_light_challenge", replacements),
                    ("low", "week07_traffic_light_challenge", low)]
    for tag, name, replacements in fixtures:
        source = (ROOT / f"IOT_Introduction/examples/{name}/{name}.ino").read_text(encoding="utf-8")
        (out / f"public_{tag}.inc").write_text(source, encoding="utf-8")
        for old, new in replacements.items():
            assert source.count(old) == 1, old
            source = source.replace(old, new)
        if tag == "game":
            tone = source.replace("const bool BUZZER_USE_TONE = false;", "const bool BUZZER_USE_TONE = true;")
            (out / "missing_resistor.inc").write_text(tone, encoding="utf-8")
            if "--tone" in sys.argv:
                source = tone.replace("const int BUZZER_SERIES_OHMS = -1;", "const int BUZZER_SERIES_OHMS = 1000;")
        (out / f"enabled_{tag}.inc").write_text(source, encoding="utf-8")
    exe = out / ("checks.exe" if os.name == "nt" else "checks")
    source = TEST / f"week{week}_checks.cpp"
    if os.name == "nt":
        vcvars = find_vcvars()
        args = ["cl", "/nologo", "/std:c++17", "/EHsc", "/utf-8", "/W4", f"/I{TEST}", f"/I{out}",
                str(source), f"/Fe:{exe}", f"/Fo:{out / 'checks.obj'}"]
        if "--oled1315" in sys.argv:
            args.append("/DOLED_CONTROLLER=1315")
        command = f'call "{vcvars}" >nul && ' + subprocess.list2cmdline(args)
        result = subprocess.run('cmd /d /s /c "' + command + '"', cwd=out, capture_output=True,
                                text=True, encoding="utf-8", errors="replace", env={**os.environ, "VSLANG": "1033"})
    else:
        compiler = shutil.which("g++") or shutil.which("clang++")
        if not compiler:
            raise SystemExit("NOT RUN: C++ compiler unavailable")
        defines = ["-DOLED_CONTROLLER=1315"] if "--oled1315" in sys.argv else []
        result = subprocess.run([compiler, "-std=c++17", *defines, f"-I{TEST}", f"-I{out}", str(source), "-o", str(exe)],
                                cwd=out, capture_output=True, text=True, encoding="utf-8")
    print(result.stdout, result.stderr)
    result.check_returncode()
    run = subprocess.run([str(exe)], cwd=out, capture_output=True, text=True, encoding="utf-8")
    print(run.stdout, run.stderr)
    (out / "result.txt").write_text(run.stdout + run.stderr, encoding="utf-8")
    run.check_returncode()


if __name__ == "__main__":
    main()
