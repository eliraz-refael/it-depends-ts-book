'use strict';
// A single repository follows the manuscript; the benchmark has its own explicit file list.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process'),assert=require('node:assert/strict');
const {version,defaults}=require('./compiler.cjs');
const repo=path.resolve(__dirname,'..'),chapter=path.join(repo,'book/04-the-real-world/04-performance-vs-safety.md');
const manuscript=fs.readFileSync(chapter,'utf8');
const fences=[...manuscript.matchAll(/^```(\w+)\n([\s\S]*?)\n```/gm)].map(m=>({language:m[1],body:m[2]}));
const used=new Set();
function block(prefix){const hits=fences.flatMap((f,i)=>f.body.startsWith(prefix)?[{...f,i}]:[]);assert.equal(hits.length,1,prefix);used.add(hits[0].i);return hits[0].body+'\n';}
function source(prefix){return block(prefix).split('\n').slice(1).join('\n');}
const loose=source('// src/i18n.ts — Oded');
const badLiteral=source('// src/probe.ts — temporary');
const oldDeclarations=source('// src/i18n.ts — restore');
const banner=source('// src/banner.ts');
const options=JSON.parse(block('{\n  "compilerOptions"'));
const benchOptions=JSON.parse(manuscript.match(/^\/\/ bench\/tsconfig\.json: (.+)$/m)[1]);
const generator=source('// tools/workload.mjs');
const brokenSignature=source('// src/i18n.ts — candidate');
const badSelection=source('// src/probe.ts — try');
const distributedSignature=source('// src/i18n.ts — replace');
const counterfactuals=source('// Counterfactual signatures');
const alternatives=counterfactuals.split(/^\/\/ /m).slice(1).map(part=>{const newline=part.indexOf('\n');return {label:part.slice(0,newline),code:part.slice(newline+1).trimEnd()+'\n'};});
assert.equal(alternatives.length,4,'Four printed counterfactual alternatives');
assert.equal((manuscript.match(/^```/gm)||[]).length,fences.length*2,'All fences are labelled and extracted');
assert.equal(used.size,fences.length,'Every printed fence is used');assert.equal(fences.length,10);
assert.deepEqual(options.compilerOptions,{...defaults,noEmit:true});
assert.equal(manuscript.match(/root package has `([^`]+)`/)[1],'"type": "module"');
const scratch=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch27-'))),story=path.join(scratch,'story');
const results=[],measurements=[],traceEvidence=[];let cases=0,runtimeGroups=0,fileLists=0,emitComparisons=0;
const tsc=path.join(repo,'node_modules/.bin/tsc');
const emitFlags=badLiteral.match(/^\/\/ Emit: tsc -p tsconfig.json --checkers 1 (.+)$/m)[1].split(' ');
assert.deepEqual(emitFlags,['--noEmit','false','--rootDir','src','--outDir','dist','--removeComments','true']);
assert(manuscript.indexOf('// Emit: tsc')<manuscript.indexOf('On Node 22.23.4'),'Emit command precedes the output');
const record=process.argv.includes('--record-counters');
assert(process.argv.slice(2).every(a=>a==='--record-counters'),'Only --record-counters is supported');
function write(f,s){const p=path.join(story,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof s==='string'?s:JSON.stringify(s,null,2));}
function read(f){return fs.readFileSync(path.join(story,f),'utf8');}
function remove(f){fs.rmSync(path.join(story,f),{force:true});}
function command(name,exe,args){const r=cp.spawnSync(exe,args,{cwd:story,encoding:'utf8',timeout:60000,maxBuffer:24*1024*1024});if(r.error)throw r.error;const result={name,args,status:r.status,stdout:r.stdout,stderr:r.stderr};results.push(result);fs.writeFileSync(path.join(scratch,'RESULTS.json'),JSON.stringify(results,null,2));return result;}
function compile(name,expected=[],project='tsconfig.json',extra=[]){
 const r=command(name,tsc,['-p',project,'--checkers','1','--pretty','false','--noErrorTruncation',...extra]);cases++;
 const diagnostics=[...r.stdout.matchAll(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.*)$/gm)];
 assert.equal(r.status,expected.length?1:0,name+'\n'+r.stdout+r.stderr);
 assert.equal(diagnostics.length,expected.length,name+' diagnostic count\n'+r.stdout);
 for(const e of expected){const lines=read(e.file).split('\n').flatMap((l,i)=>l.includes(e.needle)?[i+1]:[]);assert.equal(lines.length,1,e.needle);assert(diagnostics.some(m=>path.resolve(story,m[1])===path.join(story,e.file)&&+m[2]===lines[0]&&(!e.code||+m[4]===e.code)),name+' diagnostic position/code\n'+r.stdout);if(e.message)assert(r.stdout.includes(e.message),name+' diagnostic text\n'+r.stdout);}
 return r;
}
function error(file,needle,code,message){return {file,needle,code,message};}
function run(name,args,output){const r=command(name,process.execPath,args);assert.equal(r.status,0,name+'\n'+r.stderr);if(output!==undefined)assert.equal(r.stdout.trim(),output,name);runtimeGroups++;return r;}
function list(name,project,has,lacks){const r=command(name,tsc,['-p',project,'--checkers','1','--listFilesOnly']);assert.equal(r.status,0);const entries=r.stdout.trim().split(/\r?\n/).map(p=>fs.realpathSync(p));for(const f of has)assert(entries.includes(fs.realpathSync(path.join(story,f))),name+' missing '+f);for(const f of lacks)assert(!entries.includes(fs.realpathSync(path.join(story,f))),name+' unexpected '+f);fileLists++;}
function replace(s,a,b){assert.equal(s.split(a).length,2,'Unique replacement: '+a);return s.replace(a,b);}
const looseSignature=loose.match(/^function t\(key: string, params\?:[^\n]+\n/m)[0];
const catalogue=loose.slice(0,loose.indexOf('\n'))+'\n';
const body=loose.slice(loose.indexOf('function t(key: string, params: Record'));
const helpers=oldDeclarations.slice(0,oldDeclarations.indexOf('type Args'));
const paths=helpers.slice(0,helpers.indexOf('type At'));
const key='type Key = Paths<typeof messages>;\n';
const oldArgs=oldDeclarations.slice(oldDeclarations.indexOf('type Args'),oldDeclarations.indexOf('function t('));
const oldSignature='function t(...args: Args): string;\n';
assert.equal(alternatives[0].code,looseSignature,'Printed loose signature matches the PR');
assert.equal(alternatives[3].code,oldSignature,'Printed original signature matches restored API');
const tupleSplit=alternatives[2].code.indexOf('function t(');
assert(tupleSplit>0);
const signatures={
 bare:{helpers:'',signature:alternatives[0].code},
 key:{helpers:paths+key,signature:alternatives[1].code},
 untyped:{helpers:paths+key+alternatives[2].code.slice(0,tupleSplit).trimEnd()+'\n',signature:alternatives[2].code.slice(tupleSplit)},
 union:{helpers:helpers+oldArgs,signature:alternatives[3].code},
 broken:{helpers,signature:brokenSignature},
 distributed:{helpers,signature:distributedSignature},
};
function moduleFor(kind){const v=signatures[kind];return catalogue+v.helpers+v.signature+body;}
const initialBanner=replace(banner,'t(...pending)','t(pending[0], pending[1])');
const probeFiles=JSON.parse(manuscript.match(/with `files: (\[[^`]+\])`/)[1]);
const probeProject={extends:'./tsconfig.json',files:probeFiles,include:[]};
assert.deepEqual(probeFiles,['src/i18n.ts','src/probe.ts']);assert(manuscript.includes('`include: []`'));
write('package.json',{type:'module'});write('tsconfig.json',options);write('probe.json',probeProject);
write('src/i18n.ts',loose);write('src/banner.ts',initialBanner);write('src/probe.ts',badLiteral);
compile('PR-accepts-mistakes');
compile('PR-emit',[],'tsconfig.json',emitFlags);
assert(manuscript.includes('Noam is reading the output of two deliberately broken calls he wrote'));
assert(badLiteral.includes('console.log(t("shop.cart", { name: "A" }));'),'Opening output has its printed call');
run('PR-review-probe-output',['dist/probe.js'],'shop.crat\nHello A, {count} items');
const emittedLoose=read('dist/i18n.js');
write('src/banner.ts',banner);
compile('PR-original-spread-rejected',[error('src/banner.ts','t(...pending)',2556)]);
write('src/banner.ts',initialBanner);compile('PR-expanded-caller-restored');
write('src/i18n.ts',moduleFor('union'));
compile('original-rejects-literal-mistakes',[error('src/probe.ts','shop.crat',2345,"Type '\"shop.crat\"' is not assignable to type '\"shop.hello\"'."),error('src/probe.ts','shop.cart',2345),error('src/banner.ts','t(pending[0], pending[1])',2345)]);
remove('src/probe.ts');write('src/banner.ts',banner);compile('original-restored');
compile('original-emit',[],'tsconfig.json',emitFlags);
assert.equal(read('dist/i18n.js'),emittedLoose,'Original and PR emit bytes');emitComparisons++;
assert.equal(Buffer.byteLength(emittedLoose),Number(manuscript.match(/byte-identical, all (\d+) bytes/)[1]),'Printed byte count');
const bannerProbe='import {banner,ready} from "./dist/banner.js"; console.log(banner(true)); console.log(banner(false)); console.log(ready);';
run('original-allowed-values',['--input-type=module','-e',bannerProbe],'Hello A, 2 items\nHello A\nReady');
// The same callers are tested under every signature; only their explicitly selected probe changes.
const callerCases={
 literals:'t("shop.cart", {name:"A",count:"2"}); t("shop.hello",{name:"A"}); t("shop.ready");',
 typo:'t("shop.crat", {name:"A",count:"2"});',
 missing:'t("shop.cart", {name:"A"});',
 wrongValue:'t("shop.cart", {name:"A",count:2});',
 extraFresh:'t("shop.cart", {name:"A",count:"2",oops:"!"});',
 wrongArity:'t("shop.ready", {name:"A"});',
 unionKey:'declare const selected: "shop.cart" | "shop.hello"; t(selected,{name:"A"});',
 emptyUnion:'declare const selected: "shop.cart" | "shop.ready"; t(selected);',
 correlated:'declare const pending: ["shop.cart",{name:string;count:string}] | ["shop.hello",{name:string}]; t(...pending);',
 readonly:'const pending = ["shop.cart",{name:"A",count:"2"}] as const; t(...pending);',
};
const rejects={bare:['wrongValue','correlated'],key:['typo','wrongValue','correlated'],untyped:['typo','wrongValue'],union:['typo','missing','wrongValue','extraFresh','wrongArity','unionKey','emptyUnion'],broken:['typo','missing','wrongValue','extraFresh','wrongArity','correlated'],distributed:['typo','missing','wrongValue','extraFresh','wrongArity','unionKey','emptyUnion']};
function contract(kind){const saved=read('src/i18n.ts');write('src/i18n.ts',moduleFor(kind));for(const [name,call] of Object.entries(callerCases)){write('src/probe.ts','import {t} from "./i18n.js";\n'+call+'\n');const expected=rejects[kind].includes(name)?[error('src/probe.ts',call)]:[];compile('contract-'+kind+'-'+name,expected,'probe.json');}remove('src/probe.ts');write('src/i18n.ts',saved);}
contract('bare');contract('union');compile('contract-controls-restored');
write('tools/workload.mjs',generator);assert.equal(command('generator-syntax',process.execPath,['--check','tools/workload.mjs']).status,0);
const generated=run('generator-output',['--input-type=module','-e','import {workload} from "./tools/workload.mjs"; console.log(JSON.stringify(workload()));']);
const workload=JSON.parse(generated.stdout),sections=Object.entries(workload.messages);
assert.equal(sections.length,40);assert(sections.every(([,v])=>Object.keys(v).length===50));
const keys=sections.flatMap(([s,v])=>Object.keys(v).map(k=>`${s}.${k}`));assert.equal(keys.length,2000);assert.equal(new Set(keys).size,2000);
assert.equal(workload.calls.length,2000);
const usedKeys=workload.calls.map(s=>s.match(/^t\("([^"]+)"/)[1]);assert(usedKeys.every(k=>keys.includes(k)));assert.equal(new Set(usedKeys).size,200);
const syntheticCatalogue='const messages = '+JSON.stringify(workload.messages)+' as const;\n';
function benchSource(kind){const v=signatures[kind];return syntheticCatalogue+v.helpers+'declare '+v.signature+workload.calls.join('\n')+'\nexport {};\n';}
write('bench/tsconfig.json',benchOptions);write('bench/case.ts',benchSource('bare'));
list('benchmark-file-set','bench/tsconfig.json',['bench/case.ts'],['src/i18n.ts','src/banner.ts']);
function counters(stdout){const result={};for(const k of ['Symbols','Types','Instantiations']){const m=stdout.match(new RegExp('^'+k+':\\s+(\\d+)','m'));assert(m,'Missing '+k);result[k]=Number(m[1]);}return result;}
function observe(kind,round,label=kind){write('bench/case.ts',benchSource(kind));const r=compile('benchmark-'+label+'-'+round,[],'bench/tsconfig.json',['--extendedDiagnostics']);const m=r.stdout.match(/^Check time:\s+([\d.]+)s/m);measurements.push({kind:label,round,counters:counters(r.stdout),checkSeconds:m?Number(m[1]):null});fs.writeFileSync(path.join(scratch,'MEASUREMENTS.json'),JSON.stringify(measurements,null,2));}
const firstKinds=['bare','key','untyped','union'];
const measuredKinds=[...firstKinds,'broken','distributed'];
for(let round=0;round<3;round++)for(const kind of [...measuredKinds.slice(round),...measuredKinds.slice(0,round)])observe(kind,round);
contract('key');contract('untyped');compile('counterfactual-controls-restored');
// The tempting generic is checked against the real banner and the selected-key probe separately.
write('src/i18n.ts',moduleFor('broken'));write('src/probe.ts',badSelection);
compile('broken-generic-full-caller-set',[error('src/banner.ts','t(...pending)',2556)]);
compile('broken-generic-selected-probe',[],'probe.json');
compile('broken-generic-probe-emit',[],'probe.json',emitFlags);
run('broken-generic-customer-output',['dist/probe.js'],'Hello A, {count} items');
assert.equal(read('dist/i18n.js'),emittedLoose);emitComparisons++;
remove('src/probe.ts');contract('broken');

write('src/i18n.ts',moduleFor('distributed'));write('src/probe.ts',badSelection);
compile('distributed-rejects-selected-key',[error('src/probe.ts','console.log',2345)]);
remove('src/probe.ts');compile('distributed-restored');contract('distributed');compile('distributed-contract-controls-restored');
fs.rmSync(path.join(story,'dist'),{recursive:true,force:true});
compile('distributed-emit',[],'tsconfig.json',emitFlags);
assert.equal(read('dist/i18n.js'),emittedLoose);emitComparisons++;

// Trace after untraced measurements. Inspect identities via the legend, never fixed IDs or sample counts.
write('bench/case.ts',benchSource('union'));
const traced=compile('trace-original-union',[],'bench/tsconfig.json',['--generateTrace','trace','--extendedDiagnostics']);
const legend=JSON.parse(read('trace/legend.json')),events=JSON.parse(read('trace/trace.json'));
let unionFound=false;
for(const entry of legend){const types=JSON.parse(fs.readFileSync(entry.typesPath,'utf8')),byId=new Map(types.map(t=>[t.id,t]));const args=types.filter(t=>t.symbolName==='Args'&&t.unionTypes?.length===2000);if(args.length)unionFound=true;for(const event of events.filter(e=>e.name==='structuredTypeRelatedTo'&&e.args?.checkerId===entry.checkerId)){const target=byId.get(event.args.targetId),source=byId.get(event.args.sourceId);assert(target&&source,'Trace relation identities resolve through legend');if(args.some(t=>t.id===target.id||t.id===source.id))traceEvidence.push({checkerId:entry.checkerId,sourceId:source.id,targetId:target.id,sourceName:source.symbolName,targetName:target.symbolName,durationMicroseconds:event.dur,sourceUnionMembers:source.unionTypes?.length,targetUnionMembers:target.unionTypes?.length});}}
assert(unionFound,'The trace type dump contains the large Args union');
const expressions=events.filter(e=>e.name==='checkExpression'&&e.args?.path===path.join(story,'bench/case.ts')).map(e=>({pos:e.args.pos,end:e.args.end,source:read('bench/case.ts').slice(e.args.pos,e.args.end)}));
const durations={};for(const e of events.filter(e=>e.ph==='X'&&typeof e.dur==='number')){const row=durations[e.name]??={events:0,summedMicroseconds:0};row.events++;row.summedMicroseconds+=e.dur;}
const checkEvents=events.filter(e=>e.ph==='X'&&(e.cat==='check'||e.cat==='checkTypes'));
const checkEventSeconds=checkEvents.reduce((sum,e)=>sum+(e.dur??0),0)/1e6;
const sourceSpans=[],starts=new Map();
for(const e of events.filter(e=>e.name==='checkSourceFile')){
 const key=JSON.stringify([e.pid,e.tid,e.args?.checkerId,e.args?.path]);
 if(e.ph==='B')starts.set(key,e.ts);
 if(e.ph==='E'&&starts.has(key)){sourceSpans.push({path:e.args?.path,seconds:(e.ts-starts.get(key))/1e6});starts.delete(key);}
}
const checkFileSeconds=sourceSpans.find(e=>e.path===path.join(story,'bench/case.ts'))?.seconds??null;
const printedTrace=manuscript.match(/About ([\d.]+) seconds in the recorded check events, against about ([\d.]+)/);
assert(printedTrace,'Trace observations are labelled approximate');
fs.writeFileSync(path.join(scratch,'TRACE-EVIDENCE.json'),JSON.stringify({relations:traceEvidence,expressions,durations,checkEventSeconds,checkFileSeconds,sourceSpans,extendedDiagnostics:traced.stdout,printedObservation:{checkEventSeconds:Number(printedTrace[1]),checkFileSeconds:Number(printedTrace[2])},note:'Recorded durations, including the printed observations, are evidence only. Sums may overlap; no duration, ordering or ratio is asserted.'},null,2));
// Both CPU profiles are separate from timing. Format assertions never rank samples.
// Read the protobuf envelope even without Go. Profile.proto fields identify the sample schema.
function protobufFields(buffer){
 let offset=0;const fields=[];
 function varint(){
  let n=0,shift=0;
  while(true){
   assert(offset<buffer.length,'Truncated protobuf varint');
   const b=buffer[offset++];n+=(b&127)*2**shift;
   if(!(b&128))return n;
   shift+=7;assert(shift<70,'Invalid protobuf varint');
  }
 }
 while(offset<buffer.length){
  const tag=varint(),wire=tag%8,field=Math.floor(tag/8);assert(field>0);
  if(wire===0)varint();
  else if(wire===1)offset+=8;
  else if(wire===2){const length=varint();offset+=length;}
  else if(wire===5)offset+=4;
  else assert.fail('Unsupported profile protobuf wire type '+wire);
  assert(offset<=buffer.length,'Truncated protobuf field');fields.push({field,wire});
 }
 return fields;
}
function pprofEvidence(executable,label,profilePath){
 const available=cp.spawnSync(executable,['version'],{encoding:'utf8'});
 if(available.error?.code==='ENOENT'){const note=label+': SKIP pprof sample evidence — Go toolchain absent; CPU profile produced and protobuf envelope decoded.';console.log(note);return {skipped:true,note};}
 if(available.error)throw available.error;
 assert.equal(available.status,0,available.stderr);
 const evidence={go:available.stdout.trim()};
 for(const [name,args] of [['top',['-top','-cum']],['peek',['-peek','mapTypeEx']]]){
  const r=command(label+'-'+name,executable,['tool','pprof',...args,profilePath]);
  if(name==='peek'&&r.status===2&&r.stderr.includes('no matches found for regexp:')){
   evidence[name]=r.stderr.trim(); // A function need not appear in a sample.
  }else{assert.equal(r.status,0,r.stderr);evidence[name]=r.stdout;}
 }
 assert(/Type: cpu/.test(evidence.top)&&/Total samples =/.test(evidence.top),'Go reads the CPU profile');
 evidence.mapTypeExRow=evidence.top.split('\n').find(l=>l.trimEnd().endsWith('checker.(*Checker).mapTypeEx'))??null;
 evidence.note='Sample shares, hot-function presence and ordering are evidence only; never pass/fail conditions.';
 return evidence;
}
function captureProfile(kind,directory){
 write('bench/case.ts',benchSource(kind));
 const r=compile('profile-'+kind,[],'bench/tsconfig.json',['--pprofDir',directory,'--extendedDiagnostics']);
 const cpuProfiles=fs.readdirSync(path.join(story,directory)).filter(f=>f.endsWith('-cpuprofile.pb.gz'));
 assert.equal(cpuProfiles.length,1,kind+' produces one fresh CPU profile');
 const profilePath=path.join(story,directory,cpuProfiles[0]);
 const profileFields=protobufFields(require('node:zlib').gunzipSync(fs.readFileSync(profilePath)));
 for(const field of [1,6])assert(profileFields.some(f=>f.field===field&&f.wire===2),'CPU profile schema field '+field);
 return {profilePath,protobufFields:profileFields,extendedDiagnostics:r.stdout,...pprofEvidence('go',kind+' CPU profile',profilePath)};
}
const profileEvidence={union:captureProfile('union','profile'),distributed:captureProfile('distributed','profile-distributed')};
const absentGoControl=pprofEvidence(path.join(scratch,'absent-go-toolchain'),'No-Go control',profileEvidence.union.profilePath);
assert(absentGoControl.skipped,'Missing Go skips visibly');
fs.writeFileSync(path.join(scratch,'PROFILE-EVIDENCE.json'),JSON.stringify({...profileEvidence,absentGoControl,note:'Both profiles are readable; their sample shares and relative costs are observations, not assertions.'},null,2));
write('bench/case.ts',benchSource('distributed'));compile('trace-counterfactual-restored',[],'bench/tsconfig.json');
run('final-banner-values',['--input-type=module','-e',bannerProbe],'Hello A, 2 items\nHello A\nReady');
// Extra caller controls, on the final signature, do not change the manuscript's final repository.
const finalModule=read('src/i18n.ts');
const forward='\ntype ArgsFor<K extends Key> = K extends Key ? (keyof Params<At<typeof messages,K>> extends never ? [K] : [K,Params<At<typeof messages,K>>]) : never;\nfunction forward<K extends Key>(...args:ArgsFor<K>){return t(...args);}\nconst callable: (...args:ArgsFor<Key>)=>string=t;\n';
write('src/i18n.ts',finalModule+forward);compile('generic-forward-and-function-assignment');
write('src/i18n.ts',finalModule+'\nt<Key>("shop.cart",{name:"A"});\n');compile('explicit-union-cannot-lose-pair',[error('src/i18n.ts','t<Key>',2345)]);
const keyWitness='declare '+distributedSignature.replace('function t<','function inferredKey<').replace('): string;','): K;')+
 '\nconst chosenKey = inferredKey("shop.cart", {name:"A",count:"2"});\nconst exactKey: "shop.cart" = chosenKey;\n';
write('src/i18n.ts',finalModule+keyWitness);compile('literal-key-inference');
write('src/i18n.ts',finalModule+keyWitness+'const wrongKey: "shop.hello" = chosenKey;\n');
compile('literal-key-is-not-any-or-another-member',[error('src/i18n.ts','const wrongKey',2322)]);
write('src/i18n.ts',finalModule);compile('extra-callers-restored');
// Validation-only precomputed-map attempt: count and time it; never rank by either in an assertion.
let map='type ParamMap = {\n';for(const fullKey of keys){const k=Number(fullKey.split('.k')[1]);map+=JSON.stringify(fullKey)+': '+(k%3===0?'{name:string;count:string}':k%3===1?'{name:string}':'{}')+';\n';}map+='};\ntype Key = keyof ParamMap;\n';
const precomputed=syntheticCatalogue+map+'declare '+brokenSignature.replaceAll('Params<At<typeof messages, K>>','ParamMap[K]')+workload.calls.join('\n')+'\nexport {};\n';
for(let round=0;round<3;round++){write('bench/case.ts',precomputed);const r=compile('precomputed-control-'+round,[],'bench/tsconfig.json',['--extendedDiagnostics']);const time=r.stdout.match(/^Check time:\s+([\d.]+)s/m);measurements.push({kind:'precomputed',round,counters:counters(r.stdout),checkSeconds:time?Number(time[1]):null});}
write('bench/case.ts',benchSource('distributed'));compile('precomputed-control-restored',[],'bench/tsconfig.json');
const summaries={};for(const kind of [...measuredKinds,'precomputed']){const rows=measurements.filter(m=>m.kind===kind);assert.equal(rows.length,3);for(const r of rows)assert.deepEqual(r.counters,rows[0].counters,kind+' counters repeat');const times=rows.map(r=>r.checkSeconds).filter(t=>t!==null).sort((a,b)=>a-b);summaries[kind]={...rows[0].counters,checkSeconds:rows.map(r=>r.checkSeconds),medianCheckSeconds:times.length?times[Math.floor(times.length/2)]:null};}
fs.writeFileSync(path.join(scratch,'MEASUREMENTS.json'),JSON.stringify(measurements,null,2));
fs.writeFileSync(path.join(scratch,'COUNTERS-AND-TIMES.json'),JSON.stringify(summaries,null,2));
// Filled from a reviewed record-counters run; the standard suite asserts every printed counter.
const expectedCounters = {
  "bare": {
    "Symbols": 40604,
    "Types": 2181,
    "Instantiations": 6
  },
  "key": {
    "Symbols": 42765,
    "Types": 4425,
    "Instantiations": 13189
  },
  "untyped": {
    "Symbols": 171464,
    "Types": 18314,
    "Instantiations": 39641
  },
  "union": {
    "Symbols": 171014,
    "Types": 18033,
    "Instantiations": 118255
  },
  "broken": {
    "Symbols": 48329,
    "Types": 7956,
    "Instantiations": 87431
  },
  "distributed": {
    "Symbols": 118618,
    "Types": 19158,
    "Instantiations": 118628
  }
};
if(!record){
 for(const kind of measuredKinds)assert.deepEqual(Object.fromEntries(['Symbols','Types','Instantiations'].map(k=>[k,summaries[kind][k]])),expectedCounters[kind],kind+' pinned counters');
 const labels=Object.fromEntries(firstKinds.map((kind,i)=>[kind,alternatives[i].label]));labels.distributed='Distributed whole tuple';
 for(const [kind,label]of Object.entries(labels)){const rows=manuscript.split('\n').filter(l=>l.startsWith('| '+label+' |'));assert(rows.length,kind+' printed row');for(const row of rows)assert.equal(Number(row.split('|')[2].trim().replaceAll(',','')),summaries[kind].Instantiations,kind+' printed count');}
 const baselineRows=manuscript.split('\n').filter(l=>l.startsWith("| Linoy's per-key tuples |"));assert.equal(baselineRows.length,2);assert.equal(baselineRows[0],baselineRows[1],'Both tables reuse the same observed baseline');
 assert.equal(Number(manuscript.match(/([\d,]+) instantiations, a [\d.]+s median/)[1].replaceAll(',','')),summaries.broken.Instantiations,'Printed broken-generic counter');
}

assert.equal(read('src/i18n.ts'),moduleFor('distributed'));assert.equal(read('src/banner.ts'),banner);assert.equal(read('bench/case.ts'),benchSource('distributed'));assert(!fs.existsSync(path.join(story,'src/probe.ts')));assert(!fs.existsSync(path.join(story,'dist/probe.js')));assert.deepEqual(JSON.parse(read('tsconfig.json')),options);
console.log(JSON.stringify({typescript:version,node:process.version,fences:fences.length,compilerCases:cases,runtimeGroups,fileListQueries:fileLists,emitComparisons,benchmarkRuns:measurements.length,countersRecorded:record,scratch,summaries},null,2));
console.log(record?'Chapter 27: COUNTERS RECORDED (not a pinned-counter pass)':'Chapter 27: PASS');
