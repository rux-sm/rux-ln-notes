# Send-back to rux-ds: one more template

**Sent 2026-09-06**, the way everything in this family is sent: read in place,
and pointed at from the other side's own handover — rux-ds `README.md`
"Picking this up" names this file and its exhibit as an open item. Nothing was
copied across, because rux-ds admits nothing from this domain into any
directory, and this memo names it throughout. This is the first thing this
project has ever asked of the design system, and it asks for one template and
one decision. Written 2026-09-01; §3, §5 and §6 were brought up to date on the
day it was sent, and each says what changed.

`send-back.md` and `send-back-2.md`, now in atlas `_standards/`, run the other way and
are about *what arrives*. This one is about *what it is rendered with*.

Enclosed: **`template-candidate.html`**, a complete page carrying invented
content, drafted here and offered for adoption there.

## Why this comes with a candidate rather than a question

`docs/composing-pages.md` §1 says to start from a template and never from
scratch, and that is what was done — `templates/detail-page.html`, on the
mapping table's "viewing one record" row. It carried the shell whole, including
§3.2's content offset and §3.3's `--side-nav--ux` width, and both survived the
copy intact.

It stopped fitting at the content. A detail page is one record seen several
ways, through tabs. A procedure is one record read **top to bottom, in order**,
with a numbered phase structure, eleven tables, and inline tagging at a density
no existing template exercises — 117 tags on the real page.

That is a different shape, and it is a **generic** one. It is an article, a
runbook, a policy, a manual. Nothing about it is ERP.

## §1 The ask: `templates/document-page.html`

One more template, beside the ones already there. The candidate demonstrates
the shape:

| part | what it is |
| :--- | :--- |
| header block | breadcrumb, `h1`, summary paragraph, a plain container of status and facet tags |
| notification | a status banner, and callouts inline in the body |
| overview table | a short "at a glance" table with a checkbox column |
| numbered sections | `h2` carrying a phase tag, a route line, then a table of steps |
| trailing tables | run record, troubleshooting, variants, downstream |

It uses **no class rux-ds does not compile.** `check-classes` reports 80
classes, all resolving; `check-structure` reports 213 classed elements with no
split compounds. It carries two page-level rules in its `<head>`: §3.2's offset,
copied verbatim from `detail-page.html`, and one `tr[data-optional]` rule that
invents no class name.

**The candidate is a draft, not a specification.** If the shape is right but the
markup is wrong, the useful outcome is rux-ds authoring the real one and this
project copying it — the same way it copied `detail-page.html`.

## §2 The blocking question: a route does not fit a tag

Nine of the fifteen token types in the guide data mean "a named thing in the UI".
Seven of them map cleanly onto compiled tag variants and look right.

**Two do not, and this is the decision that cannot be made here.**
`.rux--tag` sets `max-inline-size: 13rem` and `.rux--tag__label` sets
`overflow: hidden; text-overflow: ellipsis`. A menu route —
three or four segments joined by arrows — measured **324px against a 192px
label** and was silently ellipsised. A route is the single thing a reader most
needs whole; a truncated one is worse than useless, because it looks complete.

Four long field names truncate the same way at 200–212px.

They are set as plain text for now, which loses the visual distinction the other
seven have. Three ways out, and the choice belongs to rux-ds:

1. **`.rux--tag-label-tooltip` is Carbon's own answer** and is already in the
   stylesheet. The tooltip component arrived in `0aa5ed7`. If that is the
   intended pairing, say so and this project will use it.
2. **A wider or wrapping tag variant**, if one is admissible in Carbon's terms.
3. **A tag is the wrong component for a route**, and something else is right.

**What this project will not do is write a local rule that overrides a `rux--`
component's own sizing.** AGENTS.md forbids it, and the first draft of
`detail-page.html` records why: invented classes are invisible to
`check-classes`, so an override that is wrong is also unpoliced.

## §3 What could not be checked here, and was found by hand instead

rux-ds runs its own gates, many of them. This project runs two, because both
derive from the vendored stylesheet and `docs/` is not vendored. The gap is not theoretical —
**three defects passed both local checks** while the page was built:

1. **A notification icon squashed 20px to 5px.** The `__icon` class was omitted,
   so the flex row collapsed the svg. Every class *present* resolved, and the
   absent one is invisible to a checker that reads class attributes. This is
   exactly `check-ancestry`'s defect class, and it was caught by measuring in a
   browser — which is luck, not method.
2. **Sixteen tag pairs sat flush**, a marker token rendering as a tag against
   the tag that follows it in the data. Carbon tags carry no margin by design.
