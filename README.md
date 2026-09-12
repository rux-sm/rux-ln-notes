# rux-ln-notes

**The public site for Infor LN scenario guides, meeting reviews and practice
exercises**, at [rux-sm.github.io/rux-ln-notes](https://rux-sm.github.io/rux-ln-notes/).
It renders; it does not author. `AGENTS.md` is the policy. This file says
what is published, where it comes from, how to preview it, how it deploys,
and what must never be edited by hand.

## What it publishes

Scenario guides, meeting reviews with their summaries, and practice
exercises, each a generated page under `guides/` with `index.html` as the
front. Every page ends with the atlas revision it was built from. A draft
guide is labelled on the page, never withheld. Nothing here is written by
hand: markup lives in `tools/build.mjs`, content arrives as data.

An exercise page is a worksheet: the answer spaces atlas marked are text
areas, a box column is a tick per row, the pass condition is a box, and a
question with a key can reveal it once something has been written. What a
learner types stays in their own browser, and the rail exports it as
Markdown for the report-back. `js/exercise.js` is the whole of that.

## Where it comes from

One upstream pulled by a script and pinned; one read live, no copy here:

| | from | by | pin |
|---|---|---|---|
| `data/guides/` | `rux-ln-atlas`, **private**, export tier only | `sh tools/sync-guides.sh` | `data/guides/PIN` — atlas commit, contract, and a sha256 of the bytes |
| `/rux-ds/…` | `rux-ds`, public, live | nothing to run; every page links it | none — whatever is live, checked against its newest release tag in CI |

Since 2026-09-10 (rux-ds roadmap §8.4 step 5) this project vendors no copy of
rux-ds; `../rux-ds` cloned beside this repository (or `DS=<dir>`) is required
to build, check or serve it locally.

Atlas holds the knowledge — evidence, session help, screenshots of a licensed
environment — and none of it comes across. `emit.py` there writes the export
tier and refuses to write anything if a name, an issue id or an evidence path
survives; `tools/check-data.mjs` here refuses a `data/guides/` whose bytes do
not match the hash the sync recorded. The data contract is atlas's
`_standards/guide-json.md`, and `_standards/renderer-brief.md` §5 lists what
bites when rendering it; both are read, never re-implemented.

The internal tier, with gaps, issue ids and the concept pages, renders only
into the git-ignored `build/` by `sh tools/sync-internal.sh`, and is never
published.

## Preview locally

**Start here. This is the everyday loop**, and it reads atlas's working tree
rather than a commit — edit a Markdown file there, re-run, see it. It writes
only into the git-ignored `build/`, so nothing tracked moves and nothing is
published:

```sh
sh tools/sync-internal.sh        # the private viewer, into build/ (never published)
(cd build/internal/site && PORT=8644 node ../../../../rux-ds/tools/serve.mjs)
```

**Four levels up, and it is rux-ds's server, not this project's.**
`tools/serve.mjs` below force-appends `--workspace` and serves the whole
family; rux-ds's own server in plain mode takes its working directory as the
root, which is what makes the `rux-ds` symlink inside the private site
resolve. **Stop the server before re-syncing** — `sync-internal.sh` opens with
`rm -rf` on that directory and the server captures its root once, so a re-sync
underneath a running one 404s everything with nothing in any log to say why.

**The public preview is the other one**, and it needs a committed, pushed
atlas because `sync-guides.sh` writes a `PIN` that another machine has to be
able to reproduce:

```sh
sh tools/sync-guides.sh          # pull the export tier from ../rux-ln-atlas
node tools/build.mjs             # write index.html and guides/ from data/guides/
node tools/serve.mjs             # rux-ds's workspace server on :8640, this app at /rux-ln-notes/
node tools/check.mjs             # every gate, in order; what the commit hook runs
```

Once per clone: `git config core.hooksPath tools/githooks`, and the sibling
checkouts beside this one — `../rux-ln-atlas` for the names list that
`check-publishable` reads, `../rux-ds` for `check-ancestry`. Atlas's `SETUP.md`
covers its own once-per-machine steps.

## How it deploys

```sh
node tools/publish.mjs --dry-run    # what would move and what blocks it; writes nothing tracked
node tools/publish.mjs --prepare    # sync, build, check, report; commits nothing
node tools/publish.mjs --publish    # commit through both hooks, push, watch Pages to its end
```

A push to `main` is a publication. `.github/workflows/pages.yml` rebuilds the
pages, refuses a push whose committed pages differ from what `data/guides/`
produces, runs `node tools/check.mjs`, and deploys only if every gate passes;
a failed run leaves the previous deployment live. CI cannot read atlas, so
the names class of `check-publishable` runs only in the commit hook on a
machine with the sibling checkout, and `pages.yml` says so in its header.

`MEASURED` is the one place this repository's counts about itself live. The
commit hook regenerates it; `node tools/measure.mjs --check` says whether it
has moved.

## Never edited by hand

`data/guides/`, `guides/`, `index.html` and `MEASURED` are all generated. The
next sync or build overwrites them, and the real fix belongs upstream — in
atlas for content, in rux-ds for a component, in `tools/build.mjs` for
markup. `rux-theme.css` and `rux-overrides.css` at the root are this
project's own override hooks, linked after rux-ds's own and empty by design;
a rule goes there only when this project, not rux-ds, has to change
something.

## Where the rest went

What is outstanding is `docs/status.md`. The decisions that bind — build-time
rendering with committed output, drafts labelled, reviews at export tier,
what never publishes — are in `AGENTS.md`. The long record of how each was
reached, with its measurements, is in this file's history: `git show
55c22fb:README.md` is the last version that carried it.
