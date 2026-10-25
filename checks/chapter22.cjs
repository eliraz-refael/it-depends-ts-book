'use strict';
// Manuscript-derived audit, rule and template programs; fixture-only readers implement the stated boundary.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {compile,describe,version}=require('./compiler.cjs');
const text=fs.readFileSync(path.resolve(__dirname,'../book/03-patterns-and-design/09-config-to-function.md'),'utf8');
const fences=[...text.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1]);const used=new Set();
function block(prefix){const matches=fences.map((s,i)=>({s,i})).filter(x=>x.s.startsWith(prefix));
 assert.equal(matches.length,1,'Unique prefix: '+prefix);used.add(matches[0].i);return matches[0].s+'\n';}
function before(s,at){const i=s.indexOf(at);assert(i>=0,'Split: '+at);return s.slice(0,i);}
function replace(s,a,b){assert.equal(s.split(a).length,2,'Unique replacement: '+a);return s.replace(a,b);}
const opening=block('type Order ='),loss=block('console.log(JSON.stringify(active))'),json=block('type Json =');
const record=block('const parameters ='),params=block('type Params ='),conditions=block('type Condition =');
const rule=block('const large:'),evaluation=block('function evaluate('),template=block('type Template =');
const samples=block('const samples:'),wrongRule=block('const tooBroad:'),load=block('declare function readSavedTemplate');
assert.equal(used.size,fences.length,'All fences extracted');
const jsonType=before(json,'const savedPolicy:');
const common=opening+params+conditions+rule+evaluation+template;
const all=common+samples+wrongRule;
const types=before(opening,'function holds(')+before(params,'const params:')+conditions+before(template,'const selected:');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch22-'));
fs.symlinkSync(path.resolve(__dirname,'../node_modules'),path.join(scratch,'node_modules'),'dir');
let cases=0,groups=0;
function example(name,source,codes=[]){
 const dir=path.join(scratch,name);fs.mkdirSync(dir);const file=path.join(dir,'main.ts');source='export {};\n'+source;
 fs.writeFileSync(file,source);const lines=source.split('\n').flatMap((line,i)=>line.includes('// Error TS')?[i+1]:[]);
 assert.equal(lines.length,codes.length,'Error markers: '+name);
 const outDir=path.join(dir,'out'),result=compile([file],{outDir},dir);
 assert.deepEqual(result.diagnostics.map(d=>({file:d.fileName,line:d.line,code:d.code})),
  lines.map((line,i)=>({file,line,code:codes[i]})),name+'\n'+describe(result.diagnostics));
 cases++;return {name,file:path.join(outDir,'main.js'),diagnostics:result.diagnostics};
}
const first=example('printed-incident',opening+loss+'export {active,holds,order,restored};');
const jsonError=example('json-rejects-visible-callback',opening+json,[2322]);
assert(jsonError.diagnostics[0].message.includes("Property 'extraHold' is incompatible with index signature."));
const repaired=example('printed-versioned-record',opening+jsonType+record+'export {auditRecord,evaluators,reviewV2,parameters,order};');
const widenedKey=example('record-name-needs-literal-key',opening+jsonType+replace(
 replace(record,'} as const satisfies Json;','} satisfies Json;'),
 'console.log(evaluators[auditRecord.evaluator](',
 'console.log(evaluators[auditRecord.evaluator]( // Error TS7053'),[7053]);
assert(widenedKey.diagnostics[0].message.includes("expression of type 'string' can't be used to index"));
const data=example('printed-rule',opening+params+conditions+rule+evaluation+'export {ruleHold,rule,order,matches,evaluate};');
const named=example('printed-template',opening+params+template+'export {templateHold,selected,order,evaluateTemplate};');
const compared=example('printed-comparison-and-wrong-rule',all+'export {samples,expected,rule,selected,params,tooBroad,ruleHold,templateHold,evaluate,evaluateTemplate,matches};');
const loaded=example('printed-loaded-callable',common+load+'export {evaluateOrder,loaded,order,selected};');
const requiredKind=example('new-kind-needs-handler',before(opening,'function holds(')+replace(
 replace(conditions,'type Condition =','type Condition =\n  | { kind: "newAccount"; days: number }'),
 'const missing: never = condition;','const missing: never = condition; // Error TS2322'),[2322]);
