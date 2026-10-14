// Boundary policies: preserve receipts, distinguish unknown from malformed,
// and compare repaired open and closed handoffs against the same consumers.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const root = path.resolve(__dirname, "..");
const chapter = fs.readFileSync(path.join(root,
  "book/03-patterns-and-design/03-runtime-validation.md"), "utf8");
const fences = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix, occurrence) {
  const matches = fences.map((text, index) => ({text, index})).filter(b => b.text.startsWith(prefix));
  if (occurrence === undefined) assert.equal(matches.length, 1, "Unique fence: " + prefix);
  const selected = matches[occurrence ?? 0];
  assert(selected, "Missing fence: " + prefix);
  used.add(selected.index);
  return selected.text + "\n";
}
function before(source, delimiter) {
  const index = source.indexOf(delimiter);
  assert(index >= 0, "Missing split: " + delimiter);
  return source.slice(0, index);
}
const schemas = block('import { z }');
const known = block("function refundForKnown");
const originalReceive = block("interface Inbox");
const incoming = block("const incoming");
const rawReceive = block("type Receipt");
const extras = block("const withEta");
const open = block("const WireStatus");
const label = block("function trackingLabel");
const unfinished = block("function unfinishedLabel");
const badRefund = block("function refundForOpen", 0);
const splitReturns = block("for (const status of");
const repairedRefund = block("function refundForOpen", 1);
const closed = block("type Projection");
const closedOutput = block("console.log(project(");
const repairedClosed = block("const WireUpdate");
const projectedOutput = block("for (const [id, status]");
const fallback = block("const DefaultedStatus");
assert.equal(used.size, fences.length, "Every TypeScript fence is exercised");
const knownFn = before(known, "const update");
const inboxTypes = before(originalReceive, "async function receive");
const receiptType = before(rawReceive, "async function receive");
const incomingValue = before(incoming, "const parsed");
const openDefs = before(open, "console.log(");
const labelFn = before(label, "console.log(");
const badRefundFn = before(badRefund, "console.log(");
const projectionType = before(closed, "function project");
const openBase = schemas + knownFn + openDefs;
const closedBase = schemas + knownFn + receiptType;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch16-"));
// Both the emitted program and the compiler resolve the real locked dependency.
fs.symlinkSync(path.join(root, "node_modules"), path.join(scratch, "node_modules"), "dir");
const cases = [];
function example(name, source, codes = []) {
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir);
  const file = path.join(dir, "main.ts");
  fs.writeFileSync(file, source);
  const lines = source.split("\n").flatMap((line, index) => line.includes("// Error TS") ? [index + 1] : []);
  assert.equal(lines.length, codes.length, "Diagnostic markers: " + name);
  const outDir = path.join(dir, "out");
  const checked = compile([file], {outDir}, dir);
  assert.deepEqual(checked.diagnostics.map(d => ({line: d.line, code: d.code})),
    codes.map((code, i) => ({line: lines[i], code})), name + "\n" + describe(checked.diagnostics));
  const test = {name, outDir, checked};
  cases.push(test);
  return test;
}
const working = example("known-label-and-refunds", schemas + known);
const rejected = example("unfamiliar-enum-diagnostic", schemas + incoming);
const keyPolicies = example("three-extra-key-policies", schemas + extras);
const tagged = example("open-status-output", schemas + incomingValue + open);
const tracking = example("unfamiliar-tracking-label", schemas + incomingValue + openDefs + label);
const incomplete = example("explicit-return-rejects-missing-branch", schemas + openDefs + unfinished, [2366]);
assert.equal(incomplete.checked.diagnostics[0].message,
  "Function lacks ending return statement and return type does not include 'undefined'.");
const inferred = unfinished.replace(": string { // Error TS2366", " {");
assert.notEqual(inferred, unfinished);
example("inferred-return-allows-missing-branch", schemas + openDefs + inferred +
  "const unknownUpdate = OpenUpdate.parse({shipmentId: 's1', status: 'new_status'});\n" +
  "const maybeLabel: string | undefined = unfinishedLabel(unknownUpdate);\n");
example("inferred-return-cannot-promise-string", schemas + openDefs + inferred +
  "const text: string = unfinishedLabel(OpenUpdate.parse({shipmentId: 's1', status: 'new_status'})); // Error TS2322\n", [2322]);
