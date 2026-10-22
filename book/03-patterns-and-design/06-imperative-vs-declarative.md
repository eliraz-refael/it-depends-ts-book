# Chapter 19: Who Goes Next?

## The Principle

**Sahar Firstclass**: "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing. Before replacing a loop, ask what carries from one item to the next, where processing stops, and what must happen in order. The caller still needs those rules. If the rewrite hides its stopping point behind a flag you have to chase, keep the loop. A visible early return or a named split can be easier to read."

"Check the type after each step, too. A check inside one callback may not narrow the value in the next. Keep the check and its use together if that narrowing gets lost. And returning from a `reduce` callback ends that call, not the `reduce`. Changing that behavior is a change to what the caller gets, even if the new code is shorter."

## The Debate

**Dafna Functor**: "Three eligibility checks and a running total in one loop. I wanted to test the eligibility rules without arranging a treasury balance."

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

**Gil**: "Each batch gets a fresh daily allowance. Finance has a proposal to deposit a smaller amount each day and let the balance accumulate. That hasn't been approved. These tests use the current reset."

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

**Dafna**: "I wanted to get rid of that loop. Now the split has a counter hidden inside its search, and the fold has a state machine. Six months from now, I'd rather find the return next to the failed allowance check. Keep the loop after my filters."

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

**Gil**: "Nobody paid. H would close the batch. I've added a test that would catch that move. Empty queue, exact allowance, yesterday's queue: all three repairs agree on the IDs, total and stop reason."

Dafna replaces the deployed `skipping` body with the loop after the filters, under `planPayouts`. The patch will ship before today's batch.

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

**Gil**: "No payout paid later under skip in that set. Some paid earlier."

**Chen**: "Could skip ever have more unpaid payouts ahead of P2 than stop has?"

**Dafna**: "They start with the same queue. Suppose skip has already paid everything stop paid on previous days. Its remaining queue is a subset of stop's, in the same order. Take any payout stop pays today. Before reaching it, skip can only have spent money on a subset of the earlier payouts stop paid today. So it fits under skip too, unless skip already paid it."

**Gil**: "And that keeps the subset true tomorrow, when both get the same fresh allowance and the same arrivals. With that fresh allowance, fixed amounts and the same queue order, skipping pays no payout later."

**Dafna**: "Then I'd like a different rule: scan in queue order, pay what fits, leave the rest for tomorrow."

**Chen**: "Support would have to stop promising that newer payouts won't go ahead."

**Dafna**: "Yes. We wrote that promise. We can change it, with support, as a policy change. Today's patch still restores the old rule."

Gil opens finance's proposal. The deposit would be 500 a day, and unused funds would stay in the treasury. Under that proposal, payouts can need more than one day's deposit. P2 is again 900, first in the queue. S1, for 400, is behind it on day 1. A payout for 450 joins each day from day 2 through day 8: S2 through S8. All are eligible on arrival and stay eligible.

**Gil**: "Start with no balance. First deposit on day 1. Stop pays P2 on day 2. Fill pays it on day 8. Each smaller payout spends funds we could have saved for P2."

**Dafna**: "Now give me the other sellers. You compared every ID for the reset."

**Gil**: "Stopping delays S1 by two days. S2 through S6 by two days each. S7 by one. S8 gets day 9 either way. Thirteen payout-days across seven payouts, to pay P2 six days sooner."

**Dafna**: "Then I don't want to call stopping the safe answer and hide those thirteen days."

**Gil**: "Change the new arrivals from 450 to 500. Fill leaves 100 each night. Next morning there are 600, still not enough for P2. It pays the new 500 and leaves 100 again. As long as those arrivals continue, P2 never gets paid."

**Chen**: "What if they stop after day 8?"

**Gil**: "P2 gets day 10. With them continuing, it's still unpaid on day 30. The repeated 100 is why it would stay unpaid."

**Dafna**: "Then give filling a waiting limit. Fill while the oldest payout is young. Once it's waited N days and doesn't fit, reserve for it. We don't have to block the queue on its first day."

**Gil**: "Show me that against both arrival sizes."

For this proposal, the planner receives already-eligible payouts with their arrival day. The caller supplies today's day number and the waiting threshold. Dafna writes the rule without reading a clock inside it:

```typescript
type WaitingPayout = Ready & { arrivedOn: number };

function fillThenReserve(
  queue: readonly WaitingPayout[], balance: number,
  today: number, waitDays: number,
): Batch {
  const released: Ready[] = [];
  let total = 0;
  for (const payout of queue) {
    if (total + payout.amount > balance) {
      if (today - payout.arrivedOn >= waitDays) {
        return { released, total, stop: { kind: "limit", id: payout.id } };
      }
      continue;
    }
    released.push(payout);
    total += payout.amount;
  }
  return { released, total, stop: { kind: "end" } };
}
```

Gil runs it with N = 2. Each cell below is the payment day for the original 450-arrival case, with arrivals ending on day 8.

| Payout | Stop | Fill | Fill, then reserve after 2 days |
|---|---:|---:|---:|
| P2 | 2 | 8 | 4 |
| S1 | 3 | 1 | 1 |
| S2 | 4 | 2 | 2 |
| S3 | 5 | 3 | 5 |
| S4 | 6 | 4 | 6 |
| S5 | 7 | 5 | 7 |
| S6 | 8 | 6 | 8 |
| S7 | 8 | 7 | 8 |
| S8 | 9 | 9 | 9 |

**Gil**: "Against stopping immediately, P2 waits two more days. S1 and S2 each get paid two days sooner. Nobody else changes day. With the continuing 500 arrivals, this still pays P2 on day 4."

**Chen**: "So two days isn't a promise that the payout arrives within two days?"

**Dafna**: "It's when we stop spending past it. We may still need more deposits to fund it."

**Gil**: "I can work with a stated reservation threshold. We own that number. Two is a test value, not something to leave in the code because it made this table look good."

## The Verdict

**Sahar**: "The caller needs to know which policy it's getting. `planPayouts` hid that once we had more than one. Name the rule."

**Dafna**: "For the reset, `fillAvailable`. That's the `skipping` fold we already have. It was wrong as a replacement for stopping, but it does implement filling. I'll keep that body when we deliberately change the policy."

**Chen**: "You could write filling with a loop, too."

**Dafna**: "Of course. And we just wrote stopping three ways. The name says what callers may rely on. Here the fold can consider every payout without a closed state, so I'd use it."

**Gil**: "Today's repair restores the queue-order promise first. Then we adopt filling for the reset and update support's reply: a newer payout may go ahead if it fits. P2's date wasn't delayed yesterday, but we did break the promise we gave its seller."

**Dafna**: "If accumulation is approved, use `fillThenReserve`, with the waiting threshold we set for that policy. I don't want either of the unqualified rules there."

**Sahar**: "Keep that as a proposal until finance approves it. We have one funding model to ship today."

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
