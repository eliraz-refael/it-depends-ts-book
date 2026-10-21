// Stable prices, live views, and the boundary that publishes a new current value.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/03-patterns-and-design/04-immutability.md"), "utf8");
const fences = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const matches = fences.map((text, index) => ({text, index})).filter(b => b.text.startsWith(prefix));
  assert.equal(matches.length, 1, "Unique fence: " + prefix);
  used.add(matches[0].index);
  return matches[0].text + "\n";
}
function before(source, delimiter) {
  const i = source.indexOf(delimiter);
  assert(i >= 0, "Missing split: " + delimiter);
  return source.slice(0, i);
}
const opening = block("type Quote =");
const promotion = block("type Priced =");
const writes = block("cart.total =");
const values = block("function quote(");
const frozen = block("try {");
const forgery = block("const invented:");
const owner = block("class CartPricing");
const live = block("const pricing =");
const snapshot = block("snapshot():");
const reader = block("type ReadPrice =");
const viewType = block("interface PriceView");
const viewMember = block("view(): PriceView");
const badView = block("const view = pricing.view()");
const repaired = block("const checkout =");
const preview = block("const choosing =");
const closure = block("function valueCheckout");
const handler = block("function chooseDiscount");
const index = block("const rows =");
const date = block("type DeepReadonly");
assert.equal(used.size, fences.length, "Every TypeScript fence is exercised");
const base = before(opening, "const cart:");
const promoFn = before(promotion, "const before =");
const valueFns = before(values, "const original =");
const closureFn = before(closure, "const values =");
assert(owner.endsWith("\n}\n"), "Owner class insertion point");
// The page explicitly adds this member to the existing class. No other edit.
const ownerWithSnapshot = owner.slice(0, -2) + snapshot + "}\n";
const getterStart = owner.indexOf("  view(): Quote {");
assert(getterStart >= 0, "Original view method");
const getterMember = owner.slice(getterStart, owner.lastIndexOf("\n}"));
assert.equal(ownerWithSnapshot.split(getterMember).length, 2, "Unique view replacement");
// Replace only the explicitly superseded view member; keep the earlier class
// in separate programs for the frozen-getter failure and first function repair.
const repairedOwner = ownerWithSnapshot.replace(getterMember, viewMember.trimEnd());
const readType = before(reader, "const readPrice:");
const readerFn = before(reader, "receipt(readPrice,");
const pricingInit = before(live, "const summary =");
const finalBase = base + valueFns + readType + viewType + repairedOwner;
const deepType = before(date, "const stamp:");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch17-"));
const cases = [];
function example(name, source, codes = []) {
  source = "export {};\n" + source;
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir);
  const file = path.join(dir, "main.ts");
  fs.writeFileSync(file, source);
  const markers = source.split("\n").flatMap((line, i) => line.includes("// Error TS") ? [i + 1] : []);
  assert.equal(markers.length, codes.length, "Diagnostic markers: " + name);
  const outDir = path.join(dir, "out");
  const checked = compile([file], {outDir}, dir);
  assert.deepEqual(checked.diagnostics.map(d => ({line:d.line, code:d.code})),
    codes.map((code,i) => ({line:markers[i], code})), name + "\n" + describe(checked.diagnostics));
  const test = {name, source, checked, outDir};
  cases.push(test);
  return test;
}
const printedCases = [
  example("initial-price", opening),
  example("promotion-mutates-receipt", opening + promotion),
  example("value-returning-repair", base + values),
  example("old-mutator-throws-on-frozen-quote", base + promoFn + values + frozen),
  example("structural-copy-can-break-invariant", base + values + forgery),
  example("frozen-live-view-is-not-history", base + valueFns + owner + live),
  example("stable-snapshot-through-later-update", finalBase + repaired),
  example("preview-does-not-publish", finalBase + preview),
  example("closure-owner-and-live-summary", base + valueFns + readType + closure),
  example("local-index-copy-count", index),
  example("readonly-frozen-date-still-mutates", date),
];
const errors = example("property-write-and-array-compatibility", opening + writes, [2540,4104]);
assert.equal(errors.checked.diagnostics[0].message,
  "Cannot assign to 'total' because it is a read-only property.");
assert(chapter.includes(errors.checked.diagnostics[0].message), "Printed property diagnostic");
assert(chapter.includes(errors.checked.diagnostics[1].message), "Printed array diagnostic");
const readerError = example("live-function-is-not-a-receipt-value",
  base + valueFns + ownerWithSnapshot + pricingInit + reader, [2345]);
assert.match(readerError.checked.diagnostics[0].message, /ReadPrice/);
const viewError = example("live-capability-is-not-a-receipt-value",
  finalBase + pricingInit + badView, [2739]);
for (const property of ["subtotal", "discount", "total"]) {
  assert(viewError.checked.diagnostics[0].message.includes(property));
}
const callable = example("function-reader-returns-snapshots",
  base + valueFns + ownerWithSnapshot + pricingInit + readerFn +
  "export {pricing, readPrice};\n");
const originalApi = example("original-frozen-getter-api", base + valueFns + owner +
  "export {CartPricing};\n");
