Let's write a python scraper:

```py file=scraper.py
#!/usr/bin/env python3
"""
nuforc_scrape.py

Polite scraper for NUFORC's DataTables-backed endpoint:
  https://nuforc.org/wp-admin/admin-ajax.php?action=get_wdtable&table_id=1&wdt_var1=Post&wdt_var2=-1

Features:
- Bootstraps headers/cookies/payload from a user-provided cURL command (stdin or file)
- Caches all HTTP requests (requests-cache) to avoid hammering the server
- Paginates via start/length; auto-detects total rows
- Retries with exponential backoff on transient failures and 429
- Auto-refreshes wdtNonce by scraping the referer page when needed
- Writes normalized CSV columns

Linux dependencies:
  pip install requests requests-cache beautifulsoup4 lxml

Usage:
  See "Example Usage" block.
"""
import argparse
import csv
import html
import io
import json
import os
import random
import re
import sys
import time
from urllib.parse import parse_qs, urlencode, urlparse, urljoin

import requests
import requests_cache
from bs4 import BeautifulSoup

# -----------------------------
# Utilities: parse cURL
# -----------------------------
_curl_header_re = re.compile(r"""^-H\s+['"]?([^:'"]+)\s*:\s*(.+?)['"]?$""")
_curl_data_re = re.compile(r"""--data-raw\s+['"](.+?)['"]""", re.DOTALL)
_curl_url_re = re.compile(r"""curl\s+['"]([^'"]+)['"]""")
_curl_method_re = re.compile(r"""-X\s+([A-Z]+)""")

def _strip_quotes(s: str) -> str:
    if len(s) >= 2 and ((s[0] == s[-1] == "'") or (s[0] == s[-1] == '"')):
        return s[1:-1]
    return s

def parse_curl(raw: str):
    """
    Very light cURL parser for typical patterns used in browser-copy cURL.
    Returns: dict with keys: url, method, headers (dict), data (dict), referer (str|None)
    """
    # Merge backslash-continued lines
    raw_compact = re.sub(r"\\\s*\n", " ", raw.strip())

    url_match = _curl_url_re.search(raw_compact)
    if not url_match:
        raise ValueError("Could not find URL in cURL.")
    url = url_match.group(1)

    method_match = _curl_method_re.search(raw_compact)
    method = method_match.group(1).upper() if method_match else "GET"

    headers = {}
    referer = None
    for part in raw_compact.split():
        # We rely on -H lines captured via regex pass below
        pass

    # More robust header extraction: scan per-line tokens
    for line in raw.strip().splitlines():
        line = line.strip()
        if line.startswith("-H ") or line.startswith("--header "):
            m = _curl_header_re.match(line[2:].strip() if line.startswith("-H ") else line[len("--header "):].strip())
            if m:
                k = _strip_quotes(m.group(1)).strip()
                v = _strip_quotes(m.group(2)).strip()
                headers[k] = v
                if k.lower() == "referer":
                    referer = v

    # Data
    data = {}
    mdata = _curl_data_re.search(raw_compact)
    if mdata:
        body = mdata.group(1)
        # Handle application/x-www-form-urlencoded
        data = {k: v[0] if len(v) == 1 else v for k, v in parse_qs(body).items()}

    return {
        "url": url,
        "method": method,
        "headers": headers,
        "data": data,
        "referer": referer,
    }

# -----------------------------
# Nonce handling
# -----------------------------
def extract_nonce_from_html(html_text: str) -> str | None:
    """
    Try a few patterns that might contain the nonce (wdtNonce).
    """
    # input name="wdtNonce" value="..."
    m = re.search(r'name=["\']wdtNonce["\']\s+value=["\']([0-9a-fA-F]+)["\']', html_text)
    if m:
        return m.group(1)

    # wdtNonce = "..."
    m = re.search(r'wdtNonce\s*=\s*["\']([0-9a-fA-F]+)["\']', html_text)
    if m:
        return m.group(1)

    # data-wdtNonce="..."
    m = re.search(r'data-wdt(?:nonce|Nonce)=["\']([0-9a-fA-F]+)["\']', html_text)
    if m:
        return m.group(1)

    # Hidden field somewhere else?
    soup = BeautifulSoup(html_text, "lxml")
    node = soup.find(attrs={"name": "wdtNonce"})
    if node and node.has_attr("value"):
        return node["value"]

    return None

def refresh_nonce(session: requests.Session, referer_url: str, delay: float = 0.8) -> str | None:
    """
    Fetch referer page and try to scrape a fresh wdtNonce.
    """
    if not referer_url:
        return None
    time.sleep(delay)  # be polite
    r = session.get(referer_url, timeout=30)
    if r.status_code == 200:
        return extract_nonce_from_html(r.text)
    return None

# -----------------------------
# Fetch page
# -----------------------------
def polite_sleep(base_delay: float):
    # add small jitter
    t = base_delay + random.uniform(0, base_delay * 0.25)
    time.sleep(t)

def robust_post(session: requests.Session, url: str, headers: dict, data: dict, retries: int = 5):
    """
    POST with retries/backoff on 429/5xx and connection resets.
    """
    backoff = 1.0
    for attempt in range(1, retries + 1):
        try:
            r = session.post(url, headers=headers, data=data, timeout=60)
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(backoff)
                backoff = min(backoff * 2, 30)
                continue
            return r
        except requests.RequestException:
            time.sleep(backoff)
            backoff = min(backoff * 2, 30)
    # last try
    return session.post(url, headers=headers, data=data, timeout=60)

# -----------------------------
# CSV helpers
# -----------------------------
CSV_HEADERS = [
    "id",
    "link_url",
    "occurred",
    "city",
    "state",
    "country",
    "shape",
    "summary",
    "reported",
    "has_image",
    "explanation",
]

def parse_row(row, base_url: str) -> dict:
    """
    Convert a single NUFORC row array into a normalized dict.
    row indices:
      0: HTML anchor ("Open") -> contains /sighting/?id=NNNNNN
      1: Occurred (date/time)
      2: City
      3: State/region
      4: Country
      5: Shape
      6: Summary
      7: Reported (date)
      8: HasImage (Y|null)
      9: Explanation (string|null)
    """
    def anchor_to_id_and_url(html_anchor: str):
        if not html_anchor:
            return None, None
        # Unescape, then parse 'href'
        s = html.unescape(html_anchor)
        href_match = re.search(r"href=['\"]([^'\"]+)['\"]", s)
        href = href_match.group(1) if href_match else None
        if href:
            # ensure absolute URL
            full = urljoin(base_url, href)
            # try to extract ?id=NNN
            q = urlparse(full).query
            params = parse_qs(q)
            sid = params.get("id", [None])[0]
            return sid, full
        return None, None

    sid, link = anchor_to_id_and_url(row[0] if len(row) > 0 else None)

    return {
        "id": sid,
        "link_url": link,
        "occurred": row[1] if len(row) > 1 else None,
        "city": row[2] if len(row) > 2 else None,
        "state": row[3] if len(row) > 3 else None,
        "country": row[4] if len(row) > 4 else None,
        "shape": row[5] if len(row) > 5 else None,
        "summary": row[6] if len(row) > 6 else None,
        "reported": row[7] if len(row) > 7 else None,
        "has_image": row[8] if len(row) > 8 else None,
        "explanation": row[9] if len(row) > 9 else None,
    }

# -----------------------------
# Main scrape
# -----------------------------
def main():
    ap = argparse.ArgumentParser(description="Polite scraper for NUFORC DataTables endpoint.")
    ap.add_argument("--curl-file", type=str, default="-",
                    help="Path to a text file containing the initial cURL command (or '-' for stdin).")
    ap.add_argument("--out", type=str, default="nuforc_sightings.csv", help="Output CSV filename.")
    ap.add_argument("--length", type=int, default=500, help="Rows per page (server may cap this).")
    ap.add_argument("--start", type=int, default=0, help="Starting index (zero-based).")
    ap.add_argument("--max-rows", type=int, default=0, help="Maximum rows to fetch (0 = all).")
    ap.add_argument("--delay", type=float, default=0.8, help="Base delay (seconds) between requests.")
    ap.add_argument("--cache-name", type=str, default="nuforc_cache", help="requests-cache SQLite filename.")
    ap.add_argument("--expire", type=int, default=86400, help="Cache expiration in seconds (default 1 day).")
    ap.add_argument("--resume", action="store_true", help="Resume: append to existing CSV (skips header).")
    args = ap.parse_args()

    # Read cURL
    if args.curl_file == "-":
        raw_curl = sys.stdin.read()
    else:
        with open(args.curl_file, "r", encoding="utf-8") as fh:
            raw_curl = fh.read()

    curl = parse_curl(raw_curl)

    # Prepare session with caching
    requests_cache.install_cache(cache_name=args.cache_name, expire_after=args.expire)
    session = requests.Session()

    # Use headers from cURL, but drop hop-by-hop / fragile tracing headers
    headers = dict(curl["headers"])
    for k in list(headers.keys()):
        kl = k.lower()
        if kl in ("content-length", "host", "traceparent", "tracestate", "x-newrelic-id", "newrelic", "priority"):
            headers.pop(k, None)

    url = curl["url"]
    referer = curl.get("referer") or "https://nuforc.org/subndx/?id=all"

    # Base payload from cURL
    base_data = dict(curl["data"])
    # Ensure required fields
    base_data.setdefault("draw", "2")
    base_data.setdefault("order[0][column]", "1")
    base_data.setdefault("order[0][dir]", "desc")
    base_data.setdefault("search[value]", "")
    base_data.setdefault("search[regex]", "false")
    base_data.setdefault("length", str(args.length))

    # Function to do one page
    def fetch_page(start_index: int, want_length: int, try_nonce_refresh=True):
        print(start_index)
        data = dict(base_data)
        data["start"] = str(start_index)
        data["length"] = str(want_length)

        # POST
        r = robust_post(session, url, headers=headers, data=data)
        # If nonce is missing/expired, try to refresh once
        if (r.status_code == 400 or r.status_code == 403 or r.status_code == 200) and try_nonce_refresh:
            # Heuristic: server might return HTML or JSON with error when nonce is bad.
            bad_nonce = False
            ctype = r.headers.get("Content-Type", "")
            if "application/json" in ctype:
                try:
                    j = r.json()
                    # Some backends return a specific key on error; keep heuristic light.
                    if isinstance(j, dict) and not j.get("data"):
                        bad_nonce = True
                except Exception:
                    pass
            else:
                # HTML page likely means something off (could be block page).
                bad_nonce = True

            if bad_nonce:
                # Refresh nonce from referer
                new_nonce = refresh_nonce(session, referer, delay=args.delay)
                if new_nonce:
                    base_data["wdtNonce"] = new_nonce
                    # Try again once
                    polite_sleep(args.delay)
                    return fetch_page(start_index, want_length, try_nonce_refresh=False)
        return r

    # 1) Get total rows with a tiny probe (length=1)
    polite_sleep(args.delay)
    probe = fetch_page(start_index=args.start, want_length=1)
    if probe.status_code != 200:
        sys.exit(f"Initial probe failed with status {probe.status_code}")

    try:
        j = probe.json()
    except Exception:
        # If we got HTML, print some context
        sys.exit("Probe did not return JSON; check your cURL (nonce/cookies).")

    # Try standard DataTables fields
    total = j.get("recordsFiltered") or j.get("recordsTotal") or 0
    try:
        total = int(total)
    except Exception:
        total = 0
    if total <= 0:
        # Fallback to len(data)
        total = len(j.get("data", []))

    # Compute last index to fetch
    if args.max_rows and args.max_rows > 0:
        last_index = min(args.start + args.max_rows, total)
    else:
        last_index = total

    # CSV setup
    out_exists = os.path.exists(args.out)
    write_header = not (args.resume and out_exists)
    fmode = "a" if (args.resume and out_exists) else "w"
    with open(args.out, fmode, newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=CSV_HEADERS)
        if write_header:
            writer.writeheader()

        # If the probe already returned data for the requested start, stash it;
        # Otherwise we will refetch the page with correct length.
        def consume_page_json(page_json, base_link):
            rows = page_json.get("data", [])
            for row in rows:
                rec = parse_row(row, base_link)
                writer.writerow(rec)

        # If probe start==args.start and length==1, just skip writing probe unless length==1 requested
        # We'll re-fetch with the desired length for consistency.

        # Iterate pages
        base_link = f"{urlparse(url).scheme}://{urlparse(url).netloc}/"
        cur = args.start
        step = int(base_data.get("length", args.length))
        while cur < last_index:
            want = min(step, last_index - cur)
            polite_sleep(args.delay)
            r = fetch_page(start_index=cur, want_length=want)
            if r.status_code != 200:
                print(f"Warn: HTTP {r.status_code} at start={cur}; backing off and continuing.", file=sys.stderr)
                time.sleep(2.0)
                continue
            try:
                pj = r.json()
            except Exception:
                print(f"Warn: Non-JSON at start={cur}; skipping.", file=sys.stderr)
                continue

            rows = pj.get("data", [])
            if not rows:
                # No more data
                break

            # Write rows
            for row in rows:
                rec = parse_row(row, base_link)
                writer.writerow(rec)

            # Progress
            cur += want

    print(f"Done. Wrote CSV: {args.out}")
    print(f"Total (reported): {total}. Requested rows: {last_index - args.start}. Cached DB: {args.cache_name}.sqlite")

if __name__ == "__main__":
    main()

```