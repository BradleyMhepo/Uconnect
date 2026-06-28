"""
Uconnect Lead Scraper — Multi-Source, 100% Free
-------------------------------------------------
Sources (all free, no credit card):
  1. OpenStreetMap  (Overpass API — no key)
  2. Nominatim      (OSM search API — no key)
  3. City Open Data (Chicago, NYC, SF, LA, Seattle — no key)
  4. HERE Places    (250,000/month free — key from developer.here.com)
  5. TomTom Search  (2,500/day free    — key from developer.tomtom.com)
  6. MapQuest       (free tier         — key from developer.mapquest.com)
  7. Foursquare     (1,000/day free    — key from foursquare.com/developers)
  8. State CSV      (--csv path/to/licenses.csv  for licensed professions)

Pipeline:
  Raw records → dedup → PageSpeed (weak-website mode) → Groq pitch → CSV

Usage:
  python scrape.py --category restaurants --location miami    --limit 200
  python scrape.py --category dentists    --location florida  --limit 500 --mode weak-website
  python scrape.py --category contractors --location national --limit 1000 --sources osm,here,tomtom,foursquare,citydata
  python scrape.py --csv path/to/florida_contractors.csv      --limit 500
"""

import argparse, csv, json, os, re, time, random
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv
from groq import Groq
from tqdm import tqdm

load_dotenv()
GROQ_KEY        = os.getenv("GROQ_API_KEY")
FOURSQUARE_KEY  = os.getenv("FOURSQUARE_API_KEY", "")
HERE_KEY        = os.getenv("HERE_API_KEY", "")
TOMTOM_KEY      = os.getenv("TOMTOM_API_KEY", "")
MAPQUEST_KEY    = os.getenv("MAPQUEST_API_KEY", "")
groq_client     = Groq(api_key=GROQ_KEY) if GROQ_KEY else None

OVERPASS_URL = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
PAGESPEED    = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ── Category mappings ─────────────────────────────────────────────────────────

OSM_TAGS = {
    "restaurants":   [("amenity","restaurant"),("amenity","fast_food"),("amenity","cafe"),("amenity","bar"),("amenity","pub")],
    "dentists":      [("amenity","dentist")],
    "contractors":   [("craft","construction"),("craft","carpenter"),("office","construction")],
    "salons":        [("shop","hairdresser"),("shop","beauty"),("shop","cosmetics")],
    "gyms":          [("leisure","fitness_centre"),("leisure","sports_centre"),("leisure","gym")],
    "med spas":      [("shop","massage"),("amenity","spa"),("healthcare","alternative")],
    "auto shops":    [("shop","car_repair"),("shop","tyres"),("shop","car_parts")],
    "law firms":     [("office","lawyer"),("office","attorney")],
    "chiropractors": [("amenity","physiotherapist"),("healthcare","physiotherapist")],
    "real estate":   [("office","estate_agent"),("office","real_estate")],
    "plumbers":      [("craft","plumber")],
    "electricians":  [("craft","electrician")],
    "hotels":        [("tourism","hotel"),("tourism","motel"),("tourism","guest_house")],
    "retail":        [("shop","clothes"),("shop","jewelry"),("shop","gift"),("shop","florist")],
    "vets":          [("amenity","veterinary")],
    "pharmacies":    [("amenity","pharmacy")],
}

FOURSQUARE_CATS = {
    "restaurants":   "13000",   # food
    "dentists":      "11061",   # dentist
    "contractors":   "11134",   # contractor
    "salons":        "11120",   # hair salon
    "gyms":          "18021",   # gym / fitness
    "med spas":      "11131",   # spa
    "auto shops":    "11100",   # auto repair
    "law firms":     "11091",   # legal services
    "chiropractors": "15014",   # chiropractor
    "real estate":   "11143",   # real estate
    "plumbers":      "11135",   # plumbing
    "electricians":  "11136",   # electrical
    "hotels":        "19014",   # hotel
    "retail":        "17000",   # retail
    "vets":          "11064",   # vet
    "pharmacies":    "17069",   # pharmacy
}

YELP_TERMS = {
    "restaurants":   "restaurants",
    "dentists":      "dentists",
    "contractors":   "contractors",
    "salons":        "hair salons",
    "gyms":          "gyms",
    "med spas":      "med spas",
    "auto shops":    "auto repair",
    "law firms":     "lawyers",
    "chiropractors": "chiropractors",
    "real estate":   "real estate",
    "plumbers":      "plumbers",
    "electricians":  "electricians",
    "hotels":        "hotels",
    "retail":        "shopping",
    "vets":          "veterinarians",
    "pharmacies":    "pharmacies",
}

