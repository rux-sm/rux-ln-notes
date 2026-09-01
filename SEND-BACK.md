# Send-back to rux-ln-atlas

Answers to `_standards/renderer-brief.md` §6, plus three product decisions this
side has now made and one class of defect found by reading contract 1 as
shipped.

Nothing here is a change to `data/guides/`. That directory is an input, is
never hand-edited, and every item below is a request against the contract for
atlas to accept, refuse or reshape.

Written 2026-08-29 against atlas `4d1a8ad` (`data/guides/PIN`), contract 1,
export tier, seven guides.

---

## 0. Three decisions, so nothing is designed around them any longer

**Every guide publishes, drafts included.** §7's open question — *"whether a
draft should be publishable at all"* — is answered **yes**. A draft is labelled
in the page, not withheld from it. Six of the seven guides carry
`status: draft`; withholding them would leave a site with one page on it.

**The training reviews publish too.** `reviews/` becomes the second content
type this side renders — the six full reviews and their six summaries. This is
new scope: §1–§5 of the brief describe guides only, and `emit.py` has no path
for anything else. §3 below is the whole of that request.

**The knowledge base does not publish.** `sessions/`, `config/`, `tests/`,
`evidence/` and `build/` stay in atlas and are not wanted here in any tier.
They are read *through* the documents that cite them, never directly. That is
not a deferral — it is the settled answer, and it is what keeps the export
surface small enough to stay honest.

The shape of the whole ask: **anything a person sits down and reads becomes a
page here; anything a document consults on their behalf does not.**

---

## 1. Guides — four fields the renderer is missing

### 1.1 `status`, because the label is now the product

`emit.py:180` puts `status` behind `if internal:`, so the export tier carries
none. Verified: no top-level `status` key in any of the seven files (the
`"status"` strings a grep finds are the *token type* for LN order statuses —
`Free`, `In Process`, `Executed`).

That was the right default when a draft might have been withheld. Now that
every guide publishes, the badge on the page *is* the honesty mechanism, and it
cannot be derived from what arrives:

- The generated `verification` sentence is not a proxy.
  `SG-manual-production-order-existing-master-data` says *"Every phase of this
  procedure has been performed against a live system"* and is still
  `status: draft`. Two of seven guides make that claim; only one is approved.
- Recovering it would mean regex-matching English prose, which is the OI-104
  failure the JSON contract exists to prevent.

**Asked for:** `"status": "draft" | "approved"` in the export tier, as data.
It leaks nothing — it is a workflow state, not evidence, not a person, not a
path.

### 1.2 `summary`, for the listing page

There is no short description. The nearest thing is a convention: in all seven
guides `sections[1]` is a prose block whose text begins `Objective: `. A
renderer can lean on that only by position and prefix, and it breaks the first
time a guide opens differently.

**Asked for:** `"summary"` — one sentence, plain text or tokens, explicitly the
listing-page line. Deriving it from the existing `Objective:` sentence in
atlas is fine; the point is that the contract states it rather than the
renderer guessing.

### 1.3 A stable URL key — confirm `id`, or add `slug`

§6 lists a slug as missing. In practice `id` is already URL-safe in all seven
cases (`SG-ship-from-stock`). The ask is smaller than the brief implies:
**confirm `id` is a stable, URL-safe, never-renamed key**, and this side will
use it directly. If ids may be renamed when a guide is retitled, then a
separate `slug` is needed, because a renamed id silently breaks every bookmark.

### 1.4 `modules` as an array, for navigation

`module` arrives as a display string joined with ` · ` —
`"Sales · Enterprise Planning · Procurement · Manufacturing · Warehousing"`.
Grouping a nav by module means splitting on a middle dot, which is
presentation being parsed back into data.

**Asked for:** `"modules": ["Sales", "Enterprise Planning", …]` alongside (or
instead of) the joined string. Also **an explicit cross-guide order** — §6
names it and nothing carries it. Dependency order is the useful one: the item
guide precedes everything that consumes its items.

---

## 2. Guides — two defects in contract 1 as shipped

Both are §6's *"anything awkward in the shape"*, and both are cheap now.

### 2.1 The H1 arrives as raw Markdown text

`sections[0]` of every guide is a prose block whose only token is:

```json
{"t": "text", "v": "# Demand to Shipment via Planning"}
```

The `# ` survives as literal text, and it duplicates the top-level `title`
field. A renderer must either strip a Markdown prefix — re-implementing the
parsing the contract exists to remove — or skip `sections[0]` by position and
hope it is always the H1.

**Asked for:** drop the H1 section from the export (the `title` field already
carries it), or emit it as a typed heading block with the marker gone.

### 2.2 A Markdown image degrades into a stray `!` and a dead link

`SG-demand-to-shipment-via-planning` `sections[2]`:

```json
{"kind": "prose", "tokens": [
  {"t": "text", "v": "!"},
  {"t": "link", "v": "Order to shipment — the long route",
   "href": "order-to-shipment-flowchart.svg"}]}
```

There is no `image` token type among the fourteen. The `!` of `![alt](src)` is
tokenized as ordinary text and the image collapses to a link, so the page
renders a bare exclamation mark beside a link to a file that was never
exported. `guides/order-to-shipment-flowchart.svg` exists in atlas (21 KB) and
is a *generated diagram, not evidence* — it carries no screenshot of a licensed
environment and no person.

**Asked for:** an `image` token type, and this one SVG in the export. It is the
smallest possible version of §4 below and it can be settled independently.

---

## 3. Reviews — a second document type, and one blocker

