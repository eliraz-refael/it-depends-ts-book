# Chapter 19 self-review — Who Goes Next?

Status: **DRAFT 1 FROZEN; INDEPENDENT READERS AND FORMAL REVIEW PENDING**, 2026-10-22.

## Snapshot

- Manuscript: `book/03-patterns-and-design/06-imperative-vs-declarative.md`.
- SHA-256: `43b2fdd1efd9f33f0aae9155f062bcda1a4a41e6b8aa1b9aafc9a982ed0f6555`.
- **2,201 whitespace-delimited words**, including code; **11 TypeScript fences**.
- Governing settlement: `bcb0c2d`, at the end of [CH19-PLAN](CH19-PLAN.md), following
  the [Codex challenge](ch19/CODEX-PLAN-CHALLENGE.md).
- Exact manuscript, validator and individual fence hashes are recorded in
  [DRAFT1-SNAPSHOT.json](ch19/DRAFT1-SNAPSHOT.json).

This is Codex's self-review, not joint approval. Claude owns the independent
Principle-only reader, full reader and formal review. No earlier manuscript was
edited. No push or PR is part of this handoff.

## What the scenes decide

The deployed rewrite preserves each eligibility rule and stays within the
allowance, but skips the first eligible payout that does not fit. The failure is
**overtaking against the support promise**, not a claim of starvation under the
current daily reset. The ordinary batch precedes that failure. The planner
returns a plan for another service; it does not submit payments itself.

Dafna retains the independently testable eligibility stages, supplies a correct
closed-state fold, and then uses the shorter loop with the same typed stop
reason. `some` gets a fair, executable alternative in the fixture. Liron names
the domain operation without proposing a generic prefix library. The held-row
case tests order inside this repair scene. The refactor converges and restores
stopping before the Turn begins.

Chen's next-day question changes the inquiry. P2 is paid on day 2 under both
planners with the reset, while skipping pays P3/P4 earlier. Gil enumerates a
precisely named set with appended arrivals and compares every ID's payment day.
The text explicitly limits his conclusion to those cases. It does not prove a
general theorem or describe skipping as optimal packing.

Finance's proposal is introduced before either failure: a smaller daily deposit
with unused funds retained. The later trace makes its consequences concrete.
P2 can need more than one deposit under this proposed model, unlike the current
reset model's scoped inputs. Stopping pays it on day 2; skipping pays it on day 8.
Those are human day labels, with the first deposit on day 1. The settlement's
scratch result used zero-based labels (1 and 7); this is the same result.

The open decision belongs to the payouts team. Dafna wants a deliberate skip
policy for the account they currently have, with a different policy if funding
changes. Gil wants finance's funding decision before changing the seller promise.
Both accept stopping under the demonstrated accumulating model. The remaining
choice is whether to change policy now or wait for that funding decision, with
support wording part of the change. It is not an unresolved choice between
correct loop and fold implementations. No new condition is introduced in the
closing section.

## Self-review against the book guide

| Category | Self-assessment | Evidence and question for independent review |
|---|---|---|
| Character consistency | PASS, provisional | Dafna extracts stages, repairs her own fold and accepts a loop; Gil separates totals, IDs, callback counts and payment dates; Chen tests type inference, eligibility order and next-day behavior. Sahar and Liron are brief. Does Gil's funding condition feel like his evidential caution, or an assigned opposing position? |
| Factual accuracy | PASS on checked claims | All fences compile or produce their exact intentional error. Both tables and the entire named case set run against emitted manuscript planners. No CPU or universal waiting-time claim. |
| Fun factor | PASS, provisional | The Turn reverses the practical implication of the repaired behavior, rather than delivering another syntax surprise. The policy disagreement persists after the coding disagreement ends. The full reader should judge whether the restrained voice and data scenes sustain interest against the Ch7 calibration. |
| Alignment | PASS, provisional | Declarative eligibility survives; sequence state needs an explicit representation; the short loop wins locally without discrediting the correct fold. The open ending has shown conditions. Does the funding proposal earn the open decision without feeling arranged to meet Act III's debt? |
| Code quality | PASS | Fresh arrays, no repeated accumulator spreading, explicit typed stop reason in both repairs, no assertions. Eligibility and planning have independent fixtures. |
| Readability and flow | PASS, subject to first read | Purpose, queue promise, allowance reset and a working caller precede the failure. The ordinary and failing fixtures are distinct. The funding proposal is established before it matters. Check especially the deployed-refactor timeline and the late optional-property Take. |

The manuscript is shorter than the plan's tentative 2,300–3,200-word range, but
within the writing guide's 2,000–4,000 range. No extra mechanism was added to
reach a word target. There is one Take, on optional-property narrowing; no
TS1107, iterator-library detour, accumulator-seed errors or effect-order replay.
The two tables report actual sequences rather than substituting for dialogue.

### Principle-only self-check (not an independent reader)

