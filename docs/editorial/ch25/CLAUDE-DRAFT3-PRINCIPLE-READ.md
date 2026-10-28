<!-- Verbatim report of an isolated Principle-only reader of Ch25 draft 3 (c6fe3c3), commissioned by Claude on 2026-10-28. It saw only the Principle section. -->

# Principle-only reader report (Ch25 draft 3)

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r3/principle.md`. I checked three cases with TS 7.0.2 and Node 22.23.4. The fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r3/work/` (subfolders `b`, `c`, `d`).

## Cases

**(a) Relative import into money's source**
- **Answer:** The compile proves only that the app's use of `Line` fits the declaration in `packages/money/src`. It says nothing about `dist/index.d.ts`, which is what every other `@shop/money` import is checked against. Those are two separate declarations of the same package in one program. They stay compatible only while `Line` holds plain structural data. I tested it: once `Line` has a `Money` field (a class with a `#private` member) or a branded `Cents`, the src copy and the dist copy stop assigning to each other. `import type` gets erased, so nothing breaks at runtime. The danger is on the type side.
- **Change:** Import `Line` from `@shop/money`. If it isn't exported, ask money to export it.
- **Relied on:** "If a type or function is missing, ask for an export instead of reaching into the source directory." I also used question 1, "Which declarations is this caller being checked against?"
- **Verdict:** Clear on what to do. Why it's dangerous needed inference: the Principle never says that reaching into src puts a second copy of the declarations in the program. It only gets there later, in the "separate source and built copies" sentence.
- **Follow-up (`"./parse"` subpath):** No, don't reject it. A subpath listed in the exports map is public, and it re-exports the same `Money` declaration, so there is no second copy.
- **Relied on:** "Use the package's public exports, including subpaths listed in its exports map."
- **Verdict:** Clear. The phrase "including subpaths" anticipates exactly this objection.

**(b) `Cents` is not assignable to `Cents`**
- **Answer:** Refuse the `as unknown as Cents`. The two paths in the error show the program holds two declarations, one from `src` and one from `dist`. Each has its own `unique symbol`, so these really are different types. Find the import (or `paths` mapping) that reaches `src`, point it at the package entry, and the error goes away. The cast would hide the duplicate. It would also fail outright once a class with a private member is involved: I got TS2741, "Property '#c' is missing".
- **Relied on:** "When two types have the same name but won't assign, read the declarations in the error. If they point to separate source and built copies, fix the import instead of asserting them equal."
- **Verdict:** Clear. This is the most directly testable sentence in the Principle.

**(c) Runtime export pointing at `./src/index.ts`**
- **Answer:** No, the local run is not evidence. I checked: Node 22.23.4 runs the symlinked workspace fine, because the real path is outside `node_modules`. The same package copied into an image's `node_modules` throws `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`.
- **Relied on:** Question 2, "Which implementation will its import load when you run it?", plus "for the build you package and deploy, rebuild the dependencies and run what you're shipping."
- **Verdict:** Needed inference. The Principle tells you to distrust the local run, but not why. The reason (type stripping is off under `node_modules`, and symlinks hide that) is outside knowledge. A reader without it might "run what you're shipping" by running the same linked workspace and get a false pass. "What you're shipping" should mean "the artifact laid out the way it will be installed".
- **Follow-up (source types in dev):** Yes, development checks may read source types, as long as the release builds and tests JavaScript.
- **Relied on:** "Development can check source directly, but for the build you package and deploy, rebuild..."
- **Verdict:** Clear on whether it's allowed. Not covered: how to do it (a custom export condition, `paths`, or references). Fine for a Principle.

**(d) CI runs `tsc -p apps/api` with a stale `dist`**
- **Answer:** CI is green. I reproduced it: exit 0. With a reference, `tsc -p` checks the API against the referenced project's output `.d.ts`, which is the old `format(cents)`. It does not rebuild money. CI should run `tsc -b apps/api`, which rebuilds money first and then reports TS2554, "Expected 2 arguments, but got 1" (I reproduced that too).
- **Follow-up (no reference):** `tsc -b apps/api` alone is not enough. I tested it: exit 0 against the stale `dist`. Without a reference, `-b` doesn't know money exists, and `@shop/money` still resolves through the exports map to the old `dist/index.d.ts`. Fix it by adding the reference, or by building money (or the whole solution) first.
- **Relied on:** Question 3, "What rebuilds that implementation when the source changes?", plus "A build only follows the dependencies it has been told about." and "A green check against an old declaration doesn't tell you whether today's package will accept the call."
- **Verdict:** The follow-up is clear: "told about" is exactly the rule. The first part needed inference. Nothing in the Principle says `-p` reads a reference's outputs without rebuilding them. A reader could fairly think a reference *is* "telling the build about it". The difference between `-p` and `-b` is the trap, and the Principle doesn't name it.

## Questions

**1. Is there a single explicit, testable rule?**

Yes. It is an instrument (three questions) followed by rules, not one rule. The instrument: "Which declarations is this caller being checked against? Which implementation will its import load when you run it? What rebuilds that implementation when the source changes?" The sharpest testable rule is the Cents one: "If they point to separate source and built copies, fix the import instead of asserting them equal." The three questions do work as a checklist: each of (a) to (d) maps cleanly onto one or more of them.

Terms that are undefined or loose:
- **"told about":** told how? References? Package dependencies? Build order? As (d) shows, a reference tells `-b` but not `-p`.
- **"public exports":** fine for this audience.
- **"Development can check source directly":** ambiguous. Does that mean via a dev export condition, via `paths`, or via a relative import? The last one is forbidden two sentences earlier, so a reader could see a contradiction with (a).
- **"what you're shipping":** see (c). Read literally, it allows running the linked workspace.

**2. Hardest and weakest sentences**

- **Hardest:** "Development can check source directly, but for the build you package and deploy, rebuild the dependencies and run what you're shipping." It packs two contexts and two commands into one sentence, and it sits uneasily next to "instead of reaching into the source directory".
- **Weakest:** "A build only follows the dependencies it has been told about." It is true and it decides the (d) follow-up. But it is abstract and passive, and it doesn't say which tool or flag does the following, so it can't settle the main (d) question by itself.

**3. Would I read the chapter?**

Yes. The three questions are a good hook: each one promises a story beat (wrong declarations, wrong runtime file, stale build). The "Cents is not assignable to Cents" setup in (b) is something every monorepo developer has hit, and I'd read on to see it explained.

- **Enjoyed:** The closing line, "I want the failure on this laptop, not in the image someone wakes me up to fix." It's the only line with a person in it, and it gives Gilad a voice.
- **Bored:** The second paragraph reads like a policy list: five imperatives in a row, all in the same register. The first paragraph's "A green check against an old declaration doesn't tell you whether today's package will accept the call" is careful but bloodless. A concrete noun, like "yesterday's dist", would make it land.

**Suggested fixes:**
- Name the `-p` vs `-b` trap in a few words.
- Say "run the artifact as it will be installed" instead of "run what you're shipping".
- Show how "Development can check source directly" is done without a relative import into src, so it doesn't read as contradicting the rule two sentences earlier.
