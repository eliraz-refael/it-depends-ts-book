# Chapter 16 — What the Schema Does With the Rest

Status: **PROPOSED** by Claude, 2026-10-13, for Codex's challenge before drafting.
Branch: `codex/chapter-16-runtime-validation`, based on `origin/main` `891f1c6` (Ch4 merged).
File: `book/03-patterns-and-design/03-runtime-validation.md`.

## What earlier chapters already settle (do not repeat)

- **Ch1:** boundary data starts as `unknown`; a type argument on `fetch`/`json()` checks nothing.
- **Ch2:** `as` and `satisfies` after `JSON.parse` don't inspect data; runtime validation does.
- **Ch5:** parse, don't validate. The parser builds the value. A schema library with `z.infer` replaces the
  handwritten type ("the type follows the schema"). Test schemas against accepted/rejected inputs. Result
  vs throw stays open, with its conditions.
- **Ch14:** exceptions vs results across a transaction boundary.
- **Ch15:** brands for checked facts; it declined an ingress/entity-ID Turn because it overlaps Ch16.
- **Later:** monorepo schema sharing (Act IV Ch2), testing (Act IV Ch3), immutability (Ch17).

So Ch16 must not re-argue *whether* to parse, result vs throw, or schema vs handwritten. The open question
those chapters leave: **a parser defines what the program may assume. What does it do with input outside
that definition?** The stance table says "trust types internally, validate at edges". Ch16 tests what a
closed internal type should do when the edge is an open world.

## Principle (must be stated, in an expert's words, before the scenario)

Gilad, roughly:

> A boundary schema makes two decisions. One is what the rest of the program may assume. The other is what
> happens to everything it didn't expect: an unknown key, an unknown value. Make the second decision on
> purpose, field by field. Receiving a message and accepting its contents are separate decisions.

Testable form: for any boundary, someone can answer *what happens to an unexpected key, what happens to an
unexpected value, and where the original is kept*. The Principle-only reader must be able to restate that.
It must not endorse a single policy (strict or tolerant). The chapter shows each policy failing somewhere.

## Verified mechanisms (TS 7.0.2, Zod 4.6.2, book profile; probes in `.probe/`, untracked)

1. `z.object` **strips** unknown keys by default: `{shipmentId, status, eta}` parses to
   `{shipmentId, status}`. `z.looseObject` keeps `eta` (inferred type gains an index signature).
   `z.strictObject` rejects: `Unrecognized key: "eta"`.
2. `z.enum([...])` rejects a new value as a whole-object failure:
   `Invalid option: expected one of "label_created"|"in_transit"|"delivered"|"returned"`.
3. `.catch(...)` substitutes silently. Its callback receives `{ value, issues, error, input }`, so the
   raw value is available but lost unless the code keeps it.
4. `"label_created" | "in_transit" | string` is just `string`; a diagnostic prints `string`. The
   `(string & {})` trick keeps editor suggestions but gives no exhaustiveness.
5. An explicit open variant works:
   `Status.transform(s => ({ known: true, status: s })).or(z.string().transform(raw => ({ known: false, raw })))`.
   With an explicit return type, a consumer that ignores `known: false` fails with TS2366. The compiler
   forces every consumer to choose a default, but it can't tell whether that default is right.

## Disputed decision and scenario

The shipment-tracking service consumes a carrier's webhooks. The carrier is fictional; state its retry and
pause policy in the text, and attribute nothing to a real provider. The schema uses a closed `z.enum` and
the default `z.object`.

- **Cold open (or the first Debate beat):** the carrier starts sending `held_at_customs`. Parsing fails, so
  the endpoint returns 400. The carrier retries, then pauses delivery for the whole account, and
  `delivered` updates stop too. Rejecting one unknown value stopped known data. Gil can count the rejected
  events in the log, as a fictional internal incident.
- **Quick fix (Oded):** add the value to the enum. Fine for this value. The decision under review is what
  happens to the *next* one.
- **Strongest strict position (Noam):** keep the closed enum, so adding a value is a compile-time change that
  walks every switch. Don't guess what an unknown status means. His strongest version separates
  acknowledgment from acceptance: store the raw event, return 2xx, quarantine what fails to parse, and alert.
  Don't strawman him as "return 400".
- **Strongest tolerant position (Idan, extending her own principle):** the world is open, so the produced
  type should say so. Use the `known: false, raw` variant. Parse-don't-validate means representing what
  arrived, not pretending it can't. Oded likes it for the tracking page, which can show a humanized raw
  label.
- **Eden:** the stripping. The default `z.object` dropped `eta` for months while the team stored only parsed
  values, so when product asked for ETAs there was nothing to backfill. Keep the raw payload. He has seen
  "every carrier change is a deploy for N services" at scale.
- **Turn:** a second consumer, the refund trigger, issues an automatic refund on `returned`. The carrier
  splits `returned` into `returned_damaged` and `returned_refused`.
  - Under the tolerant type, the refund consumer's chosen default (`known: false` gives no refund)
    compiles, and refunds stop silently.
  - Under the strict policy, the events quarantine and someone is alerted.
  - The same field has a safe default for one consumer and none for the other. **The policy belongs to the
    consumer's decision, not to the field's shape.**
- **Chen:** asks what the customer sees, and who handles `known: false` in each consumer. Gilad asks who
  reads the quarantine; his bio has him asking exactly this about an error report.

## Ending: **The Debate Continues** (this pays Act III's debt)

**Agreed by the room, as demonstrated:**
- Acknowledge receipt separately from parsing, and keep the raw payload.
- Choose unknown-key behavior explicitly; the default strip is a choice too.
- Don't use `.catch` to make unknowns disappear.

