// Compare completion policy and committed state, using the manuscript's serial model.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/03-patterns-and-design/01-error-handling.md"), "utf8");
const blocks = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix, occurrence) {
  const matches = blocks.map((text, index) => ({text, index})).filter(b => b.text.startsWith(prefix));
  if (occurrence === undefined) assert.equal(matches.length, 1, `Unique fence: ${prefix}`);
  const selected = matches[occurrence ?? 0];
  assert(selected, `Missing fence ${prefix}, occurrence ${occurrence}`);
  used.add(selected.index);
  return selected.text + "\n";
}
const types = block("type Failure =");
const message = block("function failureMessage(");
const original = block("async function bookParty(store:");
const success = block('const store = testStore([["A1", false], ["A2", false]]);');
const result = block("type Result<T, E> =");
const inside = block("// Replacement bookParty: conversion inside");
const submit = block("// Replacement submit:");
const partial = block('const store = testStore([["A1", false], ["A2", true]]);', 0);
const model = block("function testStore(");
const outside = block("// Replacement bookParty: conversion after");
const adapter = block("async function transactionResult<");
const tryHold = block("async function tryHold(");
const viaAdapter = block("// Alternative bookParty:");
const restored = block('const store = testStore([["A1", false], ["A2", true]]);', 1);
const catchAnnotation = block("try {");
const broken = `async function brokenBooking(): Promise<Result<Booking, Failure>> {
  throw new TypeError("Broken seat adapter");
}
`;
assert(chapter.includes("Of course it can still reject."));
assert.equal(used.size, blocks.length, "Every TypeScript fence must be exercised");
const common = types + message + result + model;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch14-"));
const cases = [];
function example(name, source, codes = []) {
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, "main.ts");
  source = "export {};\n" + source;
  fs.writeFileSync(file, source);
  const lines = source.split("\n").flatMap((line, i) => /\/\/ Error(?: TS\d+|:)/.test(line) ? [i + 1] : []);
  assert.equal(lines.length, codes.length, `Diagnostic markers in ${name}`);
  const outDir = path.join(dir, "out");
  const checked = compile([file], {outDir}, dir);
  assert.deepEqual(checked.diagnostics.map(d => ({line: d.line, code: d.code})),
    codes.map((code, i) => ({line: lines[i], code})), `${name}\n${describe(checked.diagnostics)}`);
  for (const diagnostic of checked.diagnostics) {
    const quote = source.split("\n")[diagnostic.line - 1].match(/\/\/ Error TS(\d+): (.*)$/);
    if (quote) {
      assert.equal(diagnostic.code, Number(quote[1]));
      assert.equal(diagnostic.message, quote[2], `Printed diagnostic in ${name}`);
    }
  }
  const test = {name, dir, outDir, checked};
  cases.push(test);
  return test;
}
const exportApi = "\nexport {bookParty, submit, testStore, SeatRefused, failureMessage};\n";
const versions = {
  original: common + original,
  inside: common + inside + submit,
  outside: common + outside + submit,
  adapter: common + adapter + tryHold + viaAdapter + submit,
};
const compiled = Object.fromEntries(Object.entries(versions).map(([name, source]) =>
  [name, example(name, source + exportApi + (name === "adapter" ? "export {transactionResult, tryHold};\n" : ""))]));
// A correctly typed refactor can return the transaction promise from the try;
// the success Result is built in the callback, but rejection misses the catch.
const noAwait = outside.replace("const booking = await store.transaction(async tx => {",
  "return store.transaction<Result<Booking, Failure>>(async tx => {")
  .replace("return { seats: [...seats] };", "return {ok: true, value: {seats: [...seats]}};")
  .replace("    return { ok: true, value: booking };\n", "");
assert.notEqual(noAwait, outside);
const escapedCatch = example("returning-promise-bypasses-outer-catch", common + noAwait + submit + exportApi);
// Raw transaction<T> also accepts the adapter's callback, but commits its refusal.
const wrongHost = viaAdapter.replace("return transactionResult<Booking, Failure>(store, async tx => {",
  "return store.transaction<Result<Booking, Failure>>(async tx => {");
