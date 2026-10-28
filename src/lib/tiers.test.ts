import { describe, expect, it } from 'vitest';
import { calculate } from './calc';
import { defaultInputs, fields, initialWorkspace, type HubTier } from './defaults';
import { criteriaForSite, scorecardSummary, validTierWeights, type SiteScorecard } from './siteScorecard';
import { confirmationItems, tierComparison, tierCriteria, tierDefinitions, tierOrder, tierPins } from './tiers';
import { parseWorkspace } from './workspace';

function sampleWeights(tier: HubTier) {
  const criteria = tierCriteria(tier);
  return Object.fromEntries(criteria.map((c, index) => [c.code, index === criteria.length - 1 ? 100 - Math.floor(100 / criteria.length) * (criteria.length - 1) : Math.floor(100 / criteria.length)]));
}

describe('tier-aware scorecards', () => {
  for (const tier of tierOrder) it(`scores a confirmed ${tier} sample and requires its own gates`, () => {
    const card: SiteScorecard = {
      answers: Object.fromEntries(tierCriteria(tier).map(c => [c.code, { rating: 2, evidence: 'Test fixture evidence, not planning data' }])),
      tierWeights: { [tier]: sampleWeights(tier) },
      gates: Object.fromEntries(tierDefinitions[tier].gates.map(g => [`${tier}:${g.label}`, true])),
    };
    expect(scorecardSummary(card, tier).score).toBe(100);
    expect(scorecardSummary(card, tier).classification).toBe('Go');
    card.gates = { 'Best:Visible corner / storefront': true, unrelated: true, another: true, extra: true, ignored: true };
    expect(scorecardSummary(card, tier).classification).toBe('Gates pending');
    expect(scorecardSummary(card, tier).gatesPassed).toBe(tier === 'Best' ? 1 : 0);
  });
  it('does not invent weights or score unconfirmed Good and Best defaults', () => {
    for (const tier of ['Good', 'Best'] as const) {
      expect(tierCriteria(tier).every(c => c.weight === 0)).toBe(true);
      expect(scorecardSummary(undefined, tier).score).toBeNull();
      expect(scorecardSummary(undefined, tier).classification).toBe('Weights need confirmation');
    }
  });
  it('validates totals and scopes saved weights independently', () => {
    expect(validTierWeights('Good', { g1: 100 })).toBe(false);
    expect(validTierWeights('Good', { ...sampleWeights('Good'), g1: -1 })).toBe(false);
    expect(validTierWeights('Good', sampleWeights('Good'))).toBe(true);
    const site = initialWorkspace().sites.find(s => s.id === 'capitol')!;
    site.scorecard = { answers: {}, weights: { '1a': 99 }, weightsTier: 'Better', tierWeights: { Good: sampleWeights('Good') } };
    expect(criteriaForSite(site).find(c => c.code === '1a')?.weight).toBe(0);
    site.tier = 'Better';
    expect(criteriaForSite(site).find(c => c.code === '1a')?.weight).toBe(99);
    expect(scorecardSummary(site.scorecard, 'Better').score).toBeNull();
  });
});

describe('tier economics', () => {
  it('calculates Good startup, operations and cash recovery without leaking logistics defaults', () => {
    const inputs = { ...defaultInputs, hubTier: 'Good', goodPods: 2, goodPodCost: 5000, goodTrikes: 3, goodTrikeCost: 12000, goodStartup: 10000, goodRentMonthly: 1000, goodAnnualRevenue: 100000, goodOperatingCost: 60000, goodSf: 600, grant: 999999, coffeeRev: 999999 };
    const m = calculate(inputs);
    expect(m.startup).toBe(56000);
    expect(m.years.map(y => y.profit)).toEqual([28000, 28000, 28000]);
    expect(m.breakEven).toBe(1);
    expect(m.payback).toBe(2);
    expect(m.grantApplied).toBe(0);
    expect(m.logisticsSf).toBe(600);
    expect(calculate({ ...defaultInputs, hubTier: 'Good' }).breakEven).toBeNull();
    const row = tierComparison(inputs)[0];
    expect(row.breakEvenRevenue).toBe(72000);
    expect(row.rentCeiling).toBeCloseTo(40000 / 12);
  });
  it('keeps Better unchanged and includes annual amenity costs only for Best', () => {
    const base = { ...defaultInputs, damage: 0, sharing: 0 };
    const withFoh = { ...base, coffeeRev: 10000, coffeeCost: 3000, coffeeSf: 200 };
    expect(calculate(withFoh)).toEqual(calculate(base));
    const best = calculate({ ...withFoh, hubTier: 'Best' });
    const better = calculate(base);
    expect(best.years[0].communityRevenue - better.years[0].communityRevenue).toBeCloseTo(7000);
    expect(best.years[0].other - better.years[0].other).toBe(3000);
    expect(best.years[0].profit - better.years[0].profit).toBeCloseTo(4000);
    expect(best.logisticsSf).toBe(2800);
    expect(best.communitySf).toBe(200);
    const rows = tierComparison(withFoh);
    expect(rows[1].startup).toBe(better.startup);
    expect(rows[1].profit).toBe(better.years[0].profit);
    expect(rows[2].sf).toBe('3,000 SF');
    expect(rows[2].breakEvenRevenue! - rows[1].breakEvenRevenue!).toBeCloseTo(3000);
  });
  it('reconciles every tier and handles nonpositive margins', () => {
    for (const tier of tierOrder) {
      const m = calculate({ ...defaultInputs, hubTier: tier });
      let cash = -m.startup;
      for (const year of m.years) {
        expect(year.profit).toBeCloseTo(year.revenue - year.costs);
        expect(year.costs).toBeCloseTo(year.rent + year.labor + year.fleet + year.other + year.cogs + year.damage + year.sharing);
        cash += year.profit;
        expect(year.cumulative).toBeCloseTo(cash);
      }
    }
    expect(tierComparison({ ...defaultInputs, damage: 100 })[1].breakEvenRevenue).toBeNull();
    expect(tierComparison({ ...defaultInputs, price: 0 })[1].rentCeiling).toBeLessThan(0);
  });
});