# Bounding boxes [south, west, north, east]
BBOXES = {
    "miami":         (25.70, -80.35, 25.90, -80.12),
    "tampa":         (27.85, -82.65, 28.10, -82.38),
    "orlando":       (28.38, -81.55, 28.65, -81.20),
    "jacksonville":  (30.10, -81.90, 30.50, -81.50),
    "fort lauderdale":(26.06,-80.22, 26.22, -80.09),
    "houston":       (29.60, -95.65, 29.90, -95.15),
    "dallas":        (32.65, -97.00, 32.95, -96.65),
    "austin":        (30.15, -97.90, 30.45, -97.60),
    "san antonio":   (29.30, -98.65, 29.55, -98.35),
    "los angeles":   (33.90, -118.55, 34.15, -118.15),
    "san diego":     (32.65, -117.25, 32.85, -117.05),
    "san francisco": (37.70, -122.52, 37.82, -122.35),
    "new york":      (40.58, -74.05, 40.85, -73.85),
    "chicago":       (41.75, -87.75, 42.05, -87.55),
    "phoenix":       (33.30, -112.30, 33.65, -111.90),
    "atlanta":       (33.65, -84.55, 33.88, -84.30),
    "seattle":       (47.50, -122.45, 47.75, -122.25),
    "denver":        (39.65, -105.05, 39.80, -104.85),
    "nashville":     (36.05, -86.90, 36.25, -86.70),
    "charlotte":     (35.15, -80.90, 35.35, -80.75),
    "minneapolis":   (44.90, -93.35, 45.05, -93.20),
    "portland":      (45.47, -122.72, 45.57, -122.60),
    "las vegas":     (36.10, -115.25, 36.25, -115.08),
    "boston":        (42.30, -71.17, 42.40, -71.00),
}

CITY_COORDS = {k: ((v[0]+v[2])/2, (v[1]+v[3])/2) for k, v in BBOXES.items()}

MULTI_CITY = {
    "florida":    ["miami","tampa","orlando","jacksonville","fort lauderdale"],
    "texas":      ["houston","dallas","austin","san antonio"],
    "california": ["los angeles","san diego","san francisco"],
    "new york":   ["new york"],
    "national":   ["miami","houston","los angeles","chicago","phoenix","atlanta","seattle","dallas","san antonio","denver","nashville"],
}

CHAIN_NAMES = {
    "mcdonald","mcdonalds","burger king","wendy","wendys","subway","taco bell",
    "chipotle","chick-fil-a","chick fil a","kfc","pizza hut","domino","dominos",
    "papa john","papa johns","dunkin","starbucks","popeyes","arby","arbys",
    "sonic","in-n-out","five guys","shake shack","wingstop","raising cane",
    "raising canes","whataburger","first watch","panera","panda express",
    "quiznos","jersey mike","jersey mikes","firehouse","zaxbys","cook out",
    "bojangles","hardees","jack in the box","del taco","el pollo loco",
    "buffalo wild wings","applebee","applebees","chili","chilis","denny","dennys",
    "ihop","waffle house","cracker barrel","olive garden","red lobster","outback",
    "longhorn","texas roadhouse","fridays","hooters","walgreens","cvs","7-eleven",
    "dollar tree","family dollar","dollar general","aldi","lidl","kroger",
    "whole foods","trader joe","supercuts","great clips","sport clips","fantastic sams",
    "planet fitness","anytime fitness","la fitness","gold gym","gold's gym",
    "24 hour fitness","crunch fitness","equinox","walmart","target","costco",
    "holiday inn","marriott","hilton","hyatt","best western","motel 6","comfort inn",
    "days inn","super 8","ramada","hampton inn","doubletree","sheraton","westin",
}


def is_chain(name: str) -> bool:
    nl = name.lower()
    return any(c in nl for c in CHAIN_NAMES)


def normalize(r: dict) -> dict:
    """Ensure every record has the same keys."""
    return {
        "name":    r.get("name","").strip(),
        "phone":   r.get("phone","").strip(),
        "website": r.get("website","").strip(),
        "address": r.get("address","").strip(),
        "city":    r.get("city","").strip(),
        "state":   r.get("state","").strip(),
        "zip":     r.get("zip","").strip(),
        "rating":  str(r.get("rating","")),
        "reviews": str(r.get("reviews","")),
        "source":  r.get("source",""),
        "mobile_score":  "",
        "issues":        [],
        "problem_found": "",
        "pitch_angle":   "",
    }


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 1: OpenStreetMap (Overpass API)
# ══════════════════════════════════════════════════════════════════════════════

