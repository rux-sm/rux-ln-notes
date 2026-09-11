// tools/specimen-kinds.mjs -- the kind vocabulary, three ways, side by side.
//
// WHY IT EXISTS. DESIGN-diagram-kinds.md proposes replacing five unkeyed hues
// with three forms and one accent, and a plan about how something LOOKS cannot
// be settled by reading it. This draws the alternatives against the real
// diagrams so the choice is made by looking.
//
// IT WRITES INTO build/, WHICH IS GIT-IGNORED AND NEVER PUBLISHED. This is a
// decision aid, not a page. `check-publishable` skips `build/` by name, so the
// specimen does not become a 38th page in MEASURED, and AGENTS.md's rule that
// markup lives in build.mjs is untouched: nothing here is authored twice.
//
// THE MARKUP IS THE REAL MARKUP, LIFTED WHOLE. The figure and the entire
// inlined stylesheet are copied out of the built pages, so variant A is the
// live site byte for byte and every variant differs from it by CSS alone. A
// hand-drawn mock-up would prove nothing -- the thing being judged is how these
// treatments behave in a grid whose columns are `1fr` and size to their widest
// tile, which is exactly what a mock-up gets wrong.
//
//   node tools/specimen-kinds.mjs && open the URL it prints
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// THE SESSION MAP IS THE CONTROL AND THE OVERVIEW IS THE CASE. All 24 of the
// map's nodes are sessions, so the new form draws nothing there and any change
// it shows is a change the plan did not intend. Nine of the overview's
// seventeen are not sessions, and three of its kinds collide today.
const DOCS = [
  ['overview', 'guides/order-to-shipment-overview.html',
    'Level 1. 8 of 17 nodes are sessions; step, decision and outcome collide today.',
    'order-to-shipment-overview'],
  ['session map', 'guides/demand-to-shipment-session-map.html',
    'Level 2. 24 of 24 are sessions, so the not-a-session form draws nothing.',
    'demand-to-shipment-session-map'],
];

const slice = (html, open, close) => {
  const i = html.indexOf(open);
  const j = html.indexOf(close, i);
  if (i < 0 || j < 0) throw new Error(`could not find ${open}`);
  return html.slice(i, j + close.length);
};

const first = read(DOCS[0][1]);
const baseCss = slice(first, '<style>', '</style>').replace(/^<style>|<\/style>$/g, '');

// BESIDE THE PATH IS A FACT ABOUT EDGES, WHICH CSS CANNOT SEE. Whether a node
// is a session is in the markup already -- it has a code or it has not -- but
// whether it is ever WALKED is a property of the edge list, and the figure
// carries no edges. So the class is injected here, from the data, into the
// markup of EVERY variant. Variants that do not style it are unaffected and the
// comparison stays CSS-only; if a treatment is chosen, build.mjs emits the
// class outright and this goes away.
//
// THE TEST IS "NO `flow` EDGE, IN OR OUT". A node the sequence never enters or
// leaves is one you do not step through -- it has to be true for the path to
// work, and you go and make it true separately. It lands on exactly the right
// four nodes of the overview (the whole Master Data lane: items, the purchase
// item, the BOM and routing, the planning cluster row) and exactly the right
// three of the session map (the parameter and inventory checks, which D3 of
// the map already calls reads rather than numbered steps). It needs no lane to
// be named "Master Data" and no new field from atlas.
const offPathIds = (dg) => {
  const walked = new Set();
  for (const e of dg.edges ?? []) if (e.kind === 'flow') { walked.add(e.from); walked.add(e.to); }
  return new Set((dg.nodes ?? []).filter((n) => !walked.has(n.id)).map((n) => n.id));
};

// TILE ORDER IS THE ORDER build.mjs EMITS CELLS -- lane by lane, and inside a
// lane stage by stage. Reproducing it here is what lets an index line a tile up
// with its node. The count is asserted rather than trusted: if build.mjs ever
// changes that loop, this stops silently agreeing and says so.
const nodeOrder = (dg) => (dg.lanes ?? []).flatMap((l) =>
  (dg.stages ?? []).flatMap((st) =>
    (dg.nodes ?? []).filter((n) => n.lane === l.name && n.stage === st.n)));

