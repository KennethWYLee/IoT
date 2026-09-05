"""Check course materials against repository structure and AGENTS.md hard rules."""

from __future__ import annotations

import base64
import binascii
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / "IoT_Introduction"
REGULAR_WEEKS = {1, 2, 3, 4, 5, 6, 10, 11, 13, 14}
OVERVIEW_WEEKS = set(range(1, 18))
HARDWARE_CODE_WEEKS = {2, 3, 4, 5, 6, 10, 14}
FORBIDDEN_EDITORIAL_PHRASES = (
    "這份教材要怎麼使用",
    "給老師的話",
    "你可以照著念",
    "老師講稿",
    "第二人簽核",
    "version freeze",
    "version freez",
)


def week_number(path: Path) -> int:
    match = re.match(r"Week_(\d+)_", path.name)
    if not match:
        raise ValueError(f"invalid week directory name: {path.name}")
    return int(match.group(1))


def notebook_content(notebook: Path) -> str:
    data = json.loads(notebook.read_text(encoding="utf-8"))
    if data.get("nbformat") != 4 or not isinstance(data.get("cells"), list):
        raise ValueError(f"invalid notebook structure: {notebook}")
    default_language = data.get("metadata", {}).get("language_info", {}).get("name", "")
    parts: list[str] = []
    for cell in data["cells"]:
        source = cell.get("source", "")
        if isinstance(source, list):
            source = "".join(source)
        if cell.get("cell_type") == "markdown":
            parts.append(source)
        elif cell.get("cell_type") == "code":
            language = cell.get("metadata", {}).get("language", default_language)
            parts.append(f"```{language}\n{source.rstrip()}\n```")
    return "\n\n".join(parts)


def document_content(document: Path) -> str:
    if document.suffix.lower() == ".ipynb":
        return notebook_content(document)
    return document.read_text(encoding="utf-8")


def local_links(document: Path, content: str) -> list[tuple[Path, str]]:
    results: list[tuple[Path, str]] = []
    for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", content):
        target = target.strip().strip("<>")
        if re.match(r"^(https?://|mailto:|attachment:)", target):
            continue
        path_text, _, anchor = target.partition("#")
        path_text = unquote(path_text)
        anchor = unquote(anchor).lower()
        target_path = document if not path_text else document.parent / path_text
        results.append((target_path.resolve(), anchor))
    return results


def notebook_attachment_errors(notebook: Path) -> list[str]:
    """Validate Jupyter markdown attachments in the cell that references them."""
    errors: list[str] = []
    relative = notebook.relative_to(ROOT)
    data = json.loads(notebook.read_text(encoding="utf-8"))
    for index, cell in enumerate(data.get("cells", []), start=1):
        if cell.get("cell_type") != "markdown":
            continue
        source = cell.get("source", "")
        if isinstance(source, list):
            source = "".join(source)
        references = {
            unquote(name)
            for name in re.findall(r"\]\(attachment:([^)]+)\)", source)
        }
        attachments = cell.get("attachments", {})
        for name in sorted(references - set(attachments)):
            errors.append(
                f"{relative}: cell {index} missing notebook attachment {name}"
            )
        for name in sorted(set(attachments) - references):
            errors.append(
                f"{relative}: cell {index} has unreferenced notebook attachment {name}"
            )
        for name, payloads in attachments.items():
            if not isinstance(payloads, dict) or not payloads:
                errors.append(
                    f"{relative}: cell {index} attachment {name} has no MIME payload"
                )
                continue
            for mime_type, encoded in payloads.items():
                if not mime_type.startswith("image/"):
                    errors.append(
                        f"{relative}: cell {index} attachment {name} has unsupported "
                        f"MIME type {mime_type}"
                    )
                try:
                    base64.b64decode(encoded, validate=True)
                except (binascii.Error, ValueError, TypeError):
                    errors.append(
                        f"{relative}: cell {index} attachment {name} is not valid base64"
                    )
    return errors


