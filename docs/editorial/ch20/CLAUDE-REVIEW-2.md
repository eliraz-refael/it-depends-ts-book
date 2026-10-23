# Claude's second review: Chapter 20 draft 2 (`80c6362e…`)

2026-10-23. I reviewed `74bd60c` against my [first review](CLAUDE-REVIEW.md), with two fresh
isolated readers:
- [Principle-only, draft 2](CLAUDE-DRAFT2-PRINCIPLE-READ.md), with the same four cases;
- a [targeted recheck](CLAUDE-RECHECK-READ.md) of the full chapter, asked about the revised passages.

`node checks/chapter20.cjs` passes on my machine: 15 fences / 21 compiler cases / 18 runtime groups.
The recheck reader re-ran every output on TS 7.0.2 and Node 22. Everything holds:
- the new optional-parameter case, `100,99,98` and then `100,100,100`;
- the 6/18/6 and 1/3/6 table, and the checkout call's one extra preparation;
- the empty-run behaviour and the Take.

It calls the chapter "close, not another full round".

**Verdict: one more round (draft 3), small.** It's two technical wording errors, a sharper Principle,
one line for Daniel in place of his quip, and continuity snags. Afterwards: a Principle-only reader on
the revised Principle, then my final diff review. No further full reader.

**What draft 2 fixed:**
- **The chapter no longer repeats its own bug.** Noam narrows his claim and shows the optional
  parameter slipping past `PriceLine`. Linoy's "I removed the arrow at the package call and left the
  same shortcut inside both renderers" is, in the reader's words, "the best line in the section".
- **The opaque `PreparedPromotion` gets a fair hearing** and a local reason.
- **The Turn is motivated** by Gil's regression test, and "Before it got a function to call" lands.
- **The Principle names its subject,** and makes `map`'s extra arguments explicit. The Principle-only
  reader applied it correctly to all four cases again. It used R4 "almost word for word" for (a),
  and found the type-argument split for (c) from the Principle alone.

## Findings, ranked

### 1. Two technical claims are worded wrongly (must fix)

- **The Take's union.** "Marking the missing property optional in each member" makes a reader
  picture `b?: number`. Under the book's flags it is `b?: never`, as Codex's own correction recorded.
  Show the type, or say "optional and absent".
- **Noam's "An extra required argument would break this assignment."** It wouldn't fail at `layout`.
  `priceWith` is annotated to return `PriceLine`, so the error is TS2322 at the factory's `return`.
  The recheck reader verified this. Say "would fail against `PriceLine`", or point at the factory.
  The check should pin the location the text names.

### 2. The Principle's second rule and its checks (must fix)

The reader passed every case but stalled on:
- **"Ask the package to prepare something once when that work belongs inside it; return a function
  if that's what its consumers need."**
  - It's two rules joined by a semicolon, with "it" and "its" pointing at different things.
  - "Ask the package" is odd.
  - "The package" has no referent in a Principle read on its own: say "a shared module" or similar.
  - **The test the reader wanted is the chapter's own:** the shared module owns the first call when
    that call does work only the module can do. Whether it returns a function or a value then follows
    from what its consumers take. Say that, so the conditions are no longer ambiguous.
- **"Check each call separately":** for what? Name the three things: what it does, whether it can
  throw, and which type arguments it fixes.
- **"TypeScript can choose type arguments there"** reads as neutral. One clause gives both sides:
  that can be the point (naming one now), or it can choose before it has seen enough.
- **"Splitting the parentheses doesn't make those decisions for you"** is Daniel's voice, so keep it.
  If the revision makes "those decisions" clearly point back, that's enough.
- **The two opening definitions read as textbook.** Keep them, since they were the draft-1 finding.
  But they can be shorter, or carried by Daniel's voice. Don't add an example.

### 3. Replace Daniel's quip with the line the opaque exchange is missing (should fix)

- **"We've removed one arrow and put it back. I'd like to keep this one long enough to use it."**
  The recheck reader had to reread it, because the "put it back" never happens on the page. It also
  repeats Dima's pushback as a quip. Cut it.
- **Daniel's reaction can come in the `PreparedPromotion` exchange instead.** The closure *is* the
  opaque prepared promotion, in another shape: a value with one operation. That sharpens the
  choice, and it's Daniel's kind of observation.
- **Dima's "For these consumers, yes"** points at a cost nobody names. Either name what the closure
  gives up (one operation, where an opaque value could later support another), or drop the
  qualifier.

### 4. A cache inside `lineTotal` (should fix: one line)

Both full readers raised it independently, so it's the reader's natural question once Dima says
checkout still prepares per call. I declined it in the first review as a mechanism. As a question, it
deserves one line of dismissal with a reason the book has already earned, and no code. For example:
a cache keyed on the promotion is hidden state in a function that is pure today (Ch18), and it is
only right if nobody changes a promotion after pricing with it (Ch17). Don't add a fixture, and make
no memoization claim beyond that line.

### 5. Continuity and reread snags (fix)

- **"She replaces `discountedBy`"** treats `discountedBy` as adopted, but Dima never agreed to
  export it. Say she sets it aside, or that the factory replaces her proposal.
- **The Verdict's "the ordinary discount adapter can live in reporting"** comes after `Discount` has
  been replaced by `Promotion`. Either keep a line that says single-discount pricing still exists, or
  rephrase the Verdict, e.g. "an adapter that only holds an argument stays in reporting".
- **"You already have that function"** is ambiguous. Say "You already have `price`."
- **Dima's checked-lines line** is four statements in a row, like a code comment. Make it speech, or
  trim it to what someone would say.
- **Dima's closing "that type doesn't restrict what `map` passes"** repeats Noam's point. Cut it, or
  give Dima the package's side: what the package still owes.

## Not adopted

- **A branded `Promotion` parsed at setup instead of a factory.** The `PreparedPromotion` exchange
  already covers validated-once-at-setup, and finding 3 sharpens it. A third shape would be a
  catalogue.
- **An answer to Gil's "I haven't measured".** The Turn supplies a reason that doesn't depend on
  speed, and Gil's line is the honest one.
- **Naming "point-free".** R4 states the behaviour, and the term adds vocabulary without a decision.
- **Rules for `bind`, overloads and naming both forms.** That's the reader's list, and the chapter
  decides one case. A list would make the Principle documentation.
- **Feed lines** ("Even with `PriceLine`?", "Before the renderer ran?"). The reader found them
  acceptable, and so do I.

## Next

Codex revises to draft 3. Update the checks for finding 1 (the TS2322 location, if printed or
claimed) and for any fence changes. Run `npm ci --offline` plus the full `npm run check`, and commit
locally with these records. Then I'll run a Principle-only reader on the revised Principle and do the
final diff review.
