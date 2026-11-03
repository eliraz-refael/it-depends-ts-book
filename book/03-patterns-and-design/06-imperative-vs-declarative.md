# Chapter 19: Who Goes Next?

## The Principle

**Sahar Firstclass**: "Choose the simplest expression of the behavior the caller needs, and check that behavior before calling a rewrite a refactor. What would we lose if we deleted this rewrite? If all we'd lose is a shorter spelling, I'd keep the version where I can see why an item is included or left out."

## The Debate

**Dafna Functor**: "Three eligibility checks and a running total in one loop. I wanted to test the eligibility rules without setting up an allowance."

The payouts team is looking at yesterday's batch. Dafna's refactor ran for the first time, and a seller has contacted support. The planner selects payouts for another service to submit; it doesn't move money itself. Its input queue is oldest first.

Gil opens the reply sent to the seller: *“Eligible payouts are released in queue order. Newer eligible payouts won't go ahead of yours.”* The payouts team supplied that wording.

**Gil Benchmark**: "The old tests checked that we stayed under the allowance. We did. Let's compare which payouts got selected."

Dafna opens the loop her refactor replaced:

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

Amounts are integer minor units. The treasury releases USD, with a minimum of 100. Every eligible payout fits a fresh day's allowance; requests larger than that take a separate path. A small fixture builds ready payouts in that currency:

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

**Gil**: "No. Each batch gets a fresh daily allowance. Unused allowance expires."

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

**Dafna**: "The first filter gives us `Ready[]`. I can test these rules without running the allowance calculation."

**Chen**: "You're declaring the return type on `eligible`. Is that doing the narrowing?"

**Dafna**: "Remove it. The result is still `Ready[]`. TypeScript infers a predicate for `isReady` from the status check. The held member doesn't have `account`, and it doesn't reach that last `map`."

**Gil**: "The currency fixture and the held fixture both pass. Keep those stages. What did you do with the allowance?"

This is the `skipping` version that went out and planned yesterday's batch:

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

**Dafna**: "The accumulator is the amount spent. If a payout doesn't fit, keep the amount we already had. I'm keeping the push. It's our own new array, and I'm not copying it for every payout."

**Gil**: "A and B still pass. The old limit test only had two payouts: 400 followed by 900. That passes too. Yesterday's queue had two smaller payouts after those."

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
  const final = eligible(queue).reduce<State>((state, payout) => {
    if (state.kind === "closed") return state;
    if (state.total + payout.amount > allowance) {
      return { kind: "closed", total: state.total, id: payout.id };
    }
    released.push(payout);
    return { kind: "open", total: state.total + payout.amount };
  }, { kind: "open", total: 0 });
  return {
    released,
    total: final.total,
    stop: final.kind === "closed"
      ? { kind: "limit", id: final.id }
      : { kind: "end" },
  };
}
```

**Gil**: "P1, total 400, stopped at P2. Four reducer calls, two allowance checks. The result agrees with the old batch."

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

**Liron Closure**: "You're finding a boundary. Everything before the first blocker belongs in the batch. Everything from there on waits. I'd split there, then take the first part."

```typescript
function split(queue: readonly Payout[], allowance: number): Batch {
  const candidates = eligible(queue);
  let total = 0;
  const cut = candidates.findIndex(payout => {
    if (total + payout.amount > allowance) return true;
    total += payout.amount;
    return false;
  });
  return {
    released: cut === -1 ? candidates : candidates.slice(0, cut),
    total,
    stop: cut === -1
      ? { kind: "end" }
      : { kind: "limit", id: candidates[cut].id },
  };
}
```

**Dafna**: "That stops searching at P2. And `-1` means everyone fits, so we keep the whole array. I'd rather read that than carry a closed state through every remaining callback."

**Sahar**: "What's the caller asking for?"

**Chen**: "A batch it can submit, and now the reason we stopped."

**Sahar**: "Then give it `planPayouts(queue, allowance)`. Choose the body here. The caller shouldn't have to choose an array operation."

**Dafna**: "I like the split better than the closed-state fold. But I just shipped a bug by following the total and missing what the callback would do next. I don't want another search callback with a counter to follow. Keep the loop after my filters. I want the return next to the failed allowance check."

**Liron**: "Fair. The split is useful if we want both parts. Here we're returning the batch and the blocker."

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

**Chen**: "And if someone moves the allowance check above eligibility?"

**Gil**: "Nobody would be paid. H would close the batch. I've added a test that would catch that move. Empty queue, exact allowance, yesterday's queue: all three repairs agree on the IDs, total and stop reason."

**Dafna**: "I'll replace `skipping` with the loop after the filters and call it `planPayouts`. That repair ships before today's batch."

## The Turn

**Chen**: "When does P2 get paid?"

**Gil**: "Next batch. Today."

**Chen**: "Under which version?"

For the replay, yesterday is day 1. Gil removes each day's released payouts and gives the remaining queue a fresh allowance of 1,000. No new arrivals in this run.

| Day | Stop at the first payout that doesn't fit | Skip payouts that don't fit |
|---|---|---|
| 1 | P1 | P1, P3, P4 |
| 2 | P2 | P2 |
| 3 | P3, P4 | — |

**Dafna**: "P2 gets paid on day 2 under either rule. Stopping would have held P3 and P4 for two more days to preserve its place."

**Gil**: "In this queue."

**Dafna**: "Try arrivals too. They join at the back."

Gil runs all 78,125 combinations of four opening payouts and one arrival on each of the next three days. Each amount is one of 100, 200, 300, 400 or 500, and the allowance resets to 500, so every amount fits a fresh day. He compares the payment day of every ID, not just the time it takes to empty the queue.

**Gil**: "With a fresh allowance every day and every payout fitting one, no payout paid later under skip in that set. Some paid earlier."

**Dafna**: "Then I'd like a different rule: scan in queue order, pay what fits, leave the rest for tomorrow."

**Chen**: "Support would have to stop promising that newer payouts won't go ahead."

**Dafna**: "Yes. We wrote that promise. We can change it, with support, as a policy change. Today's patch still restores the old rule."

## The Verdict

> A refactor preserves the caller's policy; changing that policy needs its own agreement. Once the policy is settled, choose the implementation that makes its decisions easiest to follow.

**Sahar**: "I called it `planPayouts` too soon. Now we have different rules. Name today's repair `stopAtFirstBlocker`. Filling gets `fillAvailable`."

```typescript
const stopAtFirstBlocker = looped;
const fillAvailable = skipping;
```

**Dafna**: "`fillAvailable` returns `Plan`: the selected payouts and the total. There's no single blocker to report. Support can say an eligible payout left unpaid didn't fit the remaining allowance when we reached it. A later, smaller one may still go out."

**Gil**: "P2's date wasn't delayed yesterday. We still broke the queue-order promise we gave its seller."

**Dafna**: "Restore that promise first. Then agree on filling with support as a policy change and update their reply."

**Chen**: "And filling could use a loop too?"

**Dafna**: "Of course. We just wrote stopping three ways. For `stopAtFirstBlocker`, I want the loop's return beside the failed allowance check. For `fillAvailable`, I'll keep the fold: it considers every payout, with no closed state to carry. That body was wrong as a replacement for stopping. It does implement filling."

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