const markOffPath = (fig, dg) => {
  const order = nodeOrder(dg), off = offPathIds(dg);
  let i = 0;
  const out = fig.replace(/class="ln-dg-node ln-dg-node--([a-z]+)"/g, (m, kind) => {
    const node = order[i++];
    if (!node) throw new Error('more tiles in the figure than nodes in the data');
    if (node.kind !== kind) throw new Error(`tile ${i} is ${kind}, node ${node.id} is ${node.kind}`);
    return off.has(node.id) ? `${m.slice(0, -1)} ln-dg-node--off-path"` : m;
  });
  if (i !== order.length) throw new Error(`${i} tiles, ${order.length} nodes`);
  return out;
};

const figures = DOCS.map(([name, path, note, json]) => {
  const dg = JSON.parse(read(`data/guides/${json}.json`)).diagram;
  const fig = slice(read(path), '<figure class="rux--tile ln-dg"', '</figure>');
  const off = offPathIds(dg).size;
  return [name, `${note} ${off} of ${dg.nodes.length} sit beside the path.`,
    markOffPath(fig, dg)];
});

// A VARIANT IS CSS AND NOTHING ELSE, and `:has()` is why it can be. Whether a
// node is a session is already in the markup -- a tile with a code renders
// `.ln-dg-node-code` and a tile without one renders nothing -- so the third
// form is selectable without a single new class, a new attribute or a change
// to build.mjs. If the plan is taken, build.mjs should still emit the class
// outright rather than leaning on this; here it keeps the variants honest by
// making the markup provably identical across all three.
const NOT_A_SESSION = '.ln-dg-node:not(:has(.ln-dg-node-code))';

