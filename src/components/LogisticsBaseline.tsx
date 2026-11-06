import { useState } from 'react';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/Financials';
import { useWorkspace } from '@/lib/workspace';
import { createLogisticsReference } from '@/lib/logisticsReference';
import { money } from '@/lib/calc';

export default function LogisticsBaseline() {
  const { data, active, setData } = useWorkspace();
  const [sourceId, setSourceId] = useState('csv');
  const reference = String(active.inputs.nov_referenceSource || '');
  const actual = active.novemberKind === 'Redd' || active.novemberKind === 'Alder';
  const create = () => {
    const copy = createLogisticsReference(active, data.scenarios.find(s => s.id === sourceId));
    setData(w => ({ ...w, scenarios: [...w.scenarios, copy], activeId: copy.id }));
  };
  return <Panel className="space-y-4 border-teal-700/30 bg-teal-50/60 p-5 dark:bg-teal-950/20">
    <h2 className="flex items-center gap-2"><Truck size={20} className="text-teal-700 dark:text-teal-300" />Logistics first · source-backed starting point</h2>
    <p className="text-xs leading-relaxed text-muted-foreground">Anchor the cost discussion in existing Scott/B-Line logistics inputs. These are a CSV reconstruction or a saved scenario snapshot—not verified Redd/Alder actuals, an approved budget or a tier-scaled forecast. Good, Better and Best reference copies share these operating inputs until site-specific evidence replaces them.</p>
    {reference ? <>
      <p className="break-words text-xs font-semibold">Source: {reference}</p>
      <div className="grid gap-3 sm:grid-cols-3">{[
        ['Annual wages · delivery + GM + admin', active.inputs.nov_referenceLaborAnnual],
        ['Annual overhead · excludes wages and rent', active.inputs.nov_referenceOverheadAnnual],
        ['Annual occupancy / rent', active.inputs.nov_rent],
      ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-teal-700/15 bg-background p-3"><p className="text-[11px] text-muted-foreground">{label}</p><b className="mt-1 block text-lg">{money(Number(value) || 0)}</b></div>)}</div>
      <p className="text-xs leading-relaxed text-muted-foreground">Annual reference wages work without assumed paid hours or operating weeks. The staffing counts and November capex remain separate planning inputs. Detailed wages, payroll extras, COGS and overhead are additive: enter only incremental amounts, or reduce the reference totals when replacing them. Source and validation remain editable in the Assumptions Log.</p>
    </> : <p className="text-xs font-medium">{actual ? 'Historical cases remain empty until actual data is supplied. Use a separate Logistics-first scenario for reference economics.' : 'Choose one of the Logistics-first scenarios above, or create a separate copy from a saved Scott model below.'}</p>}
    {!actual && <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1 text-xs font-medium">Reference source<select value={sourceId} onChange={e => setSourceId(e.target.value)} className="form-select mt-2 w-full"><option value="csv">Scott · original CSV reconstruction</option>{data.scenarios.filter(s => s.scott).map(s => <option key={s.id} value={s.id}>{s.name} · saved Scott inputs</option>)}</select></label>
      <Button variant="outline" className="h-10 rounded-xl border-teal-700/30 text-xs" onClick={create} disabled={data.scenarios.length >= 500}>Create a separate reference copy</Button>
    </div>}
  </Panel>;
}
