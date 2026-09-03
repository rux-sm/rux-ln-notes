#!/bin/sh
#
# A PRIVATE VIEWER FOR THE INTERNAL TIER. Everything sync-guides.sh refuses to
# carry -- gap markers, issue ids, evidence stamps, the notes under every
# phase, and the concept pages that have no published tier at all -- rendered
# with this project's own pages into build/, which .gitignore keeps out of the
# repository and check-links, check-classes and check-publishable all skip.
#
# Nothing this writes is published. It never touches data/guides/ or guides/,
# the PIN, or anything tracked; the public build runs exactly as before.
#
#   sh tools/sync-internal.sh
#   (cd build/internal/site && PORT=8644 node ../../../tools/serve.mjs)
#
set -e

ATLAS="${ATLAS:-../rux-ln-atlas}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/build/internal"

[ -d "$ATLAS/.git" ] || { echo "no atlas checkout at $ATLAS (override with ATLAS=)"; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT/data" "$OUT/site"
(cd "$ATLAS" && python3 tools/emit.py --all --reviews --exercises --concepts --internal --out "$OUT/data" >/dev/null)
# The pages reach the design system at ../vendor/, so the private site root
# gets the same vendor/ this project tracks, by link rather than copy.
ln -s "$HERE/vendor" "$OUT/site/vendor"
LN_DATA="$OUT/data" LN_OUT="$OUT/site/guides" node "$HERE/tools/build.mjs"

echo "  private site: $OUT/site  (git-ignored, never published)"
echo "  view it:      (cd $OUT/site && PORT=8644 node $HERE/tools/serve.mjs)"
