# rux-ln-guides

**The client-facing surface for Infor LN scenario guides.** It consumes two
upstreams — procedure data from `rux-ln-atlas`, presentation from `rux-ds` — and
publishes guides a junior consultant can walk.

It is the first consumer of the design system, and the only place the two ever
meet.

## Why this repository exists at all

`rux-ln-atlas` decided it, and recorded the reason: *"The customer-facing surface
is not built here… presentation work does not belong in this repo,"* because the
library it replaced *"spent 65% of its commits on a publishing surface it then
deleted."* Atlas processes knowledge. This renders it. Neither does both.

**This repository is PRIVATE, and going public is a decided direction rather
than a done thing.** It was built private because a rendered LN procedure is
derived from Infor's copyrighted documentation and describes a configured
environment. The intent now is that trainees read it on the open internet, and
`node tools/check-publishable.mjs` says what still stands in the way — the
counts are in `MEASURED` and every one of them has to reach zero first.

**Nothing about the split changes.** It stays three repositories: atlas holds
the knowledge, this renders it, `rux-ds` is the design system. Publishing does
not add a fourth project — it changes what this repository contains, not what
it is for. `rux-ds` still holds nothing from here.

**Until every row reads zero, this stays private.** The git history matters as
much as `HEAD`: every commit to date carries names and identifiers, so going
public means a fresh history, not a flipped switch.

| | job | visibility | holds |
| :--- | :--- | :--- | :--- |
| `rux-ln-atlas` | knowledge base, `emit.py` | private | all evidence — vendor PDFs, session help, screenshots |
| **`rux-ln-guides`** | renders and publishes | **private** | export-tier data, vendored CSS |
| `rux-ds` | Carbon-quarried CSS and templates | public | nothing ERP, generic specimens only |

## The two upstreams

Both are pulled by hand, both refuse to run against a dirty tree, and both write
a committed `PIN` naming the commit they came from.

```sh
sh tools/sync-guides.sh    # atlas -> data/guides/   (export tier, never --internal)
sh tools/sync-ds.sh        # rux-ds -> vendor/rux-ds/
```

**Both outputs are tracked, deliberately.** They are regenerable, so tracking
them is not about safety — it is that `git diff` after a sync shows exactly what
moved upstream. That is the mechanism by which this project notices atlas gaining
information, or the design system changing under it. An ignored `data/` would
make both invisible.

**Never hand-edit either.** The next sync overwrites them, and the real fix
belongs in the upstream repository.

### The sprite must be inlined into every page

```sh
node tools/inline-sprite.mjs <page.html>      # between SPRITE:BEGIN / SPRITE:END
```

Linking `vendor/rux-ds/assets/icons.svg#i-name` from a `<use>` does not work and
**fails silently**: WebKit has never supported a cross-document `<use>`, so every
icon is blank in Safari, and `file://` blocks the fetch in every engine. The page
looks built and simply has no icons. rux-ds inlines into each of its templates
for the same reason and gates it; this is the local equivalent, and it refuses a
page missing its markers rather than writing nothing quietly.

It is **not** rux-ds's `tools/icons.mjs`, which regenerates the sprite from
`@carbon/icons` and rewrites `templates/*.html` — neither applies here. This only
ever copies the already-built sprite that `sync-ds.sh` delivered.

### Two content types

```sh
sh tools/sync-guides.sh          # guides AND reviews -- emit.py --all --reviews
node tools/build.mjs             # 19 pages: 1 index, 7 guides, 6 reviews, 6 summaries
```

A guide has no `kind` field and a review carries `review` or `summary`; that
absence is what identifies a guide, and an unknown `kind` stops the build
rather than being rendered as whatever it least resembles. The three classes
share `data/guides/`, which is why `MEASURED` separates `guides.count` from
`exported.reviews` — it briefly read 19 guides, a number that is the count of
documents and of nothing this file's prose is about.

