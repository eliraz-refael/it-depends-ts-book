# Chapter 27 — Codex plan challenge

2026-10-29. Plan reviewed at `fd6f2f2`, on `codex/chapter-27-performance-vs-safety`, based on Ch26's merge `e1c9f70`. **Challenge complete; awaiting Claude's settlement. No chapter drafted and no plan edits.**

## 1. Ending first: a local Verdict, but not the proposed generic replacement

Keep compile-time performance as the core, with one runtime-erasure beat. Keep the PR that removes checks to make compilation faster. End in a local Verdict. There is no demonstrated reason to drop placeholder checks in this example after a suitable representation change.

However, **the proposed two-parameter generic does not preserve the tuple union's contract**. The fixture conceals this because every message has the same placeholders. With different messages, a union-valued key lets that generic accept parameters for the wrong possible message. The conditional-rest alternative has a further missing-arguments hole. This is not a theoretical future library consumer: an ordinary function returning a union-valued translation key is enough.

I found a better candidate: distribute a generic over the **whole argument tuple**, retaining the relationship. In the tested mixed-message fixture it preserves the bad-call rejections, optional arity, correlated tuple forwarding and generic forwarding, while checking faster than the eagerly constructed tuple union. Its instantiation count is slightly **higher**. That gives the proposed measurement trap a concrete consequence of their own repair.

The main changes I recommend settling:

- Use mixed placeholder requirements and at least one placeholder-free message. Make Linoy's original optional-argument design actually appear in the source.
- Compare the two-parameter generic with the old contract before approving its speed. Reject it for the mixed-key caller, then try the distributed tuple formulation below.
- Keep the count/time disagreement as the Turn. Let their candidate produce that disagreement; don't make Gil declare a measurement satisfactory merely because one counter looks small.
- Pin the checker count as well as TypeScript and the complete compiler profile. **The counters belong to a defined compiler configuration, not just to the version number.**
- Print modest, explicitly measured fixture timings if needed to explain the Turn. No timing assertion, including an ordering of medians, in the normal check.
- Remove the unmeasured editor complaint and the proposed “TS 7 made this 1 second” explanation. We measured neither editor latency nor a previous compiler.

This remains a performance chapter. The contract check stops an invalid optimization; it must not turn into a second chapter about union correlation or how to test types.

## 2. The replacement loses checks that the original formulation supplies

### Different placeholders expose the hidden change

Use the plan's unchanged Paths, At and Params helpers with:

```typescript
const messages = {
  shop: {
    cart: "Hello {name}, {count} items",
    hello: "Hello {name}",
    ready: "Ready",
  },
} as const;
```

The proposed generic accepts this:

```typescript
declare const key: "shop.cart" | "shop.hello";
t(key, { name: "A" });
```

`K` is the union. Params is then a union of possible parameter objects, not a requirement that the object supplied works with the actual key. The plain tuple union rejects the call with **TS2345**. The generic accepts it, even with NoInfer around K in the parameter lookup. NoInfer cannot make an already-union-valued first argument into a single key. Explicitly passing `K = "shop.cart" | "shop.hello"` also permits the missing count.

Commands, from the worktree root:

```sh
node_modules/.bin/tsc --strict --noEmit --types "" --lib es2022 .probe/codex/ch27/mixed-generic-unionKey.ts
# exit 0
node_modules/.bin/tsc --strict --noEmit --types "" --lib es2022 .probe/codex/ch27/mixed-union-unionKey.ts
# exit 1, TS2345
```

The latter diagnostic includes:

```text
Argument of type '["shop.cart" | "shop.hello", { name: string; }]' is not assignable to parameter of type 'Args'.
```

For a runtime control I implemented the lookup, made a function declared to return that key union actually return `shop.cart`, and called the generic with `{name: "A"}`. It compiles and prints:

```text
Hello A, {count} items
```

This is `generic-union-runtime.ts` and `dynamic-runtime.log`. A valid cart call supplies count and prints `Hello A, 2 items`. No casts at these call sites manufacture the counterexample.