def _osm_query(tags: list, bbox: tuple) -> list:
    s, w, n, e = bbox
    filters = "\n  ".join(f'node["{k}"="{v}"]({s},{w},{n},{e});' for k, v in tags)
    q = f"[out:json][timeout:60];\n(\n  {filters}\n);\nout body;\n"
    try:
        r = requests.post(OVERPASS_URL, data={"data": q}, timeout=90)
        r.raise_for_status()
        return r.json().get("elements", [])
    except Exception as e:
        print(f"    OSM error: {e}")
        return []


def fetch_osm(category: str, cities: list) -> list:
    print("  [OSM] Querying OpenStreetMap...")
    tags    = OSM_TAGS.get(category.lower(), [("amenity", category.lower())])
    results = []

    for city in cities:
        bbox = BBOXES.get(city)
        if not bbox:
            continue
        els = _osm_query(tags, bbox)
        for el in els:
            t    = el.get("tags", {})
            name = t.get("name","").strip()
            if not name or len(name) < 3 or is_chain(name):
                continue
            phone   = t.get("phone", t.get("contact:phone","")).strip()
            website = t.get("website", t.get("contact:website", t.get("url",""))).strip()
            if website and not website.startswith("http"):
                website = "https://" + website
            raw_city  = t.get("addr:city","").strip()
            raw_state = t.get("addr:state","").strip()
            if "," in raw_city and not raw_state:
                parts = raw_city.split(",",1)
                raw_city  = parts[0].strip()
                raw_state = parts[1].strip().split()[0]
            results.append(normalize({
                "name": name, "phone": phone, "website": website,
                "address": (t.get("addr:housenumber","")+" "+t.get("addr:street","")).strip(),
                "city": raw_city or city.title(),
                "state": raw_state,
                "zip": t.get("addr:postcode",""),
                "source": "osm",
            }))
        time.sleep(0.8)

    print(f"    → {len(results)} records from OSM")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 2: Foursquare Places API (free 1,000 searches/day)
# Get key at: https://foursquare.com/developers/  (no credit card)
# ══════════════════════════════════════════════════════════════════════════════

def fetch_foursquare(category: str, cities: list) -> list:
    if not FOURSQUARE_KEY:
        print("  [Foursquare] No API key — skipping. Add FOURSQUARE_API_KEY to .env")
        return []

    cat_id = FOURSQUARE_CATS.get(category.lower(), "")
    print(f"  [Foursquare] Querying Places API...")
    results = []

    for city in cities:
        coords = CITY_COORDS.get(city)
        if not coords:
            continue
        lat, lng = coords

        try:
            r = requests.get(
                "https://api.foursquare.com/v3/places/search",
                headers={"Authorization": FOURSQUARE_KEY, "Accept": "application/json"},
                params={
                    "ll": f"{lat},{lng}",
                    "radius": 25000,           # 25 km
                    "categories": cat_id,
                    "limit": 50,
                    "fields": "name,location,tel,website,rating,stats",
                },
                timeout=15,
            )
            r.raise_for_status()
            places = r.json().get("results", [])
        except Exception as e:
            print(f"    Foursquare error ({city}): {e}")
            continue

        for p in places:
            name = p.get("name","").strip()
            if not name or is_chain(name):
                continue
            loc = p.get("location", {})
            results.append(normalize({
                "name":    name,
                "phone":   p.get("tel",""),
                "website": p.get("website",""),
                "address": loc.get("address",""),
                "city":    loc.get("locality", city.title()),
                "state":   loc.get("region",""),
                "zip":     loc.get("postcode",""),
                "rating":  p.get("rating",""),
                "reviews": p.get("stats",{}).get("total_ratings",""),
                "source":  "foursquare",
            }))
        time.sleep(0.3)

    print(f"    → {len(results)} records from Foursquare")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 3: Google Maps local pack (HTML scraper — no key)
# Extracts the local business pack from Google search results.
# ══════════════════════════════════════════════════════════════════════════════

GOOGLE_CATS = YELP_TERMS  # reuse same term map

