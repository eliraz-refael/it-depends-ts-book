'use strict';
// Separate migration states built from every labelled JS, TS and configuration fence.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {compile,version}=require('./compiler.cjs');
const text=fs.readFileSync(path.resolve(__dirname,'../book/04-the-real-world/01-migration-strategies.md'),'utf8');
const fences=[...text.matchAll(/```(typescript|javascript|json)\n([\s\S]*?)\n```/g)].map(m=>({language:m[1],body:m[2]}));
const used=new Set();
function block(prefix){const found=fences.map((f,i)=>({...f,i})).filter(f=>f.body.startsWith(prefix));assert.equal(found.length,1,prefix);used.add(found[0].i);return found[0].body+'\n';}
function files(s){const result={};let name;
 for(const line of s.split('\n')){const label=line.match(/^\/\/ ((?:src|tests|scripts)\/[\w.-]+\.(?:ts|js))(?:\s.*)?$/);
  if(label){name=label[1];assert(!result[name]);result[name]='';}else if(name)result[name]+=line+'\n';else assert(!line.trim());}
 return result;}
function replace(s,a,b){assert.equal(s.split(a).length,2,'Unique replacement: '+a);return s.replace(a,b);}
const config=JSON.parse(block('{\n  "compilerOptions"'));
assert.deepEqual(config,{compilerOptions:{target:'ES2022',module:'Node16',types:[],allowJs:true,checkJs:false,rootDir:'.',outDir:'dist'},include:['src/**/*','tests/**/*.ts']});
assert(text.includes('`"type": "commonjs"`'));
const original=files(block('// src/slug.js'));
const converted=files(block('// src/slug.ts\n'));
const inspect=block('// inspect.js,');
const repaired=files(block('// src/slug.ts — preserve'));
const legacy=files(block('// src/lookup.js'));
const caller=files(block('// src/caller.ts'));
const checked=files(block('// src/route.js\n'));
const sitemap=files(block('// src/sitemap.js'));
const backfill=files(block('// scripts/backfill.js'));
const money=files(block('// src/money.js'));
const named=files(block('// src/money.ts'));
assert.equal(used.size,fences.length,'Every fence extracted');assert.equal(fences.length,12);
const oldTest={'tests/slug.require.test.js':original['tests/slug.test.js']};
const bareRoute={'src/route.js':original['src/route.js']};
// These files exist throughout the story, even before their fences are printed.
const common={...legacy,...money,...sitemap,...backfill};
const base={...converted,...bareRoute,...common,...oldTest};
const compatible={...base,...repaired};
const deferred=Object.fromEntries(Object.entries(legacy).map(([f,s])=>[f,'// @ts-nocheck\n'+s]));
assert(text.includes('/** @param {number} cents */'));
const annotatedMoney={'src/money.js':replace(money['src/money.js'],'function price(cents)', '/** @param {number} cents */\nfunction price(cents)')};
const final={...compatible,...checked,...deferred,...annotatedMoney};
const experiment={...final,...converted};
const routeOnlyRepair={...experiment,'src/route.js':replace(checked['src/route.js'],'require("./slug")','require("./slug").default')};
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch24-'));
let cases=0,groups=0;
const expected=(file,needle,code)=>({file,needle,code});
const routeAny=expected('src/route.js','module.exports = function handle(title)',7006);
const routeCall=expected('src/route.js','return "/products/" + slug(title)',2349);
const debt=[expected('src/lookup.js','module.exports = function lookup(id)',7006),routeAny,
 expected('src/sum.js','module.exports = function sum(a, b)',7006),expected('src/sum.js','module.exports = function sum(a, b)',7006),
 expected('src/money.js','function price(cents)',7006)];
