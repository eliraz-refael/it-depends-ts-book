# Claude's second review: Chapter 27 draft 2 (`8c04256`)

2026-11-01. I reviewed draft 2 against my [first review](CLAUDE-REVIEW.md), with two fresh isolated
readers:
- [Principle-only, draft 2](CLAUDE-DRAFT2-PRINCIPLE-READ.md), with the same four cases and
  follow-ups, verified with fixtures;
- a [targeted recheck](CLAUDE-RECHECK-READ.md) of the full chapter, which rebuilt the repository as
  one evolving tree (six snapshots plus bench cases), re-ran the trace and the CPU profile, and
  scored draft 1's problems.

Both first attempts, on 2026-10-29, were cut off by an API authentication error before they
reported. The reports are the reruns, in fresh directories.

I also confirmed the source link independently: `go version -m` on the installed native `tsc`
records `vcs.revision=2bd066d87f5bafd315be9f40889d0a60b9e58e0b`, the commit the page links to (with
`vcs.modified=true`, as CH27-REVIEW notes).

**Draft 2 is close.**
- **Everything reproduced:**
  - every diagnostic and runtime output, and the 387 bytes;
  - the generator's counts;
  - all seven instantiation counts, exactly;
  - the time ordering, even under heavy machine load;
  - "less than a fifth" (0.166).
- **The trace and profile scene reproduced:**
  - the trace's check events total about 190ms of a 1,632ms `checkSourceFile` span;
  - `mapTypeEx` is at 56.6% cumulative, called from contextual typing (88% through
    `getTypeOfPropertyOfContextualTypeEx`), with `getUnionTypeEx` the largest callee;
  - the linked lines are exactly `mapTypeEx`.
- **The recheck's scores on draft 1's problems:**
  - fixed: P1, P2, P3, P4 and P8;
  - mostly fixed: P5;
  - fixed but buried: P7;
  - partly fixed: P6, the logistics.
- **Retold scene:** the generic candidate. It's faster, lets the broken call through and rejects the
  caller that already worked, and then the distributed fix closes it. Lines that land: the cold
  open, l.107 paying off at l.330, l.250, the Turn (l.280–282), l.314 and the closing joke.
- **The Principle-only reader answered all four cases correctly.** Seven of eight answers were Clear
  or nearly so, up from five, and no claim was contradicted. Its (a) fixture showed a 25× "speedup"
  that is 2.5× when the file lists match: "celebrating work you stopped doing" is literally true.

**Verdict: draft 3, small and local.** Afterwards: a Principle-only reader on the revised Principle,
then my final diff review.

## Findings, ranked

### 1. The logistics block is still the chapter's slow stretch (must fix)

l.111–177 is about 65 lines of commands, options, workload, case-file layout, bench config and
timing protocol before the first table. The recheck got bored here, as draft 1's reader did.
- **Keep:** the tsconfig fence (it's the pinned profile), the workload generator (short and
  readable), and one line of protocol in Gil's voice.
- **Cut or compress:**
  - **l.165** is a spec spoken aloud. One clause is enough: the generated catalogue, the helpers that
    signature needs, then the calls.
  - **The bench tsconfig fence** becomes one clause, if the check can still extract what it needs.
    Otherwise keep the fence and cut the prose around it.
  - **l.177's protocol:** keep "three runs, serially, rotating the order, no tracing while timing" in
    one sentence. Drop the rest.
  - **l.113 and l.134:** merge them into one Gil line.
- **Move the emit command before its first use** (finding 4).
- **Target:** about half the current length, with the same facts available to the check.

### 2. Say why the repair is fast (must fix)

The climax explains where the old time went (l.302) but never why the distributed version avoids it.
The recheck profiled the distributed fixture: `mapTypeEx` drops from about 950ms to about 30ms. The
plausible reading is that inferring `K` from a literal key leaves each call one tuple to type against,
not a 2,000-member union. That's for Codex to confirm on the profile, not to assume.
- **Give it to Daniel.** He currently has two thin lines, and the recheck says he "blurs into Gil".
  The compiler fact is his job; the measurement caveat is Gil's.
- **One or two sentences,** in speech, without internals beyond the one function already named.
- **The check records the distributed profile's share as evidence, never asserted,** like the
  original's.

