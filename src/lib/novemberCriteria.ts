export type FeatureAssessment = { status?: 'met' | 'partial' | 'missing' | 'not-applicable'; owner: string; evidence: string; points?: number };
export type NovemberAssessment = { features: Record<string, FeatureAssessment>; context: Record<string, string> };
export const priorities: Record<number, string> = { 1: 'Non-essential', 2: 'Nice to have', 3: 'Useful', 4: 'Important', 5: 'MVP critical' };
export type NovemberFeature = { id: string; label: string; type: string; printed: number; points: number; note: string };
const rows: [string, string, number, string?, number?][] = [
  ['300 SF cross-docking area', 'Building', 5, 'FJ: minimum area needed.'],
  ['120 SF flexible microenterprise space', 'Building', 3, 'Highly dependent on secondary use; source comment is truncated.'],
  ['Loading dock', 'Building', 1, 'FJ recommends nice to have.', 2],
  ['Storefront', 'Building', 2, 'May be essential in CM2; conditional on zoning, not universally changed.'],
  ['Roll-up door', 'Building', 3, 'FJ: bump to Important.', 4],
  ['Free / low / subsidized rent', 'Building', 5, 'FJ agrees.'],
  ['500 SF community room', 'Building', 4, 'May lower for proof of concept; final priority unconfirmed.'],
  ['Permitted by Building Code (e.g. commercial S1 occupancy)', 'Building', 5, 'Use local code; source comment on prioritization is truncated.'],
  ['200 SF coffee shop / bodega', 'Building', 3, 'May lower for proof of concept; final priority unconfirmed.'],
  ['Continuous flow / loop', 'Site', 2],
  ['Refrigerated storage', 'Equipment', 2, 'FJ: walk-in, perhaps 500 SF maximum; not a confirmed design limit.'],
  ['3 trikes', 'Equipment', 5, 'FJ: 3 trikes, 2 bullets minimum; differs from Nov 1 tier fleet. Do not overwrite tier baselines.'],
  ['Protected bike lanes on major roads', 'Neighborhood', 5],
  ['Near a bike sales shop', 'Site', 3, 'FJ suggests nice to have; confirm with LP.', 2],
  ['Hand truck', 'Equipment', 5, 'Quantity should match assets; no quantity supplied.'],
  ['Scooter charging battery bank', 'Equipment', 4, 'FJ suggests nice to have; micromobility companies would lead.', 2],
  ['Program manager', 'Human', 3, 'FJ does not expect a dedicated program manager in each hub.'],
  ['400 SF for storing 3 tricycles', 'Building', 5, 'Check with LP and SH.'],
  ['300 SF storage shelving', 'Building', 3, 'Check with SH and MO.'],
  ['2 toilets', 'Building', 5, 'Toilets essential; showers nice to have, not critical.'],
  ['150 SF bicycle mechanic shop', 'Building', 4, 'Check with LP and SH.'],
  ['120 SF office', 'Building', 3, 'May need only a desk; area not settled.'],
  ['Resident of neighborhood', 'Human', 5, 'FJ asks for clarification.'],
  ['Electric van', 'Equipment', 5, 'Tier baseline: Better van only if sole hub; Good standalone model has no supplied van.'],
  ['Pallet jack', 'Equipment', 3, 'May need electric; check with SH.'],
  ['On-site manager', 'Human', 5, 'FJ: 1 FTE.'],
  ['Forklift', 'Equipment', 1, 'Source condition is truncated.'],
  ['Walk-up window', 'Building', 2, 'FJ agrees.'],
  ['Freezer storage', 'Equipment', 1],
  ['Commercial kitchen', 'Equipment', 2],
  ['24/7 activity', 'Neighborhood', 3],
  ['B-Line delivery rider', 'Human', 5, 'Earlier feature note estimates 4 FTE; Nov 1 tier baseline says 5 or 6 riders.'],
  ['50+ businesses within 2 miles', 'Neighborhood', 4],
  ['Alignment with neighborhood association / service district priorities', 'Neighborhood', 5],
  ['10 food / beverage businesses with local distribution needs', 'Neighborhood', 4, 'Confirm current client base.'],
  ['Microenterprise business owner', 'Human', 4, 'At launch? Unconfirmed.'],
  ['Disaster relief stocked items', 'Equipment', 2],
  ['Fewer than 3 coffee options within 1 mile', 'Neighborhood', 4, 'As clients or retail gap? Clarify purpose.'],
  ['Historically low-income / underserved neighborhood', 'Neighborhood', 4, 'Impact criterion; source revenue-lens comment truncated.'],
  ['BIPOC businesses', 'Neighborhood', 4, 'Impact criterion; source revenue-lens comment truncated.'],
  ['Neighborhood electrification educational materials', 'Service', 3],
  ['Printer', 'Service', 3],
  ['Green job training', 'Service', 3],
  ['Returns / package drop-off', 'Service', 3],
  ['Electric bicycle mechanic apprenticeship', 'Service', 2],
  ['Made-to-order production', 'Service', 2],
  ['Cargo bike training for small businesses', 'Service', 2],
  ['Neighborhood Emergency Team meeting location', 'Service', 2],
  ['Compost collection / Food Loop', 'Service', 2],
  ['Public electric bike charging', 'Service', 2],
  ['Public battery swapping', 'Service', 2],
  ['Cooling space during heat waves', 'Service', 2],
  ['Cargo bike share program', 'Service', 2],
  ['Public Wi-Fi', 'Service', 4],
  ['Near micromobility options', 'Site', 3],
  ['Off-street parking', 'Site', 3],
  ['On a neighborhood greenway', 'Site', 3],
  ['Level 2 charging for electric van', 'Site', 3],
  ['Publicly accessible EV charging', 'Site', 2],
  ['100 amps for charging 3 tricycles', 'Site', 5],
  ['Within 1 mile of commercial district', 'Site', 5],
  ['Permitted by Zoning Code (e.g. CM3 or CM2)', 'Site', 5, 'Examples are Portland codes; verify the applicable local jurisdiction.'],
  ['Walking distance from transit stop', 'Site', 4],
  ['Curb cut', 'Site', 4],
  ['Space for outdoor seating', 'Site', 4],
  ['Package pickup lockers', 'Site', 4],
  ['Independent battery-charging electrical circuits', 'Building', 5],
  ['Ability to add L2 charging', 'Building', 4],
  ['Ability to add community-facing L3 charging', 'Site', 3],
];
export const novemberFeatures: NovemberFeature[] = rows.map(([label, type, printed, note = '', adjusted], index) => ({ id: `fj-${index + 1}`, label, type, printed, points: adjusted ?? printed, note }));
export const contextPrompts = [
  ['Champions', 'Political / city / county champion'], ['Champions', 'Community champion'], ['Champions', 'Transportation bureau: curb management, innovation, vision zero'], ['Champions', 'Bike advocate / local organizing'], ['Champions', 'Innovative developer'], ['Champions', 'Business association / BIA'], ['Champions', 'Economic development / small-business champion'],
  ['Block vibes', 'Pedestrian foot traffic'], ['Block vibes', 'Micromobility and bike culture'], ['Block vibes', 'Street furniture / outdoor seating'], ['Block vibes', 'Food carts / restaurants / cafes'], ['Block vibes', 'Bars / breweries / juice / coffee customers'], ['Block vibes', 'Plazas / festivals / pedestrian streets'], ['Block vibes', 'Alleys and low-speed streets'],
  ['Culture', 'Climate action demand'], ['Culture', 'Bike infrastructure demand'], ['Culture', 'Low-pollution neighborhood policy'], ['Culture', 'Food rescue'], ['Culture', 'Zero-waste / plastic-free demand'], ['Culture', 'Brand merchandise / partner showcases / parcel lockers'],
  ['Tenant research', 'Median household income / discretionary spend and price sensitivity'], ['Tenant research', 'Peak transit / traffic windows and dayparts'], ['Tenant research', 'Age / household composition and trade area'], ['Tenant research', 'Void / gap analysis within 1 mile'],
  ['Tenant mix', 'Daily anchors: 30–40% of space or traffic priority; recurring 3–7 visits/week'], ['Tenant mix', 'Personal / essential services: 30–40%; in-person services'], ['Tenant mix', 'Specialty / experience retail: 20–30%; identity and dwell time'],
  ['Tenant selection', 'E-commerce resistance / in-person or immediate collection'], ['Tenant selection', 'Sales density vs. rent affordability; F&B reference rent 6–10% of gross sales'], ['Tenant selection', 'Co-tenancy synergy / complementary trip missions'], ['Tenant selection', 'Active storefront during operating hours'], ['Tenant selection', 'Placemaking: F&B clusters, seating, public realm and programming'],
];
export function featureSummary(assessment?: NovemberAssessment) {
  let possible = 0, earned = 0, reviewed = 0;
  const essentials: NovemberFeature[] = [];
  for (const feature of novemberFeatures) {
    const answer = assessment?.features[feature.id];
    const points = answer?.points ?? feature.points;
    const backed = !!answer?.evidence.trim() && answer.status !== undefined;
    if (backed) reviewed++;
    if (points === 5 || answer?.status !== 'not-applicable' || !backed) possible += points;
    if (backed && answer?.status === 'met') earned += points;
    if (points === 5 && !(backed && answer?.status === 'met')) essentials.push(feature);
  }
  return { possible, earned, reviewed, total: novemberFeatures.length, essentials };
}
