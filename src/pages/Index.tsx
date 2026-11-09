import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, Building2, Users, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/Financials';
import CargoBikeVisual from '@/components/CargoBikeVisual';
import { useWorkspace } from '@/lib/workspace';
import { createExampleModel } from '@/lib/guidedModel';
import { calculateNovember } from '@/lib/novemberBaseline';
import { money } from '@/lib/calc';

export default function Index() {
  const { data, setData } = useWorkspace();
  const navigate = useNavigate();
  const example = createExampleModel();
  const model = calculateNovember(example.inputs);
  const openExample = () => {
    const copy = createExampleModel();
    setData(w => ({ ...w, scenarios: [...w.scenarios, copy], activeId: copy.id }));
    navigate('/model');
  };
  const saved = data.scenarios.filter(s => s.siteId);
  return <div className="mx-auto max-w-5xl space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-xl"><div className="eyebrow">Start with one hub</div><h1 className="mt-3">A clearer path to your next site.</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">See how an example works, then build your own. Start with back-of-house space, fleet and logistics economics. Community-facing uses can wait.</p></div><Button asChild className="h-12 rounded-2xl px-6 font-semibold"><Link to="/model/new"><Plus size={17} className="mr-2" />Model a new site</Link></Button></div>
    <Panel className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/60 px-6 py-4"><span className="text-xs font-semibold uppercase tracking-widest text-teal-800">Example · Scott / B-Line logistics reference</span><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-950">Starting assumptions, not verified actuals</span></div><div className="p-6 sm:p-8"><h2 className="text-2xl">One logistics hub. The essentials first.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">A {Number(example.inputs.nov_area).toLocaleString()} SF reference hub, with Scott’s delivery, promotion, wages and overhead inputs. This is a worked planning example—not a confirmed property or a forecast scaled to a new site.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Annual revenue', model.years[0].revenue], ['Annual operating costs', model.years[0].costs], ['Annual operating result', model.years[0].profit]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-secondary px-5 py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold text-teal-900">{money(Number(value))}</p></div>)}</div><div className="mt-6 grid gap-4 sm:grid-cols-3">{[{ icon: Building2, title: 'Back of house', text: 'Occupancy and receiving space' }, { icon: Bike, title: 'Logistics', text: 'Fleet, wages, overhead and billings' }, { icon: Users, title: 'Front of house', text: 'Deferred · not yet costed' }].map(item => <div key={item.title} className="flex gap-3"><item.icon className="mt-0.5 shrink-0 text-teal-700" size={19} /><div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.text}</p></div></div>)}</div><Button variant="outline" className="mt-7 h-11 rounded-xl border-teal-700 px-5 text-teal-900" onClick={openExample}>Open an editable example <ArrowRight size={15} className="ml-3" /></Button><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Creates an independent copy. Scott operating totals are paired with November fleet procurement assumptions in the editor. No grant award, growth or front-of-house income is inferred.</p></div></Panel>
    <CargoBikeVisual />
    <details className="rounded-2xl border border-border bg-card p-5"><summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">Continue a saved site model <ChevronDown size={16} /></summary><p className="mt-3 text-xs text-muted-foreground">Your existing work is preserved. Choose a model to reopen, or browse the full site library.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{saved.map(s => <button key={s.id} onClick={() => { setData(w => ({ ...w, activeId: s.id })); navigate('/model'); }} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm hover:bg-secondary"><span>{s.name}<span className="mt-1 block text-xs text-muted-foreground">{s.city}</span></span><ArrowRight size={15} className="shrink-0 text-teal-700" /></button>)}</div><Link to="/sites" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-teal-800 underline underline-offset-4">Browse all saved sites <ArrowRight size={13} /></Link></details>
  </div>;
}
