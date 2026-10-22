# Chapter 19: Who Goes Next?

## The Principle

**Sahar Firstclass**: "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing. Before replacing a loop, though, check what one item changes for the next, where processing stops, and what must happen in order. Keep those rules visible in the rewrite, and check that the types still follow each stage. A callback returning doesn't necessarily stop the operation that called it."

## The Debate

**Dafna Functor**: "Three eligibility checks and a running total in one loop. I wanted to test the eligibility rules without arranging a treasury balance."

Dafna has opened the refactor that went out yesterday. The payouts team is reviewing its daily batch planner. It selects payments for another service to submit; it doesn't move money itself. The input queue is oldest first. Ready payouts in the account's currency, at or above the minimum, must be released in that order. Held payouts don't reserve a place. Each day's allowance resets, and any eligible payout fits a fresh day's allowance. Larger requests take a separate path.

Gil has a support reply open: *“Eligible payouts are released in queue order. Newer eligible payouts won't go ahead of yours.”* The payouts team supplied that wording for the runbook.

**Gil Benchmark**: "Keep the released IDs in the test. The sum isn't the whole answer."

```typescript
type PayoutFields = { id: string; amount: number; currency: string };
type Ready = PayoutFields & {
  status: "ready";
  account: { iban: string };
};
type Held = PayoutFields & { status: "held"; reason: string };
type Payout = Ready | Held;
type Plan = { released: Ready[]; total: number };

function original(queue: readonly Payout[], allowance: number): Plan {
  const released: Ready[] = [];
  let total = 0;
  for (const payout of queue) {
    if (payout.status !== "ready") continue;
    if (payout.currency !== "USD") continue;
    if (payout.amount < 100) continue;
    if (total + payout.amount > allowance) break;
    released.push(payout);
    total += payout.amount;
  }
  return { released, total };
}
```

Amounts are integer minor units. The account in these examples uses USD, with a minimum of 100. A small fixture builds ready payouts in that currency:

```typescript
const ready = (id: string, amount: number): Ready => ({
  id, amount, currency: "USD", status: "ready",
  account: { iban: "test-account" },
});
const ordinary = [ready("A", 400), ready("B", 500)];
const batch = original(ordinary, 1_000);
console.log(batch.released.map(p => p.id).join(",")); // A,B
console.log(batch.total); // 900
```

**Chen Override**: "Does unused allowance carry over?"

**Gil**: "It expires tonight. Finance has a proposal to deposit a smaller amount each day and let the balance accumulate. That hasn't been approved. These tests use the current reset."

Dafna scrolls to the eligibility stages in her refactor.

```typescript
const isReady = (payout: Payout) => payout.status === "ready";

function eligible(queue: readonly Payout[]): Ready[] {
  return queue
    .filter(isReady)
    .filter(payout => payout.currency === "USD")
    .filter(payout => payout.amount >= 100);
}

const destinations = eligible(ordinary).map(p => p.account.iban);
```

**Dafna**: "The first filter gives us `Ready[]`. No assertion, no predicate annotation to keep in sync. I can test these rules without running the allowance calculation."

**Chen**: "You're declaring the return type on `eligible`. Is that doing the narrowing?"

**Dafna**: "Remove it. The result is still `Ready[]`. TypeScript infers a predicate for `isReady` from the status check. The held member doesn't have `account`, and it doesn't reach that last `map`."

**Gil**: "The currency fixture and the held fixture both pass. Keep those stages. What did you do with the allowance?"

```typescript
function skipping(queue: readonly Payout[], allowance: number): Plan {
  const released: Ready[] = [];
  const total = eligible(queue).reduce((spent, payout) => {
    if (spent + payout.amount > allowance) return spent;
    released.push(payout);
    return spent + payout.amount;
  }, 0);
  return { released, total };
}
```

**Dafna**: "The accumulator is the amount spent. If a payout doesn't fit, keep the amount we already had. The array is new for each call, so pushing here doesn't change the input or anybody else's batch."

**Gil**: "A and B still pass. So does P1 followed by P2. Here's the rest of the queue from the support ticket."

```typescript
const queue = [
  ready("P1", 400), ready("P2", 900),
  ready("P3", 200), ready("P4", 300),
];
for (const planner of [original, skipping]) {
  const result = planner(queue, 1_000);
  console.log(result.released.map(p => p.id).join(","), result.total);
}
// P1 400
// P1,P3,P4 900
```

