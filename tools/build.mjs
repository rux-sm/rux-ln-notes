#!/usr/bin/env node
//
// Generate every page in this project from `data/guides/*.json`.
//
// WHY BUILD-TIME, DECIDED 2026-08-31. README's "Undecided" carried this as an
// open question and `renderer-brief.md` §4 argued build-time, then retracted
// both of its arguments as rux-ds-specific: the 90 KB budget was rux-ds's own,
// and the gates it named "do not run on the consuming project unless it
// deliberately adopts them". That retraction was written when this project had
// no gates. It has since adopted three, and that is what settles it.
//
// `check-classes.mjs` and `check-structure.mjs` read the HTML as TEXT. A
// runtime renderer commits a shell whose `main` is empty, so both would find a
// handful of resolving shell classes and exit 0 -- green because there was
// nothing in the file to look at. That is `smoke.html`'s failure with a
// different cause, and guides are expected to change often, so it is a dice
// roll taken weekly rather than once.
//
// Two smaller reasons, both concrete:
//   * A malformed guide throws HERE, before the commit, with a stack trace --
//     rather than in a reader's browser, on one guide out of thirty.
//   * A runtime fetch of data/guides/*.json is blocked over file://, silently,
//     which is the exact failure `inline-sprite.mjs` exists to prevent. The way
//     out is inlining the JSON, which is build-time wearing a different hat.
//
// THE OUTPUT IS COMMITTED, and that is half the decision rather than a detail.
// Written to a gitignored `build/` the pages would be invisible to the gates
// and to the pre-commit hook, which puts the vacuous-green problem back by
// another route. Committing generated output is also what this repository
// already does deliberately with `data/` and `vendor/`, and what rux-ds does
// with `css/rux.css`.
//
//   node tools/build.mjs
//
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// THE PUBLIC BUILD READS data/guides/ AND WRITES guides/, AND NOTHING ELSE
// MAY. The two overrides exist for one caller: tools/sync-internal.sh, which
// renders atlas's INTERNAL tier -- gaps, stamps, issue ids, the notes under
// every phase, the concept pages that have no published tier -- into the
// git-ignored build/ directory for a viewer only its author uses. With neither
// variable set every path below is what it always was, and the public pages
// come out byte-identical; `git status` after a build is the proof.
const PRIVATE = Boolean(process.env.LN_DATA || process.env.LN_OUT);
const DATA = process.env.LN_DATA ? resolve(process.env.LN_DATA) : join(ROOT, 'data/guides');
const OUT_DIR = process.env.LN_OUT ? resolve(process.env.LN_OUT) : join(ROOT, 'guides');
const INDEX = PRIVATE ? join(OUT_DIR, '..', 'index.html') : join(ROOT, 'index.html');

// ---------------------------------------------------------------- escaping

// EVERY STRING FROM THE DATA GOES THROUGH THIS. The guides are prose written by
// people and contain `&`, `<` and quotes; one unescaped `&` is an invalid
// entity and one unescaped `<` swallows the rest of a cell. Neither shows up as
// a broken page -- text simply goes missing, which no gate here can see.
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ---------------------------------------------------------------- tokens

// THE PAYLOAD KEY IS NOT ALWAYS `v`, AND THIS TABLE IS THE WHOLE REASON THIS
// FILE HAS ONE. README's bite 3: a renderer reaching for `token.v` uniformly
// blanks 212 of 4,405 tokens -- about 5% -- WITHOUT ERRORING, because `text` is
// 2,905 of them and reads correctly throughout, so a spot check passes. Five
// types keep their text elsewhere and `pencil` has none at all.
//
// Measured against all seven guides on 2026-08-31, which is what these counts
// are: session/code 117, button/label 50, command/route 39, path/route 5,
// image/alt+src 1, link/v+href 9, pencil none 134.
const PAYLOAD = {
  session: 'code', button: 'label', command: 'route', path: 'route',
};

// Filled before any rendering happens; the `link` case below needs to know
// which ids are real so it can tell a cross-reference from a dead one.
const GUIDE_IDS = new Set();

// THE TAG COLOURS ARE README's "Decided", NOT A CHOICE MADE HERE. Seven of the
// nine "named thing in the LN UI" types map onto compiled Carbon tag variants
// with no `guide-*` namespace invented. 117 tags did not widen the page.
const TAG = {
  chip: 'blue', session: 'cyan', field: 'cool-gray', literal: 'gray',
  value: 'warm-gray', status: 'teal', button: 'purple',
};

// `command` AND `path` ARE DELIBERATELY NOT TAGS, and this is not an oversight
// to fix in passing. `.rux--tag` caps at 13rem and `.rux--tag__label`
// ellipsises, so a menu route measured 324px against a 192px label and was
// silently cut -- and a route is the single thing a reader most needs whole.
// They are plain text, which loses the visual distinction the other seven have.
//
// SEND-DS.md §2 is the open question, and it is still unsent. Carbon's own
// answer is `.rux--tag-label-tooltip`; until that is decided this stays as
// README recorded it, rather than being reopened here.
const PLAIN = new Set(['command', 'path']);

function token(t) {
  const key = PAYLOAD[t.t] ?? 'v';
  const raw = t[key];

  switch (t.t) {
    case 'text': return esc(raw);
    case 'strong': return `<strong>${esc(raw)}</strong>`;
    case 'em': return `<em>${esc(raw)}</em>`;

    // A PENCIL CARRIES NO TEXT AND MUST NOT BE DROPPED. The contract calls it
    // "the step yields a value worth writing down"; 127 of them exist. An early
    // filter on the producing side tested only `v` and `label`, read every
    // token that keys its text differently as empty, and silently deleted 33
    // menu commands and 242 session codes with the sweep still green.
    // Rendered as a glyph with a real accessible name, never as nothing.
    case 'pencil':
      // THE LABEL IS THE TOKEN'S WHOLE MEANING, so it moved when the meaning
      // did. It read "produces a run record value" and named a section that no
      // longer exists -- a screen reader would have been sent looking for it.
      // The mark now says the step yields something worth writing down, which
      // is what a reader keeping their own notes needs from it.
      return `<svg class="ln-pencil" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" role="img" aria-label="worth noting down"><use href="#i-edit"/></svg>`;

    // A LINK BETWEEN GUIDES ARRIVES AS A `.md` FILENAME, because that is what
    // the guide is called in atlas. Nine of them exist across these seven and
    // every one names a guide rendered here. Emitted verbatim they are nine
    // dead links — and a dead link looks exactly like a live one, so nothing
    // on the page or in the gates would have said so. A link checker found
    // them; `check-classes` and `check-structure` cannot see an href at all.
    //
    // The rewrite is narrow: `<id>.md` where `<id>` is a guide we are
    // generating. Anything else is left alone, and a `.md` naming a guide that
    // does NOT exist stops the build rather than shipping a 404.
    case 'link': {
      let href = t.href;
      const md = /^(.+)\.md$/.exec(href);
      if (md) {
        if (!GUIDE_IDS.has(md[1])) {
          // INTERNAL TIER: a guide may point at a session file, a test sheet
          // or a concept. Whatever is rendered in this build is linkable;
          // anything else keeps its words and loses its href, because a page
          // only its author reads should not stop over a file the site was
          // never going to carry.
          if (PRIVATE) return `<span class="ln-unlinked">${esc(t.v)}</span>`;
          throw new Error(`link to "${href}" names no guide in data/guides/`);
        }
        href = `${md[1]}.html`;
      }
      return `<a class="rux--link" href="${esc(href)}">${esc(t.v)}</a>`;
    }

    // A TIMESTAMPED QUOTATION. The timestamp is data, so it renders as a real
    // <cite> beside the speech rather than as three characters inside the
    // sentence -- which is what it was before atlas tokenised it, and what a
    // renderer would otherwise have to parse back out.
    //
    // `q` supplies its own quotation marks in every engine, so the token's
    // value must NOT carry them: atlas strips them and doubling them here
    // would show ""like this"".
    case 'quote':
      return `<q class="ln-quote-inline">${esc(t.v)}</q>`
        + `<cite class="ln-at">${esc(t.at)}</cite>`;

    // An image only ever names a file authored beside the guide; anything
    // under `evidence/` is refused by the contract and by the tier sweep.
    case 'image':
      return `<img src="${esc(t.src)}" alt="${esc(t.alt)}" class="ln-figure">`;

    // A CITATION IS ONE TOKEN. Since atlas f092fb1 the name rides beside the
    // code and the brackets are gone: how the two are presented is this side's
    // decision (guide-json.md). A session with no `name` is the code alone.
    case 'session':
      return t.name ? `${tag('chip', t.name)} ${tag('session', t.code)}` : tag('session', t.code);

    // INTERNAL TIER MARKERS, payload-less by design: the marker is the whole
    // token and the sentence that follows it is separate text. The export tier
    // never carries them -- atlas removes a marker and its sentence as a unit
    // -- so these three reach the page only through tools/sync-internal.sh.
    case 'gap':
      return `<span class="rux--tag rux--tag--red"><span class="rux--tag__label">GAP</span></span>`;
    case 'internal':
      return `<span class="rux--tag rux--tag--gray"><span class="rux--tag__label">INTERNAL</span></span>`;
    case 'branch':
      return `<span class="rux--tag rux--tag--green"><span class="rux--tag__label">BRANCH</span></span>`;

    default: {
      if (raw == null) {
        // LOUD, NOT SILENT. An unknown type with no payload is the exact shape
        // of the bug this file is built to avoid, so it stops the build rather
        // than rendering an empty span nobody notices.
        throw new Error(`token type "${t.t}" has no payload under "${key}": ${JSON.stringify(t)}`);
      }
      if (PLAIN.has(t.t)) return esc(raw);
      if (!TAG[t.t]) throw new Error(`no rendering for token type "${t.t}": ${JSON.stringify(t)}`);
      const loc = t.location ? ` (${t.location})` : '';
      return tag(t.t, raw, raw + loc);
    }
  }
}

