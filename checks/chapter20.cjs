// Currying, local partial application, preparation ownership, and validation timing.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const cp=require("node:child_process"),assert=require("node:assert/strict");
const {compile,describe,version}=require("./compiler.cjs");
const chapter=fs.readFileSync(path.resolve(__dirname,
  "../book/03-patterns-and-design/07-currying-partial-application.md"),"utf8");
const fences=[...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1]);
const used=new Set();
function block(prefix){
  const found=fences.map((text,index)=>({text,index})).filter(f=>f.text.startsWith(prefix));
  assert.equal(found.length,1,"Unique fence: "+prefix);used.add(found[0].index);return found[0].text+"\n";
}
function before(source,at){const index=source.indexOf(at);assert(index>=0,"Missing split: "+at);return source.slice(0,index);}
function from(source,at){const index=source.indexOf(at);assert(index>=0,"Missing split: "+at);return source.slice(index);}
function replaceOnce(source,old,next){assert.equal(source.split(old).length,2,"Unique replacement: "+old);return source.replace(old,next);}
function withoutErrors(source){return source.split("\n").filter(line=>!line.includes("// Error TS")).join("\n");}
const opening=block("type Line =");
const incident=block("console.log(lines.map(lineTotal)");
const options=block("type Discount =");
const renderers=block("type PriceLine =");
const local=block("const discount: Discount =");
const convenience=block("const discountedBy =");
const tiered=block("type Tier =");
const tierRun=block("const promotion: Promotion =");
const factory=block("function priceWith(promotion:");
const stored=block("const layout:");
const empty=block("const invalid:");
const inference=block("function pair<T>");
const explicit=block("type Either =");
assert.equal(used.size,fences.length,"Every TypeScript fence extracted");
const lineType=before(opening,"function lineTotal(");
const lines=before(from(opening,"const lines:"),"console.log(");
const numeric=before(from(opening,"function lineTotal("),"const lines:");
const promotion=before(tierRun,"const price:");
const privatePricing=before(tiered,"function lineTotal(");
const early=lineType+lines;
const tierBase=lineType+renderers+tiered;
const stagedBase=lineType+renderers+privatePricing+factory;
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"ts-book-ch20-"));
const cases=[];
function program(name,files,codes=[]){
  const dir=path.join(scratch,name);fs.mkdirSync(dir);
  const inputs=Object.entries(files).map(([name,source])=>{
    const file=path.join(dir,name);fs.writeFileSync(file,source);return {file,source};
  });
  const markers=inputs.flatMap(({file,source})=>source.split("\n").flatMap((line,i)=>
    line.includes("// Error TS")?[{fileName:file,line:i+1}]:[]));
  assert.equal(markers.length,codes.length,"Diagnostic markers: "+name);
  const outDir=path.join(dir,"out");const checked=compile(inputs.map(i=>i.file),{outDir},dir);
  assert.deepEqual(checked.diagnostics.map(d=>({fileName:d.fileName,line:d.line,code:d.code})),
    markers.map((m,i)=>({...m,code:codes[i]})),name+"\n"+describe(checked.diagnostics));
  const test={name,outDir,diagnostics:checked.diagnostics};cases.push(test);return test;
}
function example(name,source,codes=[]){return program(name,{"main.ts":"export {};\n"+source},codes);}
const oldPrint=example("original-and-index-incident",opening+incident);
const required=example("required-number-still-accepts-index",early+
  replaceOnce(numeric,"percent = 0","percent: number")+incident);