const silent = example("unknown-is-wrongly-finished", openBase + incomingValue + badRefund);
const split = example("split-returns-silently-skip", openBase + labelFn + badRefundFn + splitReturns);
const initialProject = example("closed-projection-withholds-label", closedBase + closed + incomingValue + closedOutput);
const defaulted = example("catch-substitutes-business-status", schemas + fallback);
const original = example("original-endpoint", schemas + originalReceive + "export {receive};\n");
const receipt = example("raw-endpoint", inboxTypes + rawReceive + "export {receive};\n");
const openApi = example("repaired-open-consumers", openBase + labelFn + repairedRefund +
  "export {OpenUpdate, trackingLabel, refundForOpen};\n");
const closedApi = example("repaired-projection", closedBase + openDefs + projectionType + repairedClosed +
  "export {project};\n");
const projected = example("printed-repaired-projections", closedBase + openDefs + projectionType + repairedClosed + projectedOutput);
example("handoff-has-no-unknown-status-branch", schemas + projectionType +
  "function refundWorker(work: Extract<Projection, {kind: 'shipment'}>): RefundDecision {\n" +
  "  if (!work.status.known) return 'skip'; // Error TS2339\n" +
  "  return work.refund;\n}\n", [2339]);
const inspect = example("schema-output-versus-input", schemas + openDefs +
  "export {KnownUpdate, CarrierStatus, OpenUpdate};\n");
example("tag-requires-narrowing", schemas + openDefs +
  "function unsafe(update: OpenUpdate): string {\n" +
  "  return update.status.status; // Error TS2339\n}\n", [2339]);
example("unknown-status-is-not-known-refund-input", openBase +
  "function unsafe(update: OpenUpdate): RefundDecision {\n" +
  "  if (!update.status.known) return refundForKnown(update.status.raw); // Error TS2345\n" +
  "  return refundForKnown(update.status.status);\n}\n", [2345]);
example("known-union-string-admits-any-string", schemas +
  "const arbitrary: KnownStatus | string = 'not_a_known_status';\n" +
  "type IsString<T> = [string] extends [T] ? true : false;\n" +
  "const acceptsEveryString: IsString<KnownStatus | string> = true;\n");
const expandedSchema = schemas.replace('"delivered", "returned",', '"delivered", "returned", "returned_damaged",');
assert.notEqual(expandedSchema, schemas);
const expandedFn = knownFn.replace("RefundDecision {", "RefundDecision { // Error TS2366");
example("enum-expansion-reaches-exhaustive-consumer", expandedSchema + expandedFn, [2366]);
const catchAll = knownFn.replace('    case "delivered": return "skip";', '    case "delivered": return "skip";\n    default: return "skip";');
assert.notEqual(catchAll, knownFn);
const defaultConsumer = example("enum-expansion-default-still-compiles", expandedSchema + catchAll +
  'export const result = refundForKnown("returned_damaged");\n');
const promotedFn = knownFn.replace('    case "returned":', '    case "returned_damaged":\n    case "returned":');
const promoted = example("reviewed-status-gains-explicit-refund-rule", expandedSchema + promotedFn +
  'export const result = refundForKnown("returned_damaged");\n');
// Same handoff through Idan's repaired open parser, for an outcome comparison.
// This adapter is fixture glue, not an additional manuscript implementation.
const openProjection = example("open-repair-equivalent-handoff", openBase + labelFn + repairedRefund + receiptType + projectionType +
  "export function project(receipt: Receipt): Projection {\n" +
  "  const parsed = OpenUpdate.safeParse(receipt.raw);\n" +
  "  if (!parsed.success) return {kind: 'review', receiptId: receipt.id};\n" +
  "  return {kind: 'shipment', receiptId: receipt.id, shipmentId: parsed.data.shipmentId,\n" +
  "    label: trackingLabel(parsed.data), refund: refundForOpen(parsed.data)};\n}\n");
const loggedFallback = example("catch-can-log-without-fixing-meaning", schemas +
  "export const seen: unknown[] = [];\n" +
  "const status = CarrierStatus.catch(ctx => {seen.push(ctx.input); return 'in_transit';});\n" +
  "export const result = status.parse('returned_damaged');\n");

