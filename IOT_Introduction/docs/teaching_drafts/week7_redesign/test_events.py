"""Run the canonical game with identical confirmed events and one changed period."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
COURSE = HERE.parents[2]
sys.path.insert(0,str(COURSE / "scripts"))
from host_compiler import find_vcvars
FAKES = COURSE / "scripts/tests/game"
OUT = HERE / "tmp/events"
OUT.mkdir(parents=True,exist_ok=True)
SOURCE = COURSE / "examples/week07_traffic_light_challenge/week07_traffic_light_challenge.ino"
source = SOURCE.read_text(encoding="utf-8")
values = {"PIN_LIGHT":4,"PIN_START":5,"PIN_FINISH":6,
          "PIN_RGB_R":7,"PIN_RGB_G":8,"PIN_RGB_B":9,
          "PIN_SDA":10,"PIN_SCL":11,"OLED_ADDRESS_7BIT":"0x3c",
          "RGB_ON_LEVEL":"HIGH","INDOOR_MIN":300,"INDOOR_MAX":320,
          "SHADE_MIN":900,"SHADE_MAX":920}
replacements = {f"const int {k} = -1;":f"const int {k} = {v};" for k,v in values.items()}
replacements["const int LESSON_STAGE = 0;"] = "const int LESSON_STAGE = 1;"
replacements["const bool LOW_POWER_PROFILE_CONFIRMED = false;"] = "const bool LOW_POWER_PROFILE_CONFIRMED = true;"
results = []
for period in (3000,5000,1500):
    enabled = source
    for old,new in replacements.items():
        assert enabled.count(old)==1,old
        enabled=enabled.replace(old,new)
    assert enabled.count("COLOR_MS=3000")==1
    enabled=enabled.replace("COLOR_MS=3000",f"COLOR_MS={period}")
    (OUT/"lesson.inc").write_text(enabled,encoding="utf-8")
    for controller in (1306,1315):
        label=f"events_{period}_{controller}"
        exe=OUT/(label+(".exe" if os.name=="nt" else ""))
        cpp=HERE/"event_checks.cpp"
        if os.name=="nt":
            args=["cl","/nologo","/std:c++17","/EHsc","/utf-8","/W3",f"/I{FAKES}",f"/I{OUT}",
                  f"/DPERIOD={period}",f"/DOLED_CONTROLLER={controller}",str(cpp),
                  f"/Fe:{exe}",f"/Fo:{OUT/(label+'.obj')}"]
            command=f'call "{find_vcvars()}" >nul && '+subprocess.list2cmdline(args)
            built=subprocess.run('cmd /d /s /c "'+command+'"',cwd=OUT,capture_output=True,text=True,errors="replace")
        else:
            cc=shutil.which("g++") or shutil.which("clang++")
            if not cc: raise RuntimeError("No host C++ compiler")
            built=subprocess.run([cc,"-std=c++17",f"-I{FAKES}",f"-I{OUT}",f"-DPERIOD={period}",
                                  f"-DOLED_CONTROLLER={controller}",str(cpp),"-o",str(exe)],capture_output=True,text=True)
        if built.returncode: raise RuntimeError(built.stdout+built.stderr)
        run=subprocess.run([str(exe)],capture_output=True,text=True)
        if run.returncode: raise RuntimeError(run.stdout+run.stderr)
        print(f"OLED_CONTROLLER={controller}\n{run.stdout.strip()}")
        results.append({"period_ms":period,"oled_controller":controller,"output":run.stdout.strip()})
report={"source_sha256":hashlib.sha256(source.encode()).hexdigest(),"results":results,
        "test_sha256":hashlib.sha256((HERE/"event_checks.cpp").read_text(encoding="utf-8").encode()).hexdigest(),
        "runner_sha256":hashlib.sha256(Path(__file__).read_text(encoding="utf-8").encode()).hexdigest(),
        "physical_test":"not performed","fixture":"test GPIO and calibration only; not approved physical wiring"}
(HERE/"event_test_results.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
