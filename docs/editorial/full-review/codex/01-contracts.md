# Independent release review 01 — technical contracts

## Ledger

**Complete:** all 33 files in `reading-order.txt` read start to finish, in order, from the instructed `book/` snapshot. This report was updated after each chapter. No other reviewer reports, editorial history, or check suites were read. No book files were changed.

- Canon: Eli he/theory; Daniel he/compiler; Gilad he/operations; Liron he/FP analogy; Sahar he/removal; Noam he/safety; Oded he/velocity; Gil he/data; Eden he/migration; Linoy she/new features; Chen he/questions; Dafna she/FP; Guy he/OOP contracts; Dima he/synthesis; Idan she/parsers producing evidence. No pronoun inconsistency found.
- Code profile: TypeScript 7.0.2; strict on; exactOptionalPropertyTypes on; noUncheckedIndexedAccess off. Deliberately failing examples and replacement implementations need their narrative context.
- Settings continuity: early unnamed team; account form/preferences in Chapters 8–9; courier/generated tracking clients in 10; export builder/runner in 11–12; registration badges in 13; booking/payout/checkout/support and shop services thereafter. Repeated generic identifiers such as User and Result are generally local examples, not a single evolving domain schema.
- AI bonus uses unnamed assistants and presented artifacts. No unsupported real-model claim found.
- Dedication and introductory files read; the how-to-read sample matches Chapter 1's actual exchange.

### Chapter contract ledger