def fetch_google_maps(category: str, cities: list, results_per_city: int = 60) -> list:
    try:
        from playwright.sync_api import sync_playwright
        from playwright_stealth import Stealth
    except ImportError:
        print("  [Google] Playwright or stealth not installed — skipping.")
        return []

    term    = GOOGLE_CATS.get(category.lower(), category)
    results = []
    print(f"  [Google Maps] Scraping local pack ({term})...")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx     = browser.new_context(
            user_agent=HEADERS["User-Agent"],
            locale="en-US",
            viewport={"width": 1280, "height": 900},
        )

        for city in cities:
            for start in range(0, results_per_city, 10):
                query = f"{term} in {city.title()}"
                url   = (
                    f"https://www.google.com/search"
                    f"?q={query.replace(' ','+')}"
                    f"&num=10&start={start}&hl=en"
                )
                try:
                    pg = ctx.new_page()
                    Stealth().apply_stealth_sync(pg)
                    pg.goto(url, timeout=20000, wait_until="domcontentloaded")
                    pg.wait_for_timeout(1500)

                    # Try to extract from Google local pack JSON-LD
                    scripts = pg.query_selector_all('script[type="application/ld+json"]')
                    for script in scripts:
                        try:
                            data = json.loads(script.inner_text())
                            items = data if isinstance(data, list) else [data]
                            for item in items:
                                n = item.get("name","")
                                if not n or is_chain(n):
                                    continue
                                addr = item.get("address",{})
                                results.append(normalize({
                                    "name":    n,
                                    "phone":   item.get("telephone",""),
                                    "website": item.get("url",""),
                                    "address": addr.get("streetAddress",""),
                                    "city":    addr.get("addressLocality", city.title()),
                                    "state":   addr.get("addressRegion",""),
                                    "zip":     addr.get("postalCode",""),
                                    "rating":  str(item.get("aggregateRating",{}).get("ratingValue","")),
                                    "reviews": str(item.get("aggregateRating",{}).get("reviewCount","")),
                                    "source":  "google",
                                }))
                        except Exception:
                            pass

                    # Fallback: extract from visible result cards
                    for card in pg.query_selector_all('div[data-local-attribute="d3gh"],'
                                                       'div.VkpGBb, div[jscontroller][data-hveid]'):
                        try:
                            name_el = card.query_selector('div.dbg0pd span, span.OSrXXb')
                            if not name_el:
                                continue
                            name = name_el.inner_text().strip()
                            if not name or is_chain(name) or len(name) < 3:
                                continue
                            addr_el  = card.query_selector('span.LrzXr')
                            phone_el = card.query_selector('span[aria-label*="Phone"]')
                            results.append(normalize({
                                "name":    name,
                                "phone":   phone_el.inner_text().strip() if phone_el else "",
                                "address": addr_el.inner_text().strip()  if addr_el  else "",
                                "city":    city.title(),
                                "source":  "google",
                            }))
                        except Exception:
                            pass

                    pg.close()
                    time.sleep(random.uniform(2, 4))

                except Exception as e:
                    print(f"    Google error ({city}): {e}")
                    try: pg.close()
                    except: pass

        browser.close()

    print(f"    → {len(results)} records from Google Maps")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 3b: Nominatim — OSM's own text search API (no key, rate-limited 1/s)
# Returns POIs by name/type in a city. Complements the bbox Overpass queries.
# ══════════════════════════════════════════════════════════════════════════════

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

def fetch_nominatim(category: str, cities: list) -> list:
    terms  = [t[1] for t in OSM_TAGS.get(category.lower(), [])]
    results = []
    print("  [Nominatim] Querying OSM text search...")

    for city in cities:
        for term in terms[:2]:   # top 2 amenity types per category
            try:
                r = requests.get(NOMINATIM_URL,
                    params={
                        "q":              f"{term} {city.title()}",
                        "format":         "jsonv2",
                        "addressdetails": 1,
                        "extratags":      1,
                        "limit":          50,
                    },
                    headers={"User-Agent": "Uconnect-Scraper/1.0 contact@uconnect.io"},
                    timeout=15,
                )
                r.raise_for_status()
                for el in r.json():
                    name = el.get("display_name","").split(",")[0].strip()
                    if not name or len(name) < 3 or is_chain(name):
                        continue
                    ext  = el.get("extratags", {}) or {}
                    addr = el.get("address", {}) or {}
                    website = ext.get("website", ext.get("contact:website",""))
                    if website and not website.startswith("http"):
                        website = "https://" + website
                    results.append(normalize({
                        "name":    name,
                        "phone":   ext.get("phone", ext.get("contact:phone","")),
                        "website": website,
                        "address": addr.get("road",""),
                        "city":    addr.get("city", addr.get("town", city.title())),
                        "state":   addr.get("state_code", addr.get("ISO3166-2-lvl4","")).replace("US-",""),
                        "zip":     addr.get("postcode",""),
                        "source":  "nominatim",
                    }))
                time.sleep(1.1)   # Nominatim rate limit: 1 req/sec
            except Exception as e:
                print(f"    Nominatim error ({city}/{term}): {e}")

    print(f"    → {len(results)} records from Nominatim")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 4: HERE Places API — 250,000 free/month
