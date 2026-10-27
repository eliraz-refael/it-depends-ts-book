'use strict';
// Extracted manuscript programs, with separate original/repaired timelines and fixture-only alternatives.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {compile,describe,version}=require('./compiler.cjs');
const manuscript=fs.readFileSync(path.resolve(__dirname,'../book/03-patterns-and-design/10-monads-light.md'),'utf8');
const fences=[...manuscript.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1]),used=new Set();
function block(prefix){const matches=fences.map((s,i)=>({s,i})).filter(x=>x.s.startsWith(prefix));
 assert.equal(matches.length,1,'Unique prefix: '+prefix);used.add(matches[0].i);return matches[0].s+'\n';}
function before(s,at){const i=s.indexOf(at);assert(i>=0,'Split: '+at);return s.slice(0,i);}
function replace(s,a,b){assert.equal(s.split(a).length,2,'Unique replacement: '+a);return s.replace(a,b);}
const types=block('type Result<T, E> ='),res=block('class Res<T, E> {');
const preview=block('function preview(text:'),nested=block('const nested ='),onlyBadQty=block('const onlyBadQty:');
const promises=block('const increased ='),arrays=block('console.log(JSON.stringify([2, 7].map');
const load=block('async function loadPreview('),inspect=block('async function inspect()');
const worker=block('const counts ='),helper=block('function andThen<T'),ladder=block('function plainPreview(');
const repair=block('async function checkRepair()'),asyncMap=block('async function availabilityAsync(');
assert.equal(used.size,fences.length,'All fences extracted');
const previewFn=before(preview,'console.log('),workerFn=before(worker,'const goodJob =');
const helperFn=before(helper,'const offered =');
const base=types+res+previewFn;
// The manuscript explicitly renames only the method and call sites; retain their bodies byte-for-byte.
const fixedRes=replace(res,'  then<U, F>','  andThen<U, F>');
const fixedPreview=replace(previewFn,'.then(n =>','.andThen(n =>');
const fixed=types+fixedRes+fixedPreview;
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch23-'));
let cases=0,groups=0;
function example(name,source,codes=[]){
 const dir=path.join(scratch,name);fs.mkdirSync(dir);const file=path.join(dir,'main.ts');source='export {};\n'+source;
 fs.writeFileSync(file,source);const errorLines=source.split('\n').flatMap((line,i)=>line.includes('// Error TS')?[i+1]:[]);
 assert.equal(errorLines.length,codes.length,'Error markers: '+name);
 const outDir=path.join(dir,'out'),result=compile([file],{outDir},dir);
 assert.deepEqual(result.diagnostics.map(d=>({file:d.fileName,line:d.line,code:d.code})),
  errorLines.map((line,i)=>({file,line,code:codes[i]})),name+'\n'+describe(result.diagnostics));
 cases++;return {name,file:path.join(outDir,'main.js'),diagnostics:result.diagnostics};
}
const equal=`type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false;
type Assert<T extends true>=T;\n`;
const printed=example('printed-sync-preview-and-nesting',types+res+preview+nested+equal+`
type Nested=Assert<Equal<typeof nested,Res<Result<Offer,NoStock>,BadQty>>>;
export {preview,nested,Res,parseQty,availability,ok};
`);
const union=example('printed-lost-no-stock',base+onlyBadQty,[2322]);
assert(union.diagnostics[0].message.includes("Type 'NoStock' is not assignable to type 'BadQty'."));
const flat=example('printed-plain-union-helper',types+helper+equal+`
type Offered=Assert<Equal<typeof offered,Result<Offer,BadQty|NoStock>>>;
export {andThen,offered,parseQty,availability,ok};
`);
const plain=example('printed-ladder',types+ladder+'export {plainPreview};');
const promise=example('printed-promise-map-and-adoption',promises+equal+`
type Increased=Assert<Equal<typeof increased,Promise<number>>>;
type Also=Assert<Equal<typeof alsoIncreased,Promise<number>>>;
export {increased,alsoIncreased};
`);
const array=example('printed-array-shapes',arrays);
const typed=example('printed-inspect-loses-result',base+load+inspect,[2339]);
assert.equal(typed.diagnostics[0].message,"Property 'result' does not exist on type 'Preview'.");
assert(manuscript.includes('// '+typed.diagnostics[0].message),'Printed diagnostic quote');
const incident=example('printed-worker-incident',base+load+worker+equal+`
type Adopted=Assert<Equal<Awaited<ReturnType<typeof loadPreview>>,Preview>>;
export {counts,goodJob,refusedJob,runJob,loadPreview};
`);
const fixedJob=example('printed-renamed-worker',fixed+load+workerFn+repair+equal+`
type Kept=Assert<Equal<Awaited<ReturnType<typeof loadPreview>>,Res<Preview,BadQty|NoStock>>>;
export {counts,checkRepair,runJob,loadPreview,preview};
`);
const pending=example('printed-async-map-after-rename',fixed+asyncMap+equal+`
type Pending=Assert<Equal<typeof pendingInside,Res<Promise<Result<Offer,NoStock>>,BadQty>>>;
export {pendingInside,Res,availabilityAsync,parseQty};
`);
example('missing-ladder-check-is-an-error',types+replace(ladder,'  if (!qty.ok) return qty;\n','')
 .replace('availability(qty.value);','availability(qty.value); // Error TS2339')
 .replace('return ok({ quantity: qty.value, offer: offer.value.id });','return ok({ quantity: qty.value, offer: offer.value.id }); // Error TS2339'),[2339,2339]);
