import type { HubTier } from './defaults';
import { tierCriteria, tierDefinitions, tierForSite, weightsTotal, type TierCriterion } from './tiers';
import type { Site } from './defaults';

export type ScorecardAnswer = { rating?: 0 | 1 | 2; evidence: string };
export type SiteScorecard = { answers: Record<string, ScorecardAnswer>; weights?: Record<string, number>; gates?: Record<string, boolean> };
export const scorecardDimensions = (tier: HubTier) => [...new Set(tierCriteria(tier).map(c => c.dimension))];
export function criteriaForSite(site: Site): TierCriterion[] { return weightedCriteria(tierForSite(site), site.scorecard?.weights); }
export function weightedCriteria(tier: HubTier, weights?: Record<string, number>) { return tierCriteria(tier).map(c => ({ ...c, weight: weights?.[c.code] ?? c.weight })); }
export function answerComplete(answer?: ScorecardAnswer) {
  return answer?.rating !== undefined && !!answer.evidence.trim();
}
export function scorecardSummary(card?: SiteScorecard, tier: HubTier = 'Better') {
  const criteria = weightedCriteria(tier, card?.weights);
  let completed = 0, weight = 0, points = 0;
  for (const criterion of criteria) {
    const answer = card?.answers[criterion.code];
    if (answerComplete(answer)) {
      completed++;
      weight += criterion.weight;
      points += criterion.weight * answer!.rating! / 2;
    }
  }
  const total = weightsTotal(criteria);
  const gateCount = tierDefinitions[tier].gates.length;
  const gatesPassed = Object.values(card?.gates ?? {}).filter(Boolean).length;
  const score = weight ? points / weight * 100 : null;
  const classification = total !== 100 ? 'Weights must total 100' : gatesPassed < gateCount ? 'Gates pending' : weight < 60 ? 'Incomplete assessment' : score! >= 75 ? 'Go' : score! >= 60 ? 'Promising' : score! >= 45 ? 'Watch' : 'Deprioritize';
  return { completed, progress: completed / criteria.length * 100, weight, totalWeight: total, score, classification, gatesPassed, gateCount };
}
export const criterionPrompts: Record<string, string> = {
  '1a': 'Record quoted base rent, NNN/CAM and other occupancy costs. Compare all-in occupancy with your chosen model’s ceiling; identify the model and assumptions used.',
  '1b': 'Document lease term, concessions, shared-space options, expansion rights and the landlord’s willingness to negotiate.',
  '2a': 'Describe delivery demand within the service area, customer density and travel time from the hub to delivery routes.',
  '2b': 'Identify prospective anchor customers and distinguish signed commitments from conversations or leads.',
  '2c': 'Describe customer diversification, seasonality and realistic promotional revenue opportunities.',
  '3a': 'Check parcel zoning and permitted activities with the local authority, including storage, delivery operations and any public-facing uses.',
  '3b': 'Record usable area and layout, compare with the tier’s module target, and document circulation, storage and workspace fit.',
  '3c': 'Describe loading doors, curb access, loading restrictions, staging space and conflicts with other users.',
  '3d': 'Document electrical service, charging capacity, outlet locations and any upgrade requirements.',
  '3e': 'Compare expected delivery throughput with vehicle storage, staging, staff space and building constraints.',
  '3f': 'Confirm whether essential operations can occur on one level; document stairs, lifts and access limitations.',
  '3g': 'Describe refrigeration needs, existing equipment, temperature control and food-handling requirements.',
  '4a': 'Describe connections to bike and low-speed streets serving the intended customer area; record gaps or detours.',
  '4b': 'Document terrain, intersections, traffic exposure and route observations, including a field ride when possible.',
  '4c': 'Check feeder-van approach routes, truck restrictions, access geometry and delivery windows.',
  '5a': 'Identify relevant city plans, freight initiatives or low-pollution policies and explain the site’s alignment.',
  '5b': 'Name a public or partner champion and document their role and level of commitment.',
  '5c': 'Identify funding programs and verify location, use, applicant and timing eligibility; do not assume an award.',
  '6a': 'Describe community benefits, co-location opportunities and stakeholder feedback or concerns.',
  '6b': 'Explain how this hub supports a broader network and whether its operating arrangement can be replicated.',
  g1: 'Confirm the city or landowner agreement, permit path, insurance requirements and allowed duration.',
  g2: 'Confirm power access, charger placement and safe cable management for a pod-based site.',
  g3: 'Record how trucks reach the receiving point, dwell time, conflicts and turning constraints.',
  g4: 'Describe nearby delivery demand, businesses, residences and walk-up pickup potential.',
  g5: 'Name the city sponsor, landowner champion or institutional partner and their commitment level.',
  b1: 'Document corner visibility, frontage, signage potential and public-facing presence.',
  b2: 'Describe residential density, walk-up demand and the connection to everyday neighborhood trips.',
  b3: 'Identify confirmed or prospective childcare, coffee/bodega, tool-library or refillery partners.',
  b4: 'Confirm cold storage, food-handling needs and upgrade requirements.',
  b5: 'Explain civic co-benefits such as resilience, access, local business support and public value.',
};
