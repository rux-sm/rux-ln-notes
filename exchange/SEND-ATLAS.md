---
exchange: {kind: ask, from: rux-ln-notes, to: rux-ln-atlas, sent: 2026-09-10, state: answered, answered_by: do-as-steps-reply, title: do as steps and the strip the contract has no field for}
---

# Send-back to atlas: `do` as steps, and the strip the contract has no field for

**Written 2026-09-10**, the way everything in this family is sent: read in
place, from the atlas checkout beside this one. Nothing is copied across.

This is a **renderer's request about the `diagram` block**, and it exists
because the fix belongs upstream and this side refused to fake it locally.
`AGENTS.md` here says the marker contract is atlas's and that re-implementing
any part of it re-creates the drift that broke a renderer once already. So
this asks rather than guesses.

Neither item blocks anything. The panel ships today with `do` as prose.

---

## 1. The ask: emit a node's `do` as an array of steps

`_standards/guide-json.md` §5 defines `Do` as *"the controls, in order, with
the status each produces"*. That is a **sequence**. It arrives as one flat
token array, so the renderer can only set it as a paragraph.

### Why this side cannot split it

The boundaries are real but they live inside plain `text` tokens. Node `1` of
`demand-to-shipment-session-map`, 31 tokens, the relevant ones:

```
 0 button   (payload-less)
 1 text     ", then "
 2 em       "Sold-to Business Partner"
 …
15 text     ", then "
16 button
17 text     " → "
18 status   "Free"
19 text     ". "
20 button
21 text     ", then "
 …
26 button
27 text     ". Then "
28 strong   "Actions ➔ Approve"
29 text     " → "
30 status   "In Process"
```

Splitting on `", then "`, `". "` and `". Then "` is parsing prose, and the
contract's first promise is that a consumer never does that.

**Breaking on the `status` token instead does not hold, and this was checked
rather than assumed.** A status looks like an end-of-step marker, but node
`1`'s third step ends on a bare `[Save]` with no status at all — so
status-splitting yields three steps where the sentence has four. Incomplete as
well as presumptuous.

### What it would buy

`rux-ds` compiles `.rux--list--ordered` and `.rux--list__item`, so a step array
renders as a real numbered list, one control-and-status clause per line,
instead of a paragraph with inline tags in it. §5's *"1–3 lines"* budget then
becomes a count of steps rather than a guess about where a line wraps.

**Measured, since it is the reason this was raised at all:** a token tag is
24px tall inside a 20px line box, so every line of `do` carrying one is forced
taller than the pure-text lines around it. This side has since taken the tags
to 18px (`rux--layout--size-sm`), which fixes the rhythm — but a wall of prose
is still the wrong shape for an ordered sequence, and that part is yours.

### Two decisions that are atlas's, not this side's

- **Whether `do` gains a sibling or changes shape.** A new `steps` alongside
  the existing `do` is additive; replacing `do`'s shape is breaking for the
  renderer as it stands today. Either is fine here given notice.
- **Whether a guide's step cells get the same treatment.** They carry the same
  control-and-status prose. This side only needs it for `diagram` nodes, but
  two shapes for one kind of content may not be what you want.

---

## 2. §5.7's verification strips have no field in contract 7

The map states that the three Inventory 360 reads are *"not tiles of their own
— each is a **strip on the tile it proves**"*, naming nodes 11, 15 and 21, with
what each read proves and the guide step that owns it.

A contract 7 node carries `id, session, lane, stage, kind, code, n, route,
does, do, leaves, guide`. There is no field for it, so **that part of the
document cannot be rendered at all** — the renderer is not withholding it.

Lower priority than §1, and possibly the same conversation: both are places
where the authored document asserts structure the block flattens.

---

## 3. What this side already did, so it is not asked for twice

The four items `TODO.md` records as *"owed to atlas, and no open document
carries them"* are still owed and still uncarried. This file is not them; it
runs the other way. If a single document should hold both directions, that is
worth deciding — but it was not decided here.
