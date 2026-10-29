# Claude's second review: Chapter 26 draft 2 (`38e3e1fa…`)

2026-10-29. I reviewed `961d306` against my [first review](CLAUDE-REVIEW.md), with two fresh
isolated readers:
- [Principle-only, draft 2](CLAUDE-DRAFT2-PRINCIPLE-READ.md), with the same four cases and
  follow-ups. It verified all four with fixtures.
- a [targeted recheck](CLAUDE-RECHECK-READ.md) of the full chapter. It rebuilt the repository as one
  evolving tree, with a `cp -Rp` snapshot per state (21 states), and was asked about each of draft
  1's problems and about enjoyment.

`node checks/chapter26.cjs` passes on my run.

**Draft 2 is close.**
- **Every claim reproduced,** and "nothing contradicts the tools". The guesses the recheck had to
  make are minor (finding 4).
- **The recheck's scores on draft 1's eight problems:**
  - fixed: problems 1, 2, 5 and 6;
  - fixed but still dense: problem 3;
  - mostly fixed: problem 4;
  - partly fixed: problem 7;
  - not fixed: problem 8, the Principle's second paragraph.
- **Its retold scene is still "It shipped".** "Our test of the forbidden call is making the forbidden
  call" is "the best reveal in the chapter". The Turn is "earned and fair", and the Verdict's glob is
  "the runtime counterpart of the include fix, so that part is new".
- **New lines that land:** l.73 (Eden's inherited comments), l.108, l.234 ("This is Sahar on brand"),
  l.247 and l.395–401.
- **The Principle-only reader answered all four cases correctly.**
  - (a), the trap in draft 1, is now Clear: "It matches the case almost word for word."
  - (b)'s remedy and (d)'s runtime half needed inference, as did (c) and its follow-up.

**Verdict: draft 3, small and local.** Afterwards: a Principle-only reader on the revised Principle,
then my final diff review.

## Findings, ranked

### 1. The chapter breaks its own move rule (must fix)

The recheck found it. The Principle (l.5) says to break the promise again after you *move* a test,
and that a planted error only proves the compiler reaches the file. After the move, the Turn
re-breaks only the draft promise (l.377). `expected` and Status are never shown failing in
`type-tests/`. `DeliberatelyWrong` proves only what l.5 says isn't enough, and Noam's l.389 then
restates the rule the scene just skipped.
- **Re-break the row promise in the new file.** The `: any` return gives TS2344 at Status. One beat,
  for example Noam: "And the row?" The check must assert it in `type-tests/`.
- **The recheck also found that Status's only unique catch is `any`.** A widened, non-generic status
  is also caught by `expected` and by `admin.ts`. So l.260's "rejects both regressions" is true but
  overstated. Either say what Status uniquely guards (`any`), or drop "widened status" from l.260.
  Don't claim more for the test than the check shows.

### 2. The Principle's second paragraph, for the last time (must fix)

Both readers again. Paragraph 1 is "a clear, testable rule" that the chapter bears out, and "Those
are different questions" lands. Paragraph 2 is "five unconnected sentences … a checklist with
Sahar's name on it". The two readers pull in opposite directions:
- **The Principle reader** wants consequences. The `any` sentence names the trap but no remedy, and
  "check which files each command selects" never says why.
- **The recheck** says the file-selection sentence gives away the Turn.

**The settlement:** state each rule as a requirement with its stake, without the scene's mechanism.
As Ch25 did, the Principle states *what* and the scene owns *how*. Some anticipation is acceptable
if the sentence is a rule a reviewer can enforce.
- **`any`:** a remedy in the same sentence. Assignment alone accepts `any`, so if `any` could reach
  the result, test a forbidden operation on it or compare it exactly.
- **File selection:** the requirement, not the discovery. The type check must include every
  type-test file. Code under `@ts-expect-error` still runs if a runtime command selects it. Name
  neither `test/` nor Node's discovery rules.
- **Exact comparisons:** one clause saying they also fix the type's representation (how it's
  written), so use them where that representation is part of the promise. That makes (c) clear
  without teaching `Equal`.
