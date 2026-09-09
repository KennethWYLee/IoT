# 115-1 Internet of Things and Cloud Computing

## Basic Information

- Class: Second-year Class B, four-year Information Management program; instructor: 李文毅.
- Course: Internet of Things and Cloud Computing.
- Schedule: Wednesday, periods 5–7, 13:30–16:15; 3 hours per week.
- Language: Mainly Chinese with English terms; basic programming required.
- Course code, credits, required/elective status, and official language/EMI registration: to be confirmed.

## Course Objectives

Build a self-selected interactive device with ESP32-S3, mobile operation, a backend, a database, and log analysis. Complete a safe, reproducible IoT project. Assessment values understanding, testing, and teamwork, not price, mechanical complexity, or speed.

## Learning Outcomes

1. CLO1: Explain hardware, network, and software responsibilities.
2. CLO2: Wire, measure, and control inputs and outputs safely.
3. CLO3: Integrate sensing, actuation, and safe stopping.
4. CLO4: Connect devices, backends, databases, and phones.
5. CLO5: Diagnose problems with history and logs and verify corrections.
6. CLO6: Complete a project, documentation, demonstration, and questions and answers.

## Course Content

Weeks 2–7 cover hardware and standalone interaction. From Week 11, add Wi-Fi, HTTP, WebSocket, JSON, MQTT, databases, and mobile interfaces. Three project reports and two individual written exams support the final demonstration in Week 17.

## Project Requirements

- Week 8: A 12–15 minute team report on the topic, feasibility, materials, and risks, with a working hardware component; no complete product required.
- Week 13: Report implementation progress, problems, and planned corrections.
- Week 17: Demonstrate hardware, student-built frontend and backend, a database, history, logs, and WebSocket updates, including operation results, automation, and error handling.
- Submit code, wiring and data flows, tests, rebuild instructions, and AI-verification records. Existing platforms cannot replace core implementation. See the [full project requirements](18_week_plan.md#六期末作品最低要求).

## Weekly Schedule

| Week | Date | Topic |
|---:|---|---|
| 1 | 2026-09-09 | Course, materials, and project overview |
| 2 | 2026-09-16 | ESP32-S3, wiring, and button debounce |
| 3 | 2026-09-23 | Electrical measurement, ADC, and light classification |
| 4 | 2026-09-30 | Resistors, dual sensors, and buzzer |
| 5 | 2026-10-07 | RGB, OLED, and countdown control |
| 6 | 2026-10-14 | Servo pointer and power safety |
| 7 | 2026-10-21 | Traffic-light shade challenge integration |
| 8 | 2026-10-28 | Project Report 1: topic and feasibility |
| 9 | 2026-11-04 | Instructor abroad; optional reading |
| 10 | 2026-11-11 | Written Exam 1: hardware and safety |
| 11 | 2026-11-18 | Wi-Fi, HTTP, WebSocket, and backend |
| 12 | 2026-11-25 | MQTT, database, and logs |
| 13 | 2026-12-02 | Project Report 2: progress and revision |
| 14 | 2026-12-09 | Mobile frontend, PWA, and permissions |
| 15 | 2026-12-16 | Automation, fault recovery, and reconstruction |
| 16 | 2026-12-23 | Written Exam 2: networks and integration |
| 17 | 2026-12-30 | Project Report 3: demonstration and questions |
| 18 | 2027-01-06 | University final exam week; left blank |

Week 9 requires no campus attendance or new submissions. Week 18 has no materials, new content, or assessment. Written exam weeks have no new content or practical work.

## Teaching Methods

Short explanations, questions and answers, labs, debugging, and demonstrations. Teams of 1–3 share component and power kits, rotate roles, and maintain a Lab Notebook. Students bring individual laptops and learning records. Each team needs a multimeter; solo teams may share across teams but keep separate measurement evidence. Follow the Week 1 materials list.

## Assessment

| Item | Weight |
|---|---:|
| Regular Coursework | 15% |
| Project Report 1 (Week 8) | 15% |
| Individual Written Exam 1 (Week 10) | 15% |
| Project Report 2 (Week 13) | 15% |
| Individual Written Exam 2 (Week 16) | 15% |
| Project Report 3 (Week 17) | 25% |
| Total | 100% |

All teams submit demonstration versions by one shared deadline before the Week 17 presentations. Each team is assessed once, with individual questions; no presentations move to Week 18.

## Materials and References

Instructor materials and documentation on Espressif, HTTP, MQTT, WebSocket, JSON, and PWA. ROS 2, Gazebo, and Nav2 are optional advanced reading. No single textbook or paid cloud service is required. Respect intellectual property; illegal photocopying is prohibited.

## AI and Safety

Document human understanding, changes, and verification of AI output. Check wiring and power before use: GPIO uses 3.3V logic, 5V signals need protection, and motors/servos need non-GPIO power and a stop or power-off method. Do not collect personal data without permission.

## Pending Confirmation

University fields and core competencies; enrollment and presentation capacity; LMS and report booking; campus Wi-Fi and backup; administrative filing for Weeks 9 and 18.
