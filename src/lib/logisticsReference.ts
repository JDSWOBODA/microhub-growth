import type { Scenario, Workspace } from './defaults';
import { novemberFields, revenueLines } from './novemberBaseline';
import { scottDefaults, scottFields, scottMetadata, scottState } from './scottModel';

export function createLogisticsReference(target: Scenario, source?: Scenario): Scenario {
  const reference = source ? scottState(source) : { inputs: scottDefaults, metadata: scottMetadata };
  const sourceName = source ? `${source.name} · Scott inputs snapshot` : 'Expansion Model-2026 · 1-HUB.csv reconstruction';
  const copy = structuredClone(target);
  copy.id = crypto.randomUUID();
  copy.name = `Logistics-first · ${target.inputs.hubTier} · ${source ? source.name : 'Scott baseline'}`;
  copy.model = 'annual';
  delete copy.scott;
  const laborKeys = ['deliveryLabor', 'gm', 'admin'];
  const overheadKeys = scottFields.filter(f => f.group === 'Operating costs' && !laborKeys.includes(f.key) && f.key !== 'rentAnnual').map(f => f.key);
  const sum = (keys: string[]) => keys.reduce((total, key) => total + Number(reference.inputs[key]), 0);
  const assign = (key: string, value: number, keys: string[]) => {
    copy.inputs[key] = value;
    copy.metadata[key] = {
      source: `${sourceName}; ${keys.map(k => `${k}: ${reference.metadata[k].source}`).join('; ')}; starting baseline, not verified site actuals`,
      confidence: 'low', validation: true,
    };
  };
  // Keep source scenarios intact; clear detailed duplicates only in the new copy.
  for (const field of novemberFields) {
    const duplicate = ['November · Staffing', 'November · COGS', 'November · Compensation extras', 'November · Overhead'].includes(field.group);
    if (duplicate && !/^nov_staff\d+Count$/.test(field.key)) {
      copy.inputs[field.key] = 0;
      copy.metadata[field.key] = { source: 'No incremental amount supplied. Existing Scott costs are in the annual reference totals; enter only costs not already included.', confidence: 'low', validation: true };
    }
  }
  assign('nov_referenceLaborAnnual', sum(laborKeys), laborKeys);
  assign('nov_referenceOverheadAnnual', sum(overheadKeys), overheadKeys);
  assign('nov_rent', Number(reference.inputs.rentAnnual), ['rentAnnual']);
  assign('nov_area', Number(reference.inputs.sf), ['sf']);
  for (const group of [0, 1]) {
    revenueLines[group].labels.forEach((_, index) => {
      const key = `nov_rev${group}_${index}`;
      copy.inputs[key] = 0;
      copy.metadata[key] = { source: 'Scott revenue copied once into the first line of each group; avoid duplicate billing.', confidence: 'low', validation: true };
    });
  }
  assign('nov_rev0_0', Number(reference.inputs.delivery), ['delivery']);
  assign('nov_rev1_0', Number(reference.inputs.promo), ['promo']);
  copy.inputs.nov_hqCredit = 0;
  copy.metadata.nov_hqCredit = { source: 'No HQ savings inferred from Scott reference costs.', confidence: 'low', validation: true };
  copy.inputs.nov_referenceSource = sourceName;
  copy.metadata.nov_referenceSource = { source: sourceName, confidence: 'low', validation: true };
  return copy;
}

export function addLogisticsReferences(workspace: Workspace): Workspace {
  if (workspace.logisticsReferenceUpdate === 1) return workspace;
  const references = (['Good', 'Better', 'Best'] as const).flatMap(tier => {
    const target = workspace.scenarios.find(s => s.novemberKind === tier && !s.inputs.nov_referenceSource);
    if (!target) return [];
    const copy = createLogisticsReference(target);
    copy.id = `nov-logistics-reference-${tier.toLowerCase()}`;
    return workspace.scenarios.some(s => s.id === copy.id) ? [] : [copy];
  });
  return { ...workspace, logisticsReferenceUpdate: 1, scenarios: [...workspace.scenarios, ...references] };
}