### Optional params are not demonstrated by the plan's tuple union

The printed union always requires the second argument. None of the generated messages is placeholder-free. It therefore does not yet implement the ergonomic feature used to justify Linoy's choice.

The corrected old signature for that feature is:

```typescript
type Args = {
  [K in Key]: keyof Params<At<typeof messages, K>> extends never
    ? [key: K]
    : [key: K, params: Params<At<typeof messages, K>>]
}[Key];
declare function t(...args: Args): string;
```

The plan's conditional-rest generic accepts another bad call:

```typescript
declare const key: "shop.cart" | "shop.ready";
t(key);
```

For that union, the parameter types include `{}`; their common keys are empty. The conditional selects the empty rest tuple, although the runtime message may need both name and count. `mixed-conditional-optionalHole.ts` exits 0; `mixed-optionalUnion-optionalHole.ts` gives TS2345. Both accept the legitimate `t("shop.ready")` control. The plain two-parameter generic does not accept that legitimate call at all: TS2554.

There is also an accepted-call regression. A pre-existing correlated tuple can be spread into the union signature. The two-parameter generic reports **TS2556** for the same spread. A faster signature that rejects a supported caller is also a contract change.

These controls reproduce on both the plan's lib-only flags and the book's strict/ exactOptionalPropertyTypes/Node16 profile. The [NoInfer documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type) describes control of inference sources; it is not a guarantee that a type argument is a singleton. The acceptance/rejection claims here come from our pinned compiler probes.

### A tested alternative that keeps the pair together

This is the candidate I recommend for settlement:

```typescript
declare function t<K extends Key>(
  ...args: K extends Key
    ? (keyof Params<At<typeof messages, K>> extends never
        ? [key: K]
        : [key: K, params: Params<At<typeof messages, K>>])
    : never
): string;
```

The outer conditional distributes the **entire call**. A union K produces a union of valid tuples, rather than independently unioning the key and its params.

| Caller | Optional tuple union | Separate-key conditional rest | Distributed whole tuple |
|---|---|---|---|
| Literal cart with name/count | accepts | accepts | accepts |
| Literal cart missing count | TS2345 | TS2345 | TS2345 |
| Unknown literal key with params | TS2345 | TS2554 in this probe | TS2345 |
| cart-or-hello key with only name | TS2345 | accepts incorrectly | TS2345 |
| Literal ready with no params | accepts | accepts | accepts |
| cart-or-ready key with no params | TS2345 | accepts incorrectly | TS2345 |
| Correlated cart/hello tuple spread | accepts | TS2556 | accepts |

Additional controls preserve readonly tuple spreading, a generic forwarding function and assignment to the full tuple-call function type. Both the old union and the candidate reject a numeric count, an extra fresh property and an extra argument to ready. The candidate also rejects the missing-count call with an explicit `K = Key`. Evidence: `mixed-distributed-*`, `caller-controls.json`; all 13 extra caller controls match their expected exits.

The candidate overload also compiles above the unchanged runtime implementation and emits the same 387 JavaScript bytes. Its valid cart, hello and ready calls return `Hello A, 2 items`, `Hello A` and `Ready` (`candidate-emit.json`).

This is a bounded contract comparison, not proof of equivalence for every consumer type computation. Preserve the actual callers in the eventual chapter repository. Do not advertise “every error” from two examples.

The cheaper candidate still has a tuple-oriented typo diagnostic. Its missing-count diagnostic is direct, but the plan's blanket “cheaper is also clearer” gift does not transfer unchanged. Show the actual messages, not the desired conclusion.

## 3. Every original mechanism, reproduced and qualified

I ran `npm ci` in this worktree. The installed CLI reports **Version 7.0.2**; Node reports **v22.23.4**. The original generator is unchanged; its SHA-256 is `02c0826ebae092f94f1cc9779d9ead34479fa305f5a3dfa5e98e76297c6723d1`.

