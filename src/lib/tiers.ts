import { fields, type HubTier, type Inputs, type Metadata, type Site, type Workspace } from './defaults';
import { calculate, n } from './calc';

export const tierOrder: HubTier[] = ['Good', 'Better', 'Best'];
export const tierColors: Record<HubTier, string> = { Good: '#b45309', Better: '#147b68', Best: '#7c3aed' };
export const needsConfirmation = 'Needs confirmation (Franklin/Emi)';

export type TierCriterion = { code: string; dimension: string; label: string; weight: number };
export type TierGate = { label: string; detail: string };
export type TierDefinition = {
  tier: HubTier;
  scale: 'Micro' | 'Small';
  title: string;
  description: string;
  sites: string[];
  amenities: string[];
  examples: string[];
  flow: string[];
  gates: TierGate[];
  criteria: TierCriterion[];
  frontOfHouse: string[];
  backOfHouse: string[];
};

export const typologyScale = [
  { scale: 'Large', note: 'Urban logistics hotel / sorting center' },
  { scale: 'Medium', note: 'Existing building / loading dock infrastructure' },
  { scale: 'Small', note: 'Neighborhood-scale leased space; more vehicles and amenities' },
  { scale: 'Micro', note: 'Shipping-container pod collection' },
];

const betterCriteria: TierCriterion[] = [
  ['1a', 'Occupancy economics', 'Rent vs. ceiling', 12], ['1b', 'Occupancy economics', 'Space-deal flexibility', 6],
  ['2a', 'Demand and density', 'Delivery density and stem time', 8], ['2b', 'Demand and density', 'Anchor customers and commitments', 8], ['2c', 'Demand and density', 'Customer mix and promo upside', 3],
  ['3a', 'Site and operations', 'Zoning and permitted use', 6], ['3b', 'Site and operations', 'Size and layout fit', 5], ['3c', 'Site and operations', 'Loading and curb', 4], ['3d', 'Site and operations', 'Power and charging readiness', 3], ['3e', 'Site and operations', 'Throughput headroom vs. building', 4], ['3f', 'Site and operations', 'Single-level operation', 3], ['3g', 'Site and operations', 'Cold-chain readiness', 3],
  ['4a', 'Network and safety', 'Bike and low-speed network access', 6], ['4b', 'Network and safety', 'Route safety and terrain', 4], ['4c', 'Network and safety', 'Freight access for feeder vans', 3],
  ['5a', 'Policy and partners', 'Policy alignment', 6], ['5b', 'Policy and partners', 'Public or partner champion', 5], ['5c', 'Policy and partners', 'Funding eligibility', 3],
  ['6a', 'Community and scale', 'Community co-benefit and co-location', 4], ['6b', 'Community and scale', 'Network and replicability', 4],
].map(([code, dimension, label, weight]) => ({ code: String(code), dimension: String(dimension), label: String(label), weight: Number(weight) }));