assert.notEqual(wrongHost, viaAdapter);
const wrongHostCase = example("result-steps-under-raw-host-compile", common + tryHold + wrongHost + submit + exportApi);
const printed = [
  [example("printed-success", versions.original + `async function run() {\n${success}}\nvoid run();\n`), success],
  [example("printed-partial-commit", versions.inside + `async function run() {\n${partial}}\nvoid run();\n`), partial],
  [example("printed-restored-rollback", versions.adapter + `async function run() {\n${restored}}\nvoid run();\n`), restored],
];
example("value-requires-narrowing", versions.outside + `
async function inspect() {
  const result = await bookParty(testStore([["A1", false]]), ["A1"]);
  return result.value; // Error: Result must be narrowed before reading value.
}
`, [2339]);
for (const name of ["original", "outside"]) {
  const extended = versions[name].replace('  | { kind: "unknown-seat"; seat: string };',
    '  | { kind: "unknown-seat"; seat: string }\n  | { kind: "paused"; seat: string };')
    .replace("const unhandled: never = failure;", "const unhandled: never = failure; // Error: the formatter omits paused.");
  assert.notEqual(extended, versions[name]);
  example("new-refusal-exhaustiveness-" + name, extended, [2322]);
}
example("catch-cannot-declare-refusal", types + catchAnnotation, [1196]);
example("catch-starts-unknown", types + `
try { throw new SeatRefused({kind: "occupied", seat: "A2"}); }
catch (error) {
  console.log(error.failure); // Error: a catch binding starts as unknown.
}
`, [18046]);
const brokenCase = example("result-return-can-still-reject", types + result + broken + "export {brokenBooking};\n");
// Check E INSIDE the implementation. A caller-only check misses the any leak
// from instanceof on a class declared in a generic function (discovery finding).
const slip = adapter.replace("return refused;", "return {ok: false, error: refused.error.nonexistent}; // Error: E has no such field.");
assert.notEqual(slip, adapter);
example("adapter-restoration-keeps-E", types + result + slip, [2339]);
example("undefined-refusal-payload-is-valid", common + adapter + `
async function refuse(store: Store): Promise<Result<Booking, undefined>> {
  return transactionResult<Booking, undefined>(store, async tx => {
    await tx.hold("A1");
    return {ok: false, error: undefined};
  });
}
`);

// The preflight concession: add a readable draft contract. It duplicates hold's
// two refusal rules and checks duplicate seat requests before making any write.
// This is SERIAL, just like the manuscript model. It proves nothing about races.
assert(chapter.includes("preflight would work."));
const readableTypes = types.replace("  hold(seat: string): Promise<void>;",
  '  hold(seat: string): Promise<void>;\n  state(seat: string): "unknown" | "occupied" | "free";');
const readableModel = model.replace("const tx: Tx = {", `const tx: Tx = {
        state(seat) {
          if (!draft.has(seat)) return "unknown";
          return draft.get(seat) ? "occupied" : "free";
        },`);
const preflight = example("preflight-with-readable-draft", readableTypes + result + readableModel + `
async function bookParty(store: Store, seats: readonly string[]): Promise<Result<Booking, Failure>> {
  return store.transaction<Result<Booking, Failure>>(async tx => {
    const requested = new Set<string>();
    for (const seat of seats) {
      const state = tx.state(seat);
      if (state === "unknown") return {ok: false, error: {kind: "unknown-seat", seat}};
      if (state === "occupied" || requested.has(seat)) return {ok: false, error: {kind: "occupied", seat}};
      requested.add(seat);
    }
    for (const seat of seats) await tx.hold(seat);
    return {ok: true, value: {seats: [...seats]}};
  });
}
export {bookParty, testStore};
`);
// The owned-host alternative changes the COMMIT POLICY, without a throw marker.
assert(chapter.includes("commit only when `result.ok` is true"));
const ownedModel = model.replace("function testStore(", "function resultStore(")
  .replace("async transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T>",
    "async transaction<T, E>(work: (tx: Tx) => Promise<Result<T, E>>): Promise<Result<T, E>>")
  .replace("committed = draft;", "if (value.ok) committed = draft;");
const ownedBooking = viaAdapter.replace("store: Store,", "store: ReturnType<typeof resultStore>,")
  .replace("return transactionResult<Booking, Failure>(store, async tx => {",
    "return store.transaction<Booking, Failure>(async tx => {");
assert.notEqual(ownedBooking, viaAdapter);
const owned = example("owned-host-checks-result", types + result + ownedModel + tryHold + ownedBooking +
  "export {bookParty, resultStore};\n");