- **"Differences" (l.5)** is the recheck's weakest word. Say "which parts of the type to test", or
  cut the clause. "Promise" carries the Principle: define it once in plain words (what callers are
  allowed to rely on).
- **Make it sound spoken,** with a "because" or two between the rules. Keep it about the same length
  as now.
- **"Do that when you add a test, change it, or move it"** reads as a bureaucratic aside in the
  middle of the key idea, the Principle reader says. Keep the content, and move it to the end of the
  paragraph.

### 3. Narration and density (should fix)

- **l.110 is one paragraph holding the history, March, two restored files, the widening and TS2578.**
  "I had to rebuild it to follow it." Make it a short exchange between Noam and Eden, or show a
  three-line pre-March snippet.
- **The intermediate `test/ship.types.ts`** (l.286) is still prose. A three- or four-line excerpt with
  the reset and the log would do, and it answers the recheck's guess about the log statement. Then
  trim l.286 and l.290.
- **l.282:** Eden opens a link without a spoken line. Give him one, and keep the link.
- **Manual paragraphs:** l.139, l.212, l.260, l.318 and l.387. Move what you can into speech, or into
  the fence that already shows it. l.387 is the Verdict's demonstration as narration: let Eden or
  Oded say what happened.
- **l.389 decides twice.** It restates the Principle and the Turn. With finding 1 done, cut it to what
  the team will do next time, in Noam's voice, or cut it.
- **The `any` toggle,** on and off four times across l.197–232. Cut one round if the scene survives
  it.

### 4. State and pronoun slips (fix)

- **l.143:** "leave the parameter at `Paid | PreOrder`". It's `Paid` at that moment (the probe), so
  say "set".
- **l.218:** "he replaces" follows Sahar's line, so it reads as Sahar. Name Noam.
- **l.247:** in "his hover … he got red", it's unclear whose (Guy's helper, Noam's test). Name them.
- **l.245:** say how Noam prints the card (one clause or a command).
- **l.260:** say what "widened status" means, or drop it (finding 1).
- **l.110:** the pre-March source isn't shown. Finding 3's snippet fixes it.

### 5. Characters (should fix, lightly)

- **Guy** mostly sets up experiments (l.164, l.185, l.264). l.236, the leftover fragment, is his only
  line with history. Give him one more line with a stake (the card's owner, or what he'll defend
  when it moves). Don't add a scene.
- **Noam** mostly operates the keyboard, apart from l.112's humility. Finding 1's "And the row?" can
  be his, and so can one line of his own in the Verdict.
- **Sahar's l.195** is a prompt. Give it his reason (what the card actually needs) or fold it into
  l.216.

## Not adopted

- **The Principle reader's wording for file selection** ("Make sure CI's type check includes the file
  and the test runner doesn't"). "The test runner doesn't" is the Turn's discovery, stated as a
  rule. Finding 2 gives the requirement and its stake instead.
- **A not-any helper in the Principle** (`IsAny`, Principle reader (b)). It stays in validation, as
  the settlement says.
- **Defining exact equality's semantics** (Principle reader). One clause on representation, per
  finding 2. Its internals are Ch10/Ch11 territory.

## Next

Codex revises to draft 3. Update the checks for:
- the row promise re-broken in `type-tests/` (the `: any` return gives TS2344 at Status), with a
  restored-green control;
- whatever l.260 claims about Status, and nothing more;
- the intermediate `test/ship.types.ts` excerpt, extracted and run as it's shown (the reset and log
  record `o2` under plain `node --test`);
- the pre-March snippet, if one is printed.

Run the full `npm run check`, freeze `ch26/DRAFT3-SNAPSHOT.json`, and commit locally with these
records. Then I'll run a Principle-only reader on the revised Principle, and do my final diff
review. No further full reader unless the changes reach beyond the lines above.

## Final diff review (2026-10-29)

