# Chapter 22 — Configuration to Function (working title)

Status: **PLAN SETTLED; CHAPTER JOINTLY APPROVED**, 2026-10-25. The ending decision and drafting brief below govern the historical original proposal; the author has dropped the open-ending requirement.
Branch: `codex/chapter-22-config-to-function`, based on `origin/main` `0364069`.
File: `book/03-patterns-and-design/09-config-to-function.md`.

## This chapter's first job: an honest "The Debate Continues"

Act III still owes one. Ch18, Ch19 and Ch20 each planned for it, and each room honestly converged.
Ch20's [ending decision](CH20-PLAN.md#ending-decision-after-the-bounded-round-2026-10-23) moved it
here because this subject has two owners by nature:
- people who edit and audit configuration as data;
- engineers who need a function's full power.

This plan chooses the decision and its conditions now, before drafting.

**What counts as honest** (unchanged from Ch20):
- The decision belongs to people in the room, and both answers are correct code after any bug is
  fixed.
- It depends on conditions the scenes show happening, with a cost each way that lands on someone
  specific. The ending introduces no new conditions.
- It stays open because competent owners weigh those costs differently, not because data is missing
  or someone is shy.
- No mechanism the room knows of removes the trade-off for everyone. If one does, the room must use
  it, and then there is no open ending.

**The challenge must attack the ending first,** before the scenario details. Hunt for the
convergence; the likely ones are listed below.

**The kill rule, changed from Ch20's.** If the ending converges after one bounded design round, Ch22
ends in a local Verdict and **the debt does not move again by default.** It has moved three times.
I'll take the question to the author: Ch23 (monads light) is a poor home for it, and the honest
finding may be that Act III's subjects converge locally, and the requirement should be met
differently or dropped. Don't draft toward a Verdict before that decision.

## What earlier chapters already settle (do not repeat)

- **Ch11:** builder vs complete configuration values with preset functions, as a *construction*
  API. Ch22's question isn't how a config object is assembled, but whether a behaviour is described
  as data or written as code.
- **Ch14:** exceptions vs returned errors.
- **Ch16:** parsing stored data at a boundary. Rules loaded from storage need parsing; that gets one
  line or one exchange, not Ch16's argument. Idan, if cast, doesn't re-argue it.
- **Ch19:** declarative vs imperative *form*. A rule language is "declarative", but don't re-argue
  loops vs pipelines.
- **Ch20:** staged factories. Compiling a rule once into a per-order function is `priceWith`'s
  shape; use it in one line if needed, without re-arguing argument shape.
- **Ch21:** wrappers, and the policy-object vs composed-wrappers question that Ch21 deferred here.
  Ch22 may take it up only if Codex's candidate is better than mine; otherwise no wrappers.

**Later chapters to stay clear of:**
- **Ch23, monads light:** no Reader monad, no dependency injection through closures as a pattern,
  no fp libraries.
- **Part IV, performance:** no timing claims. Counts are fine.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

My probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`, untracked.

1. **A function in a config object disappears when it's saved, with no error.**
   - `type Policy = { reviewAbove: number; extraHold?: (o: Order) => boolean }`.
   - `JSON.stringify(policy)` compiles and returns `{"reviewAbove":500}`. The hold rule is gone.
2. **`structuredClone` refuses it at runtime.** `DataCloneError`, with the message
   `(o) => o.refundsLast7Days > limit could not be cloned.`
3. **A function's source text isn't its behaviour.** `policy.extraHold.toString()` returns
   `(o) => o.refundsLast7Days > limit`. The captured `limit` (3) isn't in it. So "audit the
   function by printing it" doesn't work.
4. **A `Json` type keeps functions out of a config type.**
   `type Json = string | number | boolean | null | readonly Json[] | { readonly [k: string]: Json }`.
   Assigning that `Policy` to it fails with `TS2322: Type 'Policy' is not assignable to type
   'Json'. … Property 'extraHold' is incompatible with index signature. Type '(o: Order) => boolean'
   is not assignable to type 'Json'.`
5. **Rules as a discriminated union, with an exhaustive interpreter.**
   - `Condition = { kind: "totalAbove"; amount } | { kind: "refundsAbove"; count; days } | …`.
   - Adding a kind without handling it fails at the `never` default:
     `TS2322: Type '{ kind: "newAccount"; days: number; }' is not assignable to type 'never'.`
6. **Changing a condition's shape: code-authored rules fail to compile, stored rules don't.**
   - After `days` becomes required, a rule written in TypeScript fails:
     `TS2322: Type '{ kind: "refundsAbove"; count: number; }' is not assignable to type 'Condition'.
     Property 'days' is missing…`. (TS2322, not TS2741, in that context.)
   - The same rule from storage, `JSON.parse(…) as readonly Rule[]`, compiles. At runtime, with an
     interpreter that now filters by `days`, it **silently stops firing**: `false` with 3 recent
     refunds against `count: 2`, where the migrated rule (`days: 7`) gives `true`.
   - Parsing at load (Ch16) turns that into a rejection. Migrating stored rules is then work
     someone owns.

## Candidate decision and scenario

Codex may replace this. Whatever replaces it must keep the ending's honesty requirements above.

**A marketplace holds some orders for manual review before they ship.**
- **The risk team** (analysts, not engineers) owns the hold policy. They change it from an admin
  console, and compliance audits it: "show me the policy that was in force on the 3rd, and why this
  order was or wasn't held."
- **The orders service** evaluates the policy on every order. Its engineers own the code.

Policy v1 is data: thresholds and lists (`reviewAbove`, blocked countries), edited in the console,
stored as JSON, with each change logged.

**The incident (mechanisms 1 and 3).** A fraud pattern needs a rule the data can't express: three
refunds in seven days. An engineer adds `extraHold?: (o: Order) => boolean` to the policy type. It's
a reasonable, competent change: type-checked, tested, shipped the same day. Then:
- the console's save serializes the policy, and the function drops out silently, so the console's
  next save removes the rule;
- or the audit log stores the policy without it, so compliance's record of "the policy in force"
  is wrong.

Codex picks the variant that's shortest and plainest on the page. Someone finds it by comparing held
counts against the rule, not by a crash.

**The repairs, each in its strongest form:**
- **Keep functions out of the config type (mechanism 4)** and give the rule a home in code. That
  fixes the incident's silent loss. It doesn't decide the question below; both sides accept it.
- **Rules as data (mechanism 5).** Engineers write a vocabulary of condition kinds; analysts
  combine them in the console (`all`, maybe `any`); an interpreter evaluates them and reports which
  rule held the order. Analysts recombine without a deploy, and compliance reads the policy and each
  decision.
- **Structure in code, parameters in data.** Engineers write the hold rules as TypeScript
  functions; the console tunes only named parameters (`velocity.count`, `velocity.days`). Every rule
  is type-checked and tested in CI, and a change in a condition's shape fails to compile at every
  use (mechanism 6). Each decision can still carry a reason.

**The open decision:** where the policy's *structure* lives. Do analysts compose conditions as data
in the console, or do engineers write the combinations in code, with analysts tuning parameters?

**Conditions the scenes must show before the ending (chosen now):**
1. **The change census.** Last quarter's policy changes, from the change log, in three kinds:
   - parameter changes, which both designs handle in the console;
   - recombinations of existing conditions, which only the data design handles without a deploy;
   - new condition kinds, which both designs need engineers for.

   Small integers, printed on the page, with one concrete case of each.
2. **What each design costs, each shown once:**
   - **Data:** an analyst-composed rule that was wrong in a way no compiler could catch (for
     example `any` for `all`, holding every order from one country), and the interpreter as a
     language the service team maintains: every new combinator, every stored-rule migration
     (mechanism 6).
   - **Code:** a recombination that waited for an engineering release, and the orders that went
     through unheld during the wait. A count, not a duration.
3. **Who pays:** the risk owner pays for the code design in response time and in dependence on
   another team's queue; the service owner pays for the data design in maintenance and in rules
   reaching production that no engineer reviewed.

**Why I think it stays open, and where it might not.** These are the convergences Codex should
attack:
- **A dry run.** Every console change is replayed against last week's orders before it takes
  effect, with the counts shown to the analyst. That catches the `any`/`all` case. It doesn't stay
  open if it also answers the service team's other costs. I don't think it touches the migrations or
  the growth of the language, but that's the claim to test.
- **Config as code with a fast path.** Analysts edit a typed policy file through review, and it's
  checked and hot-loaded without a service release. That gives compile checks and history with no
  deploy. It isn't a convergence if the analysts' stated requirement (the console, no repository
  workflow) is real on the page. It is one if that requirement is soft.
- **Parsing stored rules at load (mechanism 6 plus Ch16).** It turns silent non-firing into a
  rejection, but someone still migrates the rules. Check that it doesn't remove the cost entirely.
- **"Both": data for the common shapes, code for the rest.** It's only open if the boundary between
  them is itself the disputed thing (who decides when a rule graduates to code), shown, not
  asserted.

**If the primary decision converges,** the fallback is Ch21's deferral: a shared module's API for a
recurring policy (`withPolicy({ attempts, timeout })` as reviewable data vs composed functions).
I expect it to converge faster. Codex should say which decision is more honestly open, with
evidence, or that neither is.

## Principle (must be stated, in an expert's words, before the scenario)

**Liron Closure**, who has set two Act III Principles (Ch14, Ch17). Act III's others have been Eli
(Ch15, Ch18), Gilad (Ch16, Ch21), Sahar (Ch19) and Daniel (Ch20). Data vs code is a Lisp veteran's
subject, and his bio's limit is the chapter's: his analogy ("data, then functions, then macros") has
to meet a practical question it doesn't answer.

**Its direction, not its wording:**
- Configuration is data when the people who read, change or audit it can't, or shouldn't, run
  code. A function earns its place when the behaviour needs what only code can do.
- Before moving behaviour from data into a function, check who loses what: who can still read it,
  change it, save it and explain a decision it made.
- A function in a config object is invisible to anything that treats the object as data (saving,
  copying, diffing, auditing), and the compiler doesn't warn you.
- When rules are data, the interpreter that runs them is a language its owners maintain.

**It must not pre-decide the open decision.** It gives the reader a way to ask the question. The
chapter shows where competent people still answer it differently. If the Principle settles the
ending, one of them is wrong.

**It must give a test, not a mood.** Every condition must be checkable from the Principle alone,
with no undefined terms (the Ch18–21 readers stalled on those).

**Principle-only reader cases:**
- **(a)** A notification-settings object with a `shouldNotify?: (event) => boolean` field, saved to
  user preferences in local storage. What breaks, and what would they do?
- **(b)** A feature-flag service where product managers target users by plan and country, and
  engineering asks for "users whose workspace has more than three admins". Data, function, or a new
  condition kind, and who decides?
- **(c)** A rules table stored as JSON whose condition type just gained a required field. What
  happens to the stored rules, at compile time and at runtime?
- **(d) Transfer:** a build tool's config file, written as a static object or as a function of the
  environment, read by a dashboard that lists every repository's settings. The chapter needn't show
  it.

## Cast

- **Liron Closure** (he): the Principle, the data-vs-code frame, and where his frame runs out.
- **Dafna Functor** (she): owns the risk console and its rule format. Rules as values with an
  interpreter is her ground. Rested in Ch20–21; give her a side she takes because of what she owns,
  not because she likes pipelines.
- **Eden Legacy** (he): owns the orders service. He has migrated stored data at scale, and the
  mechanism-6 migration cost is his evidence. He argues for structure in code, competently.
- **Chen Override** (he): attacks every proposed convergence, especially the dry run and config as
  code. He doesn't propose; he finds what each convergence leaves.
- **Sahar Firstclass** (he): asks what can be removed, and tries the "parameters only" compromise.
- **One for the incident and the census.** Codex chooses with a reason: Gil Benchmark (he; heavy in
  Act III), or Daniel Compiler (he) if the compiler evidence carries the incident.
- **Optional:** Idan Greenfield (she), one exchange on parsing stored rules, without re-arguing
  Ch16.

**Rested:** Guy, Oded, Gilad and Eli (Ch21); Linoy, Dima and Noam (Ch20).

Five or six people. Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- The engineer who adds `extraHold` is competent. The analysts are competent too: their wrong rule
  is a plausible mistake.
- One running scenario, small integers, and every fence checked.
- No timing claims, and no claims about any real rules engine, feature-flag vendor or build tool.
  The console, the risk team and the change log are fictional and stated on the page.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter22.cjs`: compile every TS fence on the book profile, with competing designs as
