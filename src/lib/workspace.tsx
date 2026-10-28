import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { defaultInputs, fields, initialWorkspace, seedSites, statuses, type Workspace, type Scenario, type InputValue } from './defaults';
import { toast } from 'sonner';
import { scottFields } from './scottModel';
import { applySeattleRents } from './seattleRents';
const inputShape: Record<string, z.ZodTypeAny> = {};
fields.forEach(f => {
  inputShape[f.key] = typeof f.value === 'number' ? z.number().finite().min(0).max(f.max ?? 1e9) : typeof f.value === 'boolean' ? z.boolean() : f.options ? z.string().refine(v => f.options!.includes(v)) : f.unit === 'date' ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v))) : z.string().max(2000);
});
const scottShape = Object.fromEntries(scottFields.map(f => [f.key,z.number().finite().min(0).max(f.max ?? 1e9)]));
const metadata = z.object({ source: z.string(), confidence: z.enum(['low', 'med', 'high']), validation: z.boolean() });
const schema = z.object({
  version: z.literal(1), activeId: z.string(), seattleRentUpdate: z.literal(1).optional(), hubTierUpdate: z.literal(1).optional(),
  scenarios: z.array(z.object({ id: z.string(), name: z.string().min(1), city: z.string(), siteId: z.string().optional(), model: z.enum(['annual','scott']).optional(), scott: z.object({ inputs: z.object(scottShape), metadata: z.record(metadata) }).optional(), inputs: z.object(inputShape), metadata: z.record(metadata) })).min(1).max(500),
  sites: z.array(z.object({ id: z.string(), name: z.string(), city: z.string(), address: z.string(), sf: z.number().finite().min(0), score: z.number().finite().min(0), neighborhood: z.string(), rent: z.number().finite().min(0), partner: z.string(), status: z.string(), notes: z.string(), tier: z.enum(['Good','Better','Best']).optional(), scorecard: z.object({ answers: z.record(z.object({ rating: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(), evidence: z.string().max(10000) })), weights: z.record(z.number().finite().min(0).max(100)).optional(), gates: z.record(z.boolean()).optional() }).optional() })),
  partners: z.array(z.object({ id: z.string(), org: z.string(), contact: z.string(), role: z.string(), city: z.string(), type: z.string(), status: z.enum(statuses), lastTouch: z.string(), nextStep: z.string(), notes: z.string() })),
}).superRefine((w, ctx) => {
  if (!w.scenarios.some(s => s.id === w.activeId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Active scenario is missing' });
  for (const collection of [w.scenarios, w.sites, w.partners]) if (new Set(collection.map(x => x.id)).size !== collection.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate record IDs' });
  for (const s of w.scenarios) {
    if (fields.some(f => !s.metadata[f.key])) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Assumption metadata missing' });
    if (s.model === 'scott' && !s.scott || s.scott && scottFields.some(f => !s.scott!.metadata[f.key])) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Scott assumptions missing' });
  }
});
function migrateWorkspace(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const w = raw as Workspace;
  const defaults = initialWorkspace();
  const metadataDefaults = Object.fromEntries(fields.map(f => [f.key, { source: f.confirm ? 'Needs confirmation (Franklin/Emi)' : 'Planning default — replace with verified numbers', confidence: 'low' as const, validation: true }]));
  w.scenarios = (w.scenarios ?? defaults.scenarios).map(s => ({ ...s, inputs: { ...defaultInputs, ...s.inputs }, metadata: { ...metadataDefaults, ...s.metadata } }));
  const seededById = new Map(seedSites.map(s => [s.id, s]));
  w.sites = (w.sites ?? defaults.sites).map(site => {
    const sourceId = site.id.replace('source-20261007-', '');
    const tier = site.tier ?? seededById.get(site.id)?.tier ?? (site.city === 'Los Angeles' ? 'Better' : sourceId === 'sodo' || sourceId === 'stadium' ? 'Better' : sourceId === 'capitol' ? 'Best' : undefined);
    return { ...site, tier };
  });
  for (const seeded of seedSites) if (!w.sites.some(site => site.id === seeded.id)) w.sites.push(seeded);
  w.partners = w.partners ?? defaults.partners;
  w.hubTierUpdate = 1;
  return w;
}
export function parseWorkspace(text: string): Workspace { return schema.parse(migrateWorkspace(JSON.parse(text))) as Workspace; }
const KEY = 'b-line-microhub-v1';
function load() {
  try { const saved = localStorage.getItem(KEY); return applySeattleRents(saved ? parseWorkspace(saved) : initialWorkspace()); }
  catch { return applySeattleRents(initialWorkspace()); }
}
const Context = createContext<{ data: Workspace; setData: React.Dispatch<React.SetStateAction<Workspace>>; active: Scenario; updateInput: (key: string, value: InputValue) => void } | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Workspace>(load);
  useEffect(() => { if (data.seattleRentUpdate !== 1) setData(applySeattleRents); }, [data.seattleRentUpdate]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { toast.error('Browser storage is full or unavailable. Export JSON to keep your work.'); } }, [data]);
  const active = data.scenarios.find(s => s.id === data.activeId)!;
  const updateInput = (key: string, value: InputValue) => setData(w => ({ ...w, scenarios: w.scenarios.map(s => s.id === w.activeId ? { ...s, inputs: { ...s.inputs, [key]: value } } : s) }));
  return <Context.Provider value={{ data, setData, active, updateInput }}>{children}</Context.Provider>;
}
export function useWorkspace() { const ctx = useContext(Context); if (!ctx) throw new Error('Workspace provider missing'); return ctx; }
export function download(name: string, text: string, type = 'application/json') {
  if (!window.confirm('Export private planner data? This downloads an unencrypted file that may include site details, partner contacts, financial assumptions and evidence notes. Anyone with the file can read it. Store it securely and share only with authorized team members.')) return;
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
