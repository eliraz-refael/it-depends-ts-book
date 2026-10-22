# Reader report: Chapter 18, "The Ticket Hadn't Changed"

Draft 1 (`17126754…`), 2026-10-22. A fresh, isolated reader had only the full chapter and the earlier
chapters stated as prerequisites. The first attempt ended on an API error before reporting; this is a
fresh rerun with the same prompt. The report is copied verbatim, except for the Eden-pronoun note
below.

**Note:** the reader refers to Eden as "her" once (§5, honourable mentions). Eden is *he* per the cast
biographies; this was not adopted.

---

Overall: this is a strong chapter. The scenario is concrete and the replays check out. I worked through every date and time-zone number and found no errors. The Turn widens the chapter's own first question in a way that feels earned. Most of the problems are local: one forward reference, one code/prose mismatch about policy, one confusing narrator sentence, a reconstruction snippet that doesn't do what Dafna says, and a velocity objection Oded should raise but never does.

---

## 1. The rule

**Is it stated explicitly and testably before the debate?** Yes. Lines 5–7 give two concrete questions you can ask before reusing an answer:
- "what could change the answer without changing those inputs"
- "what required work would disappear if the call didn't run?"

There are also three further claims:
- "Keep those dependencies and effects at a boundary that accounts for them."
- "An ordinary TypeScript function signature doesn't prove they're absent."
- Staleness "is a separate decision from making the calculation pure."

**My restatement:** Before you cache a function, list its hidden inputs (clock, host settings) and any required effects (recording). Pass the inputs in as arguments, move the effects out to a wrapper, cache only the part that is actually pure, and treat "how stale is acceptable" as a separate policy question.

**Does the Verdict follow?** Mostly, and cleanly:
- **Hidden inputs.** The clock is answered by `now` (lines 187, 202–205). The host time zone is answered by `SlaPolicy` (lines 293–307).
- **Disappearing work.** `recordRisk` moves outside the cache (lines 189–191; Verdict line 346, "record outside the cache").
- **"Signature doesn't prove it."** Eden pays this off at line 352: "Nothing in `(ticket, now?) => SlaStatus` prevents the next person memoizing it again." The `declare function slaStatus(ticket: Ticket): SlaStatus` at line 34 is a good set-up, because that signature hides all three dependencies.

**Mismatches:**
- **Staleness is never decided.** The Principle's third claim is set up well by Gilad at line 137 ("Did the lead agree to the extra minute?") and by Eden at line 158 (display delay). But the Verdict never states the staleness that was actually accepted: the board is still up to one 30-second refresh old. The chapter proves staleness is a separate decision, then never makes it. One clause in the Verdict would fix this, e.g. Gilad: "Thirty seconds of display lag, and the lead knows it."
- **"A boundary that accounts for them" (line 7) is vague**, and the code doesn't fully honour it for the policy. `makeSla()` takes no argument. It closes over a module-level `policy`. So the boundary does not actually accept the dependency (see §3).

---

## 2. Story clarity

I could follow the main line: 20,000 tickets, a 30-second dashboard refresh, a cache keyed on id/revision, a status that changes with time while the revision stays the same, and a skipped at-risk record. The fixes in order are TTL, then status-change expiry, then deadline cache plus fresh comparison, then zone-aware deadline. Places where I stumbled:

