# Full read: Bonus 2 draft 1 (`0c283ef`)

2026-11-02. A fresh isolated reader rebuilt the chapter's project state by state (seven snapshots plus an ownership-removal probe) on TS 7.0.2 / Zod 4.6.2 / Node 22.23.4, verified every claim, and reported as a reader. Saved verbatim.

## Full-reader report

**Setup.** I worked in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2r1/rebuild/`. The project tree is in `work/`, with `node_modules` **symlinked** to `/Users/elirazk/private/ts-book-worktrees/b2/node_modules`. I used tsc 7.0.2, Zod 4.6.2 and Node v22.23.4. Node ran the `.ts` files directly with `node replay.ts`, no flags and no warnings.

Snapshots, all in that same `rebuild/` directory:
- `00-initial`
- `01-generated`
- `02-no-default`
- `03-explicit-usd`
- `04a-currency-from-record`
- `04b-friend-call`
- `05-final`
- `06-probe-no-compare` (a probe I added that removes the ownership comparison)

I read only chapter.md and fetched zod.dev/json-schema once.

### 1. Where I had to guess
- **L70, the "book's strict ES2022/Node16 profile".** I wrote target ES2022, module and moduleResolution Node16, strict, noEmit, allowImportingTsExtensions and skipLibCheck, with include `*.ts`.
  - Everything is clean under that config. The final state is also clean under noUnusedLocals, noUnusedParameters, exactOptionalPropertyTypes, noUncheckedIndexedAccess and verbatimModuleSyntax.
  - **Caveat:** if the profile includes `noUnusedLocals`, the L165–179 replay fails: `replay.ts(4,19): TS6133 'friendCall' is declared but its value is never read` and `replay.ts(11,7): TS6133 'outgoing' ...`. After the L202 edit, `ownCall` becomes unused too.
- **L70, package.json.** I only knew `"type": "module"`; the name and other fields are mine.
- **L33–95, L111–179.** The multi-file blocks split cleanly on their `// file.ts` headers. No guess needed.
- **L202.** I swapped the inline call in for `ownCall` in the `dispatch(...)` argument. That leaves the `ownCall` import unused.
- **L230.** The page doesn't say where "trying to read `args.currency`" happens. I put it back in the `recordRefund(...)` call, which gave `(22,68)`.
- **L232.** I took "fresh ledger" to mean re-running the process.
- **L303 and L339, "the check".** This is never shown or defined. I don't know if it's a test file, a script or a mutation run.
- **L331–339, the two 600-cent requests.** No code is given, so I wrote my own on a fresh shop.
- **L181, "the client now sends `outgoing`".** `outgoing` is built and never used or printed, so the reader never sees it.

### 2. Claim verification
| Claim | Line | Status |
|---|---|---|
| The initial replay prints `[{"orderId":"o-12","cents":500,"currency":"USD"}]` | 97 | reproduced |
| The default generation's `required` is `["orderId","cents","currency"]`; with `io:"input"` it's `["orderId","cents"]` | 147 | reproduced (see note A) |
| "Zod documents the distinction: a default can make the output field required…" | 147 | **ambiguous / overclaim**: the docs' `io` section exists, but its example is a transform/pipe, and the page doesn't discuss `.default()` and `required` (per my fetch) |
| Generated replay gives `{"ok":true,"value":{…"USD"}}`, and "the ledger prints the same dollar entry" | 181 | reproduced |
| With no default: `{"ok":false,"error":"invalid arguments"}` and `[]` | 198 | reproduced |
| An explicit USD call brings back the dollar receipt | 202 | reproduced |
| TS2339 `Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.` | 230 | reproduced (exact text) |
| The original request records EUR on a fresh ledger | 232 | reproduced: `{"ok":true,"value":{"orderId":"o-12","cents":500,"currency":"EUR"}}` |
| `friendCall` gives `{"ok":true,"value":{"orderId":"o-17","cents":500,"currency":"USD"}}` | 234 | reproduced |
| `contract.ts`, the constructor, dispatcher and help tool are "unchanged" | 260 | reproduced: they compile untouched against the final shop |
| Final output is `true`, `order unavailable`, `0`, Bob USD success, Alice EUR success | 325 | reproduced, byte for byte |
| Removing the comparison means refunding Bob from Alice's session | 301 | reproduced (probe 06: Alice's tool refunds o-17 and the ledger shows 1) |
| Mutating `session.customerId` later doesn't retarget the tool | 305 | reproduced |
| Same description for Alice and Bob | 318, 327 | reproduced, though trivially, since it's the same `Refund` object |
| First 600 records; second is refused | 333 | reproduced: 600 EUR, then `amount exceeds remaining` |
| The tool doesn't accept a customer ID | 299 | reproduced: an extra `customerId` key gives `invalid arguments` (strictObject) |
| "Now nobody importing this module can call `recordRefund` directly" | 299 | **differs in emphasis**: `recordRefund` was never exposed. The initial `makeShop` returned `{ refund, receipts }`. What changed is that `refund` stopped being returned. |
| JSON Schema from a contextual refinement doesn't export the comparison | 355 | reproduced: `Refund.refine(...)` gives JSON Schema identical to `Refund` in input mode, and still rejects o-17 at runtime |

