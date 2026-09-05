# 2026-09-05 KY-018 resistance and voltage-divider walkthrough

- Computer／workspace: Windows, NTUB_IoT.
- Hardware: KY018-T01, the photographed KY-018-compatible module; A830L multimeter.
- Previous board: BOARD-T01, not powered for this resistance experiment.
- Source baseline: Git commit `b95c59c`; no firmware was uploaded during the initial
  resistance segment. A later instructor-reported ADC candidate Upload is recorded
  in the final section below; it is not an ADC functional pass.
- Previous segment: [Week 3 guided walkthrough](2026-08-30-week3-guided-walkthrough.md).
- Evidence source: instructor's text reports in the guided conversation. This segment
  has no new meter-display photo, automated acquisition, or independent agent measurement.
- Audience: maintenance and cross-session handoff, not a second student guide.

## Goal and initial state: resistance and paper examples

Identify which isolated module-terminal pairs behave like a fixed resistor, a
photoresistor, and their series sum. Explain the logic and expected behavior before
asking for measurements. Continue with paper voltage-divider examples, without
claiming that the KY-018 has already been powered or read by the ESP32 ADC at that
stage. The later powered voltage measurement is recorded separately below.

USB remained disconnected during the instructed resistance measurements. The module
was not connected to the ESP32 or breadboard. Black meter lead: `COM`; red meter
lead: `VΩmA`. Each module terminal had a separate female-to-male extension; free male
ends were kept apart. The colors below record this specific setup only:

| Module terminal | Walkthrough wire | Electrical role before testing |
|---|---|---|
| Standalone `S` | Yellow | Labeled signal terminal; resistor relationship to be checked |
| Unlabeled middle header pin | Orange | Supply candidate only; not yet powered |
| Standalone `-` | Green | Reference-ground candidate, based on marking and reference design |

The revised student text calls the unlabeled middle header pin `M` for recording;
this is not a PCB label or proof that it is the electrical midpoint. Previous
orange/yellow board-extension uses were not part of this isolated module test.

The retained, separate board test-point setup was last reported as `3V3→a6`, with
an extension at `e6`, and `GND→a3`, with an extension at `e3`. It was unpowered and
did not participate in the resistance measurements.

## Raw reports and bounded interpretation

The table preserves spoken digits without adding missing decimal places. Range
entries distinguish the instructed setting from an explicit user confirmation.
Approximate unit conversions are conditional on that setting and the stated digits;
they are not precision readings independently checked from a meter photograph.

| Sequence | Terminal pair and condition | Range context | Original report | Interpretation／limitation |
|---|---|---|---|---|
| 1 | S to minus, initial room light | 20kΩ instructed | `14`, repeated `14` | Decimal placement was not confirmed; preserve raw text, do not silently convert to 14.00 kΩ or 14 Ω |
| 2 | S to minus, covered | Same instructed setting | `13` | Only a reported change; not sufficient to identify a resistor or declare a fault |
| 3 | S to minus | 20kΩ walkthrough | `黃綠4.8` | Approx. 4.8 kΩ if the stated range/readout applies |
| 3 | Minus to middle pin | Same round | `綠橘13` | Approx. 13 kΩ under that assumption |
| 3 | Middle pin to S | Same round | `橘黃10` | Approx. 10 kΩ under that assumption |
| 4 | S to minus, covered | 20kΩ walkthrough | `1` | Discussed as an overrange/open indication if it was the isolated left-side digit, not as 1 Ω; display position was not photographed |
| 5 | S to minus, cloth removed | Same round | `對` in response to returning near 4.8 | User confirmed approximate return after uncovering; this supports a light response but is not a new exact numeric reading |
| 6 | S to minus, dim／room light／inside clothing | User explicitly confirmed `200k` | `暗光0.6, 一般光 0.1, 衣服內1` | If literal on 200kΩ: about 600 Ω, 100 Ω, and overrange/open. These do not match the earlier room-light values as a simple range conversion; unresolved |
| 7 | S to minus, room／dim light | Return to20kΩ instructed | `一般光1.9, 暗光5` | Approx. 1.9 kΩ and 5 kΩ; supports resistance increasing with darker conditions |
| 8 | Middle pin to S, room／covered | Same20kΩ walkthrough | `差不多都是靠近10` | Approx. 10 kΩ in both conditions; supports the fixed-resistor path |
| 9 | Minus to middle pin, dim／room light | Same20kΩ walkthrough | `暗14, 一般11` | Approx. 14 kΩ and 11 kΩ; largest path also increases in the dark |

The instructor used clothing to block light. The guidance accepted nonconductive
opaque cloth or paper while warning against pressure on the LDR leads, contact with
metal, or movement of the jumper/probe contacts. Covering should change light, not
the electrical connection at the same time.

## What these reports support

- The reports support the working topology `middle header—fixed resistor—S—LDR—minus`.
- The electrical midpoint is therefore S in this working model, not the physically
  middle header pin. Wire colors do not establish topology.
- Under the simple isolated two-resistor-series model and identical lighting,
  `R(S,minus) + R(S,middle) = R(middle,minus)` ideally.
- This is not an exact-sum pass: the early set gives `4.8 + 10 = 14.8`, not13;
  the later room-light set gives `1.9 + 10 = 11.9`, not11; the later dim set gives
  `5 + 10 = 15`, not14. Readings were sequential, and lighting was not quantified.
- Lighting and contact changes are possible explanations, not confirmed causes.
  The 200kΩ reports remain unresolved; later plausible trends must not overwrite them.
- No arbitrary tolerance was introduced to turn these differences into a pass.
- Resistor-path behavior does not prove correct powered signal voltage, ADC behavior,
  lux calibration, or the same topology in another compatible module.

## Questions converted into student explanations

