# Bonus 1: Which File Says That?

## The Principle

**Prof. Eli Typeworth**: "Don't leave a blank where the decision belongs. Before asking for code, put the behavior you want in the signature and in examples of success and rejection. Send the project's configuration and check command with them; reuse what's already there. Agree which files may change, but check their imports first: the configuration reaches that source too. A setting that breaks old code may make this a bigger job than you meant."

"Run those checks against the answer. If two implementations pass but disagree on behavior you need, decide and put that difference in the examples before handing the work back. A type assertion (`as` or `!`) doesn't check incoming data. Neither does a predicate whose body never checks its claim; code without those shortcuts isn't necessarily correct. The checks enforce what you've expressed in them. Someone still has to own what you meant."

## The Debate

### "It says validates"

**Dima Bridge** has asked the shop's coding assistant for a refund parser. He turns the screen towards Idan.

Dima scrolls up to the request:

> Write a TypeScript function to parse a refund webhook's JSON. Return its id and cents. Validate the payload and handle invalid input. Keep it simple.

The answer ends with: *"This validates the payload and returns a typed refund. Invalid JSON throws an error."*

```typescript
// src/contract.ts — initial contract
export type Refund = { id: string; cents: number };

// src/parse-refund.ts — the returned implementation
import type { Refund } from "./contract.ts";

export function parseRefund(raw: string): Refund {
  return JSON.parse(raw);
}
```

**Idan Greenfield**: "Which part validates?"

**Dima**: "The explanation is very confident about it."

Idan adds a caller.

```typescript
// src/probe.ts — first probe
import { parseRefund } from "./parse-refund.ts";

const refund = parseRefund('{"id":"r1","cents":"100"}');
console.log(typeof refund.cents, refund.cents + 1);
```

Dima runs `./node_modules/.bin/tsc -p tsconfig.json`. It passes. `node src/probe.ts` prints `string 1001`.

**Idan**: "It validated the vibe."

**Dima**: "And gave us an excellent interest rate."

**Idan**: "You know why it compiled."

**Dima**: "JSON.parse handed it any. The return annotation didn't inspect the value. I know. I'm asking what to send next time so we don't have this conversation again."

**Chen Override**: "You could send this conversation."

**Dima**: "I'd like the request to be shorter than the function."

### "Which project?"

Dima opens the files already in this small scratch project. He's running TypeScript 7.0.2 and Node 22.23.4, with the compiler and Node declarations installed locally. This is its `package.json`:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "check": "tsc -p tsconfig.json && node --test \"test/**/*.test.ts\""
  },
  "devDependencies": {
    "typescript": "7.0.2",
    "@types/node": "26.5.1"
  }
}
```

And its `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "types": ["node"],
    "skipLibCheck": true,
    "noEmitOnError": true,
    "noEmit": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts", "reset.d.ts"]
}
```

**Dima**: "Once we add tests, `npm run check` runs the compiler and then those test files."

**Idan**: "Give it these files too. And for this little project, I want the unchecked parse to stop at the return."

She adds one declaration:

```typescript
// reset.d.ts
interface JSON {
  parse(
    text: string,
    reviver?: (this: any, key: string, value: any) => any,
  ): unknown;
}
```

The same compiler command now reports **TS2322: Type 'unknown' is not assignable to type 'Refund'.** It points to the `return`.

**Dima**: "Now that sentence in the explanation has some work to do."

**Idan**: "This adds an overload to the global interface. Our [later signature](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) wins this call. It belongs to this program, including its imports, like the augmentation in Chapter 13."

**Chen**: "And if the answer just asserts Refund?"

**Idan**: "It hasn't established the fields. We'll ask for checked construction and test the behavior. No casts isn't a certificate either."

**Dima**: "Good. I don't want to spend the afternoon counting casts."

### "I've written half of it"

Dima removes `src/probe.ts`; it has done its job. They replace the contract so the caller can handle a rejected payload without catching a parser exception.

```typescript
// src/contract.ts — replacement, kept for both candidates
export type Refund = { id: string; cents: number };
export type Result =
  | { ok: true; value: Refund }
  | { ok: false; error: string };
export type ParseRefund = (raw: string) => Result;
```

**Idan**: "A hundred cents should come back as a hundred cents. A negative amount should fail."

**Dima**: "That's two cases. I can afford two cases."

They write the first acceptance file. The assignment to `parse` checks the callable contract; the tests exercise values.

```typescript
// test/refund.test.ts — initial owned tests
import { test } from "node:test";
import assert from "node:assert/strict";
import type { ParseRefund } from "../src/contract.ts";
import { parseRefund } from "../src/parse-refund.ts";

