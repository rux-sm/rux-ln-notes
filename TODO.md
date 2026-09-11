# TODO

What is outstanding, and — because this project has been wrong about its own
state four times — **which lines a generator watches and which are prose that
can rot.**

Run `node tools/measure.mjs` before trusting anything in the first section.
Nothing else here is checked by anything.

---

## Now — the one next step, in order

**Rewritten 2026-09-10, then corrected the same day after verifying every line
against the running systems instead of the notes. The first rewrite was itself
wrong: it listed the switcher as outstanding when it was already built, live
and working. Four of the six items this section has claimed today were stale.
Every claim below was measured; the measurement is named beside it.**

1. **Render `command` and `path` as breadcrumbs.** rux-ds ruled on `SEND-DS.md`
   §2 on 2026-09-08, and not the way this side proposed: **a route is a
   breadcrumb, not a tag**, and `.rux--tag-label-tooltip` — the answer this
   repository expected to be told to use — was **rejected on evidence**, because
   every capture pairs it with an *interactive* tag and it would make a tab stop
   of every route. Measured on running Carbon at 1280: the tag clipped at 192px
   (scrollWidth 278, 86px lost), the breadcrumb wrapped and lost nothing.
   *Verified here:* the six `rux--breadcrumb*` classes compile in rux-ds
   `css/rux.css`; `tools/build.mjs` still has both token types in `PLAIN`;
   the tokens are **39 `command` and 5 `path` across the 7 guides**, 97 across
   all 27 documents. `template-candidate.html` already uses `rux--breadcrumb`
   but for page navigation (Guides ▸ title), which is a different use — the
   inline route needs the non-anchor segment markup the ruling specifies.
2. **Adopt `templates/document-page.html`,** rux-ds `1edc3e4`, the answer to
   `SEND-DS.md` §1 and the template that demonstrates the ruling in item 1.
   Per `AGENTS.md`, `build.mjs` copies it and records the rux-ds commit it
   derives from. *Verified:* the file exists (68 KB) and carries the breadcrumb
   classes; nothing in `build.mjs` references it.
3. **Render `openIssues`.** Atlas took the ask and **emits it now** — 9
   documents carry a count, from 1 to 12. *Verified:* `grep openIssues
   tools/build.mjs` returns **0**. Atlas answered and this side never consumed
   it. No document listed this; it was found by measuring.
4. **A notepad on guide pages.** *Verified:* `js/exercise.js` is linked by
   exactly 2 pages, both HOMEWORKs; no guide page carries a notepad. See the
   bullet under "Decided, not built".