**Note A.** The L147 claim reproduces, but the page misses a better beat. In input mode, the generated schema advertises `"currency":{"default":"USD",...}`. So the generated description literally tells the assistant that dollars are the default. That makes Dafna's "Accurately." (L151) truer and funnier than the page realises.

**Note B.** In input mode a plain `z.object` drops `additionalProperties: false`, while the final `strictObject` keeps it. The page doesn't mention this, and it's fine that it doesn't.

**Note C.** After L218 switches to `strictObject`, the L202 explicit-USD call becomes `invalid arguments` (unknown key). The page never says what happened to that call. It's a free payoff it could use.

### 3. As a reader
- **Enjoyed:**
  - The cold open (L13–21). "No. We did something worse. We didn't convert it." is a great hook.
  - "There's your conversion department. One default." (L99)
  - "Congratulations to the descriptions." (L187)
  - "We've stopped recording the wrong currency by refusing the original request." (L200)
  - L339, where "an implementation that refuses every refund would look beautifully secure" is the right kind of wry.
  - The closing line (L367) lands as a callback to the ticket.
- **The scene I'd retell** is L234–240: "Bob's order." / "The currency is right." / "For Bob." It fixes one bug and shows the next one in three lines.
- **Got bored** in L107–141 and L153. This is the SDK-tutorial stretch:
  - The Envelope, invalid-JSON and unknown-tool branches are never exercised.
  - `refund_help` is registered but never called, and narration (L153) has to justify why it exists.
  - L109 explains `invoke` like API docs.
- **Got lost:**
  - L72: "The client sends this handwritten description." Which client? It also packs the wire format, two saved calls and the friend backstory into one paragraph.
  - L206: Liron's waiter/till metaphor needs re-reading.
  - L361: "Another type name won't approve it" is cryptic.
- **Voices** (names covered):
  - Gilad, the deadpan ops voice, and Dafna, the earnest builder, are distinct.
  - Guy is sharp, but at L256 he sounds like Liron.
  - Liron is thin. In L254, Liron, Guy (L256) and Gilad and Guy before them (L242–244) all restate "the order isn't authorization". That's three or four people saying one thing, and it reads like a lecture. Liron's real contribution is L301, which is good.
- **The Principle:** the first paragraph is clear and testable, and the chapter bears it out fully. The second paragraph's last idea, `refundIssued`, is never shown in code. It gets only the crammed L349, which depends on a transcript fact ("I've recorded your refund.") revealed only at the end. Seed that reply in the L72 setup.
- **The AI agent:** it's present only as saved artifacts plus the friend request, which is a nice touch. No real models or products are named or claimed. Good.
- **The ending** earns a closed verdict. This is a correctness and security rule, not an opinion, so a closed ending fits.
- **Caveats nobody would raise:**
  - L31: "These are already eligible orders; the shop permits…"
  - L305: the whole narrator paragraph.
  - L361: Guy's policy speech.
  - L70: the environment pinning, if that isn't book convention.

### 4. Ranked problems
1. **L29 spoils the reveal.** The narrator states the USD-default cause before the code and before Gilad's "One default" (L99). Cut the second sentence or move it after L99.
2. **L7 and L349: the `refundIssued` clause is under-earned.** There's no code, the transcript reply is a late reveal, and L349 crams three speakers into one paragraph, breaking the dialogue format.
3. **L242–256 are redundant.** The ownership point is said four times. Trim, and give Liron a distinct line.
4. **L147 overclaims the citation.** Zod's `io` docs don't (as fetched) say anything about defaults and `required`. Also, the page misses the `"default":"USD"` beat in the advertised schema (L149–151).
5. **L299 is misleading.** `recordRefund` was never exposed; the change is that `refund` is no longer returned.
6. **L303 and L339: "the check" is undefined,** and the 600-cent replay code isn't given.
7. **L107–141 and L153 drift into an SDK tutorial:** dispatcher branches that are never exercised, and a help tool justified by narration.
8. **L31, L305 and L361 are lawyerly caveat paragraphs.**
9. **L70's profile is ambiguous.** Under `noUnusedLocals`, the L165–179 replay fails with TS6133 on `friendCall` and `outgoing`, and on `ownCall` after L202.
10. **L72:** the "client" is ambiguous, `description.ts` is never visibly used, and the paragraph is dense.
11. **L202 and L218:** the fate of the explicit-USD call after `strictObject` is never shown. It's a free payoff.
12. **L361:** "Another type name won't approve it" is unclear.
