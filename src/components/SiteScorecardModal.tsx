import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { answerComplete, criteriaForSite, criterionPrompts, scorecardSummary, type ScorecardAnswer } from '@/lib/siteScorecard';
import { tierForSite } from '@/lib/tiers';
import { useWorkspace } from '@/lib/workspace';
import { toast } from 'sonner';

export default function SiteScorecardModal({ siteId }: { siteId: string }) {
  const { data, setData } = useWorkspace();
  const site = data.sites.find(s => s.id === siteId)!;
  const tier = tierForSite(site);
  const criteria = criteriaForSite(site);
  const summary = scorecardSummary(site.scorecard, tier);
  const firstIncomplete = criteria.findIndex(c => !answerComplete(site.scorecard?.answers[c.code]));
  const [question, setQuestion] = useState(firstIncomplete < 0 ? 0 : firstIncomplete);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const criterion = criteria[Math.min(question, criteria.length - 1)];
  const answer = site.scorecard?.answers[criterion.code];
  const complete = answerComplete(answer);
  function update(patch: Partial<ScorecardAnswer>) {
    setData(w => ({ ...w, sites: w.sites.map(s => s.id === siteId ? { ...s, scorecard: { ...s.scorecard, answers: { ...s.scorecard?.answers, [criterion.code]: { evidence: '', ...s.scorecard?.answers[criterion.code], ...patch } } } } : s) }));
  }
  function close(later: boolean) {
    setOpen(false);
    setClosing(false);
    toast.success(later ? 'Draft saved locally. Resume whenever you’re ready.' : 'Scorecard saved locally. Unanswered questions remain incomplete.');
  }
  return <>
    <Button className="rounded-xl px-5 font-semibold" onClick={() => { setClosing(false); setOpen(true); }}>{summary.completed === criteria.length ? 'Review scorecard' : site.scorecard ? 'Continue scorecard' : 'Start scorecard'}<ArrowRight size={15} className="ml-2" /></Button>
    <Dialog open={open} onOpenChange={value => { if (!value) setClosing(true); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-2xl border-border bg-background p-5 shadow-xl sm:max-w-xl sm:p-7" onPointerDownOutside={event => { event.preventDefault(); setClosing(true); }} onEscapeKeyDown={event => { event.preventDefault(); setClosing(true); }}>
        {closing ? <>
          <DialogHeader className="pr-5 text-left"><DialogTitle className="text-xl leading-snug">Save and close?</DialogTitle><DialogDescription className="pt-2 leading-relaxed">Your answers and evidence are already saved in this browser. You can close now and return at any time.</DialogDescription></DialogHeader>
          <div className="rounded-xl bg-secondary p-4 text-sm"><p className="font-semibold">{site.name}</p><p className="mt-1 text-xs text-muted-foreground">{summary.completed} of {criteria.length} questions complete. Closing does not mark unfinished questions as complete.</p></div>
          <div className="flex flex-col gap-2"><Button className="rounded-xl" onClick={() => close(false)}><Save size={15} className="mr-2" />Close and save</Button><Button variant="outline" className="rounded-xl border-border" onClick={() => close(true)}>Close and finish later</Button><Button variant="ghost" className="rounded-xl text-muted-foreground" onClick={() => setClosing(false)}>Keep scoring</Button></div>
        </> : <>
          <DialogHeader className="pr-5 text-left"><p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">{tier} tier · {criterion.dimension} · Question {question + 1} of {criteria.length}</p><DialogTitle className="pt-2 text-xl leading-snug">{criterion.label}</DialogTitle><DialogDescription className="pt-2 text-xs leading-relaxed">{criterionPrompts[criterion.code] ?? 'Record your observation and the evidence that supports this rating.'}</DialogDescription></DialogHeader>
          <div><div className="mb-2 flex justify-between gap-2 text-[11px] text-muted-foreground"><span className="truncate">{site.name}</span><span className="shrink-0">{summary.completed}/{criteria.length} complete</span></div><Progress value={summary.progress} aria-label="Scorecard completion" className="h-1.5 bg-secondary" /></div>
          <fieldset><legend className="text-xs font-semibold">How well does the site fit?</legend><div className="mt-2 grid grid-cols-3 gap-2">{([0, 1, 2] as const).map(rating => <Button key={rating} variant="outline" aria-pressed={answer?.rating === rating} onClick={() => update({ rating })} className={`h-auto flex-col gap-1 rounded-xl px-2 py-3 text-xs ${answer?.rating === rating ? 'border-teal-700 bg-teal-700 text-white hover:bg-teal-800 hover:text-white' : 'border-border bg-white dark:bg-background'}`}><span className="text-lg font-semibold">{rating}</span>{['Poor fit', 'Partial fit', 'Strong fit'][rating]}</Button>)}</div>{answer?.rating !== undefined && <button className="mt-2 rounded text-[11px] text-muted-foreground underline underline-offset-2" onClick={() => update({ rating: undefined })}>Clear rating</button>}</fieldset>
          <div><label htmlFor="scorecard-evidence" className="text-xs font-semibold">Evidence note or source <span className="font-normal text-muted-foreground">· required</span></label><Textarea id="scorecard-evidence" className="mt-2 min-h-[100px] rounded-xl border-border bg-white text-sm dark:bg-background" maxLength={10000} placeholder="What supports your rating? Add an observation or source link." value={answer?.evidence ?? ''} onChange={e => update({ evidence: e.target.value })} /><p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground" aria-live="polite">{complete && <Check size={13} className="text-teal-700" />}{complete ? 'Question complete · saved locally' : 'A rating and evidence are needed to complete this question.'}</p></div>
          <div className="flex justify-between gap-3 border-t border-border pt-4"><Button variant="outline" className="action-button" disabled={question === 0} onClick={() => setQuestion(q => q - 1)}><ArrowLeft size={14} />Back</Button>{question < criteria.length - 1 ? <Button className="rounded-xl text-xs" onClick={() => setQuestion(q => q + 1)}>{complete ? 'Next question' : 'Skip for now'}<ArrowRight size={14} className="ml-2" /></Button> : <Button className="rounded-xl text-xs" onClick={() => setClosing(true)}>Save and close<Save size={14} className="ml-2" /></Button>}</div>
          <button className="mx-auto rounded text-xs text-muted-foreground underline underline-offset-4" onClick={() => setClosing(true)}>Close / finish later</button>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
