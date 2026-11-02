# Targeted recheck: Bonus 2 draft 2 (`5cd7196`)

2026-11-02. A fresh isolated reader rebuilt the project state by state (eight snapshots) on TS 7.0.2 / Zod 4.6.2 / Node 22.23.4, verified every claim, scored review 1's six problems and ranked what remains. Saved verbatim.

## Recheck report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2r2/chapter.md` and fetched zod.dev/json-schema once. I rebuilt the project with TypeScript 7.0.2, Zod 4.6.2 and Node v22.23.4. The working tree is `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2r2/rebuild/work`, and the snapshots s1 to s8 sit next to it in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2r2/rebuild/`.

**Short version:** every runnable claim reproduces. The structural fixes have landed: there is now a Turn section, the hook is no longer spoiled, the help tool is gone and the parable is gone. The biggest new problem is at line 299. Gilad says he'll remove the ownership check "in the replay test. Briefly." The replay that follows never does it. The Principle also still claims more than the page shows about "the record current at execution."

### 1. Rebuild and guesses

Snapshots:
- s1: initial code
- s2: `defineTool`/`dispatch` added, `description.ts` removed
- s3: no default on currency
- s4: explicit-USD call
- s5: strict schema with currency taken from the order
- s6: `friendCall`
- s7: final `shop.ts` and replay
- s8: outcome lines appended

Each state compiles with exit 0 under my guessed tsconfig. They also stay clean with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and `erasableSyntaxOnly` added. Node 22.23.4 runs the `.ts` files with no flag.

Places I had to guess:
- **L70, the "book's strict ES2022/Node16 profile":** I used target ES2022, module/moduleResolution Node16, strict, noEmit and allowImportingTsExtensions. The page doesn't say whether `noUnusedLocals` is in the profile, and it matters:
  - s2–s6: `friendCall` is imported but unused (L165), and so are `outgoing` and `tools` (L171–172).
  - s4: `ownCall` is unused once the dispatch site is replaced.
  - s7: `z` and `friendReply` are unused until the append.
  - All of these fail with TS6133 if that flag is on. Only s8 is clean under it.
- **L33–67:** two files in one block. I split them at the `// shop.ts` comment.
- **L198, "at the dispatch site":** I changed only the argument and left the `ownCall` import in place.
- **L228:** the page doesn't say where to read `args.currency`. I put it in the `recordRefund(...)` call and got (22,68) in my layout. The chapter gives no position, so there was nothing to compare.
- **L256, "The contract, constructor and replay dispatcher stay unchanged":** I couldn't tell what "constructor" means. `makeShop` is the thing being replaced, so I read it as `defineTool` and kept all of `tool.ts`.
- **L177:** "the client now sends `outgoing`" has no code. `outgoing` is computed and never used.
- **package.json:** only `"type":"module"`.

### 2. Claims

| Line | Claim | Status |
|---|---|---|
| 108 | Initial replay prints `[{"orderId":"o-12","cents":500,"currency":"USD"}]` | reproduced |
| 155 | Default `required` is `["orderId","cents","currency"]`; with `io:"input"` it is `["orderId","cents"]` | reproduced |
| 159 | Description advertises `"default":"USD"` | reproduced (input mode includes `default:"USD"` on currency) |
| 155 | Zod citation | see note below |
| 177 | Result `{"ok":true,...,"currency":"USD"}`; "same dollar entry" | reproduced |
| 194 | `{"ok":false,"error":"invalid arguments"}` and `[]` | reproduced |
| 198 | Explicit-USD call brings the dollar receipt back | reproduced |
| 212 | "Store and recording function stay as they were" | reproduced (true) |
| 228 | TS2339 `Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.` | reproduced (code and text; no position given) |
| 230 | Explicit USD against the strict schema gives invalid arguments and an empty ledger | reproduced |
| 230 | `ownCall` records EUR | reproduced |
| 232 | `friendCall` gives `{"ok":true,"value":{"orderId":"o-17","cents":500,"currency":"USD"}}` | reproduced |
| 256 | "contract, constructor and replay dispatcher unchanged" | ambiguous ("constructor"); `tool.ts` works unchanged |
| 295 | "The old `refund` entry point is gone" | reproduced (the old replay fails with TS2339 `Property 'refund' does not exist`) |
| 320 | `true`, then `order unavailable`, then `0`, then Bob's USD receipt, then Alice's EUR receipt | reproduced |
| 322 | "Same description. Same arguments." | reproduced |
| 339 | `{"refundIssued":true}` then `{"refundIssued":false}` | reproduced |
| 297 | "Remove it and you're back to refunding Bob from Alice's session" | ambiguous: not run in the final code, though L232 effectively showed it earlier |
| 351 | "checks its current owner and remaining balance" | ambiguous: the remaining-balance branch (L286) is never exercised, and nothing shows "current" (no record changes between proposal and execution) |
| 355 | Alice's tool in Bob's registry acts for Alice | true by construction; not run |

