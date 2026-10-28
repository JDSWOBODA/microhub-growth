import type { HubTier, Inputs, Site } from './defaults';
import { calculate, n } from './calc';

export const tierOrder: HubTier[] = ['Good', 'Better', 'Best'];
export const tierColors: Record<HubTier, string> = { Good: '#fbbf24', Better: '#111827', Best: '#7c3aed' };
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
      { code: 'g1', dimension: 'Control and permitting', label: 'Site control / permit readiness', weight: 25 },
      { code: 'g2', dimension: 'Operations', label: 'Power and charging readiness', weight: 20 },
      { code: 'g3', dimension: 'Operations', label: 'Truck receiving fit', weight: 20 },
      { code: 'g4', dimension: 'Demand', label: 'Nearby demand density', weight: 20 },
      { code: 'g5', dimension: 'Policy and partners', label: 'City sponsor / champion', weight: 15 },
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
      ...betterCriteria.map(c => ({ ...c, weight: Math.max(1, Math.round(c.weight * 0.78)) })),
      { code: 'b1', dimension: 'Front of house', label: 'Street visibility / corner presence', weight: 6 },
      { code: 'b2', dimension: 'Front of house', label: 'Residential density and walk-up demand', weight: 5 },
      { code: 'b3', dimension: 'Front of house', label: 'Amenity partners: childcare, coffee/bodega, tool library, refillery', weight: 6 },
      { code: 'b4', dimension: 'Site and operations', label: 'Cold storage readiness', weight: 3 },
      { code: 'b5', dimension: 'Community and scale', label: 'Community co-benefit', weight: 4 },
    ],
    frontOfHouse: ['Cargo bike share', 'Repair shop', 'Childcare', 'Coffeeshop / bodega', 'Tool library', 'Refillery + recycling', 'EV charging + car share'],
    backOfHouse: ['B-Line crossdock', 'Cold storage', 'Alley loading', 'Charging', 'Bike parking'],
  },
};

tierDefinitions.Best.criteria = normalizeWeights(tierDefinitions.Best.criteria);

function normalizeWeights(criteria: TierCriterion[]) {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  let running = 0;
  return criteria.map((c, i) => {
    const weight = i === criteria.length - 1 ? 100 - running : Math.max(1, Math.round(c.weight / total * 100));
    running += weight;
    return { ...c, weight };
  });
}

export const tierPins = [
  { tier: 'Good' as const, city: 'Portland + Vancouver WA', label: 'NW SmartPark', lat: 45.522, lng: -122.681 },
  { tier: 'Good' as const, city: 'Seattle', label: 'Pike Place Pop Up', lat: 47.609, lng: -122.342 },
  { tier: 'Good' as const, city: 'Los Angeles', label: 'Culver City Pop Up', lat: 34.021, lng: -118.396 },
  { tier: 'Better' as const, city: 'Portland + Vancouver WA', label: 'CEID', lat: 45.521, lng: -122.661 },
  { tier: 'Better' as const, city: 'Seattle', label: 'SODO', lat: 47.579, lng: -122.333 },
  { tier: 'Better' as const, city: 'Los Angeles', label: 'DTLA', lat: 34.047, lng: -118.246 },
  { tier: 'Best' as const, city: 'Portland + Vancouver WA', label: 'Sellwood', lat: 45.464, lng: -122.652 },
  { tier: 'Best' as const, city: 'Portland + Vancouver WA', label: 'SE Division', lat: 45.505, lng: -122.622 },
  { tier: 'Best' as const, city: 'Portland + Vancouver WA', label: 'Slabtown', lat: 45.532, lng: -122.699 },
  { tier: 'Best' as const, city: 'Seattle', label: 'Capitol Hill', lat: 47.625, lng: -122.322 },
  { tier: 'Best' as const, city: 'Los Angeles', label: 'Santa Monica', lat: 34.019, lng: -118.491 },
];

export const operatorMarkets = ['Vancouver BC + Bellingham', 'Seattle', 'Tacoma + Olympia', 'Portland + Vancouver WA', 'Eugene + Corvallis'];

export function tierForSite(site: Site): HubTier { return site.tier ?? 'Better'; }
export function tierCriteria(tier: HubTier) { return tierDefinitions[tier].criteria; }
export function weightsTotal(criteria: TierCriterion[]) { return criteria.reduce((sum, c) => sum + c.weight, 0); }

export function tierComparison(inputs: Inputs) {
  const better = calculate(inputs);
  const rentCeiling = better.logisticsSf > 0 ? (better.years[0].revenue - better.years[0].labor - better.years[0].fleet - better.years[0].other - better.years[0].cogs - better.years[0].damage) / 12 : 0;
  return [
    { tier: 'Good' as const, site: 'Pods / roughly six parking spaces', sf: 'Micro footprint', startup: n(inputs, 'goodStartup') + n(inputs, 'goodPods') * n(inputs, 'goodPodCost') + n(inputs, 'goodTrikes') * n(inputs, 'goodTrikeCost'), breakEvenRevenue: n(inputs, 'goodRevenue'), rentCeiling: n(inputs, 'goodRentMonthly'), confirmed: false },
    { tier: 'Better' as const, site: 'Light industrial leased space', sf: `${n(inputs, 'sf').toLocaleString()} SF`, startup: better.startup, breakEvenRevenue: 500000, rentCeiling, confirmed: true },
    { tier: 'Best' as const, site: 'Visible storefront / civic hub', sf: `${(n(inputs, 'sf') + ['cargoShareSf','refillerySf','toolLibrarySf','childcareSf','coffeeSf','evShareSf'].reduce((sum, k) => sum + n(inputs, k), 0)).toLocaleString()} SF`, startup: better.startup, breakEvenRevenue: 500000 + ['cargoShareCost','refilleryCost','toolLibraryCost','childcareCost','coffeeCost','evShareCost'].reduce((sum, k) => sum + n(inputs, k), 0), rentCeiling, confirmed: false },
  ];
}

export function confirmationItems(inputs: Inputs) {
  const keys = [
    'goodPods','goodPodCost','goodTrikes','goodTrikeCost','goodStartup','goodRentMonthly','goodRevenue',
    'cargoShareRev','cargoShareCost','cargoShareSf','refilleryRev','refilleryCost','refillerySf','toolLibraryRev','toolLibraryCost','toolLibrarySf','childcareRev','childcareCost','childcareSf','coffeeRev','coffeeCost','coffeeSf','evShareRev','evShareCost','evShareSf',
  ];
  return keys.filter(key => n(inputs, key) === 0).map(key => ({ key, label: key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()), note: needsConfirmation }));
}