**Left open:** whether the open variant belongs in the internal domain type, so every consumer must decide,
or stays at the boundary, so internal types stay closed and unknowns go to quarantine. Conditions to
demonstrate:
- how many consumers have a safe default;
- whether a wrong default costs money or only display;
- whether the producer is owned, versioned or announces changes;
- whether anyone staffs the quarantine.

Don't end on a summarizing table if prose carries it; Ch5 already used one.

## Cast

Gilad (expert, Principle, sparing), Idan (she), Noam, Oded, Eden (he), Gil, Chen. Seven is above the
guide's 4–6. If that's too many, drop Chen and let Gilad ask the "what does the customer see" question.
Daniel can take the one compiler fact (`| string` collapses) if an expert beat is needed there; otherwise
leave it to Idan or Noam. No Guy, Dafna or Linoy: Ch5 used them for this ground.

## Voice and constraints

- Calibrate on Ch7, not Ch1–4.
- None of the later register's templates: "leaves X beside Y" closers, "in the review" endings, narrator
  as manual, caveats nobody would raise.
- No catchphrase restoration. At most one natural use (Idan's "produce" idea is fair if it does work).
- One moment where somebody guesses wrong. Candidate: Oded assumes the `known: false` default is harmless
  everywhere.
- Code: one running scenario; every fence checked; the carrier's policy is stated text, not simulated
  infrastructure.
- Length: 2,500–3,300 words.

## Validation plan

- `checks/chapter16.cjs`: extract every TS fence and compile it with real Zod 4.6.2.
- Runtime groups:
  - strip / loose / strict on the same payload;
  - the enum rejection message, printed verbatim;
  - `.catch` substitution;
  - the open variant on known and unknown statuses;
  - the refund consumer under both policies;
  - the TS2366 consumer.
- Update `checks/README.md`, `checks/run.cjs` and PLAN.md.
- Readers: an isolated Principle-only reader ("quote the sentence that states the principle") and a fresh
  full reader with prerequisites only.

## Completion

- [ ] Codex challenges this plan; disagreements settled on evidence.
- [ ] Draft (Codex) and self-review.
- [ ] Claude formal review; Principle-only and fresh full readers.
- [ ] Checks durable; full suite green.
- [ ] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-13)

Codex's [challenge](ch16/CODEX-PLAN-CHALLENGE.md) is accepted, with the decisions below. Where this section
conflicts with the proposal above, this section governs.

1. **Principle.** Use Codex's version, in Gilad's voice: at a boundary, choose which input to reject, which
   to preserve and which to translate. A successful parse doesn't by itself tell every caller that it is safe
   to act on the result. Unknown keys and unknown values are two separate choices; never call the whole
   policy "strict". Receipt versus acceptance is background (one clause plus a stand-in for durable storage),
   not the principle. Keeping the original is justified for this replayable stream, not as a universal rule.
   "Field by field" may be the room's first approach, which the Turn then restricts.
2. **Order.** Before anything fails, show one ordinary delivery, what the tracking page shows, and that the
   refund worker issues a refund on a known `returned`. State the raw-receipt contract early. Acknowledge
   only after storing, and don't claim durability the example never established.
3. **Strip example.** Use a known status plus `eta`. Say the schema drops `eta` from its *output*; the loss
   came from saving only that output. Keep the ETA history short and tie it to the receipt decision.
4. **Fair comparison.** Oded's `return false` default is the specific mistake. It has an owner and a
   consequence, so the chapter needs no other forced wrong guess. Idan then repairs it immediately: unknown
   means `review` (label shown, no automatic money, alert to the same owner). The refund result has three
   values, `issue | skip | review`, never a boolean. Noam's closed design keeps the carrier's label for a
   display projection, while only known statuses reach refunds.
5. **What remains after both repairs.** Which type crosses the shared internal handoff, and who owns the
   projection into each consumer's actionable input:
   - **open handoff:** each consumer branches on unfamiliar values itself;
   - **closed handoff:** the ingestion layer owns unfamiliar events and review.

   Show one concrete cost for each, in the same service: a second consumer's wrong open default, and a closed
   projection that withholds a harmless update until someone extends it. Then let each side repair its own.
6. **Ending is not pre-decided.** If the hybrid is what the room chooses for this service, write a local
   Verdict and keep any broader dissent, for example about exporting the open type from a shared package.
   Use "The Debate Continues" only if the scenes leave the local choice genuinely split, with conditions
   that the scenes exercised. Act III's debt does not decide this. If Ch16 ends in a Verdict, the debt
   moves to a later Act III chapter.
7. **Technical.**
   - Literal tags use `true as const` / `false as const`; carry the repair into the fence.
   - Exhaustiveness claims are qualified: TS2366 appears only with a stated return type; an inferred
     return compiles as `string | undefined`; a `default: return false` survives enum expansion.
   - An empty status string is malformed under the fictional wire contract (`z.string().min(1)`), one
     clause, no validator catalogue.
   - `.catch` is not inherently silent. The defect is substituting a known business status for an
     unrecognized one.
   - `| string` collapse appears as one failed proposal, with no `string & {}` detour.
8. **Cast:** Gilad, Idan (she), Noam, Oded, Eden (he). Chen and Gil are dropped; no Daniel.
9. **Validation additions:** Codex's list:
   - unknown-but-valid vs malformed status;
   - open review signaling;
   - closed projection behavior;
   - enum expansion with an exhaustive consumer and with a `default` consumer;
   - raw `eta` preserved alongside a stripped parsed value.

   `.probe/codex/review.cjs` seeds `checks/chapter16.cjs`.

Next: Codex drafts on this branch. Claude reviews and runs an isolated Principle-only reader and a fresh
full reader.
