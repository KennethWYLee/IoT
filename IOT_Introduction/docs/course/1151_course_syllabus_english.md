# 115-1 Internet of Things and Cloud Computing

## Basic Information

| Field | Proposed Entry |
|---|---|
| Academic Year and Semester | Academic Year 115, Semester 1 |
| Class | Second-year Class B, four-year Information Management program |
| Course Title | Internet of Things and Cloud Computing |
| Instructor | 李文毅 |
| Meeting Time | Wednesday, periods 5-7, 13:30-16:15 |
| Weekly Hours | 3 hours |
| Credits | To be confirmed in the university system |
| Course Code | To be confirmed in the university system |
| Required or Elective | To be confirmed in the university system |
| Language of Instruction | Primarily Chinese, with English technical terms and short exchanges; EMI registration to be confirmed separately |
| Prerequisites | Basic programming in any language; no prior electronics, robotics, or ROS 2 experience required |

## Course Objectives

This course enables information management students to build toys, interactive
mechanisms, environmental devices, mobile platforms, or other physical systems
of their own design. Weeks 2–7 focus on hardware: safe wiring, electrical
measurement, GPIO, logic levels, analog input, sensors, actuators, power,
physical interaction, and failure handling. Beginning in Week 11, students
connect the ESP32-S3 to student-built software
through Wi-Fi, HTTP, WebSocket, JSON, MQTT, a backend, a database, structured
logs, and a mobile-friendly interface. Every final project must contain working
physical hardware and software that records data or events or assists users in
operating the device. The complete system should show current status, historical
records, control results, error handling, and reproducible setup steps.
Assessment emphasizes integration,
testing evidence, safety, reproducibility, collaboration, and human verification
of AI-assisted work rather than hardware price, mechanical complexity, or speed.

## Learning Outcomes

After completing the course, students will be able to:

| ID | Observable Learning Outcome | Main Evidence |
|---|---|---|
| CLO1 | Distinguish the responsibilities of development boards, sensors, actuators, network services, backends, databases, and mobile interfaces | Component classification, data-flow diagrams, and individual written exams |
| CLO2 | Wire safely within logic-level and power limits, measure circuits, and control physical inputs and outputs | Wiring diagrams, multimeter records, physical tests, and Serial logs |
| CLO3 | Combine inputs, states, decisions, and outputs into a reusable interactive device that can stop safely | State diagrams, three repeated tests, and fault and correction records |
| CLO4 | Connect devices, backends, databases, and mobile interfaces using HTTP/MQTT, JSON, and WebSocket | Data formats, server logs, database tables, and mobile operation |
| CLO5 | Use historical data and structured logs to identify operating, communication, or hardware problems and verify corrections | Queries, comparisons, fault injection, recovery, and retest evidence |
| CLO6 | Complete and explain a full-stack IoT project with physical behavior, software recording or operation, and safety mechanisms | Three project reports, source code, documentation, and questions and answers |

## Course Content

The course has four stages. First, students use the same basic set of materials
to practice safe wiring, electrical measurement, ADC, sensing, actuation, power,
and standalone interaction without a network. Second, Project Report 1 in
Week 8 establishes project direction, materials, and risks; the first individual
written exam in Week 10 checks students' understanding of hardware.

Third, Week 11 introduces HTTP, JSON, WebSocket, and two-way mobile operation.
Week 12 combines MQTT messaging across devices, a database, basic historical
queries, and structured logs into a traceable data path. Project Report 2 in
Week 13 checks progress and provides feedback for a revision plan. Week 14
develops the mobile interface, and Week 15 covers fault testing and redeployment.
The second individual written exam in Week 16 assesses network communication
and hardware-software architecture. Finally, all teams give Project Report 3
and answer individual questions in Week 17. Week 18 is the university final
examination week and remains blank, with no regular materials, new content, or
assessment scheduled.

## Project Report 1: Week 8 Topic and Technical Feasibility

Each team gives one 12-15 minute report, demonstration, and question-and-answer
session. It explains the proposed artifact, target users, core operation,
hardware inputs and outputs, the purpose of software recording or operation,
data flow, materials, power and driver risks, and the minimum acceptable result.
The team demonstrates one working hardware component of the project. A complete
product is not required in Week 8.

## Required Final Project Capabilities

Each team selects its own physical project. Project Report 3 in Week 17 must include:

1. A safely operating physical artifact and a clear use scenario.
2. An ESP32-S3 or an instructor-approved equivalent controller.
3. At least one physical input and one physical output, unless an exception is
   explained and approved during Project Report 1 in Week 8.
4. Wi-Fi and either HTTP or MQTT device communication.
5. A student-built backend that another computer can start from documentation.
6. A database, useful historical queries, and structured logs.
7. A mobile-friendly interface for current status, history, an operation or
   setting, and visible offline or error states.
8. WebSocket updates; controlled actions must record success, failure, or
   timeout.
9. At least one automated response, state machine, or schedule.
10. Three test scenarios, including a disconnection, invalid input, sensor
    failure, or stopped service.
11. Source code, wiring and data-flow diagrams, data formats, a bill of
    materials, rebuild instructions, AI-use and verification records, and known
    limitations.

Commercial IoT dashboards may support a project, but they may not replace the
student-built device software, backend, database, and mobile interface.

## Weekly Schedule