# Get key: https://developer.here.com  (Freemium plan, no credit card)
# Add to .env: HERE_API_KEY=your_key_here
# ══════════════════════════════════════════════════════════════════════════════

HERE_CAT_IDS = {
    "restaurants":   "100-1000",
    "dentists":      "800-8500",
    "contractors":   "700-7400",
    "salons":        "600-6900",
    "gyms":          "400-4100",
    "med spas":      "600-6000",
    "auto shops":    "700-7851",
    "law firms":     "700-7300",
    "chiropractors": "800-8500",
    "real estate":   "700-7350",
    "plumbers":      "700-7400",
    "electricians":  "700-7400",
    "hotels":        "500-5000",
    "retail":        "600-6200",
    "vets":          "800-8500",
    "pharmacies":    "800-8510",
}

def fetch_here(category: str, cities: list) -> list:
    if not HERE_KEY:
        print("  [HERE] No key — skipping. Add HERE_API_KEY to .env (free: developer.here.com)")
        return []
    cat = HERE_CAT_IDS.get(category.lower(), "100-1000")
    results = []
    print("  [HERE] Querying HERE Places API...")

    for city in cities:
        coords = CITY_COORDS.get(city)
        if not coords:
            continue
        lat, lng = coords
        try:
            r = requests.get(
                "https://browse.search.hereapi.com/v1/browse",
                params={
                    "at":         f"{lat},{lng}",
                    "categories": cat,
                    "limit":      100,
                    "lang":       "en",
                    "apiKey":     HERE_KEY,
                },
                timeout=15,
            )
            r.raise_for_status()
            for item in r.json().get("items", []):
                name = item.get("title","").strip()
                if not name or is_chain(name):
                    continue
                addr    = item.get("address", {})
                contact = item.get("contacts", [{}])[0] if item.get("contacts") else {}
                phone   = (contact.get("phone",  [{}])[0].get("value","") if contact.get("phone")  else "")
                website = (contact.get("www",    [{}])[0].get("value","") if contact.get("www")    else "")
                results.append(normalize({
                    "name":    name,
                    "phone":   phone,
                    "website": website,
                    "address": addr.get("street",""),
                    "city":    addr.get("city", city.title()),
                    "state":   addr.get("stateCode",""),
                    "zip":     addr.get("postalCode",""),
                    "rating":  str(item.get("averageRating","")),
                    "source":  "here",
                }))
        except Exception as e:
            print(f"    HERE error ({city}): {e}")
        time.sleep(0.2)

    print(f"    → {len(results)} records from HERE")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 5: TomTom Search API — 2,500 free/day
# Get key: https://developer.tomtom.com  (no credit card)
# Add to .env: TOMTOM_API_KEY=your_key_here
# ══════════════════════════════════════════════════════════════════════════════

TOMTOM_CATS = {
    "restaurants":   "RESTAURANT",
    "dentists":      "DENTIST",
    "contractors":   "GENERAL_CONTRACTORS",
    "salons":        "HAIR_SALON",
    "gyms":          "GYM_FITNESS_CENTRE",
    "med spas":      "SPA",
    "auto shops":    "AUTO_REPAIR_SERVICE",
    "law firms":     "LEGAL_SERVICES",
    "chiropractors": "CHIROPRACTOR",
    "real estate":   "REAL_ESTATE_OFFICE",
    "plumbers":      "PLUMBING_HVAC_SERVICE",
    "electricians":  "ELECTRICIAN",
    "hotels":        "HOTEL",
    "retail":        "SHOP",
    "vets":          "VETERINARIAN",
    "pharmacies":    "PHARMACY",
}

