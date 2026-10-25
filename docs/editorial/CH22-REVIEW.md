# Chapter 22 self-review — The Policy's Alibi

Status: **DRAFT 2 FROZEN; PRINCIPLE-ONLY READ AND TARGETED RECHECK PENDING**, 2026-10-25.

[Manuscript](../../book/03-patterns-and-design/09-config-to-function.md): **2,518 words**, including code; **12 TypeScript fences**. SHA-256: `89f14da7b95043c9e23260d86de1eab22b88df8cf734eb1b4652225a475b9e5c`.
[Draft-2 snapshot](ch22/DRAFT2-SNAPSHOT.json). Draft 1's snapshot and Claude's verbatim reports remain unchanged.

`npm ci --offline` and the full `npm run check`: **exit 0**, TypeScript **7.0.2**, Node **v22.23.3**. Chapter 22: **12 fences / 17 compiler cases / 17 runtime groups**. Full book: **386 / 511 / 234**, plus two default cases and two searches. No manuscript or validator edits followed the full run. Logs: `.probe/ch22-draft2-install.log`, `.probe/ch22-draft2-targeted.log`, `.probe/ch22-draft2-full-check.log` (untracked). The targeted pass preceded the last prose clauses and the restriction of the legacy reader to the historical campaign; the full pass covers the exact snapshot.

## Response to Claude's draft-1 review

The [formal review](ch22/CLAUDE-REVIEW.md), [Principle-only report](ch22/CLAUDE-PRINCIPLE-READ.md) and [full-reader report](ch22/CLAUDE-FULL-READ.md) were committed at `c5c80a5`. All must/should findings are addressed. The optional interface digression is declined below.

1. **One history.** The console started with separate total and country templates. On the third, Eden added refund velocity to the total check. The first regrouping replaced that policy with FR AND velocity, explicitly dropping the total branch. Its version-1 settings fixed the window at seven days; version 2 exposed `days`. Today's request restores the large-total branch globally. The new-condition census row now names adding refunds to the total check, not a policy that supposedly checked country on the third. The two regroupings are identifiable events. The fixture request ledger now orders these events and uses six parameter edits in three out-and-back pairs, consistent with today's settings.
2. **Status quo and authorship cost.** Before the tree, the prose says that the console uses named templates and that Dafna wants to replace its selector with a composition editor. Eden names the remaining work: an engineer writes the template, another reviews the expression and replay cases, then the policy version loads separately from the orders service. There is no duration or production-volume claim.
3. **Dafna's strongest objection.** The three new holds are explicitly three of Gil's eight samples. Dafna then challenges the request count: a slow engineering path can discourage requests. Gil concedes that the table cannot measure those. Sahar's deferral counts requests analysts held back; Dafna will ask directly and count another existing request now, without resetting the count when this ticket ships. Neither side invents the number of suppressed requests. The current grouping works; the editor trigger remains a negotiated work trigger, not an empirical optimum or a promise of same-day delivery.
4. **Principle voice and consequences.** Liron's Lisp clause leads to JSON dropping JavaScript functions. He defines evaluator as the code reading a description and deciding, and retained code as a named version kept available for replay. The three questions now say who can act: edit a parameter, author a permitted composition (or ask the engineer who owns combinations in code), implement a new operation. The round-trip test and its closing question remain. Old values must retain their meaning or be rejected; changing a type does neither.
5. **Middle and legacy reader.** The setup is shorter. The switch keeps its complete leaf logic, recursive `all`/`any`, and `never` check, with the redundant default block removed. Named leaf values shorten the tree and let the wrong-rule fence show just the mistaken flattening. Dafna now needs to reopen old campaign activations; Eden's known-version default and current-version rejection answer that need. Her hypothetical future tree migration is separate from existing template history. No version-1 tree is invented in the fixture.
6. **Line-level.** Chen names two policies sharing one record and the optional call carrying on after the check disappeared. The record introduction names the literal-key purpose of `as const`; a new compiler case pins TS7053 at the lookup without it. Sahar's second full name is removed. Chen accepts continued access to old activations while the editor is built, rather than supplying a generic closing line.

**Declined optional item:** an `interface Order` versus `Json` detour. The printed type alias works; the dialogue already restricts the static guarantee to visible properties. An implicit-index-signature explanation would add a separate type-system argument precisely where the reader asked for less machinery. This is not a claim that the two declarations are interchangeable at this boundary.

## Self-check and remaining reader questions

The local Verdict remains templates now, with editor work at the third regrouping request, including requests the analysts previously withheld. The first request is not erased when this one ships. Dafna and Eden own the interface decision; risk owns the hold policy. The agreement does not resolve how much hidden demand exists.

