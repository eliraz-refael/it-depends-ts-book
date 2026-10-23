# Chapter 19: Who Goes Next?

## The Principle

**Sahar Firstclass**: "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing. Before replacing a loop, ask what carries from one item to the next, where processing stops, and what must happen in order. The code calling this function still depends on its carried state, stopping point and order. If the rewrite hides its stopping point behind a flag you have to chase, keep the loop. An early return, or splitting at the first item that fails, can show the stopping point without that flag."

"Check the type after each stage of the chain, too. A check inside one callback may not narrow the value in the next. Keep the check and its use together if that narrowing gets lost. And returning from a `reduce` callback ends that call, not the `reduce`. If you turn a stop into a skip, the code calling your function gets a different answer. Shorter code doesn't excuse that."

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

**Chen**: "Can skip ever leave a payout unpaid that stop has already paid?"

**Liron**: "Look at the queues left each morning. They start identical. After that, skip may have paid extra payouts early. Cross those out of stop's queue and you have skip's queue, still in the same order."

**Chen**: "But can that stop being true at the next batch?"

**Liron**: "If stop can pay a payout today, it can afford everything before it too. Skip has at most those same earlier payouts left to pay. So it can afford that payout as well, unless it already paid it. That leaves skip's unpaid queue inside stop's again tonight."

**Gil**: "Append the same arrivals and give both a fresh allowance tomorrow, and the same argument works again. Fixed amounts, same order, daily reset: skipping pays no payout later."

**Dafna**: "Then I'd like a different rule: scan in queue order, pay what fits, leave the rest for tomorrow."

**Chen**: "Support would have to stop promising that newer payouts won't go ahead."

**Dafna**: "Yes. We wrote that promise. We can change it, with support, as a policy change. Today's patch still restores the old rule."

Gil opens finance's proposal. The deposit would be 500 a day, and unused funds would stay in the treasury. Under that proposal, payouts can need more than one day's deposit. P2, for 900, and S1, for 400, both arrive on day 1, with P2 first. A payout for 450 joins each day from day 2 through day 8: S2 through S8. All are eligible on arrival and stay eligible.

**Gil**: "Start with no balance. First deposit on day 1. Stop pays P2 on day 2. Fill pays it on day 8. Each smaller payout spends funds we could have saved for P2."

**Dafna**: "Now give me the other sellers. You compared every ID for the reset."

**Gil**: "Thirteen payout-days across seven payouts, to pay P2 six days sooner."

**Dafna**: "Then I don't want to call stopping the safe answer and hide those thirteen days."

**Gil**: "Change the new arrivals from 450 to 500. Fill leaves 100 each night. Next morning there are 600, still not enough for P2. It pays the new 500 and leaves 100 again. I ran thirty days and P2 was still unpaid on day 30. The balance never gets above 600. As long as those arrivals continue, P2 never gets paid."

**Dafna**: "Then give filling a waiting limit. At a payout that doesn't fit, check how long it's waited. If it's reached N days, stop there and reserve for it. Otherwise keep filling. The queue is oldest first, so we reach the oldest unpaid payout first. We don't have to stop the queue on that payout's first day."

**Gil**: "Show me that against both arrival sizes."

Dafna gives the planner already-eligible payouts with arrival days, and passes in today's day number and the waiting threshold:

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

**Sahar**: "I called it `planPayouts` too soon. Now we have different rules. Name today's repair `stopAtFirstBlocker`. Filling gets `fillAvailable`."

```typescript
const stopAtFirstBlocker = looped;
const fillAvailable = skipping;
```

**Dafna**: "`fillAvailable` returns `Plan`: the selected payouts and the total. There's no single blocker to report. Support can say an eligible payout left unpaid didn't fit the remaining allowance when we reached it. A later, smaller one may still go out."

**Gil**: "P2's date wasn't delayed yesterday. We still broke the queue-order promise we gave its seller."

**Dafna**: "Restore that promise first. Then adopt filling for the reset as a policy change, with support's reply updated. If accumulation is approved, use `fillThenReserve` with a waiting threshold we set for it."

**Sahar**: "Keep the reservation rule as a proposal until finance approves accumulation. We have one funding model to ship today."

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
