#!/usr/bin/env node
//
// THE ONE CHECK. Runs every gate this repository has, in order, and exits 1 if
// any of them fails. `node tools/check.mjs` is what a person types, what the
// commit hook runs last, and what CI would run.
//
// WHY ONE FILE. Six check scripts exist and until this one only one of them
// ran without being typed. A gate nobody runs is a gate that passed, and
// the repository already recorded that shape once (a dead link shipped with
// everything else green). This file adds no rule; it only makes sure the rules
// that exist are asked.
//
// MEASURED IS REPORTED, NOT ENFORCED. Since 2026-09-02 it records only what is
// derived from this repository and the two PINs, so it is the same file on
// every machine and moves only when the data or a pin moves. Refusing a commit
// over it would still be a gate people route around, so its result prints and
// does not fail. Re-run `node tools/measure.mjs` when it says so. Where the
// sibling checkouts stand is printed below by `measure --live`, never written.
//
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Order: the cheap structural checks first, publishability last so its
// refusal is the final word on the screen.
const GATES = [
  ['check-classes',     []],
  ['check-structure',   []],
  ['check-links',       []],
  ['check-order',       []],
  ['check-ancestry',    []],
  ['check-data',        []],
  ['check-publishable', []],
];

const run = (script, args) =>
  spawnSync(process.execPath, [join(ROOT, 'tools', `${script}.mjs`), ...args],
            { cwd: ROOT, stdio: 'inherit' }).status ?? 1;

const failed = [];
for (const [gate, args] of GATES) {
  console.log(`\n── ${gate}`);
  if (run(gate, args) !== 0) failed.push(gate);
}

// THE HOOKS ARE PER CLONE, and until 2026-09-02 nothing here said so: a fresh
// clone commits with no checks and every gate still passes. Reported, not
// enforced -- CI has no hooks and no need of them.
if (!process.env.CI) {
  const hp = (spawnSync('git', ['config', 'core.hooksPath'], { cwd: ROOT, encoding: 'utf8' }).stdout ?? '').trim();
  if (hp !== 'tools/githooks')
    console.log('\n  WARNING: commit hooks are not armed in this clone — git config core.hooksPath tools/githooks');
}

console.log('\n── measure --check (informational)');
const stale = run('measure', ['--check']) !== 0;

console.log('\n── siblings (live, never committed)');
run('measure', ['--live']);

console.log('');
if (stale) console.log('  MEASURED is stale — run `node tools/measure.mjs` and commit it.');
if (failed.length) {
  console.log(`  FAILED: ${failed.join(', ')}`);
  process.exit(1);
}
console.log(`  ${GATES.length} gates passed.`);
