# Week 3 guided walkthrough record

Date: 2026-08-30
Board: BOARD-T01
Purpose: record questions and observable results from the instructor's first independent walkthrough of Week 3. This is a maintenance record, not student-facing material.

## Recording rule

- Proceed one action at a time.
- A question from the instructor indicates that the current student explanation may be insufficient.
- Record the underlying concept, the missing explanation, and the eventual observable result.
- Rewrite confirmed gaps into `week3_main.ipynb` after the corresponding experiment segment is complete.
- Do not claim target or physical validation until the action has actually been completed.

## Starting state

- Week 3 begins with a de-energized inspection and measurement setup.
- The resistor kit is currently at school, so the loose-resistor measurement segment remains pending.
- KY-018 remains disconnected until the board power and GPIO measurement segments are complete.

## Questions and material changes

- The phrase "the other GND near USB" was ambiguous. With the module/antenna at the top and USB connectors at the bottom, instructions must say: upper-right `GND` versus lower-left `GND` beside `5Vin`. Do not rely on "near USB" alone.
- A continuity beep alone is insufficient evidence. The student instructions must require the complete display, including the decimal-point position, and compare the GND-to-GND result with the probe-tip baseline measured immediately before it.
- Holding the board and two probes simultaneously is not a reliable one-person procedure. The student material must establish stable breadboard test points before repeated measurements and provide a safe alternative when a learner cannot keep both probes in contact.
- During test-point construction, the instructor requested the complete insertion map at once. The student material should present one color/board-pin/breadboard-coordinate table before the detailed verification steps, rather than forcing four separate instruction-response cycles.
- After wiring the four test-point extensions, the instructor asked why the topology is needed, what current path exists, what `5Vin` means, and why `GND` is included. The student material must explicitly distinguish an unpowered/open measurement extension from a complete load circuit, explain voltage as a two-point comparison, and show the meter's small closed measurement path.
- The initial measurement-loop diagram jumped directly from `3V3` to the red probe and omitted the red jumper plus breadboard row `a6–e6`. The instructor correctly expected `3V3→red jumper→a6`. Future diagrams must show every physical segment and explain that `a6–e6` is one node, not five sequential stops.
- The instructor initially interpreted voltage measurement as "row 6 connects to row 3; 3V3 connects to GND; this is HIGH." The material must distinguish (1) direct wire connection, which is a short circuit; (2) connection through the meter's high input resistance, which permits only a tiny measurement current; and (3) digital `HIGH`, which describes a GPIO voltage relative to GND rather than the 3V3 rail measurement itself.
- The first correction remained too abstract because it introduced resistance, Ohm's law, measurement current, and digital logic together. The walkthrough must first establish one visual model: GND as the ground floor, 3V3 as a fixed-height platform, GPIO5 as a movable elevator, and the voltmeter as a ruler. Equations and current paths come only after the four roles are separated.
- The ground/platform/elevator/ruler model improved understanding. The instructor correctly identified that a GPIO measured near 0 V is `LOW` and near 3.3 V is `HIGH`, and that logic terms apply to GPIO signals. One ambiguity remained: "connect rows 3 and 6" must be split into "place the voltmeter across rows 3 and 6" (measurement) versus "bridge rows 3 and 6 with an ordinary wire" (short circuit).
- During the first GPIO5 voltage measurement, the instructor reported `HIGH=-3.2 V` and `LOW=0 V`. The student material must explain that the minus sign is a direction indicator: the meter's red input was at a lower potential than its black input. The magnitude can support a voltage difference near 3.2 V, but the expected red-on-GPIO/black-on-GND orientation must be physically rechecked before accepting the GPIO polarity result.
- After completing the four jumper extensions, the instructor asked whether it is correct that the meter has not yet been added. The material should mark this as an explicit checkpoint: test points are built first while USB is disconnected and the meter is OFF; the meter is then applied temporarily for off-power continuity checks and later voltage measurements, not installed as a fifth permanent jumper.
- The instructor asked whether the standard A830L probe tips can connect directly to breadboard holes. The material must say not to force standard conical probes into breadboard contacts: they can spread the spring clips, make unreliable contact, or slip toward adjacent nodes. Use a male-to-male jumper as an exposed test pin unless a probe has a verified breadboard-sized adapter.
- The instructor used column `e` rather than the example column `b` for all temporary male-to-male probe extensions. This is electrically equivalent because `a–e` in the same row is one node. Instructions must identify `b` as an example and permit any verified free hole in the same five-hole group; crossing to `f` is not equivalent.
- The instructor asked whether all male-to-male probe extensions should now be removed. The material must explicitly end the isolation-test segment by removing temporary exposed test jumpers, retaining only the four male-to-female board extensions, setting the meter to `OFF`, and keeping USB disconnected until the pre-power visual check is complete.
- During off-power continuity screening, row 3 to row 12 showed no beep but a large display value. The material must state that a large continuity/resistance-mode display is not a voltage and is not digital `HIGH`; with the board unpowered it only indicates that the meter did not find a low-resistance direct path under the current test condition.
- Before the P5V measurement, the instructor expected the display to be exactly `5 V`. The student material must distinguish a nominal rail name from a real measurement: `5V` or `5Vin` identifies a supply rail designed to operate near 5 V, while the observed value can differ slightly because of the USB source, cable and board voltage drops, contact quality, and meter accuracy. The basic check should use an explicitly documented acceptable-near-5-V criterion rather than require exactly `5.00 V`.