The Principle self-check still covers the four required cases: an optional persisted callback needs a replayable record; an unsupported workspace-admin condition needs implementation; a new required field needs parsing and an old-meaning decision; a dashboard consuming configuration needs a usable description or named code and recorded inputs. These are my self-checks, not the new independent reader's results.

The opening's alibi line and restored-false reveal remain. Claude's first full reader enjoyed them, would retell the audit scene and accepted the Turn. Draft 2 retains those strengths. The code middle is shorter, but the chapter grows by 139 words overall because the history and suppressed-demand objection needed answers. The fresh recheck should judge whether naming the three leaves improves reading, whether the policy history can now be retold without rereading, and whether the deferral survives Dafna's objection instead of simply postponing it. The interpreter is still the likeliest place to skim. No new Take, parser tutorial, deployment tutorial or artificial dissent was added.

## Revised validation scope

All 12 fences are extracted, with every printed output still checked. The new compiler case removes `as const` and asserts the exact TS7053 location and message. The new runtime group follows the three policies through the same eight inputs: incident total OR velocity, first regrouping country AND velocity, and current large OR (country AND velocity). The unchanged decision counts and reason IDs remain verified.

The stored-value assertion fixture now uses the actual old country-and-velocity template. Its missing window silently loses the match when asserted as current; the version-1 reader restores seven days. That reader accepts the known historical name and absent window, rejects an explicit incompatible window or an anachronistic template name, and normalizes to version 2. Current templates and the proposed tree require the window. The new tree has no historical version-1 reader. This replaces draft 1's overly broad fixture without adding machinery to the page.

The request ledger and samples are fictional evidence, not production counts or a study. No test establishes the optimal editor trigger, how many unfiled requests exist, delivery time, or performance. The suite verifies known records and the stated contracts; it does not build the console or prove arbitrary future compatibility. The historical draft-1 self-review below is superseded where it describes the old history, sample wording, reader fixture or pending first readers.

Next: Claude's revised Principle-only reader and targeted recheck. **Local commit only; no push.**

---

## Historical draft-1 self-review

Status: **DRAFT 1 FROZEN; independent readers and Claude's formal review pending**, 2026-10-25.

