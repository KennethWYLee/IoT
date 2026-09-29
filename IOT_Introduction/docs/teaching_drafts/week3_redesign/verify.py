"""Check the exported draft and render every page for visual review."""
from pathlib import Path
import hashlib
import json
import math
import re
import subprocess
import sys
from html.parser import HTMLParser
import fitz
from PIL import Image, ImageDraw

BUILDER = Path(__file__).resolve().parent
ANSWERS = "--answers" in sys.argv
HERE = BUILDER.parent / "week3_answers" if ANSWERS else BUILDER
STEM = "week3Ans" if ANSWERS else "week3_main"
COURSE = BUILDER.parents[2]
TMP = HERE / "tmp"
TMP.mkdir(exist_ok=True)
manifest = json.loads((HERE / "build_manifest.json").read_text(encoding="utf-8"))
def sha(p):
    data = p.read_bytes()
    if p.suffix in (".md", ".cjs", ".ino"):
        data = data.replace(b"\r\n", b"\n")
    return hashlib.sha256(data).hexdigest()

assert manifest["textHashLineEndings"] == "LF"
assert sha(HERE / f"{STEM}.md") == manifest["sourceSha256"]
assert sha(BUILDER / "build.cjs") == manifest["builderSha256"]
assert sha(HERE / f"{STEM}.pdf") == manifest["pdfSha256"]
for item in manifest["sketches"]:
    assert sha(COURSE / item["path"]) == item["sha256"]
for item in manifest["photos"]:
    assert sha(COURSE / "docs/images/hardware/actual" / item["name"]) == item["sha256"]

class CodeBlocks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == "pre" and dict(attrs).get("class") == "fullcode":
            self.current = ""

    def handle_data(self, data):
        if self.current is not None:
            self.current += data

    def handle_endtag(self, tag):
        if tag == "pre" and self.current is not None:
            self.blocks.append(self.current)
            self.current = None

parser = CodeBlocks()
parser.feed((HERE / f"{STEM}.html").read_text(encoding="utf-8"))
expected = "\n".join((COURSE / item["path"]).read_text(encoding="utf-8").rstrip()
                     for item in manifest["sketches"])
assert "\n".join(parser.blocks) == expected

