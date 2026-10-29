# Chapter 27 — Performance vs Safety (working title)

Status: **PLAN SETTLED**, 2026-10-29. The settlement at the end governs where it differs from the original proposal.
Branch: `codex/chapter-27-performance-vs-safety`, based on `origin/main` `e1c9f70` (Ch26's merge, PR #28).
File: `book/04-the-real-world/04-performance-vs-safety.md`. It is the last chapter of Act IV.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if competent owners still disagree once the
  conditions are on the page. Otherwise it ends in a Verdict. Codex's challenge proposes which, with
  evidence. We settle it before drafting.
- **The reader should leave able to answer "is this type making us slow?" with data, and without
  giving away safety they didn't need to.** They should know:
  - that types are erased, so type safety costs check time (CI, the editor), not run time, and how
    to show that for their own code;
  - how to measure the checker: `--extendedDiagnostics`, which of its numbers stay fixed across runs
    and machines, and `--generateTrace` to find the type that costs;
  - that the measurement that matters is a counterfactual: the same files with one suspect part
    removed;
  - that the cost often belongs to *how* a type is written, and a cheaper form can keep the same
    errors, which they must check, not assume;
  - what a PR that really does give up safety for speed has to contain.
- **Act IV is "the real world".** The slow check has history, the type that costs was written for a
  good reason, and somebody's fix is already in review.

## What earlier chapters already settle (do not repeat)

- **Ch3 (interface vs type):** the performance wiki's intersections advice. Linoy: "It predates the
  TypeScript 7 native compiler. I'd try it if a trace pointed here." Ch27 can be the chapter where
  somebody finally runs the trace. One callback at most.
- **Ch4 (enums vs unions):** emitted code and bundle cost. Gil: "which build are we measuring?"
  Don't re-argue enums.
- **Ch7 (conditional types), l.484–495:** "The editor was slow in that file too." / Gil: "Did you
  measure it with the helper removed?" / "Then we have an unreadable error. We haven't measured a
  slowdown." **This is Ch27's setup.** Ch27 is where the book measures one. A callback line is
  welcome if it earns it, but the chapter must stand alone.
- **Ch16 (runtime validation):** what a runtime check costs and where it belongs. "Should we
  validate in the hot path?" gets one line pointing at Ch16's boundary, not an argument.
- **Ch17 (immutability), Additional Takes:** Gil already counted property copies, "not
  milliseconds". Ch27 must not be another runtime-copying count. Its counts are the checker's.
- **Ch26:** no claims about type-test cost there. If a test file appears here, it's only as one of
  the files the check compiles.

## Verified mechanisms (TS 7.0.2, Node 22.23.4)

The probes are in my session scratchpad (untracked). The fixture generator is reproduced below so
Codex can rebuild them in `.probe/`, untracked.
- **Compiler:** `tsc --strict --noEmit --types "" --lib es2022 --extendedDiagnostics <file>`.
- **The fixture:** a typed translation function, `t(key, params)`, over an `as const` messages
  object. There are 40 sections × 50 messages (2,000 keys). Every message is `"Hello {name}, you
  have {count} items in sN"`. There are 2,000 call sites over 200 distinct keys.
  - `Paths<T>` builds dotted keys (`"s3.k12"`).
  - `At<T, P>` walks a dotted key to its message.
  - `Params<S>` parses `{placeholder}` names out of the message string into
    `{ name: string } & { count: string }`.

```typescript
type Paths<T> = T extends string ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];
type At<T, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof T ? At<T[H], R> : never
  : P extends keyof T ? T[P] : never;
type Params<S> = S extends `${string}{${infer P}}${infer R}` ? { [K in P]: string } & Params<R> : {};
type Key = Paths<typeof messages>;

// "generic"
declare function t<K extends Key>(key: K, params: Params<At<typeof messages, K>>): string;
// "union": one rest-tuple per key, the shape you write to make params optional per message
type Args = { [K in Key]: [key: K, params: Params<At<typeof messages, K>>] }[Key];
declare function t(...args: Args): string;
```

1. **Types are erased, and you can show it.**
   - A typed `t<K extends Key>(key: K, params…)` and an untyped `t(key: string, params…)` with
     `as any` in the body emit **byte-identical JavaScript** (`--target es2022 --module esnext`).
   - "Does this type slow the app?" has a checkable answer: diff the emit. Safety in the type system
     costs check time only. Runtime cost comes from code that runs: validators, copies, enums and
     wrappers.
2. **`--extendedDiagnostics` has fixed numbers and moving numbers.**
   - Across runs, `Symbols`, `Types` and `Instantiations` are identical. `Memory allocs` and every
     `… time` line move.
   - **An empty module** (`export {};`) on the same flags is the baseline: Symbols 10,238 / Types
     6,278 / Instantiations 1,998.
   - `--generateTrace <dir>` works in 7.0.2. It writes `trace.json`, `legend.json` and `types_N.json`.
3. **The cost table**, for 2,000 calls over 200 distinct keys. Times are one run on my machine, so
   they illustrate the counts and aren't claims:

   | `t`'s signature                    | Symbols | Types  | Instantiations | Check time |
   |------------------------------------|--------:|-------:|---------------:|-----------:|
   | `key: string`                      | 26,472  | 11,004 | 15,220         | 0.014s     |
   | `key: Key`, params untyped         | 26,472  | 11,003 | 15,220         | 0.020s     |
   | generic `K extends Key` + `Params` | 30,955  | 13,370 | 86,223         | 0.107s     |
   | union of rest tuples (`...args`)   | 172,559 | 27,412 | 114,595        | 1.053s     |

   - **Key checking is almost free.** Typed keys cost the same counts as `string` keys.
   - **The placeholder parsing costs something.**
   - **The union formulation costs about ten times the generic one's check time,** for the same
     placeholder parsing.
   - A generic with a conditional rest (`...params: keyof P extends never ? [] : [P]`, to make
     params optional for placeholder-free messages) costs about the same as the plain generic:
     Symbols 32,393 / Types 15,504 / Instantiations 87,787 / 0.119s.
4. **The cost grows with different things.**
   - **The generic's cost follows *distinct keys used*.** Going from 200 calls to 1,000 calls over
     the same 200 keys left its instantiations unchanged (86,223), with time 0.030s → 0.065s.
   - **The union's cost follows *call sites*.** Each call is related against a 2,000-member union of
     tuples. 200 → 1,000 calls moved its time 0.154s → 0.608s, with instantiations 103,795 → 108,595.
   - **So instantiation count alone can miss where the time goes.** Symbols and Types show the
     union's size. The trace shows the per-call relation work. This is worth one beat, because it's
     the measurement trap.
5. **Same errors, different messages.** On a typo key (`"s0.k9"`) and on a missing placeholder
   (`{ name }` without `count`), both formulations report **TS2345**.
   - The generic names the problem directly: `'"s0.k9"' is not assignable to parameter of type
     '"s0.k0" | …'` and `Property 'count' is missing…`.
   - The union reports against a tuple of the *last* union member (`'[key: "s1.k1", …]'`) for the
     typo, which is misleading.
   - **So the cheaper form is also the clearer one here.** That's a gift for the story, but the page
     must show that the two forms catch the same mistakes before calling them equivalent.
6. **`key: string` really loses safety.** A typo key compiles, and at run time `t` returns whatever
   the lookup gives (`undefined` from the walk, or the raw key, depending on the body). The page
   should print what *its* `t` does with a typo, from the check.

Unverified, for Codex to verify or drop:
- the editor (tsserver/LSP) cost. We can only run `tsc`. Don't make editor-latency claims beyond
  "the same checker runs in the editor".
- whether a realistic app size makes the union's cost noticeable in CI on TypeScript 7. My numbers
  are small in absolute terms. That might be the chapter's honest twist: "TS 7 made this 1 second",
  and the trace still shows the cost. Decide with numbers.
- instantiation counts are version-specific. The check pins 7.0.2, and `checks/README.md`'s upgrade
  procedure must say so.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise above.

**The hook: a PR that trades safety for speed.**
- **Oded's PR** changes `t(key: Key…)` to `t(key: string, params?: Record<string, string>)`. Its
  description says "type check on checkout files is slow, the editor lags on every `t(`". He's
  competent, the complaint is real, and his fix works: the check gets faster.
- **Noam objects.** A typo key now compiles. This is in character, and he's right, but he has no
  numbers.
- **Gil** asks the Ch7 question for real: "What did you measure, and with what removed?" Oded
  measured one `time` before and after, on his laptop, with the whole type removed.

**The discovery: measure one part at a time (mechanisms 2–4).**
- Gil runs `--extendedDiagnostics` with each part removed in turn.
  - Typed keys cost nothing measurable.
  - Placeholder parsing costs something.
  - Most of the cost is the union-of-tuples signature that someone (Linoy, who wrote it to make
    params optional per message) chose for ergonomics.
- **The generic form keeps every error** (mechanism 5, shown, not assumed) at about a tenth of the
  check time. Oded's PR gave up safety for a cost the safety didn't need.
- **Possible joke:** the "faster" version and the safe version compile to the same JavaScript
  (mechanism 1). "We had an hour's argument about a file the app never runs."

**The argument: when the cost is real, what do you give up?**
- Even with the generic form, the placeholder parsing costs. Is compile-time placeholder checking
  worth it?
  - **Oded:** checking keys is enough. Missing params show up in the translated string at run time,
    and a test can scan for them.
  - **Noam:** a missing `{count}` is a customer-facing bug the type catches before review.
  - **Linoy:** code-generate the key and param types from the messages file once. The check reads a
    literal union, and the parsing moves out of every check. The generated file can go stale, which
    is Ch25's lesson: one line, not a rerun.
- **The conditions that should decide it:**
  - the measured cost of each part, as a counterfactual;
  - how often the messages change;
  - whether a cheaper form keeps the same errors;
  - whether the safety you'd drop is replaced by something that runs (a test or a generator) or by
    nothing.

**Candidate Turn (mechanism 4).** Gil's first measurement uses instantiation counts, and they say
the union is only ~1.3× the generic. Somebody would conclude the union is fine. The time and the
trace say ~10×, because the union's cost is per-call relation work, not instantiation. The
measurement you trust can miss where the time goes. Codex decides whether this is the Turn, or
whether the Turn should be something else (for example the emit diff, or a cheaper form that
*loses* an error nobody checked).

**What I don't know, and Codex should attack first:**
- **Scope.** Is a compile-time-only chapter what readers expect from "performance vs safety"? My
  recommendation is compile-time as the core, runtime erasure as one beat, and Ch16 for runtime
  validation cost. Argue it.
- **Is the decision opinionated,** or do the conditions decide it? I expect a local Verdict:
  - the generic form;
  - keys and params stay typed;
  - any PR that drops safety for speed shows a per-part counterfactual and names what replaces the
    dropped check.

  If placeholder checking at scale is honestly contested between competent owners, say so with
  numbers.
- **Is the fixture real enough?** Typed translation keys are common, and the rest-tuple union is a
  real idiom. Is 2,000 keys / 2,000 calls the right size? Should the page show a smaller fixture and
  state the generated size?
- **Timing on the page.** Earlier chapters made no timing claims. This chapter may need some. My
  proposal: the page prints the fixed counts, and the times only as "on Gil's laptop". The check
  asserts the counts exactly and, at most, an ordering of medians over several runs with a large
  margin. Or no time assertion at all. Decide.
- **Does mechanism 4's trap earn the Turn,** or is it a second lesson bolted on?

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Daniel Compiler (he).** He's the compiler internist who "tests compiler
behavior". He last set a Principle in Ch24, three chapters back. Codex may argue for another expert.

**Its direction, not its wording:**
- Types are erased, so type safety costs check time, not run time. Check that by comparing the
  emitted JavaScript.
- When the check is slow, measure before you remove anything. Compare the same files with one
  suspect part removed at a time, using the numbers that don't move between runs, and confirm where
  the time goes with a trace.
- Often the cost is in how a type is written. Before you accept a cheaper form, show that it rejects
  the same mistakes.
- If you still give up a check, say which mistakes now get through and what catches them instead.
- **Give a test, not a mood.** Every condition must be checkable from the Principle alone, with no
  undefined terms.

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** A PR replaces typed route params (`Route<"/users/:id">` → `{ id: string }`) with
  `Record<string, string>`. It says "CI type check 30% faster" from one run before and one after on
  the author's laptop. Approve?
- **(b)** A teammate says the branded `UserId` type slows the API's hot path. What do you check?
- **(c)** `emit<E extends keyof Events>(e: E, p: Events[E])` is proposed to replace a slow
  `emit(...args: { [E in keyof Events]: [E, Events[E]] }[keyof Events])`. What must you compare
  before you merge it?
- **(d)** A type adds 2M instantiations, and no cheaper form keeps its errors. What must the PR that
  removes it contain?

## Cast

- **Daniel Compiler** (he): the Principle, and reading the checker's numbers.
- **Gil Benchmark** (he): measures. This is his chapter. "What does the data say?" must not appear as
  a tagline.
- **Oded Shipley** (he): the PR. Competent; the slowness is real, and his fix works.
- **Noam Kiperman** (he): objects to the typo key. Right about safety, without data.
- **Linoy Nightly** (she): wrote the rest-tuple union for per-message optional params, and runs the
  trace (Ch3's promise).
- **Optional:** Chen Override (he) to poke the measurement, or Dima Bridge (he).

**Rested:** Eden, Sahar and Guy (Ch26); Gilad and Idan. Five or six people. Check every pronoun
against the bios.

## Voice and constraints

- Calibrate on Ch7. Fun first. The scenes readers should retell:
  - the safe and the "fast" versions compiling to the same JavaScript;
  - the part that costs being the ergonomic signature, not the safety;
  - the measurement that missed where the time went.
- Not a Ch17 rerun (runtime copy counts), and not a Ch26 rerun (whether a test can fail).
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- One running repository, small counts and every fence checked. Label each file in its fence. Print
  only the `--extendedDiagnostics` lines that matter.
- The shop is fictional, and the page says so. No claims about any real project's check time.
- Length: 2,300–3,000 words.

## Validation plan

`checks/chapter27.cjs` compiles every TypeScript and JSON fence on the book profile, as one evolving
repository in the page's own sequence of states, as Ch25's and Ch26's do.

Compiler cases:
- every diagnostic quoted verbatim (TS2345 at least);
- error parity between formulations: the same mistake files compiled under each signature, with the
  page's claimed errors;
- every printed `--extendedDiagnostics` count, computed by the check on the generated fixture.
  Pin exact values on 7.0.2, and document the upgrade step;
- the emitted-JavaScript identity, by emitting both versions and comparing bytes;
- the fixture generator itself, if the page shows it.

Runtime groups:
- what `t` returns for a typo key under `key: string`;
- any runtime behaviour the page prints.

Timing: per the settlement. Default is no time assertions.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [x] Codex challenges this plan: scope, whether the decision is opinionated, the fixture's realism,
  timing on the page, and the Turn. Disagreements are settled on evidence ([challenge](ch27/CODEX-PLAN-CHALLENGE.md)).
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [ ] Final draft's checks durable, and the full suite green on the frozen manuscript.
- [ ] Clean `npm ci` and full suite green at final review.
- [ ] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-29)

[Codex's challenge](ch27/CODEX-PLAN-CHALLENGE.md) reproduced every counter in the plan's table and
corrected the plan's central repair. **This settlement governs where it differs from the proposal
above.**

**I verified its two load-bearing claims independently** in my scratchpad, using my own mixed
catalogue and generator (three message shapes: name and count, name only, no placeholders):
- **The contract claim.** With `shop.cart`, `shop.hello` and `shop.ready`:
  - the optional tuple union rejects `t(ch, { name })` (where `ch: "shop.cart" | "shop.hello"`), and
    also `t(cr)` (where `cr: "shop.cart" | "shop.ready"`), a typo and a missing count;
  - the plan's conditional-rest generic **accepts both union-key calls**;
  - the distributed whole tuple rejects all four, and accepts the valid literal calls.
- **The Turn's numbers.** On 40×50 keys and 2,000 calls, with `--checkers 1`, three runs each:

  | Signature            | Instantiations | Check time   |
  |----------------------|---------------:|-------------:|
  | optional tuple union | 119,527        | about 1.50s  |
  | distributed tuple    | 119,689        | about 0.27s  |
  | broken generic       | 88,655         | about 0.10s  |

  The counters were identical across runs. Codex's figures differ slightly because its fixture
  differs. The ordering is the same: the repair has *more* instantiations and checks about five
  times faster.

**Settled:**
1. **Scope:** compile-time checking is the core. Erasure gets one early beat: Oded's faster version
   and the safe one emit identical JavaScript, so "faster" means the check, not the app. Ch16 owns
   runtime validation, and gets one line at most if someone conflates the two. Don't make the
   erasure beat the Turn.
2. **The catalogue is mixed,** with at least one placeholder-free message. Linoy's original
   signature is the *optional* tuple union, which really buys optional arity and correlated tuple
   forwarding. Her type bought something, and the page shows what.
3. **The hook is a compile-time complaint, measured.** Oded's PR makes `t` take `key: string,
   params?: Record<string, string>`. The check really gets faster.
   - **What the PR gives up, from the implemented `t`:** `t("shop.crat", …)` prints `shop.crat`, and
     a missing count prints `Hello A, {count} items`.
   - **No editor-latency claim.** Nobody on the page says the editor lags because of `t`, unless the
     page measures it, and it can't.
4. **Measurement one part at a time.** Gil isolates:
   - key enumeration;
   - dependent params;
   - the call formulation.

   Each of these is labelled as a counterfactual, not as an additive bill. "Key checking is free"
   is dropped: say what the probe shows. The `string` baseline must not still compute `Key`.
5. **The tempting generic fails one real caller.** Noam's caller passes a union-valued key (for
   example, a function returning `"shop.cart" | "shop.hello"`), and the generic accepts params for
   the wrong message. It's one beat, with a Ch9 callback at most. Don't reteach distribution.
6. **The Turn is the distributed whole tuple, the working repair, showing more instantiations and
   much less check time.** The team stops treating one counter as the bill. Gil doesn't declare a
   measurement sufficient beforehand, so nobody looks foolish. The trace attributes the union's cost
   to relation work against the large `Args` union.
   - Resolve the trace's types through the legend. Don't hard-code type IDs or sampled event counts,
     and don't claim "2,000 comparisons per call".
   - The precomputed ParamMap counterexample (fewer instantiations, slower) stays in validation, or
     one line if Linoy proposes code generation. There's no generator subplot.
7. **The Verdict is local:**
   - Take the distributed tuple.
   - Keep key, placeholder and arity checks, and the runtime body.
   - Record the workload and the caller set the speedup preserves.
   - A later proposal to remove a check still needs a measured benefit, the mistakes it newly
     accepts, and what catches them or which risk is accepted.

   It isn't open. The evidence decides this case.
8. **Timing on the page and in the check.**
   - **The page:** repeated, untraced check times on the named generated fixture, with their
     provenance: the compiler, the profile, `--checkers 1`, the number of runs, and that they're
     medians. Round honestly. The shop is fictional, and the page claims nothing about real projects
     or about TypeScript 7 versus earlier compilers.
   - **The check:** it asserts generation, key, call and distinct-key counts, diagnostics, accepted
     calls, emit identity, and exact counters under a pinned configuration (`--checkers 1`, the book
     profile, pinned sources). It records times as evidence and **never** fails on them.
   - **`checks/README.md`** documents rebaselining the counters on a compiler upgrade.
   - **The printed counters come from the same profile the check asserts.**
9. **Principle:** Daniel, with Codex's direction in §7:
   - name which performance is claimed;
   - a fixed workload and configuration, changing one suspected part, with time measured
     repeatedly; counters explain work and don't convert to seconds, and a trace locates it;
   - write down the accepted calls and forbidden combinations that must survive, because rejecting
     the same typo isn't enough;
   - if you remove a check, state what newly gets through and what catches it, or the risk you
     accept.

   It's stated as requirements with their stakes, not a flag list. No "fixed across machines", and
   no blanket "safety costs only check time".
10. **The reader cases** are Codex's four (§7): the uncontrolled 30% route PR, the brand's runtime
    allegation, the faster emitter that fails a forwarded caller, and the two-million-instantiation
    count mistaken for a budget. Each has its follow-up.
11. **Cast:** Daniel, Gil, Oded, Noam and Linoy, five in all. Gil designs the comparisons; Daniel
    explains what the compiler output does and doesn't establish. Noam is not data-ignorant.

**Fun guardrails, because this subject can drown in tables:**
- **At most two count tables on the page,** each small. Diagnostics are trimmed to the lines that
  matter. Never print the 2,000-entry catalogue: show three messages and say how the fixture is
  generated (the generator can be a short fence).
- **The scenes readers should retell:**
  - Oded's faster `t` printing `Hello A, {count} items` to a customer;
  - "same 387 bytes";
  - the fast generic letting Noam's caller through;
  - the repair that "does more work" and finishes five times sooner.
- Length 2,300–3,000 words.

**Not adopted:** nothing material. The singleton-key overload stays out, as Codex recommends.
