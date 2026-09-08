"""Compile Week 4-7 public and test-enabled profiles. Never upload or access a port."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

from verify_markdown_arduino import find_cli, FQBN, ROOT


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config-file", type=Path, help="Optional isolated Arduino CLI configuration")
    args = parser.parse_args()
    cli = [find_cli()]
    if args.config_file:
        cli += ["--config-file", str(args.config_file.resolve())]
    out = ROOT / "_outputs/profile_compile"
    out.mkdir(parents=True, exist_ok=True)
    (out / "results.json").write_text("[]\n", encoding="utf-8")
    cases = []
    for week, name, fixture in [
        (4, "week04_dual_sensor_alarm", "dual"),
        (5, "week05_rgb_oled_timer", "timer"),
        (6, "week06_servo_pointer", "pointer"),
        (7, "week07_traffic_light_challenge", "game"),
    ]:
        public = (ROOT / f"IOT_Introduction/examples/{name}/{name}.ino").read_text(encoding="utf-8")
        cases.append((f"week{week}_public", public, 1306))
        for tone in ([False, True] if week in (4, 7) else [False]):
            host = [sys.executable, str(ROOT / "IOT_Introduction/scripts" /
                    ("verify_week4_host.py" if week == 4 else "verify_game_host.py"))]
            if week != 4:
                host.append(str(week))
            if tone:
                host.append("--tone")
            for oled in ([1306] if week == 4 else [1306, 1315]):
                tag = f"week{week}_{'tone' if tone else 'level'}_{oled}"
                run = subprocess.run(host + (["--oled1315"] if oled == 1315 else []), cwd=ROOT,
                                     stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
                (out / f"{tag}_host.log").write_bytes(run.stdout)
                run.check_returncode()
                enabled = (ROOT / f"_outputs/week{week}_host/enabled_{fixture}.inc").read_text(encoding="utf-8")
                cases.append((tag, enabled, oled))
    versions = {}
    for kind in ("core", "lib"):
        versions[kind] = subprocess.check_output(cli + [kind, "list"], text=True, encoding="utf-8")
    (out / "versions.json").write_text(json.dumps(versions, indent=2), encoding="utf-8")
    results = []
    active = out / "active_profile"
    active.mkdir(parents=True, exist_ok=True)
    for tag, source, oled in cases:
        sketch = out / "sketches" / tag
        sketch.mkdir(parents=True, exist_ok=True)
        configured = f"#define OLED_CONTROLLER {oled}\n" + source
        (sketch / f"{tag}.ino").write_text(configured, encoding="utf-8")
        # Keep library/core cache stable; the controller define belongs only to the sketch.
        (active / "active_profile.ino").write_text(configured, encoding="utf-8")
        run = subprocess.run(cli + ["compile", "--fqbn", FQBN, "--build-path",
                             str(out / "build"), str(active)],
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        (out / f"{tag}_compile.log").write_bytes(run.stdout)
        results.append({"case": tag, "exit_code": run.returncode, "fqbn": FQBN})
        (out / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f"{'PASS' if run.returncode == 0 else 'FAIL'} compile {tag}", flush=True)
        run.check_returncode()
    print(f"PASS {len(results)} ESP32-S3 compiles; host logs and versions in {out}; no upload.")


if __name__ == "__main__":
    main()
