import { AlertTriangle } from 'lucide-react';
import type { Scenario } from '@/lib/defaults';
import { planningFlags } from '@/lib/guidedModel';

export default function PlanningStatus({ scenario }: { scenario: Scenario }) {
  const flags = planningFlags(scenario);
  return <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"><p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} className="shrink-0" />Provisional plan · evidence still required</p><p>{flags.missing.length ? `Missing logistics assumptions: ${flags.missing.map(q => q.label).join(', ')}. Blank amounts calculate as zero and may overstate viability.` : 'Core logistics amounts supplied; verify complete cost coverage, sources, lease terms and site suitability before relying on results.'}</p><p>{flags.foh}. Shared costs and any numeric front-of-house entries remain included; deferring planning does not remove entered amounts.</p></div>;
}