separate programs.

Runtime groups:
- the incident: the saved policy without its rule, and the held counts before and after;
- the interpreter against the same orders, with the reason for each decision;
- the analyst's wrong rule, and the dry run if the text uses it;
- the stored-rule migration: silent non-firing, the parse-at-load rejection, and the migrated rule;
- the census, if the text derives it from printed data.

Compiler cases:
- every intentional diagnostic the text quotes, verbatim (mechanisms 4–6 at least);
- the success cases the text relies on, with selected inferred types asserted.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers:**
- an isolated Principle-only reader with the four cases above;
- a fresh full reader;
- **an ending-only reader** with the full chapter, as Codex corrected it in Ch20:
  - asked to find a neglected alternative that satisfies both owners' stated requirements;
  - asked to restate the cost each owner declines.

  Failure is an unanswered resolution, or a disagreement the text can't explain. A reader merely
  having a preference is not failure.

## Completion

- [x] Codex challenges this plan, ending first; disagreements are settled on evidence ([challenge](ch22/CODEX-PLAN-CHALLENGE.md)).
- [x] One bounded design round on the ending; local Verdict accepted in `e0f4d2d`.
- [x] Codex drafts and self-reviews ([draft 3](CH22-REVIEW.md)).
- [x] Claude's formal review: Principle-only and fresh full readers, a targeted recheck
  and a final diff review. No ending-only reader under the settled brief.
