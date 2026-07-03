# IoT Scripts

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
