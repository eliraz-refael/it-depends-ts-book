<!-- Verbatim report of an isolated Principle-only reader of Ch25 draft 2 (3eaea32), commissioned by Claude on 2026-10-28. It saw only the Principle section. It reports one stray scratch write outside its work directory, which it deleted. -->

# Principle-only reader report (Ch25 draft 2)

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r2/principle.md`. I checked (c) and (d) with real fixtures under `.../scratchpad/ch25r2/work/` (tsc 7.0.2, Node 22.23.4). One slip to report: a stray `cp` in my shell wrote a scratch copy of a tsconfig to `/tmp/x`. I confirmed the file held only my content and deleted it.

## Cases

**(a) Relative import into `packages/money/src`**
- **What the compile proved:** the caller was checked against money's *source* declaration of `Line`. It was not checked against `dist/index.d.ts`, which is what everyone importing `@shop/money` sees. So the green build says nothing about the public contract. It also doesn't catch the case where `Line` isn't exported from `.` at all.
- **What I'd change:** import from `@shop/money`. If `Line` isn't exported there, ask money's owners to export it.
- **Relied on:** "Use the package's public exports… If a type or function is missing, ask for an export instead of reaching into the source directory." The first question, "Which declarations is this caller being checked against?", gives the diagnosis.
- **Enough?** Clear.
- **Follow-up (subpath `"./parse"`):** don't reject it. "Including its deliberate public subpaths" covers it directly. Since both entry points resolve to the same dist `Money` declaration, there's only one class identity. Clear.

**(b) `Cents` not assignable to `Cents` (src vs dist)**
- **What I do:** refuse the `as unknown as Cents`. The error names two declaration files, so there are two declarations, and each one has its own `unique symbol` brand. The cast hides the fact that the program loads money through two routes.
- **The fix:** route every import through one path, the public export, so only one declaration exists. Usually that means finding the relative import or the `paths` mapping that reaches into `src`.
- **Relied on:** "When two types have the same name but won't assign, read the declarations in the error before you assert them equal." Also the first question.
- **Enough?** Needed inference. The sentence tells me to read before asserting, but not what to conclude or what to do next. A reader could read both declarations, find they look identical, and cast anyway. The "therefore pick one route" step comes from my own TypeScript knowledge, not from the text. "Use the package's public exports" points toward the fix, but the Principle never links the two sentences.

**(c) Runtime export `./src/index.ts`, Node type stripping**
- **Is the local run evidence?** No. In a linked workspace the symlink resolves to a real path outside `node_modules`, so Node strips the types and runs the file. Copied into the image, the file sits under `node_modules`, and Node 22 refuses it. I verified both:
  - linked run printed `$1`
  - copied run threw `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`
- **What to do:** build money to JS, point the runtime export at it, and run the packaged layout before deploying.
- **Relied on:** "Which implementation will its import load when you run it?" and "For the build you package and deploy, rebuild the dependencies and run what you're shipping." The laptop/image line matches this case closely.
- **Enough?** Needed inference. The Principle tells me to distrust the local run, but the actual failure (no stripping under `node_modules`) is outside knowledge it doesn't hint at. Still, following the rule ("run what you're shipping") would surface the failure without that knowledge.
- **Follow-up:** yes, development checks may read source types. "Development can check source directly." Clear.

**(d) Stale `dist`, `tsc -p` with references**
- **What CI reports:** green. `tsc -p` reads the referenced project's output `.d.ts` and doesn't rebuild it, so `format(1250)` is checked against the old one-argument signature. I verified: `tsc -p apps/api` exited 0.
- **What it should run:** `tsc -b apps/api`, which rebuilds money first and then fails with `TS2554: Expected 2 arguments, but got 1`. I verified this too.
- **Relied on:** "What rebuilds that implementation when the source changes?" and "A green check against an old declaration doesn't tell you whether today's package will accept the call."
- **Enough?** Needed inference for the specific command. The Principle never names `-p` or `-b`, or says that `-p` doesn't build references. It gives the right suspicion; the fix needs tsc knowledge.
- **Follow-up (no reference):** not enough. `tsc -b apps/api` then builds only the API, resolves `@shop/money` to the stale `dist`, and passes. I verified: exit 0. You need the reference, or an explicit build of money first.
- **Relied on:** "A build only follows the dependencies it has been told about." This is the cleanest case for that sentence. Clear.

## Brief answers

**1. Is there a single explicit, testable rule?**
Partly. The real instrument is the three questions: "Which declarations is this caller being checked against? Which implementation will its import load when you run it? What rebuilds that implementation when the source changes?" They are concrete enough to apply to every case, and they did the most work for me.

The second paragraph is four or five separate directives rather than one rule. They are:
- public exports only
- ask for an export
- read the declarations before asserting
- dev may use source
- ship-builds rebuild and run

Each one is testable, but no single sentence is *the* rule; the three questions come closest.

Terms that are undefined or fuzzy:
- **"deliberate public subpaths"**: what makes one deliberate? Presumably that it's listed in `exports`, but the text doesn't say.
- **"Development can check source directly"**: by what mechanism (`paths`, a `customConditions`/source condition, references)? Not said.
- **"the build you package and deploy"**: as opposed to which other build?

**2. Hardest sentence and weakest sentence**
- **Hardest:** "A green check against an old declaration doesn't tell you whether today's package will accept the call." It's accurate, but "old declaration" only makes sense once you already know `tsc -p` reads built `.d.ts` from references. A reader without that model won't connect it to their CI.
- **Weakest:** "When two types have the same name but won't assign, read the declarations in the error before you assert them equal." It names a step ("read") but not a decision, and it gives no criterion for when asserting is then OK. As written it seems to permit the cast after reading. A stronger version would be "…two declaration paths mean two copies; fix the route, don't cast."

**3. Would I read the chapter?**
Yes.
- **Enjoyed:** the three questions, which have a nice declarations, runtime, rebuild rhythm and work as a portable checklist. Also the closing line, "I want the failure on this laptop, not in the image someone wakes me up to fix," which gives Gilad a voice and a stake.
- **Bored:** the middle of paragraph two reads like a policy list. Five imperatives in a row lose the character's voice until the last line brings it back. "Development can check source directly" is especially flat and feels like a concession inserted for completeness.
