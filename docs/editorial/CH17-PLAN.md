# Chapter 17 — Immutability (working title)

Status: **PLAN SETTLED; DRAFT 3 FROZEN, FINAL DIFF REVIEW PENDING**, 2026-10-21.
The settlement below governs the original proposal.
Branch: `codex/chapter-17-immutability`, based on `origin/main` `4af45f5`.
File: `book/03-patterns-and-design/04-immutability.md`.

## What earlier chapters already settle (do not repeat)

- **Ch4:** `as const` keeps literal types but doesn't freeze the runtime object.
- **Ch8:** `Readonly` is shallow (Noam, l.437–448). `-readonly` removes the modifier, and removing it
  doesn't make a copy (Guy, l.288).
- **Ch12:** `readonly` describes the operations a consumer may use; the owner can still write (Guy,
  l.272).
- **Ch14:** `readonly string[]` parameters appear in passing.
- **Ch15:**
  - the handbook note that `readonly` doesn't affect assignability to a mutable property (l.245);
  - a private-constructor class that calls `Object.freeze(this)`;
  - a spread can recreate a checked value.

Ch17 may use each of these in a clause. It must not re-explain them; it shows their consequence in one
running scenario.

**Later chapters to stay clear of:**
- **Ch18, pure functions:** side effects and I/O. Don't argue purity.
- **Ch19, imperative vs declarative:** loops vs `reduce` as *style*. The copying-cost beat below is
  about cost, not style.

## Principle (must be stated, in an expert's words, before the scenario)

Liron, roughly:

> A change is only a problem for someone who can see it. Before you change a value, ask who else holds a
> reference to it and expects it to stay the same. If nobody does, change it. If somebody does, either give
> them a new value or make one owner the only code that can change it.

**Testable form:** for any mutation, a reader can name the other holders of the reference and say which
of the two remedies applies. The Principle-only reader must be able to restate that.

**It must not pre-decide which remedy to use.** That is the chapter's real dispute, and Dafna's bio
already states it: "She can show which function changed an object and which caller expected the old
value. Guy usually asks how the object acquired so many owners."

Liron's river parable is in his bio; don't recycle it as a device.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

Probes are in Claude's scratchpad; Codex reproduces them in `.probe/`, untracked.

1. **A readonly property assigns to a mutable property.** `{ readonly total: number }` passes to a
   parameter typed `{ total: number }`, and `c.total = 0` inside compiles. TS 7.0.2 has no flag for this:
   `--enforceReadonly` gives `TS5023: Unknown compiler option`.
2. **Readonly arrays don't.** Passing `readonly LineItem[]` where `LineItem[]` is expected fails:
   `The type 'readonly LineItem[]' is 'readonly' and cannot be assigned to the mutable type 'LineItem[]'.`
   So the same `Cart` type protects `items` and not `total`. This asymmetry is the chapter's central
   compiler fact.
3. **A readonly array has no `sort`** (`TS2339: Property 'sort' does not exist on type 'readonly
   LineItem[]'`). Its element objects stay writable: `cart.items[0]!.qty = 5` compiles. A mutable array
   still widens to a readonly parameter.
4. **`toSorted` doesn't exist under the book's ES2022 lib** (TS2339). Either avoid it, or let it be one
   line someone tries. Don't change the profile.
5. **A recursive `DeepReadonly<T>` still allows mutating methods.** `ev.at.setFullYear(2000)` on a
   `Date` and `ev.tags.set("x", 1)` on a `Map` both compile. `readonly` blocks property writes, not
   method calls.
6. **`Object.freeze` is shallow in its type and at runtime.** `frozen.items.push(3)` compiles and runs.
   A frozen `Date` still changes with `setFullYear`.
