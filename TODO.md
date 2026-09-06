# TODO

What is outstanding, and — because this project has been wrong about its own
state four times — **which lines a generator watches and which are prose that
can rot.**

Run `node tools/measure.mjs` before trusting anything in the first section.
Nothing else here is checked by anything.

---

## Now — the one next step, in order

1. Re-vendor rux-ds: `sh tools/new-project.sh ~/Developer/rux-ln-notes` from a rux-ds clone at a tag, then build, check, commit, push.
   The pin is from 2026-09-05; `node tools/check.mjs` prints how far the checkout has moved past it.
2. Add the switcher button and panel to the shell, once rux-ds has written the
   `switcher.json` contract down (rux-ds README "Picking this up" lists it as
   an open decision).
3. `SEND-DS.md` is **sent, 2026-09-06**: rux-ds `README.md` "Picking this up"
   item 3 names it and `template-candidate.html` as an open ask, read in
   place. Both files stay here until rux-ds answers §1 and §2; the answer
   arrives as a commit there, and `git log` there is the check. If a document
   template is adopted, `build.mjs` copies it and records the rux-ds commit it
   derives from.

## Watched — `MEASURED` answers these; read them there

`publishable.pages-flagged` (0 is the condition for staying public) and the
two `*.pin` rows. How far each sibling's checkout has moved past its pin is
live state, printed by `node tools/check.mjs` and by the sync scripts, and
since 2026-09-02 never written to the file. This file used to copy the values
and was wrong within a day of doing so.

## Decided, not built

- **A notes surface.** The ✎ marks (`tokens.pencil` in `MEASURED`) say "worth writing down" and there is
  nowhere to write. A persistent floating notepad — write, paste, keep across
  pages — is the intended answer and the reason the pencil survived the Run
  record. Local storage, no server; nothing about it needs atlas.
- **`command` and `path` are still plain text, not tags.** `.rux--tag` caps at
  13rem and ellipsises, so a menu route was being cut to 192px — the thing a
  reader most needs whole. Carbon's answer is `.rux--tag-label-tooltip` and the
  tooltip component is vendored. Using it is a conversation with rux-ds, which
  is what `SEND-DS.md` is for.

## Known losses, recorded so they are not rediscovered

- **The pencils have no gate behind them.** Rule 9 in atlas checked that every
  ✎ was collected by a Run record row, which made a marked step provably
  meaningful. The Run record was the only structure that could answer it. "A
  value worth noting" is editorial judgement and no check holds judgement. Both
  it and rule 8 were mutation-tested; this is tested coverage removed.
- **The flush-tag defect has no gate.** It is fixed, but only looking catches a
  recurrence.
- **This repository inherits rux-ds's class-wide ancestry declines.** Wiring
  `check-ancestry` in raised exactly two findings here, and both were
  adjudicated upstream rather than in a local list: `card__description` is
  *"the story layout, not the component"* -- all 17 card stories mount the card
  in a grid column and nothing in `css/rux.css` scopes one to it -- and
  `btn--icon-only` is *"the icon-tooltip the sink declines throughout"*, a
  standing decision where `aria-label` carries the name. rux-ds keyed both by
  class at `aa56e76`, so the gate reads 2 declined, 0 missing and exits 0.

  **What that gives up is stated in rux-ds and applies here too:** a new
  fragment using one of those 21 classes inherits the decline instead of being
  adjudicated on its own. So an icon-only button added to a page HERE, with no
  tooltip and no `aria-label`, will not be reported. The gate covers the
  wrapper class it was wired in for; it does not cover those 21.

- **`rux-ln-guides` was briefly public with its full history**, on 2026-09-01,
  before `rux-ln-notes` existed. It is private again and unreachable —
  never-fetched URLs 404 — but the commits exist. Deleting or rewriting that
  repository is a separate decision and nobody has taken it.

## Owed to atlas, and no open document carries them

Four answers: whether the 32 session codes with no `sessions/` file publish
as name-only or are omitted; that an `openIssues` count is wanted in contract
2; a re-measure of "58 distinct in-step codes", which atlas reads as 46 or 106
and neither is 58; and that a cross-guide reference arrives as `link` in 9
places and as a `literal` carrying the same `SG-….md` filename in 19 others.

## Not doing

- **The names list in CI, as a secret.** Considered and rejected 2026-09-02.
  It would add sensitive state that has to move whenever atlas's tuple does,
  its refusal message would have to be redacted to keep the names out of a
  public log, and it still could not protect the repository: Actions runs
  after the push, when the commit is already public history. It could stop a
  deployment, not a disclosure. The data route is closed by the hash in
  `data/guides/PIN` instead; the rest is held by the commit hook and the
  setup probe, and `AGENTS.md` records the accepted case.
- **Generated pages in an ignored directory.** Weighed again 2026-09-06 and
  kept as decided: the saving is about 1.7 MB of tracked HTML, and the cost
  is the rendered-page names sweep leaving the commit hook, which is the only
  place it can run. Admissible only if the hook builds and sweeps the output
  itself, every check is re-rooted at it, and equivalence is proven locally
  first; nobody wants it that much.
- **A fourth repository.** Publishing changed what this one contains, not what
  it is for.
- **Filtering rather than authoring.** Every time something had to come out —
  gap markers, issue ids, names, vendor filenames — the answer was to author it
  out upstream. Cutting a token from a finished sentence leaves damaged prose
  and every check stays green.
- **Merging any two of the three repositories.** All three boundaries are real:
  atlas is private because it holds evidence and Infor's documentation, this is
  public because it is the published site, and `rux-ds` is separate because it
  is a generic design system with its own consumers. Three arrangements were
  weighed on 2026-09-01 and all three rejected — one rulebook held in `rux-ds`,
  shared ownership of this repository by the other two, and merging atlas into
  this one. The third would have put client evidence on the open internet.
- **One agent context file across the family.** The three rule sets differ in
  kind, not in detail: `rux-ds` forbids inventing a class, atlas forbids
  answering from anything but `evidence/`, this forbids publishing what atlas
  holds back. A session loading all three reads two it cannot use. Atlas's
  `AGENTS.md` points here before any change to this repository, which is a
  pointer and not a merge.
