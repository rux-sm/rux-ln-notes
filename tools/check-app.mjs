#!/usr/bin/env node
//
// rux-ds's SHARED app check, run from the vendored copy so this project and CI
// read the same bytes -- the same wiring rux-scheduler has had since it was
// scaffolded, and which this project did not.
//
// WHY IT WAS ADDED, 2026-09-09. The seven gates beside it are this project's
// own and none of them reads a TOKEN. So `var(--rux-font-mono)`, a name rux-ds
// has never declared, shipped in 28 generated pages with every gate green and
// the commit hook satisfied. It rendered correctly the whole time -- every use
// carried a fallback -- which is exactly why nothing noticed. It was found by
// running this file's own implementation from a rux-ds clone, from outside.
//
// WHAT IT ADDS that the gates here do not: tokens, and file references and id
// references over every page rather than a named few. It also re-checks
// classes, which check-classes already does; the duplication is left rather
// than removed, because deleting a gate to tidy up is not this change's job.
//
// It reads the PINNED bytes -- vendor/rux-ds at whatever tag PIN names -- so a
// class or token added to rux-ds since that tag is correctly unknown here.
await import('../vendor/rux-ds/tools/app-check.mjs');