describe('safe tier workspace migration', () => {
  it('runs tagging and Pike Place addition once without restoring other deleted records', () => {
    const w = initialWorkspace();
    delete w.hubTierUpdate;
    w.sites = w.sites.filter(s => s.id !== 'pike-place-pop-up' && s.id !== 'stanford');
    const sodo = w.sites.find(s => s.id === 'sodo')!;
    delete sodo.tier;
    sodo.notes = 'User edits preserved';
    const migrated = parseWorkspace(JSON.stringify(w));
    expect(migrated.sites.find(s => s.id === 'sodo')?.tier).toBe('Better');
    expect(migrated.sites.find(s => s.id === 'sodo')?.notes).toBe('User edits preserved');
    expect(migrated.sites.some(s => s.id === 'stanford')).toBe(false);
    expect(migrated.sites.some(s => s.id === 'pike-place-pop-up')).toBe(true);
    migrated.sites = migrated.sites.filter(s => s.id !== 'pike-place-pop-up');
    delete migrated.sites.find(s => s.id === 'sodo')!.tier;
    const again = parseWorkspace(JSON.stringify(migrated));
    expect(again.sites.some(s => s.id === 'pike-place-pop-up')).toBe(false);
    expect(again.sites.find(s => s.id === 'sodo')?.tier).toBeUndefined();
    expect(parseWorkspace(JSON.stringify(again))).toEqual(again);
  });
  it('retains legacy scorecard evidence, edits and gates while preventing cross-tier gate reuse', () => {
    const w = initialWorkspace();
    const site = w.sites.find(s => s.id === 'sodo')!;
    site.scorecard = { answers: { '1a': { rating: 2, evidence: 'Existing quote' } }, weights: { '1a': 12 }, gates: { 'Use permitted': true } };
    const imported = parseWorkspace(JSON.stringify(w));
    const saved = imported.sites.find(s => s.id === site.id)!;
    expect(saved.score).toBe(site.score);
    expect(saved.scorecard?.answers).toEqual(site.scorecard.answers);
    expect(saved.scorecard?.weights).toEqual(site.scorecard.weights);
    expect(saved.scorecard?.weightsTier).toBe('Better');
    expect(saved.scorecard?.gates?.['Better:Use permitted']).toBe(true);
    expect(scorecardSummary(saved.scorecard, 'Best').gatesPassed).toBe(0);
  });
  it('backfills new inputs, preserves values, and persists tier and map edits', () => {
    const w = initialWorkspace();
    delete w.scenarios[0].inputs.goodAnnualRevenue;
    delete w.scenarios[0].inputs.hubTier;
    w.scenarios[0].inputs.coffeeRev = 2500;
    w.tierPinLocations = { [tierPins[0].id]: { lat: 45.5, lng: -122.6 } };
    const imported = parseWorkspace(JSON.stringify(w));
    expect(imported.scenarios[0].inputs.hubTier).toBe('Best');
    expect(imported.scenarios[0].inputs.goodAnnualRevenue).toBe(0);
    expect(imported.scenarios[0].inputs.coffeeRev).toBe(2500);
    expect(imported.tierPinLocations).toEqual(w.tierPinLocations);
  });
  it('rejects invalid saved tier weights and out-of-range coordinates', () => {
    const w = initialWorkspace();
    w.sites[0].scorecard = { answers: {}, tierWeights: { Good: { ...sampleWeights('Good'), g1: 0 } } };
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow(/weights must total 100/);
    delete w.sites[0].scorecard;
    w.tierPinLocations = { invalid: { lat: 91, lng: 0 } };
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow();
  });
});

describe('confirmation tracking', () => {
  it('keeps entered but unvalidated values flagged and allows confirmed zero', () => {
    const w = initialWorkspace();
    const active = w.scenarios[0];
    active.inputs.coffeeRev = 1000;
    expect(confirmationItems(active.inputs, active.metadata, w).some(i => i.key === 'coffeeRev')).toBe(true);
    active.inputs.coffeeRev = 0;
    active.metadata.coffeeRev.validation = false;
    expect(confirmationItems(active.inputs, active.metadata, w).some(i => i.key === 'coffeeRev')).toBe(false);
    expect(confirmationItems(active.inputs, active.metadata, w).some(i => i.key === 'tier-georgetown')).toBe(true);
    expect(confirmationItems(active.inputs, active.metadata, w).some(i => i.key === 'weights-capitol')).toBe(true);
    expect(confirmationItems(active.inputs, active.metadata, w).some(i => i.key === `pin-${tierPins[0].id}`)).toBe(true);
  });
  it('starts unspecified economics at zero and omits invented coordinates', () => {
    expect(fields.filter(f => f.confirm).every(f => f.value === 0)).toBe(true);
    expect(tierPins.every(pin => !('lat' in pin) && !('lng' in pin))).toBe(true);
    expect(initialWorkspace().sites.find(s => s.id === 'pike-place-pop-up')?.rent).toBe(0);
  });
});