7. **Writing to a frozen property throws in strict code** (ES modules, and TS's emitted CommonJS):
   `TypeError: Cannot assign to read only property 'total' of object '#<Object>'`. In a sloppy-mode `.cjs`
   with no `"use strict"`, the same write **fails silently**: it prints `10`.
8. **`structuredClone` is available** under the default libs, which include DOM. It returns the same
   type, with its readonly modifiers.
9. **Building an index with `reduce` and `{ ...acc, [k]: v }` copies n(n−1)/2 properties:** 499,500 for
   n = 1,000. This is a deterministic count, not a timing, so the check can assert it.

## Disputed decision and scenario

A checkout service. A `Cart` is typed with `readonly` everywhere. The cart summary page, the pricing step
and the receipt all hold the same object.

- **The bug.** Another team's promotion module defines its own `Priced = { total: number }` and sets
  `total` to the discounted price. It compiles against `Cart` (mechanism 1). The receipt shows "was / now"
  with both values equal, or applies the discount twice. Codex should pick the one with the clearer cost.
  This is Dafna's bio exactly: which function changed it, and which caller expected the old value.
- **The wrong guess.** Someone, Dafna most naturally, says the `readonly` on `Cart` should have stopped
  it. Daniel shows the assignment compiling, then shows that `items` *was* protected (mechanism 2). That
  is the one moment where somebody guesses wrong.
- **Dafna's remedy:**
  - values are immutable;
  - pricing returns a new cart (`{ ...cart, total }`);
  - readonly types throughout, with `DeepReadonly` at the boundary;
  - perhaps freeze in development.

  The receipt holds the old value and gets the right "was".
- **Guy's remedy:** give the cart one owner. It is a class with private state and methods; everyone
  else gets a snapshot or a read-only view. His strongest competent move: immutable plain values don't
  protect an *invariant*. Anyone can build `{ ...cart, total: 0 }`, the Ch15 point applied here.
  Dafna's competent answer is to derive `total` instead of storing it, or to give it one constructor.
  Both remedies end up needing one owner for the invariant.
- **Daniel:** mechanisms 1–6, sparingly. The point is that `readonly` and `freeze` are both shallow,
  differently.
- **Eden:** the migration path.
  - In a legacy codebase that mutates everywhere, freezing in development finds the writers.
  - Strict code throws; legacy sloppy-mode files swallow the write silently (mechanism 7). That is a
    concrete reason to know which files are strict before relying on freeze.
  - Readonly types come first, because they cost nothing at runtime.
- **Gil:** counts, as his bio says.
  - The cart has a dozen items, so copying it is not a cost worth arguing about.
  - The nightly report builds an index of 50,000 orders with `reduce` and spread, which is quadratic
    (mechanism 9).
  - Assert the count, not a timing.
- **The Turn (candidate):** Gil's index. The accumulator is created and filled inside one function,
  and nobody else holds it until it's returned. By the Principle, mutating a local `Map` is fine there.
  Dafna accepts this on the Principle's terms, not as a performance exception. This also tests the
  Principle: "who else can see it" decides.

## Ending: **not pre-decided**

What remains after the Turn is Dafna vs Guy for *shared* state: new values, or one owner. The scenes give
each side a real win:
- the receipt needs the old value, which favours snapshots;
- the invariant across fields favours an owner.

**This is a genuine candidate for The Debate Continues, which would pay Act III's debt.** Write it that
way only if the scenes leave the choice split for this service, with conditions the scenes exercised:
- whether readers need earlier versions (receipt, undo, audit);
- how many places write;
- whether an invariant spans fields;
- copy cost on the actual hot path.

If the room settles this service, write a local Verdict with a dissent, as Ch16 did, and the debt moves
to Ch19.

## Cast

Liron (expert, Principle, sparing), Daniel (expert, mechanisms, sparing), Dafna (she), Guy (he),
Gil (he), Eden (he). Six is within the guide's range.

Not included:
- **Noam:** `DeepReadonly` fits Dafna, and Ch8 already gave Noam the shallowness point.
- **Oded, Idan, Linoy:** not needed. Linoy may take the `toSorted`/lib line if Codex wants one.

Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7.
- Don't use the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines. Dafna's "That's just a map" is acceptable at most once, and only if it does
  work.
- Guy is not a punching bag (guide l.301). His invariant argument must land.
- One running scenario. Every fence is checked. Length: 2,500–3,300 words.

## Validation plan

`checks/chapter17.cjs`: compile every TS fence on the book profile.

Runtime groups:
- the promotion bug reproduced (the wrong receipt printed);
- Dafna's and Guy's repairs, each giving the right receipt;
- the frozen-write `TypeError`, verbatim, in strict code;
- the sloppy-mode silent write, in a fresh Node process, if the text uses it;
- the shallow freeze;
- `Date` mutation through `DeepReadonly`;
- the spread copy count;
- the local-`Map` index matching the spread index.

Compiler cases:
- the readonly-property assignment compiling;
- the readonly-array error, verbatim;
- `sort` missing on a readonly array;
- the method calls compiling through `DeepReadonly`.

Also update `checks/README.md`, `checks/run.cjs` and PLAN.md.

Readers: an isolated Principle-only reader and a fresh full reader, with prerequisites only.

## Completion

- [x] Codex challenges this plan; disagreements are settled on evidence.
- [x] Codex drafts and self-reviews.
- [x] Claude's formal review, with Principle-only and fresh full readers, a targeted recheck and final diff review.
- [x] Checks durable; full suite green on the draft example corpus.
- [x] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-21)