const ignored=example('helper-can-discard-a-refusal',types+helperFn+`
const ignored=andThen(parseQty('7'),n=>{availability(n);return ok('done');});
export {ignored};
`);
example('old-method-name-no-longer-compiles',fixed+`
preview('2').then((value:Preview)=>new Res(ok(value))); // Error TS2339
`,[2339]);
const retainedAlias=replace(fixedRes,'  map<U>',`  then<U, F>(step: (value: T) => Res<U, F>): Res<U, E | F> {
    return this.andThen(step);
  }

  map<U>`);
const alias=example('deprecated-alias-reopens-incident',types+retainedAlias+fixedPreview+load+worker+'export {counts,goodJob,refusedJob};');
// Both proposed promise-compatible repairs are fixture-only implementations of the dialogue.
const realThenable=example('promise-compatible-value-or-rejection',base+workerFn+`
class RejectingRes<T,E> implements PromiseLike<T> {
 constructor(readonly result:Result<T,E>) {}
 then<U=T,F=never>(
  fulfilled?:((value:T)=>U|PromiseLike<U>)|null,
  rejected?:((reason:unknown)=>F|PromiseLike<F>)|null,
 ):Promise<U|F> {
  const settled:Promise<T>=this.result.ok?Promise.resolve(this.result.value):Promise.reject(this.result.error);
  return settled.then(fulfilled,rejected);
 }
}
async function realLoad(text:string):Promise<Preview> {return new RejectingRes(preview(text).result);}
export {realLoad,runJob,counts};
`);
const wholeUnion=example('promise-compatible-whole-union',base+workerFn+`
class UnionThenable<T,E> implements PromiseLike<Result<T,E>> {
 constructor(readonly result:Result<T,E>) {}
 then<U=Result<T,E>,F=never>(
  fulfilled?:((value:Result<T,E>)=>U|PromiseLike<U>)|null,
  rejected?:((reason:unknown)=>F|PromiseLike<F>)|null,
 ):Promise<U|F> {
  return Promise.resolve(this.result).then(fulfilled,rejected);
 }
}
async function unionLoad(text:string):Promise<Result<Preview,BadQty|NoStock>> {
 return new UnionThenable(preview(text).result);
}
export {unionLoad,UnionThenable,runJob,counts,preview};
`);
const omittedWrapper=example('plain-union-worker-closes-both',types+ladder+workerFn+`
async function plainLoad(text:string):Promise<Result<Preview,BadQty|NoStock>> {return plainPreview(text);}
export {plainLoad,runJob,counts};
`);
const asyncLadder=example('fixture-await-the-step-and-inspect-result',types+before(asyncMap,'const pendingInside =')+`
async function asyncPreview(text:string):Promise<Result<Preview,BadQty|NoStock>> {
 const qty=parseQty(text);if(!qty.ok)return qty;
 const offer=await availabilityAsync(qty.value);if(!offer.ok)return offer;
 return ok({quantity:qty.value,offer:offer.value.id});
}
export {asyncPreview};
`);
const flatAnnotation=example('async-map-needs-different-return-type',fixed+asyncMap+`
const wrong:Res<Offer,BadQty|NoStock>=pendingInside; // Error TS2322
`,[2322]);
assert(flatAnnotation.diagnostics[0].message.includes("Property 'id' is missing in type 'Promise<Result<Offer, NoStock>>'"));
const asyncArray=example('async-flatmap-is-still-promises',`
const mapped=[2,7].map(async n=>n+1);
const flattened=[2,7].flatMap(async n=>n+1);
const wrongMap:number[]=mapped; // Error TS2322
const wrongFlat:number[]=flattened; // Error TS2322
`,[2322,2322]);
const analogies=example('fixture-array-await-and-optional-chain',`
const mapped=[2,7].map(async n=>n+1);
const flattened=[2,7].flatMap(async n=>n+1);
function city(user:{address?:{city:string}}|null|undefined){return user?.address?.city;}
export {mapped,flattened,city};
`);
assert(manuscript.includes('`user?.address?.city`'));
assert(manuscript.includes('six callers'),'Fictional caller census remains on the page');
function capture(program){const output=[],log=console.log;let module;
 try{console.log=(...args)=>output.push(args);delete require.cache[program.file];module=require(program.file);}
 finally{console.log=log;}return {module,output};}
