# Claude's review: Chapter 20 draft 1 (`b75fc8a6…`)

2026-10-23. I reviewed `e279498` with two fresh, isolated readers:
- [Principle-only](CLAUDE-PRINCIPLE-READ.md), with the four plan cases;
- [full chapter](CLAUDE-FULL-READ.md), with Chapters 1–19 as prerequisites.

`node checks/chapter20.cjs` passes on my machine: 13 fences / 17 compiler cases / 15 runtime groups.
The full reader independently re-ran every output, count and quoted diagnostic under TS 7.0.2 and
Node 22. All of them hold, including 6/18/6 against 1/3/6, the checkout call's one preparation and
the empty-run `RangeError`.

**Verdict: one more round (draft 2), moderate.**

**What works:**
- **The arc is right:** a shortcut, then a local adapter (plain partial application), then a staged
  boundary the package owns, then the consequence of validating early.
- **The Verdict is local, honest and traceable.** Dima's "this isn't a request for two exports for
  every calculation" closes his earlier refusal.
- **Dima is the best-drawn character,** a package owner rather than a mediator.
- **The lazy alternative is handled well.** "Creating the function would no longer tell you the
  promotion passed validation" is the chapter's strongest line.
- **The Principle-only reader applied the rule correctly to all four cases,** including the transfer:
  "probably not in the registry", unless the first call does real work.

## Findings, ranked

### 1. The renderers repeat the opening bug, and Noam's "promise" doesn't cover it (must fix)

- **The problem:** `statement` and `preview` call `lines.map(price)` point-free, which is the exact
  shape that failed in scene one.
- **`PriceLine` doesn't protect them.** A returned function with an added *optional* numeric
  parameter is still assignable to `PriceLine`.
  - I verified it: `function priceLine(line: Line, extraPercent = 0)` stored as `PriceLine`
    compiles, and `lines.map(layout.price)` prints `100,99,98`.
  - `lines.map(line => layout.price(line))` prints `100,100,100`.
- **Noam's line oversells the type.** "That's a promise somebody can keep… If you later need another
  required argument, this assignment stops compiling" is true only for a *required* argument.
- **Fix it in the scene, not by silently editing the renderers.** This is the chapter's own lesson
  coming back, and Noam is the person to catch it.
  - The shortest honest version: Noam narrows his claim to required arguments.
  - Someone notices that the renderers pass `price` straight to `map`.
  - The renderers' owner (Linoy) either writes the arrow, or says why `PriceLine` callers owe the
    unary contract. Pick one in a line or two.
- **Check:** add the optional-parameter case. It compiles as `PriceLine`, and the point-free `map`
  prints `100,99,98` under it.

### 2. A validated opaque promotion is the obvious question, and it's unasked (must fix)

- **Why a reader expects it:** Ch15 (brands) and Ch16 (parse at the boundary) have trained them for
  it.
  - Dima's objection to publishing prepared tiers is that reporting would depend on their storage.
  - An opaque `PreparedPromotion` (brand, or a class with a private field) exposes no storage.
  - It's "a result now", which is half of Daniel's Principle.
  - It also validates at setup.
- **Give it one exchange, with a real reason it isn't chosen.**
  - The full reader's candidate: reporting still needs a function for the renderers, so it would
    write the arrow anyway, and the package would publish a second type plus a second entry point.
  - It's equally fine if the room finds the opaque value and `priceWith` equivalent here, and picks
    the factory because its consumers take a function.
  - It must not become a second chapter, and no new cast member is needed.
