# Bonus 1 — Prompting for TypeScript (working title)

Status: **PROPOSAL, awaiting Codex's challenge**, 2026-11-01.
Branch: `codex/bonus-1-prompting-for-typescript`, based on `origin/main` `27e4630` (Ch27's merge, PR #29).
File: `book/05-bonus-ai-and-typescript/01-prompting-for-typescript.md`. It opens the bonus act.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if competent owners still disagree once the
  conditions are on the page. Otherwise it ends in a Verdict. The AI subject is a reason to *check*
  whether it's opinionated, not a licence to shrug.
- **The reader should leave able to hand an assistant (or a colleague) TypeScript work in a form
  the compiler and tests can hold it to.** They should know:
  - that a request in prose is a wish, and the types, flags and tests are the requirement. The
    compiler can't read the prompt, the explanation, or a comment that says "validates the
    payload";
  - how to make fewer plausible wrong answers compile: signatures, project flags and the
    environment's own declarations, all decided *before* asking;
  - that "make it compile" has cheap answers (`as`, `!`, `any`, `@ts-expect-error`), so a candidate
    that compiles only through an escape hatch hasn't passed the check, it has skipped it;
  - what types can't say (meaning, units, which input is wrong), and where tests take over.
- **This is the bonus act.** It may apply earlier chapters' tools in a new setting. It must not
  re-teach them. The new thing is the *method*: judge generated code by what the checks admit, and
  shape the checks before you ask.

## The bonus act's scope (so the three chapters don't overlap)

- **Bonus 1, prompting (this plan):** the spec you hand over. It covers types, flags and tests
  written before generation, and judging candidates by what compiles and passes.
- **Bonus 2, type-safe agent patterns:** where a model's output enters a running program (tool
  calls, structured output). That's runtime data, so it's Ch16's boundary applied to a producer
  that you also *describe* types to. It's not covered here.
- **Bonus 3, reviewing AI code:** reading a finished diff. It covers what review catches that the
  checks didn't, and tests that can't fail (Ch26) at volume. Bonus 1 must leave Bonus 3 its subject:
  here the checks do the judging, and the human writes them first.

## No claims about real models or products

- **The assistant is the fictional shop's tool, unnamed.** Every candidate on the page is a fixed
  artifact that the page labels as what it returned in this shop. The page makes **no claim about how
  any real model behaves, how often, or which prompts work better.** It has no product names,
  no model names and no prompt-engineering folklore.
- **The candidates must be plausible code that anyone might write.** The lesson must hold whether a
  person or an assistant wrote them. If a scene only works because "AIs do X", cut it.
- **The prompt text itself may appear,** short, as the team wrote it. Its only role is to contrast
  what the prose said with what the checks enforced.

## What earlier chapters already settle (do not repeat)

- **Ch1 (any vs unknown), Ch6 (generics basics), Ch26 l.270:** `JSON.parse` returns `any`, so
  `return JSON.parse(raw)` satisfies any return type. **This is taught three times.** Bonus 1 may use
  the consequence in one line, never the lesson again. What's new is changing the *environment* so
  the shortcut fails to compile (mechanism 2).
- **Ch2 (assertions):** `as` and `!` as promises. Here they appear only as the escape hatches a
  "make it compile" fix reaches for, plus the gate that counts them. One callback at most.
- **Ch4/Ch5 (exhaustiveness), Ch15 (brands), Ch16 (parsing at the boundary):** available tools,
  each one line if used. Don't re-argue them.
- **Ch26:** tests that can fail. If the acceptance tests appear, they must have been seen failing;
  one line, no rerun of Ch26's lesson.
- **Ch27:** measurement. Counting how many candidates compile is a count, not a benchmark. Don't
  echo Ch27's measurement scenes.
- **The prologue** says the book leaves `noUncheckedIndexedAccess` off. A team in a chapter may turn
  it on for its own reasons. If so, the page says that this repository differs from the book's
  profile, and the check compiles that repository with the flag.

## Verified mechanisms (TS 7.0.2)

Probes are in my session scratchpad (untracked). The flags are `--strict --exactOptionalPropertyTypes
--noEmit --types "" --lib es2022`. Codex reproduces them in `.probe/`, untracked, after `npm ci` in
the new worktree.
1. **On the book profile, the shortcuts compile.** With `type Refund = { id: string; cents: number }`,
   both of these exit 0:
   - `function parseRefund(raw: string): Refund { return JSON.parse(raw); }`
   - `function firstLineCents(lines: { cents: number }[]): number { return lines[0].cents; }`
