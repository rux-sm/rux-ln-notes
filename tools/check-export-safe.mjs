#!/usr/bin/env node
//
// Does this page carry anything that came from the guide data?
//
// WHY IT EXISTS. rux-ds is PUBLIC and this repository is PRIVATE, and the rule
// in CLAUDE.md is absolute: no guide text, session code, route, screenshot or
// client value reaches a commit there, a template there, or an issue there.
// Anything sent over is authored with invented, generic content.
//
// "I WAS CAREFUL" IS NOT THE STANDARD ANYWHERE ELSE IN THIS FAMILY. atlas's
// emit.py fails closed and names the pattern rather than trusting the author;
// both syncs refuse a dirty tree rather than trusting the operator. Sending
// markup to a public repository is the one mistake here that cannot be undone
// -- a push is public before it is noticed -- so it gets the same treatment.
//
//   node tools/check-export-safe.mjs template-candidate.html
//
// WHAT IT CHECKS. Every distinctive payload string the seven guides contribute:
// session codes, routes, guide ids, and the chip/field/literal/value/button/
// status texts. A hit is reported and the run exits non-zero.
//
// WHAT IT CANNOT SEE, said plainly because a green run is easy to over-read:
//   * a real value PARAPHRASED rather than copied -- a session renamed by hand
//     is invisible to a substring search
//   * a screenshot, or anything not in the guide JSON at all
//   * whether the invented content is plausible, or defamatory, or silly
// It proves no string was copied across. It does not prove the page is safe to
// publish; a person still reads it before it goes.
//
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('usage: node tools/check-export-safe.mjs <page.html> [...]');
  process.exit(2);
}

// Generic UI words that both a real guide and an invented one will use. They
// are not evidence of anything and would drown the signal.
const GENERIC = new Set([
  'name', 'save', 'open', 'item', 'items', 'code', 'date', 'line', 'lines',
  'order', 'orders', 'value', 'values', 'field', 'fields', 'status', 'type',
  'note', 'notes', 'from', 'with', 'this', 'that', 'text', 'list', 'view',
  'edit', 'copy', 'close', 'print', 'search', 'select', 'total', 'quantity',
  'currency', 'address', 'approve', 'approved', 'draft', 'new',
  'warehouse', 'warehouses', 'product', 'production', 'purchase', 'planning',
  'default', 'defaults', 'complete', 'update', 'warning', 'supplier', 'number',
  'reference', 'record', 'records', 'phase', 'phases', 'review', 'variant',
  'variants', 'component', 'components', 'quantity', 'available', 'existing',
  'confirm', 'confirmed', 'active', 'header', 'footer', 'button', 'screen',
]);

// Two thresholds, and the split is the point. The named-thing types are
// distinctive at six characters -- a session code or a screen name is either
// copied or it is not. `text`, `strong` and `em` are ORDINARY ENGLISH: at six
// characters they match "in the" and ", then" and drown the signal, so they
// only count as evidence at sentence length.
const MIN = 6;
const MIN_PROSE = 40;
const PROSE_TYPES = new Set(['text', 'strong', 'em']);
const needles = new Map(); // lowercased string -> where it came from

const add = (s, where, prose = false) => {
  if (typeof s !== 'string') return;
  const v = s.trim();
  if (v.length < (prose ? MIN_PROSE : MIN)) return;
  if (GENERIC.has(v.toLowerCase())) return;
  // A bare number is not evidence. The inlined sprite is full of path
  // coordinates like "1.12", and every guide numbers its steps that way.
  if (/^[\d.\s]+$/.test(v)) return;
  if (!needles.has(v.toLowerCase())) needles.set(v.toLowerCase(), where);
};

const DIR = join(ROOT, 'data', 'guides');
const files = readdirSync(DIR).filter(f => f.endsWith('.json'));
for (const f of files) {
  const g = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  add(g.id, `${f}: id`);
  add(f.replace(/\.json$/, ''), `${f}: filename`);
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== 'object') return;
    // The payload keys, per the contract. `v` is NOT the only one -- session
    // keeps its code, button its label, command/path their route.
    if (typeof o.t === 'string') {
      const prose = PROSE_TYPES.has(o.t);
      for (const k of ['v', 'code', 'route', 'label', 'src', 'alt', 'location']) add(o[k], `token ${o.t}.${k}`, prose);
    }
    if (typeof o.sessionCode === 'string') add(o.sessionCode, 'phase.sessionCode');
    if (typeof o.route === 'string') add(o.route, 'phase.route');
    if (typeof o.session === 'string') add(o.session, 'phase.session');
    for (const v of Object.values(o)) walk(v);
  })(g);
}

let failed = 0;
for (const target of targets) {
  // The sprite is generated from icons.svg by tools/inline-sprite.mjs and
  // carries no guide data -- only Carbon path coordinates, which collide with
  // step ids. Scanning it produces noise and no signal.
  // WHAT A READER SEES, NOT THE MARKUP. Scanning raw HTML matched `rux--header`
  // against a button whose location is "header", and `--item--active` against a
  // status of "Active" -- class names are rux-ds's vocabulary, not this
  // project's content, and they generated only false positives. Text nodes plus
  // the attributes that carry prose (title, alt, aria-label, href) are the
  // surface that can actually leak.
  const raw = readFileSync(join(ROOT, target), 'utf8')
    .replace(/<!-- SPRITE:BEGIN[\s\S]*?SPRITE:END -->/g, '');
  const attrs = [...raw.matchAll(/\b(?:title|alt|aria-label|href)="([^"]*)"/g)].map(m => m[1]).join(' ');
  const hay = (raw.replace(/<[^>]*>/g, ' ') + ' ' + attrs).toLowerCase();
  const hits = [];
  for (const [needle, where] of needles) if (hay.includes(needle)) hits.push({ needle, where });
  if (hits.length) {
    failed = 1;
    console.log(`\n  ${target}: ${hits.length} string(s) from the guide data\n`);
    for (const h of hits.slice(0, 25)) console.log(`    "${h.needle}"  <-  ${h.where}`);
    if (hits.length > 25) console.log(`    ... and ${hits.length - 25} more`);
  } else {
    console.log(`  ${target}: clean — none of ${needles.size} guide strings appear`);
  }
}

console.log(`\n  ${needles.size} distinctive strings from ${files.length} guides · ${targets.length} page(s) checked`);
console.log('  This says nothing was COPIED. It does not say the page is safe to publish.');
process.exit(failed);
