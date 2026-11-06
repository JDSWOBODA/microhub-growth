import { describe, expect, it } from 'vitest';
import { addNovemberBaselines, defaultInputs, initialWorkspace, type Workspace } from './defaults';
import { calculate } from './calc';
import { assetLines, calculateNovember, novemberOverrides } from './novemberBaseline';
import { featureSummary, novemberFeatures, type NovemberAssessment } from './novemberCriteria';
import { parseWorkspace } from './workspace';

const findFeature = (label: string) => novemberFeatures.find(feature => feature.label === label)!;

describe('November source baselines', () => {
  it('adds five independent scenarios once without modifying existing inputs or active selection', () => {
    const w = initialWorkspace();
    const oldScenarios = structuredClone(w.scenarios.filter(s => !s.novemberKind));
    expect(w.scenarios.filter(s => s.novemberKind)).toHaveLength(5);
    expect(w.activeId).toBe(oldScenarios[0].id);
    expect(addNovemberBaselines(w)).toBe(w);
    expect(w.scenarios.filter(s => !s.novemberKind)).toEqual(oldScenarios);
    const loaded = parseWorkspace(JSON.stringify(w));
    expect(loaded.scenarios.filter(s => !s.novemberKind)).toEqual(oldScenarios);
    expect(loaded.scenarios.filter(s => s.novemberKind)).toHaveLength(5);
  });
  it('migrates older workspaces once and respects deleted or edited baselines afterwards', () => {
    const w = initialWorkspace();
    w.scenarios = w.scenarios.filter(s => !s.novemberKind);
    delete w.novemberUpdate;
    const imported = parseWorkspace(JSON.stringify(w));
    expect(imported.scenarios).toHaveLength(w.scenarios.length + 5);
    const good = imported.scenarios.find(s => s.novemberKind === 'Good')!;
    good.inputs.nov_trikeUnit = 19000;
    imported.scenarios = imported.scenarios.filter(s => s.novemberKind !== 'Alder');
    const reloaded = parseWorkspace(JSON.stringify(imported));
    expect(reloaded.scenarios.find(s => s.novemberKind === 'Good')?.inputs.nov_trikeUnit).toBe(19000);
    expect(reloaded.scenarios.some(s => s.novemberKind === 'Alder')).toBe(false);
  });
  it('uses requested low-end costs and source counts, not inferred paid hours or wages', () => {
    for (const tier of ['Good', 'Better', 'Best'] as const) {
      const i = novemberOverrides(tier);
      expect(i.nov_trikeCount).toBe(tier === 'Good' ? 2 : 6);
      expect(i.nov_bikeCount).toBe(tier === 'Good' ? 2 : 4);
      expect(i.nov_reserve).toBe(tier === 'Good' ? 0 : 2);
      expect(i.nov_staff0Count).toBe(tier === 'Good' ? 5 : 6);
      expect(i.nov_staff1Count).toBe(1);
      expect(i.nov_staff2Count).toBe(1);
      expect(i.nov_staff4Count).toBe(1);
      expect(i.nov_staff3Count).toBe(tier === 'Best' ? 1 : 0);
      expect(i.nov_evanCount).toBe(tier === 'Best' ? 1 : 0);
      expect(i.nov_staff1Hours).toBe(0);
      expect(i.nov_weeks).toBe(0);
      expect(i.nov_hours).toBe(6);
      expect(i.nov_days).toBe(6);
      for (const asset of assetLines) expect(i[`nov_${asset.key}Unit`]).toBe(asset.low);
    }
  });
  it('starts Redd/Alder cases with no invented actual figures', () => {
    const actuals = initialWorkspace().scenarios.filter(s => s.novemberKind === 'Redd' || s.novemberKind === 'Alder');
    expect(actuals).toHaveLength(2);
    for (const s of actuals) {
      expect(Object.entries(s.inputs).filter(([key, value]) => key.startsWith('nov_') && typeof value === 'number').every(([, value]) => value === 0)).toBe(true);
      expect(calculate(s.inputs).breakEven).toBeNull();
      expect(calculate(s.inputs).startup).toBe(0);
    }
  });
  it('leaves the existing annual engine unchanged and opts into November explicitly', () => {
    const base = calculate(defaultInputs);
    expect(calculate({ ...defaultInputs, nov_trikeCount: 100, nov_staff0Rate: 99 })).toEqual(base);
    expect(calculate({ ...defaultInputs, ...novemberOverrides('Good') }).startup).toBe(46000);
  });
});