This is the largest item. `reviews/` is 12 files, ~140 KB: six training
reviews (10–26 KB each) and six summaries, dated 2026-08-04 to 2026-08-25.
They are what a junior consultant would actually read after a session, and
that is the whole reason for the request.

### 3.1 `emit.py` refuses them by construction

Three separate stops, none of them accidental:

- `document()` raises `SystemExit` unless `meta["type"] == "guide"`. Reviews
  are `type: review`; summaries are `type: summary`.
- `--all` globs `guides/SG-*.md` only.
- `_guide.parse(body, sections=True)` returns phases and closing sections. A
  review has no phases — it is numbered prose sections (`## 1. Objective`,
  `## 2. Attendees`, `## 3. Key topics discussed`, …) with tables, block
  quotes, verbatim quotations and `(03:45)` recording timestamps.

**Asked for:** a document shape for reviews. The token layer already fits
unchanged — the marker vocabulary in a review is the same one guides use. What
is missing is the block structure: an ordered list of sections with headings
and depth, rather than phases.

### 3.2 The blocker: the export tier forbids exactly what a review is made of

`export.py:34` sweeps the serialized output and fails closed on five patterns.
A review collides with three of them, by design rather than by accident:

| Pattern | What reviews contain |
| :--- | :--- |
| `PEOPLE` — a third party's name | Every review has a `## 2. Attendees` table. Six distinct people across the six reviews, plus the LN account that drove the screen, named in prose as read off the session header |
| `OI-\d{3}` | 25 distinct issue ids cited inline, plus an `issues:` frontmatter list per review |
| `evidence\|sessions\|reviews\|…/` | 42 distinct `SS_*.png` evidence frames cited as sources |

Run through today's filter, a review fails closed and writes nothing. That is
the filter working correctly on a document it was never designed for.

**One thing worth knowing before deciding:** `PEOPLE` held
four spellings of a single person. The
attendee tables name **five others it does not cover**. Today that is harmless,
because reviews never enter the export path and the one covered name stops the
sweep anyway. The moment reviews do enter it, the sweep stops looking like a
guarantee and starts being a coincidence. Whatever is decided below, `PEOPLE`
should be completed first, or the protection it advertises is not the
protection it provides.

### 3.3 Three ways to resolve it — a recommendation, not a decision

Both repositories are private and the audience is the same internal team, so
this is not an exposure question. It is a question of what a tier *means*.

1. **Pseudonymise.** Attendee tables become `Consultant`, `Trainee A`. Survives
   the existing filter untouched. Costs the reviews some of their point — §2 of
   the 08-20 review reasons carefully about *who* drove the screen and why the
   role split differed from the previous session.
2. **A distinct reader tier that keeps names.** A third tier alongside
   `internal` and `export` — names kept, issue ids and library paths still
   stripped. The `FORBIDDEN` sweep is scoped per tier rather than relaxed.
3. **Drop §2 entirely** from the exported review. Cheapest; loses the
   attribution that makes a quoted claim checkable.

**Recommended: 2, and only if the sweep is scoped per tier.** Relaxing
`FORBIDDEN` globally so reviews can pass would silently remove the name
protection from guides at the same time, and nothing would report it — the
exact shape of failure `_scrub`'s docstring already describes, where the export
stayed green while 33 commands and 242 session codes had vanished. A new tier
name makes the weakening visible in the data: this side can then read `tier`
and know what it is holding.

Issue ids and library paths should stay stripped from reviews under any option.
This side has no issue tracker and no library tree, so both are noise here.

### 3.4 Summaries

The six `_summary` files are `type: summary` with their own frontmatter and
`issues: []`. They read as a standalone short version, not as an excerpt.
Simplest handling: emit them as reviews with a flag (`"kind": "summary"`) and a
pointer to the full review's id, so a page can offer both.

---

## 4. Assets — deferrable for guides, forcing for reviews

§6 asks for a decision. Here it is, in two halves.

**For guides, still deferrable but no longer free.** §2.2 above is one
generated SVG with no evidentiary content, and shipping it would fix a visible
defect on one page. Screenshots remain a separate question with no route.

**For reviews, this is the decision that governs whether they are worth
publishing at all.** The six reviews cite 42 distinct `SS_*.png` frames as
their sources, and unlike a guide — which describes what to do in words a
reader can follow on their own screen — a review's claim about what *was seen*
is frequently anchored to the frame that shows it. Stripped of images, the
reviews still read, but the citations become dangling references to files the
reader cannot open.

Those frames are screenshots of a licensed environment and are exactly what
`evidence/` exists to keep in atlas, so this is not a request to relax that. It
is a request to decide, before review export is built, which of:

- reviews publish without images, citations rendered as plain unlinked names;
- a defined subset of frames is published to this private repository under a
  deliberate route;
- reviews do not publish until a route exists.

This side's preference is the first, as a starting point — it ships something
readable now and does not move a single licensed screenshot. But the decision
belongs upstream and should be made before the exporter is written, not after.

---

## 5. What this side is not asking for

Recorded so no work goes into it: `sessions/`, `config/`, `tests/`, `build/`,
`issues.md`, and `evidence/` in every form including meeting transcripts.

The transcripts in particular: this side wants the **reviews**, which are
written from the recordings and cite them, not the raw transcripts themselves.

---

## 6. If only one thing is done

`status` in the export tier (§1.1). It is one line behind an existing `if`, it
unblocks the decision already made in §0, and until it lands every guide this
side publishes is published without being able to say what it is.
