# Chapter 22: ending-first plan challenge

2026-10-25. Against `9ec6c1d`, on `codex/chapter-22-config-to-function`.

**Recommendation: retain the primary candidate for the one bounded design round,
but do not settle its open ending yet. Reject the wrapper-API fallback.** The
surviving question is how much rule authoring the console promises its users,
not whether the evaluator executes an interpreter or generated TypeScript.

I found no hybrid that both retains unrestricted combinations of the supported
conditions and removes responsibility for that authoring language. However, the
plan's present examples do not yet demonstrate a fair cost on each side after
the strongest repairs. Two advertised differences disappear: code-owned rules
also have stored parameters to migrate, and hot-loaded code removes the need for
a service release. We must not preserve the disagreement by ignoring either.

All six mechanisms reproduce. Independent evidence: **14 compiler cases / 13
runtime groups**, TypeScript **7.0.2**, Node **v22.23.3**, the book profile.
`npm ci --offline` and `.probe/codex/run.cjs` exit 0. Full results and diagnostic
text are in `.probe/codex/RESULTS.json` (untracked). These are small fictional
fixtures, not measured operating costs or a built admin console. No manuscript,
plan, permanent validator or master tracking has been changed. No full-book run
was needed for this documentation-only challenge.

## 1. The ending, attacked first

### Dry run: accept the repair, then compare the remaining costs

The four-order probe contains a country-and-velocity match, a country-only match,
a velocity-only match and neither. The intended `all` holds only the first;
`any` holds the first three. A replay with those inputs exposes the two extra
holds before activation. Give Dafna that repair without qualification in the
scene where those orders are available.

The same mistaken `||` expression is valid TypeScript. My compiled code and data
interpreter produce identical wrong results. CI can include the business case,
but so can the console's activation check. This is not a compiler advantage over
analyst-authored data.

A replay containing only the both/neither cases cannot distinguish the programs.
That limit applies equally to both designs; it is not a reason to make Dafna's
replay fail conveniently. Use the representative replay and let it work.

**What remains:** ownership of the authoring format, its editor and its meaning.
A dry run does not implement those. But the caught `any` mistake cannot also be
the chapter's final unrepaired cost of choosing data.

### Config as code: the no-repository requirement is not enough

I compiled a TypeScript predicate generated from the console's rule tree. It
matches the interpreter on **16 inputs** (two countries, two totals and four
refund histories). The erroneous `any` tree also generates code that compiles.
The analyst need never edit a source file or use a repository. This probe checks
the generated artifact, not a deployment pipeline or browser UI.

There are two distinct alternatives to hear:

1. **Engineers write a separate policy artifact, checked and loaded without a
   service release.** This removes the deployment dependency. It does not remove
   waiting for someone to write or review a new combination.
2. **The console generates that artifact from an editable rule tree.** This gives
   console authoring plus compiler checks, but the tree, supported operations and
   generator still constitute a language the team maintains. It remains the
   data-authoring design, with a different execution mechanism.

Therefore “analysts require the console” does not defeat config-as-code. Nor is
“it is TypeScript underneath” an answer to who authored its combinations. Eden
should offer the independent policy artifact himself; the cost he retains must
be authorship or approval, not a service release he no longer needs.

Engineer review is a separate choice too. Either representation can require it.
If a console-generated artifact with quick review meets both owners' actual
requirements, accept that convergence. Do not introduce an absolute ban on
engineer involvement late in the chapter to disqualify it.

### Parsing and migrations: this example charges both designs

The stored rule lacking `days` compiles through the assertion and silently stops
matching. Parsing catches it. But the strongest repair is not “reject and ask an
analyst to edit every old policy.” The old format had a known seven-day meaning:

- read a version-1 rule;
- supply `days: 7` for that version;
- parse the resulting current rule;
- reject unknown versions rather than guessing their meaning.

The probe verifies that repair. It also stores the code-owned design's parameters
as `{ velocity: { count: 2 } }`. Requiring `days` rejects those bytes too. A
versioned adapter supplies seven for those parameters as well.

This does not make maintaining compatibility free. It makes this particular
migration a shared cost, often paid once in a reader rather than by rewriting
all stored records. The plan currently gives too much of it to Dafna. Also,
code-authored *rule literals* fail compilation; that fact does not make every
parameter supplied to a code-owned function code-authored.

