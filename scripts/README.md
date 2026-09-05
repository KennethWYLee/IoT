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
