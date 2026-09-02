#!/bin/sh
#
# Pull the guide data from rux-ln-atlas, and record which commit produced it.
#
# THE EXPORT TIER, NEVER THE INTERNAL ONE. `emit.py --internal` keeps gap
# markers, issue ids, evidence stamps and internal paths. This script never
# passes that flag, and must not grow an option to: the export tier is what is
# fit to publish, and the filter fails closed -- if anything forbidden survives,
# emit.py writes nothing and names the pattern.
#
# WHAT DOES NOT COME ACROSS. evidence/ stays in atlas -- the vendor PDFs, the
# session help and the 82 screenshots of a licensed environment. A guide that
# wants to show a screenshot needs a deliberate publication decision and a
# route, and there is none. See atlas _standards/renderer-brief.md section 6.
#
#   sh tools/sync-guides.sh
#
set -e

ATLAS="${ATLAS:-../rux-ln-atlas}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/data/guides"

[ -d "$ATLAS/.git" ] || { echo "no atlas checkout at $ATLAS (override with ATLAS=)"; exit 1; }

SHA="$(git -C "$ATLAS" rev-parse HEAD)"
OLD="$(sed -n 's/^commit  *//p' "$OUT/PIN" 2>/dev/null)"
if [ -n "$(git -C "$ATLAS" status --porcelain)" ]; then
  echo "rux-ln-atlas at $ATLAS has uncommitted changes."
  echo "Commit them first -- data pinned to a dirty tree cannot be reproduced."
  exit 1
fi

mkdir -p "$OUT"
# --reviews TAKES THE SECOND CONTENT TYPE. Reviews and summaries emit at the
# same export tier as guides: an `attributed` tier existed for one day and was
# removed once reviews named roles rather than people. emit.py sweeps every
# document with one FORBIDDEN list, so nothing here can loosen what crosses.
( cd "$ATLAS" && python3 tools/emit.py --all --reviews --out "$OUT" )

# CONTRACT CHECK. Every file carries a `contract` number -- 2 at the time of
# writing -- and atlas bumps it when the shape changes. A renderer written
# against one number must not silently consume the next, so this reports the
# set rather than assuming it. Reporting is not enforcing: nothing here fails
# on a bump, so read the line.
CONTRACTS="$(grep -h '"contract"' "$OUT"/*.json | tr -d ' ",' | cut -d: -f2 | sort -u | tr '\n' ' ')"

cat > "$OUT/PIN" <<EOF
commit   $SHA
date     $(date -u +%Y-%m-%dT%H:%M:%SZ)
subject  $(git -C "$ATLAS" log -1 --format=%s)
contract $CONTRACTS
tier     export

Emitted by tools/sync-guides.sh via atlas tools/emit.py --all.
These files are INPUTS, not source. Do not hand-edit them -- the next sync
overwrites them, and the real fix belongs in the guide in atlas.
EOF

echo "synced atlas @ $(echo "$SHA" | cut -c1-7)  ·  contract $CONTRACTS"
ls "$OUT"/*.json | wc -l | tr -d ' ' | xargs echo "  guides:"

# WHAT MOVED UPSTREAM. The only channel between these repositories is a person
# reading the other one, so a decision addressed to this side -- a reply to a
# send-back, a contract bump, a migration -- arrives with no signal at all.
# README.md described three such documents wrongly before this line existed.
#
# It is the commit log rather than a summary of one, so it cannot go stale and
# needs no state file, no acknowledgement and no convention upstream has to
# keep. Reporting, not enforcing: nothing here fails, so read the lines.
if [ -n "$OLD" ] && [ "$OLD" != "$SHA" ]; then
  echo
  echo "atlas moved $(git -C "$ATLAS" rev-list --count "$OLD..$SHA") commit(s) since the previous pin:"
  git -C "$ATLAS" log --oneline --no-decorate "$OLD..$SHA" | sed 's/^/  /'
  echo
  echo "  Replies to this side land in $ATLAS/_standards/*-reply.md."
elif [ -z "$OLD" ]; then
  echo "  (no previous PIN -- nothing to compare against)"
fi