doc = fitz.open(HERE / f"{STEM}.pdf")
assert len(doc) == len(manifest["pages"])
ids = {p["id"]: p["number"] for p in manifest["pages"]}
all_text = "\n".join(p.get_text() for p in doc)
assert "\ufffd" not in all_text
assert "{{" not in all_text
assert "**" not in all_text
if ANSWERS:
    concept_text = doc[ids["concept"] - 1].get_text()
    for phrase in ["沒有固定數字答案", "沒遮光、遮光各記三筆", "兩組讀值", "0.8 V"]:
        assert phrase in concept_text, phrase
    assert "Q6" not in all_text
    for obsolete_requirement in ["註明感測器位置與遮光方式", "紙本 C", "紙本 D", "C 的紙本回答"]:
        assert obsolete_requirement not in all_text, obsolete_requirement
    main_manifest = json.loads((BUILDER / "build_manifest.json").read_text(encoding="utf-8"))
    main_pages = main_manifest["pages"]
    assert manifest["pages"][:len(main_pages)] == main_pages
    assert ids["answerindex"] == len(main_pages) + 1
    assert ids["answerindex"] < ids["start"] < ids["kyidentify"] < ids["adcmeaning"]
    assert ids["concept"] < ids["resistor"] < ids["conceptmeter"] < ids["metersafetyanswer"]
    assert ids["metersafetyanswer"] < ids["combinegoal"] < ids["worksheetflowanswer"] < ids["approach"]
    assert ids["snapshotwhy"] < ids["units"] < ids["sources"]
    assert all(ids[p["id"]] > ids["answerindex"] for p in manifest["pages"] if p["id"].startswith("code"))

    # Remove only filled responses; the question pages must otherwise match Main.
    page_pattern = r"<!-- page: (\w+) \| .*? -->\s*([\s\S]*?)(?=<!-- page:|$)"
    main_sections = re.findall(page_pattern, (BUILDER / "week3_main.md").read_text(encoding="utf-8"))
    answer_sections = re.findall(page_pattern, (HERE / "week3Ans.md").read_text(encoding="utf-8"))
    for (main_id, question), (answer_id, filled) in zip(main_sections, answer_sections):
        assert main_id == answer_id
        filled = re.sub(r"<style>[\s\S]*?</style>", "", filled)
        filled = re.sub(r'<p class="answer-note">[\s\S]*?</p>', "", filled)
        filled = re.sub(
            r'<div class="write-space filled-answer" style="height:(\d+)mm">[\s\S]*?</div>',
            r'<div class="write-space" style="height:\1mm"></div>', filled)
        blank = "______" if main_id == "exercise" else "__________________________"
        filled = re.sub(r'<span class="answer-ink">[\s\S]*?</span>', blank, filled)
        if main_id == "exercisemeter":
            filled = re.sub(r'<figure class="diagram">[\s\S]*?</figure>',
                            "{{diagram:worksheetdivider}}", filled)
        assert " ".join(question.split()) == " ".join(filled.split()), main_id
    for page_id in ["exercise", "exercisemeter", "worksheetsafety", "worksheetflow", "batchrecord",
                    "projectbuttonresults", "projectoledresults", "projectcaptureresults"]:
        assert "參考答案" in doc[ids[page_id] - 1].get_text(), page_id
    assert ids["combinetry"] < ids["combineexplain"]
    assert ids["quality"] < ids["resistor"] < ids["buttonprinciple"]
    assert "examreasoning" not in ids
    assert not manifest["sketches"] and not parser.blocks
    package = json.loads((HERE / "programs.sources.json").read_text(encoding="utf-8"))
    assert len(package["entries"]) == 9
    subprocess.run([sys.executable, str(COURSE / "scripts/verify_answer_programs.py"), "3"], check=True)
    assert "marking" not in ids
    assert "SAMPLE_GAP_MS" in doc[ids["busy"] - 1].get_text()
    assert "1000" in doc[ids["busy"] - 1].get_text()
    assert "先放慢" in doc[ids["busy"] - 1].get_text()
    assert ids["approach"] < ids["timing"] < ids["expected"]
    for prepare, code, why in [("shadeprepare", "shadecode", "shadewhy"),
                               ("observerprepare", "observercode", "observerwhy"),
                               ("snapshotprepare", "snapshotcode", "snapshotwhy")]:
        assert ids[prepare] < ids[why] and code not in ids
    assert ids["oledprepare"] < ids["oledscan"] < ids["observerprepare"]
    for page_id, answer_label in [("expected", "A 的程式說明"),
                                  ("observerwhy", "C 的程式說明"),
                                  ("snapshotwhy", "D 的程式說明")]:
        assert answer_label in doc[ids[page_id] - 1].get_text(), answer_label
    assert ids["projectsources"] == len(doc)
