#!/bin/bash
# Waits for enrich.py to finish, then runs upload.py automatically.

cd "$(dirname "$0")"
source venv/bin/activate

echo "⏳ Watching for enrichment to complete..."
echo "   Checking every 60 seconds..."
echo ""

while true; do
  # Check if enrich.py is still running
  if pgrep -f "enrich.py" > /dev/null 2>&1; then
    enriched=$(python3 -c "
import csv, glob
total = done = 0
for f in glob.glob('output/packs/*.csv'):
    with open(f) as fh:
        for row in csv.DictReader(fh):
            total += 1
            if row.get('pitch_angle','').strip():
                done += 1
print(f'{done}/{total}')
")
    echo "  $(date '+%H:%M')  Enrichment still running — $enriched pitches done"
    sleep 60
  else
    echo ""
    echo "✅ Enrichment finished! Starting upload..."
    echo ""
    python upload.py
    echo ""
    echo "🎉 All done! Check your Supabase dashboard."
    break
  fi
done