def github_heading_slug(heading: str) -> str:
    """Approximate GitHub's Unicode heading ID for anchor verification."""
    heading = re.sub(r"`([^`]*)`", r"\1", heading.strip().lower())
    heading = re.sub(r"<[^>]+>", "", heading)
    heading = "".join(
        character
        for character in heading
        if character.isalnum() or character in {" ", "-", "_"}
    )
    return re.sub(r"\s+", "-", heading).strip("-")


def document_anchors(document: Path) -> set[str]:
    text = document_content(document)
    anchors: set[str] = {
        match.lower()
        for match in re.findall(r'<a\s+(?:name|id)=["\']([^"\']+)["\']', text)
    }
    counts: dict[str, int] = {}
    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if not match:
            continue
        base = github_heading_slug(match.group(1))
        suffix = counts.get(base, 0)
        counts[base] = suffix + 1
        anchors.add(base if suffix == 0 else f"{base}-{suffix}")
    return anchors


def section(content: str, heading: str) -> str:
    match = re.search(
        rf"^{re.escape(heading)}\s*$\n(.*?)(?=^###?\s|\Z)",
        content,
        flags=re.MULTILINE | re.DOTALL,
    )
    return match.group(1).strip() if match else ""


def markdown_table_blocks(content: str) -> set[str]:
    blocks: set[str] = set()
    current: list[str] = []
    for line in content.splitlines() + [""]:
        if line.strip().startswith("|") and line.strip().endswith("|"):
            current.append(re.sub(r"\s+", " ", line.strip()))
        else:
            if len(current) >= 2:
                blocks.add("\n".join(current))
            current = []
    return blocks


def repository_documents() -> list[Path]:
    excluded_parts = {".git", ".venv", "node_modules", ".pytest_cache"}
    return sorted(
        path
        for pattern in ("*.md", "*.ipynb")
        for path in ROOT.rglob(pattern)
        if not excluded_parts.intersection(path.parts)
    )


def table_cells(line: str) -> list[str]:
    body = line.strip()[1:-1]
    return [cell.strip() for cell in re.split(r"(?<!\\)\|", body)]


def check_document_file(document: Path, content: str) -> list[str]:
    errors: list[str] = []
    relative = document.relative_to(ROOT)
    if document.suffix.lower() == ".ipynb":
        errors.extend(notebook_attachment_errors(document))
    if content.count("```") % 2:
        errors.append(f"{relative}: unbalanced code fence")
    if document.name != "AGENTS.md":
        for phrase in FORBIDDEN_EDITORIAL_PHRASES:
            if phrase.lower() in content.lower():
                errors.append(f"{relative}: forbidden editorial phrase {phrase!r}")
    for target, anchor in local_links(document, content):
        if not target.exists():
            errors.append(f"{relative}: missing local link {target}")
        elif anchor and target.suffix.lower() in {".md", ".ipynb"}:
            if anchor not in document_anchors(target):
                errors.append(
                    f"{relative}: missing anchor #{anchor} in {target.relative_to(ROOT)}"
                )

    lines = content.splitlines()
    index = 0
    while index < len(lines):
        if not (lines[index].strip().startswith("|") and lines[index].strip().endswith("|")):
            index += 1
            continue
        start = index
        block: list[str] = []
        while index < len(lines):
            stripped = lines[index].strip()
            if not (stripped.startswith("|") and stripped.endswith("|")):
                break
            block.append(stripped)
            index += 1
        if len(block) < 2:
            continue
        widths = [len(table_cells(line)) for line in block]
        if len(set(widths)) != 1:
            errors.append(
                f"{relative}:{start + 1}: table rows have inconsistent column counts {widths}"
            )
            continue
        separator = table_cells(block[1])
        if not all(re.fullmatch(r":?-{3,}:?", cell) for cell in separator):
            errors.append(f"{relative}:{start + 2}: malformed Markdown table separator")
    return errors