else:
    assert "answer" not in ids and "buildanswer" not in ids
    assert "start" not in ids and "sources" not in ids
    assert not manifest["sketches"] and not parser.blocks
    assert len(doc) == 13
    assert ids["batchrecord"] == ids["buildexercise"] + 1
    assert ids["exercise"] == 1
    opening_text = doc[0].get_text()
    assert (opening_text.index("作品：") < opening_text.index("預期結果：")
            < opening_text.index("驗證方法：") < opening_text.index("Q1．")
            < opening_text.index("Q2．"))
    for unclear_heading in ["程式標籤", "位置與判斷理由"]:
        assert unclear_heading not in opening_text, unclear_heading
    for actual_condition in ["沒遮光", "遮光", "第 1 筆 raw", "第 3 筆 raw", "Q2", "0.8 V"]:
        assert actual_condition in opening_text, actual_condition
    for removed_prompt in ["移開紙", "你在哪裡量", "怎麼遮住感測器", "你的讀值能用來分辨"]:
        assert removed_prompt not in opening_text, removed_prompt
    for removed_aside in ["若兩種情況出現相同讀值", "題目沒有提供", "不必重抄整張表",
                          "本題給定作品條件", "反例不在實物上操作。", "不另填重複表格"]:
        assert removed_aside not in all_text, removed_aside
    assert "在紙上把" in doc[ids["worksheetflow"] - 1].get_text()
    assert "只在紙上回答" in doc[ids["worksheetsafety"] - 1].get_text()
    for obsolete in ["400～440", "1000～1040", "三條規則", "raw=430", "raw=4095", "分界取"]:
        assert obsolete not in opening_text, obsolete
    exam_text = all_text
    for removed_field in ["黑筆插孔／紅筆插孔", "黑筆測點／紅筆測點", "批次 batch",
                          "uptime_ms", "檔名／位置", "證據位置", "短片位置", "紀錄位置"]:
        assert removed_field not in all_text, removed_field
    meter_text = doc[ids["exercisemeter"] - 1].get_text()
    for explicit_task in ["兩顆電阻連接處與 GND 之間", "1. 畫電流", "2. 算電壓", "3. 設定電表", "板上電源"]:
        assert explicit_task in meter_text, explicit_task
    assert meter_text.index("要量的位置") < meter_text.index("1. 畫電流") < meter_text.index("2. 算電壓") < meter_text.index("3. 設定電表")
    for concrete_question in ["黑色表筆的插頭", "紅色表筆的插頭", "黑色筆尖", "紅色筆尖"]:
        assert concrete_question in meter_text, concrete_question
    safety_text = "".join(doc[ids["worksheetsafety"] - 1].get_text().split())
    for concrete_location in ["A830L萬用電表", "表筆插孔", "紅色表筆的插頭", "萬用電表上標示10A的插孔",
                              "萬用電表的旋鈕", "金屬筆尖", "開發板的3V3電源腳"]:
        assert concrete_location in safety_text, concrete_location
    assert safety_text.index("同學目前的接法") < safety_text.index("為什麼仍應阻止")
    record_text = doc[ids["batchrecord"] - 1].get_text()
    assert "重新量測" in record_text and "複製第一筆" in record_text
    assert "自己的程式" in record_text and "什麼時候執行" in record_text
    for copied_requirement in ["後兩筆是誰決定", "用一句話記下這次實際觀察"]:
        assert copied_requirement not in record_text, copied_requirement
    assert "第 1 筆光敏數值" not in all_text
    assert "兩筆相隔約一秒" in record_text
    for removed_page in ["examreadings", "examflowchecks", "buildresults", "batchchecks", "buttonrecord",
                         "oledrecord", "capturerecord", "capturechecks"]:
        assert removed_page not in ids, removed_page
    assert "Q6" not in all_text
    for question in ["Q1", "Q2", "Q3", "Q4", "Q5-1", "Q5-2"]:
        assert question in all_text, question
    assert "用手機展示" in opening_text
    for hidden_prerequisite in ["依本課規則", "本課程式會顯示", "以 button_light_capture 為起點",
                                "使用本週「按一下，記錄一筆光線」的作品回答"]:
        assert hidden_prerequisite not in exam_text, hidden_prerequisite
    assert ids["exercisemeter"] == ids["exercise"] + 1
    assert "examtools" not in ids
    assert ids["projectintro"] == ids["worksheetflow"] + 1
    assert ids["buildexercise"] == ids["projectintro"] + 1
    intro_text = doc[ids["projectintro"] - 1].get_text()
    for introductory_context in ["先做 A", "三個延伸作品 B、C、D", "分開展示", "驗證方法", "最後回答題末問題"]:
        assert introductory_context in intro_text, introductory_context
    sample_text = doc[ids["buildexercise"] - 1].get_text()
    for sample_requirement in ["取一筆", "電腦新增三行", "5000", "5200", "5400", "三筆數字也可能相同", "不在之後補做"]:
        assert "".join(sample_requirement.split()) in "".join(sample_text.split()), sample_requirement
    for test_stage in ["正式間隔", "暫時放慢", "恢復 0.2 秒", "每列分開測試"]:
        assert test_stage in record_text, test_stage
    practical_text = opening_text + "\n".join(
        doc[i].get_text() for i in range(ids["buildexercise"] - 1, len(doc))
    )
    for setup_detail in ["YD-ESP32", "N16R8", "GPIO4", "GPIO5", "SDA", "SCL",
                         "115200", "SSD1315", "0x3C", "three_light_samples",
                         "器材條件", "材料與條件", "Espressif"]:
        assert setup_detail not in practical_text, setup_detail
    for safety_condition in ["拔 USB", "不通電試錯", "換程式前先拆外接線"]:
        assert safety_condition in practical_text, safety_condition
    for answer_phrase in ["720", "完整基本程式", "參考答案", "中間相對 GND 的理想電壓為 3.0 V"]:
        assert answer_phrase not in exam_text, answer_phrase
    assert "worksheet" not in ids and "submission" not in ids
    assert ids["exercise"] < ids["exercisemeter"] < ids["worksheetsafety"] < ids["worksheetflow"] < ids["buildexercise"]
    project_ids = ["projectbutton", "projectbuttonresults", "projectoled",
                   "projectoledresults", "projectcapture", "projectcaptureresults"]
    assert [ids[name] for name in project_ids] == sorted(ids[name] for name in project_ids)
    for goal, results in [("projectbutton", "projectbuttonresults"),
                          ("projectoled", "projectoledresults"),
                          ("projectcapture", "projectcaptureresults")]:
        assert ids[results] == ids[goal] + 1
    assert ids["projectcaptureresults"] == len(doc)
    button_question = doc[ids["projectbuttonresults"] - 1].get_text()
    assert "比較方向與分界數字" in button_question and "Q1" in button_question
    for goal, results, question in [
        ("buildexercise", "batchrecord", "A．你的程式如何完成三次取樣？"),
        ("projectbutton", "projectbuttonresults", "B．你的程式如何判斷現在被遮住？"),
        ("projectoled", "projectoledresults", "C．你的程式如何保留最小值與最大值？"),
        ("projectcapture", "projectcaptureresults", "D．你的程式如何分開更新目前值與保存值？"),
    ]:
        work_text = doc[ids[goal] - 1].get_text() + doc[ids[results] - 1].get_text()
        assert work_text.index("作品：") < work_text.index("預期") < work_text.index(question), goal
        assert work_text.index("特色：") < work_text.index("驗證方法：") < work_text.index(question), goal
        assert all_text.count(question) == 1, question
    for removed_copying in ["目前 RAW：", "哪個動作才會換掉 LAST", "剛才發生過什麼變化"]:
        assert removed_copying not in all_text, removed_copying
    for administrative_text in ["教師勾選", "提早離開", "交回指定練習", "教師確認", "本次負責", "主要測試者"]:
        assert administrative_text not in all_text, administrative_text
    project_text = "\n".join(doc[ids[name] - 1].get_text() for name in project_ids)
    for label in ["RUNNING", "PAUSED", "RAW", "MIN", "MAX", "LAST", "SAVED"]:
        assert label in project_text, label
    for implementation in ["digitalRead(", "analogRead(", "void setup(",
                           "void loop(", "Wire.begin(", "u8g2."]:
        assert implementation not in all_text, implementation
    assert "SAMPLES_PER_PRESS" not in all_text
    assert "batch_busy" not in expected
    assert "只修改" not in doc[ids["buildexercise"] - 1].get_text()
    for private_sketch in ["shade_counter.ino", "light_observer.ino", "light_snapshot.ino"]:
        assert private_sketch not in all_text
    for word in ["現在先把", "公式等", "本課舊紀錄", "這是舊", "下一頁才"]:
        assert word not in all_text, word
