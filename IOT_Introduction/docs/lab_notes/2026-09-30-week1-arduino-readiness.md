# Week 1 Arduino setup and GitHub release

Date: 2026-09-30

## Scope

The instructor requested Arduino and ESP32 setup in Week 1, followed by GitHub
publication. Week 1 remains a Markdown lesson, not a new exam or PDF.
The maintained lesson is [week1_main.md](../../Week_01_Course_Orientation/week1_main.md).
The public sketch is [hello_first.ino](../../../program/week1/hello_first/hello_first.ino).
Cloud storage is not updated by this release.

## Changes

- Explain IDE installation, Espressif board package 3.3.11, the approved board's
  nine Tools settings, the physical COM connector, and the computer's Port.
- Guide saving, compiling, uploading, Serial Monitor, changing text and timing,
  and distinguishing a saved file from the program running on the board.
- Keep USB-only operation, safety before power, and troubleshooting beside the
  relevant workflow. Students without boards install and compile first, then
  finish physical upload at the start of Week 2. Procurement deadlines are unchanged.
- Replace the stale reference to Week 2 answer pages with complete Week 1 steps.
  Update the course-plan rows, navigation, and photo-catalog introduction.
- Publish the existing Hello sketch through the approved-week program sync;
  retain one same-named Arduino sketch folder and `.ino`, not an archive.
- Preserve assessment weights, other-week content, purchasing quantities and costs.

## Week 2 prerequisite check

Week 1 establishes software operation, first upload, reading output, basic
`setup()` / `loop()` structure, and saving versus uploading. It does not claim
students already know every Week 2 answer.

| Week 2 task | Instruction still needed before answering |
|---|---|
| Q1 continuity | Meter sockets and mode, connected breadboard holes, button contacts |
| Q2 button display | GPIO input, ground, pull-up, button reading and `if` |
| Q3 voltage and current | Normal circuit, named measurement points, resistor/current relation before paper counterexamples |
| Q4 counter | Stored variables, repeated reads, adding/subtracting and reset |
| Q5 attendance counter | Short/long presses, debounce, bounds and simultaneous buttons |

These remain Week 2 teaching responsibilities. The question-first Main format
does not authorize an untaught cold exam. No extra submission is introduced.

## Evidence and limitations

- Setup checked against the existing Week 2 setup source and BOARD-T01 records;
  primary references are linked beside the instructions in the lesson.
- The lesson's full Hello block and the public `.ino` must match the existing
  canonical Hello sketch after line-ending normalization.
- `node IOT_Introduction/scripts/verify_intro_navigation.cjs --render` checks
  navigation, settings consistency, procurement totals, local images, and
  desktop/mobile rendering at 1200 and 420 pixels.
- `node IOT_Introduction/scripts/sync_public_programs.cjs 1 3 --check` checks
  the approved public sketch copies without changing Week 3.
- Generated review HTML and screenshots remain under ignored `_outputs`.
- This publication does not rerun Arduino target compilation, install software
  on a student's computer, flash firmware, or physically test any board.
  Expected Serial output is explicitly illustrative, not a new measurement.
- GitHub publication must be verified against the remote commit and downloaded
  lesson/sketch content. Unrelated Week 4 and private example changes are excluded.