3. **Numbered sections rendered after their own troubleshooting**, because the
   data holds them in two arrays and file order is not reading order.

The first is the one that matters here. **A `check-ancestry` run over the
candidate is worth more to this project than approval of it.** When this was
written it could not be obtained on this side at any effort. **Since
2026-09-01 it can** (`a14b1f4` here): `tools/check-ancestry.mjs` here points your gate at this
repository's pages from the checkout beside it, and the candidate was among
the first files it read. It raised one finding on the candidate,
`btn--icon-only`, adjudicated upstream at `aa56e76` as the icon-tooltip the
sink declines throughout, and reads 0 missing today. So §3's ask is met by
the arrangement, and what remains is §1 and §2.

## §4 What this is not asking

- **Not asking rux-ds to review the content decisions.** Which colour means
  which token, what order the sections read in, what a phase is — those are
  about LN procedures and this project's readers, and rux-ds has no authority
  over them and should not acquire one.
- **Not asking for anything ERP-shaped.** If the template is adopted it should
  be named and documented for what it is generically. Nothing in it should
  imply this project exists.
- **Not sending a page.** See below.

## §5 The candidate carries nothing from the guide data, and that is proved

`rux-ds` is public. `AGENTS.md` here is absolute: no guide text, session code,
route, screenshot or client value reaches a commit, a template or an issue
there, and anything that crosses is authored with invented, generic content.

**"I was careful" is not the standard anywhere else in this family** — atlas's
`emit.py` fails closed and names the pattern, and both syncs refuse a dirty
tree. So the same treatment applies:

**How it was proved, and what proves it today — these are two different
gates, and the memo said otherwise until 2026-09-06.** While the candidate
was drafted, `check-export-safe` extracted every distinctive payload string
the seven guides contribute — 1,110 of them, across session codes, routes,
guide ids, and the chip, field, literal, value, button and status texts — and
refused the page if any appeared, with ordinary English held to sentence
length. It was verified in both directions: the candidate clean at 0 of
1,110, the real page failing at 173 hits. Two real leaks were caught that way
and would otherwise have gone: the candidate's side nav listed all seven real
guide titles, and one sentence had been lifted verbatim from a real run record.

That gate was **retired on 2026-09-01**, because its exemption model had made
it vacuous over every generated page; the record is in this repository's
history. What holds the candidate now is the one gate this repository runs
over every page and Markdown file:

```sh
node tools/check-publishable.mjs template-candidate.html
```

It counts five classes — a person named, a vendor document filename, an
evidence filename, an issue reference, a gap marker — and the candidate reads
zero in each. It does **not** re-extract guide payloads, so the 0-of-1,110
result above is a fact about the page as it stood on 2026-09-01, and the
candidate has not been edited since (`git log` on it is the check).

**What neither gate can see, stated plainly:** a real value paraphrased rather
than copied, anything not in the guide JSON, and whether the invented content
is sensible. A person reads the page before it goes. A gate proves nothing was
copied; it does not prove the page is fit to publish.

## §5b Why this document quotes no counts of yours

An earlier draft said "a seventh template, beside the six" and "gated by all
seventeen checks". Both were measured, both were true at `0aa5ed7` — the commit
this project has vendored — and both were wrong by the time anyone read them:
thirty commits on, that is nine templates and twenty gates, and it moved twice
more while this paragraph was being written.

So the ask no longer depends on a number this project cannot keep current. You
know how many templates you have. **What this asks for is a shape you do not
have**, and that claim survives whatever the count is.

The general form of the mistake is worth naming, because it is the same one
`§3` is about: a measurement pasted into prose is a fact at the moment of
writing and an assertion forever after. Everything countable this project says
about itself now regenerates into `MEASURED`, and the pin drift that caught
this is a line in it.

## §6 What happens if it is adopted

The artifact lands in **two places, and they are not copies of each other**:

| | holds | content |
| :--- | :--- | :--- |
| `rux-ds` | `templates/document-page.html`, gated the way every template there is | invented |
| `rux-ln-notes` | `guides/<id>.html`, written by `tools/build.mjs` — the LN binding of it | real |

This project then records which rux-ds commit its page derives from, the way
`vendor/rux-ds/PIN` already records which commit the stylesheet came from. A
template that drifts upstream becomes visible here the same way the stylesheet
does.

And every other content type is already the same shape. When this was written
`reviews/` was decided but unbuilt; it has since arrived, and so have
summaries and exercises, and all three render from the same shell minus the
numbered phases — which is precisely what a document template is for. The
template would now be bound four times over, not once.