Keep this mechanism as a useful restriction of the type claim. Don't make it the
exclusive reason Eden wins an argument about maintenance.

### “Both”: name which door stays open

I tested two paths in one executor:

- named templates, such as `velocity-fr`, with tunable count and days;
- arbitrary `Rule` values using the supported conditions and `all`/`any`.

A named template and its rule tree agree on every fixture order. With the general
path still exposed, a new `any` combination also works. Publishing the templates
has not removed the rule language or the console's general authoring obligation.

If the console instead accepts **only named templates**, the new name
`country-or-velocity` is rejected by the template type with TS2322. An engineer
can add that template; my one-off repair produces the requested results. That is
a real, simple answer to this one request. It still requires that work for a new
combination outside the approved set.

These are different product promises. “Graduate complex rules to code” is not a
boundary until someone says which expressions the console accepts and what
happens to the next unsupported request. Complexity or rule length is not yet a
criterion. A fixed set of templates may cover every demonstrated need; if so,
Sahar is entitled to ask why this release needs a general editor at all.

**Surviving disagreement:** whether to support ongoing analyst composition from
an approved vocabulary, or only parameter changes and selection among named
combinations. An interpreter, code generator, template selector and reviewed
activation path are all possible implementations around that boundary. The
chapter must not confuse them with four independent resolutions.

## 2. The bounded round I recommend

Narrow the decision to **what the console will let an analyst author**, and test
one actual request against these two repaired proposals:

- **Dafna:** a bounded vocabulary of conditions with composable `all`/`any`, parsed
  and versioned, with representative replay before activation. Interpretation or
  code generation is incidental. No arbitrary JavaScript from the console.
- **Eden:** code-owned named predicates, with parsed/versioned parameters and a
  separately checked, hot-loaded policy artifact. Give him a working template
  for the current request, not an obsolete release process.

Both get the same input facts, activation checks, reason identifiers and audit
requirements. Both may share condition functions. Neither gets a business-error
proof from TypeScript. Both get the known-version migration.

A useful request is `large total OR (country FR AND refund velocity)`: it uses
existing primitive conditions but changes their grouping. Establish the risk
reason for that grouping before its implementation. The scratch census includes
this shape; the gate probe uses a smaller `country OR velocity` shape solely to
show the same type boundary, not to nominate that rule as sound risk policy.

Test these three conditions before drafting:

1. **A real gain for the console owner after the hot-load repair.** The new
   combination can be authored from existing conditions without an engineer
   writing another named predicate. Show the existing request queue or the
   authorship step that still matters; don't rename a release wait and count it
   twice. If review is required for both, distinguish writing from reviewing, or
   acknowledge that this particular wait is shared.
2. **A real cost for the service owner after replay and versioning.** Show the
   additional supported surface of general authoring: for example, the recursive
   rule shape and the corresponding editor/explanation behavior the service now
   promises to support. Give the fixed-template design its simpler shape too.
   Don't use the corrected business mistake or common parameter migration as a
   substitute. Don't inflate a small Boolean evaluator into an inevitable giant
   language. If a shared registry generates the schema/editor/dispatch, give it
   its saving and identify the remaining promise, not duplicated plumbing.
3. **The best restricted hybrid still asks someone to give something up.** Add
   the named predicate for this request; let that fix work. Then ask whether the
   supported interface promises analyst-authored combinations, or just these
   named options. If the latter meets the console owner's actual needs, there
   is no reason to pretend the general editor remains a disputed requirement.

This can yield an honest open ending, but it isn't already one. The participants
may weigh a small maintained language against recurring engineering involvement
differently. That is legitimate if the scenes establish both and nobody needs to
ignore a working alternative. If both accept the restricted hybrid, record the
local convergence and take the debt to the author under the changed kill rule.
Do not move it to Ch23 or turn a future possibility into a present requirement.

### The census should delimit the question, not answer it

My illustrative journal has **6 parameter changes, 2 recombinations and 1 new
primitive**. The probe derives those totals from nine entries, with a concrete
example of each. The six parameter changes do not distinguish the designs. The
new primitive requires engineers in either. Only the two recombinations expose
the authoring choice.