let groups = 0;
async function group(name, body) {
  try { await body(); } catch (error) { error.message = name + ": " + error.message; throw error; }
  groups++;
}
function load(test) { return require(path.join(test.outDir, "main.js")); }
function printed(test) {
  const script = "const out=[];console.log=(...args)=>out.push(args);require(process.argv[1]);process.stdout.write(JSON.stringify(out));";
  return JSON.parse(cp.execFileSync(process.execPath, ["-e", script, path.join(test.outDir, "main.js")], {encoding: "utf8"}));
}
async function main() {
  await group("all-printed-results", () => {
    assert.deepEqual(printed(working), [["in transit"], ["skip"], ["issue"]]);
    const message = 'Invalid option: expected one of "label_created"|"in_transit"|"delivered"|"returned"';
    assert(chapter.includes("// " + message), "The quoted Zod message remains on the page");
    assert.deepEqual(printed(rejected), [[false], [message]]);
    assert.deepEqual(printed(keyPolicies), [
      [{shipmentId: "s1", status: "in_transit"}],
      [{shipmentId: "s1", status: "in_transit", eta: "2026-10-20"}], [false],
    ]);
    assert.deepEqual(printed(tagged), [[{known: false, raw: "held_at_customs"}]]);
    assert.deepEqual(printed(tracking), [["Carrier reports: held at customs"]]);
    assert.deepEqual(printed(silent), [["skip"]]);
    assert.deepEqual(printed(split), [["Carrier reports: returned damaged", "skip"], ["Carrier reports: returned refused", "skip"]]);
    const splitStdout = cp.execFileSync(process.execPath, [path.join(split.outDir, "main.js")], {encoding: "utf8"}).trim();
    assert.equal(splitStdout, splitReturns.split("\n").filter(line => line.startsWith("// ")).map(line => line.slice(3)).join("\n"));
    assert.deepEqual(printed(projected), [
      [{kind: "shipment", receiptId: "r1", shipmentId: "s1", label: "Carrier reports: held at customs", refund: "review"}],
      [{kind: "shipment", receiptId: "r2", shipmentId: "s1", label: "Carrier reports: returned damaged", refund: "review"}],
      [{kind: "shipment", receiptId: "r3", shipmentId: "s1", label: "returned", refund: "issue"}],
      [{kind: "review", receiptId: "r4"}],
    ]);
    assert.deepEqual(printed(initialProject), [[{kind: "review", receiptId: "r1"}]]);
    assert.deepEqual(printed(defaulted), [["in_transit"]]);
  });
  const {KnownUpdate, CarrierStatus, OpenUpdate} = load(inspect);
  await group("strip-does-not-mutate-received-input", () => {
    const body = {shipmentId: "s1", status: "in_transit", eta: "2026-10-20"};
    const parsed = KnownUpdate.parse(body);
    assert.notEqual(parsed, body);
    assert.deepEqual(parsed, {shipmentId: "s1", status: "in_transit"});
    assert.equal(body.eta, "2026-10-20");
  });
  await group("extra-key-policy-does-not-open-enum", () => {
    const z = require("zod");
    for (const schema of [KnownUpdate, z.looseObject(KnownUpdate.shape), z.strictObject(KnownUpdate.shape)]) {
      assert.equal(schema.safeParse({shipmentId: "s1", status: "held_at_customs"}).success, false);
    }
  });
  await group("known-and-unknown-status-tags", () => {
    for (const status of CarrierStatus.options) {
      assert.deepEqual(OpenUpdate.parse({shipmentId: "s1", status}).status, {known: true, status});
    }
    for (const raw of ["held_at_customs", "returned_damaged", "returned_refused"]) {
      assert.deepEqual(OpenUpdate.parse({shipmentId: "s1", status: raw}).status, {known: false, raw});
    }
  });
  const malformed = [null, [], {}, {shipmentId: "s1"}, {shipmentId: "s1", status: 7},
    {shipmentId: "s1", status: ""}, {status: "delivered"}, {shipmentId: "", status: "delivered"},
    {shipmentId: 7, status: "delivered"}];
  await group("malformed-is-not-an-unfamiliar-shipment", () => {
    for (const value of malformed) assert.equal(OpenUpdate.safeParse(value).success, false);
  });
  await group("original-endpoint-rejects-before-storage-and-loses-extras", async () => {
    const stored = [];
    const inbox = {append: async value => {stored.push(structuredClone(value)); return "r1";}};
    assert.equal(await load(original).receive({shipmentId: "s1", status: "held_at_customs"}, inbox), 400);
    assert.deepEqual(stored, []);
    assert.equal(await load(original).receive({shipmentId: "s1", status: "in_transit", eta: "2026-10-20"}, inbox), 204);
    assert.deepEqual(stored, [{shipmentId: "s1", status: "in_transit"}]);
  });
  await group("raw-receipt-retains-eta-and-unfamiliar-value", async () => {
    const stored = [];
    const inbox = {append: async value => {stored.push(structuredClone(value)); return "r1";}};
    const body = {shipmentId: "s1", status: "held_at_customs", eta: "2026-10-20"};
    assert.equal(await load(receipt).receive(body, inbox), 204);
    assert.deepEqual(stored, [body]);
    body.eta = "changed later";
    assert.equal(stored[0].eta, "2026-10-20", "The test double honors Inbox's snapshot contract");
  });
  await group("acknowledgement-waits-for-storage-and-propagates-failure", async () => {
    let resolve;
    let acknowledged = false;
    const pendingWrite = new Promise(r => {resolve = r;});
    const response = load(receipt).receive({}, {append: () => pendingWrite}).then(code => {acknowledged = true; return code;});
    await Promise.resolve();
    assert.equal(acknowledged, false);
    resolve("r1");
    assert.equal(await response, 204);
    const failure = new Error("Inbox unavailable");
    await assert.rejects(load(receipt).receive({}, {append: async () => {throw failure;}}), error => error === failure);
  });
  const openFunctions = load(openApi);
  await group("open-repair-keeps-label-and-requests-review", () => {
    for (const status of ["held_at_customs", "returned_damaged", "returned_refused"]) {
      const update = openFunctions.OpenUpdate.parse({shipmentId: "s1", status});
      assert.equal(openFunctions.trackingLabel(update), "Carrier reports: " + status.replaceAll("_", " "));
      assert.equal(openFunctions.refundForOpen(update), "review");
    }
    for (const status of CarrierStatus.options) {
      const update = openFunctions.OpenUpdate.parse({shipmentId: "s1", status});
      assert.equal(openFunctions.refundForOpen(update), status === "returned" ? "issue" : "skip");
      assert.equal(openFunctions.trackingLabel(update), status.replaceAll("_", " "));
    }
  });
  const closedFunctions = load(closedApi);
  await group("both-repairs-have-equal-consumer-outcomes", () => {
    const openFunctions = load(openProjection);
    const bodies = [...malformed, ...[...CarrierStatus.options, "held_at_customs", "returned_damaged", "returned_refused"]
      .map(status => ({shipmentId: "s1", status, eta: "2026-10-20"}))];
    for (const raw of bodies) {
      const receipt = {id: "r1", raw};
      assert.deepEqual(openFunctions.project(receipt), closedFunctions.project(receipt));
    }
  });
  await group("malformed-receipts-have-no-shipment-projection", () => {
    for (const raw of malformed) {
      assert.deepEqual(closedFunctions.project({id: "r1", raw}), {kind: "review", receiptId: "r1"});
    }
  });
  await group("retry-can-produce-two-receipts-for-the-same-refund", async () => {
    const stored = [];
    const inbox = {append: async raw => {
      const id = "r" + (stored.length + 1);
      stored.push({id, raw: structuredClone(raw)});
      return id;
    }};
    const body = {shipmentId: "s1", status: "returned"};
    // The first acknowledgement is lost; the same request reaches receive again.
    // There is deliberately no payment or deduplication implementation here.
    await load(receipt).receive(body, inbox);
    assert.equal(await load(receipt).receive(body, inbox), 204);
    assert.deepEqual(stored.map(r => r.id), ["r1", "r2"]);
    const outputs = stored.map(closedFunctions.project);
    assert.deepEqual(outputs.map(p => [p.shipmentId, p.refund]), [["s1", "issue"], ["s1", "issue"]]);
  });
  await group("enum-expansion-needs-a-business-answer-even-with-default", () => {
    assert.equal(load(defaultConsumer).result, "skip");
    assert.equal(load(promoted).result, "issue");
  });
  await group("catch-logging-does-not-make-substitution-correct", () => {
    const logged = load(loggedFallback);
    assert.deepEqual(logged.seen, ["returned_damaged"]);
    assert.equal(logged.result, "in_transit");
  });
  console.log("TypeScript " + version + ": Chapter 16 — " + fences.length + " fences, " +
    cases.length + " compiler cases, " + groups + " runtime groups. PASS");
  console.log("Fixtures: " + scratch);
}
main().catch(error => {console.error(error); process.exitCode = 1;});