export const tierDefinitions: Record<HubTier, TierDefinition> = {
  Good: {
    tier: 'Good', scale: 'Micro', title: 'Good = Micro', description: 'Collection of shipping-container pods in a parking lot, underpass, city facility or street right-of-way. Roughly six parking spaces.',
    sites: ['Parking lot', 'Underpass', 'City-owned facility', 'Street right-of-way'],
    amenities: ['Package lockers', 'Gig-worker bike rental', 'Delivery worker rest area', 'Food carts'],
    examples: ['Portland NW SmartPark', 'Seattle Pike Place Pop Up', 'LA Culver City Pop Up'],
    flow: ['Truck receiving point', 'Storage / cold storage', 'Charging bays', 'Trikes go out', 'Pickup / lockers'],
    gates: [
      { label: 'Site-control / permit gate', detail: 'City or landowner agreement in place' },
      { label: 'Power / charging', detail: 'Charging plan and safe electrical access' },
      { label: 'Truck receiving', detail: 'Truck can deliver to receiving point' },
    ],
    criteria: [
      { code: 'g1', dimension: 'Control and permitting', label: 'Site control / permit readiness', weight: 0 },
      { code: 'g2', dimension: 'Operations', label: 'Power and charging readiness', weight: 0 },
      { code: 'g3', dimension: 'Operations', label: 'Truck receiving fit', weight: 0 },
      { code: 'g4', dimension: 'Demand', label: 'Nearby demand density', weight: 0 },
      { code: 'g5', dimension: 'Policy and partners', label: 'City sponsor / champion', weight: 0 },
    ],
    frontOfHouse: ['Package lockers', 'Food carts', 'Pickup point'],
    backOfHouse: ['Container pods', 'Receiving', 'Storage / cold storage', 'Charging'],
  },
  Better: {
    tier: 'Better', scale: 'Small', title: 'Better = Small, light industrial', description: '1,000–5,000 SF leased space in a light industrial district near a congested business corridor.',
    sites: ['Ground floor', 'Roll-up door or drive-through', 'Loading dock', 'Warehousing / storage'],
    amenities: ['Package lockers', 'Coffeeshop / bodega', 'Cargo bike share'],
    examples: ['Portland CEID', 'Seattle SODO', 'LA DTLA'],
    flow: ['Truck arrives via alley', 'Crossdock', 'Storage / staging', 'Trike exits', 'Main street with bike infrastructure'],
    gates: [
      { label: 'Use permitted', detail: 'Storage, delivery and any public-facing uses allowed' },
      { label: 'Size 1,000–5,000 SF', detail: 'Fits the small neighborhood hub target' },
      { label: 'Occupancy within break-even', detail: 'Rent and occupancy stay within model ceiling' },
      { label: 'Loading', detail: 'Door, curb or dock access works' },
      { label: 'Power', detail: 'Charging capacity can support fleet' },
    ],
    criteria: betterCriteria,
    frontOfHouse: ['Package lockers', 'Coffeeshop / bodega', 'Cargo bike share'],
    backOfHouse: ['Crossdock', 'Warehousing / storage', 'Loading dock', 'Charging'],
  },
  Best: {
    tier: 'Best', scale: 'Small', title: 'Best = Small, storefront', description: '1,000–5,000 SF leased space on a visible corner in a dense residential neighborhood.',
    sites: ['Ground floor', 'Storefront', 'Roll-up door', 'Alley access', 'Cold storage'],
    amenities: ['Cargo bike share', 'Childcare', 'Resilience hub', 'Tool lending library', 'Plastic-free refillery', 'Recycling depot', 'EV car share + charging'],
    examples: ['Portland Sellwood', 'Portland SE Division', 'Portland Slabtown', 'Seattle Capitol Hill', 'LA Santa Monica'],
    flow: ['Van at loading zone', 'Alley', 'B-Line crossdock', 'Trikes out through shopping street', 'Neighborhood greenway', 'Pickup / recycling'],
    gates: [
      { label: 'Use permitted', detail: 'Delivery, storage and front-of-house uses allowed' },
      { label: 'Size 1,000–5,000 SF', detail: 'Fits the small neighborhood hub target' },
      { label: 'Occupancy within break-even', detail: 'Rent and occupancy stay within model ceiling' },
      { label: 'Loading', detail: 'Loading zone, alley or roll-up access works' },
      { label: 'Power', detail: 'Charging capacity can support fleet and amenities' },
      { label: 'Visible corner / storefront', detail: 'Public-facing civic hub presence' },
    ],
    criteria: [
      ...betterCriteria.map(c => ({ ...c, weight: 0 })),
      { code: 'b1', dimension: 'Front of house', label: 'Street visibility / corner presence', weight: 0 },
      { code: 'b2', dimension: 'Front of house', label: 'Residential density and walk-up demand', weight: 0 },
      { code: 'b3', dimension: 'Front of house', label: 'Amenity partners: childcare, coffee/bodega, tool library, refillery', weight: 0 },
      { code: 'b4', dimension: 'Site and operations', label: 'Cold storage readiness', weight: 0 },
      { code: 'b5', dimension: 'Community and scale', label: 'Community co-benefit', weight: 0 },
    ],
    frontOfHouse: ['Cargo bike share', 'Repair shop', 'Childcare', 'Coffeeshop / bodega', 'Tool library', 'Refillery + recycling', 'EV charging + car share'],
    backOfHouse: ['B-Line crossdock', 'Cold storage', 'Alley loading', 'Charging', 'Bike parking'],
  },
};