5. **Reply to atlas's four questions.** Still genuinely open — `exchange/
   send-back-2-reply.md` asks them and nothing has answered. One is already
   satisfied in code (`openIssues`, item 3) and one needs the re-measure atlas
   asked for; see "Owed to atlas" below, which now carries the fresh figures.

**Done, recorded so it is not re-listed a third time:**

- **The switcher — BUILT AND LIVE.** Listed as outstanding twice today, both
  times wrongly. *Verified in the browser on the live site:* the page ships
  Home and LN Notes, `/switcher.js` (HTTP 200) replaces them from
  `/switcher.json` (HTTP 200), and the panel renders **four** entries — Home,
  LN Notes (marked `aria-current`), Scheduler, Design System.
- **`SEND-ATLAS.md` — ANSWERED AND CONSUMED.** Atlas replied in
  `exchange/do-as-steps-reply.md` and took **both** asks at contract 8. *Verified:*
  9 documents carry `steps`, 1 carries `strips`, and `build.mjs` renders both.
  The reply also corrects two claims the send-back made — token 0 of node `1`
  is not payload-less, and "three steps where the sentence has four" does not
  reproduce. It retires with the files below.

**`SEND-DS.md`, `SEND-ATLAS.md` and `template-candidate.html` stay until items
1–3 land**, then all three go. Both send-backs are fully answered, but the
candidate page is the reference the adoption is measured against and
`build.mjs` re-inlines the sprite into it by name; deleting it early drops the
only local copy of the thing being replaced and breaks that line.

## Watched — `MEASURED` answers these; read them there

`publishable.pages-flagged` (0 is the condition for staying public) and the
two `*.pin` rows. How far each sibling's checkout has moved past its pin is
live state, printed by `node tools/check.mjs` and by the sync scripts, and
since 2026-09-02 never written to the file. This file used to copy the values
and was wrong within a day of doing so.

## Decided, not built

- **A notes surface on guide pages.** The ✎ marks (`tokens.pencil` in `MEASURED`) say "worth writing down" and there is
  nowhere to write on a guide. **The exercise pages have it since 2026-09-06**
  — `js/exercise.js`: answer spaces, ticks, a notepad, a revealable answer key
  and a Markdown export, all in local storage with no server — and a guide
  page's notepad is the same file bound to the pencil steps, not yet written.
- ~~**The answer key on the public site.**~~ **CLOSED — and it was already
  closed when this bullet still said otherwise; corrected 2026-09-10 by
  measuring rather than re-reading the line.** The mechanism is as described:
  atlas withholds every `key` at the export tier until the exercise carries
  `reviewed: {by, date}`. What was stale is the state.
  `HOMEWORK-enterprise-planning-foundations` carries a complete
  `reviewed: {by, date}` attestation dated 2026-09-06 — the reviewer's name
  stays in atlas, where the frontmatter is — so its six answer-key
  sections publish: 32 `key` entries in the emitted JSON, `keyed: true`, 52
  reveal controls in the built page, and **52 on the live site** — fetched from
  `rux-sm.github.io`, HTTP 200, not inferred from the local build.
  `HOMEWORK-production-and-planning` renders no reveal, and **that is not a
  withholding**: its source carries zero `### Answer key` sections, so there is
  no key to attest to. Writing one is a separate piece of authoring in atlas,
  not a clearance waiting to land here.
- **`command` and `path` are still plain text — and since 2026-09-08 there is a
  ruling saying what they should be.** The measurement that made them plain
  stands: `.rux--tag` caps at 13rem and ellipsises, so a menu route was cut to
  192px, the thing a reader most needs whole. **What has changed is the answer.**
  This file used to say Carbon's answer was `.rux--tag-label-tooltip` and that
  using it was a conversation with rux-ds. That conversation happened, and
  rux-ds **rejected the tooltip on evidence**: every capture pairs it with an
  *interactive* tag, so it would make a tab stop of every route on a page that
  carries dozens, and the text would still be cut on paper and on touch. A
  tooltip is a route's second copy, not its first. **The ruling is that a route
  is a breadcrumb** — measured on running Carbon at 1280 with the same
  four-segment route in each: the tag lost 86px to ellipsis, the breadcrumb
  wrapped and lost nothing. Building it is "Now" item 1, not an open question.

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

## Owed to atlas

**The heading used to end "and no open document carries them". That was wrong:
`exchange/send-back-2-reply.md` in atlas asks all four and has been waiting.
Corrected 2026-09-10, with every figure re-measured against the synced data at
the current PIN rather than restated.**

1. **Whether the uncovered session codes publish as name-only or are omitted.**
   Atlas asks this at `send-back-2-reply.md` line 96 and blocks its
   screen-reference emitter on the answer. Still unanswered; it is a decision,
   not a measurement.
2. **An `openIssues` count in the contract. SATISFIED — atlas built it.** 9
   documents carry a count. The work left is on this side and is "Now" item 3.
3. **The re-measure atlas asked for.** It was right that the figure had drifted:
   this repository reported 58 distinct in-step codes against `288bf72`, atlas
   got 46 or 106, and **at the current PIN the count is 91 distinct `session`
   tokens across all 27 documents**, while `MEASURED` reads 58 in-steps and 108
   in-sources over the 7 guides alone. The three numbers are three different
   scopes, which is most likely what the disagreement always was. **Nobody has
   confirmed that**, and it is the next thing to establish before quoting any
   of them: agree the scope first, then the number.
4. **Cross-guide references arrive in two shapes.** Re-measured at the current
   PIN: **13 as `link`** and **28 as a `literal` carrying an `SG-….md`
   filename** — was 9 and 19 when first reported, so both grew and the split
   persists. Atlas has not been told the new figures.

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