// THE FULL TEXT IS IN `title` ON EVERY TAG. Four long field names still
// truncate visually; carrying the whole string means the loss is visual and
// not informational.
const tag = (type, text, title = text) =>
  `<span class="rux--tag rux--tag--${TAG[type]}" title="${esc(title)}"><span class="rux--tag__label">${esc(text)}</span></span>`;

// TWO ADJACENT TAGS NEED A SEPARATOR AND THE DATA DOES NOT CARRY ONE. Cells
// like `ADNA02` `RAW MATERIALS` are two tokens with no `text` between them, so
// joining on '' butts the pills flush and they read as one control. Sixteen
// pairs did this on the hand-built page; the generator reintroduced it.
//
// The space goes ONLY between two tag-rendered neighbours. Joining everything
// on ' ' instead would insert spaces inside ordinary prose runs and before
// punctuation, which is a worse bug and a silent one.
const isTag = t => t && !PLAIN.has(t.t) && !!TAG[t.t];

const tokens = ts => {
  const list = ts ?? [];
  return list.map((t, i) => {
    const html = token(t);
    return i > 0 && isTag(t) && isTag(list[i - 1]) ? ' ' + html : html;
  }).join('');
};

// ---------------------------------------------------------------- callouts

// CONTRACT 2 HAS NO `callout` BLOCK KIND, so a callout arrives as a `prose`
// block whose TOKEN STREAM begins with the blockquote marker:
//
//     {t:"text", v:"> "}  {t:"strong", v:"Warning"}  {t:"text", v:" > …"}
//
// Rendering that faithfully puts a literal "> Warning >" on the page, which
// reads as a bug. Rendering it as a callout means recognising the shape.
//
// THE RULE IS STRUCTURAL AND ITS REACH IS MEASURED, which is the difference
// between this and an exception list. It matches on token POSITION and TYPE --
// not by parsing markers out of a string, which is the marker contract's job
// and never this renderer's. Across all seven guides it matches exactly 15 of
// 48 prose blocks, in three levels: Warning, Note, Prerequisite. The other 33
// are untouched, and `assertCalloutReach` below fails the build if that count
// moves without someone looking.
//
// THIS SHOULD STOP BEING INFERENCE. `REVIEW-SHAPE.md` already told atlas that
// `callout` is one of four block kinds missing from contract 2. When it ships,
// delete this function and branch on `kind` instead.
const LEVEL = {
  Warning: { variant: 'warning', icon: 'i-warning--filled' },
  Note: { variant: 'info', icon: 'i-information--filled' },
  Prerequisite: { variant: 'info', icon: 'i-information--filled' },
};

function asCallout(block) {
  const ts = block.tokens ?? [];
  if (ts.length < 3) return null;
  if (ts[0].t !== 'text' || ts[0].v !== '> ') return null;
  if (ts[1].t !== 'strong') return null;
  const level = LEVEL[ts[1].v];
  if (!level) return null;
  if (ts[2].t !== 'text' || !ts[2].v.startsWith(' > ')) return null;

  // The third token keeps its text; only the " > " separator is dropped.
  const body = [{ ...ts[2], v: ts[2].v.slice(3) }, ...ts.slice(3)];
  return { label: ts[1].v, level, body };
}

// NO `role="status"` AND NO CLOSE BUTTON, both deliberate deviations from
// `sink/notification.html` and both recorded rather than quiet.
//
// Carbon's inline notification announces an EVENT. These are static document
// callouts present at load, and a live region that is present at load makes a
// screen reader announce all fifteen of them for no reason. The close button
// goes for a plainer reason: `js/dismiss.js` would make a Warning dismissible,
// and a warning a reader can delete from a procedure is worse than none.
//
// LOW CONTRAST, WHICH IS A CHOICE BETWEEN TWO SHIPPED STATES RATHER THAN A
// DEVIATION. Carbon's DEFAULT inline notification is the high-contrast one --
// #393939 on the white theme -- and `sink/notification.html` records that both
// are real. The default is built to interrupt; these are Prerequisite and Note
// blocks sitting inside a procedure, fifteen of them across seven guides, and
// a page of dark slabs reads as fifteen alarms.
//
// Everything else is the captured markup unchanged.
function callout({ label, level, body }) {
  return `<div class="rux--inline-notification rux--inline-notification--${level.variant} rux--inline-notification--low-contrast">
  <div class="rux--inline-notification__details">
    <svg class="rux--inline-notification__icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><use href="#${level.icon}"/></svg>
    <div class="rux--inline-notification__text-wrapper">
      <div class="rux--inline-notification__title">${esc(label)}</div>
      <div class="rux--inline-notification__subtitle">${tokens(body)}</div>
    </div>
  </div>
</div>`;
}

// ---------------------------------------------------------------- blocks

// BRANCH ON THE KEYS PRESENT, NEVER ON `kind`. README's bite 1 has two mouths:
// a `prose` block has no `rows`, so iterating uniformly throws -- and in
// `sections` the same trap bites again, because `runrecord` arrives
// token-shaped 15 times and row-shaped 7 across these seven guides. One kind,
// two shapes. `kind` cannot tell them apart and the keys can.
const isRows = b => Array.isArray(b.rows);

function table(block, { numbered = false } = {}) {
  const cols = block.columns ?? [];
  const head = cols.map(c =>
    `<th scope="col"><div class="rux--table-header-label">${esc(c)}</div></th>`).join('');

  const body = (block.rows ?? []).map(row => {
    const cells = (row.cells ?? []).map((cell, i) => {
      const inner = tokens(cell.tokens);
      // The step id is the first column and is a row header, not data: it
      // labels the row for anyone navigating the table by cell.
      if (numbered && i === 0) return `<th scope="row" class="ln-step-id">${inner}</th>`;
      return `<td>${inner}</td>`;
    }).join('');
    // `produces` marks a step that yields a value worth noting. It is the same
    // fact the `pencil` token carries inline; the attribute lets the row be
    // styled without a class the stylesheet has never heard of.
    const flags = [
      row.produces ? ' data-produces="true"' : '',
      row.optional ? ' data-optional="true"' : '',
    ].join('');
    return `<tr${flags}>${cells}</tr>`;
  }).join('\n          ');

  return `<div class="rux--data-table-container">
        <div class="rux--data-table-content">
          <table class="rux--data-table rux--data-table--md">
            <thead><tr>${head}</tr></thead>
            <tbody>
          ${body}
            </tbody>
          </table>
        </div>
      </div>`;
}

// --------------------------------------------------------- prose documents

