# Reader report: Chapter 18, "The Ticket Hadn't Changed" (draft 2, targeted recheck)

Draft 2 (`39cfaeb3…`), 2026-10-22. A fresh, isolated reader had only the full chapter and the earlier
chapters stated as prerequisites. It was asked about the passages that draft 2 changed. The report
is copied verbatim.

**Note:** the reader suggests "I asked her" for the lead in §3(e). The lead is unnamed and has no
stated pronouns, so that wording was not adopted; any grounding line should avoid a pronoun.

---

I read it straight through once and reread a few passages, which I list in section 2. My overall view: the chapter is strong and close to ready. The bug is concrete, the output tables are correct, and each design option loses on a stated reason rather than a strawman. Three things keep it from being finished. The formatter cost is raised and never settled. The reason `makeSla` copies and freezes the policy is left implicit. A few terms drift between names.

## 1. Principle → action

**Rule (l.5–7).** Before reusing an answer, ask two questions: what could change it without changing the inputs, and what required work would vanish if the call didn't run?

**Remedy (l.7).** "Make anything that can change the answer an explicit input. If you hold it outside the call, reuse an answer only while it stays fixed. Put required work where returning a saved answer cannot skip it." Deciding staleness is separate, and a signature doesn't prove purity.

I could act on this. It reads as a checklist I could apply in code review.

**Does the final code follow it?**
- **Clock: yes.** The only cached value is the deadline, which doesn't depend on the clock. `evaluate(deadline, now)` (l.169) takes the instant as an argument. The wrapper still reads `Date.now()` by default (l.322), but it never reuses a clock-dependent answer. Dafna names this openly (l.208), and the last Verdict line (l.363) pays off "signature doesn't prove pure".
- **Recording: yes.** `recordRisk` runs after the cache lookup on every call (l.324–326). Only `deadline` is memoized.
- **Time zone / calendar policy: mostly.** The zone becomes an explicit parameter of `deadlineFor` (l.297). It is "held outside the call" in the factory's closure and kept fixed by the copy (l.319). That matches the second sentence of the Principle exactly, but the chapter never says so (see 3a).
  - `SlaPolicy` holds only `timeZone`. Weekdays, 09–17 and the 30-minute window stay hardcoded (l.306, l.171). That is fine, because constants in code aren't hidden inputs. But Eden's "two calendars" (l.334) suggests the policy is richer than it is.
- **Principle vs Verdict.** No real mismatch. The Verdict's staleness line (l.357) is the "separate decision" the Principle promised.

## 2. Clarity check

**Places I reread**
- **l.229, Chen: "Which host did you count on?"** Walk counts don't depend on the host, so the question reads as a non sequitur until l.233. It reads like a pretext. Suggest "Which host did you run this on?"
- **l.60, "The replay runs in the dashboard's Jerusalem environment."** This is a forward reference to the Turn. On first read I couldn't tell why the environment mattered. A planted clue is fine, but it is the only sentence of its kind and it pulled me out.
- **l.133, "Including a cache hit. Good."** I had to work out that a hit re-records the *old* `evaluatedAt`. That produces duplicate records with the same instant, and a hit served after the deadline is recorded with a pre-deadline timestamp. Gilad's next question covers the visible symptom but not the record's accuracy.
- **l.158 (Eden).** I reread "Even after the cache expires, the lead still sees the old row until the board refreshes" to see that he means total staleness is the TTL plus the refresh interval. It is clear once decoded.
- **l.214, "He repeats three thirty-second refreshes."** "Repeats" implies an earlier run. It also isn't said whether the clock is faked. The TTL row depends on that (see 4).

**Names met before I knew what they were or returned**
- **`makeSla` v1 (l.185).** There is no parameter, so I didn't know why it is a factory instead of a module-level cache. The reason only shows up later, as "starting with empty caches" (l.214) and the policy parameter after the Turn. One clause would fix it: "so tests can start with an empty cache."
- **`const deadline = memoizeBy(...)` (l.186, l.320).** `deadline` is a function here, while `result.deadline` and `Evaluation.deadline` are numbers. I stumbled at `evaluate(deadline(ticket), now)`. Suggest `cachedDeadline` or `deadlineOf`.
- **"the hourly job" (l.49).** It appears with no introduction. It is presumably the same thing as "escalation job" at l.178. It also escalates automatically, while l.21 says the lead escalates from the dashboard. So there are two escalation paths that the chapter never reconciles.
- **The fourth table row, "Expiry at the next status change, retaining the deadline" (l.220).** It has a measured count, but this version was never coded. How was it counted?

