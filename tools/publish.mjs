#!/usr/bin/env node
//
// THE ONE PUBLISH COMMAND. Atlas edit -> this -> GitHub Pages, as one run.
//
//   node tools/publish.mjs --dry-run    # preflight and report; writes nothing tracked
//   node tools/publish.mjs --prepare    # sync, build, check, report; commits nothing
//   node tools/publish.mjs --publish    # the whole route, through the hooks, to Pages
//
// WHY IT LIVES HERE AND NOT IN ATLAS. Atlas's HANDOFF.md states the direction
// as a principle: this repository pulls, atlas never pushes. Everything the
// route needs is already here -- sync-guides.sh, build.mjs, check.mjs, the two
// hooks and the Pages workflow -- and a deployment tool in the knowledge
// repository would contradict its own AGENTS.md, which excludes publishing-
// surface work. Atlas keeps the DECISION to publish; this keeps the mechanism.
//
// IT COORDINATES GATES THAT EXIST AND ADDS NONE THEY ALREADY HOLD.
// sync-guides.sh refuses a dirty or unpushed atlas and writes the PIN with a
// hash of what it emitted; check-data refuses data that did not come through
// it; emit.py writes nothing if a forbidden name survives; check.mjs runs every
// gate; the commit hook runs the privacy gate over the staged bytes and stages
// MEASURED; pages.yml deploys only after its own check job. What this adds is
// the fetch before comparing, the refusal of a dirty or unlevel tree on THIS
// side, the public diff as a report, and watching the deployment to its end.
//
// IT FAILS CLOSED. Any input it cannot reach -- a missing sibling, a fetch
// that fails, an absent `gh`, a hook that refuses -- is a stop, reported as
// "not checked", never a pass. A dry run collects every blocker and still
// prints the diff report, so one run says everything that stands in the way;
// --prepare and --publish stop at the first.
//
// NEVER --no-verify. The pre-commit hook regenerates MEASURED and stages it,
// and the commit-msg hook holds the message format; a commit around them is
// not a publication this tool made.
//
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ATLAS = process.env.ATLAS ?? join(ROOT, '..', 'rux-ln-atlas');
const DATA = join(ROOT, 'data', 'guides');
const PIN = join(DATA, 'PIN');
const LIVE_URL = 'https://rux-sm.github.io/rux-ln-notes/';

// The two repositories this route is written for, by remote. A checkout of
// something else beside this one is not "atlas" because its directory is
// called that. https and ssh spellings both match.
const EXPECTED = {
  atlas: /github\.com[:/]rux-sm\/rux-ln-atlas(?:\.git)?$/,
  notes: /github\.com[:/]rux-sm\/rux-ln-notes(?:\.git)?$/,
};

// What a run writes and later stages. Nothing outside this list is ever
// added to the publish commit; MEASURED is the hook's to stage.
const WRITES = ['data/guides', 'guides', 'index.html'];

// --- mode --------------------------------------------------------------------
const args = new Set(process.argv.slice(2));
const MODES = ['--dry-run', '--prepare', '--publish'];
const chosen = MODES.filter(m => args.has(m));
if (chosen.length !== 1 || args.size !== 1) {
  console.error(`usage: node tools/publish.mjs ${MODES.join(' | ')}`);
  console.error('exactly one mode, and no default: a publish is an intent, never a fallback');
  process.exit(2);
}
const MODE = chosen[0].slice(2);
const DRY = MODE === 'dry-run';

// --- plumbing ----------------------------------------------------------------
const blockers = [];
const stop = (what, why) => {
  blockers.push([what, why]);
  if (DRY) return;
  report();
  process.exit(1);
};
const heading = (t) => console.log(`\n── ${t}`);
const say = (t) => console.log(`  ${t}`);

// A subprocess result is three things: it ran and said yes, it ran and said
// no, or it could not be asked. The third is never the first.
function run(cmd, argv, opts = {}) {
  const r = spawnSync(cmd, argv, { encoding: 'utf8', ...opts });
  if (r.error) return { ok: false, unreachable: true, out: '', err: String(r.error.message ?? r.error) };
  return { ok: r.status === 0, unreachable: false, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim(), status: r.status };
}
const git = (repo, ...argv) => run('git', ['-C', repo, ...argv]);
const gitOut = (repo, ...argv) => { const r = git(repo, ...argv); return r.ok ? r.out : null; };
const inherit = (cmd, argv, cwd) => run(cmd, argv, { cwd, stdio: 'inherit', encoding: undefined });