2. **You can make the environment refuse them.**
   - **A project declaration:**

     ```typescript
     // reset.d.ts
     interface JSON { parse(text: string, reviver?: (this: any, key: string, value: any) => any): unknown; }
     ```

     It merges into the global `JSON` interface. With it, `return JSON.parse(raw)` gives
     **TS2322: Type 'unknown' is not assignable to type 'Refund'**.
   - **`--noUncheckedIndexedAccess`** makes `lines[0].cents` give **TS2532: Object is possibly
     'undefined'**.
   - The shortcut now fails at the line that took it, before anybody reads the code.
   - Codex must confirm *why* the merged overload wins resolution on 7.0.2, from the handbook's
     declaration-merging rules (later overload sets first), and cite it. Codex must also check
     whether any library in the repository's own types depends on `JSON.parse` returning `any`.
3. **The escape hatches still compile, which is the point of the Turn.** `JSON.parse(raw) as Refund`
   and `lines[0]!.cents` compile under both settings. (Verified: exit 0 with the
   declaration merge and `--noUncheckedIndexedAccess`.) A gate that counts escape hatches in the generated files is a ripgrep pattern or a short
   script. The book's checks already need ripgrep. Codex decides whether the page shows a script or
   a configured linter, and proves whichever it shows.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise and the no-claims rule.

**The hook: the explanation said "validates".**
- **Dima** (he, the pragmatist who uses the assistant daily) asked it in prose for a refund-webhook
  parser. Its code compiles, the tests it wrote pass, and its explanation says it "validates the
  payload".
