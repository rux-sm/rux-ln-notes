#!/usr/bin/env node
//
// Re-derive every countable claim this project makes about itself.
//
// WHY IT EXISTS. The prose in this repository carries measurements -- 112 issue
// ids, 108 session codes, 1,110 export strings, six rux-ds templates, seventeen
// gates -- and prose is the one place nothing checks. Three of those were stale
// before anyone noticed, and one of them was stale inside an unsent ask.
//
// IT DOES NOT WRITE PROSE, DELIBERATELY. The argument in README.md is the
// valuable part of it and no generator can write "a draft is labelled on the
// page, not withheld from it". This writes STATE. A person reads the diff and
// writes the sentence, the same way sync-*.sh writes a PIN and a person reads
// what moved.
//
//   node tools/measure.mjs            # write MEASURED
//   node tools/measure.mjs --check    # exit 1 if MEASURED is out of date
//
// NO TIMESTAMP IN THE OUTPUT. A file that changes on every run has a diff that
// means nothing. Upstream state is recorded as a commit, not as a date.
//
// WHAT IT CANNOT SEE. Whether a number is USED correctly in a sentence. It can
// tell you 112 became 118; it cannot tell you the paragraph around it now
// argues the wrong thing. And a claim nobody thought to measure is not here at
// all -- absence from this file is not evidence.
//
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = [];
const say = (k, v) => out.push(`${k} = ${v}`);
const head = (t) => out.push('', `# ${t}`);