- **Line 45**, Gilad: "When the dashboard shows at-risk, it records…" At this point I assumed the dashboard code did the recording. Only at line 85 do I learn the recording is inside `slaStatus`, shared by every caller. The scene works once you know, but saying here that "`slaStatus` records" would make the cache's skipped record obvious earlier.
- **Line 49**, Eden: "It caught the ticket on its next run." Caught it how, as at-risk or as breached? It's unclear whether the hourly job produced the missing record. I reread this.
- **Line 49 → 117: "all four callers."** I had to go back and count: dashboard, escalation job, API, digest. Line 178 then names three ("the digest, API and escalation job"). Both are correct, but the reader does the arithmetic.
- **Line 117: forward reference to an unmade proposal.** Oded says his patch is "much smaller … than moving all four callers." Nobody has proposed moving callers yet. Dafna only proposes splitting out `evaluate` at lines 166–176, and the callers objection properly arrives at line 178. Oded is rebutting a plan he hasn't heard.
- **Line 182: forward reference.** "The calendar policy is fixed for that instance's lifetime; changing the policy means constructing a new instance with an empty cache." At line 182 there is no "calendar policy". `deadlineFor` takes only a ticket, and `SlaPolicy` doesn't exist until line 293. I stopped and wondered what I'd missed. It reads like a sentence left over from a later revision.
- **Line 228**, Chen: "Which host did you count on?" "Count" refers to the walk-count benchmark, but host has nothing to do with walk counts. The real point (the answer differs by host) arrives only at line 232. It's a fine Socratic opener, but I read it twice.
- **Line 232**: "the digest's deadline function." This sounds like a different function. It's the same `deadlineFor` on a different host. Suggest "I ran this ticket through `deadlineFor` on the digest host."
- **Line 278**, Eden: "Moving the function didn't cause it." What moved? Nothing changed hosts. I think this means "our refactor didn't cause it," but "moving" left me looking for a relocation I hadn't seen.
- **Lines 312–321**: three narrator steps ("replaces the deadline-cache line", "New instances will use", "rebuilds the exported service… discarding the old cache"). That's a lot of ceremony for one line. "Rebuilds the exported service" is also confusing when `const slaStatus = makeSla()` just runs at module load.
- **Terminology drift for `slaStatus`.** It is called "entry point" (210, 352), "wrapper" (350), "service instance" (319), "exported service" (321) and "factory" instance (182). I wasn't sure whether "service" meant something new.
- **Line 334**: `const currentStatus = makeSla();`. I didn't know why a fresh instance is built here instead of calling `slaStatus` (see §3).

Helpers were mostly introduced before use. `memoizeBy` is introduced at 51 before its code, `withTtl` at 119, `recordRisk` at 85, and `deadlineFor` in prose at 23, with its body only at 257. `deadlineFor`'s body arriving late is fine dramatically, because the Turn depends on it.

---

## 3. Code

**Lines 25–41 (Ticket, declare, sample ticket).** Clear. `Date.UTC(2026, 10, 9, 7)` is Monday 9 November 2026. Israel is on UTC+2 by then (DST ended 25 Oct), so 09:00 Jerusalem is correct. Line 43's 13:00 / 11:00Z, and ok at 12:20, at-risk at 12:40, breached at 13:00, all check out. The `declare` followed by a real definition at line 102 would conflict in one file. That's fine for snippets, but readers who paste them will hit it.

**Lines 53–56 (memoizeBy).** Clear. Small wording issue at line 51: "under the key supplied by its caller" sounds as if each call passes a key. It's a key *function* supplied at construction. Suggest "under the key its key function computes."

**Lines 60–77 (replay).** Correct. The first cached call at 10:20Z stores `ok`, so the output is ok/ok, at-risk/ok, breached/ok. Line 79's claim that only the direct call records is correct. The try/finally restore is a nice touch.

**Lines 87–109 (assess / slaStatus).** This is the reveal and it works. You can see both the clock read and the effect.

**Lines 119–131 (TTL).** Clear, and caching the *evaluation* so that `evaluatedAt` stays honest is a smart detail. Gap: with recording after the lookup, every cache hit inside the at-risk window re-records the same evaluation, with the same `evaluatedAt`, roughly twice per entry. Gilad, who cares about records, says "Good" at line 133 and doesn't notice duplicate rows. Either he should raise it, or the line should be softened.

**Lines 141–154 (near-deadline TTL test).** Correct. The entry is filled at `due-1` (inside the window, so at-risk) and lives until `due+59_999`. At `due+30_000` it's still at-risk, while direct `slaStatus` is breached. Line 135, "For the rest of that entry's minute", matches.

**Lines 168–174 (evaluate).** Clear and pure.

