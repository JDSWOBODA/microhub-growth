import { bestFohLines, type Inputs } from './defaults';
export const n = (inputs: Inputs, key: string) => Number(inputs[key]) || 0;
export type YearResult = { year: string; deliveries: number; logisticsRevenue: number; communityRevenue: number; revenue: number; rent: number; labor: number; fleet: number; other: number; cogs: number; damage: number; sharing: number; costs: number; profit: number; cumulative: number };
export function calculate(i: Inputs) {
  let equipment = 0;
  let fleetAnnual = 0;
  for (const key of ['active', 'reserve', 'van']) {
    const count = n(i, `${key}Count`);
    equipment += count * (n(i, `${key}Charger`) + (i[`${key}Mode`] === 'buy' ? n(i, `${key}Cost`) : 0));
    fleetAnnual += count * (n(i, `${key}Maintenance`) + n(i, `${key}Insurance`) + n(i, `${key}Charging`) + (i[`${key}Mode`] === 'lease' ? n(i, `${key}Lease`) * 12 : 0));
  }
  const grantEligible = String(i.startDate) <= String(i.grantDeadline);
  const grantApplied = grantEligible ? Math.min(n(i, 'grant'), equipment) : 0;
  const startup = equipment + n(i, 'startup') - grantApplied;
  let baseLabor = 0;
  for (const key of ['rider', 'staff', 'manager']) baseLabor += n(i, `${key}Count`) * n(i, `${key}Rate`) * n(i, `${key}Hours`) * 52 * (1 + n(i, `${key}Burden`) / 100);
  let communityRevenue = 0, cogs = 0, communitySf = 0;
  for (const key of ['store', 'repair']) if (i[`${key}Enabled`]) {
    communityRevenue += n(i, `${key}Revenue`);
    cogs += n(i, `${key}Revenue`) * n(i, `${key}Cogs`) / 100;
    communitySf += n(i, `${key}Sf`);
    baseLabor += n(i, `${key}Staff`) * n(i, `${key}Rate`) * n(i, `${key}Hours`) * 52 * (1 + n(i, `${key}Burden`) / 100);
  }
  for (const [key] of bestFohLines) {
    communityRevenue += n(i, `${key}Rev`);
    cogs += n(i, `${key}Cost`);
    communitySf += n(i, `${key}Sf`);
  }
  const ramps = [[1, 2, 3, 4].reduce((sum, q) => sum + n(i, `q${q}`), 0) / 400, n(i, 'y2Volume') / 100, n(i, 'y3Volume') / 100];
  let cumulative = -startup;
  const years: YearResult[] = ramps.map((ramp, index) => {
    const escalation = (1 + n(i, 'inflation') / 100) ** index;
    const deliveries = n(i, 'deliveries') * n(i, 'days') * ramp;
    const logisticsRevenue = deliveries * n(i, 'price');
    const moduleRevenue = communityRevenue * ramp;
    const revenue = logisticsRevenue + moduleRevenue;
    const rent = n(i, 'sf') * n(i, 'rent') * (1 - n(i, 'discount') / 100) * escalation;
    const labor = baseLabor * escalation;
    const fleet = fleetAnnual * escalation;
    const other = (n(i, 'software') + n(i, 'utilities')) * 12 * escalation;
    const moduleCogs = cogs * ramp;
    const damage = revenue * n(i, 'damage') / 100;
    const beforeSharing = revenue - rent - labor - fleet - other - moduleCogs - damage;
    const sharing = Math.max(0, beforeSharing) * n(i, 'sharing') / 100;
    const costs = rent + labor + fleet + other + moduleCogs + damage + sharing;
    const profit = revenue - costs;
    cumulative += profit;
    return { year: `Y${index + 1}`, deliveries, logisticsRevenue, communityRevenue: moduleRevenue, revenue, rent, labor, fleet, other, cogs: moduleCogs, damage, sharing, costs, profit, cumulative };
  });
  const breakEven = years.findIndex(y => y.profit >= 0);
  const payback = years.findIndex(y => y.cumulative >= 0);
  const drivers = [{ name: 'Labor', value: years[0].labor }, { name: 'Rent & occupancy', value: years[0].rent }, { name: 'Fleet operations', value: years[0].fleet }, { name: 'Software & utilities', value: years[0].other }, { name: 'Community COGS', value: years[0].cogs }, { name: 'Damaged goods & sharing', value: years[0].damage + years[0].sharing }].sort((a, b) => b.value - a.value);
  return { years, equipment, grantApplied, grantEligible, startup, year1Total: years[0].costs + startup, breakEven: breakEven < 0 ? null : breakEven + 1, payback: payback < 0 ? null : payback + 1, costPerDelivery: years[0].deliveries ? (years[0].costs - years[0].cogs) / years[0].deliveries : null, communitySf, logisticsSf: n(i, 'sf') - communitySf, drivers };
}
export function sensitivity(i: Inputs) {
  const baseline = calculate(i).years[2].profit;
  return [{ name: 'Labor rates', keys: ['riderRate', 'staffRate', 'managerRate', 'storeRate', 'repairRate'] }, { name: 'Rent / SF', keys: ['rent'] }, { name: 'Deliveries / day', keys: ['deliveries'] }, { name: 'Hub area', keys: ['sf'] }].map(({ name, keys }) => {
    const lower = { ...i }, upper = { ...i };
    keys.forEach(key => { lower[key] = n(i, key) * 0.8; upper[key] = n(i, key) * 1.2; });
    const a = calculate(lower).years[2].profit - baseline, b = calculate(upper).years[2].profit - baseline;
    return { name, low: Math.min(a, b), high: Math.max(a, b), impact: Math.max(Math.abs(a), Math.abs(b)) };
  }).sort((a, b) => b.impact - a.impact);
}
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export const compactMoney = (value: number) => `${value < 0 ? '−' : ''}$${(Math.abs(value) / 1000).toFixed(0)}k`;
