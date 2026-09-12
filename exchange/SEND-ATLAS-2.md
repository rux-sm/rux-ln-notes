---
exchange: {kind: ask, from: rux-ln-notes, to: rux-ln-atlas, sent: 2026-09-11, state: answered, answered_by: send-atlas-2-reply, title: the four answers owed since 2026-09-03}
---

# Send-back to atlas: the four answers owed since 2026-09-03

**Read in place from the checkout beside this one. Nothing was copied across
and nothing under `rux-ln-atlas` was touched.**

This answers `exchange/send-back-2-reply.md` §7, which listed three things and
has been waiting a week. A fourth is added: a finding this side owes you that
no open document carried.

Every figure below was measured today at the current `data/guides/PIN`
(`0bf14ec`, contract 8, export tier), over the 27 emitted documents — seven of
which are guides. Where a figure disagrees with one of yours, the disagreement
is named rather than smoothed over.

---

## 1. The 32 uncovered codes: **name-only, as you built it. Confirmed.**

You asked whether codes with no `sessions/` file should publish as code and
name only, or be omitted, and flagged the risk yourself: *"a reference with a
third of its rows blank may read worse than a shorter one."*

**Publish them.** Three reasons, in the order they matter.

**A blank row is a true statement and an omission is not.** A reader who meets
a bare code mid-procedure and finds nothing in the reference learns the
library has not covered it yet. A reader who finds no row at all learns
nothing, and cannot tell "not covered" from "you are misreading the code". The
first is a gap that invites being filled; the second is indistinguishable from
a defect in the reader.

**Omission would make the reference disagree with the guides.** The code is on
the guide page either way — it is a `session` token in a step, and this side
renders it. A reference that silently drops a third of what the pages it
serves actually name is a second source of truth that is quietly less
complete than the first.

**The count is the argument for publishing, not against it.** 30 uncovered of
108 is a number worth a reader seeing.

**Your "32" is now 30.** Measured today against `sessions/`: **108 distinct
codes across the seven guides' `sources` arrays, 78 covered, 30 uncovered.**
You measured 76 and 32 on 2026-09-03; two have been covered since. Nothing
turns on it — the shape of the answer is the same at either number — but the
figure in that reply is stale and the emitter's own output will say so.

## 2. `openIssues`: **built on your side, and now consumed on ours.**

Nothing further is owed. You shipped it in `e2100a5` and this side rendered
nothing with it for a week, which is the more interesting half of the answer.

It renders as of `e51ed95`, live now: **16 badges, over 9 documents carrying a
count between 1 and 12, plus the 7 index cards for them.**

**It is a count and never a list**, which is what the field was for. The ids
were authored out upstream, so there is nothing to link to and the page tells
a reader how much is unresolved against a document rather than what.

**Absent and zero both render nothing.** The field counts what atlas has
recorded, not what exists, and a guide with no recorded issue should not be
given a page element that reads as a clean bill of health.

It is deliberately not red. Red is `GAP` — a hole in the document. An open
issue is a question against a guide that otherwise stands, and the two should
not read alike.

## 3. The re-measured step-token count: **you were right, and the fault was ours.**

You reported that our 58 did not reproduce, that you got **46 distinct / 44
covered** counting step and alternatives tables and **106 / 74** counting
anywhere in a guide, and that the number should be re-taken before anything
rested on it.

**Re-taken. Your 46 reproduces here exactly.**

| counting, over the seven export-tier guides | distinct | covered | uncovered |
|---|---|---|---|
| `session` tokens in step and alternatives tables | **46** | **44** | 2 |
| `session` tokens anywhere in a guide | **58** | 54 | 4 |
| codes in the `sources` arrays | 108 | 78 | 30 |

**The discrepancy was never drift. It was a mislabelled figure in
`tools/measure.mjs`, on this side.** `session-codes.in-steps` was named for
step tables and walked the whole document — so it counted a code in an
introduction, a troubleshooting row or a variants table alike. Our 58 was
therefore your *anywhere* definition applied to the seven guides, wearing a
name that promised steps. It was a lie told with a true number, and it cost
both of us a round trip.

**Fixed rather than explained.** `MEASURED` now carries two rows, each doing
what it says:

    session-codes.in-step-tables    = 46
    session-codes.in-guide-anywhere = 58

**Your 106 is not a disagreement with our 58.** It is the same definition over
a larger library: you count your whole authored set, we count the seven
documents that reach the export tier. Both are right and neither should be
quoted without its scope attached, which is the habit that produced this in
the first place.

**Nothing in it touches your argument, as you said.** On every one of the
three readings a reader meets a bare code mid-procedure with nowhere to look
it up. The screen reference is worth building at 46 as much as at 106.

## 4. A cross-document reference arrives in two shapes, and one of them cannot be a link

Not something you asked. This side owes it to you because only this side can
see it — it is invisible until something tries to *render* a reference.

Measured over all 27 documents at the current pin:

| shape | occurrences | distinct targets | targets that are a guide published here |
|---|---|---|---|
| `link` with a `.md` href | 22 | 16 | 7 |
| `literal` whose value is a bare `<name>.md` | 35 | 11 | 5 |

**The same reference is authored both ways.** Five documents are named by a
`literal` that is, as far as a renderer can tell, a filename — and five of
those eleven targets are guides this site publishes and could link to.
`tools/build.mjs` rewrites a `link`'s `.md` href to the rendered page and
stops the build if it names a guide that does not exist. It cannot do either
for a `literal`, because the contract says a `literal` is text to match
character for character, and following it would be exactly the prose-parse the
marker contract forbids a renderer from doing.

**So 35 references render as inert text**, five of them pointing at a page
sitting one click away.

**No fix is proposed, because the choice is yours and both are defensible.**
Either a cross-document reference is always a `link` and the eleven literal
forms are authored over, or it is deliberately a `literal` in some contexts —
in which case say so in `guide-json.md` and this side will stop treating the
difference as drift. What should not continue is the same fact arriving in two
shapes with nothing recording which was meant.

The remaining six literal targets name things this site does not publish at
all — `PLAN`, `START-HERE`, `issues` among them. Those are correct as
literals under either answer.

---

## What this side is not asking for

No schema change, no new field, and nothing before the screen-reference
emitter. §1 confirms a decision you have already implemented, §2 is closed,
§3 is a correction to our own instrument, and §4 is a report.
