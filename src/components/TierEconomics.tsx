import { AlertTriangle } from 'lucide-react';
import type { Inputs } from '@/lib/defaults';
import { money } from '@/lib/calc';
import { confirmationItems, needsConfirmation, tierComparison } from '@/lib/tiers';
import TierBadge from '@/components/TierBadge';
import { Panel } from '@/components/Financials';

const flag = (ok: boolean, value: string) => ok ? value : `${value} · needs confirmation`;

export function TierComparison({ inputs }: { inputs: Inputs }) {
  const rows = tierComparison(inputs);
  return <Panel className="overflow-hidden"><div className="flex flex-wrap items-end justify-between gap-2 p-5"><div><h2>Three-tier economics side by side</h2><p className="mt-1 text-xs text-muted-foreground">Good / Better / Best · from the Oct 28, 2026 Neighborhood Hub Vision. Unconfirmed values are flagged and default to zero.</p></div><span className="assumption">Editable per tier</span></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Metric</th>{rows.map(r => <th key={r.tier}><TierBadge tier={r.tier} /></th>)}</tr></thead><tbody>
    <tr><td className="font-medium">Example site</td>{rows.map(r => <td key={r.tier}>{r.site}</td>)}</tr>
    <tr><td className="font-medium">Space</td>{rows.map(r => <td key={r.tier}>{r.tier === 'Good' ? `${r.sf} · needs confirmation` : r.sf}</td>)}</tr>
    <tr><td className="font-medium">Startup cost</td>{rows.map(r => <td key={r.tier} className="tabular-nums">{r.startup > 0 ? money(r.startup) : flag(false, '$0')}</td>)}</tr>
    <tr><td className="font-medium">Break-even revenue</td>{rows.map(r => <td key={r.tier} className="tabular-nums">{r.breakEvenRevenue > 0 ? flag(r.tier !== 'Good', money(r.breakEvenRevenue)) : flag(false, '$0')}</td>)}</tr>
    <tr><td className="font-medium">Rent ceiling{<span className="text-[10px] text-muted-foreground"> · /month</span>}</td>{rows.map(r => <td key={r.tier} className="tabular-nums">{r.rentCeiling > 0 ? flag(r.tier === 'Better', money(r.rentCeiling)) : flag(false, '$0')}</td>)}</tr>
  </tbody></table></div><p className="p-5 text-[11px] leading-relaxed text-muted-foreground">Better reflects the active scenario: 4 active + 2 reserve trikes plus an e-van module (~3,000 SF; ~$500K break-even revenue; break-even rent ceiling near $8,479/month, target near $5,563/month). Best adds the active scenario plus front-of-house lines; Good uses the pods inputs. All front-of-house and pod figures are editable and start at zero until Franklin / Emi confirm them.</p></Panel>;
}

export function NeedsConfirmation({ inputs }: { inputs: Inputs }) {
  const items = confirmationItems(inputs);
  return <Panel className="p-5"><div className="mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-600" /><h2>Needs confirmation (Franklin / Emi)</h2></div>{items.length === 0 ? <p className="text-sm text-muted-foreground">Every tier input has a value. Nothing is awaiting confirmation.</p> : <><p className="mb-4 text-xs text-muted-foreground">{items.length} tier input{items.length === 1 ? '' : 's'} are still empty or zero. They do not affect the model until filled in. Edit them on the Good · micro pods and Best · front of house tabs.</p><div className="flex flex-wrap gap-2">{items.map(item => <span key={item.key} className="rounded-xl border border-dashed border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-200" title={needsConfirmation}>{item.label}</span>)}</div></>}</Panel>;
}
