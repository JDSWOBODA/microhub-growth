import { useState } from 'react';
import { Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/Financials';
import { useWorkspace } from '@/lib/workspace';
import { criteriaForSite, validTierWeights } from '@/lib/siteScorecard';
import { needsConfirmation, tierCriteria, tierForSite } from '@/lib/tiers';
import type { Site } from '@/lib/defaults';

export default function TierWeights({ site }: { site: Site }) {
  const { setData } = useWorkspace();
  const tier = tierForSite(site);
  const [draft, setDraft] = useState(() => Object.fromEntries(criteriaForSite(site).map(c => [c.code, c.weight])));
  const total = Object.values(draft).reduce((sum, value) => sum + value, 0);
  const valid = validTierWeights(tier, draft);
  function save() {
    if (!valid) return;
    setData(w => ({ ...w, sites: w.sites.map(s => s.id === site.id ? { ...s, scorecard: { answers: {}, ...s.scorecard, tierWeights: { ...s.scorecard?.tierWeights, [tier]: draft } } } : s) }));
  }
  return <Panel className="space-y-4 p-5 sm:p-7">
    <div className="flex items-center gap-2"><Scale size={18} className="text-teal-700" /><h2>{tier} tier weights</h2></div>
    <p className="text-xs text-muted-foreground">Edit a draft, then save only when the total is 100. Draft changes do not affect scoring. {tier !== 'Better' && needsConfirmation + ': no source weights were supplied.'}</p>
    <div className="space-y-2">{tierCriteria(tier).map(c => <label key={c.code} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 flex-1"><span className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.dimension}</span><span className="block">{c.label}</span></span><Input type="number" min={0} max={100} step="any" className="h-8 w-20 rounded-lg" value={draft[c.code]} onChange={e => { const value = Number(e.target.value); if (Number.isFinite(value) && value >= 0 && value <= 100) setDraft(d => ({ ...d, [c.code]: value })); }} /></label>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><span className={`text-sm font-semibold ${valid ? 'text-teal-700 dark:text-teal-300' : 'text-amber-800 dark:text-amber-300'}`} aria-live="polite">Total: {Number(total.toFixed(4))} / 100</span><div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-lg" onClick={() => setDraft(Object.fromEntries(tierCriteria(tier).map(c => [c.code, c.weight])))}>Reset draft</Button><Button size="sm" className="rounded-lg" disabled={!valid} onClick={save}>Save {tier} weights</Button></div></div>
  </Panel>;
}
