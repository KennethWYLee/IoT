import csv
import hashlib
import json
import os
import re
import sys
import time
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import unquote, urldefrag, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

START_URL = os.environ.get(
    "MIRROR_START_URL", "https://wiki.goomo.net/doku.php/ntub/iotapp/start"
)
USERNAME = os.environ.get("MIRROR_USERNAME")
PASSWORD = os.environ.get("MIRROR_PASSWORD")
OUTPUT_DIR = Path(os.environ.get("MIRROR_OUTPUT_DIR", "")).expanduser()
MAX_PAGES = int(os.environ.get("MIRROR_MAX_PAGES", "500"))
CHECK_EXTERNAL = os.environ.get("MIRROR_CHECK_EXTERNAL", "1") == "1"
SKIP_STUDENT_WORKS = os.environ.get("MIRROR_SKIP_STUDENT_WORKS", "1") == "1"
MAX_ASSET_BYTES = int(os.environ.get("MIRROR_MAX_ASSET_BYTES", str(15 * 1024 * 1024)))

if not USERNAME or not PASSWORD or not OUTPUT_DIR:
    raise SystemExit("Set MIRROR_USERNAME, MIRROR_PASSWORD, and MIRROR_OUTPUT_DIR.")


session = requests.Session()
session.headers.update(
    {
        "User-Agent": "Codex course reference mirror/1.0",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.7",
    }
)

errors = []
asset_map = {}
asset_meta = []
skipped_links = []
skipped_assets = []


def safe_segment(text):
    text = unquote(text).strip() or "index"
    text = re.sub(r'[<>:"/\\\\|?*\x00-\x1f]', "_", text)
    text = re.sub(r"\s+", "_", text)
    return text[:120] or "index"


def rel_href(target, source):
    return os.path.relpath(target, source.parent).replace(os.sep, "/")


def nofrag(url):
    return urldefrag(url)[0]


def absolute_url(base, href):
    href = (href or "").strip()
    if not href:
        return "", ""
    if href.startswith(("mailto:", "tel:", "javascript:", "data:")):
        return href, ""
    href = href.replace("\\", "/")
    joined = urljoin(base, href)
    clean, fragment = urldefrag(joined)
    return clean, fragment


def is_wiki_page(url):
    parsed = urlparse(url)
    return (
        parsed.scheme in {"http", "https"}
        and parsed.netloc == "wiki.goomo.net"
        and parsed.path.startswith("/doku.php/")
        and not parsed.query
    )


def is_wiki_resource(url):
    parsed = urlparse(url)
    return (
        parsed.scheme in {"http", "https"}
        and parsed.netloc == "wiki.goomo.net"
        and (parsed.path.startswith("/lib/") or parsed.path.startswith("/_media/"))
    )


def is_student_work_url(url):
    if not SKIP_STUDENT_WORKS:
        return False
    parsed = urlparse(url)
    path = unquote(parsed.path)
    if (
        parsed.netloc == "wiki.goomo.net"
        and path.rstrip("/") == "/doku.php/ntub/iotapp/group1141"
    ):
        return True
    return parsed.netloc.endswith("goomo.net") and "/catalog/.ntub1141/.iotapp/" in path


def should_skip_asset_url(url):
    suffix = Path(unquote(urlparse(url).path)).suffix.lower()
    return suffix in {
        ".mp4",
        ".mov",
        ".avi",
        ".mkv",
        ".webm",
        ".mp3",
        ".wav",
        ".zip",
        ".7z",
        ".rar",
    }


def is_external_student_section(anchor, abs_url, page_url):
    if not SKIP_STUDENT_WORKS or nofrag(page_url) != nofrag(START_URL):
        return False
    parsed = urlparse(abs_url)
    if parsed.scheme not in {"http", "https"} or parsed.netloc == "wiki.goomo.net":
        return False
    heading = anchor.find_previous(["h2", "h3"])
    heading_text = heading.get_text(" ", strip=True) if heading else ""
    return any(
        keyword in heading_text for keyword in ("平時成績", "期中專題", "期末專題")
    )


def page_path(url):
    if nofrag(url) == nofrag(START_URL):
        return OUTPUT_DIR / "index.html"
    parsed = urlparse(url)
    page_id = parsed.path.removeprefix("/doku.php/").strip("/")
    parts = [safe_segment(p) for p in page_id.split("/") if p]
    if not parts:
        parts = ["start"]
    return OUTPUT_DIR / "pages" / Path(*parts[:-1]) / f"{parts[-1]}.html"


