// Hidden clock, required observations, compatible boundary, and calendar policy.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/03-patterns-and-design/05-pure-functions.md"), "utf8");
const fences = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const found = fences.map((text,index)=>({text,index})).filter(f=>f.text.startsWith(prefix));
  assert.equal(found.length,1,"Unique fence: "+prefix);
  used.add(found[0].index);
  return found[0].text+"\n";
}
function before(source,delimiter) {
  const at=source.indexOf(delimiter);assert(at>=0,"Missing split: "+delimiter);
  return source.slice(0,at);
}
function from(source,delimiter) {
  const at=source.indexOf(delimiter);assert(at>=0,"Missing split: "+delimiter);
  return source.slice(at);
}
function replaceOnce(source,old,next) {
  assert.equal(source.split(old).length,2,"Unique replacement: "+old);
  return source.replace(old,next);
}
const opening=block("type Ticket =");
const cached=block("const ticketKey =");
const replay=block("const realNow = Date.now;\ntry");
const original=block("type Evaluation =");
const ttl=block("const cachedEvaluation =");
const boundary=block("const realNow = Date.now;\nconst nearDeadline =");
const pure=block("function evaluate(");
const factory=block("function makeSla()");
const refresh=block("function refresh(");
const local=block("function isBusinessMinute(");
const zonePrint=block("console.log(new Date(deadlineFor(ticket))");
const explicit=block("type SlaPolicy =");
const replacement=block("const deadline = memoizeBy(ticketKey,");
const finalPrint=block("const due = deadlineFor(ticket, policy)");
assert.equal(used.size,fences.length,"Every TypeScript fence extracted");
const data=replaceOnce(opening,"declare function slaStatus(ticket: Ticket): SlaStatus;\n","");
const key=before(cached,"const dashboardStatus =");
const evaluationType=before(original,"function assess(");
const assessOnly=before(original,"function slaStatus(");
const walker=before(from(local,"function walkBusinessMinutes("),"function deadlineFor(");
const patchedFactory=replaceOnce(factory,
  "  const deadline = memoizeBy(ticketKey, deadlineFor);\n",
  replacement.split("\n").filter(Boolean).map(l=>"  "+l).join("\n")+"\n");

// Models of the two existing project helpers and the observation sink described
// before use. These are fixture scaffolding, not third-party API stubs. Eviction
// is optional; the finite runs retain entries. Both maps stay private.
const helpers=`
function memoizeBy<A,R>(keyOf:(a:A)=>string, fn:(a:A)=>R):(a:A)=>R {
  const entries=new Map<string,R>();
  return a=>{
    const key=keyOf(a);
    if(entries.has(key))return entries.get(key)!;
    const result=fn(a);entries.set(key,result);return result;
  };
}
function withTtl<A,R>(keyOf:(a:A)=>string, fn:(a:A)=>R, ttl:number):(a:A)=>R {
  const entries=new Map<string,{value:R;since:number;expires:number}>();
  return a=>{
    const now=Date.now(),key=keyOf(a),entry=entries.get(key);
    if(entry && now>=entry.since && now<entry.expires)return entry.value;
    const value=fn(a);entries.set(key,{value,since:now,expires:now+ttl});return value;
  };
}
const riskRecords:Array<{ticketId:string;deadline:number;evaluatedAt:number}>=[];
function recordRisk(ticketId:string,deadline:number,evaluatedAt:number):void {
  riskRecords.push({ticketId,deadline,evaluatedAt});
}
`;
const base=data+helpers;
const originalBase=base+local+original;
const preZoneBase=base+key+local+evaluationType+pure;
const fixedBase=base+key+walker+explicit+evaluationType+pure;
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"ts-book-ch18-"));
const cases=[];
function example(name,source,codes=[]) {
  source="export {};\n"+source;
  const dir=path.join(scratch,name);fs.mkdirSync(dir);
  const file=path.join(dir,"main.ts");fs.writeFileSync(file,source);
  const outDir=path.join(dir,"out");
  const markers=source.split("\n").flatMap((l,i)=>l.includes("// Error TS")?[i+1]:[]);
  assert.equal(markers.length,codes.length,"Diagnostic markers: "+name);
  const checked=compile([file],{outDir},dir);
  assert.deepEqual(checked.diagnostics.map(d=>({line:d.line,code:d.code})),
    codes.map((code,i)=>({line:markers[i],code})),name+"\n"+describe(checked.diagnostics));
  const result={name,source,outDir};cases.push(result);return result;
}
example("public-ticket-contract",opening);
const originalApi=example("original-status-and-observation",originalBase+
  "export {ticket,deadlineFor,assess,slaStatus,riskRecords};\n");