## Physical results

- Starting state confirmed by the instructor: ESP32 disconnected from USB, no KY-018 connected, meter at `OFF`, black probe in `COM`, and red probe in `VΩmA`.
- Meter continuity self-check reported complete. Exact open/closed display values were not provided, so only completion—not a numeric result—is recorded.
- Instructor visually located the board labels `3V3`, GPIO `5`, `5Vin`, and both accessible `GND` pins while the board remained unpowered.
- Upper-right `GND` to lower-left `GND` produced a continuity beep. The spoken display value was `61`; its decimal-point position was not yet confirmed, so the low-resistance result is not yet accepted.
- The GND-to-GND numeric recheck was stopped because it was not practical for one person to hold both probes steadily. No numeric continuity result is accepted from this attempt.
- Before test-point construction, the instructor confirmed that BOARD-T01 and the breadboard were separate and unpowered.
- Four male-to-female jumpers were prepared. Walkthrough color convention: brown=`GND`, red=`3V3`, orange=`5Vin`, yellow=`GPIO5`. These colors are labels only and do not determine electrical behavior.
- Instructor reported all four extensions connected: brown `GND→a3`, red `3V3→a6`, orange `5Vin→a9`, and yellow `GPIO5→a12`. USB remained disconnected; the wiring has not yet passed the off-power isolation check.
- Off-power isolation screening: row 3 (`PGND`) to row 9 (`P5V`) produced no continuity beep. This supports only "no low-resistance short detected under the current test condition"; it does not verify the powered P5V voltage.
- Off-power isolation screening: row 3 (`PGND`) to row 6 (`P3V3`) produced no continuity beep. This supports only "no low-resistance short detected under the current test condition"; it does not verify the powered P3V3 voltage.
- Off-power isolation screening: row 3 (`PGND`) to row 12 (`TPO`/GPIO5) produced no continuity beep and a qualitatively large display value. Exact digits and units were not recorded. This supports only "no low-resistance short detected" and does not establish a GPIO logic state.
- Off-power isolation screening: row 6 (`P3V3`) to row 9 (`P5V`) produced no continuity beep. All four required isolation pairs produced no sustained beep, so the wiring may proceed to the pre-power visual check; no powered voltage has yet been verified.
- The temporary isolation-test jumpers actually used `e3`, `e6`, `e9`, and `e12` as applicable, while the permanent extensions remained at column `a`. Because each `a–e` row is one node, the recorded row-pair results remain valid.
- Instructor proceeded after the cleanup instruction; the walkthrough state is recorded as temporary male-to-male probe extensions removed, four male-to-female board extensions retained, meter `OFF`, and USB still disconnected before the first powered observation.
- First powered observation with only the four permanent test-point extensions: `PWR` illuminated, `TX/RX` were not visibly illuminated, and no smoke, odor, abnormal sound, or other reported anomaly occurred. This passes the initial observable-fault screen only; no rail or GPIO voltage has yet been measured. The student material should state that unlit `TX/RX` is not a fault when no visible serial traffic is occurring.
- First P3V3 voltage attempt used the A830L DC 20 V range with black on the row-3 extension and red on the row-6 extension. Spoken readings were `2.8` and `2.9` V. This is below the expected approximately 3.3 V and is not accepted; the circuit was returned to USB-disconnected, meter-OFF state for physical trace and contact checks.
- Unpowered visual trace confirmed red `3V3→a6→e6` and brown `GND→a3→e3`, with the red board connector on a `3V3` pin rather than `RST`. Electrical continuity of each extension has not yet been independently rechecked.
- Controlled P3V3 repeat measurement 1 produced `3.2 V`. This is closer to the expected rail voltage than the first `2.8–2.9 V` attempt and suggests probe contact may have affected the original result; two more independent contacts are required before accepting repeatability.
- By instructor decision, the walkthrough accepts the stable-contact `3.2 V` reading as a basic approximate P3V3 functional check and proceeds without two additional repeats. This is not a precision or calibration claim; the earlier `2.8–2.9 V` contact-sensitive readings remain in the record.
- First P5V voltage attempt used the intended row-3 reference and row-9 target and produced a spoken reading of `0.5 V`. This is not close to the nominal 5 V rail and is not accepted. The walkthrough stopped before GPIO measurement and returned to USB-disconnected, probes-removed, meter-`OFF` state for an unpowered trace of the orange `5Vin→a9→e9` path and the brown `GND→a3→e3` path.
- The instructor confirmed the orange fixed path was `5Vin→a9`. A controlled repeat across the row-9 and row-3 test points produced `-0.6 V`. The sign shows that the observed polarity was opposite the assumed red-positive/black-reference direction, while the magnitude still does not establish a 5 V rail.
- Exact-board research found that the YD-ESP32-S3 design uses an `IN-OUT` solder jumper between USB VBus and `5Vin`: when the jumper is open, USB power does not reach `5Vin`; closing it bypasses a diode and changes the back-feed behavior. The saved BOARD-T01 front image visibly shows the two `IN-OUT` pads unbridged. Therefore the course assumption "USB-powered P5V should be near 5 V" is invalid for BOARD-T01's current factory configuration. `5Vin` must be taught as an external input on this board, not used as a USB-powered 5 V output test point. No soldering or jumper bridging will be included in the student lab.
- With `5Vin` isolated, the observed approximately `0.5` to `-0.6 V` is not a usable supply measurement and must not be interpreted as an intentional 0.6 V rail. The 5Vin output test is removed rather than assigned a fabricated expected value.
- After removing the unused 5Vin path, the Week 3 GPIO5 target-test setup retained brown `GND→a3`, red `3V3→a6`, and yellow candidate `GPIO5→a12`. Stable probe extensions use `e3` as PGND and `e12` as TPO. The teacher-side cycle sketch temporarily sets `PIN_TEST_OUTPUT=5`; this remains a candidate and must not be published as the course profile until LOW, HIGH, and post-reset voltage checks pass.
- The candidate cycle sketch compiled locally with `PIN_TEST_OUTPUT=5` and OPI PSRAM settings. Arduino IDE then uploaded through `COM8`: 302400 bytes were written (174070 compressed), flash data hash verification passed, and RTS automatic reset completed. This is compile/upload evidence only; physical GPIO5 voltage remains unverified at this point.
- At 115200 baud, Serial Monitor showed `cycle=15 phase=HIGH expected_voltage=near_3.3V measure_now=true`, `cycle=16 phase=LOW expected_voltage=near_0V measure_now=true`, and then `cycle=16 phase=HIGH expected_voltage=near_3.3V measure_now=true`. This confirms the running program's alternating commands, not the physical GPIO voltage.
- First physical GPIO5 cycle observation: the instructor reported `HIGH=-3.2 V` and `LOW=0 V`. This supports an alternating voltage-difference magnitude near 3.2 V versus 0 V, but the negative HIGH sign indicates reversed measurement direction somewhere between the meter inputs and the `e3`/`e12` test points. The polarity result remains pending a controlled probe-location check; it is not yet recorded as a verified positive HIGH.
- The unpowered physical trace confirmed `e3=PGND/GND` through the brown path and `e12=TPO/GPIO5` through the yellow path. With the black lead in `COM`, red lead in `VΩmA`, meter on DC 20 V, black probe on `e3`, and red probe on `e12`, the next commanded HIGH measured `+3.3 V`. This accepts one correctly oriented HIGH observation. A controlled LOW repeat and post-reset state remain pending before the candidate GPIO5 profile can be marked physically verified.
- Without moving either probe, the following commanded LOW measured `0 V`. The paired, correctly oriented observations now show GPIO5 changing from approximately 3.3 V at commanded HIGH to 0 V at commanded LOW. The post-reset startup measurement remains pending; these two steady-state observations alone do not prove the transient voltage during reset.
- After waiting for a commanded HIGH and short-pressing `RST`, Serial Monitor restarted with `week=3 pin_test_output=5 startup=LOW phase_duration_ms=10000` followed by `cycle=1 phase=LOW expected_voltage=near_0V measure_now=true`. This is accepted as post-reset software-command evidence: after `setup()` began, the sketch commanded GPIO5 LOW. It is not yet post-reset physical-voltage evidence, and it cannot describe any transient before `setup()` executed.