const VARIANTS = [
  {
    id: 'a', name: 'A — today',
    blurb: `Five hues, one dashed form, one default. No legend on either page.
      <b>decision</b> and <b>outcome</b> have no rule at all, so they render exactly as
      <b>step</b>. This is the live site.`,
    css: '',
  },
  {
    id: 'c', name: 'C — fix only the collision',
    blurb: `The conservative option. Keep every hue exactly as it is and add the missing
      third form, so a thing that is not a session stops looking like one. Fixes finding 1
      of the plan and declines findings 2 and 3 — five hues still have to be learned,
      and blue-vs-green still restates the column.`,
    css: `
      .v-c ${NOT_A_SESSION} { border-inline-start: 0; padding-inline-start: 3px;
        background: var(--rux-layer-accent-01, #e0e0e0); }
      .v-c ${NOT_A_SESSION} > summary .ln-dg-node-name { font-style: italic; font-weight: 500; }`,
  },
  {
    id: 'd', name: 'D — the path, and what has to be set up first',
    blurb: `Two axes, both already in the data and neither needing a new field.
      <b>On the path or beside it</b> is the primary split, because following the
      sales-to-order route is the first thing the map is for: a node the sequence never
      enters or leaves is setup or a check — it has to be true, and you go and make it
      true somewhere else. Beside-the-path tiles get a full dashed card, set in from the
      column edge, at <i>full</i> weight — they are prerequisites, not background.
      <b>Can I open it</b> is the second: a code means a screen, and a tile without one
      is a state or a question, so it loses the stripe that says "a box you open".
      The one hue stays on the silent checkpoints.`,
    css: `
      .v-d .ln-dg-node { --dg-accent: var(--rux-border-strong-01, #8d8d8d); }
      .v-d .ln-dg-node--gate, .v-d .ln-dg-node--decision {
        --dg-accent: var(--rux-support-warning, #f1c21b); }
      /* Axis 2, on the path: a thing that is not a session loses the stripe. */
      .v-d ${NOT_A_SESSION} { border-inline-start: 0; padding-inline-start: 3px;
        background: var(--rux-layer-accent-01, #e0e0e0); }
      .v-d ${NOT_A_SESSION}.ln-dg-node--gate,
      .v-d ${NOT_A_SESSION}.ln-dg-node--decision {
        border-inline-start: 3px solid var(--dg-accent); padding-inline-start: 0; }
      .v-d ${NOT_A_SESSION} > summary .ln-dg-node-name { font-style: italic; font-weight: 500; }
      /* Axis 1, and it WINS where they meet: a dashed card, inset, full weight.
         Inset rather than tinted, because the run of solid tiles left to right IS
         the path and a card that sits off that line reads as beside it. Weight is
         deliberately not reduced -- the planning cluster row is the difference
         between an item planning can see and one it silently cannot. */
      /* SPECIFICITY IS LOAD-BEARING HERE AND THE FIRST DRAFT LOST IT. The
         not-a-session selector uses :has(), which takes the specificity of its argument, so the not-a-session selector is
         three classes and beat a two-class off-path selector: the BOM and
         the planning cluster row -- the two setup items that are not sessions,
         and the two this variant most needs to get right -- kept the faint
         treatment. Measured, not spotted: six tiles colliding by path where
         the design says zero. Doubling the class matches it and the later
         declaration wins. */
      .v-d .ln-dg-node.ln-dg-node--off-path {
        border: 1px dashed var(--rux-border-strong-01, #8d8d8d);
        background: transparent;
        margin-inline-start: .75rem; padding-inline-start: 0; }
      .v-d .ln-dg-node.ln-dg-node--off-path > summary .ln-dg-node-name {
        font-style: normal; font-weight: 600; }
      /* A silent checkpoint keeps its hue wherever it stands. */
      .v-d .ln-dg-node.ln-dg-node--off-path.ln-dg-node--gate,
      .v-d .ln-dg-node.ln-dg-node--off-path.ln-dg-node--decision {
        border-color: var(--dg-accent); }`,
  },
  {
    id: 'b', name: 'B — one axis only (can I open it)',
    blurb: `Three forms carry <i>can I open this</i> and nothing else: a solid tile is a
      session you change, a dashed tile is one you only read, a tinted patch is not a session
      at all. One hue is kept, for the checkpoints where the chain fails silently.
      <b>Its weakness is what D fixes:</b> it puts the master-data prerequisites in the same
      faint bucket as a mid-flow state like <i>planned production order</i>, so setup reads as
      background when it is the thing the rest of the chain depends on.`,
    css: `
      /* Every tile back to the default; then the three forms and the one accent. */
      .v-b .ln-dg-node { --dg-accent: var(--rux-border-strong-01, #8d8d8d); }
      .v-b .ln-dg-node--gate, .v-b .ln-dg-node--decision {
        --dg-accent: var(--rux-support-warning, #f1c21b); }
      /* "read" keeps the treatment it already had -- it is the one kind that
         was on the contract's axis all along, and the plan is built on it. */
      .v-b .ln-dg-node--read { border-inline-start-style: dashed; background: transparent; }
      /* Not a session: a tinted ground and an italic name, and no stripe -- a
         stripe is what says "a box you open". THE STRIPE COMES BACK FOR A
         CHECKPOINT, and that is the specimen's own correction: the first draft
         removed it from every non-session, and on the overview EVERY gate is
         codeless, so the one hue the plan kept was invisible on the page whose
         content is mostly gates. Section 2's third takeaway -- the chain fails
         silently in four places -- was the thing being hidden. Form and hue are
         independent axes; a checkpoint that is not a session is both. */
      .v-b ${NOT_A_SESSION} { border-inline-start: 0; padding-inline-start: 3px;
        background: var(--rux-layer-accent-01, #e0e0e0); }
      .v-b ${NOT_A_SESSION}.ln-dg-node--gate,
      .v-b ${NOT_A_SESSION}.ln-dg-node--decision {
        border-inline-start: 3px solid var(--dg-accent); padding-inline-start: 0; }
      .v-b ${NOT_A_SESSION} > summary .ln-dg-node-name { font-style: italic; font-weight: 500; }`,
  },
];

