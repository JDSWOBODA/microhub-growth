import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, ShieldCheck, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Panel } from '@/components/Financials';
import SiteScorecardModal from '@/components/SiteScorecardModal';
import AddScorecardSite from '@/components/AddScorecardSite';
import TierBadge from '@/components/TierBadge';
import { useWorkspace } from '@/lib/workspace';
import { criteriaForSite, scorecardSummary } from '@/lib/siteScorecard';
import { tierCriteria, tierDefinitions, tierForSite, tierOrder, weightsTotal } from '@/lib/tiers';
import type { HubTier } from '@/lib/defaults';

export default function SiteScorecard() {
  const { data, setData } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const addSiteDialog = <AddScorecardSite open={adding} onOpenChange={setAdding} onCreated={id => setParams({ site: id })} />;
  const site = data.sites.find(s => s.id === params.get('site')) ?? data.sites[0];
  if (!site) return <Panel className="p-6"><h1>Start with a candidate site.</h1><p className="my-4 text-sm text-muted-foreground">Add a site before starting the assessment.</p><Button className="rounded-xl" onClick={() => setAdding(true)}>Add site</Button>{addSiteDialog}</Panel>;
  const tier = tierForSite(site);
  const criteria = criteriaForSite(site);
  const summary = scorecardSummary(site.scorecard, tier);
  const gates = tierDefinitions[tier].gates;
  function setTier(value: HubTier) { setData(w => ({ ...w, sites: w.sites.map(s => s.id === site.id ? { ...s, tier: value } : s) })); }
  function setGate(label: string, checked: boolean) { setData(w => ({ ...w, sites: w.sites.map(s => s.id === site.id ? { ...s, scorecard: { answers: {}, ...s.scorecard, gates: { ...s.scorecard?.gates, [label]: checked } } } : s) })); }
  function setWeight(code: string, value: number) { setData(w => ({ ...w, sites: w.sites.map(s => { if (s.id !== site.id) return s; const base = Object.fromEntries(tierCriteria(tier).map(c => [c.code, c.weight])); return { ...s, scorecard: { answers: {}, ...s.scorecard, weights: { ...base, ...s.scorecard?.weights, [code]: value } } }; }) })); }
  function resetWeights() { setData(w => ({ ...w, sites: w.sites.map(s => { if (s.id !== site.id) return s; const rest = { ...s.scorecard }; delete rest.weights; return { ...s, scorecard: s.scorecard ? { answers: {}, ...rest } : undefined }; }) })); }
  const total = weightsTotal(criteria);
  return <div className="mx-auto max-w-2xl space-y-6 py-3 sm:py-8">
    {addSiteDialog}
    <div><div className="eyebrow">One question at a time · tier-aware</div><h1 className="mt-2">Site Scorecard</h1><p className="mt-2 text-sm text-muted-foreground">Assess a candidate site at your own pace. Criteria, gates and weights follow the site’s Good / Better / Best tier from the Oct 28, 2026 Neighborhood Hub Vision.</p></div>
    <Panel className="space-y-6 p-5 sm:p-7">
      <div><label htmlFor="scorecard-site" className="text-xs font-semibold">Candidate site</label><select id="scorecard-site" className="form-select mt-2 block w-full" value={site.id} onChange={e => { if (e.target.value === '__add_site__') setAdding(true); else setParams({ site: e.target.value }); }}>{data.sites.map(s => <option key={s.id} value={s.id}>{s.name} · {s.city}</option>)}<option value="__add_site__">+ Add Site</option></select><p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={14} className="shrink-0" />{site.address || 'Address not entered'}</p></div>
      <div><label htmlFor="scorecard-tier" className="text-xs font-semibold">Hub tier</label><div className="mt-2 flex flex-wrap items-center gap-2">{tierOrder.map(t => <button key={t} id={t === tier ? 'scorecard-tier' : undefined} onClick={() => setTier(t)} className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${tier === t ? 'border-neutral-900 bg-neutral-900 text-[#f6be00]' : 'border-border hover:bg-secondary'}`}>{t}</button>)}<TierBadge tier={site.tier} /></div><p className="mt-2 text-[11px] text-muted-foreground">{tierDefinitions[tier].title} — {tierDefinitions[tier].description}</p></div>
      <div><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{summary.completed} of {criteria.length} questions complete</span><span>{Math.round(summary.progress)}%</span></div><Progress value={summary.progress} aria-label="Overall scorecard completion" className="h-2 rounded-full bg-secondary" /></div>
      {summary.score !== null && <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-secondary px-4 py-3"><span className="text-xs text-muted-foreground">Weighted score · {summary.weight}% of {summary.totalWeight} assessed · {summary.classification}</span><span className="text-lg font-semibold text-teal-900 dark:text-teal-300">{summary.score.toFixed(1)}<span className="text-xs font-normal"> /100</span></span></div>}
      <div className="flex flex-wrap items-center justify-between gap-4"><SiteScorecardModal key={site.id + tier} siteId={site.id} /><Link to="/" className="text-xs font-medium text-teal-800 underline underline-offset-4 dark:text-teal-300">Edit site details</Link></div>
    </Panel>
    <Panel className="space-y-4 p-5 sm:p-7"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-teal-700" /><h2>{tier} tier gates</h2></div><p className="text-xs text-muted-foreground">All gates must pass before a site can advance, regardless of the weighted score. Confirm each gate with evidence.</p><div className="space-y-2">{gates.map(gate => <label key={gate.label} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm"><input type="checkbox" className="mt-0.5 accent-teal-700" checked={Boolean(site.scorecard?.gates?.[gate.label])} onChange={e => setGate(gate.label, e.target.checked)} /><span><span className="font-semibold">{gate.label}</span><span className="block text-xs text-muted-foreground">{gate.detail}</span></span></label>)}</div><p className="text-xs font-medium text-muted-foreground">{summary.gatesPassed} of {summary.gateCount} gates confirmed.</p></Panel>
    <Panel className="space-y-4 p-5 sm:p-7"><div className="flex items-center gap-2"><Scale size={18} className="text-teal-700" /><h2>{tier} tier weights</h2></div><p className="text-xs text-muted-foreground">Weights are editable per tier and must total 100. {total !== 100 && <span className="font-semibold text-amber-700">Current total is {total} — needs confirmation (Franklin / Emi).</span>}{total === 100 && <span className="font-semibold text-teal-700">Total is 100. ✓</span>}</p><div className="space-y-2">{criteria.map(c => <div key={c.code} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 flex-1"><span className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.dimension}</span><span className="block truncate">{c.label}</span></span><Input type="number" min={0} max={100} className="h-8 w-20 rounded-lg" value={c.weight} onChange={e => setWeight(c.code, Math.max(0, Math.min(100, Number(e.target.value))))} /></div>)}</div><div className="flex items-center justify-between"><span className={`text-sm font-semibold ${total === 100 ? 'text-teal-700' : 'text-amber-700'}`}>Total: {total} / 100</span><Button variant="outline" size="sm" className="rounded-lg" onClick={resetWeights}>Reset to tier defaults</Button></div></Panel>
    <p className="text-[11px] leading-relaxed text-muted-foreground">A completed scorecard is not site approval. Unfinished questions are excluded from the score; historical scores and financial assumptions are unchanged. Good-tier weights start at the lean defaults above and can be re-confirmed by Franklin / Emi.</p>
  </div>;
}
