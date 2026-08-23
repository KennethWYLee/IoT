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
