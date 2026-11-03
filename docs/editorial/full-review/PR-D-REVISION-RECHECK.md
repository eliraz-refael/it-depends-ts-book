<!-- Fresh Opus reader, recheck of the PR D revision (482b1d5 vs 2a9429d), 2026-11-03. -->

## PR D revision recheck report

I read the six late Principles one after another, then every hunk with at least 40 lines of context. I compiled the changed Ch15 diagnostics and the `__brand` claim with TS 7.0.2 under the book's profile; probes are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/prd2/probes/. The harness changes (checks/chapter15.cjs, chapter19.cjs, README) are in the worktree commit 482b1d5, not in rev.diff, and I checked them there.

### NEEDS CHANGE (most important first)

1. **The Ch23 Principle's ending says the wrong thing (`10-monads-light.md:5`).**
   - Quote: "If the step already returns a Result, use the operation that passes that result on rather than wrapping it again. Otherwise the outer success may contain an inner failure. Neither is a contradiction. They answer different questions…"
   - Problem 1: "Otherwise" right after an "If…" clause reads as "if the step does *not* return a Result". That is the opposite of what's meant, which is "if you wrap it again".
   - Problem 2: "Neither is a contradiction" says that each one, taken alone, isn't self-contradictory. The intended point is that the two don't contradict each other.
   - Problem 3: "Different questions" is never filled in. The reader only learns the two questions at Dafna's :114 ("the quantity parsed… the stock answer").
   - Fix direction: "Wrap it again and the outer success can hold an inner failure. They don't contradict each other: one says the first step worked, the other says the next one refused. The caller has to reach the one it needs."

2. **The new Ch14 bridge is false (`01-error-handling.md:66`).**
   - Quote: "The service and the page's `submit` handler use that formatter:"
   - Problem: `bookParty` (the service) never calls `failureMessage`. Only `submit` does (:81).
   - Related: :19 "Guy starts with `bookParty`" now sits two fences away from `bookParty` (:69). The library types and the formatter come in between.
   - Fix direction: "Here is the current service function, and the page's `submit` handler that uses that formatter:". Optionally soften :19 to "Guy starts with the contract `bookParty` runs on."

3. **Ch21's Principle opener steps on the chapter's first joke and front-loads the discoveries (`08-hof-patterns.md:5–7`).**
   - Quote: "When this job says failed, can you tell me how many texts went out?"
   - Problem 1: Two lines later the scene opens with Oded's "The job says failed. Please tell me the customer didn't get the message." and Gilad's "Which copy?" (:13–15). The Principle has already asked the count question, so "Which copy?" lands as a repeat, not a surprise.
   - Problem 2: Paragraph 2 also hints at both later reveals. "Keep following it after the job reports its result" points at the delivery after the job finished (:123). "who has the request now and what they can still do with it" points at the gateway delivering despite cancellation (the Turn).
   - Problem 3: "That's what I'll need to explain when someone brings me the log": "That" has no clear antecedent.
   - Fix direction: keep the on-call question but drop the count, e.g. "When this job says failed, what do I tell the customer?" Make paragraph 2 less specific about who holds the request afterwards.

4. **The Ch18 and Ch20 Principles still share one closing template (`05-pure-functions.md:9`, `07-currying-partial-application.md:5`).**
   - Ch18: "Those are changes to what you require. They don't make the original calculation pure."
   - Ch20: "Those are descriptions of the call structure. They don't decide which arguments belong together… Splitting the parentheses doesn't make those decisions for you."
   - Problem: Both use the same "Those are X. They don't Y." pair, ending on "don't make…", two chapters apart. That is the template echo the brief set out to break.
   - Ch20 also says the same thing twice in a row: "don't decide which arguments belong together" and then "doesn't make those decisions for you".
   - Fix direction for Ch20: cut "They don't decide…" and go straight from the definitions to "Splitting the parentheses doesn't decide which arguments belong together, or what work each call does." Or rephrase Ch18's last paragraph instead.

5. **The restored Eli line in Ch23 breaks a beat (`10-monads-light.md:196–200`).**
   - Eli is present: he runs this scene from :157 and speaks at :167 and :192, and the line is in his voice. It lands as a laugh.
   - Problem: It now sits between Dafna's "JavaScript calls it with a resolve function and a reject function" and Linoy's "And my method takes one function." Linoy's line depends on the "two functions" just before it, and that link now has to reach back over Eli.
   - Fix direction: move Eli's line to after Dafna's :210 ("Neither happened."), before Guy's :212. Or keep it where it is and have Linoy say "And my method takes only one of those."

6. **Ch16's new exchange contains a line that can be read backwards (`03-runtime-validation.md:71`).**
   - Quote: "No acknowledgement or a non-2xx response gets two retries."
   - Problem: "No acknowledgement … gets two retries" parses as a negation ("nothing gets retried"). It's also not how anyone speaks.
   - Fix direction: "If the carrier gets no acknowledgement, or a non-2xx, it retries twice." Oded's "And after those?" and Eden's reply then work as written.

### Minor

