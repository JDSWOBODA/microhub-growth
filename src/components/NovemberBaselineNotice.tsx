import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { Panel } from '@/components/Financials';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/lib/workspace';
import { novemberSource } from '@/lib/novemberBaseline';

export default function NovemberBaselineNotice() {
  const { data, setData } = useWorkspace();
  const navigate = useNavigate();
  const scenarios = data.scenarios.filter(s => s.novemberKind);
  return <Panel className="space-y-4 border-amber-300 p-5"><div className="flex items-start gap-3"><ClipboardList className="mt-1 shrink-0 text-teal-700" size={20} /><div><div className="eyebrow">{novemberSource}</div><h2 className="mt-2">From vision to operating requirements.</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">New Good / Better / Best pro formas and Redd / Alder validation cases preserve existing scenarios. The separate site checklist includes source priorities, Franklin’s explicit adjustments, owners, evidence and outstanding essentials.</p></div></div><div className="flex flex-wrap gap-2">{scenarios.map(s => <Button key={s.id} variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => { setData(w => ({ ...w, activeId: s.id })); navigate('/model'); }}>{s.novemberKind} pro forma <ArrowRight size={13} className="ml-2" /></Button>)}<Button size="sm" className="rounded-xl text-xs" asChild><Link to="/scorecard">Site feature checklist</Link></Button></div>{!scenarios.length && <p className="text-xs text-muted-foreground">November scenarios have been removed from this workspace; import a saved copy to recover them.</p>}</Panel>;
}
