# TODO

What is outstanding, and — because this project has been wrong about its own
state four times — **which lines a generator watches and which are prose that
can rot.**

Run `node tools/measure.mjs` before trusting anything in the first section.
Nothing else here is checked by anything.

---

## Watched — `MEASURED` answers these; read them there

`publishable.pages-flagged` (0 is the condition for staying public),
`rux-ln-atlas.behind` and `rux-ds.behind`. This file used to copy the three
values and was wrong within a day of doing so; `node tools/measure.mjs` is the
only place they are written.

One document has never been sent:

- **`SEND-DS.md`** has never been sent at all. The case is stronger now than
  when it was written: `rux-ds` has a live public consumer, which is the thing
  that document exists to argue. Sending it needs a copy of a page with
  invented content, and that is this side's work, not theirs.

## Decided, not built

- **A notes surface.** The 127 ✎ marks say "worth writing down" and there is
  nowhere to write. A persistent floating notepad — write, paste, keep across
  pages — is the intended answer and the reason the pencil survived the Run
  record. Local storage, no server; nothing about it needs atlas.
- **`command` and `path` are still plain text, not tags.** `.rux--tag` caps at
  13rem and ellipsises, so a menu route was being cut to 192px — the thing a
  reader most needs whole. Carbon's answer is `.rux--tag-label-tooltip` and the
  tooltip component is vendored. Using it is a conversation with rux-ds, which
  is what `SEND-DS.md` is for.

## Known losses, recorded so they are not rediscovered

- **127 pencils have no gate behind them.** Rule 9 in atlas checked that every
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

Four answers, listed in `README.md` under the exchange: whether the 32 session
codes with no `sessions/` file publish as name-only or are omitted; that an
`openIssues` count is wanted in contract 2; a re-measure of "58 distinct
in-step codes", which atlas reads as 46 or 106 and neither is 58; and that a
cross-guide reference arrives as `link` in 9 places and as a `literal` carrying
the same `SG-….md` filename in 19 others.

## The stale-fact sweep and the move to atlas — done 2026-09-01

`CLAUDE.md` said this repository was private; it is public, and `AGENTS.md`
now says so and is the one policy file. `check-publishable.mjs`'s header now
says it refuses, because it does. `check-export-safe.mjs` is gone and
`build.mjs` no longer stamps `EXPORT-SAFE: exempt`. `sync-guides.sh` no longer
describes an `attributed` tier. `SEND-BACK.md`, `SEND-BACK-2.md`,
`REVIEW-SHAPE.md` and `DIAGRAM-REPLY.md` live in atlas `_standards/`, and
`MEASURED` dropped its `delivered.*` and `replied.*` rows with them.
`SEND-DS.md` stays, as decided: it goes to `rux-ds` as a file, with the ask as
the commit message, once a page copy with invented content exists.

## Numbers are generated, or they are not written - decided 2026-09-01

`MEASURED` is the pattern, and the rule behind it is atlas's: **a rule with no
check is a principle, and belongs in the other half.** Between them those two
are the whole fix for prose that rots. Nothing here needs inventing.

`rux-ds` is the outlier, and it is named here only so the decision is on record
in one place. Its README carries hand-written figures against a generated block
covering a small fraction of the file. On 2026-09-01 it sent a reader to redo
work finished eighteen commits earlier, and its portal reported a browser-gate
figure the tool it reports on contradicted in the same working tree. **Not
scoped here** — that is `rux-ds`'s work and needs its own sitting.

## Not doing

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
  holds back. A session loading all three reads two it cannot use.
