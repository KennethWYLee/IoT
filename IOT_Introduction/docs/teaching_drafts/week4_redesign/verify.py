"""Verify the maintained Week 4 Main or local Ans."""
from pathlib import Path
import json
import re
import subprocess
import sys
here = Path(__file__).resolve().parent
answers = "--answers" in sys.argv
directory = here.parent / "week4_answers" if answers else here
stem = "week4Ans" if answers else "week4_main"
md = (directory / f"{stem}.md").read_text(encoding="utf-8")
parts = list(re.finditer(r"<!-- page: (\w+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)", md))
sections = {m[1]: m[3] for m in parts}
assert len(parts) == len(sections)
manifest = json.loads((directory / "build_manifest.json").read_text(encoding="utf-8"))
if answers:
    main_md = (here / "week4_main.md").read_text(encoding="utf-8")
    main_ids = re.findall(r"<!-- page: (\w+) \|", main_md)
    assert list(sections)[:len(main_ids)] == main_ids
    assert list(sections)[len(main_ids)] == "answerindex"
    assert not manifest["sketches"]
    assert len(json.loads((directory / "programs.sources.json").read_text(encoding="utf-8"))["entries"]) == 4
    for ident in ["resistoranswer", "readinganswer", "qualityanswer", "flowanswer",
                  "answer", "timeanswer", "buildanswer"]:
        assert ident in sections, ident
        assert "{{page:" + ident + "}}" in sections["answerindex"], ident
    for intro, code, why in [("dhtstart", "dhtcode", "dhtmeaning"),
                              ("dualobserve", "dualcode", "age"),
                              ("combinetry", "button_code", "combineexplain")]:
        order = list(sections)
        assert order.index(intro) < order.index(why) and code not in order
    assert "lightArmed" not in md and "candidateSinceMs" not in md
    assert "Main 已確認的接線" not in md
    subprocess.run([sys.executable, str(directory / "check_exam_answers.py")], check=True)
else:
    assert len(parts) == 12
    assert list(sections).index("examworks") < list(sections).index("examdht")
    assert not manifest["sketches"] and "{{program:" not in md
    assert "```cpp" not in md and ".ino" not in md
    assert "475" not in md
    for label in ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"]:
        assert label in md, label
    for removed in ["程式標籤", "影片位置", "證據位置", "教師勾選", "依本課規則",
                    "按照上一頁規則", "不必重抄", "GPIO4", "GPIO5", "115200",
                    "MODULE_PROFILE_CONFIRMED", "完整基本程式", "參考解答"]:
        assert removed not in md, removed
    for goal, end, question in [("examdht", "examdht", "### Q2"),
                               ("exambdual", "exambtest", "### Q5"),
                               ("examcrecord", "examctime", "## Q6"),
                               ("examdgoal", "examdtest", "### Q7")]:
        order = list(sections)
        work = "\n".join(sections[s] for s in order[order.index(goal):order.index(end)+1])
        assert work.index("作品：") < work.index("特色：") < work.index("預期結果")
        assert work.index("預期結果") < work.index("驗證方法：") < work.index(question), goal
        assert "write-space" in work, goal
    for phrase in ["每題前一筆都是", "不要求手動重現", "由程式自動", "未知模組保持斷電",
                   "不拔帶電訊號線", "先做無聲版", "用手機展示"]:
        assert phrase in md, phrase
script = here.parents[2] / "scripts/verify_redesign.py"
subprocess.run([sys.executable, str(script), "4", *sys.argv[1:]], check=True)
