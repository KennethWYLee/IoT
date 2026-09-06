# Week 1: Course Overview, Assessment, and Project Direction

Date: September 9, 2026<br>
Course: Internet of Things

No hardware is required, connected, or powered on in Week 1, and no program will be
uploaded. This week establishes the project expectations, the eighteen-week learning
path, the assessment structure, material responsibilities, and the preparation required
before Week 2.

The objectives below describe the **end of the course**, not skills that must already
be mastered in Week 1. This week, explain one possible interaction in everyday language,
identify the roles of its parts, and use the course rules to plan your preparation.
Protocol names and electrical terms will be taught before their practical use.

Reading path: [a first IoT example](#first-iot-example) →
[schedule](#course-schedule) → [assessment](#assessment) →
[final-project requirements](#final-project) → [materials](#materials) →
[safety](#safety) → [records and AI](#records-and-ai) →
[idea card](#idea-card) → [Week 1 evidence](#week1-evidence) →
[preparation before Week 2](#before-week2).

## 1. Week 1 Overview

### 教學目標

完成本課程後，學生應能：

1. 設計全端物聯網系統（full-stack IoT system），整合實體輸入與輸出、ESP32-S3、網路通訊（network communication）、後端（backend）、資料庫（database）與行動介面（mobile interface）。
2. 依據適當的電壓（voltage）、供電（power supply）、接地（grounding）、訊號（signal）與故障安全（fail-safe）原則，安全地建立及操作嵌入式硬體（embedded hardware）。
3. 運用超文字傳輸協定（HTTP）、網頁雙向通訊協定（WebSocket）、訊息佇列遙測傳輸協定（MQTT）、結構化資料（structured data）、持久化儲存（persistent storage）與系統紀錄（system log），實作可靠的裝置與軟體之間的資料及命令流程。
4. 運用可觀察的行為、量測、紀錄、故障證據與可重現的設定說明，測試、排查、記錄並解釋物聯網專題。

### 教學內容

共同硬體練習是「紅綠燈遮光挑戰」：開始按鈕（Start）啟動倒數，光敏模組（photoresistor module）辨認遮光事件，三色發光模組（RGB LED）提示允許或禁止，有機發光顯示器（OLED）呈現時間與次數，舵機（servo）以紙指針指出有效次數，蜂鳴器（buzzer）提示失敗。這是Week 3～7共同練習，不限定期末題目。

本課程介紹完整物聯網系統（Internet of Things, IoT）的設計，將實體裝置與具有實際用途的軟體連接起來。學生會學習感測器（sensor）與按鈕（pushbutton）如何提供輸入、ESP32-S3如何解讀輸入，以及發光二極體（LED）、蜂鳴器（buzzer）、舵機（servo）或其他致動器（actuator）如何產生可觀察的實體反應。電氣安全、供電、接地（grounding）、訊號品質（signal quality）、系統狀態（system state）及錯誤復原（error recovery），都是設計過程的必要部分。

課程也涵蓋裝置與其他系統連接所需的通訊及軟體層。學生會透過無線網路（Wi-Fi）連接裝置，以超文字傳輸協定（HTTP）、網頁雙向通訊協定（WebSocket）或訊息佇列遙測傳輸協定（MQTT）交換結構化資料（structured data），開發後端服務（backend service）、將事件（event）存入資料庫（database），並利用紀錄（log）了解操作成功或失敗的原因。適合手機使用的介面會提供即時狀態、歷史資訊及受控命令（command）。

上述部分最後整合為具有明確使用者與用途的全端物聯網專題（full-stack IoT project）。完成的系統應包含有意義的實體互動、可靠的資料流（data flow）、安全行為、錯誤處理（error handling）、測試證據，以及足以讓他人理解並重建系統的文件。

<a id="first-iot-example"></a>

### A First IoT Example: A Local Game and a Connected Device

The common hardware exercise is a traffic-light shade challenge. Press Start, then cover
and uncover the light sensor while the indicator is green. Each new stable cover adds one;
a new cover during red subtracts one, down to zero. Holding it covered does not keep scoring.
The OLED shows time and effective count; a short paper pointer on a servo indicates 0–6.
Reach six and press Finish before the deadline. Reaching six alone does not stop time,
and a later red penalty can reduce it again. Failure produces a brief buzzer sound.
A device fault or manual abort is recorded separately from player failure.

Week 3 teaches classification, Week 4 dual sensors and one-shot events, Week 5 RGB and
OLED timing, Week 6 the servo pointer and external power, and Week 7 the complete rules.
DHT11 has a meaningful Week 4 task but is not forced into the game. This preview is not
a tested device, and game scores are not course grades. No hardware is operated now.
A final project can use another topic. The desk-indicator example below explains how
networked software can extend a local physical interaction.

Consider a proposed desk indicator: a person presses a button to request help, a light
changes color, and a phone shows which desk requested help. Later, an authorized user
can acknowledge the request from the phone. This is a **design example**, not a tested
device or a complete final-project submission. No wiring or programming is needed now.

The button, development board, and light are **hardware**: physical parts that can be
touched. **Software** is the set of instructions that decides what those parts do and
what the phone displays. The ESP32-S3 is the **controller** in this example: its program
reads the button and decides how to control the light. An **input** supplies information
to that program; an **output** is a response it controls. Here the input is a button
press and the output is a visible light. In another project, a **sensor** could provide
an input by detecting an environmental condition, such as changing light. An
**actuator** produces a physical response, such as a servo moving an arm.

The local interaction can be described without any network:

```text
Person presses the button
  → ESP32-S3 program reads the press and changes the desk state to "help requested"
  → Program commands the indicator light to change color
  → Person checks whether the light actually changed
```

That local interaction alone is not the complete connected system required in this
course. **IoT (Internet of Things)** connects physical devices with networked software
so that events can be shared and devices can be monitored or controlled. The course
can use a local network; this does not require a paid cloud service or an Internet-wide
public website. For the example, the additional parts have distinct jobs:

| Part | Meaning in this example | What a person could check |
|---|---|---|
| Network | Carries messages between the ESP32-S3 and the backend | Did the help-request message arrive? |
| Backend | A program running on a computer that receives events, checks commands, and prepares responses | Was a request accepted or rejected, and why? |
| Database | Organized, persistent storage for events and results | Can an earlier request still be retrieved after the backend restarts? |
| Log | A record of what a program did or encountered, used to trace a problem | Was an event received, or did an operation fail? |
| Mobile interface, or frontend | The page the user sees and operates on a phone | Does it show a request, an old reading, or a connection problem? |

Now follow two different messages. An **event** reports something that happened;
a **command** asks the device to do something. Neither word means electrical current.

```text
Event: "Desk A requested help"
  ESP32-S3 → network → backend
                         ├─ saves the event in the database
                         └─ sends an update to the phone interface

Command: "Acknowledge Desk A's request"
  Phone interface → backend checks permission → network → ESP32-S3 checks its state
    → device accepts and attempts the light change, or rejects the command
    → device result returns to the backend → recorded result and phone update
```

The arrows describe **information flow**, not a wiring diagram. The database stores
information; it does not power the light. WebSocket, introduced later, provides the
backend-to-browser update channel; HTTP and MQTT are communication methods studied
later for exchanging messages. Their syntax is not a Week 1 requirement.

A phone message saying “sent” proves only that sending was attempted at that stage.
It does not prove that the device received the command or that the light changed.
The backend waits for a device result; if none arrives within a defined waiting period,
it records a **timeout**. A timeout means “no result received in time,” not “the light
definitely stayed off.” A device report and a person's observation of the light are
also different kinds of evidence. Later laboratories teach how to compare them.

Before using this example to develop your own idea, point out its input, controller,
output, stored event, and phone action. Explain what would remain unknown if the
network were disconnected. If a part has no clear job in your idea, return to the user
need before adding more hardware. The detailed safety, reliability, and documentation
requirements below still apply to the final project.

## 2. Course Information

| Item | Information |
|---|---|
| Class | Four-Year Bachelor's Program in Information Management, Year 2, Class B |
| Instructor | Wen-Yi Lee |
| Class Time | Wednesdays, Periods 5-7, 13:30-16:15 |
| Weekly Hours | 3 hours |
| Prerequisite Knowledge | Basic programming experience in any language; no prior electronics or robotics experience is required |
| Primary Development Board | ESP32-S3-DevKitC-1 N16R8 with pre-soldered downward-facing 44-pin headers |
| Material Language | The Week 1 course outline is in English; operational laboratory materials use Traditional Chinese with necessary English interface labels and technical terms |
| Textbooks and Services | No required textbook purchase and no required paid cloud service |

Administrative fields such as credits, course code, required or elective status, and
the official language of instruction are subject to the final university registration
system announcement.

The board name in the purchase list does not replace inspection of the delivered PCB
and module. A matching memory label alone does not establish identical pin positions
or power connections. The [delivery check](week1_support.md#delivery-check) explains
what to confirm before using a course wiring example.

<a id="course-schedule"></a>

## 3. Eighteen-Week Course Schedule

| Week | Date | Core Content | Main Outcome |
|---:|---|---|---|
| 1 | 09-09 | Course orientation, assessment, materials, and challenge preview | Explain the common exercise and self-selected final project; no hardware operation |
| 2 | 09-16 | ESP32-S3, safe wiring, buttons, and debounce | Existing Week 2: upload, Serial, continuity, GPIO events and debounce evidence |
| 3 | 09-23 | Electrical measurement, ADC, and indoor/shade classification | Retain measurements and resistor-divider work; add local calibration and Serial labels |
| 4 | 09-30 | Resistor ranges, DHT11, dual sensors, and buzzer events | Independent sampling, per-sensor quality, one-shot events, fault injection and recovery |
| 5 | 10-07 | RGB, OLED countdown, and time control | Align visible states and elapsed-time countdown; no servo power |
| 6 | 10-14 | SG90 paper pointer, 0–6 scale, external power, and safety | Map count to verified safe positions; test power, mounting, stop and recovery |
| 7 | 10-21 | Traffic-light shade challenge integration | Integrate scoring, countdown, Finish, pointer and failure sound; test boundaries and abort |
| 8 | 10-28 | Project Report 1: topic and technical feasibility | One 12–15 minute report per group: hardware segment, data flow, risk and questions |
| 9 | 11-04 | Instructor abroad: optional reading | No required attendance, new submissions or assessment |
| 10 | 11-11 | Individual Written Exam 1: Weeks 2–7 hardware and safety | Individual examination only; no new instruction or laboratory work |
| 11 | 11-18 | Wi-Fi, HTTP, JSON, WebSocket and backend | Trace device events and mobile commands/results with low-power outputs |
| 12 | 11-25 | MQTT, database and structured logs | Topics, presence, commands/acks, persistence and minimal history queries |
| 13 | 12-02 | Project Report 2: progress, feedback and revision | Implementation evidence, problems and a revision plan; further improvement remains possible |
| 14 | 12-09 | Mobile frontend, responsive web/PWA and permissions | Live/history/control/offline/error and permission flows |
| 15 | 12-16 | Automation, safety, fault recovery and reconstruction | One automation, three fault tests and clean-environment reconstruction |
| 16 | 12-23 | Individual Written Exam 2: networks and integration | Assess Weeks 11, 12, 14 and 15; no new instruction or project-progress submission |
| 17 | 12-30 | Project Report 3: final demonstration and individual questions | All groups present this week; one grade per group, with individual questions |
| 18 | 01-06 | University final examination week: reserved | No regular materials, new content or assessment |

<a id="assessment"></a>

## 4. Assessment

| Assessment | Weight | Primary Evidence |
|---|---:|---|
| Coursework | 15% | Weekly laboratory work, questions and answers, Lab Notebook, documentation, safety, collaboration, and verified AI use |
| Project Report 1 (Week 8) | 15% | Topic, hardware segment, software purpose, architecture, materials, risks, and acceptance criteria |
| Individual Written Exam 1 (Week 10) | 15% | Hardware wiring, GPIO and GND, electrical measurement, ADC, common ground, sensing, actuation, power, state machines, and safety |
| Project Report 2 (Week 13) | 15% | Current implementation evidence, progress status, identified problems, risk analysis, and a revision plan |
| Individual Written Exam 2 (Week 16) | 15% | Wi-Fi, HTTP, JSON, WebSocket, MQTT, integrated data flow, and log-based troubleshooting |
| Project Report 3 (Week 17) | 25% | Complete physical interaction, frontend and backend, data, reliability, testing, documentation, and individual understanding |
| Total | 100% |  |

Hardware cost, mechanical complexity, and project speed do not directly earn additional
credit. A project built from basic materials can meet the highest expectations when it
provides reliable interaction, a complete data flow, a clear mobile workflow, and
sufficient testing evidence.

The three project reports are checkpoints in one developing project: feasibility in
Week 8, implementation progress and revision in Week 13, and the final demonstration
in Week 17. Each group receives only one Project Report 3 grade. The two written
exams are individual work; a group demonstration does not replace either exam.

<a id="final-project"></a>

## 5. Minimum Final Project Requirements

These are semester-end requirements. In Week 1, use them to understand the direction
of the course; do not attempt to build all layers or buy optional parts immediately.
The final project must include all of the following:

- A physical artifact that operates safely and addresses a clearly described use case.
- An ESP32-S3 or another controller approved by the instructor.
- At least one physical input and one physical output; an exception must be approved
  during Week 8.
- Wi-Fi and device communication through HTTP or MQTT.
- A student-developed backend that can be restarted from documented instructions.
- A database, historical queries, and structured logs.
- A mobile-friendly interface showing real-time data, history, controls or settings,
  and error or offline states.
- Real-time updates through WebSocket; every control action must leave a command,
  result or acknowledgement, or timeout record.
- At least one automated response, state machine, or schedule.
- At least three tests, including one involving disconnection, invalid input, an
  abnormal sensor value, or a stopped service.
- Source code, a wiring diagram, a data-flow diagram, data formats, a bill of materials,
  reconstruction instructions, AI-use and verification records, and known limitations.

A ready-made dashboard or IoT platform may be used as a supporting tool, but it cannot
replace the student-developed device program, backend, database, or mobile interface.

<a id="materials"></a>

## 6. Week 1 Purchase Summary

### Required Electronics Kit for Each Student

| Item | Quantity per Student |
|---|---:|
| ESP32-S3 development board | 1 |
| 400-point breadboard | 1 |
| 20 cm jumper wires: male-to-male, male-to-female, and female-to-female | 1 strip of each type |
| Assorted resistor kit | 1 kit |
| Four-pin tactile pushbutton | 2 |
| KY-018 photoresistor input module | 1 |
| YS-31 DHT11 temperature and humidity module | 1 |
| KY-016 RGB LED module | 1 |
| KY-012 active buzzer module | 1 |
| SG90 180-degree micro servo | 1 |
| 4AA battery holder with switch | 1 |
| OLED countdown/status display; approved controller, voltage and pinout required before purchase | 1 |

**NT$659 per student is the historical kit subtotal before adding the OLED**, not the
revised complete cost. The OLED price and updated total are pending; unknown prices are
not zero. USB cable, batteries, verified power adapter, group meter, mounting and shipping
remain additional costs. The exact models and specifications, first and
later weeks of use, additional student-provided items, items not yet required, product
identification images, and delivery inspection procedure are maintained in the
[Week 1 support material](week1_support.md#purchase-table).

### Required Measurement Tool for Each Group

Students work in groups of one to three. Each group must prepare one digital multimeter
that can measure continuity, resistance, and low-voltage DC. A one-person group may
share a multimeter with another group, but each group must perform and preserve its own
measurements and conclusions. The instructor's A830L is a demonstration and reference
instrument, not the normal instrument assigned to a student group.

The meter answers different questions in different modes: whether two points have a
low-resistance connection, how much resistance a path has, or how much voltage differs
between two points. Week 2 starts with unpowered checks; Week 3 teaches powered voltage
measurement. The modes and probe positions are explained before use. Follow the
[group-tool specifications](week1_support.md#group-measurement-tool) when purchasing.
The meter is used again in later hardware and project troubleshooting; its cost is
separate from the historical NT$659 electronics-kit subtotal.

<a id="safety"></a>

## 7. Hardware and Data Safety Responsibilities

No hardware is operated in Week 1. These terms explain the safety rules that will apply
when laboratory work begins in Week 2.

First distinguish three pin roles. A **power pin** supplies or receives power within
its specified limits; VCC is a common supply label, not a universal voltage value.
**GND (ground)** is the circuit's reference point, commonly treated as 0 V.
A **signal pin** carries information, such as an input reading or an output-control
level. **GPIO** means general-purpose input/output: a configurable controller pin.
These roles are not interchangeable. A printed number may identify a GPIO; it does
not specify how many volts that pin supplies. Week 2 introduces the actual board
labels and the distinction between a signal and a power connection.

For every laboratory activity:

1. Disconnect all power before wiring, rewiring, or continuity measurement.
2. Do not infer VCC, GND, or signal pins from a shopping-page image. Use the labels on
   the physical device and the course wiring table.
3. Do not connect a 5 V signal directly to an unprotected ESP32-S3 GPIO pin.
4. Do not drive a servo, motor, pump, solenoid, or other high-current load directly
   from a GPIO pin.
5. External power and ESP32 control signals must use verified common grounding and a
   safe-stop method.
6. Disconnect power and stop immediately if there is heat, an unusual smell, abnormal
   sound, repeated restarting, or a loose connection.
7. Do not commit Wi-Fi passwords, API keys, tokens, student personal information, or
   identifiable grade data to Git.
8. Do not collect identifiable images, audio, or other sensitive personal data without
   permission.

<a id="records-and-ai"></a>

## 8. Git, Documentation, and AI Responsibilities

**Git** records project versions on a computer. A **commit** saves a revision in
that local history; it does not automatically send files to GitHub. **GitHub** hosts
a remote copy of a repository, the project's files and revision history. A **push**
sends local commits to that remote repository. Arduino **Upload** is different again:
it writes a compiled program to the development board. The destination matters;
“saved on my computer,” “available on GitHub,” and “running on the board” are not the
same state. Practical commands are introduced when used, not required in this lesson.
The official [Git commit](https://git-scm.com/docs/git-commit) and
[Git push](https://git-scm.com/docs/git-push) references describe these separate actions.

A **Lab Notebook** is a laboratory record, not a claim that every test succeeded. For
example, “the program printed an output command” and “the meter measured the output
voltage” describe different checks. Record what was actually observed, its conditions,
and what still needs checking. Do not replace a missing measurement with an expected
number from an example.

- Each team must maintain traceable program versions, wiring diagrams, data flow, a
  bill of materials, test records, and known limitations.
- The Lab Notebook records the objective, procedure, result, error, correction, AI use,
  and next action.
- Generative AI may assist with an initial program draft, interface, data format, test
  case, or troubleshooting hypothesis.
- AI output is not verification evidence. Before submission, students must understand,
  revise, run, and preserve test evidence for all submitted work.
- A statement that “AI says it works” cannot replace official specifications, physical
  inspection, compilation, logs, measurements, or target-hardware testing.
- Every team member must be able to explain the submitted program, data path, wiring,
  and safety limitations.

<a id="idea-card"></a>

## 9. Project Idea Card

The initial direction proposed in Week 1 does not fix the final topic and does not
require students to purchase project-specific materials in advance. Use the
[project idea card](week1_support.md#project-idea-card) to record:

1. The intended user or use context.
2. One observable physical input.
3. One observable physical output.
4. What the software should record or how it should assist operation.
5. One currently known technical, safety, or scope risk.

<a id="week1-evidence"></a>

## 10. Week 1 Learning Evidence

Complete the following written activities in the
[Week 1 support material](week1_support.md#week-1-learning-evidence). They do not
require hardware, software installation during class, or a fixed final-project topic.

1. Compare two possible project ideas, select one provisional direction, and explain
   why its physical input, physical output, and software purpose form a feasible core
   interaction.
2. Trace one event from a physical input through the controller, network, backend,
   database, and mobile interface. Then trace one command in the reverse direction
   until a physical result or failure record is produced.
3. Classify the assessment and schedule scenarios by citing the relevant course week
   or assessment rule.
4. Complete the personal material-readiness check without purchasing optional project
   parts before the topic is reviewed in Week 8.
5. For each safety and evidence scenario, record the first safe action and the course
   rule that supports it.

The Week 1 evidence is complete when every response identifies a reason or a source,
the selected idea can be represented as a physical input-to-output interaction, and
no response depends on guessing a pin, voltage, test result, or future project need.
If a response conflicts with this course outline, revise it before completing the
Week 2 preparation checklist.

<a id="before-week2"></a>

## 11. Complete Before Week 2

The written course activities are completed in Week 1. The following installation
and material-preparation tasks are completed **after class, before Week 2**; they are
not an instruction to connect or power the board during Week 1.

- [ ] Read this course outline and confirm the assessment weights and key weeks.
- [ ] Complete the project idea card.
- [ ] Order the required materials or confirm equivalent existing items against the
  official purchase list.
- [ ] Read and complete the
  [Week 2 pre-class setup](week1_support.md#week-2-preclass-setup).
- [ ] Confirm that Arduino IDE 2 opens successfully.
- [ ] Install the Espressif `esp32` board package.
- [ ] Obtain the latest version of the course repository.
- [ ] Confirm that the USB cable supports data transfer.
- [ ] Report any missing materials or specification differences before Week 2.

Completion of all items above satisfies the Week 1 course requirements. Work with the
ESP32-S3, program upload, Serial, GPIO, button wiring, and unpowered multimeter checks
begins in Week 2. Powered voltage measurements follow in Week 3.