- **Chapter 1 — The any Problem** — uncertain values stay unknown; deliberate any needs invariant/testing, temporary any owner/removal. Analytics SDK; event map login/logout/order; webhook purchase/refund/signup.
- **Chapter 2 — The Lies We Tell the Compiler** — assertions change static expression type, do not convert/check; any surviving assertion needs external evidence and failure visibility. Central boundary assertions temporary; satisfies static only; non-null check may be outside compiler view.
- **Chapter 3 — The Two Kingdoms** — type-for-data/interface-for-behavior is reader convention, not capability distinction; interface extends catches conflicts at composition; merging deliberate same-scope extension; union aliases needed.
- **Chapter 4 — The Feature That Wasn't Just a Type** — unions default; runtime as-const objects for names/enumeration; numeric reverse-map and familiarity exceptions; ambient const-enum consumption build-dependent; enum-to-union assignment one way.
- **Chapter 5 — The Guard at the Gate** — explicit predicates/assertions are trusted claims; constructive parsers let field reads/return objects be checked; failure transport separate from parsing evidence. User id/email/displayName. In-process events carry Error; schema adds email validity explicitly.
- **Chapter 6 — The Hole in the Function** — generic needs a signature relationship; caller-supplied return-only type is assertion, not validation. Explicit type arguments and public return annotations are separate contracts; removing generics can break explicit callers.
- **Chapter 7 — The Fork in the Type** — conditional extends tests assignability; bare parameter distributes; never/any behavior depends on actual checked type. Overloads also cannot prove branch relationship. Content pipeline normalizes tags to array rather than carrying needless shape choices.
- **Chapter 8 — Who Owns the Fields?** — request contract independently owned; imported User.email becomes nullable but public update rejects null; form follows request, errors/labels follow form keys; Pick/Partial do not runtime-strip or clone.
- **Chapter 9 — Where Did This Event Come From?** — mapped names are static; runtime wrapper constructs strings separately. Shared setter retained, restore emits searchable literals after whole-state replacement. Generic key/payload signatures lose correlation for union keys; SettingsChange union retains it.
- **Chapter 10 — The Call You Didn't Make** — infer extracts last overload; extraction isn't call resolution and loses generic relationships. Proxy runtime transforms all methods; corrected Safe awaits every return; courier explicit adapter, generated simple async client constrained wrapper. Public export permits implementation replacement without forty-callsite churn.
- **Chapter 11 — Some Assembly Required** — ExportBuilder state carries supplied fields and runtime guard rejects source re-selection; default {} forgets known fields and does not prove absence; direct functions/presets equally viable for complete/configured requests. Runner retains permission responsibility.
- **Chapter 12 — The Same Object, Twice** — shared cache method bivariance permits invalid writes; function-property contracts + strictFunctionTypes repair structural checking; variance annotations only same-generic comparisons; separate caches preserve CSV-history/download promises.
- **Chapter 13 — Who Loaded It?** — augmentation scope is compiler-program-wide, runtime import execution separate; optional frame declaration + checked formatter for shared label; fresh-process entry tests avoid accidental setup repair.
- **Chapter 14 — Two Seats or None** — catching into Result fulfills async callback; transactional rollback requires rejection under this Store contract; convert outside await transaction; Result doesn't enumerate all thrown/rejected failures. Test store explicitly serial only.
- **Chapter 15 — What the Number Means** — brands distinguish meanings, constructor checks only stated scalar property; branded object spread can preserve a false relational proof; private class marker + freeze protects representation, but typed mutable aliases still compile; chosen dialog conversion uses scalar count.
- **Chapter 16 — What the Schema Does With the Rest** — carrier durable receipt distinct from domain acceptance; wire unknown status permissible, refund requires known semantic policy; unknown keys stripping distinct from unknown enum values; projection centralizes ownership, raw inbox preserves replay data.
- **Chapter 17 — The Price You Were Given** — readonly/freeze/live getter are distinct; snapshots retain scalar frozen quote, live capability must be a call; owner mutation and immutable calculations coexist; old mutation API remains during migration.
- **Chapter 18 — The Ticket Hadn't Changed** — same inputs purity excludes hidden timezone/clock and required recording; deadline cache bound to copied fixed policy; evaluate pure, slaStatus remains effectful; old entry gains optional now parameter.
- **Chapter 19 — Who Goes Next?** — loop-to-chain refactor must preserve selection, stop and order; returning from reduce skips rather than stops. Daily reset filling dominates payment dates under fixed stated assumptions but violates priority promise; accumulating balances admit starvation, waiting threshold separate policy.
- **Chapter 20 — Before the First Line** — partial application vs currying distinguished; array callbacks supply extras even behind unary interface; arrows preserve element-only runtime calling; preparation timing changes empty-invalid-run behavior; later application cannot reopen already fixed generic inference.
- **Chapter 21 — The Message Kept Going** — wrapper keeps types not retry/timeout semantics; timeout cancellation differs from undoing acceptance; stable logical notice key honored remotely enables repeat safety; exhausted attempts unknown even if last failed pre-send; receiver and overload preservation separate obligations.
- **Chapter 22 — The Policy's Alibi** — runtime closures not serializable policy evidence; retained evaluator identity + params + original facts permits replay; schema versions distinct from evaluator versions; grouping authorship versus new operation ownership explicit.
- **Chapter 23 — Still Waiting for No** — Result map preserves nesting, bind/andThen flattens own result; Promise assimilates callable then; refusal must complete job without rejection; renaming cannot preserve deprecated then alias; six synchronous callers migrate with class.
- **Chapter 24 — Both Tests Were Green** — migration preserves runtime module export/access contracts; allowJs inclusion != checkJs checking; opt-outs and out-of-program scripts need independent caller coverage; export= retains callable CJS, named export retains property access.
- **Chapter 25 — The Other Money** — source and dist private-class identities differ at compile/runtime; public export remedy; project references build graph separate from module imports; dev source condition vs packaged emitted JS; Node stripping depends on installed path, not just source contents.
- **Chapter 26 — It Can't Be Green** — expect-error accepts any error on line; fixtures independently complete; exact equality can overconstrain representation; type/runtime test discovery separately verified with planted errors and contract mutations; runtime executes forbidden calls.
- **Chapter 27 — More Work, Less Time** — measure checker vs runtime separately; counters not elapsed time; distributed tuple retains key/args correlation and existing union-tuple callers; synthetic 2,000 calls cover 200 distinct keys explicitly; benchmark medians are observations not CI promises.
- **Bonus 1 — Which File Says That?** — unnamed assistant artifact; owned contract/config/tests must express input policy not merely output shape; reset overload returns unknown only within compiler program; no-coercion requirement distinguished by accepted/rejected tests; human owner may revise wrong requirements deliberately.
- **Bonus 2 — Whose Refund Is It?** — saved unnamed assistant calls/replies; generated schema describes parser input, not output; currency authoritative in order; authenticated host builds session tool and executor checks current ownership; Result determines outcome field.
- **Bonus 3 — What Did the Fix Fix?** — declaration/API compatibility includes referenced types and unchanged consumers; runtime equivalence does not prove static contract preservation; explicit annotation enforces chosen promise, not correctness of choice; satisfies checks membership but not correct mapping.