// THE SIX BLOCK KINDS REVIEWS AND EXERCISES CARRY, four of which a guide never does.
// A guide's blocks are identified by `kind` meaning something else entirely
// (`prose`, `steps`, `runrecord`), so this dispatches on the review vocabulary
// and never falls through to `block()` -- REVIEW-SHAPE.md section 2 named them
// and atlas emits exactly these.
function rblock(b) {
  switch (b.kind) {
    case 'prose':
      // A blockquote that is not a callout. Both in the six are pull quotes of
      // speech, and the framing is the point of them.
      return b.quoted
        ? `<blockquote class="ln-quote">${tokens(b.tokens)}</blockquote>`
        : `<p>${tokens(b.tokens)}</p>`;

    case 'list': {
      // NO BARE `rux--list`. Carbon compiles the modifier and the item and
      // NOT the base, so `rux--list` resolves against nothing -- check-classes
      // caught it the first time this was written, which is the whole reason
      // that gate reads the vendored stylesheet rather than a list of names.
      const tag = b.ordered ? 'ol' : 'ul';
      const cls = b.ordered ? 'rux--list--ordered' : 'rux--list--unordered';
      const items = (b.items ?? []).map(i =>
        `<li class="rux--list__item">${tokens(i.tokens)}</li>`).join('\n          ');
      return `<${tag} class="${cls}">\n          ${items}\n        </${tag}>`;
    }

    case 'callout': {
      // A review's callout NESTS BLOCKS and cannot be flattened to a string
      // the way a guide's is -- the longest runs two paragraphs with its own
      // citation and a dated correction inside it. That is why `callout()`
      // above is not reused: it takes tokens, this takes blocks.
      // ONE MAP FOR BOTH VOCABULARIES. A guide's callout arrives labelled
      // `Warning`, a review's as `variant: "warning"`; the rendering is the
      // same component and a second map would drift from this one. `i-warning`
      // is NOT a symbol in the sprite -- `i-warning--filled` is -- so an
      // invented icon name here would be a blank 20px box and no gate would
      // see it.
      const label = b.variant[0].toUpperCase() + b.variant.slice(1);
      const level = LEVEL[label];
      if (!level) throw new Error(`no callout level for variant "${b.variant}"`);
      const body = (b.blocks ?? []).map(rblock).join('\n      ');
      return `<div class="rux--inline-notification rux--inline-notification--${level.variant} rux--inline-notification--low-contrast">
  <div class="rux--inline-notification__details">
    <svg class="rux--inline-notification__icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><use href="#${level.icon}"/></svg>
    <div class="rux--inline-notification__text-wrapper">
      <div class="rux--inline-notification__title">${esc(label)}</div>
      <div class="rux--inline-notification__subtitle">${body}</div>
    </div>
  </div>
</div>`;
    }

    case 'source':
      return `<p class="ln-source">${tokens(b.tokens)}</p>`;

    case 'code':
      // MUST SCROLL, NEVER WRAP. All three are ASCII pegging trees, the widest
      // is 96 characters, and wrapping one destroys the only thing it conveys.
      return `<div class="ln-code-scroll"><pre class="rux--type-code-01"><code>${esc(b.text)}</code></pre></div>`;

    case 'table':
      return table(b);

    default:
      throw new Error(`no rendering for review block kind "${b.kind}"`);
  }
}

function rsection(id, heading, blocks) {
  if (!blocks || !blocks.length) return '';
  return `<section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="${id}">
          <h2 id="${id}">${esc(heading)}</h2>
          ${blocks.map(rblock).join('\n          ')}
        </section>`;
}

function block(b, opts) {
  if (isRows(b)) return table(b, opts);
  const c = asCallout(b);
  if (c) return callout(c);
  return `<p>${tokens(b.tokens)}</p>`;
}

// ---------------------------------------------------------------- sections

// SECTIONS ARE A FLAT ORDERED ARRAY AND CARRY NO TITLE. The heading comes from
// `kind`, and a run of sections sharing a kind is ONE section with several
// blocks in it -- `runrecord` is a sentence, then a table, then the fill-in
// line. Emitting a heading per entry would put "Run record" on the page three
// times running.
const HEADING = {
  glance: 'At a glance',
  runrecord: 'Run record',
  troubleshooting: 'Troubleshooting',
  variants: 'Variants',
  downstream: 'What this unlocks',
  reference: 'Reference',
  other: 'Reference',
  prose: null,      // no heading -- prose belongs to whatever precedes it
  // INTERNAL TIER ONLY. The export tier drops these four structurally; they
  // reach this table through tools/sync-internal.sh and nowhere else.
  sources: 'Sources',
  notes: null,
  superseded: 'Superseded',
  walked: 'Walked',
};

// WHERE THE PHASES GO, WHICH THE DATA DOES NOT SAY. A guide arrives as two
// independent top-level arrays -- `phases` and `sections` -- with nothing
// relating them, so the renderer chooses. Printing all of `sections` and then
// all of `phases` puts Troubleshooting, Run record and Variants AHEAD of the
// work they belong to: the troubleshooting rows are keyed by phase number and
// the run record opens "Fill in as you go", so a reader meets the fix-it table
// before the instructions. That shipped on all seven pages and no gate saw it,
// because none of them reads document order.
//
// The boundary is THE FIRST SECTION OF A SET, not a named kind. It was
// `runrecord` until that section was removed from the format on 2026-09-01,
// and the anchor went with it: every guide put its phases last again, and
// `check-order` reported twenty-one misplaced sections across seven pages.
// That is the gate doing its job, and the lesson is that keying a structural
// rule to ONE kind makes the rule only as durable as that kind.
//
// A set survives any one member leaving. Troubleshooting, Variants and What
// this unlocks are the sections that refer BACK to work already done -- the
// troubleshooting rows are keyed by phase number -- so the first of them opens
// the back matter. Everything before introduces the guide.
//
// `reference` is deliberately not in the set: it sits in front matter in one
// guide and back matter in another, so it floats to wherever it was authored
// rather than dragging the boundary with it. Checked across all seven: front
// matter always holds `glance` and never holds a back-matter kind.
const BACK_MATTER = new Set(['troubleshooting', 'variants', 'downstream', 'runrecord']);

function splitSections(list) {
  const all = list ?? [];
  const i = all.findIndex(s => BACK_MATTER.has(s.kind));
  return i === -1 ? { front: all, back: [] } : { front: all.slice(0, i), back: all.slice(i) };
}

function sections(list) {
  const out = [];
  let open = null;   // the kind whose heading is already on the page

  for (const s of list ?? []) {
    const heading = HEADING[s.kind];
    if (heading === undefined) throw new Error(`unknown section kind "${s.kind}"`);

    if (heading && s.kind !== open) {
      if (open !== null) out.push('</section>');
      const id = 's-' + s.kind;
      out.push(`<section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="${id}">`);
      out.push(`<h2 id="${id}">${esc(heading)}</h2>`);
      open = s.kind;
    }
    out.push(block(s));
  }
  if (open !== null) out.push('</section>');
  return out.join('\n      ');
}

// ---------------------------------------------------------------- phases

function phase(p) {
  // THE ROUTE IS THE THING A READER MOST NEEDS WHOLE, so it is a definition
  // list beside the heading rather than a tag: see the note on PLAIN above.
  const where = [
    p.route ? `<div class="ln-meta-row"><dt>Route</dt><dd>${esc(p.route)}</dd></div>` : '',
    p.session ? `<div class="ln-meta-row"><dt>Session</dt><dd>${esc(p.session)}${
      p.sessionCode ? ` <span class="rux--type-code-01">${esc(p.sessionCode)}</span>` : ''}</dd></div>` : '',
    // The evidence stamp travels only in the internal tier; a client never
    // sees it and the generated `verification` sentence stands in for it.
    p.stamp ? `<div class="ln-meta-row"><dt>Evidence</dt><dd>${esc(p.stamp)}</dd></div>` : '',
  ].filter(Boolean).join('');

  // INTERNAL TIER: a phase's notes arrive as `notes` blocks after its steps.
  // They are collapsed on the source page too, so they are grouped under one
  // disclosure here rather than printed as unlabelled paragraphs.
  const open = (p.blocks ?? []).filter(b => b.kind !== 'notes');
  const notes = (p.blocks ?? []).filter(b => b.kind === 'notes');
  const notesHtml = notes.length ? `<details class="ln-notes"><summary>Notes on phase ${esc(p.n)}</summary>
        ${notes.map(b => block(b)).join('\n        ')}
        </details>` : '';

  // AN h3, NOT AN h2. Each phase sits inside the "Phases" section, so an h2
  // here makes the outline read as fourteen siblings — "Phases", then "Phase 0"
  // at the same level as the thing containing it. Someone navigating by heading
  // gets no nesting to move through, which is the same class of defect as
  // rux-ds's metric row putting bare numbers in the outline.
  return `<section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="p-${p.n}">
        <h3 id="p-${p.n}">Phase ${esc(p.n)} — ${esc(p.title)}</h3>
        ${where ? `<dl class="ln-meta">${where}</dl>` : ''}
        ${[...open.map(b => block(b, { numbered: true })), ...(notesHtml ? [notesHtml] : [])].join('\n        ')}
      </section>`;
}

// ---------------------------------------------------------------- the shell