### Verified working, not assumed

`guide.html` was measured by hand on 2026-08-31 and `build.mjs` retired it.
**All eight generated pages were measured on 2026-09-01**, served at
`http://localhost:8643` by `node tools/serve.mjs`, against a 1280 viewport:

| | |
|---|---|
| shell | copied from rux-ds `templates/detail-page.html`, header and side nav intact |
| layout | `.rux--content` clears the 256px nav with `padding-inline-start: 288px` — §3.2's offset carried across |
| width | document 1280 against a 1280 viewport, zero elements overflowing, on all 8 |
| icons | 59 symbols inlined by `tools/inline-sprite.mjs`, on all 8 |
| console | no errors, no warnings, on all 8 |
| tags | 0 flush pairs, after the join fix below |
| order | phases ahead of Run record and Troubleshooting, on all 7 guides |

**Measuring is still what finds things, which is the whole reason to do it.**
This pass found a defect five green gates could not: 19 cross-guide references
arrive as `literal` tokens rather than `link`, so they render as gray tags
reading `SG-manual-production-order-existing-master-data.md` — an atlas
filename, truncated at Carbon's 13rem cap, not a link, naming a file that does
not exist in this repository. Nine of them visibly clip. The same references
arriving as `link` tokens are rewritten to `.html` and resolve correctly, so
the page carries both treatments of one idea. That is an upstream
inconsistency and is written up for atlas rather than patched here: rewriting
a `literal` locally would re-implement the marker contract, which is the drift
this project exists not to re-create.

### Checking a page

```sh
node tools/build.mjs              # regenerate every page from data/guides/
node tools/check-classes.mjs      # does every rux-- class exist in the vendored CSS?
node tools/check-structure.mjs    # is a compound pair split across two elements?
node tools/check-links.mjs        # does every local href and src point at a file?
node tools/check-order.mjs        # do the phases come before the sections about them?
node tools/check-publishable.mjs  # what still stands between these pages and public?
node tools/check-export-safe.mjs <page.html>   # before ANYTHING goes to rux-ds
```

**The first four sweep the whole repository, not just its root.** They walked
`readdirSync(ROOT)` and stopped there until 2026-08-31, when `build.mjs` began
writing seven pages into `guides/` — the no-argument form would have reported a
clean run over one file and printed a count that looked like coverage. rux-ds
found the identical bug on its own side, where `pageTargets()` was hardcoded so
a consumer page could never become a sweep cell.

**`check-links` is here because the first generated build shipped ten dead
references with everything else green.** Nine were cross-guide links pointing at
`SG-….md`, which is what a guide is called in atlas; one was the flowchart,
referenced relative to the page and delivered into `data/guides/`. Nothing else
here reads an attribute that names a file, and neither fault shows on the page:
a dead link is drawn exactly like a live one. Both are fixed in the generator —
`.md` cross-references are rewritten, assets are copied — and the gate is what
keeps them fixed.

**`check-publishable` asks the question publishing actually turns on**, which
is not the one `check-export-safe` asks. That gate answers "does this page
carry guide data that must not reach rux-ds" — a question about a different
repository — and it is largely vacuous besides, because `build.mjs` stamps
`EXPORT-SAFE: exempt` into every page it writes and so it checks one file out
of twenty. This one asks whether anything here should not be on the open
internet, and it counts five classes: a person named, a colleague quoted
speaking, a vendor document filename, a business partner id, a company name.

**It refuses, and it is on the commit hook.** It reported while the reviews
still carried names, because blocking every commit until a content rewrite
landed would have stopped work rather than protected anything. The rewrite has
landed, every class reads zero across all 21 pages, and the job changed from
measuring the distance to holding it. There is no exemption marker and no
filename list: a public page cannot opt out of being public.

**The names are read out of atlas's `PEOPLE`, never copied.** A second list
here would drift from the first, which is the failure the whole arrangement is
built against; if the sibling checkout is missing the class reports
`unavailable` rather than passing quietly.