## Student-material integration completed before polarity recheck

The confirmed conceptual gaps from this walkthrough were rewritten into `week3_main.ipynb` as student-facing explanations rather than raw dialogue. The integrated material now includes:

- voltage as a two-point comparison and the rule `display = red-probe potential - black-probe potential`, with positive, negative, and zero examples;
- the distinction between a fixed 3V3 rail measurement and GPIO `HIGH`/`LOW`;
- the complete physical path through the jumper, breadboard node, meter's high-resistance input, and GND reference;
- the distinction between placing a voltmeter across two nodes and shorting them with an ordinary wire;
- GND as both the chosen 0 V reference and a circuit return node, without treating wire colors or printed `+`/`-` rails as electrical sources;
- why large current is not automatically desirable, why unintended low resistance can be dangerous, and how an off-power continuity screen finds a possible short without proving powered operation;
- the meanings of the A830L range labels, open/large continuity readings, and the rule that an unpowered resistance display is not a GPIO logic state;
- breadboard five-hole groups, the central gap, temporary test extensions, and a one-person procedure that does not force conical probes into breadboard contacts;
- `5Vin` as an external input distinct from GPIO5, including the BOARD-T01 open `IN-OUT` condition;
- the meanings and evidence limits of `cycle`, `phase`, `expected_voltage`, and `measure_now`;
- a controlled response to `LOW=0 V` and `HIGH=-3.2 V`, including why LOW cannot reveal reversed probe direction and why board power wires must not be exchanged as a correction.