- [x] Checks durable; full suite green (Ch22: 12/17/17; book: 386/511/234).
- [x] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-25)

Codex's [challenge](ch22/CODEX-PLAN-CHALLENGE.md) is accepted. Where this section conflicts with the
proposal above, this section governs.

**1. The ending isn't open yet, and the plan's costs were partly false.**
- **The dry run works.** A representative replay catches the `any`/`all` mistake before activation.
  Dafna gets that repair without qualification, and the caught mistake can't also be the data
  design's last unrepaired cost.
- **A wrong combination compiles in both representations** (`any`, `||`). TypeScript's win is a
  missing field or kind at a checked use, not a correct business rule.
- **Migration is a shared cost.** Code-owned parameters are stored too, and a versioned reader that
  supplies `days: 7` for version-1 records repairs both. Mechanism 6 stays, restricted to "literals
  fail to compile; persisted values need parsing and a compatibility decision". It isn't Eden's
  winning argument.
- **Hot-loaded engineer-written policy removes the service release.** Eden offers it himself. His
  remaining cost is authorship or approval, not a release.
- **Console-generated TypeScript is still the data design** with another executor. Interpreter vs
  generated code is incidental.

**The surviving decision** is Codex's: *what the console lets an analyst author.* Either analysts
compose an approved vocabulary of conditions with `all`/`any`, or they tune parameters and choose
among named templates that engineers write.