**The partner and company identifiers are not checked, and the reason is in
the script.** `BP4000006`, `CSADNA01`, `ADNA02`, `FAIRFIELD ENGINEERING CO.`,
`VISTA MACHINES INC.` and the `BAM-*` item family read like a customer's master
data and are not: all 46 source attributions in the library say *"LN training
environment"*, and the owner confirmed the partners, companies and items are
invented. That was the largest class the gate counted — 104 identifiers and 9
company names — and counting it was measuring nothing. If real customer data
ever enters the library the class comes back; the condition is the environment,
not the shape of the string.

**All 21 pages are publishable.** `MEASURED` records `publishable.pages-flagged
= 0`. Getting there took one pass in atlas: attendee tables now carry Role,
Count and Organisation; prose says *the consultant* and *the trainee*; action
owners are roles; five identification-provenance passages are `INTERNAL` and
removed structurally; and twenty vendor filenames became citations that name
the help topic and its session code, which is what a reader can act on.

**Timestamped quotations are not counted, and that is the one judgement in the
file rather than a measurement.** Forty-eight were blocking while the reviews
named people, because a quotation beside a name is attributable. They name
roles now, so a reader sees a sentence at `(03:45)` from *the consultant* and
has no way to reach an individual — and those quotations are the most useful
teaching content in the reviews, being how the concept was actually explained.
If names ever return, the class returns with them.

**`check-order` is here because a fix that lived in an artifact died with
it.** `guide.html` was measured in a browser with its phases ahead of Run
record and Troubleshooting; `build.mjs` replaced it, emitted every section and
then the phases, and put all seven guides back into the broken order — where
the troubleshooting rows are keyed by phase number and the run record opens
"Fill in as you go", so a reader met the fix-it table before the instructions.
All four other gates were green on all seven pages, because none of them models
document order and there was no rule to violate. Now there is one, and the
boundary it enforces — back matter opens at the first `runrecord` — lives in
`build.mjs` beside the code that acts on it. The gate was verified against the
pre-fix output rather than only watched to pass: it reports four misplaced
sections and exits 1.

`check-export-safe` is wired to a commit hook, because it was the only check here
whose failure cannot be undone — a push is public before it is noticed — and it
was the only one that ran when someone remembered to run it. Install once:

```sh
git config core.hooksPath tools/githooks
```

It checks the **staged bytes** of every staged `.html`, and there is no filename
list: a page opts out by saying `EXPORT-SAFE: exempt` in its own text with a
reason, so forgetting the marker gets you checked. **It cannot protect rux-ds**
— that is a different repository with its own history; it keeps the artifact on
this side from becoming dirty before it ever crosses.

**`build.mjs` now stamps that marker into every page it writes**, which changes
what the no-filename-list argument is worth. The exemption is accurate — a
generated page does render real data and never crosses — but no person can
forget a marker a generator writes unconditionally, so "forgetting gets you
checked" is load-bearing on exactly one file now: `template-candidate.html`,
the only page here a human authors and the only one intended to cross. The
gate narrowed onto the right target rather than away from it. It is worth
knowing that it narrowed.

`check-classes` and `check-structure` derive their rules from the **vendored stylesheet**, which is the only
evidence this project holds — rux-ds answers structural questions from 641
captured Carbon DOM stories, and `docs/` is not vendored. Between them they say
a class resolves and is not structurally misplaced in the one way CSS can prove.

**Neither can see a wrapper that is simply missing.** That is the defect class
rux-ds's `check-ancestry` exists for, it needs the captures, and nothing here
replaces it. A green run is narrower than it looks; both scripts say so in their
own headers. Three defects passed both while `guide.html` was built, and all
three were found by measuring in a browser instead.

