"""
Import Chicago Animal Care and Control dogs into Wescues via Supabase.

Scrapes 24PetConnect (https://24petconnect.com/chgoall), maps each dog to the
Wescues database schema, and upserts records so re-runs are safe.

Requirements:
    pip install requests beautifulsoup4

    Optional (to auto-load .env.local):
    pip install python-dotenv

Setup — export these before running, or let python-dotenv load them from
your project's .env.local:
    NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=eyJ...

Usage:
    python scripts/import_cacc.py              # full import
    python scripts/import_cacc.py --dry-run    # preview without writing
    python scripts/import_cacc.py --limit 30   # import first 30 dogs only
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ── Load .env.local automatically if python-dotenv is installed ───────────────
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env.local")
    load_dotenv()
except ImportError:
    pass

SUPABASE_URL = (os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# ── Scraper ───────────────────────────────────────────────────────────────────
_BASE = "https://24petconnect.com/chgoall"
_PAGE_SIZE = 30
_DELAY = 2.0
_MAX_PAGES = 50
_HEADERS = {
    "User-Agent": "WescueBot/0.1 (shelter adoption platform; contact: hello@wescues.com)"
}
_FIELD_LABELS = {
    "Name": "name",
    "Gender": "gender",
    "Breed": "breed",
    "Animal type": "animal_type",
    "Age": "age",
    "Brought to the shelter": "intake_date",
    "Located at": "location",
}
_ID_RE = re.compile(r"\(?(A\d{5,7})\)?")


def _fetch(index: int) -> str:
    r = requests.get(_BASE, params={"index": index}, headers=_HEADERS, timeout=30)
    r.raise_for_status()
    return r.text


def _parse_page(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    animals: list[dict] = []
    lines = [ln.strip() for ln in soup.get_text("\n").split("\n") if ln.strip()]
    current: dict | None = None
    for line in lines:
        for label, key in _FIELD_LABELS.items():
            if line.startswith(label + ":"):
                value = line[len(label) + 1:].strip()
                if key == "name":
                    if current:
                        animals.append(current)
                    current = {"name": value}
                    m = _ID_RE.search(value)
                    if m:
                        current["animal_id"] = m.group(1)
                        display = _ID_RE.sub("", value).strip()
                        current["display_name"] = display or None
                elif current is not None:
                    current[key] = value
                break
    if current:
        animals.append(current)
    photos = [
        img["src"] for img in soup.find_all("img")
        if "/image/" in img.get("src", "")
    ]
    for animal, url in zip(animals, photos):
        animal["photo_url"] = url
    return animals


def scrape_all() -> list[dict]:
    all_animals: list[dict] = []
    seen: set[str] = set()
    for page in range(_MAX_PAGES):
        index = page * _PAGE_SIZE
        print(f"  Fetching page {page + 1} (index={index})...")
        animals = _parse_page(_fetch(index))
        fresh = []
        for a in animals:
            key = a.get("animal_id") or a.get("name")
            if key and key not in seen:
                seen.add(key)
                fresh.append(a)
        if not fresh:
            print("  No new animals — end of listings.")
            break
        all_animals.extend(fresh)
        time.sleep(_DELAY)
    return all_animals


# ── Age parsing ───────────────────────────────────────────────────────────────
_YEAR_RE = re.compile(r"(\d+)\s*year", re.I)
_MONTH_RE = re.compile(r"(\d+)\s*month", re.I)
_KEYWORD_AGES = {
    "puppy": (0, 4),
    "young adult": (2, 0),
    "young": (2, 0),
    "adult": (4, 0),
    "senior": (8, 0),
}


def parse_age(s: str | None) -> tuple[int | None, int | None]:
    if not s:
        return None, None
    low = s.lower().strip()
    for kw, (y, m) in _KEYWORD_AGES.items():
        if kw in low:
            return y, m
    ym = _YEAR_RE.search(low)
    mm = _MONTH_RE.search(low)
    if not ym and not mm:
        return None, None
    return (int(ym.group(1)) if ym else 0), (int(mm.group(1)) if mm else 0)


# ── Size inference ─────────────────────────────────────────────────────────────
_LARGE = {"labrador", "retriever", "shepherd", "rottweiler", "husky", "malamute",
           "great dane", "mastiff", "saint bernard", "newfoundland", "bernese",
           "boxer", "doberman", "weimaraner", "akita", "cane corso", "bullmastiff"}
_SMALL = {"chihuahua", "yorkshire", "maltese", "shih tzu", "pomeranian",
          "dachshund", "poodle", "miniature", "toy", "papillon", "pekingese",
          "italian greyhound", "affenpinscher"}


def infer_size(breed: str | None) -> str:
    if not breed:
        return "medium"
    b = breed.lower()
    for kw in _LARGE:
        if kw in b:
            return "large"
    for kw in _SMALL:
        if kw in b:
            return "small"
    return "medium"


# ── Supabase REST helpers ─────────────────────────────────────────────────────
def _headers(extra: dict | None = None) -> dict:
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h


def get_or_create_shelter() -> str:
    """Return the UUID of the CACC shelter row, creating it if absent."""
    url = f"{SUPABASE_URL}/rest/v1/shelters"
    r = requests.get(
        url,
        params={"name": "eq.Chicago Animal Care and Control", "select": "id"},
        headers=_headers(),
        timeout=15,
    )
    r.raise_for_status()
    rows = r.json()
    if rows:
        return rows[0]["id"]
    payload = {
        "name": "Chicago Animal Care and Control",
        "email": "cacc@cityofchicago.org",
        "phone": "312-747-1406",
        "city": "Chicago",
        "state": "IL",
        "zip": "60609",
        "address": "2741 S. Western Ave.",
        "website": "https://www.cityofchicago.org/city/en/depts/cacc.html",
        "description": (
            "Chicago Animal Care and Control (CACC) is the city's only open-intake "
            "municipal shelter, accepting all animals regardless of space or condition. "
            "Dogs here are available for rescue, foster, or adoption."
        ),
        "verified": True,
    }
    r = requests.post(
        url, json=payload,
        headers=_headers({"Prefer": "return=representation"}),
        timeout=15,
    )
    r.raise_for_status()
    return r.json()[0]["id"]


def get_existing_ids(shelter_id: str) -> set[str]:
    """Fetch external_ids already in the DB for this shelter."""
    url = f"{SUPABASE_URL}/rest/v1/dogs"
    r = requests.get(
        url,
        params={"shelter_id": f"eq.{shelter_id}", "source": "eq.24petconnect", "select": "external_id"},
        headers=_headers(),
        timeout=15,
    )
    r.raise_for_status()
    return {row["external_id"] for row in r.json() if row["external_id"]}


def insert_batch(dogs: list[dict]) -> int:
    if not dogs:
        return 0
    url = f"{SUPABASE_URL}/rest/v1/dogs"
    r = requests.post(
        url, json=dogs,
        headers=_headers({"Prefer": "return=minimal"}),
        timeout=30,
    )
    if not r.ok:
        print(f"  ERROR {r.status_code}: {r.text[:400]}")
        return 0
    return len(dogs)


# ── Mapping ───────────────────────────────────────────────────────────────────
def map_animal(raw: dict, shelter_id: str) -> dict | None:
    animal_type = (raw.get("animal_type") or "").lower()
    if animal_type and animal_type != "dog":
        return None

    age_years, age_months = parse_age(raw.get("age"))
    gender = (raw.get("gender") or "").lower()
    sex = "female" if "female" in gender else "male"

    name = raw.get("display_name") or raw.get("name") or "Unknown"
    name = re.sub(r"\s*\(A\d+\)\s*", "", name).strip() or "Unknown"

    notes_parts = []
    if raw.get("location"):
        notes_parts.append(f"Located at: {raw['location']}")
    if raw.get("intake_date"):
        notes_parts.append(f"Brought to shelter: {raw['intake_date']}")
    personality = " · ".join(notes_parts) if notes_parts else None

    photo = raw.get("photo_url")
    return {
        "shelter_id": shelter_id,
        "name": name,
        "breed_primary": raw.get("breed") or None,
        "age_years": age_years,
        "age_months": age_months,
        "size": infer_size(raw.get("breed")),
        "sex": sex,
        "energy_level": "moderate",
        "good_with_kids": None,
        "good_with_dogs": None,
        "good_with_cats": None,
        "house_trained": None,
        "personality": personality,
        "adoption_fee_cents": 0,
        "status": "available",
        "photos": [photo] if photo else [],
        "source": "24petconnect",
        "external_id": raw.get("animal_id"),
    }


# ── Main ──────────────────────────────────────────────────────────────────────
BATCH = 50


def main() -> None:
    ap = argparse.ArgumentParser(description="Import CACC dogs into Wescues Supabase")
    ap.add_argument("--dry-run", action="store_true", help="Preview without writing to DB")
    ap.add_argument("--limit", type=int, help="Cap the number of dogs imported")
    args = ap.parse_args()

    if not args.dry_run and (not SUPABASE_URL or not SUPABASE_KEY):
        print("ERROR: Missing Supabase credentials.\n")
        print("Export these from your .env.local file:")
        print("  export NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co")
        print("  export SUPABASE_SERVICE_ROLE_KEY=eyJ...")
        print("\nOr install python-dotenv and they'll load automatically:")
        print("  pip install python-dotenv")
        sys.exit(1)

    print("── Step 1: Scraping 24PetConnect ────────────────────────────")
    raw = scrape_all()
    print(f"Scraped {len(raw)} animals.\n")

    if not args.dry_run:
        print("── Step 2: Setting up CACC shelter record ───────────────────")
        shelter_id = get_or_create_shelter()
        print(f"Shelter ID: {shelter_id}")
        existing = get_existing_ids(shelter_id)
        print(f"Already in DB: {len(existing)} dogs\n")
    else:
        shelter_id = "dry-run-id"
        existing = set()

    print("── Step 3: Mapping to Wescues schema ────────────────────────")
    mapped: list[dict] = []
    skipped_type = 0
    skipped_exists = 0
    for animal in raw:
        row = map_animal(animal, shelter_id)
        if row is None:
            skipped_type += 1
            continue
        eid = row.get("external_id")
        if eid and eid in existing:
            skipped_exists += 1
            continue
        mapped.append(row)
        if args.limit and len(mapped) >= args.limit:
            break

    print(f"New dogs to import : {len(mapped)}")
    print(f"Skipped (not a dog): {skipped_type}")
    print(f"Skipped (already in DB): {skipped_exists}\n")

    if args.dry_run:
        print("── Dry-run sample (first 3 records) ─────────────────────────")
        for d in mapped[:3]:
            print(json.dumps(d, indent=2, default=str))
        print(f"\nDry run complete — {len(mapped)} dogs would be imported.")
        return

    print("── Step 4: Inserting into Supabase ──────────────────────────")
    total = 0
    for i in range(0, len(mapped), BATCH):
        batch = mapped[i: i + BATCH]
        n = insert_batch(batch)
        total += n
        print(f"  Batch {i // BATCH + 1}/{-(-len(mapped) // BATCH)}: inserted {n}")

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    snap = f"cacc_snapshot_{stamp}.json"
    with open(snap, "w", encoding="utf-8") as f:
        json.dump({"scraped_at": stamp, "count": len(raw), "animals": raw}, f, indent=2, ensure_ascii=False)

    print(f"\nDone! {total} new dogs added to Wescues.")
    print(f"Raw snapshot saved → {snap}")


if __name__ == "__main__":
    main()
