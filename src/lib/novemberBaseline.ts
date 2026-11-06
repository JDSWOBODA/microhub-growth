import type { Field, HubTier, Inputs } from './defaults';
import type { YearResult } from './calc';

export const novemberSource = 'Franklin Jones · Proforma baseline attributes · November 1, 2026';
export const frontOfHouseDrivers = [
  { key: 'nov_fohBuildoutNotes', label: 'Space and build-out', prompt: 'Describe fit-out, utilities, accessibility and shared-space needs; note what is supplied by the landlord or operator.' },
  { key: 'nov_fohStaffNotes', label: 'Staffing and opening hours', prompt: 'Describe coverage, opening hours and whether hub staff or a partner would run the space.' },
  { key: 'nov_fohPartnerNotes', label: 'Partner responsibilities and cost exposure', prompt: 'Describe who pays rent, utilities, maintenance, insurance and programming; distinguish incremental costs from shared logistics costs.' },
  { key: 'nov_fohEvidenceNotes', label: 'Evidence and unresolved drivers', prompt: 'Record quotes, partner commitments, directional cost ranges and open questions. Notes do not become calculated amounts.' },
];
export const assetLines = [
  { key: 'trike', label: 'Trikes', low: 16000, high: 20000 },
  { key: 'quad', label: 'Quads', low: 20000, high: 25000 },
  { key: 'trailer', label: 'Ghost trailers', low: 7000, high: 9000 },
  { key: 'bike', label: 'Cargo bikes', low: 7000, high: 10000 },
  { key: 'evan', label: 'E-vans', low: 6500, high: 90000 },
];
export const staffLines = ['Delivery riders', 'Mechanic / rider', 'Sales lead', 'Logistics manager', 'Hub manager', 'Warehouse staff', 'Hub administration'];
export const capexLines = ['L2 chargers', 'E-bike chargers', 'Batteries', 'Electric pallet jack', 'Manual pallet jack', 'Racking', 'Containers', 'Computers', 'Electrical TI', 'Plumbing TI', 'Minor construction TI'];
export const cogsLines = ['Equipment service costs (classification under review)', 'Advertising printing / reproduction', 'Third-party advertising services', 'Customer product damage', 'Consumables / supplies and materials'];
export const overheadLines = ['NNN / CAM', 'Independent utilities', 'Building repairs / maintenance', 'Hub advertising / marketing', 'Uniforms', 'Local asset branding', 'Business permits', 'Dues / subscriptions', 'General liability', 'Inland marine insurance', 'Auto insurance', 'Meals / entertainment', 'Training', 'Accounting', 'Consulting', 'Legal', 'Local tax', 'State tax', 'Travel', 'Bank / credit card processing', 'IT services', 'Office supplies', 'Telephones', 'Asset repairs / maintenance (classification under review)', 'Hub supplies'];
export const payrollLines = ['Workers compensation', 'Disability insurance', 'Benefits', 'Payroll taxes', 'Payroll processing', 'Allocated HQ IT/OT compensation', 'Allocated HQ general administration', 'Allocated officer compensation'];
export const revenueLines = [
  { group: 'Logistics', labels: ['Volume', 'Capacity / route', 'Percent of invoice', 'Weight', 'Cube', 'Stops', 'Pieces', 'White-glove hourly delivery', 'Micromobility support'] },
  { group: 'Advertising / promotions', labels: ['Advertising campaigns', 'Advertising hours', 'Signage production markup', 'Promotions campaigns', 'Ambassador hours', 'Other production markup'] },
  { group: 'Cargo bike share', labels: ['Individual subscriptions', 'Individual leases', 'Hourly rentals', 'Third-party maintenance services', 'City shared-mobility asset leases', 'Community-organization asset leases', 'Rent-to-own'] },
  { group: 'Front of house', labels: ['Individual memberships', 'Organization memberships', 'Third-party operator rent / NNN', 'Percentage of operator sales', 'Direct retail sales', 'Corporate sponsorship', 'Public charging', 'Locker hosting', 'Event / pop-up rentals', 'Lending-library services'] },
  { group: 'Community / technology', labels: ['Decarbonization / electrification grants', 'Resilience-hub grants', 'Food rescue grants', 'Recycling / waste grants', 'Donations (requires eligible NFP)', 'Third-party technology servicing'] },
];
const f = (key: string, label: string, unit: string, group: string, value = 0, max?: number): Field => ({ key: `nov_${key}`, label, unit, group: `November · ${group}`, value, max, confirm: true });
export const novemberFields: Field[] = [
  { key: 'novEnabled', label: 'November detailed engine', unit: 'on/off', group: 'November · Mode', value: false },
  { key: 'nov_referenceSource', label: 'Logistics starting baseline provenance', unit: 'source', group: 'November · Logistics baseline', value: '' },
  f('referenceLaborAnnual', 'Reference annual wages · delivery + GM + admin', '$/year', 'Logistics baseline'),
  f('referenceOverheadAnnual', 'Reference annual non-rent overhead · excludes wages', '$/year', 'Logistics baseline'),
  ...frontOfHouseDrivers.map(driver => ({ key: driver.key, label: driver.label, unit: 'notes', group: 'November · Front-of-house planning', value: '', confirm: true })),
  f('hours', 'Asset operating hours / day (research schedule)', 'hours/day', 'Operations', 6, 24),
  f('days', 'Asset operating days / week (research schedule)', 'days/week', 'Operations', 6, 7),
  f('weeks', 'Operating weeks / year', 'weeks/year', 'Operations', 0, 53),
  f('area', 'Total hub area', 'SF', 'Operations'), f('fohSf', 'Front-of-house allocation (within total)', 'SF', 'Operations'),
  f('rent', 'Annual base rent (total, not per SF)', '$/year', 'Operations'),
  f('hqCredit', 'HQ support savings (do not duplicate allocated costs)', '$/year', 'Operations'),
  f('companyContribution', 'Required annual company contribution', '$/year', 'Operations'),
  f('serviceMultiple', 'Service revenue / direct service cost target (3× is a question)', 'multiple', 'Operations'),
  ...assetLines.flatMap(a => [f(`${a.key}Count`, `${a.label} · count`, 'assets', 'Assets'), f(`${a.key}Unit`, `${a.label} · purchase cost (${a.low.toLocaleString()}–${a.high.toLocaleString()})`, '$/asset', 'Assets', a.low), f(`${a.key}RevenueHour`, `${a.label} · measured revenue / operating hour`, '$/hour/asset', 'Asset research'), f(`${a.key}CostHour`, `${a.label} · measured direct cost / operating hour`, '$/hour/asset', 'Asset research')]),
  f('reserve', 'Reserve trikes / quads included in asset counts', 'assets', 'Assets'),
  ...staffLines.flatMap((label, index) => [f(`staff${index}Count`, `${label} · headcount`, 'people', 'Staffing'), f(`staff${index}Rate`, `${label} · wage`, '$/hour', 'Staffing'), f(`staff${index}Hours`, `${label} · weekly paid hours`, 'hours/week', 'Staffing', 0, 168)]),
  ...capexLines.map((label, index) => f(`capex${index}`, `${label} · total startup cost`, '$ one-time', 'Capex / TI')),
  ...cogsLines.map((label, index) => f(`cogs${index}`, label, '$/year', 'COGS')),
  ...payrollLines.map((label, index) => f(`payroll${index}`, label, '$/year', 'Compensation extras')),
  ...overheadLines.map((label, index) => f(`overhead${index}`, label, '$/year', 'Overhead')),
  ...revenueLines.flatMap((line, group) => line.labels.map((label, index) => f(`rev${group}_${index}`, label, '$/year', `Revenue · ${line.group}`))),
];

