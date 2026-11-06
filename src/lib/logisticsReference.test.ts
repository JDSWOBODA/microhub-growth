import { describe, expect, it } from 'vitest';
import { initialWorkspace } from './defaults';
import { addLogisticsReferences, createLogisticsReference } from './logisticsReference';
import { calculateNovember } from './novemberBaseline';
import { calculateScott, scottDefaults, scottMetadata } from './scottModel';
import { parseWorkspace } from './workspace';

const best = () => initialWorkspace().scenarios.find(s => s.novemberKind === 'Best' && !s.inputs.nov_referenceSource)!;

describe('logistics-first reference economics', () => {
  it('reconciles exactly to Scott pre-share operations without duplicating labor or overhead', () => {
    const scenario = createLogisticsReference(best());
    const model = calculateNovember(scenario.inputs);
    const scott = calculateScott(scottDefaults);
    expect(model.years[0].revenue).toBe(scott.revenue);
    expect(model.years[0].costs).toBe(Number(scottDefaults.deliveryLabor) + scott.opex);
    expect(model.years[0].profit).toBe(scott.beforeShare);
    expect(model.years[0].labor).toBe(Number(scottDefaults.deliveryLabor) + Number(scottDefaults.gm) + Number(scottDefaults.admin));
    expect(scenario.inputs.nov_staff0Hours).toBe(0);
    expect(scenario.inputs.nov_weeks).toBe(0);
    expect(scenario.metadata.nov_referenceLaborAnnual.validation).toBe(true);
    expect(scenario.metadata.nov_referenceLaborAnnual.source).toContain('starting baseline, not verified site actuals');
    expect(model.startup).toBe(calculateNovember(best().inputs).startup);
  });

  it('uses a saved Scott snapshot and retains front-of-house numbers and notes', () => {
    const target = best();
    target.inputs.nov_rev3_0 = 17000;
    target.inputs.nov_fohStaffNotes = 'Partner-operated; coverage and insurance need discussion.';
    target.inputs.nov_overhead0 = 8000;
    target.inputs.nov_staff0Rate = 32;
    target.inputs.nov_staff0Hours = 40;
    const source = initialWorkspace().scenarios[0];
    source.scott = { inputs: { ...scottDefaults, deliveryLabor: 210000, rentAnnual: 60000 }, metadata: structuredClone(scottMetadata) };
    const before = structuredClone({ target, source });
    const copy = createLogisticsReference(target, source);
    expect({ target, source }).toEqual(before);
    expect(copy.inputs.nov_rev3_0).toBe(17000);
    expect(copy.inputs.nov_fohStaffNotes).toBe(target.inputs.nov_fohStaffNotes);
    expect(copy.inputs.nov_overhead0).toBe(0);
    expect(copy.inputs.nov_staff0Rate).toBe(0);
    expect(calculateNovember(copy.inputs).years[0].profit).toBe(calculateScott(source.scott.inputs).beforeShare + 17000);
    source.scott.inputs.deliveryLabor = 999;
    expect(copy.inputs.nov_referenceLaborAnnual).toBe(210000 + Number(scottDefaults.gm) + Number(scottDefaults.admin));
  });

  it('keeps qualitative notes out of the P&L and retains additive numeric inputs', () => {
    const copy = createLogisticsReference(best());
    const before = calculateNovember(copy.inputs);
    copy.inputs.nov_fohBuildoutNotes = 'Needs landlord contribution; costs not yet known.';
    copy.inputs.nov_fohPartnerNotes = 'Operator to cover utilities.';
    expect(calculateNovember(copy.inputs)).toEqual(before);
    copy.inputs.nov_rev3_8 = 9000;
    copy.inputs.nov_overhead1 = 2000;
    expect(calculateNovember(copy.inputs).years[0].profit).toBe(before.years[0].profit + 7000);
  });
});

describe('reference workspace preservation', () => {
  it('adds references once to an existing workspace without changing original scenarios or actuals', () => {
    const workspace = initialWorkspace();
    workspace.scenarios = workspace.scenarios.filter(s => !s.inputs.nov_referenceSource);
    delete workspace.logisticsReferenceUpdate;
    const original = structuredClone(workspace);
    const migrated = addLogisticsReferences(workspace);
    expect(workspace).toEqual(original);
    expect(migrated.activeId).toBe(original.activeId);
    expect(migrated.scenarios.slice(0, original.scenarios.length)).toEqual(original.scenarios);
    expect(migrated.scenarios).toHaveLength(original.scenarios.length + 3);
    expect(addLogisticsReferences(migrated)).toBe(migrated);
    expect(migrated.scenarios.filter(s => s.inputs.nov_referenceSource).every(s => !['Redd', 'Alder'].includes(s.novemberKind!))).toBe(true);
  });

  it('round-trips notes, sources and costs and respects edited or deleted reference copies', () => {
    const workspace = initialWorkspace();
    const reference = workspace.scenarios.find(s => s.inputs.nov_referenceSource)!;
    reference.inputs.nov_referenceLaborAnnual = 123456;
    reference.inputs.nov_fohEvidenceNotes = 'Directional discussion only; no confirmed quote.';
    workspace.scenarios = workspace.scenarios.filter(s => s.id !== 'nov-logistics-reference-best');
    const loaded = parseWorkspace(JSON.stringify(workspace));
    expect(loaded.scenarios.find(s => s.id === reference.id)).toEqual(reference);
    expect(loaded.scenarios.some(s => s.id === 'nov-logistics-reference-best')).toBe(false);
    expect(loaded.logisticsReferenceUpdate).toBe(1);
  });
});
