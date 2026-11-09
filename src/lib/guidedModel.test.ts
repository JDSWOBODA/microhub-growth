import { describe, expect, it } from 'vitest';
import { annualInputFields, createExampleModel, createGuidedSiteModel, initialAnswers, logisticsQuestions, planningFlags, setupBaseline } from './guidedModel';
import { initialWorkspace, type HubTier } from './defaults';
import { calculateNovember } from './novemberBaseline';
import { calculateScott, scottDefaults } from './scottModel';
import { parseWorkspace } from './workspace';

const baseOptions = {
  name: 'New logistics site', city: 'Seattle', address: '', tier: 'Better' as HubTier,
  method: 'questions' as const, answers: {}, fohMode: 'deferred' as const, fohNotes: '',
};

describe('guided logistics-first site modeling', () => {
  it('offers a sourced, independent example without copying grants or profit sharing', () => {
    const example = createExampleModel();
    const result = calculateNovember(example.inputs);
    const scott = calculateScott(scottDefaults);
    expect(result.years[0].revenue).toBe(scott.revenue);
    expect(result.years[0].profit).toBe(scott.beforeShare);
    expect(result.grantApplied).toBe(0);
    expect(example.inputs.plannerGuided).toBe(true);
    expect(example.inputs.plannerFohMode).toBe('deferred');
    expect(example.inputs.nov_rev3_0).toBe(0);
    expect(createExampleModel().id).not.toBe(example.id);
  });

  it('keeps unknown question answers blank and flags their zero-valued calculation', () => {
    const baseline = setupBaseline('Good', 'questions');
    expect(Object.values(initialAnswers(baseline)).every(value => value === '')).toBe(true);
    const { site, scenario } = createGuidedSiteModel(baseOptions);
    expect(scenario.siteId).toBe(site.id);
    expect(site.score).toBe(0);
    expect(planningFlags(scenario).missing).toHaveLength(logisticsQuestions.length);
    expect(calculateNovember(scenario.inputs).years[0].costs).toBe(0);
    expect(planningFlags(scenario).foh).toContain('deferred');
  });

  it('calculates walked-through annual inputs exactly once and does not infer front-of-house income', () => {
    const answers = {
      nov_area: '2000', nov_rent: '30000', nov_trikeCount: '2', nov_trikeUnit: '16000', nov_capex10: '5000',
      nov_referenceLaborAnnual: '180000', nov_referenceOverheadAnnual: '25000', nov_rev0_0: '300000', nov_rev1_0: '0',
    };
    const { scenario, site } = createGuidedSiteModel({ ...baseOptions, answers, fohMode: 'planning', fohNotes: 'Partner might operate a coffee counter; responsibilities unknown.' });
    const result = calculateNovember(scenario.inputs);
    expect(result.startup).toBe(37000);
    expect(result.years[0].costs).toBe(235000);
    expect(result.years[0].profit).toBe(65000);
    expect(result.years[2].profit).toBe(result.years[0].profit);
    expect(result.years[0].communityRevenue).toBe(0);
    expect(site.rent).toBe(15);
    expect(planningFlags(scenario).missing).toHaveLength(0);
    expect(planningFlags(scenario).foh).toContain('incomplete');
    expect(scenario.metadata.nov_rent.validation).toBe(true);
  });

  it('preserves the selected November fleet and uses annual wage totals without detailed duplicates', () => {
    for (const tier of ['Good', 'Better', 'Best'] as const) {
      const baseline = setupBaseline(tier, 'november');
      const answers = { ...initialAnswers(baseline), nov_referenceLaborAnnual: '100000', nov_referenceOverheadAnnual: '20000' };
      const { scenario } = createGuidedSiteModel({ ...baseOptions, tier, method: 'november', answers });
      expect(scenario.inputs.nov_trikeCount).toBe(tier === 'Good' ? 2 : 6);
      expect(scenario.inputs.nov_evanCount).toBe(tier === 'Best' ? 1 : 0);
      expect(calculateNovember(scenario.inputs).years[0].labor).toBe(100000);
      expect(calculateNovember(scenario.inputs).years[0].other).toBe(20000);
    }
  });

  it('retains existing sites and scenarios when creating a linked guided model', () => {
    const workspace = initialWorkspace();
    const snapshot = JSON.stringify(workspace);
    const existingSite = workspace.sites[0];
    const { site, scenario } = createGuidedSiteModel({ ...baseOptions, existingSite });
    expect(site).toEqual(existingSite);
    expect(scenario.siteId).toBe(existingSite.id);
    expect(JSON.stringify(workspace)).toBe(snapshot);
    const parsed = parseWorkspace(JSON.stringify({ ...workspace, activeId: scenario.id, scenarios: [...workspace.scenarios, scenario] }));
    expect(parsed.scenarios.find(s => s.id === scenario.id)).toEqual(scenario);
    expect(parsed.sites).toEqual(workspace.sites);
  });

  it('round-trips setup status and notes while validating imported choices', () => {
    const workspace = initialWorkspace();
    const { site, scenario } = createGuidedSiteModel({ ...baseOptions, fohMode: 'planning', fohNotes: 'Operator quote still needed' });
    const saved = { ...workspace, sites: [...workspace.sites, site], scenarios: [...workspace.scenarios, scenario], activeId: scenario.id };
    const parsed = parseWorkspace(JSON.stringify(saved));
    expect(parsed.scenarios.at(-1)?.inputs.plannerFohMode).toBe('planning');
    expect(parsed.scenarios.at(-1)?.inputs.nov_fohEvidenceNotes).toBe('Operator quote still needed');
    expect(planningFlags(parsed.scenarios.at(-1)!).missing).toHaveLength(logisticsQuestions.length);
    scenario.inputs.plannerFohMode = 'complete';
    expect(() => parseWorkspace(JSON.stringify(saved))).toThrow();
  });

  it('rejects invalid amounts and keeps each simplified question in one section', () => {
    for (const value of ['-1', 'Infinity', 'not a number', '1000000001']) {
      expect(() => createGuidedSiteModel({ ...baseOptions, answers: { nov_rent: value } })).toThrow();
    }
    const fields = annualInputFields(setupBaseline('Better', 'scott').inputs);
    expect(new Set(fields.map(field => field.key)).size).toBe(logisticsQuestions.length);
    expect(fields.filter(field => field.group === 'Space').map(field => field.key)).toEqual(['nov_area', 'nov_rent']);
  });

  it('warns that entered front-of-house figures still count while planning is deferred', () => {
    const example = createExampleModel();
    example.inputs.nov_rev3_0 = 10000;
    expect(planningFlags(example).foh).toContain('remains included');
    expect(calculateNovember(example.inputs).years[0].communityRevenue).toBe(10000);
  });
});