assert(requiredKind.diagnostics[0].message.includes("Type '{ kind: \"newAccount\"; days: number; }' is not assignable to type 'never'."));
example('code-condition-needs-window',types+'const old: Condition = { kind: "refundsAbove", count: 2 }; // Error TS2322\n',[2322]);
example('code-parameters-need-window',types+'const old: Params = { amount: 500, country: "FR", count: 2 }; // Error TS2741\n',[2741]);
const stale=example('asserted-stored-template-is-not-checked',common+`
const stored='{"version":1,"id":"review-hold","name":"country-velocity","params":{"amount":500,"country":"FR","count":2}}';
const staleTemplate=JSON.parse(stored) as Template;
export {staleTemplate,order,evaluateTemplate};
`);
const hidden=example('json-boundary-does-not-remove-hidden-callback',opening+jsonType+`
const narrower:{reviewAbove:number}=active;
const accepted:Json=narrower;
export {accepted};
`);
const wrongCode=example('wrong-boolean-code-also-compiles',all+`
function tooBroadInCode(order:Order):Decision{
 const large=order.total>params.amount;
 const country=order.country===params.country;
 const velocity=order.refundDaysAgo.filter(age=>age<=params.days).length>params.count;
 const hold=large||country||velocity;
 return {hold,reasons:hold?[rule.id]:[]};
}
export {tooBroadInCode,samples,expected};
`);
example('template-name-is-a-closed-set',opening+params+template+`
const other:Template={...selected,name:'large-and-country-or-velocity'}; // Error TS2820
`,[2820]);
const later=example('later-authoring-keeps-named-input',common+`
type Configuration=Rule|Template;
function toFunction(config:Configuration):(order:Order)=>Decision {
 return 'when' in config?order=>evaluate(config,order):order=>evaluateTemplate(config,order);
}
const third:Rule={version:2,id:rule.id,when:{kind:'all',conditions:[
 {kind:'totalAbove',amount:params.amount},
 {kind:'any',conditions:[{kind:'country',code:params.country},{kind:'refundsAbove',count:params.count,days:params.days}]},
]}};
const oldConsumer:(order:Order)=>Decision=toFunction(selected);
export {third,toFunction,oldConsumer};
`);
// These readers are fixture implementations of the existing declared reader and the rule reader
// described in dialogue. They are not extra manuscript code or a claim about a production editor.
const readers=example('fixture-versioned-readers',types+`
import {z} from 'zod';
const amount=z.number().finite().nonnegative(),count=z.number().int().nonnegative();
const days=z.number().int().positive(),country=z.string().min(1);
const condition:z.ZodType<Condition>=z.lazy(()=>z.discriminatedUnion('kind',[
 z.object({kind:z.literal('totalAbove'),amount}),
 z.object({kind:z.literal('country'),code:country}),
 z.object({kind:z.literal('refundsAbove'),count,days}),
 z.object({kind:z.literal('all'),conditions:z.array(condition)}),
 z.object({kind:z.literal('any'),conditions:z.array(condition)}),
]));
const names=z.enum(['country-velocity','large-or-country-velocity']);
const paramShape={amount,country,count};
const templateShape={id:z.string(),name:names};
const TemplateV1=z.object({version:z.literal(1),id:z.string(),name:z.literal('country-velocity'),params:z.object(paramShape).strict()});
const TemplateV2=z.object({version:z.literal(2),...templateShape,params:z.object({...paramShape,days})});
// The tree is a new proposal, not a deployed version-1 format.
const RuleV2=z.object({version:z.literal(2),id:z.string(),when:condition});
export function readSavedTemplate(input:unknown):Template{
 const parsed=z.union([TemplateV1,TemplateV2]).parse(input);
 return {...parsed,version:2,params:{...parsed.params,days:parsed.version===1?7:parsed.params.days}};
}
export function readSavedRule(input:unknown):Rule{
 return RuleV2.parse(input);
}
`);
function capture(program,fn){const output=[],log=console.log;
 try{console.log=(...args)=>output.push(args);delete require.cache[program.file];const m=require(program.file);return fn(m,output);}
 finally{console.log=log;}}