| Week | Date | Topic | Learning Activities and Evidence |
|---:|---|---|---|
| 1 | 2026-09-09 | Course orientation, assessment, materials, and traffic-light shade challenge preview | Distinguish the shared game from self-selected final projects; no wiring, power-on, or in-class installation |
| 2 | 2026-09-16 | ESP32-S3, safe wiring, buttons, and debounce | Use the existing Week 2 materials: upload, Serial, continuity, GPIO events, and debounce evidence |
| 3 | 2026-09-23 | Electrical measurement, ADC, and classification of indoor light versus a covered sensor | Retain multimeter, GPIO, and 1 kΩ/10 kΩ voltage-divider practice; add two-condition calibration and text classification through Serial |
| 4 | 2026-09-30 | 220 Ω/330 Ω resistors, DHT11, dual sensors, and buzzer events | Independent updates, data quality, one alert per stable sensor-covering event, fault injection, and recovery |
| 5 | 2026-10-07 | RGB, OLED countdown display, and time control | Align light color, rule text, remaining time, and example counts; no servo connection |
| 6 | 2026-10-14 | SG90 paper pointer, 0–6 scale, external power, and safety | Map valid counts to safe angles; verify power, mounting, stopping, and recovery |
| 7 | 2026-10-21 | Traffic-light shade challenge integration | Add counts on green and subtract on red; press Finish before the countdown ends; integrate the pointer and short failure beep; test boundaries and abort behavior |
| 8 | 2026-10-28 | Project Report 1: topic and technical feasibility | One 12-15 minute report per team, working hardware component, data flow, risks, and questions and answers |
| 9 | 2026-11-04 | Instructor abroad: optional reading and review | No campus attendance required, no new deliverables, and no new assessment |
| 10 | 2026-11-11 | Individual Written Exam 1: Weeks 2–7 hardware and safety | The entire session is reserved for the individual written exam; no new content or practical work |
| 11 | 2026-11-18 | Wi-Fi, HTTP, JSON, WebSocket, and backend | Device events, two-way mobile control, and command/result tracking; shared network labs use low-power outputs |
| 12 | 2026-11-25 | MQTT, database, and structured logs | Topics, presence, command/acknowledgement, persistence, and basic historical queries |
| 13 | 2026-12-02 | Project Report 2: progress, feedback, and revision | Actual implementation evidence, problems, and a revision plan; the final version is not fixed at this stage |
| 14 | 2026-12-09 | Mobile frontend, responsive web/PWA, and permissions | Live status, history, operation, offline states, errors, and permission workflows |
| 15 | 2026-12-16 | Automated responses, safety, fault recovery, and reconstruction | One automated response, three fault tests, and reconstruction in a clean environment |
| 16 | 2026-12-23 | Individual Written Exam 2: networks and hardware-software integration | Assess Weeks 11, 12, 14, and 15; no new content or project-progress submissions |
| 17 | 2026-12-30 | Project Report 3: final demonstration and individual questions | All teams present this week; each team is assessed once, with individual questions retained |
| 18 | 2027-01-06 | University final examination week: left blank | No regular materials, new content, or assessment |

## Teaching Methods

- Short explanations are followed immediately by prediction, classification,
  modification, debugging, testing, or explanation.
- Teams have one to three students and rotate wiring, programming, testing, and
  recording roles. Each team shares one basic component kit and one power-supply
  kit from the official Week 1 list. Each student prepares their own laptop and
  learning records. Each team prepares a digital multimeter; a one-student team
  may share a meter with another team, but measurement and learning evidence
  must be recorded separately for each team.
- Power, common ground, and stopping methods must be checked before actuators
  are powered.
- Each team maintains a Lab Notebook covering objectives, wiring or data flow,
  results, errors, corrections, AI use, and next steps.
- Teams purchase additional specialized materials only as needed after their
  topic is confirmed in Week 8. Spending is not an assessment criterion.

## Assessment

| Assessment Item | Weight |
|---|---:|
| Regular Coursework | 15% |
| Project Report 1 (Week 8) | 15% |
| Individual Examination 1 (Week 10) | 15% |
| Project Report 2 (Week 13) | 15% |
| Individual Examination 2 (Week 16) | 15% |
| Project Report 3 (Week 17) | 25% |
| Total | 100% |

## Required Textbooks and References

- Instructor-developed notes, wiring diagrams, code examples, worksheets, and
  assessment checklists.
- Official Espressif ESP32-S3 DevKitC-1 and Arduino-ESP32 documentation.
- Materials on HTTP, MQTT, WebSocket, JSON, backends, databases, and PWAs.
- Official introductory resources for ROS 2, Gazebo, and Nav2 as advanced study.
- No single textbook or paid cloud service is required.
- Students must respect intellectual property rights. Illegal photocopying is
  prohibited.

## Generative AI Policy

Students may use generative AI for code drafts, interfaces, data formats, test
cases, and debugging hypotheses. They must document what the AI produced, what
they changed, why they changed it, and how they verified the result. Students
must be able to explain and reproduce all submitted work.

## Hardware and Data Safety

Students must verify board models, pin assignments, logic levels, polarity,
current, power, and common ground before applying power. ESP32-S3 GPIO uses
3.3V logic; unprotected 5V signals must not be connected directly. Motors and
servos must not be powered from a GPIO pin and must have a safe stop or power-off
method. Projects may not collect identifiable images, audio, or other sensitive
data without informed permission.

## Confirmation Before Submission

- [ ] Confirm the course code, credits, required/elective status, official
  language of instruction, and core-competency fields.
- [ ] Confirm enrollment and the actual number of teams under the one-to-three
  student rule. Students prepare team materials and multimeters according to
  the official Week 1 list.
- [ ] Confirm LMS submissions and the booking tool for Project Report 1 in Week 8.
- [ ] Confirm campus Wi-Fi restrictions for ESP32-S3 and a backup network.
- [ ] Confirm whether the Week 9 and Week 18 arrangements require administrative
  filing.

All teams submit their demonstration commit or tag by the same deadline before
the first Week 17 demonstration. Each team is assessed once, with individual
questions retained. Enrollment and the capacity for all presentations in one
week must be confirmed before publishing the presentation order. Demonstrations
must not be moved to Week 18.