const staleApi=example("memoized-status",originalBase+cached+
  "export {ticket,slaStatus,dashboardStatus,riskRecords};\n");
const incident=example("incident-replay",originalBase+cached+replay);
const ttlApi=example("ttl-records-outside-cache",originalBase+key+ttl+
  "export {ticket,assess,slaStatus,dashboardStatus,cachedEvaluation,riskRecords};\n");
const ttlPrint=example("near-deadline-replay",originalBase+key+boundary);
const pureApi=example("pure-evaluation",evaluationType+before(data,"const ticket:")+pure+
  "export {evaluate};\n");
const preZone=example("compatible-api-before-zone-fix",preZoneBase+factory+refresh+
  "export {ticket,slaStatus,refresh,makeSla,deadlineFor,riskRecords};\n");
const zoneExample=example("local-calendar-output",originalBase+zonePrint);
const fixedApi=example("compatible-api-explicit-zone",fixedBase+patchedFactory+refresh+
  "export {ticket,policy,deadlineFor,evaluate,slaStatus,refresh,makeSla,riskRecords};\n");
const fixedPrint=example("explicit-zone-output",fixedBase+patchedFactory+finalPrint);
const badKey=example("pure-calculation-incomplete-key",fixedBase+`
type Input={ticket:Ticket;policy:SlaPolicy};
const wrong=memoizeBy((input:Input)=>ticketKey(input.ticket),
  input=>deadlineFor(input.ticket,input.policy));
function scoped(policy:SlaPolicy) {
  const fixed=Object.freeze({timeZone:policy.timeZone});
  return memoizeBy(ticketKey,ticket=>deadlineFor(ticket,fixed));
}
export {ticket,policy,deadlineFor,wrong,scoped};
`);
example("effects-fit-the-same-signature",before(data,"const ticket:")+`
type Reader=(ticket:Ticket)=>SlaStatus;
const constant:Reader=()=>"ok";
const clock:Reader=t=>Date.now()>=t.openedAt?"breached":"ok";
const logging:Reader=t=>{console.log(t.id);return "ok";};
`);
const clockApi=example("clock-capability-can-change",before(data,"const ticket:")+evaluationType+pure+`
interface Clock { now():number }
function throughClock(deadline:number,clock:Clock):Evaluation {
  return evaluate(deadline,clock.now());
}
export {throughClock};
`);
// Stronger alternative from Oded's one exchange, not another manuscript design.
const thresholdApi=example("expire-at-next-status-boundary",fixedBase+`
function thresholdCache() {
  const entries=new Map<string,{deadline:number;since:number;until:number;value:Evaluation}>();
  let walks=0;
  return {
    read(ticket:Ticket,now:number):Evaluation {
      const key=ticketKey(ticket),old=entries.get(key);
      if(old && now>=old.since && now<old.until)return old.value;
      const deadline=old?.deadline ?? (++walks,deadlineFor(ticket,policy));
      const value=evaluate(deadline,now);
      const until=value.status==="ok"?deadline-30*60_000:
        value.status==="at-risk"?deadline:Infinity;
      entries.set(key,{deadline,since:now,until,value});return value;
    },
    walks:()=>walks,
  };
}
export {ticket,thresholdCache};
`);
// Diagnostic instrumentation delegates to the unchanged local calendar body.
// It counts walks, not elapsed time or observer-required business effects.
const countedCalendar=replaceOnce(local,"function deadlineFor(","function uncountedDeadlineFor(")+`
let walks=0;
function deadlineFor(ticket:Ticket):number {walks++;return uncountedDeadlineFor(ticket);}
function resetWalks():void {walks=0;}
function readWalks():number {return walks;}
`;
const countsApi=example("walk-counts",base+key+countedCalendar+assessOnly+pure+factory+
  "export {ticket,assess,makeSla,withTtl,ticketKey,resetWalks,readWalks};\n");

