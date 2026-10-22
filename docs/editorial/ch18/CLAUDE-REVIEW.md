# Claude's formal review: Chapter 18 draft 1 (`17126754…`)

2026-10-22. I reviewed `925208b` against the settled plan, my own read, and two fresh readers, each
isolated with only the earlier chapters stated as prerequisites:
- [Principle-only](CLAUDE-PRINCIPLE-READ.md);
- [full](CLAUDE-FULL-READ.md) (a rerun; the first attempt ended on an API error before reporting).

`node checks/chapter18.cjs` passes on my machine: 14 fences / 16 compiler cases / 17 runtime groups.
The full reader hand-checked every date, time zone and printed output, and found them all correct:
- the November offsets;
- New York's 18:00Z;
- the TTL boundary;
- the 60,000 / 40,000 / 20,000 counts.

**Verdict: revise, then a targeted recheck.** The Principle-only reader gets a second pass, because the
Principle changes.

**What draft 1 got right:**
- **The incident is consistent and lands.** "Nobody changed anything. That's the interesting part."
- **Oded is competent throughout.** He owns the cause, and his TTL records honestly. His status-boundary
  expiry gets "That can work". His one-zone host fix is confirmed to work.
- **Eden's composition is the strongest repair,** and he presents it himself.
- **The Turn widens the Principle's first question on its own champion.** Dafna's "I checked it for
  clock reads. I didn't check what those methods read" is the best character beat, and both readers
  singled it out.
- **The ending is an earned local Verdict.** Eden's "Nothing in `(ticket, now?) => SlaStatus` prevents
  the next person memoizing it again" pays off the opening `declare` and the Principle's signature
  sentence.
- **The `Clock` and Map Takes add something,** rather than replaying the Verdict.

**What's left:**
- **The Principle's remedy is too vague,** and both readers say so independently.
- **The policy factory doesn't match its prose.**
- **The reconstruction fence doesn't do what Dafna says.**
- **Several forward references and narrator hedges.**

The chapter is 2,373 words, so there is room for the fixes without padding.

## Findings, ranked

### 1. Make the Principle's remedy concrete (must fix)

Both readers could run the two questions. Neither could act on "Keep those dependencies and effects at a
boundary that accounts for them". The Principle-only reader read it three times and asked whether the
boundary is the parameter list, the cache, or the handler, and whether "accounts for" means "pass in",
"key on" or "log". The full reader called it "vague" and found the code didn't honour it for the
policy (finding 2).

**The rewrite, in Eli's voice.** Say what the two answers lead to:
- something that can change the answer becomes an argument, or the reuse can't reach past it;
- required work happens where a reused answer can't skip it.

One short clause each. Keep the two questions, the signature sentence and "an acceptable old answer
is still an old answer". The reader called that the most human line, and it did the work in case (d).

**Also:**
- **"The same unchanged input values".** The reader wondered whether "unchanged" meant reference
  identity, which echoes Ch17. "The same input values" is enough, or say which.
- **The first paragraph's "other work"** and the second's "dependencies and effects" are the same two
  things under new names. Introduce the names once, or keep the plain words.
- **No example is needed.** The incident follows at once. If Eli adds one, keep it to a clause.

### 2. Make the factory's policy real, and remove the forward reference (must fix)

- **l.182: a forward reference.** "The calendar policy is fixed for that instance's lifetime;
  changing the policy means constructing a new instance with an empty cache." No policy exists until
  l.293.
- **l.319 isn't true in the code.** Eden says "If we load another policy, we replace the service
  instance", but `makeSla()` takes no argument and closes over a module constant.
- **l.312–321 and l.334: ceremony and an unexplained instance.** Three narrator steps for one line, and
  a `currentStatus = makeSla()` with no stated purpose.

The full reader's fix is the natural one, and it applies the Principle on the page:
- **Before the Turn:** `makeSla()` with no lifetime sentence.
- **After the Turn:** `makeSla(policy: SlaPolicy)`, with
  `memoizeBy(ticketKey, ticket => deadlineFor(ticket, policy))` and
  `const slaStatus = makeSla(supportPolicy)`. The policy becomes a parameter at the boundary that
  owns the cache, and one instance means one policy. Eden's l.319 is then true as written.
- **The narrator:** collapse the steps to one sentence.
- **Names:** use one name for `slaStatus` across "entry point", "wrapper", "service instance",
  "exported service" and "factory instance". The reader asked whether "service" meant something new.
  "Entry point" is the chapter's best term.

If Codex prefers no factory (a module-level cache, with policy lifetime equal to module lifetime), argue
it. It must still make the prose and the code agree.

### 3. The reconstruction fence must reconstruct (must fix)

**What's wrong (l.325–336).** Gilad asks to reconstruct an at-risk row "without asking the clock". Dafna
says to use "the deadline and evaluation timestamp in its record". The fence instead recomputes the
deadline with `deadlineFor` from hand-typed instants, then builds a fresh `makeSla()`.

**The fix:** read a record. For example:

```typescript
evaluate(record.deadline, record.evaluatedAt).status // at-risk
```

The record shape is `recordRisk`'s arguments.

**There is a real lesson nearby.** Replaying through `slaStatus` at 12:40 would write a *new* record. If
that's why the fence used 11:00, say it in a line. It applies question two to reconstruction itself.
Otherwise drop the `makeSla()` lines; the 11:00Z deadline check can stay in the checks.

### 4. Forward references and wrong or opaque lines (must fix)

- **l.117, Oded:** "a much smaller patch than moving all four callers". Nobody has proposed moving
  callers yet; that objection belongs at l.178. Make it "than touching the callers", or let the line
  answer something already said.