def fetch_tomtom(category: str, cities: list) -> list:
    if not TOMTOM_KEY:
        print("  [TomTom] No key — skipping. Add TOMTOM_API_KEY to .env (free: developer.tomtom.com)")
        return []
    cat = TOMTOM_CATS.get(category.lower(), "RESTAURANT")
    results = []
    print("  [TomTom] Querying TomTom Search API...")

    for city in cities:
        coords = CITY_COORDS.get(city)
        if not coords:
            continue
        lat, lng = coords
        try:
            r = requests.get(
                f"https://api.tomtom.com/search/2/categorySearch/{cat}.json",
                params={
                    "key":    TOMTOM_KEY,
                    "lat":    lat,
                    "lon":    lng,
                    "radius": 25000,
                    "limit":  100,
                    "countrySet": "US",
                    "language": "en-US",
                },
                timeout=15,
            )
            r.raise_for_status()
            for item in r.json().get("results", []):
                poi  = item.get("poi", {})
                addr = item.get("address", {})
                name = poi.get("name","").strip()
                if not name or is_chain(name):
                    continue
                phone = (poi.get("phone","") or "").replace("TEL:","").strip()
                url   = (poi.get("url","") or "").strip()
                if url and not url.startswith("http"):
                    url = "https://" + url
                results.append(normalize({
                    "name":    name,
                    "phone":   phone,
                    "website": url,
                    "address": addr.get("streetNameAndNumber",""),
                    "city":    addr.get("localName", city.title()),
                    "state":   addr.get("countrySubdivisionCode",""),
                    "zip":     addr.get("postalCode",""),
                    "source":  "tomtom",
                }))
        except Exception as e:
            print(f"    TomTom error ({city}): {e}")
        time.sleep(0.2)

    print(f"    → {len(results)} records from TomTom")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 6: MapQuest Places API — free tier (no strict limit published)
# Get key: https://developer.mapquest.com  (no credit card)
# Add to .env: MAPQUEST_API_KEY=your_key_here
# ══════════════════════════════════════════════════════════════════════════════

def fetch_mapquest(category: str, cities: list) -> list:
    if not MAPQUEST_KEY:
        print("  [MapQuest] No key — skipping. Add MAPQUEST_API_KEY to .env (free: developer.mapquest.com)")
        return []
    term = YELP_TERMS.get(category.lower(), category)
    results = []
    print("  [MapQuest] Querying MapQuest Places API...")

    for city in cities:
        coords = CITY_COORDS.get(city)
        if not coords:
            continue
        lat, lng = coords
        try:
            r = requests.get(
                "https://www.mapquestapi.com/search/v4/place",
                params={
                    "key":      MAPQUEST_KEY,
                    "q":        term,
                    "location": f"{lat},{lng}",
                    "sort":     "relevance",
                    "pageSize": 50,
                },
                timeout=15,
            )
            r.raise_for_status()
            for item in r.json().get("results", []):
                name = item.get("name","").strip()
                if not name or is_chain(name):
                    continue
                place = item.get("place", {})
                loc   = place.get("geometry", {}).get("coordinates", [])
                addr  = place.get("properties", {})
                results.append(normalize({
                    "name":    name,
                    "phone":   addr.get("phone",""),
                    "website": addr.get("url",""),
                    "address": addr.get("street",""),
                    "city":    addr.get("city", city.title()),
                    "state":   addr.get("stateCode",""),
                    "zip":     addr.get("postalCode",""),
                    "source":  "mapquest",
                }))
        except Exception as e:
            print(f"    MapQuest error ({city}): {e}")
        time.sleep(0.3)

    print(f"    → {len(results)} records from MapQuest")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 7: City Open Data portals (REST APIs, no key)
# ══════════════════════════════════════════════════════════════════════════════

CITY_DATA_APIS = {
    "chicago": {
        "url":    "https://data.cityofchicago.org/resource/xqx5-8hwx.json",
        "params": {"$limit": 8000, "$where": "license_status='AAC'"},
        "fields": {"name": "doing_business_as_name", "address": "address",
                   "zip": "zip_code", "city": "Chicago", "state": "IL",
                   "phone": "", "website": ""},
    },
    "new york": {
        "url":    "https://data.cityofnewyork.us/resource/w7w3-xahh.json",
        "params": {"$limit": 8000, "$where": "license_status='Active'"},
        "fields": {"name": "business_name", "address": "address_building",
                   "zip": "address_zip", "city": "New York", "state": "NY",
                   "phone": "contact_phone", "website": ""},
    },
    "san francisco": {
        "url":    "https://data.sfgov.org/resource/g8m3-pdis.json",
        "params": {"$limit": 8000},
        "fields": {"name": "business_name", "address": "street_address",
                   "zip": "zip_code", "city": "San Francisco", "state": "CA",
                   "phone": "", "website": ""},
    },
    "los angeles": {
        "url":    "https://data.lacity.org/resource/6rrh-rzua.json",
        "params": {"$limit": 8000, "$where": "dba_end_date IS NULL"},
        "fields": {"name": "dba_name", "address": "full_business_address",
                   "zip": "business_zip", "city": "Los Angeles", "state": "CA",
                   "phone": "", "website": ""},
    },
    "seattle": {
        "url":    "https://data.seattle.gov/resource/wnbq-64tb.json",
        "params": {"$limit": 8000},
        "fields": {"name": "trade_name", "address": "street_address",
                   "zip": "zip", "city": "Seattle", "state": "WA",
                   "phone": "business_phone", "website": ""},
    },
}