**Lines 184–197 (makeSla).**
- **Problem 1.** Line 182, and later line 319 ("If we load another policy, we replace the service instance"), say policy is fixed per instance. But `makeSla()` has no parameter, so there is no way to build an instance with another policy without editing the module. The code doesn't support the claim, and it weakens the Principle's "boundary that accounts for them." Suggest `function makeSla(policy: SlaPolicy)` (after the Turn) and `const slaStatus = makeSla(supportPolicy);`.
- **Problem 2.** `memoizeBy` presumably never evicts. Every revision of every ticket adds a permanent entry. Oded's `withTtl` explicitly had eviction (line 119), so a reader will wonder whether the "winning" cache grows forever. One line from Gilad or Oded would close this.

**Lines 201–206 (refresh).** Clear: one clock read per board.

**Table, lines 216–220.** The numbers are right for refreshes at 0, 30 and 60 s. Line 119's precise "sixty seconds after its computation starts / at or after expiry" wording is what makes the 40,000 come out. Fairness gap: Oded's *improved* proposal (line 160, expiry at status change with the deadline kept in the entry) isn't in the table. It would also score 20,000. See §4.

**Lines 236–260 (isBusinessMinute / walk).** Clear. The loop counts the minute at `at` and then advances, so it returns 13:00, the end of the last counted minute. That's correct.

**Lines 268–276 (TZ table).** All three are correct:
- UTC: business starts 09:00Z, giving 13:00Z.
- Jerusalem: 11:00Z.
- New York: EST from 1 Nov, so 07:00Z is 02:00 local and business starts at 14:00Z, giving 18:00Z.

Good, concrete evidence.

**Lines 293–307 (Intl deadlineFor).** Correct as far as I can tell. `formatToParts` accepts a number, en-GB short weekdays are "Sat"/"Sun", `hourCycle: "h23"` avoids the "24" midnight quirk, and `Number("09")` is 9.
- **Unraised cost.** This calls `formatToParts` once per walked minute. A ticket opened Friday afternoon walks about 3,900 minutes, and a cold dashboard start with 20,000 tickets means millions of Intl calls. That is plausibly tens of seconds, the same order as the 30-second refresh. The formatter is also constructed per ticket. Oded, whose whole motivation was walk cost, says nothing. The deadline cache is exactly what makes this affordable, so the objection would *strengthen* the verdict.

**Line 310: narrator claim is wrong or confusing.** "no local setters or constructors remain in the walk." The original used local-time *getters* (`getDay`, `getHours`), not setters. `new Date(at)` from an epoch number isn't time-zone-dependent. Suggest "no local-time getters remain in the walk."

**Lines 315–317.** Fine.

**Line 323**, Chen: "Friday afternoon also carries the remaining minutes into Monday." This claim comes with no code or example. Either show the Friday ticket or cut it.

**Lines 329–336 (reconstruction).**
- Dafna says "Use the deadline and evaluation timestamp in its record" (line 327). The code instead *recomputes* the deadline with `deadlineFor(ticket, policy)` and uses hand-typed instants. It should read from a record, e.g. `evaluate(record.deadline, record.evaluatedAt).status`, to match her line and Gilad's question.
- `const currentStatus = makeSla(); currentStatus(ticket, Date.UTC(2026, 10, 9, 11))` has no stated purpose. I suspect 11:00 was chosen because calling it at 10:40 would fire `recordRisk` during a reconstruction, which is itself a lesson. Either say so, or drop those two lines.

**Additional Takes (356–364).** No code. Both points are sound.

---

## 4. Fairness

- **Oded's cache and TTL: mostly fair, and his best version shows up.**
  - He owns his own mistake (line 81).
  - He has a legitimate scale argument: "We're measuring the SLA in hours" (line 135).
  - He proposes the genuinely good status-change expiry (line 160), and Dafna grants it: "That can work" (line 162).

  The gaps:
  - The benchmark table then compares the deadline cache only against the *weaker* 60-second TTL, not the status-change version Dafna just conceded works.
  - The win over Oded's best idea comes down to "the cache knows our status thresholds", a design-coupling argument. That's a fair argument, but the table makes it look like a cost win it wasn't.
  - Verdict line 348 ("it does fewer walks") is true only against the TTL.

  Add a row, or have Oded note that his status-change version ties on walks and loses on coupling.