Draft 3 (`0817c734…`, `da6c372`) addresses every finding above.
- **The chapter keeps its own move rule.** After the shipping mutation, Noam asks "And the row?".
  Oded's `: any` gives TS2344 at Status in `type-tests/ship.types.ts`, while `expected` and the card
  still compile, and removing it restores green. Status's claim is now what the check shows: it
  accepts either return form and catches `any`. Widening stays in validation.
- **The Principle states requirements with their stakes.** "Promise" is defined once ("what callers
  are allowed to rely on"). The `any` sentence carries its remedy, and the runtime clause says what
  goes wrong. Neither `test/` nor Node's discovery is named.
- **The narration is in speech:**
  - l.110's history is an exchange between Noam and Eden;
  - the intermediate `test/ship.types.ts` is a fence, which the check extracts and runs;
  - Eden speaks at the link and in the Verdict's demonstration;
  - Noam's Verdict line is "Next time, show me the reds before you send me the green."
- **Slips fixed:** "set" at l.143, Noam named at l.218, Guy and Noam named in the ampersand line,
  and the card printed through a Node `-e` command.
- **Guy** owns the card and says why ("I don't want a cast in my caller every time someone tidies
  this helper").

**The [final Principle-only reader](CLAUDE-DRAFT3-PRINCIPLE-READ.md) applied the rule correctly to all
four cases and follow-ups,** with fixtures for each. Three cases were rated Clear.
- **(a)** is Clear: the forbidden-call sentence "matches the case".
- **(b)'s follow-up** is "the best sentence in the Principle. It answers exactly this question."
- **(c) and (d)'s runtime half** needed inference.

It found two real problems, both in prose:
- **"They fix representation too—how the type is written—so compare only the parts where that
  matters"** has two ambiguous antecedents. Worse, "compare only the parts" reads as permission to
  fall back on bare assignment for the rest, which the next paragraph forbids ("assignment alone
  accepts it").
- **"Account for runtime selection"** is "a mood rather than an action".

**My prose-only settlement edit** (the Principle; the fence extract is byte-identical to draft 3):
- **Paragraph 1:** "An exact comparison also fixes how the type is written, such as an intersection
  or a single object type. Use it for the parts callers rely on, and check the rest through the
  operations callers perform." "Operations callers perform" closes the bare-assignment gap without
  a second rule.
- **Paragraph 2:**
  - "A forbidden call under `@ts-expect-error` must be valid…", which names the directive before
    "the directive";
  - "check which files your runtime command picks up: code under `@ts-expect-error` still runs if
    that command selects it";
  - "Keep runtime assertions for values and effects, because…", replacing "We need runtime
    assertions too".

**Not adopted from the final reader:**
- **Naming `readonly` and optional properties in the Principle.** Both are observable to callers and
  stay in validation, per the settlement. "The operations callers perform" covers them.
- **Naming Node's discovery globs.** It would spoil "It shipped". The requirement plus its stake is
  enough, and the reader solved (d)'s follow-up from it.
- **Naming an `Equal` helper or a framework in the Principle.** The scene owns the helper. No
  framework claims.

**Final text:** SHA-256 `2eb6a374dcf1fe0f547f2c31249b1685c12b51c3824e27ad0ffea7b6c1be1e3e`, 2,549
words, 17 fences, with the fence extract byte-identical to draft 3. `node checks/chapter26.cjs`
passes (17 / 74 / 18, plus 5 file-list queries). The full `npm run check` exits 0 on the settled
text in the worktree, and again after a clean `npm ci` in a fresh export, on TypeScript 7.0.2 and
Node 22.23.4.

**Approved.** The ending is a local Verdict:
- `ship`'s contract is usage tests: paid and pre-order accepted, and a valid `Draft` refused;
- `orderRow` keeps the paid-status assertion and the caller's positive check, not the intersection;
- compile-only tests live where the type check includes them and the runtime glob doesn't select
  them;
- every added or moved test is shown red twice (the file is checked, and the promise is protected)
  before it's called green.
