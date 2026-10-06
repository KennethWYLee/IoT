# Week4 教材設計原則整理與發布

## 範圍

2026-10-06，教師要求整理現行 Week4 的教學方式，供後續各週修訂使用，之後明確授權 commit、push 與雲端更新。

修改三份維護文件：

- [每週教材設計框架](../course_materials/weekly_lesson_design_framework.md)：整理 Main／Ans／program 分工、作品由簡到深、先接線與操作再解釋、新元件用途、概念說明、反例與驗證，附可重用修訂指令。
- [教材設計與維護入口](../course_materials/README.md)：分清現行教材與歷史 notebook 來源，避免使用舊生成器覆蓋新版。
- [教材修訂準則](../teaching_drafts/week2_redesign/revision_guidelines.md)：連到現行框架，保留舊決定供追溯，不恢復已失效安排。

沿用的是作品與閱讀安排，不是把 DHT、CSV、警報、四件大型作品或 OLED／Serial 擇一強加到每週。Week4 Q3 只在裝置計次、計時及確認；CSV、報告與電腦分析回傳屬於 Q4。

未修改學生 Main／Ans PDF、程式、課程進度、採購或評分，也未操作硬體。本機 PROJECT 只記錄決策與發布證據，不提交或上傳。

## 檢查

- 對照現行 Week4 Main、Ans、程式入口及正式課程計畫，清理舊版互相矛盾的要求。
- 全課文件結構與本機連結檢查通過；差異檢查無空白錯誤，僅有既有 LF／CRLF 轉換提示。
- 本次只有維護文件改動，沒有重建 PDF、重新編譯、模擬或實機測試，不把文件通過當作學生試做成功。
- 既有 Week4 範例修改、Windows 測試筆記及根目錄 examples 保留；前兩份檔案雜湊未變，不納入提交。

## 雲端與 Git

雲端沿用既有「課堂教材／IoT／IOT_Introduction」，新增 docs/course_materials 及 docs/teaching_drafts/week2_redesign，保存上述三份 Markdown 原始檔。上傳後讀回全部原始內容，SHA-256 與本機逐檔一致；父目錄核對正確，新文件未共享，沒有變更既有分享權限。

Git 起點為 ee86a6f，遠端仍為既有 Public KennethWYLee/IoT。只提交上述三份文件與本紀錄；私有答案來源、其他週程式、個資、憑證及無關工作不加入。本輪 Git 推送、遠端版本及內容核對結果記錄於本機 PROJECT，雲端回讀不代替 Git 推送驗證。

本次不表示其他週已依這份框架重寫；後續須指定修改範圍，發布仍依教師當次授權。