- **Dafna's split: strong and well tested.** Oded's objection about the callers (line 178) is real, and Eden answers it. Dafna's own self-check at line 208 is good. Her slip at line 224 ("`deadlineFor` doesn't read the clock. It's a pure calculation we already had") and her admission at line 264 ("I checked it for clock reads. I didn't check what those methods read") are honest, not humiliating. This is the best character beat in the chapter.
- **Eden's wrapper: fair.** It's challenged by Dafna (line 208), and Eden's reply (line 210) is reasonable. Nobody presses the risk that the default `now = Date.now()` silently brings back the hidden clock for new callers. Dafna nearly does, so this is fine.
- **The time-zone fixes: fair.** Oded's "set the host to Jerusalem" gets its strongest form: "We have one support team, not three calendars" (line 282). Chen confirms it works (line 284). Eden rejects it for a concrete operational reason, "every replacement image" (line 286), and still agrees to fix the host. That is an ideal disagreement. As noted, Oded missing the Intl cost is a lost chance for him to shape the Turn.
- **Gilad, lines 338–342: slightly forced.** "I'd usually ask for every poll to be kept" sets up a concession that exists only to be conceded. It reads as a bow on the scene rather than a real position. Either give him a specific reason he'd want every poll (an audit dispute), or cut it.
- **Is the ending earned?** Yes. The Turn applies the Principle's first question to something nobody had thought of as an input, and the Verdict assembles the pieces everyone contributed. The final Map take (364) is a nuanced, earned last word for an FP purist.

---

## 5. Voice

**Who's identifiable from lines alone:**
- **Oded: very distinct.** Numbers, short sentences, cost framing: "Twenty thousand tickets." (13), "We're measuring the SLA in hours." (135), "All twenty thousand rows, twice a minute?" (340).
- **Chen: distinct.** "When `getHours()` says nine, whose nine?" (262) is perfect. But line 323 turns Chen into a test reporter ("Now it's 11:00Z in all three processes. Friday afternoon also…"), which is not Socratic. Give that to the narrator, or turn it into a question.
- **Gilad: mostly distinct.** He is about records and decisions: "Did the lead agree to the extra minute?" (137). Line 113 ("I don't need an entry every time somebody inspects a ticket in a test") is a pre-emptive caveat against an objection nobody has made, and sounds like the author hedging.
- **Dafna: mostly distinct.** "Show me where it asks the clock." (83). She slides into documentation at 176 ("Same deadline, same instant, same fields in the answer.") and at 364.
- **Eden: blurs.**
  - Line 49 is exposition delivered as dialogue: three facts in a row, ending "This is the dashboard's new cache."
  - Line 158 ("Don't promise a maximum display delay using only the cache's expiry") is a Gilad line in documentation register.
  - Line 210 ("It's the entry point that does that work. The calculation underneath it doesn't.") sounds like Dafna.
  - Eden's real voice, existing callers and replacement images (180, 199, 286, 346), is good. Lean on it.
- **Eli** appears only in the Principle. That's fine.

**Lines that read like documentation or a narrator ruling:**
- Line 23: "The application accepts valid, minute-aligned opening timestamps and positive whole business-minute budgets up to one working day. Its calendar has no holidays or paused tickets." This is a legal scoping clause; it reads as a defence against reviewers. "Up to one working day" is never used. Trim it to the no-holidays clause, or cut it.
- Line 119: "Eviction can also cause an earlier recomputation." This is a caveat no one in the room needs.
- Line 182: covered above.
- Line 214: "starting with empty caches and making no edits" is fine but fussy.
- Line 280: spec links in the narration. Acceptable as a source note, but it's a reference-manual intrusion right after a good dramatic beat. Consider a footnote.
- Line 310: a narrator ruling, and a wrong one ("setters").

**Slogans and maxims:**
- Line 7: "an acceptable old answer is still an old answer." OK in the Principle.
- Line 81: "I cached the answer to a question that changes while the ticket sits there." Good, and it earns its place, but it is a maxim.
- Line 176, line 210.
- Line 364: "Putting `recordRisk` inside the cached calculation did." This is a mic-drop closer, and slightly imprecise. `recordRisk` was inside the cached *function*, and the chapter has reserved "calculation" for the pure part. Suggest "Caching the function that called `recordRisk` did."

