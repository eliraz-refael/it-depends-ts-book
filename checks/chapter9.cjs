// npm ci && node checks/chapter9.cjs (also requires ripgrep)
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");

const {compile, describe, version} = require("./compiler.cjs");
const root = path.resolve(__dirname, "..");
const chapter = fs.readFileSync(
  path.join(root, "book/02-advanced-typescript/03-template-literal-types.md"),
  "utf8",
);
const blocks = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)]
  .map((match) => match[1]);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch9-"));

function block(prefix) {
  const found = blocks.filter((code) => code.startsWith(prefix));
  assert.equal(found.length, 1, `Expected one block starting with ${prefix}`);
  return found[0];
}

function write(relative, content) {
  const filename = path.join(scratch, relative);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, content);
  return filename;
}

const sourceBlocks = blocks.filter((code) => code.startsWith("// src/"));
const sources = {};
let replacement;
for (const code of sourceBlocks) {
  const [heading, ...lines] = code.split("\n");
  const filename = heading.match(/^\/\/ (src\/\S+)/)[1];
  if (heading.includes("replacement")) replacement = lines.join("\n") + "\n";
  else sources[filename] = lines.join("\n") + "\n";
}
assert(replacement, "The revised restore implementation must be present");
const originalFiles = Object.entries(sources).map(([name, code]) => write(name, code));
const changedFiles = Object.entries(sources).map(([name, code]) =>
  write("revised/" + name, name === "src/restore.ts" ? replacement : code),
);

const mapping = block("type ChangeEvents<T>") + "\n";
const imports = [
  'import { settings, type Settings, type SettingKey, type ChangeEvent } from "./src/settings";',
  'import { on, publish } from "./src/events";',
  'import { setSetting } from "./src/writes";',
].join("\n") + "\n";
const examples = [];
function example(name, code, expected = [], context = true) {
  const filename = write(name + ".ts", (context ? imports : "export {};\n") + code);
  examples.push({ name, filename, expected });
}

const expectedErrors = new Map([
  ['on("fontSzieChanged"', [2345, 2339]],
  ["type ActionsByEntity", [2322]],
  ['publish("fontSizeChanged", 16)', [2345, 2345]],
  ["type SettingsChange", [2322]],
  ["const defaults", [2322]],
]);
for (const [index, code] of blocks.entries()) {
  if (code.startsWith("// src/")) continue;
  const match = [...expectedErrors].find(([prefix]) => code.startsWith(prefix));
  example(`fence-${index + 1}`, (code.startsWith("type ChangeEvents<T>") ? "" : mapping) + code, match?.[1] || []);
}

const equal = `
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`;
example("event-name-union", equal + 'type Check = Expect<Equal<ChangeEvent, "themeChanged" | "fontSizeChanged" | "autoSaveChanged">>;');
example("explicit-map-equivalence", mapping + block("interface ExistingEvents") + equal + "type Check = Expect<Equal<SettingsEvents, ExistingEvents>>;");
example("callback-inference", `
on("fontSizeChanged", value => { const checked: number = value; });
on("autoSaveChanged", value => { const checked: boolean = value; });
on("themeChanged", value => { const checked: "light" | "dark" = value; });
`);
example("wrong-theme-payload", 'publish("themeChanged", "blue"); publish("themeChanged", 16);', [2345, 2345]);
example("wrong-callback", 'on("fontSizeChanged", (value: string) => {});', [2345]);
example("wrong-setter-payload", 'setSetting("fontSize", false);', [2345]);
example("wrong-constructed-suffix", 'function wrong<K extends SettingKey>(key: K, value: Settings[K]) { publish(`${key}Modified`, value); }', [2345]);
example("wrong-generic-payload", 'function wrong<K extends SettingKey>(key: K, value: Settings[K]) { publish(`${key}Changed`, {}); }', [2345]);

const registry = block("const eventNames");
example("registry-literal-preservation", registry + equal + 'type Check = Expect<Equal<typeof eventNames.fontSize, "fontSizeChanged">>;');
example("registry-missing-key", registry.replace('  autoSave: "autoSaveChanged",\n', ""), [2741, 2339]);
example("registry-wrong-pair", registry.replace('fontSize: "fontSizeChanged"', 'fontSize: "autoSaveChanged"'), [2322, 2345]);

const audit = block("type Entity");
example("cross-product-expansion", audit + equal + 'type Check = Expect<Equal<AuditEvent, "profile:created" | "profile:paid" | "invoice:created" | "invoice:paid">>;');
const allowed = block("type ActionsByEntity").split("const wrongEvent")[0];
example("repaired-audit-equivalence", allowed + block("type ListedAuditEvent") + equal + "type Check = Expect<Equal<AllowedAuditEvent, ListedAuditEvent>>;");
example("independent-unions-accepted", 'declare const name: ChangeEvent; declare const value: Settings[SettingKey]; publish(name, value);');
const change = block("type SettingsChange").split("const badChange")[0];
example("discriminated-pairs", change + 'const good: SettingsChange = {name: "fontSizeChanged", value: 16}; const alsoGood: SettingsChange = {name: "autoSaveChanged", value: false};');
example("string-keys-only", mapping + equal + `
declare const secret: unique symbol;
type Mixed = { title: string; 42: boolean; [secret]: number };
type Check = Expect<Equal<ChangeEvents<Mixed>, { titleChanged: string }>>;
`);
example("added-setting", mapping + equal + 'type Extended = Settings & { lineHeight: number }; type Check = Expect<Equal<ChangeEvents<Extended>["lineHeightChanged"], number>>;');
example("capitalized-names", block("type HandlerName") + equal + 'type Check = Expect<Equal<HandlerName, "onThemeChanged" | "onFontSizeChanged" | "onAutoSaveChanged">>;');

