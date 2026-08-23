"""Check course materials against repository structure and AGENTS.md hard rules."""

from __future__ import annotations

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


def local_links(markdown: Path, content: str) -> list[tuple[Path, str]]:
    results: list[tuple[Path, str]] = []
    for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", content):
        target = target.strip().strip("<>")
        if re.match(r"^(https?://|mailto:)", target):
            continue
        path_text, _, anchor = target.partition("#")
        path_text = unquote(path_text)
        anchor = unquote(anchor).lower()
        if not path_text:
            continue
        results.append(((markdown.parent / path_text).resolve(), anchor))
    return results


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


def markdown_anchors(markdown: Path) -> set[str]:
    text = markdown.read_text(encoding="utf-8")
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


def repository_markdown_files() -> list[Path]:
    excluded_parts = {".git", ".venv", "node_modules", ".pytest_cache"}
    return sorted(
        path
        for path in ROOT.rglob("*.md")
        if not excluded_parts.intersection(path.parts)
    )


def table_cells(line: str) -> list[str]:
    body = line.strip()[1:-1]
    return [cell.strip() for cell in re.split(r"(?<!\\)\|", body)]


def check_markdown_file(markdown: Path, content: str) -> list[str]:
    errors: list[str] = []
    relative = markdown.relative_to(ROOT)
    if content.count("```") % 2:
        errors.append(f"{relative}: unbalanced code fence")
    if markdown.name != "AGENTS.md":
        for phrase in FORBIDDEN_EDITORIAL_PHRASES:
            if phrase.lower() in content.lower():
                errors.append(f"{relative}: forbidden editorial phrase {phrase!r}")
    for target, anchor in local_links(markdown, content):
        if not target.exists():
            errors.append(f"{relative}: missing local link {target}")
        elif anchor and target.suffix.lower() == ".md":
            if anchor not in markdown_anchors(target):
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
    all_markdown = repository_markdown_files()
    for markdown in all_markdown:
        errors.extend(check_markdown_file(markdown, markdown.read_text(encoding="utf-8")))

    week_directories = sorted(COURSE.glob("Week_*"), key=week_number)
    if len(week_directories) != 18:
        errors.append(f"expected 18 week directories, found {len(week_directories)}")

    for directory in week_directories:
        number = week_number(directory)
        files = sorted(path.name for path in directory.iterdir() if path.is_file())
        expected = [f"week{number}_main.md", f"week{number}_support.md"]
        if files != expected:
            errors.append(f"{directory.name}: expected only {expected}, found {files}")
            continue

        main_path = directory / expected[0]
        support_path = directory / expected[1]
        main_content = main_path.read_text(encoding="utf-8")
        support_content = support_path.read_text(encoding="utf-8")
        main_lines = len(main_content.splitlines())
        support_lines = len(support_content.splitlines())
        summaries.append(
            f"Week {number:02d}: main={main_lines} lines, support={support_lines} lines"
        )

        if number == 18 and (main_content.strip() or support_content.strip()):
            errors.append(f"{directory.name}: Week 18 must remain blank")
        if number == 1 and re.search(r"[\u3400-\u9fff]", main_content):
            errors.append(f"{main_path.relative_to(ROOT)}: Week 1 main must be English-only")

        duplicate_tables = markdown_table_blocks(main_content) & markdown_table_blocks(
            support_content
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
            if support_lines < 100:
                errors.append(
                    f"{support_path.relative_to(ROOT)}: only {support_lines} lines for support"
                )

    print("\n".join(summaries))
    if errors:
        print("\nVerification errors:", file=sys.stderr)
        print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
        return 1
    print(f"Course material structure, {len(all_markdown)} Markdown files, and local links: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
