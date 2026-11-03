<!-- Fresh Opus reader, diff and benchmark recheck of PR D (2a9429d vs 1562054), 2026-11-03. -->

## PR D diff recheck report

Scope: old/ against new/ for Ch14–23. `book.diff` is complete: `diff -r` shows that only the ten Act III files changed, and new/book is byte-identical to the full-review worktree at 2a9429d. I ran each `checks/chapterNN.cjs` (14–23) directly with node, not npm, with TMPDIR set to probes/diff/harness. All ten pass on TS 7.0.2. The worktree is still clean. My probes are in `.../scratchpad/prd/probes/diff/` (`brand/`, `catch/`, `ch19-78125.cjs`). Line numbers below are in new/ unless marked old.

### NEEDS CHANGE

**1. The six late Principles share one template, which breaks Settlement 6 ("Their shapes and expert voices must remain distinct") and FIX-PLAN 1 (Codex's caution).**
- All six run about 120–128 words in two paragraphs (counted 120/125/125/128/126/124).
- Paragraph 1 states the rule, then ends on "the signature/type/spelling can't tell you":
  - Ch18:5 "Its signature alone cannot establish that."
  - Ch19:5 "Neither spelling tells me which decisions…"
  - Ch20:7 "Similar-looking function types aren't enough to establish…"
  - Ch21:5 "A function type can tell me which arguments fit. It won't show me…"
  - Ch23:7 "The container's name isn't the explanation"
- Paragraph 2 opens on "start from a caller":
  - Ch18:7 "I would try the substitution at a real caller."
  - Ch19:7 "Start with a caller whose answer matters."
  - Ch20:7 "Show me the caller that needs the intermediate function."
  - Ch21:7 "Start with a caller we have, and an outcome it has to handle."
  - Ch22:5 "That is the test I would start with."
  - Ch23:7 "Write the caller before choosing the chain."
- Paragraph 2 also tells the reader to "compare both versions": Ch18, 19, 20, 21.
- Ch20 nearly repeats Daniel's own Ch10 Principle. Ch10 (04-infer-keyword.md:7): "I'd start with a caller we already have. What does it know before the call, and what can it use afterward?" Ch20:7: "Show me the caller… What does it know when it obtains that function, and what can it supply later?"
- Each rule is testable and none spoils its Turn. Only the shape repeats, and read in order it sounds like one voice.
- **Fix direction:** keep the "caller-first" move in at most two chapters and the "type can't tell" closer in at most one. Give each expert his own move:
  - Daniel: a compiler or diagnostic framing. Old Ch20 closed on "Splitting the parentheses doesn't make those decisions for you", which gives nothing away.
  - Gilad: the 3 AM trace / "what happens when it doesn't".
  - Liron: an image (his code-as-data aside is already there; lean on it).
  - Eli (Ch23): type theory, the monad laws in plain words.
  - Sahar: removal ("what if we deleted the rewrite?").

**2. Ch14:23–25. The request-handler recall is misplaced, confused in context, and leaves Guy's request hanging.**
- The text: Dafna, "I still want the caller outside the request handler to see the refusal in its return type." Guy, "We argued about who catches the parser's failure. Here the store has to see it too. Show me where you catch it."
- Problem (a): Ch14 has no request handler with an outside caller. `bookParty`'s only caller is `submit`, "the page's `submit` handler" (:70). Dafna's line borrows Ch5's Verdict wording ("Callers outside Guy's handler get the result", 05-narrowing-strategies.md:442) into a role this scene doesn't have.
- Problem (b): Dafna states her goal a third time (:9, :23, :100). The :100 version is the motivated one.
- Problem (c): "Show me where you catch it" is followed by the `Failure`/`Tx`/`Store` fence, which has no catch. The catch first appears at :112–134, about 90 lines later.
- Problem (d): the plan puts the recall "at the first application `Result`" (PR-D-PLAN Ch14 ¶3). There, Guy's "the store has to see it too" would sit beside Dafna's catch. At :25 it comes before the reader has seen the transaction contract.
- The Ch5 facts are right: Guy and Dafna both argued whether the parser throws to the request handler (Ch5:193–217, 436). Only the placement and Dafna's wording are wrong.
- **Fix direction:** cut :23. Restore a one-line premise, or let Guy's question at :21 lead straight into the library fence. Move Guy's recall to sit just after :104/:112, e.g. after "The catch is next to `hold`…": "We argued about who catches the parser's failure. There the handler owned the response. Here the store has to see it too." Drop "Show me where you catch it," or put it immediately before the :116 fence.

### Minor
- **Ch15:86** "This symbol key belongs to its declaration…" repeats Noam's :84 "The key belongs to this declaration" one paragraph earlier. Suggested tightening: "Our `UserId` used a property called `__brand`; another module writing the same name and value shares it. This key can't be shared by spelling. Both are type-level markers. Neither checks a value." The claim itself is accurate (see OK).
- **Ch14:269** "Then I'll wrap `hold` to try it. Only its known refusal:" is clipped and unclear. The old text said it returns the known refusal and lets other errors escape. Something like "It returns the known refusal and lets anything else escape:".
- **Ch14:70** "Guy opens the current service function…" repeats :19 "Guy starts with `bookParty`".
- **Ch14:169** "Gil adds the committed-state check below the response check." ends the section on a stage direction (pre-existing; benchmark-protected). It bridges into the Turn, so this is a flag only.
- **Ch16:52 / :73** "Eden opens the endpoint:" and "Eden opens the rejected request body." sit 20 lines apart. The plan asked for an "Eden exchange"; :71 is a monologue. Facts are all kept: exactly two retries, durable write before 204, 500 on storage failure, malformed JSON rejected, and `append(parsed.data)` (:66) kept distinct from `append(body)` (:103).
- **Ch18:330** the fence comment "// Replaces the earlier factory; rebuild the exported entry point below." reads as an instruction to the reader. Suggest "// Replaces the earlier makeSla; the export below is rebuilt with it."
- **Ch21:343 Verdict** drops two of the plan's named elements: the cooperative signal (old: "The timeout supplies a signal; the client uses it.") and "called through its instance". Add a clause to Oded's line, e.g. "…two seconds each, the timeout's signal reaching the client…". Oded's line also restates Guy's :335 reconciliation sentence.
- **Ch21:353** Eli says "when we derived its signature", but Eli wasn't in the Ch10 courier scene (Daniel, Eden, Idan, Noam, Sahar). "When Idan derived its signature" or "when the team derived" would be safer. The technical content is right: Ch10's `Safe<C>` kept only the last overload, so `courier.retrieve("TRK-42")` stopped compiling.
- **Ch19 length:** words fall 26.7% (2890 → 2119) against a 20–25% target. Acceptable.
- **Ch19:264** Gil's boundary line is accurate. It might read better attached to his :256 result than after Dafna's policy line, but it works where it is.
- **Harness, not book:** `checks/chapter19.cjs:242` still comments "The prose gives an induction, not a claim that this finite set proves it." The induction is gone.

### Lost value

| Ch | Lost from old/ | Survives elsewhere? | Hurts? |
|---|---|---|---|
| 14 | "The booking team uses that contract; it doesn't maintain the library." | Dafna :53 | No |
| 14 | Recap of `instanceof`/identity/other thrown values | Gil :349 TypeError test | No |
| 17 | Guy's "Where's the interface? …" | Ch8 copy kept; Guy still presses at :248 | No (mandated) |
| 18 | Principle: "But an acceptable old answer is still an old answer." | Partly, in "name that difference" (:7) | Low |
| 19 | Liron's inductive argument; Liron now has 2 lines | No | Approved cut |
| 19 | Accumulation/starvation: "As long as those arrivals continue, P2 never gets paid."; thirteen payout-days for six days sooner; Dafna's "I don't want to call stopping the safe answer and hide those thirteen days."; Gil's laugh "Two is a test value, not something to leave in the code because it made this table look good."; Sahar's "We have one funding model to ship today." | No | Approved cut; no laughs lost outside it |
| 20 | Principle: "Splitting the parentheses doesn't make those decisions for you." | No | Low. Not a reveal; could return as Daniel's closer (also helps NEEDS CHANGE 1) |
| 21 | Principle: "…a failed job and a customer with three messages." | Cold open "Which copy?" (:15) | Low (mandated) |
| 21 | Verdict: signal used by client; called through instance | Code and Turn | Low (see Minor) |
| 22 | Principle: "JSON won't keep a JavaScript function." | Discovered by Eden :68–72 | No (was a reveal) |
| 23 | Principle: "The lovely complication is promises… No registration required. You can join a language protocol just by choosing a method name." | Not anywhere in Ch23 | Moderate for a benchmark. Removal from the Principle was mandated. Could move to Eli after Dafna :198/:210, but that needs the author's OK (benchmark rule) |
| 16 | Verdict: "Oded's branch… cannot compile at that handoff"; "the inbox retains what they leave out" | Noam :331; Eden's take :384 | No |

**Laugh count:** no chapter lost a laugh from a scene outside the mandated Principle removals and the approved Ch19 cut. Ch17 gains the river and Liron's catchphrase. Ch23 nets even: it gains "Simple made better." and loses "No registration required". Ch21 drops one Principle punchline, but its cold-open joke stays.

### Benchmarks, change by change (all named by the plan)
- **Ch14** (−4.4% words), all named:
  - :23/:50/:68/:84/:259–274 narration turned into dialogue;
  - `Tx`/`Store` contract comments (:42–48);
  - `testStore` serial-only comment (:189);
  - Result line (:104);
  - `never` duplicate cut;
  - Verdict ruling first (:375) and the "leaves" narration replaced;
  - strict-catch link/recap moved to a fence comment (:397).
  
  Weaker lines: :23–25 (NEEDS CHANGE 2) and :269 (Minor). The rest hold.
- **Ch15** (+2.7%), all named: brand line (:86), The Debate Continues with the transferable distinction (:310–312), "He leaves `requestFrom`" cut, Oded's closer (:322). The closer is accurate: `previewDraft` returns `[]`, `exportDraft` never calls `render`, and :98 is TS2322. :86 is a little repetitive. :333 is untouched.
- **Ch17** (+1.6%), all named: river exchange (:68–70), handbook link cut, Liron's "Complexity…" (:246), Guy's rewording (:248). None is weaker; the old Guy line was punchier but the change was mandated.
- **Ch23** (−2.5%), all named: Principle, the booking recognition (:624, a short sentence), "Simple made better." (:296), final link cut (ends on Dafna). Only the lost "lovely complication" wit is weaker.

### OK
- **Ch19 retained pieces are all present and coherent:**
  - reset model (:46, :61 "Unused allowance expires.");
  - P1–P4 three-day table (:240–246);
  - Gil's "In this queue." (:250);
  - the 78,125 description with its real assumptions (:254);
  - Dafna's policy change (:258–262) and Sahar's naming concession (:270). Sahar first named `planPayouts` at :206, so Dafna's :230 adoption is consistent;
  - `folded`, `looped`, `split`;
  - `Batch` vs `Plan` (:277), "stopping three ways" (:285);
  - the narrowing take (:289–320).
- **No leftover proof language** ("prove", "always", "every queue") in Ch19. A grep of all new/book for fillThenReserve, WaitingPayout, starv, accumulat, reserv, deposit, finance, thirteen, payout and treasury finds nothing outside Ch19 except unrelated "preserve"/"reserves seats" matches.
- **The 78,125 claim reproduces.** My own simulation (`probes/diff/ch19-78125.cjs`) gives 78,125 cases, 0 IDs paid later under skip, and 44,656 cases with at least one ID paid earlier. The harness asserts the same.
- **The boundary at :264 is accurate.** Both experiments use a fresh allowance (1,000; 500) with every payout fitting it (≤900; ≤500), and it echoes Chen's carry-over question at :59.
- **Ch15 brand claim compiled (`probes/diff/brand`):**
  - two modules that each declare `pageKind: unique symbol` do not share the brand (TS2322 both ways);
  - two modules writing `__brand: "UserId"` are mutually assignable;
  - at runtime the values are plain `number`/`string`.
  - Both are intersection-type markers and neither checks a value. Ch3:434's `UserId = string & { readonly __brand: "UserId" }` matches.
- **Ch14 catch comment** confirmed: an unannotated catch binding is `unknown` under strict (TS18046 on `.failure`).
- **Ch14 Result contrast** is accurate: Ch10's courier `Result<T>` has `error: unknown` from `safe`.
- **Ch23's `Result<T, E>`** is identical to Ch14's (:107–109).
- **Ch21's lost-overload callback** matches Ch10:73 (`Expected 2 arguments`) and :124–131.
- **Ch18 state is all rebuildable:**
  - Jerusalem hours and exclusions (comments :34–37);
  - fresh caches (:143, :190, :223);
  - `Date.now` restored in `finally` (:76, :155);
  - the three-process TZ table (:276–286);
  - the direct-call qualification (:55) and the callback-arrow correction (:206–208).
  
  The `withTtl`/`memoizeBy` comments match the harness implementations.
- **Ch16 state:** both concessions (:229, :296), Idan's working open type, the owner objection (:369) and Eden's decision (:371) are kept. The refuted :108 and :132 (old :104/:128) are unchanged.
- **Refuted passages are untouched:** Ch15:333 and Ch20:276.
- **Verdict rulings** come first in Ch14, 16, 19, 21 and 22, in the blockquote style used across Acts II–III. Ch22 keeps its Verdict.
- **Catchphrases outside the bios:**
  - "Complexity is a choice, not a necessity." once (Ch17:246, Liron);
  - "Simple made better." once (Ch23:296, Sahar);
  - "Where's the interface?" once (Ch8 02-mapped-types.md:71);
  - the Act I–II phrases stay at one each (Eli, Daniel, Gilad, Noam, Oded, Linoy, Chen, Dafna, Dima, Idan).
- **Cast:** every added line has the right speaker, and those characters are present in their chapters. No new pronouns were added; the existing ones match the bios. Links are gone from dialogue, and Ch15:245 keeps its one substantive citation.
