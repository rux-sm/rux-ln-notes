# The diagram's kind vocabulary

A design plan, not a decision. It says what the nine node kinds should look
like on a canvas and why, and it is written to be argued with. Every figure
in it was measured on the rendered page or derived from the synced data at
`data/guides/PIN`; nothing here is counted by hand.

The question it answers is **not** the one it started as. It began as "two
kinds have no accent rule, what colour should they be", and the measurements
say that is the wrong question.

---

## 0. DECIDED — five categories, 2026-09-10

**Taken by rux, and it supersedes §3 below rather than being one more option
in it.** The sections after this one are kept because the reasoning is the
useful part and two of them record where this plan was wrong; what is decided
is here.

A reader at a screen with the map open asks five questions, so there are five
categories. Measured over all 41 nodes of the two diagrams:

| | | the question it answers | nodes |
|---|---|---|---|
| 1 | **Step** | what do I do here | 20 |
| 2 | **Prerequisite** | what has to be true before any of this runs | 6 |
| 3 | **Reading** | what is the state right now | 1 |
| 4 | **Result** | what do I now have | 10 |
| 5 | **Checkpoint** | what decides silently, and how would I know | 4 |

**Result is the one today's design has never had, and it is 10 of 41.** A
planned purchase order is drawn as a box exactly like a step, so it reads as
something to go and perform. There is nothing to perform — MRP made it. This
is also where the map's second takeaway lives: a proposal is not an order, and
both halves of that are Results.

**Checkpoint is a category and not a shade of Reading.** A Reading is something
you consult; a Checkpoint is where the run dies quietly. Three of the four
produce no message at all.

### Five categories, still one hue

They are drawn by three independent signals, not five colours:

| signal | says | values |
|---|---|---|
| **container** | on the route or beside it | solid tile · dashed card, set in from the edge |
| **name style** | act on it, or take it in | upright · italic |
| **stripe** | what you can reach | grey, an ordinary screen · none, nothing to open · **the one yellow**, it decides silently |

So Step is a solid tile with a grey stripe; Result is tinted and italic with no
stripe; Checkpoint carries the yellow wherever it stands; Prerequisite and
Reading are the same dashed card, upright and italic. Italic means the same
thing in all three places it appears — a state you take in rather than an
action you perform.

This is variant **E** in the specimen, and it is **the only one with zero
category collisions on both documents** — 4 looks to learn on the overview and
5 on the map, identical in all four themes. Today's design collides on 9 of the
overview's 17 and, less obviously, on 3 of the session map's 24.

### The one part that is not derivable, and is an ask

Four of the five fall out of what atlas already sends: `gate` or `decision` is
a Checkpoint; `planned`, `real`, `outcome` or `terminal` on the route is a
Result; no `flow` edge is beside the route; everything else is a Step.

**Prerequisite and Reading cannot be told apart.** Both are `read` or `outcome`
sitting beside the route, and nothing atlas sends separates *Inventory 360*
from *Production Order Parameters* — same kind, same shape, opposite purpose.
The specimen carries a three-entry stand-in list, named as a stand-in rather
than dressed up as a rule, and `SEND-ATLAS-3.md` asks atlas for the signal.
**Until it exists the split is not shippable**, and the honest fallback is four
categories with Reading folded into Prerequisite — which costs one node of
distinction today and is the weakest of the five boundaries.

---

## 1. What is actually there

Nine kinds arrive from atlas across the two documents that carry a diagram.
Counted over all 41 nodes:

| kind | nodes | has `code` | has `route` | numbered |
|---|---|---|---|---|
| `step` | 19 | 19 | 19 | 14 |
| `real` | 4 | 4 | 4 | 2 |
| `read` | 3 | 3 | 3 | 0 |
| `gate` | 3 | 1 | 1 | 1 |
| `planned` | 3 | 1 | 1 | 1 |
| `transfer` | 3 | 3 | 3 | 2 |
| `outcome` | 3 | 0 | 0 | 0 |
| `terminal` | 2 | 1 | 1 | 1 |
| `decision` | 1 | 0 | 0 | 0 |