// ONE DEFINITION OF THE NAV, WHICH IS THE POINT OF GENERATING AT ALL. Eight
// pages carry this markup; hand-authoring meant eight copies with nothing
// keeping them in step, and guides are expected to be added and removed often.
function nav(site, activeId) {
  const link = (d) => {
    const current = d.id === activeId ? ' aria-current="page"' : '';
    return `          <li class="rux--side-nav__menu-item"><a class="rux--side-nav__link" href="${
      activeId === null ? 'guides/' : ''}${d.id}.html"${current}><span class="rux--side-nav__link-text">${esc(d.title)}</span></a></li>`;
  };
  const items = site.guides.map(link).join('\n');
  const practice = site.exercises.map(link).join('\n');
  // SUMMARIES ARE THE LISTED CATEGORY, reviews are reached from them. The
  // agreement was scenario guides and meeting summaries; the full reviews are
  // deferred rather than refused, and listing twelve documents under one
  // heading would present them as one category when they are two.
  const meetings = site.summaries.map(link).join('\n');

  const guidesOpen = site.guides.some(g => g.id === activeId);
  const practiceOpen = site.exercises.some(e => e.id === activeId);
  const meetingsOpen = [...site.reviews, ...site.summaries].some(d => d.id === activeId);
  // CONCEPTS ARE NOT A PUBLISHED CATEGORY. atlas's concept-rules.md section 5
  // gives them no tier, its emitter refuses them at export, and this group
  // renders only when the data carries them -- which is the private build.
  const concepts = (site.concepts ?? []).map(link).join('\n');
  const conceptsOpen = (site.concepts ?? []).some(d => d.id === activeId);
  const conceptsGroup = concepts ? `
      <li class="rux--side-nav__item">
        <button class="rux--side-nav__submenu" type="button" aria-expanded="${conceptsOpen}">
          <span class="rux--side-nav__submenu-title">Concepts</span>
          <div class="rux--side-nav__icon rux--side-nav__submenu-chevron"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-chevron--down"/></svg></div>
        </button>
        <ul class="rux--side-nav__menu"${conceptsOpen ? '' : ' hidden'}>
${concepts}
        </ul>
      </li>
` : '';
  const home = activeId === null ? './' : '../';

  // NO LEADING ICONS, AND THAT IS WHAT SETS THE CHILD INDENT. Carbon binds
  // `__link`'s padding-inline-start to the icon: 72px with
  // `__item--icon`, 32px without. Both are real variants -- rux-ds records
  // both in docs/carbon-react-spacing.json under `cds--side-nav__link` --
  // so the indent is not independently adjustable without leaving Carbon.
  // Measured 2026-09-01 on carbondesignsystem.com, which runs the component
  // itself: 14 `__item`s, 0 carrying `__item--icon`, submenu buttons holding
  // a title and a chevron and nothing else, `__link` computing 32px. The two
  // icons that used to sit here (#i-document, #i-list) bought a wider indent
  // than the labels needed and distinguished only two sections.
  return `  <nav class="rux--side-nav__navigation rux--side-nav rux--side-nav--ux" aria-label="Side navigation">
    <ul class="rux--side-nav__items">

      <!-- ORDER IS \`order\` FROM THE DATA, NOT ALPHABETICAL. Contract 2 derives
           it and it sorts as a curriculum would -- build the family, plan, buy,
           make, move, ship, then the end-to-end run. Atlas got there by reading
           Prerequisite callouts as dependency edges; on Downstream rows alone
           the guide that builds the test data came fourth. -->
      <li class="rux--side-nav__item${guidesOpen ? ' rux--side-nav__item--active' : ''}">
        <button class="rux--side-nav__submenu" type="button" aria-expanded="true">
          <span class="rux--side-nav__submenu-title">Scenario guides</span>
          <div class="rux--side-nav__icon rux--side-nav__submenu-chevron"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-chevron--down"/></svg></div>
        </button>
        <ul class="rux--side-nav__menu">
${items}
        </ul>
      </li>

      <!-- EXERCISES COMPOSE GUIDES; they do not repeat their procedures. They
           get their own group because a learner opens one to predict, record
           and explain, not to perform an SOP-like runbook. -->
      <li class="rux--side-nav__item${practiceOpen ? ' rux--side-nav__item--active' : ''}">
        <button class="rux--side-nav__submenu" type="button" aria-expanded="${practiceOpen}">
          <span class="rux--side-nav__submenu-title">Practice</span>
          <div class="rux--side-nav__icon rux--side-nav__submenu-chevron"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-chevron--down"/></svg></div>
        </button>
        <ul class="rux--side-nav__menu"${practiceOpen ? '' : ' hidden'}>
${practice}
        </ul>
      </li>

      <!-- THE MEETING CONTENT GROUP lists summaries rather than full reviews.
           The agreement is scenario guides and meeting summaries; the six full
           reviews render and are reached from their summary rather than listed
           beside it, because putting twelve documents under one heading
           presents two categories as one. -->
      <li class="rux--side-nav__item">
        <button class="rux--side-nav__submenu" type="button" aria-expanded="${meetingsOpen}">
          <span class="rux--side-nav__submenu-title">Meeting summaries</span>
          <div class="rux--side-nav__icon rux--side-nav__submenu-chevron"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-chevron--down"/></svg></div>
        </button>
        <ul class="rux--side-nav__menu"${meetingsOpen ? '' : ' hidden'}>
${meetings}
        </ul>
      </li>
${conceptsGroup}
    </ul>
  </nav>`;
}

const SCRIPTS = [
  'overlay', 'popover', 'menu', 'list-box', 'date-picker', 'copy-button', 'tabs',
  'accordion', 'data-table', 'form-controls', 'ui-shell', 'dismiss', 'tile', 'modal',
  'profile',
];

