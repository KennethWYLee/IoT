# Week3 Ans PDF 的 GitHub 發布

## 授權與範圍

2026-09-30 教師要求：「幫我把 week3 的 ans 傳到 github，commit and push」。
本次授權僅擴大到 Week3 Ans PDF，不包含答案維護來源、完整程式、其他週答案、
執行資料或尚在修改的 Week1。此次沒有更新雲端。

- 公開位置：`IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf`。
- 內容：86 頁，前 13 頁依 Main 原卷填答，其後逐題教學；包含分壓推導及 OLED 實物標字說明。
- PDF 維護來源與原輸出仍在本機 `docs/teaching_drafts/week3_answers/`，沿用原忽略規則。
- 公開 PDF 與已核對的本機 PDF 完全相同，沒有重新排版或修改題目。
- 根目錄及課程 README 加上答案連結，記錄此份 PDF 的公開例外。

## 驗證

在 `c6cadc8` 之後準備本次提交；先 fetch 確認本機 main 與 origin/main 相同。
以 `week3_redesign/verify.py --answers` 驗證：

- 來源、產生器、圖片與 PDF 雜湊符合既有建置紀錄。
- 前 13 頁題目與 Main 一致，填答與逐題教學順序、程式檔名引用通過。
- 分壓數值及麵包板連接模型檢查通過。
- 全部 86 頁以 Poppler 渲染；逐張查看 11 張總覽，另看第 2 頁分壓填答及第 71 頁 OLED 標字全頁圖，未見裁切或重疊。
- PDF 無 `file:` 或本機檔案連結；程式僅以檔名指示，並未內嵌完整程式。
- 本機九份程式的封裝與引用核對通過，但不加入此次提交。

驗證程式原先要求 Q3 頁必含「參考答案」四字，但現稿已直接在原卷圖表中填答。
本次只修正此檢查，改核對 Q3 的電流、電壓式、電表插孔、量程與接地答案，沒有放寬題目對應檢查。

公開 PDF 的 SHA-256：

```text
74f7af6f0a64dc22a5c68e2301627251da7c8426dd7e9df4748397b0f42fd642
```

此次未重新編譯程式、上傳韌體或進行實體測試。Git 提交僅包含上述 PDF、
兩份入口 README、本紀錄與驗證程式修正；不以 `git add .` 加入其他工作。

## 後續維護

日後更新此份 Ans，先修改原本的私有維護來源，以
`node IOT_Introduction/docs/teaching_drafts/week3_redesign/build.cjs --answers`
重新建置及驗證。獲得發布授權後，再將 `week3_answers/week3Ans.pdf`
複製到本次公開位置，核對兩份 SHA-256 相同後才提交及推送。
Git 不含私有來源，因此公開 clone 本身不能重建 Ans；學生可直接閱讀公開 PDF。

本次 push 後須比對遠端分支 commit，並從公開 GitHub 下載 PDF 回讀上述 SHA-256；
這兩項檢查完成後才回報發布成功。
