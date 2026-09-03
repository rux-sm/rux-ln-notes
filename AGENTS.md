# AGENTS.md — the policy

This is the one instruction file. `CLAUDE.md` imports it, Codex reads it
directly, and nothing here is repeated anywhere else. `README.md` is the
long version: what was decided, what is outstanding, how each tool works.

## What this repository is

**Public.** It is served as-is from `main` at rux-sm.github.io/rux-ln-notes,
so a bare `git push` is a publication. It renders Infor LN scenario guides:
procedure data comes from `rux-ln-atlas` (private), presentation from `rux-ds`
(public). Atlas processes knowledge, `rux-ds` owns components, this renders.
It does neither of the other two.

The retired archive is `rux-sm/rux-ln-guides`, private on GitHub. Its forty
commits name people and vendor documents; nothing is pushed there any more,
and it is not a place to put something that does not belong on `origin`. A
clone may carry it as a remote; a fresh clone does not, and nothing needs it.

## The one rule

**Nothing on a page may identify a person, an environment, a client, or a
vendor document.** `node tools/check-publishable.mjs` decides, with no
exemption and no filename list, over every `.html` and `.md` in the tree.
`MEASURED` must read `publishable.pages-flagged = 0`. The fix for a hit is
upstream in Atlas: author it out, never filter it here. **A clean run is not
a clearance**: it matches verbatim strings and Atlas's own name list, and
cannot tell whether a paraphrase of Infor's documentation is still too close.
That part is a person's reading.

**Where that rule is held, and where it is not, decided 2026-09-02.** On the
sync route it is held in atlas: `emit.py` sweeps every document it writes and
writes nothing if a name survives, and `tools/check-data.mjs` refuses a
`data/guides/` that does not match the hash `sync-guides.sh` recorded, so data
that did not come through atlas fails in the hook, in the one check and in CI.
On every other route it is held by the commit hook alone, on a machine with the
atlas checkout beside this one: a hand-written page or Markdown file, or a
generator that injects text. CI cannot read the names and does not try. **The
accepted case** is a name introduced by hand on one of those routes AND a
commit made with the hook bypassed or never armed; both are the one
maintainer's own acts, and a push is public before any check after it could
run, so a CI check would prevent a deployment, not a disclosure.

**`rux-ds` is public too, and its rule is scope, not secrecy.** It is a generic
design system with its own consumers, so nothing from this domain goes into a
commit, template or issue there. Anything it needs is authored with invented,
generic content.

## Two upstreams, pulled by scripts and never by hand

| | from | by |
|---|---|---|
| `data/guides/` | `rux-ln-atlas`, export tier only | `sh tools/sync-guides.sh` |
| `vendor/rux-ds/` | `rux-ds`, pinned to one tag | `sh tools/new-project.sh ~/Developer/rux-ln-notes`, run from a rux-ds clone at a tag |

Both are tracked so `git diff` after a sync shows what moved upstream. Both
carry a `PIN`. Neither is ever hand-edited; the next sync overwrites it and
the fix belongs upstream.

## What is authored here, and what is not

- **Markup lives in `tools/build.mjs` and nowhere else.** Every page is
  generated from it; editing a generated page is the same mistake as editing
  `data/`. `template-candidate.html` is the single hand-written page.
- **Every `rux--*` class comes from `vendor/rux-ds/`.** A class the design
  system does not compile is a request to `rux-ds` with invented content,
  never a local rule. `check-classes` catches the invented one.
- **The marker contract is Atlas's.** `../rux-ln-atlas/_standards/guide-json.md`
  is normative; re-implementing any part of it here re-creates the drift that
  broke a renderer once already.
- **Decisions in README "Decided" stay decided.** Build-time rendering,
  token styling and publishability were settled on 2026-08-31; do not reopen
  them by scaffolding an alternative.

## The one check

    node tools/check.mjs

Runs every gate `tools/check.mjs` lists: classes, structure, links, order,
ancestry (needs a `rux-ds` checkout beside this one) and publishable. The
commit hook runs the privacy gate on the staged bytes and then this. `MEASURED` staleness is
reported, not enforced; re-run `node tools/measure.mjs` when it says so.

## Commits

`type(scope): Subject`, capitalised, imperative, subject ≤50 chars, body
wrapped at 72 bytes, authored by rux alone with no AI attribution. The
`commit-msg` hook in `tools/githooks/` refuses anything else. Arm both hooks
once per clone: `git config core.hooksPath tools/githooks`.