function page({ title, site, activeId, body, depth }) {
  const up = depth ? '../' : '';
  return `<!doctype html>
<html lang="en" data-theme="white">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<!-- PLEX FIRST, THEN rux.css, WHICH IS THE ORDER rux-ds USES IN ITS OWN
     TEMPLATES. rux.css names IBM Plex Sans sixty-seven times and declares no
     @font-face; the faces live here. Linking the stylesheet without this one
     renders every page in the system sans while every gate stays green --
     the class resolves, the reference exists, and the page looks built. -->
<link rel="preload" as="font" type="font/woff2" crossorigin href="${up}vendor/rux-ds/assets/fonts/IBMPlexSans-Regular-Latin1.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${up}vendor/rux-ds/assets/fonts/IBMPlexSans-SemiBold-Latin1.woff2">
<link rel="stylesheet" href="${up}vendor/rux-ds/assets/fonts/plex.css">
<link rel="stylesheet" href="${up}vendor/rux-ds/css/rux.css">
<link rel="stylesheet" href="${up}vendor/rux-ds/css/rux-theme.css">
<link rel="stylesheet" href="${up}vendor/rux-ds/css/rux-overrides.css">
<link rel="stylesheet" href="${up}rux-theme.css">
<link rel="stylesheet" href="${up}rux-overrides.css">
<script src="${up}vendor/rux-ds/js/theme.js"></script>
<style>
/* GENERATED by tools/build.mjs. Do not edit this file -- the next build
   overwrites it, and the fix belongs in the generator. */

/* TRAP 3.2, from rux-ds templates/app-shell.html and NOT optional.
   \`.rux--content\` is only ever indented by a SIBLING side nav, and this nav
   lives inside the header, so none of Carbon's three rules match and the
   content would start underneath the nav. 16rem clears it; the remaining 2rem
   is the content's own padding. This CSS is not in rux.css, so check-classes
   cannot see it missing -- the page would look built and be wrong. */
@media (min-width: 66rem) {
  .rux--content { padding-inline-start: 18rem; }
}

/* A WRAPPING TAG ROW. rux-ds's README records sixteen tag pairs sitting flush
   in this project's first page: an unattested composition inherits no spacing,
   so a tag beside another gets a 4px word space and nothing else.
   \`stack-horizontal\` is NOT the fix -- it cannot wrap, and it truncates its
   children in a narrow column. Plain class, not a \`rux--\` one: check-classes
   ignores non-rux-- names, so an invented \`rux--\` one would be unpoliced. */
.ln-tag-row { display: flex; flex-wrap: wrap; gap: .5rem; }

/* EQUAL-HEIGHT CARDS WITH THEIR ACTIONS ON ONE LINE, and it takes both rules.
   Making the grid cell a flex parent is NOT enough on its own -- measured on
   the page: \`.rux--card\` computes \`display: block\`, so stretching the card
   left every footer at its own content height, 16px and 32px apart within one
   row. The card becomes a flex column and the footer takes the slack. */
.ln-card-cell { display: flex; }
.ln-card-cell > .rux--card { inline-size: 100%; display: flex; flex-direction: column; }
.ln-card-cell .rux--card__footer { margin-block-start: auto; }

/* A step cell holds prose with tags in it, so the tags need to sit ON the text
   baseline rather than as blocks. \`.rux--tag\` is inline-flex already; this
   only stops a tag from setting the line height of a row it shares with text. */
.rux--data-table td .rux--tag,
.rux--data-table th .rux--tag { vertical-align: middle; max-inline-size: 100%; }

/* The step id column carries "1.10"-style ids and should not wrap or stretch. */
.ln-step-id { inline-size: 4rem; white-space: nowrap; }

/* A step that yields a value worth writing down. The pencil token says the same
   thing inline; this is the row-level view of it. */
.ln-pencil { vertical-align: text-bottom; opacity: .65; margin-inline-start: .25rem; }

/* Route and session, above a phase's steps. A definition list rather than
   prose because they are labelled facts, and \`display: flex\` keeps each
   label with its value instead of Carbon's default dt/dd block stacking. */
/* REVIEW ELEMENTS. None of these is a Carbon component -- rux-ds compiles no
   blockquote, no source attribution and no inline citation -- so they are
   local rules on local class names, which is why they are ln- and not
   rux--. A rux-- class invented here would resolve against nothing and
   check-classes would say so. */

/* A pull quote of speech. Both in the six reviews are quotations, so the rule
   is a quiet left rail rather than a decorative blockquote. */
.ln-quote {
  margin: 0;
  padding-inline-start: 1rem;
  border-inline-start: 2px solid var(--rux-border-subtle-01, #e0e0e0);
  color: var(--rux-text-secondary, #525252);
}

/* The source attribution, 17 of them. Small and muted, and attached to the
   thing above it rather than floating between two blocks. */
.ln-source {
  margin-block-start: -0.5rem;
  font-size: 0.75rem;
  color: var(--rux-text-secondary, #525252);
}

/* A timestamped quotation. q supplies its own quotation marks, so the token
   value must not carry them -- atlas strips them for exactly this reason. */
.ln-quote-inline { font-style: italic; }
.ln-at {
  margin-inline-start: 0.25rem;
  font-size: 0.75rem;
  font-style: normal;
  color: var(--rux-text-secondary, #525252);
}

/* SCROLLS, NEVER WRAPS. All three fenced blocks are ASCII pegging trees and
   the widest is 96 characters; wrapping one destroys the only thing it
   conveys. The container scrolls so the page itself never does -- a page that
   scrolls sideways is the defect this repo measured for. */
.ln-code-scroll { overflow-x: auto; max-inline-size: 100%; }
.ln-code-scroll pre { margin: 0; white-space: pre; }

/* A WORKSHEET ANSWER CELL NEEDS VISIBLE SPACE even before it has an answer.
   Empty table cells otherwise collapse to one text line and the published
   exercise looks complete while leaving nowhere to write. Scoped to exercise
   pages so ordinary guide and review tables remain dense. */
.ln-exercise .rux--data-table td:empty::after {
  content: '';
  display: block;
  min-block-size: 3rem;
}

.ln-meta { margin: 0; }
.ln-meta-row { display: flex; flex-wrap: wrap; gap: .5rem; }
.ln-meta dt { font-weight: 600; min-inline-size: 4.5rem; }
.ln-meta dd { margin: 0; }

.ln-figure { max-inline-size: 100%; block-size: auto; }

/* THE HEADER IS \`position: fixed\` AND 48px TALL, so every in-page anchor
   lands its target underneath it. Measured: jumping to a phase put the
   heading at viewport top 0, behind the header, with the first thing visible
   being the middle of its own table. This is not cosmetic on these pages --
   the side nav links to #summaries and every phase carries an id.
   3rem clears the header; the extra 1rem is so the heading does not sit
   flush against it. */
h1, h2, h3 { scroll-margin-block-start: 4rem; }
</style>
</head>
<body>
<!-- GENERATED by tools/build.mjs from data/guides/. Do not edit by hand. -->

<!-- SPRITE:BEGIN -->
<!-- SPRITE:END -->

<header class="rux--header" data-theme="g100" aria-label="Rux Notes">
  <a class="rux--skip-to-content" href="#main-content">Skip to main content</a>

  <!-- Ships closed, and carries __menu-toggle__hidden so it is display:none
       above 66rem. Without that class the button shows at desktop, and closing
       the nav there leaves the content indented against a nav that is no
       longer beside it -- a state that does not exist in IBM's design. -->
  <button type="button" class="rux--header__action rux--header__menu-trigger rux--header__menu-toggle rux--header__menu-toggle__hidden" aria-label="Toggle navigation" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-menu"/></svg></button>

  <!-- THE MARK is rux-ds's, copied from templates/app-shell.html verbatim and
       not a choice (docs/choices.md): it is the brand, the same 33x30 glyph in
       the same place in every app on the account. -->
  <a class="rux--header__name" href="${up || './'}">
<svg width="33" height="30" viewBox="0 0 11 10" aria-hidden="true"
         style="margin-right:.5rem;flex:none;color:#c6c6c6;--rux-mark-slab:#0f62fe">
    <g fill="currentColor">
    <rect x="2" y="0" width="4" height="1"/>
    <rect x="9" y="0" width="1" height="1"/>
    <rect x="2" y="1" width="1" height="1"/>
    <rect x="4" y="1" width="1" height="1"/>
    <rect x="10" y="1" width="1" height="1"/>
    <rect x="2" y="2" width="5" height="1"/>
    <rect x="10" y="2" width="1" height="1"/>
    <rect x="2" y="3" width="6" height="1"/>
    <rect x="10" y="3" width="1" height="1"/>
    <rect x="2" y="4" width="2" height="1"/>
    <rect x="10" y="4" width="1" height="1"/>
    <rect x="2" y="5" width="8" height="1"/>
    <rect x="1" y="6" width="9" height="1"/>
    <rect x="1" y="7" width="9" height="1"/>
    <rect x="2" y="8" width="8" height="1"/>
    <rect x="2" y="9" width="1" height="1"/>
    <rect x="4" y="9" width="1" height="1"/>
    <rect x="7" y="9" width="1" height="1"/>
    <rect x="9" y="9" width="1" height="1"/>
    </g>
    <g fill="var(--rux-mark-slab, currentColor)">
    <rect x="1" y="0" width="1" height="1"/>
    <rect x="0" y="1" width="2" height="1"/>
    <rect x="0" y="2" width="2" height="1"/>
    <rect x="0" y="3" width="2" height="1"/>
    <rect x="0" y="4" width="2" height="1"/>
    <rect x="0" y="5" width="2" height="1"/>
    </g>
    <g fill="var(--rux-mark-feature, #0f62fe)">
    <rect x="3" y="1" width="1" height="1"/>
    <rect x="5" y="1" width="1" height="1"/>
    <rect x="7" y="2" width="1" height="1"/>
    </g>
</svg><span class="rux--header__name--prefix">Rux</span>&nbsp;Notes</a>

  <!-- NO __nav: one product. __global carries the two actions every app has
       since rux-ds v0.1.3 (§4.13): the Account action and the switcher, each
       opening its own header panel through aria-controls
       (vendor/rux-ds/js/ui-shell.js). NO NOTIFICATIONS GLYPH, here or on the
       hub since 2026-09-03: an icon-only button with no handler is an
       affordance that lies, and nothing notifies yet. Carbon's captured
       header has one and templates/ keeps it; a module drops it until it
       means something. The switcher panel ships Home and this app as its
       entries; /switcher.js at the account root replaces them with the
       shared list in switcher.json and marks the app you are on. Served
       alone -- a local tools/serve.mjs, or offline -- the shipped entries
       stay. Both paths are root-absolute by decision (rux-ds roadmap
       §4.12): the root is rux-sm.github.io and this site sits under it at
       /rux-ln-notes/. The account panel is the standard one from rux-ds's
       template, verbatim: the local profile (js/profile.js) under the key
       every app on the origin shares, so a theme chosen here is the theme
       the hub opens in. -->
  <div class="rux--header__global">
    <button type="button" class="rux--header__action rux--btn rux--layout--size-lg rux--btn--ghost rux--btn--icon-only" aria-label="Account" aria-expanded="false" aria-controls="rux-account-panel"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-user--avatar"/></svg></button>
    <button type="button" class="rux--header__action rux--btn rux--layout--size-lg rux--btn--ghost rux--btn--icon-only" aria-label="App switcher" aria-expanded="false" aria-controls="rux-switcher-panel"><svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><use href="#i-grid"/></svg></button>
  </div>
  <div class="rux--header-panel" id="rux-switcher-panel">
    <ul class="rux--switcher" aria-label="Applications">
    <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/">Home</a></li>
    <li><hr class="rux--switcher__item--divider"></li>
    <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/rux-ln-notes/" aria-current="page">Notes</a></li>
  </ul>
  </div>
  <!-- THE ACCOUNT PANEL: the same header panel, opened by the Account action
       through aria-controls (js/ui-shell.js), holding the profile every app
       keeps — a display name and the theme, saved in this browser under one
       key shared by every app on the origin (js/theme.js, js/profile.js).
       The panel is captured (--header-w-actions-and-right-panel); what is IN
       it is a product's own, composed from the sink's text input and vertical
       radio group. The sign-in button ships hidden and shows only once
       something registers a handler for it, because a button with no handler
       is an affordance that lies. -->
  <div class="rux--header-panel" id="rux-account-panel">
    <div class="rux--layer-two rux--stack-vertical rux--stack-scale-5">
      <div class="rux--form-item rux--text-input-wrapper">
        <div class="rux--text-input__label-wrapper">
          <label class="rux--label" for="rux-profile-name">Display name</label>
        </div>
        <div class="rux--text-input__field-outer-wrapper">
          <div class="rux--text-input__field-wrapper">
            <input id="rux-profile-name" class="rux--text-input" type="text" autocomplete="nickname" placeholder="Saved in this browser">
          </div>
        </div>
      </div>
      <div class="rux--form-item">
        <fieldset class="rux--radio-button-group rux--radio-button-group--label-right rux--radio-button-group--vertical" id="rux-profile-theme">
          <legend class="rux--label">Theme</legend>
          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-white" class="rux--radio-button" type="radio" name="rux-theme" value="white" checked>
            <label for="rux-theme-white" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">White</span>
            </label>
          </div>
          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-g10" class="rux--radio-button" type="radio" name="rux-theme" value="g10">
            <label for="rux-theme-g10" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">Gray 10</span>
            </label>
          </div>
          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-g90" class="rux--radio-button" type="radio" name="rux-theme" value="g90">
            <label for="rux-theme-g90" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">Gray 90</span>
            </label>
          </div>
          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-g100" class="rux--radio-button" type="radio" name="rux-theme" value="g100">
            <label for="rux-theme-g100" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">Gray 100</span>
            </label>
          </div>
          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-rux" class="rux--radio-button" type="radio" name="rux-theme" value="rux">
            <label for="rux-theme-rux" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">Rux</span>
            </label>
          </div>
        </fieldset>
      </div>
      <button type="button" class="rux--btn rux--btn--tertiary" id="rux-profile-sign-in" hidden>Sign in</button>
    </div>
  </div>

  <div class="rux--side-nav__overlay"></div>

${nav(site, activeId)}
</header>

<main id="main-content" class="rux--content">
  <div class="rux--css-grid">
    <div class="rux--css-grid-column rux--col-span-100">
      <div class="rux--stack-vertical rux--stack-scale-7">
${body}
      </div>
    </div>
  </div>
</main>

${SCRIPTS.map(s => `<script src="${up}vendor/rux-ds/js/${s}.js"></script>`).join('\n')}
<script src="/switcher.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- pages

// A DRAFT IS LABELLED, NEVER WITHHELD. README's decision: six of the seven are
// drafts, so withholding them leaves a site with one page on it. Contract 2
// carries `status` in the export tier, so the badge is data rather than prose
// to be mined.
const statusTag = s => s === 'approved'
  ? `<span class="rux--tag rux--tag--green"><span class="rux--tag__label">Approved</span></span>`
  : `<span class="rux--tag rux--tag--teal"><span class="rux--tag__label">Draft</span></span>`;

function indexPage(site) {
  const { guides, exercises, summaries } = site;
  const cards = guides.map(g => `        <div class="rux--css-grid-column rux--sm:col-span-4 rux--md:col-span-4 rux--lg:col-span-8 ln-card-cell">
          <!-- NOT \`card--clickable\`. The captured clickable card is
               role="button" with tabindex 0, which is right for a card that
               fires an action and wrong for one that navigates, and there is
               no card module in js/ to give it behaviour. The footer carries a
               real <a>, so the browser does the navigation. -->
          <div class="rux--card rux--card--productive">
            <div class="rux--card__header">
              <div class="rux--card__title">
                <div class="rux--card__label">${esc(g.module)}</div>
                <span class="rux--card__title-text-row" id="t-${esc(g.id)}">${esc(g.title)}</span>
                <div class="rux--card__description">${esc(g.summary)}</div>
              </div>
            </div>
            <div class="rux--card__body">
              <div class="ln-tag-row">
                ${statusTag(g.status)}
                <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">${g.phases.length} phases</span></span>
              </div>
            </div>
            <div class="rux--card__footer">
              <!-- TWO IDS IN aria-labelledby, in reading order, so this reads
                   "Open guide, <title>". Seven links all reading "Open guide"
                   is a real defect for anyone listing the page's links, and
                   Carbon's card title is a <span> rather than a heading, so
                   there is no heading to land on instead. -->
              <a class="rux--btn rux--btn--md rux--layout--size-md rux--btn--tertiary" href="guides/${esc(g.id)}.html" id="o-${esc(g.id)}" aria-labelledby="o-${esc(g.id)} t-${esc(g.id)}">Open guide</a>
            </div>
          </div>
        </div>`).join('\n');

  // A SUMMARY'S CARD COUNTS TOPICS, not phases. It is the same card component
  // and deliberately not the same facts: a summary has no phases, and showing
  // a zero there would read as a guide with nothing in it.
  const summaryCards = summaries.map(r => {
    const first = (r.covered ?? []).find(b => b.kind === 'prose');
    const blurb = first ? first.text : '';
    return `        <div class="rux--css-grid-column rux--sm:col-span-4 rux--md:col-span-4 rux--lg:col-span-8 ln-card-cell">
          <div class="rux--card rux--card--productive">
            <div class="rux--card__header">
              <div class="rux--card__title">
                <div class="rux--card__label">Meeting summary</div>
                <span class="rux--card__title-text-row" id="t-${esc(r.id)}">${esc(r.title)}</span>
                <div class="rux--card__description">${esc(blurb)}</div>
              </div>
            </div>
            <div class="rux--card__body">
              <div class="ln-tag-row">
                ${statusTag(r.status)}
                <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">${(r.topics ?? []).length} topics</span></span>
                <span class="rux--tag rux--tag--outline"><span class="rux--tag__label">${esc(r.updated)}</span></span>
              </div>
            </div>
            <div class="rux--card__footer">
              <a class="rux--btn rux--btn--md rux--layout--size-md rux--btn--tertiary" href="guides/${esc(r.id)}.html" id="o-${esc(r.id)}" aria-labelledby="o-${esc(r.id)} t-${esc(r.id)}">Open summary</a>
            </div>
          </div>
        </div>`;
  }).join('\n');

  const exerciseCards = exercises.map(e => `        <div class="rux--css-grid-column rux--sm:col-span-4 rux--md:col-span-4 rux--lg:col-span-8 ln-card-cell">
          <div class="rux--card rux--card--productive">
            <div class="rux--card__header">
              <div class="rux--card__title">
                <div class="rux--card__label">Practice exercise</div>
                <span class="rux--card__title-text-row" id="t-${esc(e.id)}">${esc(e.title)}</span>
                <div class="rux--card__description">${esc(e.summary)}</div>
              </div>
            </div>
            <div class="rux--card__body">
              <div class="ln-tag-row">
                ${statusTag(e.status)}
                <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">${e.assignments.length} assignments</span></span>
              </div>
            </div>
            <div class="rux--card__footer">
              <a class="rux--btn rux--btn--md rux--layout--size-md rux--btn--tertiary" href="guides/${esc(e.id)}.html" id="o-${esc(e.id)}" aria-labelledby="o-${esc(e.id)} t-${esc(e.id)}">Open exercise</a>
            </div>
          </div>
        </div>`).join('\n');

  const body = `        <div class="rux--stack-vertical rux--stack-scale-5">
          <h1>Rux Notes</h1>
          <p class="rux--type-body-02">Procedures walked against a live Infor LN
             environment, focused practice for explaining their results, and
             the record of the sessions they came out of. Each scenario guide
             keeps the procedure; each exercise asks you to predict, observe
             and report back.</p>
        </div>

        <section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="h-guides">
          <h2 id="h-guides">Scenario guides</h2>
          <!-- THE SPANS ARE PER-BREAKPOINT AND ALL THREE ARE REQUIRED: a bare
               col-span plus an \`lg:\` override does nothing, because both are
               one class of specificity and col-span-100 is emitted later in
               the stylesheet. \`subgrid\` rather than a nested \`css-grid\`,
               because this sits inside a column carrying margin-inline: 16px
               and a fresh grid would start its tracks 16px in. -->
          <div class="rux--subgrid rux--subgrid--wide rux--subgrid--with-row-gap">
${cards}
          </div>
        </section>

        <section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="h-practice">
          <h2 id="h-practice">Practice</h2>
          <p class="rux--type-body-02">Guided assignments for predicting an LN
             result, following the relevant guide, explaining what happened and
             reporting the evidence.</p>
          <div class="rux--subgrid rux--subgrid--wide rux--subgrid--with-row-gap">
${exerciseCards}
          </div>
        </section>

        ${(site.concepts ?? []).length ? `<section id="concepts" class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="h-concepts">
          <h2 id="h-concepts">Concepts</h2>
          <ul class="rux--list--unordered">
            ${site.concepts.map(c => `<li class="rux--list__item"><a class="rux--link" href="guides/${esc(c.id)}.html">${esc(c.title)}</a></li>`).join('\n            ')}
          </ul>
        </section>
        ` : ''}<section id="summaries" class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="h-summaries">
          <h2 id="h-summaries">Meeting summaries</h2>
          <p class="rux--type-body-02">Six training sessions, each summarised in
             four parts — what it covered, the topics, what was decided, and the
             key takeaways. Every summary links to the full review it came from.</p>
          <div class="rux--subgrid rux--subgrid--wide rux--subgrid--with-row-gap">
${summaryCards}
          </div>
        </section>`;

  return page({ title: 'Rux Notes', site, activeId: null, body, depth: 0 });
}