def fetch_city_data(category: str, cities: list) -> list:
    results = []
    print("  [CityData] Checking open data portals...")
    for city in cities:
        api = CITY_DATA_APIS.get(city)
        if not api:
            continue
        try:
            r = requests.get(api["url"], params=api["params"],
                             headers={"Accept": "application/json"}, timeout=30)
            r.raise_for_status()
            rows = r.json()
            if not isinstance(rows, list):
                continue
        except Exception as e:
            print(f"    City data error ({city}): {e}")
            continue

        fmap = api["fields"]
        for row in rows:
            name = row.get(fmap.get("name",""), "") if fmap.get("name") else ""
            name = str(name).strip()
            if not name or is_chain(name) or len(name) < 3:
                continue
            results.append(normalize({
                "name":    name,
                "phone":   row.get(fmap.get("phone",""),"") if fmap.get("phone") else "",
                "website": row.get(fmap.get("website",""),"") if fmap.get("website") else "",
                "address": row.get(fmap.get("address",""),"") if fmap.get("address") else "",
                "city":    fmap.get("city", city.title()),
                "state":   fmap.get("state",""),
                "zip":     row.get(fmap.get("zip",""),"") if fmap.get("zip") else "",
                "source":  f"citydata-{city}",
            }))
        print(f"    {city.title()}: {len(rows)} rows")

    print(f"    → {len(results)} records from city open data")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE 5: State license CSV
# Download from your state and pass via --csv
# ══════════════════════════════════════════════════════════════════════════════

def fetch_csv(csv_path: str, state_hint: str = "") -> list:
    print(f"  [CSV] Reading {csv_path}...")
    results = []
    p = Path(csv_path)
    if not p.exists():
        print(f"    ⚠️  File not found: {csv_path}")
        return []

    with open(p, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        headers = [h.lower().strip() for h in (reader.fieldnames or [])]

        def pick(row, *candidates):
            for c in candidates:
                for h in headers:
                    if c in h:
                        return row.get(reader.fieldnames[headers.index(h)], "")
            return ""

        for row in reader:
            name = pick(row, "business","trade","dba","name","licensee")
            if not name or is_chain(name) or len(name) < 3:
                continue
            results.append(normalize({
                "name":    name,
                "phone":   pick(row, "phone","telephone","contact"),
                "website": pick(row, "website","url","web"),
                "address": pick(row, "address","street","addr"),
                "city":    pick(row, "city","municipality","location"),
                "state":   pick(row, "state","st") or state_hint,
                "zip":     pick(row, "zip","postal","postcode"),
                "source":  "csv",
            }))

    print(f"    → {len(results)} records from CSV")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# Pipeline: PageSpeed + Groq
# ══════════════════════════════════════════════════════════════════════════════

def pagespeed(url: str) -> dict:
    if not url or not url.startswith("http"):
        return {}
    try:
        r = requests.get(PAGESPEED,
            params={"url": url, "strategy": "mobile", "category": "performance"},
            timeout=30)
        if r.status_code != 200:
            return {}
        data   = r.json()
        cats   = data.get("lighthouseResult",{}).get("categories",{})
        score  = int((cats.get("performance",{}).get("score",0) or 0) * 100)
        audits = data.get("lighthouseResult",{}).get("audits",{})
        issues = []
        checks = {
            "speed-index":               "Slow load speed",
            "uses-optimized-images":     "Unoptimized images",
            "viewport":                  "No mobile viewport",
            "uses-text-compression":     "No text compression",
            "first-contentful-paint":    "Slow first paint",
            "render-blocking-resources": "Render-blocking resources",
        }
        for aid, label in checks.items():
            a = audits.get(aid,{})
            if a.get("score") is not None and a["score"] < 0.5:
                issues.append(label)
        return {"mobile_score": score, "issues": issues}
    except Exception:
        return {}


def pitch_angle(row: dict) -> str:
    if not groq_client:
        return "Great business — website needs attention."
    issues_str = ", ".join(row.get("issues",[]) or []) or "outdated or slow website"
    prompt = (
        f"Business: {row['name']} in {row['city']}, {row['state']}.\n"
        f"Website issues: {issues_str}. Mobile score: {row.get('mobile_score','?')}/100.\n\n"
        "One-liner pitch angle under 18 words. Human tone."
    )
    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role":"system","content":"Short punchy pitch angles for web designers. Under 18 words. No emojis."},
                {"role":"user","content":prompt},
            ],
            max_tokens=60, temperature=0.75,
        )
        return resp.choices[0].message.content.strip().strip('"')
    except Exception:
        return "Local business with real visibility problem — easy pitch."


