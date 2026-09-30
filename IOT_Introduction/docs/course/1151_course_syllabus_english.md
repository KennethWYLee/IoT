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

Week 1 covers purchasing and computer setup; students receive hardware and first upload in Week 2.
Weeks 2–7 cover hardware and standalone interaction. From Week 3, keep the button and OLED and
gradually add light sensing, DHT, RGB, and the servo, focusing on the new part each week before Week 7 integration.
The OLED is the primary device display; Serial Monitor is for troubleshooting, not a second required display task.
This does not replace later mobile interfaces or history. From Week 11, add Wi-Fi, HTTP, WebSocket, JSON,
MQTT, databases, and mobile interfaces. Keep three project reports; replace the two written exams
with one practical exam and one practical class. The final demonstration remains in Week 17.

## Project Requirements

- Week 10: A 12–15 minute team report on the topic, feasibility, materials, and risks, with a working hardware component; no complete product required.
- Week 13: Report implementation progress, problems, and planned corrections.
- Week 17: Demonstrate hardware, student-built frontend and backend, a database, history, logs, and WebSocket updates, including operation results, automation, and error handling.
- Submit code, wiring and data flows, tests, rebuild instructions, and AI-verification records. Existing platforms cannot replace core implementation. See the [full project requirements](18_week_plan.md#六期末作品最低要求).

## Weekly Schedule

Revision plan dated 2026-09-30: practical exam in Week 8, Project Report 1 in Week 10, and a regular practical class in Week 16.
Week 1-7 student materials and the affected weekly notices have been updated. Revised weights await instructor confirmation.

| Week | Date | Topic |
|---:|---|---|
| 1 | 2026-09-09 | Purchasing, Arduino/ESP32 setup, saving and compiling; no hardware required |
| 2 | 2026-09-16 | First upload, Serial and one-button counting; explain the pull-up after success |
| 3 | 2026-09-23 | Test light sensor and OLED separately, then display and save a light reading |
| 4 | 2026-09-30 | Add DHT; show environmental readings and button-saved results on OLED |
| 5 | 2026-10-07 | Keep the environmental device; match RGB status to OLED text |
| 6 | 2026-10-14 | Add a servo pointer with OLED commands; verify power, travel, stopping and power-off |
| 7 | 2026-10-21 | Integrate previously taught materials without new components or game rules |
| 8 | 2026-10-28 | Practical exam: complete a specified artifact using taught materials |
| 9 | 2026-11-04 | Instructor abroad; optional reading |
| 10 | 2026-11-11 | Project Report 1: topic and feasibility |
| 11 | 2026-11-18 | Wi-Fi, HTTP, WebSocket, and backend |
| 12 | 2026-11-25 | MQTT, database, and logs |
| 13 | 2026-12-02 | Project Report 2: progress and revision |
| 14 | 2026-12-09 | Mobile frontend, PWA, and permissions |
| 15 | 2026-12-16 | Automation, fault recovery, and reconstruction |
| 16 | 2026-12-23 | Regular practical class: improve the final project |
| 17 | 2026-12-30 | Project Report 3: demonstration and questions |
| 18 | 2027-01-06 | University final exam week; left blank |

Week 9 requires no campus attendance or new submissions. Week 18 has no materials, new content, or assessment.
The practical exam uses taught operations and available materials to complete a specified artifact.
The other session is a class, not a second exam.

## Teaching Methods

Short explanations, questions and answers, labs, debugging, and demonstrations. Teams of 1–3 share component and power kits, rotate roles, and maintain a Lab Notebook. Students bring individual laptops and learning records. Each team needs a multimeter; solo teams may share across teams but keep separate measurement evidence. Follow the Week 1 materials list.

## Assessment

The table below records the previous weights and weeks for comparison, not a revised assessment announcement.
The current schedule places the practical exam in Week 8, Project Report 1 in Week 10, and a regular practical class in Week 16.
Both written exams are cancelled; the practical-exam weight and reassignment of the two original 15% weights await confirmation.

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
