# Send-back to atlas: the map's missing setup, and one signal owed

**Read in place from the checkout beside this one. Nothing was copied across
and nothing under `rux-ln-atlas` was touched.**

Two asks and one finding. The ask overturns a decision this side recorded, so
it is put with the evidence that changed it rather than as a preference.

Every figure below was measured at the current `data/guides/PIN` (`0bf14ec`,
contract 8, export tier).

---

## 1. The ask: the map should carry what has to be configured first

`demand-to-shipment-session-map` draws 24 tiles across five lanes and eight
stages, and **not one of them is a prerequisite.** Its §8 says so deliberately:

> Master data — items, BOM, routing, planning cluster, buy-from partner ·
> *Level 1 owns it, and the source on file builds it. Drawing it twice is the
> duplication rule 5 exists to stop.*

**That reasoning has a hole, and the map itself is where it shows.** Its §7
names four ways the chain fails with no message. Three of the four are
prerequisites that were never set up:

| §7 failure | the prerequisite behind it | on the map? |
|---|---|---|
| The item has no planning data | the planning cluster row on the item | **no** |
| The delivery date is outside the order horizon | `Items - Planning` | yes, node 2 |
| The planned orders were never confirmed | *not setup — a procedure step* | yes, node 6 |
| A purchased item has no buy-from partner | `Item - Purchase` | **no** |

So the map **names the failure and draws the fix for one of the three.** A
reader who hits the first or the fourth is told, in prose beside the figure,
that something upstream is missing — and the figure has nowhere to point. That
is not duplication avoided; it is a diagnosis with the remedy left on another
page.

**The second map is not a copy of the first.** The map's own intro says it
*"starts where that one's stage 2 starts, at sales demand, and answers a
different question: which session, reached how, and what do I actually do in
it."* A prerequisite drawn at level 1 as *"the item must be visible to order
planning"* and at level 2 as *"the session you open, the field you set, the
state you check"* are not the same tile twice. Rule 5 is about one fact
serialised twice; this is one fact answered at two altitudes, which is the
whole basis for having two documents.

### What should go in it

Not a guess — it is already authored. `SG-create-basic-test-items-and-defaults`
is eleven phases of exactly this ask, and the scope named on this side is
*anything that has to be configured on items or groups, or is required for
every step to work*. Its phases group cleanly:

| what must be true | where it is authored |
|---|---|
| site, warehouses, unit set and inventory unit | phase 0 |
| the item groups | phase 1 |
| item defaults per group, and the Ordering / Purchase / Warehousing / Production / Sales subentities | phases 2–4 |
| the items, their site rows and supply source | phase 5 |
| BOM — Approved, used for planning and for costing | phase 6 |
| routing — Approved, used for planning and for costing | phase 7 |
| standard cost present on every item | phase 8 |
| components on hand at the raw-material warehouse | phase 9 |

The overview already draws four of these as a `Master Data` lane — `items`,
`buyfrom`, `bom`, `cluster`. **Which of the eight belong on the session map,
and at what grain, is atlas's call**, not this side's: it is the judgement that
needs the evidence, and the evidence is in atlas. What this side can say is
that the two the §7 table marks **no** are the ones a reader is provably
missing.

### What this side commits to, so the ask is not open-ended

**It will be drawn as beside the path, not as more steps.** A prerequisite is
not a numbered thing you walk. This is already settled and already renderable:

- **The signal needs no new field.** A node with **no `flow` edge, in or out**
  is one the sequence never enters or leaves. Measured over both documents it
  lands on exactly the right nodes and no others: the overview's whole
  `Master Data` lane (4 of 17), and the session map's three parameter and
  inventory checks (`Production Order Parameters`, `Inventory 360`,
  `Warehousing Order Types`). No lane has to be named `Master Data` and no
  `setup` boolean has to be invented.