const pinCommit = () => existsSync(PIN) ? /^commit\s+([0-9a-f]{7,40})/m.exec(readFileSync(PIN, 'utf8'))?.[1] ?? null : null;
const short = (sha) => (sha ?? '?').slice(0, 7);

// --- 1. preflight ------------------------------------------------------------
heading(`preflight (${MODE})`);

const repos = { atlas: ATLAS, notes: ROOT };
for (const [name, dir] of Object.entries(repos)) {
  if (!existsSync(join(dir, '.git'))) { stop(`${name} checkout`, `no git repository at ${dir}`); continue; }
  const origin = gitOut(dir, 'remote', 'get-url', 'origin');
  if (origin === null) stop(`${name} remote`, 'origin could not be read; not checked');
  else if (!EXPECTED[name].test(origin)) stop(`${name} remote`, `origin is ${origin}, not rux-sm/rux-ln-${name}`);
  else say(`${name}: ${dir}  (origin ${origin})`);

  const branch = gitOut(dir, 'rev-parse', '--abbrev-ref', 'HEAD');
  if (branch !== 'main') stop(`${name} branch`, `on ${branch ?? '?'}, not main`);
}

// Fetch first. sync-guides.sh compares against the last fetch and says so;
// a level check against a stale origin/main is a check against a guess.
for (const [name, dir] of Object.entries(repos)) {
  if (!existsSync(join(dir, '.git'))) continue;
  const f = git(dir, 'fetch', '--quiet', 'origin');
  if (!f.ok) { stop(`${name} fetch`, `git fetch failed: ${f.err || 'no output'}; level-ness not checked`); continue; }
  const counts = gitOut(dir, 'rev-list', '--left-right', '--count', 'origin/main...HEAD');
  if (counts === null) { stop(`${name} level`, 'origin/main...HEAD could not be counted; not checked'); continue; }
  const [behind, ahead] = counts.split(/\s+/).map(Number);
  say(`${name}: HEAD ${short(gitOut(dir, 'rev-parse', 'HEAD'))} · ${behind} behind · ${ahead} ahead of origin/main`);
  if (behind > 0) stop(`${name} level`, `${behind} commit(s) behind origin/main; pull first`);
  // ATLAS: a pin names a commit, and an unpushed one names nothing anywhere
  // else (sync-guides.sh's reason). NOTES: a publish push carries every
  // unpushed commit with it, so they would be published as a side effect of
  // this run rather than on purpose. Push them on their own first.
  if (ahead > 0) stop(`${name} pushed`, `${ahead} commit(s) not on origin/main; push them first`);
}

// Dirty trees. Tracked changes only (-uno), for sync-guides.sh's reason: an
// untracked file is not in any commit a pin could name. Atlas is checked here
// as well as in the sync so a dry run can report it without running the sync.
for (const [name, dir] of Object.entries(repos)) {
  if (!existsSync(join(dir, '.git'))) continue;
  const st = git(dir, 'status', '--porcelain', '-uno');
  if (!st.ok) { stop(`${name} tree`, 'git status failed; cleanliness not checked'); continue; }
  if (st.out) stop(`${name} tree`, `uncommitted changes to tracked files:\n      ${st.out.split('\n').join('\n      ')}`);
  else say(`${name}: tracked files clean`);
}

// The atlas gate. It fails closed and prints why.
{
  const g = inherit('python3', ['tools/check.py'], ATLAS);
  if (g.unreachable) stop('atlas gate', `python3 tools/check.py could not be started: ${g.err}`);
  else if (!g.ok) stop('atlas gate', `check.py exited ${g.status}`);
  else say('atlas gate: clean');
}

// gh is needed only to watch the deployment, but a publish that cannot be
// watched is a publish whose result this tool would have to guess.
if (MODE === 'publish' || DRY) {
  const v = run('gh', ['auth', 'status']);
  if (v.unreachable) { if (MODE === 'publish') stop('gh', 'gh is not installed; the deployment could not be watched'); else say('gh: not installed (a --publish would stop here)'); }
  else if (!v.ok) { if (MODE === 'publish') stop('gh', 'gh is not authenticated; the deployment could not be watched'); else say('gh: not authenticated (a --publish would stop here)'); }
  else say('gh: authenticated');
}

const atlasHead = gitOut(ATLAS, 'rev-parse', 'HEAD');
const previousPin = pinCommit();
say(`atlas ${short(atlasHead)} would become the pinned revision (previous pin ${short(previousPin)})`);

