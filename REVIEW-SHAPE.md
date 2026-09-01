# The review shape

**Answers `_standards/send-back-reply.md` §3.1**, which asked for one review's
worth of the target shape before the emitter is built, and offered *"same shape
as a guide, minus phases"* as an acceptable alternative.

Written 2026-08-30 against atlas `1cccb3f`, reading all six reviews and all six
summaries. Nothing here is a change to atlas; it is a description of what a
review page needs, for you to accept, refuse or reshape.

---

## 0. The short answer

**"Same shape as a guide, minus phases" is close, and wrong in one way that
matters.** Take it as the base and change two things:

1. **A review's sections are a fixed, named set — not a flat ordered array.**
   All six reviews carry the same eight `##` sections, in the same order, with
   the same titles. A guide's `sections` is a flat array the renderer walks; a
   review's should be **eight named slots**, because every one of them wants a
   different component and the renderer can then fail loudly when one is missing
   rather than rendering a heading it does not recognise.
2. **Four block kinds do not exist in contract 2** and a review cannot be
   rendered without three of them.

Everything else transfers: the token layer unchanged, `id`/`title`/`status`/
`updated`/`sources` as they already are, and prose blocks exactly as guides
carry them.

---

## 1. The section model

Measured, not assumed — `grep '^## '` across the six full reviews returns each
of these exactly six times:

| # | section | shape |
| ---: | :--- | :--- |
| 1 | Objective | prose |
| 2 | Attendees | table — Name, Role, Organisation |
| 3 | Key topics discussed | **5–8 titled subsections**, the body of the document |
| 4 | Decisions made | ordered list |
| 5 | Action items | table — #, Action, Owner, Due, Status |
| 6 | Open questions | unordered list |
| 7 | Methodology and process notes | unordered list |
| 8 | Sessions referenced | table — Session name, Code, Reference doc |

**§3 is the only one that nests.** No `###` appears under any other section in
any of the six. So one array, not a general tree:

```json
"topics": [
  { "n": "3.1", "title": "An item cannot be planned until it has planning data",
    "blocks": [ … ] }
]
```

Counts run 5, 6, 6, 7, 7, 8. Numbering is `3.n` and ascends, so the same
string-id rule guides already have applies — `"3.10"` will sort before `"3.9"`
on a naive compare the first time a review has ten topics.

**Why named slots rather than an array.** Attendees is a three-column table of
people; Action items is a five-column table with an owner and a status; Sessions
referenced is a lookup. They are three tables that share nothing but being
tables, and a renderer walking a flat array has to sniff the columns to tell
them apart. Naming them costs atlas one dictionary and saves the renderer from
guessing.

---

## 2. Block kinds

What the six reviews actually contain, counted:

| block | count | status |
| :--- | ---: | :--- |
| prose | many | **exists** — unchanged |
| table | 20 | **exists** in `sections` as `columns` + `rows` — reuse verbatim |
| list | 82 (29 ordered, 53 unordered) | **new** |
| callout | 12 | **new** |
| source | 17 | **new** |
| code | 3 | **new** |

**`list`** — `{ "kind": "list", "ordered": true|false, "items": [[tokens]] }`.
Items routinely open with a bold lead-in, which is already a `strong` token and
needs nothing.

**`callout`** — Note / Warning / Prerequisite, the same three `prose.md` allows.
**These cannot be flattened into a string the way a guide's `verification` is.**
The longest runs two full paragraphs with its own citation and a later dated
correction inside it. Needs nested blocks:
`{ "kind": "callout", "variant": "note", "blocks": [ … ] }`.

**`source`** — the `**Source:** …` attribution line, 17 of them. Distinct from
prose because it renders differently — small, muted, attached to the thing above
it — and because it is where the image decision lands. See §4.

**`code`** — three fenced blocks, all ASCII trees of order pegging. Verbatim
text, monospace, and **must scroll rather than wrap**: the widest is 96
characters and wrapping it destroys the tree. `{ "kind": "code", "text": "…" }`.
No language tag; none of the three has one.