`check-export-safe` answers a different question: does this page carry anything
from the guide data? rux-ds is public and nothing from here may reach it, so
the check fails closed the way atlas's `emit.py` does rather than trusting the
author. It was verified in both directions — `template-candidate.html` is clean
at 0 of 1,106 strings, and a generated page fails it loudly:
`SG-run-order-planning-for-one-item.html` carries 169. It caught two real leaks
while the candidate was drafted, and the refusal was exercised end to end on
2026-09-01 by staging a generated page with its marker stripped: the hook
refused and no commit landed.

### The numbers in this file are re-derivable

```sh
node tools/measure.mjs            # write MEASURED
node tools/measure.mjs --check    # exit 1 if it has moved
```

`MEASURED` is a committed state file, the same idea as a `PIN` and for the same
reason: it is regenerable, so tracking it is not about safety — it is that
`git diff` shows what moved. Every count this repository quotes about itself
lives there, so prose cites one place instead of remembering.

**It writes state, never prose.** The argument in this file is the valuable
part of it and no generator can write *"a draft is labelled on the page, not
withheld from it."* A person reads the diff and writes the sentence.

It is **not** wired to the commit hook. A stale number is embarrassing, not
unrecoverable, and a second hook spends the same patience the first one needs.
It also cannot see whether a number is *used* correctly — it will tell you 112
became 118, not that the paragraph around it now argues the wrong thing.

### What does not come across

`evidence/` stays in atlas — 11 vendor PDFs, 115 session help exports, 82
screenshots of a licensed environment. A guide that wants to show a screenshot
needs a deliberate publication decision and a route, and there is none. Atlas's
`_standards/renderer-brief.md` §6 flags this as something to send back.

## What arrives

Seven guides, `contract: 2`, export tier. A guide is a procedure: an objective,
6–13 numbered phases each with a route into an ERP screen and a table of steps,
plus a fill-in run record, troubleshooting, variants and handover rows.

Cells arrive as **typed token arrays, never as Markdown** — 15 token types, of
which `text` is 2,911 of 4,411. This project implements *rendering* and never
re-implements the marker contract. `../rux-ln-atlas/_standards/guide-json.md` is
normative; `renderer-brief.md` is the covering note. Read both before designing.

**What contract 2 added**, all of it asked for in `SEND-BACK.md` §1–§2:

- `status`, `summary`, `modules` and `order` are top-level fields. The badge, the
  card blurb, the facet and the sort order are data now, not prose to be mined.
- `order` is derived, and it sorts as a curriculum would — build the family,
  plan, buy, make, move, ship, then the end-to-end run. Atlas got there by
  reading **Prerequisite** callouts as dependency edges; on Downstream rows alone
  the guide that builds the test data came fourth. Guides outside the chain fall
  back to alphabetical, and that fallback is stated rather than hidden.
- The H1 no longer arrives as a prose block with a literal `# ` in it. Section
  zero is the objective, and nothing has to be skipped by position.
- An `image` token carrying `alt` and `src`, with the diagram beside the guides.

**`id` is stable and will not be renamed.** Atlas committed to that in writing,
and `check.py` binds `id` to the filename stem, so it cannot drift without a
rename visible in review. Routes may be built on it — there is no `slug`, on
purpose, because a second key is a second thing to keep in step.

**Five things that bite.** The first four were found on the atlas side and are
all still true here; the fifth was found by counting contract 2's payloads.

1. A `prose` block has **no `rows`** — iterating blocks uniformly will throw.
   In `sections` the same trap has a second mouth: `runrecord` arrives
   token-shaped 15 times and row-shaped 7, so branch on the keys present, never
   on `kind`.
2. A `pencil` token carries **no text** and must not be dropped as empty. A
   filter on the producing side silently deleted 33 menu commands while every
   check stayed green. If you filter tokens, count what survives.