Extra observation: `R` infers as `Receipt` through `defineTool` even though the final `shop.ts` doesn't import `Result`.

**Zod citation (L155).** The page has an `io` heading. It says the default is the output type, and it names `ZodDefault` among the types whose input and output differ. It does not explain what the difference is for defaults, and it has no `required` examples in that section. So "including their difference for ZodDefault" still slightly overstates the docs. Something like "naming `ZodDefault` among the types whose input and output differ" would be exact. The second half of the sentence ("these lists are what this schema produces") correctly takes the claim back to the rebuild. The page's own link form is `?id=io#io`; `#io` probably works.

### 3. Previous problems

- **P1 (no Turn section): fixed.** "## The Turn" is at L200, and the pivot sits there: Liron's question (L204–208), currency taken from the order, then Bob's order (L232–252). Small nit: Liron asks nearly the same question twice in three lines (L204, L208), and L208 repeats the section heading.
- **P2 (spoiled hook, manual-like narration): mostly fixed.**
  - The narrator no longer names the cause. L29 gives only EUR, the code shows `.default("USD")`, and Gilad finds it at L110 ("One default."). That works.
  - Some narration still reads like a manual:
    - L31 "No payment provider is involved" is a caveat nobody raised.
    - L70 is the tooling paragraph.
    - L72 explains the wire format. It also says "the handwritten tool description below", but that block is 12 lines and a dialogue away.
    - L155 is the docs paragraph.
    - L230 packs three runs into one lab-notebook paragraph.
  - L359 "No promise about a payment arriving" repeats the caveat from L31 in dialogue.
- **P3 (SDK-tutorial stretch): mostly fixed.**
  - The help tool and the dead dispatcher branches are gone, and `Envelope` only accepts `refund_order`.
  - Leftovers:
    - L122 "For this replay, she keeps only the refund tool" points at tools the reader never sees. It's a fossil of the removed help tool and made me wonder what I'd missed.
    - L171–172: `tools = [refund]` and `outgoing` are computed but never used or printed.
    - The "amount exceeds remaining" branch appears three times (L63, L223, L286) and never fires.
- **P4 (ownership point restated, thin Liron, parable): mostly fixed.**
  - The parable is gone.
  - The ownership beats now progress instead of repeating:
    - Gilad: "not one of our permissions" (L240)
    - Guy: "who's allowed?" (L242)
    - Guy: "whose answer?" (L246)
    - Liron: "shouldn't get to become Bob" (L252)
    - Liron: closure versus comparison (L297)
    - Liron: the registry (L355)
  - Liron's lines are now good and carry the title idea. But Liron says nothing at all in the Debate (L11–198) and first speaks at L204. Liron has only six lines and still works mostly as the one who asks questions.
- **P5 (`refundIssued` unearned, list-like Verdict): partly fixed.**
  - `refundIssued` is now earned (L326–343): the parsed `true` sits next to the real `false`.
  - Small ambiguity: where `friendReply` came from. L80 calls it "its structured outcome", and only L357 makes clear it was the assistant's reply.
  - The Verdict (L347–359) has a framing question now, but it still reads as one line per person about what to keep: "stays", "I'll keep", "Keep ... too", "And the outcome", then the caveat.
