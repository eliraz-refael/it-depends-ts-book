# Bonus 3 — Reviewing AI Code (working title)

Status: **PLAN SETTLED**, 2026-11-02. The settlement at the end governs where it differs from the original proposal.
Branch: `codex/bonus-3-reviewing-ai-code`, based on `origin/main` `8bdb687` (Bonus 2's merge,
PR #31).
File: `book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md`.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if competent owners still disagree once the
  conditions are on the page. Otherwise it ends in a Verdict.
- **The reader should leave able to review a finished TypeScript diff they didn't write** and know
  what it changed in the contract other code is checked against. They should know:
  - **the new idea:** the source diff isn't the contract diff. Through inference, a diff can change
    an exported type without touching a single annotation. The emitted declarations show the change;
    the diff doesn't;
  - that an edit to a caller "to fix a type error" is evidence the contract changed. The reviewer
    finds the cause and decides on it, rather than approving the caller's repair on its own;
  - that the summary attached to a generated diff is a claim, checked like any author's, and that
    some of its claims can be checked mechanically;
  - how to make contract changes appear in the source diff (explicit export types, enforced by
    `isolatedDeclarations`), and what that costs.
- **This is the bonus act's last chapter.** It applies earlier tools in a new setting and must not
  re-teach them.

## Scope against the other bonus chapters

- **Bonus 1 (merged):** the spec before generation; `any`, `as` and `!` don't establish a check;
  checks enforce only what's expressed in them. Bonus 3 must not re-list Bonus 1's escape hatches.
  Its caller repair is deliberately cast-free, `any`-free and `!`-free.
- **Bonus 2 (merged):** a model's output entering a running program. Not this chapter's subject.
- **Bonus 3 (this plan):** reading a finished diff, where the compiler is green and the change to the
  contract is invisible in the lines.

## No claims about real models or products

As in Bonuses 1 and 2:
- **The assistant is unnamed,** with no product, model or vendor names. No claims about how often
  generated code does anything, how big generated diffs are, or what a model "tends to" do.
- **Every generated artifact on the page is fixed and labelled:** the diff, its summary and any
  reply. The lesson must hold for a diff from a colleague on their last day.
- **What we may state:** facts about our repository and TypeScript 7.0.2's behaviour, and the
  [TypeScript handbook/release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
  for `isolatedDeclarations`.

## What earlier chapters already settle (don't repeat)

- **Ch3 (interface vs type), l.289 (Dafna):** an explicit return type makes every branch check, and
  she wants the error when a state is added. Callback at most.
- **Ch5 (narrowing):** `assertNever(value: never)` and exhaustiveness. Assume it; don't teach it.
- **Ch6 (generics basics), l.228 (Eden):** *"I also write explicit return types on exported functions when
  they express an API we intend to keep. Otherwise an implementation change can alter the
  declaration without anyone reviewing that as an API change."* **This is the chapter's warning,
  already stated.** Bonus 3 is the scene where it happens and the review that catches it. It needs
  a one-line callback, and the page must add something Ch6 didn't: how a reviewer *sees* it, and
  what a caller's repair tells them. Eden said it, so he may get to see it happen.
- **Ch2 / Ch17 / Ch22 (`satisfies`, `as const`):** use them, with no explanation.
- **Ch16 (runtime validation), l.50 (Eden):** switches with a `default` keep compiling when a member
  is added. Our caller repair *adds* a `default`. Callback, don't re-argue.
- **Ch25 (monorepo):** which declarations a consumer is checked against. If the shop's types are
  published to another app, that's one line, not Ch25 again.
- **Ch26 (testing typed code):** break the promise and watch a check fail. The reviewer may use this
  move once (plant a fourth label), with no re-teaching.
- **Ch27 (performance vs safety):** "say what newly compiles" for a *deliberate* signature change.
  Here nobody decided to change it; that's the difference. One line at most.

## Verified mechanisms (TS 7.0.2)

Probes are in my session scratchpad (untracked). The flags are `--strict --exactOptionalPropertyTypes`,
`module`/`moduleResolution` `nodenext`, `.ts` imports, `declaration` + `emitDeclarationOnly` with
`rootDir`. Codex reproduces them in `.probe/`, untracked, after `npm ci` in the new worktree.

1. **Before.** `orderStatus(order)` is an if-chain returning `"paid"`, `"partial"` or `"refunded"`,
   with no return annotation. Its emitted declaration:
   `export declare function orderStatus(order: Order): "paid" | "partial" | "refunded";`.
   `badge.ts` switches over it with `default: return assertNever(status);`.
2. **The generated refactor** moves the labels into a table
   (`const labels = { none: "paid", some: "partial", all: "refunded" }`) behind a private
   `refundLevel(order)`, and returns `labels[refundLevel(order)]`. No exported annotation changes.
   - The declaration becomes `export declare function orderStatus(order: Order): string;`. A
     two-file `diff` of `types/status.d.ts` shows exactly that one line.
   - `badge.ts`, untouched by the refactor, fails: **TS2345** "Argument of type 'string' is not
     assignable to parameter of type 'never'." at `(13,33)`.
3. **The caller repair, cast-free:** `default: return status;`. The program compiles (exit 0). No
   `any`, `as` or `!`. Behaviour is unchanged for the three real values.
4. **What the repair removed.** With the widened type, a label typo in the table
   (`all: "refund"`) compiles, and `badge` returns the raw `"refund"` for a fully refunded order.
   The original program would have rejected it in `badge.ts` (verify the exact diagnostic, probably
   TS2678 on `case "refunded"` and the TS2345). Codex decides whether the typo is in the generated
   diff (a present bug) or planted by the reviewer (a Ch26-style probe).
5. **The repair at the cause:**
   `export type OrderStatus = "paid" | "partial" | "refunded"`, `orderStatus(order: Order):
   OrderStatus`, and the table `satisfies Record<RefundLevel, OrderStatus>`. The typo then fails at
   the table: **TS2820** "Type '"refund"' is not assignable to type 'OrderStatus'. Did you mean
   '"refunded"'?" `(9,3)`, plus **TS2322** at the return `(19,3)`. `badge.ts` goes back to
   `assertNever`.
6. **`isolatedDeclarations` makes the contract appear in the source.**
   - On the *original* code: **TS9007** "Function must have an explicit return type annotation with
     --isolatedDeclarations." `(3,17)`. So the original was already relying on inference.
   - On the refactor: **TS9013** "Expression type can't be inferred with --isolatedDeclarations."
     `(16,10)`.
   - On the repaired code: no isolated-declarations errors.

   With it on, a change to an exported type must be written into the source, so it appears in the
   diff. It costs annotations on every export, and it doesn't review the change for you.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise and the no-claims rule.

**Hook: "No public API changes."**
- The assistant's PR: "Refactor `orderStatus` into a lookup table. No public API changes. Also fixed
  a type error in `badge.ts`." Green CI. The diff is tidy and long enough that nobody wants to read
  it twice.
- **Oded** (he) wants it merged before standup: it's green, it's a refactor, and the table *is*
  nicer. He has a real point. The refactor is good.
- **Noam** (he, 11:47 PM, forty-seven comments) stops at the last sentence: "A refactor with no API
  changes had to fix a type error in a file it didn't touch?" That's the retellable line.

**The argument: what did the caller's fix fix?**
- The `badge.ts` hunk is one line: `assertNever(status)` becomes `return status`. It looks like
  removing an unreachable branch, and it's exactly as green as before.
- Noam emits the declarations on both commits and diffs them: one line, `"paid" | "partial" |
  "refunded"` → `string`. "Nobody wrote that line. It's in the PR anyway."
- **Eden** (he, the mobile app from 2019): who else reads `orderStatus`'s declaration? If the
  shop's types reach another consumer, it inherits `string` too, and its own exhaustive switch
  breaks or gets the same repair. One line, not a Ch25 subplot.
- **Oded's counter:** the three values are unchanged, every test passes, and nothing a customer sees
  is different. Approving a working refactor is not negligence. Noam's answer has to cost something,
  and it does: the next label.

**The Turn (candidate): the check the diff removed.**
- Either the generated table already contains `all: "refund"` (a present bug the tests miss,
  if Codex finds an honest reason they miss it), or Noam plants it on a scratch branch. Under the
  original code, `badge.ts` rejects it. Under the PR, it compiles and the badge reads "refund".
- **The point:** the caller's error was the compiler reporting the contract change. The repair
  answered the report and kept the change. Fix the cause: name the type, annotate the export, and
  make the table `satisfies` it. Then the typo fails where it's written, with "Did you mean
  '"refunded"'?", and `badge.ts` gets its `assertNever` back.
- **What we can't claim:** that the assistant "hid" anything or "tried" to make errors go away. The
  summary says what the diff did, accurately ("fixed a type error"). It omits why there was one.
  That's the reviewer's question for any author.

**The ending: how do contract changes reach the diff?**
- **Linoy** (she) turns on `isolatedDeclarations` for the shared module: TS9007 on code that
  *passed review for months*, because it was always inferred. Every export now writes its type down,
  so a changed exported type is a changed line.
- **The real disagreement:** annotation noise on every export, versus a committed declaration
  report (the emitted `.d.ts`) that CI diffs. Both put the contract change in the PR. Which does
  the shop use, and where?

**Verdict (my expectation; Codex decides, with evidence):** local.
- Explicit return types on what the shared module exports, enforced by `isolatedDeclarations` on
  that module, not the whole repo. Inference stays inside.
- A caller repair in a diff is reviewed together with the change that required it.
- The summary's claims that can be checked mechanically (here, "no public API changes") get checked.

**Could be open:** whether the whole codebase should run `isolatedDeclarations`. Competent teams
disagree on annotation cost versus visible contracts. My expectation is that the chapter's own
conditions decide it locally (the shared module only), with one Additional Take for the repo-wide
question.

**What I don't know, and Codex should attack first:**
- **Is this new learning, or Ch6 l.228 dramatised?** My claim: Ch6 stated the risk. The new things
  are seeing it in review (the declaration diff), reading a caller's repair as evidence, and making
  the change appear in the source. Attack this.
- **Where's the AI?** If every scene works for a human author's diff, does the chapter still feel
  like a chapter about reviewing *generated* code? The summary-as-claim beat and the volume are my
  candidates. Neither may make a claim about real models. Is that enough, or does it need a better
  agent-shaped beat (for instance asking the assistant to address Noam's comment, with a fixed reply)?
- **The hook's honesty:** would a competent reviewer really skim past `assertNever` → `return
  status`? Would the tests really miss the typo? Find a better silent contract change if there is
  one: a dropped `as const` that a derived `typeof labels[number]` type depends on, an inferred
  object type widening a field, or a parameter narrowing.
- **The `isolatedDeclarations` beat:** is TS9007 on the original code a good joke (the old code
  "passed review" by inference too) or a distraction?
- **The cast:** Noam as reviewer is obvious. Is Oded's counter strong enough to make it a debate?

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Sahar Firstclass (he).** His question is "what would happen if we removed it?",
and the diff removed a check. He set Ch26's Principle, which is the nearest neighbour, so Codex may
prefer **Daniel Compiler (he)** (Ch24, Ch27) or **Gilad Stacktrace (he)** (Ch25, and Bonus 2's ticket).
Eli (Bonus 1) and Liron (Bonus 2) are rested.

**Its direction, not its wording:**
- A diff changes the contract wherever inference reaches, so reviewing the source lines doesn't
  review the exported types. Compare what the compiler publishes before and after, or require
  exported types to be written down so their changes appear in the diff.
- When a diff edits a caller to make it compile, the edit is evidence that the contract changed.
  Find the change that caused it and decide on that. Approving the caller's repair alone keeps the
  change and removes the check that reported it.
- A diff's summary is its author's claim. Check the parts you can check.
- No escape-hatch list (Bonus 1), and no "AI tends to".

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** A PR says "internal refactor" and changes no exported annotation, but it drops `as const`
  from an exported array that `type Reason = (typeof reasons)[number]` is derived from. Did the
  contract change? How would you find out without reading every caller?
- **(b)** A diff refactors `parseRefund` and, in another file, changes `default:
  assertNever(kind)` to `default: return "other"` "to fix a type error". Everything is green. What
  do you ask, and what do you approve?
- **(c)** The module runs `isolatedDeclarations`. A diff changes an exported function's return type.
  Where does it show up, and what does the reviewer still have to decide?
- **(d)** A diff *narrows* an exported function's parameter from `string` to a union, and every
  caller in the repo still compiles. Is the review done?

## Cast

- **Sahar Firstclass** (he): the Principle. Or Daniel or Gilad (above).
- **Noam Kiperman** (he): the reviewer, the declaration diff, "a file it didn't touch".
- **Oded Shipley** (he): green is green, and the refactor is genuinely nicer.
- **Eden Legacy** (he): who else reads the declaration. One beat.
- **Linoy Nightly** (she): `isolatedDeclarations`, and its cost.

Four speaking parts may be enough; Codex decides. **Rested:** Eli, Dima, Idan and Chen (Bonus 1);
Liron, Gilad, Dafna and Guy (Bonus 2). Pronouns verified against the bios: all he except Linoy, she.

## Voice and constraints

- Calibrate on Ch7. Fun first. The scenes readers should retell:
  - "No public API changes";
  - "a type error in a file it didn't touch";
  - the one-line `.d.ts` diff nobody wrote;
  - the badge that says "refund";
  - "Did you mean '"refunded"'?"
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- **No hype and no doom.** The assistant wrote a good refactor with one consequence nobody chose.
  The team is competent, and Oded isn't a strawman.
- One running repository, small counts and every fence checked. Label each file in its fence.
  Show the diff as a diff where it matters.
- Length: 2,300–3,000 words.

## Validation plan

`checks/bonus3.cjs` compiles every fence on the book profile as one evolving repository, in the
page's sequence of states, and runs it with Node 22.

Compiler cases:
- every quoted diagnostic (TS2345, TS2820, TS2322, TS9007, TS9013 at least, and whatever the typo
  gives under the original code), with positions;
- the PR state compiling clean, cast-free;
- the repaired state compiling clean with `isolatedDeclarations`.

Emit cases:
- the emitted `status.d.ts` for each state the page shows, compared by text, and the one-line diff.

Runtime groups:
- every printed output, including the badge for each status in each state and the "refund" badge.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [x] Codex challenges this plan: new learning versus Ch6 l.228 dramatised, where the AI is, the
  hook's honesty, the `isolatedDeclarations` beat, the ending and the cast. Disagreements are
  settled on evidence ([challenge](bonus3/CODEX-PLAN-CHALLENGE.md)).
- [ ] Codex drafts and self-reviews (record, snapshot).
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [ ] Final draft's checks durable, and the full suite green on the frozen manuscript.
- [ ] Clean `npm ci` and full suite green at final review.
- [ ] Both of us read the final text start to finish.
- [ ] Ready for the author's review.

## Settlement after Codex's challenge (2026-11-02)

[Codex's challenge](bonus3/CODEX-PLAN-CHALLENGE.md) reproduced all six mechanisms (43 compiler cases
and 12 runtime groups, with controls) and showed that the plan's ending rests on a false guarantee.
**This settlement governs where it differs from the proposal above.** I independently confirmed the
results that change the design:
- under `isolatedDeclarations`, `export function label() { return "paid"; }` →
  `return 42;` compiles both times, and the declaration changes from `label(): string` to
  `label(): number`. The flag doesn't require an annotation on every export;
- annotating the refactor's `orderStatus(order: Order): string` passes the flag and emits the
  widened return;
- `as const` on the table alone restores the original badge and emits a `status.d.ts`
  byte-identical to the original (and still gets TS9013 under the flag).

**My errors, corrected by Codex:**
- **`isolatedDeclarations` doesn't make every public type change appear in the source,** and it
  doesn't choose the contract. It's a declaration-emission constraint, not API stability. The
  plan's either/or between the flag and a declaration report was a false choice.
- **"A file it didn't touch" is wrong:** the patch plainly touches `badge.ts`. And the caller
  already had a `default`; the patch replaces the expression in it.
- **A shipped `"refund"` typo needs an implausibly missing test.** A full-refund test catches it.
- **"The source diff isn't the contract diff" was too absolute.** The source diff contains the
  cause; it doesn't spell out the inferred signature. A caller repair is a reason to investigate,
  not proof of an exported-type change (configuration or an existing caller bug can also cause
  errors).
- **The named-alias repair isn't the only one,** and it doesn't give a byte-identical declaration.
  `as const` or `satisfies` alone undo the widening.
- **Declaration equality doesn't establish behaviour:** swapping two table values emits the same
  declaration and mislabels orders.
- **The public contract includes referenced types.** Comparing one entry file's declaration isn't
  comparing the contract in general (here it is, since `Order` is unchanged).
- "Long enough that nobody wants to read it twice" is a volume excuse that weakens the reviewer.

**Settled:**
1. **The subject is causal review of a finished patch:** the provider change and the caller repair
   are one change. The reviewer reconstructs the state the submitted commit no longer contains
   (the new provider with the old caller), compares the public declarations before and after under
   the same settings, and decides whether the changed contract is intended. **This is Eden's Ch6
   warning applied,** and the page admits it in one line, which Eden can say.
2. **Working title: "Bonus 3: What Did the Fix Fix?"** Heading `# Bonus 3: <title>`, with
   `checks/bonus3.cjs`. ("No Public API Changes" is the alternative.)
3. **The hook is honest:** all three current statuses and badges genuinely pass before and after.
   - **The fixed artifacts:** the assistant's summary ("Refactor `orderStatus` into a lookup table.
     No public API changes. Also fixed a type error in `badge.ts`."), the small two-file patch, and
     one short fixed reply to Noam's question. The reply says the fallback accepts strings outside
     the three cases and that no exported annotation changed. Both are true, and neither settles the
     API claim. Each is labelled as this assistant's reply in this example.
   - **Noam sees the `badge.ts` hunk immediately:** "Why did a lookup-table refactor need to change
     the badge's fallback?" He doesn't miss the line, and Oded doesn't either.
   - **Oded defends its consequences** with the same three tests passing on both commits. He's right
     about his evidence.
   - No volume excuse and no "nobody wrote that line" overreach. "Nobody wrote that line" may refer
     to the inferred declaration only.
4. **The investigation:** restore the old `badge.ts` against the new provider (TS2345). Then emit
   declarations from both commits with the same settings: the one-line return change contradicts the
   summary. **Eden** brings one unchanged consumer annotated with the old union (green / TS2322 /
   green), a caller the patch can't silently edit. One beat, not a Ch25 tour.
5. **The Turn is a labelled scratch experiment:** Noam changes `"refunded"` to `"refund"` in the
   table. Under the original code, `badge.ts` rejects it (TS2678, TS2345). Under the patch, it
   compiles and the badge says `refund`. Undo it. **This is the check the fix removed,** and it moves
   the argument from "what happens today?" to "what did this repair stop checking?" The typo never
   ships.
6. **The repair:**
   - **Oded offers the small fix,** `as const`, and it works: the old caller compiles and the
     declaration is byte-identical. He wins that point.
   - The team still chooses an explicit return type and a table checked with `satisfies`, **for a
     stated reason:** this is a shared API they intend to keep, so the promise is written down and
     future implementations are checked against it, and the typo then fails at the table, with
     "Did you mean '"refunded"'?". Restore `assertNever`.
   - If `OrderStatus` is exported, the declaration's text changes, though it accepts the same
     statuses. Review that addition or keep the alias private; don't claim byte identity unless the
     check shows it.
7. **`isolatedDeclarations` gets one short, accurate beat at most,** owned by Daniel: TS9007 on the
   original (an adoption cost, not a defect), then `: string` satisfying it on the patch. "Now it's
   explicitly the wrong contract." It requires an annotation here; it doesn't choose the right one.
   Codex may cut the beat if it doesn't earn the space. No project-wide flag policy, and no claim
   that it applies to a single file when source imports join the program.
8. **The Verdict is local.** Accept the table with the agreed contract, reject the caller fallback,
   and require a declaration comparison (emitted with the same settings) for changes to this shared
   API, alongside the runtime tests, because each checks something the other doesn't. The summary
   has to describe the actual change. End on the completed review decision. The refactor promised
   the old API, so preserving it isn't a matter of taste.
9. **Principle: Daniel Compiler (he).** Open on the testable review action: compare the public types
   before and after under the same compiler and project settings, including the types they refer to;
   when the patch repairs a caller, find what made that repair necessary. The owner decides whether a
   changed contract is intended. A green compile checks the revised program, not compatibility with
   the callers the patch no longer contains. Then the evidence: a summary is a claim, a declaration
   comparison establishes a type change, and runtime tests establish the behaviour they assert. No
   "never trust AI", no "review carefully", no escape-hatch list, and no flag exceptions list.
10. **Cast: Daniel (Principle, the flag beat), Noam (the question, the scratch experiment), Oded
    (green tests, `as const`), Eden (the unchanged consumer and the Ch6 callback).** Linoy is cut.
    Don't replay Noam's bio (forty-seven comments, 11:47 PM). Pronouns verified: all he.
11. **Reader cases are Codex's four (§6):**
    - the derived export with `as const` dropped;
    - the provider and caller repaired together;
    - the green flag (the trivial export, or `: string`);
    - the narrowed parameter with every local caller passing, plus unchanged declarations not
      proving unchanged behaviour.
12. **Repetition boundaries:** Codex's §5 list is adopted. The fresh composition is reviewing the
    provider and its caller fix as one causal change.
13. **Checks: Codex's §7 requirements,** in particular:
    - apply the shown diff hunks to their preceding state;
    - use the same fixed expected outputs for the original and the patch;
    - emit from clean states (no stale declaration);
    - reset explicitly after the experiment;
    - keep the green `: string` control, the trivial-export counterexample and the
      same-declaration-wrong-behaviour control in validation, even if unprinted.

**Fun guardrails:**
- **The scenes readers should retell:**
  - "No public API changes";
  - "Why did a lookup-table refactor need to change the badge's fallback?";
  - the one-line declaration diff;
  - the badge that says `refund`;
  - "Did you mean '"refunded"'?";
  - "explicitly the wrong contract", if the beat stays.
- **Oded isn't a strawman.** He wins the runtime claim and the smaller-repair counter.
- Aim for ten fences or fewer. No hype and no doom. Length 2,300–3,000 words.

**Not adopted:** nothing material.