**Chen**: "P2 doesn't fit in either. Why do the next two go out in yours?"

**Dafna**: "Because returning `spent` only finishes this callback. The next callback gets 400 and P3. I translated the total, but lost the stop."

**Gil**: "The seller with P2 was told nothing newer would go ahead. P3 and P4 did. That's the ticket. No exception, and both totals are below a thousand."

**Dafna**: "Then the state needs to say the batch is closed. Right now 400 means both 'we can still add something' and 'we've hit P2'."

**Chen**: "Can that answer tell support which payout stopped the batch?"

**Dafna**: "Yes. I'll return that with the plan."

She replaces the skipping fold. The eligibility stages stay.

```typescript
type Stop = { kind: "end" } | { kind: "limit"; id: string };
type Batch = Plan & { stop: Stop };
type State =
  | { kind: "open"; total: number }
  | { kind: "closed"; total: number; id: string };

function folded(queue: readonly Payout[], allowance: number): Batch {
  const released: Ready[] = [];
  const state = eligible(queue).reduce<State>((state, payout) => {
    if (state.kind === "closed") return state;
    if (state.total + payout.amount > allowance) {
      return { kind: "closed", total: state.total, id: payout.id };
    }
    released.push(payout);
    return { kind: "open", total: state.total + payout.amount };
  }, { kind: "open", total: 0 });
  return {
    released,
    total: state.total,
    stop: state.kind === "closed"
      ? { kind: "limit", id: state.id }
      : { kind: "end" },
  };
}
```

**Gil**: "P1, total 400, stopped at P2. That agrees with the old batch. Four reducer calls, though."

**Dafna**: "Only two allowance checks. P3 and P4 return the closed state immediately."

**Gil**: "Agreed. I'm counting calls, not claiming four expensive calculations. The original loop only reached two payouts."

**Sahar**: "You can return the reason from the loop too. You already have its ID when it fails."

Dafna keeps `Batch` and rewrites the part after eligibility:

```typescript
function looped(queue: readonly Payout[], allowance: number): Batch {
  const released: Ready[] = [];
  let total = 0;
  for (const payout of eligible(queue)) {
    if (total + payout.amount > allowance) {
      return { released, total, stop: { kind: "limit", id: payout.id } };
    }
    released.push(payout);
    total += payout.amount;
  }
  return { released, total, stop: { kind: "end" } };
}
```

**Dafna**: "I could also use `some`. Return `true` when we hit the limit and it actually stops. But then I'd have the running total and the released array outside its callback, plus the reason to return. I'd use this loop before that."

**Liron Closure**: "What's the caller asking for?"

**Chen**: "A batch it can submit, and now the reason we stopped."

**Liron**: "Call the operation `planPayouts(queue, allowance)`. Give it Dafna's filters and that loop. The submission code shouldn't choose between a fold and a loop."

**Chen**: "One case before we rename it. A held payout for 1,200 is first. Do we stop there?"

```typescript
const heldFirst: Payout[] = [
  { id: "H", amount: 1_200, currency: "USD", status: "held", reason: "review" },
  ready("R1", 600), ready("R2", 500),
];
const heldBatch = looped(heldFirst, 1_000);
console.log(heldBatch.released.map(p => p.id).join(",")); // R1
console.log(heldBatch.stop); // { kind: 'limit', id: 'R2' }
```

**Dafna**: "H is gone before we check the allowance. We reach R1, then stop at R2. The fold does the same."

**Chen**: "And moving the allowance check above eligibility?"

**Gil**: "Nobody paid. H would close the batch. I've added a test that would catch that move."

**Dafna**: "Keep the eligibility tests as they are. Use `looped` as the body of `planPayouts`. The closed state works, but we don't need to visit the rest of the queue to carry it to the end."

Gil runs both repairs against the empty queue, a batch that exactly spends its allowance, and the support ticket. The IDs and totals agree; the new stop reasons agree too. Dafna replaces the deployed fold with the loop after the filters. The patch restores the release order.

## The Turn

**Chen**: "When does P2 get paid?"

**Gil**: "Next batch. Tomorrow."

**Chen**: "Under which version?"

