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
//   node tools/measure.mjs --live     # where the sibling checkouts stand; printed, never written
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

// --- upstream pins ----------------------------------------------------------
// THE PIN ONLY. Until 2026-09-02 this file also recorded each sibling's HEAD,
// how far past the pin it sat, and whether atlas's working tree was dirty. All
// three describe the MACHINE the file was written on, not this repository: two
// Macs with different pulls wrote different files from identical trees, the
// pre-commit hook staged the difference into every commit, and a divergent
// pull conflicted on it every time. Live state is printed by `--live` and by
// the sync scripts, and never committed.
head('upstreams');
const PINS = [['rux-ln-atlas', 'data/guides/PIN'], ['rux-ds', 'vendor/rux-ds/PIN']];
for (const [repo, pinFile] of PINS) {
  const pin = pinOf(pinFile);
  say(`${repo}.pin`, pin ? pin.slice(0, 7) : 'unreadable');
}

// --- the rux-ds surface SEND-DS.md counts -----------------------------------
head('rux-ds surface (SEND-DS.md quotes these)');
const dsCount = (rev, path, filter) => {
  const ls = git('rux-ds', 'ls-tree', '--name-only', rev, path);
  if (ls === null) return 'unavailable';
  return ls.split('\n').filter(Boolean).filter(filter).length;
};
const dsPin = pinOf('vendor/rux-ds/PIN');
say('rux-ds.templates.at-pin', dsCount(dsPin, 'templates/', () => true));
say('rux-ds.gates.at-pin', dsCount(dsPin, 'tools/', (n) => /\/check-/.test(n)));

// --- the guide data ---------------------------------------------------------
head('guide data');
const files = readdirSync(join(ROOT, 'data/guides')).filter((n) => n.endsWith('.json'));
const docs = files.map((n) => JSON.parse(readFileSync(join(ROOT, 'data/guides', n), 'utf8')));

// FOUR CLASSES SHARE ONE DIRECTORY, so `guides.count` has to mean guides. It
// briefly did not: reviews and summaries landed in `data/guides/` and the
// count read 19, which is the number of documents and the number of nothing
// this file's prose is about. A guide has no `kind`; that absence is what
// identifies one.
const guides = docs.filter((d) => !d.kind);
const reviewDocs = docs.filter((d) => d.kind === 'review');
const summaryDocs = docs.filter((d) => d.kind === 'summary');
const exerciseDocs = docs.filter((d) => d.kind === 'exercise');
say('guides.count', guides.length);
say('guides.contract', [...new Set(docs.map((g) => g.contract))].join('/'));
say('guides.tier', [...new Set(guides.map((g) => g.tier))].join('/'));
say('guides.draft', guides.filter((g) => g.status === 'draft').length);
say('exported.reviews', reviewDocs.length);
say('exported.summaries', summaryDocs.length);
if (exerciseDocs.length) {
  say('exported.exercises', exerciseDocs.length);
  say('exported.exercise-assignments', exerciseDocs.reduce((n, d) => n + (d.assignments ?? []).length, 0));
  say('exported.exercises.tier', [...new Set(exerciseDocs.map((d) => d.tier))].join('/'));
}
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

// --- the reviews atlas _standards/review-shape.md describes ----------------------------------
head('reviews (atlas _standards/review-shape.md quotes these)');
// Read the sibling AT THE PINNED COMMIT, never its HEAD or its working tree.
// These figures describe the content the site was built from, which is the
// only thing another machine can reproduce; what atlas has done since is
// `--live`. Reading HEAD once made the file move while atlas was mid-edit on
// all six reviews, and reading the working tree reported someone else's
// unsaved work -- a diff that means nothing, the same reason there is no
// timestamp in this file.
const atlasPin = pinOf('data/guides/PIN');
const atlasLs = atlasPin ? git('rux-ln-atlas', 'ls-tree', '--name-only', atlasPin, 'reviews/') : null;
if (atlasLs === null) {
  for (const k of ['count', 'summaries', 'sections', 'oi-ids', 'oi-ids.end-of-line'])
    say(`reviews.${k}`, 'unavailable');
} else {
  const all = atlasLs.split('\n').filter((n) => n.endsWith('.md'));
  const full = all.filter((n) => !n.endsWith('_summary.md'));
  say('reviews.count', full.length);
  say('reviews.summaries', all.length - full.length);
  const text = full.map((n) => git('rux-ln-atlas', 'show', `${atlasPin}:${n}`) ?? '');
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
// --- live checkout state: printed by check.mjs and the syncs, never written --
if (process.argv.includes('--live')) {
  for (const [repo, pinFile] of PINS) {
    const pin = pinOf(pinFile);
    const headRev = git(repo, 'rev-parse', 'HEAD');
    if (!headRev) { console.log(`  ${repo}: unavailable -- no checkout beside this one`); continue; }
    const past = pin ? (git(repo, 'rev-list', '--count', `${pin}..HEAD`) ?? '?') : '?';
    const dirty = git(repo, 'status', '--porcelain', '-uno') ? 'dirty' : 'clean';
    console.log(`  ${repo}: head ${headRev.slice(0, 7)} · pin ${pin ? pin.slice(0, 7) : '?'} · ${past} commit(s) past the pin · tracked files ${dirty}`);
  }
  process.exit(0);
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
