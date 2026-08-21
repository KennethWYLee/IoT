# 115-1 Internet of Things: Full-stack IoT Systems Design and Implementation

This version is intended for the English fields of the course syllabus system. The instructor's smart parking and UCI 4WD system is an integration demonstration; students are not required to build vehicles.

## Course Objectives

This course guides information management students in designing low-cost, connected, observable, and manageable IoT systems. Students begin with the ESP32-S3, sensors, actuators, electrical safety, and Wi-Fi. They then connect physical devices to student-built backends, databases, structured logs, and mobile-friendly user interfaces through HTTP, MQTT, WebSocket, and JSON. By the end of the course, each team must implement a complete Full-stack IoT system with real sensing, real-time and historical data, controlled two-way interaction, automation, failure handling, and reproducible deployment. The course emphasizes system integration, testing evidence, troubleshooting, safety, collaboration, and human verification of AI-assisted development.

## Course Content

The course has four stages. The first stage establishes ESP32-S3 development, GPIO, GND, 3.3V/5V, breadboards, sensors, actuators, Wi-Fi, and structured event data. The second stage develops a shared end-to-end vertical slice using HTTP, a student-built Node.js or Python backend, WebSocket, server logs, and a responsive mobile web interface. Students complete an individual concept examination and a team technical-feasibility interview before beginning the project phase. The third stage adds MQTT, multi-device communication, databases, historical queries, structured log analysis, PWA or optional Flutter interfaces, permissions, and controlled commands. The fourth stage requires teams to build, test, deploy, and present complete Full-stack IoT projects.

## Required Final Project Capabilities

Each team may select its own application, but the final system must include:

1. At least one real sensor or physical input.
2. An ESP32-S3 sending structured data through Wi-Fi.
3. A student-built and reproducible backend.
4. A database and useful historical queries.
5. Searchable or aggregated structured logs and at least one analysis.
6. A mobile-friendly frontend showing real-time and historical information.
7. At least one controlled command sent from the phone through the backend, with a device acknowledgement.
8. At least one automated rule, state machine, alert, or decision process.
9. Handling and test evidence for a disconnection, invalid input, or device failure.
10. Source code, an architecture diagram, a data dictionary, deployment instructions, test evidence, known limitations, and an AI-use record.

Responsive Web/PWA is the common mobile implementation. Flutter is an optional advanced alternative, but it does not replace the required backend, database, logging, and device integration.

## Weekly Schedule

| Week | Date | Topic |
|---:|---|---|
| 1 | 2026-09-09 | Course Introduction; ESP32-S3, Arduino IDE, Serial, Wi-Fi Scan, and the First JSON Event |
| 2 | 2026-09-16 | GPIO, GND, 3.3V/5V, Breadboards, Multimeters, and Safe Wiring |
| 3 | 2026-09-23 | Multiple Sensors, OLED Displays, and Event Data Models |
| 4 | 2026-09-30 | Wi-Fi, HTTP, REST APIs, and the First Student-built Backend |
| 5 | 2026-10-07 | WebSocket, Responsive Mobile Interfaces, and Two-way Control |
| 6 | 2026-10-14 | Shared Full-stack IoT Vertical Slice, Interface Contracts, Logs, and Failure Handling |
| 7 | 2026-10-21 | Individual Concept Examination and Project Topic Workshop |
| 8 | 2026-10-28 | Team Concept and Technical-feasibility Interviews |
| 9 | 2026-11-04 | Instructor Conference Travel: No Required Attendance and No New Assessed Evidence |
| 10 | 2026-11-11 | MQTT, Multi-device Topics, Presence, and Command Acknowledgements |
| 11 | 2026-11-18 | Databases, Historical Queries, Structured Logs, and Basic Analysis |
| 12 | 2026-11-25 | Mobile Frontends, PWA, WebSocket, Permissions, and Controlled Commands |
| 13 | 2026-12-02 | Project Checkpoint 1: Minimum Complete Vertical Slice and Interface Freeze |
| 14 | 2026-12-09 | Project Workshop: Automation, State Machines, Safety, and User Workflows |
| 15 | 2026-12-16 | Project Checkpoint 2: Mobile Use, Data, Logs, and Peer Usability Test |
| 16 | 2026-12-23 | Integration Testing, Fault Injection, Deployment Rebuild, and Demo Freeze |
| 17 | 2026-12-30 | Final Full-stack IoT Project Demonstrations |
| 18 | 2027-01-06 | Final Examination Week: Advanced Self-study in MQTT, Flutter, ROS 2, Gazebo, and Nav2 |

## Assessment

| Assessment Item | Weight |
|---|---:|
| Weekly QA, Type B Activities, and Lab Notebook | 15% |
| Week 7 Individual Concept Examination | 15% |
| Week 8 Team Concept and Technical-feasibility Interview | 15% |
| Week 13 and Week 15 Project Checkpoints | 15% |
| Week 17 Full-stack IoT Final Project | 30% |
| Documentation, Safety, Collaboration, Reflection, and AI-use Evidence | 10% |
| Total | 100% |

## Required Textbooks and References

- Instructor-developed notes, diagrams, code examples, worksheets, and assessment checklists.
- Official documentation for the Espressif ESP32-S3 DevKitC-1 and Arduino-ESP32.
- Official specifications and instructional resources for HTTP, MQTT, WebSocket, and JSON.
- Instructional materials for Node.js or Python backends, databases, PWAs, and structured logging.
- Official introductory resources for ROS 2, Gazebo, and Nav2 as advanced readings.
- No single textbook or paid cloud service is required.
- Students must respect intellectual property rights. Illegal photocopying is prohibited.

## Generative AI Policy

Students may use generative AI for code drafts, interfaces, schemas, test cases, and debugging hypotheses. Each team must document what the AI produced, what the students changed, why they changed it, and how they verified the result. Students may not submit or execute code that they cannot explain or have not tested. Assessment emphasizes the ability to explain, test, revise, and reproduce the system.
