# 2026-08-29 BOARD-T01 GPIO4／GPIO5候選profile測試

## 測試目的

確認YD-ESP32-S3 Type-A V1.5實物板上的GPIO4與GPIO5是否可分別作為Week 2按鈕
輸入及HIGH／LOW量測輸出。完成所有target test前，兩者仍是候選值，不公布為正式
學生profile。

## 實物與接線

- 板卡：BOARD-T01，ESP32-S3-WROOM-1 N16R8。
- USB：板背標示`COM`的USB-C接頭；先前列舉為CH343 COM8。
- 按鈕：一顆已完成跨組通斷抽測的6×6 mm四腳輕觸按鈕，跨麵包板中央溝槽，
  左側腳位於`e27`與`e29`。
- 棕色公對母：板上方GND至`a22`。
- 紅色公對母：候選GPIO4至`a27`。
- 橘色公對母：候選GPIO5至`a20`。
- 公對公：`b22`至`a29`，把TPG分接到按鈕第29列接點組。
- TPG：第22列左半部；TPO：第20列左半部。

## 已完成

1. 完全斷電時，黑表筆接`c22`、紅表筆接`b27`：放開按鈕不蜂鳴、按住蜂鳴、
   再次放開恢復不蜂鳴。
2. 完全斷電時，黑表筆接`c22`、紅表筆接`b20`：沒有蜂鳴，未量到TPO對TPG的
   低阻抗短接。
3. 將A830L切到`OFF`並移開表筆後，從`COM` USB-C接頭帶線上電；`PWR`燈亮，
   五秒內沒有焦味、煙或異常聲音。隨後可見`TX`指示燈週期性閃爍，與舊的
   board-check韌體持續傳送Serial資料的預期相符。
4. Arduino IDE的Port選單只顯示COM名稱，未顯示完整CH343名稱；選取該Port並以
   `115200 baud`開啟Serial Monitor後，連續讀到`uptime_ms=292018`至
   `uptime_ms=302018`，相鄰值約增加1000 ms。這反向確認選到本板Serial Port，
   並確認本次帶線上電時舊board-check韌體仍正常傳送。
5. 建立`week02_gpio4_gpio5_candidate_test.ino`，候選值為GPIO4按鈕輸入與GPIO5
   測試輸出。Repository端以Arduino-ESP32 3.3.11、16 MB Flash、OPI PSRAM及
   3 MB application partition完成CLI compile；Arduino IDE端Verify亦通過，回報
   程式使用302598／3145728 bytes（9%），全域變數使用22136／327680 bytes（6%）。
   IDE數字作為本次實際操作紀錄，不當作學生固定答案；尚未Upload。
6. 使用者執行後續Upload步驟後回報沒有異味，`PWR`持續亮，`TX`與`RX`未亮。
   候選程式閒置時不週期傳送，因此此LED狀態本身不構成故障；尚待Upload Output
   及RST後Serial文字確認新韌體已實際寫入與啟動。
7. 隨後取得完整Upload Output：寫入302752 bytes（傳輸壓縮後174314 bytes），
   15.5秒完成，回報156.6 kbit/s；`Hash of data verified`通過，並由RTS自動Reset。
   因此候選韌體寫入層次通過，尚待Serial啟動文字及GPIO功能測試。
8. 以115200 baud開啟Serial Monitor並短按板上RST後，實際讀到候選測試標題、
   `pin_button=4 mode=INPUT_PULLUP`、`pin_test_output=5 startup=LOW`及
   `status=ready expected_released_input=HIGH output=LOW`。候選韌體啟動層次通過；
   這些文字是程式設定與預期狀態，尚不能取代按鈕事件或GPIO5實測電壓。
9. 第一次實際按下與放開分別得到`pressed=true input=LOW output=HIGH
   time_ms=104914`及`pressed=false input=HIGH output=LOW time_ms=105096`。一次操作
   只產生一組事件，穩定事件相差182 ms；GPIO4候選輸入首次事件測試通過。輸出欄位
   只表示程式命令，尚未完成GPIO5電壓量測，且仍需另外完成重複性測試。
10. 再完成四次按下／放開，穩定事件時間分別為227156／228344、
    229836／230839、232135／233159、234757／235947 ms；加上第一次共五次，
    每次都只有一筆按下LOW與一筆放開HIGH，未見重複、漏失或卡住。GPIO4候選輸入
    五次重複性通過；GPIO5仍待實測電壓。

## 尚未完成

- GPIO4的`INPUT_PULLUP`已完成五次放開HIGH／按下LOW／再放開HIGH事件驗證。
- 尚未驗證GPIO5的LOW／HIGH輸出與實測電壓。
- 尚未完成GPIO5電壓、Reset安全狀態與故障排查。

依2026-08-29課程範圍決定，以上尚未完成項目不再列為Week 2學生收尾條件；
它們移到Week 3感測器接線前，以自動LOW／HIGH循環程式及萬用電表接續驗證。

目前只能標示為「上電前接線、第一次供電與Serial基準通過」，不能標示GPIO
profile通過。
