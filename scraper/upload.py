"""
Uconnect Uploader
-----------------
Reads all pack CSVs from output/packs/ and pushes them to Supabase.
Safe to re-run — skips packs that already exist (by slug).

Requirements:
  1. Run schema.sql in Supabase SQL Editor first.
  2. Add SUPABASE_SERVICE_KEY to .env  (Settings → API → service_role key)
     The service key bypasses RLS so the uploader can write freely.

Run: python upload.py
     python upload.py --dir output/packs   (default)
     python upload.py --dry-run            (print what would be uploaded, no writes)
"""

import argparse, csv, os, re, time
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from tqdm import tqdm

load_dotenv()

SUPABASE_URL  = os.getenv("SUPABASE_URL")
# Prefer service key (bypasses RLS). Falls back to publishable key.
SUPABASE_KEY  = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

# ── Pricing formula ───────────────────────────────────────────
# Base: $19. Add $1 per 10 leads above 25, cap at $49.
def calc_price(lead_count: int) -> float:
    base    = 19.0
    extra   = max(0, lead_count - 25) // 10
    return min(49.0, base + extra)


# ── City → state mapping ──────────────────────────────────────
CITY_STATE = {
    "miami": "FL", "tampa": "FL", "orlando": "FL", "jacksonville": "FL", "fort-lauderdale": "FL",
    "houston": "TX", "dallas": "TX", "austin": "TX", "san-antonio": "TX",
    "los-angeles": "CA", "san-diego": "CA", "san-francisco": "CA",
    "new-york": "NY",
    "chicago": "IL",
    "phoenix": "AZ",
    "atlanta": "GA",
    "seattle": "WA",
    "denver": "CO",
    "nashville": "TN",
    "boston": "MA",
    "charlotte": "NC",
    "las-vegas": "NV",
}

CATEGORY_DISPLAY = {
    "restaurants":   "Restaurants",
    "dentists":      "Dentists",
    "salons":        "Salons",
    "gyms":          "Gyms",
    "auto-shops":    "Auto Shops",
    "contractors":   "Contractors",
    "plumbers":      "Plumbers",
    "electricians":  "Electricians",
    "chiropractors": "Chiropractors",
    "law-firms":     "Law Firms",
    "real-estate":   "Real Estate",
    "med-spas":      "Med Spas",
    "vets":          "Vets",
    "pharmacies":    "Pharmacies",
    "hotels":        "Hotels",
    "retail":        "Retail",
}

MODE_DISPLAY = {
    "no-website":   "No Website",
    "weak-website": "Weak Website",
}

TAGLINE_TEMPLATES = {
    "no-website": "{count} {category} in {city} with zero online presence. First-mover advantage for any web designer.",
    "weak-website": "{count} {category} in {city} with a weak website — slow, not mobile-friendly, or outdated.",
}


def parse_filename(path: Path) -> dict | None:
    """
    Filename format:
    {category}_{city}_{mode}_osm-citydata_{timestamp}.csv
    e.g. restaurants_miami_no-website_osm-citydata_20260627_2038.csv
    """
    stem = path.stem
    # strip timestamp suffix (last two _YYYYMMDD_HHMM parts)
    stem = re.sub(r'_\d{8}_\d{4}$', '', stem)
    # strip source suffix
    stem = re.sub(r'_(osm[^_]*)$', '', stem)

    parts = stem.split("_")
    if len(parts) < 3:
        return None

    mode     = parts[-1]                       # no-website or weak-website
    category = parts[0]
    city     = "_".join(parts[1:-1])           # handles "new-york", "san-francisco"

    state  = CITY_STATE.get(city, "")
    region = city.replace("-", " ").title() + (f", {state}" if state else "")

    return {
        "category_slug": category,
        "category":      CATEGORY_DISPLAY.get(category, category.title()),
        "city_slug":     city,
        "city":          city.replace("-", " ").title(),
        "state":         state,
        "region":        region,
        "mode":          mode,
    }


def build_pack_meta(meta: dict, leads: list) -> dict:
    count    = len(leads)
    price    = calc_price(count)
    tagline  = TAGLINE_TEMPLATES.get(meta["mode"], "").format(
        count    = count,
        category = meta["category"].lower(),
        city     = meta["city"],
    )
    mode_label = MODE_DISPLAY.get(meta["mode"], meta["mode"])
    name       = f'{meta["city"]} {meta["category"]} — {mode_label}'
    slug       = f'{meta["category_slug"]}-{meta["city_slug"]}-{meta["mode"]}'

    return {
        "slug":       slug,
        "name":       name,
        "category":   meta["category"],
        "city":       meta["city"],
        "state":      meta["state"],
        "region":     meta["region"],
        "mode":       meta["mode"],
        "lead_count": count,
        "price":      price,
        "available":  True,
        "tagline":    tagline,
    }


def read_csv(path: Path) -> list[dict]:
    rows = []
    with open(path, encoding="utf-8", errors="ignore") as f:
        for row in csv.DictReader(f):
            rows.append({
                "name":          row.get("name",""),
                "city":          row.get("city",""),
                "state":         row.get("state",""),
                "address":       row.get("address",""),
                "zip":           row.get("zip",""),
                "phone":         row.get("phone",""),
                "website":       row.get("website",""),
                "rating":        row.get("rating",""),
                "reviews":       row.get("reviews",""),
                "mobile_score":  row.get("mobile_score",""),
                "problem_found": row.get("problem_found",""),
                "pitch_angle":   row.get("pitch_angle",""),
                "source":        row.get("source",""),
            })
    return rows


def upload(supabase: Client, pack_meta: dict, leads: list, dry_run: bool) -> bool:
    slug = pack_meta["slug"]

    if dry_run:
        print(f"  [DRY] {slug}  ({len(leads)} leads, ${pack_meta['price']:.2f})")
        return True

    # Check if pack already exists
    existing = supabase.table("packs").select("id").eq("slug", slug).execute()
    if existing.data:
        pack_id = existing.data[0]["id"]
        # Update lead count (might have changed after enrichment)
        supabase.table("packs").update({"lead_count": len(leads)}).eq("id", pack_id).execute()
    else:
        result  = supabase.table("packs").insert(pack_meta).execute()
        pack_id = result.data[0]["id"]

    # Upsert leads in batches of 500
    for i in range(0, len(leads), 500):
        batch = leads[i:i+500]
        for row in batch:
            row["pack_id"] = pack_id
        supabase.table("leads").insert(batch).execute()

    return True


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--dir",     default="output/packs")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
        exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    files = sorted(Path(args.dir).glob("*.csv"))

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}📤 Uploading {len(files)} packs to Supabase...\n")

    ok = fail = skipped = 0
    for path in tqdm(files, desc="Packs"):
        meta = parse_filename(path)
        if not meta:
            print(f"  ⚠️  Skipping (can't parse filename): {path.name}")
            skipped += 1
            continue

        leads     = read_csv(path)
        pack_meta = build_pack_meta(meta, leads)

        try:
            upload(supabase, pack_meta, leads, dry_run=args.dry_run)
            ok += 1
        except Exception as e:
            print(f"\n  ❌  {path.name}: {e}")
            fail += 1

        time.sleep(0.1)

    total_leads = sum(
        len(read_csv(p)) for p in files if parse_filename(p)
    ) if not args.dry_run else "—"

    print(f"\n{'='*50}")
    print(f"  ✅ {ok} uploaded  ·  {skipped} skipped  ·  {fail} failed")
    if not args.dry_run:
        print(f"  Supabase: {SUPABASE_URL}")
    print(f"{'='*50}\n")