def asset_path_for(url, response=None):
    parsed = urlparse(url)
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    raw_name = Path(unquote(parsed.path)).name or "asset"
    name = safe_segment(raw_name)
    ctype = (
        (response.headers.get("content-type", "") if response is not None else "")
        .split(";")[0]
        .lower()
    )
    suffix = Path(name).suffix.lower()
    if not suffix:
        suffix = {
            "text/css": ".css",
            "application/javascript": ".js",
            "text/javascript": ".js",
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/gif": ".gif",
            "image/svg+xml": ".svg",
            "image/x-icon": ".ico",
            "font/woff2": ".woff2",
            "font/woff": ".woff",
            "application/pdf": ".pdf",
        }.get(ctype, ".bin")
        name += suffix
    host = safe_segment(parsed.netloc)
    return OUTPUT_DIR / "assets" / host / f"{digest}_{name}"


def existing_asset_path(url):
    parsed = urlparse(url)
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    folder = OUTPUT_DIR / "assets" / safe_segment(parsed.netloc)
    if not folder.exists():
        return None
    matches = sorted(folder.glob(f"{digest}_*"))
    return matches[0] if matches else None


def rewrite_css_urls(css_text, css_url, css_file):
    pattern = re.compile(r"url\((['\"]?)(?!data:)([^)'\"#]+)(#[^)'\"]*)?\1\)")

    def replace(match):
        quote = match.group(1)
        raw = match.group(2).strip()
        fragment = match.group(3) or ""
        abs_url, _ = absolute_url(css_url, raw)
        if is_wiki_resource(abs_url):
            local = download_asset(abs_url, css_url)
            if local:
                return f"url({quote}{rel_href(local, css_file)}{fragment}{quote})"
        return match.group(0)

    return pattern.sub(replace, css_text)


def download_asset(url, referer):
    url = nofrag(url)
    if url in asset_map:
        return asset_map[url]
    if should_skip_asset_url(url):
        skipped_assets.append(
            {"url": url, "reason": "large media/archive left as remote URL"}
        )
        return None
    existing = existing_asset_path(url)
    if existing is not None:
        asset_map[url] = existing
        asset_meta.append(
            {
                "url": url,
                "path": str(existing),
                "status": "cached",
                "content_type": "",
                "bytes": existing.stat().st_size,
            }
        )
        return existing
    try:
        head = session.head(
            url, headers={"Referer": referer}, allow_redirects=True, timeout=15
        )
        content_length = head.headers.get("content-length")
        content_type = head.headers.get("content-type", "").split(";")[0].lower()
        if content_type.startswith(("video/", "audio/")):
            skipped_assets.append(
                {"url": url, "reason": f"{content_type} left as remote URL"}
            )
            return None
        if content_length and int(content_length) > MAX_ASSET_BYTES:
            skipped_assets.append(
                {"url": url, "reason": f"larger than {MAX_ASSET_BYTES} bytes"}
            )
            return None

        response = session.get(url, headers={"Referer": referer}, timeout=25)
        response.raise_for_status()
        if len(response.content) > MAX_ASSET_BYTES:
            skipped_assets.append(
                {"url": url, "reason": f"larger than {MAX_ASSET_BYTES} bytes"}
            )
            return None
        target = asset_path_for(url, response)
        target.parent.mkdir(parents=True, exist_ok=True)
        ctype = response.headers.get("content-type", "")
        if "text/css" in ctype or target.suffix.lower() == ".css":
            text = response.text
            target.write_text(
                rewrite_css_urls(text, url, target),
                encoding=response.encoding or "utf-8",
            )
        else:
            target.write_bytes(response.content)
        asset_map[url] = target
        asset_meta.append(
            {
                "url": url,
                "path": str(target),
                "status": response.status_code,
                "content_type": ctype,
                "bytes": target.stat().st_size,
            }
        )
        return target
    except Exception as exc:
        errors.append({"kind": "asset", "url": url, "error": repr(exc)})
        return None


def content_root(soup):
    return soup.select_one("div.dw-content-page") or soup


def login():
    response = session.post(
        START_URL,
        data={
            "u": USERNAME,
            "p": PASSWORD,
            "r": "1",
            "do": "login",
            "id": "ntub:iotapp:start",
        },
        timeout=45,
    )
    response.raise_for_status()
    check = session.get(START_URL, timeout=45)
    check.raise_for_status()
    if "您尚未登入" in check.text or "mode_denied" in check.text:
        raise RuntimeError("Login did not succeed.")
    return check.text


