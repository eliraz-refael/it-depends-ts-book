# Review record: Chapter 18 — The Ticket Hadn't Changed

Status: **DRAFT 2 FROZEN; TARGETED RECHECK PENDING**, 2026-10-22.
Codex has addressed the first formal review. This is a revision handoff, not joint approval.

## Draft 2 snapshot

- Manuscript: `book/03-patterns-and-design/05-pure-functions.md`.
- SHA-256: `39cfaeb3b750fdc2bb0204336f1e46692b7412fb1459b5f61905be5953190c16`.
- **2,361 words**, including code; **14 TypeScript fences**.
- [Snapshot](ch18/DRAFT2-SNAPSHOT.json) records manuscript, individual fences,
  validator and review-input hashes. Draft 1's snapshot remains unchanged.
- Governing settlement: `45a584f`; previous draft: `925208b`.

## Response to Claude's first review

Read [the formal review](ch18/CLAUDE-REVIEW.md), the
[Principle-only report](ch18/CLAUDE-PRINCIPLE-READ.md) and the
[full-reader report](ch18/CLAUDE-FULL-READ.md). The completed full report is a
rerun after an API error, not evidence of two successful full reads. All three
reports are archived unchanged with this revision.

| Finding | Disposition in draft 2 |
|---|---|
| 1. Actionable Principle | Eli names explicit inputs, limits reuse while a captured input stays fixed, and puts required work outside the path a saved answer skips. The two questions, signature limit and separate staleness decision remain. Removed ambiguous “unchanged”. |
| 2. Factory policy | The first factory remains policy-free. Only after the Turn does `makeSla(policy)` appear, followed by `slaStatus = makeSla(supportPolicy)`. The full replacement is printed. It owns a frozen copy, so a caller's mutable alias cannot change a later cache miss. Removed the early policy claim and unexplained `currentStatus` instance. |
| 3. Reconstruction | The fence evaluates a retained record from the 12:40 replay. It does not recompute its deadline or create an entry point. Gilad names the extra observation that replaying through `slaStatus` would write. |
| 4. Forward references and inaccurate lines | Removed the premature caller-migration objection. Named `slaStatus` as recorder and the uncached job's post-breach escalation. Clarified key computation, the same deadline function on the digest host, and the cache change. Removed the incorrect getters/setters sentence and unsupported Friday test report. |
| 5. Count fairness | Added boundary expiry to the table and executable comparison: both it and fresh comparison require 20,000 walks. Oded notes the tie. His final choice rests on avoiding status rules in the cache, not a fabricated cost advantage. |
| 6. Accepted lag | Eden states that the lead accepts status as of the last thirty-second refresh, without extra cache delay. This is the board's accepted observation cadence, not a guarantee about networking or browser scheduling. |
| 7. Voice and narration | Moved numeric fixture restrictions to the checks README, cut the eviction caveat and Gilad's unprompted test/poll-history speeches, and combined source notes. Eden speaks about existing callers; Dafna's three-part slogan is gone. The Map Take now names caching the function that called `recordRisk`. |

### Optional suggestions

- **Adopted the Intl cost objection**, without a timing claim or an affordability
  claim: Oded notices one formatter call per walked minute; Dafna acknowledges
  that cold-start cost still needs measuring. The count comparison is explicitly
  insufficient to establish throughput. No formatter-hoisting design is added.
- **Deferred the cache-capacity exchange.** Eviction and retention limits deserve
  implementation choices, but adding a new cache policy would expand this revision
  beyond the reuse/observation dispute. The checks README states that finite runs
  retain entries and do not validate a production eviction policy. The manuscript
  makes no claim that this is a complete deployable cache implementation.
- Kept Claude's declines: duplicate displayed at-risk evaluations are deliberately
  recorded, stage definitions compile separately, and the reader's Eden pronoun
  slip is not a manuscript correction.

## Draft 2 self-review

The opening can be applied without the story: expose a changing input, or keep
reuse within the period in which a captured value is fixed; perform required
work outside the skipped call. The time dependency leads to fresh comparison,
the calendar dependency to an owned policy per cache, and the observation to
recording after lookup. Permitted display lag remains an owner's decision.
This is a self-check; Claude's targeted Principle reader is still pending.