Manuscript: [The Policy's Alibi](../../book/03-patterns-and-design/09-config-to-function.md). Branch: `codex/chapter-22-config-to-function`. Governing drafting decision: `e0f4d2d`; the author's dropped ending quota (`15be228`) and fun-first premise (`4b4be3f`) govern the earlier proposal. [Frozen snapshot](ch22/DRAFT1-SNAPSHOT.json).

## The story and decision

Compliance asks why order forty-two was held on the third. The callback worked, but the audit logger saved the same JSON as a policy without the callback. Eden repairs the record with retained evaluator code, parameters and the input facts. The visible `Json` error is the type win; the text also states the structural-typing limit instead of promising that this type sanitizes objects.

The next request is large total OR (FR AND refund velocity). The chronology is explicit: the policy on the third checked total OR refunds globally; the first regrouping narrowed it to the FR campaign; the current request adds the global high-total branch. Dafna's tree and Eden's template implement the current request. Both preserve the named rule's decision and reason ID, both need versioned readers and retained evaluator versions, and the same replay gate catches a wrong grouping in either representation.

The Turn uses that agreement to narrow the remaining question to who can author another grouping. The 6/2/1 request census appears once, including the open request. Sahar proposes templates now and editor work at the third regrouping request. Chen tests present coverage, delivery expectations and compatibility; neither owner needs to reject the deferral. Dafna and Eden agree as the interface owners, not as the risk-policy owner. The trigger is their agreement, not a statistically established optimum. The final exchange returns to the order that opened the chapter.

There is no Additional Take. Clone/source-text variants, a parser tutorial and a deployment tutorial would interrupt this story. The fixture implements readers to test their stated contract without printing another implementation family.

## Principle self-check (not an independent reader)

Liron gives three actions before the incident: follow the value through its consumers, test the persisted round trip, and classify the next change. I applied those actions to four cases:

1. A local callback later sent to storage needs a saved description or a retained code identity plus its parameters. Calling it successfully does not test saving it. Replay the saved representation with the recorded input and evaluator version.
2. An administrator asking for a new combination can use only the vocabulary the interpreter supports. A genuinely new operation still needs implementation. Choosing templates assigns combinations to code authors; it does not eliminate parameter editing.
3. Old JSON does not acquire a newly required field when its TypeScript type changes. Parse it and implement the known old meaning (here, seven days), or reject an unsupported version.
4. A historical dashboard decision cannot be explained by today's settings or a function's source alone. Retain the relevant settings, input facts and evaluator identity; the captured values and version matter to replay.

This is a self-check only. Claude's isolated Principle-only reader still needs to restate and apply the rule without the story.

## Fairness, voice and onboarding

- Eden's incident is a competent behavior change with a missing persistence test. His repair retains code rather than pretending all behavior must become a data language. It answers the opening audit problem before the authoring dispute begins.
- Dafna gets an actual recursive interpreter, the requested composition and a callable consumer. Her editor supports more combinations without changing that interpreter. A new primitive still needs work on both sides.
- Eden gets an actual checked template, editable parameters and a separately loaded artifact. No service release is invented as an unavoidable cost. The old-policy batch's three missed holds disappear when the new template is loaded.
- Neither designer claims that a valid Boolean expression or a well-typed tree proves the business rule. Both wrong groupings compile; replay detects the same two extra holds.
- The final reader is introduced as the existing saved-template boundary. Its implementation lives in the fixture. The final arrow reaches `(order: Order) => Decision` without another factory lesson.
- The six roles are kept distinct: Liron states and limits the rule; Dafna wants analysts to author combinations; Eden maintains the service and retained code; Chen tests the promise; Sahar proposes the smaller next step; Gil checks decisions and refuses to certify the number three. Dafna is she; the other five are he.
- Against the writing guide and Chapter 7 calibration: the argument uses a concrete mistaken assumption and visible evidence, not a string of expert conclusions. There is no closing speech from every character and no dissent staged to meet an ending quota.

## Where a reader might get bored

1. The `Condition`/`matches` fence, literal tree and `evaluate` fence are the longest uninterrupted machinery. A reader may skim the repeated leaf names before seeing what the console buys. The full reader should say whether those three fences earn their length, or whether the tree needs a shorter presentation.
2. The retained-evaluator repair is followed by a second policy representation and a change in the historical rule. The explicit timeline prevents a hidden requirement change, but it is still a comprehension cost. Ask the reader to distinguish the policy on the third from today's requested grouping.
3. After the Turn, the census and deferral could feel like meeting minutes. Chen's tests and Gil's refusal to certify the trigger are meant to keep the exchange moving. If the reader is already waiting for the ending, shorten this section rather than adding another objection.
4. The agreement on eight inputs is not presented as a shocking runtime discovery: Dafna expects agreement. The change is what that evidence leaves them to decide. Ask whether that earns the Turn heading.

The scenes I expect to be enjoyable are the saved policy supplying an alibi, Chen asking what the test saved, and Gil objecting to being made responsible for the third-request threshold. The audit incident is the scene I expect a reader to retell. These are intentions, not reader findings; the fresh full read must test them.

## Validation

Frozen manuscript: **2,379 whitespace-delimited words; 12 TypeScript fences**. SHA-256: `13db9f3c6087607a2c4505ae08d6a9b3f493245af18ffa448b1d49184bdb8f64`.

- `npm ci --offline`: exit 0.
- `node checks/chapter22.cjs`: exit 0, TypeScript 7.0.2, **12 fences / 16 compiler cases / 16 runtime groups**.
- `npm run check`: exit 0, TypeScript 7.0.2 / Node 22.23.3, **386 fences / 510 compiler cases / 233 runtime groups**, plus two default cases and two searches.
- Full validation ran on this frozen manuscript and validator. No subsequent manuscript or validator edits. Local logs: `.probe/ch22-draft1-install.log`, `.probe/ch22-draft1-targeted.log`, `.probe/ch22-draft1-full-check.log` (untracked).

All twelve fences are extracted with unique prefix matching. Every printed output is executed. The suite pins the lost callback, same JSON/different decisions, visible-function TS2322, retained-version audit replay, all eight current decisions and matching rule IDs, both wrong groupings and their two extra holds, four parameter edits, known version-1 migration, invalid current input rejection, the final parsed callable, three conditional old-policy misses, and a later rule input that preserves named callers. The 6/2/1 table is checked against a fictional request ledger, not external measurements.

Fixture-only Zod readers implement the declared template reader and narrated rule reader. Replay fixtures actually serialize and read the records. Reasons identify the matching policy ID; they are not a leaf-by-leaf explanation trace. Inputs already contain the recorded refund ages. The suite does not implement a browser editor, audit storage service, deployment system, arbitrary future migration, or delivery estimate. There are no timing, vendor or regulatory claims.

## Handoff

Pending: Claude's formal review, an isolated Principle-only reader and a fresh full reader (including enjoyment, boredom/skimming and the scene they would retell), then a targeted recheck if needed. No ending-only reader is required by the settled brief. Draft 1 is not yet approved for publication.