// A REVIEW AND A SUMMARY ARE ONE PAGE BUILDER WITH TWO SLOT LISTS. They share
// the topics model and nothing else, which is REVIEW-SHAPE.md section 5's
// finding -- a summary is not a truncated review. Rendering them from one
// function keeps the shell, the nav and the topic rendering identical while
// the slots differ, which is the actual relationship between them.
const REVIEW_SLOTS = [
  ['objective', 'Objective'],
  ['attendees', 'Attendees'],
  ['__topics', 'Key topics discussed'],
  ['decisions', 'Decisions made'],
  ['actions', 'Action items'],
  ['questions', 'Open questions'],
  ['methodology', 'Methodology and process notes'],
  ['sessions', 'Sessions referenced'],
];

const SUMMARY_SLOTS = [
  ['covered', 'What this covered'],
  ['__topics', 'Topics'],
  ['decided', 'What was decided'],
  ['takeaways', 'Key takeaways'],
];

function topicsSection(r) {
  const heading = r.kind === 'summary' ? 'Topics' : 'Key topics discussed';
  const items = (r.topics ?? []).map(t => {
    // A review numbers its topics `3.n`; a summary's are titled and
    // unnumbered. The id has to be stable either way, so it falls back to the
    // index rather than emitting `id="t-undefined"` six times on one page.
    const label = t.n ? `${t.n} ${t.title}` : t.title;
    const id = `t-${(t.n ?? t.title).replace(/[^A-Za-z0-9.]+/g, '-').toLowerCase()}`;
    return `<section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="${id}">
            <h3 id="${id}">${esc(label)}</h3>
            ${(t.blocks ?? []).map(rblock).join('\n            ')}
          </section>`;
  }).join('\n        ');
  if (!items) return '';
  return `<section class="rux--stack-vertical rux--stack-scale-7" aria-labelledby="h-topics">
          <h2 id="h-topics">${esc(heading)}</h2>
          ${items}
        </section>`;
}

