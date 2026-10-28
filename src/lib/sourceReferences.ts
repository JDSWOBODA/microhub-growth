import { seattleRent } from './seattleRents';
import type { Site } from './defaults';
export const snapshotDate = '2026-10-07';
export const sourceLabel = 'Source snapshot · October 7, 2026';
export const criteria = [
  ['1a', 'Occupancy economics', 'Rent vs. ceiling (auto)', 12], ['1b', 'Occupancy economics', 'Space-deal flexibility', 6],
  ['2a', 'Demand and density', 'Delivery density and stem time', 8], ['2b', 'Demand and density', 'Anchor customers and commitments', 8], ['2c', 'Demand and density', 'Customer mix and promo upside', 3],
  ['3a', 'Site and operations', 'Zoning and permitted use', 6], ['3b', 'Site and operations', 'Size and layout fit (auto)', 5], ['3c', 'Site and operations', 'Loading and curb', 4], ['3d', 'Site and operations', 'Power and charging readiness', 3], ['3e', 'Site and operations', 'Throughput headroom vs. building', 4], ['3f', 'Site and operations', 'Single-level operation', 3], ['3g', 'Site and operations', 'Cold-chain readiness', 3],
  ['4a', 'Network and safety', 'Bike and low-speed network access', 6], ['4b', 'Network and safety', 'Route safety and terrain', 4], ['4c', 'Network and safety', 'Freight access for feeder vans', 3],
  ['5a', 'Policy and partners', 'Policy alignment', 6], ['5b', 'Policy and partners', 'Public or partner champion', 5], ['5c', 'Policy and partners', 'Funding eligibility', 3],
  ['6a', 'Community and scale', 'Community co-benefit and co-location', 4], ['6b', 'Community and scale', 'Network and replicability', 4],
].map(([code, dimension, label, weight]) => ({ code: String(code), dimension: String(dimension), label: String(label), weight: Number(weight) }));
export const moduleEconomics = { deliveryRevenue: 400000, promotionRevenue: 100000, deliveryLabor: 240000, nonRentOpex: 158250, rent: 90000, sf: 3000, profitShare: 20, targetMargin: 7 };
export function occupancyCeilings() {
  const e = moduleEconomics;
  const revenue = e.deliveryRevenue + e.promotionRevenue;
  const contribution = revenue - e.deliveryLabor - e.nonRentOpex;
  const target = contribution - revenue * e.targetMargin / 100;
  return { revenue, contribution, breakEvenMonthly: contribution / 12, targetMonthly: target / 12, targetAnnual: target, beforeShare: contribution - e.rent, afterShare: (contribution - e.rent) * (1 - e.profitShare / 100) };
}
export type SourceSite = { id: string; name: string; city: string; sf: number | null; annualRent: number | null; monthlyRent?: number; score: number | null; coverage?: number; ratings?: Record<string, number>; market: string; source: string; confidence: string; updated: string | null; notes: string; physical?: number; supported?: number; demand?: number; decision?: string; requiredRate?: number; loading?: string; power?: string };
export const sourceSites: SourceSite[] = [
  { id: 'sodo', name: 'SODO logistics hub', city: 'Seattle', sf: 2000, annualRent: 15.5, score: 70, coverage: 61, market: 'Seattle', source: 'Microhub viability scorecard · Seattle desk estimates from Oct 5–7, 2026', confidence: 'Assumed (desk)', updated: null, ratings: { '1a': 2, '2a': 1, '2b': 2, '2c': 1, '3b': 1, '4c': 2, '5a': 1, '5b': 2, '5c': 1, '6a': 0, '6b': 1 }, notes: 'About 2,000 SF, logistics-only. $15.50 is the midpoint of the $12–19/SF/year observed range, not a parcel quote. NNN/CAM is blank. Confirm zoning, loading, power, bike routes and anchor commitments.' },
  { id: 'stadium', name: 'Stadium District back of house', city: 'Seattle', sf: null, annualRent: null, score: 64, coverage: 36, market: 'Seattle', source: 'Microhub viability scorecard · Oct 5–7 desk estimates', confidence: 'Assumed (desk)', updated: null, ratings: { '2a': 2, '2b': 0, '2c': 2, '4c': 2, '5a': 1, '6a': 1, '6b': 2 }, notes: 'Utah Ave S near T-Mobile Park / Lumen Field. No site, size or rent yet. Identify anchors beyond game-day visibility.' },
  { id: 'capitol', name: 'Capitol Hill front of house', city: 'Seattle', sf: null, annualRent: null, score: 63, coverage: 39, market: 'Seattle', source: 'Microhub viability scorecard · Oct 5–7 desk estimates', confidence: 'Assumed (desk)', updated: null, ratings: { '2a': 2, '2b': 0, '4b': 1, '5a': 2, '5b': 1, '6a': 2, '6b': 1 }, notes: 'Storefront in an LPN pilot area; possible Liz Dunn partnership and OED / Seattle Restored leads. Need a property and rent quote; test hills on the route.' },
  { id: 'georgetown', name: 'Georgetown / South Park', city: 'Seattle', sf: null, annualRent: null, score: 67, coverage: 38, market: 'Seattle', source: 'Microhub viability scorecard · Oct 5–7 desk estimates', confidence: 'Assumed (desk)', updated: null, ratings: { '2a': 1, '2b': 1, '4b': 1, '4c': 2, '5a': 2, '5b': 1, '6a': 2 }, notes: 'AI-added candidate, not proposed by Emi or Franklin. Georgetown Brewing lead via Jemal unconfirmed. Decide whether to pursue; check truck routes and space.' },
  { id: 'olympia', name: 'Olympia (site search)', city: 'Olympia', sf: null, annualRent: null, score: null, coverage: 0, market: 'Tacoma + Olympia', source: 'Microhub viability scorecard · Oct 7 context', confidence: 'Assumed (desk)', updated: null, ratings: {}, notes: 'Commercial agent search under way; target under 5,000 SF. Score the first three listings. WA Commerce / Action 3E is based here.' },
  ...[
    { id: 'stanford', name: '765 Stanford Ave', sf: 11300, monthlyRent: 8500, annualRent: 8500 * 12 / 11300, score: 62.5, demand: 10605, physical: 1665, supported: 1379, decision: 'Conditional Go', requiredRate: 29.91, loading: '2 ground-level doors', power: 'Three-phase', notes: 'Two stories; 10–11 ft clear; upper-floor use unverified. Investment / Risk binds. Fails the 5,000 SF module gate.' },
    { id: 'national', name: '8913 National Blvd', sf: 2341, annualRent: null, score: 57.2, demand: 7052, physical: 310, supported: 310, decision: 'Go (limited scale)', requiredRate: 37.86, notes: 'Loading and power not stated. Building + Investment / Risk binds. 4,206 SF starter need (56% available); rerun compact layout with Franklin’s assumptions.' },
    { id: 'ceres', name: '741-743 Ceres Ave', sf: 4400, annualRent: null, score: 71, demand: 10374, physical: 643, supported: 622, decision: 'Conditional Go', requiredRate: 30, loading: '1 large 13×13 opening', power: '400A three-phase', notes: 'About 1,160 SF freezer/cooler; 14 ft clear; gated lot; unfinished 1,130 SF mezzanine. 4,016 SF starter need. Investment / Risk binds.' },
    { id: 'barry', name: '2234 Barry Ave', sf: 1000, monthlyRent: 3800, annualRent: 45.6, score: 54.8, demand: 7839, physical: 55, supported: 0, decision: 'No-Go', loading: '1 drive-in', power: '100A suite', notes: 'Shell; one parking space. Physical scale + Investment / Risk binds. 4,776 SF starter need. No viable case up to $100/order.' },
    { id: '14th', name: '308 W 14th St', sf: 6000, monthlyRent: 10500, annualRent: 21, score: 68, demand: 12821, physical: 885, supported: 885, decision: 'Go', requiredRate: 27.9, loading: '1 ground-level; more visible', notes: 'About 22 parking spaces, fenced yard, ~1,500 SF office. Building + Investment / Risk binds. Verify loading and power; fails module size gate.' },
    { id: 'grand', name: '1320 S Grand Ave', sf: 4400, monthlyRent: 9900, annualRent: 27, score: 71, demand: 12924, physical: 633, supported: 633, decision: 'Go', requiredRate: 29.35, notes: 'Modified gross + electrical; loading and power not stated. 4,206 SF starter need. Building + Investment / Risk binds; above occupancy ceiling at module volume.' },
    { id: '9th', name: '716 E 9th Pl', sf: 4610, monthlyRent: 5532, annualRent: 14.4, score: 71, demand: 11033, physical: 695, supported: 695, decision: 'Go', requiredRate: 32, notes: 'Two stories (~2,305 SF each); freight lift not confirmed. NNN extra, amount unknown. 4,016 SF starter need. Base rent only is within target; all-in occupancy unconfirmed.' },
  ].map(s => ({ ...s, city: 'Los Angeles', market: 'Los Angeles · LACI feasibility', source: 'ARCHINNOVO Site Analysis — LACI Model · first draft September 2, 2026 (via Microhub_Viability_Scorecard (3).pdf)', confidence: 'Preliminary screening', updated: '2026-09-02' })),
];
export function referenceScore(site: SourceSite) {
  let points = 0, possible = 0;
  for (const c of criteria) { const rating = site.ratings?.[c.code]; if (rating !== undefined) { possible += c.weight; points += c.weight * rating / 2; } }
  const score = possible ? points / possible * 100 : null;
  const classification = possible < 60 ? `Incomplete (${possible}% scored)` : score! >= 75 ? 'Go (gates pending)' : score! >= 60 ? 'Promising (gates pending)' : score! >= 45 ? 'Watch (gates pending)' : 'Deprioritize (gates pending)';
  return { points, possible, score, classification };
}
export function sourceGates(site: SourceSite) {
  const occupancy = site.monthlyRent ?? (site.sf !== null && site.annualRent !== null ? site.sf * site.annualRent / 12 : null);
  return { size: site.sf === null ? 'PENDING' : site.sf >= 1000 && site.sf <= 5000 ? 'PASS' : 'FAIL', baseRent: occupancy === null ? 'PENDING' : occupancy <= occupancyCeilings().breakEvenMonthly ? 'PASS (base only)' : 'FAIL (base only)', occupancy };
}
export function sourceSiteRecord(s: SourceSite): Site {
  const tier = s.city === 'Los Angeles' ? 'Better' : s.id === 'sodo' || s.id === 'stadium' ? 'Better' : s.id === 'capitol' ? 'Best' : undefined;
  return { id: `source-20261007-${s.id}`, name: s.name, city: s.city, address: s.city === 'Los Angeles' ? `${s.name}, Los Angeles, CA` : 'Area only — property TBD', sf: s.sf ?? 0, rent: seattleRent({city:s.city,name:s.name,neighborhood:s.name}) ?? s.annualRent ?? 0, score: s.score ?? 0, neighborhood: s.city === 'Los Angeles' ? 'See source site analysis' : s.name, partner: s.city === 'Los Angeles' ? 'LACI' : '', status: s.ratings ? referenceScore(s).classification : 'Preliminary LACI / ARCHINNOVO reference', tier, notes: `${s.source}. Snapshot ${snapshotDate}; ${s.confidence}. Score system: ${s.ratings ? 'B-Line normalized score on rated criteria only' : 'LACI / ARCHINNOVO 0–100, not original Cityfi 25/24 scores'}. Unknown SF/rent stored as 0; NOT a free lease. ${s.notes}${s.city === 'Los Angeles' ? ' Tagged Better-tier candidate per LA Archinnovo / DTLA review.' : ''}${seattleRent({city:s.city,name:s.name,neighborhood:s.name}) !== undefined ? ` Current planning override: $${seattleRent({city:s.city,name:s.name,neighborhood:s.name})}/SF/year annual base rent, user-provided; NNN/CAM unverified.` : ''}` };
}
export const holisticPublished = {
  years: [
    { year: 'Year 1', revenue: 609244, service: 397543, opex: 428221, ebitda: -216520, depreciation: 55429, operatingIncome: -271949, labor: 414337, occupancy: 57240, cumulative: -598060 },
    { year: 'Year 2', revenue: 1102774, service: 660660, opex: 446770, ebitda: -4656, depreciation: 55429, operatingIncome: -60085, labor: 533004, occupancy: 58957, cumulative: -602717 },
    { year: 'Year 3', revenue: 1217966, service: 718101, opex: 460260, ebitda: 39605, depreciation: 55429, operatingIncome: -15824, labor: 594172, occupancy: 60726, cumulative: -563112 },
  ], startup: 381540, year1Funding: 598060, peakFunding: 618291, firstPositiveMonth: 19,
};
export const sourceModelComparison = [
  ['Year 1 target basis', 'Startup + gross operating costs', 'Net funding: startup + Year 1 cash burn; $598,060 vs $500,000 target'],
  ['Break-even / Year 3 profit', 'Annual profit after immediate profit sharing; no depreciation', 'EBITDA: Y2 −$4,656; Y3 $39,605; operating income Y3 −$15,824'],
  ['Timing', 'Quarterly Year 1 ramp; annual Y2/Y3', '36 monthly periods; launch Jul 2027; equipment assumed bought by Jun 2027'],
  ['Base rent', '$24/SF/year default; excludes NNN', '$1.29/SF/month = $15.48/SF/year in monthly model; scorecard uses $15.50 midpoint'],
  ['NNN / CAM', 'Not modeled separately', '$0.30/SF/month = $3.60/SF/year placeholder; annual occupancy $57,240'],
  ['Fleet purchase', '$15,000 per trike/quad; $45,000 van', '$25,000 per trike/quad; $60,000 van; 4 active + 2 reserve + 1 van'],
  ['Profit sharing †', '5% of each positive annual profit', 'Holistic: 10%, only after cumulative operating losses recouped; 1-Hub reference: 20%'],
  ['Damaged goods †', '1% of total revenue, as expense', 'Holistic: 0.5% of delivery revenue, as contra-revenue'],
  ['Community uses', 'Off by default; common ramp', 'Store + fix-it enabled; separate 15-month ramps, $39k / $14k mature monthly sales'],
  ['Grants', 'Equipment + charging only, deadline based on combined purchase/launch date', 'Unknown award = $0; holistic allocates to van then trikes. S+U $500k all-grant is an assumption, not a LACI award'],
];
