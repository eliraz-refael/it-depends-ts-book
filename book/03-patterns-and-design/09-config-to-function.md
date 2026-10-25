# Chapter 22: The Policy's Alibi

## The Principle

**Liron Closure**: "Before you turn configuration into a function, find everyone who uses it. Some callers need something they can call. Others need something they can save, edit or explain later. A function value isn't a saved account of its code and captured values. Store a description your evaluator understands, or identify retained code and the parameters it used. Then test the round trip: save it, load it, and apply the same recorded input with the same evaluator version. Does it make the same decision?"

"For the next change, ask what kind of change it is. A new parameter value? A combination the format already permits? Or a new operation somebody must implement? An editable rule format gives its authors the choices its evaluator supports. Putting the combinations in code gives those choices to the code's authors. Neither arrangement updates old stored values when you edit a type. Parse those values and decide what their old shape means."

## The Debate

### An order that shouldn't have been held

**Dafna Functor**: "Compliance wants to know why we held order forty-two on the third. I have the policy. It says we shouldn't have."

**Eden Legacy**: "Refunds. That account had three refunds."

**Dafna**: "Then why does the record say we only checked the total?"

Dafna maintains the risk team's console. Analysts use it to edit review settings and activate revisions. Eden owns the orders service, which decides whether an order can ship or needs manual review. They jointly own the interface between the console and the service. The risk team decides which orders should be held.

The audit log promises a complete account of the active policy alongside the order facts and the decision. These are the facts it retained for order forty-two. The refund ages were measured at that decision, not when Dafna opened the record:

```typescript
type Order = {
  id: string;
  total: number;
  country: string;
  refundDaysAgo: readonly number[];
};
type LivePolicy = {
  reviewAbove: number;
  extraHold?: (order: Order) => boolean;
};

function holds(policy: LivePolicy, order: Order): boolean {
  return order.total > policy.reviewAbove || (policy.extraHold?.(order) ?? false);
}

const order: Order = {
  id: "o42", total: 120, country: "FR", refundDaysAgo: [1, 2, 7],
};
const limit = 2;
const active: LivePolicy = {
  reviewAbove: 500,
  extraHold: order => order.refundDaysAgo.filter(age => age <= 7).length > limit,
};
console.log(holds(active, order)); // true
```

**Eden**: "The service loaded the threshold and attached that predicate. The risk team wanted three refunds within seven days to trigger a hold. I added the hook, tested this order, and shipped it."

**Chen Override**: "What did the test save?"

**Eden**: "It called `holds`. The logger already saved the policy on every decision."

Dafna opens the saved policy beside the test:

```typescript
console.log(JSON.stringify(active)); // {"reviewAbove":500}
console.log(JSON.stringify(active) === JSON.stringify({ reviewAbove: 500 })); // true

const restored: LivePolicy = JSON.parse(JSON.stringify(active));
console.log(holds(restored, order)); // false
```

**Dafna**: "We asked the record for a reason. It gave the policy an alibi."

**Eden**: "The function worked. I sent the logger an object it couldn't preserve."

**Chen**: "And gave the object without the function the same record. Which of those was running on the third?"

**Eden**: "This release had the refund hook. I can recover that from the release artifact. Nobody reading this JSON should have to guess it."

### Something the logger can accept

**Dafna**: "Make the saved policy data. If I put a function back in it, I'd like the compiler to complain before another analyst has to explain the order."

```typescript
type Json = string | number | boolean | null
  | readonly Json[]
  | { readonly [key: string]: Json };

const savedPolicy: Json = active; // Error TS2322
```

**Eden**: "It names `extraHold`. That's the property the logger lost."

**Sahar Firstclass**: "Do you need to store the function at all? You already keep the releases."

**Eden**: "I need to store which code ran. The parameters alone aren't the policy."

He gives the refund check its own retained evaluator version. The record contains the parameters and input facts, rather than a live callback:

```typescript
const parameters = { reviewAbove: 500, refundCount: 2, refundDays: 7 };

function reviewV2(p: typeof parameters, order: Order): boolean {
  return order.total > p.reviewAbove
    || order.refundDaysAgo.filter(age => age <= p.refundDays).length > p.refundCount;
}

const evaluators = { "review-2": reviewV2 };
const auditRecord = {
  evaluator: "review-2",
  parameters,
  input: order,
  held: reviewV2(parameters, order),
} as const satisfies Json;

console.log(evaluators[auditRecord.evaluator](
  auditRecord.parameters, auditRecord.input,
)); // true
```

**Dafna**: "And after `review-3` replaces it?"

**Eden**: "The old record still names `review-2`. We retain that artifact for replay. I can't quietly give the old name new code."

**Dafna**: "Then I can answer the question about the third. The JSON has no function, but it tells me which one to use."

**Chen**: "Does `Json` prove every object we hand it is clean?"