const optionsError=example("options-reject-index",early+options,[2345]);
const optionsPrint=example("options-local-and-curried-callers",early+withoutErrors(options)+renderers+local+convenience+"export {lineTotal,lines};\n");
const localPrint=example("tiers-local-adapter",tierBase+tierRun);
const stagedPrint=example("tiers-stored-factory-and-checkout",stagedBase+promotion+stored);
const emptyPrint=example("empty-invalid-report",stagedBase+empty);
const inferError=example("early-type-inference",inference,[2353]);
const inferApi=example("early-type-inference-explicit-union",withoutErrors(inference)+explicit+"export {pair,pairWith};\n");
const published=stagedBase+"export {lineTotal,priceWith};\n";
program("preparation-is-private",{
  "pricing.ts":published,
  "main.ts":"import {prepare} from './pricing'; // Error TS2459\n",
},[2459]);
example("factory-itself-is-not-a-line-callback",stagedBase+promotion+
  "orderLines.map(priceWith); // Error TS2345\n",[2345]);
const changedFactory=replaceOnce(replaceOnce(before(factory,"function lineTotal("),
  "): PriceLine {", "): (line: Line, trace: string) => number {"),
  "function priceLine(line: Line): number", "function priceLine(line: Line, trace: string): number");
const changedBase=lineType+renderers+privatePricing+changedFactory;
example("stored-unary-contract-detects-required-argument",changedBase+promotion+
  "const layout: {price:PriceLine} = {price:priceWith(promotion)}; // Error TS2322\n",[2322]);
example("direct-call-can-adapt-without-changing-its-caller",changedBase+promotion+
  replaceOnce(from(factory,"function lineTotal("),"priceWith(promotion)(line)","priceWith(promotion)(line, 'checkout')")+
  "const result:number=lineTotal(orderLines[0],promotion);\n");
const counts=`let preparations=0,tierValidations=0,lineEvaluations=0;
function resetCounts(){preparations=0;tierValidations=0;lineEvaluations=0;}
function readCounts(){return [preparations,tierValidations,lineEvaluations];}
`;
// Diagnostic counters inserted at entry/iteration points in the manuscript bodies.
// No replacement preparation, validation, or pricing algorithm.
function counted(source){
  source=replaceOnce(source,"function prepare(promotion: Promotion): readonly Tier[] {",
    "function prepare(promotion: Promotion): readonly Tier[] {\n preparations++;");
  source=replaceOnce(source,"promotion.tiers.map(({ minimum, percent }) => {",
    "promotion.tiers.map(({ minimum, percent }) => {\n tierValidations++;");
  return counts+replaceOnce(source,"function evaluate(line: Line, tiers: readonly Tier[]): number {",
    "function evaluate(line: Line, tiers: readonly Tier[]): number {\n lineEvaluations++;");
}
const apiExports="export {prepare,evaluate,lineTotal,promotion,orderLines,statement,preview,resetCounts,readCounts};\n";
const localApi=example("instrumented-local-adapter",counted(tierBase)+promotion+apiExports);
const stagedApi=example("instrumented-staged-factory",counted(stagedBase)+promotion+apiExports+"export {priceWith};\n");
const alternatives=`
function priceLines(lines:readonly Line[],promotion:Promotion):number[]{return lines.map(priceWith(promotion));}
function lazyPriceWith(promotion:Promotion):PriceLine {
  let price:PriceLine|undefined;
  return line=>{price ??= priceWith(promotion);return price(line);};
}
export {priceLines,lazyPriceWith};
`;
const alternativesApi=example("batch-and-lazy-alternatives",counted(stagedBase)+promotion+apiExports+
  alternatives+"export {priceWith};\n");
// A private-representation alternative, not additional manuscript implementation.
// The public return type stays PriceLine; the callback closes over a lookup,
// rather than the Tier array used by evaluate in the printed implementation.
const lookupFactory=`
function priceWith(promotion:Promotion):PriceLine {
  const byMinimum=new Map(prepare(promotion).map(t=>[t.minimum,t.percent]));
  const minimums=[...byMinimum.keys()].sort((a,b)=>a-b);
  return function priceLine(line:Line):number {
    let percent=0;
    for(const minimum of minimums){if(minimum>line.quantity)break;percent=byMinimum.get(minimum)!;}
    return line.unitPrice*line.quantity*(100-percent)/100;
  };
}
`;
const lookupApi=example("internal-lookup-keeps-public-contract",lineType+renderers+privatePricing+
  lookupFactory+from(factory,"function lineTotal(")+promotion+stored+"export {priceWith,promotion};\n");