**2. One bounded round, with Codex's three conditions plus one.** Test the request
`large total OR (country FR AND refund velocity)`, whose risk reason is established before any
implementation, against both repaired proposals:
- **Dafna:** a bounded vocabulary with composable `all`/`any`, parsed and versioned, replayed before
  activation. No arbitrary JavaScript.
- **Eden:** code-owned named predicates with parsed, versioned parameters in a separately checked,
  hot-loaded policy artifact, and a working template for this request.

Both get the same input facts, activation checks, reason identifiers, audit record and known-version
migration.

**The pass criteria:**
1. **A real gain for the console owner** after the hot-load repair: the grouping is authored without
   an engineer writing a predicate. Show the authorship step that still matters; don't count one wait
   twice.
2. **A real cost for the service owner** after replay and versioning: the general shape it now
   promises to support, such as the recursive rule type and its explanation behaviour. Give the
   template design its simpler shape. No inflated "giant language".
3. **The best restricted hybrid still asks someone to give something up.** Add the template for this
   request and let it work. Then ask whether the interface promises analyst-authored combinations or
   only the named options.
4. **(Added.) The deferral is tried in the scene:** "templates now, and the general editor when a
   third recombination arrives". It must fail one owner's *stated* requirement, stated before the
   ending by someone with the authority to state it. This is the Ch20 compromise test, and I expect
   it to be the likeliest convergence. If both owners can live with it, that's the local Verdict.

**Authority.** Dafna owns the console and represents the analysts' change process. Eden owns the
service and its supported authoring surface. The interface between their systems is theirs to decide
together, which is what makes the decision belong to the room. Neither is the risk-policy owner, and
the chapter mustn't imply that a regulation requires either design.

**The kill rule stands as changed.** If the repaired requirements converge, write the local Verdict,
and I'll take the debt to the author. It doesn't move to Ch23.

**3. Incident: the in-memory enriched policy.** Parameters load as data. An engineer attaches a
working hold predicate for evaluation, and it passes the behaviour test. The audit log promises a
complete account of the active policy, which is established before the save, and records JSON
that two different runtime policies share. Eden's repair is a record naming the code version, its
parameters and the input facts. The data design gets one clause pinning its evaluator version too.
No event-sourcing framework. The Turn candidate is Codex's: once the audit is repaired, *who gets to
change the next grouping?*

**4. Claims.**
- **The threshold:** "three refunds in seven days" is `count: 2` with `>`, or `>= 3`, used
  consistently.
- **`Json` is a static check** at a visible boundary, not a runtime guarantee. Don't claim every copy
  or diff treats a function as invisible.
- **Clone and source text are at most one small Take.** Source text is not the captured
  environment, and that doesn't disprove versioned code.
- **The chapter reaches "configuration to a function".** The consumer obtains a callable over the
  accepted configuration (`order => evaluate(rules, order)`) in one line, without re-teaching Ch20.

**5. Principle: Liron, in Codex's §5 direction.** Follow the value through its consumers. Test the
round trip against the same input under the recorded evaluator version. Classify the requested
change: a parameter, a combination the format permits, or a new operation. Drop "a function earns
its place when only code can do it" (an evaluator is code too) and "invisible to anything that
treats it as data". Codex's answers to the four reader cases are the pass key.

**6. Cast and budget:** Liron, Dafna, Eden, Chen, Sahar and Gil. Gil is confined to the census and
what it doesn't establish. No Daniel or Idan. Sahar offers the named-template repair and the
deferral. Chen may accept an answer. Show Dafna's and Eden's responsibilities before their
preferences. 12–14 fences, with the census used once to delimit the question (6 / 2 / 1), not to
answer it.

**Next:** Codex runs the bounded round in `.probe/` and writes `ch22/CODEX-ENDING-PROBE.md` with
scene-level evidence for each of the four criteria, or the kill. Then it waits for my decision before
drafting.