let groups=0;
function group(name,fn) {
  try {fn();}catch(error){error.message=name+": "+error.message;throw error;}
  groups++;
}
function run(test,fn,TZ="Asia/Jerusalem") {
  const file=path.join(test.outDir,"main.js");
  const code=`const assert=require('node:assert/strict');const output=[];
console.log=(...values)=>output.push(values);
const originalNow=Date.now;
const m=require(${JSON.stringify(file)});
const result=(${fn.toString()})(m,assert,output);
process.stdout.write(JSON.stringify({result,output,clockRestored:Date.now===originalNow}));`;
  return JSON.parse(cp.execFileSync(process.execPath,["-e",code],{
    encoding:"utf8",env:{...process.env,TZ},timeout:60000,maxBuffer:2*1024*1024,
  }));
}
function inlineOutputs(source) {
  return [...source.matchAll(/console\.log\([^\n]*\);\s*\/\/ (.+)/g)].map(m=>[m[1]]);
}
group("printed-incident-and-clock-restoration",()=>{
  const expected=[...replay.matchAll(/^\/\/ (ok ok|at-risk ok|breached ok)$/gm)].map(m=>m[1].split(" "));
  assert.equal(expected.length,3);
  const got=run(incident,()=>{});
  assert.deepEqual(got.output,expected);assert.equal(got.clockRestored,true);
});
group("incident-cached-path-records-nothing",()=>run(staleApi,(m,assert)=>{
  const real=Date.now;
  try {
    for(const now of [Date.UTC(2026,10,9,10,20),Date.UTC(2026,10,9,10,40),Date.UTC(2026,10,9,11)]) {
      Date.now=()=>now;assert.equal(m.dashboardStatus(m.ticket),"ok");
    }
    assert.equal(m.riskRecords.length,0);
    Date.now=()=>Date.UTC(2026,10,9,10,40);
    assert.equal(m.slaStatus(m.ticket),"at-risk");assert.deepEqual(m.riskRecords,[{
      ticketId:"P1-42",deadline:Date.UTC(2026,10,9,11),evaluatedAt:Date.UTC(2026,10,9,10,40),
    }]);
  }finally{Date.now=real;}
}));
group("uncached-callers-still-work",()=>run(originalApi,(m,assert)=>{
  const real=Date.now;try {
    Date.now=()=>Date.UTC(2026,10,9,11,1);
    assert.equal(m.slaStatus(m.ticket),"breached");
    assert.equal(m.riskRecords.length,0);
  }finally{Date.now=real;}
}));
group("printed-ttl-boundary",()=>{
  const expected=inlineOutputs(boundary);assert.equal(expected.length,3);
  assert.deepEqual(run(ttlPrint,()=>{}).output,expected);
});
group("ttl-records-hits-with-original-timestamp-and-expires-exactly",()=>run(ttlApi,(m,assert)=>{
  const real=Date.now,due=Date.UTC(2026,10,9,11),first=due-1;
  try {
    for(const now of [first,due+30_000,due+59_998]) {
      Date.now=()=>now;assert.equal(m.dashboardStatus(m.ticket),"at-risk");
    }
    assert.equal(m.riskRecords.length,3);
    assert(m.riskRecords.every(r=>r.evaluatedAt===first && r.deadline===due));
    Date.now=()=>due+59_999;assert.equal(m.dashboardStatus(m.ticket),"breached");
    assert.equal(m.riskRecords.length,3);
  }finally{Date.now=real;}
}));
group("pure-evaluation-boundaries-ignore-clock-and-repeat-fields",()=>run(pureApi,(m,assert)=>{
  const real=Date.now,due=Date.UTC(2026,10,9,11);
  try {
    for(const [offset,status] of [[-1_800_001,"ok"],[-1_800_000,"at-risk"],[-1,"at-risk"],[0,"breached"],[1,"breached"]]) {
      Date.now=()=>0;const a=m.evaluate(due,due+offset);
      Date.now=()=>Infinity;const b=m.evaluate(due,due+offset);
      assert.deepEqual(a,b);assert.equal(a.status,status);
      assert.equal(a.deadline,due);assert.equal(a.evaluatedAt,due+offset);
    }
  }finally{Date.now=real;}
}));
for(const [label,test] of [["before-zone-repair",preZone],["after-zone-repair",fixedApi]]) {
  group(label+"-one-clock-read-per-batch-and-legacy-default",()=>run(test,(m,assert)=>{
    const real=Date.now;let reads=0;
    const now=Date.UTC(2026,10,9,10,40);
    try {
      Date.now=()=>now+reads++;
      assert.deepEqual(m.refresh([m.ticket,{...m.ticket,id:"P1-43"}]),["at-risk","at-risk"]);
      assert.equal(reads,1);assert.equal(m.riskRecords.length,2);
      assert(m.riskRecords.every(r=>r.evaluatedAt===now));
      assert.equal(m.slaStatus(m.ticket),"at-risk");assert.equal(reads,2);
      const before=reads;m.slaStatus(m.ticket,now);assert.equal(reads,before);
      assert.equal(m.riskRecords.length,4);
      Date.now=()=>Date.UTC(2026,10,9,11);assert.equal(m.slaStatus(m.ticket),"breached");
    }finally{Date.now=real;}
  }));
}
group("local-deadline-table-and-consistent-host-repair",()=>{
  const rows=[...chapter.matchAll(/^\| `(UTC|Asia\/Jerusalem|America\/New_York)` \| `([^`]+)` \|$/gm)];
  assert.equal(rows.length,3);
  for(const [,TZ,expected] of rows) assert.deepEqual(run(zoneExample,()=>{},TZ).output,[[expected]]);
});
group("explicit-zone-printed-values-independent-of-host",()=>{
  const expected=inlineOutputs(finalPrint);assert.equal(expected.length,4);
  for(const TZ of ["UTC","Asia/Jerusalem","America/New_York"]) {
    assert.deepEqual(run(fixedPrint,()=>{},TZ).output,expected);
  }
});
group("real-walker-closed-hours-weekend-and-1700-arrival",()=>{
  for(const TZ of ["UTC","Asia/Jerusalem","America/New_York"]) run(fixedApi,(m,assert)=>{
    const cases=[
      [Date.UTC(2026,10,9,6),240,"2026-11-09T11:00:00.000Z"], // Mon 08:00 local.
      [Date.UTC(2026,10,9,15),240,"2026-11-10T11:00:00.000Z"], // Mon 17:00.
      [Date.UTC(2026,10,13,14),120,"2026-11-16T08:00:00.000Z"], // Fri 16:00.
      [Date.UTC(2026,10,14,10),1,"2026-11-16T07:01:00.000Z"], // Sat noon.
    ];
    for(const [openedAt,businessMinutes,expected] of cases) {
      assert.equal(new Date(m.deadlineFor({...m.ticket,openedAt,businessMinutes},m.policy)).toISOString(),expected);
    }
  },TZ);
  // The original local walker does these calendar cases correctly when the
  // host zone matches the team's policy, too; it is not a strawman algorithm.
  run(originalApi,(m,assert)=>{
    const cases=[
      [Date.UTC(2026,10,9,6),240,"2026-11-09T11:00:00.000Z"],
      [Date.UTC(2026,10,9,15),240,"2026-11-10T11:00:00.000Z"],
      [Date.UTC(2026,10,13,14),120,"2026-11-16T08:00:00.000Z"],
      [Date.UTC(2026,10,14,10),1,"2026-11-16T07:01:00.000Z"],
    ];
    for(const [openedAt,businessMinutes,expected] of cases) {
      assert.equal(new Date(m.deadlineFor({...m.ticket,openedAt,businessMinutes})).toISOString(),expected);
    }
  });
});
group("pure-deadline-can-still-be-cached-under-an-incomplete-key",()=>run(badKey,(m,assert)=>{
  const utc={timeZone:"UTC"};
  assert.equal(m.wrong({ticket:m.ticket,policy:m.policy}),Date.UTC(2026,10,9,11));
  assert.equal(m.wrong({ticket:m.ticket,policy:utc}),Date.UTC(2026,10,9,11));
  assert.equal(m.deadlineFor(m.ticket,utc),Date.UTC(2026,10,9,13));
  assert.equal(m.scoped(utc)(m.ticket),Date.UTC(2026,10,9,13));
  assert.equal(m.scoped(m.policy)(m.ticket),Date.UTC(2026,10,9,11));
}));
group("revision-invalidates-deadline-cache",()=>run(fixedApi,(m,assert)=>{
  const now=Date.UTC(2026,10,9,10);
  const short={...m.ticket,businessMinutes:120,revision:2};
  assert.equal(m.slaStatus(m.ticket,now),"ok");
  assert.equal(m.slaStatus(short,now),"breached");
  // Violating the stated revision guarantee remains a cache-key bug.
  assert.equal(m.slaStatus({...short,revision:1},now),"ok");
}));
group("wrapper-can-be-memoized-wrongly-even-with-explicit-time",()=>run(fixedApi,(m,assert)=>{
  const now=Date.UTC(2026,10,9,10,40),seen=new Map();
  function cachedStatus(t,at) {
    const key=JSON.stringify([t.id,t.revision,at]);
    if(seen.has(key))return seen.get(key);
    const result=m.slaStatus(t,at);seen.set(key,result);return result;
  }
  assert.equal(cachedStatus(m.ticket,now),"at-risk");
  assert.equal(cachedStatus(m.ticket,now),"at-risk");
  assert.equal(m.riskRecords.length,1); // A complete value key still skips the effect.
}));
group("live-clock-capability-is-not-a-captured-instant",()=>run(clockApi,(m,assert)=>{
  const due=Date.UTC(2026,10,9,11);let now=due-40*60_000;
  const clock={now:()=>now};assert.equal(m.throughClock(due,clock).status,"ok");
  now=due;assert.equal(m.throughClock(due,clock).status,"breached");
}));
group("oded-exact-boundary-expiry-alternative",()=>run(thresholdApi,(m,assert)=>{
  const due=Date.UTC(2026,10,9,11),cache=m.thresholdCache();
  for(const [offset,status] of [[-1_800_001,"ok"],[-1_800_000,"at-risk"],[-1,"at-risk"],[0,"breached"],[1,"breached"]]) {
    assert.equal(cache.read(m.ticket,due+offset).status,status);
  }
  assert.equal(cache.walks(),1);
}));
group("printed-walk-counts-use-real-calendar",()=>{
  const rows=[...chapter.matchAll(/^\| (No cache|Sixty-second TTL on the evaluation|Deadline cache, fresh comparison) \| ([\d,]+) \|$/gm)];
  assert.equal(rows.length,3);
  const expected=rows.map(r=>Number(r[2].replaceAll(",","")));
  const got=run(countsApi,(m,assert)=>{
    const tickets=Array.from({length:20_000},(_,i)=>({...m.ticket,id:String(i)}));
    const real=Date.now;let now=Date.UTC(2026,10,9,10,20);
    const result=[];
    try {
      Date.now=()=>now;
      const candidates=[m.assess,m.withTtl(m.ticketKey,m.assess,60_000),m.makeSla()];
      for(const f of candidates) {
        m.resetWalks();
        for(const offset of [0,30_000,60_000]) {
          now=Date.UTC(2026,10,9,10,20)+offset;
          for(const t of tickets) {
            const value=f(t);assert.equal(typeof value==="string"?value:value.status,"ok");
          }
        }
        result.push(m.readWalks());
      }
    }finally{Date.now=real;}
    return result;
  }).result;
  assert.deepEqual(got,expected);
});
console.log(`TypeScript ${version}: Chapter 18 — ${fences.length} fences, ${cases.length} compiler cases, ${groups} runtime groups. PASS`);
console.log("Fixtures: "+scratch);
