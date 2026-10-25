"use strict";
// Manuscript-derived HOF wrappers: order, cancellation input, receiver and owner contract.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const assert=require('node:assert/strict');
const {compile,describe,version}=require('./compiler.cjs');
const chapter=fs.readFileSync(path.resolve(__dirname,'../book/03-patterns-and-design/08-hof-patterns.md'),'utf8');
const fences=[...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1]);
const used=new Set();
function block(prefix){const found=fences.map((text,index)=>({text,index})).filter(f=>f.text.startsWith(prefix));
 assert.equal(found.length,1,'Unique fence: '+prefix);used.add(found[0].index);return found[0].text+'\n';}
function before(s,at){const i=s.indexOf(at);assert(i>=0,'Missing split: '+at);return s.slice(0,i);}
function from(s,at){const i=s.indexOf(at);assert(i>=0,'Missing split: '+at);return s.slice(i);}
function replace(s,a,b){assert.equal(s.split(a).length,2,'Unique replacement: '+a);return s.replace(a,b);}
const opening=block('type Notice =');
const wrappers=block('function withRetry<');
const incident=block('const sendShipped: Send = withRetry(withTimeout(send,');
const swapped=block('const sendWithinBudget:');
const attemptType=block('type SendAttempt =');
const repaired=block('function withTimeout<');
const oldError=block('withTimeout(send,');
const client=block('declare class GatewayClient');
const keyed=block('declare const keyedClient:');
const jobRepair=block('async function runJob(');
const take=block('function forward<');
assert.equal(used.size,fences.length,'Every fence extracted');
const setup=before(opening,'async function runJob(');
const types=before(opening,'declare const send:');
const oldJob=before(from(opening,'async function runJob('),'runJob(send).');
const retryAndError=before(wrappers,'function withTimeout<');
const normal=setup+oldJob+wrappers;
const signal=setup+oldJob+retryAndError+attemptType+repaired;
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch21-'));let cases=0;
function example(name,source,codes=[]){const dir=path.join(scratch,name);fs.mkdirSync(dir);
 const file=path.join(dir,'main.ts'),text='export {};\n'+source;fs.writeFileSync(file,text);
 const markers=text.split('\n').flatMap((line,i)=>line.includes('// Error TS')?[i+1]:[]);
 assert.equal(markers.length,codes.length,'Markers: '+name);
 const outDir=path.join(dir,'out'),r=compile([file],{outDir},dir);
 assert.deepEqual(r.diagnostics.map(d=>({file:d.fileName,line:d.line,code:d.code})),
  markers.map((line,i)=>({file,line,code:codes[i]})),name+'\n'+describe(r.diagnostics));
 cases++;return {name,file:path.join(outDir,'main.js'),diagnostics:r.diagnostics};
}
const apiExports='export {withRetry,withTimeout,Timeout,runJob,notice};\n';
const plain=example('working-send',opening+'export {runJob,notice};\n');
const oldApi=example('old-wrapper-api',normal+apiExports);
const incidentApi=example('printed-incident',normal+incident+apiExports);
const swappedApi=example('printed-swap',normal+swapped+apiExports);
example('orders-same-type',normal+before(incident,'runJob(')+before(swapped,'runJob(')+`
const x:typeof sendShipped=sendWithinBudget;
const y:typeof sendWithinBudget=sendShipped;
`);
const wrong=example('old-client-rejected',signal+oldError,[2345]);
assert(wrong.diagnostics[0].message.includes("Type 'AbortSignal' is missing the following properties from type 'Notice'"),describe(wrong.diagnostics));
const boundApi=example('printed-bound-signal-operation',signal+client+apiExports+'export {attempt,sendShipped};\n');
const keyedApi=example('printed-keyed-composition',setup+retryAndError+repaired+keyed+jobRepair+apiExports+'export {sendShipped};\n');
const rawApi=example('signal-wrapper-api',signal+apiExports);
example('both-signal-orders-typecheck',signal+before(client,'const attempt:')+`
const attempt:SendAttempt=(signal,notice)=>client.send(signal,notice);
const perAttempt:Send=withRetry(withTimeout(attempt,2000),3);
const total:Send=withTimeout(withRetry(attempt,3),2000);
`);
example('signal-input-can-be-ignored',signal+`
const ignores:SendAttempt=(_signal,notice)=>send(notice);
const stillAccepted:Send=withRetry(withTimeout(ignores,2000),3);
`);
const detachedApi=example('receiver-erased-by-generic-wrapper',signal+before(client,'const attempt:')+`
const detached:SendAttempt=withRetry(client.send,3);
export {detached};
`);
const objectApi=example('object-decorator-alternative',types+attemptType+`
interface Sender {send(signal:AbortSignal,notice:Notice):Promise<Receipt>}
class RetryingSender implements Sender {
 constructor(private inner:Sender,private attempts:number){}
 async send(signal:AbortSignal,notice:Notice):Promise<Receipt>{
  for(let attempt=1;;attempt++){
   try{return await this.inner.send(signal,notice);}catch(error){if(attempt===this.attempts)throw error;}
  }
 }
}
export {RetryingSender};
`);
const overload=example('overload-loss',types+take,[2345]);
assert(overload.diagnostics[0].message.includes("Argument of type 'string' is not assignable to parameter of type 'readonly string[]'."));
const generic=example('generic-and-selected-overload',types+take.split('\n').filter(l=>!l.includes('// Error TS')).join('\n')+`
const stillGeneric:<T>(value:T)=>T=forwarded;
const single:(id:string)=>Promise<Receipt>=lookupReceipt;
const one=forward(single);
const pending:Promise<Receipt>=one('shipped-42');
export {forwarded};
`);
const preservedApi=example('explicit-overload-facade',types+`
declare const lookupReceipt:{(id:string):Promise<Receipt>;(ids:readonly string[]):Promise<Receipt[]>};
function lookup(id:string):Promise<Receipt>;
function lookup(ids:readonly string[]):Promise<Receipt[]>;
function lookup(input:string|readonly string[]):Promise<Receipt|Receipt[]>{
 return typeof input==='string'?lookupReceipt(input):lookupReceipt(input);
}
const one:Promise<Receipt>=lookup('shipped-42');
const many:Promise<Receipt[]>=lookup(['shipped-42']);
export {lookup};
`);
// A deterministic fixture clock, not a timing benchmark. All wrapper timers are intercepted.
class Clock {
 constructor(){this.now=0;this.serial=0;this.events=new Map();}
 setTimeout(fn,ms){const id=++this.serial;this.events.set(id,{at:this.now+ms,fn});return id;}
 clearTimeout(id){this.events.delete(id);}
 async flush(){for(let n=0;n<100;n++)await Promise.resolve();}
 async advance(to){await this.flush();for(;;){let next;
  for(const entry of this.events)if(entry[1].at<=to&&(!next||entry[1].at<next[1].at))next=entry;
  if(!next)break;this.now=next[1].at;this.events.delete(next[0]);next[1].fn();await this.flush();
 }this.now=to;await this.flush();}
}
function watch(p,clock){const out={};p.then(value=>Object.assign(out,{value,at:clock.now}),error=>Object.assign(out,{error,at:clock.now}));return out;}
function gateway(clock,{accept=3000,reply=3000,cancellable=false,keyed=false,ignore=false,lost=false}={}){
 const trace=[],signals=[],requests=[],receipts=new Map();let starts=0,deliveries=0,acks=0,aborts=0;
 function call(signal,notice){
  if(cancellable&&!ignore)signal.throwIfAborted();
  const n=++starts;trace.push(['start',n,clock.now]);requests.push(notice);if(signal)signals.push(signal);
  return new Promise((resolve,reject)=>{
   const stored=keyed&&receipts.get(notice.id);let receipt=stored;let acceptTimer;
   if(!stored)acceptTimer=clock.setTimeout(()=>{deliveries++;receipt={messageId:notice.id};receipts.set(notice.id,receipt);trace.push(['deliver',n,clock.now]);},accept);
   const replyTimer=clock.setTimeout(()=>{detach();if(lost){reject(new Error('reply lost'));return;}
    acks++;trace.push(['reply',n,clock.now]);resolve(receipt);
   },stored?100:reply);
   const onAbort=()=>{aborts++;trace.push(['abort',n,clock.now]);clock.clearTimeout(acceptTimer);clock.clearTimeout(replyTimer);detach();reject(signal.reason);};
   const detach=()=>{if(signal)signal.removeEventListener('abort',onAbort);};
   if(cancellable&&!ignore)signal.addEventListener('abort',onAbort,{once:true});
  });
 }
 return {send:notice=>call(undefined,notice),attempt:(signal,notice)=>call(signal,notice),trace,signals,requests,
  stats:()=>({starts,deliveries,acks,aborts})};
}
// Each runtime group gets fresh module evaluation, clock, globals and observed outputs.
async function fixture(test,options,fn){
 const clock=new Clock(),g=gateway(clock,options),output=[];
 const keys=['setTimeout','clearTimeout','send','client','keyedClient','lookupReceipt'];
 const previous=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));const log=console.log;
 const client={connection:'gateway',send(signal,notice){assert.equal(this.connection,'gateway');return g.attempt(signal,notice);}};
 const keyedClient={sendOnce:client.send.bind(client),shouldRetry:error=>error instanceof Error&&['timeout','reply lost'].includes(error.message)};
 try{
  globalThis.setTimeout=(fn,ms)=>clock.setTimeout(fn,ms);globalThis.clearTimeout=id=>clock.clearTimeout(id);
  globalThis.send=g.send;globalThis.client=client;globalThis.keyedClient=keyedClient;
  globalThis.lookupReceipt=input=>Promise.resolve(typeof input==='string'?{messageId:input}:input.map(messageId=>({messageId})));
  console.log=(...args)=>output.push({args,at:clock.now});
  delete require.cache[test.file];const m=require(test.file);
  await fn({m,clock,g,output,client,keyedClient});
  await clock.flush();assert.equal(clock.events.size,0,'No timers left after fixture');
 }finally{console.log=log;for(const [key,descriptor]of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
}
let groups=0;
async function group(name,fn){try{await fn();groups++;}catch(error){error.message=name+': '+error.message;throw error;}}
(async()=>{
 await group('printed-working-send',()=>fixture(plain,{accept:0,reply:0},async({clock,output,g})=>{
  await clock.advance(0);assert.deepEqual(output,[{args:['accepted'],at:0}]);assert.equal(g.stats().deliveries,1);
 }));
 await group('printed-incident-entire-trace',()=>fixture(incidentApi,{},async({clock,g,output})=>{
  await clock.advance(6000);assert.deepEqual(output,[{args:['failed'],at:6000}]);assert.equal(g.stats().deliveries,2);
  await clock.advance(7000);assert.deepEqual(g.trace.filter(e=>e[0]!=='reply'),[
   ['start',1,0],['start',2,2000],['deliver',1,3000],['start',3,4000],['deliver',2,5000],['deliver',3,7000]]);
  assert.deepEqual(g.stats(),{starts:3,deliveries:3,acks:3,aborts:0});
  for(const row of ['| 0 s | Attempt 1 starts |','| 2 s | Attempt 1 times out; attempt 2 starts |','| 3 s | Attempt 1 delivers |',
   '| 4 s | Attempt 2 times out; attempt 3 starts |','| 5 s | Attempt 2 delivers |','| 6 s | Attempt 3 times out; job records `failed` |','| 7 s | Attempt 3 delivers |'])assert(chapter.includes(row));
 }));
 await group('printed-swap',()=>fixture(swappedApi,{},async({clock,g,output})=>{
  await clock.advance(3000);assert.deepEqual(output,[{args:['failed'],at:2000}]);assert.deepEqual(g.stats(),{starts:1,deliveries:1,acks:1,aborts:0});
 }));
 await group('both-orders-pass-fast-fixtures',()=>fixture(oldApi,{},async({m,clock})=>{
  for(const swap of [false,true])for(const failFirst of [false,true]){
   let calls=0;const f=async()=>{if(++calls===1&&failFirst)throw new Error('refused');return {messageId:'r1'};};
   const job=swap?m.withTimeout(m.withRetry(f,3),2000):m.withRetry(m.withTimeout(f,2000),3);
   const out=watch(job(m.notice),clock);await clock.advance(0);
   assert.deepEqual(out,{value:{messageId:'r1'},at:0});assert.equal(calls,failFirst?2:1);
  }
 }));
 await group('constructing-wrappers-does-no-work',()=>fixture(oldApi,{},async({m,clock,g})=>{
  m.withRetry(m.withTimeout(g.send,2000),3);assert.equal(g.stats().starts,0);assert.equal(clock.events.size,0);
 }));
 await group('signal-repair-cooperative-three-distinct-signals',()=>fixture(boundApi,{cancellable:true},async({m,clock,g})=>{
  const out=watch(m.runJob(m.sendShipped),clock);await clock.advance(7000);
  assert.deepEqual(out,{value:'failed',at:6000});assert.deepEqual(g.stats(),{starts:3,deliveries:0,acks:0,aborts:3});
  assert.equal(new Set(g.signals).size,3);assert(g.signals.every(s=>s.aborted));assert(g.requests.every(r=>r===m.notice));
 }));
 await group('turn-obeys-signals-but-keeps-deliveries',()=>fixture(boundApi,{accept:1000,reply:3000,cancellable:true},async({m,clock,g})=>{
  const out=watch(m.runJob(m.sendShipped),clock);await clock.advance(7000);
  assert.deepEqual(out,{value:'failed',at:6000});assert.deepEqual(g.stats(),{starts:3,deliveries:3,acks:0,aborts:3});
  assert.deepEqual(g.trace.filter(e=>e[0]==='deliver'),[['deliver',1,1000],['deliver',2,3000],['deliver',3,5000]]);
  for(const row of ['| 1 | 0 s | 1 s | 2 s |','| 2 | 2 s | 3 s | 4 s |','| 3 | 4 s | 5 s | 6 s |'])assert(chapter.includes(row));
 }));
 await group('no-retry-alternative',()=>fixture(rawApi,{accept:1000,reply:3000,cancellable:true},async({m,clock,g})=>{
  const out=watch(m.withTimeout(g.attempt,2000)(m.notice),clock);await clock.advance(7000);
  assert(out.error instanceof m.Timeout);assert.equal(out.at,2000);assert.deepEqual(g.stats(),{starts:1,deliveries:1,acks:0,aborts:1});
 }));
 await group('keyed-repair-printed-counts',()=>fixture(keyedApi,{accept:1000,reply:3000,cancellable:true,keyed:true},async({m,clock,g})=>{
  const out=watch(m.runJob(m.sendShipped),clock);await clock.advance(7000);
  assert.deepEqual(out,{value:'accepted',at:2100});assert.deepEqual(g.stats(),{starts:2,deliveries:1,acks:1,aborts:1});
  assert.deepEqual(g.requests.map(r=>r.id),['shipped-42','shipped-42']);assert.equal(new Set(g.signals).size,2);
 }));
 await group('exhausted-receipts-are-unconfirmed',()=>fixture(keyedApi,{accept:1000,reply:3000,cancellable:true,keyed:true,lost:true},async({m,clock,g})=>{
  const out=watch(m.runJob(m.sendShipped),clock);await clock.advance(7000);
  assert.deepEqual(out,{value:'unconfirmed',at:2200});assert.deepEqual(g.stats(),{starts:3,deliveries:1,acks:0,aborts:1});
 }));
 await group('input-does-not-prove-signal-use',()=>fixture(rawApi,{ignore:true},async({m,clock,g})=>{
  const ignores=(_signal,notice)=>g.send(notice);
  const out=watch(m.withRetry(m.withTimeout(ignores,2000),3)(m.notice),clock);await clock.advance(7000);
  assert(out.error instanceof m.Timeout);assert.deepEqual(g.stats(),{starts:3,deliveries:3,acks:3,aborts:0});
 }));
 await group('receiver-erasure-and-arrow-repair',()=>fixture(detachedApi,{cancellable:true},async({m,clock,client})=>{
  const out=watch(m.detached(new AbortController().signal,{id:'r',to:'t',text:'x'}),clock);await clock.advance(0);
  assert(out.error instanceof TypeError);assert(out.error.message.includes('connection'));
  // The printed bound adapter is exercised in the cooperative and Turn groups.
 }));
 await group('object-decorator-repair',()=>fixture(objectApi,{accept:0,reply:0,cancellable:true},async({m,clock,g,client})=>{
  const sender=new m.RetryingSender(client,3),out=watch(sender.send(new AbortController().signal,{id:'r',to:'t',text:'x'}),clock);
  await clock.advance(0);assert.deepEqual(out,{value:{messageId:'r'},at:0});assert.equal(g.stats().deliveries,1);
 }));
 await group('selective-retry-and-escaping-errors',()=>fixture(keyedApi,{},async({m,clock,keyedClient})=>{
  const fault=new TypeError('broken call');let calls=0;const f=async()=>{calls++;throw fault;};
  const job=m.withRetry(f,3,error=>keyedClient.shouldRetry(error));const out=watch(m.runJob(job),clock);
  await clock.advance(0);assert.equal(out.error,fault);assert.equal(calls,1);
  const timeout=new m.Timeout();calls=0;const temporary=async()=>{if(++calls<3)throw timeout;return {messageId:'r'};};
  assert.deepEqual(await m.withRetry(temporary,3,error=>keyedClient.shouldRetry(error))(),{messageId:'r'});assert.equal(calls,3);
 }));
 await group('retry-bound-and-final-error-identity',()=>fixture(oldApi,{},async({m,clock})=>{
  for(const attempts of [0,-1,1.5,NaN,Infinity])assert.throws(()=>m.withRetry(async()=>{},attempts),RangeError);
  const failure=new Error('refused');let calls=0;const out=watch(m.withRetry(async()=>{calls++;throw failure;},3)(),clock);
  await clock.advance(0);assert.equal(out.error,failure);assert.equal(calls,3);
 }));
 await group('timer-cleanup-success-rejection-sync-throw',()=>fixture(rawApi,{},async({m,clock})=>{
  for(const kind of ['success','reject','throw']){
   const error=new Error(kind);const operation=()=>{if(kind==='throw')throw error;return kind==='success'?Promise.resolve(42):Promise.reject(error);};
   const out=watch(m.withTimeout(operation,2000)(),clock);await clock.advance(0);
   assert.equal(clock.events.size,0);if(kind==='success')assert.equal(out.value,42);else assert.equal(out.error,error);
  }
 }));
 await group('generic-forwarding-and-overload-facade',async()=>{
  await fixture(generic,{},async({m,clock})=>{assert.equal(m.forwarded(3),3);assert.equal(m.forwarded('accepted'),'accepted');await clock.advance(0);});
  await fixture(preservedApi,{},async({m,clock})=>{assert.deepEqual(await m.lookup('r'),{messageId:'r'});assert.deepEqual(await m.lookup(['r']),[{messageId:'r'}]);await clock.advance(0);});
 });
 console.log(`Chapter 21: TypeScript ${version}; ${fences.length} fences; ${cases} compiler cases; ${groups} runtime groups; PASS`);
 console.log(`Fixtures: ${scratch}`);
})().catch(error=>{console.error(error);process.exitCode=1;});