def dedup(records: list) -> list:
    seen, out = set(), []
    for r in records:
        key = f"{r['name'].lower().strip()}_{r['city'].lower().strip()}"
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out


# ══════════════════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════════════════

def run(category, location, limit, mode, sources, csv_path, output_dir, skip_pitch=False):
    cities = MULTI_CITY.get(location.lower(), [location.lower()])
    print(f"\n🚀 Uconnect | {category} | {location} | {mode} | sources: {sources} | target: {limit}")

    raw = []
    if csv_path:
        raw += fetch_csv(csv_path)
    if "osm" in sources:
        raw += fetch_osm(category, cities)
    if "nominatim" in sources:
        raw += fetch_nominatim(category, cities)
    if "here" in sources:
        raw += fetch_here(category, cities)
    if "tomtom" in sources:
        raw += fetch_tomtom(category, cities)
    if "mapquest" in sources:
        raw += fetch_mapquest(category, cities)
    if "foursquare" in sources:
        raw += fetch_foursquare(category, cities)
    if "citydata" in sources:
        raw += fetch_city_data(category, cities)

    unique = dedup(raw)
    print(f"\n✅ {len(unique)} unique after dedup (from {len(raw)} raw)")

    leads = []

    if mode == "no-website":
        candidates = [r for r in unique if not r["website"].startswith("http")]
        print(f"🚫 {len(candidates)} have no website")
        leads = candidates[:limit]
        for r in leads:
            r["mobile_score"]  = "N/A"
            r["problem_found"] = "No website"

    else:  # weak-website
        with_site = [r for r in unique if r["website"].startswith("http")]
        print(f"\n⚡ Running PageSpeed on {len(with_site)} sites...")
        for row in tqdm(with_site):
            row.update(pagespeed(row["website"]))
            time.sleep(0.4)
        candidates = [r for r in with_site if isinstance(r.get("mobile_score"),int) and r["mobile_score"] < 50]
        print(f"📉 {len(candidates)} passed weak-website filter")
        leads = candidates[:limit]
        for r in leads:
            r["problem_found"] = "; ".join(r.get("issues",[]) or []) or "Low mobile score"

    if skip_pitch:
        print("  ⏩ Skipping pitch angles (batch mode — run enrich.py later)")
        for row in leads:
            row["pitch_angle"] = ""
    else:
        print(f"\n✍️  Writing pitch angles...")
        for row in tqdm(leads):
            row["pitch_angle"] = pitch_angle(row)
            time.sleep(0.15)

    output_dir.mkdir(parents=True, exist_ok=True)
    src_slug = "-".join(sources)
    slug     = f"{category.replace(' ','-')}_{location.replace(' ','-')}_{mode}_{src_slug}"
    ts       = datetime.now().strftime("%Y%m%d_%H%M")
    out_path = output_dir / f"{slug}_{ts}.csv"

    fields = ["name","city","state","address","zip","phone","website",
              "rating","reviews","mobile_score","problem_found","pitch_angle","source"]
    with open(out_path,"w",newline="",encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(leads)

    print(f"\n🎉 {len(leads)} leads → {out_path}")
    return out_path


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--category", default="restaurants", choices=list(OSM_TAGS.keys()))
    p.add_argument("--location", default="miami",
                   help="City, state alias (florida/texas/california/national), or any city in BBOXES")
    p.add_argument("--limit",    type=int, default=200)
    p.add_argument("--mode",     choices=["weak-website","no-website"], default="no-website")
    p.add_argument("--sources",  default="osm,nominatim,citydata",
                   help="Comma-separated: osm, nominatim, here, tomtom, mapquest, foursquare, citydata")
    p.add_argument("--csv",        default="",
                   help="Path to state license board CSV (optional)")
    p.add_argument("--output",     default="output")
    p.add_argument("--no-pitch",   action="store_true",
                   help="Skip Groq pitch generation (fast batch mode)")
    args = p.parse_args()
    run(
        args.category, args.location, args.limit, args.mode,
        args.sources.split(","), args.csv, Path(args.output),
        skip_pitch=args.no_pitch,
    )
