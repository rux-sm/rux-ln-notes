---
exchange: {kind: ask, from: rux-ln-notes, to: rux-ln-atlas, sent: 2026-09-12, state: open, title: a short purpose for a tile, and the strips that print nothing}
---

# A short purpose for a tile, and the strips that print nothing

**Read in place from the checkout beside this one. Nothing was copied across
and nothing under `rux-ln-atlas` was touched.**

Three asks, and the second and third are the same defect seen from two ends.

**One is a new field and it is the only thing here that changes the contract.**
The other two are authoring, and one of them you have already accepted.

---

## 1. A tile wants a short purpose above the session name

**What rux wants a tile to read:**

    create sales order
    Sales Order Intake Workbench
    tdsls4601m200

The verb phrase first, because it is what a reader is scanning for; the session
name and code under it, because that is what they type into LN once they have
found the right tile.

**`does` cannot be that line and it is worth showing why rather than asserting
it.** Measured over all 43 nodes of the two diagrams at the current PIN:

| | |
| :--- | ---: |
| shortest `does` | 30 chars |
| median | **49** |
| longest | **104** |
| at or under 44 | **14 of 43** |

44 is `budget.session`, the cap you already enforce on a node's name. `does` is
a sentence and reads like one — *"decide the whole route. On-hand plus on-order
against the demand, and nothing announces the answer"* — and it belongs where
it is, in the panel. Putting it on the face would break the two-line tile this
side settled as D1 and widen every column in the grid.

**So the ask is a new node field: a short purpose, imperative, with its own
budget.** `budget.purpose`, sized however you find the corpus sits — this side
would guess 24 to 30 and a guess is not what you want from us. The precedent is
yours: `budget.session` exists, §7.1, *"there is no browser in the renderer's
build and no way to measure a string, so a renderer sizing boxes to their
labels would be guessing"*. Same reasoning, same shape.

**It is optional and this side will draw it when it arrives.** A node without
one renders exactly as it does today, so the field can land on a few nodes and
grow. Nothing here is blocked on it.

## 2. The overview's strips print a word and no referent

**This is a live defect on the published page, and it is yours to close because
you have already agreed to.**

A node carrying an off-sequence edge gets a strip on its face: `Needs` for a
feed into it, `Splits` for a branch out of it, followed by the numbers of the
nodes at the other end. The numbers come from `numberedEnds`, which keeps only
nodes carrying an `n`.

**The overview numbers 0 of its 17 nodes**, so every referent is filtered away
and the strip prints the bare word. Counted on the built page:

| document | strips | with a referent |
| :--- | ---: | ---: |
| `order-to-shipment-overview` | 7 | **0** |
| `demand-to-shipment-session-map` | 4 | 2 |

So five tiles say `Needs` and two say `Splits`, and not one of them says what.
On the map it is half working — `Needs 11`, `Splits 8 · 12` — and half not,
because two of its strips point at unnumbered nodes.

**`SEND-ATLAS-5` §5 already took this**: *"Numbering — taken without
qualification. Every node that is something a reader does gets an `n`."*
Numbering the overview closes this without anything else changing. It is
recorded here because the consequence was not visible when that was agreed: it
is not only that an off-sequence edge cannot be cited, it is that seven tiles
currently carry a label with nothing after it.

## 3. And a ruling on the case that will remain

Numbering every *step* still leaves strips pointing at nodes that are
deliberately unnumbered — a reading is not a step, which is your rule and the
right one. So after §2 lands, some strips will still have an unnumbered node at
the far end.

**Three ways to draw that, and the choice is yours because it is about what the
reader is being told:**

- **Name it.** `Needs Inventory 360` rather than `Needs 11`. Longest, always
  true, and the widest face on the overview is already the thing that sets a
  column — this side measured `SPLITS Advise, pick and ship` doing exactly that
  once before.
- **Draw nothing.** A strip with no referent is not drawn at all. Honest, and
  it silently drops the fact that the edge exists.
- **Keep the bare word.** What ships today, and it tells a reader there is
  something without telling them what.

**This side's preference is the first**, with the note that it costs width and
this project has a rule against a tile growing one. If you take it, a cap like
`budget.purpose` would settle it.

## 4. What is not asked

- **Not a rename of `Needs` and `Splits`.** The words are this side's
  presentation and they are fine; it is the missing half that makes them read
  as cryptic.
- **Not a change to how strips are derived.** A feed in, a branch out, off the
  flow — that is right and it is already measured as `edges-off-sequence` and
  `nodes-marked` in `MEASURED`.
