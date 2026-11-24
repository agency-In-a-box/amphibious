#!/usr/bin/env python3
"""Crawl a deployed Amphibious site and audit pages, links, CSS, JS and icons.

Usage:
  pip install requests beautifulsoup4
  find docs examples demos -name '*.html' | sort > /tmp/seeds.lst; echo sitemap.html >> /tmp/seeds.lst
  QA_BASE=https://deploy-preview-N--amphibious-aiab.netlify.app \
    python3 qa/live-site-crawl.py /tmp/crawl.json /tmp/seeds.lst "$(comma-separated icon names in the shipped set)"

Output: JSON keyed by page URL; each page has an "issues" list plus icon counts.
Baseline run against production on 2026-11-23: qa/2026-11-23-live-findings.csv
"""
import json
import os
import re
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urldefrag, urlparse

import requests
from bs4 import BeautifulSoup

BASE = os.environ.get("QA_BASE", "https://amphibious-aiab.netlify.app").rstrip("/")
HOST = urlparse(BASE).netloc
OUT = sys.argv[1]
SEEDS_FILE = sys.argv[2]
WHITELIST = set(sys.argv[3].split(","))

session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0 (AmphibiousQA crawler)"
cache = {}
lock = threading.Lock()

HTML_EXT = re.compile(r"(\.html?$|/$|/[^/.]+$)")
CSS_URL = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)")
CSS_IMPORT = re.compile(r"@import\s+(?:url\()?\s*['\"]([^'\"]+)['\"]")
JS_IMPORT = re.compile(
    r"(?:import|export)\s+(?:[\w*{}\s,$]+\s+from\s+)?['\"]([^'\"]+)['\"]|import\(\s*['\"]([^'\"]+)['\"]\s*\)"
)


def fetch(url, want_body=True):
    url = urldefrag(url)[0]
    with lock:
        if url in cache:
            return cache[url]
    rec = {"url": url}
    try:
        r = session.get(url, timeout=25, allow_redirects=True)
        rec.update(
            status=r.status_code,
            final=r.url,
            ctype=r.headers.get("content-type", "").split(";")[0].strip(),
            redirects=[h.status_code for h in r.history],
        )
        if want_body and r.status_code == 200 and any(
            t in rec["ctype"] for t in ("html", "css", "javascript", "svg")
        ):
            rec["body"] = r.text
    except Exception as e:  # noqa: BLE001
        rec.update(status=0, error=str(e)[:200], ctype="", final=url)
    with lock:
        cache[url] = rec
    return rec


def check_external(url):
    url = urldefrag(url)[0]
    with lock:
        if url in cache:
            return cache[url]
    rec = {"url": url}
    try:
        r = session.head(url, timeout=15, allow_redirects=True)
        if r.status_code in (403, 405, 400, 404, 501) or r.status_code >= 500:
            r = session.get(url, timeout=20, allow_redirects=True, stream=True)
            r.close()
        rec.update(status=r.status_code, final=r.url)
    except Exception as e:  # noqa: BLE001
        rec.update(status=0, error=str(e)[:150])
    with lock:
        cache[url] = rec
    return rec


def canon(url):
    u = urldefrag(url)[0]
    u = re.sub(r"/index\.html?$", "/", u)
    u = re.sub(r"\.html?$", "", u)
    return u


def is_internal(url):
    return urlparse(url).netloc in ("", HOST)


def ids_in(body):
    soup = BeautifulSoup(body, "html.parser")
    ids = {t.get("id") for t in soup.find_all(id=True)}
    ids |= {t.get("name") for t in soup.find_all("a", attrs={"name": True})}
    return ids


def audit_css(css_url, body, depth=0):
    """Return list of issues for a stylesheet and its imports/urls."""
    issues, refs = [], []
    if "@custom-media" in body or re.search(r"@media\s*\(\s*--", body):
        issues.append({"type": "css-raw-custom-media", "url": css_url})
    if re.search(r"@import\s+['\"]@", body):
        issues.append({"type": "css-alias-import", "url": css_url})
    for m in CSS_IMPORT.finditer(body):
        refs.append(("css-import", m.group(1)))
    for m in CSS_URL.finditer(body):
        v = m.group(1).strip()
        if v.startswith(("data:", "#", "var(")):
            continue
        refs.append(("css-url", v))
    for kind, ref in refs:
        target = urljoin(css_url, ref)
        if not target.startswith("http"):
            continue
        rec = fetch(target)
        bad = rec["status"] != 200
        if kind == "css-import" and rec["status"] == 200 and "css" not in rec["ctype"]:
            bad = True
        if bad:
            issues.append(
                {"type": kind + "-broken", "from": css_url, "ref": ref, "url": target,
                 "status": rec["status"], "ctype": rec["ctype"]}
            )
        elif kind == "css-import" and depth < 4 and rec.get("body"):
            issues.extend(audit_css(target, rec["body"], depth + 1))
    return issues


