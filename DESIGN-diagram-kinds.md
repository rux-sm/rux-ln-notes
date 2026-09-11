# The diagram's kind vocabulary

A design plan, not a decision. It says what the nine node kinds should look
like on a canvas and why, and it is written to be argued with. Every figure
in it was measured on the rendered page or derived from the synced data at
`data/guides/PIN`; nothing here is counted by hand.

The question it answers is **not** the one it started as. It began as "two
kinds have no accent rule, what colour should they be", and the measurements
say that is the wrong question.

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

1. **Tiles whose appearance collides with a tile of a different kind.** Today
   9 on the overview, 0 on the map. The plan's target is 0 on both.
2. **Distinct appearances a reader must learn.** Today 5 hues + 1 dashed +
   1 default, unkeyed. The plan's target is 3 forms + 1 hue.
3. **Column width and figure scroll width.** Today 207px and 1272 on the
   overview, 260px and 2344 on the map. Neither may grow; the tinted ground
   in §3.1 is the risk.
4. **Contrast of every accent against its ground, in all four themes**, the
   way the named register was measured at 13.76 to 18.1 in f2e6349.

`MEASURED` gained 26 diagram rows today and `diagrams.kinds` is one of them,
so a tenth kind arriving from atlas will show up in a diff rather than in a
grey tile nobody notices. **None of the four figures above is measured yet**,
and 1 and 2 should be added to `measure.mjs` whether or not this plan is
taken — they describe the renderer, and today's state is the argument for it.

---

## 6. Owed to atlas, and not blocking

`guide-json.md` §7 enumerates the kinds as *"`step`, `gate`, `planned`,
`transfer`, `real`, `terminal`, `read`"* — seven. Its own changelog line at
§1 says contract 7 *"adds the `decision` and `outcome` kinds"*, and both are
in the emitted data. **The enumeration is stale by two.** It is the sentence
a renderer reads to learn what it must handle, which is exactly how this
project came to have no treatment for either.