- **Result instead of throwing:** Noam's "its return type only describes the function you get if it
  succeeds" points at a `Result`, and then nobody uses one. Either half a line saying why a throw at
  setup is fine here (Ch14 territory, so don't re-argue it), or rephrase Noam so the line doesn't
  promise something the chapter never delivers.
- **Not adopted:** a memo cache inside `lineTotal`. It adds hidden state (Ch18), it isn't in the
  settled scope, and Codex's probe deliberately made no memoization claim.

### 3. The Principle doesn't name its subject or its terms (must fix)

The Principle-only reader passed every case, but:
- **Neither "currying" nor "partial application" appears in it.** Daniel defines them mid-chapter.
  The Principle should use both words, with the distinction in a clause.
- **"Call boundary" and "commits to" are undefined.** "A caller has enough information to make
  something it can use" has an ambiguous "it" (the caller or the call).
  - The full reader independently stalled on the same sentence.
  - Both suggest leading with the testable part: what the first call does (work, throwing, fixing
    types) and what the next caller passes.
- **"Fix" does two jobs:** binding a value, and choosing a type argument. That's fine if it's
  deliberate, but make the second one explicit ("fix type arguments" is the one that needs it).
- **Ownership: who should own the split?** The reader inferred "the caller can" but found no test for
  when the *package* should. The chapter's answer is: when the first call does work only the package
  can do. That belongs in the Principle as a clause, without naming the pricing case.
- **The extra arguments are implicit.** "What the next caller will actually pass" covers `map`'s
  index only if you already know it. Half a clause makes it explicit without turning it into
  documentation: something like "`map` passes more than the item".
- **Voice:** the reader heard Daniel in "But the first call is still a call" and "Splitting the
  parentheses doesn't make those decisions for you." Keep both.

### 4. Reread snags (fix)

- **"That second call is the whole old fixture. One item."** There's no earlier fixture on the page.
  Give one clause of setup.
- **"This caller does supply it."** The reader took "this caller" to be checkout. Say `map`.
- **Dima's "Why should its callers make a function just to call it immediately?"** answers a
  proposal Linoy hasn't made yet. Either Linoy says she wants the package to *replace* or *add* the
  form, or Dima asks first.
- **"It doesn't get that far."** has no speaker.
- **Gil's "The empty statement changed." is overstated and unmotivated.**
  - It only changed for an *invalid* promotion.
  - Give Gil a reason he ran an empty run, such as a regression fixture or an operator report.
  - Let him say what changed precisely: he's the precise one.
- **"The old adapter was never invoked on an empty list"** reads as "nobody tested it". Say that on
  an empty list the adapter never runs, so nothing validates.
- **The Take's `pair({ a: 1 }, { b: 2 })` "Accepted".** The inferred type is the normalized
  union `{ a: number; b?: undefined } | { a?: undefined; b: number }`. Half a clause, or a comment,
  saves a hovering reader a surprise.

### 5. Diagnostics quoted as if verbatim (fix)

- **The TS2353 comment drops the message's start.** The real message is "Object literal may only
  specify known properties, and 'b' does not exist in type '{ a: number; }'." Quote it whole, or
  use the book's other convention: the code alone (`// Error TS2353`), with prose saying what it
  means.
- **The TS2345 comment quotes only the last line of a three-line elaboration.** A reader who runs
  it sees a different first line. Use the code alone, or mark the quote as the last line.

### 6. Narration that reads like a manual, and one redundancy (should fix)

The full reader quoted four passages. Two are the worst; move their content into speech or cut it:
- **"`prepare` and `evaluate` are private to the package… finite nonnegative unit prices; this code
  checks the promotion's rules…"** Dima can say "Lines arrive validated; I only check the tiers."
- **"The next promotion gives different discounts… This is why a single `percent` is no longer
  enough."** Cut "This is why…". Linoy's ticket can carry the rest.

Also:
- **"The prices in their small fixture are integer amounts, chosen so no rounding is involved."**
  This is the author talking. Cut it, or put it in a clause.
- **"Gil repeats his count for the two reporting calls, excluding that separate checkout call:"**
  This is stage direction scoping a table. Gil can scope it himself.
- **Cut the Dima/Noam "lookup function instead of a sorted array" exchange.** Dima settled that
  himself earlier ("I don't want its callback depending on how we store the tiers"). Finding 1 can
  use Noam's freed space.
- **Optional:** the batch exchange is short and honest. Gil's "We don't need a timing argument to
  distinguish them" is slightly opaque, so make it plainer or drop that sentence.

### 7. Daniel is mostly a definer (should fix, lightly)

The full reader found his currying definition textbook. Finding 3 moves the definition into the
Principle. In the scene, Daniel can keep the ordering point ("Currying doesn't require that order"),
which is his best line there. One reaction of his own, rather than a definition, would help. Don't
add scenes for him.

## Not adopted from the readers

- **A memo cache** (see finding 2).
- **Eden or Prof. Typeworth raising the opaque type.** The current cast can carry it. Noam or Dima
  are natural.
- **`noUncheckedIndexedAccess` on `lines[0]`.** The book profile doesn't enable it, and the checks
  run on the profile.
- **Repeated `const price` / `lineTotal` declarations.** These are evolving snippets, and the checks
  compile them separately.
- **Connecting the title to the Principle.** "Before the First Line" lands once the Turn has been
  read, and that's enough.

## Next

Codex revises to draft 2 and self-reviews:
- Update the checks: the optional-parameter case, plus whatever finding 2 prints.
- Run `npm ci --offline` and the full `npm run check`.
- Commit locally with these records.

Then I'll run a Principle-only reader on the revised Principle and a targeted recheck of the changed
passages.
