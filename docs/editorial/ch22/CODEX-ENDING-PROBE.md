# Chapter 22: bounded ending probe

2026-10-25. Against the settlement at `9a4c5a3` and the author's subsequent scope
change at **`15be228`**, which governs. This branch already contains that commit;
no rebase was needed.

The later premise note at **`4b4be3f`** is accepted too. This report documents the
evidence; its sections are not a manuscript checklist. The draft should follow
the audit mistake, the new grouping and who gets to write it. Supporting repairs
may take one line; they do not each need a tutorial or a separate scene.

**Recommendation: a local Verdict. Supply the named template for the current
request, retain console parameter editing, and defer the general authoring editor
until the third recombination request.** The deferral meets the stated current
requirements. A further requirement that it violates would have to be invented.
The author has dropped the Act III open-ending requirement; this finding creates
no debt to move elsewhere and needs no staged dissent.

This is the one bounded round, not a chapter draft. Evidence: **6 compiler cases /
8 runtime groups**, all passing on **TypeScript 7.0.2 / Node v22.23.3**, using the
book profile (`strict`, `exactOptionalPropertyTypes`, ES2022, Node16, `types: []`).
The installed dependencies are the locked versions, including Zod 4.6.2.
`.probe/codex-ending/run.cjs`, `RESULTS.json` and `run.log` hold the untracked
sources, diagnostic text and results. Only this report is to be committed.

## 1. The request and the two working answers

The scene needs the risk team's request before either representation: hold a
large order in any country, or a smaller order matching the FR refund pattern.
This is supplied policy, not a policy decision Dafna or Eden makes. In the probe,
large means **total greater than 500**; velocity means **at least three refunds
within seven days**, expressed as `count: 2` and `>`.

Both designs implement:

```text
large total OR (country FR AND refund velocity)
```

Dafna's input is a parsed, versioned tree with `any` around a total condition and
an `all` of country and velocity. It has **five nodes, maximum depth three**.
Eden's input names `large-or-country-velocity` and supplies four parameters:
`amount`, `country`, `count`, `days`. Its separately loaded code evaluates:

```typescript
const hold = large || (country && velocity);
```

The template is actually implemented; Eden does not promise to write it after the
comparison. Both factories produce the same `(order: Order) => Decision` shape.
Both inspect the three leaves for explanation, even when a Boolean short circuit
could have decided the hold earlier. `Decision` contains the hold flag, matching
rule ID, and the three check results.

### Same inputs, decisions and reasons

The fixture covers all eight Boolean combinations. Low/high totals are 500/501.
The two refund histories are `[1, 2, 8]` and `[1, 2, 7]` days ago, so the boundary
at seven is exercised rather than assumed.

| Large? | Country | Three recent refunds? | Both designs hold? |
|---|---|---|---|
| No | FR | No | No |
| No | FR | Yes | Yes |
| No | US | No | No |
| No | US | Yes | No |
| Yes | FR | No | Yes |
| Yes | FR | Yes | Yes |
| Yes | US | No | Yes |
| Yes | US | Yes | Yes |

**Five holds**, with identical reason IDs and check results in both designs.
There is no surviving behavioral difference in the current request.

The console can change amount, count, country and days in either design. Four
parameter-change probes produce identical held sets on the same eight orders.
Those changes need neither a new predicate nor a new rule kind.

### Both get the repairs already accepted

- **Replay works.** Replacing the inner `all` with `any` wrongly adds two holds:
  the low-total FR order without velocity, and the low-total US order with
  velocity. The equivalent wrong code expression has the same results. A shared
  replay gate rejects both candidates and accepts both correct ones.
- **The known-version reader works.** Version-1 rule and parameter records without
  `days` both acquire seven. Missing days in version 2 and unknown versions are
  rejected. The current version is not silently given an arbitrary default.
