# 2026-09-15 Notebook PDF匯出

## 範圍

教師要求所有ipynb附PDF並commit、push。開始版本為`1b4693b`；Git追蹤範圍共有第2～7週六份notebook。
原notebook、Arduino程式及教學內容未改；同目錄新增同名PDF，課程首頁新增下載連結。
PDF保留原本「完整備課版（含參考解答）」標示，不是移除答案的學生版。

## 匯出方式

使用`export_notebook_pdfs.cjs`將已保存的文字、圖片、表格及程式轉成A4 PDF，不執行cell。
正文10.5 pt、程式8.3 pt，含頁碼、章節書籤與連結；外部文件連結指向GitHub，圖片嵌入PDF。
依賴及重建指令見[工具說明](../../scripts/README.md#notebook-pdf-exports)。
`notebook_pdf_manifest.json`保存來源、圖片、匯出器及PDF的SHA-256供過期檢查；文字雜湊統一換行格式。
本機以Microsoft Edge 153匯出、Microsoft JhengHei顯示中文，Poppler渲染頁面，PyMuPDF擷取文字與邊界。

## 檢查結果

| 週次 | PDF頁數 | 圖片數 |
|---:|---:|---:|
| 2 | 60 | 23 |
| 3 | 77 | 26 |
| 4 | 51 | 32 |
| 5 | 29 | 22 |
| 6 | 31 | 31 |
| 7 | 38 | 36 |
| 合計 | 286 | 170 |

- 六份PDF文字區塊比對、圖片數、頁面文字邊界、無空白頁與無替代字元檢查通過。
- 全部286頁已渲染；抽查各週縮圖、表格及程式細節，未見裁切、重疊或缺字。不是逐頁人工校對教學內容。
- 六份均有章節書籤；PDF連結中無本機file、about或attachment網址。
- PDF過期檢查、Week 2～7既有notebook檢查、全課結構與本機連結、Git差異格式檢查通過。
- 週資料夾檢查改為允許並要求notebook及同名PDF，其餘教材檢查仍保留。
- 圖片較多，單份PDF約10～15 MiB；GitHub預覽若受限，可下載後離線開啟。

## 限制與發布

不重新編譯韌體、不上傳、不操作序列埠或硬體，不改動舵機待驗狀態。
生成器、PDF、雜湊清單、導覽、檢查工具及本紀錄納入此次授權提交；實際提交與推送結果以Git紀錄為準。
本機執行資料庫保留未動、不提交。HTML、逐頁PNG、縮圖及QA暫存位於忽略目錄`_outputs/notebook_pdfs/`。
