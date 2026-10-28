import { AlertTriangle } from 'lucide-react';
import type { Inputs } from '@/lib/defaults';
import { money } from '@/lib/calc';
import { confirmationItems, needsConfirmation, tierComparison } from '@/lib/tiers';
import { useWorkspace } from '@/lib/workspace';
import TierBadge from '@/components/TierBadge';
import { Panel } from '@/components/Financials';

export function TierComparison({ inputs }: { inputs: Inputs }) {
  const rows = tierComparison(inputs);
  return <Panel className="overflow-hidden"><div className="p-5"><h2>Three-tier economics side by side</h2><p className="mt-1 text-xs text-muted-foreground">Calculated from editable assumptions, not confirmed forecasts. Better and Best share the scenario’s logistics inputs; only Best includes its additional front-of-house lines. Good uses its separate pod inputs.</p></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Metric</th>{rows.map(r => <th key={r.tier}><TierBadge tier={r.tier} /></th>)}</tr></thead><tbody>
    <tr><td className="font-medium">Site typology</td>{rows.map(r => <td key={r.tier}>{r.site}</td>)}</tr>
    <tr><td className="font-medium">Total space (includes amenities)</td>{rows.map(r => <td key={r.tier}>{r.sf}</td>)}</tr>
    <tr><td className="font-medium">Startup cost</td>{rows.map(r => <td key={r.tier}>{money(r.startup)}</td>)}</tr>
    <tr><td className="font-medium">Y1 operating break-even revenue</td>{rows.map(r => <td key={r.tier}>{r.breakEvenRevenue === null ? 'No positive contribution margin' : money(r.breakEvenRevenue)}</td>)}</tr>
    <tr><td className="font-medium">Y1 rent ceiling · /month</td>{rows.map(r => <td key={r.tier}>{money(r.rentCeiling)}{r.rentCeiling < 0 && <span className="block text-xs text-rose-700 dark:text-rose-300">Loss even at zero rent</span>}</td>)}</tr>
    <tr><td className="font-medium">Y1 operating profit</td>{rows.map(r => <td key={r.tier}>{money(r.profit)}</td>)}</tr>
  </tbody></table></div><p className="p-5 text-[11px] leading-relaxed text-muted-foreground">{needsConfirmation}. Zero values are placeholders unless explicitly validated. Break-even revenue excludes startup recovery and uses the Y1 contribution margin at the current revenue mix; Best amenity costs are annual fixed costs. Rent ceiling is revenue less non-rent operating costs, divided by 12. These annual-engine outputs are distinct from Scott’s historical ~$500K revenue, ~$8,479/month ceiling and ~$5,563/month target references.</p></Panel>;
}

export function NeedsConfirmation() {
  const { data, active } = useWorkspace();
  const items = confirmationItems(active.inputs, active.metadata, data);
  return <Panel className="p-5"><div className="mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-600" /><h2>{needsConfirmation}</h2></div><p className="mb-4 text-xs text-muted-foreground">{items.length} items need review: active-scenario assumptions, unassigned tiers, unconfirmed weights, site details and missing map coordinates. Entering a number alone does not validate it. Use Assumptions to record sources and validation; use Scorecard and Map for their respective items.</p><div className="flex flex-wrap gap-2">{items.map(item => <span key={item.key} className="rounded-xl border border-dashed border-amber-500 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{item.label}</span>)}</div>{items.length === 0 && <p className="text-sm text-muted-foreground">No outstanding items detected by this checklist. This is not site approval.</p>}</Panel>;
}