### 3. Gil's "No" overclaims (must fix)

l.304–306: "Two thousand comparisons every call?" / "No." The profile can't deny that, and
contextual typing does map over the union for each call. The accurate answer is that samples can't
count it. Keep Gil's caveat and drop the denial: "Samples can't tell you that. They locate work;
they don't count visits."

### 4. Order and state (should fix)

- **l.42 and l.101 depend on an emit command that first appears at l.113.** Put the emit command
  (or "Gil emits with `--noEmit false --outDir dist`…") before l.42's output. One clause.
- **l.78:** say why Oded expanded the banner. `t(...pending)` gives TS2556 under his signature. Half
  a sentence.
- **l.84 and l.99 echo each other** ("picks the whole message, then passes it on" / "chooses the
  whole call, then passes it on"). Keep Linoy's, and cut the narration's.
- **l.294:** "Look at the durations" needs the numbers: about 0.2s of the 1.5s check.
- **l.242:** "Checking and emitting … prints" makes `tsc` print. The run prints.
- **l.188:** the cramped one-liner. Two lines, and say once that the bench file uses `declare` (or
  write it).

### 5. The Principle: trim, and fix one sentence (should fix)

Both readers: the headline is there now ("measure the saving and say what newly compiles"), but it's
followed by about 13 more rules in two paragraphs. The Principle-only reader: "more spec than
speech".
- **Trim to the rules the chapter enacts.** Cut whatever restates another sentence. Keep:
  - the headline;
  - checking or running;
  - one change at a time, repeated, with the file list (and "celebrating work you stopped doing");
  - counters aren't seconds, and a profile when they don't explain the time;
  - writing down the calls that must stay legal and forbidden;
  - erased annotations versus validators;
  - owning the mistake.
- **Fix "Rejecting the same typo doesn't prove both survived."** It's the weakest sentence, with
  "both" pointing across a sentence. It's also the sentence that decides the reader's case (c).
  Something like: "A cheaper signature that still rejects the typo may have stopped rejecting
  something else."
- **Order:** the Principle reader's microbenchmark found that repeated, stable times pointed the
  wrong way because of run order. Only the emit comparison settled it. So for an annotation-only
  change, compare the emitted code *before* timing anything. That's one word of order in an existing
  sentence. Don't add a JIT lesson.
- **Not adopted:** guidance for weighing a measured cost against a kept check (the Principle reader's
  (d) gap). The Verdict shows one case, and "accept that risk explicitly" plus "Someone has to own
  the mistake" already name who decides. A weighing rule would be a mood.
- Keep the length to about two-thirds of the current one.

### 6. Register slips (fix)

- **l.273:** the measurement-session sentence reads as a reviewer's footnote. Put it in Gil's mouth
  in a few words ("Same session as the first table"), or fold it into the table caption.
- **l.300:** "the name and implementation may change" is a hedged disclaimer in speech. Keep the
  version fact, and make it sound like Daniel ("That's 7.0.2's checker. Don't build on the name.").
- **Gil's voice** is mostly procedure (l.113, l.165, l.177). Finding 1 removes most of that. Give
  him one line that isn't a protocol, if one fits naturally.

## Not adopted

- **A sidebar or appendix for the logistics** (recheck). The book has no sidebars. Compress instead
  (finding 1).
- **Naming `--extendedDiagnostics` or the trace flags in the Principle** (Principle reader). The
  scene names them, and the Principle states what, not how.
- **`NoInfer` guidance** (Principle reader, (c) follow-up). It's out of scope, and Ch9 owns
  correlation.

## Next

Codex revises to draft 3. Update the checks for:
- whatever the compressed logistics still print, extracted as shown;
- the distributed profile's evidence (shares recorded, not asserted), and Daniel's sentence matched
  to what the profile supports;
- the trace duration figures the page prints, recorded from the run, with the same tolerance policy
  as times (evidence, not assertions), or asserted only as "events sum to less than the check".

Run the full `npm run check`, freeze `ch27/DRAFT3-SNAPSHOT.json`, and commit locally. Then I'll run a
Principle-only reader on the revised Principle, and do my final diff review. No further full reader
unless the changes reach beyond the lines above.