def crawl_pages(first_html):
    queue = deque([nofrag(START_URL)])
    html_by_url = {}
    queued = {nofrag(START_URL)}
    while queue and len(html_by_url) < MAX_PAGES:
        url = queue.popleft()
        try:
            if url == nofrag(START_URL):
                html = first_html
            else:
                response = session.get(url, timeout=45)
                response.raise_for_status()
                html = response.text
            html_by_url[url] = html
            soup = BeautifulSoup(html, "html.parser")
            for anchor in content_root(soup).find_all("a", href=True):
                child, _ = absolute_url(url, anchor["href"])
                if is_student_work_url(child):
                    continue
                if is_wiki_page(child) and child not in queued:
                    queued.add(child)
                    queue.append(child)
        except Exception as exc:
            errors.append({"kind": "page", "url": url, "error": repr(exc)})
    if queue:
        errors.append(
            {
                "kind": "crawl_limit",
                "url": "",
                "error": f"Stopped at {MAX_PAGES} pages; {len(queue)} queued.",
            }
        )
    return html_by_url


def rewrite_srcset(value, base_url, source_file):
    pieces = []
    for item in value.split(","):
        item = item.strip()
        if not item:
            continue
        bits = item.split()
        abs_url, fragment = absolute_url(base_url, bits[0])
        if is_wiki_resource(abs_url):
            local = download_asset(abs_url, base_url)
            if local:
                bits[0] = rel_href(local, source_file) + (
                    f"#{fragment}" if fragment else ""
                )
        pieces.append(" ".join(bits))
    return ", ".join(pieces)


def rewrite_html(url, html, page_urls):
    soup = BeautifulSoup(html, "html.parser")
    target_file = page_path(url)
    target_file.parent.mkdir(parents=True, exist_ok=True)

    for tag in soup.find_all(True):
        for attr in ("href", "src", "data", "poster"):
            if not tag.has_attr(attr):
                continue
            value = tag.get(attr)
            abs_url, fragment = absolute_url(url, value)
            if not abs_url or abs_url.startswith(
                ("mailto:", "tel:", "javascript:", "data:")
            ):
                continue

            if (
                tag.name == "a"
                and attr == "href"
                and (
                    is_student_work_url(abs_url)
                    or is_external_student_section(tag, abs_url, url)
                )
            ):
                skipped_links.append(
                    {
                        "source": url,
                        "url": abs_url + (f"#{fragment}" if fragment else ""),
                        "text": tag.get_text(" ", strip=True)[:200],
                        "reason": "student work skipped",
                    }
                )
                tag.attrs.pop("href", None)
                tag["data-skipped-href"] = abs_url
                tag["title"] = "student work skipped in local mirror"
            elif attr == "href" and abs_url in page_urls:
                local = page_path(abs_url)
                tag[attr] = rel_href(local, target_file) + (
                    f"#{fragment}" if fragment else ""
                )
            elif is_wiki_resource(abs_url):
                local = download_asset(abs_url, url)
                if local:
                    tag[attr] = rel_href(local, target_file) + (
                        f"#{fragment}" if fragment else ""
                    )
            elif urlparse(abs_url).netloc == "wiki.goomo.net":
                tag[attr] = abs_url + (f"#{fragment}" if fragment else "")

        if tag.has_attr("srcset"):
            tag["srcset"] = rewrite_srcset(tag["srcset"], url, target_file)

    target_file.write_text(str(soup), encoding="utf-8")