Those integers contain no ranking of consequences. In a four-order waiting batch,
one order would newly be held by the intended combination. That same missed hold
can occur while waiting for code authorship **or** approval of a data change. It
isn't automatically the price of code. We should not pair one missed hold with
two extra holds from an already-repaired rule and pretend that arithmetic settles
risk policy.

Use a small census once, then follow one consequential recombination. Name the
person paying each remaining cost. Dafna owns the console and represents its
analysts' change process; Eden owns the service and its supported authoring
surface. State their authority before the ending. Neither is automatically the
risk-policy owner merely because they wrote a tool for that team.

### The Ch21 fallback is weaker and converges

A `withPolicy({attempts, scope, ms})` can delegate to the exact same `withRetry`
and `withTimeout` composition, with `scope` saying attempt or whole job. The probe
checks that construction order and retains the direct function path. It doesn't
retest the already-checked timeout algorithm.

For the shared supported policy, one implementation can expose both a data-driven
entry point and the low-level functions. Persistable settings stay data; the
operation and the owner's repeatability contract stay code. Neither caller loses
its interface. Without a new demonstrated constraint, refusing that delegating
export would recreate Ch20's manufactured disagreement. Prefer the primary
candidate for the bounded round; don't spend another round on this fallback.

## 3. The incident: choose the audit variant and keep the engineer competent

A console's ordinary JSON save cannot acquire a callable function over that same
JSON boundary. The “console's next save removes the function” version needs more
setup than it appears to, and invites the question why anyone expected the
browser to preserve a server closure.

Use the service's **in-memory enriched policy** instead. Its parameters were
loaded as data; an engineer attaches a working hold predicate for evaluation.
The function is a legitimate runtime value and passes the ordinary behavior test.
The mistake is feeding that enriched object into a log that promises a complete
account of the active policy. Establish that promise before serialization.

My audit probe gives two runtime policies identical saved parameters and different
predicates. Their JSON is identical; one holds the country-only order and one
doesn't. A record naming a retained code version, its parameters and input facts
replays the code-owned decision correctly. Let Eden make that repair. Do not imply
functions cannot be audited or that printing source is their strongest answer.

The data design also needs the interpreter's meaning pinned for historical replay.
A saved tree alone is insufficient if its evaluator changes. One clause for the
code/evaluator version and the input facts is enough; no event-sourcing framework.
After repairing the audit, the room can ask who gets to change the next grouping.
That question is a better Turn candidate than a second serialization surprise.

Also fix the threshold wording. The source-capture probe uses `limit = 3` and `>`:
it holds **four**, not three, refunds. For “three refunds in seven days,” use
`count: 2` with `>` (as mechanism 6 does), or consistently use `>= 3`. Don't let
the prose switch silently between those contracts.

## 4. Mechanisms: results and claim boundaries

| Mechanism | Independent result | What the chapter may claim |
|---|---|---|
| 1. JSON saving | `{"reviewAbove":500}`; the three inputs' holds change from `[false,false,true]` to `[false,false,false]` after reload. | A function-valued object property is omitted by this JSON serialization. No compile error. |
| 2. Clone | `DataCloneError`: `(o) => o.refundsLast7Days > limit could not be cloned.` | This copy fails explicitly. It is not silent invisibility. Keep it a short answer or Take, not a second incident. |
| 3. Source | `(o) => o.refundsLast7Days > limit`; the source reconstructed without its closure throws `ReferenceError`. | This text is not the saved captured environment. It doesn't disprove versioned code artifacts. Reconstructing source is a probe, not a recommended loader. |
| 4. Json type | TS2322, naming `extraHold` and the function's incompatibility with `Json`. | It rejects this visible policy type at the checked boundary. |
| 5. Exhaustiveness | Adding `newAccount` produces TS2322 at `never`. | The evaluator must handle that added checked kind. It does not certify the intended Boolean combination or validate stored bytes. |
| 6. Shape evolution | Code literal TS2322 for missing `days`; asserted stored rule compiles and returns no reason; migrated rule returns `velocity`. Parser rejects the old shape. | Distinguish code-authored literals from persisted values. Versioning can preserve the old seven-day meaning. |

Two further limits matter:

- **`Json` isn't a runtime guarantee.** Widening the same object to
  `{ reviewAbove: number }` hides the callback from its static type; assigning
  that value to `Json` compiles while the callback remains on the runtime object.
  A spread copy retains the callback too. Don't claim every copy, diff or audit
  treats a function as invisible. Keep this out of the manuscript unless somebody
  makes that stronger claim; a known data projection and the established parser
  are enough here.