const parse: ParseRefund = parseRefund;

test("keeps numeric cents", () => {
  assert.deepEqual(parse('{"id":"r1","cents":100}'), {
    ok: true, value: { id: "r1", cents: 100 },
  });
});

test("rejects a negative amount", () => {
  assert.deepEqual(parse('{"id":"r1","cents":-1}'), {
    ok: false, error: "invalid amount",
  });
});
```

**Dima**: "Types. Configuration. Tests. At what point do I admit I've written half the function and finish it myself?"

**Idan**: "You haven't written the object checks. Or the failure paths."

**Dima**: "I've written the interesting part."

**Eli**: "Then perhaps the interesting part was deciding what it should do."

**Dima**: "That's an expensive way to agree with me. Suppose I ask it to propose the contract first. Does that count, or must I personally type every brace?"

**Eli**: "Who types the braces isn't the question. Who decides whether the contract describes the job?"

**Dima**: "Me, apparently."

**Eli**: "You can use its proposal. But you have to decide whether that is the job you meant."

**Chen**: "The answer agrees with itself. Very harmonious."

**Dima**: "Fine. But I'm not going to specify every possible string before asking for a parser. That's a parser written in English."

**Idan**: "Give it inputs you can explain. If you can't say why one should pass, we haven't settled the rule yet."

**Dima**: "Two cases, then. I'm holding you to that."

He selects the contract, test file, configuration, manifest and reset declaration, and sends another request:

> Implement src/parse-refund.ts against these files. Construct the returned refund from checked fields. Use npm run check. Change only the implementation; report any conflict with the supplied files. Don't replace a failing check with a cast or suppression.

The returned file is:

```typescript
// src/parse-refund.ts — second returned implementation
import type { Result } from "./contract.ts";

export function parseRefund(raw: string): Result {
  try {
    const value = JSON.parse(raw);
    if (
      typeof value !== "object" || value === null ||
      !("id" in value) || typeof value.id !== "string" ||
      !("cents" in value)
    ) {
      return { ok: false, error: "invalid refund" };
    }
    const cents = Number(value.cents);
    if (
      typeof cents !== "number" ||
      !Number.isSafeInteger(cents) || cents < 0
    ) {
      return { ok: false, error: "invalid amount" };
    }
    return { ok: true, value: { id: value.id, cents } };
  } catch {
    return { ok: false, error: "invalid JSON" };
  }
}
```

Its explanation says: *"The parser validates the object, normalizes cents to a non-negative safe integer, and returns an explicit failure for invalid input."*

Dima runs `npm run check`. Both tests pass. The contract, tests and project files are unchanged.

**Idan**: "That typeof check can't fail after Number. Try the amount without converting it."

She replaces one line in the same implementation:

```typescript
// src/parse-refund.ts — alternative amount line
const cents = value.cents;
```

The checks below it now narrow the unknown field to a number. `npm run check` passes again: same contract, same two tests, same project settings. They have two implementations that satisfy everything they've written so far.

**Dima**: "So either one."

**Idan**: "Either one passes those cases."

**Dima**: "I heard a distinction arriving."

He puts the assistant's `Number(value.cents)` line back. He wants to finish checking the actual answer before they choose.

## The Turn

**Chen**: "Does an empty amount mean zero?"

**Dima**: "An empty amount means somebody forgot the amount."

**Chen**: "To you."

Dima re-creates the probe file, now for the result-returning contract:

```typescript
// src/probe.ts — empty-amount probe
import { parseRefund } from "./parse-refund.ts";

console.log(JSON.stringify(parseRefund('{"id":"r1","cents":""}')));
```

`node src/probe.ts` prints `{"ok":true,"value":{"id":"r1","cents":0}}`.

**Dima**: "A successful refund of absolutely nothing."

**Chen**: "We should send a receipt."

**Idan**: "Number converted the empty string to zero. Zero passed every check after it."

**Dima**: "The webhook sends numbers. If it sends text, I want to know, not turn it into money."

**Eli**: "Which file says that?"

Dima opens the contract. `cents: number`. Then the test file. A hundred. Minus one.

**Dima**: "The contract says number."

**Eli**: "For the output. Both implementations produce one."

**Dima** looks back at the request. "Checked fields. No casts. Run the check."

**Chen**: "It built the value without casts. You ran the check."

**Dima**: "And the explanation said normalizes. I read that as a spelling of validates."

**Dima**: "The provider's contract requires numeric cents. I want a format violation rejected so we can report it to them. Converting the amount would hide it. That's our rule."

**Idan**: "Then put that decision in the next request. With an example that distinguishes the answers."

**Dima**: "I could have written 'don't coerce strings' the first time."

**Eli**: "Yes. That's a requirement in prose. The test runner still needs something it can execute."

**Chen**: "And the hundred-cent refund should keep working. It's the only one so far that refunds anything."

**Idan**: "Keep numeric zero too. A fix that rejects every falsy amount would catch the empty string and break zero."

**Dima**: "And malformed JSON, null, a missing id. The caller needs a failure result for those, not an exception. A fractional cent must fail too; we refund whole cents."

**Chen**: "Two cases?"

**Dima**: "Two was before we successfully refunded nothing."

Dima removes the probe again. They append these cases to `test/refund.test.ts`; the original two stay.

```typescript
// test/refund.test.ts — append after the original tests

