# Chapter 14 — Two Seats or None

Status: **SETTLED**. Discovery and outline challenged with Claude.
Branch: `codex/chapter-14-error-handling`.

## Decision and prerequisites

Move expected booking refusals into an explicit return type without changing the
all-or-none booking contract. Chapter 5 already established equally rich thrown
and returned failures; Chapter 10 already established catch-all wrappers. This
chapter asks who besides the application caller interprets completion.

The existing store commits a callback's draft when its promise fulfills and
preserves the old state when it rejects. Its generic return type accepts a
Result, including a refusal. The UI can handle that refusal correctly while
the store commits a partial booking. This is a change of completion semantics,
not an ignored-result example.

## Agreed outline

Cast: Liron, Guy, Dafna, Gil, Sahar. Rest the recent Act II regulars. Professionals
carry the argument; Liron sets a limited proposition and Sahar tests the cost.

1. **Principle.** Expected refusal can be represented in the return type. Name
   the application's all-or-none party booking requirement, the store's commit
   contract, its typed `SeatRefused`, and the existing caller's response. Show a
   successful booking before a failure. This store is fictional; a complete
   serial in-memory model supplies reproducible examples, not database advice.
2. **Debate.** Dafna moves refusal conversion into the transaction callback and
   returns `Result<Booking, Failure>`. The UI handles both variants correctly.
   Guy tests the same payload on his exception handler: exhaustiveness belongs
   to the shared union, not uniquely to Result. Dafna's gain is the declared
   refusal channel. Neither signature is a no-throw guarantee.
3. **Turn.** Gil compares both the response and committed state for A1 free,
   A2 occupied. Refusal messages match; the migrated version leaves A1 held.
   Read the commit line. The callback fulfills with `{ok:false}`. Guy moves
   conversion outside the awaited transaction, preserving rollback and the
   UI's explicit Result.
4. **Strong alternatives.** Concede preflight works if the draft exposes all
   the refusal facts; it adds a read contract and duplicates hold's rules here.
   No race argument: the demonstration store is serial and loses updates if
   used concurrently. Dafna supplies a result-aware transaction adapter, using
   a fresh Error identity and a typed refusal slot. It rejects inside, restores
   the Result outside, and propagates unknown failures unchanged. Compare the
   same success, refused, and unexpected-error paths. If the host were owned,
   it could inspect `.ok` directly; throwing is not intrinsic to rollback.
5. **Verdict.** Dafna withdraws her inside conversion. Guy accepts a Result at
   the public booking boundary. With only throwing store operations today,
   one outer conversion is enough. If independently reusable steps already
   return Results, one result-aware host can remove repeated conversions.
   Keep the adapter an equal repair under that condition, not a winner that
   the text then inexplicably rejects.
6. **Takes.** Unknown caught values need narrowing; returning Promise<Result>
   doesn't prevent rejection. A brief second-host condition (e.g. a queue
   interpreting rejection as retry) may show why conversion belongs between
   host decisions; no retry-safety or vendor claims. Avoid a second main case.

## Discovery and corrections

Claude's independent scenario and probes agreed on the host-boundary spine.
A second refusable voucher step was declined: it defeats reordering but not a
full preflight. We explicitly concede preflight instead of manufacturing races.
The copy/replace model does not provide concurrency isolation.

Initial local-class adapter appeared typed because its public return restored
E. Both authors then verified that `instanceof` on the local class leaked `any`
inside the catch on TypeScript 7.0.2, just like a module-level generic class.
An invalid payload access compiled. Withdraw that implementation. Compare a
per-invocation signal by identity and retain the typed refusal separately; an
invalid access in the restoration branch must fail with TS2339. This compiler
rabbit hole belongs in checks and records, not the main dialogue.

## Validation plan

Extract every TypeScript fence. Check expected line/code diagnostics and quoted
messages against TypeScript 7.0.2. Run the serial model for success, both refusals,
partial commit, rollback, preflight, adapter, and unchanged unexpected failures.
Check adapter refusal payload typing inside its body, not only at callers.
Check refusal payload `undefined`, so a missing slot cannot be confused with a
legitimate E. The host must preserve rejection identity for this adapter.

Fresh reader receives only manuscript and prerequisites, without the outline,
checks, verdict explanation, or prior reviews. Ask what each helper does before
its first consequential use and what principle the example establishes.

## Completion

- [x] Discovery and outline challenged with Claude.
- [x] Manuscript drafted and self-reviewed.
- [x] Fresh first-read review settled: separate Claude subagents; final targeted recheck resolved all five concerns.
- [x] Manuscript-derived compiler/runtime checks pass: 15 fences / 19 compiler cases / 18 runtime groups.
- [x] Claude formal review settled: all revised passages approved; independent full suite passes.
- [x] Full-suite check and tracking complete: 269 fences / 341 compiler cases / 89 runtime groups; two compiler-default cases and two searches also pass.