Six of the nine get a treatment in `build.mjs`; `read` gets a dashed border
and a transparent ground, the other five get a hue. `step` is the default
grey and is 19 of 41 nodes, which is the right thing for a majority case.
`decision` and `outcome` get nothing, so they render exactly as `step`.

Measured on the built pages, grouping tiles by their rendered appearance:

- **Session map: 7 kinds, 7 distinct appearances.** Nothing collides.
- **Overview: 8 kinds, 6 distinct appearances.** `step`, `decision` and
  `outcome` are all `rgb(83,83,83)` solid on the same ground — **9 of its 17
  tiles, carrying three different meanings, look identical.** This is a token
  collision, not a theme artefact: it holds in every theme because all three
  resolve to the same default.
- **Neither page carries a legend.** `stepKey()` is guide pages only. The
  panel names the kind in full, one click away, and that is the only place
  any of these nine words appears on the site.

---

## 2. Three findings, and they point away from adding colours

### 2.1 The contract already rules on the axis, and we are on the wrong one

`../rux-ln-atlas/_standards/guide-json.md` §5, normative, addressed to
renderers:

> colour says what to do with a thing, form says what kind of thing it is

`kind` is literally *what kind of thing it is*. It is currently carried by
hue for five of the nine. The one kind that is on the right axis is `read`,
which is dashed — and it is also the only one of the nine that needs no
legend, because "not one of the solid ones" is legible without being taught.

### 2.2 Three of the five hues restate what the column already says

The boundary band was built on 2026-09-10 so the transfer would read as a
place rather than a label. Measured over both documents, every `planned`,
`real` and `transfer` node without exception:

| kind | stages | relative to the band |
|---|---|---|
| `planned` | 3, 3, 3 | **always left** |
| `transfer` | 4, 4, 4 | **always on it** |
| `real` | 5, 5, 5, 5 | **always right** |

Blue-is-a-proposal and green-is-a-real-order encode, in a hue with no key,
a fact the tile's own column states outright — and stating it is the whole
reason the band exists. Red for `transfer` is the third copy of the same
fact, since the band is already red and the tile sits inside it.

**This is observed, not guaranteed.** Nothing in the contract says a
`planned` node must sit left of the boundary; it is true of 10 of 10 nodes
in the only two documents that exist. If a third document broke it, the
panel would still name the kind and nothing would be lost but the shortcut.

### 2.3 `kind` is two facts wearing one name, and the useful one is not it

`code` and `route` are present or absent together on all 41 nodes — no node
has one without the other. They split the vocabulary in a way `kind` does
not:

| | nodes | kinds present |
|---|---|---|
| **session map** | 24 of 24 openable | every kind it uses |
| **overview** | 8 of 17 openable | `step`, `real`, `transfer` |
| **overview** | 9 of 17 **not a session** | `decision`, `outcome`, `gate`, `planned`, `terminal` |

The same kind is a session on one page and not on the other. `gate` is
`cprrp0520m000` on the session map — a screen you open — and a bare question
with no code on the overview. So is `planned`, so is `terminal`.

**That is why `decision` and `outcome` have no treatment.** They are not a
gap in a colour scheme. They appear only on the overview and only as
non-sessions, and the renderer has never had a form for *the thing that is
not a session at all* — a whole second category it has been drawing as a
session this entire time.

And "can I open this?" is the question a reader with the map beside a screen
is actually asking. It is 100% present in the data, it needs no new field
from atlas, and it is not what `kind` answers.

---

## 3. The plan

**Encode openability as form. Reduce colour to one thing. Leave the nine
names to the panel, which already carries them.**

### 3.0 Two axes, not one — and the second one is the reader's first question

**Added 2026-09-10, from rux, and it corrects the section below rather than
extending it.** The version of §3.1 that follows was written around one axis,
*can I open this*, and it put the master-data prerequisites in the same faint
bucket as a mid-flow state like *planned production order*. That is wrong in
the direction that matters: the planning cluster row is the difference between
an item planning can see and one it silently cannot, and drawing it as
background draws the wrong conclusion about it.

