const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/03-patterns-and-design/06-imperative-vs-declarative.md"), "utf8");
const fences = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1]);
const used = new Set();
function block(prefix) {
  const matches=fences.map((text,index)=>({text,index})).filter(f=>f.text.startsWith(prefix));
  assert.equal(matches.length,1,"Unique fence: "+prefix);
  used.add(matches[0].index);return matches[0].text+"\n";
}
function before(source,delimiter) {
  const at=source.indexOf(delimiter);assert(at>=0,"Missing delimiter: "+delimiter);
  return source.slice(0,at);
}
function replaceOnce(source,old,next) {
  assert.equal(source.split(old).length,2,"Unique replacement: "+old);
  return source.replace(old,next);
}
const original=block("type PayoutFields =");
const ordinary=block("const ready =");
const eligibility=block("const isReady =");
const skipping=block("function skipping(");
const incident=block("const queue =");
const folded=block("type Stop =");
const looped=block("function looped(");
const split=block("function split(");
const held=block("const heldFirst:");
const reservation=block("type WaitingPayout =");
const names=block("const stopAtFirstBlocker =");
const reportFailure=block("type ReportRow =");
const reportMap=block("const refundAmounts =");
const reportFlat=block("const refunds =");
assert.equal(used.size,fences.length,"Every TypeScript fence extracted");
const fixtures=before(ordinary,"const batch =");
const base=original+fixtures+eligibility;
const batchTypes=before(folded,"function folded(");
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"ts-book-ch19-"));
const cases=[];
function example(name,source) {
  source="export {};\n"+source;
  const dir=path.join(scratch,name);fs.mkdirSync(dir);
  const file=path.join(dir,"main.ts");fs.writeFileSync(file,source);
  const outDir=path.join(dir,"out");
  const expected=source.split("\n").flatMap((line,i)=>{
    const m=line.match(/\/\/ Error TS(\d+): (.+)$/);
    return m?[{line:i+1,code:Number(m[1]),message:m[2]}]:[];
  });
  const result=compile([file],{outDir},dir);
  assert.deepEqual(result.diagnostics.map(d=>({line:d.line,code:d.code,message:d.message})),
    expected,name+"\n"+describe(result.diagnostics));
  const test={name,outDir};cases.push(test);return test;
}
const originalApi=example("original-and-fixture",original+fixtures+"export {original,ready};\n");
const ordinaryPrint=example("ordinary-batch-output",original+ordinary);
const eligibleApi=example("inferred-status-predicate",base+"export {eligible,ready,destinations};\n");
example("eligible-return-type-is-inferred",original+fixtures+
  replaceOnce(eligibility,"function eligible(queue: readonly Payout[]): Ready[]", "function eligible(queue: readonly Payout[])")+`
type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false;
const readyArray:Equal<ReturnType<typeof eligible>,Ready[]>=true;
`);
const skipApi=example("skipping-fold",base+skipping+"export {skipping,ready};\n");
const incidentPrint=example("overtaking-printed-ids-and-totals",base+skipping+incident);
const foldApi=example("closed-state-fold",base+folded+"export {folded,ready};\n");
const loopApi=example("loop-same-stop-reason",base+batchTypes+looped+"export {looped,ready};\n");
const heldPrint=example("eligibility-before-allowance-output",base+batchTypes+looped+held);
const namedApi=example("named-stop-and-fill-public-contracts",base+batchTypes+looped+skipping+names+`
type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false;
const stopReturn:Equal<ReturnType<typeof stopAtFirstBlocker>,Batch>=true;
const fillReturn:Equal<ReturnType<typeof fillAvailable>,Plan>=true;
export {stopAtFirstBlocker,fillAvailable,ready};
`);
// Liron's printed split uses the same result type and eligibility stages.
const splitApi=example("split-at-first-blocker",base+batchTypes+split+"export {split,ready};\n");
const reserveApi=example("fill-then-reserve-with-explicit-day",base+batchTypes+reservation+
  "export {fillThenReserve,ready};\n");
const limitLine="    if (total + payout.amount > allowance) break;\n";
const wrongOrder=replaceOnce(replaceOnce(original,limitLine,""),
  "  for (const payout of queue) {\n","  for (const payout of queue) {\n"+limitLine);