example("snapshot-is-not-a-reader-function", finalBase +
  "function render(read: ReadPrice):number { return read().total; }\n" +
  "render(quote(100,0)); // Error TS2345\n", [2345]);
example("snapshot-is-not-a-price-view", finalBase +
  "function render(view: PriceView):number { return view.current().total; }\n" +
  "render(quote(100,0)); // Error TS2741\n", [2741]);
// Fixture for Eden's proposed compatibility wrapper; it is not an extra
// manuscript implementation. Keep the old mutating caller contract.
const compatibility = example("legacy-api-delegates-to-shared-calculation", base + valueFns + promoFn +
  "export function compatiblePromotion(price: Priced, amount:number):void {\n" +
  "  const next=withDiscount(price,amount);\n" +
  "  price.discount=next.discount; price.total=next.total;\n" +
  "}\n");
const api = example("both-final-apis", finalBase + closureFn + handler + promoFn +
  "export {quote, withDiscount, CartPricing, valueCheckout, chooseDiscount, applyPromotion, receipt};\n");
const aliases = example("readonly-property-aliases-still-compile", base +
  "export function replaceItems(cart: {items: readonly LineItem[]}):void {cart.items=[];}\n" +
  "export function changeQuantity(item: {qty:number}):void {item.qty=7;}\n" +
  "export function viaCart(cart: Cart):void {replaceItems(cart);}\n" +
  "export function viaItem(item:LineItem):void {changeQuantity(item);}\n");
example("array-view-has-no-push", base +
  "function append(items: readonly LineItem[]) { items.push({sku:'gift',qty:1}); } // Error TS2339\n", [2339]);
example("private-price-cannot-be-assigned", finalBase +
  "const owner = new CartPricing(quote(100,0));\n" +
  "owner.#current = quote(100,20); // Error TS18013\n", [18013]);
example("readonly-snapshot-write-rejected", finalBase +
  "const owner = new CartPricing(quote(100,0));\n" +
  "owner.snapshot().total = 0; // Error TS2540\n", [2540]);
example("readonly-item-write-rejected", base +
  "function change(item: LineItem) { item.qty=7; } // Error TS2540\n", [2540]);
example("deep-readonly-still-allows-property-alias", base + deepType +
  "declare const cart: DeepReadonly<Cart>;\n" +
  "function change(item: {qty:number}) { item.qty=7; }\n" +
  "change(cart.items[0]!);\n");

