# IoT Scripts

## `verify_course_materials.py`

Checks all versioned Markdown files for balanced code fences, valid local links and
anchors, consistent table columns, and forbidden editorial wording. It also enforces
the 18 weekly directory structure, two-file rule, blank Week 18, English Week 1 main,
English unit overviews, separation of main/support tables, minimum regular-unit depth,
and absence of positive hard-coded GPIO values in unverified hardware examples.

Run from the repository root:

```powershell
python scripts/verify_course_materials.py
```

## `verify_markdown_arduino.py`

Extracts every complete Arduino sketch from the operational weekly materials and the
shared starter snippets, composes the Week 14 modifications onto the verified Week 10
base, and compiles them for the course ESP32-S3 N16R8 build configuration. It requires
`arduino-cli`, the ESP32 platform, and the libraries named in the weekly materials.
Compilation proves source/build compatibility only; it does not prove Upload or physical
target behavior.

```powershell
python scripts/verify_markdown_arduino.py
```

## Week 2 notebook figures and focused verification

`build_week2_figures.cjs` maintains eight original concept diagrams as SVG/PNG pairs
under `docs/images/wiring/` and embeds the PNG versions in `week2_main.ipynb`.
Existing photograph attachments are retained. Requirements: Node.js, `sharp`, and
Microsoft JhengHei (or a reviewed compatible Traditional Chinese font). Set
`NODE_PATH` if dependencies are supplied by a separate runtime.

```powershell
node scripts/build_week2_figures.cjs
node scripts/build_week2_figures.cjs --check
node scripts/verify_week2_notebook.cjs
node scripts/verify_week2_notebook.cjs --render
node scripts/verify_week2_notebook.cjs --compile
```

Edit the build script before regenerating; `--check` compares source/artifact and
attachment bytes without writing. Exact raster equality depends on the renderer
and fonts. The verifier checks the three canonical sketch copies, unpublished GPIO
guards, thirteen embedded raster references, teaching sequence, selected calculations,
and a **JavaScript model** of the diagnostic debounce rule. The model checks 0/10/30/100
ms, boundary timing, missed pulses, held states and 32-bit wrap. It is not execution of
the Arduino firmware and cannot establish physical button-bounce behavior.

`--render` additionally requires `marked`, `playwright`, and installed Microsoft Edge.
It writes ignored previews to `_outputs/`, checks image decoding, 1280/420px page
widths and SVG text bounds. Inspect the diagrams/previews manually; this local HTML
render is not a live GitHub rendering test. `--compile` uses Arduino CLI (override its
path with `ARDUINO_CLI`) and the installed ESP32 platform to compile the three public
examples plus `week02_board_check`. It does not upload, open COM ports, or verify a
physical board. Default FQBN: `esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`.

Run the general course-material verifier and `git diff --check` as well. The
[Week 2 review record](../docs/lab_notes/2026-09-05-week2-material-review.md) records
the actual checks and remaining hardware limitations. The notebook intentionally
includes reference answers under the teacher-approved complete-preparation edition.

## Week 3 notebook figures and focused verification

`build_week3_figures.cjs` is the editable design source for six original explanatory
figures. It generates SVG and PNG files in `docs/images/wiring/` and embeds their PNG
versions in `week3_main.ipynb`. It also embeds the existing KY-018 pin-label photograph
without changing its bytes. Edit the script before regenerating; do not independently
edit its generated SVG, PNG, or attachment copies.

Requirements: Node.js and `sharp`; rendering uses an available Traditional Chinese
font (the reviewed Windows rendering uses Microsoft JhengHei). Dependencies may be
provided through `NODE_PATH`. Exact raster comparisons require the same renderer and
fonts; after a renderer/font change, regenerate and visually inspect the images.

```powershell
node scripts/build_week3_figures.cjs
node scripts/build_week3_figures.cjs --check
```

The second command is read-only. It checks generated source/artifact agreement and
embedded image bytes; it does not validate a physical circuit.

`verify_week3_notebook.cjs` checks the two public sketch sources, unpublished GPIO
guards, the ten embedded image references, the resistor-practice wiring table against
an ideal breadboard connectivity model, worked calculations, and evidence disclosures.
Its default mode requires only Node.js. These are selected assertions, not a replacement
for reading every teaching step or testing real components.

```powershell
node scripts/verify_week3_notebook.cjs
node scripts/verify_week3_notebook.cjs --render
```

The optional render mode additionally requires `marked`, `playwright`, and an installed
Microsoft Edge browser (`BROWSER_CHANNEL` can select another installed channel). It
creates ignored previews under `_outputs/`, checks that all ten images decode, checks
page overflow at desktop/mobile widths, and checks SVG text bounds. Inspect the previews
and diagrams manually as well. This is a local HTML preview, not a live GitHub-rendering
test. Neither script uploads firmware, opens a serial port, or claims hardware testing.

Run `verify_course_materials.py`, the applicable Arduino compilation checks, and
`git diff --check` alongside these focused checks. See the
[Week 3 review record](../docs/lab_notes/2026-09-05-week3-material-review.md) for the
actual verification scope and remaining hardware work.

## `mirror_dokuwiki.py`

Mirrors the course DokuWiki reference site into a local folder for offline review and link checking.

Required environment variables:

- `MIRROR_USERNAME`
- `MIRROR_PASSWORD`
- `MIRROR_OUTPUT_DIR`

Optional environment variables:

- `MIRROR_START_URL`
- `MIRROR_MAX_PAGES`
- `MIRROR_CHECK_EXTERNAL`
- `MIRROR_SKIP_STUDENT_WORKS`
- `MIRROR_MAX_ASSET_BYTES`

Do not write usernames, passwords, cookies, or tokens into this repository. Pass credentials through environment variables only.