const wrongApi=example("regression-allowance-before-eligibility",wrongOrder+fixtures+"export {original,ready};\n");
example("optional-property-filter-failure",reportFailure);
const rowType=before(reportFailure,"declare const rows:");
const mapApi=example("optional-value-filter-repair",rowType+
  "export function report(rows:ReportRow[]) {\n"+reportMap+"return refundAmounts;\n}\n");
const flatApi=example("flatmap-preserves-id",rowType+
  "export function report(rows:ReportRow[]) {\n"+reportFlat+"return refunds;\n}\n");
// Instrument only the printed fold and loop, preserving their conditions.
// Counts measure reducer callbacks and allowance comparisons, not CPU time.
const countedFold=replaceOnce(replaceOnce(folded,
  "    if (state.kind === \"closed\") return state;",
  "    callbacks++;\n    if (state.kind === \"closed\") return state;"),
  "    if (state.total + payout.amount > allowance)",
  "    budgetChecks++;\n    if (state.total + payout.amount > allowance)");
const countedLoop=replaceOnce(looped,"    if (total + payout.amount > allowance)",
  "    budgetChecks++;\n    if (total + payout.amount > allowance)");
const countApi=example("loop-and-fold-operation-counts",base+`
let callbacks=0,budgetChecks=0;
function reset(){callbacks=0;budgetChecks=0;}
function counts(){return {callbacks,budgetChecks};}
`+countedFold+countedLoop+"export {folded,looped,ready,reset,counts};\n");

function load(test){return require(path.join(test.outDir,"main.js"));}
function outputs(test) {
  const script=`const output=[];console.log=(...values)=>output.push(values);
require(${JSON.stringify(path.join(test.outDir,"main.js"))});
process.stdout.write(JSON.stringify(output));`;
  return JSON.parse(cp.execFileSync(process.execPath,["-e",script],{encoding:"utf8"}));
}
let groups=0;
function group(name,fn){
  try{fn();}catch(error){error.message=name+": "+error.message;throw error;}
  groups++;
}
function simple(plan){return {ids:plan.released.map(p=>p.id),total:plan.total};}
const {ready}=load(originalApi);
const stopFunctions=[load(originalApi).original,load(foldApi).folded,
  load(loopApi).looped,load(namedApi).stopAtFirstBlocker,load(splitApi).split];
const typedFunctions=stopFunctions.slice(1);
const skip=load(skipApi).skipping;
const fillAvailable=load(namedApi).fillAvailable;
const reserve=load(reserveApi).fillThenReserve;
const queue=[ready("P1",400),ready("P2",900),ready("P3",200),ready("P4",300)];
const heldQueue=[{id:"H",amount:1200,currency:"USD",status:"held",reason:"review"},
  ready("R1",600),ready("R2",500)];
