import { Store } from 'lucide-react';
import { Panel } from '@/components/Financials';
import { Textarea } from '@/components/ui/textarea';
import { AssumptionInput } from '@/components/AssumptionInput';
import { useWorkspace } from '@/lib/workspace';
import { frontOfHouseDrivers, novemberFields } from '@/lib/novemberBaseline';

export default function FrontOfHousePlanning() {
  const { active, updateInput } = useWorkspace();
  return <Panel className="space-y-4 p-5">
    <div><h2 className="flex items-center gap-2"><Store size={20} className="text-teal-700 dark:text-teal-300" />Front of house · qualitative cost drivers</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Keep these drivers directional until an operator, operating plan or quote supports a number. Notes save with this scenario and do not change the calculations. Existing numeric figures remain included in the pro forma; zero is unknown, not evidence of free operations.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">{frontOfHouseDrivers.map(driver => <label key={driver.key} className="rounded-2xl bg-secondary p-4"><span className="text-xs font-semibold">{driver.label}</span><Textarea className="mt-3 min-h-28 rounded-xl border-border bg-background text-xs" placeholder={driver.prompt} maxLength={2000} value={String(active.inputs[driver.key] || '')} onChange={e => updateInput(driver.key, e.target.value)} /></label>)}</div>
    <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer text-xs font-semibold">Entered front-of-house revenue figures · still included in totals</summary><p className="mt-3 text-xs text-muted-foreground">These annual revenue inputs are loose assumptions unless validated. Incremental front-of-house costs, if entered in the shared rent, staffing, capex or overhead inputs, also remain included. No new costs or income are inferred from the notes.</p><div className="mt-4 grid gap-5 sm:grid-cols-2">{novemberFields.filter(f => f.group === 'November · Revenue · Front of house').map(field => <AssumptionInput key={field.key} field={field} />)}</div></details>
  </Panel>;
}