**Eden**: "It checks the properties visible in the type. Hiding `extraHold` behind a narrower type wouldn't remove it from the object. Here I'm constructing the record from the fields we mean to save."

Dafna adds the saved-and-replayed order to the test. This time, both decisions say hold.

### The next pair of parentheses

**Dafna**: "That fixes the record. It doesn't fix my next ticket."

Since the third, the risk team narrowed the policy to repeated refunds in the FR campaign. Its next request adds high totals back for every country: **large total OR (FR AND refund velocity)**. The refund threshold is still three within seven days. The console already has the country-and-velocity template; this ticket needs the extra branch.

The console can change thresholds. It cannot change those parentheses.

**Dafna**: "We have all three conditions. An analyst should be able to join them. Today they send me the grouping, and I send you a request to write it."

**Eden**: "They shouldn't have to wait for the orders service to release. I'll load a checked policy artifact separately."

**Dafna**: "They still need you to write the expression."

These are the parameters both proposals use, and the decision the order consumer expects. A matching rule ID lets the console find the policy behind the hold:

```typescript
type Params = { amount: number; country: string; count: number; days: number };
type Decision = { hold: boolean; reasons: string[] };
const params: Params = { amount: 500, country: "FR", count: 2, days: 7 };
```

Dafna gives the console an explicit vocabulary. It can describe the three conditions and join them with `all` or `any`. It cannot submit arbitrary JavaScript:

```typescript
type Condition =
  | { kind: "totalAbove"; amount: number }
  | { kind: "country"; code: string }
  | { kind: "refundsAbove"; count: number; days: number }
  | { kind: "all" | "any"; conditions: readonly Condition[] };
type Rule = { version: 2; id: string; when: Condition };

function matches(condition: Condition, order: Order): boolean {
  switch (condition.kind) {
    case "totalAbove": return order.total > condition.amount;
    case "country": return order.country === condition.code;
    case "refundsAbove":
      return order.refundDaysAgo.filter(age => age <= condition.days).length > condition.count;
    case "all": return condition.conditions.every(c => matches(c, order));
    case "any": return condition.conditions.some(c => matches(c, order));
    default: {
      const missing: never = condition;
      throw new Error(`Unsupported condition: ${missing}`);
    }
  }
}
```

**Dafna**: "The editor produces a tree like this. The service parses it when it loads the policy."

```typescript
const rule: Rule = {
  version: 2,
  id: "review-hold",
  when: {
    kind: "any",
    conditions: [
      { kind: "totalAbove", amount: params.amount },
      {
        kind: "all",
        conditions: [
          { kind: "country", code: params.country },
          { kind: "refundsAbove", count: params.count, days: params.days },
        ],
      },
    ],
  },
};
```

**Eden**: "Now the grouping is in the record."

**Dafna**: "And in the editor. The analyst can move a condition into another group without asking either of us to change `matches`."

She connects the rule to the order consumer:

```typescript
function evaluate(rule: Rule, order: Order): Decision {
  const hold = matches(rule.when, order);
  return { hold, reasons: hold ? [rule.id] : [] };
}

const ruleHold = (order: Order): Decision => evaluate(rule, order);
console.log(JSON.stringify(ruleHold(order))); // {"hold":true,"reasons":["review-hold"]}
```

**Chen**: "What if they want account age?"

**Dafna**: "Then we add a condition. The console doesn't have that fact, and the evaluator doesn't have that operation. `never` makes us handle the new kind. It doesn't write the check for us."

**Eden**: "Or the editor control, or the explanation of what its number means. That's the interface we'd be maintaining."

**Dafna**: "Three conditions and two joins. I'm not proposing a programming language with a debugger."

**Eden**: "I know. I'm asking whether we need to let them rearrange those joins yet."

He adds a named template alongside the existing country-and-velocity template. Its stored values select the template and supply parameters. The combinations live in the policy code:

```typescript
type Template = {
  version: 2;
  id: string;
  name: "country-velocity" | "large-or-country-velocity";
  params: Params;
};
const selected: Template = {
  version: 2, id: "review-hold", name: "large-or-country-velocity", params,
};

function evaluateTemplate(config: Template, order: Order): Decision {
  const p = config.params;
  const large = order.total > p.amount;
  const country = order.country === p.country;
  const velocity = order.refundDaysAgo.filter(age => age <= p.days).length > p.count;
  const hold = config.name === "country-velocity"
    ? country && velocity
    : large || (country && velocity);
  return { hold, reasons: hold ? [config.id] : [] };
}

const templateHold = (order: Order): Decision => evaluateTemplate(selected, order);
console.log(JSON.stringify(templateHold(order))); // {"hold":true,"reasons":["review-hold"]}
```

**Dafna**: "We can change the amount, the country, the count and the days. The next grouping is another template."

**Eden**: "That's the limit I'm offering. This request has one now."