// Abbreviated compiler excerpts printed in the manuscript must occur verbatim.
assert(optionsError.diagnostics[0].message.includes("Type 'number' has no properties in common with type 'Discount'."));
assert(inferError.diagnostics[0].message.includes("'b' does not exist in type '{ a: number; }'."));
let groups=0;
function group(name,fn){try{fn();}catch(e){e.message=name+": "+e.message;throw e;}groups++;}
function run(test,fn){
  const code=`const assert=require('node:assert/strict');const output=[];console.log=(...v)=>output.push(v);
const m=require(${JSON.stringify(path.join(test.outDir,"main.js"))});
const result=(${fn.toString()})(m,assert,output);process.stdout.write(JSON.stringify({output,result}));`;
  return JSON.parse(cp.execFileSync(process.execPath,["-e",code],{encoding:"utf8",timeout:60000}));
}
function printed(source){
  return [...source.matchAll(/^console\.log\([^\n]*\); \/\/ ([^\n]+)$/gm)].map(m=>{
    const text=m[1];return [/^\d+$/.test(text)?Number(text):text];
  });
}
group("printed-original-and-incident",()=>{
  const expected=printed(opening+incident);assert.equal(expected.length,4);
  // join() outputs remain strings, including the single-item case.
  expected[3]=["100"];assert.deepEqual(run(oldPrint,()=>{}).output,expected);
});
group("required-parameter-does-not-change-runtime",()=>{
  assert.deepEqual(run(required,()=>{}).output,[["100,99,98"],["100"]]);
});
group("printed-options-and-partial-applications",()=>{
  const expected=printed(withoutErrors(options)+local+convenience);assert.equal(expected.length,5);
  assert.deepEqual(run(optionsPrint,(m,assert)=>{
    assert.equal(m.lineTotal(m.lines[0]),100);
    assert.equal(m.lineTotal(m.lines[0],{}),100);
    assert.deepEqual(m.lines.map(line=>m.lineTotal(line)),[100,100,100]);
  }).output,expected);
});
group("printed-local-tier-output",()=>{
  const expected=printed(tierRun);assert.equal(expected.length,2);
  assert.deepEqual(run(localPrint,()=>{}).output,expected);
});
group("printed-stored-factory-and-direct-checkout",()=>{
  const expected=printed(stored);assert.equal(expected.length,3);
  assert.deepEqual(run(stagedPrint,()=>{}).output,expected);
});
group("printed-empty-invalid-report",()=>{
  assert(empty.includes("// Invalid promotion tier"));
  assert.deepEqual(run(emptyPrint,()=>{}).output,[[0],["Invalid promotion tier"]]);
});
group("reporting-count-table",()=>{
  const rows=[...chapter.matchAll(/^\| (Local adapter around `lineTotal`|One stored `priceWith` result) \| (\d+) \| (\d+) \| (\d+) \|$/gm)];
  assert.equal(rows.length,2);
  for(const [index,test] of [localApi,stagedApi].entries()){
    const got=run(test,(m,assert)=>{
      m.resetCounts();const price=m.priceWith?m.priceWith(m.promotion):line=>m.lineTotal(line,m.promotion);
      assert.equal(m.statement(m.orderLines,price),520);assert.equal(m.preview(m.orderLines,price),"100,180,240");
      return m.readCounts();
    });
    assert.deepEqual(got.result,rows[index].slice(2).map(Number));
  }
});
group("one-direct-checkout-preparation",()=>run(stagedApi,(m,assert)=>{
  m.resetCounts();assert.equal(m.lineTotal(m.orderLines[0],m.promotion),100);assert.deepEqual(m.readCounts(),[1,3,1]);
}));
group("valid-empty-report-prepares-only-if-factory-called",()=>run(stagedApi,(m,assert)=>{
  m.resetCounts();const lazy=line=>m.lineTotal(line,m.promotion);
  assert.equal(m.statement([],lazy),0);assert.deepEqual(m.readCounts(),[0,0,0]);
  const price=m.priceWith(m.promotion);assert.equal(m.statement([],price),0);assert.deepEqual(m.readCounts(),[1,3,0]);
}));
group("invalid-promotion-rejected-before-any-evaluation",()=>run(stagedApi,(m,assert)=>{
  for(const tiers of [[],[{minimum:0,percent:0}],[{minimum:1.5,percent:0}],[{minimum:NaN,percent:0}],
    [{minimum:1,percent:Infinity}],[{minimum:1,percent:-1}],[{minimum:1,percent:101}],
    [{minimum:1,percent:10},{minimum:1,percent:20}]]){
    m.resetCounts();assert.throws(()=>m.priceWith({tiers}),RangeError);assert.equal(m.readCounts()[2],0);
  }
}));
group("tier-boundaries-order-defaults-and-repeat-calls",()=>run(stagedApi,(m,assert)=>{
  const p={tiers:[{minimum:4,percent:100},{minimum:2,percent:10}]};
  const before=JSON.stringify(p);const price=m.priceWith(p);
  assert.deepEqual([1,2,3,4,5].map(quantity=>price({unitPrice:100,quantity})),[100,180,270,0,0]);
  assert.equal(JSON.stringify(p),before);
  for(const quantity of [1,2,3,4,5])assert.equal(price({unitPrice:100,quantity}),m.lineTotal({unitPrice:100,quantity},p));
}));
group("two-batches-versus-one-collected-batch",()=>run(alternativesApi,(m,assert)=>{
  m.resetCounts();assert.deepEqual(m.priceLines(m.orderLines,m.promotion),[100,180,240]);
  assert.deepEqual(m.priceLines(m.orderLines,m.promotion),[100,180,240]);assert.deepEqual(m.readCounts(),[2,6,6]);
  m.resetCounts();assert.deepEqual(m.priceLines([...m.orderLines,...m.orderLines],m.promotion),[100,180,240,100,180,240]);
  assert.deepEqual(m.readCounts(),[1,3,6]);
}));
group("lazy-preparation-is-a-working-timing-alternative",()=>run(alternativesApi,(m,assert)=>{
  m.resetCounts();const price=m.lazyPriceWith(m.promotion);assert.deepEqual(m.readCounts(),[0,0,0]);
  assert.equal(m.statement(m.orderLines,price),520);assert.equal(m.preview(m.orderLines,price),"100,180,240");
  assert.deepEqual(m.readCounts(),[1,3,6]);
  m.resetCounts();const invalid=m.lazyPriceWith({tiers:[{minimum:1,percent:101}]});
  assert.equal(m.statement([],invalid),0);assert.deepEqual(m.readCounts(),[0,0,0]);
  assert.throws(()=>invalid(m.orderLines[0]),RangeError);assert.deepEqual(m.readCounts(),[1,1,0]);
}));
group("private-lookup-repair-keeps-callers-and-prices",()=>{
  assert.deepEqual(run(lookupApi,(m,assert)=>{
    const price=m.priceWith(m.promotion);
    assert.deepEqual([1,2,3,4].map(quantity=>price({unitPrice:100,quantity})),[100,180,240,320]);
  }).output,printed(stored));
});
group("generic-pair-values-with-explicit-union",()=>run(inferApi,(m,assert)=>{
  assert.deepEqual(m.pair({a:1},{b:2}),[{a:1},{b:2}]);
  assert.deepEqual(m.pairWith({a:1})({b:2}),[{a:1},{b:2}]);
}));
console.log(`Chapter 20: TypeScript ${version}; ${fences.length} fences; ${cases.length} compiler cases; ${groups} runtime groups; PASS`);
console.log(`Fixtures: ${scratch}`);
