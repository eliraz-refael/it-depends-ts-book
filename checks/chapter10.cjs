// npm ci && node checks/chapter10.cjs
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/02-advanced-typescript/04-infer-keyword.md"), "utf8");
const blocks = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const matches = blocks.filter(b => b.startsWith(prefix));
  assert.equal(matches.length, 1, `Expected one fence starting with ${prefix}`);
  used.add(matches[0]);
  return matches[0] + "\n";
}
const sdk = block("interface Shipment {");
const oldTypes = block("type Result<T> =");
const newTypes = oldTypes.slice(0, oldTypes.indexOf("type Safe<C>")) + block("// Replacement for Safe.");
const unwrap = block("type Unwrap<T>");
const proxy = block("function safe<C");
const overloads = block("type SafeCourier =");
const oldGuard = block("function acceptTrackingCode(text:");
const newGuard = block("// Replacement for acceptTrackingCode");
const syncProxy = block("type CourierWithSyncCheck =");
const attempt = block("async function attempt<T>");
const adapter = block("function retrieve(code:");
const trackingApi = block("interface TrackingApi");
const constrained = block("type AsyncMembers<C>");
const gate = constrained.slice(0, constrained.indexOf("declare const trackingApi:"));
const oldBase = sdk + oldTypes + proxy + overloads;
const newBase = sdk + newTypes + proxy + overloads;
const equal = `
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch10-"));
const cases = [];
function example(name, code, expected = []) {
  const filename = path.join(scratch, name + ".ts");
  fs.writeFileSync(filename, "export {};\n" + code);
  cases.push({name, filename, expected});
}
function fact(name, code, base = newBase) { example(name, base + equal + code); }
example("original-fences", oldBase + unwrap + block('raw.retrieve("TRK-42")') +
  block("type RetrieveArguments") + block('courier.retrieve("TRK-42")') + oldGuard +
  block('raw.isTrackingCode("bad")'), [2554]);
example("repaired-wrapper-still-accepts-negated-call", newBase + oldGuard);
example("repaired-wrapper-flags-positive-call", newBase + `
function check(text: string) {
  if (courier.isTrackingCode(text)) return "accepted";
  return "rejected";
}
`, [2801]);
example("repaired-fences", newBase + unwrap + newGuard + block("type OneLayer"));
example("synchronous-exception-fences", newBase + syncProxy +
  "const checkedCourier = safeCourier(raw);\n" + oldGuard.replaceAll("courier.", "checkedCourier."));
example("adapter-and-margin-fences", newBase + attempt + adapter +
  trackingApi + block("function keep<T>"));
example("constrained-wrapper-fence", newBase + trackingApi + constrained, [2345]);
assert.equal(used.size, blocks.length, "Every TypeScript fence must be exercised");

fact("original-pattern-last-signature", `
type Args = Expect<Equal<Parameters<Safe<Courier>["retrieve"]>, [code: string, options: {events: true}]>>;
type Return = Expect<Equal<ReturnType<Safe<Courier>["retrieve"]>, Promise<Result<ShipmentWithEvents>>>>;
type SyncLie = Expect<Equal<ReturnType<Safe<Courier>["isTrackingCode"]>, boolean>>;
`, oldBase);
fact("repaired-sync-signature", `
type Args = Expect<Equal<Parameters<Safe<Courier>["isTrackingCode"]>, [text: string]>>;
type Return = Expect<Equal<ReturnType<Safe<Courier>["isTrackingCode"]>, Promise<Result<boolean>>>>;
`);
example("repaired-result-is-not-a-boolean", newBase +
  'const valid: boolean = courier.isTrackingCode("bad");', [2322]);
fact("basic-overload-shape", `
const result = courier.retrieve("TRK-42");
type Check = Expect<Equal<typeof result, Promise<Result<Shipment>>>>;
`);
fact("events-overload-shape", `
const result = courier.retrieve("TRK-42", {events: true});
type Check = Expect<Equal<typeof result, Promise<Result<ShipmentWithEvents>>>>;
`);
example("no-events-on-basic-result", newBase + `
async function check() {
  const result = await courier.retrieve("TRK-42");
  if (result.ok) result.value.events;
}
`, [2339]);
example("region-remains-readonly", newBase + 'courier.region = "elsewhere";', [2540]);
example("invalid-request-options", newBase + 'courier.retrieve("TRK-42", {events: false});', [2322]);
example("optional-options-are-not-a-public-overload", sdk + `
function forward(code: string, options?: {events: true}) {
  return raw.retrieve(code, options);
}
`, [2345]);
fact("sync-exception-composes-with-overload-repair", syncProxy + `
const checked = safeCourier(raw);
const basic = checked.retrieve("TRK-42");
const events = checked.retrieve("TRK-42", {events: true});
const valid = checked.isTrackingCode("TRK-42");
type Basic = Expect<Equal<typeof basic, Promise<Result<Shipment>>>>;
type Events = Expect<Equal<typeof events, Promise<Result<ShipmentWithEvents>>>>;
type Valid = Expect<Equal<typeof valid, boolean>>;
type Region = Expect<Equal<typeof checked.region, string>>;
`);
fact("adapter-preserves-facade", syncProxy + attempt + adapter + `
const facade: CourierWithSyncCheck = courierAdapter;
const basic = courierAdapter.retrieve("TRK-42");
const events = courierAdapter.retrieve("TRK-42", {events: true});
const valid = courierAdapter.isTrackingCode("TRK-42");
type Basic = Expect<Equal<typeof basic, Promise<Result<Shipment>>>>;
type Events = Expect<Equal<typeof events, Promise<Result<ShipmentWithEvents>>>>;
type Valid = Expect<Equal<typeof valid, boolean>>;
`);
fact("unwrap-versus-awaited", unwrap + `
type Single = Expect<Equal<Unwrap<Promise<Shipment>>, Shipment>>;
type Plain = Expect<Equal<Unwrap<string>, string>>;
type Layer = Expect<Equal<Unwrap<Promise<Promise<Shipment>>>, Promise<Shipment>>>;
type Finished = Expect<Equal<Awaited<Promise<Promise<Shipment>>>, Shipment>>;
type Like = Expect<Equal<Awaited<PromiseLike<Shipment>>, Shipment>>;
type Unchanged = Expect<Equal<Unwrap<PromiseLike<Shipment>>, PromiseLike<Shipment>>>;
type Boolean = Expect<Equal<Awaited<boolean>, boolean>>;
`);
example("infer-scope-false-branch", 'type Broken<T> = T extends Promise<infer U> ? U : U;', [2304]);
example("infer-scope-outside-conditional", 'type Broken<T extends Promise<infer U>> = U;', [1338, 2304]);
fact("generic-relationship-loss", attempt + `
function keep<T>(value: T): T { return value; }
type Extracted = Expect<Equal<ReturnType<typeof keep>, unknown>>;
type Wrapped = Expect<Equal<ReturnType<Safe<{keep: typeof keep}>["keep"]>, Promise<Result<unknown>>>>;
const preserved = attempt(() => keep({code: "TRK-42"}));
type Preserved = Expect<Equal<typeof preserved, Promise<Result<{code: string}>>>>;
`);
fact("uniform-generated-client", trackingApi + `
type Lookup = Expect<Equal<SafeTrackingApi["lookup"], (request: {code: string}) => Promise<Result<Shipment>>>>;
type History = Expect<Equal<SafeTrackingApi["history"], (request: {code: string}) => Promise<Result<string[]>>>>;
`);
example("constraint-accepts-v4-and-generated-client", newBase + trackingApi + gate + `
declare const v4: {region: string; retrieve(code: string): Promise<Shipment>};
declare const generated: TrackingApi;
safeRequests(v4);
safeRequests(generated);
`);
example("constraint-still-reads-last-overload", newBase + gate + `
declare const requests: Pick<Courier, "retrieve">;
const checked = safeRequests(requests);
checked.retrieve("TRK-42");
`, [2554]);
example("constraint-rejects-mixed-sync-async-return", newBase + gate + `
declare const mixed: {check(text: string): boolean | Promise<boolean>};
safeRequests(mixed);
`, [2345]);
example("mixed-return-is-also-rejected-without-brackets", newBase +
  gate.replace("[R] extends [PromiseLike<unknown>]", "R extends PromiseLike<unknown>") + `
