# Codex challenge: Chapter 20 plan

2026-10-23. Reviewed `f00fbcf` on `codex/chapter-20-currying`, based on
`388d9d8`. **Redesign the disputed decision before drafting. The pricing incident
works; its proposed safety-versus-ceremony ending does not survive the repairs.**
The type-argument fallback is useful teaching, but does not yet establish an
unresolved decision either. No manuscript drafted.

Independent reproduction: **28 compiler cases and 14 runtime groups pass** on
**TypeScript 7.0.2 / Node v22.23.3**, using `checks/compiler.cjs` and its book
profile. Used the installed locked toolchain. Scratch runner and full diagnostics:
`.probe/codex/run.cjs` and `.probe/codex/RESULTS.json` (untracked, not committed).
These cover all seven mechanisms and the alternatives below. This is discovery
validation, not a whole-book suite run.

## 1. Ending first: the candidate converges

### The brand is an actual repair, not a cost we can dismiss in advance

A checked `Percent` plus a default branded zero makes `lines.map(lineTotal)` fail
with TS2345. Reporting and checkout then both work:

```typescript
const ten = percent(10);
const forStatement = (line: Line) => lineTotal(line, ten);

lines.map(forStatement);       // [90, 90, 90]
lineTotal(lines[0]!, ten);     // 90
lineTotal(lines[0]!);          // 100
```

The probe includes the constructor's finite/range checks and rejects the dangerous
direct callback. A percentage is exactly the meaningful scalar Noam may already
want to construct after Ch15. Here it is constructed once per reporting run, not
once per line. Checkout's boundary pays its own conversion. Show that real cost,
not “every numeric parameter everywhere must now be branded.” Only one affected
parameter is established in this plan. Quantities, digits and other rates cannot
be brought in at the ending to make its repair look expensive.

This does not prove a universal branded-function safety theorem. It proves that
the proposed replacement with the declared branded signature protects the stated
call. Do not broaden it to arbitrary erased or widened function types.

### There is also an unbranded repair the plan omits

An options parameter gives checkout a direct call and rejects the index too:

```typescript
const withOptions = (
  line: Line,
  { percent = 0 }: { percent?: number } = {},
) => line.price * (100 - percent) / 100;
```

`lines.map(withOptions)` is TS2345. The index cannot fill that object parameter.
`withOptions(line, { percent: 10 })` and a reporting adapter produce the same
answers. This costs braces and a property name at direct callers; it is not free,
but it is a competent alternative to curried parentheses. This is an argument
shape repair, not Ch22's replacement of configuration with injected behavior.

Do not spend a second scene re-litigating scalar validation. The point is that the
index hazard does not force either a curried shared API or brands throughout a
module.

### Partial application need not be a second shared export

The `forStatement` arrow above already fixes the discount and can be reused as a
function value. Reporting can own it locally. If several reporting sites need a
factory, that package can define `discountedBy` over the shared direct function.
Checkout keeps its direct call. **Currying the public API and partially applying a
plain function are different decisions.** The chapter should explicitly teach
that distinction; it is the strongest answer to its own proposed binary choice.

The local adapter alone does not prevent a future direct callback using the
original unbranded numeric signature. Combine it with the brand/options repair
when claiming compiler protection. Conversely, a named unary adapter already
provides the reuse benefit, so it should not be charged a fresh inline arrow at
every use merely to favor the factory.

### “Export both” also passes the stated requirements

A curried export can delegate to the direct implementation. Both get the same
three-line statement result, with one calculation body. Accidentally supplying
`discountedBy` itself to `Line[].map` is TS2345 in this case: its first argument is
a percentage, not a `Line`. A story about the wrong export silently recreating
this incident is not supported by these signatures.

Two public names are a real surface cost. They are not two independent pricing
implementations, and their mere existence does not demonstrate a consequential
mistake. Nor does the plan establish a reason every future pricing rule must have
two exports. A rule permitting a helper where callers repeatedly need it is an
obvious third answer to an all-or-nothing convention.

**Conclusion:** on the current callers I would accept the local repair and leave
reporting free to own its adapter. A shared convenience export is also reasonable.
There can still be a taste or maintenance disagreement, but the plan has not
shown the cost that keeps these owners from choosing either accommodation. A
call-site census will not restore the lost safety trade-off.

## 2. Compare the fallback: better mechanism, still no earned open ending

Mechanism 4 is accurate for the required type parameters in the proposed helper:
`pick2<Order>("total")` is TS2558; `field<Order>()("total")` returns a numeric
selector and rejects `"totl"` immediately. It is a strong reason to teach currying
that is independent of callback arity.

Give its alternatives the same treatment:

1. **A generic default is not equivalent inference.** With
   `K extends keyof Row = keyof Row`, specifying only `Order` works, but the
   selector returns `number | string` for the tested `Order`. The omitted type
   argument takes its default. This is a good short objection and reply.
