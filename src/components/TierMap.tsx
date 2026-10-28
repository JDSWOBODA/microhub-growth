import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/Financials';
import TierBadge from '@/components/TierBadge';
import { useWorkspace } from '@/lib/workspace';
import { needsConfirmation, operatorMarkets, tierColors, tierOrder, tierPins } from '@/lib/tiers';
import type { PinLocation } from '@/lib/defaults';

export default function TierMap() {
  const { data, setData } = useWorkspace();
  const [market, setMarket] = useState('All markets');
  const [tier, setTier] = useState('All tiers');
  const pins = tierPins.filter(pin => (market === 'All markets' || pin.city === market) && (tier === 'All tiers' || pin.tier === tier));
  const located = pins.flatMap(pin => {
    const location = data.tierPinLocations?.[pin.id];
    return location?.lat !== undefined && location.lng !== undefined ? [{ ...pin, lat: location.lat, lng: location.lng }] : [];
  });
  const west = Math.min(-130, ...located.map(pin => pin.lng - 1));
  const east = Math.max(-110, ...located.map(pin => pin.lng + 1));
  const south = Math.min(25, ...located.map(pin => pin.lat - 1));
  const north = Math.max(55, ...located.map(pin => pin.lat + 1));
  const x = (lng: number) => 60 + (lng - west) / (east - west) * 580;
  const y = (lat: number) => 30 + (north - lat) / (north - south) * 370;
  return <Panel className="space-y-5 p-5"><div><h2>Geographic model-tier layer</h2><p className="mt-1 text-xs text-muted-foreground">Example neighborhoods from the vision. No location coordinates were supplied, so pins appear only after you enter verified latitude and longitude. This coordinate plot is separate from the preserved source map below, not a parcel or street basemap.</p></div>
    <div className="flex flex-wrap gap-2"><select className="form-select" aria-label="Filter tier map by market" value={market} onChange={e => setMarket(e.target.value)}>{['All markets', ...operatorMarkets, 'Los Angeles'].map(m => <option key={m}>{m}</option>)}</select><select className="form-select" aria-label="Filter map by tier" value={tier} onChange={e => setTier(e.target.value)}>{['All tiers', ...tierOrder].map(t => <option key={t}>{t}</option>)}</select>{tierOrder.map(t => <TierBadge key={t} tier={t} />)}</div>
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]"><div className="space-y-2">{operatorMarkets.map(m => <button key={m} onClick={() => setMarket(m)} className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${market === m ? 'border-teal-700 bg-secondary' : 'border-border hover:bg-secondary'}`}>{m}</button>)}</div><div className="rounded-2xl border border-border bg-secondary/40 p-3"><svg viewBox="0 0 720 450" className="w-full" role="img" aria-label={`Geographic coordinate plot, ${located.length} verified example pins`}>
      {[0, 1, 2, 3, 4].map(index => { const lat = south + (north - south) * index / 4; const lng = west + (east - west) * index / 4; return <g key={index}><line x1="60" x2="640" y1={y(lat)} y2={y(lat)} stroke="currentColor" opacity="0.15" /><line y1="30" y2="400" x1={x(lng)} x2={x(lng)} stroke="currentColor" opacity="0.15" /><text x="52" y={y(lat) + 4} textAnchor="end" fontSize="11" fill="currentColor">{lat.toFixed(1)}°</text><text x={x(lng)} y="425" textAnchor="middle" fontSize="11" fill="currentColor">{lng.toFixed(1)}°</text></g>; })}
      {located.map(pin => <g key={pin.id}><title>{pin.label} · {pin.tier} · {pin.lat}, {pin.lng}</title><circle cx={x(pin.lng)} cy={y(pin.lat)} r="7" fill={tierColors[pin.tier]} stroke="white" strokeWidth="2" /><text x={x(pin.lng) + 10} y={y(pin.lat) - 10} fontSize="12" fill="currentColor">{pin.label}</text></g>)}
      {!located.length && <text x="350" y="210" textAnchor="middle" fontSize="15" fill="currentColor">No confirmed coordinates in this view</text>}
    </svg><p className="text-xs text-muted-foreground">Latitude / longitude · positions derived from saved coordinates, not illustrative placement.</p></div></div>
    <div className="grid gap-3 md:grid-cols-2">{pins.map(pin => <CoordinateEditor key={pin.id} pin={pin} location={data.tierPinLocations?.[pin.id]} onSave={location => setData(w => ({ ...w, tierPinLocations: { ...w.tierPinLocations, [pin.id]: location } }))} />)}</div>
    {!pins.length && <p className="text-sm text-muted-foreground">No example neighborhoods were supplied for this market. The operator market is retained; locations and tiers need confirmation.</p>}
  </Panel>;
}

function CoordinateEditor({ pin, location, onSave }: { pin: typeof tierPins[number]; location?: PinLocation; onSave: (location: PinLocation) => void }) {
  const [lat, setLat] = useState(location?.lat?.toString() ?? '');
  const [lng, setLng] = useState(location?.lng?.toString() ?? '');
  const valid = lat.trim() !== '' && lng.trim() !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;
  return <div className="space-y-3 rounded-2xl border border-border p-4"><div className="flex flex-wrap items-center gap-2"><MapPin size={15} style={{ color: tierColors[pin.tier] }} /><h3 className="text-sm font-semibold">{pin.label}</h3><TierBadge tier={pin.tier} /></div><p className="text-xs text-muted-foreground">{pin.city} · {location?.lat === undefined || location.lng === undefined ? needsConfirmation : 'Saved coordinates — verify against site evidence'}</p><div className="flex flex-wrap items-end gap-2"><label className="min-w-0 flex-1 text-xs">Latitude<Input className="mt-1 rounded-lg" type="number" step="any" min={-90} max={90} value={lat} onChange={e => setLat(e.target.value)} /></label><label className="min-w-0 flex-1 text-xs">Longitude<Input className="mt-1 rounded-lg" type="number" step="any" min={-180} max={180} value={lng} onChange={e => setLng(e.target.value)} /></label><Button size="sm" className="rounded-lg" disabled={!valid} onClick={() => onSave({ lat: Number(lat), lng: Number(lng) })}>Save</Button><Button variant="outline" size="sm" className="rounded-lg" onClick={() => { setLat(''); setLng(''); onSave({}); }}>Clear</Button></div></div>;
}