## Findings by chapter

### Prologue

No release finding in the three introductory files.

### Chapter 1 — The any Problem

- C01-1 — `book/01-the-type-system/01-any-vs-unknown.md:672`; quote: `logEvent(event.type, event.data);`; category: technical; severity: major. The advertised before/after refactor changes the second logging argument from the user (`logEvent(action, user)`, line 606) to the whole event payload, and silently skips malformed purchase events. The first change is unacknowledged: it changes the logging shape, can break downstream log consumers, and adds order data. Preserve the original user logging contract or explicitly introduce and explain a new logging API; specify what rejected purchases do.

### Chapter 2 — The Lies We Tell the Compiler

No release finding.

### Chapter 3 — The Two Kingdoms

No release finding.

### Chapter 4 — The Feature That Wasn't Just a Type

No release finding.

### Chapter 5 — The Guard at the Gate

No release finding.

### Chapter 6 — The Hole in the Function

No release finding.

### Chapter 7 — The Fork in the Type

No release finding.

### Chapter 8 — Who Owns the Fields?
- C08-1 — `book/02-advanced-typescript/02-mapped-types.md:21`; quote: `That's a mapped type.`; category: clarity; severity: minor. The Principle explains syntax but never states the chapter's practical rule, and the Verdict only inventories the local decision. The useful rule is derivation should connect fields meant to evolve together, not accidentally let a storage model redefine a public API; give that rule one explicit sentence near the opening and a portable wording at the end.

### Chapter 9 — Where Did This Event Come From?
- C09-1 — `book/02-advanced-typescript/03-template-literal-types.md:391`; quote: `The PR keeps the template-typed signatures and the generic setter.`; category: clarity; severity: minor. The crucial union-key limitation is deferred until after the verdict and illustrated only for publish, although setSetting has the same weakness and can corrupt the typed Settings object with setSetting<SettingKey>("fontSize", false). Move or explicitly extend the warning to the adopted mutating setter, so readers understand the accepted contract's limitation before adopting it.

### Chapter 10 — The Call You Didn't Make

No release finding.

### Chapter 11 — Some Assembly Required

No release finding.

### Chapter 12 — The Same Object, Twice

No release finding.

### Chapter 13 — Who Loaded It?
- C13-1 — `book/02-advanced-typescript/07-declaration-merging.md:290`; quote: `Put the import back.`; category: voice; severity: minor. Chen supplies the fix and a complete ambient-module explanation, followed by another explanatory answer at 296. The cast explicitly says he asks questions and never suggests solutions (cast lines 181–191). Give the explanatory repair to Daniel/Dima and let Chen ask which exports the compiler now sees.

### Chapter 14 — Two Seats or None

No release finding.

### Chapter 15 — What the Number Means

No release finding.

### Chapter 16 — What the Schema Does With the Rest

No release finding.

### Chapter 17 — The Price You Were Given

No release finding.

### Chapter 18 — The Ticket Hadn't Changed
- C18-1 — `book/03-patterns-and-design/05-pure-functions.md:187`; quote: `return function slaStatus(ticket: Ticket, now = Date.now()): SlaStatus`; category: technical; severity: major. Adding optional numeric `now` silently changes valid callback usage: an existing `tickets.map(slaStatus)` supplied an ignored index before; it now supplies that index as epoch time and reports current tickets as ok. The reassurance at lines 199–212 that old callers keep working omits this public-API trap. Keep the one-argument export and introduce a separately named timestamp-taking operation, or audit and explicitly migrate callback references as well as direct calls.

### Chapter 19 — Who Goes Next?
- C19-1 — `book/03-patterns-and-design/06-imperative-vs-declarative.md:254`; quote: `Gil runs all 78,125 combinations`; category: debate; severity: minor. The second half spends far more space proving and redesigning payout policy than comparing expression styles, after the chapter has already convincingly settled its actual refactor. Keep the funding-model counterexample, but compress the enumeration/proof and reservation-policy table, or move that exploration into an explicitly optional take, so readers retain the stop-versus-skip rule.

### Chapter 20 — Before the First Line
No independent finding. Cross-book evidence: lines 260–289 demonstrate exactly the optional-parameter/callback hazard omitted from Chapter 18's compatible-entry-point claim (C18-1).

