import type { SiteScorecard } from './siteScorecard';

export type InputValue = number | string | boolean;
export type Inputs = Record<string, InputValue>;
export type HubTier = 'Good' | 'Better' | 'Best';
export type Field = { key: string; label: string; unit: string; group: string; value: InputValue; max?: number; options?: string[]; validation?: boolean; confirm?: boolean };
const num = (key: string, label: string, unit: string, group: string, value: number, max?: number, validation = false): Field => ({ key, label, unit, group, value, max, validation });
// Confirm fields: tier inputs not given in the Oct 28, 2026 Neighborhood Hub Vision. Default 0 and flagged for Franklin/Emi.
const cnum = (key: string, label: string, unit: string, group: string): Field => ({ key, label, unit, group, value: 0, validation: true, confirm: true });
const goodFields: Field[] = [
  cnum('goodPods', 'Shipping-container pods', 'pods', 'Good · micro pods'),
  cnum('goodPodCost', 'Pod unit cost', '$/pod', 'Good · micro pods'),
  cnum('goodTrikes', 'Trikes / quads', 'vehicles', 'Good · micro pods'),
  cnum('goodTrikeCost', 'Trike / quad cost', '$/vehicle', 'Good · micro pods'),
  cnum('goodStartup', 'Site setup & fit-out', '$ one-time', 'Good · micro pods'),
  cnum('goodRentMonthly', 'Site fee / rent', '$/month', 'Good · micro pods'),
  cnum('goodRevenue', 'Break-even revenue', '$/year', 'Good · micro pods'),
];
const bestFohLines: [string, string][] = [['cargoShare', 'Cargo bike share'], ['refillery', 'Plastic-free refillery / recycling'], ['toolLibrary', 'Tool lending library'], ['childcare', 'Childcare lease'], ['coffee', 'Coffeeshop / bodega'], ['evShare', 'EV car share + charging']];
const bestFohFields: Field[] = bestFohLines.flatMap(([k, label]) => [
  cnum(`${k}Rev`, `${label} · revenue`, '$/year', 'Best · front of house'),
  cnum(`${k}Cost`, `${label} · cost`, '$/year', 'Best · front of house'),
  cnum(`${k}Sf`, `${label} · space`, 'SF', 'Best · front of house'),
]);
export { bestFohLines };
export const fields: Field[] = [
  num('sf', 'Total hub area', 'SF', 'Space', 3000),
  num('rent', 'Annual rent', '$/SF/year', 'Space', 24),
  num('discount', 'Partner rent discount', '%', 'Space', 0, 100),
  ...[['active', 'Active trikes / quads', 4, 15000], ['reserve', 'Reserve trikes / quads', 2, 15000], ['van', 'E-vans', 1, 45000]].flatMap(([key, label, count, cost]) => [
    num(`${key}Count`, `${label} · fleet size`, 'vehicles', 'Fleet', Number(count)),
    { key: `${key}Mode`, label: `${label} · acquisition`, unit: 'method', group: 'Fleet', value: 'buy', options: ['buy', 'lease'] },
    num(`${key}Cost`, `${label} · purchase`, '$/vehicle', 'Fleet', Number(cost)),
    num(`${key}Lease`, `${label} · lease`, '$/vehicle/month', 'Fleet', key === 'van' ? 700 : 250),
    num(`${key}Maintenance`, `${label} · maintenance`, '$/vehicle/year', 'Fleet', key === 'van' ? 1800 : 600),
    num(`${key}Insurance`, `${label} · insurance`, '$/vehicle/year', 'Fleet', key === 'van' ? 2400 : 400),
    num(`${key}Charging`, `${label} · charging energy`, '$/vehicle/year', 'Fleet', key === 'van' ? 900 : 120),
    num(`${key}Charger`, `${label} · charging equipment`, '$/vehicle', 'Fleet', key === 'van' ? 2500 : 300),
  ]),
  ...[['rider', 'Riders', 4, 23, 35], ['staff', 'Hub staff', 1, 24, 40], ['manager', 'Manager', 1, 32, 40]].flatMap(([key, label, count, rate, hours]) => [
    num(`${key}Count`, `${label} · headcount`, 'people / FTE', 'Labor', Number(count)),
    num(`${key}Rate`, `${label} · hourly rate`, '$/hour', 'Labor', Number(rate)),
    num(`${key}Hours`, `${label} · weekly hours`, 'hours/week', 'Labor', Number(hours), 168),
    num(`${key}Burden`, `${label} · payroll burden`, '%', 'Labor', 20, 100),
  ]),
  num('deliveries', 'Deliveries per day', 'deliveries/day', 'Volume', 180),
  num('days', 'Operating days', 'days/year', 'Volume', 260, 366),
  num('price', 'Revenue per delivery', '$/delivery', 'Volume', 9),
  ...[40, 60, 80, 100].map((v, i) => num(`q${i + 1}`, `Year 1 · quarter ${i + 1} ramp`, '% of daily volume', 'Volume', v, 100)),
  num('y2Volume', 'Year 2 volume', '% of daily volume', 'Volume', 100),
  num('y3Volume', 'Year 3 volume', '% of daily volume', 'Volume', 110),
  num('inflation', 'Annual cost escalation', '%/year', 'Other costs', 3, 100),
  num('damage', 'Damaged goods', '% of total revenue', 'Other costs', 1, 100, true),
  num('sharing', 'Profit sharing', '% of positive profit', 'Other costs', 5, 100, true),
  num('software', 'Software', '$/month', 'Other costs', 350),
  num('utilities', 'Utilities', '$/month', 'Other costs', 600),
  num('startup', 'Fit-out & other startup capex', '$ one-time', 'Other costs', 25000),
  ...[['store', 'General store / bodega', 450, 90000, 55, 0.5], ['repair', 'Fix-it / bike repair', 350, 65000, 30, 0.5]].flatMap(([key, label, sf, revenue, cogs, staff]) => [
    { key: `${key}Enabled`, label: `${label} · enabled`, unit: 'on / off', group: 'Community', value: false },
    num(`${key}Sf`, `${label} · space`, 'SF', 'Community', Number(sf)),
    num(`${key}Revenue`, `${label} · revenue`, '$/year at full ramp', 'Community', Number(revenue)),
    num(`${key}Cogs`, `${label} · COGS`, '% of module revenue', 'Community', Number(cogs), 100),
    num(`${key}Staff`, `${label} · staff`, 'people / FTE', 'Community', Number(staff)),
    num(`${key}Rate`, `${label} · hourly rate`, '$/hour', 'Community', 24),
    num(`${key}Hours`, `${label} · weekly hours`, 'hours/week', 'Community', 40, 168),
    num(`${key}Burden`, `${label} · payroll burden`, '%', 'Community', 20, 100),
  ]),
  ...goodFields,
  ...bestFohFields,
  { key: 'grantName', label: 'Equipment grant', unit: 'program', group: 'Funding', value: 'LACI/DOE — equipment only' },
  num('grant', 'Equipment grant award', '$ one-time', 'Funding', 0),
  { key: 'grantDeadline', label: 'Grant eligibility deadline', unit: 'date', group: 'Funding', value: '2027-06-30' },
  { key: 'startDate', label: 'Equipment purchase / launch date', unit: 'date', group: 'Funding', value: '2027-01-01' },
];
export const defaultInputs: Inputs = Object.fromEntries(fields.map(f => [f.key, f.value]));
export type Metadata = { source: string; confidence: 'low' | 'med' | 'high'; validation: boolean };
export type Scenario = { id: string; name: string; city: string; siteId?: string; model?: 'annual' | 'scott'; scott?: { inputs: Inputs; metadata: Record<string, Metadata> }; inputs: Inputs; metadata: Record<string, Metadata> };
export type Site = { id: string; name: string; city: string; address: string; sf: number; score: number; neighborhood: string; rent: number; partner: string; status: string; notes: string; tier?: HubTier; scorecard?: SiteScorecard };
export const statuses = ['to contact', 'reached out', 'meeting set', 'met', 'follow-up'] as const;
export type Partner = { id: string; org: string; contact: string; role: string; city: string; type: string; status: typeof statuses[number]; lastTouch: string; nextStep: string; notes: string };
export function makeScenario(name: string, city = 'Seattle', overrides: Inputs = {}): Scenario {
  return { id: crypto.randomUUID(), name, city, inputs: { ...defaultInputs, ...overrides }, metadata: Object.fromEntries(fields.map(f => [f.key, { source: 'Planning default — replace with verified numbers', confidence: 'low', validation: true }])) };
}
export const seedSites: Site[] = [
  { id: 'seattle', name: 'Seattle neighborhood hub', city: 'Seattle', address: 'TBD', sf: 3000, score: 0, neighborhood: 'To be selected', rent: 24, partner: '', status: 'Site search', notes: 'Target ≤5,000 SF, ideally ~3,000. Rent is a planning assumption; score not yet assessed.' },
  { id: 'stanford', name: '765 Stanford Ave', city: 'Los Angeles', address: '765 Stanford Ave, Los Angeles, CA', sf: 11300, score: 25, neighborhood: 'DTLA', rent: 24, partner: 'LACI', status: 'Feasibility', tier: 'Better', notes: 'User-provided area and score. Rent is an unverified planning assumption. Exceeds neighborhood hub size target. Tagged Better-tier candidate per DTLA Archinnovo/LACI review.' },
  { id: 'national', name: '8913 National Blvd', city: 'Los Angeles', address: '8913 National Blvd, Los Angeles, CA', sf: 2341, score: 24, neighborhood: 'West LA / Culver City', rent: 30, partner: 'LACI', status: 'Feasibility', tier: 'Better', notes: 'User-provided area and score. Rent is an unverified planning assumption. Tagged Better-tier candidate per LA Archinnovo/LACI review.' },
  ...[['sodo', 'SODO logistics hub', 'SODO', 2000, 'Better', 'About 2,000 SF, logistics-only. Potential anchor customers: IKEA, Puget Sound Food Hub and Grand Central Bakery.'], ['stadium', 'Stadium District back of house', 'Stadium District', 0, 'Better', 'Utah Ave S area near T-Mobile Park / Lumen Field. No confirmed property or size.'], ['capitol', 'Capitol Hill front of house', 'Capitol Hill', 0, 'Best', 'Storefront in an LPN pilot area. Loading, hills, rent and area unconfirmed.'], ['pike-place-pop-up', 'Pike Place Pop Up', 'Pike Place', 0, 'Good', 'Good / Micro pop-up example from the Oct 28, 2026 Neighborhood Hub Vision. Site control, permit, pod count and costs need confirmation.'], ['georgetown', 'Georgetown / South Park', 'Georgetown / South Park', 0, '', 'AI-added suggestion in source map, NOT proposed by Emi or Franklin. Georgetown Brewing lead unconfirmed. Untiered until reviewed.']].map(([id, name, neighborhood, sf, tier, notes]) => ({ id: String(id), name: String(name), city: 'Seattle', address: 'Area only — property TBD', sf: Number(sf), score: 0, neighborhood: String(neighborhood), rent: id === 'stadium' ? 18 : id === 'capitol' ? 24 : 15, partner: '', status: id === 'georgetown' ? 'Unconfirmed suggestion' : 'Candidate area', tier: tier ? tier as HubTier : undefined, notes: `Source: Cascadia Hub Map / Neighborhood Hub Vision. ${notes} Rent is a planning assumption; score not assessed.` })),
];
export const seedPartners: Partner[] = [
  ['SDOT', 'Seattle', 'City/agency', 'Low Pollution Neighborhoods + Freight teams'], ['SODO BIA', 'Seattle', 'BIA', ''], ['Sound Break Bike Shop', 'Seattle', 'business partner', 'Pioneer Square'], ['Georgetown Brewing', 'Seattle', 'business partner', ''], ['Grand Central Bakery', 'Seattle', 'business partner', ''], ['Puget Sound Food Hub', 'Seattle', 'business partner', ''], ['LACI', 'Los Angeles', 'funder', 'Equipment funding / feasibility'], ['Cityfi', 'Multi-city', 'business partner', ''],
].map(([org, city, type, notes], i) => ({ id: `partner-${i}`, org, city, type, notes, contact: '', role: '', status: 'to contact', lastTouch: '', nextStep: '' }));
export type Workspace = { version: 1; scenarios: Scenario[]; activeId: string; sites: Site[]; partners: Partner[]; seattleRentUpdate?: 1; hubTierUpdate?: 1 };
export function initialWorkspace(): Workspace {
  const seattle = makeScenario('Seattle – 1-Hub'); seattle.siteId = 'seattle';
  const stanford = makeScenario('LA – Stanford Ave', 'Los Angeles', { sf: 11300 }); stanford.siteId = 'stanford';
  const national = makeScenario('LA – National Blvd', 'Los Angeles', { sf: 2341, rent: 30 }); national.siteId = 'national';
  return { version: 1, scenarios: [seattle, stanford, national], activeId: seattle.id, sites: seedSites, partners: seedPartners };
}
