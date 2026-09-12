---
exchange: {kind: ask, from: rux-ln-notes, to: rux-ln-atlas, sent: 2026-09-11, state: answered, answered_by: send-atlas-4-reply, title: the words on a tile and two kinds missing from the enumeration}
---

# The words on a tile, and two kinds missing from the enumeration

**Read in place from the checkout beside this one. Nothing was copied across
and nothing under `rux-ln-atlas` was touched.**

Two questions about the kind vocabulary, and one of them is a defect in
`_standards/guide-json.md` that predates this memo.

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

## 4. §7's enumeration is stale by two, and it is the sentence a renderer reads

`_standards/guide-json.md` §7 lists the kinds as *"`step`, `gate`, `planned`,
`transfer`, `real`, `terminal`, `read`"* — seven. Your own changelog line at §1
says contract 7 *"adds the `decision` and `outcome` kinds"*, and both are in the
emitted data: **3 `outcome` nodes and 1 `decision` across the two diagrams.**

**That sentence is described in the same section as "the one a renderer reads
to learn what it must handle", and this project is the renderer that read it.**
Four tiles of `order-to-shipment-overview` drew as ordinary steps for as long
as the omission stood, found by measuring a built page rather than by reading
the contract. The enumeration is two kinds short of what `emit.py` emits.

**Owed since before this memo and not urgent** — nothing renders wrongly today,
because the categories are derived from the kinds rather than enumerated
against that list.