Gil removes each day's released payouts and gives the remaining queue a fresh allowance of 1,000. No new arrivals in this run.

| Day | Stop at the first payout that doesn't fit | Skip payouts that don't fit |
|---|---|---|
| 1 | P1 | P1, P3, P4 |
| 2 | P2 | P2 |
| 3 | P3, P4 | — |

**Dafna**: "P2 gets the same day. We held P3 and P4 for two more days to preserve its place."

**Gil**: "In this queue."

**Dafna**: "Try arrivals too. They join at the back."

Gil runs all 78,125 combinations of four opening payouts and one arrival on each of the next three days. Each amount is one of 100, 200, 300, 400 or 500, and the allowance resets to 500. He compares the payment day of every ID, not just the time it takes to empty the queue.

**Gil**: "No payout paid later under skip in that set. Some paid earlier. I haven't proved that for every queue."

**Dafna**: "Then I'd like a different rule: scan in queue order, pay what fits, leave the rest for tomorrow."

**Chen**: "Support would have to stop promising that newer payouts won't go ahead."

**Dafna**: "Yes. We wrote that promise. We can change it, with support, as a policy change. Today's refactor still restores the old rule."

Gil opens finance's proposal. The deposit would be 500 a day, and unused funds would stay in the account. Under that proposal, payouts can need more than one day's deposit. P2 is again 900, first in the queue. A payout for 400 is behind it on day 1; a new payout for 450 joins the back every day after that.

**Gil**: "Start with no balance. First deposit is on day 1. The oldest payout can't be funded that day under either rule."

| Day | Stop: P2's outcome | Skip: balance before considering P2 |
|---|---|---|
| 1 | Waits; retains 500 | 500; pays the 400 instead |
| 2 | Paid from 1,000 | 600; pays a 450 instead |
| 3 | Already paid | 650; pays a 450 instead |
| 4 | Already paid | 700; pays a 450 instead |
| 5 | Already paid | 750; pays a 450 instead |
| 6 | Already paid | 800; pays a 450 instead |
| 7 | Already paid | 850; pays a 450 instead |
| 8 | Already paid | 900; pays P2 |

**Dafna**: "Six days later. Because each smaller payout spends money we could have kept for P2."

**Gil**: "Under the reset we couldn't keep it. Now we can. Same two planners, different funding."

**Chen**: "So the support sentence would protect a payment date under finance's proposal."

**Dafna**: "It would. I'd keep stopping there. But that isn't our funding today, and we don't have a date for the change. I don't want P3 waiting until day 3 because we might switch accounts."

## The Debate Continues

**Gil**: "I want finance's funding decision before we replace the release-order promise. We've got a checked example where skipping costs P2 six days. A switch to accumulated funds would have to switch the planner back too."

**Dafna**: "And I've got payouts we can release earlier on the account we have. Make the funding model part of the policy. If they approve accumulation, we retain queue order there. While the allowance expires every night, I want skipping considered on its own results."

**Chen**: "Then those are two changes to discuss with support, not two spellings of `reduce`. For this refactor, the answer to P2 stays the same?"

**Dafna**: "It does. I'll take the skipping proposal to the payouts policy meeting with both traces. The support reply has to change if we adopt it."

**Gil**: "Take the deposit proposal too. That's the part I still want answered."

## Additional Takes

**Chen**: "The status filter narrowed. Will this one? I'm collecting refund amounts for the batch report."

```typescript
type ReportRow = { id: string; refund?: { amount: number } };
declare const rows: ReportRow[];
const amounts = rows
  .filter(row => row.refund !== undefined)
  .map(row => row.refund.amount); // Error TS18048: 'row.refund' is possibly 'undefined'.
```

**Dafna**: "The item is still a `ReportRow` after that filter. It hasn't become a different union member. You can move the optional value into the stream before filtering it."

```typescript
const refundAmounts = rows
  .map(row => row.refund)
  .filter(refund => refund !== undefined)
  .map(refund => refund.amount);
```

**Chen**: "I also need the payout ID."

**Dafna**: "Then keep the row while you decide."

```typescript
const refunds = rows.flatMap(row =>
  row.refund === undefined
    ? []
    : [{ id: row.id, amount: row.refund.amount }]
);
```

**Sahar**: "That choice belongs to one row. Nothing a refund does changes whether the next row goes into the report."
