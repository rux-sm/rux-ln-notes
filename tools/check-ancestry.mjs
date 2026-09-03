#!/usr/bin/env node
//
// Is a wrapper Carbon never omits simply MISSING from one of these pages?
//
// WHY IT IS NOT WRITTEN HERE. This is the one defect class the four local
// gates cannot see, and the README has said so three times: `check-classes`
// asks whether a class resolves in the vendored stylesheet and `check-structure`
// asks whether a compound pair is split, and a wrapper that is absent entirely
// resolves fine and splits nothing. Answering it needs rux-ds's 669 captured
// Carbon DOM stories -- 1.8 MB that are NOT vendored, deliberately, because a
// second copy of a rule rux-ds owns is the drift this project is arranged
// against. `check-structure.mjs` refused that same trade for the same reason.
//
// SO THE GATE STAYS THERE AND IS POINTED HERE. rux-ds's check-ancestry.mjs
// takes roots on the command line for exactly this, and its own comment names
// this project as the reason: a missing `__icon` class that flexbox squashed
// from 20px to 5px, which two green gates could not see and a person found by
// looking. This file is the invocation, not the rule. Nothing crosses -- the
// pages are read from disk on the same machine and never committed, quoted or
// copied into rux-ds.
//
// IT REFUSES RATHER THAN SKIPS WHEN THE SIBLING IS MISSING. A check that
// silently passes because its evidence is absent is worse than no check, which
// is the same reason `check-publishable` reports `unavailable` instead of zero.
//
// ROOTS ARE NAMED, NOT SWEPT. rux-ds's `markupFiles()` reads .html directly in
// each root and does NOT recurse, and it skips a root that does not exist
// without saying so. Both are handled here: the two directories that hold
// pages are passed explicitly and each is verified first, so a renamed output
// directory reports rather than quietly narrowing the sweep to nothing.
//
// AT THE PIN, NOT AT HEAD. Until 2026-09-02 this ran whatever rux-ds happened
// to be checked out beside this repository, while CI (pages.yml) checks rux-ds
// out at the commit vendor/rux-ds/PIN names -- so two Macs and CI could read
// three answers from one set of pages. The pinned tree is unpacked from
// rux-ds's own history with `git archive` into a temporary directory; the
// checkout beside this one is never touched or switched. When that checkout's
// HEAD is not the pin, a second run at HEAD follows, as information about what
// the next pin move (rux-ds tools/new-project.sh) would be judged by, and its result does not count.
//
//   node tools/check-ancestry.mjs          # every page, via ../rux-ds at the pin
//   DS=../elsewhere node tools/check-ancestry.mjs
//
import { existsSync, readFileSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DS = resolve(ROOT, process.env.DS ?? '../rux-ds');
const GATE = join(DS, 'tools', 'check-ancestry.mjs');

if (!existsSync(GATE)) {
  console.error(`\n  unavailable: no rux-ds checkout at ${DS}`);
  console.error('  The captures live there and are not vendored. Clone it beside');
  console.error('  this repository, or point DS= at it. Not skipped -- a gate that');
  console.error('  passes because its evidence is missing is worse than no gate.\n');
  process.exit(1);
}

// The page directories, verified rather than assumed. `guides/` is where
// build.mjs writes; the repository root holds index.html and the one
// hand-authored page.
const ROOTS = [ROOT, join(ROOT, 'guides')].filter(dir => {
  if (existsSync(dir)) return true;
  console.error(`  unavailable: ${dir} does not exist -- has build.mjs's output moved?`);
  process.exit(1);
});

const pin = /^commit\s+([0-9a-f]{7,40})/m.exec(readFileSync(join(ROOT, 'vendor', 'rux-ds', 'PIN'), 'utf8'))?.[1];
if (!pin) {
  console.error('\n  unavailable: vendor/rux-ds/PIN names no commit, so there is nothing to check against.\n');
  process.exit(1);
}
try { execFileSync('git', ['-C', DS, 'cat-file', '-e', `${pin}^{commit}`], { stdio: 'ignore' }); }
catch {
  console.error(`\n  unavailable: ${DS} does not have the pinned commit ${pin.slice(0, 7)}.`);
  console.error('  Fetch it there -- a gate run at some other commit answers a different question.\n');
  process.exit(1);
}

const runAt = (tree, label) => {
  console.log(`\n  check-ancestry ${label}`);
  try { execFileSync(process.execPath, [join(tree, 'tools', 'check-ancestry.mjs'), ...ROOTS], { cwd: tree, stdio: 'inherit' }); return 0; }
  catch (err) { return typeof err.status === 'number' ? err.status : 1; }
};

const work = mkdtempSync(join(tmpdir(), 'rux-ds-at-pin-'));
let status;
try {
  // No shell: the path in DS is the user's and is never interpolated into a
  // command line. The archive is a few megabytes, hence the buffer ceiling.
  const archive = execFileSync('git', ['-C', DS, 'archive', pin], { maxBuffer: 512 * 1024 * 1024 });
  execFileSync('tar', ['-x', '-C', work], { input: archive, stdio: ['pipe', 'inherit', 'inherit'] });
  // The gate's ownership library reads the manifest and the captures, both in
  // the archive; node_modules is reached through the checkout's own copy.
  if (existsSync(join(DS, 'node_modules'))) symlinkSync(join(DS, 'node_modules'), join(work, 'node_modules'));
  status = runAt(work, `at the pin ${pin.slice(0, 7)} -- this is the result`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

const head = execFileSync('git', ['-C', DS, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!head.startsWith(pin)) {
  const at = runAt(DS, `at rux-ds HEAD ${head.slice(0, 7)} -- informational: what the next pin move would be judged by`);
  if (at !== 0) console.log('  (the HEAD run does not count; re-vendor and re-adjudicate when you sync)');
}
process.exit(status);
