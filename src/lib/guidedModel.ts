import { makeScenario, type HubTier, type Inputs, type Scenario, type Site } from './defaults';
import { createLogisticsReference } from './logisticsReference';
import { novemberFields, novemberOverrides, revenueLines } from './novemberBaseline';

export type SetupMethod = 'scott' | 'november' | 'questions';
export const logisticsQuestions = [
  { key: 'nov_area', label: 'Back-of-house site area', unit: 'SF', section: 'Space' },
  { key: 'nov_rent', label: 'Total annual base rent', unit: '$/year', section: 'Space' },
  { key: 'nov_trikeCount', label: 'Trikes / quads to purchase (including reserves)', unit: 'assets', section: 'Fleet' },
  { key: 'nov_trikeUnit', label: 'Purchase price per trike / quad', unit: '$/asset', section: 'Fleet' },
  { key: 'nov_capex10', label: 'Other site setup / fit-out budget', unit: '$ one-time', section: 'Fleet' },
  { key: 'nov_referenceLaborAnnual', label: 'Total annual wages · riders, manager and admin', unit: '$/year', section: 'Operations' },
  { key: 'nov_referenceOverheadAnnual', label: 'All other annual operating costs · excluding rent and wages', unit: '$/year', section: 'Operations' },
  { key: 'nov_rev0_0', label: 'Annual logistics revenue', unit: '$/year', section: 'Operations' },
  { key: 'nov_rev1_0', label: 'Annual advertising / promotions revenue', unit: '$/year', section: 'Operations' },
] as const;

export function setupBaseline(tier: HubTier, method: SetupMethod): Scenario {
  const base = makeScenario('New site', '', novemberOverrides(tier));
  base.model = 'annual';
  base.novemberKind = tier;
  base.inputs.plannerGuided = true;
  base.inputs.plannerSetupMethod = method;
  base.inputs.plannerFohMode = 'deferred';
  if (method === 'scott') return createLogisticsReference(base);
  // Annual totals collected in the guide replace detailed staffing, not add to it.
  for (const field of novemberFields) {
    if (['November · Staffing', 'November · COGS', 'November · Compensation extras', 'November · Overhead', 'November · Logistics baseline'].includes(field.group) && typeof field.value === 'number') base.inputs[field.key] = 0;
    base.metadata[field.key] = { source: method === 'november' ? 'November fleet preset; operating amounts not supplied — complete the guide or detailed inputs' : 'Not supplied in guided setup', confidence: 'low', validation: true };
  }
  if (method === 'questions') {
    for (const field of novemberFields) if (typeof field.value === 'number') base.inputs[field.key] = 0;
  }
  base.inputs.nov_referenceSource = method === 'november' ? 'November fleet preset + guided annual operating assumptions' : 'Guided annual logistics assumptions';
  return base;
}

export function createGuidedSiteModel(options: {
  name: string; city: string; address: string; tier: HubTier; method: SetupMethod;
  answers: Record<string, string>; fohMode: 'deferred' | 'planning'; fohNotes: string; existingSite?: Site;
}): { site: Site; scenario: Scenario } {
  const { name, city, address, tier, method, answers, fohMode, fohNotes, existingSite } = options;
  const scenario = setupBaseline(tier, method);
  scenario.id = crypto.randomUUID();
  scenario.name = `${name.trim()} · logistics plan`;
  scenario.city = city.trim();
  for (const question of logisticsQuestions) {
    const value = answers[question.key]?.trim() ?? '';
    if (value && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1e9)) throw new Error('Enter a valid non-negative amount');
    scenario.inputs[question.key] = value ? Number(value) : 0;
    scenario.metadata[question.key] = { source: value ? `${method === 'questions' ? 'User-entered guided assumption' : 'Selected baseline / edited guided assumption'}; not verified site actuals` : 'Not supplied in guided setup', confidence: 'low', validation: true };
  }
  scenario.inputs.plannerFohMode = fohMode;
  scenario.inputs.nov_fohEvidenceNotes = fohNotes.trim();
  scenario.metadata.nov_fohEvidenceNotes = { source: fohMode === 'deferred' ? 'Front of house explicitly deferred; not costed' : 'Qualitative front-of-house plan; costs and revenue not yet established', confidence: 'low', validation: true };
  const area = Number(scenario.inputs.nov_area);
  const site: Site = existingSite ? { ...existingSite } : {
    id: crypto.randomUUID(), name: name.trim(), city: city.trim(), address: address.trim() || 'Property not confirmed',
    sf: area, rent: area > 0 ? Number(scenario.inputs.nov_rent) / area : 0,
    score: 0, neighborhood: '', partner: '', status: 'Guided feasibility', tier,
    notes: 'Created through guided logistics modeling. Area, base rent and operating inputs are provisional; NNN, lease terms, facilities and site suitability require evidence.',
  };
  scenario.siteId = site.id;
  return { site, scenario };
}

export function createExampleModel(): Scenario {
  const scenario = setupBaseline('Better', 'scott');
  scenario.name = 'Scott / B-Line · example logistics hub';
  scenario.city = 'Portland reference';
  return scenario;
}

export function planningFlags(scenario: Scenario) {
  const missing = logisticsQuestions.filter(q => scenario.metadata[q.key]?.source === 'Not supplied in guided setup');
  const hasFoh = Number(scenario.inputs.nov_fohSf) > 0 || revenueLines[3].labels.some((_, index) => Number(scenario.inputs[`nov_rev3_${index}`]) > 0);
  return {
    missing,
    foh: scenario.inputs.plannerFohMode === 'planning' ? 'Front of house: qualitative only · costs and income incomplete' : hasFoh ? 'Front of house deferred, but entered allocation / revenue remains included' : 'Front of house deferred · not costed; no income assumed',
  };
}

export function initialAnswers(scenario: Scenario): Record<string, string> {
  return Object.fromEntries(logisticsQuestions.map(q => [q.key, scenario.metadata[q.key]?.source === 'Not supplied in guided setup' || Number(scenario.inputs[q.key]) === 0 ? '' : String(scenario.inputs[q.key])]));
}

export function annualInputFields(inputs: Inputs) {
  return logisticsQuestions.map(q => ({ ...novemberFields.find(field => field.key === q.key)!, label: q.label, group: q.section, value: Number(inputs[q.key]) }));
}