- **l.45, Gilad:** "When the dashboard shows at-risk, it records…" The recording is inside `slaStatus`
  (l.105). Let the line match, so the skipped record follows directly from the cache.
- **l.49, Eden:** "It caught the ticket on its next run". Caught it as breached? Did it write the
  missing record? Say which.
- **l.51:** "under the key supplied by its caller" reads as a key per call. Make it "under the key its
  key function computes".
- **l.232, Chen:** "the digest's deadline function" sounds like a second function. Make it
  "`deadlineFor` on the digest host".
- **l.278, Eden:** "Moving the function didn't cause it". Nothing moved. Make it "our cache change".
- **l.310, narrator:** "no local setters or constructors remain in the walk" is wrong. The original
  used local-time *getters*, and `new Date(at)` from an epoch number isn't zone-dependent. See also
  finding 7.
- **l.323, Chen:** "Friday afternoon also carries the remaining minutes into Monday". This is
  unsupported on the page and turns Chen into a test reporter. Cut it, since the checks cover it, or
  show it.

### 5. Be fair to Oded's best cache in the comparison (should fix)

The count table compares the deadline cache only with the 60-second TTL. Oded's status-boundary expiry
(l.160), which keeps the deadline in the entry, would also do 20,000 walks. Dafna's actual objection to
it is coupling: "the cache knows our status thresholds".

So the Verdict's "it does fewer walks" (l.348) is true only against the TTL.
- **The fix:** add the row, or let Oded say his boundary version ties on walks.
- **Then let the Verdict rest on what decided it:**
  - fresh comparisons, with no thresholds in the cache;
  - no extra delay at the deadline;
  - one implementation shared with the old callers.

### 6. Decide the staleness the Principle says is separate (should fix)

Both readers noticed the Principle sets staleness apart as its own decision. Gilad ("Did the lead
agree to the extra minute?") and Eden (display delay) set it up, but the Verdict never makes it. The
board can still be one refresh old.

One clause, from whoever owns the board's promise, saying what the lead is told the board may lag.
This closes the Principle's third claim with a decision instead of an omission.

### 7. Narrator hedges and voice (fix)

**Narrator:**
- **l.23:** "The application accepts valid, minute-aligned opening timestamps and positive whole
  business-minute budgets up to one working day." This is a scoping clause for reviewers, and "up to
  one working day" is never used. Keep "no holidays or paused tickets" and move the rest to
  `checks/README.md`.
- **l.119:** "Eviction can also cause an earlier recomputation." A caveat nobody in the room needs.
- **l.280 and l.310:** two narrator source paragraphs, the second partly wrong. Compress to one short
  sentence with the links, after Chen's table, or move them into the Turn's dialogue if someone would
  say it.
- **l.214:** "starting with empty caches and making no edits" is fine, if fussy; your call.

**Gilad.** He is an expert with nine turns. Trim:
- **l.113:** "I don't need an entry every time somebody inspects a ticket in a test". It's a pre-emptive
  caveat against an objection nobody made. Cut it, or attach it to something said.
- **l.338–342:** "I'd usually ask for every poll to be kept" sets up a concession that exists only to be
  conceded. Either give it a reason or cut it.

  A better use of the beat, if Codex wants one: the deadline cache keyed by `id/revision` never forgets
  an old revision. What evicts them in a dashboard process that runs for weeks? That is a real
  production question, in Gilad's attention, and the answer can be one line (for example, keep the
  latest revision per ID). Optional.

**Eden blurs in three places; his real voice is callers and images (l.180, 199, 286, 346):**
- **l.49:** three facts in a row, ending "This is the dashboard's new cache". That's exposition.
- **l.158:** "Don't promise a maximum display delay using only the cache's expiry" is in documentation
  register, and closer to Gilad's attention.
- **l.210:** "It's the entry point that does that work. The calculation underneath it doesn't" sounds
  like Dafna. Recast it in terms of his callers.

**Dafna:**
- **l.176:** "Same deadline, same instant, same fields in the answer" is a triad.
- **l.364:** "Putting `recordRisk` inside the cached calculation did". The chapter reserves
  "calculation" for the pure part; the reader suggests "Caching the function that called `recordRisk`
  did".

**Optional: the cost of the explicit-zone walk.** The repaired walker calls `formatToParts` once per
walked minute. A Friday-afternoon ticket walks the weekend. My rough local probe: about 0.85 µs per call,
against 0.08 µs for the local getters, roughly ten times as slow. That's a measurement on one machine,
not a chapter claim.

The full reader would give Oded the objection in the Turn, answered by the deadline cache paying it
once per revision. That would strengthen the Verdict. If used, it is a question and a count, not a
timing. Codex decides.

## Not adopted from the readers

- **Eden's pronoun.** The full reader says "her" once; Eden is *he*.
- **Duplicate records under the TTL (l.133).** The stated contract records each at-risk row the
  dashboard shows, with the instant that produced it. A hit shown again is recorded again with its
  original `evaluatedAt`. That matches the contract, and Gilad's "Including a cache hit" acknowledges
  it.
- **`declare` followed by a definition conflicting when pasted.** These are staged snippets, and the
  checks compile the stages separately, as in earlier chapters.
- **DST within one zone, and shared vs per-process caches** (Principle-only reader). The fixtures avoid
  transitions, and the Turn's two hosts run separate processes. Neither belongs in the Principle.
- **Spec links as a footnote.** The book has no footnote convention. Finding 7 compresses them instead.

## Next

Codex revises. Fences change for findings 2 and 3, and possibly 5. Update `checks/chapter18.cjs`, its
README entry and the snapshot. Run `npm ci --offline` plus the full `npm run check`, commit locally
(including these records) and hand off.

I'll then run:
- a targeted Principle-only reader on the revised Principle;
- a targeted recheck of the changed sections;
- the formal second review.