| Question／confusion | Revision in week3_main.ipynb |
|---|---|
| Explain the experiment logic before asking for more numbers | Section6 starts with fixed versus light-dependent behavior, hypothetical examples, and a controlled cover/uncover procedure |
| What do the three pair readings mean? | Each reading is the equivalent resistance between two named terminals, not one wire's resistance, a voltage, or a GPIO state |
| Does yellow/green always mean fixed and yellow/orange mean LDR? | Removed the assumed S-to-minus fixed-resistor instruction; examples use terminal names, explicitly state assumptions, and require observation before assignment |
| Is yellow/orange plus orange/green equal to yellow/green? | Show that the shared electrical midpoint determines the two series segments; distinguish electrical midpoint from physical middle pin |
| Covered display1 | Separate numeric values from overrange/open indication, check contact, uncover without moving probes, then change range with probes removed |
| Clothing instead of paper | Accept suitable opaque cloth while preserving contacts and not bending the LDR leads |
| 20k versus200k, 0.1 versus1, and missing decimal points | Add unit conversions, range examples, and a discrepancy case that does not mark cross-range consistency as passed |
| Explain without wire colors | Voltage-divider teaching starts with supply, fixed resistor, S, photoresistor, and GND |
| Why does3.3 V with10 kΩ become1.65 V? | Explicitly reject voltage-plus-resistance arithmetic; derive total resistance, common current, and each voltage difference |
| Does10 kΩ always remove1.65 V? | Compare10k/10k,10k/20k,10k/1k,20k/20k, and a single resistor directly across an ideal3.3 V supply |

The explanation sequence is purpose → expected observation → operation → result →
meaning/limitation. The notebook uses student-facing worked examples, not the raw
dialogue or instruction to the teacher. A 5 kΩ LDR paper problem checks transfer of the
same reasoning without introducing a new hardware purchase or a new assessment unit.

## Calculation examples, not physical measurements

All examples assume an ideal stable 3.3 V supply, two stated resistors in series, and
no other branch loading S. The fixed resistor is on the supply side, and the LDR on
the GND side. Calculated current is not an instruction to use the meter's current mode.

| Fixed／LDR | Total resistance | Calculated common current | Fixed-resistor voltage difference | S relative to GND |
|---|---:|---:|---:|---:|
| 10 kΩ／10 kΩ | 20 kΩ | 0.165 mA | 1.65 V | 1.65 V |
| 10 kΩ／20 kΩ | 30 kΩ | 0.110 mA | 1.10 V | 2.20 V |
| 10 kΩ／1 kΩ | 11 kΩ | 0.300 mA | 3.00 V | 0.30 V |
| 20 kΩ／20 kΩ | 40 kΩ | 0.0825 mA | 1.65 V | 1.65 V |

These examples follow `I = V / (Rfixed + Rlight)` and `Vs = I × Rlight`.
The two voltage differences sum to3.3 V. The supplied numerical cases are teaching
calculations, not official module measurements and not the instructor's powered results.

## Sources checked and verification boundary