export function novemberOverrides(tier: HubTier, actual = false): Inputs {
  const inputs: Inputs = Object.fromEntries(novemberFields.map(field => [field.key, actual && typeof field.value === 'number' ? 0 : field.value]));
  inputs.novEnabled = true;
  inputs.hubTier = tier;
  if (!actual) {
    inputs.nov_trikeCount = tier === 'Good' ? 2 : 6;
    inputs.nov_reserve = tier === 'Good' ? 0 : 2;
    inputs.nov_bikeCount = tier === 'Good' ? 2 : 4;
    inputs.nov_evanCount = tier === 'Best' ? 1 : 0;
    inputs.nov_staff0Count = tier === 'Good' ? 5 : 6;
    inputs.nov_staff1Count = 1;
    inputs.nov_staff2Count = 1;
    inputs.nov_staff3Count = tier === 'Best' ? 1 : 0;
    inputs.nov_staff4Count = 1;
  }
  return inputs;
}

export function calculateNovember(i: Inputs) {
  const n = (key: string) => Number(i[`nov_${key}`]) || 0;
  const sum = (prefix: string, lines: string[]) => lines.reduce((total, _, index) => total + n(`${prefix}${index}`), 0);
  const equipment = assetLines.reduce((total, a) => total + n(`${a.key}Count`) * n(`${a.key}Unit`), 0);
  const startup = equipment + sum('capex', capexLines);
  const wages = n('referenceLaborAnnual') + staffLines.reduce((total, _, index) => total + n(`staff${index}Count`) * n(`staff${index}Rate`) * n(`staff${index}Hours`) * n('weeks'), 0);
  const labor = wages + sum('payroll', payrollLines);
  const cogs = sum('cogs', cogsLines);
  const overheadGross = n('referenceOverheadAnnual') + sum('overhead', overheadLines);
  const hqCredit = Math.min(n('hqCredit'), overheadGross);
  const other = overheadGross - hqCredit;
  const revenueGroups = revenueLines.map((line, group) => line.labels.reduce((total, _, index) => total + n(`rev${group}_${index}`), 0));
  const revenue = revenueGroups.reduce((total, value) => total + value, 0);
  const costs = n('rent') + labor + cogs + other;
  let cumulative = -startup;
  const years: YearResult[] = [1, 2, 3].map(year => {
    cumulative += revenue - costs;
    return { year: `Y${year}`, deliveries: 0, logisticsRevenue: revenueGroups[0] + revenueGroups[1], communityRevenue: revenue - revenueGroups[0] - revenueGroups[1], revenue, rent: n('rent'), labor, fleet: 0, other, cogs, damage: 0, sharing: 0, costs, profit: revenue - costs, cumulative };
  });
  const suppliedRevenue = revenue > 0;
  const breakEven = suppliedRevenue && costs > 0 ? years.findIndex(y => y.profit >= 0) : -1;
  const payback = suppliedRevenue && costs > 0 ? years.findIndex(y => y.cumulative >= 0) : -1;
  const assetHours = n('hours') * n('days') * n('weeks');
  const research = assetLines.map(a => ({ ...a, annualHours: assetHours, revenue: assetHours * n(`${a.key}RevenueHour`), directCost: assetHours * n(`${a.key}CostHour`) }));
  const directServiceCost = wages + cogs;
  return { years, equipment, grantApplied: 0, grantEligible: false, startup, year1Total: startup + costs, breakEven: breakEven < 0 ? null : breakEven + 1, payback: payback < 0 ? null : payback + 1, costPerDelivery: null, communitySf: n('fohSf'), logisticsSf: n('area') - n('fohSf'), drivers: [{ name: 'Labor / compensation', value: labor }, { name: 'Rent', value: n('rent') }, { name: 'COGS', value: cogs }, { name: 'Overhead net HQ support', value: other }].sort((a, b) => b.value - a.value), revenueGroups, research, hqCredit, breakEvenRevenue: costs, companyGap: Math.max(0, n('companyContribution') - (revenue - costs)), serviceMultiple: directServiceCost > 0 ? revenueGroups[0] / directServiceCost : null };
}