// A sibling that is not on disk is reported as unavailable, never omitted.
// Omitting it would shrink the file, and a shorter file reads as "fine".
const git = (repo, ...args) => {
  const dir = join(ROOT, '..', repo);
  if (!existsSync(dir)) return null;
  try { return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' }).trim(); }
  catch { return null; }
};

const pinOf = (file) => {
  const m = readFileSync(join(ROOT, file), 'utf8').match(/^commit\s+(\S+)/m);
  return m ? m[1] : null;
};

// --- upstream pins, and how far behind they sit -----------------------------
head('upstreams');
for (const [repo, pinFile] of [['rux-ln-atlas', 'data/guides/PIN'], ['rux-ds', 'vendor/rux-ds/PIN']]) {
  const pin = pinOf(pinFile);
  say(`${repo}.pin`, pin ? pin.slice(0, 7) : 'unreadable');
  const headRev = git(repo, 'rev-parse', 'HEAD');
  if (!headRev) { say(`${repo}.head`, 'unavailable'); say(`${repo}.behind`, 'unavailable'); continue; }
  say(`${repo}.head`, headRev.slice(0, 7));
  const behind = git(repo, 'rev-list', '--count', `${pin}..HEAD`);
  say(`${repo}.behind`, behind ?? 'unavailable');
}

// --- the rux-ds surface SEND-DS.md counts -----------------------------------
head('rux-ds surface (SEND-DS.md quotes these)');
const dsCount = (rev, path, filter) => {
  const ls = git('rux-ds', 'ls-tree', '--name-only', rev, path);
  if (ls === null) return 'unavailable';
  return ls.split('\n').filter(Boolean).filter(filter).length;
};
const dsPin = pinOf('vendor/rux-ds/PIN');
for (const [label, rev] of [['at-pin', dsPin], ['at-head', 'HEAD']]) {
  say(`rux-ds.templates.${label}`, dsCount(rev, 'templates/', () => true));
  say(`rux-ds.gates.${label}`, dsCount(rev, 'tools/', (n) => /\/check-/.test(n)));
}

// --- the guide data ---------------------------------------------------------
head('guide data');
const files = readdirSync(join(ROOT, 'data/guides')).filter((n) => n.endsWith('.json'));
const docs = files.map((n) => JSON.parse(readFileSync(join(ROOT, 'data/guides', n), 'utf8')));

// THREE CLASSES SHARE ONE DIRECTORY, so `guides.count` has to mean guides. It
// briefly did not: reviews and summaries landed in `data/guides/` and the
// count read 19, which is the number of documents and the number of nothing
// this file's prose is about. A guide has no `kind`; that absence is what
// identifies one.
const guides = docs.filter((d) => !d.kind);
const reviewDocs = docs.filter((d) => d.kind === 'review');
const summaryDocs = docs.filter((d) => d.kind === 'summary');
say('guides.count', guides.length);
say('guides.contract', [...new Set(docs.map((g) => g.contract))].join('/'));
say('guides.tier', [...new Set(guides.map((g) => g.tier))].join('/'));
say('guides.draft', guides.filter((g) => g.status === 'draft').length);
say('exported.reviews', reviewDocs.length);
say('exported.summaries', summaryDocs.length);
say('exported.reviews.tier', [...new Set([...reviewDocs, ...summaryDocs].map((d) => d.tier))].join('/'));
say('exported.topics', [...reviewDocs, ...summaryDocs]
  .reduce((n, d) => n + (d.topics ?? []).length, 0));

const byType = new Map();
const walk = (x) => {
  if (Array.isArray(x)) return x.forEach(walk);
  if (x && typeof x === 'object') {
    if (typeof x.t === 'string') byType.set(x.t, (byType.get(x.t) ?? 0) + 1);
    Object.values(x).forEach(walk);
  }
};
guides.forEach(walk);
const total = [...byType.values()].reduce((a, b) => a + b, 0);
say('tokens.total', total);
say('tokens.types', byType.size);
// The bite README calls out: reaching for token.v blanks these without erroring.
const NON_V = ['session', 'button', 'command', 'path', 'image'];
say('tokens.payload-not-v', NON_V.reduce((a, t) => a + (byType.get(t) ?? 0), 0));
say('tokens.pencil', byType.get('pencil') ?? 0);
for (const t of [...byType.keys()].sort()) say(`tokens.type.${t}`, byType.get(t));

// SEND-BACK-2.md section 3 rests on these two and they are NOT the same
// number: `sources` is everything a guide cites, `session` tokens are only what
// a reader meets inside a step. Measuring one and printing it beside a claim
// about the other is how a state file starts lying with true numbers.
const inSources = new Set(guides.flatMap((g) => g.sources ?? []));
const inSteps = new Set();
const stepWalk = (x) => {
  if (Array.isArray(x)) return x.forEach(stepWalk);
  if (x && typeof x === 'object') {
    if (x.t === 'session' && typeof x.code === 'string') inSteps.add(x.code);
    Object.values(x).forEach(stepWalk);
  }
};
guides.forEach(stepWalk);
say('session-codes.in-sources', inSources.size);
say('session-codes.in-steps', inSteps.size);

// --- what check-export-safe holds -------------------------------------------
head('export gate');
const safe = execFileSync('node', [join(ROOT, 'tools/check-export-safe.mjs'), 'template-candidate.html'],
  { cwd: ROOT, encoding: 'utf8' });
say('export.strings', safe.match(/(\d+) distinctive strings/)?.[1] ?? 'unreadable');
say('export.candidate-clean', /clean/.test(safe) ? 'yes' : 'NO');

// --- the reviews REVIEW-SHAPE.md describes ----------------------------------
head('reviews (REVIEW-SHAPE.md quotes these)');
// Read the sibling at HEAD, never from its working tree. Measured the other
// way once and the file moved because atlas was mid-edit on all six reviews --
// a diff that reports someone else's unsaved work is a diff that means nothing,
// the same reason there is no timestamp in this file. `.dirty` says the working
// tree differs so a reader knows the counts are behind, without the counts
// themselves moving.
const atlasLs = git('rux-ln-atlas', 'ls-tree', '--name-only', 'HEAD', 'reviews/');
if (atlasLs === null) {
  for (const k of ['count', 'summaries', 'sections', 'oi-ids', 'oi-ids.end-of-line', 'dirty'])
    say(`reviews.${k}`, 'unavailable');
} else {
  say('reviews.dirty', git('rux-ln-atlas', 'status', '--porcelain', '--', 'reviews/') ? 'yes' : 'no');
  const all = atlasLs.split('\n').filter((n) => n.endsWith('.md'));
  const full = all.filter((n) => !n.endsWith('_summary.md'));
  say('reviews.count', full.length);
  say('reviews.summaries', all.length - full.length);
  const text = full.map((n) => git('rux-ln-atlas', 'show', `HEAD:${n}`) ?? '');
  const heads = new Set(text.flatMap((t) => t.split('\n').filter((l) => l.startsWith('## '))));
  say('reviews.sections', heads.size);
  const ids = text.flatMap((t) => t.match(/OI-\d{3}/g) ?? []);
  say('reviews.oi-ids', ids.length);
  say('reviews.oi-ids.end-of-line',
    text.flatMap((t) => t.split('\n')).filter((l) => /OI-\d{3}$/.test(l)).length);

  // WHICH MECHANISM COVERS EACH ID, because REVIEW-SHAPE.md section 4 rests on
  // this and went stale by four-fold once already. It was written at 288bf72
  // (112 ids, 10 at end of line) and quoted those numbers while atlas's
  // INTERNAL migration moved them to 111 and 43 -- a document asking for a
  // mechanism that had since been built. Nothing watched it, so nothing said.
  //
  // `internal` is the id sitting on a line carrying an INTERNAL marker, which
  // emit.py's _degap() removes STRUCTURALLY -- it breaks out of the cell, so
  // the rest of the sentence goes with the id rather than leaving a hole.
  // `frontmatter` is the `issues:` list, which is never a sentence.
  // `residual` is everything else, and is the number section 4 is now about.
  const lines = text.flatMap((t) => t.split('\n'));
  const idsOn = (pred) => lines.filter(pred).flatMap((l) => l.match(/OI-\d{3}/g) ?? []).length;
  say('reviews.oi-ids.internal', idsOn((l) => l.includes('INTERNAL')));
  say('reviews.oi-ids.frontmatter', idsOn((l) => l.startsWith('issues:')));
  say('reviews.oi-ids.residual',
    idsOn((l) => !l.includes('INTERNAL') && !l.startsWith('issues:')));
}

// --- what stands between these pages and a public repository? ---------------
// THE POINT OF PUBLISHING IS TRAINEES READING IT, and the content rewrite that
// clears these lives in atlas. Tracking the counts here means the rewrite has
// a number that moves rather than a judgement someone renews -- the same
// reason every other figure in this file is derived. `check-publishable.mjs`
// owns the patterns; this records its totals so a diff shows progress.
head('publishable (0 in every row is the condition for going public)');
{
  const out = (() => {
    try {
      return execFileSync('node', [join(ROOT, 'tools/check-publishable.mjs')],
        { encoding: 'utf8', cwd: ROOT });
    } catch (e) { return e.stdout ?? ''; }
  })();
  // THE HEADLINE IS THE PAGE COUNT, not the class rows. A clean run prints no
  // class rows at all, so keying off them recorded `unavailable` on the run
  // where everything finally passed -- a state file saying it could not
  // measure, at the exact moment the measurement was zero.
  const summary = /(\d+) page\(s\) · (\d+) carrying/.exec(out);
  say('publishable.pages', summary ? summary[1] : 'unavailable');
  say('publishable.pages-flagged', summary ? summary[2] : 'unavailable');
  for (const [, n, what] of out.matchAll(/^\s*(\d+)\s\s(.+?)\s*$/gm)) {
    say(`publishable.${what.replace(/^an? /, '').replace(/\s+/g, '-')}`, n);
  }
}

// --- has anything been delivered? -------------------------------------------
// The drift that started all of this. Delivery is visible only as a mention in
// the recipient, so that is what gets looked at -- not the bold word in the
// document, which is the thing that was wrong.
head('delivery (a mention in the recipient, not a word in the document)');
const EXCHANGE = [['SEND-BACK.md', 'rux-ln-atlas'], ['SEND-BACK-2.md', 'rux-ln-atlas'],
  ['REVIEW-SHAPE.md', 'rux-ln-atlas'], ['DIAGRAM-REPLY.md', 'rux-ln-atlas'],
  ['SEND-DS.md', 'rux-ds']];
for (const [doc, repo] of EXCHANGE) {
  const hit = git(repo, 'grep', '-l', '--', doc, 'HEAD');
  say(`delivered.${doc}`, hit === null ? (existsSync(join(ROOT, '..', repo)) ? 'no' : 'unavailable') : 'yes');
}

// --- and has it been ANSWERED? ----------------------------------------------
// DELIVERY WAS MEASURED AND THE REPLY WAS NOT, WHICH COST FOUR COMMITS.
// `review-shape-reply.md` had said section 4 was answered -- twice, in its
// opening and its closing line -- while README.md went on claiming atlas was
// blocked on section 4 and this side re-argued a settled question. Delivery
// answers "did they see it". Nothing answered "did they reply", so a stale
// sentence about another repository survived being read.
//
// A reply is a file in the recipient naming the ask, which is the convention
// already in use: atlas's are `_standards/<ask>-reply.md`. This reports the
// file's existence, never its contents -- whether the reply CONCEDES anything
// is a person's reading, and a generator that tried would be the same mistake
// in a new place.
head('replies (a file in the recipient, not a claim in the ask)');
for (const [doc, repo] of EXCHANGE) {
  const stem = doc.replace(/\.md$/, '').toLowerCase();
  const ls = git(repo, 'ls-tree', '-r', '--name-only', 'HEAD');
  if (ls === null) { say(`replied.${doc}`, 'unavailable'); continue; }
  // EXACT STEM, NOT A SUBSTRING. `send-back` is a prefix of `send-back-2`, so
  // an includes() test reported SEND-BACK.md as answered by send-back-2-reply.
  const want = `${stem}-reply.md`;
  const hit = ls.split('\n').find((f) => f.toLowerCase().split('/').pop() === want);
  say(`replied.${doc}`, hit ?? 'no');
}

const body = out.join('\n').replace(/^\n/, '') + '\n';
const path = join(ROOT, 'MEASURED');

if (process.argv.includes('--check')) {
  const have = existsSync(path) ? readFileSync(path, 'utf8') : '';
  if (have === body) { console.log('MEASURED is current.'); process.exit(0); }
  console.error('MEASURED is out of date. Re-run without --check, read the diff,');
  console.error('and fix the prose that quotes whatever moved.');
  const a = have.split('\n'), b = body.split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) { if (a[i] !== undefined) console.error(`  - ${a[i]}`); if (b[i] !== undefined) console.error(`  + ${b[i]}`); }
  }
  process.exit(1);
}
writeFileSync(path, body);
console.log(body);
