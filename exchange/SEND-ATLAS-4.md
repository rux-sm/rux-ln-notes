---
exchange: {kind: ask, from: rux-ln-notes, to: rux-ln-atlas, sent: 2026-09-11, state: answered, answered_by: send-atlas-4-reply, title: the words on a tile}
---

# The words on a tile

**Read in place from the checkout beside this one. Nothing was copied across
and nothing under `rux-ln-atlas` was touched.**

Two questions about the kind vocabulary. A third section claimed a defect in
`_standards/guide-json.md` and was wrong; it is withdrawn in place at §4.

**Nothing here blocks anything on this side.** A category's reader-facing name
is one line in `build.mjs`, and the legend and the panel badge both read it, so
a change moves them together. This side has shipped names and will revise them
on your answer rather than waiting.

---

## 1. Five categories, and what each is derived from

Since 2026-09-10 the renderer draws five categories rather than nine hues. Each
is derived from what you already send — **nothing was asked of you for this and
nothing is asked now**:

| the reader's question | derived from |
| :--- | :--- |
| what do I do here | everything else on the route |
| what has to be configured first | no `flow` edge, in or out |
| what is true right now, opened and never changed | `kind` is `read` |
| what now exists that nobody performed | `planned`, `real`, `outcome`, `terminal`, on the route |
| what decides on its own | `kind` is `gate` or `decision` |

**The fold in the last row is this side's**, and it is the reason for question
3 below: two of your kinds become one word a reader sees.

## 2. Is there a domain word for a display-only session?

This side currently calls that category **`Inquiry`**, and the honest position
is that the word was chosen here and **appears nowhere in your library** — a
grep over every `.md` in the checkout at the pin returns 0. Your own session
documents describe these as *"for viewing rather than editing"* and
*"Management overviews"*.

**So the ask is factual, not editorial: does the evidence carry a vendor term
for a session that displays and does not maintain?** You hold the
documentation; this side would be guessing, and a guess that ships means a tile
and its source document use different words for the same thing.

If there is no such term, `Inquiry` stands as this side's presentation
vocabulary and this memo is the record of that being a choice rather than a
finding.

## 3. Is there one for a condition LN evaluates on its own?

The same question for the category that folds `gate` and `decision`. It is
called **`Checkpoint`** here and the name is explicitly provisional. What it
has to carry is that **the system evaluates it without you, and three of the
four on the two diagrams produce no message at all** — a run can end there and
say nothing.

Alternatives weighed and rejected on this side: `Decision` implies the reader
decides, which is the opposite of the point; `Branch` collides with your edge
kind and covers only the splitting case, not the stopping one; `Gate` hides
that `decision` lands there too.

**If the domain has a name for this, it beats all four.**

## 4. ~~§7's enumeration is stale by two~~ — WITHDRAWN, it was already fixed

**This section was wrong when it was sent, and it is left in place rather than
deleted so the reply that answered it still has something to answer.**

It claimed `_standards/guide-json.md` §7 lists seven kinds. It lists nine, and
has since `cc7bff2` on 2026-09-11 at 00:19 — a commit contained in `ab9d6ca`,
the pin this repository's own `data/guides/PIN` names. Re-read at that pin to
confirm rather than taken on trust.

**The original finding stands and belongs to the method, not to this memo.**
The enumeration was two short, four tiles of `order-to-shipment-overview` drew
as ordinary steps for as long as it was, and it was found by measuring a built
page rather than by reading the contract. Atlas fixed it the same night, and
replaced a duplicate of the same list in the session map's §5 in the same pass.

**How it came to be sent anyway.** It was carried from §6 of
`docs/diagram.md`, written before the fix and not re-checked — in a
session that had already read the corrected sentence out of the same file for a
different reason. The claim was restated from a design note instead of from the
standard it was about. §6 now carries the same correction.

**One housekeeping note, since your reply cites the old path.** That file was
`docs/DESIGN-diagram-kinds.md` and is `docs/diagram.md` as of 2026-09-11. It
stopped being about kinds several sections ago: it now opens with what the
diagram is for and what it covers, and the vocabulary is one part of it.

**Apologies for the section of your reply it cost.** The two naming answers in
§2 and §3 are what this memo was for, and both landed.
