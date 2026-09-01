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
//   node tools/check-ancestry.mjs          # every page, via ../rux-ds
//   DS=../elsewhere node tools/check-ancestry.mjs
//
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
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

try {
  execFileSync(process.execPath, [GATE, ...ROOTS], { cwd: DS, stdio: 'inherit' });
} catch (err) {
  process.exit(typeof err.status === 'number' ? err.status : 1);
}