### One optional token, and it is genuinely optional

**57 timestamped quotations**, written as `*"…"* (19:51)`. They render correctly
today as `em` + `text` and this side is **not blocked** on anything.

A `{ "t": "quote", "v": "…", "at": "19:51" }` token would let the renderer style
speech consistently and keep the timestamp as data rather than as three
characters inside a sentence. Worth it only if it is cheap on your side. If it
is not, say no and nothing is lost.

---

## 3. What one section looks like

`§3.6 Order pegging` from `order-planning-training_2026-08-20`, which carries
more variety than any other single section:

```json
{
  "n": "3.6",
  "title": "Order pegging",
  "blocks": [
    { "kind": "prose", "tokens": [
      { "t": "text", "v": "Pegging was introduced as the answer to multi-level complexity — " },
      { "t": "quote", "v": "like the one I'm on right now, they have like 20 levels…", "at": "19:51" },
      { "t": "text", "v": "." } ] },

    { "kind": "prose", "tokens": [
      { "t": "text", "v": "The tree captured is " },
      { "t": "chip", "v": "Order Pegging" },
      { "t": "text", "v": " (" },
      { "t": "session", "code": "cprrp0740m200" },
      { "t": "text", "v": "), reached as " },
      { "t": "chip", "v": "Pegging - Upstream" },
      { "t": "text", "v": ":" } ] },

    { "kind": "code", "text": "Sales Order 100000667-10 | NA1 BAM-CHOP-PAIR | Free | 5 of 5 ea…" },

    { "kind": "source", "text": "LN training environment, verified 2026-08-20" },

    { "kind": "callout", "variant": "note", "blocks": [
      { "kind": "prose", "tokens": [ … ] },
      { "kind": "prose", "tokens": [ … ] } ] }
  ]
}
```

**On `source.frames`.** Answered and dropped. Reviews publish without images,
so this side never needed the filenames; `review-shape-reply.md` §4 removed the
slot rather than emitting a field with no consumer, and the example above is
the shape as built. What follows is the reasoning that got there. `source`
becomes `{ "kind": "source", "text": "…" }`, which is simpler and fine.

---

## 4. Stripping is not deleting — ANSWERED, and this section was wrong

**Closed 2026-09-01, and it was closed before that in
`_standards/review-shape-reply.md`, which this side had not read.** Atlas
answered §4 by building it: *"§4 is answered by building it rather than
agreeing to it"*, and *"§4 no longer blocks it."* The reply also corrects this
section's arithmetic. Nothing below asks atlas for anything; it records what
was answered and why the question outlived its answer.

### 4.1 What was asked

That the export of a review be *authored* down to the tier, not filtered into
it, because removing an `OI-\d{3}` token from a finished sentence leaves damaged
prose rather than clean prose — and the fail-closed sweep cannot see the
difference. It can only ask whether an id survived.

### 4.2 What is actually there

`emit.py`'s `_degap()` removes an INTERNAL marker **structurally**: on hitting
an `internal` token it breaks out of the cell, so the rest of the sentence goes
with the id instead of leaving a hole. Its docstring states the same reasoning
this section did, from the other side, and names the same failure —
`OI-073` cut from a finished sentence leaving a fragment "with every check
green, because the sweep can only ask whether an id survived."

Re-measured at atlas HEAD, and now carried in `MEASURED` so it cannot go stale
the way the old numbers did:

| | | |
| :--- | ---: | :--- |
| ids on an INTERNAL line | 70 | removed structurally, sentence and all |
| ids in `issues:` frontmatter | 34 | never a sentence, never emitted |
| residual | 7 | see 4.3 |
| **total** | **111** | |

**And this section's headline number was wrong when written, not merely
stale.** It said 102 of 112 were load-bearing. The reply's correction: that
figure *"treats the frontmatter arrays as prose, and they are not — they are a
field you already choose not to emit."* The real obligation was **fifteen
sentences that genuinely had to be rewritten**, out of 40 edit sites, and the
migration has already done them. A one-time pass plus a marker rule, not the
open-ended authoring duty this section forecast.