**Same thing, different names**
- **The `recordRisk` output:** "records" (l.45), "at-risk record" (l.49), "records an at-risk evaluation" (l.81), "at-risk observations… sink" (l.87), "observation" (l.113, l.353), "recording" (l.117), "retained observation" (l.342), "record" (l.345). Pick two at most.
- **The calculation:** `assess` (l.96), `evaluate` (l.169) and `Evaluation`. "Assess" and "evaluate" are synonyms, and `assess` silently disappears.
- **The rejected option:** "expire it at the next status change" (l.160), "boundary-expiry version" (l.223), "Expiry at the next status change, retaining the deadline" (l.220), "Boundary expiry" (l.359).
- **The 30-minute window:** "at-risk" versus "warning window" (l.160) versus "status thresholds" (l.162).
- **The calendar:** "business calendar" (l.13), "support calendar" (l.287), "policy"/`SlaPolicy`, "two calendars" (l.334) and "zone" (l.289) all refer to one string.
- **The final function:** "entry point" (l.180, l.363), "exported function" (l.208), "wrapper" (l.361) and `slaStatus` all name one thing.
- **The other caller:** "hourly job" / "escalation job".

## 3. Specific passages

**(a) The two `makeSla` versions.** v1 (l.185–196) is clear in what it does, but its factory shape is unmotivated (see 2).

In v2 (l.318–331), the narration says *what* changed ("each cache keeps its own copy of the supplied policy", l.315). Eden's l.334 explains why the policy must be fixed *per cache* ("The ticket revision alone wouldn't distinguish two calendars"). Nobody explains why it is *copied*. The real reason is that `Readonly<>` is compile-time only. A caller can pass a mutable `{ timeZone }` and mutate it later, and the cache would then serve deadlines from the old zone under the same key. That is the Principle's "reuse an answer only while it stays fixed", and it is the best illustration in the chapter. Right now it is left for the reader to infer.

The freeze on the *copy* adds nothing. No one else holds a reference to it, and `deadlineFor` only reads it. So a careful reader wonders whether they missed something, especially since `supportPolicy` is frozen too (l.295). Copying only `timeZone` also silently drops any field `SlaPolicy` gains later.

Suggestion: give Eden one line, something like "Readonly won't stop someone mutating the object they passed; I copy it so this cache's key stays honest." Then either drop the freeze or say it is belt-and-braces.

**(b) The walk-count table (l.216–221) and the exchange after it.** It is clear and earns its place. It shows the boundary-expiry option tying, which is fair to Oded, and moves the argument from cost to design. Oded's walkthrough (l.223) is a good spoken gloss.

Dafna's "It's a pure calculation we already had" (l.225) is false. It is set up to be overturned, and it is cleanly overturned at l.265 ("I checked it for clock reads. I didn't check what those methods read."). That is the best beat in the chapter.

**(c) Oded's formatter question (l.311) and Dafna's reply (l.313).** The question is a good, in-character velocity question. Dafna's "They do. The first refresh still needs measuring. Counting walks doesn't tell us what each one costs." is honest, but **nothing later resolves it**. No one measures, and the Verdict doesn't mention it.

It is not a small issue:
- The old walk called `getDay`/`getHours` per minute (cheap). The new one calls `formatToParts` per minute, which allocates an array of part objects each time.
- At roughly 1,000 walked minutes per ticket on average (more for Friday tickets), 20,000 tickets means on the order of 20M `formatToParts` calls on a cold cache. That plausibly exceeds the 30-second refresh, and it happens on every deploy or restart.
- If the first refresh can overrun, the Verdict's "status as of its last thirty-second refresh" is undermined.

Either close it (Oded measures, or the walk skips non-business spans or steps by hour) or have the Verdict accept it explicitly with a number. As written it reads like a dangling thread.

**(d) The reconstruction (l.342–351) and Gilad's line.** The code is correct: 10:40Z is at least 10:30Z and before 11:00Z, so `at-risk`. But the demonstration is close to circular. A record exists only because the status was at-risk, so re-evaluating it necessarily returns at-risk. It also can't catch a wrong stored deadline, such as one from the digest host.

Gilad's l.353 ("replaying it through `slaStatus` would write another observation. This just reads the old one.") is what earns the passage: it makes the effect/calculation split concrete. Keep that line.

Two small problems:
- "retained observation from the 12:40 replay" conflicts with l.60's "isolated test". Would a test's records be retained?
- Consider having Gilad reconstruct something the record doesn't already say, such as how many minutes were left. That would make "reconstruct what the lead saw" (l.45) pay off non-trivially.

**(e) The Verdict's staleness statement (l.357).** "The lead accepts a board showing status as of its last thirty-second refresh, without an extra cache delay." It is clear and correctly distinguishes refresh staleness from cache staleness, which is the Principle's last sentence in action.