def audit_js(js_url, body):
    issues = []
    for m in JS_IMPORT.finditer(body):
        spec = m.group(1) or m.group(2)
        if not spec:
            continue
        if not spec.startswith((".", "/", "http")):
            issues.append({"type": "js-bare-import", "from": js_url, "ref": spec})
            continue
        target = urljoin(js_url, spec)
        rec = fetch(target, want_body=False)
        if rec["status"] != 200 or spec.endswith(".ts") or (
            "javascript" not in rec["ctype"] and "css" not in rec["ctype"]
        ):
            issues.append({"type": "js-import-broken", "from": js_url, "ref": spec, "url": target,
                           "status": rec["status"], "ctype": rec["ctype"]})
    return issues


def audit_page(url):
    rec = fetch(url)
    page = {"url": url, "status": rec["status"], "final": rec.get("final"),
            "ctype": rec.get("ctype"), "issues": [], "links": [], "icons": [],
            "external": [], "fragments": []}
    if rec["status"] != 200 or "html" not in rec.get("ctype", ""):
        return page, []
    base = rec["final"]
    soup = BeautifulSoup(rec["body"], "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    page["title"] = title
    new_pages = []

    # --- stylesheets
    css_count = 0
    for link in soup.find_all("link", href=True):
        rel = " ".join(link.get("rel") or []).lower()
        href = link["href"].strip()
        target = urljoin(base, href)
        if "stylesheet" in rel:
            css_count += 1
            a = fetch(target)
            if a["status"] != 200 or "css" not in a["ctype"]:
                page["issues"].append({"type": "stylesheet-broken", "ref": href, "url": target,
                                       "status": a["status"], "ctype": a["ctype"]})
            elif a.get("body") and is_internal(target):
                page["issues"].extend(audit_css(target, a["body"]))
        elif any(k in rel for k in ("icon", "preload", "modulepreload", "manifest")):
            a = fetch(target, want_body=False)
            if a["status"] != 200:
                page["issues"].append({"type": f"link-{rel}-broken", "ref": href, "url": target,
                                       "status": a["status"]})
    page["stylesheet_count"] = css_count

    # --- scripts
    script_order = []
    for s in soup.find_all("script"):
        src = s.get("src")
        if src:
            target = urljoin(base, src.strip())
            script_order.append(target)
            if not is_internal(target):
                a = check_external(target)
                if a["status"] != 200:
                    page["issues"].append({"type": "script-external-broken", "ref": src,
                                           "status": a["status"]})
                continue
            a = fetch(target)
            bad_mime = s.get("type") == "module" and "javascript" not in a["ctype"]
            if a["status"] != 200 or src.endswith(".ts") or bad_mime:
                page["issues"].append({"type": "script-broken", "ref": src, "url": target,
                                       "status": a["status"], "ctype": a["ctype"],
                                       "module": s.get("type") == "module"})
            elif a.get("body") and s.get("type") == "module":
                page["issues"].extend(audit_js(target, a["body"]))
        elif s.get("type") == "module" and s.string:
            for iss in audit_js(base, s.string):
                iss["inline"] = True
                page["issues"].append(iss)
    page["scripts"] = script_order

    # --- inline <style> and style attrs
    for st in soup.find_all("style"):
        if st.string:
            page["issues"].extend(audit_css(base, st.string))

    # --- media
    media = []
    for t in soup.find_all(["img", "source", "video", "audio", "iframe", "embed"]):
        for attr in ("src", "poster"):
            if t.get(attr):
                media.append((t.name, t[attr]))
        if t.get("srcset"):
            for part in t["srcset"].split(","):
                u = part.strip().split(" ")[0]
                if u:
                    media.append((t.name + "-srcset", u))
    for t in soup.find_all(["use", "image"]):
        h = t.get("href") or t.get("xlink:href")
        if h and not h.startswith("#"):
            media.append((t.name, h))
    for t in soup.find_all("object", data=True):
        media.append(("object", t["data"]))
    for tag, ref in media:
        if ref.startswith(("data:", "blob:", "about:", "javascript:")):
            continue
        target = urljoin(base, ref)
        a = fetch(target, want_body=False) if is_internal(target) else check_external(target)
        if a["status"] != 200:
            page["issues"].append({"type": f"media-broken", "tag": tag, "ref": ref, "url": target,
                                   "status": a["status"]})

    # --- icons
    for t in soup.find_all(attrs={"data-lucide": True}):
        page["icons"].append(t["data-lucide"])
    page["lucide_cdn"] = [u for u in script_order if "lucide" in u]
    page["loads_bundle"] = any("amphibious.es.js" in u or "amphibious.umd.js" in u for u in script_order)

    # --- anchors
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        text = " ".join(a.get_text(" ", strip=True).split())[:60]
        if not href or href.startswith(("mailto:", "tel:", "javascript:", "data:")):
            if href.startswith("javascript:"):
                page["issues"].append({"type": "link-javascript-href", "ref": href, "text": text})
            continue
        if href == "#":
            page["issues"].append({"type": "link-placeholder-hash", "text": text})
            continue
        target = urljoin(base, href)
        nofrag, frag = urldefrag(target)
        if not is_internal(target):
            page["external"].append({"ref": href, "url": nofrag, "text": text})
            continue
        page["links"].append({"ref": href, "url": nofrag, "frag": frag, "text": text})
        path = urlparse(nofrag).path
        if HTML_EXT.search(path) or path == "":
            new_pages.append(canon(nofrag))
        if frag:
            page["fragments"].append({"ref": href, "url": nofrag, "frag": frag, "text": text})
    return page, new_pages


def main():
    seeds = [BASE + "/"] + [canon(BASE + "/" + l.strip()) for l in open(SEEDS_FILE) if l.strip()]
    seen, pages = set(), {}
    frontier = []
    for s in seeds:
        if s not in seen:
            seen.add(s)
            frontier.append(s)
    with ThreadPoolExecutor(max_workers=12) as ex:
        while frontier:
            results = list(ex.map(audit_page, frontier))
            frontier = []
            for page, new in results:
                pages[page["url"]] = page
                for n in new:
                    if n not in seen:
                        seen.add(n)
                        frontier.append(n)
            print(f"pages audited: {len(pages)}, next layer: {len(frontier)}", file=sys.stderr)

        # broken internal links
        def link_check(item):
            pg, ln = item
            rec = fetch(ln["url"], want_body=False)
            return pg, ln, rec
        items = [(p["url"], l) for p in pages.values() for l in p["links"]]
        for pg, ln, rec in ex.map(link_check, items):
            if rec["status"] != 200:
                pages[pg]["issues"].append({"type": "link-broken", "ref": ln["ref"], "url": ln["url"],
                                            "status": rec["status"], "text": ln["text"]})

        # fragments
        id_cache = {}
        for p in pages.values():
            for f in p["fragments"]:
                rec = fetch(f["url"])
                if rec["status"] != 200 or not rec.get("body"):
                    continue
                if f["url"] not in id_cache:
                    id_cache[f["url"]] = ids_in(rec["body"])
                if f["frag"] not in id_cache[f["url"]]:
                    p["issues"].append({"type": "link-fragment-missing", "ref": f["ref"],
                                        "text": f["text"]})

        # externals
        ext = sorted({e["url"] for p in pages.values() for e in p["external"]})
        ext_res = dict(zip(ext, ex.map(check_external, ext)))
        for p in pages.values():
            for e in p["external"]:
                r = ext_res[e["url"]]
                if r["status"] != 200:
                    p["issues"].append({"type": "link-external-broken", "ref": e["ref"],
                                        "status": r["status"], "text": e["text"],
                                        "error": r.get("error", "")})

    # icons not in lightweight whitelist
    for p in pages.values():
        missing = sorted({i for i in p["icons"] if i not in WHITELIST})
        p["icons_missing"] = missing
        p["icons_total"] = len(p["icons"])
        for k in ("links", "external", "fragments"):
            p[k] = len(p[k])
    json.dump(pages, open(OUT, "w"), indent=1)


if __name__ == "__main__":
    main()
