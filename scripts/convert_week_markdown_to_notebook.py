"""Merge one week's main/support Markdown pair into a student-facing notebook."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def github_heading_slug(heading: str) -> str:
    heading = re.sub(r"`([^`]*)`", r"\1", heading.strip().lower())
    heading = re.sub(r"<[^>]+>", "", heading)
    heading = "".join(
        character
        for character in heading
        if character.isalnum() or character in {" ", "-", "_"}
    )
    return re.sub(r"\s+", "-", heading).strip("-")


def first_heading(markdown: str) -> str:
    match = re.search(r"^#\s+(.+?)\s*$", markdown, flags=re.MULTILINE)
    if not match:
        raise ValueError("main material needs a level-one title")
    return match.group(1)


def demote_support(markdown: str) -> str:
    lines = markdown.splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    result: list[str] = []
    for line in lines:
        if line.startswith("#### "):
            line = "##### " + line[5:]
        elif line.startswith("### "):
            line = "#### " + line[4:]
        elif line.startswith("## "):
            line = "### " + line[3:]
        result.append(line)
    return "\n".join(result).strip()


def split_markdown_sections(markdown: str) -> list[str]:
    """Make one Markdown cell per level-one or level-two section."""
    starts = [
        match.start()
        for match in re.finditer(r"(?m)^(?=#(?:#)?\s+)", markdown)
    ]
    if not starts or starts[0] != 0:
        starts.insert(0, 0)
    starts.append(len(markdown))
    return [
        markdown[starts[index] : starts[index + 1]].strip()
        for index in range(len(starts) - 1)
        if markdown[starts[index] : starts[index + 1]].strip()
    ]


def append_markdown_and_cpp_cells(cells: list[dict], markdown: str) -> None:
    position = 0
    pattern = re.compile(r"```cpp\s*\n(.*?)\n```", flags=re.DOTALL)
    for match in pattern.finditer(markdown):
        before = markdown[position : match.start()].strip()
        for section in split_markdown_sections(before):
            cells.append(
                {"cell_type": "markdown", "metadata": {}, "source": section + "\n"}
            )
        cells.append(
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {
                    "language": "cpp",
                    "tags": ["arduino", "copy-to-arduino-ide"],
                },
                "outputs": [],
                "source": match.group(1).rstrip() + "\n",
            }
        )
        position = match.end()
    remainder = markdown[position:].strip()
    for section in split_markdown_sections(remainder):
        cells.append(
            {"cell_type": "markdown", "metadata": {}, "source": section + "\n"}
        )


def convert(main_path: Path, support_path: Path, output_path: Path) -> None:
    main = main_path.read_text(encoding="utf-8")
    support = support_path.read_text(encoding="utf-8")
    title = first_heading(main)
    title_anchor = github_heading_slug(title)

    week_match = re.search(r"week(\d+)_main\.md$", main_path.name, flags=re.I)
    if not week_match:
        raise ValueError(f"unexpected main filename: {main_path.name}")
    week = int(week_match.group(1))
    appendix_title = f"十三、附錄：Week {week}支援資料"
    appendix_anchor = github_heading_slug(appendix_title)

    main = main.replace(f"{support_path.name}#", "#")
    main = main.replace(f"({support_path.name})", f"(#{appendix_anchor})")
    main = main.replace(main_path.name, "main.ipynb")
    main = main.replace(f"Week {week}支援資料", "本notebook附錄")
    main = main.replace("集中在支援資料", "集中在本notebook附錄")

    support = support.replace(f"({main_path.name})", f"(#{title_anchor})")
    support = support.replace("本檔集中", "本附錄集中")
    support = support.replace("本檔放置", "本附錄放置")
    support = support.replace("實際操作步驟請依", "核心操作步驟請回到")
    support = demote_support(support)
    combined = main.rstrip() + f"\n\n---\n\n## {appendix_title}\n\n" + support + "\n"

    cells: list[dict] = []
    append_markdown_and_cpp_cells(cells, combined)
    for index, cell in enumerate(cells, start=1):
        cell["id"] = f"week{week:02d}-cell-{index:03d}"
    notebook = {
        "cells": cells,
        "metadata": {
            "course": "Internet of Things",
            "week": week,
            "source_format": "single-student-entry",
            "language_info": {"name": "cpp", "file_extension": ".ino"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    output_path.write_text(
        json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("main_markdown", type=Path)
    parser.add_argument("support_markdown", type=Path)
    parser.add_argument("output_notebook", type=Path)
    args = parser.parse_args()
    if args.output_notebook.exists():
        raise FileExistsError(f"refusing to overwrite {args.output_notebook}")
    convert(args.main_markdown, args.support_markdown, args.output_notebook)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
