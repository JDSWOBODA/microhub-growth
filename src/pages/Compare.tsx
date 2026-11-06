import { useState } from 'react';
import { useWorkspace } from '@/lib/workspace';
import { Panel, Pnl } from '@/components/Financials';
import ScottFinancials from '@/components/ScottFinancials';
import { calculate, money } from '@/lib/calc';
import { fields, type Scenario } from '@/lib/defaults';
import { calculateScott, modelLabel, scottFields, scottState } from '@/lib/scottModel';
export default function Compare() {
  const { data, active } = useWorkspace();
  const [left,setLeft]=useState(active.id),[right,setRight]=useState(data.scenarios.find(s=>s.id!==active.id)?.id??active.id);
  const a=data.scenarios.find(s=>s.id===left)??active,b=data.scenarios.find(s=>s.id===right)??active;
  const sameModel=(a.model??'annual')===(b.model??'annual') && Boolean(a.inputs.novEnabled) === Boolean(b.inputs.novEnabled);
  function outcomes(s: Scenario) {
    if(s.model==='scott') {const m=calculateScott(scottState(s).inputs);return [money(m.uses),'Not forecast',money(m.afterShare),'Not forecast'];}
    const m=calculate(s.inputs);return [money(m.year1Total),m.breakEven?`Year ${m.breakEven}`:'> 3 years',money(m.years[2].profit),money(m.years[2].cumulative)];
  }
  const labels=a.model==='scott'?['Funding uses · one-time','Operating break-even timing','Annual module profit after share','Cumulative cash forecast']:['Year 1 total cost · USD','Operating break-even','Year 3 profit · USD','Year 3 cumulative cash · USD'];
  const inputFields=a.model==='scott'?scottFields:fields.filter(f => a.inputs.novEnabled ? f.key.startsWith('nov') || f.key === 'hubTier' : !f.key.startsWith('nov'));
  const ai=a.model==='scott'?scottState(a).inputs:a.inputs,bi=b.model==='scott'?scottState(b).inputs:b.inputs;
  return <div className="space-y-6"><div><div className="eyebrow">Better decisions, side by side</div><h1 className="mt-2">Compare the possibilities.</h1><p className="mt-2 text-sm text-muted-foreground">Each scenario uses its selected calculation model.</p></div><div className="grid gap-5 md:grid-cols-2">{[a,b].map((s,i)=><Panel key={i} className="p-5"><label className="text-xs text-muted-foreground">Scenario {i===0?'A':'B'}<select className="form-select mt-2 w-full font-semibold" value={s.id} onChange={e=>(i===0?setLeft:setRight)(e.target.value)}>{data.scenarios.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><p className="mt-3 text-xs font-semibold text-teal-800">{modelLabel(s)}</p></Panel>)}</div>
    {(a.inputs.novEnabled || b.inputs.novEnabled) && <Panel className="p-4 text-xs text-amber-950 dark:text-amber-200">November baselines and Redd/Alder cases contain unconfirmed inputs. Zero wages, rent or revenue are not actual results. Y3 repeats the entered annual state and is not a confirmed maturity forecast.</Panel>}
    {a.id===b.id&&<p className="text-xs text-amber-800">Both selections are the same scenario. Duplicate it to test changes.</p>}
    {!sameModel?<Panel className="p-5 text-xs text-amber-900">These models use different output definitions. View their results below; no equivalent-cost or profit comparison is implied.</Panel>:<Panel className="overflow-x-auto"><table className="data-table"><thead><tr><th>Calculated outcome</th><th>{a.name}</th><th>{b.name}</th></tr></thead><tbody>{labels.map((label,i)=><tr key={label}><td>{label}</td><td>{outcomes(a)[i]}</td><td>{outcomes(b)[i]}</td></tr>)}</tbody></table></Panel>}
    <div className={`grid gap-5 ${sameModel&&a.model!=='scott'?'xl:grid-cols-2':''}`}>{[a,b].map((s,i)=><div key={i}>{s.model==='scott'?<ScottFinancials scenario={s}/>:<><h2 className="mb-3">{s.name} · {modelLabel(s)}</h2><Pnl inputs={s.inputs}/></>}</div>)}</div>
    {sameModel&&<Panel className="overflow-x-auto"><h2 className="p-5">Different assumptions</h2><table className="data-table"><thead><tr><th>Input</th><th>{a.name}</th><th>{b.name}</th></tr></thead><tbody>{inputFields.filter(f=>ai[f.key]!==bi[f.key]).map(f=><tr key={f.key}><td>{f.label}</td><td>{String(ai[f.key])} {f.unit}</td><td>{String(bi[f.key])} {f.unit}</td></tr>)}</tbody></table>{inputFields.every(f=>ai[f.key]===bi[f.key])&&<p className="px-5 pb-5 text-xs text-muted-foreground">All inputs are identical.</p>}</Panel>}
  </div>;
}
