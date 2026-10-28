import { ExternalLink, Map, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/Financials';
import TierMap from '@/components/TierMap';
import { sourceLabel } from '@/lib/sourceReferences';

export default function CascadiaMap() {
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">{sourceLabel}</div><h1 className="mt-2">The Cascadia network.</h1><p className="mt-2 text-sm text-muted-foreground">Original interactive reference · five operator markets · model-tier layer added from the Oct 28, 2026 Neighborhood Hub Vision.</p></div><Button variant="outline" className="action-button" asChild><Link to="/sources"><FileText size={14} />Source scorecard</Link></Button></div>
    <Panel className="flex flex-wrap items-center justify-between gap-4 p-4"><p className="max-w-3xl text-xs leading-relaxed text-muted-foreground"><Map size={15} className="mr-2 inline text-teal-700" />Click cities or table rows for details. Toggle I-5, market overlays and proposed sequencing in the preserved source map below. The coordinate-based tier layer is separate from this preserved reference, not a live GIS feed.</p><Button variant="outline" className="action-button" asChild><a href="/references/cascadia-hub-map.html" target="_blank" rel="noopener noreferrer">Open full map <ExternalLink size={14} /></a></Button></Panel>
    <TierMap />
    <iframe src="/references/cascadia-hub-map.html" title="Interactive Cascadia Hub Map — source snapshot October 7, 2026" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="h-[1400px] w-full rounded-2xl border border-border bg-white sm:h-[1700px]" /><p className="text-[11px] text-muted-foreground">The map's internal scroll keeps all details and the corridor table accessible on any screen. External Google Maps links open only when clicked. Proposed sequencing and Georgetown / South Park remain suggestions, not decisions.</p></div>;
}