let groups = 0;
function group(name, run) {
  try { run(); } catch(error) { error.message = name + ": " + error.message; throw error; }
  groups++;
}
function load(test) { return require(path.join(test.outDir,"main.js")); }
function outputFromComments(source) {
  return [...source.matchAll(/^\s*console\.log\([^\n]*\); \/\/ (.+)$/gm)].map(([,text]) => {
    if (text.startsWith("[")) return [JSON.parse(text)];
    if (text === "true" || text === "false") return [JSON.parse(text)];
    if (/^\d+( \d+)*$/.test(text)) return text.split(" ").map(Number);
    return [text];
  });
}
for (const test of printedCases) group(test.name + "-printed-output", () => {
  const script = "const out=[]; console.log=(...args)=>out.push(args); require(process.argv[1]); process.stdout.write(JSON.stringify(out));";
  const printed = JSON.parse(cp.execFileSync(process.execPath,
    ["-e", script, path.join(test.outDir,"main.js")], {encoding:"utf8"}));
  const expected = outputFromComments(test.source);
  assert(expected.length > 0, "Printed example must have output comments");
  assert.deepEqual(printed, expected);
});
const {quote,withDiscount,CartPricing,valueCheckout,chooseDiscount,applyPromotion,receipt} = load(api);
group("both-repairs-retain-history-through-multiple-updates", () => {
  for (const amount of [0,20,100]) {
    const start=quote(100,0), owner=new CartPricing(start), first=owner.snapshot(), view=owner.view();
    const value=withDiscount(start,amount);
    owner.applyDiscount(amount);
    assert.deepEqual(owner.snapshot(),value);
    assert.equal(receipt(first,owner.snapshot()),receipt(start,value));
    owner.applyDiscount(30);
    assert.equal(first.total,100);
    assert.equal(start.total,100);
    assert.equal(value.total,100-amount);
    assert.equal(view.current().total,70);
  }
});
group("both-apis-reject-the-same-invalid-discounts-without-publishing", () => {
  for (const amount of [-1,101,NaN,Infinity,-Infinity]) {
    const old=quote(100,0), owner=new CartPricing(old), held=owner.snapshot();
    assert.throws(()=>withDiscount(old,amount), {name:"RangeError",message:"Invalid price"});
    assert.throws(()=>owner.applyDiscount(amount), {name:"RangeError",message:"Invalid price"});
    assert.equal(owner.snapshot(),held);
    assert.equal(old.total,100);
    const closure=valueCheckout(old);
    assert.throws(()=>closure.chooseDiscount(amount),RangeError);
    assert.equal(closure.read().total,100);
  }
});
group("constructor-checks-and-recomputes-rather-than-trusting-total", () => {
  for (const subtotal of [-1,NaN,Infinity,-Infinity]) assert.throws(()=>quote(subtotal,0),RangeError);
  assert.deepEqual(quote(0,0),{subtotal:0,discount:0,total:0});
  const fake={subtotal:100,discount:20,total:0};
  assert.equal(new CartPricing(fake).snapshot().total,80);
  assert.equal(withDiscount(fake,20).total,80);
  assert.equal(valueCheckout(fake).read().total,80);
});
group("scalar-input-and-snapshot-do-not-expose-writable-state", () => {
  const input={subtotal:100,discount:0,total:100};
  const owner=new CartPricing(input), old=owner.snapshot();
  const closure=valueCheckout(input);
  input.subtotal=1; input.total=1;
  assert.equal(owner.snapshot().subtotal,100);
  assert.equal(closure.read().total,100);
  assert.notEqual(old,input);
  assert.deepEqual(Object.keys(old).sort(),["discount","subtotal","total"]);
  assert(Object.isFrozen(old));
  assert.throws(()=>applyPromotion(old,20),TypeError);
  assert.equal(owner.snapshot().total,100);
  assert.equal(chooseDiscount(owner,20),"Was 100. Now 80.");
  assert.equal(old.total,100);
});
group("same-handler-behavior-for-value-and-class-owners", () => {
  const values=valueCheckout(quote(100,0)), owner=new CartPricing(quote(100,0)), view=owner.view();
  const read=values.read;
  const old=values.read();
  for (const amount of [20,30,0,100]) {
    assert.equal(values.chooseDiscount(amount),chooseDiscount(owner,amount));
    assert.equal(read().total,view.current().total);
    assert.equal(old.total,100);
  }
});
group("live-view-freezes-properties-without-freezing-what-they-read", () => {
  const LegacyCartPricing=load(originalApi).CartPricing;
  const owner=new LegacyCartPricing(quote(100,0)), view=owner.view();
  assert(Object.isFrozen(view));
  assert.throws(()=>applyPromotion(view,20),TypeError);
  owner.applyDiscount(20);
  assert.equal(view.total,80);
});
group("function-reader-keeps-live-access-and-returns-stable-values", () => {
  const {pricing,readPrice}=load(callable);
  const before=readPrice();
  pricing.applyDiscount(20);
  assert.equal(before.total,100);
  assert.equal(readPrice().total,80);
  const after=readPrice();
  pricing.applyDiscount(30);
  assert.equal(before.total,100);
  assert.equal(after.total,80);
  assert.equal(readPrice().total,70);
});
group("compatibility-wrapper-preserves-in-place-callers", () => {
  const {compatiblePromotion}=load(compatibility);
  for (const amount of [0,20,100]) {
    const legacy={subtotal:100,discount:0,total:100};
    const migrated={...legacy}, retained=migrated;
    applyPromotion(legacy,amount);
    compatiblePromotion(migrated,amount);
    assert.deepEqual(migrated,legacy);
    assert.equal(retained.total,100-amount);
  }
  const price={subtotal:100,discount:0,total:100};
  assert.throws(()=>compatiblePromotion(price,101),RangeError);
  assert.deepEqual(price,{subtotal:100,discount:0,total:100});
});
group("shallow-spreads-share-items-on-both-sides-of-a-boundary", () => {
  const {viaItem,viaCart}=load(aliases);
  const input={subtotal:100,discount:0,total:100,items:[{sku:"book",qty:1}]};
  const transformed={...input,discount:20,total:80};
  const privateState={...input};
  const shallowSnapshot={...privateState};
  viaItem(input.items[0]);
  assert.equal(transformed.items[0].qty,7);
  assert.equal(shallowSnapshot.items[0].qty,7);
  input.items[0].qty=2;
  viaItem(shallowSnapshot.items[0]);
  assert.equal(privateState.items[0].qty,7);
  viaCart(input);
  assert.equal(input.items.length,0);
  assert.equal(transformed.items.length,1);
});
group("strict-emission-and-sloppy-property-assignment", () => {
  assert(fs.readFileSync(path.join(api.outDir,"main.js"),"utf8").includes('"use strict"'));
  const strictQuote=quote(100,0);
  assert.throws(()=>applyPromotion(strictQuote,20),TypeError);
  const file=path.join(scratch,"sloppy.cjs");
  // Use the printed mutator body in a genuinely sloppy standalone script.
  const emitted = fs.readFileSync(path.join(api.outDir,"main.js"),"utf8");
  const start=emitted.indexOf("function applyPromotion(");
  assert(start>=0);
  const end=emitted.indexOf("\n}",start)+2;
  assert(end>start);
  fs.writeFileSync(file,emitted.slice(start,end)+
    '\nconst price=Object.freeze({subtotal:100,discount:0,total:100}); applyPromotion(price,20); console.log(price.total);\n');
  assert.equal(cp.execFileSync(process.execPath,[file],{encoding:"utf8"}).trim(),"100");
});
console.log("TypeScript " + version + ": Chapter 17 — " + fences.length + " fences, " +
  cases.length + " compiler cases, " + groups + " runtime groups. PASS");
console.log("Fixtures: " + scratch);