2. **A row value is not always necessary.** Expected function type supplies enough
   context here:

   ```typescript
   const total: (row: Order) => number = pick2("total");
   const totals = orders.map(pick2("total")); // number[]
   ```

   Both compile. The latter rejects `pick2("totl")` with TS2345 even when the
   typed `orders` array is empty. The distinction is what type information is
   available at the call, not whether a real order has already arrived.
3. **A structural selector avoids naming the whole row type:**

   ```typescript
   const fieldByKey = <K extends PropertyKey>(key: K) =>
     <Row extends Record<K, unknown>>(row: Row): Row[K] => row[key];
   ```

   `fieldByKey("total")` works on `Order` and `{ total: 91 }`, preserving the
   numeric results. A typo can be stored, then fails when applied to an `Order`
   (TS2741 in this probe). Early domain-key checking versus checking against the
   eventual input is a real difference. Do not call the latter unchecked access.
4. **The empty call can be paid once:** `const orderField = field<Order>();`
   followed by `orderField("total")`. If a report defines several selectors, its
   author need not read or write `field<Order>()` at every declaration.
5. The ordinary data-first getter also infers both parameters when called with
   `order` and `"total"`. It need not be abolished to support registration-time
   selectors elsewhere.

**Comparison:** mechanism 4 offers the stronger *currying lesson*. It does not
supply an unresolved choice just by saying one caller has data and another does
not. Contextual inference and a once-bound factory meet those cases. If the real
choice is when to require a domain type, we need two actual selector consumers,
what they can name at registration, and why the owner cannot simply support both
forms cheaply. At present I would use the typed factory where early domain-key
validation matters and the direct/contextual form where it does not. That is a
practical ruling, not an unresolved dispute over the same caller.

## 3. Recommended redesign, and what must be settled next

Keep the pricing incident as a possible opening. Change the question from
**“which shape protects reporting?”** to **“does this shared package promise a
partially applied entry point, or do consumers own those adapters?”** This makes
both positions safe before they disagree. It also stays on currying/partial
application rather than reopening Ch15 or Ch19.

That is a direction to test, **not an approved open ending**. Before drafting:

- Give the reporting owner an actual repeated adaptation that the shared helper
  removes, including the callback's inferred type at registration.
- Give the package/checkout owner an actual maintenance obligation from publishing
  that helper: a supported signature, compatibility promise or independently
  maintained declaration that the scene shows. A one-line derived helper is not
  evidence of duplicated business logic.
- Try the obvious compromise: publish only the helper with demonstrated demand,
  keep other adapters local. If that satisfies both owners, accept the convergence
  and redesign again. Do not invent a prohibition on mixed exports to preserve
  the argument.
- If choosing the selector fallback instead, establish a registration site whose
  expected type does not already solve inference, then test the structural getter
  and once-bound factory. Early key validation must protect a named consumer.

A genuine maintenance preference can sustain disagreement without a failing
program. It needs a cost the reader has seen and owners who actually dispute who
should pay it. We should not search for a compiler bug merely to stop competent
people accommodating each other.

One adjustment to the proposed ending-only reader: ask it to find a **neglected
alternative that satisfies both owners' stated requirements**, and to restate the
remaining cost each owner declines. “Can argue for a Verdict” is too strong a
failure criterion: a reader can reasonably prefer a side of an honest debate.
Failure is an unanswered resolution or a disagreement the text cannot explain,
not the reader having an opinion.

**I do not approve a fixed ending yet, and would not draft until this is settled.**
I also would not move the debt to Ch21 by default. We have time to design Ch20's
actual decision now.

## 4. Seven-mechanism audit

| Mechanism | Independent result and required qualification |
|---|---|
| 1. Numeric second parameter | Optional and required variants both compile; each gives `[100, 99, 98]`. The one-line fixture gives `[100]`. Curried 10% gives `[90, 90, 90]`. The `parseInt` example also reproduces. **The unary function still receives the index at runtime; it does not use it as a discount.** A unary ordinary function records `arguments.length === 3` on every call. |
| 2. Branded parameter | Direct `map` is TS2345; constructor + direct checkout + unary reporting adapter all work. The options-shaped alternative also rejects the callback and preserves both callers. |
| 3. Data-last inference | Bare `mapEach(r => r.amount)` is TS18046; annotated callback and data-first call work. With `pipe2<A, B>(a: A, f: (a: A) => B): B`, the inline nested call infers `number[]`. Extracting the same unannotated helper to a preceding declaration fails again. Show the precise context, not “currying loses inference” as a universal rule. |
| 4. Explicit type arguments | Required pair rejects the single argument (TS2558). Curried factory and immediate typo rejection reproduce. Default, expected-return-type, contextual `map`, structural and data-first alternatives are covered above. |
| 5. Generic and overload adaptation | The emitted declaration confirms `curry2(pair)` is `<T>(a: T) => (b: T) => [T, T]`; mixed string/number is TS2345. `pair.bind(null, "x")` returns `[unknown, unknown]` and accepts the number. For the tested overloaded converter, both adaptations retain the last array signature; scalar binding/currying is TS2345. Do not generalize the tested helper to an arbitrary universal curry utility. |
| 6. Predicate factories | Concrete ready-status factory produces `p is Ready`; generic status factory produces boolean and the later `.account` is TS2339. Keep this out of the main scene; Ch19 just taught the subject. |
| 7. Returned function names | Anonymous returned arrow has empty `.name` and an unnamed frame on this Node runtime. Named inner function and assigned-then-returned arrow both have `convertAtRate` frames. My book-profile output is CommonJS, so its frame is a filesystem path, not the plan's ESM `file://` spelling. Naming is a repair, not an unavoidable cost of currying. |