## Scope decision after steady-state GPIO verification

After the correctly oriented `HIGH=+3.3 V`, `LOW=0 V`, and post-reset `startup=LOW` Serial observations, the instructor identified the proposed post-reset 0 V meter reading as conceptually repetitive for Week 3. The course decision is:

- Week 3 requires physical meter evidence for steady-state GPIO LOW and HIGH.
- Week 3 keeps the post-reset `startup=LOW` lines as software-command evidence only.
- Week 3 does not require another 0 V reading immediately after reset because it repeats the already taught LOW measurement and still cannot capture the reset transient.
- Reset-transient behavior, safe startup of a load, and fault recovery belong to the later state-machine／safety work where they support a new system-level claim.

The BOARD-T01 result may therefore be recorded as a steady-state GPIO5 output pass with an explicit limitation: it does not prove the voltage during the interval before `setup()` executes and does not establish the same profile for BOARD-T02, BOARD-T03, or a student batch.

## GPIO5 final validation summary

| Item | Recorded evidence | Interpretation |
|---|---|---|
| Board and USB | BOARD-T01, YD-ESP32-S3 Type-A V1.5／ESP32-S3-WROOM-1 N16R8; board-back `COM` connector; Windows `COM8` | Applies only to BOARD-T01 |
| Arduino settings | `ESP32S3 Dev Module`; 16 MB Flash; OPI PSRAM; Upload Speed 115200; Serial Monitor 115200 baud | Settings used for this run |
| Firmware | `examples/week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino`; teacher-side candidate `PIN_TEST_OUTPUT=5`; each phase 10,000 ms | GPIO5 alternates steady LOW and HIGH without a load |
| Electrical path | Brown `GND→a3`, temporary black-probe point `e3`; yellow `GPIO5→a12`, temporary red-probe point `e12`; the unused orange 5Vin path was removed | `a–e` in each numbered row is one node; GND and GPIO5 remain separate nodes |
| Meter | A830L; black lead in `COM`; red lead in `VΩmA`; DC `V⎓ 20` | Meter displays red-probe potential minus black-probe potential |
| Off-power screen | PGND↔TPO produced no sustained continuity beep before power | No low-resistance short was detected under that test condition; this did not prove a valid powered voltage |
| Compile and upload | IDE Verify passed; upload through COM8 wrote 302400 bytes (174070 compressed) in 15.5 s; flash hash verified; RTS reset completed | Toolchain, transfer, and flash verification passed; not yet physical-voltage evidence by themselves |
| Serial cycle | Logs included `cycle=15 phase=HIGH`, `cycle=16 phase=LOW`, and `cycle=16 phase=HIGH`, each with the matching `expected_voltage` text | Confirms commands and measurement windows, not measured voltage |
| First physical attempt | `HIGH=-3.2 V`, `LOW=0 V` | Magnitude changed with phase, but the negative HIGH exposed reversed measurement direction; it was not accepted as the final positive HIGH result |
| Controlled polarity check | Physical trace confirmed `e3=PGND` and `e12=TPO`; black probe was placed on `e3`, red probe on `e12` | Establishes the intended measurement direction |
| Accepted steady HIGH | `+3.3 V` during commanded HIGH | BOARD-T01 GPIO5 steady HIGH voltage passed for this setup |
| Accepted steady LOW | `0 V` during the following commanded LOW without moving the probes | BOARD-T01 GPIO5 steady LOW voltage passed for this setup |
| Reset command | After Reset from a commanded HIGH, Serial restarted with `week=3 pin_test_output=5 startup=LOW phase_duration_ms=10000` and `cycle=1 phase=LOW expected_voltage=near_0V measure_now=true` | Proves the first command after entering `setup()` was LOW; it does not prove the reset transient voltage |