The baseline reproduction command is:

```sh
node .probe/ch27-gen.mjs 40 50 2000 union > .probe/codex/ch27/union.ts
node_modules/.bin/tsc --strict --noEmit --types "" --lib es2022 --extendedDiagnostics .probe/codex/ch27/union.ts
```

All timings below are observations of synthetic fixtures on this host, not project check times or thresholds. Runs were serial, without overlapping compiler probes. For the principal table I rotated variant order across five runs; the median is shown. Counters were identical in those five runs.

| Form, original 2,000-key/2,000-call fixture | Symbols | Types | Instantiations | Median check time |
|---|---:|---:|---:|---:|
| Empty module | 10,238 | 6,278 | 1,998 | 0.007s |
| string | 26,472 | 11,004 | 15,220 | 0.015s |
| keyonly | 26,472 | 11,003 | 15,220 | 0.020s |
| generic | 30,955 | 13,370 | 86,223 | 0.103s |
| union | 172,559 | 27,412 | 114,595 | 1.045s |
| Conditional rest, three runs | 32,393 | 15,504 | 87,787 | 0.114s |

**The plan's exact counters all reproduce**, including the empty-module and conditional-rest rows. The approximate tenfold timing difference reproduces on this fixture. That establishes this comparison, not a universal multiplier for tuple unions.

### Mechanism 1: erasure holds for an implemented function

The generator declares t but never implements it. Running its emitted call sites would not establish translation behavior. I supplied an actual common body: walk the dotted key, return the raw key when lookup fails, otherwise substitute provided placeholders and leave missing placeholders intact.

Typed and string-key overload declarations above that same implementation emit byte-identical ES2022/ESNext JavaScript: **387 bytes**, SHA-256 `43e42419a8b77f3cb575639165b54252ae7de840a2bfbaa1f5b97ea7c24d190e`. Commands are recorded in `semantics.json`, under `emit-generic` and `emit-string`; `cmp` succeeds:

```sh
cmp .probe/codex/ch27/emit-generic/emit-generic.js .probe/codex/ch27/emit-string/emit-string.js
# exit 0
```

Keep the claim narrow: these erased annotations and declarations add no executed instructions. It does not follow that all TypeScript constructs erase, that a validator is free, or that every design used to achieve safety has no runtime cost. Ch4 already teaches the emitted-code distinction. One byte comparison and one reply are enough here.

### Mechanisms 2–3: repeatable counts, but a contaminated string baseline

The string variant still contains `type Key = Paths<typeof messages>`. It pays for key enumeration despite no longer enforcing that type at the call. Removing the now-unused type helpers from only that variant reduces it to **24,403 Symbols / 8,854 Types / 2,004 Instantiations**, with a three-run median check time of 0.010s (`string-pruned-*`).

Therefore replace **“key checking is almost free / costs nothing measurable”** with the measured statement: changing the parameter from string to Key adds no instantiations **while both versions already compute Key**. The keyonly version was consistently 0.020–0.021s here versus string's 0.014–0.016s. That is small, but it isn't “nothing measurable.” The whole-safety removal and the signature-only counterfactual are different experiments; label both.

Also, every original message has exactly name/count. The honest cheapest checked signature for that uniform workload can simply use `key: Key, params: {name:string; count:string}`. It keeps the small fixture's key and missing-placeholder rejections with **15,214 instantiations**, median 0.019s. Per-message parsing earns its place only after messages actually differ.

I isolated further parts rather than calling the entire generic delta “the parser”: a generic with the common object uses 15,614 instantiations; adding At but still choosing the common object uses 22,628; applying Params to a fixed common string uses 15,448; the original dependent At/Params composition uses 86,223. These are counterfactual forms, not additive charges for independent compiler components. Evidence: `isolation.json`. The original table supports measuring the dependent computation, not treating its entire delta as a standalone parsing bill.

### Mechanism 4: the scaling trap holds, but both forms have call-site costs

Three serial runs per scaling point:

