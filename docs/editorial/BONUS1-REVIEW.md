# Bonus 1 — draft 1 self-review

Status: **DRAFT 1; independent readers and Claude's review pending.**

Manuscript: [Which File Says That?](../../book/05-bonus-ai-and-typescript/01-prompting-for-typescript.md).
Governing settlement: [Bonus 1 plan](BONUS1-PLAN.md#settlement-after-codexs-challenge-2026-11-01), commit `bcc90ab`.
Snapshot: [DRAFT1-SNAPSHOT.json](bonus1/DRAFT1-SNAPSHOT.json).

## What the draft does

1. **The handoff owns the argument.** The Principle precedes the scenario and belongs to Eli. It names the callable contract, positive and negative cases, actual project configuration and command, permitted file changes, and the source files imports bring into the program. The disagreement is over deciding those requirements before commissioning an implementation. It is not a claim that the owner must personally type every brace.
2. **The assistant appears through artifacts.** The page shows the original vague request, its fixed returned parser and confident validation explanation. A second request supplies the Result contract and initial tests. Its returned implementation and explanation explicitly include normalization. The final request states the missing coercion decision, names the real project files and command, and requires reporting conflicts. These are fictional artifacts; no model or product was called to obtain or measure them.
3. **The hook has its caller.** The unchecked parser is called with string-valued cents. Its printed `string 1001` comes from the shown `typeof` and addition expressions. Dima already knows why JSON.parse's any bypasses the return annotation; he asks what to send next time. The explanation's confidence and Idan's “validated the vibe” carry the joke.
4. **The reset is bounded.** The exact TS2322 appears before the function's contract changes. The page gives one overload-precedence explanation and a primary-source link, and limits the choice to the small project. The declaration applies to the program, not an author's directory. Array indexing, DOM Response.json, source-level library incompatibilities and the predicate counterexample stay in validation. There is no lexical gate or linter subplot.
5. **The comparison has one contract.** The initial probe is removed before the Result contract and tests are introduced. The two candidates differ only in `Number(value.cents)` versus `value.cents`; both pass the same two numeric cases. Dima explicitly restores the returned coercing implementation before Chen's empty-amount probe. The output is an actual zero-cent success, not a paraphrase of a guessed result.
6. **The Turn changes the requirement.** “Which file says that?” distinguishes the output's number type from the wire-format decision. The provider-policy reason takes one paragraph; the scene returns to the request and acceptance cases. The original two tests remain when the three new tests are appended. The coercing candidate stays compiler-green but fails the text test; the strict version passes all five.
7. **The Verdict is local.** The final request is visible and names the same repository the check runs. It is presented as the request they should have sent, not as an experiment proving that a prompt makes a model obey. Dima wins reuse of existing contracts and tests, can ask for proposed cases, and owns acceptance of the requirement. A later conflict can lead to a deliberate requirement change; it is not permission to move an expected answer merely because an implementation fails it.

## Voice, scope and limits

The four voices are Eli (he), Dima (he), Idan (she) and Chen (he), checked against the cast. Ch7 supplied the calibration: concrete callers, short objections, and jokes that arise from what the program did. Dima's time objection is substantive and changes the ruling. Chen supplies the question rather than an implementation. Idan constructs a value and does not mistake an assertion-free parser for proof of correctness.

The intended retellable scenes are the validation claim printing string cents, the empty-string zero-cent refund, Eli's question, and Dima's final request being shorter than the meeting. The configuration and manifest are complete because they are part of that handoff. The main editorial risk is that this necessary setup still interrupts the opening exchange; a fresh reader should say whether the bounded reset beat earns its space. A second risk is repetition in the Verdict's ownership discussion. Readers should judge the pacing rather than treating the correct checks as evidence of enjoyable prose.

This is an application of earlier tools, not a new safety theorem. Ch1's any cause gets one callback, Ch13's scope one callback, and Ch16's policy one reason. No schema comparison, brand implementation, assertion taxonomy or compiler performance scene is added. Bonus 2 retains runtime model output and tool boundaries; Bonus 3 retains finished-diff review and defects beyond the owned checks. The request is a statement of scope, not an enforcement mechanism or sandbox.

No material settlement deviation. The heading uses the provisional title. The page uses TypeScript runtime tests with the explicitly printed Node types and .ts-import configuration. The selected parser accepts only numeric non-negative safe integers, but the five tests are examples, not an exhaustive specification: they cover 100, zero, -1, 1.5, two string amounts, missing id, null and malformed JSON. The prose does not claim every edge case is handled because those tests pass.

## Principle-only self-test

- **Both answers pass:** the output type alone does not choose an input/coercion policy. The owner must settle that decision and add contrasting examples while retaining valid behavior.
- **Attractive shortcut to green:** a non-null assertion or a lying predicate does not establish the missing input fact. The Principle's absence-of-assertions sentence prevents substituting a syntax ban for evidence.
- **Cheap task with an existing contract:** reuse the signature, existing cases and project command; add a missing decision if needed. The rule does not require a new schema or ceremonial rewrites.
- **Only the generated directory:** the Principle explicitly includes source brought in by imports. A project boundary needs its actual file membership checked; authorship does not select compiler options.

These are self-tests, not isolated reader results. The final Principle should still be read independently against the four settled cases.

## Validation and freeze

The targeted check passed on TypeScript 7.0.2 and Node 22.23.4: **11 fences / 32 compiler cases / 16 runtime groups / 1 file-list query**. The eleven fences are nine TypeScript and two JSON; all three blockquoted requests are extracted too. The actual `npm run check` command from the extracted manifest runs against the temporary repository. Its compiler invocations are included in the compiler-case count, and its runtime invocations in the runtime-group count.

Five owned files are SHA-256 checked before and after candidate runs: contract, tests, manifest, configuration and reset. At the Turn only the owner's acceptance-test hash changes; the other four are asserted identical. A deliberate comment change proves the ownership guard rejects a mutation, then is restored. The final source, owned hashes and absence of the temporary probe are checked again at the end.

The text-amount loop fails on its first element under coercion. Separate runtime calls therefore assert both string values independently against both candidates. The always-reject control runs separately, fails exactly the two positive tests, and passes all three rejection groups when selected alone. Its restoration is green. A lying predicate also compiles and fails the behavior tests, with a restored-green control. The reset's removal restores both the original compile success and runtime output.

The dependency checks distinguish ordinary imports from directly compiled source. Published Zod/Express/Node declarations pass with skipLibCheck:false, with and without the reset. Directly compiling the pinned Zod source yields the five expected TS2322/TS18046 diagnostics only with the reset; removing it restores green. The DOM JSON-return hole, module/global declaration scope and imported old source under a stricter configuration are validation-only limits. No timing assertions or real-model observations appear in the suite.

`npm run check` completed with exit 0: **464 fences / 806 compiler cases / 324 runtime groups**, plus two compiler-default cases, two source searches and nine file-list queries. The full run repeated the Bonus 1 results above, including 25 ownership verifications. The manuscript, validator, runner and shared compiler profile were hashed before execution and verified unchanged afterwards.

The frozen manuscript has **2,328 words** and 11 fences. SHA-256: `bbb3592788f7f64ce4a10d9fb030ac4672c10738e2a64f34f2e728b7b29b1952`. The snapshot records each fence hash, compiler/runtime versions, the full-run log hash, final check summary and both sets of owned-file hashes. All apostrophes in the manuscript are straight. The existing locked installation was used; no fresh-export validation is claimed.