group("ordinary-printed-values",()=>{
  const comments=[...ordinary.matchAll(/console.log\([^\n]+; \/\/ (.+)/g)].map(m=>m[1]);
  assert.deepEqual(comments,["A,B","900"]);
  assert.deepEqual(outputs(ordinaryPrint),[[comments[0]],[Number(comments[1])]]);
});
group("incident-printed-values",()=>{
  const comments=[...incident.matchAll(/^\/\/ (P1[^\n]+)$/gm)].map(m=>{
    const [ids,total]=m[1].split(" ");return [ids,Number(total)];
  });
  assert.equal(comments.length,2);assert.deepEqual(outputs(incidentPrint),comments);
});
group("held-printed-values",()=>{
  assert(held.includes("// R1"));assert(held.includes("// { kind: 'limit', id: 'R2' }"));
  assert.deepEqual(outputs(heldPrint),[["R1"],[{kind:"limit",id:"R2"}]]);
});
group("all-repairs-agree-on-incident-and-reason",()=>{
  for(const f of stopFunctions)assert.deepEqual(simple(f(queue,1000)),{ids:["P1"],total:400});
  for(const f of typedFunctions)assert.deepEqual(f(queue,1000).stop,{kind:"limit",id:"P2"});
  assert.deepEqual(simple(skip(queue,1000)),{ids:["P1","P3","P4"],total:900});
  assert.deepEqual(fillAvailable(queue,1000),skip(queue,1000));
  assert.deepEqual(Object.keys(fillAvailable(queue,1000)).sort(),["released","total"]);
  assert.deepEqual(Object.keys(load(namedApi).stopAtFirstBlocker(queue,1000)).sort(),["released","stop","total"]);
  assert(chapter.includes("`fillAvailable` returns `Plan`"));
});
group("fixture-that-hid-skip",()=>{
  for(const f of [...stopFunctions,skip,fillAvailable]){
    assert.deepEqual(simple(f(queue.slice(0,2),1000)),{ids:["P1"],total:400});
  }
});
group("eligibility-individual-rules-and-inferred-destinations",()=>{
  const m=load(eligibleApi);
  const fixture=[{...heldQueue[0],amount:100}, {...ready("EUR",300),currency:"EUR"},
    ready("LOW",99),ready("MIN",100),ready("NEXT",200)];
  assert.deepEqual(m.eligible(fixture).map(p=>p.id),["MIN","NEXT"]);
  assert.deepEqual(m.destinations,["test-account","test-account"]);
  for(const f of [...stopFunctions,skip,fillAvailable])
    assert.deepEqual(simple(f(fixture,1000)),{ids:["MIN","NEXT"],total:300});
});
group("held-before-and-after-blocker-and-wrong-order",()=>{
  for(const f of stopFunctions)assert.deepEqual(simple(f(heldQueue,1000)),{ids:["R1"],total:600});
  assert.deepEqual(simple(load(wrongApi).original(heldQueue,1000)),{ids:[],total:0});
  const heldAfter=[...queue.slice(0,2),heldQueue[0],...queue.slice(2)];
  for(const f of typedFunctions){
    assert.deepEqual(simple(f(heldAfter,1000)),{ids:["P1"],total:400});
    assert.deepEqual(f(heldAfter,1000).stop,{kind:"limit",id:"P2"});
  }
});
group("empty-exact-fit-and-exhausted-allowance",()=>{
  const tests=[
    [[],1000,[],0,{kind:"end"}],
    [[ready("A",400),ready("B",600)],1000,["A","B"],1000,{kind:"end"}],
    [[ready("A",1000),ready("B",100)],1000,["A"],1000,{kind:"limit",id:"B"}],
    [[ready("A",100)],0,[],0,{kind:"limit",id:"A"}],
  ];
  for(const [input,limit,ids,total,stop] of tests){
    for(const f of stopFunctions)assert.deepEqual(simple(f(input,limit)),{ids,total});
    for(const f of typedFunctions)assert.deepEqual(f(input,limit).stop,stop);
    assert.deepEqual(simple(skip(input,limit)),{ids,total});
  }
});
group("local-mutation-does-not-leak-between-calls-or-change-input",()=>{
  const input=queue.map(p=>Object.freeze({...p,account:Object.freeze({...p.account})}));
  Object.freeze(input);const expected=JSON.stringify(input);
  for(const f of [...stopFunctions,skip,fillAvailable]){
    const first=f(input,1000),second=f(input,1000);
    assert.deepEqual(first,second);assert.notEqual(first.released,second.released);
    first.released.length=0;assert(second.released.length>0);
    assert.equal(JSON.stringify(input),expected);
  }
});
group("printed-operation-counts",()=>{
  assert(chapter.includes("Four reducer calls, two allowance checks"));
  const m=load(countApi);m.reset();m.folded(queue,1000);
  assert.deepEqual(m.counts(),{callbacks:4,budgetChecks:2});
  m.reset();m.looped(queue,1000);assert.deepEqual(m.counts(),{callbacks:0,budgetChecks:2});
});
// Funding scheduler model: append arrivals before each day's batch, deposit or
// reset, remove only selected IDs, retain queue order. All inputs are already
// eligible. The actual emitted planners make the stop/skip decision each day.
function schedule(planner,arrivals,daily,carry=false,days=arrivals.length+8){
  let remaining=[],balance=0;const paid=new Map(),trace=[];
  for(let day=1;day<=days;day++){
    remaining.push(...(arrivals[day-1]??[]));
    balance=carry?balance+daily:daily;
    const before=balance,result=planner(remaining,balance,day);
    const ids=new Set(result.released.map(p=>p.id));
    for(const id of ids){assert(!paid.has(id));paid.set(id,day);}
    remaining=remaining.filter(p=>!ids.has(p.id));balance-=result.total;
    assert(balance>=0);trace.push({day,before,released:[...ids],after:balance,remaining:remaining.map(p=>p.id)});
  }
  return {paid,trace,remaining};
}
group("reset-next-days-table",()=>{
  const stop=schedule(load(loopApi).looped,[queue],1000,false,3);
  const skipping=schedule(skip,[queue],1000,false,3);
  const rows=[...chapter.matchAll(/^\| ([123]) \| (P[^|]+) \| (P[^|]+|—) \|$/gm)];
  assert.equal(rows.length,3);
  rows.forEach((r,i)=>{
    assert.equal(stop.trace[i].released.join(", "),r[2].trim());
    assert.equal(skipping.trace[i].released.join(", ")||"—",r[3].trim());
  });
  assert.equal(stop.paid.get("P2"),2);assert.equal(skipping.paid.get("P2"),2);
  assert.equal(stop.remaining.length,0);assert.equal(skipping.remaining.length,0);
});
group("named-78125-reset-cases-no-id-paid-later-under-skip",()=>{
  assert(chapter.includes("all 78,125 combinations"));
  assert(chapter.includes("four opening payouts and one arrival on each of the next three days"));
  assert(chapter.includes("100, 200, 300, 400 or 500"));
  assert(chapter.includes("allowance resets to 500"));
  let count=0,earlier=0;
  for(let n=0;n<5**7;n++){
    let digits=n;const items=[];
    for(let i=0;i<7;i++){items.push(ready(String(i),100*(digits%5+1)));digits=Math.floor(digits/5);}
    const arrivals=[items.slice(0,4),...[4,5,6].map(i=>[items[i]])];
    const stop=schedule(load(loopApi).looped,arrivals,500);
    const skipping=schedule(skip,arrivals,500);
    assert.equal(stop.paid.size,7);assert.equal(skipping.paid.size,7);
    // The prose gives an induction, not a claim that this finite set proves it.
    // Pin its daily subset invariant in every named case too.
    for(let day=0;day<stop.trace.length;day++){
      const pending=new Set(stop.trace[day].remaining);
      assert(skipping.trace[day].remaining.every(id=>pending.has(id)));
    }
    for(const [id,day] of stop.paid){
      assert(skipping.paid.get(id)<=day,"Later under skip: "+n+" id "+id);
      if(skipping.paid.get(id)<day)earlier++;
    }
    count++;
  }
  assert.equal(count,78125);assert(earlier>0);
});
function fundingRuns(amount,arrivalThrough=8,days=12) {
  const arrivals=[[{...ready("P2",900),arrivedOn:1},{...ready("S1",400),arrivedOn:1}]];
  for(let day=2;day<=arrivalThrough;day++)
    arrivals.push([{...ready("S"+day,amount),arrivedOn:day}]);
  return [load(loopApi).looped,skip,(q,b,day)=>reserve(q,b,day,2)]
    .map(f=>schedule(f,arrivals,500,true,days));
}
group("all-id-accumulation-table-and-thirteen-payout-days",()=>{
  assert(chapter.includes("both arrive on day 1, with P2 first"));
  const runs=fundingRuns(450);
  const rows=[...chapter.matchAll(/^\| (P2|S[1-8]) \| (\d+) \| (\d+) \| (\d+) \|$/gm)];
  assert.equal(rows.length,9);
  assert.equal(new Set(rows.map(r=>r[1])).size,9);
  for(const [,id,...days] of rows){
    assert.deepEqual(runs.map(r=>r.paid.get(id)),days.map(Number),id);
  }
  assert(runs.every(r=>r.remaining.length===0));
  const [stop,fill,bounded]=runs;
  const differences=Array.from({length:8},(_,i)=>{
    const id="S"+(i+1);return stop.paid.get(id)-fill.paid.get(id);
  });
  assert.deepEqual(differences,[2,2,2,2,2,2,1,0]);
  assert.equal(differences.reduce((a,b)=>a+b,0),13);
  assert.equal(differences.filter(d=>d>0).length,7);
  assert.equal(fill.paid.get("P2")-stop.paid.get("P2"),6);
  assert.deepEqual([bounded.paid.get("P2")-stop.paid.get("P2"),
    bounded.paid.get("S1")-stop.paid.get("S1"),
    bounded.paid.get("S2")-stop.paid.get("S2")],[2,-2,-2]);
  for(let i=3;i<=8;i++)assert.equal(bounded.paid.get("S"+i),stop.paid.get("S"+i));
  assert(chapter.includes("Thirteen payout-days across seven payouts"));
});
group("500-arrivals-ending-day-eight-all-ids-and-day-ten",()=>{
  const runs=fundingRuns(500);
  const ids=["P2",...Array.from({length:8},(_,i)=>"S"+(i+1))];
  const expected=[
    [2,3,4,5,6,7,8,9,10],
    [10,1,2,3,4,5,6,7,8],
    [4,1,2,5,6,7,8,9,10],
  ];
  runs.forEach((r,i)=>{
    assert.deepEqual(ids.map(id=>r.paid.get(id)),expected[i]);
    assert.equal(r.remaining.length,0);
  });
  // Retain the finite-arrival control after the day-10 dialogue was cut.
});
group("continuing-500-arrivals-thirty-days-and-recurring-balance",()=>{
  const [stop,fill,bounded]=fundingRuns(500,30,30);
  assert.equal(stop.paid.get("P2"),2);
  assert.equal(fill.paid.get("P2"),undefined);
  assert.equal(bounded.paid.get("P2"),4);
  assert.equal(fill.trace[0].before,500);
  for(let i=0;i<30;i++){
    assert.equal(fill.trace[i].after,100);
    if(i>0)assert.equal(fill.trace[i].before,600);
    assert.deepEqual(fill.trace[i].released,["S"+(i+1)]);
  }
  // Assert every ID through the horizon, not just the oldest payout.
  for(let i=1;i<=30;i++){
    const id="S"+i;
    assert.equal(fill.paid.get(id),i);
    assert.equal(stop.paid.get(id),i+2<=30?i+2:undefined);
    const boundedDay=i<=2?i:i+2;
    assert.equal(bounded.paid.get(id),boundedDay<=30?boundedDay:undefined);
  }
  assert(chapter.includes("still unpaid on day 30"));
  assert(chapter.includes("As long as those arrivals continue, P2 never gets paid"));
  // The infinite claim uses the stated recurring-balance invariant; a 30-day
  // run alone would not prove it. Later arrivals are always appended.
});
group("reservation-threshold-boundaries-and-visible-stop-reason",()=>{
  const input=[{...ready("P2",900),arrivedOn:1},{...ready("S2",500),arrivedOn:2}];
  assert.deepEqual(simple(reserve(input,600,2,2)),{ids:["S2"],total:500});
  assert.deepEqual(reserve(input,600,2,2).stop,{kind:"end"});
  assert.deepEqual(reserve(input,600,3,2),{released:[],total:0,stop:{kind:"limit",id:"P2"}});
  assert.deepEqual(simple(reserve(input,1100,4,2)),{ids:["P2"],total:900});
  assert.deepEqual(reserve(input,1100,4,2).stop,{kind:"limit",id:"S2"});
  const originalQueue=queue.map(p=>({...p,arrivedOn:1}));
  assert.deepEqual(reserve(originalQueue,1000,1,0),load(loopApi).looped(originalQueue,1000));
  assert.deepEqual(simple(reserve(originalQueue,1000,1,100)),simple(skip(originalQueue,1000)));
  assert.deepEqual(reserve([],1000,1,2),{released:[],total:0,stop:{kind:"end"}});
  const exact=[{...ready("EXACT",500),arrivedOn:1}];
  assert.deepEqual(simple(reserve(exact,500,3,2)),{ids:["EXACT"],total:500});
  assert.deepEqual(reserve(exact,500,3,2).stop,{kind:"end"});
});
group("reservation-explicit-day-and-local-state",()=>{
  const input=Object.freeze(queue.map(p=>Object.freeze({...p,arrivedOn:1})));
  const oldClock=Date.now;Date.now=()=>{throw new Error("The planner must not read a clock");};
  try {
    const first=reserve(input,1000,1,2),second=reserve(input,1000,1,2);
    assert.deepEqual(first,second);assert.notEqual(first.released,second.released);
    first.released.length=0;assert(second.released.length>0);
    assert.deepEqual(simple(reserve(input,1000,3,2)),{ids:["P1"],total:400});
  }finally{Date.now=oldClock;}
});
group("refund-repairs-values-and-associated-ids",()=>{
  const rows=[{id:"A"},{id:"B",refund:{amount:0}},{id:"C",refund:{amount:700}}];
  assert.deepEqual(load(mapApi).report(rows),[0,700]);
  assert.deepEqual(load(flatApi).report(rows),[{id:"B",amount:0},{id:"C",amount:700}]);
});
console.log(`TypeScript ${version}: Chapter 19 — ${fences.length} fences, ${cases.length} compiler cases, ${groups} runtime groups. PASS`);
console.log("Fixtures: "+scratch);