def check_local_links(page_urls):
    broken = []
    external = set()
    local_checked = 0
    resource_attrs = [
        ("a", "href"),
        ("link", "href"),
        ("script", "src"),
        ("img", "src"),
        ("iframe", "src"),
        ("source", "src"),
        ("video", "src"),
        ("audio", "src"),
        ("embed", "src"),
        ("object", "data"),
    ]
    html_files = [page_path(url) for url in page_urls]
    fragment_cache = {}
    for html_file in html_files:
        soup = BeautifulSoup(html_file.read_text(encoding="utf-8"), "html.parser")
        for tag_name, attr in resource_attrs:
            for tag in soup.find_all(tag_name):
                value = tag.get(attr)
                if not value or value.startswith(
                    ("#", "mailto:", "tel:", "javascript:", "data:")
                ):
                    continue
                clean, fragment = urldefrag(value)
                parsed = urlparse(clean)
                if parsed.scheme in {"http", "https"}:
                    if tag_name == "a":
                        external.add(clean)
                    continue
                local_checked += 1
                target = (html_file.parent / unquote(clean)).resolve()
                try:
                    target.relative_to(OUTPUT_DIR.resolve())
                except ValueError:
                    broken.append(
                        {
                            "source": str(html_file),
                            "target": value,
                            "reason": "outside output directory",
                        }
                    )
                    continue
                if not target.exists():
                    broken.append(
                        {
                            "source": str(html_file),
                            "target": value,
                            "reason": "missing file",
                        }
                    )
                    continue
                if fragment and target.suffix.lower() in {".html", ".htm"}:
                    if target not in fragment_cache:
                        target_soup = BeautifulSoup(
                            target.read_text(encoding="utf-8"), "html.parser"
                        )
                        fragment_cache[target] = {
                            *(tag.get("id") for tag in target_soup.find_all(id=True)),
                            *(
                                tag.get("name")
                                for tag in target_soup.find_all(attrs={"name": True})
                            ),
                        }
                    decoded_fragment = unquote(fragment)
                    if decoded_fragment not in fragment_cache[target]:
                        broken.append(
                            {
                                "source": str(html_file),
                                "target": value,
                                "reason": "missing fragment",
                            }
                        )
    return broken, sorted(external), local_checked


def check_one_external(url):
    headers = {"User-Agent": session.headers["User-Agent"]}
    try:
        response = requests.head(url, headers=headers, allow_redirects=True, timeout=8)
        if response.status_code in {405, 403, 400} or response.status_code >= 500:
            response = requests.get(
                url, headers=headers, allow_redirects=True, timeout=10, stream=True
            )
        return {
            "url": url,
            "status": response.status_code,
            "ok": 200 <= response.status_code < 400,
            "final_url": response.url,
        }
    except Exception as exc:
        return {
            "url": url,
            "status": "",
            "ok": False,
            "final_url": "",
            "error": repr(exc),
        }


def write_csv(path, rows, fieldnames):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main():
    started = time.time()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    first_html = login()
    html_by_url = crawl_pages(first_html)
    page_urls = sorted(html_by_url.keys(), key=lambda u: (u != nofrag(START_URL), u))

    for url in page_urls:
        rewrite_html(url, html_by_url[url], set(page_urls))

    broken_local, external_links, local_checked = check_local_links(page_urls)
    external_status = []
    if CHECK_EXTERNAL and external_links:
        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = [pool.submit(check_one_external, url) for url in external_links]
            for future in as_completed(futures):
                external_status.append(future.result())
        external_status.sort(key=lambda row: row["url"])

    reports = OUTPUT_DIR / "reports"
    manifest_rows = [{"url": url, "path": str(page_path(url))} for url in page_urls]
    write_csv(reports / "pages.csv", manifest_rows, ["url", "path"])
    write_csv(
        reports / "assets.csv",
        asset_meta,
        ["url", "path", "status", "content_type", "bytes"],
    )
    write_csv(reports / "skipped_assets.csv", skipped_assets, ["url", "reason"])
    write_csv(
        reports / "broken_local_links.csv", broken_local, ["source", "target", "reason"]
    )
    write_csv(
        reports / "skipped_student_links.csv",
        skipped_links,
        ["source", "url", "text", "reason"],
    )
    write_csv(
        reports / "external_links.csv",
        external_status
        or [
            {"url": url, "status": "", "ok": "", "final_url": ""}
            for url in external_links
        ],
        ["url", "status", "ok", "final_url", "error"],
    )
    write_csv(reports / "errors.csv", errors, ["kind", "url", "error"])

    summary = {
        "start_url": START_URL,
        "output_dir": str(OUTPUT_DIR),
        "pages": len(page_urls),
        "assets": len(asset_meta),
        "skipped_assets": len(skipped_assets),
        "local_links_checked": local_checked,
        "broken_local_links": len(broken_local),
        "external_links": len(external_links),
        "external_checked": bool(external_status),
        "external_failures": sum(1 for row in external_status if not row.get("ok")),
        "skipped_student_links": len(skipped_links),
        "errors": len(errors),
        "elapsed_seconds": round(time.time() - started, 2),
    }
    (reports / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"mirror failed: {exc!r}", file=sys.stderr)
        raise
