# Week6：舵機、倒數與環境提示

2026-10-12 教師確認四題：Q1 按鈕三位置紙指針、Q2 十秒倒數翻牌、Q3 光線自動指針、Q4 光敏與溫濕度的環境警示。每題交代元件用途、預期行為與實物驗證。OLED 是命令，不是位置量測；外接供電、共地、安全行程、STOP、30秒停止及人工關電要求保留。

維護 Main 在本目錄，Ans／生成器／四支程式在私有 `../week6_answers`。舊版保存在 `../archives/week6_before_20261012`；舊 temperature_pointer 不是現行題目。

```powershell
node -e "require('./IOT_Introduction/docs/teaching_drafts/week6_answers/generate_artifacts.cjs').generate(6)"
node IOT_Introduction/scripts/package_answer_programs.cjs 6
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs --answers
python IOT_Introduction/scripts/verify_cumulative_lesson.py 6 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 6 --answers --render
```

建置需要 Node 的 marked、playwright、Edge、Microsoft JhengHei；可從 Codex bundled runtime 的 NODE_PATH 載入套件。Week6 有獨立建置器，不改其他週的共同建置器。PDF 逐頁核對邊界、圖、字型與來源雜湊，輸出到本週正式目錄；程式複本另核對清單。

[動畫總覽](../../../Week_06_Servo_Pointer/animations/README.md)左邊固定完整步驟，箭頭標示目前步驟；右邊顯示按鈕、外接電源、紙指針示意與原程式OLED文字。模擬輸入由主機重播四支程式，不是實物錄影；安全行程測試值不提供學生直接套用。

2026-10-14 教師授權提前更新 Week6、7：本週 Main 補 A4 白紙與不透光紙準備，GitHub 發布 Main 與四題動畫；Ans 與程式仍由教師在課堂提供。教師雲端更新完整 Main、Ans、程式與動畫。編譯、主機及動畫核對不等於實物供電、行程或停止已驗證。