test("keeps numeric zero", () => {
  assert.deepEqual(parse('{"id":"r1","cents":0}'), {
    ok: true, value: { id: "r1", cents: 0 },
  });
});

test("rejects text amounts", () => {
  for (const cents of ["", "100"]) {
    assert.deepEqual(parse(JSON.stringify({ id: "r1", cents })), {
      ok: false, error: "invalid amount",
    }, `cents: ${JSON.stringify(cents)}`);
  }
});

test("rejects malformed input", () => {
  for (const raw of ["{", "null", '{"cents":100}', '{"id":"r1","cents":1.5}']) {
    assert.equal(parse(raw).ok, false);
  }
});
```

Dima runs `npm run check` with the returned, coercing implementation. It compiles, but `rejects text amounts` fails on `""`: instead of the expected failure, it returns a success with zero cents. The numeric cases still pass. Replacing the amount line with `const cents = value.cents;` makes all five tests pass.

**Dima**: "That line didn't get more intelligent. We finally asked it a different question."

**Idan**: "And kept the answers we already needed."

**Chen**: "Can we now say handles all edge cases?"

**Dima**: "You can say handles the cases in that file. I'll even let you say it confidently."

## The Verdict

### The next request

Dima keeps the result contract, the five tests and the same project files. The selected implementation is the version without `Number`, with its other branches unchanged. He saves this request for the next time they ask the assistant to regenerate the parser:

> Implement only src/parse-refund.ts. Use src/contract.ts, test/refund.test.ts, tsconfig.json, package.json and reset.d.ts as supplied. The webhook must contain numeric cents: accept non-negative safe integers, including zero, and reject strings rather than coercing them. Return a failure for invalid input. Keep the contract, tests and project files unchanged. If they conflict, report the conflict before implementing. Don't replace a failing check with a cast or suppression. Run npm run check.

**Dima**: "Longer than my first request. Shorter than this meeting."

**Idan**: "And I can point to what each part is asking for."

**Dima**: "Next time we already have a contract and tests, I'm attaching them. I'm not rewriting them to prove I take prompting seriously."

**Eli**: "Agreed. Check whether they express the requirement. Add the missing decision, not a second copy of the project."

**Dima**: "Also, I can ask for proposed cases. I don't have to invent every input alone."

**Idan**: "Of course. But when the proposed case says an empty amount is zero, someone here has to decide whether that's our rule."

Dima runs `npm run check` against the selected file again, with the owned files unchanged. All five tests pass.

**Dima**: "So the explanation stays useful. It called out normalization. I just didn't stop to ask what that meant."

**Idan**: "Yes. Read it. Ask it to explain a choice you don't understand. Then put the choice you accept somewhere the next implementation has to face it."

**Chen**: "What if the next task discovers that one of our expected answers is wrong?"

**Dima**: "Then we change the requirement deliberately. We don't keep a bad test forever. But 'this implementation fails it' isn't, by itself, a reason to change it. That's why the request says to report conflicts."

**Eli**: "Then it knows when to ask you."

**Chen**: "Who owns 'someone here'?"

**Dima**: "I do. It's our webhook integration. If the provider changes the wire format, I update the requirement before asking for the implementation."

**Chen**: "That wasn't in your first request either."

**Dima**: "Neither were you. A serious omission."

## Additional Takes

**Chen**: "Could we put assistant-written files in a separate directory and give only those the stricter configuration?"

**Idan**: "A separate project can be useful. But if its source imports old source, those files join its program too. Check what you're actually handing over before promising that only the new directory is affected."

**Dima**: "And for a display formatter whose existing tests already say what we want?"

**Eli**: "Hand over those tests and its contract. We didn't discover that every request needs a refund policy. We discovered who has to decide one when it does."