function reviewPage(r, site) {
  const slots = r.kind === 'summary' ? SUMMARY_SLOTS : REVIEW_SLOTS;

  // THE ONLY ROUTE TO A FULL REVIEW, so it is not decoration. Six review pages
  // render and the nav lists summaries alone -- deliberately, because guides
  // and summaries are the two agreed categories. Without this link the reviews
  // are six pages at URLs nothing points at, and `check-links` says in its own
  // header that a page nobody links to is exactly what it cannot see.
  //
  // The id is the relationship: atlas emits `<review-id>_summary`, and the
  // pairing is asserted against the loaded set rather than assumed, so a
  // summary whose review is missing drops the link instead of writing a 404.
  const pairId = r.kind === 'summary' ? r.id.replace(/_summary$/, '') : `${r.id}_summary`;
  const pair = [...site.reviews, ...site.summaries].find(d => d.id === pairId);
  const pairLink = pair ? `
          <p class="rux--type-body-01"><a class="rux--link" href="${esc(pair.id)}.html">${
            r.kind === 'summary' ? 'Read the full review' : 'Read the summary'}</a></p>` : '';
  const body = `        <div class="rux--stack-vertical rux--stack-scale-5">
          <h1>${esc(r.title)}</h1>
          <div class="ln-tag-row">
            ${statusTag(r.status)}
            <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">${r.kind === 'summary' ? 'Summary' : 'Review'}</span></span>
            <span class="rux--tag rux--tag--outline"><span class="rux--tag__label">Updated ${esc(r.updated)}</span></span>
          </div>${pairLink}
        </div>

      ${slots.map(([slot, heading]) => slot === '__topics'
        ? topicsSection(r)
        : rsection(`s-${slot}`, heading, r[slot])).filter(Boolean).join('\n\n      ')}`;

  return page({ title: `${r.title} — Rux Notes`, site, activeId: r.id, body, depth: 1 });
}

// AN EXERCISE IS ORDERED PRACTICE, not guide phases. The prose block vocabulary
// is shared with reviews, while the top-level shape is an intro followed by the
// numbered assignments the learner completes.
function exercisePage(e, site) {
  const assignments = (e.assignments ?? []).map(a => {
    const id = `a-${a.n}`;
    return `<section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="${id}">
          <h2 id="${id}">${esc(a.n)}. ${esc(a.title)}</h2>
          ${(a.blocks ?? []).map(rblock).join('\n          ')}
        </section>`;
  }).join('\n        ');

  const body = `        <div class="rux--stack-vertical rux--stack-scale-5 ln-exercise">
          <h1>${esc(e.title)}</h1>
          <div class="ln-tag-row">
            ${statusTag(e.status)}
            <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">Homework</span></span>
            <span class="rux--tag rux--tag--outline"><span class="rux--tag__label">${e.assignments.length} assignments</span></span>
            <span class="rux--tag rux--tag--outline"><span class="rux--tag__label">Updated ${esc(e.updated)}</span></span>
          </div>
          ${(e.intro ?? []).map(rblock).join('\n          ')}
          ${assignments}
        </div>`;

  return page({ title: `${e.title} — Rux Notes`, site, activeId: e.id, body, depth: 1 });
}

// A CONCEPT PAGE, INTERNAL TIER ONLY. An intro, then the numbered sections
// as topics -- the review's block vocabulary under a concept's headings.
function conceptPage(c, site) {
  const topics = (c.topics ?? []).map(t => {
    const label = t.n != null ? `${t.n}. ${t.title}` : t.title;
    const id = `t-${String(t.n ?? t.title).replace(/[^A-Za-z0-9.]+/g, '-').toLowerCase()}`;
    return `<section class="rux--stack-vertical rux--stack-scale-5" aria-labelledby="${id}">
          <h2 id="${id}">${esc(label)}</h2>
          ${(t.blocks ?? []).map(rblock).join('\n          ')}
        </section>`;
  }).join('\n        ');
  const terms = (c.terms ?? []).map(t =>
    `<span class="rux--tag rux--tag--outline"><span class="rux--tag__label">${esc(t)}</span></span>`).join('\n            ');
  const body = `        <div class="rux--stack-vertical rux--stack-scale-5">
          <h1>${esc(c.title)}</h1>
          <div class="ln-tag-row">
            <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">Concept</span></span>
            <span class="rux--tag rux--tag--outline"><span class="rux--tag__label">Updated ${esc(c.updated)}</span></span>
          </div>
          <div class="ln-tag-row">
            ${terms}
          </div>
          ${(c.intro ?? []).map(rblock).join('\n          ')}
        </div>
        ${topics}`;
  return page({ title: `${c.title} — Rux Notes`, site, activeId: c.id, body, depth: 1 });
}

