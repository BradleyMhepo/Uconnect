# Uconnect Scraper

Multi-source lead pipeline. All sources are free — no credit card required.

## Sources

| # | Source | Cost | Key? | Limit | Best for |
|---|--------|------|------|-------|---------|
| 1 | **OpenStreetMap** | Free | None | Unlimited | POI-heavy categories (restaurants, salons, gyms) |
| 2 | **Nominatim** | Free | None | 1 req/sec | Extra POI coverage on top of OSM |
| 3 | **City Open Data** | Free | None | Thousands/city | Chicago, NYC, SF, LA, Seattle |
| 4 | **HERE Places** | Free | Yes* | 250,000/month | Rich data — phone, website, rating |
| 5 | **TomTom Search** | Free | Yes* | 2,500/day | Phone + category coverage |
| 6 | **MapQuest Places** | Free | Yes* | Free tier | Supplemental coverage |
| 7 | **Foursquare** | Free | Yes* | 1,000/day | Rating + check-in data |
| 8 | **State CSV import** | Free | None | Unlimited | Licensed pros (dentists, contractors) |

*No credit card required. 2-minute signup. See `.env` for links.

## Setup

```bash
cd scraper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Copy `.env` and fill in the keys you have (OSM and city data work with zero keys):
```bash
cp .env.example .env
```

## Free API Keys (2 minutes each, no card)

| API | Signup URL |
|-----|-----------|
| HERE | https://developer.here.com |
| TomTom | https://developer.tomtom.com |
| MapQuest | https://developer.mapquest.com |
| Foursquare | https://foursquare.com/developers |

## Usage

```bash
# Zero keys needed — OSM + Nominatim + city open data
python scrape.py --category restaurants --location miami --limit 200

# Full multi-source blast (all 7 APIs at once)
python scrape.py --category restaurants --location national --limit 1000 \
  --sources osm,nominatim,here,tomtom,mapquest,foursquare,citydata

# Licensed professions from a state CSV
python scrape.py --csv ~/Downloads/florida_contractors.csv --limit 500

# Weak-website mode (runs PageSpeed on every site)
python scrape.py --category dentists --location florida --limit 250 --mode weak-website
```

## Arguments

| Arg | Default | Options |
|-----|---------|---------|
| `--category` | `restaurants` | restaurants, dentists, contractors, salons, gyms, med spas, auto shops, law firms, chiropractors, real estate, plumbers, electricians, hotels, retail, vets, pharmacies |
| `--location` | `miami` | Any city in the list, or state alias: `florida` `texas` `california` or `national` |
| `--limit` | `200` | Max leads in output |
| `--mode` | `no-website` | `no-website`, `weak-website` |
| `--sources` | `osm,nominatim,citydata` | Comma-separated source names |
| `--csv` | — | Path to a state license board CSV |
| `--output` | `output/` | Output directory |

## Supported cities

miami, tampa, orlando, jacksonville, fort lauderdale, houston, dallas, austin,
san antonio, los angeles, san diego, san francisco, new york, chicago, phoenix,
atlanta, seattle, denver, nashville, charlotte, minneapolis, portland, las vegas, boston

## Output CSV columns

```
name, city, state, address, zip, phone, website,
rating, reviews, mobile_score, problem_found, pitch_angle, source
```

## Expected yields (no-website mode, restaurants)

| City | OSM | City Data | Total unique |
|------|-----|-----------|-------------|
| Chicago | ~3,800 | ~8,000 | ~8,800 |
| New York | ~12,700 | ~8,000 | ~18,600 |
| Miami | ~800 | — | ~920 |
| Seattle | ~600 | ~8,000 | ~7,000 |

Add HERE + TomTom + MapQuest + Foursquare keys and each city yields another 200–400 records with richer phone/website data.
