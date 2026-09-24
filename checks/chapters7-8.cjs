// npm ci && node checks/chapters7-8.cjs
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const root = path.resolve(__dirname, "..");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch7-8-"));
const cases = [];
const equal = `
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`;
function chapter(file, count) {
  const blocks = [...fs.readFileSync(path.join(root, file), "utf8").matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
  assert.equal(blocks.length, count, "Update the fence inventory for " + file);
  const used = new Set();
  return {
    blocks,
    get(n, prefix) {
      const code = blocks[n - 1];
      assert(code?.startsWith(prefix), `Fence ${n} in ${file} must begin with ${prefix}`);
      used.add(n);
      return code + "\n";
    },
    complete() { assert.equal(used.size, blocks.length, "Every fence must be covered in " + file); },
  };
}
function example(name, code, expected = [], options = {}) {
  const filename = path.join(scratch, name + ".ts");
  fs.writeFileSync(filename, "export {};\n" + code);
  cases.push({name, filename, expected, options});
}
const c7 = chapter("book/02-advanced-typescript/01-conditional-types.md", 29);
const c8 = chapter("book/02-advanced-typescript/02-mapped-types.md", 21);
const f7 = c7.get.bind(c7);
const f8 = c8.get.bind(c8);
const reply = f7(1, "// extends as a gate");
const frontMatter = f7(3, "type FrontMatter");
const postDeclaration = frontMatter + "declare const post: FrontMatter;\n";
const separateSlugs = f7(4, "function slugifyOne");
const conditionalDeclaration = f7(5, "declare function slugify");
const twoOverloads = f7(7, "function slugify(title:");
const threeOverloads = f7(9, "function slugify(title:");
const implementationOnly = threeOverloads.slice(threeOverloads.indexOf("function slugify(input: string | string[]): string | string[] {"), threeOverloads.indexOf("const one ="));
const conditionalBody = f7(12, "function slugify<T");
const conditionalOverload = f7(13, "function slugify<T");
const wrongBody = f7(14, "function slugify<T");
const filters = f7(15, "type Exclude");
const channel = f7(16, "type Channel");
const arrays = f7(22, "type ToArray");
const nonNullable = f7(27, "// TypeScript 4.7");
const normalization = f7(29, "function normalizeFrontMatter");
example("ch7-principle", reply + f7(2, "type Yes") + equal + `
type YesCheck = Expect<Equal<Yes, "it was a string">>;
type NoCheck = Expect<Equal<No, "it was not">>;
`);
example("ch7-front-matter", frontMatter);
example("ch7-separate-slugs", separateSlugs);
example("ch7-conditional-calls", conditionalDeclaration + f7(6, "const one") + equal + `
type One = Expect<Equal<typeof one, string>>;
type Many = Expect<Equal<typeof many, string[]>>;
`);
example("ch7-two-overloads", twoOverloads);
example("ch7-union-caller-rejected", frontMatter + twoOverloads + f7(8, "declare const post"), [2769]);
example("ch7-three-overloads", postDeclaration + threeOverloads + equal + `
type One = Expect<Equal<typeof one, string>>;
type Many = Expect<Equal<typeof many, string[]>>;
type Union = Expect<Equal<typeof fromTags, string | string[]>>;
`);
example("ch7-union-signature-loses-precision", postDeclaration + implementationOnly + f7(10, "const slugs"), [2339]);
example("ch7-named-conditional", f7(11, "type Slug") + equal + `
type One = Expect<Equal<Slug<string>, string>>;
type Many = Expect<Equal<Slug<string[]>, string[]>>;
type Both = Expect<Equal<Slug<string | string[]>, string | string[]>>;
`);
example("ch7-generic-body-rejected", conditionalBody, [2322, 2322]);
example("ch7-conditional-overload", postDeclaration + conditionalOverload + equal + `
type One = Expect<Equal<typeof one, string>>;
type Many = Expect<Equal<typeof many, string[]>>;
type Union = Expect<Equal<typeof fromTags, string | string[]>>;
`);
example("ch7-wrong-body-compiles", wrongBody);
example("ch7-filter-distribution", filters + channel + f7(17, "// What the compiler") + equal + `
type Reach = Expect<Equal<Reachable, "email" | "sms">>;
type Selected = Expect<Equal<Extract<Channel, "push">, "push">>;
`);
example("ch7-never-and-any", f7(18, "type Reply<T>") + f7(19, "type BothWays") + equal + `
type NothingCheck = Expect<Equal<Nothing, never>>;
type BothCheck = Expect<Equal<BothWays, "it was a string" | "it was not">>;
`);
example("ch7-direct-versus-distributed-never", f7(20, "type Direct") + f7(21, "type ViaParam") + equal + `
type DirectCheck = Expect<Equal<Direct, "ran">>;
type DistributedCheck = Expect<Equal<Vanished, never>>;
`);
example("ch7-tuple-distribution-control", arrays + equal + `
type SplitCheck = Expect<Equal<Split, string[] | number[]>>;
type WholeCheck = Expect<Equal<Together, (string | number)[]>>;
type NeverYes = Expect<Equal<IsNever<never>, true>>;
type NeverNo = Expect<Equal<IsNever<string>, false>>;
`);
example("ch7-any-assignability", f7(23, "type Wrapped") + equal + `
type WrappedCheck = Expect<Equal<Wrapped, "ran">>;
type TopCheckCheck = Expect<Equal<TopCheck, "ran">>;
`);
example("ch7-boolean-filter", filters + f7(24, "type Enabled") + equal + 'type Check = Expect<Equal<Enabled, true>>;');
example("ch7-filter-typo-accepted", filters + channel + f7(25, "type Mistyped") + equal + 'type Check = Expect<Equal<Mistyped, Channel>>;');
example("ch7-filter-typo-rejected", filters + channel + f7(26, "type StrictExclude"), [2344]);
const historicalNullable = nonNullable.split("// TypeScript 4.8 and later:")[0];
const currentNullable = nonNullable.split("// TypeScript 4.8 and later:")[1];
example("ch7-historical-nullable-definition", historicalNullable + equal + 'type Check = Expect<Equal<NonNullable<string | null | undefined>, string>>;');
example("ch7-current-nullable-definition", currentNullable + equal + `
type Check = Expect<Equal<NonNullable<string | null | undefined>, string>>;
function repeated<T>(value: NonNullable<T>): NonNullable<NonNullable<T>> { return value; }
`);
example("ch7-normalize-at-call", postDeclaration + twoOverloads + f7(28, "const slugs") + equal + 'type Check = Expect<Equal<typeof slugs, string[]>>;');
example("ch7-normalize-at-boundary", postDeclaration + separateSlugs + normalization + equal + `
type Title = Expect<Equal<typeof titleSlug, string>>;
type Tags = Expect<Equal<typeof tagSlugs, string[]>>;
`);
c7.complete();

const partial = f8(1, "type Partial<T>");
const model = f8(3, "type User");
const request = f8(4, "interface UpdateUserRequest");
const imported = f8(9, "type ImportedUser");
const importedTypes = imported.slice(0, imported.indexOf("const advertised"));
const override = f8(10, "type DerivedUpdateWithOverride");
const overrideTypes = override.slice(0, override.indexOf("const fixed"));
const writable = f8(13, "type Editable<T>");
const startForm = f8(14, "function startForm");
const changes = f8(15, "function changedFields");
const errors = f8(16, "type FieldErrors");
const errorTypes = errors.slice(0, errors.indexOf("const errors"));
const labels = f8(17, "type Labels");
const withoutId = f8(21, "type WithoutId");
const base = model + request + importedTypes + overrideTypes + writable;
example("ch8-partial-values", partial + f8(2, "type ContactFields"), [2322]);
example("ch8-matching-contracts", model + request + f8(5, "const derived"));
example("ch8-pick-definition", f8(6, "// From the standard library:") + model);
const incoming = f8(7, "const incoming");
example("ch8-extra-property-variable", model + incoming);
const optional = f8(8, "const omitted");
example("ch8-explicit-undefined-exact", model + optional, [2375]);
example("ch8-explicit-undefined-without-exact", model + optional, [], {exactOptionalPropertyTypes: false});
example("ch8-nullable-drift", model + request + imported, [2322]);
example("ch8-repaired-contract", model + request + importedTypes + override);
const nullTest = f8(11, "// @ts-expect-error:");
example("ch8-null-test-derived", base + nullTest);
example("ch8-null-test-explicit", base + nullTest.replace("const cannotClearEmail: DerivedUpdateWithOverride", "const cannotClearEmail: UpdateUserRequest"));
example("ch8-null-test-detects-widening", base.replace('readonly email?: string;', 'readonly email?: string | null;') + nullTest.replace("const cannotClearEmail: DerivedUpdateWithOverride", "const cannotClearEmail: UpdateUserRequest"), [2578]);
example("ch8-readonly-preserved", model + f8(12, "const selected"), [2540]);
example("ch8-modifiers-removed", base + equal + 'type Check = Expect<Equal<FormValues, {displayName: string; email: string; bio: string}>>;');
example("ch8-form-and-changed-fields", base + startForm + changes);
example("ch8-field-error-typo", base + errors, [2551]);
example("ch8-complete-labels", base + labels);
example("ch8-missing-label", base + labels.replace('  bio: "Biography",\n', ""), [2741]);
example("ch8-form-level-errors", base + errorTypes + f8(18, "type FormErrors"));
const presence = f8(19, "const absent");
example("ch8-undefined-presence", presence);
const shallow = f8(20, "const snapshot");
example("ch8-shallow-readonly", base + shallow);
example("ch8-key-remapping", model + withoutId + equal + `
type Keys = Expect<Equal<keyof WithoutId<User>, "displayName" | "email" | "bio" | "roles">>;
type Roles = Expect<Equal<WithoutId<User>["roles"], readonly string[]>>;
`);
example("ch8-pick-key-typo", model + 'type Typo = Pick<User, "emali">;', [2344]);
example("ch8-object-literal-extra-key", model + 'const wrong: DerivedUpdate = {displayName: "Ada", roles: ["admin"]};', [2353]);
example("ch8-draft-construction-required", base + 'const wrong: FormValues = {displayName: "Ada", email: "ada@example.com"};', [2741]);
example("ch8-missing-email-fallback", base + startForm.replace('email: user.email ?? "",', 'email: user.email,'), [2322]);
example("ch8-record-keeps-keys", base + errorTypes + equal + 'type Same = Expect<Equal<FieldErrors<FormValues>, Partial<Record<keyof FormValues, string[]>>>>;');
example("ch8-broad-record-allows-typo", 'const errors: Record<string, string[]> = {emali: ["Bad email"]};');
example("ch8-cannot-replace-readonly-container", base + shallow + 'snapshot.values = {displayName: "Ada", email: "ada@example.com", bio: ""};', [2540]);
c8.complete();

const groups = new Map();
for (const test of cases) {
  const key = JSON.stringify(test.options);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(test);
}
for (const group of groups.values()) {
  const {diagnostics} = compile(group.map(t => t.filename), {noEmit: true, ...group[0].options}, scratch);
  for (const test of group) {
    const found = diagnostics.filter(d => d.fileName === test.filename);
    assert.deepEqual(found.map(d => d.code).sort(), test.expected.slice().sort(), test.name + "\n" + describe(found));
  }
  assert.equal(diagnostics.filter(d => !group.some(t => t.filename === d.fileName)).length, 0, describe(diagnostics));
}

function runtime(name, code) {
  const filename = path.join(scratch, name + ".ts");
  fs.writeFileSync(filename, code);
  const outDir = path.join(scratch, "out-" + name);
  const {diagnostics} = compile([filename], {outDir}, scratch);
  assert.equal(diagnostics.length, 0, describe(diagnostics));
  return path.join(outDir, name + ".js");
}
let runtimeGroups = 0;
const fixture = frontMatter + 'const post: FrontMatter = {title: "Hello World", tags: ["One", "Two"]};\n';
for (const [name, source] of [["two", twoOverloads], ["three", threeOverloads], ["conditional", conditionalOverload]]) {
  const compiled = require(runtime("ch7-" + name, fixture + source + "\nexport {slugify};"));
  assert.equal(compiled.slugify(" Hello World "), "hello-world");
  assert.deepEqual(compiled.slugify([" One ", "TWO WORDS"]), ["one", "two-words"]);
  assert.deepEqual(compiled.slugify([]), []);
  runtimeGroups++;
}
assert.throws(() => require(runtime("ch7-broken", wrongBody)), /many\.map is not a function/);
runtimeGroups++;
const normalized = require(runtime("ch7-normalized", fixture + separateSlugs + normalization + "\nexport {normalizeFrontMatter, slugifyOne, slugifyAll};"));
for (const tags of ["Hello World", ["Hello World", "Two"], []]) {
  const input = {title: " A Title ", tags};
  const value = normalized.normalizeFrontMatter(input);
  assert.deepEqual(value.tags, Array.isArray(tags) ? tags : [tags]);
  assert.equal(normalized.slugifyOne(value.title), "a-title");
  assert.deepEqual(normalized.slugifyAll(value.tags), Array.isArray(tags) ? tags.map(t => t.toLowerCase().replace(/\s+/g, "-")) : ["hello-world"]);
}
runtimeGroups++;
const mappedFile = runtime("ch8-runtime", base + startForm + changes + shallow + incoming + presence +
  "\nexport {user, form, initial, draft, patch, startForm, changedFields, snapshot, request, absent, present};");
const oldLog = console.log;
let mapped;
try { console.log = () => {}; mapped = require(mappedFile); }
finally { console.log = oldLog; }
assert.deepEqual(Object.keys(mapped.request), ["displayName", "roles"]);
assert.equal("email" in mapped.absent, false);
assert.equal("email" in mapped.present, true);
assert.equal(JSON.stringify(mapped.present), "{}");
runtimeGroups++;
assert.equal(mapped.user.bio, undefined);
assert.equal(mapped.form.bio, "Writes software");
assert.notEqual(mapped.form, mapped.user);
assert.deepEqual(mapped.patch, {bio: "Writes software"});
assert.equal("email" in mapped.patch, false);
assert.deepEqual(mapped.changedFields(mapped.initial, {...mapped.initial}), {});
assert.deepEqual(mapped.changedFields({...mapped.initial, bio: "Old"}, {...mapped.initial, bio: ""}), {bio: ""});
assert.deepEqual(mapped.changedFields(mapped.initial, {...mapped.initial, email: "not-an-address"}), {email: "not-an-address"});
assert.deepEqual(mapped.changedFields(mapped.initial, {...mapped.initial, displayName: "Grace", email: "grace@example.com", bio: "New"}), {displayName: "Grace", email: "grace@example.com", bio: "New"});
assert.deepEqual(mapped.startForm({...mapped.user, email: "ada@example.com", bio: "Existing"}), {displayName: "Ada", email: "ada@example.com", bio: "Existing"});
runtimeGroups++;
assert.equal(mapped.snapshot.values.bio, "Writes software");
assert.equal(Object.isFrozen(mapped.snapshot), false);
runtimeGroups++;
console.log(JSON.stringify({typescript: version, chapters: [7, 8], chapterFences: c7.blocks.length + c8.blocks.length,
  compilerCases: cases.length, runtimeScenarioGroups: runtimeGroups, scratch}, null, 2));
