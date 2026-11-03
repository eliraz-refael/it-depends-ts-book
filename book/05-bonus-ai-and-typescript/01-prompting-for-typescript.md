# Bonus 1: Which File Says That?

## The Principle

**Prof. Eli Typeworth**: "Before asking for code, put the decisions it must respect in its signature and in examples of success and rejection. Existing signatures and tests count. Send them with the project configuration and the command that runs the compiler and tests. Agree which files may change. The configuration also checks the source files they import into the project, so a stricter setting can make the job bigger than you meant."

"Run that command against the returned implementation. Compiling through `any`, an `as` assertion or a non-null `!` doesn't establish that the value was checked. Code without them can still do the wrong thing. The checks enforce what you've expressed in them. Someone still has to own what you meant."

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

**Dima**: "`JSON.parse` handed it `any`. The return annotation didn't inspect the value. I know. I'm asking what to send next time so we don't have this conversation again."

**Chen Override**: "You could send this conversation."

**Dima**: "I'd like the request to be shorter than the function."

### "Which project?"

Dima opens the files already in this small scratch project. This is its `package.json`:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "check": "tsc -p tsconfig.json && node --test \"test/**/*.test.ts\""
  },
  "devDependencies": {
    "typescript": "7.0.2",
    "@types/node": "22.20.5"
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
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

**Dima**: "Once we add tests, `npm run check` runs the compiler and then those test files."

**Idan**: "Give it these files too. And for this little project, I want the unchecked parse to stop at the return."

She adds `reset.d.ts` to the config's `include` and writes a [later overload](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) to the global `JSON` interface:

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

**Chen**: "Does that change every `JSON.parse` in the shop?"

**Idan**: "Only in this program, including the source it imports. Our later overload wins this call."

**Chen**: "And if the answer just asserts Refund?"

**Idan**: "It hasn't established the fields. We'll ask for checked construction and test the behavior."

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

They write the first acceptance file.

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

**Chen**: "If it proposes both and the code passes, the answer agrees with itself."

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

Dima runs `npm run check` again without changing the contract, tests or project settings. Both implementations pass.

**Dima**: "So either one."

**Idan**: "Either one passes those cases."

**Dima**: "I can afford two tests. I'm not maintaining two parsers. What haven't we decided?"

He puts the assistant's `Number(value.cents)` line back.

**Dima**: "Let's finish checking the actual answer before we choose."

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

**Dima**: "Hang on. I didn't ask it to turn text into money."

**Eli**: "Which file says that?"

Dima opens the contract. `cents: number`. Then the test file. A hundred. Minus one.

**Dima**: "The contract says number."

**Eli**: "For the output. Both implementations produce one."

Dima looks back at the request. "Checked fields. No casts. Run the check."

**Chen**: "It built the value without casts. You ran the check."

**Dima**: "And the explanation said normalizes. I read that as a spelling of validates. The provider's contract requires numeric cents. I want a format violation rejected so we can report it to them. Converting the amount would hide it. That's our rule."

**Idan**: "Then put that decision in the next request. With an example that distinguishes the answers."

**Dima**: "I could have written 'don't coerce strings' the first time."

**Eli**: "Yes. And a test that fails when it coerces."

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

Dima runs `npm run check` with the returned, coercing implementation. It compiles, but `rejects text amounts` fails on `""`: instead of the expected failure, it returns a success with zero cents. The other four pass. Replacing the amount line with `const cents = value.cents;` makes all five tests pass.

**Dima**: "That line didn't get more intelligent. We finally asked it a different question."

**Idan**: "And kept the answers we already needed."

**Chen**: "Can we now say handles all edge cases?"

**Dima**: "You can say handles the cases in that file. I'll even let you say it confidently."

## The Verdict

> When two implementations pass and disagree, the checks haven't decided the behavior. The owner decides, and adds the example that tells them apart.

### The next request

Dima keeps the result contract, the five tests and the same project files. The selected implementation is the version without `Number`, with its other branches unchanged. He saves this request for the next time they ask the assistant to regenerate the parser:

> Implement only src/parse-refund.ts. Use src/contract.ts, test/refund.test.ts, tsconfig.json, package.json and reset.d.ts as supplied. The webhook must contain numeric cents: accept non-negative safe integers, including zero, and reject strings rather than coercing them. Return a failure for invalid input. Keep the contract, tests and project files unchanged. If they conflict, report the conflict before implementing. Don't replace a failing check with a cast or suppression. Run npm run check.

**Dima**: "Longer than my first request. Shorter than this meeting."

**Idan**: "And I can point to what each part is asking for."

**Dima**: "Next time we already have a contract and tests, I'm attaching them. I'm not rewriting them to prove I take prompting seriously."

**Eli**: "Then use them."

**Dima**: "And I'm still asking for proposed cases."

**Idan**: "Fine. Someone here still decides what the answers should be."

**Dima**: "It did tell us 'normalizes'."

**Idan**: "And you read 'validates'. Read that bit next time."

**Chen**: "What if the next task discovers that one of our expected answers is wrong?"

**Dima**: "Then we change the requirement deliberately. We don't keep a bad test forever. But 'this implementation fails it' isn't, by itself, a reason to change it. That's why the request says to report conflicts."

**Chen**: "Who owns 'someone here'?"

**Dima**: "I do. It's our webhook integration. If the provider changes the wire format, I update the requirement before asking for the implementation."

**Chen**: "That wasn't in your first request either."

**Dima**: "Neither were you. A serious omission."

## Additional Takes

**Chen**: "Could we put assistant-written files in a separate directory and give only those the stricter configuration?"

**Idan**: "A separate project can be useful. But if its source imports old source, those files join its program too. Check what you're actually handing over before promising that only the new directory is affected."

**Dima**: "And for a display formatter whose existing tests already say what we want?"

**Eli**: "Hand over those tests and its contract. We didn't discover that every request needs a refund policy. We discovered who has to decide one when it does."
