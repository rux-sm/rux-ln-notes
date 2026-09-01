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
| `publishable.pages-flagged` | **0** of 29 — the condition for staying public |
| `rux-ln-atlas.behind` | **0** |
| `rux-ds.behind` | **2** |
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
- **Two missing wrappers, found the day `check-ancestry` was wired in.** The
  gate reports 2 of 550 corroborated ancestries absent, and both are on the two
  hand-authored pages rather than on anything `build.mjs` writes:

  | page | class | missing | corroboration |
  | :--- | :--- | :--- | ---: |
  | `index.html` | `rux--card__description` | `.rux--lg:col-span-4` | 9 captures |
  | `template-candidate.html` | `rux--btn--icon-only` | the tooltip wrappers | 185 captures |

  **They are not equally strong and should not be treated as one task.** 185
  captures is Carbon saying an icon-only button is always inside a tooltip, which
  is an accessible-name question and the more serious of the two -- and it is on
  the one page here intended to cross to rux-ds. 9 captures is a thinner claim:
  a card description inside a grid column may be how every capture happened to
  lay out rather than a wrapper the component requires. Read the captures before
  either adding markup or recording a reason. **Neither belongs in a KNOWN list
  to make the gate green** -- an exception list measures the entries, not the
  rule.

- **Retire or narrow `check-export-safe`.** It answers whether a page carries
  guide data that must not reach `rux-ds` — a question about a repository this
  one no longer pushes to — and `build.mjs` stamps `EXPORT-SAFE: exempt` into
  every page it writes, so it checks one file out of twenty-one. **Its exemption
  model made a gate vacuous twice**, most recently by swallowing
  `check-publishable` until that ran before the filter. Either scope it to
  `template-candidate.html` explicitly or remove it.

## Known losses, recorded so they are not rediscovered

- **127 pencils have no gate behind them.** Rule 9 in atlas checked that every
  ✎ was collected by a Run record row, which made a marked step provably
  meaningful. The Run record was the only structure that could answer it. "A
  value worth noting" is editorial judgement and no check holds judgement. Both
  it and rule 8 were mutation-tested; this is tested coverage removed.
- **The flush-tag defect has no gate.** It is fixed, but only looking catches a
  recurrence.
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

## The stale-fact sweep - started 2026-09-01, not finished

**`CLAUDE.md`'s one rule said this repository is PRIVATE.** It is public, and
has been since `d2fe868`. Fixed. The README was already right — `b9fb00c`
corrected it — so the two disagreed, and the routing file is the one that loads
into every session.

**What it cost, recorded because it is the argument for the rest of this file.**
A review of all three repositories on 2026-09-01 recommended merging
`rux-ln-atlas` into this one, reasoning from that sentence and nothing else.
Acting on it would have moved client evidence into a public repository. The
recommendation was withdrawn when the visibility was checked against GitHub
rather than against the file.

**Three comments still describe the old model.** In order of what they risk:

- **`tools/check-publishable.mjs`** says *IT REPORTS, IT DOES NOT YET REFUSE*
  and *nothing is public yet*. Both are false: it runs from
  `tools/githooks/pre-commit` with a non-zero exit, and the site is live. A
  gate whose own header understates its authority invites a bypass.
- **`tools/check-export-safe.mjs`** opens *rux-ds is PUBLIC and this repository
  is PRIVATE*. The section above already asks whether this gate should be
  retired or narrowed. Correcting the header is the cheaper half of that
  decision rather than a separate task.
- **`tools/sync-guides.sh`** describes reviews emitting at an `attributed`
  tier. `emit.py` has two, `export` and `--internal`; `attributed` was removed
  the day it was built. A comment naming a looser tier that no longer exists,
  in the script that enforces the boundary.

`SEND-BACK.md` calls this a private repository too, and moves with the document
under the next section rather than being edited in place.

## Coordination moves to atlas - decided 2026-09-01, not started

**A memo written here is public and its reply in atlas is private.** That is
why the exchange goes undelivered: half the conversation lives in the
repository you open to publish rather than the one you open to think.

`MEASURED` reads `delivered.DIAGRAM-REPLY.md = no`, and atlas's `HANDOFF.md`
lists an answer on `diagram-as-data.md` as the thing it waits for. The answer
is written, here, and atlas has committed several times since without seeing
it. Neither repository can notice that, because delivery is a person reading a
file in a sibling checkout.

**The move.** Decisions live in atlas, one file. `SEND-BACK.md`,
`SEND-BACK-2.md`, `REVIEW-SHAPE.md` and `DIAGRAM-REPLY.md` go with them, and
this repository keeps only what it publishes. That also deletes `MEASURED`'s
`delivered.*` and `replied.*` blocks, which exist to track a channel that stops
existing.

**`SEND-DS.md` is the exception and does not move.** It encloses
`template-candidate.html`, which is an artefact rather than a memo. It goes to
`rux-ds` as a file, and the ask travels as the commit message.

**A decision is not data.** Whether a cross-guide reference emits as `link` or
`literal` is one person's choice, not client information, and it needs a commit
rather than a negotiation. This file's own README already says it: *the waiting
was mostly optional*.

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
