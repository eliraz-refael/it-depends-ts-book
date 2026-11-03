<!-- Fresh Opus reader, targeted recheck of PR A (164d90f vs 2e20780), 2026-11-03. -->

## PR A recheck report

Scope: every book/ hunk in 164d90f against 2e20780 (14 files, 17 hunks). I read at least 40 lines around each one and checked speakers against 02-meet-the-cast.md. I compiled the technical changes with the repo's tsc 7.0.2 and ran the Zod lists with the installed zod 4.6.6. Scratch files are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/fullreview/verify/pra/.

Result: 14 OK, 3 NEEDS CHANGE (one is a real flow break, two are small).

### NEEDS CHANGE

**1. book/01-the-type-system/01-any-vs-unknown.md, around line 196 (Eli replaces "In these snapshots").** The edit fixes the "these snapshots" problem but breaks the dialogue flow in three ways:
- Eden's line ends "We had to let some of those calls through:", and that colon now leads into Eli's line instead of Eden's code.
- Eli explains `api.get<UserProfile>` before the reader has seen it. It only appears in the Month 4 block further down.
- The unattributed paragraph after the code ("That let us type the callers without waiting for every dependency... I'm not calling it finished.") is Eden's, but the last named speaker is now Eli, so it reads as Eli's.

Fix direction: move Eli's line to after Eden's "I'm not calling it finished." and before Noam's "You're creating typed-looking code that isn't actually typed". Noam's line then answers "It does not check the response body." Eli fits the bio (precise claims) and appears in this chapter's Principle, so he is a reasonable speaker.

**2. book/02-advanced-typescript/03-template-literal-types.md, line 393 (new Daniel line in The Verdict).** It is technically correct: `setSetting<SettingKey>("fontSize", false)` compiles and writes a boolean. But about ten lines later, in Additional Takes, Daniel says the same thing about `publish` as if it were new: "Before anyone calls that publisher a proof... give `K` a union", ending "This signature doesn't preserve every pairing through a union." That nearly repeats the new "We haven't made that signature preserve every pairing when `K` is a union." The reader gets the same point twice from the same person. It also sits a little oddly in the Verdict, where nobody asked.

Fix direction: drop the Verdict line, scope the narrator's claim instead ("For these literal calls, the preview still receives a number"), and add the `setSetting<SettingKey>` example to Daniel's existing Additional Takes beat.

**3. book/05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md, line 70 (project config sentence).** Two small problems:
- "Their compiler enables `strict`..." is wrong: the compiler doesn't enable flags, the configuration does.
- "its package has `"type": "module"`" lost its antecedent. "its" used to point to "The project", and the subject is now "Their compiler".

The sentence also reads like a manual, as it did before. The version bump (zod 4.6.6) is verified: the Zod lists come out `["orderId","cents","currency"]` by default and `["orderId","cents"]` with `io: "input"`, matching line 155.

Fix direction: "Their tsconfig turns on `strict` and `exactOptionalPropertyTypes`, targets ES2022 with Node16 modules, and sets `noEmit` and `allowImportingTsExtensions`; the package is `"type": "module"`."

### OK

