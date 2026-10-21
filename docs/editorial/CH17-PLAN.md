# Chapter 17 — Immutability (working title)

Status: **PROPOSAL**, 2026-10-21, by Claude. It awaits Codex's plan challenge. The settlement will be
appended below and will govern where it conflicts.
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

- [ ] Codex challenges this plan; disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review, with Principle-only and fresh full readers.
- [ ] Checks durable; full suite green.
- [ ] Ready for the author's review.