However, Gilad asked "Did the lead agree to the extra minute?" (l.137), and the answer arrives as Eden's assertion, with no one consulting the lead. That edges toward a narrator ruling in Eden's mouth. A clause like "I asked her" (with the lead's correct pronoun) or "Gilad checked with the lead" would ground it. The formatter-cost gap (c) also bears on whether "last thirty-second refresh" holds after a cold start.

## 4. Claims

I checked every output comment and table value:
- The replay (l.76–78) is correct.
- The TTL test (l.147–150) is correct.
- The TZ table (l.275–277) is correct: UTC gives 13:00Z; Jerusalem, at UTC+2 in November, gives 11:00Z; New York, on EST after November 1, gives 14:00Z + 4h = 18:00Z.
- 9 November 2026 is a Monday.
- `Date.UTC` month 10 is November.

**Questionable or unsupported**
- **l.219, TTL = 40,000.** This holds only if every entry is "at or after expiry" exactly at the third refresh. With a real clock, entries computed late in refresh 1 expire later than refresh 3's start, so some would still hit. The count is exact only with a faked clock at 0/30,000/60,000. Say the counter run fakes the clock, as the earlier tests do.
- **l.220.** This row is a count for a version that was never shown (see 2).
- **l.375, Dafna: "a hit returns the same number a fresh walk would produce."** It is true given the fixed policy and the revision invariant. It also depends on the runtime's ICU tz data. That is fine to leave unsaid, but it is the same kind of hidden input as `TZ`, just much rarer.
- **l.279.** "The digest was already wrong… Our cache change didn't cause it" is accurate, and honest. A per-process memo was never wrong, because `TZ` is fixed per process. A skeptical reader may then ask why the Turn belongs in a caching chapter. Eden's l.334 answers it, but only for caches that span policies. I'd make that link a little louder.
- **l.375 (Additional Take).** The Map grows forever: every revision of every ticket, including closed ones. It isn't wrong, but Oded's question at l.373 is phrased as rule-checking ("Are we allowing that?") rather than the velocity concern he would actually raise ("This Map never shrinks").
- **TypeScript.** It all type-checks as far as I can see. `Number(undefined)` gives NaN, so the comparison is false, which is safe. `en-GB` short weekdays are "Sat" and "Sun". `h23` is correctly chosen.

## 5. Fairness and voice

**Fairness: good.**
- The TTL gets a real defense ("We're measuring the SLA in hours", l.135).
- Boundary expiry ties on cost and loses only on a design reason Oded himself endorses (l.359).
- "Set the host to Jerusalem" is verified as working by Chen (l.285) before Eden rejects it on durability grounds.
- One weak spot is Oded's l.156 ("It stops the answer staying green forever. It doesn't make every refresh current."). He concedes his own proposal one line after testing it, before anyone pushes back, and the line is slightly slogan-shaped. His strongest case is that the board is already 30 seconds stale, so a TTL at most doubles a staleness the lead already accepts. Letting him make it before conceding would be fairer.

**Distinguishable with names covered**
- Mostly yes. Oded talks cost and migration effort. Gilad talks about the lead and the records. Dafna talks about purity and where the clock is read. Eden wants to keep callers working and fix hosts.
- Chen is the weakest. Apart from "When `getHours()` says nine, whose nine?" (l.263, very good), he mostly reports experiment results ("I ran this…", "I tried it", "Now it's 11:00Z in all three processes"). Those lines could belong to anyone.

**Register flags**
- **l.281.** A narrator paragraph with spec links. It is documentation register and the one place the book voice drops into a reference manual. It is acceptable if that is house style, but it is noticeable.
- **l.357, Eden's Verdict.** It reads as a recap list of decisions ("I'll keep… The dashboard passes… We cache… calculate… and record…"). Trimming it to the two decisions he owns (callers and host) would sound more like a person.
- **l.176, Dafna's "The caller reads the clock and records whatever it needs."** This is slightly instructional, but fine.
- **l.60.** "He replaces `Date.now` for this isolated test and restores it afterward" is a reader-reassurance caveat, but harmless.
- **No narrator rulings on the debate itself.** l.81 explains the output, which is fine.

## 6. Top fixes (ranked)

1. **Resolve the formatter cost (l.311–313, l.357).** Have Oded measure the cold first refresh, or have Dafna's walk skip non-business spans. If the cost is accepted, the Verdict should say so with a bound, because the "thirty-second refresh" guarantee depends on it.
2. **Explain the copy, and drop or justify the freeze (l.315–334).** Give Eden a line saying `Readonly` doesn't stop a caller mutating the passed object, and that the copy keeps this cache's key honest. Tie it to "reuse an answer only while it stays fixed." Remove `Object.freeze` on the private copy, or say it is belt-and-braces.
3. **Unify the terminology.** Use one word for the `recordRisk` output ("record"). Use one name for the job (hourly *or* escalation) and say how it relates to the lead escalating from the dashboard (l.21, l.49, l.178). Use one name for boundary expiry. Use `assess`/`evaluate` deliberately, for example "Dafna's `evaluate` replaces `assess`." Rename the `deadline` function variable (l.186, l.320).
4. **Fix the small logic snags.**
   - Chen's "Which host did you count on?" (l.229): change it to "run this on".
   - Say the walk counter uses a faked clock (l.214), so the 40,000 is exact.
   - Motivate the v1 factory with "fresh cache per test" (l.182).
   - Reconcile "isolated test" (l.60) with "retained observation" (l.342).
5. **Ground the Verdict's staleness decision (l.357).** Have the lead's acceptance be reported, not just asserted, closing Gilad's l.137 question on stage. Let Oded make his strongest TTL case before he concedes (l.156).

The chapter is close to ready. Fixes 1 and 2 are the ones I'd treat as blocking. The rest is polish.