export const tierPins = tierOrder.flatMap(tier => tierDefinitions[tier].examples.map(example => {
  const city = example.startsWith('Portland ') ? 'Portland + Vancouver WA' : example.startsWith('Seattle ') ? 'Seattle' : 'Los Angeles';
  const label = example.replace(/^(Portland|Seattle|LA) /, '');
  return { id: `${tier}-${example}`, tier, city, label };
}));

export const operatorMarkets = ['Vancouver BC + Bellingham', 'Seattle', 'Tacoma + Olympia', 'Portland + Vancouver WA', 'Eugene + Corvallis'];

export function tierForSite(site: Site): HubTier { return site.tier ?? 'Better'; }
export function tierCriteria(tier: HubTier) { return tierDefinitions[tier].criteria; }
export function weightsTotal(criteria: TierCriterion[]) { return criteria.reduce((sum, c) => sum + c.weight, 0); }

export function tierComparison(inputs: Inputs) {
  return tierOrder.map(tier => {
    const model = calculate({ ...inputs, hubTier: tier });
    const year = model.years[0];
    const fixedCosts = year.rent + year.labor + year.fleet + year.other;
    const margin = year.revenue > 0 ? 1 - (year.cogs + year.damage) / year.revenue : tier === 'Good' ? 1 : 1 - n(inputs, 'damage') / 100;
    return {
      tier, site: tier === 'Good' ? 'Pods / roughly six parking spaces' : tier === 'Better' ? 'Light industrial leased space' : 'Visible storefront / civic hub',
      sf: `${n(inputs, tier === 'Good' ? 'goodSf' : 'sf').toLocaleString()} SF`,
      startup: model.startup,
      breakEvenRevenue: margin > 0 ? fixedCosts / margin : null,
      rentCeiling: (year.revenue - year.labor - year.fleet - year.other - year.cogs - year.damage) / 12,
      profit: year.profit,
    };
  });
}

export function confirmationItems(inputs: Inputs, metadata: Record<string, Metadata> = {}, workspace?: Workspace) {
  const items = fields.filter(field => field.confirm ? inputs[field.key] === undefined || metadata[field.key]?.validation !== false : metadata[field.key]?.validation === true)
    .map(field => ({ key: field.key, label: field.label, note: needsConfirmation }));
  for (const site of workspace?.sites ?? []) {
    if (!site.tier) items.push({ key: `tier-${site.id}`, label: `${site.name}: tier unassigned`, note: needsConfirmation });
    if (site.tier && (site.tier !== 'Better' && !site.scorecard?.tierWeights?.[site.tier] || weightsTotal(tierCriteria(site.tier).map(c => ({ ...c, weight: site.scorecard?.tierWeights?.[site.tier]?.[c.code] ?? (site.scorecard?.weightsTier === site.tier ? site.scorecard?.weights?.[c.code] : undefined) ?? c.weight }))) !== 100))
      items.push({ key: `weights-${site.id}`, label: `${site.name}: ${site.tier} weights`, note: needsConfirmation });
    if (!site.sf || !site.address || /TBD|Area only/i.test(site.address)) items.push({ key: `site-${site.id}`, label: `${site.name}: site details`, note: needsConfirmation });
  }
  for (const pin of tierPins) {
    const location = workspace?.tierPinLocations?.[pin.id];
    if (location?.lat === undefined || location.lng === undefined) items.push({ key: `pin-${pin.id}`, label: `${pin.label}: map coordinates`, note: needsConfirmation });
  }
  return items;
}