async function captureCall(fn){const output=[],log=console.log;
 try{console.log=(...args)=>output.push(args);await fn();}finally{console.log=log;}return output;}
async function group(name,fn){try{await fn();groups++;}catch(e){e.message=name+': '+e.message;throw e;}}
const drain=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
async function staysPending(promise){let settled=false;promise.then(()=>{settled=true;},()=>{settled=true;});await drain();assert.equal(settled,false);}
async function main(){
 const sync=capture(printed),m=sync.module,p= capture(plain).module,h=capture(flat);
 const expected=[
  {ok:true,value:{quantity:2,offer:'offer-2'}},
  {ok:false,error:{kind:'noStock'}},
  {ok:false,error:{kind:'badQty'}},
 ];
 await group('printed-sync-outputs-and-nested-refusal',()=>{
  assert.deepEqual(sync.output,[[JSON.stringify(expected[0])],[JSON.stringify(expected[1])],
   [JSON.stringify({ok:true,value:expected[1]})]]);
  assert.deepEqual(m.nested.result,{ok:true,value:expected[1]});
 });
 await group('all-refusals-and-success-in-class-and-ladder',()=>{
  ['2','7','x'].forEach((s,i)=>{assert.deepEqual(m.preview(s).result,expected[i]);assert.deepEqual(p.plainPreview(s),expected[i]);});
  for(const s of ['0','-1','2.5','Infinity',''])assert.deepEqual(m.preview(s).result,expected[2]);
  assert.equal(m.preview('5').result.ok,true);assert.deepEqual(m.preview('6').result,expected[1]);
 });
 await group('printed-plain-helper-output',()=>assert.deepEqual(h.output,[[JSON.stringify(expected[1])]]));
 await group('chain-skips-callback-and-preserves-failure',()=>{
  const failure={ok:false,error:{kind:'badQty'}};let calls=0;
  assert.strictEqual(h.module.andThen(failure,()=>{calls++;return m.ok(1);}),failure);
  assert.strictEqual(new m.Res(failure).then(()=>{calls++;return new m.Res(m.ok(1));}).result,failure);
  assert.strictEqual(new m.Res(failure).map(()=>{calls++;return 1;}).result,failure);
  assert.equal(calls,0);
 });
 await group('helper-and-ladder-preserve-the-same-quantity',()=>{
  for(const s of ['2','7','x']){
   const result=h.module.andThen(m.parseQty(s),n=>{
    const offer=m.availability(n);return offer.ok?m.ok({quantity:n,offer:offer.value.id}):offer;
   });assert.deepEqual(result,p.plainPreview(s));
  }
 });
 await group('printed-promises-adopt-value-or-promise',async()=>{
  const a=capture(promise).module;assert.equal(await a.increased,3);assert.equal(await a.alsoIncreased,3);
 });
 await group('printed-array-levels',()=>assert.deepEqual(capture(array).output,[['[[2,2],[7,7]]'],['[2,2,7,7]']]));
 await group('printed-worker-success-loses-wrapper-refusal-never-closes',async()=>{
  const a=capture(incident).module;
  assert.deepEqual(await a.goodJob,expected[0].value);
  await staysPending(a.refusedJob);
  assert.deepEqual(a.counts,{started:2,closed:1,failed:0});
  // Pending is established by the finite printed branch, not by a wall-clock timeout:
  // Res.then ignores the rejection callback and does not call success on a refusal.
 });
 const repaired=capture(fixedJob).module;
 await group('printed-repair-output-and-worker-counters',async()=>{
  const output=await captureCall(()=>repaired.checkRepair());
  assert.deepEqual(output,[[JSON.stringify({result:expected[0]})],[JSON.stringify(expected[1])],
   ['{"started":2,"closed":2,"failed":0}']]);
 });
 await group('rename-retains-both-domain-refusals-and-wrapper',async()=>{
  for(const [i,s] of ['2','7','x'].entries())assert.deepEqual((await repaired.loadPreview(s)).result,expected[i]);
  assert.equal('then' in repaired.preview('2'),false);
  assert.equal(typeof repaired.preview('2').andThen,'function');
 });
 await group('deprecated-alias-still-adopted',async()=>{
  const a=capture(alias).module;assert.deepEqual(await a.goodJob,expected[0].value);await staysPending(a.refusedJob);
  assert.deepEqual(a.counts,{started:2,closed:1,failed:0});
 });
 await group('real-thenable-finishes-but-refusal-is-worker-failure',async()=>{
  const a=capture(realThenable).module;
  const results=await Promise.allSettled([a.runJob(()=>a.realLoad('2')),a.runJob(()=>a.realLoad('7'))]);
  assert.deepEqual(results,[{status:'fulfilled',value:expected[0].value},{status:'rejected',reason:expected[1].error}]);
  assert.deepEqual(a.counts,{started:2,closed:2,failed:1});
 });
 await group('whole-union-thenable-finishes-and-calls-success-on-refusal',async()=>{
  const a=capture(wholeUnion).module;
  assert.deepEqual(await a.runJob(()=>a.unionLoad('2')),expected[0]);
  assert.deepEqual(await a.runJob(()=>a.unionLoad('7')),expected[1]);
  assert.deepEqual(a.counts,{started:2,closed:2,failed:0});
  let seen;
  await new a.UnionThenable(a.preview('7').result).then(result=>{seen=result;});
  assert.deepEqual(seen,expected[1]);
 });
 await group('removing-class-is-also-a-working-repair',async()=>{
  const a=capture(omittedWrapper).module;
  assert.deepEqual(await a.runJob(()=>a.plainLoad('2')),expected[0]);
  assert.deepEqual(await a.runJob(()=>a.plainLoad('7')),expected[1]);
  assert.deepEqual(a.counts,{started:2,closed:2,failed:0});
 });
 await group('helper-does-not-force-result-consumption',()=>assert.deepEqual(capture(ignored).module.ignored,{ok:true,value:'done'}));
 await group('printed-async-map-starts-work-but-outer-await-does-not-await-field',async()=>{
  const a=capture(pending).module;
  assert(a.pendingInside.result.ok);assert(a.pendingInside.result.value instanceof Promise);
  assert.strictEqual(await a.pendingInside,a.pendingInside);
  assert.deepEqual(await a.pendingInside.result.value,{ok:true,value:{id:'offer-2'}});
  let started=0;
  const other=new a.Res(a.parseQty('7')).map(n=>{started++;return a.availabilityAsync(n);});
  assert.equal(started,1);assert.deepEqual(await other.result.value,expected[1]);
 });
 await group('explicit-async-ladder-keeps-one-result-layer',async()=>{
  const a=capture(asyncLadder).module;
  for(const [i,s] of ['2','7','x'].entries())assert.deepEqual(await a.asyncPreview(s),expected[i]);
 });
 await group('async-flatmap-does-not-replace-promise-all',async()=>{
  const a=capture(analogies).module;
  assert(a.mapped.every(p=>p instanceof Promise));assert(a.flattened.every(p=>p instanceof Promise));
  assert.deepEqual(await Promise.all(a.mapped),[3,8]);assert.deepEqual(await Promise.all(a.flattened),[3,8]);
 });
 await group('optional-chain-propagates-only-nullish-absence',()=>{
  const {city}=capture(analogies).module;
  assert.equal(city(undefined),undefined);assert.equal(city(null),undefined);assert.equal(city({}),undefined);
  assert.equal(city({address:{city:''}}),'');assert.equal(city({address:{city:'Haifa'}}),'Haifa');
 });
 console.log(`Chapter 23: TypeScript ${version}; ${fences.length} fences, ${cases} compiler cases, ${groups} runtime groups. PASS.\nFixtures: ${scratch}`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