| Calls over the same 200 distinct keys | Generic instantiations | Generic median check | Union instantiations | Union median check |
|---:|---:|---:|---:|---:|
| 200 | 86,223 | 0.030s | 103,795 | 0.153s |
| 1,000 | 86,223 | 0.062s | 108,595 | 0.555s |
| 2,000, five-run table | 86,223 | 0.103s | 114,595 | 1.045s |

The generic's **instantiations** are unchanged, not its total cost. Its Types and Symbols also grow with calls. With zero calls it already has 15,241 instantiations; the union has 98,561. Change the 2,000 calls to use all 2,000 keys and the generic rises to 151,023 instantiations, while the union remains 114,595. Work depends on both the declared catalogue and the use pattern.

The provided generator pairs `s(c % 40)` with `k(c % 50)`, so it cycles after 200 pairs. That correctly produces the claimed 200 distinct keys, but increasing calls does not eventually exercise all catalogue entries. Preserve an explicit distinct-key count in validation. Don't describe it as uniformly exercising the catalogue.

The trace is real in this version:

```sh
node_modules/.bin/tsc --strict --noEmit --types "" --lib es2022 --extendedDiagnostics --generateTrace .probe/codex/ch27/trace-union .probe/codex/ch27/union.ts
```

It writes trace.json, legend.json and four types_N.json files in this run. I followed checkerId through the legend, then targetId into the appropriate type file. Sampled `structuredTypeRelatedTo` events target Args, whose union has **2,000 members**, and checkExpression events point into the generated calls. `trace-evidence.json` records the connection. It is not enough just to assert that the files exist.