for page in doc:
    for link in page.get_links():
        assert "week3_answers" not in link.get("uri", "") or ANSWERS
if ANSWERS:
    destinations = {}
    for page in doc:
        for link in page.get_links():
            if link.get("nameddest"):
                destinations[link["nameddest"]] = link["page"] + 1
    for name, page_number in destinations.items():
        assert page_number == ids[name]
    for item in package["entries"]:
        assert item["file"].split("/")[-1] in all_text, item["file"]
assert math.isclose(3.3 * 1000 / 11000, 0.3)
assert math.isclose(3.3 * 10000 / 11000, 3.0)
assert math.isclose(3.3 / 11000, 0.0003)
assert math.isclose(3.3 / 330, 0.01)
assert (320 + 900) // 2 == 610

# Check source phrasing as well as extracted PDF text; line wrapping is irrelevant here.
source_text = (HERE / f"{STEM}.md").read_text(encoding="utf-8")
for ambiguous_command in ["紅筆插 10A", "黑筆 COM", "紅 e15、黑 e3", "黑 e3、紅 e23", "按 RST", "COM USB", "SDA8", "SCL9"]:
    assert ambiguous_command not in source_text, ambiguous_command
if ANSWERS:
    for explicit_location in ["電表 COM 插孔", "電表 VΩmA 插孔", "麵包板孔位", "標示 COM 的 USB 接頭", "通訊速率", "電表旋鈕"]:
        assert explicit_location in source_text, explicit_location