- [Joy-IT KY-018](https://sensorkit.joy-it.net/en/sensors/ky-018): increasing light
  decreases LDR resistance; reference module uses a fixed10 kΩ resistor and a divider.
  One fetch timed out; a subsequent fetch succeeded. This is a reference product,
  not independent confirmation of the photographed compatible board.
- [Fluke Ohm's law](https://www.fluke.com/en-us/learn/blog/electrical/what-is-ohms-law):
  voltage, current, resistance, and the algebraic forms of Ohm's law.
- Document/range examples: instructional interpretation of the reported A830L
  setting; no new calibration or photo-based range validation was performed.
- Firmware and upload: no new execution; existing code is unchanged by these additions.
- Physical at the initial checkpoint: instructor-reported, off-power resistance
  behavior only. The subsequent powered S-voltage reports are recorded below.
- ADC, calibrated lighting, and repeatability across modules: not performed.

## Document and calculation checks performed

- `python scripts/verify_course_materials.py`: passed after the revisions; checked
  77 Markdown/notebook files, course structure, local links, tables, code fences,
  and notebook attachments with the existing repository checks.
- Parsed the notebook JSON and compared it with `b95c59c`: all 20 cells remain;
  only Markdown sources changed. Both code cells, all three existing attachments,
  cell metadata, and notebook metadata are unchanged.
- Compared both code cells with the two referenced Week 3 `.ino` files: equal.
  No new Arduino compilation is claimed because no code was changed or recompiled.
- Independently recalculated the four worked divider examples and seven resistance
  conversions with numeric assertions: passed. This verifies arithmetic only.
- `git diff --check`: passed. Changes were kept to Week 3 explanations and the
  associated evidence/state records; the unrelated `ESP_Drone/` folder was left intact.
- No commit or push was requested for this revision.

## Earlier pause before the powered follow-up (superseded below)

The instructor acknowledged the end-of-resistance cleanup instruction: meter OFF,
USB disconnected, and module extensions kept separate. This was not independently
observed through a new photograph.

The assistant subsequently proposed connecting the middle-pin extension to `b6`
(same node as the existing3V3 at `a6`) and minus to `b3` (same node as GND at `a3`).
The instructor instead requested conceptual examples and then asked that they be
written into the notebook. At that checkpoint, the proposed supply connections
had not been reported complete; the subsequent confirmation is recorded below.

The planned next action at that checkpoint was an unpowered wiring-state check
and explanation of the divider and voltage-mode measurement points, not an ADC
upload. That check and the following measurement were then guided in conversation.

## Powered follow-up: S relative to GND

The instructor confirmed USB was disconnected, then explicitly confirmed the
module's orange middle-pin extension at `b6` and green minus extension at `b3`.
These share the previously established `3V3→a6` and `GND→a3` five-hole groups.
The yellow S extension was left disconnected from all ESP32 GPIOs.

| Connection | Function in this setup | Meter use |
|---|---|---|
| ESP32 3V3 to a6; module middle pin to b6 | Module supply through row 6 | White extension at e6 is not the S measurement point |
| ESP32 GND to a3; module minus to b3 | Common reference and return through row 3 | Black probe to the exposed metal of the black e3 extension |
| Module S to yellow extension | Divider signal, not connected to an ESP32 input | Red probe to the exposed metal of this extension |

The A830L was instructed to use DC 20 V, with black lead in COM and red lead in
VΩmA; the instructor acknowledged the setting. No new photo independently verifies
the selector, sockets, wiring, supply voltage, or display.

### Handling and questions encountered

- The instructor explicitly reported using hands, not clips. Earlier `ok` replies
  must not be treated as evidence that probe contacts were clamped or fixed.
- The guided single-person method places the separated wire ends on a dry wooden
  surface, optionally stabilizes their insulation with tape, puts the probes down
  before connecting USB at the board's COM connector, and only then uses two hands
  to hold the insulated probe handles behind their finger guards. No clip purchase
  was required; actual tape use was not reported.
- Probes are removed before placing/removing the nonconductive light cover. The
  cover must not bend leads, bridge contacts, or change wiring. The specific cover
  used in this voltage round was not reported. USB must be removed before moving
  the module or changing wiring; resistance/continuity modes are not used powered.
- Supply, minus, and S were explained separately. The physically middle header
  receives supply in this tested setup; S is the electrical junction between the
  two resistors. Minus is connected to the shared GND, not a negative-voltage rail.
- The instructor asked why S was not connected to the ESP32. The sequence was
  clarified: first power the divider and observe S with the meter, then separately
  verify an ADC input and program. The external S connection is not required to
  create the divider voltage. S cannot replace the intended minus/GND connection.
- Confusion between the white 3V3 extension and yellow S extension was corrected
  by tracing their endpoints. The equation `0 V − 3.3 V ≈ −3.3 V` explained red on
  GND and black on 3V3. The instructor repeated that equation and said completed,
  but supplied no separate measured number; do not record −3.3 V as a new reading.

### Instructor-reported readings

All three readings followed the red-to-S / black-to-GND, DC-20-V guidance. Values
are text reports interpreted in volts in that context, not agent-acquired readings.

| Order | Guided lighting condition | Original report | S relative to GND |
|---|---|---|---|
| 1 | Ordinary room light | `0.62` | 0.62 V |
| 2 | Covered / darker | `1.75` | 1.75 V |
| 3 | Cover removed / ordinary light again | `0.55` | 0.55 V |

The reported rise when covered and fall when uncovered support the expected basic
light-to-voltage response of this particular module in this wiring. They do not
establish calibrated lux, a repeatability tolerance, supply stability, or behavior
of all compatible modules. The return reading differs from the initial one by
0.07 V; changed illumination or hand-held contact are possible explanations, not
confirmed causes. No arbitrary acceptance tolerance is introduced.

`KY018-T01` can be recorded as `basic-pass` only for this instructor-reported
powered S-voltage response. Its previous inconsistent 20k/200k readings remain
unresolved. No ESP32 ADC acquisition, firmware upload, current measurement, or
calibration was performed in this follow-up.

### Earlier pause after S-voltage measurement; superseded by the final handoff below

After the third reading, the instructor was told to remove the probes and unplug
USB and turn the meter OFF. The subsequent `ok move on` acknowledged the cleanup
and continuation prompt; it was not a new visual inspection of USB, PWR, or the
selector. Before resuming any wiring change, confirm that USB is removed and PWR
is off again.

ADC was then introduced as the ESP32's way to read the already-observed signal.
The instructor was asked to find a female-to-female jumper, but did not report
finding it or making a new connection. Instead, the instructor requested that the
full explanation be integrated into the student notebook before continuing.
S therefore remains outside ESP32 GPIOs at this handoff. No ADC sketch was uploaded
and no raw ADC values were reported; the last GPIO5 firmware is not ADC evidence.

## Student-notebook integration and remaining work

This revision organizes the questions by the operation they explain, rather than
copying the chat into the student guide:

| Topic from the dialogue | Student location |
|---|---|
| Resistance readings, three paths, units, unresolved range differences | Sections5–6; retained with their limits |
| Why3.3 V and10 kΩ do not by themselves mean1.65 V | Sections10.1–10.7; worked calculations and transfer problem |
| Middle pin versus S, minus versus negative voltage, supply pair before signal | Pin table and section10.8 |
| a6/b6/e6 as one node, a3/b3/e3 as another; colors versus endpoints | Section10.9 |
| Black probe on white supply extension versus on GND; red-minus-black meaning | Section10.10, with a hypothetical reversed-supply example |
| One-person hand-held probes; no confirmed clips or tape use | Section10.10, separating setup, covering, measuring and cleanup |
| Actual0.62/1.75/0.55 V reports, change direction and limits | Section10.11, explicitly a reported observation case, not required values |
| ADC, raw,12-bit, sampling, common reference and no assumed voltage conversion | Sections11–12 |
| Evidence rather than just a number | Discussion and record/checklist; subsequent two-condition scope decision below narrows the closing question |

The revised ADC procedure proposes a separate S five-hole group at a15/b15/e15
using the existing purchased wire types. This keeps a probe extension available
while the ADC is connected; it is a documented next configuration, **not** an
already constructed or physically tested configuration. The direct female-to-female
option is explained, but the primary measurement workflow uses the breadboard
fan-out. The ADC connection to the ESP32 is made only after replacing the old
firmware and disconnecting USB again. Student code retains its `-1` profile gate.

Remaining new hands-on work is the ADC input/profile validation and connection,
sketch Upload and Serial acquisition, followed by covered and indoor-light conditions
with one S-voltage reading and ten raw samples each,20 raw samples total. This follows
the instructor's subsequent two-condition decision below. Discussion and evidence /
cleanup remain. DHT11, thresholds and valid/invalid classification stay in Week4.

### Checks rerun after this integration

- `python scripts/verify_course_materials.py`: PASS,77 Markdown/notebook files,
  including the updated Week3 structure and links.
- Parsed the final notebook and compared non-source cell fields and all code
  with HEAD:20 cells retained; both code cells,3 attachments, and metadata unchanged.
- Both executable cells still exactly match their referenced Week3 `.ino` files.
  No new firmware compilation, Upload, ADC acquisition, or physical wiring test
  was performed during this documentation edit.
- Reviewed the changed explanations against the actual sketch: `profileReady()`
  only checks a nonnegative pin number, not ADC capability or physical wiring.
  Removed the old unconditional `signal→GPIO4` instruction in favor of the verified
  course profile; corrected the program-replacement and powered-measurement order.
- Rechecked the0.07 V example difference arithmetically; this is not a measurement
  tolerance or calibration result.
- `git diff --check`: PASS. No third file was added to the weekly folder.
- No commit or push in this turn; unrelated `ESP_Drone/` was not modified.

## Subsequent decision: two light conditions and a focused Discussion

The instructor explicitly removed the separate bright-light / phone-flashlight
condition from Week3. Covered and indoor-light conditions remain, each with one
voltage and ten raw samples. The previous0.62/1.75/0.55 V reports are retained as
an indoor→covered→indoor return observation, not three different lighting conditions.
No new physical readings or wiring changes accompanied this curriculum decision.

The closing topic is now “數字變大，就代表光比較亮嗎？” Its four connected prompts
cover the measured divider and a prediction, comparison using the same two datasets,
a paper-only troubleshooting scenario, and a bounded conclusion. Discussion reuses
the ADC experiment; it does not require another hardware exercise or a third condition.
The notebook overview, materials, procedure, submission checks and appendix were
aligned. PROJECT.md and the Week3 portions of the hardware blueprint and teacher
card reflect the decision; Week4's existing scope was not removed. Its blueprint
now makes clear that any third-condition data must be collected in Week4 itself.

### Distinguish missing experiments from evidence and paper work

| Item | Evidence available | What remains; not a claim of a failed test |
|---|---|---|
| ESP32 ADC and two-condition comparison | S-voltage response observed; no ADC upload or raw acquisition yet | New hands-on task: verify ADC input, wire and upload, then record covered and indoor-light voltage/raw |
| GPIO LOW/HIGH repeat records | The2026-08-30 record accepts one correctly oriented HIGH+3.3 V and following LOW0 V, plus Reset startup Serial | Basic GPIO test already passed. To complete the existing student three-per-state table, retain the accepted pair and add two LOW/HIGH rounds with cycle/phase/voltage; missing cycle identifiers remain missing unless actually recorded. This is repeated evidence, not a new circuit or required restart of the current light experiment |
|5 kΩ divider transfer problem | Worked examples have been taught; no response to the transfer problem recorded | Paper calculation only:3.3 V supply,10 kΩ fixed resistor and a hypothetical5 kΩ LDR. No loose-resistor purchase, circuit change or physical measurement |
|20k/200k discrepancy | Original range/digit reports remain inconsistent | Teacher-side unresolved reading check, not a new mandatory experiment for every student: after USB removal and isolating all three module terminals from the board, compare the same S-to-minus pair under fixed light in the two Ω ranges, removing probes before changing range; record complete display and units. Do not infer a pass from later S-voltage results or require this as new ADC data |

At that curriculum checkpoint the hardware handoff remained unchanged: S not connected to an ESP32 GPIO and
no ADC result claimed. Keep the light setup for the next guided step; do not ask
the instructor to rewire back to GPIO5 just to explain this remaining-work list.

Two-condition revision verification: repository document/link checks and
`git diff --check` passed. Both code cells,20-cell structure, attachments and metadata
remain unchanged. A first ad-hoc text assertion failed; rerunning against the parsed
Unicode source with exact obsolete requirement phrases confirmed no three-condition
or30-sample requirement remains in Week3. Four connected Discussion prompts and the
20-sample requirement were checked. No compilation or physical test was rerun,
and no commit/push was performed.

## Subsequent ADC candidate preparation and instructor-reported Upload

This section supersedes the earlier pause descriptions for the next guided step.
It separates actual reports, instructed-but-unconfirmed actions, and document edits.

### Confirmed breadboard changes

The instructor explicitly changed the module supply and minus connections from
`b6`/`b3` to `c6`/`c3` to make the connectors easier to handle. These remain in the
same a–e five-hole groups. The signal route was explicitly restated as
`S → yellow → a15 → c15 → blue`; c15, not the initially proposed b15, is the current
blue jumper position. Historical voltage-measurement coordinates above are retained.

| Origin | Connection last reported | Evidence boundary |
|---|---|---|
| BOARD-T01 3V3 | Red wire to a6; orange module-middle wire at c6 | Same row-6 supply node; not 5Vin |
| BOARD-T01 GND | Brown wire to a3; green module-minus wire at c3 | Same row-3 common reference |
| Module S | Yellow wire to a15; blue male-to-female jumper at c15 | Blue female end was instructed to remain separate during program replacement |
| e6 and e3 | Earlier white supply and black GND meter extensions | No new removal or replacement reported |
| e15 | Proposed separate S meter extension | Installation has not been confirmed |
| Blue female end to GPIO4 | Connection instructed only after successful Upload and USB removal | No subsequent confirmation or wiring photo; do not assume completed |

The instructor also emphasized working alone with two hands. The old 20k/200k
values were obtained under changing light/contact conditions and cannot establish
a range-conversion error or a faulty module. They remain unresolved evidence;
repeating them is not a prerequisite for beginning the ADC candidate test.

### Candidate file and initial Verify evidence

The local teacher experiment is
[`week03_gpio4_adc_candidate_test.ino`](../../examples/week03_gpio4_adc_candidate_test/week03_gpio4_adc_candidate_test.ino).
The inspected file sets `PIN_LIGHT=4`, `DEVICE_ID="BOARD-T01"`, interval500 ms,
12-bit conversion and `ADC_11db`. This is a teacher candidate, not a published
student GPIO profile. Week2's GPIO4 digital-input result does not validate ADC use.
The public `week03_ky018_raw.ino` and its notebook code cell retain `PIN_LIGHT=-1`.

The IDE screenshot showed this candidate file, `PIN_LIGHT=4`, Arduino IDE2.3.10,
and `Select Board`. Board selection was explained before proceeding. The instructor
then supplied this initial Verify summary:

```text
Sketch uses 286973 bytes (21%) of program storage space. Maximum is 1310720 bytes.
Global variables use 21936 bytes (6%) of dynamic memory, leaving 305744 bytes for local variables. Maximum is 327680 bytes.
```

The questions about21% and6% were resolved by distinguishing the configured
application-partition capacity from total physical Flash, and compile-time static
RAM accounting from runtime use or8 MB PSRAM. The two percentages have different
denominators and cannot be added as whole-board utilization.

The instructor later replied「設定好」after the reminder to use ESP32S3 Dev Module,
16 MB Flash, OPI PSRAM, the COM/UART route with USB CDC On Boot disabled, and
115200 Upload Speed. No complete settings screenshot, current Partition Scheme,
current COM number, or second Verify summary was provided. Earlier COM8 is not
proof of the current port number. Previous package3.3.11 is recorded history, not
a fresh installation audit.

### Upload evidence; not yet an ADC reading

The instructor was guided to leave the signal's blue female end disconnected,
connect USB at the board's COM connector, select the actual port and Upload.
The final reported output included:

```text
Wrote 292336 bytes (168338 compressed) at 0x00010000 in 15.0 seconds (156.2 kbit/s).
Verifying written data...
Hash of data verified.

Hard resetting via RTS pin...
```

This supports successful writing and data verification for the reported Upload,
followed by the tool's reset command. It does not prove that the program reached
`status=ready`, that S was connected, or that GPIO4 measured a light-dependent signal.
The initial Verify size286973 and later Upload size292336 are distinct reported
stages; no binary hash or intervening build summary was supplied to equate them.
The agent did not compile, upload, open a serial port, or acquire hardware data.

### Questions and image integrated into the student notebook

| Question or difficulty | Organized student explanation |
|---|---|
| Why does GPIO receive a voltage relative to GND, not just a signal from S? | Section11.1 starts from the0.62 V red-on-S / black-on-GND observation and identifies two measurement positions |
| The two external paths seem separate; where do they work together? | New meter/ADC functional diagram includes the ADC inside ESP32 and its shared-GND relationship; ordinary external wire and internal functional comparison use different line styles |
| Does this require a new wire from GPIO4 to GND? | Section11.1 explicitly distinguishes measurement from a direct short; the short is a paper counterexample, not a live test |
| What does analogRead read, and is raw a voltage? | Existing official ADC API explanation retained;0.62 V and1.75 V illustrate input differences, not invented raw samples |
| Where do c6/c3 and a15/c15 fit? | Sections10.9,11.4 and12 use the updated coordinates and blue signal jumper consistently |
| What do Verify21% and RAM6% mean? | Section12 explains configured program space, static RAM accounting, PSRAM, and why compile/Upload do not prove sensing |

The new diagram is original repository-native artwork: editable source
[`week3_adc_ground_reference.svg`](../images/wiring/week3_adc_ground_reference.svg),
generated [PNG](../images/wiring/week3_adc_ground_reference.png), and an identical PNG
attachment inside the notebook. It is a functional teaching analogy, not a transistor
schematic or a photograph of newly verified wiring. GPIO4 is labelled a function
example; the student profile gate is unchanged. Sources are the official Espressif
[ADC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html),
[ESP32-S3 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf),
[partition table](https://docs.espressif.com/projects/arduino-esp32/en/latest/tutorials/partition_table.html)
and [Tools Menu](https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html).

### Earlier handoff before the first raw report; see the latest entry below

After the Upload report, the instruction was to unplug USB, confirm PWR off, and
only then connect the blue c15 female end to GPIO4. The instructor instead asked
about the measurement relationship and requested these explanations and images
in the notebook. The connection and current USB/PWR state have not been confirmed.

Before resuming, confirm USB removed/PWR off and the actual blue-wire endpoint.
Also establish whether the separate e15 S meter extension is installed. Only after
the unpowered wiring check should the guided procedure reconnect USB and inspect
Serial at115200 baud. No ADC `status=ready`, raw samples, voltage/raw comparison,
or two-condition ADC test has been reported. The latest reported firmware Upload
is the ADC candidate, not the older GPIO5 voltage-cycle firmware.

The remaining physical task is covered/indoor-light ADC observation, with one
S-voltage measurement and ten original raw samples for each condition. Do not
invent a raw value from the previous voltages, repeat the entire GPIO5 exercise,
or mark the public GPIO4 ADC profile verified from this Upload alone.

### Documentation and figure checks after this addition

- `python scripts/verify_course_materials.py`: PASS for77 Markdown/notebook files,
  including local links and the Week3 single-notebook structure.
- Compared parsed notebook fields with HEAD:20 cells retained, both code cells
  unchanged and matching their referenced public sketches, metadata unchanged,
  and all3 existing attachments preserved. The public ADC code still uses `-1`.
- Added one PNG attachment; decoded bytes match the repository PNG. Regenerating
  from the SVG at160 dpi with Sharp produces identical pixel data,2444×1822.
- Rendered the actual attachment in headless Microsoft Edge and visually checked
  the labels, line endpoints, internal arrows and layout at900-pixel display width.
  This is local attachment/render verification, not a claim that the updated
  notebook has been pushed or viewed on GitHub.
- The initial embedding guard rejected a mixed-newline marker without writing;
  it was corrected to preserve the existing line endings. Final embedding and
  refresh checks passed without changes to other notebook fields.
- The bundled Python lacks `nbformat`/`nbconvert`, so no full nbconvert HTML export
  was performed. Playwright's default browser binary was also absent; the render
  used the existing Edge installation instead, without installing a browser.
- The teacher candidate source was read but not changed. Its current SHA256 is
  `BAFBFCBFEF707BB9DB126992CA84B196E85B2CC77DBFAB03A05FE93A1AF0A8FF`;
  this identifies the local source, not an uploaded binary hash.
- Reviewed the actual document differences; `git diff --check` passed. No third
  weekly-folder file, new firmware execution, ADC physical pass, commit or push
  was created by this documentation task. Unrelated `ESP_Drone/` was untouched.

## First instructor-reported ADC raw output

After the ADC explanation was integrated, the instructor requested continuation.
The guided sequence again required USB removal/PWR off before checking the blue
c15 female end on GPIO4. The instructor replied `next`, then was instructed to
check for exposed contacts touching, power through COM, and open Serial Monitor
at115200 baud while keeping ordinary indoor light. The following nine lines were
provided; they are preserved without relabelling light conditions or removing values:

```text
device=BOARD-T01 sample=4194 uptime_ms=2097007 light_raw=248
device=BOARD-T01 sample=4195 uptime_ms=2097507 light_raw=251
device=BOARD-T01 sample=4196 uptime_ms=2098007 light_raw=248
device=BOARD-T01 sample=4197 uptime_ms=2098507 light_raw=255
device=BOARD-T01 sample=4198 uptime_ms=2099007 light_raw=267
device=BOARD-T01 sample=4199 uptime_ms=2099507 light_raw=293
device=BOARD-T01 sample=4200 uptime_ms=2100007 light_raw=678
device=BOARD-T01 sample=4201 uptime_ms=2100507 light_raw=683
device=BOARD-T01 sample=4202 uptime_ms=2101007 light_raw=681
```

The sample numbers increase by one; all eight adjacent `uptime_ms` differences
are500 ms, spanning4000 ms from the first to the last reading. The first six raw
values range248–293; the last three range678–683. The step from sample4199 to4200
is293→678. These are original ADC integers, not volts or brightness percentages.

This is now evidence of instructor-reported runtime raw output, superseding the
earlier statement that no raw samples were available. It does not establish why
the input changed, prove a correctly connected S solely from the numbers, or
complete the controlled two-condition test. The exact lighting/hand position during
these lines, the startup header, and a simultaneous voltage were not supplied.
The intended GPIO4 connection was acknowledged by continuation, not independently
verified in a new photo; the e15 meter extension still lacks confirmation.

Next dialogue action: ask whether a hand, cloth or shadow covered the photoresistor
when the values rose near sample4200. Do not assign the first six as indoor and the
last three as covered without that confirmation. Preserve this short discovery log
separately from the required two labelled sets of ten samples. No rewiring or new
Upload is needed merely to explain this report. No ADC profile release or lux
calibration pass is claimed.

Record checks: independently calculated the nine-sample count, eight500 ms intervals,
4000 ms span and both raw ranges. Documentation-only update; no agent hardware
operation, firmware change, commit or push.

## First explicitly labelled covered-light sample set

The instructor labelled the following new set「遮光」and pasted the Serial Monitor
UI text identifying ESP32S3 Dev Module, COM8 and115200 baud. This now supports the
reported current port and monitor speed; the UI message-entry prompt is not sensor
data and does not instruct sending a command to the board.

```text
device=BOARD-T01 sample=4527 uptime_ms=2263507 light_raw=1449
device=BOARD-T01 sample=4528 uptime_ms=2264007 light_raw=1437
device=BOARD-T01 sample=4529 uptime_ms=2264507 light_raw=1450
device=BOARD-T01 sample=4530 uptime_ms=2265007 light_raw=1447
device=BOARD-T01 sample=4531 uptime_ms=2265507 light_raw=1419
```

Calculated checks: five consecutive samples, four500 ms intervals,2000 ms first-to-last
span, minimum1419, maximum1450 and a31-count range. Differences within this short
set do not by themselves establish a fault, measurement accuracy or a noise cause.
All values remain raw ADC counts, not volts, lux or percentages.

The new label applies to samples4527–4531 only. It does not retroactively identify
the lighting of samples4194–4202. No paired voltage or confirmed fixed covering
method was supplied. The two-condition comparison therefore remains incomplete.

Next guided step: keep this covering and wiring unchanged, without touching exposed
contacts, and save a fresh continuous ten-sample covered set (about five seconds of
acquisition). Preserve the five original samples above rather than fabricate five
more or combine widely separated pieces as if continuous. Then collect the indoor
condition separately; the planned comparison still uses only two light conditions.
No firmware change, hardware action by the agent, commit or push occurred.

## First explicitly labelled ordinary indoor-light set and preliminary comparison

Instead of supplying an expanded covered set, the instructor next labelled this
new five-line set「一般光」. The first pasted line starts `evice=` rather than
`device=`; preserve this transcription truncation without altering its raw value:

```text
evice=BOARD-T01 sample=4598 uptime_ms=2299007 light_raw=275
device=BOARD-T01 sample=4599 uptime_ms=2299507 light_raw=285
device=BOARD-T01 sample=4600 uptime_ms=2300007 light_raw=279
device=BOARD-T01 sample=4601 uptime_ms=2300507 light_raw=283
device=BOARD-T01 sample=4602 uptime_ms=2301007 light_raw=287
```

There are five consecutive sample numbers, four500 ms timestamp intervals and a
2000 ms first-to-last span. The indoor range is275–287, a12-count spread. The
separately labelled covered set is1419–1450. These short ranges do not overlap;
all five covered values exceed all five indoor values. This supports the basic
instructor-reported observation that covering this setup corresponds to larger
raw values, consistent with the previously explained divider model. It does not
mean a larger raw value is brighter or that the ratio of raw values measures a
brightness ratio. No precise voltage/lux is inferred from raw.

The prior meter observation (indoor0.62 V, covered1.75 V, return0.55 V) has the same
direction, but it was not acquired alongside these ADC samples. Do not pair those
old voltages with these new values as a calibration or simultaneous measurement.
The initial unlabelled nine-line discovery log remains separate.

Current evidence is five explicitly labelled samples per condition, ten total,
not ten per condition. This is sufficient for a preliminary direction comparison,
but the planned continuous ten-sample sets and same-condition voltage comparison
are still incomplete. Next guided step can use the current indoor condition to
save ten continuous lines without rewiring or changing the program; the original
five remain preserved. No ADC profile release or full scenario pass is claimed.

Checks: recomputed counts, timestamp gaps, ranges and non-overlap; reviewed the
record additions and hardware-state summary. No firmware or student code changed,
and no agent-operated physical test, commit or push occurred.

## Subsequent complete ten-sample set: lighting label pending

The instructor next provided ten consecutive lines without a lighting label.
The preceding request had asked for indoor light, but the new range differs
substantially from the previously labelled indoor set; confirm the actual condition
instead of automatically applying the requested label or assuming a fault.

```text
device=BOARD-T01 sample=5068 uptime_ms=2534007 light_raw=2167
device=BOARD-T01 sample=5069 uptime_ms=2534507 light_raw=2183
device=BOARD-T01 sample=5070 uptime_ms=2535007 light_raw=2190
device=BOARD-T01 sample=5071 uptime_ms=2535507 light_raw=2183
device=BOARD-T01 sample=5072 uptime_ms=2536007 light_raw=2168
device=BOARD-T01 sample=5073 uptime_ms=2536507 light_raw=2165
device=BOARD-T01 sample=5074 uptime_ms=2537007 light_raw=2195
device=BOARD-T01 sample=5075 uptime_ms=2537507 light_raw=2159
device=BOARD-T01 sample=5076 uptime_ms=2538007 light_raw=2164
device=BOARD-T01 sample=5077 uptime_ms=2538507 light_raw=2195
```

Calculated checks: ten samples5068–5077, nine500 ms timestamp intervals,
4500 ms first-to-last span, minimum2159 and maximum2195 (36-count spread).
The earlier labelled indoor set was275–287 and covered set1419–1450. Neither
label can be assigned to this new set solely by matching or comparing magnitudes.
Covering, light position, contact or other changes have not been reported for it.
No values were discarded, replaced or converted to volts.

Next step: ask which lighting condition was present while obtaining samples5068–5077.
Do not require another acquisition before clarifying this existing complete set.
Keep wiring unchanged during the discussion; no hardware or firmware action was
performed by the agent. The controlled two-condition comparison remains pending.

### Instructor confirmation: the ten-sample set was unoccluded under ordinary lighting

The instructor clarified「沒, 就一般燈的下面」and requested the next step.
Samples5068–5077 are therefore labelled ordinary lamp light, not covered, with
range2159–2195. This is the current round's ten-sample baseline. Keep the previous
275–287 indoor set and1419–1450 covered set as distinct earlier observations;
do not relabel, average together, or substitute them for this round's comparison.
The difference between the two ordinary-light sets is unresolved. A common label
does not establish identical light intensity, geometry or contact conditions,
and no particular cause has been established.

Next step: retain the current module position, lamp and wiring. Cover only the
light-sensitive element with an opaque nonconductive cover without contacting
bare terminals or moving wiring, wait two seconds, and save ten consecutive lines
labelled covered. If arranging the cover requires moving the module or wiring,
disconnect USB first; do not adjust connections while powered. Under the previously
checked divider model the predicted direction is upward relative to this round's
baseline, but any actual result must be retained. Do not require it to match the
earlier covered value near1400. The new covered set and paired voltage readings
have not yet been supplied. No hardware operation, firmware change, commit or push
was performed by the agent.

### Instructor decision: skip additional covered acquisition

The instructor said「pass, 我已經有給遮光結果了」. Do not request another
covered ten-sample set in this walkthrough. Retain the labelled covered five
samples4527–4531 (1419–1450), the earlier indoor five4598–4602 (275–287),
and the later ordinary-lamp ten5068–5077 (2159–2195) as distinct evidence.
This is permission to skip the proposed repetition, not a claim that all
verification requirements passed and not a change to the whole-course rubric.
Do not fabricate missing samples or pair the later lamp set with the earlier
covered set as a controlled same-round comparison.

Next guided step is the remaining same-condition meter/ADC comparison after
GPIO4 connection. First ask whether the e15 male-to-male S measurement extension
already exists; visual confirmation does not require touching or rewiring.
If installation is necessary, remove USB and confirm PWR off before arranging it.
The earlier S-voltage reports predate ADC connection and remain useful teaching
evidence, but do not constitute paired readings for the current setup. No
measurement, connection, firmware change, commit or push was performed by the agent.

### S meter extension added after an explicit placement question

The instructor reported no e15 extension and asked whether to add a male-to-male
jumper or insert the red meter probe directly into the breadboard. Guidance was
to unplug USB, confirm PWR off and meter OFF, insert one jumper end in e15, and
keep its free metal end separated on a dry nonconductive surface. a15 yellow and
c15 blue remain unchanged. All three holes share one a–e row-15 node; the jumper
extends S for a probe contact rather than creating a new supply or ground path.
Probes should touch the free metal end rather than be forced into breadboard holes.

The instructor then confirmed「15已接, next.」. Record e15 installation as
instructor-reported completion of that instruction, not a new photo or continuity
measurement. Subsequent power and meter readings have not yet been reported.

Next guided operation: with USB still removed, verify meter black lead in COM,
red in VΩmA,10A empty and selector at DC20 V; separate the free wire ends and put
probes down. Reconnect USB through board COM only after that check and check PWR
and absence of abnormalities. Under unchanged ordinary lighting, black probe
touches the e3 GND extension, red the new e15 S extension. White e6 is3V3 and is
not this measurement point. First request the voltage with sign and units; the
following raw capture must preserve the same lighting and be recorded as sequential,
not simultaneous. No extra covered acquisition is requested. No agent-operated
hardware test, firmware change, commit or push occurred.

### Meter report after installing the S measurement extension

Following the A830L DC20 V / red-to-e15-S / black-to-e3-GND instructions under
ordinary lighting, the instructor reported `0.52` with no minus sign. Record it
as approximately+0.52 V in that guided context. It is a hand-held, instructor-text
report; no new display photo, independent probe-placement verification or meter
accuracy check was supplied. This means S was reported0.52 V above the common GND,
not that GPIO4 supplies0.52 V and not an ADC raw value.

Next step: remove and set down the probes while leaving USB connected and keeping
the lamp, module position, covering state and wiring unchanged. Obtain five fresh
consecutive Serial lines for a sequential same-condition voltage/raw comparison.
Do not move or shadow the light-sensitive element while setting down probes.
Do not reuse the earlier2159–2195 lamp set as if it were measured at the time of
this voltage report, and do not predict raw by multiplying0.52 by an ideal ratio.
No new covered acquisition is requested. No fresh raw set corresponding to this
voltage has yet been reported; no calibration or full-scenario pass is claimed.
Only the lab note and hardware handoff are updated; no firmware change, agent
hardware operation, commit or push occurred.

### Fresh raw output following the0.52 V reading

The instructor supplied the following five lines after the request to put down
the probes and retain the lighting, module position and wiring:

```text
device=BOARD-T01 sample=376 uptime_ms=188007 light_raw=696
device=BOARD-T01 sample=377 uptime_ms=188507 light_raw=696
device=BOARD-T01 sample=378 uptime_ms=189007 light_raw=691
device=BOARD-T01 sample=379 uptime_ms=189507 light_raw=698
device=BOARD-T01 sample=380 uptime_ms=190007 light_raw=701
```

Calculated checks: five consecutive sample numbers, four500 ms intervals,2000 ms
first-to-last span, minimum691 and maximum701 (10-count spread). Associate this
with the immediately preceding+0.52 V report only as the instructed sequential
same-condition observation; meter and ADC were not sampled simultaneously, and
unchanged illumination/contact was not independently measured.

The teaching interpretation is that a meter expresses the S-to-GND difference
in volts, whereas this program reports uncalibrated12-bit ADC integers.0.52 V
and a raw reading near696 are not required to be equal. Do not turn this single
pair into a conversion factor, label696 as0.696 V or brightness percent, or
declare calibrated ADC accuracy. This completes the reported ordinary-light
comparison step, not all Week3 assessment/verification requirements.

The new sample/uptime values are lower than the earlier5068–5077/2534007–2538507
set. The sketch's counters restart on program restart, and the instructed USB
removal for installing e15 is consistent with a restart. The exact restart
instant/cause is not established by these five lines alone. Keep this sequence
separate; do not subtract timestamps across the two runs as elapsed measurement
time or infer a clock fault.

Latest next action: save the reported data, put probes down, close Serial Monitor,
unplug USB, confirm PWR off and turn the meter OFF. Leave wiring in place for now.
This is a requested safe pause before discussing the experiment; shutdown has
not yet been confirmed. Additional covered acquisition remains skipped at the
instructor's request. Earlier contradictory ordinary-light ranges and incomplete
controlled pairs remain documented, not silently marked passed. No new firmware
execution by the agent, student-profile release, commit or push occurred.

### Instructor-initiated darker-location comparison before shutdown

Before confirming the requested shutdown, the instructor reported moving the
photoresistor to a darker place and seeing `1.14` on the meter, followed by:

```text
device=BOARD-T01 sample=601 uptime_ms=300507 light_raw=1011
device=BOARD-T01 sample=602 uptime_ms=301007 light_raw=1013
device=BOARD-T01 sample=603 uptime_ms=301507 light_raw=1019
device=BOARD-T01 sample=604 uptime_ms=302007 light_raw=1020
device=BOARD-T01 sample=605 uptime_ms=302507 light_raw=1007
```

In the continuing A830L DC 20 V / red-to-S / black-to-GND context, record the
meter report as approximately +1.14 V. There is no new meter photo or independent
probe-placement check. Calculated checks: five consecutive sample numbers, four
500 ms intervals, 2000 ms first-to-last span, minimum 1007, maximum 1020 and
13-count spread. No missing sample is invented.

| Reported condition | Meter S-to-GND report | Subsequent raw range | Samples |
|---|---|---|---|
| Preceding ordinary-light observation | +0.52 V | 691–701 | 376–380, five |
| Moved to a darker place | +1.14 V | 1007–1020 | 601–605, five |

Both reported quantities increased: the meter by 0.62 V, and every new raw value
exceeds the preceding ordinary-light range. This supports the limited teaching
conclusion that, for this reported setup and these observations, darker placement
corresponded to higher S-to-GND voltage and higher raw. A larger raw value is not
automatically a brighter condition. It does not establish a proportional
voltage-to-raw conversion, calibrated ADC accuracy, a lux value or a brightness
ratio. Meter and ADC readings are sequential, not proven simultaneous; their
precise numerical correspondence remains unverified.

Preserve the explicit label “moved to a darker place,” rather than relabelling it
as covering the sensor at an unchanged position. Illumination, orientation and
possible contact changes from movement were not independently controlled. Keep
the earlier covered set (1419–1450), ordinary-light sets (275–287 and 2159–2195),
and unlabelled discovery readings separate; this addition does not resolve their
differences. Do not merge these five samples with an older set to claim a single
ten-sample acquisition.

The instructor volunteered this additional observation after previously declining
repeated covered acquisition. This is not authority to demand more repetitions
or a change to the published course requirements. No shutdown has been confirmed;
the latest log shows the program running when those lines were captured. The
next guided step remains putting probes down, closing Serial Monitor, unplugging
USB, confirming PWR off and setting the meter OFF before the focused Discussion.

Only this lab record and the hardware handoff were updated. Checks: counts,
timestamp gaps, ranges, comparison direction and document diff review. No student
notebook or firmware change, agent-operated physical test, ADC-profile release,
commit or push occurred.
