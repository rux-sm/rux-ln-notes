# Send-back 2 — which categories the portal publishes

One question, asked before the portal's information architecture is built:
**given what the library actually holds, which content categories do you
recommend the published surface carry?**

Written 2026-08-30 against atlas `288bf72` (`data/guides/PIN`), contract 2,
export tier, seven guides. Nothing here is a change to `data/guides/`.

**Atlas has moved since that pin** — `1cccb3f` at the time of writing, five
commits on. `issues.md` was re-read at that head, and the two counts this
document rests on were re-measured there rather than left at the pin.

This is a narrower ask than the first send-back and most of it is a request for
a recommendation rather than for code. The reason to ask at all is that this
side can see the export tier and nothing else: 108 session codes arrive as bare
identifiers, and what stands behind them is only visible from your side.

---

## 0. What this is not reopening

The three decisions in `SEND-BACK.md` §0 stand, and your reply accepted all
three. They are not in question here:

- **Guides publish, drafts included.** Shipping, `status` arrives in contract 2.
- **Reviews and summaries publish.** Decided; the emitter is not built.
- **The knowledge base does not publish.** `sessions/`, `config/`, `tests/`,
  `build/` and `evidence/` stay in atlas in every tier.

So the published surface is **two categories** as things stand. The question is
whether two is the right number, and you are better placed to answer it.

---

## 1. What this side owes you first, so it is not buried

You asked for **one review's worth of the target shape** before building the
review emitter, and offered "same shape as a guide, minus phases" as an
acceptable answer. **That is still outstanding and it is this side's debt, not
yours.** Nothing renders here yet, which is the honest reason and not a good
one.

It is named here because the answer to §4 below may change what that shape
should be, and sending you a shape while a category question is open would be
the wrong order.

---

## 2. Reopening exactly one thing this side closed itself

`SEND-BACK.md` §5 listed `issues.md` under "what this side is not asking for."
That was this side's own line, not yours, and it is being reopened here — which
is worth saying plainly rather than quietly re-asking.

The reason it comes back is that building a portal surfaced a distinction §5 did
not make. **Two different things were closed by one line:**

1. **Publishing the tracker as a page.** 189 distinct ids, next free `OI-250`,
   one flat table. This side still thinks **no**, and nothing has changed the
   reasoning — it is a working document, it is consulted rather than read, and
   it fails the test in §5 below.
2. **A guide page saying it has known gaps.** This was never separately
   considered and this side has no position on it. A reader walking a draft
   procedure that has four open questions against it arguably should know that,
   and the `verification` sentence does not carry it.

**Whatever the answer, ids do not cross.** `FORBIDDEN`'s first pattern is
`OI-\d{3}`, you called stripping them non-negotiable from your side, and this
side agrees. If (2) has any merit it is as a count or a flag, never as a
reference. If it has no merit, say so and it is closed properly this time.

---

## 3. The category this side would ask for if it could only ask for one

**A screen reference — what a session code is, in the reader's terms.**

A guide names screens constantly and the reader has nowhere to look one up:

| | |
|---|---|
| distinct session codes across all seven `sources` arrays | **108** |
| distinct codes appearing as `session` tokens inside steps | **58** |
| of those 58, covered by a file in `sessions/` | **53** |
| of the 108, covered by a file in `sessions/` | **76** |

A junior consultant reading *"Warehousing ➔ Inventory 360"* and meeting
`whwmd4300m000` in the next cell has no way to find out what that screen is for
without the library this repository deliberately does not have.

**This is not a request for `sessions/`.** §0 stands and the 122 session
documents are not wanted here. It is a question about whether something
*derived* from them — a code, a name, a one-line purpose, and nothing else —
is a category you would be willing to emit, and whether it can be done without
becoming a route by which session help leaks into a public-adjacent surface.

That last part is the real question and it is yours, not this side's. This side
cannot see what a session document contains and therefore cannot judge what a
one-line summary of one would carry with it.

**`OI-248` is this question, logged from your side.** It reads: *"No rule
governs defining an LN term on first use; the checkable slice is a field name
used in a guide with no `sessions/` file to define it."* That is the same hole
this section describes, found independently and from the other direction. This
side did not know it existed when §3 was drafted, which is some evidence the
gap is real rather than a renderer's preference.

If a screen reference publishes, `OI-248`'s checkable slice is close to its
acceptance test. If it does not, `OI-248` still wants an answer and this side
has none to offer.

**Related, and possibly stale:** `OI-019` reads *"Most sessions the guides name
have no `sessions/` file."* Measured against contract 2, 76 of 108 are covered
and 53 of the 58 in-step codes are. "Most" looks wrong now. Still open at
`1cccb3f`. Worth a re-read on your side — this side is reporting the count, not
proposing a status change.

---

## 4. The question actually being asked

Beyond guides and reviews, **what should the portal publish?**

Three candidates this side can see, in descending order of confidence:

1. **A screen reference**, derived — §3 above.
2. **A parameter reference.** `config/` holds three `LC-*` documents that the
   guides depend on for the values a reader is told to enter. Decided out in §0
   and this side is not challenging that; noting only that a guide step which
   says to set a parameter is asking the reader to trust a value whose source is
   not published.
3. **A known-gaps signal** on a guide page — §2(2) above.

And the part this side cannot supply: **anything you can see that is not on this
list.** You hold 122 session documents, 248 evidence files, 12 reviews and a
189-row tracker. If some fourth category is obviously publishable from where you
sit, this side has no way to know it exists.

---

## 5. The test being applied, and where it may break

The rule the three §0 decisions turned on:

> anything a person sits down and reads becomes a page here; anything a document
> consults on their behalf does not.

It settled guides, reviews and the knowledge base cleanly. **It gives the wrong
answer for a lookup.** A screen reference is consulted, never read start to
finish — by the letter of that rule it does not publish, and yet it is the thing
a reader most obviously needs while walking a procedure.

So either the test needs a second clause for reference material a reader
consults *while* reading a page that publishes, or the screen reference is
genuinely out and this side should stop asking. **Which of those is right is the
thing this document is for.**

---

## 6. If only one thing is answered

**Whether any derived category is admissible at all** (§3, §4).

Not which ones — whether the class is open. Two published categories and four
are different information architectures, and the difference is cheap now and
expensive after a portal exists. Everything else here can wait for the review
shape this side still owes you.
