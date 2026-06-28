"""
Uconnect Enricher
-----------------
Phase 2: adds Groq pitch angles to all packs that are missing them.
Run after batch_run.py finishes.

Run: python enrich.py
     python enrich.py --dir output/packs   (default)
     python enrich.py --pack output/packs/restaurants_miami_*.csv
"""

import argparse, csv, os, time
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from tqdm import tqdm

load_dotenv()
GROQ_KEY    = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None

PITCH_SYSTEM = "Short punchy pitch angles for web designers. Under 18 words. No emojis. Human tone."


def pitch_angle(row: dict) -> str:
    if not groq_client:
        return "Real business — website gap is your opening."
    issues = row.get("problem_found", "no website or slow website")
    prompt = (
        f"Business: {row['name']} in {row['city']}, {row['state']}.\n"
        f"Problem: {issues}.\n\n"
        "One-liner pitch angle under 18 words. Human tone."
    )
    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": PITCH_SYSTEM},
                {"role": "user",   "content": prompt},
            ],
            max_tokens=60, temperature=0.75,
        )
        return resp.choices[0].message.content.strip().strip('"')
    except Exception:
        return "Established business — website needs attention."


def enrich_file(path: Path) -> int:
    rows = []
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        rows = list(reader)

    missing = [r for r in rows if not r.get("pitch_angle","").strip()]
    if not missing:
        return 0

    print(f"  {path.name}  ({len(missing)} pitches to write)")
    for row in tqdm(missing, leave=False):
        row["pitch_angle"] = pitch_angle(row)
        time.sleep(0.18)

    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    return len(missing)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--dir",  default="output/packs", help="Directory of pack CSVs")
    p.add_argument("--pack", default="",             help="Single CSV to enrich")
    args = p.parse_args()

    if args.pack:
        files = [Path(args.pack)]
    else:
        files = sorted(Path(args.dir).glob("*.csv"))

    total = len(files)
    print(f"\n✍️  Enriching {total} packs with Groq pitch angles...\n")

    enriched = written = 0
    for f in files:
        n = enrich_file(f)
        if n:
            enriched += 1
            written  += n

    print(f"\n✅ Done — {written:,} pitch angles written across {enriched} packs")
