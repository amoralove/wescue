"""
AI coat-color & bio enrichment for Wescues dogs.

For each dog that has a photo but no coat colors yet, this script:
  1. Downloads the photo from 24PetConnect
  2. Sends it to Ollama llava (vision model) with a structured prompt
  3. Parses the response for hex colors + a short bio
  4. Updates the Supabase dogs row with coat_primary, coat_secondary, personality

Requirements:
    pip install requests python-dotenv

Ollama setup (one time):
    ollama pull llava

Usage:
    python scripts/enrich_dogs.py              # enrich all unenriched dogs
    python scripts/enrich_dogs.py --limit 10   # test on 10 dogs first
    python scripts/enrich_dogs.py --dry-run    # print what would happen, no writes
    python scripts/enrich_dogs.py --dog-id <uuid>  # single dog for testing
"""

import argparse
import base64
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env.local")
    load_dotenv()
except ImportError:
    pass

SUPABASE_URL = (os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OLLAMA_BASE = (os.environ.get("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_VISION_MODEL") or "llava"

PHOTO_HEADERS = {
    "User-Agent": "WescueBot/0.1 (shelter adoption platform; contact: hello@wescues.com)"
}

PROMPT = """You are looking at a photo of a shelter dog available for adoption.
Respond with ONLY valid JSON — no markdown fences, no explanation, just the JSON object:
{
  "coat_primary": "#rrggbb",
  "coat_secondary": "#rrggbb or null",
  "bio": "2–3 warm, adoption-friendly sentences about what you observe: the dog's apparent energy, expression, and any distinctive physical traits."
}
Rules:
- coat_primary: the dominant fur/coat color as a hex color code
- coat_secondary: a clearly distinct second color if present (e.g. white chest, black saddle), otherwise null
- bio: friendly, specific — mention the dog's expression or posture; never say "adorable" or "cute"
"""


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _sb_headers(extra: dict | None = None) -> dict:
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h


def fetch_unenriched_dogs(limit: int | None, dog_id: str | None) -> list[dict]:
    """Fetch dogs that have a photo but no coat_primary yet."""
    url = f"{SUPABASE_URL}/rest/v1/dogs"
    params = {
        "select": "id,name,photos,coat_primary",
        "source": "eq.24petconnect",
        "coat_primary": "is.null",
        "photos": "neq.{}",  # non-empty array
        "order": "created_at.asc",
    }
    if dog_id:
        params = {"select": "id,name,photos,coat_primary", "id": f"eq.{dog_id}"}
    if limit:
        params["limit"] = str(limit)

    r = requests.get(url, params=params, headers=_sb_headers(), timeout=15)
    r.raise_for_status()
    return r.json()


def update_dog(dog_id: str, coat_primary: str, coat_secondary: str | None, bio: str) -> None:
    url = f"{SUPABASE_URL}/rest/v1/dogs?id=eq.{dog_id}"
    payload: dict = {"coat_primary": coat_primary}
    if coat_secondary:
        payload["coat_secondary"] = coat_secondary
    if bio:
        payload["personality"] = bio
    r = requests.patch(url, json=payload, headers=_sb_headers({"Prefer": "return=minimal"}), timeout=15)
    r.raise_for_status()


# ── Vision analysis ───────────────────────────────────────────────────────────

def download_image_b64(url: str) -> str:
    r = requests.get(url, headers=PHOTO_HEADERS, timeout=20)
    r.raise_for_status()
    return base64.b64encode(r.content).decode()


def analyze_photo(image_b64: str) -> dict | None:
    """Send image to Ollama llava and parse JSON response."""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{
            "role": "user",
            "content": PROMPT,
            "images": [image_b64],
        }],
        "stream": False,
    }
    try:
        r = requests.post(
            f"{OLLAMA_BASE}/api/chat",
            json=payload,
            timeout=90,
        )
        r.raise_for_status()
    except requests.RequestException as e:
        print(f"    Ollama error: {e}")
        return None

    raw = r.json().get("message", {}).get("content", "")

    # Try to parse the JSON response (LLMs sometimes wrap in markdown)
    # First try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON block
    match = re.search(r'\{[\s\S]*\}', raw)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    print(f"    Could not parse LLaVA response: {raw[:200]!r}")
    return None


def is_valid_hex(s: str | None) -> bool:
    if not s:
        return False
    return bool(re.match(r'^#[0-9a-fA-F]{6}$', s.strip()))


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(description="Enrich Wescues dog records with AI coat colors and bios")
    ap.add_argument("--dry-run", action="store_true", help="Print results without writing to DB")
    ap.add_argument("--limit", type=int, help="Max dogs to process")
    ap.add_argument("--dog-id", help="Process a single dog by UUID")
    args = ap.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("  (install python-dotenv and they load from .env.local automatically)")
        sys.exit(1)

    print(f"Using Ollama model: {OLLAMA_MODEL} at {OLLAMA_BASE}")
    print("Make sure you've run: ollama pull llava\n")

    print("── Fetching unenriched dogs ──────────────────────────────────")
    dogs = fetch_unenriched_dogs(args.limit, args.dog_id)
    print(f"Found {len(dogs)} dogs to enrich.\n")

    if not dogs:
        print("Nothing to do — all dogs already have coat colors.")
        return

    ok = 0
    failed = 0

    for i, dog in enumerate(dogs, 1):
        name = dog.get("name", "?")
        dog_id = dog["id"]
        photos = dog.get("photos") or []
        photo_url = photos[0] if photos else None

        print(f"[{i}/{len(dogs)}] {name} ({dog_id[:8]}…)")

        if not photo_url:
            print("    No photo — skipping.")
            failed += 1
            continue

        # Download photo
        try:
            img_b64 = download_image_b64(photo_url)
        except Exception as e:
            print(f"    Download failed: {e}")
            failed += 1
            continue

        # Analyze with llava
        result = analyze_photo(img_b64)
        if not result:
            failed += 1
            continue

        coat_primary = result.get("coat_primary", "").strip()
        coat_secondary = result.get("coat_secondary") or None
        bio = (result.get("bio") or "").strip()

        # Validate colors
        if not is_valid_hex(coat_primary):
            print(f"    Invalid primary color {coat_primary!r} — skipping.")
            failed += 1
            continue
        if coat_secondary and not is_valid_hex(coat_secondary):
            coat_secondary = None

        print(f"    Primary: {coat_primary}  Secondary: {coat_secondary or 'none'}")
        if bio:
            print(f"    Bio: {bio[:80]}{'…' if len(bio) > 80 else ''}")

        if args.dry_run:
            ok += 1
            continue

        try:
            update_dog(dog_id, coat_primary, coat_secondary, bio)
            ok += 1
        except Exception as e:
            print(f"    DB update failed: {e}")
            failed += 1

        time.sleep(0.5)  # brief pause between dogs

    print(f"\nDone. Enriched: {ok}  Failed/skipped: {failed}")
    if args.dry_run:
        print("(Dry run — nothing written to DB)")


if __name__ == "__main__":
    main()