function group(name,fn){try{fn();groups++;}catch(e){e.message=name+': '+e.message;throw e;}}
const reader=require(readers.file),copy=x=>JSON.parse(JSON.stringify(x));
const initialPrint=[true],decisionPrint=[JSON.stringify({hold:true,reasons:['review-hold']})];
let model;
group('printed-incident-and-indistinguishable-policy-records',()=>capture(first,(m,out)=>{
 assert.deepEqual(out,[initialPrint,['{"reviewAbove":500}'],[true],[false]]);
 assert.equal(m.holds(m.active,m.order),true);assert.equal(m.holds({reviewAbove:500},m.order),false);
 assert.equal(JSON.stringify(m.active),JSON.stringify({reviewAbove:500}));assert.equal('extraHold'in m.restored,false);
}));
group('hidden-function-remains-at-runtime',()=>capture(hidden,(m)=>{
 assert.equal(typeof m.accepted.extraHold,'function');assert.equal(JSON.stringify(m.accepted),'{"reviewAbove":500}');
}));
group('printed-repaired-record-and-historical-code',()=>capture(repaired,(m,out)=>{
 assert.deepEqual(out,[[true],[true]]);const log=copy(m.auditRecord);
 assert.equal(m.evaluators[log.evaluator](log.parameters,log.input),log.held);
 // Retaining review-2, rather than invoking the new default, is what makes the old record reproducible.
 const versions={...m.evaluators,'review-3':()=>false};
 assert.equal(versions['review-3'](),false);assert.equal(versions[log.evaluator](log.parameters,log.input),true);
 assert.equal(typeof log.parameters,'object');assert.equal(log.input.refundDaysAgo[2],7);
}));
group('printed-rule-output',()=>capture(data,(m,out)=>{
 assert.deepEqual(out,[initialPrint,decisionPrint]);assert.deepEqual(m.ruleHold(m.order),{hold:true,reasons:['review-hold']});
}));
group('printed-template-output',()=>capture(named,(m,out)=>{
 assert.deepEqual(out,[initialPrint,decisionPrint]);assert.deepEqual(m.templateHold(m.order),{hold:true,reasons:['review-hold']});
}));
group('printed-eight-order-comparison-and-error-count',()=>capture(compared,(m,out)=>{
 model=m;assert.deepEqual(out,[initialPrint,decisionPrint,decisionPrint,[5],[true],[2]]);
 assert.equal(m.samples.length,8);assert.deepEqual(m.samples.map(o=>m.ruleHold(o).hold),m.expected);
 assert.deepEqual(m.samples.map(m.ruleHold),m.samples.map(m.templateHold));
 assert.deepEqual(m.samples.filter(o=>m.ruleHold(o).hold).map(o=>o.id),['sample-1','sample-4','sample-5','sample-6','sample-7']);
}));
group('shared-replay-rejects-both-wrong-combinations',()=>capture(wrongCode,(m)=>{
 const gate=fn=>{const errors=model.samples.filter((o,i)=>fn(o).hold!==model.expected[i]);
  if(errors.length)throw new Error(errors.map(o=>o.id).join(','));return fn;};
 const wrongData=o=>model.evaluate(model.tooBroad,o);
 assert.deepEqual(model.samples.map(wrongData),model.samples.map(m.tooBroadInCode));
 assert.throws(()=>gate(wrongData),/sample-0,sample-3/);assert.throws(()=>gate(m.tooBroadInCode),/sample-0,sample-3/);
 assert.equal(gate(model.ruleHold),model.ruleHold);assert.equal(gate(model.templateHold),model.templateHold);
}));
group('old-campaign-reader-preserves-seven-day-window',()=>{
 const oldTemplate={...copy(model.selected),version:1,name:'country-velocity'};delete oldTemplate.params.days;
 const migrated=reader.readSavedTemplate(oldTemplate);
 assert.deepEqual(migrated,{...model.selected,name:'country-velocity'});
 assert.deepEqual(model.samples.filter(o=>model.evaluateTemplate(migrated,o).hold).map(o=>o.id),['sample-1','sample-5']);
 assert.throws(()=>reader.readSavedTemplate({...oldTemplate,params:{...oldTemplate.params,days:14}}));
 assert.throws(()=>reader.readSavedTemplate({...oldTemplate,name:'large-or-country-velocity'}));
 assert.throws(()=>reader.readSavedTemplate({...oldTemplate,version:2}));
 assert.throws(()=>reader.readSavedTemplate({...oldTemplate,version:99}));
 const brokenRule=copy(model.rule);delete brokenRule.when.conditions[1].conditions[1].days;
 assert.throws(()=>reader.readSavedRule(brokenRule));
 assert.throws(()=>reader.readSavedRule({...model.rule,version:1}));
 assert.throws(()=>reader.readSavedRule({...model.rule,version:99}));
});
group('assertion-on-stored-template-silently-loses-match',()=>capture(stale,(m)=>{
 assert.deepEqual(m.evaluateTemplate(m.staleTemplate,m.order),{hold:false,reasons:[]});
 assert.deepEqual(m.evaluateTemplate(reader.readSavedTemplate(m.staleTemplate),m.order),{hold:true,reasons:['review-hold']});
}));
group('history-first-regrouping-drops-total-and-restricts-refunds',()=>capture(first,(m)=>{
 const ids=fn=>model.samples.filter(fn).map(o=>o.id);
 // The incident's live hook was total OR velocity, with no country condition.
 assert.deepEqual(ids(o=>m.holds(m.active,o)),['sample-1','sample-3','sample-4','sample-5','sample-6','sample-7']);
 const campaign={...model.selected,name:'country-velocity'};
 assert.deepEqual(ids(o=>model.evaluateTemplate(campaign,o).hold),['sample-1','sample-5']);
 // The second regrouping restores large totals globally, but keeps the FR restriction on velocity.
 assert.deepEqual(ids(o=>model.templateHold(o).hold),['sample-1','sample-4','sample-5','sample-6','sample-7']);
}));
group('invalid-reader-inputs-rejected',()=>{
 for(const bad of [null,{}, {...model.selected,name:'unregistered'}, {...model.selected,params:{...model.params,days:0}},
  {...model.selected,params:{...model.params,count:-1}}, {...model.selected,params:{...model.params,amount:NaN}}])assert.throws(()=>reader.readSavedTemplate(bad));
 assert.throws(()=>reader.readSavedRule({...model.rule,when:{kind:'newAccount',days:7}}));
});
group('printed-reader-to-callable',()=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'readSavedTemplate');
 try{globalThis.readSavedTemplate=reader.readSavedTemplate;capture(loaded,(m,out)=>{
  assert.deepEqual(out,[initialPrint,decisionPrint,decisionPrint,[true]]);
  assert.deepEqual(m.loaded,m.selected);assert.equal(m.evaluateOrder(m.order).hold,true);
 });}finally{if(prior)Object.defineProperty(globalThis,'readSavedTemplate',prior);else delete globalThis.readSavedTemplate;}
});
group('parameter-edits-remain-available-in-both',()=>{
 for(const p of [{...model.params,amount:501},{...model.params,count:3},{...model.params,country:'US'},{...model.params,days:6}]){
  const rule=copy(model.rule);rule.when.conditions[0].amount=p.amount;
  rule.when.conditions[1].conditions[0].code=p.country;
  Object.assign(rule.when.conditions[1].conditions[1],{count:p.count,days:p.days});
  const parsedRule=reader.readSavedRule(rule),parsedTemplate=reader.readSavedTemplate({...model.selected,params:p});
  for(const order of model.samples)assert.deepEqual(model.evaluate(parsedRule,order),model.evaluateTemplate(parsedTemplate,order));
 }
});
group('three-of-eight-samples-change-with-new-template',()=>{
 const old={...model.selected,name:'country-velocity'};
 const extra=model.samples.filter(o=>!model.evaluateTemplate(old,o).hold&&model.templateHold(o).hold);
 assert.deepEqual(extra.map(o=>o.id),['sample-4','sample-6','sample-7']);
 assert.deepEqual(model.samples.map(model.templateHold),model.samples.map(model.ruleHold));
 assert(text.includes("Three of Gil's eight samples."));
});
group('serialized-rule-and-template-audit-replay',()=>{
 const registry={
  'rules-2':(policy,order)=>model.evaluate(reader.readSavedRule(policy),order),
  'templates-2':(policy,order)=>model.evaluateTemplate(reader.readSavedTemplate(policy),order),
 };
 let count=0;
 for(const [artifact,policy]of [['rules-2',model.rule],['templates-2',model.selected]])for(const input of model.samples){
  const record=copy({artifact,policy,input,decision:registry[artifact](policy,input)});
  assert.deepEqual(registry[record.artifact](record.policy,record.input),record.decision);count++;
 }
 assert.equal(count,16);
});
group('later-authoring-retains-named-records-and-consumers',()=>capture(later,(m)=>{
 const old=reader.readSavedTemplate(copy(model.selected));
 assert.deepEqual(model.samples.map(m.toFunction(old)),model.samples.map(model.templateHold));
 const third=reader.readSavedRule(copy(m.third));assert.throws(()=>reader.readSavedTemplate(third));
 assert.deepEqual(model.samples.filter(o=>m.toFunction(third)(o).hold).map(o=>o.id),['sample-4','sample-5','sample-7']);
 assert.deepEqual(model.samples.map(m.oldConsumer),model.samples.map(model.templateHold));
}));
group('fictional-census-categories-and-printed-counts',()=>{
 const requests=[
  ['operation','add refund velocity to total check'],
  ['combination','replace total OR velocity with country AND velocity'],
  ['parameter','refundDays 7 to 14 (version 2 exposes the window)'],['parameter','refundDays 14 to 7'],
  ['parameter','amount 500 to 450'],['parameter','amount 450 to 500'],
  ['parameter','count 2 to 3'],['parameter','count 3 to 2'],
  ['combination','large OR (country AND velocity), current request'],
 ];
 const totals=requests.reduce((acc,[kind])=>{acc[kind]++;return acc;},{parameter:0,combination:0,operation:0});
 assert.deepEqual(totals,{parameter:6,combination:2,operation:1});
 for(const row of ['| 6 | Parameter values |','| 2 | Existing conditions, new grouping |','| 1 | New condition |'])assert(text.includes(row));
 // This is a fictional request ledger. No inference about the right editor trigger is tested or made.
});
console.log(`Chapter 22: TypeScript ${version}; ${fences.length} fences; ${cases} compiler cases; ${groups} runtime groups; PASS`);
console.log(`Fixtures: ${scratch}`);
