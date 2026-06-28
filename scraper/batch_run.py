"""
Uconnect Batch Runner
---------------------
Generates all packs (category × city) as fast as possible.

Phase 1 — scrape (this file):   288 packs, no Groq, ~4 workers in parallel
Phase 2 — enrich (enrich.py):   add pitch angles to all packs after

Run: python batch_run.py
"""

import subprocess, sys, time, os
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# ── Config ────────────────────────────────────────────────────────────────────

CATEGORIES = [
    "restaurants",
    "dentists",
    "salons",
    "gyms",
    "auto shops",
    "contractors",
    "plumbers",
    "electricians",
    "chiropractors",
    "law firms",
    "real estate",
    "med spas",
    "vets",
    "pharmacies",
    "hotels",
    "retail",
]

CITIES = [
    "miami",
    "chicago",
    "new york",
    "los angeles",
    "houston",
    "dallas",
    "atlanta",
    "seattle",
    "phoenix",
    "san diego",
    "austin",
    "denver",
    "nashville",
    "boston",
    "san francisco",
    "tampa",
    "orlando",
    "las vegas",
]

LEADS_PER_PACK = 75
SOURCES        = "osm,citydata"    # Nominatim removed — adds 1s/req delay per query
MODE           = "no-website"
OUTPUT_DIR     = "output/packs"
WORKERS        = 4                 # parallel scrapers

# ── Skip already-done packs ───────────────────────────────────────────────────

def already_done(category: str, city: str) -> bool:
    """Check if a pack CSV already exists for this combo."""
    slug = f"{category.replace(' ','-')}_{city.replace(' ','-')}_{MODE}"
    existing = list(Path(OUTPUT_DIR).glob(f"{slug}_*.csv"))
    return len(existing) > 0


# ── Per-pack job ──────────────────────────────────────────────────────────────

def run_pack(args):
    category, city, idx, total = args
    label = f"[{idx}/{total}] {category} / {city}"

    if already_done(category, city):
        print(f"  ⏭  {label} — already done, skipping")
        return True, label

    result = subprocess.run(
        [
            sys.executable, "scrape.py",
            "--category",  category,
            "--location",  city,
            "--limit",     str(LEADS_PER_PACK),
            "--mode",      MODE,
            "--sources",   SOURCES,
            "--output",    OUTPUT_DIR,
            "--no-pitch",
        ],
        capture_output=True,
        text=True,
        cwd=os.path.dirname(os.path.abspath(__file__)),
    )

    # Print summary line from subprocess output
    for line in result.stdout.splitlines():
        if "leads →" in line or "Got 0" in line or "error" in line.lower():
            print(f"  {label}  →  {line.strip()}")
            break
    else:
        print(f"  {label}  →  rc={result.returncode}")

    return result.returncode == 0, label


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

    combos = [(cat, city, i+1, len(CATEGORIES)*len(CITIES))
              for i, (cat, city) in enumerate(
                  (cat, city) for cat in CATEGORIES for city in CITIES
              )]
    total = len(combos)

    print(f"\n🚀 BATCH RUN")
    print(f"   {len(CATEGORIES)} categories  ×  {len(CITIES)} cities  =  {total} packs")
    print(f"   {LEADS_PER_PACK} leads each  ·  {WORKERS} parallel workers  ·  no-pitch mode")
    print(f"   Output: {OUTPUT_DIR}/\n")

    start = datetime.now()
    ok = fail = skipped = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(run_pack, combo): combo for combo in combos}
        for future in as_completed(futures):
            success, label = future.result()
            if "skipping" in label:
                skipped += 1
            elif success:
                ok += 1
            else:
                fail += 1

    elapsed = datetime.now() - start
    packs   = list(Path(OUTPUT_DIR).glob("*.csv"))
    total_leads = sum(
        max(0, sum(1 for _ in open(p)) - 1)
        for p in packs
    )

    print(f"\n{'='*60}")
    print(f"  DONE  —  {ok} new  ·  {skipped} skipped  ·  {fail} failed")
    print(f"  {len(packs)} total packs  ·  ~{total_leads:,} total leads")
    print(f"  Elapsed: {elapsed}")
    print(f"\n  Next step: python enrich.py   (adds Groq pitch angles)")
    print(f"{'='*60}\n")