3. **`v` is not the payload key.** Five types keep theirs somewhere else, so a
   renderer reaching for `token.v` uniformly blanks **212 of 4,411 tokens —
   roughly 5% — without erroring:**

   | type | payload | count |
   | :--- | :--- | ---: |
   | `session` | `code` | 117 |
   | `button` | `label`, plus `location` on 10 of the 50 | 50 |
   | `command` | `route` | 39 |
   | `path` | `route` | 5 |
   | `image` | `alt` + `src` | 1 |

   `pencil`'s 134 are a sixth type with no payload at all and are counted under
   bite 2, not here. `link` carries `href` **and** `v`. The remaining eight types
   use `v` alone, which is why the mistake survives a spot check — `text` is
   2,911 of the 4,411 and reads correctly throughout.
4. The two token vocabularies do not mix, but **`sections` carries both**.
   `strong`/`em` never appear in a step cell; `chip`/`field`/`command`/`button`/
   `value` never appear in a prose block — and a section may hold either,
   depending on its kind. Rendering a bold sentence as a control chip once pushed
   a page 1,334px wide. Keying the decision off the block alone is what does it.
5. Step ids are strings — `"1.10"` sorts after `"1.9"` only if you split on the
   dot.

## Decided

Scaffolding deliberately left these open; they are now answered. What each one
asks of atlas in return is written up in `SEND-BACK.md`.

- **Every guide publishes, drafts included.** Six of the seven are
  `status: draft`, so withholding them would leave a site with one page on it. A
  draft is labelled on the page, not withheld from it. Contract 2 carries
  `status` in the export tier, so the badge is data. The generated `verification`
  sentence was never a substitute, and still is not: one guide's sentence says
  every phase was performed against a live system and confirmed while the guide
  itself is `status: draft`.
- **The training reviews publish too, and now do.** `reviews/` is a second
  content type — six reviews and six summaries, rendering at 19 pages total. Atlas accepted a **third tier** with the
  fail-closed sweep scoped per tier, so relaxing it for reviews cannot quietly
  strip the name protection off guides. Two conditions: the tier is named for
  what it keeps rather than for who reads it, and issue ids and library paths
  stay stripped. The blocker `SEND-BACK.md` §3.2 found was fixed first —
  `PEOPLE` covered one person in four spellings while the attendee tables name
  five others, which was never the guarantee it advertised.

  **The emitter exists.** `tools/_review.py` and `emit.py`'s `review()` parse
  the eight named sections and the four new block kinds; `sh tools/sync-guides.sh`
  takes them with `--reviews`. Every count matches what `REVIEW-SHAPE.md`
  measured — 82 list items, 12 callouts, 17 sources, 3 code blocks, 20 tables,
  topics 5/6/6/7/7/8 — which is the check that the parser reads the documents
  rather than something shaped like them.
  **§4 is answered, and this file said otherwise for longer than it should
  have.** `_standards/review-shape-reply.md` closes it in its opening line and
  again in its last — *"§4 no longer blocks it"* — and answers it by building:
  `_degap()` removes an INTERNAL marker structurally, taking the rest of the
  cell with it. The reply also corrects §4's arithmetic. Its 102-load-bearing
  figure counted frontmatter arrays as prose; the real obligation was **fifteen
  sentences**, out of 40 edit sites, in a migration already run.

  **The blocker moves to §1 and §2** — the eight named slots and the four block
  kinds contract 2 lacks, all four accepted in the reply. Summaries emit as
  reviews with `kind: "summary"` pointing at the full review's id. The review
  emitter remains atlas's own outstanding work.