declare const mixed: {check(text: string): boolean | Promise<boolean>};
safeRequests(mixed);
`, [2345]);
fact("optional-method-needs-separate-handling", gate + `
type Optional = {check?: (text: string) => boolean};
type Unchanged = Expect<Equal<Safe<Optional>["check"], ((text: string) => boolean) | undefined>>;
type AlsoUnchanged = Expect<Equal<AsyncMembers<Optional>["check"], ((text: string) => boolean) | undefined>>;
`);
fact("filtering-can-intentionally-return-never", `
type PromiseValue<T> = T extends Promise<infer V> ? V : never;
type Filtered = Expect<Equal<PromiseValue<Promise<Shipment> | string>, Shipment>>;
`);

const {diagnostics} = compile(cases.map(c => c.filename), {noEmit: true}, scratch);
for (const test of cases) {
  const found = diagnostics.filter(d => d.fileName === test.filename);
  assert.deepEqual(found.map(d => d.code).sort(), test.expected.slice().sort(), test.name + "\n" + describe(found));
}
assert.equal(diagnostics.filter(d => !cases.some(c => c.filename === d.fileName)).length, 0, describe(diagnostics));

// A test double for the fictional SDK, not extra manuscript implementation.
// Its ordinary methods depend on their receiver, and can throw synchronously or reject.
const fixture = `
const sdkFailure = {message: "courier unavailable"};
function sdkRetrieve(this: {region: string}, code: string): Promise<Shipment>;
function sdkRetrieve(this: {region: string}, code: string, options: {events: true}): Promise<ShipmentWithEvents>;
function sdkRetrieve(this: {region: string}, code: string, options?: {events: true}): Promise<Shipment | ShipmentWithEvents> {
  if (code === "throw") throw sdkFailure;
  if (code === "reject") return Promise.reject(sdkFailure);
  const shipment = {code, status: this.region + ":in transit"};
  return Promise.resolve(options ? {...shipment, events: ["collected"]} : shipment);
}
const raw: Courier = {
  region: "test",
  retrieve: sdkRetrieve,
  isTrackingCode(text) { return this.region === "test" && /^TRK-\\d+$/.test(text); },
};
`;
function runtimeModule(name, types, guard, extra, exports) {
  const filename = path.join(scratch, name + ".ts");
  const source = sdk.replace("declare const raw: Courier;", fixture) + types + proxy + overloads + guard + extra +
    "\nexport { raw, courier, sdkFailure, " + exports + " };\n";
  fs.writeFileSync(filename, source);
  const out = path.join(scratch, "out-" + name);
  const {diagnostics: found} = compile([filename], {outDir: out}, scratch);
  assert.equal(found.length, 0, name + "\n" + describe(found));
  return require(path.join(out, name + ".js"));
}
(async () => {
  let runtimeGroups = 0;
  const original = runtimeModule("original-runtime", oldTypes, oldGuard, "", "acceptTrackingCode");
  assert.equal(original.raw.isTrackingCode("bad"), false);
  assert.equal(original.acceptTrackingCode("bad"), "accepted");
  assert(original.courier.isTrackingCode("bad") instanceof Promise);
  assert.deepEqual(await original.courier.isTrackingCode("bad"), {ok: true, value: false});
  runtimeGroups++;

  const repaired = runtimeModule("repaired-runtime", newTypes, newGuard, "", "acceptTrackingCode");
  assert.equal(await repaired.acceptTrackingCode("bad"), "rejected");
  assert.equal(await repaired.acceptTrackingCode("TRK-42"), "accepted");
  runtimeGroups++;

  const sync = runtimeModule("sync-runtime", newTypes,
    oldGuard.replaceAll("courier.", "syncCourier."),
    syncProxy + "const syncCourier = safeCourier(raw);\n", "syncCourier, acceptTrackingCode");
  assert.equal(sync.syncCourier.isTrackingCode("bad"), false);
  assert.equal(sync.acceptTrackingCode("bad"), "rejected");
  assert.equal(sync.acceptTrackingCode("TRK-42"), "accepted");
  runtimeGroups++;

  const adapted = runtimeModule("adapter-runtime", newTypes,
    oldGuard.replaceAll("courier.", "courierAdapter."), attempt + adapter,
    "courierAdapter, acceptTrackingCode, attempt");
  assert.equal(adapted.acceptTrackingCode("bad"), "rejected");
  assert.equal(adapted.acceptTrackingCode("TRK-42"), "accepted");
  runtimeGroups++;

  for (const [client, failure] of [
    [repaired.courier, repaired.sdkFailure],
    [sync.syncCourier, sync.sdkFailure],
    [adapted.courierAdapter, adapted.sdkFailure],
  ]) {
    assert.equal(client.region, "test");
    assert.deepEqual(await client.retrieve("TRK-42"), {
      ok: true, value: {code: "TRK-42", status: "test:in transit"},
    });
    assert.deepEqual(await client.retrieve("TRK-42", {events: true}), {
      ok: true, value: {code: "TRK-42", status: "test:in transit", events: ["collected"]},
    });
    for (const code of ["throw", "reject"]) {
      const result = await client.retrieve(code);
      assert.equal(result.ok, false);
      assert.equal(result.error, failure);
    }
    runtimeGroups++;
  }
  assert.deepEqual(await adapted.attempt(() => false), {ok: true, value: false});
  assert.deepEqual(await adapted.attempt(() => Promise.resolve(42)), {ok: true, value: 42});
  const thenable = {then(resolve) { resolve(Promise.resolve(42)); }};
  assert.deepEqual(await adapted.attempt(() => thenable), {ok: true, value: 42});
  for (const failure of [null, "failure", new Error("failure")]) {
    const syncResult = await adapted.attempt(() => { throw failure; });
    const asyncResult = await adapted.attempt(() => Promise.reject(failure));
    assert.equal(syncResult.ok, false);
    assert.equal(asyncResult.ok, false);
    assert.equal(syncResult.error, failure);
    assert.equal(asyncResult.error, failure);
  }
  runtimeGroups++;
  console.log(JSON.stringify({typescript: version, chapterFences: blocks.length,
    compilerCases: cases.length, runtimeScenarioGroups: runtimeGroups, scratch}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