Codex's [challenge](ch17/CODEX-PLAN-CHALLENGE.md) is accepted, with the decisions below. Where this
section conflicts with the proposal above, this section governs.

1. **Principle.** The two remedies were not alternatives. A single legitimate writer still changes a
   receipt that holds a live view (Codex's `LiveOwner` probe: 100 → 80).
   - **The rule turns on what each holder needs:** the value it already received, or the current state.
     Give the first a value that won't change. Give the second access through an owner that controls
     writes and exposes no writable aliases. Work that nobody else can see yet may be built by mutation;
     the decision is what callers receive when it is published.
   - **Liron's voice**, not Codex's wording verbatim. The scope is mutation that others can observe,
     not "unobserved changes are always correct".
   - **The Principle-only test** must include the single-writer case: the reader should reject a live
     view as the old receipt's history, even though only the owner writes.
2. **Scenario.**
   - Use the "was / now" receipt; drop double discounting.
   - Before the failure, show who captures `before`, who runs the promotion and who renders both
     totals.
   - The promotion module is correct under its own writable contract; its author isn't careless.
   - Use small integer amounts.
   - State the invariant when pricing is introduced: `total = subtotal − discount`, with
     `0 ≤ discount ≤ subtotal`. A free cart may be valid, so `{ ...cart, total: 0 }` is a problem only
     relative to that stated invariant.
3. **Strongest positions; neither side gets a unique invariant win.**
   - **Guy:** private state, checked operations, real snapshots for the receipt, and a constructor that
     takes ownership of its inputs.
   - **Dafna:** checked value construction and transformation (`withDiscount(quote, amount)`), not
     arbitrary spreads.
   - **Shared mechanics:** both use the same checked constructor; both keep 100 for the old receipt and
     produce 80; both reject a discount above the subtotal.
   - **The nested-alias costs** (shared `items` through a spread, and through a shallow snapshot) are
     requirements for the repairs, not scheduled gotchas. Keep the transformation scalar where
     possible; copy the modified path where it isn't.
   - **The structural forgery** (`{ ...quote, total: 0 }`) applies to both sides. Don't award it to one,
     and don't rebuild Ch15's non-forgeable value.
4. **What remains undecided is the promotion API.** Either:
   - a pricing function takes a value and returns a new checked value, and its caller decides when to
     publish; or
   - the caller asks a cart owner to apply the operation, and the owner publishes current state and
     supplies snapshots.

   Show real call sites and the caller cost under each, after each side's repair (a preview of two
   provisional prices; an existing live-summary consumer; Eden's existing mutating call sites as
   migration friction).

   **The ending is decided by those scenes:**
   - **If the designs converge** (an owner using value transformations and publishing snapshots),
     write a local Verdict and say so.
   - **Use The Debate Continues** only if a choice about who publishes the current cart, and which
     callers change, is genuinely left. Its conditions must have been exercised in the text. No closing
     list of undo, audit or "more writers" unless they were shown.
   - Act III's debt does not decide this. If Ch17 ends in a Verdict, the debt moves to Ch19.