- **Assets are settled, both halves.** The flowchart ships:
  `order-to-shipment-flowchart.svg` holds no evidence, it arrived tracked beside
  the guides, and contract 2's `image` token carries its `alt` and `src` — the
  stray `!` that contract 1 rendered is gone. An `image` may only name a file
  authored beside the guide; pointing one at `evidence/` is refused twice, by
  that rule and by the tier sweep, and atlas verified the refusal rather than
  asserting it. **Reviews publish without images, their citations rendered as
  plain unlinked names** — the six cite 42 distinct `SS_*.png` frames of a
  licensed environment, `evidence/` is immutable and stays in atlas. Atlas would
  not soften the consequence and neither should this file: a review's claim about
  what *was seen* is often anchored to the frame that shows it, and unlinked
  citations are weaker. If that guts the reviews in practice, the answer is a
  deliberate publication route decided on its own terms — not a quiet exception
  in the exporter.
- **The knowledge base does not publish.** `sessions/`, `config/`, `tests/`,
  `build/` and `evidence/` stay in atlas in every tier, meeting transcripts
  included. They are read through the documents that cite them, never directly.

The rule behind all four: **anything a person sits down and reads becomes a page
here; anything a document consults on their behalf does not.**

## Undecided, and deliberately not decided by scaffolding

- **~~Build-time generation or runtime rendering.~~ DECIDED 2026-08-31:
  build-time, output committed.** `tools/build.mjs` reads `data/guides/` and
  writes `index.html` and `guides/<id>.html`; adding, changing or removing a
  guide is `sync-guides.sh` then `build.mjs`. Still no `package.json` and no
  framework.

  **What decided it was not the brief's argument, which the brief itself
  retracted.** `renderer-brief.md` §4 argued build-time from the 90 KB budget
  and from the gates, then withdrew both: the budget was rux-ds's own, and the
  gates it named "do not run on the consuming project unless it deliberately
  adopts them". That was written when this project had no gates. It has since
  adopted four, and `check-classes` and `check-structure` read the HTML as
  TEXT — so a runtime renderer would commit a shell whose `main` is empty and
  both would exit 0 having found nothing to look at. That is `smoke.html`'s
  failure with a different cause, and it would be rolled on every guide change
  rather than once.

  Two smaller reasons: a malformed guide throws in the generator with a stack
  trace instead of in a reader's browser on one guide out of thirty; and a
  runtime fetch of `data/guides/*.json` is blocked over `file://`, silently,
  which is the exact failure `inline-sprite.mjs` exists to prevent.

  **The output is committed, and that is half the decision.** In a gitignored
  `build/` the pages would be invisible to the gates and to the pre-commit
  hook, which restores the vacuous-green problem by another route.
- **How the tokens are styled — answered for seven of the nine, open for two.**
  `tools/build.mjs` maps the "named thing in the LN UI" types onto compiled
  Carbon tag variants and no `guide-*` namespace: `chip` blue, `session` cyan,
  `field` cool-gray, `literal` gray, `value` warm-gray, `status` teal, `button`
  purple. It read, and 117 tags did not widen the page, when `guide.html` was
  measured — the mapping moved into the generator unchanged, and now runs
  across all seven guides rather than the one that was looked at.

  **`command` and `path` do not fit and were moved out of tags.**
  `.rux--tag` caps at 13rem by Carbon's own design and ellipsises the label, so
  `Planning ➔ Order Planning ➔ Generate Order Planning` needed 324px and was
  silently cut to 192 — a menu route, which is the thing a reader most needs
  whole. They are set as text for now.

  **The tags that actually clip are not `field` names.** Measuring all eight
  pages on 2026-09-01 found nine clipped labels and every one is a guide
  filename arriving as a `literal` — see "Verified working, not assumed".
  No `field`, `chip`, `session`, `value` or `status` tag clips at 1280. Every
  tag carries its full text in `title`, so the loss is visual only.

  Carbon's own answer is `.rux--tag-label-tooltip`, and the tooltip component
  arrived in `0aa5ed7`. Using it is a conversation with rux-ds, not a local
  rule — this is the case the "Undecided" note predicted would need one.

## Where this is

Publishing. The two syncs work and are verified — `sync-ds` was seen to refuse
a dirty tree, not merely written to. `tools/build.mjs` writes `index.html` and
seven pages into `guides/` from `data/guides/`, and a rebuild against a clean
tree produces no diff.