Final result: BOARD-T01 GPIO5 passed the Week 3 steady-state output test at approximately 0 V for LOW and 3.3 V for HIGH. Reset produced the expected startup command in Serial. No claim is made about the voltage before `setup()`, behavior under a connected load, fault recovery, or any other physical board.

## KY-018 identification handoff

- A new, clearer unpowered photo was saved as `docs/images/hardware/actual/ky018-photoresistor-module-actual-pin-labels.jpg`.
- With the photoresistor at the top and the three header pins at the bottom, the standalone `S` beside the left pin and standalone `-` beside the right pin are visible.
- The instructor correctly observed central text `A`, `S1`, and `R1`. These are located among the component pads rather than immediately beside the middle header pin. `R1` conventionally identifies the fixed resistor. The exact purposes of `A` and `S1` are not assigned from the photo alone; none of these central marks is accepted as the middle header-pin label.
- The exact physical board does not visibly label the middle header pin with `+` in this photo. Although the Joy-IT KY-018 reference documents the functional terminals as Signal, +V, and GND with a fixed 10 kΩ resistor, the course will keep the module unpowered until an off-power resistance check supports the exact-board voltage-divider topology.

## Week 3 loose-resistor scope decision

- The instructor confirmed that Week 3 already introduces the KY-018 and asked whether loose resistors were necessary in the same unit.
- Week 3 no longer requires separate 220 Ω, 1 kΩ, and 10 kΩ resistors. Resistance, range selection, and the voltage-divider prerequisite will be introduced through the exact KY-018 module's onboard fixed resistor `R1` and photoresistor.
- The loose resistor kit remains a course material for later current limiting, pull-up or pull-down, voltage-divider, and project circuits when explicitly required; a multimeter does not replace a resistor installed in a working circuit.
- The current physical test keeps the ESP32 and KY-018 unpowered. Three isolated female-to-male jumper wires are attached to the standalone `S`, the unlabeled middle pin, and the standalone `-` so all three resistance paths can be measured without applying power.