The three examples it argued from — `| Open — OI-101 |`, `…from a future walk,
OI-101`, `this is how OI-099 closed…` — return zero matches at HEAD.

The mechanism is verified on guides rather than asserted: `data/guides/` holds
**0** issue ids and **0** INTERNAL markers across seven guides at contract 2.

### 4.3 The residue is not residue

Seven occurrences sit outside the INTERNAL and frontmatter tests. This side
briefly recorded them as an open ask. They are not: the reply's own table lists
them — *"already inside a `**GAP —**` marker | 7"* — and re-checking confirms
it, **7 of 7 on a line carrying a GAP marker, 0 without**. `_degap()` reaches
them by the gap rule rather than the internal one.

Nothing is owed here.

### 4.4 The `**Source:**` lines are a different question and are decided

17 of them. This side no longer asks for a rewrite: `README.md` records that
reviews publish without images and their citations render as plain unlinked
names, and that the consequence — a claim about what was *seen* losing the
frame that shows it — is accepted rather than softened. Nothing further is
needed from the emitter here.

### 4.5 Why this went stale, and the part that is actually worth fixing

Two failures, and only one of them is about numbers.

**The counts had nothing watching them.** This document quoted 112 and 10 from
`288bf72` and kept quoting them. Those three figures are now derived by
`tools/measure.mjs` into `MEASURED`, so the next reformat moves them in a diff.

**The reply had nothing watching it either, and that is the larger one.**
`_standards/review-shape-reply.md` had said §4 was answered since before this
side re-opened it. `MEASURED` tracks `delivered.*` — whether the recipient
mentions our document — and tracks nothing about whether they *answered* it. So
a stale sentence in `README.md` claiming atlas was blocked on §4 survived,
was believed, and produced work against a question that was already closed.

Delivery is measured. The reply is not. That asymmetry is the gap, and it is
the same class as every other failure this project has recorded: a fact about
another repository, asserted from prose rather than derived.

---

## 5. Summaries

`kind: "summary"` with a pointer to the full review's id, as you proposed.

The section set is different and also fixed — four `##` headings, identical
across all six, unnumbered:

| section | shape |
| :--- | :--- |
| What this covered | prose |
| Topics | 4–7 titled subsections, **unnumbered** |
| What was decided | list |
| Key takeaways | list |

So a summary is not a truncated review — it is its own four-slot shape sharing
the topics model. No attendees, no action items, no sessions table.

---

## 6. What this side is not asking for

- **No `reviews/` paths, no `ME_*`/`SR-*` filenames.** Seven appear in the six
  and all should go. This side cannot link them and will not print them.
- **No transcripts.** Unchanged from `SEND-BACK.md` §5.
- **No image files.** Settled; §3's `frames` is a question about metadata, not a
  request for bytes.
- **No new token types beyond the optional `quote`.** The existing fifteen cover
  every inline construct in all six reviews.

---

## 7. If only one thing is decided first

**It was §4, and §4 was answered in `review-shape-reply.md` before this side
asked again.** The reply says so twice, in its opening and its closing line.
Nothing in §4 is owed.

**So the blocker moves to §1 and §2**, which are mechanical and which this
document is enough to build from: the eight named slots, and the four block
kinds contract 2 does not have. `list` is the one a summary cannot be rendered
without.

**One thing outside this document still blocks a summary**, and `README.md`
records it: `tools/export.py` carries `PUBLISHES = {"guide"}`, whose comment
says `review` joins when the emitter exists while `summary` never does. Read
literally that refuses the category. The reconcilable reading is
`SEND-BACK.md` §3.4's — a summary rides the review emitter as
`kind: "summary"` and never needs a tier as its own document class — but the
code says otherwise today, and it is a question rather than an assumption.