### Chapter 21 — The Message Kept Going

No release finding.

### Chapter 22 — The Policy's Alibi
- C22-1 — `book/03-patterns-and-design/09-config-to-function.md:5`; quote: `That code is your evaluator.`; category: AI-feel; severity: minor. Liron's two opening speeches read like a condensed reference chapter, moving through serialization, artifact retention, round-trip testing, change taxonomy, and migration before anyone can answer. Split the opening down to the one disputed rule and let the scene introduce these explanations; his distinctive analogical voice is replaced here by exhaustive instructional coverage. The same compression appears in Chapter 21's opening at lines 5–7.

### Chapter 23 — Still Waiting for No

No release finding.

### Chapter 24 — Both Tests Were Green

No release finding.

### Chapter 25 — The Other Money

No release finding.

### Chapter 26 — It Can't Be Green
- C26-1 — `book/04-the-real-world/03-testing-typed-code.md:21`; quote: `They're reviewing pre-order support for a fictional shop. Nothing has shipped.`; category: AI-feel; severity: minor. Calling the shop fictional inside the scene and preemptively reassuring us nothing shipped breaks the established fiction and sounds like an audit disclaimer. Keep only the relevant concrete fact that shipped is an in-memory recorder, which is enough to explain the later runtime demonstration.

### Chapter 27 — More Work, Less Time
No independent finding. C26-1's fiction-breaking phrasing recurs at line 17: `a translation helper in a fictional shop`.

### Bonus 1 — Which File Says That?

No release finding.

### Bonus 2 — Whose Refund Is It?

No release finding.

### Bonus 3 — What Did the Fix Fix?

No release finding.

## Verification

Minimal independent probes are in `/private/tmp/fullreview/verify/01-contracts/`. Both compile under TypeScript 7.0.2 with strict and exact optional properties enabled.

- `ch18.ts` copies the final `makeSla` and `evaluate` directly from the chapter, supplying a fixed deadline instead of the calendar walker to isolate callback arity. With now fixed at the deadline: old one-argument callback returns `["breached"]`; `tickets.map(slaStatus)` with the final export returns `["ok"]`; `tickets.map(ticket => slaStatus(ticket))` returns `["breached"]`. The displayed chapter `refresh` already uses the safe arrow; the defect is the overlooked compatibility of valid old callback callers.
- `ch09.ts` reproduces the adopted setter signature. `setSetting<SettingKey>("fontSize", false)` compiles and prints `boolean false` for `settings.fontSize`.

## Cross-book inconsistencies

1. **C18-1:** Chapter 18's preservation of the existing exported call is incomplete: it adds an optional numeric parameter. Chapter 20 explicitly demonstrates the same array-index-as-optional-argument hazard, including its survival behind a unary callback interface (lines 260–289). Chapter 24 and Bonus 3 also demand testing unchanged old callers; apply that standard to Chapter 18.
2. **C13-1:** Chen's direct repair and lecture conflict with the cast's unusually absolute rule that he never proposes solutions (cast lines 181–191). Transfer the explanation, not the useful technical content.
3. **C22-1:** From the late patterns act onward, Principles increasingly become lengthy compressed tutorials. Chapters 21–23 cover multiple caveats before a reply; this weakens the earlier conversational register and erases differences between Eli, Daniel, Liron and Sahar.
4. **C26-1:** The narrator labels the shop fictional in Chapter 26 line 21 and Chapter 27 line 17, unlike the otherwise immersive scenes. This is one recurring polish issue, not two independent findings.

Other apparent disagreements are generally resolved rather than contradicted: Chapter 5 explicitly challenges Chapter 2's throwing parser; temporary and deliberate any are distinguished; Result does not mean never throws; readonly does not mean immutable; type conventions remain conventions; schema acceptance does not imply business permission. Preserve this care.

## Ranked release priorities

Eight justified findings, not fifteen manufactured ones. Severity totals: **0 blocker, 2 major, 6 minor**.