- **Auditing works.** Each saved record names its retained code/evaluator artifact,
  policy, input and decision. All **16 records** (eight orders through each
  design) replay after JSON serialization, including the reasons and checks.
- **No service-release dependency is charged to Eden.** The named policy artifact
  and its loader are separate from the order consumer. The probe verifies the
  callable and data boundary; it does not build or time a deployment system.

## 2. The four criteria, with the scene evidence they can support

| Criterion | Result | Evidence and its limit |
|---|---|---|
| 1. Real console-owner gain after hot-load | **Yes, for authoring a new grouping.** | Dafna supplies a new tree using existing operations. Eden must register a name and write its predicate. Hot-load removes release work, not authorship. Once he supplies this template, that cost is already paid for the current request. |
| 2. Real service-owner cost after replay/versioning | **Yes, limited in size.** | The general interface accepts recursive `all`/`any` structure and needs recursive parsing, evaluation and an authoring/explanation UI contract. The template interface accepts a name and four flat parameters. Five nodes are not a giant language, and the probe does not measure UI development effort. |
| 3. Restricted hybrid asks someone to give something up | **A capability, not an established current requirement.** | Named-only authoring declines arbitrary trees. Adding this template nevertheless handles the exact requested grouping and all its parameter edits. Dafna gives up immediate general authoring, but nothing supplied makes that feature mandatory now. |
| 4. Deferral fails an authorized owner's stated requirement | **No. The deferral survives.** | Current behavior, parameter edits, replay, compatibility and audit all work with templates. No stated requirement demands an unseen third grouping be activated without engineering work or with zero lead time. Later general authoring can coexist with existing named records. |

### Criterion 1: let the current template repair remove the current wait

Before the new template, the existing `country-velocity` policy holds only two of
the eight fixture orders. The proposed grouping would additionally hold three
large orders. If this batch arrives while the old policy remains active, those
three pass through unheld. That is a conditional trace of the old behavior, not a
measurement of release delay or of an engineer's speed.

Once Eden supplies the template, the difference is **zero**. Dafna should be able
to inspect that exact result. The scene cannot continue treating those three
orders as the ongoing price of templates after accepting the repair.

Dafna's remaining gain is the next grouping she could author herself. Show it as
a real benefit, not as a requirement someone has already agreed to fund.

### Criterion 2: a maintained surface, not an invented maintenance disaster

The two input types make the distinction visible. The general type recurses over
condition children; its parser and explanation traversal must follow that shape.
The named type exposes only approved names and parameters. Its current check
results can be produced directly by its predicate.

An unregistered template name fails with **TS2820** here (the compiler suggests
the similar existing name), and the runtime loader refuses a general tree at the
named-only boundary. An unsupported condition kind also fails the rule type.
Neither design lets an analyst invent a new primitive operation.

The same condition helpers or generated forms could reduce duplication. That
does not remove the general editor's authoring promise, but it may make supporting
it cheap. Nothing in these probes establishes its cost in hours, CPU or incidents.
Eden can name the surface his team would own without forecasting a giant language.

### Criterion 3: do not make “one more template” a false answer

Sahar's restricted proposal works. The new named template is not a backdoor that
serializes a closure: its stored record names separately retained code and stores
only parameters. The callable is created after parsing, for the order consumer.

The general alternative still has a genuine extra capability. For example, it
can express the third shape:

```text
large total AND (country FR OR refund velocity)
```

That shape holds three of the eight fixture orders. The named-only input rejects
it; adding a name or enabling general authoring requires work. But the current
risk request was the first shape, not this one. The third shape is an extension
probe, not a surprise new production requirement inserted before the ending.

### Criterion 4: try the deferral explicitly, without weakening it

The proposal to put in the scene is the one requested:

> Templates now; build the general editor when a third recombination arrives.

It is not silently weakened to “perhaps discuss an editor someday.” It is also
not a claim that the editor will materialize instantly when the third request is
filed. Building it takes work; the scene must not promise an untested delivery
time. The threshold of three is a chosen work trigger, not a result proved by the
6/2/1 census.