**A pipeline now, not a template.** The throwaway script that made `guide.html`
did its job — it kept build-time from being chosen by the back door while the
question was open — and the question is answered, so it has been replaced by a
tool that is committed and swept. `guide.html` is gone; nothing is
hand-editable any more, and editing a generated page is the same mistake as
hand-editing `data/` or `vendor/`.

**Five gates run, and every one was exercised against a failure**, not just
watched to pass: a bogus class is reported unresolved, a rewritten `href` is
reported missing, `check-order` reports four misplaced sections on the pre-fix
output, `measure --check` moves when the data moves, and the pre-commit hook
refused a staged page carrying guide data. That is what is known to work.

**All eight pages have now been measured in a browser**, which is what found
the one defect the gates could not see: cross-guide references arriving as
`literal` rather than `link`, rendering as truncated atlas filenames. See
"Verified working, not assumed".

**Two of those three defects came back through the generator, and both are
fixed with a rule rather than by hand.** `build.mjs` emitted every section and
then the phases, so all seven guides read Troubleshooting and Run record before
the work they refer to; and `tokens` joined on `''`, so two adjacent tags butted
flush and read as one control. Both had been fixed in `guide.html` and neither
travelled into the generator that replaced it, because the fix was in the
artifact and deleting the artifact deleted it. Phases now sit between front and
back matter — the boundary is the first `runrecord`, which is unambiguous in
all seven — and a space is emitted only between two tag-rendered neighbours,
never inside a prose run.

**The lesson is the gate, not the fix.** All four other checks were green on
all seven broken pages, because none of them models document order.
`check-order` is that rule now, so the next generator change cannot quietly
reintroduce it. The flush-tag defect has no gate and is still caught only by
looking — as is the missing-wrapper class rux-ds's `check-ancestry` covers.

**It has not been reviewed by rux-ds.** A copy with invented content is what
would go over; `MEASURED` records `SEND-DS.md` as undelivered.

## The exchange, and why no status for it lives here

Five documents have been written across the boundary: `SEND-BACK.md` and
`SEND-BACK-2.md` and `REVIEW-SHAPE.md` and `DIAGRAM-REPLY.md` to atlas,
`SEND-DS.md` to the design system. Replies land in the recipient's own
repository — atlas's are `_standards/*-reply.md` — and are the normative record
of what was agreed. The asks stay here as written, so the exchange reads in
order.

**`DIAGRAM-REPLY.md` is the first one that answers rather than asks.** Atlas's
`_standards/diagram-as-data.md` proposes that the flowchart stop being an SVG
this repository ships and become a `diagram` block it emits and we render, and
§4 asks this side directly whether the model can be rendered to at least the
current standard. The answer is yes, conditional on two things: node boxes
sized by `kind` rather than by their text, because there is no browser in the
build to measure a string with; and `description` and `notes` rendered as HTML
beside the figure rather than as SVG `<text>`, because prose inside markup is
exactly what no gate on either side can read.

**This file does not say which of them are delivered, answered or outstanding,
and that is deliberate.** It said so three times and was wrong three times: a
document described as unsent had already landed, twice, and two described as
unanswered had been answered at the very commit `data/guides/PIN` names. Prose
about another repository's state has no way to notice when that state moves.

Three things watch it instead, and none can go stale:

- **`sh tools/sync-guides.sh` prints atlas's log since the previous pin.** Every
  sync shows what moved — a reply, a contract bump, a migration — because it is
  the commit log rather than a summary of one.
- **`MEASURED`'s `delivered.*` block** records delivery as a mention in the
  recipient, re-derived on every run of `tools/measure.mjs`.