1. **C18-1 — major:** Preserve the one-argument SLA export or audit/migrate callback callers before adding optional numeric now.
2. **C01-1 — major:** Preserve or explicitly change the webhook logger's second-argument contract.
3. **C09-1 — minor:** Put the union-key caveat beside the adopted mutating setter, not only the publisher after the verdict.
4. **C13-1 — minor:** Give Chen's direct solution/lecture to an appropriate explanatory character.
5. **C22-1 — minor:** Shorten encyclopedic Principle speeches so the debate can discover their details.
6. **C08-1 — minor:** State the portable field-ownership/derivation rule explicitly.
7. **C19-1 — minor:** Compress or relocate the lengthy payout-policy simulation after the refactor's rule is established.
8. **C26-1 — minor:** Remove fiction-breaking narrator disclaimers in Chapters 26–27.

## Per-file grades and reading experience

- **Dedication: A** — Plain and personal.
- **How to Read: A** — Clear operating assumptions; opening argument enjoyable; no dull detour.
- **Meet the Cast: B** — Useful motivations and precise canon; repeated anecdote/catchphrase structure gets long near the end.

- **Chapter 1 — The any Problem: B** — The overload-implementation concession is a real earned turn, and Oded/Noam are lively. The long inventory of any scenarios drags before it; the final refactor needs contract attention.
- **Chapter 2 — The Lies We Tell the Compiler: A** — The Map lookup exchange makes the narrow exception concrete, and the complete-fixture disagreement remains honest. Additional Takes slightly repeats the verdict.
- **Chapter 3 — The Two Kingdoms: A** — Guy's multi-interface counterexample and Dafna's concession genuinely test the opening claim. Liron's two building paragraphs slow an otherwise useful conclusion but are canonically his voice.
- **Chapter 4 — The Feature That Wasn't Just a Type: A** — Guy is allowed to win the numeric logger argument, making the preference credible. The final four shapes repeat earlier examples, but the caller distinction stays clear.
- **Chapter 5 — The Guard at the Gate: A** — Guy correctly calls back to Noam's throwing Zod parser and wins the point about equivalent errors. This is the strongest technical-contract debate so far; even the extended failure-transport discussion earns its length.
- **Chapter 6 — The Hole in the Function: A** — Idan deleting the cast while the unsound function still compiles is memorable and accurate. Liron's lens analogy is prolonged, but Chen's challenge makes its limitation part of the scene.
- **Chapter 7 — The Fork in the Type: A** — Deliberately breaking the overload implementation and discovering the real caller make two substantial turns; distribution examples explain the mechanism clearly. Oded's repeated astonishment is funny once, less credible after the earlier conditional previews, but not a release-level inconsistency.
- **Chapter 8 — Who Owns the Fields?: A** — The unchanged-email save failure supplies real stakes, and Guy/Linoy each retain a defensible position. Little boredom; the labels turn nicely distinguishes coupling keys from coupling values.
- **Chapter 9 — Where Did This Event Come From?: B** — The grep exercise is concrete and the final defaults joke lands. Several rounds of registry-versus-wrapper-versus-literal preference repeat without a stronger incident; the core rule is harder to extract than the code mechanics.
- **Chapter 10 — The Call You Didn't Make: A** — The truthy promise accepting a bad tracking code is an excellent concrete failure; the explicit adapter is not falsely declared proven merely for avoiding assertions. The lengthy repair has enough changing stakes to sustain it.
- **Chapter 11 — Some Assembly Required: A** — The same widening first rejecting useful code and then permitting an invalid transition is a strong, coherent reveal. Dafna's final counterargument prevents the builder's protocol from winning by assertion. Extended staged-call examples are demanding but purposeful.
- **Chapter 12 — The Same Object, Twice: A** — Excellent separation of a type-system repair from the product's two data-retention contracts. The forwarding-object experiment and callback to builder widening make a difficult topic concrete. I was engaged throughout.
- **Chapter 13 — Who Loaded It?: A** — The type-only import reintroducing the runtime failure is a genuinely surprising, well-supported turn. Optional versus required augmentation is treated as an operational contract, not a magical safety switch. Additional Takes are useful but push Chen into lecturer mode.
- **Chapter 14 — Two Seats or None: A** — Excellent before/after same-message/different-state contrast, and the reversed-seat test reveals why shallow happy-path verification fails. Alternative adapter is fully paid for and then rightly deferred. Enjoyed the debate rather than merely the lesson.
- **Chapter 15 — What the Number Means: A** — The spread carrying a nonexistent runtime marker is a fresh and valuable complication. The distinction between first/last editing semantics and first/count runtime semantics earns the final choice. Some repetition in the class-versus-draft closing exchange.
- **Chapter 16 — What the Schema Does With the Rest: A** — `skip` versus `review` supplies real business stakes, and refusing all webhooks is allowed to fail before an open type is scrutinized too. The projection debate gets long, but the final ownership decision is earned.
- **Chapter 17 — The Price You Were Given: A** — Frozen getters yielding the wrong historical receipt are an excellent escalation beyond familiar shallow-readonly advice. Class and closure receive a fair comparison. The final extra index example broadens the lesson without overstating benchmarks.
- **Chapter 18 — The Ticket Hadn't Changed: A** — The missing risk record and timezone reveal independently test purity, and the host repair versus explicit policy disagreement feels real. The optional-argument migration deserves a correction despite the strong overall chapter.
- **Chapter 19 — Who Goes Next?: B** — The deployed reduce bug and narrowed filters are excellent. I became bored in the lengthy finance-policy simulation, which makes the chapter feel like a second debate bolted onto a completed one.
- **Chapter 20 — Before the First Line: A** — The single-item fixture concealing index-as-discount and the empty invalid run are two memorable tests. Dima has a distinct package-maintainer stake. Some middle factory/batch alternatives are lengthy, but each pays for a real API decision.
- **Chapter 21 — The Message Kept Going: A** — The timeline is lucid, and moving acceptance ahead of reply is a real turn. Guy's client contract meaningfully defeats the first cancellation fix. Opening Principle is overloaded with nearly the whole lesson; the scene itself is substantially more readable.
- **Chapter 22 — The Policy's Alibi: B** — The lost hook is a crisp incident and the title earns its joke. The last-third agreement on a third request as a future trigger feels more like meeting notes than drama, after the immediate contract issue is already settled.
- **Chapter 23 — Still Waiting for No: A** — The thenable collision is memorable, accurately distinguishes signature/Awaited/runtime, and genuinely requires an atomic API rename. Early-return alternative gets a fair hearing. Long opening again anticipates too much, but the worker's missing completion carries the story.
- **Chapter 24 — Both Tests Were Green: A** — Converting the test out of catching the conversion is a memorable mistake; the unchanged opt-out proves why a green checker is not enough. Good preservation of scope around sum/lookup contracts. The second replay is repetitive but necessary to defeat Noam's first fix.
- **Chapter 25 — The Other Money: A** — The same Money text failing private-field access and the copied-image failure are persuasive tests. Dev checking and deployment are allowed different deliberate contracts. Long configuration sequence remains readable because fifteen dollars is the fixed target.
- **Chapter 26 — It Can't Be Green: A** — The stale fixture masking a different error is an excellent failure, and the closing Noam silence is genuinely funny. Repeated red/green experiments are long but central to the claimed test discipline.
- **Chapter 27 — More Work, Less Time: A** — Both literal misuse and a valid union-tuple caller constrain the optimization; this is strong API-review practice. Profiling detail is dense but it changes the attribution, so it earns the space. Last joke restores Oded's voice.
- **Bonus 1 — Which File Says That?: A** — Dima has good comic resistance and owns the integration decision. `normalizes` read as `validates` is a human mistake, not a magical prompt lesson. Clear continuity with generic-return and parsing chapters; no real-model claims.
- **Bonus 2 — Whose Refund Is It?: A** — Generated documentation faithfully preserving a bad default is an excellent failed fix. Alice/Bob same arguments and same schema sharply demonstrates authorization beyond validation. Positive executor control prevents a vacuous deny-all success. No real-model claims.
- **Bonus 3 — What Did the Fix Fix?: A** — The unchanged mobile caller makes the widening matter, and Oded's runtime-test objection is allowed to be correct. The as-const repair is acknowledged sufficient before a deliberate contract improvement. The final meeting joke pays off the opening. No real-model claims.

## Overall readiness verdict

**Ready after fixes.** Correct the two behavior/API compatibility gaps before release. The book is particularly strong where a green compile and a plausible first repair fail to preserve a concrete promise: transactional rollback, shared-cache writes, frozen live getters, thenable assimilation, packaged module identity, and inferred public returns. Most counterarguments receive real answers, and the AI bonus stays specific and evidence-based. Remaining work is mostly voice and pacing: shorten the increasingly exhaustive opening lectures, keep Chen questioning, and remove the occasional narrator disclaimer. The low finding count reflects the quality of these chapters, not a reduced reading scope.
