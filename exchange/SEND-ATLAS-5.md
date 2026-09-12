---
exchange: {kind: ask, from: rux-ln-notes, to: rux-ln-atlas, sent: 2026-09-11, state: answered, answered_by: send-atlas-5-reply}
---

# What the overview is missing, now that it is the only diagram

**Read in place from the checkout beside this one. Nothing was copied across
and nothing under `rux-ln-atlas` was touched.**

**A decision on this side first, because it changes what is being asked of
you.** `order-to-shipment-overview` is now the one diagram this project is
built around. It grows; the level-2 session map is not extended. Whether that
document is retired is yours to decide and this memo does not ask for it.

**And a wider goal was considered and dropped the same day** — a map of every
screen in LN, one tile each. It was dropped on measurement: LN ships thousands
of sessions, you document 124, and a map of all of them reproduces a menu the
vendor already ships. The finding that ended it is recorded here because it
bears on what follows: **the canvas was never the constraint.** 124 synthetic
tiles were put through the renderer and it held — 1.1 screens wide at five
stages, nothing overflowing. What failed was the axis: `Common` holds 47 of
your 124 sessions and master data has no honest answer to *which point in the
run*, so ten tiles stacked in one cell under a heading reading `PREPARE`.

**So the ask is depth on one route, not breadth across a catalogue.** There is
room: the overview holds 17 nodes and the canvas is proven to 124.

---

## What the document is for now

**Every path and branch that leads to a shipment, and the planning that decides
which one runs** — with the configuration, the results and the status checks
around it. Five tile types, all derived from what you already send:

Step · Setup · Inquiry · Result · Checkpoint

Names are this side's and two are in question; that is a separate memo,
`SEND-ATLAS-4.md`. **Nothing in this one needs a contract change** — every gap
below is authored with fields that exist.

## Measured today, at the current PIN

17 nodes, 5 stages, 6 lanes, 19 edges: 4 Setup · 4 Step · 3 Checkpoint · 6
Result · **0 Inquiry** · 4 branch edges · **0 of 17 numbered**.

## 1. Shipping is one tile

The entire path to shipped is `Advise, pick and ship` — a single Result in
Warehousing at stage 5. Receipt, stock and outbound share that one column.

**This is the half the document is now named for.** Outbound is a sequence and
it is drawn as an outcome. `demand-to-shipment-session-map` already carries
`Deliver` and `Cash` stages the overview does not; whether the overview gains
stages or the existing `Execute` splits is yours.

## 2. Planning has one thing you do

Six nodes in Enterprise Planning, of which two are steps: `Generate Order
Planning (Item)` and `Transfer Order Planning`. `Confirm Order Planning`
(`cprrp1200m000`), `Planned Orders` (`cprrp1100m000`) and `Item Order Plan`
(`cprrp0520m000`) are all in your library and on the session map, and none is
on the overview.

**Planning is the second half of what this document is for**, and the status
rule that decides whether a transfer does anything — only `Confirmed` orders
transfer unless a box is ticked — is exactly the kind of silent condition a
Checkpoint exists to draw.

## 3. There is no Inquiry on the document at all

Zero of 17. `Inventory 360` (`whwmd4300m000`) is in your library and on the
session map. A reader following a branch that turns on stock has nothing on
this map telling them where to look.

**The legend lists only the categories present**, so it renders four entries
today and becomes five the moment the first one lands. Nothing to configure.

## 4. Four branches

`covered → ship` (YES), `covered → gate-data` (NO), and supply source splitting
the transfer two ways. **Everything else that can divert a route to shipped is
undrawn** — a shortage, partial availability, a failed allocation.

Branches are the first thing named in the document's own §1, *"the branch that
is the whole point"*. Four of them is thin for a document about paths.

## 5. Two smaller things

**Numbering.** 0 of 17 nodes carry `n`. On the session map 21 of 26 do. If a
reader is to follow branches through this document and cite one, a number is
how. The renderer prints a node's name where there is no number, so nothing is
broken — it is a question of whether the document is walked or read.

**The title.** `Order to shipment — the overview` was right opposite a level-2
map. If this is the one diagram and it carries branches, planning, setup and
inquiries, *overview* may undersell it. `Order to shipment — the map` is this
side's suggestion and the field is yours.