- **It reads as a prerequisite, not as background.** A dashed card, set in
  from the column edge, at full weight — because the planning cluster row is
  the difference between an item planning can see and one it silently cannot,
  and a treatment that makes it faint would be drawing the wrong conclusion.
- **Numbering is unaffected.** A beside-the-path tile takes no number, so the
  numbered count stays the count of things you do — which is the rule D3 of
  the map's own §1 already applies to the three `read` tiles.

The reasoning, the alternatives and the measurements are in
`DESIGN-diagram-kinds.md` in this repository, with a running specimen.

### What is being asked for, exactly

1. Whether §8's exclusion is overturned, and if so which prerequisites the
   session map carries and at what grain.
2. Whether they arrive as a new lane or as nodes in the lane each one serves —
   the planning cluster row beside Enterprise Planning, the BOM and routing
   beside Manufacturing, the buy-from partner beside Procurement. **This side
   has no view**; both render, and the second follows the chain while the
   first collects setup in one place.
3. Nothing else. No contract change is requested and none is needed.

---

## 2. The second ask: nothing separates a prerequisite from a reading

This side has settled its categories — five, decided 2026-09-10, and the
reasoning with its measurements is in `DESIGN-diagram-kinds.md`. Four of the
five are derivable from what you already send and need nothing from you:

| category | derived from | nodes |
|---|---|---|
| Checkpoint | `kind` is `gate` or `decision` | 4 |
| Result | `planned`, `real`, `outcome` or `terminal`, on the route | 10 |
| beside the route | no `flow` edge, in or out | 7 |
| Step | everything else | 20 |

**The fifth is not there.** *Prerequisite* — go and make this true — and
*Reading* — what is the state right now — are both `read` or `outcome` sitting
beside the route, and nothing distinguishes them:

| node | kind | what it actually is |
|---|---|---|
| `Inventory 360` | `read` | a reading: on-hand before anything moves |
| `Production Order Parameters` | `read` | configuration: what the later tiles will do |
| `Warehousing Order Types` | `read` | configuration: why the outbound tiles are shaped so |
| `Bill of material and routing` | `outcome` | configuration: Approved, used for planning |
| `Planning cluster row on the item` | `outcome` | configuration: the item is visible to planning |

Same kinds, same shape, opposite purpose. **This side is not going to infer
it.** The difference is what the node is *for*, which is domain knowledge, and
guessing it from a name or a `does` string is the prose-parse the contract's
first promise forbids — by a side door.

**What would settle it is yours to choose**, and this side has no preference
between:

- a tenth `kind`, say `config`, for a node that is configuration; or
- a boolean on the node; or
- a ruling that the distinction is not real, and the two are one category.

The last is a perfectly good answer. Until one of the three lands, this side
ships four categories with Reading folded into Prerequisite — which costs one
node of distinction across both documents, and is honest, where a guess would
not be.

---

## 3. The finding: `guide-json.md` §7 enumerates seven kinds, and there are nine

§7 says:

> `kind` is one of `step`, `gate`, `planned`, `transfer`, `real`, `terminal`,
> `read`

§1 of the same file says contract 7 *"adds the `decision` and `outcome`
kinds"*, and both are in the emitted data — `outcome` on three nodes,
`decision` on one, all four on `order-to-shipment-overview`.

**The enumeration is the sentence a renderer reads to learn what it must
handle, and it is stale by two.** That is not hypothetical: this renderer had
no treatment for either, so four of the overview's seventeen tiles rendered
identically to an ordinary step for as long as both have existed. Found by
measuring the built page, not by reading the contract — the contract is why it
was not found sooner.

One line. It does not block anything.

---

## What this side is not asking for

- **A `setup` or `prerequisite` field.** The edge list already answers it and a
  second source for one fact is the thing rule 5 exists to stop.
- **Master data at level 1 to change.** The overview's `Master Data` lane is
  right as it is; this is about the map that has none.
- **Geometry, colour or size.** Unchanged since the diagram reply: lane and
  stage are coordinates, everything below that is this side's.
