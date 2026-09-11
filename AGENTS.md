# AGENTS.md — the policy

This is the one instruction file. `CLAUDE.md` imports it, Codex reads it
directly, and nothing here is repeated anywhere else. `README.md` says what
is published, where it comes from, how to preview and deploy it, and what is
never hand-edited; `TODO.md` is what is outstanding.

## What this repository is

**Public.** It is served as-is from `main` at rux-sm.github.io/rux-ln-notes,
so a bare `git push` is a publication. It renders Infor LN scenario guides,
meeting reviews and practice exercises:
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

## One upstream pulled by a script, one read live

| | from | by |
|---|---|---|
| `data/guides/` | `rux-ln-atlas`, export tier only — guides, reviews, summaries and exercises | `sh tools/sync-guides.sh` |
| `/rux-ds/…` | `rux-ds`, live — no copy here | nothing to run; every page links it directly |

`data/guides/` is tracked so `git diff` after a sync shows what moved
upstream; it carries a `PIN` and is never hand-edited — the next sync
overwrites it and the fix belongs upstream. Since 2026-09-10 (rux-ds roadmap
§8.4 step 5) this project vendors no copy of rux-ds: pages link `/rux-ds/…`
on the shared account-root origin, and what is live there is rux-ds's newest
release tag. `rux-ds` cloned beside this repository is required to check,
build or serve it locally.

## What is authored here, and what is not
**The shared part of this is one document, not three.** `rux-ds/docs/consumer-policy.md`
is what every project on rux-ds agrees to — how it is linked rather than
vendored, what is yours and what is rux-ds's, where a colour and a component
rule go, the one check, and how to serve the family locally. Read it first;
what follows is only what is this repository's own. Added 2026-09-11.


- **Markup lives in `tools/build.mjs` and nowhere else.** Every page is
  generated from it; editing a generated page is the same mistake as editing
  `data/`. `template-candidate.html` is the single hand-written page.
- **Behaviour that is this project's own lives in `js/`, one file per page
  kind that needs it** — `js/exercise.js` for the worksheet — linked only by
  the pages that use it. It reads the data attributes `build.mjs` wrote and
  nothing else, never the marker contract; and a page with the script gone is
  still the whole document. What a learner types stays in their browser: no
  server, no account, and the page says so beside the notepad.
- **Every `rux--*` class comes from rux-ds's `css/rux.css`,** read from the
  checkout beside this repository (or `DS=<dir>`). A class the design system
  does not compile is a request to `rux-ds` with invented content, never a
  local rule. `check-classes` catches the invented one.
- **This project's page shell is its own, and `templates/document-page.html`
  is a reference, not a parent. Decided 2026-09-10, measured not argued.**
  rux-ds built that template on 2026-09-08 in answer to `SEND-DS.md`, and the
  open question was whether `build.mjs` should derive its shell from it and
  record the commit. It should not, for three reasons.

  **Adopting it would re-import what this repository removed on evidence the
  same week.** Of the 32 classes the template carries and these pages do not,
  six are `rux--tag--blue`, `--cool-gray`, `--purple`, `--red` and the four
  `rux--breadcrumb*` — the seven-colour token scheme replaced by four
  registers, and the route-as-breadcrumb built and reverted on three findings.
  A shell that pulls those back in is not a parent worth having.

  **The mechanism the adoption was designed around no longer exists.**
  `SEND-DS.md` §6 proposed recording the derivation the way `vendor/rux-ds/PIN`
  recorded the stylesheet's commit. There is no `vendor/` and no rux-ds pin —
  since 2026-09-10 rux-ds is read live. A recorded derivation commit would be
  a number nothing checks and nothing updates, which is precisely the kind of
  line this repository has been wrong about four times.

  **The overlap is already high and the remainder is content-kind, not shell.**
  70 classes are shared. The 27 these pages have and the template does not are
  what a guide has and a generic document does not: the notepad, the step-table
  container, the registers. The template's extras are largely its own demo
  content. The one thing it had that these pages lacked — a reading measure
  capped rather than spanned — was taken on its merits and is in `build.mjs`.

  **What is taken from it is the habit, not the markup**: rule by measuring the
  rendered thing. That is what produced the breadcrumb ruling, the correction
  to it, and the reading-measure cap.

- **The marker contract is Atlas's.** `../rux-ln-atlas/_standards/guide-json.md`
  is normative; re-implementing any part of it here re-creates the drift that
  broke a renderer once already.
