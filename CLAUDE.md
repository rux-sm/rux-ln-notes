# CLAUDE.md — context routing

Routing, not prose. This loads into every session, so nothing here is repeated
from `README.md` — follow the pointer instead.

**Read first:** `README.md`. Its "Undecided" section is what has *not* been
chosen, and choosing one of those quietly is the failure mode to avoid.
`TODO.md` is what is outstanding, and it separates the rows `MEASURED` watches
from the prose that can rot.

## The one rule

**This repository is PUBLIC.** Everything committed here is on the open
internet from the moment it is pushed. This file said PRIVATE until
2026-09-01, when `d2fe868` made `origin` the public site — the sentence
outlived the decision it described, which is the most expensive way for a rule
to fail.

**One working tree, two destinations, and the default is the public one.**
`origin` is `rux-ln-notes` and `main` tracks it, so a bare `git push`
publishes. `private` is the `rux-ln-guides` archive, kept because its forty
commits name six people, one person's employment background and the vendor
documents the library holds — never made public, and a force-push would have
left them reachable by hash. Nothing is pushed there any more; do not revive
it as a place to put something that does not belong on `origin`.

**The private material lives in `rux-ln-atlas`** — evidence, screenshots,
recordings, gap markers, issue ids, deployment values, anything paraphrasing
Infor's documentation closely. It reaches here only through `emit.py`'s
**export tier**. `--internal` output never crosses and `tools/sync-guides.sh`
must not grow a flag that lets it. Check: `check-publishable`, which reads
`.md` as well as pages and refuses the commit from `tools/githooks/pre-commit`.

**A clean run is not a clearance.** It counts verbatim quotation and matches
atlas's own `PEOPLE` list, so it cannot tell whether a paraphrase of Infor's
documentation is still too close to it, nor catch a name spelled a way that
list does not. Those are a person's reading. Run it; do not assume it.

**`rux-ds` is public too, and the rule there is different in kind** — scope,
not secrecy. It is a generic design system with its own consumers, so nothing
about this domain belongs in it: no guide text, session code, route or client
value in a commit, a template or an issue there. When something needs to exist
in the design system, it is authored with **invented, generic** content.

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
