import type { Field, Inputs, Metadata, Scenario } from './defaults';
export const scottLabel = 'Scott’s Model · CSV reconstruction';
const f = (key: string, label: string, group: string, value: number, unit = '$/year', max = 1e9): Field => ({ key, label, group, value, unit, max });
export const scottFields: Field[] = [
  f('delivery', 'Delivery revenue', 'Operating revenue', 400000), f('promo', 'Advertising & promotion', 'Operating revenue', 100000),
  f('deliveryLabor', 'Delivery labor', 'Operating costs', 240000),
  ...[['marketing','Marketing',3000],['commissions','Commissions',15000],['dues','Dues & subscriptions',250],['insurance','Insurance',5000],['meals','Meals & entertainment',1200],['travel','Travel',3000],['office','Office expense',6000],['auto','Auto & parking',0],['gm','GM pay · total',80640],['admin','Admin',30000],['bookkeeping','Bookkeeping',1200],['rentAnnual','Annual occupancy / rent',90000],['maintenance','Repairs & maintenance',2400],['services','Subcontracted services',1200],['supplies','Supplies',1200],['taxes','Taxes & licenses',360],['trikeOps','Trike-related operations',7200],['uniforms','Uniforms',600],['other','Other operating costs',0]].map(([key,label,value]) => f(String(key),String(label),'Operating costs',Number(value))),
  f('share','Share of positive operating profit','Settings',20,'%',100), f('sf','Module area','Settings',3000,'SF'), f('targetMargin','S+U target profit margin · pre-share','Targets',7,'%',100),
  f('targetY1','S+U Year 1 revenue target','Targets',500000), f('targetY2','S+U Year 2 revenue target','Targets',550000), f('targetY3','S+U Year 3 revenue target','Targets',605000),
  ...[['trikes','Trikes / quads',150000],['van','E-van',60000],['charging','Charging equipment',10000],['officeEquipment','Office equipment',10000],['racking','Warehousing / racking',10000],['ramp','New hub OPEX / ramp',100000],['workingCapital','Working capital',50000],['legal','Legal',10000],['design','Design / permitting',25000],['consultants','Pre-launch consultants',75000],['otherUses','Other uses',0]].map(([key,label,value]) => f(String(key),String(label),'Uses',Number(value),'$ one-time')),
  ...[['equity','Equity',0],['debt','Debt',0],['grant','Grant · assumed, not awarded',500000],['otherSources','Other sources',0]].map(([key,label,value]) => f(String(key),String(label),'Sources',Number(value),'$ one-time')),
];
export const scottDefaults: Inputs = Object.fromEntries(scottFields.map(field => [field.key,field.value]));
export const scottMetadata: Record<string, Metadata> = Object.fromEntries(scottFields.map(field => [field.key,{ source: `Expansion Model-2026 ${field.group === 'Uses' || field.group === 'Sources' || field.group === 'Targets' ? 'S+U' : '1-HUB'}.csv · ${field.label}${field.key === 'sf' || field.key === 'targetMargin' ? ' (S+U setting)' : ''}`, confidence: 'med', validation: true }]));
export function scottState(s: Scenario) { return s.scott ?? { inputs: { ...scottDefaults }, metadata: structuredClone(scottMetadata) }; }
export function modelLabel(s: Scenario) { return s.model === 'scott' ? scottLabel : s.inputs.novEnabled ? 'November detailed pro forma · Franklin baseline' : 'App annual planning engine'; }
export function calculateScott(inputs: Inputs) {
  const n = (key: string) => Number(inputs[key]);
  const revenue = n('delivery') + n('promo');
  const opex = scottFields.filter(field => field.group === 'Operating costs' && field.key !== 'deliveryLabor').reduce((sum,field) => sum + n(field.key),0);
  const contribution = revenue - n('deliveryLabor') - (opex - n('rentAnnual'));
  const beforeShare = revenue - n('deliveryLabor') - opex;
  const sharing = Math.max(0,beforeShare) * n('share') / 100;
  const uses = scottFields.filter(field => field.group === 'Uses').reduce((sum,field) => sum + n(field.key),0);
  const sources = scottFields.filter(field => field.group === 'Sources').reduce((sum,field) => sum + n(field.key),0);
  return { revenue, opex, contribution, beforeShare, sharing, afterShare: beforeShare - sharing, uses, sources, fundingGap: uses - sources,
    breakEvenMonthly: contribution / 12, targetMonthly: (contribution - revenue * n('targetMargin') / 100) / 12,
    targets: ['targetY1','targetY2','targetY3'].map((key,index) => ({ year: index+1, revenue: n(key), profit: n(key)*n('targetMargin')/100 })) };
}