# Breadboard connectivity is independently represented by (bank, row).
def node(hole):
    return ("left" if hole[0] in "abcde" else "right", int(hole[1:]))

assert node("a3") == node("e3") != node("a6")
assert node("a15") == node("c15") == node("e15")
assert node("c23") == node("d23") == node("e23")
assert node("c20") != node("c23")
assert node("d23") != node("d26")
assert node("a15") != node("f15")

# Render with Poppler; text extraction above checks a different property.
poppler = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe"
if not poppler.exists():
    raise RuntimeError("Poppler renderer not found")
subprocess.run([str(poppler), "-scale-to", "1250", "-png",
                str(HERE / f"{STEM}.pdf"), str(TMP / "page")], check=True)
rendered = []
for i, page in enumerate(doc):
    assert abs(page.rect.width - 595.28) < 1
    assert abs(page.rect.height - 841.89) < 1
    assert len(page.get_text().strip()) > 100
    out = TMP / f"page-{i+1:0{len(str(len(doc)))}d}.png"
    assert out.exists()
    rendered.append(out)

for start in range(0, len(rendered), 8):
    sheet = Image.new("RGB", (1160, 860), "#dde3e5")
    draw = ImageDraw.Draw(sheet)
    for j, filename in enumerate(rendered[start:start+8]):
        im = Image.open(filename)
        # Use individual PNGs for detailed review after scanning these contact sheets.
        im.thumbnail((277, 390))
        x = 15 + (j % 4) * 290
        y = 28 + (j // 4) * 425
        sheet.paste(im, (x, y))
        draw.text((x, y - 20), f"Page {start+j+1}", fill="black")
    sheet.save(TMP / f"review-{start//8+1:02}.png")

result = {
    "pages": len(doc),
    "exercise_page": ids.get("exercise"),
    "answer_page": ids.get("answer"),
    "hands_on_exercise_page": ids.get("buildexercise"),
    "hands_on_expected_results_page": ids.get("buildresults"),
    "hands_on_answer_page": ids.get("buildanswer"),
    "source_hashes": "pass",
    "program_files_match_canonical_sources": "pass" if ANSWERS else "not applicable",
    "page_dimensions_text_and_placeholders": "pass",
    "circuit_arithmetic_and_node_checks": "pass",
    "rendered_pages": len(rendered),
    "physical_test": "not performed",
}
(TMP / "verification.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result))