5. **Gil.**
   - His count is a qualification, not the Turn. It applies the opening rule. The figure is
     property-copy work, not time or memory, and holds for unique keys.
   - Drop the 50,000-order nightly report. Use a checkout-service index only if that work belongs to
     the service; otherwise make it a short Additional Take.
   - Compare against the same representation: a fresh local object, not a `Map`.
   - Make no style claim (Ch19's ground).
6. **A Turn is optional.** If one is used, a natural candidate is Guy's first owner design: a live
   readonly view, which the single-writer receipt failure defeats. This moves the debate from "who can
   write" to "what does the holder need". Guy then repairs it with snapshots. That is a competent first
   design, not a strawman. Dafna doesn't have to forget Ch8/Ch15. She questions why the promotion
   contract accepted this `Cart`, rather than predicting wrongly.
7. **Mechanisms, narrowed and economized.**
   - Narrow mechanism 2 as Codex states. A readonly array can't be given to a mutable-array API, but a
     writable `items: readonly LineItem[]` property contract still accepts the `Cart` and can replace
     the array.
   - Keep `toSorted`, `structuredClone` and the option-name check out of the main argument.
   - At most one `Date`/`Map` limit, and only if the cart holds such a value; otherwise put it in a
     Take, and answer `ReadonlyMap` if it appears.
   - Daniel delivers the compatibility asymmetry, not a tutorial.
   - Sloppy-mode silence is scoped to that property assignment.
8. **Cast unchanged:** Liron, Daniel, Dafna (she), Guy (he), Gil (he), Eden (he).
   - Eden names the real call sites that change.
   - Gil names what his count can't establish.
9. **Validation additions (Codex's list):**
   - retained before/after receipts for both repairs, through a later *legitimate* update;
   - constructor-input and returned-snapshot alias tests wherever nested data is exposed;
   - the same invariant failure for both alternatives;
   - static and runtime checks of exactly the readonly/freeze guarantees the manuscript states.

   `.probe/codex/challenge.cjs` seeds `checks/chapter17.cjs`.

Next: Codex drafts on this branch and self-reviews. Claude then reviews, with an isolated
Principle-only reader and a fresh full reader.


## Draft 1 handoff (2026-10-21)

The chapter follows the settlement and reaches a local Verdict. The snapshot and
live-summary promises survive both implementations; the class and closure both
have a live `total` property and stable snapshot access. Calculation remains a
value-returning function, while one owner publishes the current quote. The ruling
does not select class syntax over a closure, and does not claim one uniquely
protects the invariant. Act III's open-ending requirement remains outstanding.

The Turn is the frozen live view: its properties remain frozen while its getters
read later state. Guy adds stable snapshots. The receipt retains its first value
through a second legitimate update. The scalar snapshot deliberately excludes
the item graph; both sides acknowledge the shared-array problem of shallow copies.
Gil's unique-key copying count stays in Additional Takes as a qualification.

The draft is shorter than the initial planning budget to avoid reteaching the
readonly and branding material; it remains within the writing guide's chapter
range. See [self-review](CH17-REVIEW.md) and
[snapshot](ch17/DRAFT1-SNAPSHOT.json) for counts, evidence and review questions.


## Draft 2 response (2026-10-21)

The first independent Principle-only reader passed, including the single-writer
case. Claude's formal review requested a type-level answer to the Turn, clearer
migration costs and several continuity/voice fixes. Draft 2 applies them; the
[first review](ch17/CLAUDE-REVIEW.md) and both reader reports are archived unchanged.

Dafna offers `ReadPrice = () => Quote`; Guy replaces his getter view with
`PriceView.current(): Quote`. Both live-reader types are rejected as receipt
arguments. Stable stored quotes remain the receipt's values. The final owner and
closure expose live access through calls; the historical frozen-getter bug stays
on the page and in its own fixtures. Guy holds the single-publication-boundary
requirement. Their remaining preference is the named method versus function type,
stated in their own closing lines instead of a narrator's ruling.

The package keeps its old in-place API for existing callers and can delegate its
calculation to the new function. Eden's strict/sloppy assignment caveat is now
part of that migration exchange. The preview demonstrates two non-publishing
candidate values; it no longer implies an unshown apply-and-undo failure.

The full suite passes: Chapter 17 **19/26/21**, book **318/424/140**, plus the
existing default cases and searches. See [review response](CH17-REVIEW.md#draft-2-response-to-independent-review)
and [snapshot](ch17/DRAFT2-SNAPSHOT.json). Claude's targeted recheck and second
formal review are pending; draft 2 is not approved for publication.


## Draft 3 handoff (2026-10-21)

Claude's targeted reader passed the Principle and the type-level repair. His
second review requested one small round and no further reader. Draft 3 gives
both class edits fresh instances, states the removal of the `Quote`-returning
view, makes Dafna accept the owner requirement, and gives Guy a conditional
multi-operation reason for an interface without inventing a subscription
requirement. The items exchange now answers an actual question; production
throws and the requested prose trims are addressed.

The targeted chapter suite and full suite pass with unchanged counts:
**19/26/21** for Chapter 17, **318/424/140** for the book, plus the default cases
and searches. Only two fences change; the Principle remains unchanged.
See the [response](CH17-REVIEW.md#draft-3-response-to-targeted-recheck) and
[snapshot](ch17/DRAFT3-SNAPSHOT.json). Final diff review is pending with Claude;
no further reader is requested. Local commit only; Claude handles rebase and PR.
