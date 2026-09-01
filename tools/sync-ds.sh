#!/bin/sh
#
# Vendor the design system, and record exactly which commit was vendored.
#
# WHY A PIN AND NOT A VERSION. rux-ds publishes no version number -- its
# package.json has no `version` field, and versioning is still an open decision
# in its README. A commit SHA is therefore the only honest pin, and it is a
# stricter one than a semver tag would be.
#
# WHY THE CLEAN CHECK IS NOT OPTIONAL. Vendoring from a dirty tree records a SHA
# that does not describe the bytes copied, which is worse than recording nothing:
# the pin would look precise and be wrong. It refuses instead.
#
#   sh tools/sync-ds.sh
#
set -e

DS="${DS:-../rux-ds}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/vendor/rux-ds"

[ -d "$DS/.git" ] || { echo "no rux-ds checkout at $DS (override with DS=)"; exit 1; }

SHA="$(git -C "$DS" rev-parse HEAD)"

# TRACKED CHANGES ONLY (-uno), and the distinction is the whole point. A pin is
# a claim about the bytes copied; a MODIFIED tracked file breaks that claim,
# because the SHA describes the committed version and the copy would be the
# working one. An untracked file cannot break it -- it is not part of the commit
# and not part of what is copied. Blocking on untracked was this script's first
# bug: rux-ds carries dashboard.html untracked by decision, so the check refused
# every clean tree it was ever pointed at.
if [ -n "$(git -C "$DS" status --porcelain -uno)" ]; then
  echo "rux-ds at $DS has uncommitted changes to tracked files."
  echo "Commit them first -- a pin taken from a dirty tree names the wrong bytes."
  git -C "$DS" status --short -uno
  exit 1
fi

# Reported, never fatal: an untracked file is invisible to the pin, so a reader
# reconstructing from the SHA gets something subtly different if one mattered.
UNTRACKED="$(git -C "$DS" ls-files --others --exclude-standard | tr '\n' ' ')"
[ -n "$UNTRACKED" ] && echo "note: rux-ds has untracked files, not covered by the pin: $UNTRACKED"

mkdir -p "$OUT/css" "$OUT/assets" "$OUT/js"
cp "$DS/css/rux.min.css" "$OUT/css/"
cp "$DS/css/rux.css"     "$OUT/css/"
cp "$DS/assets/icons.svg" "$OUT/assets/"
# THE TYPEFACE IS PART OF THE DESIGN SYSTEM, NOT A DETAIL. rux.css names
# IBM Plex Sans sixty-seven times and carries no @font-face at all -- those
# live in assets/fonts/plex.css, which rux-ds's own templates link BEFORE
# rux.css. Copying the stylesheet and not the fonts meant every published page
# declared a typeface it had no way to load and quietly fell back to the
# system sans. No gate could see it: the class resolves, the reference exists,
# and the page renders.
#
# LICENSE.txt comes with them because IBM Plex is licensed and the licence
# ships with the font, not beside it in a README.
mkdir -p "$OUT/assets/fonts"
cp "$DS/assets/fonts/"* "$OUT/assets/fonts/"
cp "$DS/js/"*.js "$OUT/js/"

# The pin is committed. A reader who never opens rux-ds can still tell which
# design system this site was built against, and `git -C ../rux-ds show <sha>`
# reconstructs it exactly.
cat > "$OUT/PIN" <<EOF
commit  $SHA
date    $(date -u +%Y-%m-%dT%H:%M:%SZ)
subject $(git -C "$DS" log -1 --format=%s)

Vendored by tools/sync-ds.sh from a clean tree.
Re-run that script to move the pin; do not edit vendored files, the next
sync overwrites them and the real fix belongs in rux-ds.
EOF

echo "vendored rux-ds @ $(echo "$SHA" | cut -c1-7)"
echo "  css/rux.min.css  $(wc -c < "$OUT/css/rux.min.css" | tr -d ' ') bytes"
echo "  assets/fonts/    $(ls "$OUT/assets/fonts" | wc -l | tr -d ' ') file(s)"
echo "  js/              $(ls "$OUT/js" | wc -l | tr -d ' ') modules"