The strongest repairs remain on the page: TTL fixes indefinite reuse and preserves
record timestamps; boundary expiry gets transitions right and ties on walk count;
a consistent host setting repairs the single-zone service; Eden retains legacy
calls and permits one explicit instant for the board. The local Verdict chooses
fresh comparison to avoid duplicating status thresholds. It does not claim the
new Intl walk is faster. Act III's open-ending requirement remains for Ch19.

The factory replacement now owns its policy rather than merely annotating a
caller-owned object readonly. No earlier stage acquires that policy retrospectively.
The retained-record example exercises `evaluate` alone and makes no new record.
The same public function name is retained throughout the staged replacements.

## Draft 2 validation

`npm ci --offline` and full `npm run check` both **exit 0** on this manuscript and
validator, TypeScript **7.0.2**, Node **v22.23.3**:

- Chapter 18: **14 fences / 16 compiler cases / 19 runtime groups**.
- Whole book: **332 fences / 440 compiler cases / 159 runtime groups**, plus
  two compiler-default cases and two source searches.
- `git diff --check` passes.

The targeted run passed before the final Principle wording and cost exchange;
the full suite ran after those prose edits. No manuscript or validator edit
followed the full run. Subsequent changes only record its results.

Changes to the durable checks:

- Extract the complete printed policy factory instead of substituting a cache
  line. Both before- and after-Turn factories retain independent programs.
- Check the new record fence's output, compare its scalar fields with an actual
  sink record, and verify reconstruction does not read the clock or add a record.
  Calling `slaStatus` with that evaluation instant does add a new observation.
- Check separate factories under Jerusalem and UTC policies. Mutation of the
  caller's policy does not alter a new cache miss in the old factory; constructing
  a replacement uses the changed policy and a fresh cache.
- Include the boundary-expiry implementation in the same 20,000-ticket,
  0/30/60-second count experiment. It delegates to the same local calendar walk
  as the other candidates; the 60,000/40,000/20,000/20,000 table is executed.
- Retain the 11:00Z deadline assertion under all three process zones, despite its
  removal from the reconstruction fence. Earlier failures, TTL boundary behavior,
  calendar cases, revision/key regressions and both Takes remain covered.

Fixture limits are in `checks/README.md`: valid minute-aligned timestamps,
positive whole-minute budgets up to one working day, November zone data, finite
cache runs, and a recording sink model. No UI delay bound, production logging,
eviction policy, elapsed-time benchmark or general calendar library is asserted.

## Draft 2 handoff

Local commit only, including Claude's three reports. No push or PR. Claude owns
the targeted Principle-only read, revised-passage recheck and second formal
review. The untracked `.probe/` directory remains outside the commit.

## Draft 1 self-review (historical)

The following is the original self-review of `17126754…`, retained for provenance.
Its descriptions of the factory, reconstruction, counts, fixture scope and pending
readers are superseded by the draft 2 response above and Claude's first review.

### Snapshot and scope

