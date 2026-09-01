# CLAUDE.md — context routing

Routing, not prose. This loads into every session, so nothing here is repeated
from `README.md` — follow the pointer instead.

**Read first:** `README.md`. Its "Undecided" section is what has *not* been
chosen, and choosing one of those quietly is the failure mode to avoid.

## The one rule

**This repository is PRIVATE and its content never reaches `rux-ds`, which is
PUBLIC.** No guide text, session code, route, screenshot or client value goes
into a commit there, a template there, or an issue there. When something needs to
exist in the design system, it is authored with **invented, generic** content.

## Two upstreams, both pulled by hand

| | |
|---|---|
| `data/guides/` | from `rux-ln-atlas` via `sh tools/sync-guides.sh` — **export tier, never `--internal`** |
| `vendor/rux-ds/` | from `rux-ds` via `sh tools/sync-ds.sh` |

Both are **tracked on purpose** so `git diff` after a sync shows what moved
upstream. Both carry a `PIN` naming the source commit. **Neither is ever
hand-edited** — the next sync overwrites it and the fix belongs upstream.

## What MUST NOT be invented

- **The marker contract.** Cells arrive as typed tokens, already parsed.
  `../rux-ln-atlas/_standards/guide-json.md` is normative. Re-implementing any
  part of it here re-creates the drift that broke a renderer once already.
- **Carbon classes.** Every `rux--*` comes from the vendored design system. If a
  class is needed that rux-ds does not compile, that is a conversation with
  rux-ds, not a hand-written rule here.
- **Decisions in README's "Undecided".** Scaffolding deliberately did not settle
  build-time vs runtime, token styling, or draft publishability. Ask.

## Commits

Same as the family: `type(scope): Subject`, capitalised, imperative, subject ≤50
chars, body wrapped at 72 **bytes** (an em-dash costs 3). No AI attribution of
any kind.