## The author drops the open-ending requirement (2026-10-25)

The author has dropped Act III's "The Debate Continues" requirement. One open ending in Act III
wouldn't create the impression it was meant to, and Ch5 and Ch11 already show the format. This
section governs the "first job" and kill-rule sections above.

- **The bounded round still runs,** because its question is now the chapter's: what the console
  lets an analyst author. It decides the ending honestly. It is no longer a pass/fail test for an
  open one.
- **A local Verdict is the expected outcome.** If the deferral ("templates now, the general editor
  when a third recombination arrives") satisfies both owners, that's the Verdict.
- **An open ending is still allowed** if all four criteria hold on the page. It must be earned, not
  needed.
- **The ending-only reader goes,** unless the ending is open.

## The book's premise governs the draft (2026-10-25)

The author's bar for every chapter is that it's **fun to read, and the reader learns something while
enjoying it.** Endings follow the subject: open only when the question is actually a matter of
opinion, otherwise a Verdict.

For Ch22 that means:
- **The settlement's repairs are for the room's honesty, not a checklist for the page.** The dry
  run, versioned reader, hot-loaded artifact, audit record and templates each get the scene they
  need, and none gets a tutorial. If a repair can be a line, it's a line.
- **One story carries it:** the audit that recorded the wrong policy, then the grouping nobody can
  add, then the people who decide who writes it. Keep the reader wanting the next scene.
- **Readers are also asked** where they enjoyed it, where they got bored or skimmed, and which scene
  they'd retell to a colleague. A correct chapter that drags fails review.

## Ending decision after the bounded round (2026-10-25)

Codex's [ending probe](ch22/CODEX-ENDING-PROBE.md) is accepted. **Ch22 ends in a local Verdict:**
- named templates now, with console-editable parameters;
- the current grouping added as a checked template;
- the general authoring editor when the third recombination request arrives. That threshold is a
  trigger the two owners agree, not a number the census proves.

Both repaired designs hold the same five of eight orders, with the same reasons. Replay, the
version-1 reader and audit replay work for both. The deferral fails no stated requirement, and
defeating it would mean inventing one. No staged dissent.

**The drafting brief.** The premise section above governs. This is a story, not the probe report.
- **Hook: the audit that can't answer.** Compliance asks why an order was held on the 3rd. The log's
  policy record wouldn't hold it, because the hold predicate was a function attached in memory and the
  saved JSON doesn't have it. Two different live policies wrote the same record. The engineer who
  attached it was competent, and the behaviour test passed. Establish the log's promise ("a complete
  account of the active policy") before the save.
- **Repair: Eden's versioned code plus parameters.** The record names the code version, its
  parameters and the input facts. Keep it short, with the `Json` check as the type win at the
  boundary. One clause pins the evaluator version for the data design too.
- **Then the real argument: a new grouping.** The risk team asks for `large OR (FR AND velocity)`,
  with its reason stated first. Dafna writes it as a tree in the console; Eden writes a template.
  Show each owner's responsibility before their preference.
- **Turn candidate: the two designs agree on every order.** The room expected the representation to
  decide it. It doesn't: same five holds, same reasons, and the dry run catches the same `any`
  mistake in both. What's left is the promise the console makes to its analysts. If Codex has a
  stronger Turn, use it with a reason. It must change what the room thinks.
- **Census once** (Gil: 6 / 2 / 1), to show that only recombinations distinguish the designs. Then
  Sahar's deferral; Chen tests it and accepts it. Dafna and Eden decide their interface.
- **Reach "configuration to a function":** the consumer turns the accepted configuration into
  `(order: Order) => Decision` after parsing, in one line.
- **One line each, or cut:** the version-1 `days: 7` reader, hot-load, TS2820 for an unknown
  template, the recursive type's extra surface, and the third shape the later editor accepts.
- **At most one Take:** `structuredClone`'s explicit refusal, or source text missing its captured
  value.
- **Principle:** Liron, Codex's three checks (follow the value through its consumers, test the round
  trip, classify the change), in one or two ordinary paragraphs, before the scenario.
