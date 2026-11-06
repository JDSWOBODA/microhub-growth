import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { Panel } from '@/components/Financials';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/lib/workspace';
import { novemberSource } from '@/lib/novemberBaseline';

export default function NovemberBaselineNotice() {
  const { data, setData } = useWorkspace();
  const navigate = useNavigate();
  const scenarios = data.scenarios.filter(s => s.novemberKind).sort((a, b) => Number(Boolean(b.inputs.nov_referenceSource)) - Number(Boolean(a.inputs.nov_referenceSource)));
  return <Panel className="space-y-4 border-teal-700/30 p-5"><div className="flex items-start gap-3"><ClipboardList className="mt-1 shrink-0 text-teal-700" size={20} /><div><div className="eyebrow">{novemberSource}</div><h2 className="mt-2">Logistics-led economics. Qualitative front of house.</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Start with the Logistics-first Good / Better / Best copies, anchored to the existing Scott/B-Line reconstruction—not verified actuals. Front-of-house drivers lead with planning notes; entered figures still affect totals. Original November scenarios and Redd / Alder actual-data cases are preserved. Site priorities, owners and evidence remain in the separate checklist.</p></div></div><div className="flex flex-wrap gap-2">{scenarios.map(s => <Button key={s.id} variant="outline" size="sm" className="h-auto whitespace-normal rounded-xl py-2 text-left text-xs" onClick={() => { setData(w => ({ ...w, activeId: s.id })); navigate('/model'); }}>{s.name}<ArrowRight size={13} className="ml-2 shrink-0" /></Button>)}<Button size="sm" className="rounded-xl text-xs" asChild><Link to="/scorecard">Site feature checklist</Link></Button></div>{!scenarios.length && <p className="text-xs text-muted-foreground">November scenarios have been removed from this workspace; import a saved copy to recover them.</p>}</Panel>;
}
