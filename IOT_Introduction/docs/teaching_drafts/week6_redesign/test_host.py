"""Exercise actual lesson sources with existing host fakes; never flash hardware."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
COURSE = HERE.parents[2]
sys.path.insert(0, str(COURSE / "scripts"))
from host_compiler import find_vcvars

FAKES = COURSE / "scripts/tests/game"
OUT = HERE / "tmp/host"
OUT.mkdir(parents=True, exist_ok=True)
source = (HERE / "serial_pointer_counter/serial_pointer_counter.ino").read_text(encoding="utf-8")
preview = (HERE / "count_preview/count_preview.ino").read_text(encoding="utf-8")
values = {"PIN_SERVO": 7, "PIN_STOP": 10, "SERVO_HZ": 50,
          "SERVO_MIN_US": 1000, "SERVO_MAX_US": 2000,
          "SAFE_MIN_ANGLE": 30, "SAFE_MAX_ANGLE": 150,
          "ZERO_ANGLE": 30, "SIX_ANGLE": 150,
          "PIN_SDA": 8, "PIN_SCL": 9, "OLED_ADDRESS_7BIT": "0x3c"}
replacements = {f"const int {k} = -1;": f"const int {k} = {v};" for k,v in values.items()}
for flag in ("SERVO_PROFILE_CONFIRMED", "POWER_AND_FIXTURE_CONFIRMED", "STOP_PROFILE_CONFIRMED",
             "WITH_OLED", "OLED_PROFILE_CONFIRMED"):
    replacements[f"const bool {flag} = false;"] = f"const bool {flag} = true;"

def build_run(cpp, defines, label):
    exe = OUT / (label + (".exe" if os.name == "nt" else ""))
    if os.name == "nt":
        args = ["cl", "/nologo", "/std:c++17", "/EHsc", "/utf-8", "/W3",
                f"/I{FAKES}", f"/I{OUT}", *[f"/D{v}" for v in defines], str(cpp),
                f"/Fe:{exe}", f"/Fo:{OUT / (label+'.obj')}"]
        command = f'call "{find_vcvars()}" >nul && ' + subprocess.list2cmdline(args)
        result = subprocess.run('cmd /d /s /c "' + command + '"', cwd=OUT,
                                capture_output=True, text=True, errors="replace")
    else:
        cc = shutil.which("g++") or shutil.which("clang++")
        if not cc:
            raise RuntimeError("No host C++ compiler")
        result = subprocess.run([cc,"-std=c++17",f"-I{FAKES}",f"-I{OUT}",
                                 *[f"-D{v}" for v in defines],str(cpp),"-o",str(exe)],
                                capture_output=True,text=True)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)
    run = subprocess.run([str(exe)], capture_output=True, text=True)
    if run.returncode:
        raise RuntimeError(run.stdout + run.stderr)
    print(run.stdout.strip())
    return run.stdout.strip()

results = []
for step in (1,2):
    public = source
    if step == 2:
        old = "c=char('0'+count+(c=='+'?1:-1));"
        assert public.count(old) == 1
        public = public.replace(old,"int next = count + (c == '+' ? 2 : -2);\n"
                                "    if (next > 6) next = 6;\n"
                                "    if (next < 0) next = 0;\n"
                                "    c = char('0' + next);")
    enabled = public
    for old,new in replacements.items():
        assert enabled.count(old) == 1, old
        enabled = enabled.replace(old,new)
    (OUT / "public_pointer.inc").write_text(public,encoding="utf-8")
    (OUT / "enabled_pointer.inc").write_text(enabled,encoding="utf-8")
    (OUT / "preview.inc").write_text(preview,encoding="utf-8")
    for controller in (1306,1315):
        defs = [f"STEP={step}",f"OLED_CONTROLLER={controller}"]
        results.append(build_run(HERE/"checks.cpp",defs,f"counter_{step}_{controller}"))
        results.append(build_run(FAKES/"week6_checks.cpp",defs,f"regression_{step}_{controller}"))

report = {"results":results,"physical_test":"not performed",
          "source_sha256":hashlib.sha256(source.encode()).hexdigest(),
          "test_values":"host fixtures only, not approved physical settings"}
(OUT / "results.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