**Repetitive openers:** These are mild, not a problem. "Then…" at 160 and 288. "And…" at 158, 178 and 350. One "Good." (133). No "Yes."/"Agreed." tics.

---

## 6. Top 5 fixes (ranked)

1. **Remove the forward reference at line 182 and make `makeSla` actually take the policy (lines 182, 186, 312–321).**
   - Before the Turn, cut "The calendar policy is fixed… empty cache."
   - After the Turn, change the factory to `function makeSla(policy: SlaPolicy)`, with `memoizeBy(ticketKey, t => deadlineFor(t, policy))` and `const slaStatus = makeSla(supportPolicy)`.
   - That makes Eden's line 319 true in code and honours "a boundary that accounts for them" (line 7).
   - Collapse the three narrator sentences at 312/321 into one.
2. **Fix the reconstruction snippet (lines 327–336) to match Dafna's words.**
   - Reconstruct from a record: `const record = { deadline: …, evaluatedAt: Date.UTC(2026, 10, 9, 10, 40) }; evaluate(record.deadline, record.evaluatedAt).status // at-risk`.
   - Either drop `currentStatus = makeSla()`, or say why it's there. For example, Gilad: "and don't replay through `slaStatus` at 12:40, or you'll write a new record."
3. **Give Oded the Intl cost objection in the Turn (after line 308).** For example, Oded: "That's a formatter call per minute. Friday tickets walk the whole weekend." Then Dafna or Eden: "Which is why we cache the deadline. Cold start pays it once." Also hoist the formatter out of `deadlineFor` (construct it once per policy). This gives the velocity character a real stake in the Turn and makes the deadline cache's value concrete.
4. **Fix the misleading or unclear sentences:**
   - Line 310: "local setters or constructors" should be "local-time getters".
   - Line 278: "Moving the function didn't cause it" should be "Our cache change didn't cause it".
   - Line 232: "the digest's deadline function" should be "`deadlineFor` on the digest host".
   - Line 117: "moving all four callers" pre-empts an unmade proposal. Change it to "than touching the callers", or move the line after Dafna's proposal.
5. **Make the benchmark fair to Oded's best idea (lines 160–162, 216–222, 348).**
   - Add a row "Expire at next status change (deadline kept in entry): 20,000", or have Oded say it ties on walks.
   - Let Dafna's argument stand on its real ground: the cache shouldn't own the thresholds.
   - Adjust 348 so "fewer walks" is clearly relative to the TTL.

Honourable mentions:
- Trim the hedging at line 23.
- Cut or ground Chen's Friday claim (323).
- Address `memoizeBy` growth with one line.
- Have Gilad notice duplicate re-records under the TTL (133).
- Rework Eden 49 and 158 into her own voice.
- State the accepted 30-second display staleness in the Verdict.

---

## 7. What works and should be kept

- **The cold open (13–19).** "Nobody changed anything. That's the interesting part." is immediate and concrete.
- **Planting "Jerusalem environment" at line 58** and paying it off at 228–234. It's fair-play foreshadowing.
- **The side-by-side replays** (lines 60–77 and 141–154). Every output comment is correct, and the near-deadline test (`due - 1`, then `due + 30_000`) is an elegant way to show the minute of staleness.
- **Caching the evaluation so `evaluatedAt` stays honest** (line 119). It's a subtle, correct detail.
- **"Did the lead agree to the extra minute?"** (137). This is the staleness principle in a human question.
- **Oded's status-change expiry (160) and Dafna's "That can work" (162).** It's a real concession between competent people.
- **Dafna's slip and admission** (224 → 264). It shows the Principle's first question is hard even for the purist.
- **The three-TZ table (272–276).** It's correct and makes an invisible input visible.
- **Oded vs Eden on the host fix (282–286).** Both are right about different things, and the disagreement is resolved by an operational reason.
- **Eden's line 352** on the signature not preventing re-memoization. It is the payoff of line 34's `declare`.
- **Both Additional Takes.** The `Clock` take (358: "Pass the same live `Clock` twice and it can give you two different instants") and the Map-write take (364) are the most interesting FP nuance in the chapter. Keep them.