The compatibility probe tests a later interface that accepts general rules while
still accepting the old named records. The third shape produces its expected
three holds. The current template still produces its five. An old audit record
still replays through its retained template artifact. This establishes that the
deferral need not invalidate today's stored policies or audit records. It is not
a browser implementation or an estimate for building the editor.

There is no supplied requirement that makes this unacceptable:

- Dafna needs a console that supports today's requested grouping and edits to its
  parameters, with replay and a faithful record. The template does that.
- Eden needs an explicit supported interface and evaluators that can handle its
  stored values. The named interface does that, and the later interface need not
  erase it.
- Neither owner has promised zero engineering involvement for every future
  grouping, or immediate delivery of an unknown third request.

To defeat the deferral we would have to add such a promise, a deadline, an
irreversible format choice or a staffing constraint. None follows from the
settlement or the demonstrated failure. I am not adding one.

## 3. How to put the convergence on the page

These are evidence-bearing scene beats, not drafted dialogue or claims that the
owners have already spoken:

1. **Establish authority and the request.** Dafna owns what the console lets its
   analysts author. Eden owns the service's accepted interface. They jointly
   choose that boundary. The risk team supplies the hold rule; neither character
   decides that a different group of orders should be held to simplify the code.
2. **Give Dafna her gain.** She supplies the new grouping using the existing
   vocabulary. The order checks and replay work. Eden acknowledges that no new
   condition implementation was needed.
3. **Give Eden the actual repair.** He supplies the named predicate as a separate
   policy artifact. Its outputs and explanation match. The console changes its
   parameters; neither needs a service release for that. The stored-parameter
   migration is handled just as it is for the tree.
4. **Use the census once.** Gil identifies six parameter changes, two
   recombinations and one new primitive. The common changes do not distinguish
   the proposals. He does not turn those counts into a cost-benefit score.
5. **Try Sahar's deferral.** Chen checks the current grouping, field edits and
   historical replay against it. Those answers succeed. A later general editor
   can retain the named records; a previously unknown grouping remains work for
   its authors until then.
6. **Let Dafna and Eden decide their interface.** They can take the implemented
   template now and own the later editor work when the third request arrives.
   Neither needs to pretend their alternative stopped working. Do not give Dafna
   an unanswered autonomy demand or Eden a last-minute objection merely to leave
   the room divided.

The original incident remains useful: an in-memory callable policy lost its
behavior in an audit record. Versioned code plus parameters repairs that loss.
The later authoring choice tests whether this application also needs to persist
an analyst-authored program. On this evidence, it does not need that feature yet.

## 4. Proposed local ruling and limits

For this console and its current policy requests:

- expose named templates and their validated parameters;
- add the current `large-or-country-velocity` template as checked policy code;
- turn the accepted configuration into the order-evaluation function;
- replay before activation and retain the code version, parameters and input facts
  needed to reproduce a recorded decision;
- read version-1 records with their known seven-day meaning;
- defer the general authoring editor until the third recombination request, with
  its implementation work owned by the console and service teams.

This is not a claim that functions are inherently easier to audit, that a rule
language is too dangerous, or that the compiler proves a policy correct. Both
repaired implementations work. The simpler currently supported authoring surface
meets the demonstrated need, and the extension has not been made impossible.

No benchmark or real vendor claim was needed. The probes do not establish a
migration for every possible future rule format, an editor-delivery SLA, or the
availability of engineers on an emergency shift. They test the concrete proposed
boundary and the known compatibility case. No full-book suite was run because
only this report and untracked probes changed.

**Handoff:** the bounded round is complete. Recommend the local Verdict above
under `15be228`, with no staged dissent and no open-ending debt. Await Claude's
decision before drafting. Commit this report locally only; do not push, and leave
`.probe/`, `.talk/` and `.claude/task-state/` unstaged.