One additional inference finding worth retaining in discovery: `pair({ a: 1 },
{ b: 2 })` compiles, while `curry2(pair)({ a: 1 })({ b: 2 })` gives TS2353. The
first call fixes `T` before the second value arrives. Preserving a generic
signature does not preserve every jointly inferred call. This could support the
Principle or one Take; it does not require another main scenario.

The initial generic equality assertion in my runner reported a mismatch. Emitted
declarations, assignability in both directions and the instantiated string-pair
check resolve it: **the plan's generic signature is correct**. The finished
runner uses those checks. Do not record the preliminary assertion as a compiler
counterexample.

## 5. Principle, scenario, cast and economy

### Principle

Keep Daniel, but make the rule about **call boundaries**, with argument order as
one consequence. “Curry when an argument is fixed early” is too prescriptive:
the local adapter is partial application, and the type-only factory has no early
runtime value to fix. A useful direction for his rule is:

> Put a call boundary where a caller has enough information to make something it
> can use: a result now, or a function for later. Check what each call fixes—values
> and type arguments—and what the eventual caller will pass. A plain function can
> be partially applied without making every caller use a curried API.

This supplies actions for all four reader cases without choosing a package-wide
convention. Teach the small syntax distinction: currying splits an argument list
across calls; partial application fixes some arguments to produce a function for
the rest. `discountedBy` also **reorders** the direct function's arguments; those
are two choices. A hand-written factory should precede any generic `curry2`.

### Scenario and evidence

Keep one-line tests hiding the failure and the three equal prices exposing it.
Show the ordinary statement, its expected total and which owner exports
`lineTotal` before the shortened callback. Small integer outputs avoid importing
money rounding and currency rules.

Cut the claim that the tidy-up is what the book's declarative lean recommends.
Ch19 explicitly requires preserving what the caller receives. Competence here
means the author recognized a familiar-looking wrapper and missed the callback's
additional arguments; it does not require previous chapters to endorse that edit.

Gil can show the position-dependent totals. A census measures caller shapes, not
reader comprehension, maintenance hours or correctness. Do not make thousands of
lines imply thousands of adapter definitions or closures: the factory can run
once before `map`. Put real fictional caller snippets on the page before counting
them. No stack or performance evidence is needed to make the index incident work.

### Cast

Provisional five: **Daniel, Linoy, Dima, Noam, Gil**. Daniel states the limited rule
and checks inference, then gets out of the way. Linoy owns reporting's reusable
API and has a reason to want partially applied helpers. Dima owns checkout and
the shared package's obligations; he must defend that work, not mediate by role.
Noam supplies the scalar repair and tests whether the next direct callback is
rejected. Gil reproduces the incident and separates counts from preferences.

This gives four professionals rather than recruiting Sahar, Liron and Gilad to
read the next technical paragraph. If the redesign needs Liron's distinction,
let him replace an unnecessary role, not make a seven-person room. Guy's interface
is not needed merely to represent OOP: neither design requires a class. Rest the
characters listed in the plan. All proposed pronouns agree with the biographies.

### Budget

Seven verified mechanisms are research coverage, not seven required scenes.
Use the direct call, reusable unary function and the strongest repair as the main
spine. Select **one** inference issue if the actual shared API needs it. Cut the
predicate example; keep overload loss or naming to one Take at most. Do not attach
an otherwise unneeded generic mapper to a pricing module just to make its preferred
shape fail. A shorter chapter with a real unresolved obligation would be stronger
than a catalog of costs followed by a convention vote.

## 6. Sources and handoff

No lint rule or third-party functional-library claim is retained in this
recommendation. I have not claimed to validate a lint rule on the repository's
toolchain. Omit that proposed repair unless separately sourced and exercised.

Primary sources checked on 2026-10-23:

- [ECMAScript Array.prototype.map](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.map): the callback gets element, index and array. Its declared arity does not remove arguments.
- [TypeScript generic parameter defaults](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-parameter-defaults): omitted optional type arguments resolve to defaults. Phrase mechanism 4 as the lack of the desired **explicit Row plus inferred K in this call**, rather than a blanket ban on supplying fewer type arguments.
- [TypeScript 3.2 strict bind/call/apply caveat](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-2.html#caveats): historical explanation of generic/overload limitations. It describes the older `{}` substitution; use the independently observed TS7 `unknown` result, not that historical type spelling, in current prose.

All contemporary diagnostic, inference and runtime claims above have a named case
in the scratch runner. No manuscript, durable check, master plan or existing
review record changed. Settlement requested on the **revised disputed decision**
first; the mechanisms themselves are ready to use within that scope.
