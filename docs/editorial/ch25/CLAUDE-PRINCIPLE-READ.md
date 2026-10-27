<!-- Verbatim report of an isolated Principle-only reader of Ch25 draft 1 (8f17134), commissioned by Claude on 2026-10-27. It saw only the Principle section. -->

# Principle-only reader report (Ch25 draft 1)

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r1/principle.md`. I checked (c) and (d) with TS 7.0.2 and Node 22.23.4. The fixtures are under `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r1/work/`.

## Cases

**(a) Relative import into `packages/money/src`**
- **Answer:** The compile proves only one thing: this file's code fits the *source* declaration of `Line` as it stands in the working tree. It says nothing about what `@shop/money` publishes through `dist/index.d.ts`. That is the declaration every other caller is checked against (question 1). It also says nothing about what ships. It can also give the app two declaration sources for the same package. If `Line` refers to `Money` or `Cents`, that is case (b) waiting to happen.
- **Change:** Yes. Import `Line` from `@shop/money`. If `Line` isn't exported, add the export to money.
- **Relied on:** "Use the package's public exports. If a helper is missing, add an export instead of reaching into its source directory."
- **Enough?** Clear. One small snag: "helper" is an odd word for a type-only interface, but the meaning carries.
- **Follow-up (public `"./parse"` subpath):** No, it doesn't have to be rejected. It is a public export, so "use the package's public exports" allows it. The rule is against reaching past `exports`, not against having more than one entry point. What I would check is question 1: `./parse`'s `types` condition must lead to built `.d.ts` files that get `Money` from the same declaration file as `"."`, not from a second copy.
- **Enough?** Needed inference. The Principle never says whether several public entry points are fine. I got there by noticing that the objection in (a) was about source paths, not about counting import paths.

**(b) `Cents` not assignable to `Cents` (src vs dist)**
- **Answer:** Reject `as unknown as Cents`. The error names two files, so there are two declarations. Each has its own `unique symbol`, so they really are different types, and the cast would only hide the split. Find the import that resolves into `packages/money/src`, usually a relative import into source or a `paths` mapping. Change it so both sides resolve through the package's public export to one declaration.
- **Relied on:** "When two types have the same name but won't assign, read the declarations in the error before you assert them equal. You may be looking at two definitions." The pun on "assert" works.
- **Enough?** Clear for the diagnosis and for refusing the cast. The fix needed inference: the Principle says "you may be looking at two definitions" but not "so make them one". I had to link it back to "use the public exports" myself.

**(c) Runtime export `"./src/index.ts"`, deployed by copying into `node_modules`**
- **Answer:** No, the local run is not evidence. Question 2 asks what the import will actually load when it runs, and the answer differs between the two setups:
  - In the linked workspace, the package's real path is outside `node_modules`, so Node strips the types and runs it.
  - In the image, the file is under `node_modules`, and Node 22 refuses to strip types there.
- **Verified:** The symlinked app printed `1250`. The copied layout threw `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`.
- **Relied on:** Question 2 ("Which implementation will its import load when you run it?") and "the release still needs to build its dependencies and run the code it will ship."
- **Enough?** Needed inference. The verdict follows from the text, but the actual reason (Node won't strip types under `node_modules`) comes from outside knowledge. A reader without it would only know "be suspicious", not why.
- **Follow-up (dev reads source types, release builds and tests JS):** Yes, that's fine. "Development can check source while a release uses built declarations, but the release still needs to build its dependencies and run the code it will ship." Clear.

**(d) `tsc -p apps/api` with a stale `dist` and a reference to money**
- **Answer:** CI reports green: `tsc -p` exited 0. `-p` doesn't build referenced projects. The import goes through `exports` to `dist/index.d.ts` from the previous commit, which still says `format(cents)`. CI should run `tsc -b apps/api`. That rebuilds money from the current source first, then reports `TS2554: Expected 2 arguments, but got 1` (verified).
- **Relied on:** "A green check against an old declaration doesn't tell you whether today's package will accept the call." Also question 3: "What builds that implementation from the source you just checked?"
- **Enough?** Needed inference. The Principle tells you to distrust the green check, but you need to know that `-p` ignores references while `-b` follows them. The Principle mentions neither project references nor build mode.
- **Follow-up (no reference, switch to `tsc -b`):** Not enough. Without a reference, `-b` builds only `apps/api` and still reads the stale `dist`. I verified it exits 0. You need to add the reference, or build money explicitly before the API. Same sentences relied on. Needed inference.

## Questions

**1. Is there a single explicit, testable rule? Is any term undefined?**

Not quite a single rule. The opening is a three-question checklist ("ask three questions…"), and a checklist is a method, not a rule. The most explicit and testable sentence is:

> "Use the package's public exports. If a helper is missing, add an export instead of reaching into its source directory."

You can test it by grepping for imports into `packages/*/src`. The "read the declarations in the error" line is also usable. But the parts that decided (c) and (d), freshness of built output and what ships, live in questions and a long sentence rather than a stated rule.

Terms that are unclear or never defined:
- **"release":** Could mean the publish step, the CI build, or the deploy image.
- **"helper":** Odd for a type.
- **"Sharing a name":** I can't tell whether this is the package name, the workspace link, or the type name from the sentence just before.
- **"green check":** Fine for CI readers.

**2. Hardest and weakest sentences**

- **Hardest:** "Development can check source while a release uses built declarations, but the release still needs to build its dependencies and run the code it will ship." It has three actors and two meanings of "build". I had to read it twice, and I only fully understood it after working through (c) and (d). Question 3 ("What builds that implementation from the source you just checked?") is a close second. It is abstract until you've seen a stale `dist`.
- **Weakest:** "Sharing a name doesn't arrange any of that." It is a vague closer, "name" is ambiguous, and "any of that" points back across the whole paragraph. The best line is "A green check against an old declaration doesn't tell you whether today's package will accept the call." It is concrete and it is the real hook.

**3. Would I read the chapter?**

Yes, moderately. The three questions promise a story where each one fails in turn, and "`Cents` is not assignable to `Cents`" is a good hook.

- **Enjoyed:** The "before you assert them equal" pun, the green-check line, and the character name Gilad Stacktrace.
- **Bored:** Paragraph two turns into a flat list of instructions, five directives in a row with no image or example. Nothing in it is funny, so the fun currently rests on the name alone.
