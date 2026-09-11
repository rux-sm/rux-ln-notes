# Send-back to rux-ds: `border-strong-01` does not keep 3:1 in the four brand themes

**Sent 2026-09-11**, the way everything in this family is sent: read in place,
never copied across. Nothing here names this project's domain, and nothing
needs to — **every figure below was taken on your own `kitchen-sink.html`**,
in your own workspace server, with this repository closed. It reproduces from
your checkout alone.

One finding, one question, no ask for a class or a token.

## §1 The finding

`tools/build-theme-creator.mjs` decides what an `edge` badge judges, and says
why, in the comment at lines 158-169:

> `border-strong` is the opposite case and keeps the 3:1: Carbon meets it in
> every theme, from 3.02 in g10 to 8.86 in g90.

That sentence is true and its scope is Carbon. The four themes in
`css/rux-theme.css` are not Carbon's, and for `--rux-border-strong-01` the
claim does not hold in any of them.

Measured on `kitchen-sink.html`, resolved values off `documentElement` with
`data-theme` set to each of the eight, against `--rux-background` — the
baseline `CHECK_LABEL.edge` names, *"this outline against the page background,
3:1 (WCAG non-text)"*:

| theme | `border-strong-01` | `background` | ratio | 3:1 |
| :--- | :--- | :--- | ---: | :--- |
| white | `#8d8d8d` | `#ffffff` | 3.3175 | ✓ |
| g10 | `#8d8d8d` | `#f4f4f4` | 3.0177 | ✓, by 0.018 |
| g90 | `#8d8d8d` | `#262626` | 4.5566 | ✓ |
| g100 | `#6f6f6f` | `#161616` | 3.5999 | ✓ |
| geist | `#525252` | `#000000` | 2.6875 | ✗ |
| linear | `#4a4a58` | `#0f0f12` | 2.1976 | ✗ |
| ant-dark | `#595959` | `#000000` | **2.9980** | ✗, and this is the one to look at |
| spotify | `#535353` | `#121212` | 2.4354 | ✗ |

**The four compiled bases pass and the four override blocks all fail.**

**`ant-dark` is the row worth a second look, and it is why this table carries
four decimals.** It reads 2.997975. A readout printing two decimals shows it as
`3.00` — the threshold value — for a colour that is below the threshold. Short
of the fix, that cell would report a pass. The margin is 0.002, so it is a
display question rather than a design one, but it is the kind that survives a
review because the number on the screen looks correct. `g10` is the mirror
case and passes for real, by 0.018.

**Your own range checks out, which is why this is sent as a scope question
rather than a correction.** "3.02 in g10 to 8.86 in g90" is `-01` in g10 at the
bottom and `-03` in g90 at the top: measured here, 3.0177 and 8.8600. The method
agrees with yours to the hundredth on your own numbers before it disagrees with
the sentence they support.

**And the failure is `-01`'s, not the whole rung set's.** Across the four
override blocks, twelve theme-and-rung combinations, five sit below 3:1 —
`geist-01` 2.6875, `linear-01` 2.1976, `linear-02` 2.8699, `ant-dark-01`
2.9980, `spotify-01` 2.4354. Every `-03` passes, and `-02` passes everywhere
but `linear`. So this is not a palette that is uniformly too dark; it is the
first rung specifically, in the themes where the page background is at or near
black.

Against `--rux-layer-01` instead of the page background, all four brand themes
are lower still — 2.53, 2.11, 2.63, 2.31 — and `g100` slips to 3.01. That is
not the baseline your badge uses; it is here only because a card on a layer is
the common case, and it is the reading that made this worth sending.

## §2 What this is not

**Not a bug report against the readout.** The badge is right about what it
measures. What may be stale is the reasoning recorded next to it, which
justifies *not* judging `border-strong` on evidence drawn only from Carbon's
compiled bases — and `css/rux-theme.css` did not exist under that evidence.

**Not an accessibility failure this side has hit.** These are container
borders. Every text value inside the boxes this was noticed on measures 10.5 to
18.4 against the same surface, so no information is carried by a border alone.

**Not a request to change a value.** These are brand palettes with their own
outside reference; `linear`'s `#4a4a58` at 2.1976 is presumably the colour that
theme is *supposed* to have. Moving it might be the wrong fix and
this side is not the one to judge that.

## §3 The question

**Does `--rux-border-strong-01` intend to be a ≥3:1 non-text boundary in every
theme rux-ds ships, or only in the four it compiles?**

Both answers are defensible and they lead to different places:

- **Every theme it ships.** Then all four override blocks carry a value that
  does not meet the token's own contract, and the useful next step is yours:
  either the values move, or the themes are documented as not meeting it.
- **Only the compiled four.** Then the comment wants one clause saying so,
  because as written it reads as a property of the token rather than of
  Carbon's bases — which is exactly how it was read here.

## §4 What this side did with it

Recorded as a known loss in `TODO.md` and nothing more. **No local override was
written**: this project's `rux-theme.css` is empty of token values by policy,
and a border contrast fix belongs in the design system or nowhere.

**One thing neither repository has**, stated because it is the reason this took
a person looking rather than a check failing: nothing in either project
measures border contrast. A future theme could land below `linear`'s 2.1976 and
no gate on either side would say a word.

## §5 How this was measured, so it can be rejected properly

Eight passes over one page, `data-theme` set on `documentElement` between them,
reading `getComputedStyle(root).getPropertyValue(…)` for
`--rux-border-strong-01`, `--rux-border-subtle-01`, `--rux-background` and
`--rux-layer-01`, then WCAG 2.x relative luminance and the
`(L1+0.05)/(L2+0.05)` ratio, **not rounded until the table above** — see the
`ant-dark` row for why. sRGB only, no alpha anywhere in the values read, no
`color-mix`, and no page of this project's involved in the numbers above.

The same eight passes were run first on a page of this project's and gave the
same figures to the hundredth, which is why the kitchen-sink run is the one
quoted: if the two had disagreed, the disagreement would have been the finding.