- **Ch23 Principle, `:5`.** "Ordinary means outside this particular container" is cryptic. Try "Ordinary means not another Result."
- **Ch19 Turn, `:254`.** "With a fresh allowance every day and every payout fitting one, no payout paid later under skip in that set." Here "in that set" repeats the conditions the clause has just stated, and the line is long for Gil. Use the brief's shorter form: "Fresh allowance every day, every payout fits one: no payout paid later under skip. Some paid earlier."
- **Ch19 Verdict, `:277`.** "Then agree on filling with support as a policy change" can be read as "filling *using* support". Suggest "agree the filling rule with support as a policy change". It also echoes :260's "with support, as a policy change" almost word for word.
- **Ch18 Principle, `:5`.** "That is what makes substitution useful." is lecture filler with a vague "That"; cut it. "We have to account for the whole operation" (:7) and Ch21's "has to account for its part of the trace" (:7) share an "account for" tic.
- **Ch18 Verdict, `:373`.** "only while its relevant inputs stay the same" is weaker than the brief's "whose inputs you have named". The Turn is exactly an input nobody named (the host time zone).
- **Ch15 Debate Continues, `:317`.** Eden's reply is now a six-sentence monologue plus a second paragraph. "This request has a checked positive count" has an unclear "This" after the link discussion. Splitting off the class-cost sentences or trimming would help. The content itself works: Noam's consumer is concrete, Eden answers with the parse-again point, and Oded's "I'll keep those tests with the draft conversion" matches Eden's decision.
- **Ch22, `:17`.** Dafna's line is now four sentences of org-chart for someone who already knows it. "Risk edits…" also reads first as the noun, not the team. Suggest "The risk team edits…". Eden's "Through the interface we both own" is a good jab and should stay.
- **Ch14, `:110`.** Guy's recall ("Here the store has to see it too") gets no reply from Dafna, and Guy warns her again at :159. That's tolerable, since she realizes at :161, but the warning comes twice.
- **Ch16, `:25–27`.** Cutting "The current known statuses don't need that third outcome" leaves `review` declared but unused in `refundForKnown`, with nothing saying why. One more comment clause would cover it.

### Verified OK

- The Ch15 fence comments match TS 7.0.2 exactly:
  - TS2322: "Type 'PageNumber' is not assignable to type 'PageCount'.", with the detail "Type '\"PageNumber\"' is not assignable to type '\"PageCount\"'."
  - TS2741: "Property 'checked' is missing…"
  - The harness now extracts those comments and asserts them against the compiler output.
- **Ch15 `:86`.** A cross-module `__brand: "UserId"` type is assignable to the original; I compiled it.
- **Ch14 `:267`.** It matches `tryHold`.
- **Ch23 Verdict.** "callable `then`" is accurate: `Promise.resolve({ then: 5 })` resolves with the object itself.
- **Ch21 Verdict.** The signal and the instance call match :299.
- **Ch21 `:353`.** Idan did build `safe` in Ch10.
- **Ch18 clock narration.** It's still readable: the fences show `realNow`, the replacement and the `finally` restore. "holding the clock fixed for each refresh" carries :225.
- **Ch15 link paragraph `:224`.** It now sets up `moveStart`, and the section ends on Noam's "I'd pay that…".
- **Ch20 Verdict.** It ends on Noam's spoken test line.
- **Ch17.** The catchphrase now stands alone, and Guy's "Then I'm choosing an interface" plays off it.
- **Pronouns.** They match the bios (Idan she; Sahar, Eden and Gilad he).

### Must-fix status

1. **Principles: partly resolved.** The six now sound like six different speakers:
   - Eli, Ch18: conversational thought experiment;
   - Sahar, Ch19: three sentences built on a removal question;
   - Daniel, Ch20: definitions;
   - Gilad, Ch21: on-call question;
   - Liron, Ch22: recipe parable;
   - Eli, Ch23: technical.

   Each keeps a testable first rule, and none spoils its Turn except the Ch21 hinting (item 3). The caller-first move and the "type can't tell" closer are gone or within the limits. Open: Ch23's ending (item 1), the shared Ch18/Ch20 closer (item 4) and Ch21's opener (item 3).
2. **Verdict rulings (Ch18, Ch20, Ch23): resolved.** One `>` line each, with nothing else changed. Ch18's wording is weaker than proposed (minor).
3. **Ch19 leftovers: resolved.** The fold is done, the Turn ends on Dafna's line, :277 and :9 are fixed, and the harness comment is updated in the worktree. "in that set" is minor.
4. **Ch14: resolved, with one new error.** The recall is moved and the smaller fixes are done, but the :66 bridge is false (item 2).
5. **Ch15: resolved.** The Debate Continues is balanced, the link paragraph moved, the diagnostics are now comments, :86 is tightened and the second label removed. Eden's reply is long (minor).
6. **Ch17 gloss: resolved.**
7. **Bookkeeping narration: resolved.** The Ch16 :71 wording needs a fix (item 6).

Also take: the Ch21 Verdict and :353 are resolved. The Ch23 Eli line is restored and Eli is in the scene, but its placement breaks the resolve/reject beat (item 5).
