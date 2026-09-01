# TODO

What is outstanding, and — because this project has been wrong about its own
state four times — **which lines a generator watches and which are prose that
can rot.**

Run `node tools/measure.mjs` before trusting anything in the first section.
Nothing else here is checked by anything.

---

## Watched — `MEASURED` answers these, and cannot go stale

| | what it says today |
| :--- | :--- |
| `publishable.pages-flagged` | **0** of 28 — the condition for staying public |
| `rux-ln-atlas.behind` | **0** |
| `rux-ds.behind` | **0** |
| `delivered.DIAGRAM-REPLY.md` | **no** |
| `delivered.SEND-DS.md` | **no** |

Two documents have never been read by their recipient. Delivery is a mention in
the other repository, so this row moves on its own when it happens — do not
edit it here.

- **`DIAGRAM-REPLY.md`** answers atlas's proposal to make the flowchart data
  rather than an SVG: yes, on two conditions — node boxes sized by `kind`
  because there is no browser in the build to measure a string with, and
  `description`/`notes` as HTML beside the figure rather than SVG `<text>`.
  Atlas has not picked it up.
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
- **Retire or narrow `check-export-safe`.** It answers whether a page carries
  guide data that must not reach `rux-ds` — a question about a repository this
  one no longer pushes to — and `build.mjs` stamps `EXPORT-SAFE: exempt` into
  every page it writes, so it checks one file out of twenty. **Its exemption
  model made a gate vacuous twice**, most recently by swallowing
  `check-publishable` until that ran before the filter. Either scope it to
  `template-candidate.html` explicitly or remove it.

## Known losses, recorded so they are not rediscovered

- **127 pencils have no gate behind them.** Rule 9 in atlas checked that every
  ✎ was collected by a Run record row, which made a marked step provably
  meaningful. The Run record was the only structure that could answer it. "A
  value worth noting" is editorial judgement and no check holds judgement. Both
  it and rule 8 were mutation-tested; this is tested coverage removed.
- **Two flush-tag defects and the missing-wrapper class have no gate either.**
  The first is fixed but only looking catches a recurrence; the second is what
  rux-ds's `check-ancestry` exists for and it needs the captures, which are not
  vendored.
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

## Not doing

- **A fourth repository.** Publishing changed what this one contains, not what
  it is for.
- **Filtering rather than authoring.** Every time something had to come out —
  gap markers, issue ids, names, vendor filenames — the answer was to author it
  out upstream. Cutting a token from a finished sentence leaves damaged prose
  and every check stays green.