function guidePage(g, site) {
  const { front, back } = splitSections(g.sections);
  const body = `        <div class="rux--stack-vertical rux--stack-scale-5">
          <h1>${esc(g.title)}</h1>
          <div class="ln-tag-row">
            ${statusTag(g.status)}
            <span class="rux--tag rux--tag--gray"><span class="rux--tag__label">${g.phases.length} phases</span></span>
            <span class="rux--tag rux--tag--outline"><span class="rux--tag__label">Updated ${esc(g.updated)}</span></span>
          </div>
          <p class="rux--type-body-02">${esc(g.module)}</p>
        </div>

      ${sections(front)}

        <section class="rux--stack-vertical rux--stack-scale-7" aria-labelledby="h-phases">
          <h2 id="h-phases">Phases</h2>
          ${g.phases.map(phase).join('\n        ')}
        </section>

      ${sections(back)}${g.verification ? `

        <!-- The generated verification sentence. It is NOT a substitute for
             the status badge and README says why: one guide's sentence claims
             every phase was performed against a live system and confirmed
             while the guide itself is status: draft. Both are shown. -->
        <p class="rux--type-body-01">${esc(g.verification)}</p>` : ''}`;

  return page({ title: `${g.title} — Rux Notes`, site, activeId: g.id, body, depth: 1 });
}

// ---------------------------------------------------------------- build

// NOTHING BLOCKQUOTE-SHAPED MAY REACH THE PAGE UNRENDERED.
//
// THE FIRST VERSION OF THIS CHECK ASSERTED A COUNT -- "the rule must match
// exactly 15 blocks" -- and it was wrong for the reason the project already
// knows: a rule that needs a number edited every time the data grows is
// measuring the number, not the rule. Guides are expected to be added and
// removed often, so that check would have failed on every addition and been
// bumped without being read, which is how an exception list starts. It was
// tested by adding a guide, it refused the build, and that is what showed it.
//
// The invariant that does not move with the data: a prose block whose first
// token is the blockquote marker MUST have become a callout. If atlas adds a
// fourth label -- "Caution", say -- this fails and names it, rather than
// printing "> Caution > …" on the page as literal text. It cares about shape,
// not quantity, so seven guides and seventy both pass.
function assertNoRawBlockquotes(guides) {
  const raw = [];
  let found = 0, prose = 0;

  const visit = (b, where) => {
    if (isRows(b) || !b.tokens) return;
    prose++;
    if (asCallout(b)) { found++; return; }
    const t0 = b.tokens[0];
    if (t0 && t0.t === 'text' && t0.v.startsWith('> ')) {
      raw.push(`${where}: ${(b.text ?? '').slice(0, 90)}`);
    }
  };

  for (const g of guides) {
    for (const p of g.phases ?? []) for (const b of p.blocks ?? []) visit(b, `${g.id} phase ${p.n}`);
    for (const s of g.sections ?? []) visit(s, `${g.id} section ${s.kind}`);
  }

  if (raw.length) {
    throw new Error(
      `${raw.length} block(s) start with a blockquote marker the callout rule did not recognise:\n`
      + raw.map(r => `          ${r}`).join('\n')
      + '\n\n        Contract 2 has no `callout` kind, so tools/build.mjs infers one from the'
      + '\n        token stream and knows three labels: Warning, Note, Prerequisite. A new'
      + '\n        label lands here rather than printing "> Label >" on the page as text.'
      + '\n        Add it to LEVEL, or delete the rule if atlas has shipped the block kind.');
  }
  return { found, prose };
}

// FOUR PUBLISHED DOCUMENT CLASSES NOW ARRIVE, and they are told apart by `kind` rather
// than by filename. A guide has no `kind` field -- it predates the second
// content type -- so its absence is what identifies one, and a document
// carrying an unknown `kind` stops the build instead of being rendered as
// whatever it least resembles.
const docs = readdirSync(DATA)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(join(DATA, f), 'utf8')));

// THE CONTRACT IS PINNED HERE, NOT ONLY REPORTED. sync-guides.sh prints the
// contract set and enforces nothing, so a renderer written for one shape could
// silently consume the next. Bump this constant when this file is updated for
// a new contract, and not before.
const CONTRACT = 3;
for (const d of docs) if (Number(d.contract) !== CONTRACT)
  throw new Error(`${d.id ?? '?'}: contract ${d.contract}, this renderer reads ${CONTRACT} -- update build.mjs for it, then this constant`);

for (const d of docs) {
  const kind = d.kind ?? 'guide';
  if (!['guide', 'review', 'summary', 'exercise', 'concept'].includes(kind)) {
    throw new Error(`${d.id}: unknown kind "${kind}" -- build.mjs renders guide, review, summary, exercise, concept`);
  }
  if (kind === 'concept' && !PRIVATE) {
    throw new Error(`${d.id}: a concept has no published tier and cannot sit in data/guides/`);
  }
}

const guides = docs.filter(d => !d.kind).sort((a, b) => a.order - b.order);
const reviews = docs.filter(d => d.kind === 'review')
  .sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
const summaries = docs.filter(d => d.kind === 'summary')
  .sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
const exercises = docs.filter(d => d.kind === 'exercise')
  .sort((a, b) => String(a.title).localeCompare(String(b.title)));
const concepts = docs.filter(d => d.kind === 'concept')
  .sort((a, b) => String(a.title).localeCompare(String(b.title)));

if (!guides.length) throw new Error(`no guides in ${DATA} -- run tools/sync-guides.sh first`);

for (const g of guides) GUIDE_IDS.add(g.id);
if (PRIVATE) for (const d of [...reviews, ...summaries, ...exercises, ...concepts]) GUIDE_IDS.add(d.id);

const reach = assertNoRawBlockquotes(guides);

// REMOVAL HAS TO ACTUALLY REMOVE. A generator that only writes leaves a deleted
// guide's page on disk: out of the nav, still at a URL that resolves, still
// serving content that no longer exists upstream. That is a page which looks
// fine and is wrong, which is the failure class this project cares most about.
// The directory is rebuilt rather than added to.
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

// ASSETS AUTHORED BESIDE THE GUIDES ARE COPIED IN, and this is not optional
// either. An `image` token's `src` names a file sitting next to the guide in
// atlas -- `order-to-shipment-flowchart.svg` is the one that exists -- so the
// page references it relative to itself and it has to actually be there. It
// arrives in `data/guides/`, which is not where the pages are.
//
// A missing image is a broken image icon and nothing else; no gate here reads
// an `src`. Found by a link check, not by looking at the page.
//
// `PIN` is sync metadata rather than an asset, and `.json` is the data itself.
const assets = readdirSync(DATA).filter(f => f !== 'PIN' && !f.endsWith('.json'));
for (const a of assets) copyFileSync(join(DATA, a), join(OUT_DIR, a));

const site = { guides, reviews, summaries, exercises, concepts };

const written = [INDEX];
writeFileSync(written[0], indexPage(site));
for (const g of guides) {
  const file = join(OUT_DIR, `${g.id}.html`);
  writeFileSync(file, guidePage(g, site));
  written.push(file);
}
for (const r of [...reviews, ...summaries]) {
  const file = join(OUT_DIR, `${r.id}.html`);
  writeFileSync(file, reviewPage(r, site));
  written.push(file);
}
for (const e of exercises) {
  const file = join(OUT_DIR, `${e.id}.html`);
  writeFileSync(file, exercisePage(e, site));
  written.push(file);
}
for (const c of concepts) {
  const file = join(OUT_DIR, `${c.id}.html`);
  writeFileSync(file, conceptPage(c, site));
  written.push(file);
}

// The sprite is inlined by the tool that owns that job, on the files just
// written. Linking `vendor/rux-ds/assets/icons.svg#i-name` instead is blank in
// Safari and blocked over file://, both silently.
//
// HAND-WRITTEN PAGES THAT CARRY THE MARKERS GET THE SAME SPRITE. Until
// 2026-09-02 template-candidate.html was re-inlined by hand after every
// the pin move, which is a step a person remembers or does not; a stale sprite
// there is the silent-blank-icon failure with a later date. Listed rather than
// swept, so a page that never asked for icons is not rewritten.
const HAND = PRIVATE ? [] : ['template-candidate.html'].map(f => join(ROOT, f)).filter(existsSync);
execFileSync(process.execPath, [join(ROOT, 'tools/inline-sprite.mjs'), ...written, ...HAND],
  { stdio: 'inherit' });

console.log(`\n  built ${written.length} page(s) from ${guides.length} guide(s)`);
console.log(`  callouts: ${reach.found} of ${reach.prose} prose blocks matched the inferred rule`);
console.log('\n  Generated. Check them:  node tools/check-classes.mjs && node tools/check-structure.mjs\n');