- **Idan** (she, parse-don't-validate) feeds it one malformed payload. It returns a `Refund` whose
  `cents` is a string.
- **The scene:** the compiler accepted it because `JSON.parse` handed it `any`. Nobody on the page
  re-teaches that. Idan: "It validated the vibe."

**The method: count what compiles.**
- **Gil** is optional; Chen or Dima could do this. The team writes, or keeps from the assistant's
  earlier attempts, five plausible candidates for the same function:
  - a bare `JSON.parse`;
  - `as Refund`;
  - field-by-field with `Number(d.cents)`;
  - a silent default currency;
  - an honest parser returning a result.
- **Under the prose-level signature, five of five compile.** Then the team tightens what they'll
  hand over *next time*:
  - an `unknown`-returning `JSON.parse` (mechanism 2);
  - a result-returning signature;
  - `noUncheckedIndexedAccess`, if a candidate indexes;
  - a few rejection tests, seen failing.
- **Now fewer candidates compile, and the tests catch the rest.** The count is computed by the check.

**The Turn candidate: "make it compile".**
- The team gives the assistant the tightened files and asks it to make the failing candidate
  compile. It returns `JSON.parse(raw) as Refund`, which compiles under every setting.
- **The compiler is satisfied, and the check was skipped.** So the gate counts escape hatches in
  generated code: a candidate that needs one has failed, whatever `tsc` says.
- **The honest fix needs one cast-free parse.** Is that one `unknown` narrowing per field, or a
  schema library? There's no library claim without a primary source; prefer hand-written narrowing,
  which Ch16 already shows.

**The argument: how much do you write before you ask?**
- **Dima:** "If I write the types, the flags and the tests, I've written half the function. The
  assistant is supposed to save that time."
- **Idan / Noam-style:** the types *are* the part you can't delegate, because they're the decision.
- **Chen** pokes both. Who keeps the escape-hatch gate honest when the assistant learns to write
  `satisfies` or a helper that hides the cast?
- **The conditions that might decide it:**
  - whether the function's input crosses a trust boundary;
  - how many callers depend on the type;
  - whether a wrong answer would compile.

  I expect a local Verdict. Before asking, write the signature and the rejection cases. Make the
  environment refuse the shortcuts you can name. Treat a candidate as passing only when it compiles
  without escape hatches and its tests have been seen failing. But this may be the bonus act's
  honest open question: how much spec is worth writing first for low-risk code. Codex decides, with
  evidence.

**What I don't know, and Codex should attack first:**
- **Does this teach something new,** or is it Ch1 + Ch2 + Ch16 in an AI costume? My claim is that
  the new learning is the candidate-filter method, the environment reset and the escape-hatch gate.
  Attack it.
- **Is the "count what compiles" scene fun,** or a spreadsheet? Five candidates may be too many on
  the page. Show three, and count five in the check?
- **The no-claims rule:** can the chapter be honest and still feel about AI? If every scene would
  work with a junior engineer instead, is that a strength (the lesson is general) or a failure (the
  bonus act promised AI)?
- **The `JSON` declaration merge:** is it robust on 7.0.2? Is it something a team should do, given
  library declarations and other `any` sources like `Response.json()`? Is it better as a lint rule
  the page can't run? Which one does the check prove?
- **Heading and numbering:** "Bonus 1" or "Chapter 28"? Check what the print design study and
  `how-to-read` imply, and propose.

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Prof. Eli Typeworth (he).** "Let us return to first principles" fits "what does
this type claim?", and he hasn't appeared since Ch23. Sahar is an alternative, but he set two
recent Principles.

**Its direction, not its wording:**
- A request in prose can't be checked. Before you ask for code, write down what the checks will hold
  it to: the signature, the inputs it must reject, and the project settings that make the
  shortcuts you know about fail to compile.
- Judge what comes back by what compiles and passes, not by its explanation.
- A candidate that compiles only through `as`, `!`, `any` or a suppression hasn't passed the type
  check. It has stepped around it.
- Types can't say what a number means or which input is wrong. Tests that you've seen fail carry
  that.
- **Give a test, not a mood.**

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** An assistant's PR description says "validates input and handles all edge cases". CI is
  green. The function's return type is the domain type and its body starts with `JSON.parse`. What
  do you check before approving?
- **(b)** A teammate asks for a function to compute an order's discount. The team has no tests and a
  signature `(order: Order) => number`. What do they write before asking, and what can't the types
  say?
- **(c)** Asked to fix a compile error, the assistant changes `user.email` to `user!.email`. CI is
  green. Approve?
- **(d)** A team turns on a stricter flag for assistant-written code only. Forty existing files now
  fail. What do they do, and is "only for generated files" a sound boundary?

## Cast

- **Prof. Eli Typeworth** (he): the Principle, and "what does the signature claim?"
- **Dima Bridge** (he): uses the assistant; argues the time cost of writing specs first. He's
  competent and fair, not a strawman.
- **Idan Greenfield** (she): the malformed payload, and the environment reset.
- **Chen Override** (he): pokes the gate.
- **Optional:** Dafna Functor (she) or Gil Benchmark (he, who counted things in Ch27; prefer
  someone rested).

**Rested:** Daniel, Noam, Oded and Linoy (Ch27), and Sahar, Eden and Guy (Ch26). Eli, Dima, Idan,
Chen and Dafna haven't appeared since Act III or Ch25. Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7. Fun first. The scenes readers should retell:
  - "It validated the vibe";
  - five candidates, all green;
  - "make it compile" answered with `as`.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- **No AI hype and no AI doom.** The assistant is a tool that returns plausible code; the team is
  competent.
- One running repository, small counts and every fence checked. Label each file in its fence.
- Length: 2,300–3,000 words.

## Validation plan

`checks/bonus1.cjs` (or whatever naming Codex proposes, consistent with `run.cjs`) compiles every
fence on the book profile, plus the chapter's own stricter settings where the page uses them, as one
evolving repository in the page's sequence of states.

Compiler cases:
- every diagnostic quoted verbatim (TS2322 and TS2532 at least);
- each candidate under each setting, with the count the page prints computed by the check;
- the escape-hatch gate's result on each candidate;
- the declaration merge's effect, plus a control without it.

Runtime groups:
- each candidate on the malformed and valid payloads, with the outputs the page prints;
- the acceptance tests seen failing on the bad candidates and passing on the honest one.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [ ] Codex challenges this plan: new learning versus an AI costume, the no-claims rule, the
  declaration merge, the Turn, the ending, and the heading. Disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [ ] Final draft's checks durable, and the full suite green on the frozen manuscript.
- [ ] Clean `npm ci` and full suite green at final review.
- [ ] Both of us read the final text start to finish.
- [ ] Ready for the author's review.