// WHAT THE READOUT COUNTS, AND THE ONE IT GOT WRONG FIRST. It began with a
// single `collisions` figure -- tiles sharing an appearance with a tile of a
// different KIND -- copied from DESIGN-diagram-kinds.md §5 item 1. Run against
// the variants it scored B at 17 of 17 colliding, worse than today's 9, which
// is nonsense: B deliberately merges nine kinds into three forms, so measuring
// it by kind assumes the very thing A and C assert and B denies. A metric that
// can only rank one of the options is not a measurement, it is the conclusion
// wearing a number. §5 item 1 is wrong as written and this is the correction.
//
// So there are two, and they answer different questions. `by kind` is how many
// tiles cannot be told from a tile of another kind -- the right question ONLY
// if every kind must be distinguishable at rest, which is what is being
// decided. `by register` is how many cannot be told from a tile in another of
// the three groups the plan says actually matter: a session you change, a
// session you only read, a thing that is not a session. That one is scored the
// same way for every variant, including the ones that never set out to satisfy
// it, so it can rank all three. `appearances` is how many distinct looks a
// reader must learn with no legend, and lower is better in every variant.
const READOUT = `
const sig = el => { const s = getComputedStyle(el);
  const nm = getComputedStyle(el.querySelector('.ln-dg-node-name'));
  return [s.borderInlineStartColor, s.borderInlineStartStyle, s.borderInlineStartWidth,
          s.backgroundColor, nm.fontStyle].join('|'); };
const kindOf = n => [...n.classList].find(c => c.startsWith('ln-dg-node--')).slice(12);
// The three groups the plan says the canvas must keep apart. A tile with a
// code is a session; 'read' is the session you only look at.
const registerOf = n => !n.querySelector('.ln-dg-node-code') ? 'state'
  : kindOf(n) === 'read' ? 'look' : 'act';
// Beside the path or on it -- the split D makes primary.
const pathOf = n => n.classList.contains('ln-dg-node--off-path') ? 'beside' : 'on';
function collisions(nodes, label) {
  const by = new Map();
  for (const n of nodes) {
    const s = sig(n);
    if (!by.has(s)) by.set(s, new Set());
    by.get(s).add(label(n));
  }
  return nodes.filter(n => by.get(sig(n)).size > 1).length;
}
// THE CODE LINE IS A CUE AND LEAVING IT OUT FLATTERS THE ARGUMENT. A tile that
// is a session renders its session code under the name and one that is not
// renders nothing, so the two are not strictly identical even in variant A.
// Whether a second line of small grey text reads as a CATEGORY is the thing in
// dispute -- it is information, but it is not a form, and a box shaped like a
// box you open, in a grid of boxes you open, reads as one. So both figures are
// reported and neither is hidden: 'form' is the strict test, 'form+code' gives
// today's design the benefit of the doubt.
const sigWithCode = n => sig(n) + '|' + !!n.querySelector('.ln-dg-node-code');
function collisionsBy(nodes, label, signature) {
  const by = new Map();
  for (const n of nodes) {
    const s = signature(n);
    if (!by.has(s)) by.set(s, new Set());
    by.get(s).add(label(n));
  }
  return nodes.filter(n => by.get(signature(n)).size > 1).length;
}
function score(scope) {
  const nodes = [...scope.querySelectorAll('.ln-dg-node')];
  const fig = scope.querySelector('.ln-dg');
  return { tiles: nodes.length,
    appearances: new Set(nodes.map(sig)).size,
    byKind: collisions(nodes, kindOf),
    byRegister: collisions(nodes, registerOf),
    byRegisterCode: collisionsBy(nodes, registerOf, sigWithCode),
    byPath: collisions(nodes, pathOf),
    scrolls: fig.scrollWidth > fig.clientWidth,
    col: Math.round(parseFloat(getComputedStyle(
      scope.querySelector('.ln-dg-grid')).gridTemplateColumns.split(' ')[1])) };
}
function paint() {
  for (const box of document.querySelectorAll('[data-score]')) {
    const r = score(box);
    const m = (n) => \`<b class="\${n ? 'bad' : 'ok'}">\${n}</b>\`;
    box.querySelector('[data-out]').innerHTML =
      \`<b>\${r.tiles}</b> tiles · <b>\${r.appearances}</b> looks to learn · \` +
      \`colliding: \${m(r.byPath)} by path · \${m(r.byRegister)} by register \` +
      \`(\${m(r.byRegisterCode)} counting the code line) · \${m(r.byKind)} by kind · \` +
      \`column <b>\${r.col}px</b> · \${r.scrolls ? 'figure scrolls' : 'figure fits'}\`;
  }
}
paint();
new MutationObserver(paint).observe(document.documentElement,
  { attributes: true, attributeFilter: ['data-theme'] });
window.addEventListener('resize', paint);
`;