let runtimeGroups = 0;
async function group(name, body) {
  try { await body(); } catch (error) { error.message = name + ": " + error.message; throw error; }
  runtimeGroups++;
}
function load(test) { return require(path.join(test.outDir, "main.js")); }
async function main() {
  const api = Object.fromEntries(Object.entries(compiled).map(([name, test]) => [name, load(test)]));
  for (const [test, fence] of printed) {
    await group(test.name, () => {
      const comments = [...fence.matchAll(/console\.log\([^\n]+\); \/\/ ("[^"\n]*"|true|false)/g)];
      assert(comments.length);
      const expected = comments.map(m => String(JSON.parse(m[1])) + "\n").join("");
      const ran = cp.spawnSync(process.execPath, [path.join(test.outDir, "main.js")], {encoding: "utf8", timeout: 10000});
      if (ran.error) throw ran.error;
      assert.equal(ran.status, 0, ran.stderr);
      assert.equal(ran.stdout, expected);
      assert.equal(ran.stderr, "");
    });
  }
  assert.equal([...chapter.matchAll(/console\.log\([^\n]+\); \/\/ /g)].length, 7,
    "All printed value comments must be covered above");
  await group("all-free-commits-in-all-versions", async () => {
    for (const m of Object.values(api)) {
      const store = m.testStore([["A1", false], ["A2", false]]);
      assert.equal(await m.submit(store, ["A1", "A2"]), "Booked A1, A2.");
      assert.equal(store.isHeld("A1"), true);
      assert.equal(store.isHeld("A2"), true);
    }
  });
  for (const [kind, lastSeat, entries, expected] of [
    ["occupied", "A2", [["A1", false], ["A2", true]], "A2 is taken."],
    ["unknown-seat", "Z9", [["A1", false]], "Seat Z9 does not exist."],
  ]) {
    await group(kind + "-after-write-same-response-different-state", async () => {
      for (const [name, m] of Object.entries(api)) {
        const store = m.testStore(entries);
        assert.equal(await m.submit(store, ["A1", lastSeat]), expected);
        assert.equal(store.isHeld("A1"), name === "inside");
        if (kind === "occupied") assert.equal(store.isHeld("A2"), true);
        else assert.equal(store.isHeld("Z9"), undefined);
      }
    });
  }
  await group("refused-first-masks-the-migration", async () => {
    for (const m of Object.values(api)) {
      const store = m.testStore([["A1", false], ["A2", true]]);
      assert.equal(await m.submit(store, ["A2", "A1"]), "A2 is taken.");
      assert.equal(store.isHeld("A1"), false);
    }
  });
  await group("returned-and-thrown-refusals-have-identical-payloads", async () => {
    const failure = {kind: "occupied", seat: "A2"};
    for (const [name, m] of Object.entries(api)) {
      const store = m.testStore([["A1", false], ["A2", true]]);
      if (name === "original") {
        await assert.rejects(m.bookParty(store, ["A1", "A2"]), error => {
          assert(error instanceof m.SeatRefused);
          assert.deepEqual(error.failure, failure);
          return true;
        });
      } else assert.deepEqual(await m.bookParty(store, ["A1", "A2"]), {ok: false, error: failure});
    }
  });
  await group("unexpected-rejections-preserve-identity-and-rollback", async () => {
    for (const m of Object.values(api)) {
      for (const thrown of [new TypeError("Broken seat adapter"), "connection lost", undefined]) {
        const base = m.testStore([["A1", false], ["A2", false]]);
        const store = {transaction: work => base.transaction(tx => work({
          async hold(seat) { if (seat === "A2") throw thrown; await tx.hold(seat); },
        }))};
        await assert.rejects(m.submit(store, ["A1", "A2"]), error => Object.is(error, thrown));
        assert.equal(base.isHeld("A1"), false);
      }
    }
  });
  await group("returning-promise-does-not-catch-its-later-rejection", async () => {
    const m = load(escapedCatch);
    const store = m.testStore([["A1", false], ["A2", true]]);
    await assert.rejects(m.submit(store, ["A1", "A2"]), error => error instanceof m.SeatRefused);
    assert.equal(store.isHeld("A1"), false);
  });
  await group("raw-host-reopens-the-bug-for-result-steps", async () => {
    const m = load(wrongHostCase);
    const store = m.testStore([["A1", false], ["A2", true]]);
    assert.equal(await m.submit(store, ["A1", "A2"]), "A2 is taken.");
    assert.equal(store.isHeld("A1"), true);
  });
  await group("undefined-E-is-not-an-empty-refusal-slot", async () => {
    const store = api.adapter.testStore([["A1", false]]);
    const value = await api.adapter.transactionResult(store, async tx => {
      await tx.hold("A1");
      return {ok: false, error: undefined};
    });
    assert.deepEqual(value, {ok: false, error: undefined});
    assert.equal(store.isHeld("A1"), false);
  });
  await group("ordinary-error-with-marker-message-is-not-consumed", async () => {
    const store = api.adapter.testStore([["A1", false]]);
    const unexpected = new Error("Transaction refused");
    await assert.rejects(api.adapter.transactionResult(store, async tx => {
      await tx.hold("A1"); throw unexpected;
    }), error => error === unexpected);
    assert.equal(store.isHeld("A1"), false);
  });
  await group("rewrapping-host-does-not-restore-the-result", async () => {
    const base = api.adapter.testStore([["A1", false]]);
    const store = {async transaction(work) {
      try { return await base.transaction(work); }
      catch (cause) { throw new Error("Store wrapped rejection", {cause}); }
    }};
    await assert.rejects(api.adapter.transactionResult(store, async tx => {
      await tx.hold("A1"); return {ok: false, error: "refused"};
    }), error => error.message === "Store wrapped rejection" && error.cause instanceof Error);
    assert.equal(base.isHeld("A1"), false);
  });
  // Additional adapter boundary regression; no real rollback-failure model is claimed.
  await group("replacement-host-failure-must-escape", async () => {
    const failure = new Error("Injected host failure");
    // Inject a provider failure. This tests propagation, not a real DB rollback.
    const store = {async transaction(work) {
      try { return await work({hold: async () => {}}); }
      catch { throw failure; }
    }};
    await assert.rejects(api.adapter.transactionResult(store, async () => ({ok: false, error: "refused"})),
      error => error === failure);
  });
  await group("preflight-works-with-the-added-draft-read-contract", async () => {
    const m = load(preflight);
    for (const [seats, failure] of [
      [["A1", "A2"], {kind: "occupied", seat: "A2"}],
      [["A1", "Z9"], {kind: "unknown-seat", seat: "Z9"}],
      [["A1", "A1"], {kind: "occupied", seat: "A1"}],
    ]) {
      const store = m.testStore([["A1", false], ["A2", true]]);
      assert.deepEqual(await m.bookParty(store, seats), {ok: false, error: failure});
      assert.equal(store.isHeld("A1"), false);
    }
    const store = m.testStore([["A1", false], ["A2", false]]);
    assert.deepEqual(await m.bookParty(store, ["A1", "A2"]), {ok: true, value: {seats: ["A1", "A2"]}});
    assert.equal(store.isHeld("A1"), true);
    assert.equal(store.isHeld("A2"), true);
  });
  await group("owned-host-can-decide-without-throwing-a-refusal", async () => {
    const m = load(owned);
    const refused = m.resultStore([["A1", false], ["A2", true]]);
    assert.deepEqual(await m.bookParty(refused, ["A1", "A2"]), {ok: false, error: {kind: "occupied", seat: "A2"}});
    assert.equal(refused.isHeld("A1"), false);
    const success = m.resultStore([["A1", false], ["A2", false]]);
    assert.deepEqual(await m.bookParty(success, ["A1", "A2"]), {ok: true, value: {seats: ["A1", "A2"]}});
    assert.equal(success.isHeld("A1"), true);
    assert.equal(success.isHeld("A2"), true);
    const bug = new TypeError("broken owned host callback");
    const failed = m.resultStore([["A1", false]]);
    await assert.rejects(failed.transaction(async tx => {await tx.hold("A1"); throw bug;}), e => e === bug);
    assert.equal(failed.isHeld("A1"), false);
  });
  await group("annotated-result-function-can-reject", async () => {
    await assert.rejects(load(brokenCase).brokenBooking(), {name: "TypeError", message: "Broken seat adapter"});
  });
  console.log(`TypeScript ${version}: Chapter 14 — ${blocks.length} fences, ${cases.length} compiler cases, ${runtimeGroups} runtime groups. PASS`);
  console.log(`Fixtures: ${scratch}`);
}
main().catch(error => {console.error(error); process.exitCode = 1;});