The opening favors operations that name independent element decisions. It asks
what carries across elements, where processing stops and what must remain in
order, and requires the rewrite to preserve those rules and its types.

Expected application to the agreed four reader cases:

1. **Stop vs skip:** preserving a numeric accumulator does not preserve stopping;
   a callback return may continue the outer operation. Use a stopping operation
   or explicit closed state.
2. **Independent per-item selection/transformation:** start with `filter`/`map`;
   the Principle does not demand a loop when there is no sequence dependency.
3. **Optional field:** check narrowing at the next stage. Moving the optional
   value into the stream, or selecting and transforming within one `flatMap`
   callback, can retain the compiler's evidence.
4. **Sequential async to Promise.all:** check whether ordered starts/completions
   are required before starting the mapped operations together. This transfer
   case is not another example in the manuscript.

Please give the independent reader only the Principle and the cases, not these
expected answers. The full reader should get the chapter and prerequisites only,
not this record, the plan or discovery discussion.

### Corrections made during self-review

- Resolved the timeline: the refactor went out yesterday, support has a real
  overtaking ticket, and this patch replaces the deployed fold. The example
  labeled `original` is the pre-refactor implementation.
- Kept a quoted support **reply**, not merely a runbook statement.
- Replaced an unsupported reply to an absent claim about favoring older sellers
  with Dafna's direct proposal to change the rule.
- Replaced the questionable claim that eligibility tests previously needed a
  held-account fixture with the actual benefit: testing eligibility without the
  allowance calculation.
- Qualified Gil's two-payout visit claim as the **original** loop; the repaired
  loop still receives eagerly filtered input. Callback and budget-check counts
  remain distinct and do not establish elapsed performance.
- Normalized zero-based scratch days to day 1 as the first deposit, preserving
  the six-day difference in the carry-forward example.

## Validation

`npm ci --offline` and the full `npm run check` both **exit 0** on this exact
manuscript and validator, TypeScript **7.0.2**, Node **v22.23.3**:

- Chapter 19: **11 fences / 16 compiler cases / 14 runtime groups**.
- Whole book: **343 fences / 456 compiler cases / 173 runtime groups**, plus
  **2 compiler-default cases and 2 source searches**.
- The earlier targeted Chapter 19 run passed the same counts. The full run is
  the evidence for the final prose self-review edits.
- No manuscript or validator edit followed the full run. Later edits only record
  results, the frozen hashes and the pending independent review.

### Coverage and adaptations

All fences are extracted by unique prefixes, and extraction must account for
every fence. Earlier declarations and fixtures supply context. The actual
`original`, `eligible`, `skipping`, `folded` and `looped` bodies are compiled and
executed. The inferred-return test removes only `eligible`'s explicit return
annotation and verifies the resulting type is exactly `Ready[]`.

Separate fixture programs cover the dialogue's `some` implementation, renaming
`looped` to `planPayouts`, and the wrong-order regression moving the allowance
check before eligibility. Counters are inserted into the printed fold and loop
without replacing their conditions. The optional-refund failure is checked by
exact diagnostic line, code and message; the successful fences are wrapped in
functions accepting `rows` to test actual values, including zero and absent
refunds. These wrappers are fixture scaffolding, not a third-party API model.

Runtime groups cover:

- Every printed console value, the overtaking IDs/totals and all repaired stop
  reasons, including the two-payout fixture that hides the bug.
- Each eligibility rule, held rows before and after a blocker, empty/exact-fit
  inputs, exhausted allowance and fresh arrays on repeated calls. Frozen inputs
  remain unchanged; the output array is separate, without claiming deep copies.
- Four fold callbacks versus two allowance checks, and two loop allowance checks.
- The three-day reset table, using the actual emitted planners.
- All 78,125 cases of four initial payouts and one appended on each of the next
  three days, with amounts 100–500 in increments of 100 and a reset of 500. Every
  payout must be paid; skip's payment day must not exceed stop's for any ID.
  At least one strictly earlier payment is required too.
- The eight-day accumulating trace, starting from zero with 500 deposited daily,
  P2=900 then 400 initially, and one new 450 daily thereafter.
- Both optional-refund repairs, including retained payout IDs for `flatMap`.

The scheduler is a fixture model: append arrivals, reset or deposit funds, invoke
the emitted planner, remove selected IDs in stable order. It doesn't simulate
real payment submission, account validation, failures, currency conversion,
concurrency or production persistence. Inputs are positive integer minor units
with unique IDs. Fixed-reset cases fit the fresh allowance; the proposed
carry-forward case explicitly permits a payout larger than one deposit.
Bounded enumeration is evidence over the named set only. No randomness or
external `.probe/` file is required for the durable suite.

## Handoff

Draft 1 is ready for Claude's independent readers and formal review. The master
plan keeps Chapter 19 and Act III's open-ending requirement pending until those
reviews settle. Commit locally only; do not push. The untracked probes are
excluded from the commit, along with `.talk/` and `.claude/task-state/`.
