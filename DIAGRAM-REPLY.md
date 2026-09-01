# Diagram as data — accepted, with two conditions

A reply to atlas `_standards/diagram-as-data.md`, written 2026-09-01 against
atlas `d09ec3d` (`data/guides/PIN`), contract 2, export tier, seven guides.

**The answer to §4 is yes.** The model in §2 can be rendered here to at least
the current standard, and this document says why that is a claim about the
model rather than optimism about the renderer. The two conditions in §3 are
what the answer rests on; if either is refused the answer changes.

Nothing here has been built. No `diagram` block exists to render yet.

---

## 0. What was checked before answering

Every measurement in the proposal was re-derived on this side rather than
taken. All of it holds, and §1.1 understates itself.

| claim | as written | as measured here |
| :--- | :--- | :--- |
| the SVG carries its own palette | 9 custom properties | **18**, plus its own `prefers-color-scheme` |
| its hexes appear nowhere else | 5 named, two files each | confirmed; and **36 of its 37** distinct hexes exist in no other file |
| it shares nothing with the design system | "no `--rux-*` value" | confirmed — the single shared hex is `#ffffff` |
| nine session codes inside it | 9, one uncited | confirmed; `tdipu0110m000` appears in **0** guide payloads |
| the SVG is hand-placed | 32 rects, 14 paths, 254 lines | confirmed, plus 95 `<text>`, 21 circles, 12 lines, 28 groups |

## 1. §1.2 is a boundary property, not an atlas one

The proposal says the diagram hides a session code from every check *in the
library*. It hides it from every check **here** as well, and that is worth
stating because it doubles the argument.

`check-links` resolves the SVG as a target and never opens it. `check-classes`,
`check-structure` and `check-order` sweep `.html` only. The pre-commit export
gate greps `\.html$`. The two occurrences of `svg` in `tools/*.mjs` are both
comments. **No gate on this side has ever read a byte of the diagram's text.**

So the artifact is opaque in both repositories at once, and neither side's
gates are the reason. The format is.

**This was not hypothetical for us either.** The gap marker was still live in
this checkout when the proposal arrived — on both the `data/` copy and the
published one, rendered to a reader on `SG-demand-to-shipment-via-planning`,
which is the page that displays the figure. §4's "the status quo is safe" was
true upstream and false here for the three commits we were behind. Syncing
`98bcded` cleared it. A guarded status quo that depends on the consumer having
pulled is a weaker guarantee than the proposal credits itself with, and that is
an argument for §2 rather than against it.

## 2. Why §4's worry does not apply: this is a grid, not a graph

§4 expects "hand a node-and-edge list to a generic auto-layout and the result
will be worse than what ships today." That is true of general auto-layout and
it is not what §2 asks for.

**`lane` and `stage` are coordinates.** Six lanes by five stages is placement
by lookup — no solver, no force simulation, no heuristic that can surprise us.
The thing that makes swim-lane diagrams tractable is exactly the thing §2
already carries, and it is why this can be built in a repository with no
`package.json` and no framework, which it should stay.

What is genuinely hard is the rails, and there is only one hard rail: the YES
branch that skips stages 3 and 4. §2 models that as an edge property, so
routing it above the transfer band is one explicit rule rather than an emergent
result. §3 calls the routing presentation and the skip domain; we agree, and
the skip is the half that makes the presentation decidable.

The stage-4 boundary column is the same shape of thing — `stages` already flags
the boundary, so drawing it is a rule and not a coincidence of layout.

## 3. Two conditions

### 3.1 Node boxes are sized by `kind`, not by their text

There is no browser in the build and no way to measure a string. A renderer
that sizes boxes to their labels would be guessing, and guessing wrong is how a
swim-lane diagram becomes ugly in a way no gate can see — which is this
project's recurring failure mode and the one it has just spent two commits on.

So: fixed dimensions per `kind`, and a stated character budget per `label` and
`sublabel`. If a label exceeds the budget the build fails and names it, rather
than shipping a clipped box. That makes the constraint atlas's to design
against, visibly, instead of ours to absorb silently.

This is the same decision as the tags: `.rux--tag` caps at 13rem and ellipsises,
so `command` and `path` were moved out of tags rather than shipped truncated.

### 3.2 `description` and `notes` render as HTML beside the figure

§2 moves the `aria-label` prose into `description` and the footnotes into
`notes`. Both should land in the page as HTML, not as SVG `<text>`.

That is most of the 95 text nodes, and it is the §1.2 win actually cashed
rather than relocated: prose in HTML is selectable, wraps at the reader's width,
and — the point — **is swept by the gates on this side**, where prose inside
markup is not. Rendering the notes back into the SVG would reproduce the
original defect in a new file format.

It is also the better accessible result. A single `aria-label` carrying a long
description is one unnavigable string; the same content as markup beside the
figure is readable in document order.

## 4. What we are not asking atlas to solve

**The palette is ours and we want it.** §1.1 is the strongest argument in the
proposal and needs nothing from atlas beyond the data — once nodes carry `kind`
and lanes carry order, the colours come from the vendored stylesheet and the
diagram stops being a sixth theme. `check-classes` starts seeing it. Dark mode
stops being hand-maintained in a file the design system cannot reach.

**We are not asking for a layout hint field.** Coordinates, ordering weights or
routing preferences in the data would put presentation back in atlas by a
different door, which is what §3 exists to prevent. If our rendering of a rail
is wrong, that is our defect to fix.

## 5. What this side owes, if the answer is taken

- A `diagram` block renderer in `tools/build.mjs`, sized per §3.1.
- A gate. `check-order` was written because a fix that lived in an artifact
  died with the artifact; a diagram renderer with no rule holding its lane and
  stage assignment is the same trap. The gate should fail on a node whose lane
  or stage is not in the declared sets, and on an edge naming a node that does
  not exist.
- Measuring the result in a browser before it is called done, at the width the
  guides are measured at. The three defects this project has shipped were all
  found that way and none of them by a check.

## 6. If a condition is refused

§4 offers to keep the SVG if the model cannot be rendered to standard. We would
rather take the model than the offer, but the offer is the right one to have
made and we would use it: without §3.1 the honest answer becomes *not yet*,
because a renderer that guesses at text metrics will ship a worse diagram than
the hand-placed one and no gate here will say so.

§3.2 is not a blocker in the same way. If the notes must stay in the figure we
would still take the migration for §1.1 alone — but we would want it recorded
that the text is opaque again, and that §1.2 was therefore only half collected.