function example(name,sources,options={},errors=[],roots){
 const dir=path.join(scratch,name);fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');
 for(const [f,s] of Object.entries(sources)){const target=path.join(dir,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);}
 // Reproduce the printed include patterns. Imports can still add files to this root set.
 roots??=Object.keys(sources).filter(f=>f.startsWith('src/')||(/^tests\/.*\.ts$/.test(f)));
 const result=compile(roots.map(f=>path.join(dir,f)),{...config.compilerOptions,strict:undefined,...options},dir);
 const target=errors.map(e=>{const lines=sources[e.file].split('\n');const matches=lines.flatMap((l,i)=>l.includes(e.needle)?[i+1]:[]);assert.equal(matches.length,1,e.file+' '+e.needle);return {file:e.file,line:matches[0],code:e.code};});
 const actual=result.diagnostics.map(d=>({file:d.fileName&&path.relative(dir,d.fileName),line:d.line,code:d.code}));
 const sort=a=>a.map(x=>JSON.stringify(x)).sort();assert.deepEqual(sort(actual),sort(target),name+'\n'+result.output);
 // tsc exits 2 when it emits despite errors, 1 when noEmitOnError blocks emit.
 assert.equal(result.status,errors.length?(options.noEmitOnError===false?2:1):0,name);cases++;return {dir,sources,...result};
}
const baseline=example('original-files', {...original,...common});
const incident=example('default-export-incident',base);
const repairedProgram=example('compatible-export',compatible);
const importEquals=example('compatible-export-import-equals',{...compatible,'tests/import-equals.ts':'import slug = require("../src/slug"); console.log(slug(" Green Chair "));\n'});
const globalBroken=example('checkjs-finds-call-and-five-parameters',base,{checkJs:true},[...debt,routeCall]);
const globalDebt=example('compatible-export-leaves-five-parameters',compatible,{checkJs:true},debt);
assert.equal(globalDebt.diagnostics.filter(d=>d.code===7006).length,5);
assert(text.includes('Five implicit-any parameters: title, id, a, b and cents'));
assert(!globalBroken.diagnostics.some(d=>d.fileName.endsWith('/sitemap.js')));
const local={'src/route.js':'// @ts-check\n'+original['src/route.js']};
example('per-file-check-finds-call', {...base,...local},{},[routeAny,routeCall]);
example('per-file-check-compatible-still-needs-parameter',{...compatible,...local},{},[routeAny]);
const fixed=example('global-check-with-typed-route-and-owned-optouts',final,{checkJs:true});
const typeAssertions=`\ntype IsAny<T> = 0 extends (1 & T) ? true : false;\nconst inferredAny:IsAny<Parameters<typeof handle>[0]>=true;\n`;
const inferred=example('typed-caller-of-unchecked-js', {...compatible,...caller,'src/caller.ts':caller['src/caller.ts']+typeAssertions});
example('checked-unannotated-route-does-not-constrain-ts-call',{...compatible,...deferred,...annotatedMoney,...caller},{checkJs:true},[routeAny]);
const typedCaller=example('jsdoc-now-rejects-ts-caller',{...final,...caller},{checkJs:true},[expected('src/caller.ts','const url: string = handle(42)',2345)]);
for(const [r,code]of [[globalBroken,2349],[globalBroken,7006],[typedCaller,2345]]){
 const d=r.diagnostics.find(d=>d.code===code&&(code!==7006||d.fileName.endsWith('/route.js')));
 assert(d);assert(text.includes(d.message.split('\n')[0]),'Manuscript diagnostic quote '+code);
}
// The already-checked route remains checked. The legacy sitemap already had its opt-out.
// The printed tsconfig permits emit with errors; reproduce that failed scratch build explicitly.
const experimentEmitted=example('experiment-default-export-checked-route-legacy-sitemap',experiment,{checkJs:true,noEmitOnError:false},[routeCall]);
assert(!experimentEmitted.diagnostics.some(d=>d.fileName.endsWith('/sitemap.js')));
const defaultAccess=example('route-default-repair-leaves-legacy-sitemap-unchecked',routeOnlyRepair,{checkJs:true});
const sitemapChecked={'src/sitemap.js':replace(sitemap['src/sitemap.js'],'// @ts-nocheck\n','')};
example('remove-existing-sitemap-optout-reveals-call',{...routeOnlyRepair,...sitemapChecked},{checkJs:true},[
 expected('src/sitemap.js','function sitemap(titles, footer)',7006),expected('src/sitemap.js','function sitemap(titles, footer)',7006),
 expected('src/sitemap.js','titles.map(title =>',7006),expected('src/sitemap.js','titles.map(title =>',2349)]);