- **00-prologue/02-meet-the-cast.md:33**, "until someone has called the function": removes the ambiguous "they've", since Noam is he. OK.
- **01-any-vs-unknown.md:253-262, firstElement returns `T | undefined`.** Linoy's new clause fits. It compiles: `num` is `number | undefined` and `mystery` is still `any`, because `any | undefined` collapses to `any`. "For the second array, `T` is `any`" and Oded's callback still hold. OK.
- **01-any-vs-unknown.md:619 and 670-678, new Dima line and handleWebhook rewrite.** Dima is present (he speaks at lines 324, 347, 517 and 521). Dialogue in Verdict sections is common across the chapters. His line matches the code: `user` is kept for logging, payloads without `user` are rejected, and the purchase guard runs before the SDK. The full After block compiles under `--strict` once `logEvent` is declared; `logEvent` was undeclared before the edit too. The narrator lines before and after it still describe the code. Minor, optional: Dima's line could come before the narrator paragraph so the narration leads straight into the code.
- **02-type-assertions.md:140 and 144**, "incomplete return type" and "leaves out those properties": "those" still points to Oded's "additional properties". OK.
- **02-type-assertions.md:306**, Chen now cites `filter(Boolean)`: confirmed it still doesn't narrow on tsc 7, while an arrow `x !== null` predicate now does, so this is the right example. Minor, optional: "removes missing objects" is a bit odd; "drops the nulls" reads more naturally.
- **02-type-assertions.md:309-323**, `optionalName` and `assertedName` renames: this removes the duplicate top-level `const name`, and the snippet compiles. The inner `name` in the `if` block is fine, and the prose doesn't use the old names. OK.
- **04-enums-vs-unions.md:89**, `{ /* ... */ }`: OK.
- **05-narrowing-strategies.md:309-349**, tag renamed from `kind` to `status`: now consistent with `RequestState` in 03-interface-vs-type.md (lines 267 and 450), and no stray `kind` is left. Dafna's "retrying" sentence was updated and the parser compiles. "unrecognized event status" reads fine, and Guy's "different tag?" still works. OK.
- **02-advanced-typescript/01-conditional-types.md:77**, Oded's "Daniel showed us this in `Unwrap`. I was hoping it was his problem.": in character, and Oded was in the Unwrap scene ("Noam turns to Oded"). It fits his line there, "how often are we writing one of those?". Slight tension with his earlier "Okay. What is that." and "Types can do ternaries.", but it reads as recognition dawning. It doesn't clash with Linoy's later "Remember `Unwrap<any>`". OK.
- **01-conditional-types.md:126-129**, shortened TS2769 output: tsc 7.0.2 prints exactly "The last overload gave the following error." with those two lines. Oded's "either one?" and Daniel's two-overload explanation still work. OK.
- **01-conditional-types.md:431**, sentence dropped: "Against `unknown`, as here" still refers to `TopCheck`. OK.
- **01-conditional-types.md:447**, Chen's switch-typo line is accurate: a misspelled case gives TS2678, and exhaustiveness flags the missed member. "the enum argument" names an earlier debate, not a chapter number. OK.
- **03-patterns-and-design/01-error-handling.md:389**, "With strict checking": the "book's strict settings" reference is gone and nothing else changed. OK.
- **03-patterns-and-design/05-pure-functions.md:199-216**, Dafna's `tickets.map(slaStatus)`: very much in character (her bio shows point-free `.map(toProfile)`). The bug is real and silent: the index lands in `now?: number`, and Eden's fix is correct. The "direct callers / direct call / direct calls" wording agrees with that. Minor, optional: "direct" three times in five lines is a little heavy; Oded's line could drop it.
- **03-patterns-and-design/09-config-to-function.md:249**, Eden's added template/tree disambiguation: it matches `Rule { version: 1 }` at line 159, and "tree" is the chapter's own word (lines 175, 297, 301). Eden adds it without being asked, but it follows naturally from his own answer. Minor, optional: "Those versions" could become "Those format numbers".
- **04-the-real-world/03-testing-typed-code.md:21 and 04-performance-vs-safety.md:17**, "fictional shop" replaced with "the shop's ...": the shop is set up in the chapter just before (02-monorepo-type-sharing.md:17) and used in the bonus chapters. Dropping "Nothing has shipped." loses nothing; the in-memory recorder sentence covers it. OK.
- **05-bonus-ai-and-typescript/01-prompting-for-typescript.md:74, 103 and 121**:
  - `@types/node` 22.20.5 matches the installed package and Node 22.
  - The link moved from Idan's dialogue to narration ("She adds a [later overload]... to the global `JSON` interface:"), and the colon still leads into the code.
  - "Chapter 13's augmentation" became "the badge plugin's augmentation", which matches the `label-kit/frame` badge plugin in 07-declaration-merging.md.
  - All three standards are now met.

No hunk adds a reference to "the book", "a fictional shop", "these snapshots" or a chapter number, or a link inside dialogue. None ends a scene on a silent stage direction.