// --- 2. the public diff, as a report -------------------------------------------
// A dry run emits into a temporary directory and compares it with
// data/guides/ so the report is real -- emit.py's sweep runs, so a forbidden
// name is caught here too -- and nothing tracked moves. Prepare and publish
// run the sync itself, which is the only thing that may write data/guides/.

const hashTree = (dir) => {
  const m = new Map();
  if (!existsSync(dir)) return m;
  for (const f of readdirSync(dir)) {
    if (f === 'PIN') continue;
    m.set(f, createHash('sha256').update(readFileSync(join(dir, f))).digest('hex'));
  }
  return m;
};
const compare = (before, after) => {
  const added = [...after.keys()].filter(k => !before.has(k)).sort();
  const removed = [...before.keys()].filter(k => !after.has(k)).sort();
  const changed = [...after.keys()].filter(k => before.has(k) && before.get(k) !== after.get(k)).sort();
  return { added, removed, changed };
};
const list = (label, items) => { say(`${label}: ${items.length}`); for (const i of items) say(`    ${i}`); };

const dataBefore = hashTree(DATA);
let dataDiff = null;
let pageDiff = null;

if (DRY) {
  heading('documents (emitted to a temporary directory, compared with data/guides/)');
  const tmp = mkdtempSync(join(tmpdir(), 'ln-publish-'));
  try {
    const e = run('python3', ['tools/emit.py', '--all', '--reviews', '--exercises', '--out', tmp], { cwd: ATLAS });
    if (e.unreachable) stop('emit', `emit.py could not be started: ${e.err}`);
    else if (!e.ok) { stop('emit', `emit.py refused (exit ${e.status}); the diff is not known`); console.log(e.out); console.error(e.err); }
    else {
      dataDiff = compare(dataBefore, hashTree(tmp));
      list('added', dataDiff.added); list('changed', dataDiff.changed); list('removed', dataDiff.removed);
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  say('pages: not built in a dry run; the page diff follows the document diff');
} else {
  heading('prepare: sync');
  const s = inherit('sh', ['tools/sync-guides.sh'], ROOT);
  if (s.unreachable || !s.ok) stop('sync', `sync-guides.sh ${s.unreachable ? 'could not be started' : `exited ${s.status}`}`);
  const pinned = pinCommit();
  if (pinned !== atlasHead) stop('pin', `PIN names ${short(pinned)} but atlas HEAD is ${short(atlasHead)}`);
  dataDiff = compare(dataBefore, hashTree(DATA));

  heading('prepare: build');
  const b = inherit('node', ['tools/build.mjs'], ROOT);
  if (b.unreachable || !b.ok) stop('build', `build.mjs ${b.unreachable ? 'could not be started' : `exited ${b.status}`}`);

  heading('prepare: check');
  const c = inherit('node', ['tools/check.mjs'], ROOT);
  if (c.unreachable || !c.ok) stop('check', `check.mjs ${c.unreachable ? 'could not be started' : `exited ${c.status}`}`);

  heading('documents');
  list('added', dataDiff.added); list('changed', dataDiff.changed); list('removed', dataDiff.removed);

  heading('pages');
  const st = gitOut(ROOT, 'status', '--porcelain', '--', 'guides', 'index.html');
  if (st === null) stop('page diff', 'git status failed; the page diff is not known');
  else {
    const rows = st ? st.split('\n') : [];
    const by = (codes) => rows.filter(r => codes.includes(r[0]) || codes.includes(r[1])).map(r => r.slice(3));
    pageDiff = { added: by('A?'), changed: by('M'), removed: by('D') };
    list('added', pageDiff.added); list('changed', pageDiff.changed); list('removed', pageDiff.removed);
  }
}

// What moved in atlas since the previous pin, so the report says what is
// being published in the source's own words.
if (previousPin && atlasHead && previousPin !== atlasHead) {
  heading(`atlas ${short(previousPin)}..${short(atlasHead)}`);
  const log = gitOut(ATLAS, 'log', '--oneline', '--no-decorate', `${previousPin}..${atlasHead}`);
  if (log === null) say('(range could not be read: the previous pin is not in this atlas)');
  else for (const l of log.split('\n')) say(l);
}

// --- 3. publish ----------------------------------------------------------------
function report() {
  if (!blockers.length) return;
  heading(`${MODE}: STOPPED — ${blockers.length} blocker(s)`);
  for (const [what, why] of blockers) say(`${what}: ${why}`);
}

if (DRY) {
  report();
  if (!blockers.length) say('\n  dry run: nothing blocks a publish. Nothing tracked was written.');
  process.exit(blockers.length ? 1 : 0);
}

const nothingPublic = dataDiff.added.length + dataDiff.changed.length + dataDiff.removed.length === 0
  && pageDiff && pageDiff.added.length + pageDiff.changed.length + pageDiff.removed.length === 0;

if (nothingPublic) {
  // An internal-only atlas change. The data and the pages are byte-identical,
  // so the pin still names the commit that produced them and the previous
  // publication stays exact. Restore the PIN rather than commit a date bump.
  heading('nothing to publish');
  say(`no document or page differs from what is published; atlas moved ${short(previousPin)} -> ${short(atlasHead)} with no public effect`);
  const r = git(ROOT, 'checkout', '--', 'data/guides/PIN');
  say(r.ok ? 'PIN restored; the working tree is as it was' : `PIN could NOT be restored (${r.err}); run git checkout -- data/guides/PIN`);
  process.exit(r.ok ? 0 : 1);
}

if (MODE === 'prepare') {
  heading('prepared, not committed');
  say('review the tree with git diff; then node tools/publish.mjs --publish, or git checkout -- . to discard');
  process.exit(0);
}

heading('publish: commit');
const add = git(ROOT, 'add', '--', ...WRITES);
if (!add.ok) stop('stage', `git add failed: ${add.err}`);
const subject = `chore(data): Publish atlas @ ${short(atlasHead)}`;
const body = [
  `Atlas ${atlasHead}.`,
  `Documents: ${dataDiff.added.length} added, ${dataDiff.changed.length} changed, ${dataDiff.removed.length} removed.`,
  `Pages: ${pageDiff.added.length} added, ${pageDiff.changed.length} changed, ${pageDiff.removed.length} removed.`,
  '',
  'Made by tools/publish.mjs through both hooks.',
].join('\n');
const commit = inherit('git', ['-C', ROOT, 'commit', '-m', subject, '-m', body], ROOT);
if (commit.unreachable || !commit.ok) stop('commit', `the hooks refused the commit (exit ${commit.status}); nothing was pushed`);
const notesHead = gitOut(ROOT, 'rev-parse', 'HEAD');
say(`committed ${short(notesHead)}  ${subject}`);

heading('publish: push');
const push = inherit('git', ['-C', ROOT, 'push', 'origin', 'main'], ROOT);
if (push.unreachable || !push.ok) stop('push', `git push exited ${push.status}; the commit is local only`);

heading('publish: deployment');
// The run for this commit appears a few seconds after the push. Find it by
// head sha, never "the latest", which could be the previous publication.
let runId = null;
for (let i = 0; i < 30 && !runId; i++) {
  const l = run('gh', ['run', 'list', '--workflow', 'pages.yml', '--branch', 'main', '--limit', '5', '--json', 'databaseId,headSha'], { cwd: ROOT });
  if (l.ok) {
    try { runId = JSON.parse(l.out).find(r => r.headSha === notesHead)?.databaseId ?? null; } catch { /* retry */ }
  }
  if (!runId) spawnSync('sleep', ['2']);
}
let conclusion = 'not checked';
let runUrl = '';
if (!runId) {
  blockers.push(['deployment', 'no pages.yml run for this commit appeared within a minute; check GitHub Actions']);
} else {
  const w = inherit('gh', ['run', 'watch', String(runId), '--exit-status'], ROOT);
  const v = run('gh', ['run', 'view', String(runId), '--json', 'conclusion,url'], { cwd: ROOT });
  try { ({ conclusion, url: runUrl } = JSON.parse(v.out)); } catch { /* reported below */ }
  if (!w.ok) blockers.push(['deployment', `pages.yml concluded ${conclusion}; the previous deployment stays live`]);
}

heading('result');
const level = (dir) => gitOut(dir, 'rev-list', '--left-right', '--count', 'origin/main...HEAD') === '0\t0';
const clean = (dir) => gitOut(dir, 'status', '--porcelain', '-uno') === '';
say(`atlas commit   ${atlasHead}`);
say(`notes commit   ${notesHead}`);
say(`deployment     ${conclusion}${runUrl ? `  ${runUrl}` : ''}`);
say(`live           ${LIVE_URL}`);
say(`atlas tree     ${clean(ATLAS) ? 'clean' : 'DIRTY'} · ${level(ATLAS) ? 'level with origin' : 'NOT level with origin'}`);
say(`notes tree     ${clean(ROOT) ? 'clean' : 'DIRTY'} · ${level(ROOT) ? 'level with origin' : 'NOT level with origin'}`);
report();
process.exit(blockers.length ? 1 : 0);