const sections = figures.map(([name, note, fig]) => `
      <h2>${name}</h2>
      <p class="note">${note}</p>
      ${VARIANTS.map(v => `
      <section class="variant v-${v.id}" data-score>
        <h3>${v.name}</h3>
        <p class="blurb">${v.blurb}</p>
        <p class="out" data-out></p>
        ${fig}
      </section>`).join('')}`).join('\n');

const html = `<!doctype html>
<html lang="en" data-theme="white">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Diagram kinds — three ways</title>
<link rel="stylesheet" href="/rux-ds/assets/fonts/plex.css">
<link rel="stylesheet" href="/rux-ds/css/rux.css">
<link rel="stylesheet" href="/rux-ds/css/rux-theme.css">
<link rel="stylesheet" href="/rux-ds/css/rux-overrides.css">
<link rel="stylesheet" href="../rux-theme.css">
<link rel="stylesheet" href="../rux-overrides.css">
<style>
${baseCss}
/* --- the specimen's own chrome, which is not part of any variant --------- */
body { margin: 0; padding: 2rem clamp(1rem, 4vw, 3rem) 6rem;
  background: var(--rux-background, #fff); color: var(--rux-text-primary, #161616); }
h1 { margin: 0 0 .25rem; }
h2 { margin: 3rem 0 .25rem; padding-block-start: 1.5rem;
  border-block-start: 1px solid var(--rux-border-subtle-01, #e0e0e0); }
h3 { margin: 0 0 .25rem; font-size: 1rem; }
.lede, .note, .blurb { color: var(--rux-text-secondary, #525252); max-width: 62ch; }
.lede { margin: 0 0 1rem; }
.note { margin: 0 0 1rem; font-size: .875rem; }
.blurb { margin: 0 0 .5rem; font-size: .8125rem; line-height: 1.5; }
.variant { margin-block: 1.5rem 2.5rem; }
.out { font: .75rem/1.5 var(--rux-code-01-font-family, ui-monospace, monospace);
  margin: 0 0 .75rem; color: var(--rux-text-secondary, #525252); }
.out .ok  { color: var(--rux-support-success, #24a148); }
.out .bad { color: var(--rux-support-error, #da1e28); }
.themes { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap;
  position: sticky; top: 0; z-index: 20; padding: .75rem 0;
  background: var(--rux-background, #fff); }
.themes button { font: inherit; font-size: .8125rem; cursor: pointer;
  padding: .25rem .75rem; color: inherit;
  background: var(--rux-layer-01, #f4f4f4);
  border: 1px solid var(--rux-border-subtle-01, #e0e0e0); }
.themes button[aria-pressed="true"] { background: var(--rux-layer-accent-01, #e0e0e0);
  border-color: var(--rux-border-strong-01, #8d8d8d); }
${VARIANTS.map(v => v.css).join('\n')}
</style>
</head>
<body>
<h1>Diagram kinds — three ways</h1>
<p class="lede">The same markup three times; only the CSS differs. Variant A is the live
site byte for byte. <b>Looks to learn</b> is how many distinct appearances a reader must
pick up with no legend on the page — lower is better for every variant.
<b>Colliding by register</b> is tiles that cannot be told apart from one in another of the
three groups that matter: a session you change, a session you only read, a thing that is
not a session at all. <b>By kind</b> is the stricter test, that all nine kinds be
distinguishable at rest — which is the question being decided, so it ranks A and C and is
unfair to B by construction. Everything is measured on what is drawn, in the theme you are
in: switch themes and watch the numbers hold or move.</p>
<div class="themes"><span>Theme</span>
  ${['white', 'g10', 'g90', 'g100'].map(t =>
    `<button type="button" data-theme-set="${t}" aria-pressed="${t === 'white'}">${t}</button>`).join('')}
</div>
${sections}
<script>
for (const b of document.querySelectorAll('[data-theme-set]')) {
  b.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', b.dataset.themeSet);
    for (const o of document.querySelectorAll('[data-theme-set]'))
      o.setAttribute('aria-pressed', String(o === b));
  });
}
${READOUT}
</script>
</body>
</html>
`;

mkdirSync(join(ROOT, 'build'), { recursive: true });
writeFileSync(join(ROOT, 'build/specimen-kinds.html'), html);
console.log(`  build/specimen-kinds.html · ${VARIANTS.length} variants × ${figures.length} documents`);
console.log('  http://localhost:8640/rux-ln-notes/build/specimen-kinds.html');
