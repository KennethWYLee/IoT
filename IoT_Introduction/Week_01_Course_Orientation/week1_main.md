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

### Teaching Objectives

Upon successful completion of this course, students will be able to:

1. Design a full-stack IoT system that integrates physical input and output, an
   ESP32-S3, network communication, a backend, a database, and a mobile interface.
2. Build and operate embedded hardware safely by applying appropriate voltage, power,
   grounding, signal, and fail-safe principles.
3. Implement reliable device-to-software data and command flows using HTTP, WebSocket,
   MQTT, structured data, persistent storage, and system logs.
4. Test, troubleshoot, document, and explain an IoT project using observable behavior,
   measurements, logs, failure evidence, and reproducible setup instructions.

### Teaching Content

This course introduces the design of complete IoT systems that connect physical
devices with useful software. Students will learn how sensors and buttons provide
input, how an ESP32-S3 interprets that input, and how LEDs, buzzers, servos, or other
actuators create observable physical responses. Electrical safety, power, grounding,
signal quality, system states, and recovery from errors are treated as essential parts
of the design process.

The course also covers the communication and software layers that make a device part
of a larger system. Students will connect devices through Wi-Fi, exchange structured
data with HTTP, WebSocket, or MQTT, develop backend services, store events in a
database, and use logs to understand successful and failed operations. A mobile-friendly
interface will provide real-time status, historical information, and controlled commands.

These elements will be combined into a full-stack IoT project with a clear user and
purpose. The completed system should include meaningful physical interaction, reliable
data flow, safe behavior, error handling, testing evidence, and enough documentation
for another person to understand and rebuild it.

<a id="first-iot-example"></a>

### A First IoT Example: A Desk Status Indicator

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
| 1 | 09-09 | Course orientation, assessment, project expectations, materials, and safety responsibilities | Course acknowledgement and project idea card; no hardware operation |
| 2 | 09-16 | ESP32-S3, Upload, Serial, GPIO, GND, and measurement | Upload and Serial evidence, unpowered continuity checks, button-input and output-command logs, and button-debounce discussion |
| 3 | 09-23 | Electrical measurement and ADC foundations: resistance, voltage, 3.3V/5V, GPIO LOW/HIGH, reset state, and raw analog values | Resistance, supply-pin, GPIO-voltage, and ADC baseline evidence with units and measurement conditions |
| 4 | 09-30 | KY-018, DHT11, calibration, sampling, valid and invalid values, and sensor quality | Valid and invalid light, temperature, and humidity records with sampling conditions |
| 5 | 10-07 | RGB LED, buzzer, SG90 servo, 4AA power, common ground, and safe stop | Status indication, constrained motion, and timeout testing |
| 6 | 10-14 | Standalone interaction, state machines, physical STOP, and error recovery | A repeatable light-responsive state device with safe stop and recovery evidence |
| 7 | 10-21 | Project Report 1: topic and technical feasibility | Hardware segment, data flow, materials, risks, and acceptance criteria |
| 8 | 10-28 | Individual Written Exam 1: hardware wiring, electrical concepts, and safety | Individual written work for the entire class; no new content or laboratory work |
| 9 | 11-04 | Instructor abroad | No required attendance and no new assessed work; optional reading is provided |
| 10 | 11-11 | Wi-Fi, HTTP, JSON, WebSocket, backend, and bidirectional mobile control | Real device events reach a phone; mobile commands and device results are traceable |
| 11 | 11-18 | MQTT messaging and persistent data: topics, presence, commands, acknowledgements, database records, structured logs, and minimal historical queries | One event and command result persist through MQTT into a database and can be explained with cross-layer logs |
| 12 | 11-25 | Project Report 2: progress review, feedback, and revision plan | Current implementation evidence, identified problems, feedback, and a prioritized revision plan |
| 13 | 12-02 | Mobile frontend, responsive web or PWA, and permissions | Real-time data, history, controls, and error or offline flows |
| 14 | 12-09 | Automation, safety, fault recovery, and reconstruction | Automated behavior, three fault tests, recovery, and reconstruction in a clean environment |
| 15 | 12-16 | Individual Written Exam 2: network communication and integrated hardware-software architecture | Individual written work for the entire class; no new content or laboratory work |
| 16 | 12-23 | Project Report 3: final demonstration and individual questions | Final presentations according to the published schedule; no new content |
| 17 | 12-30 | Project Report 3: final demonstration and individual questions | Final presentations according to the published schedule; no new content |
| 18 | 01-06 | University final examination week: reserved | No regular materials, new content, or assessment |

<a id="assessment"></a>

## 4. Assessment

| Assessment | Weight | Primary Evidence |
|---|---:|---|
| Coursework | 15% | Weekly laboratory work, questions and answers, Lab Notebook, documentation, safety, collaboration, and verified AI use |
| Project Report 1 (Week 7) | 15% | Topic, hardware segment, software purpose, architecture, materials, risks, and acceptance criteria |
| Individual Written Exam 1 (Week 8) | 15% | Hardware wiring, GPIO and GND, electrical measurement, ADC, common ground, sensing, actuation, power, state machines, and safety |
| Project Report 2 (Week 12) | 15% | Current implementation evidence, progress status, identified problems, risk analysis, and a revision plan |
| Individual Written Exam 2 (Week 15) | 15% | Wi-Fi, HTTP, JSON, WebSocket, MQTT, integrated data flow, and log-based troubleshooting |
| Project Report 3 (Weeks 16-17) | 25% | Complete physical interaction, frontend and backend, data, reliability, testing, documentation, and individual understanding |
| Total | 100% |  |

Hardware cost, mechanical complexity, and project speed do not directly earn additional
credit. A project built from basic materials can meet the highest expectations when it
provides reliable interaction, a complete data flow, a clear mobile workflow, and
sufficient testing evidence.

The three project reports are checkpoints in one developing project: feasibility in
Week 7, implementation progress and revision in Week 12, and the final demonstration
in Week 16 or 17. Each group receives only one Project Report 3 grade. The two written
exams are individual work; a group demonstration does not replace either exam.

<a id="final-project"></a>

## 5. Minimum Final Project Requirements

These are semester-end requirements. In Week 1, use them to understand the direction
of the course; do not attempt to build all layers or buy optional parts immediately.
The final project must include all of the following:

- A physical artifact that operates safely and addresses a clearly described use case.
- An ESP32-S3 or another controller approved by the instructor.
- At least one physical input and one physical output; an exception must be approved
  during Week 7.
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

Based on the instructor's previous purchase prices, the electronics kit costs
approximately **NT$659 per student**. The exact models and specifications, first and
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
separate from the NT$659 per-student electronics-kit estimate.

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
   parts before the topic is reviewed in Week 7.
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
