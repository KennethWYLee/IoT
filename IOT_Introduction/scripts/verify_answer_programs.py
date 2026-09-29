"""Check local program copies and their references without running firmware or services."""
from pathlib import Path
import argparse
import json
import re
import subprocess
import fitz

COURSE = Path(__file__).resolve().parents[1]
WEEKS = (2, 3, 4, 5, 6, 7, 11, 12, 14, 15)

def verify(week):
    directory = COURSE / f"docs/teaching_drafts/week{week}_answers"
    subprocess.run(["node", str(COURSE / "scripts/package_answer_programs.cjs"), "--check", str(week)], check=True, capture_output=True)
    config = json.loads((directory / "programs.sources.json").read_text(encoding="utf-8"))
    for item in config["files"]:
        file = directory / "programs" / item["destination"]
        if file.suffix in {".ino", ".cpp", ".h"}:
            code = file.read_text(encoding="utf-8")
            for header in re.findall(r'^\s*#include\s+"([^"]+)"', code, re.M):
                if header == "secrets.h":
                    assert (file.parent / "secrets.example.h").exists(), file
                else:
                    assert (file.parent / header).exists(), (file, header)
    sources = [directory / f"week{week}Ans.md", directory / "lesson.md"]
    for source in sources:
        if not source.exists():
            continue
        text = source.read_text(encoding="utf-8")
        for relative in re.findall(r"programs/[\w./-]+\.(?:ino|py|html|json|js|svg|txt|h|md)\b", text):
            assert (directory / relative).is_file(), (source, relative)
        for language, code in re.findall(r"```(\w+)\s*\n(.*?)\n```", text, re.S):
            assert not ("void setup()" in code and "void loop()" in code), source
            assert not (language == "html" and "<html" in code), source
    pdf = fitz.open(directory / f"week{week}Ans.pdf")
    for page in pdf:
        text = page.get_text()
        assert "\ufffd" not in text
        assert not ("void setup()" in text and "void loop()" in text)
    names = [str(directory / "programs" / item["destination"]) for item in config["files"]]
    result = subprocess.run(["git", "check-ignore", "--stdin"], input="\n".join(names)+"\n", text=True, capture_output=True, cwd=COURSE)
    assert result.returncode == 0 and len(result.stdout.splitlines()) == len(names), "Program files must remain ignored"
    return {"week":week, "pages":len(pdf), "files":len(names), "programs":len(config["entries"]), "copies_and_references":"pass", "uploaded":False}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("weeks", type=int, nargs="*")
    args = parser.parse_args()
    for week in args.weeks or WEEKS:
        assert week in WEEKS
        print(json.dumps(verify(week)))