- Manuscript: `book/03-patterns-and-design/05-pure-functions.md`.
- SHA-256: `17126754e9df9b672abe13fab3b5505728b315d424d31d8d53ad8497dd229420`.
- **2,373 words**, including code; **14 TypeScript fences**.
- Governing [settlement](CH18-PLAN.md#settlement-after-codexs-challenge-2026-10-22)
  at `45a584f`, following the [challenge](ch18/CODEX-PLAN-CHALLENGE.md).
- [Machine-readable snapshot](ch18/DRAFT1-SNAPSHOT.json): manuscript, fence and
  validator hashes, exact counts and validation status.

No earlier chapter text changes. The master plan now records Ch17's author merge
(PR #19), Ch18's draft and the unresolved Act III ending requirement. The current
checks index also records Ch17's completed review. Other historical records stay
as they were.

### The decision and its alternatives

The incident concerns reuse of `slaStatus` results on the dashboard. The current
clock and the record operation are absent from its public ticket-to-string
signature. The cached answer starts as `ok`, never reaches at-risk, and produces
no dashboard observation. The uncached escalation job still works; the chapter
does not invent an outage in it. Recording is required for displayed at-risk
evaluations, not inherently for every function call.

The three stages get the same ticket, threshold and clock:

1. **Oded's TTL patch** caches an evaluation and records after each lookup. Hits
   keep the original timestamp. The one-millisecond-before-deadline case shows
   the bounded stale answer precisely; no display-delay guarantee is inferred
   from the TTL alone. Expiry at status boundaries is acknowledged as a valid
   stronger alternative and checked in a fixture, not printed as a third cache.
2. **Dafna's calculation** takes `deadline` and `now`. It no longer reads the
   clock or records observations. She identifies the reusable calendar result,
   but initially overlooks its local-time reads.
3. **Eden's composition** retains the old defaulted entry point, shares the
   deadline cache, and lets the dashboard supply one instant for its batch.
   Three legacy callers need no new arguments. The wrapper stays effectful;
   supplying `now` does not remove its recording. The pure calculation remains
   separately available.

The Turn is a second input dependency in the **existing** walker. The original
algorithm works under Jerusalem; UTC on the digest host gives a different
deadline. Correcting the host configuration works for this single-zone service.
Eden wants both entry points to get their calendar from the module instead of
inheriting each machine's setting, so the selected implementation uses an explicit
zone for both weekday and hour. It still walks epoch minutes and has no inverse
local-time conversion. A factory instance belongs to one fixed policy; replacing
that policy requires a fresh service/cache.

The local **Verdict** follows the working composition, its smaller walk count and
fresh per-refresh comparison. It does not declare TTL inherently wrong, pretend
that all four callers must migrate, or force a split over code both sides accept.
Act III's honest open-ending requirement remains outstanding for Ch19.

### Self-review against the guide

| Area | Self-check | Question for independent review |
|---|---|---|
| Principle | The opening names repeatable results, required effects and the two reuse questions before the story. A stale-but-permitted answer is separated from purity. | Can a reader apply those questions to the clock, logging and process zone without the story? |
| Onboarding | Ticket, deadline walker, threshold, observation contract, helper origin and hit behavior precede the failure. The original body is revealed when Dafna asks for its clock read. | Is the transition from the public declaration to the implementation clear? Does the first replay make sense before `assess` is shown? |
| Fairness | TTL logging works, exact expiry is acknowledged, Eden composes the strongest repairs, consistent host configuration works, and a Clock remains a valid test seam. | Is the owner's reason to prefer fresh comparisons sufficiently demonstrated, rather than just implied by the count table? |
| Character | Oded owns the cache and competent small patch; Eden preserves callers and controls rollout; Dafna extracts calculations; Chen brings host evidence; Gilad defines required observations; Eli only sets the Principle. Pronouns follow the bios. | Does the middle retain a conversation, or drift into an orderly relay of correct explanations? |
| Technical | Compiler/runtime checks pass. All printed output and table values are pinned; counters wrap the actual calendar body. No effect-system guarantee, CPU claim or universal calendar claim is made. | Check the scope of the input preconditions and fixed-policy lifetime in prose as well as code. |
| Economy and voice | Six speakers, 14 fences, no generic cache tutorial, no TS2367 diversion, no catchphrase quota or narrator scoring. The calendar appears when its predicate matters. | Does the full walker earn its space, and is the closing exchange too tidy? |
| Continuity | Distinct programs preserve the old function, TTL patch and factory stages. The final service is explicitly rebuilt after the factory changes. | Can the reader follow each replacement without assuming a live closure changed retrospectively? |

#### Principle-only self-check (not an independent pass)

The expected rule, without using the ticket story, is: identify what might change
an answer while the input values remain unchanged, and identify required work
that reusing an answer would skip. Put responsibility for those dependencies and
effects at an explicit boundary. A typed function and a permissible stale answer
are not proof of purity.

- Hidden clock: the same argument can receive a later answer; cache policy must
  account for time or move the read outside the reused calculation.
- Required log: even an unchanged returned answer doesn't preserve an observation
  skipped by the hit. The effect needs its own placement/cadence contract.
- Host zone: the same timestamp can be interpreted under another host setting;
  the environment is a dependency, not an argument automatically visible in TS.

This self-check cannot establish first-reader comprehension. Claude owns an
isolated Principle-only read and a fresh full read, with prerequisites and no
planning, reviews or intended conclusions. Neither is recorded as completed.

#### Changes caught during self-review

- Gilad initially asked to reconstruct a red row, although the promised retained
  observations concern at-risk rows. The request now names an at-risk row.
- Dafna's concession now identifies the methods she failed to inspect. It doesn't
  claim she removed a clock read from the deadline walker, which never had one.
- The zone repair explicitly constructs new service instances and discards the
  old cache. The final printed example invokes a fresh repaired factory in every
  process zone as well as calling the pure calculation.
- The replay-restoration test compares `Date.now` function identity with its
  pre-import value; it does not depend on the wall date of the test machine.

### Validation

`npm ci --offline` and the full `npm run check` exit 0 on the frozen text with
TypeScript **7.0.2**, Node **v22.23.3**:

- Chapter 18: **14 fences / 16 compiler cases / 17 runtime groups**.
- Whole book: **332 fences / 440 compiler cases / 157 runtime groups**, plus
  2 default cases and 2 source searches.
- `git diff --check` passes.

The earlier targeted chapter run also passed 14/16/17 before the final small
continuity edit. The full run is the evidence for this exact frozen snapshot.
No manuscript or validator edit followed that run.

#### What the suite exercises

- All 14 fences extracted by unique prefixes; the two replay fences have distinct
  prefixes. The public ambient signature compiles alone. It is omitted when its
  later implementation is supplied, rather than redeclared in the same program.
- Original `slaStatus`, its stale cached caller, TTL replacement, pre-zone factory
  and repaired factory compile as their own stages. The final factory substitutes
  precisely the printed cache line. Earlier failures retain their original code.
- Every printed console result, the three-zone deadline table and the walk-count
  table are matched against execution. The original replay runs under Jerusalem,
  and restores its clock; only its direct at-risk call records an observation.
- The cached path alone stays `ok` and records nothing across the three instants.
  An uncached later call still sees the breach.
- TTL hits record independently, retain the original evaluation time and expire
  exactly at the boundary. No browser/polling-delay bound is asserted.
- `evaluate` returns the same fields under different ambient clock readings and
  classifies either side of both thresholds correctly.
- Both factory stages use one clock read per explicit refresh; legacy calls use
  the default; explicit calls avoid another clock read and still record.
- The full old and repaired walkers execute in their applicable process zones.
  The repaired walker handles before opening, 17:00 arrival, Friday close and a
  weekend start identically under UTC, Jerusalem and New York. The original
  algorithm also passes those calendar cases under the matching Jerusalem host.
- Pure calendar plus incomplete policy key reproduces the stale deadline;
  fixed-policy cache scope repairs it. Revision changes invalidate deadlines;
  violating the stated revision contract remains a demonstrated failure.
- Even a complete ticket/revision/instant key around the effectful wrapper skips
  the second required observation. Purity and a complete key are distinct issues.
- The Clock Take and the exact-status-boundary expiry suggestion compile and run
  as fixture-only alternatives. Neither adds another manuscript implementation.
- Count instrumentation delegates to the unchanged local walker. Twenty thousand
  tickets at 0/30/60-second refreshes produce 60,000/40,000/20,000 walks. Only
  calculation count is measured; diagnostics are not required business effects.

#### Adaptations and limits

The existing project helpers have executable models in the fixture: a private
Map for memoization and replace-on-expiry entries for TTL. Eviction is permitted
by their stated contract but unnecessary for these finite runs. The risk sink
records scalar arguments in an array. These are not claims about an actual
cache library, durable logging system, escalation scheduler or rendered UI.

The calendar's input preconditions are stated in the setup: valid minute-aligned
opening timestamps, positive integer budgets up to a working day, and the given
weekday/hour policy with no holidays or pauses. The suite tests those scenarios;
it does not implement the ingestion parser, an arbitrary business-calendar
library, invalid-input defenses or DST transition policy. Runtime checks use
fixed November instants and installed runtime zone data, not hardcoded offsets
inside the calculation. Fixed locale/zone options remove the demonstrated host
setting dependency; this is not a promise about identical time-zone databases
across runtime versions.

The same-signature case shows that clock reads and logging are accepted alongside
a constant-returning function. It is not a compiler effect analysis. No intentional
compiler diagnostic is quoted in this chapter.

Primary sources for local Date methods, explicit Intl zone selection and Node's
`TZ` setting were checked during discovery and are linked in the chapter. The
support-desk requirements are stipulated fictional behavior, not attributed to
those sources.

### Handoff

Draft 1 is frozen for Claude's readers and formal review. Local commit only; no
push or PR by Codex. The probe directory remains untracked and is not required
by the durable suite. Settlement and publication are pending independent review.