The axis that comes first is **on the path, or beside it**. Following the
sales-to-order route is what the map is for, and a prerequisite is not on that
route — it has to be true before the route runs, and you go and make it true
somewhere else.

**It is already in the data and needs no new field.** A node with no `flow`
edge, in or out, is one the sequence never enters or leaves. Measured over
both documents it lands on exactly the right nodes:

| | beside the path | what they are |
|---|---|---|
| overview | 4 of 17 | the whole `Master Data` lane |
| session map | 3 of 24 | the parameter and inventory checks |

**And it cuts across `kind`, which is why `kind` could never have shown it.**
`Items and groups` is a `step` and sits beside the path; `Bill of material and
routing` is an `outcome` and sits beside it; `Finished item into stock` is also
an `outcome` and sits **on** it. Same category, opposite roles.

So the canvas carries two independent axes and one hue:

| | | |
|---|---|---|
| **beside the path** | a dashed card, inset, full weight | setup and checks |
| **on the path** | a solid tile | the route, read left to right |
| *within either* | a code line and a stripe | a screen you open |
| *within either* | no stripe, tinted, italic | a state or a question |
| *over both* | the one hue | a checkpoint that fails silently |

This is variant **D** in the specimen, and it is the only one that takes
`colliding by path` to 0 on the overview — 9 today.

### 3.1 Three forms on the canvas

| form | means | data test | map | overview |
|---|---|---|---|---|
| solid tile, code shown | a session you open and change | `code` present, kind is not `read` | 21 | 8 |
| dashed tile, no number | a session you open and only read | kind is `read` | 3 | 0 |
| **new** — no stripe, tinted ground, name in italic | not a session: a state, a question or a result the chain passes through | `code` absent | 0 | 9 |

The third is the new work. It is deliberately *not* a fourth border colour:
the point is that it should not read as a box you can go and open. The exact
treatment is to be drawn and measured, not specified here — the constraint is
that it must be told apart from the other two at a glance, in all four
themes, without a legend, and without widening a column (measured today: one
wide tile face widens all of them, 221px to 283px).

### 3.2 One accent colour, not five

Keep a hue for **`gate` and `decision` only** — the points where the chain
decides silently. §2 of the session map says the third thing a reader must
take from it is *"the chain fails silently in four places"*, and unlike the
proposal/order distinction there is no geometry that shows it. Four nodes of
41, so it stays a mark on an exception.

**Form and hue are independent axes, and the specimen is what proved it.** The
first draft of this section took the stripe away from every non-session,
which quietly took the accent with it — and on the overview **every `gate` is
codeless**, so the one hue the plan kept was invisible on the page whose
content is mostly gates. The takeaway being hidden was the one this section
exists to protect. A checkpoint that is not a session is *both*: it takes the
tinted ground and the italic name from its form, and keeps its stripe.

Drop the hue from `planned`, `real` and `transfer` per §2.2. `terminal`'s
near-white is worth keeping or dropping on its own merits; it is one node per
document and the argument is weaker either way.

That takes the canvas from five unkeyed hues to one, which is the same move
f2e6349 made for tokens — seven hues with no legend became four registers
carried by shape and font family, 2761 pills to 265.

### 3.3 The panel is unchanged

It already names all nine kinds in `.ln-dg-kind` and pairs the name with the
accent. Nothing proposed here removes a distinction; it moves eight of the
nine from an unkeyed hue on the canvas to a word in the panel, which is where
the only copy of that word has always been.

---

## 4. What this does not propose

- **A legend for the diagram.** If three forms need one, they are the wrong
  three. That was the finding behind the four registers — *"a key for them
  would have been an apology"* — and it applies here unchanged.
- **A new field from atlas.** `code` is already there and already exact.
  Asking for an `openable` boolean would duplicate it.
- **Deriving meaning from a kind atlas has not sent.** A kind with no
  treatment must still render as a readable tile. That is the contract's own
  guarantee at §6 — *"a consumer that has not styled the kind still renders
  the words"* — and it is what makes the default safe rather than lossy.
- **Touching the session map's appearance more than the plan requires.** All
  24 of its tiles are sessions, so §3.1's new form draws nothing there. What
  it would lose is three hues, and what it gains is a canvas whose remaining
  colour means one thing.