- **`MEASURED`'s `replied.*` block** names the reply file, or says `no`.
  **This one exists because its absence cost four commits.** Delivery was
  measured and the reply was not, so this file went on asserting that atlas was
  blocked on `REVIEW-SHAPE.md` §4 while `review-shape-reply.md` sat in atlas
  saying the opposite — and the sentence was believed, and re-argued, before
  anyone opened the reply. It reports the file's existence and never its
  contents: whether a reply concedes anything is a person's reading, and a
  generator that judged it would be this same mistake in a new place.

Read those. `git log` in the recipient is the check for anything finer.

## What this side is building, and what it owes

**Scenario guides and meeting summaries**, and both now render. The nav lists
those two categories; the six full reviews render as pages and are reached from
their summary rather than listed beside it, because putting twelve documents
under one heading presents two categories as one. The screen reference is still
deferred rather than refused.

A summary is its own four-slot shape — What this covered, Topics, What was
decided, Key takeaways — sharing the topics model with a review rather than
being a truncated one. It renders from `SUMMARY_SLOTS` in `build.mjs`, the same
page builder as a review with a different slot list.

**`PUBLISHES` is resolved.** It reads `{"guide", "review"}`. `summary` stays
out deliberately rather than by omission: a summary rides the review emitter as
`kind: "summary"`, which is `SEND-BACK.md` §3.4's reading, and giving it a
second route with its own rules is the drift that file exists to prevent.

**Reviews arrive at the same export tier a guide does, and a third tier
existed for one day.** `attributed` was built to carry an Attendees table past
the name sweep; the reviews name roles now, so it relaxed nothing, and a tier
that relaxes nothing is a second rule to keep in step with the first for no
gain. `sweep()` reads one strict list again. It also gained a pattern for
vendor document filenames, so the citations stay citations.

**The waiting was mostly optional, and that is the lesson.** The review
emitter was described here for four commits as atlas's outstanding work. It was
never a delivery that had not arrived: `sync-guides.sh` line 35 already RUNS
`emit.py` from this side, against atlas's checkout, so the pull model was
always in place — what was missing was a code path in a program this repo
already invokes, in a sibling repo with the same author. Writing it was a
two-repo commit, not a dependency. **Strip at the source, render at the sink,
and when the emitter lacks a class you need, add it in the same sitting.**

**Three answers are owed to atlas and no open document carries them:** whether
the 32 session codes with no `sessions/` file publish as name-only or are
omitted, that an `openIssues` count is wanted in contract 2, and a re-measure of
this side's "58 distinct in-step codes" — atlas gets 46 or 106 depending on the
reading, and neither is 58. That figure was taken at `288bf72` and the screen
reference leans on it.

**A fourth is now owed, and it was found by measuring rather than by
reasoning.** A cross-guide reference arrives as a `link` token in 9 places and
as a `literal` carrying the same `SG-….md` filename in 19 others. The renderer
rewrites and resolves the first and can only draw the second as a truncated
grey pill naming a file that does not exist here. Both readings are legal under
the contract, which is why no check catches it. The ask is that atlas emit a
cross-guide reference as `link` consistently — not that this side start
guessing which `literal` is secretly a filename.

**A fifth is answered rather than owed.** `DIAGRAM-REPLY.md` responds to
atlas's diagram proposal, and it carries one finding atlas could not have had:
its §1.2 argument — that a diagram hides text from every check — is true on
this side too. `check-links` resolves the SVG as a target and never opens it,
the other three sweep `.html`, and the commit hook greps `\.html$`. The
diagram is opaque in both repositories at once, and the format is the reason
rather than either side's gates.

**How anything gets "sent", since nothing about it is automatic.** The sync
tools only pull, and there is no channel the other way. A document is delivered
by the other side reading it *in place* and pointing at it from its own handoff
— `SEND-BACK.md` was answered that way and never copied. So delivery is visible
only as a commit in the other repository, and `git log` there is the check.
That is the whole reason the section above tracks no status: a channel with no
signal cannot be narrated accurately from this side, and three attempts to do
it anyway all went stale.