**Chen**: "Your earlier refund settings didn't have `days`. What happens to those?"

**Eden**: "The version-1 reader supplies seven, which was their meaning. Version 2 requires it. Editing `Params` doesn't update stored JSON."

**Dafna**: "The rule reader needs that too. And the audit record needs the evaluator version, just as yours does. Saving the tree doesn't preserve an old implementation of `matches`."

## The Turn

**Gil Benchmark**: "Which orders are we arguing about?"

**Dafna**: "They should hold the same ones."

**Gil**: "Let's put them in front of both."

He makes eight orders: totals at and just above 500, FR and US, and two refund histories. One has only two refunds within seven days. The other has three, with the oldest exactly seven days old:

```typescript
const samples: Order[] = [];
for (const total of [500, 501]) {
  for (const country of ["FR", "US"]) {
    for (const refundDaysAgo of [[1, 2, 8], [1, 2, 7]]) {
      samples.push({ id: `sample-${samples.length}`, total, country, refundDaysAgo });
    }
  }
}
console.log(samples.map(ruleHold).filter(d => d.hold).length); // 5
console.log(JSON.stringify(samples.map(ruleHold))
  === JSON.stringify(samples.map(templateHold))); // true
```

**Gil**: "Five holds. Same orders, same rule ID."

**Chen**: "And if someone puts `any` inside the outer `any`?"

**Dafna**: "Then being in FR is enough. So is having the refunds, even outside FR. That's why the console replays a proposed change before activation."

She flattens the joins to reproduce that mistake:

```typescript
const tooBroad: Rule = {
  version: 2,
  id: rule.id,
  when: { kind: "any", conditions: [
    { kind: "totalAbove", amount: params.amount },
    { kind: "country", code: params.country },
    { kind: "refundsAbove", count: params.count, days: params.days },
  ] },
};
const expected = [false, true, false, false, true, true, true, true];
console.log(samples.filter((o, i) => evaluate(tooBroad, o).hold !== expected[i]).length); // 2
```

**Gil**: "Two extra holds: the low-total FR order without velocity, and the low-total US order with it. The replay refuses that change."

**Chen**: "Would the compiler refuse `large || country || velocity` in Eden's function?"

**Eden**: "It would compile. I'd want these same cases before loading the artifact."

**Dafna**: "So the tree isn't the reason that mistake gets caught. The replay is."

**Liron**: "You've checked the decision. You still have to choose who can write the next one."

**Dafna**: "That's what I'm asking for. With the tree, an analyst can write another grouping from these conditions. With the templates, they can only pick a grouping you've already written."

**Sahar Firstclass**: "How often have they needed to?"

Gil has the policy requests from the past three months, including the open ticket. He separates them into three kinds:

| Changes | Kind | Example |
|---:|---|---|
| 6 | Parameter values | Change the refund window from seven days to fourteen |
| 2 | Existing conditions, new grouping | Add the large-total branch to country-and-velocity |
| 1 | New condition | Add refund velocity to a policy that only knew totals and country |

**Gil**: "Both versions handle the six parameter changes in the console. Both need us to implement a new condition. The two regroupings are the difference."

**Dafna**: "One of those is this ticket. While it waited, the old country-and-velocity rule let some large orders through."

**Eden**: "Three in this batch. They're held once this template is loaded."

**Sahar**: "Then use the templates now. Build the general editor when a third regrouping request arrives."

**Chen**: "Dafna, does today's analyst need a grouping that's still missing?"

**Dafna**: "This one. Which Eden has now written. They can change its parameters from the console."

**Chen**: "And when the third arrives, can you deliver an editor that afternoon?"

**Dafna**: "I haven't promised that. It triggers the work. We still have to build it."

**Eden**: "We can continue accepting the old named records when we add trees. The old audit entries still use their retained code versions."

**Chen**: "That answers it."

## The Verdict

**Dafna**: "I'll add the template to the console. The third regrouping request starts the editor work. Let's put that in our backlog agreement, so the next request doesn't become this meeting again."

**Eden**: "Agreed. I'll own the service's rule input when we get there. For now, it accepts these named templates and their parameters."

The existing reader validates the saved template name and parameters, and handles the version-1 window. The order consumer receives a function after that boundary:

```typescript
declare function readSavedTemplate(input: unknown): Template;

const savedSelection = JSON.stringify(selected);
const loaded = readSavedTemplate(JSON.parse(savedSelection));
const evaluateOrder = (order: Order): Decision => evaluateTemplate(loaded, order);
console.log(evaluateOrder(order).hold); // true
```

**Gil**: "Three wasn't in my findings. I counted two requests."

**Dafna**: "Three is where we've agreed to start the work. You don't have to certify it."

**Sahar**: "And the question about order forty-two?"

**Dafna**: "Three refunds within seven days. The old log didn't say that. The retained release does, and the repaired record will say which release to ask."