---

## 5. What would settle it

Not an argument — these, measured before and after, both documents, all four
themes:

1. ~~**Tiles whose appearance collides with a tile of a different kind.**~~
   **Wrong as written, corrected 2026-09-10 by running it.** It scored B at 17
   of 17 colliding, worse than today's 9 — nonsense, because B deliberately
   merges nine kinds into three forms, so measuring by kind assumes the very
   thing A and C assert and B denies. A figure that can only rank one option
   is the conclusion wearing a number. It is two figures:

   - **Colliding by register** — tiles that cannot be told from one in another
     of the three groups §3.1 defines. Scored the same way for every variant,
     so it ranks all three. Today: **9 on the overview, 0 on the map.** Both
     C and B take it to 0.
   - **Colliding by kind** — the stricter test, that all nine be
     distinguishable at rest. It is the question being decided, so it is
     reported and not used to rank: today 9 on the overview, 0 on the map.
2. **Looks a reader must learn, with no legend.** Measured on the specimen,
   identical in all four themes: **A is 6 on the overview and 7 on the map;
   C is 4 and 7; D is 4 and 3; B is 3 and 3.**

3. **Colliding by path** — tiles that do not say whether they are on the route
   or beside it. **A is 9 on the overview**, C and B are 14, **D is 0.** The
   map is 0 in every variant, because it has no prerequisites on it at all —
   which is the subject of `SEND-ATLAS-3.md`, not a clean bill of health.

**And one figure here was overstated, corrected the same day.** §1 said 9 of
the overview's tiles are indistinguishable, on a signature of border,
background and font style. A session also renders its code under the name and
a non-session renders nothing, and counting that line the figure is **0, in
every variant including today's.** The code line is a real cue. Whether a
second line of small grey text reads as a *category* is the thing in dispute —
it is information, not a form, and a box shaped like a box you open, in a grid
of boxes you open, reads as one. The specimen reports it both ways so neither
version of the argument gets to pick its own number.
3. **Column width and figure scroll width.** Today 207px and 1272 on the
   overview, 260px and 2344 on the map. Neither may grow; the tinted ground
   in §3.1 is the risk.
4. **Contrast of every accent against its ground, in all four themes**, the
   way the named register was measured at 13.76 to 18.1 in f2e6349.

### 5.1 The specimen

`tools/specimen-kinds.mjs` writes `build/specimen-kinds.html` — the two real
figures, three times each, differing by CSS alone, with the figures above
computed live in whichever of the four themes is on. It lifts the markup and
the whole stylesheet out of the built pages, so **variant A is the live site
byte for byte** and no mock-up is being judged. `build/` is git-ignored and
skipped by `check-publishable`, so this is a decision aid and never a page.

It has already earned itself twice: it caught the hidden accent in §3.2 and
the bad metric in §5.1 above, both within a minute of first running, and
neither was visible from reading the plan.

**The third variant, C, is the conservative option and is not a straw man.**
It adds the missing form and changes no hue, so it fixes finding 2.1's
collision and declines 2.2 and 2.3. On the session map it is *identical to
today* — 7 looks, 0 collisions — which is the honest case for it: the map is
all sessions, so the only page C leaves untouched is the one this whole plan
was written about.

`MEASURED` gained 26 diagram rows today and `diagrams.kinds` is one of them,
so a tenth kind arriving from atlas will show up in a diff rather than in a
grey tile nobody notices. Figures 1 and 2 are now measured in the specimen but
**not in `measure.mjs`**, and they belong there whether or not this plan is
taken: `colliding by register` is a defect count that nothing watches, and it
is 9 today.

---

## 6. Owed to atlas, and not blocking

`guide-json.md` §7 enumerates the kinds as *"`step`, `gate`, `planned`,
`transfer`, `real`, `terminal`, `read`"* — seven. Its own changelog line at
§1 says contract 7 *"adds the `decision` and `outcome` kinds"*, and both are
in the emitted data. **The enumeration is stale by two.** It is the sentence
a renderer reads to learn what it must handle, which is exactly how this
project came to have no treatment for either.
