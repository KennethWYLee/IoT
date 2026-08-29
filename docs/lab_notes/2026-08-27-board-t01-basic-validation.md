# 2026-08-27 BOARD-T01 Basic Validation

- Computer／workspace: Windows；`C:\Users\User\Documents\NTUB_IoT`
- Hardware IDs: `BOARD-T01`
- Exact board／modules: YD-ESP32-S3 Type-A V1.5；ESP32-S3-WROOM-1 N16R8
- Power source／measured voltage: 筆電USB經板背`COM`接頭供電；本次未量測電壓
- GPIO and logic levels: 未接GPIO或外部模組
- Toolchain／library versions: Arduino IDE 2.3.10；Arduino CLI 1.5.1；Arduino-ESP32 3.3.11
- Firmware commit: working tree；[`week02_board_check.ino`](../../examples/week02_board_check/week02_board_check.ino)尚未commit

## Goal

確認實物板卡身分、兩個USB接頭用途、USB-to-UART下載路徑，以及N16R8的Flash與
PSRAM runtime讀值。這不是GPIO、供電腳或外部模組驗證。

## Wiring／data flow

筆電以可傳資料的USB線直接連到板背標示`COM`的USB-C接頭。板卡放在乾燥、不導電
平面，未插麵包板、杜邦線或模組。

## Checks performed

- compile: `ESP32S3 Dev Module`；QIO 80 MHz；16 MB Flash；OPI PSRAM；USB CDC
  Disabled；UART0／Hardware CDC；115200 upload；16M Flash（3MB APP／9.9MB
  FATFS）。Arduino IDE回報程式274505 bytes、全域變數21608 bytes，通過。
- upload／target: CH343 `COM8`，寫入274656 bytes，data hash驗證通過，RTS自動
  reset通過；不需手動BOOT／RST進入下載模式。
- physical behavior: Serial 115200正常；按RST後board-check重新輸出，
  `uptime_ms`從約1000重新累加。
- failure／recovery: 第一次誤選`PSRAM → Disabled`，runtime回報
  `psram_bytes=0`。改選`OPI PSRAM`並重新Verify／Upload後回報8388608 bytes。

## Evidence

```text
=== Week 2 board check ===
chip_model=ESP32-S3
chip_revision=2
cpu_mhz=240
flash_bytes=16777216
psram_bytes=8388608
status=running
uptime_ms=1018
uptime_ms=2018
uptime_ms=3018
```

## Problems and changes

採購頁將商品稱為ESP32-S3-DevKitC-1 N16R8，但實物PCB絲印為
`VCC-GND Studio`、`YD-ESP32-S3`、`Type-A-V1.5`。背面`USB`是原生USB接頭，
背面`COM`經CH343 USB-to-UART；Week 2本次使用`COM`。

`COM7`與`COM8`是這台Windows電腦當次分配的編號，不是課堂固定答案。

## Physical state after shutdown

完成本紀錄時板卡仍只以`COM`接頭連接筆電，沒有外接線路。進入GPIO接線前必須先
拔除USB。

## Next action

在實物貼上`BOARD-T01`標籤，斷電後核對GPIO4、GPIO5與GND絲印，再分別驗證候選
`PIN_BUTTON`與`PIN_TEST_OUTPUT`；完成前不公布學生GPIO profile。