- **P6 (claims): mostly fixed.**
  - The `recordRefund` overclaim is replaced by an accurate L295.
  - "The check" is now defined as "that comparison" at L297.
  - The Zod citation is nearly exact (see section 2).
  - Still asserted without being run: L297, the L299 promise (below), and L351's "current ... remaining balance".

### 4. Reader view

**Enjoyed:**
- The opening: "We did something worse. We didn't convert it." (L21)
- "There's your conversion department." (L110)
- The generated-description beat: "We've documented the dollars." / "Congratulations to the descriptions." (L159–183). This is the scene I'd retell. The tooling dutifully advertises the bug more accurately.
- "Whose answer would that be?" / "She stops typing." (L246–248) is the best beat in the ownership argument.
- The closing joke at L377 lands.

**Bored:** the tooling paragraphs at L70–72, the docs paragraph at L155, and the three-run paragraph at L230.

**Lost:**
- L122: "only the refund tool"? What other tools?
- L256: which "constructor"?
- L299–301: Gilad promises to remove the check "Briefly". I read the replay looking for the removal, and it isn't there.

**Voices.** With the names covered:
- Dafna is clearly the builder.
- Liron is the Socratic questioner (L252 and L355 are distinctive).
- Gilad and Guy both deliver dry one-liners and sometimes blur. L206 (Guy) and L240 (Gilad) could be swapped. Gilad has the better jokes; Guy's "For Bob." and "Finally." are his own.

**Principle.** The page bears out most of it:
- Currency comes from the order.
- An argument-supplied ID isn't authentication (argued in dialogue).
- The generated description doesn't carry the comparison.
- `refundIssued` is shown.

It does not bear out "Use the record current at execution" or "An earlier successful parse isn't permission forever" (L5). Parse and execute happen in the same `invoke`, and no record ever changes between them. The refinement sentence is only argued, in Additional Takes (L363–365).

**Agent presence.** It comes through the saved transcripts (L25–27, L76–78), the confident wrong replies, and Liron's "become Bob" line. There are no claims about real models or products. It's a light presence: everything is replay.

**SDK tutorial?** Mostly not any more. L122 and L171–172 are the remaining tutorial residue.

**Ending.** It mostly earns the verdict. One plausibility gap: the saved reply says Bob's o-17 was actually refunded from Alice's session under the old code (L326). Then "Close the dollar ticket with the ledger correction" (L373) ignores that live wrongful refund.

**New problems the revision introduced:** the unkept "Briefly" promise (L299), the "only the refund tool" fossil (L122), the duplicated Liron question (L204/L208), and the unused-import states, which matter only if the profile includes `noUnusedLocals`.

### 5. Remaining problems, most important first

1. **L299–301:** Gilad promises to remove the ownership comparison "in the replay test. Briefly." The replay never does it, and L297's outcome is asserted rather than run. Either show the removed comparison refunding Bob (two lines), or cut L299.
2. **L5 vs the page:** "Use the record current at execution" and "An earlier successful parse isn't permission forever" are never demonstrated, and L351's "current owner and remaining balance" depends on them. Either show one case where the record changes after parse (for example `remaining` exhausted by Alice's own earlier refund, which would also exercise the dead L286 branch), or trim the Principle.
3. **L347–359:** the Verdict is still a who-keeps-what round, and L359 repeats the L31 caveat. Merging it into two or three lines that answer Guy's question would read as a conclusion.
4. **L11–198:** Liron is absent from the whole Debate, and L204/L208 ask the same question twice.
5. **Narration that reads like a manual:** L31 ("No payment provider is involved"), L72 ("description below" sits far from its block), L230 (three runs in one paragraph).
6. **L122 and L171–172:** "only the refund tool" and the unused `tools`/`outgoing` are vestiges of the old tutorial.
7. **L155:** "including their difference for ZodDefault" slightly overstates the docs, which only name `ZodDefault` as having different input and output types.
8. **L256:** "constructor" is ambiguous.
9. **L326/L373:** the wrongful o-17 refund recorded by the old code is never dealt with.
10. **L70:** if the book's profile has `noUnusedLocals`, the intermediate states fail with TS6133: `friendCall` in s2–s5; `tools` and `outgoing` in s2–s6; `ownCall` in s4; `z` and `friendReply` in s7.