- **Cast:** Liron, Dafna (she), Eden, Chen, Sahar, Gil (all he).
- **Budget:** 2,300–3,200 words, 12–14 fences, small integers, no timing, vendor or regulation
  claims.

**Readers:** an isolated Principle-only reader with the four cases, and a fresh full reader, plus a
targeted recheck if needed. Each is also asked where they enjoyed it, where they got bored or
skimmed, and which scene they'd retell. No ending-only reader.

## Draft 1 handoff (2026-10-25)

[The Policy's Alibi](../../book/03-patterns-and-design/09-config-to-function.md) is frozen at
2,379 words and 12 TypeScript fences. [Snapshot](ch22/DRAFT1-SNAPSHOT.json);
[self-review](CH22-REVIEW.md). The local Verdict is templates now, with the third regrouping
request triggering editor work by agreement. The audit incident carries the story into the
current grouping and back to the historical order. No Additional Take.

`npm ci --offline` and the full `npm run check` exit 0. Chapter 22 has 16 compiler cases and
16 runtime groups; the full book has 386 fences, 510 compiler cases and 233 runtime groups,
plus two default cases and two searches. Independent readers and formal review remain pending.
The self-review calls out the tree/interpreter length, policy chronology, and census/deferral
pacing for the fresh reader rather than treating correctness as evidence of enjoyment.

## Draft 2 handoff after formal review (2026-10-25)

[Draft 2](ch22/DRAFT2-SNAPSHOT.json) responds to the findings committed at `c5c80a5`;
[dispositions and pacing self-review](CH22-REVIEW.md). The history now places the original
checks, new refund operation, two regroupings and version-1 settings in one sequence. Templates
are explicitly the existing interface. Dafna challenges suppressed demand; the agreed trigger
counts requests analysts had held back, without assuming how many exist. The three additional
holds are explicitly synthetic samples. The interpreter/tree presentation is shorter, and
opening old activations motivates the legacy reader.

2,518 words; 12 fences. `npm ci --offline` and full `npm run check` exit 0 on the frozen
manuscript and validator: Ch22 12/17/17; full book 386/511/234, plus two default cases and
two searches. No subsequent manuscript or validator edits. The revised Principle-only read
and targeted recheck are pending. Local Verdict unchanged; no ending quota or staged dissent.

## Draft 3 handoff after the second review (2026-10-25)

[Draft 3](ch22/DRAFT3-SNAPSHOT.json) addresses the review committed at `c25817f`;
[dispositions](CH22-REVIEW.md). Policy history is now a short exchange, with the live policy
identified as the total template's output on the third. Settings versions appear only when
Dafna points at `country-velocity` and asks to reopen old activations. The retained release
identifier is separate from format numbers; the proposed tree starts at format 1. The census
uses a threshold edit, and the third regrouping is explicitly the next request.

2,464 words; 12 fences. `npm ci --offline` and full `npm run check` exit 0 on the frozen text
and validator: Ch22 12/17/17; book 386/511/234, plus two default cases and two searches. No
subsequent manuscript or validator edits. Final Principle-only read and diff review pending.
Local Verdict unchanged; no new full-reader round unless the reviewer finds it necessary.

## Final settlement (2026-10-25)

Draft 3 is approved after a final Principle-only reader and my [final diff
review](ch22/CLAUDE-REVIEW-2.md#final-diff-review-2026-10-25), with four prose-only edits and no
fence changes. Final text SHA-256 `cb6dd828f6dbae7a4d0069520d1c4ef02fc0901030fedcf4831b9890ecb3cf2a`, 2,470 words, 12 fences. `npm ci --offline` and the
full `npm run check` exit 0 on TypeScript 7.0.2 and Node 22.23.3; Chapter 22 is 12/17/17.
