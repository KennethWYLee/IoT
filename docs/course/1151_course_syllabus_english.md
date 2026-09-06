# 115-1 Internet of Things and Cloud Computing

## Course Objectives

This course enables information management students to build toys, interactive
mechanisms, environmental devices, mobile platforms, or other physical systems
of their own design. Weeks 2–7 focus on hardware: safe wiring, electrical
measurement, GPIO, logic levels, analog input, sensors, actuators, power,
physical interaction, and failure handling. Beginning in Week 11, students
connect the ESP32-S3 to student-built software
through Wi-Fi, HTTP, WebSocket, JSON, MQTT, a backend, a database, structured
logs, and a mobile-friendly interface. Every final project must contain working
physical hardware and software that records useful data or events and assists
users in monitoring or operating the device. Assessment emphasizes integration,
testing evidence, safety, reproducibility, collaboration, and human verification
of AI-assisted work rather than hardware price, mechanical complexity, or speed.

## Learning Outcomes

After completing the course, students will be able to:

1. Explain the responsibilities of a development board, sensors, actuators,
   network protocols, a backend, a database, logs, and a mobile interface.
2. Wire and measure ESP32-S3 circuits safely with attention to GPIO, GND,
   3.3V/5V logic, current, power, and actuator shutdown.
3. Combine physical inputs, state, decisions, and outputs into a repeatable
   standalone interactive device.
4. Connect a device, student-built backend, database, and mobile interface with
   HTTP or MQTT, JSON, and WebSocket.
5. Use historical data and structured logs to diagnose a failure, verify a
   correction, and document recovery.
6. Implement and explain a complete Full-stack IoT project with physical
   behavior, meaningful software support, safe failure handling, and
   reproducible setup.

## Required Final Project Capabilities

Each team selects its own physical project. The final submission must include:

1. A safely operating physical artifact and a clear use scenario.
2. An ESP32-S3 or an instructor-approved equivalent controller.
3. At least one physical input and one physical output, unless an exception is
   approved during the Week 8 interview.
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

| Week | Date | Topic |
|---:|---|---|
| 1 | 2026-09-09 | Course orientation, assessment, materials, and challenge preview |
| 2 | 2026-09-16 | ESP32-S3, safe wiring, buttons, and debounce |
| 3 | 2026-09-23 | Electrical measurement, ADC, and indoor/shade classification |
| 4 | 2026-09-30 | Resistor ranges, DHT11, dual sensors, and buzzer events |
| 5 | 2026-10-07 | RGB, OLED countdown, and time control |
| 6 | 2026-10-14 | SG90 paper pointer, 0–6 scale, external power, and safety |
| 7 | 2026-10-21 | Traffic-light shade challenge integration |
| 8 | 2026-10-28 | Project Report 1: topic and technical feasibility |
| 9 | 2026-11-04 | Instructor abroad: optional reading |
| 10 | 2026-11-11 | Individual Written Exam 1: Weeks 2–7 hardware and safety |
| 11 | 2026-11-18 | Wi-Fi, HTTP, JSON, WebSocket and backend |
| 12 | 2026-11-25 | MQTT, database and structured logs |
| 13 | 2026-12-02 | Project Report 2: progress, feedback and revision |
| 14 | 2026-12-09 | Mobile frontend, responsive web/PWA and permissions |
| 15 | 2026-12-16 | Automation, safety, fault recovery and reconstruction |
| 16 | 2026-12-23 | Individual Written Exam 2: networks and integration |
| 17 | 2026-12-30 | Project Report 3: final demonstration and individual questions |
| 18 | 2027-01-06 | University final examination week: reserved |

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

Laboratory groups consist of one to three students. Each group prepares one
digital multimeter with continuity, resistance, and low-voltage DC measurement;
a one-student group may share a meter with another group, but each group keeps
separate measurement evidence and conclusions. The instructor's meter is a
demonstration and reference instrument rather than a normal group instrument.

All groups submit the same-deadline demonstration commit/tag before the first Week 17 demonstration. Each group receives one final-report grade, with individual questions retained. Group count and one-week presentation capacity must be confirmed before publishing the running order; Week 18 is not a spillover presentation week.