const {diagnostics: allDiagnostics} = compile([...originalFiles, ...changedFiles, ...examples.map((c) => c.filename)], {noEmit: true}, scratch);
for (const test of examples) {
  const found = allDiagnostics.filter((d) => d.fileName === test.filename);
  assert.deepEqual(found.map((d) => d.code).sort(), test.expected.slice().sort(), test.name + "\n" + describe(found));
}
const unexpected = allDiagnostics.filter((d) => !examples.some((test) => test.filename === d.fileName));
assert.equal(unexpected.length, 0, describe(unexpected));

function search(directory) {
  return cp.execFileSync("rg", ["--sort", "path", "-n", "-F", "fontSizeChanged", "src"], { cwd: directory, encoding: "utf8" }).trim();
}
const recordedSearches = [...chapter.matchAll(/```text\n\$ rg --sort path -n -F 'fontSizeChanged' src\n([\s\S]*?)\n```/g)].map((m) => m[1]);
assert.equal(recordedSearches.length, 2);
assert.equal(search(scratch), recordedSearches[0]);
assert.equal(search(path.join(scratch, "revised")), recordedSearches[1]);

// The chapter declares an existing bus's interface. This JavaScript test adapter
// records calls and dispatches callbacks; it is not a proposed bus implementation.
const adapter = `
const listeners = new Map();
exports.records = [];
exports.on = (name, listener) => {
  const group = listeners.get(name) || [];
  group.push(listener);
  listeners.set(name, group);
};
exports.publish = (name, value) => {
  exports.records.push({name, value, snapshot: {...require("./settings").settings}});
  for (const listener of listeners.get(name) || []) listener(value);
};
`;

let runtimeGroups = 0;
function exercise(files, outName) {
  const out = path.join(scratch, outName);
  const {diagnostics: found} = compile(files, {outDir: out, rootDir: path.dirname(files[0])}, scratch);
  assert.equal(found.length, 0, describe(found));
  fs.writeFileSync(path.join(out, "events.js"), adapter);
  const bus = require(path.join(out, "events.js"));
  const { settings } = require(path.join(out, "settings.js"));
  const controls = require(path.join(out, "controls.js"));
  const { restore } = require(path.join(out, "restore.js"));
  require(path.join(out, "preview.js"));
  const originalLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);
  try {
    controls.changeFontSize(16);
    controls.changeAutoSave(false);
    assert.equal(settings.fontSize, 16);
    assert.equal(settings.autoSave, false);
    assert.deepEqual(bus.records.map(({name, value}) => ({name, value})), [
      { name: "fontSizeChanged", value: 16 },
      { name: "autoSaveChanged", value: false },
    ]);
    assert.deepEqual(logs, ["Preview font size: 16"]);
    runtimeGroups++;
    bus.records.length = 0;
    logs.length = 0;
    const saved = { theme: "dark", fontSize: 20, autoSave: true };
    restore(saved);
    assert.deepEqual(settings, saved);
    assert.deepEqual(bus.records.map(({name, value}) => ({name, value})), [
      { name: "themeChanged", value: "dark" },
      { name: "fontSizeChanged", value: 20 },
      { name: "autoSaveChanged", value: true },
    ]);
    assert(bus.records.every((record) => {
      assert.deepEqual(record.snapshot, saved);
      return true;
    }));
    assert.deepEqual(logs, ["Preview font size: 20"]);
    runtimeGroups++;
  } finally {
    console.log = originalLog;
  }
}
exercise(originalFiles, "out-original");
exercise(changedFiles, "out-revised");

const vm = require("node:vm");
const registryTypes = sources["src/settings.ts"].split("export const settings")[0].replaceAll("export ", "");
const registryPublish = sources["src/events.d.ts"].slice(sources["src/events.d.ts"].indexOf("export declare function publish")).replace("export ", "");
const registryFile = write("registry-runtime.ts", registryTypes + "\ndeclare const settings: Settings;\n" + registryPublish + registry + '\nrestoreWithNames({theme: "dark", fontSize: 18, autoSave: false});');
const registryOut = path.join(scratch, "out-registry");
const registryResult = compile([registryFile], {outDir: registryOut, moduleDetection: "legacy"}, scratch);
assert.equal(registryResult.diagnostics.length, 0, describe(registryResult.diagnostics));
const registryProgram = fs.readFileSync(path.join(registryOut, "registry-runtime.js"), "utf8");
const state = { theme: "light", fontSize: 14, autoSave: true };
const emitted = [];
const snapshots = [];
vm.runInNewContext(registryProgram, {
  settings: state,
  publish: (name, value) => {
    emitted.push({ name, value });
    snapshots.push({ ...state });
  },
});
const registrySaved = { theme: "dark", fontSize: 18, autoSave: false };
assert.deepEqual(state, registrySaved);
assert.deepEqual(emitted, [
  { name: "themeChanged", value: "dark" },
  { name: "fontSizeChanged", value: 18 },
  { name: "autoSaveChanged", value: false },
]);
for (const snapshot of snapshots) assert.deepEqual(snapshot, registrySaved);
runtimeGroups++;

console.log(JSON.stringify({
  typescript: version,
  chapterFences: blocks.length,
  compilerCases: examples.length + 2,
  runtimeScenarioGroups: runtimeGroups,
  reproducedSearches: recordedSearches.length,
  scratch,
}, null, 2));