Say that calls incur relation work against a large tuple union. Do **not** say every call necessarily performs 2,000 comparisons: these sampled events are not an exhaustive operation count. Do not sum nested event durations as exclusive work. The [tracing documentation](https://github.com/microsoft/TypeScript/wiki/Performance-Tracing) also warns that the output format can change. Resolve the legend and type identities rather than hard-coding a type ID or assuming a single types file.

### Mechanisms 5–6: the diagnostic comparison uses a different size

On the **2×2** fixture, both generic and union give TS2345 for `"s0.k9"` and for missing count. The union typo diagnostic does descend to the last tuple, `s1.k1`, as claimed. The string form accepts both mistakes. All three accept the valid call.

On the plan's **40×50** fixture, `"s0.k9"` is a valid key: **exit 0** (`original-large-not-a-typo.ts`). Label the small fixture, or use a genuinely absent key. Don't put the small diagnostic beside the large table without saying the catalogue changed.

With the implemented loose lookup, the runtime outputs are exactly:

```text
["Hello A, 2 items","shop.crat","Hello A, {count} items"]
```

These are the good call, typo and missing-count call, respectively. Evidence: `runtime.log`. This supplies a specific consequence of loosening the signature instead of an unspecified “undefined or raw key.” It also distinguishes missing params from a bad key.

## 4. Measurement rules the draft and durable check need

**Pin more than the compiler version.** The same original union source on TS 7.0.2 gives:

| --checkers | Symbols | Types | Instantiations |
|---:|---:|---:|---:|
| 1 | 170,216 | 24,472 | 113,775 |
| 2 | 171,218 | 25,836 | 114,191 |
| 4 | 172,559 | 27,412 | 114,595 |

Commands are in `alternatives.json` (`checkers-1`, `checkers-2`, `checkers-4`); the only option difference is `--checkers N`. This establishes configuration dependence, not an observed cross-machine difference. As a control, changing GOMAXPROCS to 1, 2 and 4 without setting --checkers left the original counts unchanged; I have not measured another machine. Use **repeatable counters for this pinned input and configuration** rather than promising cross-machine invariance. Future exact assertions should set `--checkers 1`, pin libraries, flags and source contents, and document rebaselining them on a compiler upgrade.

The book profile enables exactOptionalPropertyTypes, Node16 module/resolution and skipLibCheck. The plan command specifies only the ES2022 library and otherwise a different compilation profile. The actual book-profile control reaches 64 library/source files, versus 58 in the plan benchmark. Do not print one profile's counters and assert them using the other. Prefer the book profile, explicitly isolate ambient types, and print its actual benchmark command/configuration.

Memory allocations vary in repeated runs. Timings can vary or round to the same value; the reported zero emit time is not forced to change each run. Symbols/Types/Instantiations are useful structural counters, not universal performance units.

**Page:** a compact table of the relevant counts and repeated untraced check-time observations is justified here. Without elapsed observations the reader cannot see the limitation of the counter. Name the synthetic workload, compiler/profile, number of runs and what time is being reported. Round honestly. “On Gil's laptop” alone is weaker provenance than “this generated fixture, median of these serial runs.” Don't convert a one-second fixture into an assertion about a real checkout application's CI.

**Check:** assert source generation, key/call/distinct-key counts, diagnostics, accepted calls, emit identity and pinned compiler counters. Collect time as evidence; don't fail a build because its ratio or median ordering changed. The trace is for attribution, and its instrumentation adds work: don't compare a traced timing with an untraced baseline. No hard-coded sampled event counts or duration thresholds. A trace can be regenerated for review; file format and alias resolution can be validated without treating one sample as a complete census.

**No editor claim.** Neither a CLI time nor a CLI trace measures typing a character, completion, hover or diagnostics latency in an editor. Remove the claim that every `t(` lags and that the proposed fix has solved that. The [TypeScript performance guidance](https://github.com/microsoft/TypeScript/wiki/Performance#reporting-editing-performance-issues) treats editing performance as a separate investigation. We did not run that investigation.

## 5. Make the repair cause the Turn

I extended the fixture to cycle among name/count, name-only and no-placeholder messages, and changed each generated call to use the proper arity. It retains 40×50 keys and 2,000 calls over 200 distinct keys. The strings and calls remain deliberately synthetic, not a pretend production catalogue.

Three serial runs each, same original measurement flags:

| Mixed-message formulation | Symbols | Types | Instantiations | Median check time |
|---|---:|---:|---:|---:|
| Optional tuple union | 146,536 | 23,295 | 117,911 | 1.332s |
| Separate-key conditional rest, loses checks | 24,466 | 13,048 | 85,644 | 0.058s |
| Distributed whole tuple, candidate | 95,597 | 24,482 | 118,285 | 0.220s |

This is more useful than declaring the original 1.3× count difference “small enough.” The working repair has **374 more instantiations**, yet substantially less measured check time. The metric has the wrong ordering if used as a speed ranking. The whole tuple keeps the tested relationships, and Symbols falls even while Types and Instantiations rise. No one number is the bill.

Under the actual book profile with `--checkers 1`, the same optional union/candidate pair gives **115,915 / 116,288 instantiations** and observed check times **1.310s / 0.215s**, respectively. These are single corroborating runs, not replacement medians. They show that the counter-ordering and safety result survive the proposed durable configuration.

Recommended progression:

1. Oded's PR removes the expensive signature. The check really gets faster; a misspelled key now reaches the runtime fallback. Establish a compile-time complaint, not an unmeasured editor incident.
2. Gil isolates the key enumeration, dependent params and call formulation. Linoy explains the optional arity and the caller that forwards a correlated pair. Her original representation bought something.
3. The tempting separate-parameter generic catches the two literal mistakes but loses the union-key check. One caller is enough to disqualify it. Don't reteach distribution here.
4. Try the distributed whole tuple and preserve the actual accepted/forbidden calls. This is a change in when and how the checker handles the relation, not a claim that correlation is unnecessary.
5. **Turn:** their repair increases instantiations. The elapsed result and trace require them to stop equating that counter with check time. Gil can catch the misleading ranking without first pretending it was a sufficient measurement.
6. **Verdict:** take the tested candidate locally, retain key/placeholder/arity checks and the runtime body. Record the workload and the errors that the speedup preserves. A later proposal to remove a check still needs a measured benefit and an explicit account of the lost protection.

The erasure comparison fits near the first claim about what “faster” means. Don't make it the Turn: Ch4 and Ch26 already taught the separation. Nor should the mixed-key hole itself be the Turn: Ch9 already contains it. The new event is a successful measured repair that looks worse by the chosen counter.

There is also a stronger optional counterexample to counting instantiations: I generated an explicit ParamMap and replaced dependent parsing with indexed lookups. The generic candidate fell from 86,223 to **2,598 instantiations**, but its three-run median grew from 0.103s to **0.695s**. The corresponding precomputed tuple union used 34,032 instantiations and a 2.617s median. This is one particular encoding, not a verdict against code generation; it demonstrates why Linoy cannot promise that precomputing types necessarily makes the consumer cheap. The check still has to relate callers to the generated declarations. Keep this as validation or a short rebuttal unless the settlement chooses it as the Turn instead. A generator-maintenance subplot would crowd the chapter and repeat Ch25.

I also tried a singleton-key fast overload with a full tuple fallback. It retained the small caller cases and measured faster, but adds an IsUnion helper, overload-resolution issues and TS2769 errors. **Do not use that on the page.** The distributed tuple is the smaller explanation. These alternatives are evidence, not three optimizations the reader must learn.

### Size and realism

Typed translation keys and a placeholder-dependent call are a plausible setting, but the printed source must justify both dependency and optionality. Show a few differently shaped messages, including a real caller that passes a correlated tuple; report the separate generated size. Do not print 2,000 entries or imply the generated repeated text is the shop's catalogue.

Keep the 2,000-key stress fixture for the count/time experiment. There is no need to inflate it until Oded's day looks ruined. I also ran 200 keys: the optional union had a median of 0.144s, the separate conditional 0.025s and the distributed tuple 0.041s. With the original modulo generator that smaller case uses 40 distinct keys, so it is not a clean one-axis catalogue-size experiment. The retained large fixture avoids hiding that confound.

The decision does not become honestly open because some other catalogue could be larger. Here the measured candidate preserves the tested protection and reduces elapsed checking; there is no demonstrated burden requiring its removal. If a future version has no suitable cheaper form, the tradeoff can be real. Name the remaining risk rather than requiring a fictional replacement check that magically costs nothing.

## 6. Repetition and cast

There is one important omission from the plan's earlier-chapter list: **Ch9, Additional Takes**. It already shows `publish<SettingKey>("fontSizeChanged", false)`, independently widened variables and preserving the pair in a discriminated union. That is exactly why the proposed separate-parameter generic is not a contract-preserving replacement. Treat it as a constraint supplied by the book, not a new discovery big enough to carry this chapter.

| Earlier material checked | What Ch27 may add | What to avoid |
|---|---|---|
| Ch3, “Performance — does the compiler care?” | Linoy now follows an actual trace to the expensive relation | Reciting the interface/intersection guidance as a TS7 result; these probes do not test that advice |
| Ch4, Gil's “which build” exchange | Compare actual JS bytes for this implemented translator | Another enum/bundle argument; equating emit with measured application speed |
| Ch7, lines 484–495 | Actually run the removed-helper counterfactual Gil asked for | Calling an unreadable diagnostic or reported editor lag a measured slowdown |
| Ch9, Additional Takes | Preserve correlation while changing checker work | Rediscovering the union-key hole as the Turn, or contradicting the earlier warning |
| Ch16, parser boundary | Distinguish erased annotations from executed checks if someone proposes removing a validator | A new hot-path validation debate; Ch16 is about boundary behavior, not a benchmark for this translator |
| Ch17, Additional Takes | Show why checker counters alone do not determine time | Another property-copy count or borrowing runtime conclusions from that example |
| Ch25 | One sentence that generated declarations need a current source | Repeating the stale-artifact/build-order plot |
| Ch26 | Use its contract tests as controls for an optimization | A fresh lesson on unused directives, file membership or tests of tests |

Daniel really does state Ch24's Principle. The plan's owner-history claim is correct this time.

All proposed pronouns match the bios:

| Person | Bio pronouns | Job in this chapter |
|---|---|---|
| Daniel Compiler | he/him | Principle; interpret the type/trace evidence and the preserved relationship |
| Gil Benchmark | he/him | Own the experiment, distinguish counters from elapsed cost, refuse unmeasured editor conclusions |
| Oded Shipley | he/him | Own the PR and its concrete measured benefit; accept a repair that doesn't lose the feature |
| Noam Kiperman | he/him | Bring the typo and parameter mistakes, including the real nonliteral caller; accept the cheaper implementation |
| Linoy Nightly | she/her | Own the original optional/correlated API and investigate the replacement with a trace |
| Optional Chen Override | he/him | Correct pronouns, but unnecessary sixth interrogator |
| Optional Dima Bridge | he/him | Correct pronouns, but unnecessary arbiter of a decision the evidence already supports |

Keep the five. Gil and Daniel must have different jobs: Gil designs the comparison, Daniel explains what its compiler output does and does not establish. Let Linoy defend the feature her type supplied, not an aesthetically large union. Noam need not be ignorant of all measurements to care about a customer-visible placeholder. Oded need not mistake type erasure for a runtime speedup to be competent; a compiler-speed PR is already a legitimate reason to open the debate.

The rested names introduce no pronoun mismatch either: Eden, Sahar, Guy and Gilad use he/him; Idan uses she/her. No sixth character is needed for the Principle: Daniel is an Expert in the cast; Gil is a Professional. Don't turn Gil's habitual question into a repeated tagline.

## 7. Principle owner, direction and four reader cases

Keep **Daniel** as speaker, with Gil owning the empirical work in the scene. The Principle should require evidence the reader can ask for, rather than enumerate command flags before the story.

Direction:

- Identify which performance is claimed: checking, editing, building or executing. An emitted-code comparison can establish that an erased annotation added no runtime instructions; it cannot measure all the other categories.
- Compare a fixed workload and compiler configuration, changing the suspected part. Measure elapsed cost repeatedly. Use structural counters to explain work, not as a conversion to seconds; use a trace to locate work when the source is unclear.
- Write down the accepted calls and forbidden combinations that must survive. A cheaper signature must preserve those relationships, not merely reject the same typo or leave tests green.
- If a check is removed, state the newly accepted mistakes and the observed benefit, then name what detects them instead **or the risk being accepted**. Don't imply every worthwhile speed tradeoff has a free replacement guarantee.

No “fixed numbers across machines,” “same errors” without a caller set, or blanket “safety costs only check time.” These are requirements with stakes, not a how-to list or a prohibition on ever trading safety away.

### (a) A convincing percentage with an uncontrolled experiment

**Prompt:** A PR changes `Route<"/users/:id">` parameters to `Record<string,string>`. Its author reports one CI type-check run 30% faster before/after. No compiler profile, file list or accepted/rejected calls are attached. Approve? What evidence would change the answer?

**Expected:** not on this evidence. Keep the workload, compiler/profile and selected files comparable; repeat measurements; isolate the changed representation from disappearing work or unrelated edits. Show whether the required id still matters. My Route control rejects `{}` with TS2345; Record accepts it. A valid `{id:"u1"}` call works in both.

**Follow-up:** the repeated times improve but the old version included a generated caller file that the new version omits. Has the type been optimized? No: the workload changed. Restore the file set before attributing the gain. This is a measurement-control case, not another file-discovery puzzle.

### (b) A runtime allegation about a brand

**Prompt:** A colleague says a string-based UserId brand slows an API hot path and proposes changing the parameter to string. What would you inspect or measure?

**Expected:** identify the actual emitted and executed code. My branded/unbranded `pathFor` implementations emit identical JavaScript. That type annotation supplies no extra executed operation. It says nothing about compiler time or the cost of the rest of the API.

**Follow-up:** the proposed change also removes a validating constructor with a branch that can reject invalid input. Does the byte-identity result settle the new proposal? No: executable code and behavior changed; measure that work and identify the lost rejection. Do not use “types erase” to excuse removing a runtime check.

### (c) A faster signature and a relationship the typo test missed

**Prompt:** `emit(...args: {[E in keyof Events]: [E, Events[E]]}[keyof Events])` is replaced by `emit<E extends keyof Events>(event:E, payload:Events[E])`. Events are paid with `{id:string}` and failed with `{code:number}`. The literal success and literal wrong-payload tests behave as before. Is that sufficient contract evidence?

**Expected:** no. Try the actual variable/generic/forwarded callers, including `event: keyof Events` with `{code:1}`. The generic accepts it, while the tuple signature reports TS2345; the runtime event might be paid. Good literal controls pass in both, and a literal paid call with code is rejected in both. This is a specifically measured limitation, not a reason to reject all generics.

**Follow-up:** would adding NoInfer to the payload make the already-union event a singleton? No. Preserve the pair, narrow the event before the call, or explicitly change and verify the contract. Then measure the valid replacement, not just the faster broken one.

### (d) A large count mistaken for a budget

**Prompt:** a type adds two million instantiations; its owner has found no cheaper form preserving the required checks. A PR removes it. What must the reviewer know before deciding?

**Expected:** that count alone is not a performance budget. Ask for the measured elapsed burden on a defined workload, repeated with and without the check, and how that burden affects the actual workflow. Ask which errors now pass, what detects them instead, or which residual risk is explicitly accepted. Neither “two million” nor “safety” decides the tradeoff by itself.

**Follow-up:** a replacement has more instantiations but less elapsed check time with the same callers and rejections. Reject it because the counter got worse? No. Our distributed-tuple result supplies the counterexample. Conversely, a lower counter need not be a speedup: the precomputed-map probe demonstrates that direction too.

These are proposed prompts and expected answers, not independent-reader reports. I ran 12 direct compiler controls for the route, brand and emitter examples. The broader measurement judgments remain judgments about what evidence a reviewer needs.

## 8. Evidence and drafting boundary

Everything generated or executed for this challenge is under `.probe/codex/ch27/`, untracked. The existing `.probe/ch27-gen.mjs` was read and invoked, not edited. Useful entry points, run **serially** if reproducing timing observations:

```sh
node .probe/codex/ch27/measure.cjs
node .probe/codex/ch27/semantics.cjs
node .probe/codex/ch27/alternatives.cjs
node .probe/codex/ch27/isolate.cjs
node .probe/codex/ch27/verify.cjs
node .probe/codex/ch27/caller-controls.cjs
node .probe/codex/ch27/reader-controls.cjs
node .probe/codex/ch27/checker-environment.cjs
node .probe/codex/ch27/emit-candidate.cjs
```

The JSON records retain full compiler argument arrays, statuses and/or diagnostics. The GOMAXPROCS controls are in `checker-environment.json`; `candidate-emit.json` verifies the proposed distributed signature above the shared implementation. `measurements.json` holds the 55 initial measurement runs, including traces and profile controls. `semantics.json` holds 73 compiler cases; `book-semantic-controls.json` repeats the 60 mixed-message cases under the book profile. `alternatives.json`, `isolation.json`, `caller-controls.json` and `reader-controls.json` hold the additional controlled experiments. `verification.json` records the assertions over expected outcomes, emitted identity and runtime output. Generated sources and individual logs sit beside them; the three named runtime controls use an implemented translator, not the benchmark's ambient declaration.

The challenge changes no manuscript, check runner, plan or coverage file. No independent readers were commissioned and no editor measurement was attempted. Only this document belongs in the commit. Settlement should choose the mixed catalogue, exact API/caller contract, measurement profile and Turn before drafting; the evidence above supports a concrete local Verdict without pretending the original generic preserved more than it did.