- **Five decisions stay decided, and are not reopened by scaffolding an
  alternative.** Settled 2026-08-31 to 2026-09-01; the record of how, with
  its measurements, is `git show 55c22fb:README.md`.
  - *Build-time rendering, output committed.* `build.mjs` writes the pages
    and they are tracked, because pages in an ignored directory are invisible
    to the gates and to the commit hook, which is the only place the names
    class can run.
  - *Every guide publishes, drafts included.* A draft is labelled on the
    page, never withheld; `status` arrives as data.
  - *Reviews and summaries publish at the same export tier as guides.* No
    tier relaxes the name sweep; the reviews name roles, not people.
  - *An `image` names only a file authored beside the guide.* **Retired
    2026-09-09**, not reopened: atlas removed the token at contract 7 and both
    diagrams are `diagram` blocks now, so no file travels beside a document.
    A citation of a frame still renders as a plain unlinked name.
  - *The knowledge base does not publish.* `sessions/`, `config/`, `tests/`,
    `build/` and `evidence/` stay in atlas at every tier.

## The one check

    node tools/check.mjs

Runs every gate `tools/check.mjs` lists. **First it rebuilds** — `node
tools/build.mjs`, then a diff against `guides/` and `index.html`, failing if
rebuilding changed anything committed; this is the same check `pages.yml` runs
before it deploys, so a stale build is caught here before a push rather than
only after. **Then rux-ds's own shared check** (`tools/check-app.mjs`), read
from the checkout beside this repository or `DS=<dir>` — locally the sibling
on `main`, in CI the checkout at rux-ds's newest tag: classes, tokens, file
references and id references, over every page. Then this project's own:
classes, structure, links, order, ancestry (needs a `rux-ds` checkout beside
this one), data and publishable.

**The rebuild gate was added 2026-09-09, after moving the pin to `v0.1.12`
committed stale pages that only `pages.yml` caught, on push.** `build.mjs`
inlines rux-ds's whole icon sprite into every page, and two icons had joined
it since this project last built; the shared check could not see it, because
it only verifies a page's inlined icons are somewhere in what rux-ds ships,
never that the sprite is current. Neither `roll-out.sh` nor the sync recipe
that used to move `vendor/rux-ds/` said to rebuild first. Both gaps are the
same fix: the rebuild is now inside the one check itself, so nothing that
calls `node tools/check.mjs` — a person, `roll-out.sh`, the commit hook —
can skip it.

**The shared check was wired up on 2026-09-09, and it should have been from the
start.** None of the seven gates below it reads a TOKEN, so
`var(--rux-font-mono)` — a name rux-ds has never declared — shipped in 28
generated pages with every gate green. It rendered correctly throughout,
because every use carried a fallback, which is why nothing noticed. It was
found from outside, by running rux-ds's implementation from a rux-ds clone. The
commit hook runs the privacy gate on the staged bytes and then this. `MEASURED` staleness is
reported, not enforced; re-run `node tools/measure.mjs` when it says so.

## Publishing

    node tools/publish.mjs --dry-run    # what would move and what blocks it; writes nothing tracked
    node tools/publish.mjs --prepare    # sync, build, check, report; commits nothing
    node tools/publish.mjs --publish    # commit through both hooks, push, watch Pages to its end

The one route from an atlas commit to the live site, and it lives here
because this side pulls and atlas never pushes. It fetches both remotes and
refuses either repository that is behind or ahead of `origin/main` or carries
uncommitted tracked changes; then it is `sync-guides.sh`, `build.mjs` and
`check.mjs` in that order, a commit made through the hooks and never around
them, a push, and `gh run watch` on the Pages run for that commit. It adds no
gate and runs every one that exists. A dry run collects every blocker and still
prints the document diff, emitted to a temporary directory, so one run says
everything in the way. An atlas commit with no public effect publishes nothing.

A publish is an intent. Nothing here, and nothing in atlas, runs this on its
own; "commit and push" in atlas moves nothing here.

## Commits

`type(scope): Subject`, capitalised, imperative, subject ≤50 chars, body
wrapped at 72 bytes, authored by rux alone with no AI attribution. The
`commit-msg` hook in `tools/githooks/` refuses anything else. Arm both hooks
once per clone: `git config core.hooksPath tools/githooks`.
