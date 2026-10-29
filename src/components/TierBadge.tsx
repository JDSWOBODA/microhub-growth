import type { HubTier } from '@/lib/defaults';
import { tierDefinitions } from '@/lib/tiers';

const styles: Record<HubTier, string> = {
  Good: 'bg-amber-300 text-amber-950 border-amber-400',
  Better: 'bg-neutral-900 text-amber-300 border-neutral-900',
  Best: 'bg-neutral-950 text-white border-neutral-600',
};

export default function TierBadge({ tier, className = '' }: { tier?: HubTier; className?: string }) {
  if (!tier) return <span className={`inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ${className}`}>Untiered</span>;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[tier]} ${className}`}>{tier} · {tierDefinitions[tier].scale}</span>;
}