def main() -> int:
    errors: list[str] = []
    summaries: list[str] = []
    all_documents = repository_documents()
    for document in all_documents:
        try:
            content = document_content(document)
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(f"{document.relative_to(ROOT)}: {exc}")
            continue
        errors.extend(check_document_file(document, content))

    week_directories = sorted(COURSE.glob("Week_*"), key=week_number)
    if len(week_directories) != 18:
        errors.append(f"expected 18 week directories, found {len(week_directories)}")

    for directory in week_directories:
        number = week_number(directory)
        files = sorted(path.name for path in directory.iterdir() if path.is_file())
        expected = (
            [f"week{number}_main.ipynb"]
            if number in {2, 3, 4}
            else [f"week{number}_main.md", f"week{number}_support.md"]
        )
        if files != expected:
            errors.append(f"{directory.name}: expected only {expected}, found {files}")
            continue

        main_path = directory / expected[0]
        support_path = directory / expected[1] if len(expected) == 2 else None
        main_content = document_content(main_path)
        support_content = (
            support_path.read_text(encoding="utf-8") if support_path else ""
        )
        main_lines = len(main_content.splitlines())
        support_lines = len(support_content.splitlines())
        summaries.append(
            f"Week {number:02d}: main={main_lines} lines"
            + (f", support={support_lines} lines" if support_path else ", single notebook")
        )

        if number == 18 and (main_content.strip() or support_content.strip()):
            errors.append(f"{directory.name}: Week 18 must remain blank")
        if number == 1 and re.search(r"[\u3400-\u9fff]", main_content):
            errors.append(f"{main_path.relative_to(ROOT)}: Week 1 main must be English-only")

        duplicate_tables = (
            markdown_table_blocks(main_content) & markdown_table_blocks(support_content)
            if support_path
            else set()
        )
        if duplicate_tables:
            errors.append(
                f"{directory.name}: main and support duplicate {len(duplicate_tables)} table(s)"
            )

        if number in OVERVIEW_WEEKS:
            for heading in ("### Teaching Objectives", "### Teaching Content"):
                if heading not in main_content:
                    errors.append(f"{main_path.relative_to(ROOT)}: missing {heading}")

            objectives = section(main_content, "### Teaching Objectives")
            content_overview = section(main_content, "### Teaching Content")
            if not re.search(r"(?m)^\d+\. ", objectives):
                errors.append(
                    f"{main_path.relative_to(ROOT)}: Teaching Objectives need numbered, "
                    "observable outcomes"
                )
            if re.search(r"\b(?:purchase|install)\b|%", objectives.lower()):
                errors.append(
                    f"{main_path.relative_to(ROOT)}: Teaching Objectives include an "
                    "administrative or setup item"
                )
            if re.search(r"(?m)^\s*(?:[-*]|\d+\.)\s", content_overview) or "|---" in content_overview:
                errors.append(
                    f"{main_path.relative_to(ROOT)}: Teaching Content must be continuous prose"
                )

        if number in HARDWARE_CODE_WEEKS:
            fixed_pins = re.findall(
                r"const\s+int\s+PIN_[A-Z0-9_]+\s*=\s*([0-9]+)\s*;", main_content
            )
            if fixed_pins:
                errors.append(
                    f"{main_path.relative_to(ROOT)}: unverified hardware example contains "
                    f"fixed GPIO value(s): {', '.join(fixed_pins)}"
                )

        if number in REGULAR_WEEKS:
            if main_lines < 180:
                errors.append(
                    f"{main_path.relative_to(ROOT)}: only {main_lines} lines for a regular unit"
                )
            if support_path and support_lines < 100:
                errors.append(
                    f"{support_path.relative_to(ROOT)}: only {support_lines} lines for support"
                )

    print("\n".join(summaries))
    if errors:
        print("\nVerification errors:", file=sys.stderr)
        print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
        return 1
    print(
        f"Course material structure, {len(all_documents)} Markdown/notebook files, "
        "and local links: PASS"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