describe('detailed November calculations', () => {
  it('posts one-time capex separately, reconciles every year and does not operate reserves twice', () => {
    const i = { ...defaultInputs, ...novemberOverrides('Better'), nov_weeks: 50, nov_staff0Rate: 20, nov_staff0Hours: 36, nov_capex8: 10000, nov_rent: 24000, nov_cogs1: 1000, nov_payroll3: 10000, nov_overhead1: 5000, nov_rev0_0: 350000, nov_rev1_0: 50000, nov_rev2_0: 10000 };
    const m = calculateNovember(i);
    expect(m.equipment).toBe(6 * 16000 + 4 * 7000);
    expect(m.startup).toBe(m.equipment + 10000);
    expect(m.years[0].labor).toBe(6 * 20 * 36 * 50 + 10000);
    expect(m.years[0].revenue).toBe(410000);
    let cash = -m.startup;
    for (const year of m.years) {
      expect(year.costs).toBe(year.rent + year.labor + year.fleet + year.other + year.cogs + year.damage + year.sharing);
      expect(year.profit).toBe(year.revenue - year.costs);
      cash += year.profit;
      expect(year.cumulative).toBe(cash);
    }
    expect(calculateNovember({ ...i, nov_reserve: 0 }).equipment).toBe(m.equipment);
    expect(m.payback).toBe(1);
  });
  it('keeps per-asset research diagnostic and annualizes only confirmed weeks', () => {
    const i = { ...novemberOverrides('Good'), nov_weeks: 50, nov_trikeRevenueHour: 30, nov_trikeCostHour: 10 };
    const m = calculateNovember(i);
    expect(m.research[0].annualHours).toBe(1800);
    expect(m.research[0].revenue).toBe(54000);
    expect(m.research[0].directCost).toBe(18000);
    expect(m.years[0].revenue).toBe(0);
    expect(m.years[0].costs).toBe(0);
    expect(m.breakEven).toBeNull();
  });
  it('caps HQ savings at overhead and does not subtract grants from equipment', () => {
    const i = { ...novemberOverrides('Best'), nov_overhead1: 1000, nov_hqCredit: 5000, nov_rev4_0: 30000, grant: 500000 };
    const m = calculateNovember(i);
    expect(m.hqCredit).toBe(1000);
    expect(m.years[0].other).toBe(0);
    expect(m.years[0].revenue).toBe(30000);
    expect(m.grantApplied).toBe(0);
    expect(m.startup).toBe(m.equipment);
  });
});

describe('independent feature assessments', () => {
  it('deduplicates templates and preserves explicit Franklin adjustments and original points', () => {
    expect(novemberFeatures).toHaveLength(69);
    expect(new Set(novemberFeatures.map(f => f.label)).size).toBe(69);
    expect(findFeature('Loading dock')).toMatchObject({ printed: 1, points: 2 });
    expect(findFeature('Roll-up door')).toMatchObject({ printed: 3, points: 4 });
    expect(findFeature('Near a bike sales shop')).toMatchObject({ printed: 3, points: 2 });
    expect(findFeature('Scooter charging battery bank')).toMatchObject({ printed: 4, points: 2 });
    expect(findFeature('500 SF community room').points).toBe(4);
  });
  it('requires evidence, awards only fully-met points and cannot clear critical features with N/A', () => {
    const critical = findFeature('300 SF cross-docking area');
    const noncritical = findFeature('Loading dock');
    const card: NovemberAssessment = { features: { [critical.id]: { owner: 'Team', status: 'met', evidence: '' } }, context: {} };
    expect(featureSummary(card).earned).toBe(0);
    card.features[critical.id].evidence = 'Measured plan';
    expect(featureSummary(card).earned).toBe(5);
    expect(featureSummary(card).essentials.some(f => f.id === critical.id)).toBe(false);
    card.features[critical.id].status = 'not-applicable';
    const before = featureSummary(card);
    expect(before.essentials.some(f => f.id === critical.id)).toBe(true);
    card.features[noncritical.id] = { owner: '', status: 'not-applicable', evidence: 'Ground-level receiving alternative' };
    expect(featureSummary(card).possible).toBe(before.possible - 2);
  });
  it('round-trips feature owners, evidence, priorities and tenant research without altering scores', () => {
    const w = initialWorkspace();
    w.sites[0].novemberAssessment = { features: { 'fj-1': { status: 'partial', points: 4, owner: 'Franklin', evidence: 'Measured 250 SF' } }, context: { 'prompt-0': 'City champion follow-up', tenantRent: '10000', tenantSales: '200000', anchorMix: '35' } };
    const imported = parseWorkspace(JSON.stringify(w));
    expect(imported.sites[0].novemberAssessment).toEqual(w.sites[0].novemberAssessment);
    expect(imported.sites[0].score).toBe(w.sites[0].score);
    expect(imported.sites[0].scorecard).toBeUndefined();
  });
  it('rejects invalid priority and assessment state at the import boundary', () => {
    const w = initialWorkspace() as Workspace;
    w.sites[0].novemberAssessment = { features: { 'fj-1': { owner: '', evidence: '', points: 6 } }, context: {} };
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow();
  });
});