const outside=example('backfill-outside-program',{...routeOnlyRepair,...backfill},{checkJs:true});
assert(!fs.existsSync(path.join(outside.dir,'dist/scripts/backfill.js')));
const withBackfill={...experiment,...backfill};
example('backfill-added-to-program-finds-call',withBackfill,{checkJs:true},[routeCall,expected('scripts/backfill.js','console.log(',2349)],Object.keys(withBackfill).filter(f=>f.startsWith('src/')||f.endsWith('.ts')||f.startsWith('scripts/')));
const scriptFixedSources={...final,...backfill};
const scriptFixed=example('backfill-added-compatible',scriptFixedSources,{checkJs:true},[],Object.keys(scriptFixedSources).filter(f=>f.startsWith('src/')||f.endsWith('.ts')||f.startsWith('scripts/')));
const originalMoney=example('named-member-original-in-full-repository',{...original,...common});
const namedFiles={...final,...named};delete namedFiles['src/money.js'];
const convertedMoney=example('named-member-conversion-in-full-repository',namedFiles,{checkJs:true});
const dynamic=example('computed-require-in-checked-js',{...experiment,'src/route.js':replace(checked['src/route.js'],'const slug = require("./slug");','const name = "./slug";\nconst slug = require(name);')},{checkJs:true});
const imported={'src/entry.ts':'import handle = require("./route"); export const url=handle("Green Chair");\n',...base};
const excluded=example('imported-route-is-not-outside-program',imported,{checkJs:true},[routeAny,routeCall],['src/entry.ts']);
// Test the actual exclude claim, not merely an explicit files list.
const generated=fs.readdirSync(excluded.dir).find(f=>f.startsWith('tsconfig-check-'));
const excludedConfig=JSON.parse(fs.readFileSync(path.join(excluded.dir,generated),'utf8'));
delete excludedConfig.files;excludedConfig.include=['src/entry.ts'];excludedConfig.exclude=['src/route.js'];
const configPath=path.join(excluded.dir,'tsconfig-excluded.json');fs.writeFileSync(configPath,JSON.stringify(excludedConfig));
const executable=path.join(path.dirname(require.resolve('typescript/package.json')),'bin/tsc');
const listed=cp.spawnSync(process.execPath,[executable,'-p',configPath,'--listFilesOnly'],{encoding:'utf8'});
assert.equal(listed.status,0);assert(listed.stdout.includes(path.join(excluded.dir,'src/route.js')));
const excludedRun=cp.spawnSync(process.execPath,[executable,'-p',configPath,'--pretty','false'],{encoding:'utf8'});
assert.equal(excludedRun.status,1);assert.deepEqual([...excludedRun.stdout.matchAll(/error TS(\d+):/g)].map(m=>Number(m[1])),[7006,2349]);cases++;
const flagSources={'src/typed.ts':'export function identity(value){return value;}\n','src/untyped.js':'module.exports=function identity(value){return value;};\n'};
example('program-wide-noimplicitany-false',flagSources,{checkJs:true,noImplicitAny:false});
example('strict-default-control',flagSources,{checkJs:true},[expected('src/typed.ts','identity(value)',7006),expected('src/untyped.js','identity(value)',7006)]);
example('explicit-strict-false-is-not-overridden',flagSources,{checkJs:true,strict:false,exactOptionalPropertyTypes:false});
// The emitted-object inspection is checked as JS against the same module it inspects.
const inspectProgram=example('printed-module-inspection',{...base,'src/inspect.js':inspect});
function execute(program,code){return cp.spawnSync(process.execPath,['-e',code],{cwd:program.dir,encoding:'utf8'});}
function succeeds(program,code,output=''){const r=execute(program,code);assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),output);}
function fails(program,code,message){const r=execute(program,code);assert.equal(r.status,1);assert(r.stderr.includes('TypeError: '+message),r.stderr);}
function group(name,fn){try{fn();groups++;}catch(e){e.message=name+': '+e.message;throw e;}}
const slugCall='console.log(require("./dist/src/route")(" Green Chair "));';
const sitemapCall='console.log(require("./dist/src/sitemap")([" Green Chair "],()=>"Catalogue footer"));';
group('original-test-and-route',()=>{succeeds(baseline,'require("./tests/slug.test")');succeeds(baseline,slugCall,'/products/green-chair');});
group('converted-test-green-old-route-and-test-fail',()=>{succeeds(incident,'require("./dist/tests/slug.test")');fails(incident,slugCall,'slug is not a function');fails(incident,'require("./tests/slug.require.test")','slug is not a function');});
group('printed-object-and-default-member',()=>succeeds(inspectProgram,'require("./dist/src/inspect")','object\nfunction'));
group('compatible-export-passes-both-tests-and-route',()=>{succeeds(importEquals,'require("./dist/tests/import-equals")','green-chair');succeeds(repairedProgram,'require("./tests/slug.require.test");require("./dist/tests/slug.test");');succeeds(repairedProgram,slugCall,'/products/green-chair');});
group('global-check-repair-runtime',()=>{succeeds(fixed,'require("./tests/slug.require.test");require("./dist/tests/slug.test");');succeeds(fixed,slugCall,'/products/green-chair');succeeds(fixed,sitemapCall,'/products/green-chair\nCatalogue footer');succeeds(fixed,'require("./dist/src/price-label")','12.5');});
group('typed-caller-any-does-not-make-number-valid',()=>fails(inferred,'require("./dist/src/caller")','title.trim is not a function'));
group('failed-scratch-build-breaks-checked-route-and-opted-out-sitemap',()=>{succeeds(experimentEmitted,'require("./dist/tests/slug.test")');fails(experimentEmitted,slugCall,'slug is not a function');fails(experimentEmitted,sitemapCall,'slug is not a function');fails(experimentEmitted,'require("./tests/slug.require.test")','slug is not a function');});
group('sitemap-fails-before-unrelated-footer-work',()=>succeeds(experimentEmitted,'let footerCalls=0; try {require("./dist/src/sitemap")([" Green Chair "],()=>{footerCalls++;return "footer";});} catch(error) {console.log(error.toString());} console.log(footerCalls);','TypeError: slug is not a function\n0'));
group('copied-backfill-is-outside-compiler-not-runtime',()=>{const target=path.join(outside.dir,'dist/scripts/backfill.js');fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(outside.dir,'scripts/backfill.js'),target);fails(outside,'require("./dist/scripts/backfill")','slug is not a function');});
group('included-compatible-backfill-prints-url',()=>succeeds(scriptFixed,'require("./dist/scripts/backfill")','/products/green-chair'));
group('named-member-call-before-and-after',()=>{succeeds(originalMoney,'require("./dist/src/price-label")','12.5');succeeds(convertedMoney,'require("./dist/src/price-label")','12.5');});
group('default-member-repair-fixes-only-that-caller',()=>{succeeds(defaultAccess,slugCall,'/products/green-chair');fails(defaultAccess,sitemapCall,'slug is not a function');fails(defaultAccess,'require("./tests/slug.require.test")','slug is not a function');});
group('computed-require-remains-unconstrained',()=>fails(dynamic,slugCall,'slug is not a function'));
group('five-errors-are-parameters-not-five-proven-bugs',()=>{succeeds(baseline,'console.log(require("./dist/src/sum")(2,3));console.log(require("./dist/src/sum")("Green ","Chair"));console.log(require("./dist/src/lookup")("chair-7"));','5\nGreen Chair\nchair-7');});
assert(fs.readFileSync(path.join(incident.dir,'dist/src/slug.js'),'utf8').includes('exports.default = slug'));
assert(fs.readFileSync(path.join(repairedProgram.dir,'dist/src/slug.js'),'utf8').includes('module.exports = slug'));
assert(fs.readFileSync(path.join(incident.dir,'dist/tests/slug.test.js'),'utf8').includes('__importDefault'));
console.log(`Chapter 24: TypeScript ${version}; ${fences.length} fences (JS/TS/JSON), ${cases} compiler cases, ${groups} runtime groups. PASS.\nFixtures: ${scratch}`);