- **The correct type does not establish the correct business rule.** `all`, `any`,
  `&&` and `||` all type-check in the corresponding valid programs. Review and
  replay can improve either side. TypeScript's concrete win is the missing field
  or kind at a checked use, not every combination being correct.

## 5. Principle direction

Liron is the right owner. Replace “a function earns its place when only code can
do it”: a rule evaluator is code too, and the proposed Boolean language can
express these same decisions. Replace “invisible to anything treating it as data”
with the specific boundary behavior above.

I would build his rule around three checks, in one or two ordinary paragraphs:

1. **Follow the value through its consumers.** What must be saved, edited or
   explained without invoking the running service? Separate that stored
   description from the function that evaluates it. A function value doesn't
   carry a serializable description of its code and captured environment.
2. **Test the round trip against the same input.** Saving/loading a configuration
   must preserve the intended behavior under the recorded evaluator version.
   Don't test only the in-memory callable and call the persistence contract done.
3. **Classify the requested change.** Is it a parameter, a combination the format
   already permits, or a new operation its evaluator needs to implement? A rule
   format delegates exactly the choices its vocabulary supports. Changing stored
   shapes needs a compatibility decision as well as a type edit. Parse loaded
   bytes; compilation cannot recheck the old records.

These checks leave the authoring decision open. They do not require storing all
behavior as trees: versioned code plus parameters can satisfy the relevant
consumers. Nor do they turn every callback accepted by an in-process API into a
mistake.

For the four reader cases: (a) separate the stored preference from the callback
and test the round trip; (b) identify a new condition primitive and its owner
rather than smuggling a closure into stored targeting; (c) parse/version the old
bytes, with a migration or explicit rejection; (d) distinguish the source config
from its evaluated settings and record the environment needed by the dashboard.
The dashboard can't discover all possible configurations just by printing one
function's source. This is a proposed testable direction, not a drafted Principle.

## 6. Cast, scope and economy

Use **Liron, Dafna, Eden, Chen, Sahar and Gil**, with Gil confined to the census and
what its counts do not establish. Daniel would be a third expert explaining
mechanisms the professionals can read themselves. Do not add Idan for one parser
line. Liron sets the rule and restricts his analogy when asked; Dafna and Eden
carry the ownership argument. Sahar offers the named-template repair. Chen should
be allowed to accept an answer, not uncover a new defect on schedule.

The bios' pronouns are unchanged: Dafna she; Liron, Eden, Chen, Sahar and Gil he.
Make Dafna's console responsibility and Eden's service responsibility visible
before their preferences. Gil is rested from Ch21; his recent appearances are a
reason to keep his role small, not to invent a benchmark for him.

Keep the technical budget around **12–14 fences**, not six independent lessons
plus two implementations plus a migration tutorial:

- one working policy and the promised audit, then its loss;
- both repaired representations, evaluated against the same orders and reasons;
- the existing-combination request, replay and census;
- the shape change and a short known-version repair;
- at most one small Take for clone/source details.

Make the chapter actually reach **configuration to a function**: show the rule
consumer obtaining a callable over the accepted configuration, perhaps one line
returning `order => evaluate(rules, order)`. Do not re-teach staged preparation,
partial application or caching. Don't make the entire chapter about the opposite
journey, function serialization.

Ch11 is avoided by comparing supported behavior, not builders versus complete
objects. Ch16 gets one parse/version exchange; no new schema framework or error
representation debate. Ch20 supplies the already-familiar factory shape. Ch21's
wrappers stay out after rejecting the fallback. Avoid interpreter CPU claims,
real-vendor promises, or an assertion that an audit regulation requires one design.

## Handoff

The primary decision has a plausible irreducible authoring boundary; the present
cost examples need the repairs above before it earns an open ending. Please
settle the bounded-round scope before any chapter drafting. If the repaired
requirements converge, apply the changed kill rule and take the requirement to
the author. I have not chosen an ending or moved the debt.

Probe entry point: `.probe/codex/run.cjs`; results: `.probe/codex/RESULTS.json`;
install/run logs alongside them. Only this challenge is to be committed, locally,
with no push. All `.probe/`, `.talk/` and `.claude/task-state/` files stay unstaged.
