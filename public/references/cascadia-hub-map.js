(function(){
const ST={
  operating:{label:'B-Line operating',color:'var(--operating)'},
  active:{label:'Active planning',color:'var(--active)'},
  search:{label:'Site search',color:'var(--search)'},
  prospect:{label:'Not yet assessed',color:'var(--prospect)'}
};
const CITIES=[
 {id:'van',name:'Vancouver',reg:'BC',lat:49.2827,lon:-123.1207,st:'prospect',ph:3,dx:14,dy:4,
  why:'Northern anchor. The Cascadia Innovation Corridor began as a Vancouver–Seattle initiative, so this is the city the board knows best.',
  now:'No B-Line work here yet.',
  next:'Ask Corridor board contacts who at the City of Vancouver tracks zero-emission delivery, and whether a cross-border demo makes sense. Bellingham shares the same operator.'},
 {id:'sea',name:'Seattle',reg:'WA',lat:47.6062,lon:-122.3321,st:'active',ph:1,dx:14,dy:-2,
  why:'Largest market on the corridor and the next B-Line expansion. SDOT is building Low Pollution Neighborhoods, with at least three in place by Q1 2028.',
  now:'Oct 5 visit done with Sound Break, SODO BIA and SDOT. Three strategies proposed (fleet manager for a cargo-bike pilot, SODO logistics hub, Stadium District plus Capitol Hill). Refined SDOT proposal in progress.',
  next:'Send the refined proposal. Make the four SDOT asks: first-year funding strategy, LPN business engagement, Office of Economic Development (Seattle Restored) and Washington Action 3E.'},
 {id:'bel',name:'Bellingham',reg:'WA',lat:48.7519,lon:-122.4787,st:'prospect',ph:3,dx:14,dy:4,
  why:'Washington city 20 miles south of the border, paired with Vancouver, BC as one operator market and a stop on the way to Seattle.',
  now:'No B-Line work here yet.',
  next:'Test cross-border and I-5 delivery demand with the Vancouver, BC operator once that market has a lead.'},
 {id:'tac',name:'Tacoma',reg:'WA',lat:47.2529,lon:-122.4443,st:'prospect',ph:2,dx:14,dy:4,
  why:'Sits between Seattle and Olympia on I-5, a natural second hub once the Seattle template works.',
  now:'No B-Line work here yet.',
  next:'Ask SDOT and Corridor contacts whether Tacoma has a program like Seattle\'s LPNs.'},
 {id:'oly',name:'Olympia',reg:'WA',lat:47.0379,lon:-122.9007,st:'search',ph:1,dx:14,dy:10,
  why:'State capital. Commerce, which leads Washington\'s Action 3E on community climate resilience hubs, is based here.',
  now:'Property search under way with a commercial agent; target under 5,000 SF.',
  next:'Score the first three listings on the scorecard. Ask SDOT or Commerce for the Action 3E contact. Tacoma shares the same operator.'},
 {id:'vanwa',name:'Vancouver',reg:'WA',lat:45.6387,lon:-122.6615,st:'prospect',ph:2,dx:14,dy:-6,
  why:'Washington side of the Portland metro, across the Columbia. Could open Washington programs while operating from Portland\'s base.',
  now:'No B-Line work here yet.',
  next:'Test whether the Portland operator can serve Vancouver, WA deliveries (same market), and check Washington funding eligibility.'},
 {id:'pdx',name:'Portland',reg:'OR',lat:45.5152,lon:-122.6784,st:'operating',ph:1,dx:14,dy:12,
  why:'B-Line\'s home market since 2009 and the proof point for every other city: real stops per day, cost per stop and hub economics.',
  now:'Operating. HQ at 1140 SE 7th Ave; managed warehouse of about 15,000 SF (per the Cityfi memo). The 2019 UT/TDOT report counted over 35,000 deliveries and 90,000 miles since 2009.',
  next:'Pull current Portland numbers (stops per day, cost per stop, hub P&L) for the SDOT proposal and the Corridor pitch.'},
 {id:'sal',name:'Salem',reg:'OR',lat:44.9429,lon:-123.0351,st:'prospect',ph:3,dx:14,dy:4,
  why:'Oregon\'s capital, home to the state agencies behind Oregon funding and policy.',
  now:'No B-Line work here yet.',
  next:'Decide whether Salem joins the Portland or Eugene market or stays a corridor stop. Identify Oregon programs for zero-emission freight and resilience hubs; ask Corridor board members for a contact.'},
 {id:'cor',name:'Corvallis',reg:'OR',lat:44.5646,lon:-123.2620,st:'prospect',ph:3,dx:14,dy:4,
  why:'Home to Oregon State University, paired with Eugene as one operator market in the Willamette Valley.',
  now:'No B-Line work here yet.',
  next:'Hold with Eugene until Portland and Seattle are running; check whether the university campus could be an anchor customer.'},
 {id:'eug',name:'Eugene',reg:'OR',lat:44.0521,lon:-123.0868,st:'prospect',ph:3,dx:14,dy:4,
  why:'Southern anchor of the corridor, in the Willamette Valley.',
  now:'No B-Line work here yet.',
  next:'Hold until Portland, Seattle and Olympia are running, then revisit with state funding in hand. Corvallis shares the same operator.'}
];
const MKT=[
 {id:'m1',name:'Vancouver BC + Bellingham',col:'#8B7AE0',ids:['van','bel']},
 {id:'m2',name:'Seattle',col:'#2FA6A0',ids:['sea']},
 {id:'m3',name:'Tacoma + Olympia',col:'#D9658A',ids:['tac','oly']},
 {id:'m4',name:'Portland + Vancouver WA',col:'#5E86C8',ids:['pdx','vanwa']},
 {id:'m5',name:'Eugene + Corvallis',col:'#A9A93A',ids:['eug','cor']}
];
CITIES.forEach(c=>{const m=MKT.find(m=>m.ids.includes(c.id));c.mkt=m?m.name:'Not yet placed (between the Portland and Eugene markets)';c.mcol=m?m.col:null});
const R=3958.8, rad=Math.PI/180;
const hav=(a,b,c,d)=>{const x=Math.sin((c-a)*rad/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
const SEA=CITIES.find(c=>c.id==='sea');
CITIES.forEach(c=>c.mi=hav(SEA.lat,SEA.lon,c.lat,c.lon));
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const NS='http://www.w3.org/2000/svg';
const mk=(tag,attrs,parent,text)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e};

/* legend with shapes, so status never relies on color alone */
function glyph(st,size){
  const s=size||18, h=s/2, svg=document.createElementNS(NS,'svg');
  svg.setAttribute('width',s);svg.setAttribute('height',s);svg.setAttribute('viewBox',`0 0 ${s} ${s}`);svg.style.display='inline-block';svg.style.width=s+'px';
  drawMarker(svg,st,h,h,0.8);return svg;
}
function drawMarker(g,st,x,y,k){
  k=k||1;const col=ST[st].color;
  if(st==='operating'){mk('circle',{cx:x,cy:y,r:8.5*k,fill:col,stroke:'var(--card)','stroke-width':2.2*k},g);mk('circle',{cx:x,cy:y,r:3*k,fill:'var(--card)'},g)}
  else if(st==='active'){mk('circle',{cx:x,cy:y,r:7.5*k,fill:col,stroke:'var(--card)','stroke-width':2*k},g)}
  else if(st==='search'){mk('rect',{x:x-6*k,y:y-6*k,width:12*k,height:12*k,fill:col,stroke:'var(--card)','stroke-width':2*k,transform:`rotate(45 ${x} ${y})`},g)}
  else{mk('circle',{cx:x,cy:y,r:6.5*k,fill:'var(--card)',stroke:col,'stroke-width':2.6*k},g)}
}
const mkl=document.getElementById('mktLegend');
(function(){const t=document.createElement('span');t.className='legend-item';t.style.color='var(--muted)';t.textContent='Operator markets:';mkl.appendChild(t);
 [['Vancouver BC + Bellingham','#8B7AE0'],['Seattle','#2FA6A0'],['Tacoma + Olympia','#D9658A'],['Portland + Vancouver WA','#5E86C8'],['Eugene + Corvallis','#A9A93A']].forEach(([n,c])=>{const s=document.createElement('span');s.className='legend-item';const sw=document.createElement('span');sw.style.cssText='display:inline-block;width:14px;height:14px;border-radius:4px;background:'+c+';opacity:.7';s.appendChild(sw);s.appendChild(document.createTextNode(n));mkl.appendChild(s)})})();
const legend=document.getElementById('legend');
Object.keys(ST).forEach(k=>{const s=document.createElement('span');s.className='legend-item';s.appendChild(glyph(k,18));s.appendChild(document.createTextNode(ST[k].label));legend.appendChild(s)});

/* ---------- corridor map ---------- */
const LAT0=49.7,LAT1=43.7,LON0=-125.2,LON1=-120.8,KX=Math.cos(46.7*rad),SC=139.2;
const VW=(LON1-LON0)*KX*SC, VH=(LAT0-LAT1)*SC;
const P=(lat,lon)=>[(lon-LON0)*KX*SC,(LAT0-lat)*SC];
const path=(pts,close)=>'M'+pts.map(p=>P(p[0],p[1]).map(v=>v.toFixed(1)).join(' ')).join('L')+(close?'Z':'');
const corr=document.getElementById('corr');
corr.setAttribute('viewBox',`0 0 ${VW.toFixed(0)} ${VH.toFixed(0)}`);
mk('rect',{x:0,y:0,width:VW,height:VH,fill:'var(--water)',rx:6},corr);
const MAIN=[[49.7,-120.8],[49.7,-123.9],[49.47,-123.76],[49.40,-123.52],[49.37,-123.28],[49.27,-123.27],[49.15,-123.22],[49.02,-123.10],[49.00,-122.85],[48.95,-122.78],[48.85,-122.77],[48.75,-122.50],[48.55,-122.46],[48.50,-122.62],[48.40,-122.68],[48.20,-122.77],[48.16,-122.70],[48.05,-122.62],[47.92,-122.40],[47.81,-122.38],[47.68,-122.41],[47.62,-122.37],[47.60,-122.345],[47.58,-122.36],[47.58,-122.42],[47.52,-122.39],[47.40,-122.33],[47.31,-122.41],[47.28,-122.43],[47.30,-122.53],[47.20,-122.57],[47.17,-122.60],[47.09,-122.70],[47.07,-122.89],[47.05,-122.91],[47.13,-122.93],[47.27,-122.72],[47.33,-122.58],[47.45,-122.52],[47.62,-122.52],[47.80,-122.50],[47.93,-122.58],[48.10,-122.75],[48.05,-122.88],[48.08,-123.05],[48.18,-123.15],[48.12,-123.43],[48.16,-123.98],[48.25,-124.26],[48.37,-124.61],[48.38,-124.73],[47.91,-124.64],[47.62,-124.37],[47.21,-124.20],[46.90,-124.12],[46.63,-124.06],[46.27,-124.06],[45.89,-123.96],[45.48,-123.97],[44.96,-124.02],[44.63,-124.06],[43.98,-124.11],[43.7,-124.15],[43.7,-120.8]];
const ISLE=[[49.7,-124.95],[49.67,-124.90],[49.35,-124.43],[49.17,-123.94],[48.92,-123.72],[48.75,-123.62],[48.65,-123.40],[48.42,-123.37],[48.37,-123.73],[48.42,-124.00],[48.55,-124.42],[48.61,-124.75],[48.83,-125.2],[49.7,-125.2]];
const COLUMBIA=[[46.24,-123.98],[46.19,-123.83],[46.17,-123.60],[46.15,-123.25],[46.14,-122.95],[45.86,-122.80],[45.65,-122.76],[45.58,-122.40],[45.64,-121.94],[45.71,-121.52],[45.61,-121.18],[45.6,-120.8]];
const WILLAMETTE=[[45.65,-122.77],[45.52,-122.67],[45.36,-122.61],[45.30,-122.77],[45.30,-122.97],[44.94,-123.04],[44.63,-123.10],[44.56,-123.26],[44.27,-123.17],[44.05,-123.08]];
const SPINE=[[49.28,-123.12],[49.0,-122.76],[48.75,-122.48],[48.42,-122.33],[47.98,-122.20],[47.6062,-122.3321],[47.2529,-122.4443],[47.0379,-122.9007],[46.72,-122.95],[46.14,-122.91],[45.6387,-122.6615],[45.5152,-122.6784],[44.9429,-123.0351],[44.0521,-123.0868]];
mk('path',{d:path(MAIN,true),fill:'var(--land)',stroke:'var(--land-line)','stroke-width':1.2,'stroke-linejoin':'round'},corr);
mk('path',{d:path(ISLE,true),fill:'var(--land)',stroke:'var(--land-line)','stroke-width':1.2,'stroke-linejoin':'round'},corr);
mk('path',{d:path(COLUMBIA),fill:'none',stroke:'var(--river)','stroke-width':2.2,'stroke-linecap':'round'},corr);
mk('path',{d:path(WILLAMETTE),fill:'none',stroke:'var(--river)','stroke-width':1.4,'stroke-linecap':'round'},corr);
/* graticule */
for(let la=44;la<=49;la++){const y=P(la,0)[1];
  mk('line',{x1:0,x2:VW,y1:y,y2:y,stroke:'var(--grid)','stroke-width':la===49?1.6:.6,'stroke-dasharray':la===49?'6 4':'2 4'},corr);
  mk('text',{x:VW-6,y:y-4,'text-anchor':'end',class:'geo'},corr,la===49?'49°N  U.S.–Canada border':la+'°N')}
mk('text',{x:20,y:P(46.4,0)[1],class:'geo'},corr,'Pacific Ocean');
mk('text',{x:P(0,-125.15)[0],y:P(49.2,0)[1],class:'geo'},corr,'Vancouver Island');
mk('text',{x:P(0,-124.9)[0],y:P(48.15,0)[1]+0,class:'geo'},corr,'');
mk('text',{x:P(45.80,-121.9)[0],y:P(45.80,-121.9)[1],class:'geo'},corr,'Columbia R.');
mk('text',{x:P(45.14,-122.78)[0],y:P(45.14,-122.78)[1],class:'geo'},corr,'Willamette R.');
/* spine */
const spine=mk('path',{d:path(SPINE),fill:'none',stroke:'var(--spine)','stroke-width':2.4,'stroke-dasharray':'7 5','stroke-linecap':'round',opacity:.55},corr);
/* scale bar: 100 miles */
(function(){const mi=100,deg=mi/69.0,len=deg*SC,x=18,y=VH-18;
  mk('line',{x1:x,x2:x+len,y1:y,y2:y,stroke:'var(--fg)','stroke-width':2},corr);
  mk('line',{x1:x,x2:x,y1:y-5,y2:y+5,stroke:'var(--fg)','stroke-width':2},corr);
  mk('line',{x1:x+len,x2:x+len,y1:y-5,y2:y+5,stroke:'var(--fg)','stroke-width':2},corr);
  mk('text',{x:x+len+6,y:y+4,class:'lbl2',style:'font-size:11px'},corr,'100 mi');
  mk('text',{x:VW-14,y:VH-14,'text-anchor':'end',class:'geo'},corr,'N ↑  schematic');
})();
const mktG=mk('g',{id:'mktG'},corr);
MKT.forEach(m=>{const pts=m.ids.map(id=>{const c=CITIES.find(c=>c.id===id);return P(c.lat,c.lon)});
  if(pts.length===2) mk('line',{x1:pts[0][0],y1:pts[0][1],x2:pts[1][0],y2:pts[1][1],stroke:m.col,'stroke-width':34,'stroke-linecap':'round',opacity:.3},mktG);
  else mk('circle',{cx:pts[0][0],cy:pts[0][1],r:22,fill:m.col,opacity:.3},mktG)});
const cityG={};
const phaseG=mk('g',{id:'phaseG',style:'display:none'},corr);
CITIES.forEach(c=>{
  const [x,y]=P(c.lat,c.lon);
  const g=mk('g',{class:'city',tabindex:0,role:'button','aria-label':`${c.name}, ${c.reg}: ${ST[c.st].label}`},corr);
  mk('circle',{cx:x,cy:y,r:15,class:'ring'},g);
  mk('circle',{cx:x,cy:y,r:16,fill:'transparent'},g);
  drawMarker(g,c.st,x,y,1);
  mk('text',{x:x+c.dx+4,y:y+c.dy,class:'lbl'},g,`${c.name}, ${c.reg}`);
  mk('text',{x:x+c.dx+4,y:y+c.dy+12,class:'lbl2'},g,ST[c.st].label);
  g.addEventListener('click',()=>select(c.id));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(c.id)}});
  cityG[c.id]=g;
  const b=mk('g',{},phaseG);
  mk('circle',{cx:x-15,cy:y-15,r:8.5,fill:'var(--fg)'},b);
  mk('text',{x:x-15,y:y-11.3,'text-anchor':'middle',style:'font:700 11px var(--font-body);fill:var(--bg)'},b,String(c.ph));
});
document.getElementById('tSpine').addEventListener('change',e=>{spine.style.display=e.target.checked?'':'none'});
document.getElementById('tMkt').addEventListener('change',e=>{mktG.style.display=e.target.checked?'':'none'});
document.getElementById('tPhase').addEventListener('change',e=>{phaseG.style.display=e.target.checked?'':'none';renderPanel()});

/* ---------- detail panel ---------- */
const PHASE={1:'Phase 1: the Seattle, Tacoma + Olympia and Portland markets form the first triangle (Olympia and Seattle lead).',2:'Phase 2: extend to neighbors once the template works.',3:'Phase 3: the corridor ends, once state funding and a proven model are in hand.'};
let cur='sea';
const panel=document.getElementById('panel');
function renderPanel(){
  const c=CITIES.find(x=>x.id===cur), phase=document.getElementById('tPhase').checked;
  const mk_=`<p><b>Operator market:</b> ${esc(c.mkt)}</p>`;
  const dist=c.id==='sea'?'':`<p><b>From Seattle:</b> about ${Math.round(c.mi)} miles straight-line.</p>`;
  const ph=phase?`<p><b>Proposed sequencing:</b> ${esc(PHASE[c.ph])}</p>`:'';
  panel.innerHTML=`<div class="panel-head"><h2>${esc(c.name)}, ${esc(c.reg)}</h2><span class="pill" style="color:${ST[c.st].color}" id="pillHost"></span></div>
  <div class="facts"><div><h3>Why it matters</h3><p>${esc(c.why)}</p></div><div><h3>Where it stands</h3><p>${esc(c.now)}</p></div><div><h3>Suggested next move</h3><p>${esc(c.next)}</p></div>${mk_}${dist}${ph}
  <p><a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}">Open ${esc(c.name)} in Google Maps</a></p></div>`;
  const host=document.getElementById('pillHost');host.appendChild(glyph(c.st,14));host.appendChild(document.createTextNode(ST[c.st].label));
}
function select(id){
  cur=id;for(const k in cityG)cityG[k].classList.toggle('sel',k===id);
  document.querySelectorAll('#rows tr').forEach(r=>r.classList.toggle('sel',r.dataset.id===id));
  renderPanel();
}
/* table */
const rows=document.getElementById('rows');
CITIES.forEach(c=>{
  const tr=document.createElement('tr');tr.dataset.id=c.id;tr.tabIndex=0;
  tr.innerHTML=`<td><b>${esc(c.name)}, ${esc(c.reg)}</b></td><td>${esc(c.mkt.replace(' (between the Portland and Eugene markets)',''))}</td><td class="st"></td><td class="num2">${c.id==='sea'?'–':Math.round(c.mi)+' mi'}</td><td>${esc(c.why)}</td><td>${esc(c.next)}</td>`;
  const td=tr.querySelector('.st');td.style.whiteSpace='nowrap';td.appendChild(glyph(c.st,14));td.appendChild(document.createTextNode(' '+ST[c.st].label));
  tr.addEventListener('click',()=>{select(c.id);window.scrollTo({top:0,behavior:'smooth'})});
  tr.addEventListener('keydown',e=>{if(e.key==='Enter'){select(c.id)}});
  rows.appendChild(tr);
});

/* ---------- Seattle locator ---------- */
const sea=document.getElementById('sea');
const SL0=47.652,SL1=47.505,SO0=-122.395,SO1=-122.250,SK=Math.cos(47.57*rad),SS=3064;
const SW=(SO1-SO0)*SK*SS, SH=(SL0-SL1)*SS;
const Q=(lat,lon)=>[(lon-SO0)*SK*SS,(SL0-lat)*SS];
sea.setAttribute('viewBox',`0 0 ${SW.toFixed(0)} ${SH.toFixed(0)}`);
mk('rect',{x:0,y:0,width:SW,height:SH,fill:'var(--land)',rx:6,stroke:'var(--line)'},sea);
const qpath=pts=>'M'+pts.map(p=>Q(p[0],p[1]).map(v=>v.toFixed(1)).join(' ')).join('L');
mk('path',{d:qpath([[47.505,-122.285],[47.52,-122.298],[47.54,-122.312],[47.56,-122.321],[47.58,-122.326],[47.60,-122.329],[47.62,-122.330],[47.64,-122.328],[47.652,-122.326]]),fill:'none',stroke:'var(--spine)','stroke-width':3,opacity:.4,'stroke-linecap':'round'},sea);
mk('text',{x:Q(47.518,-122.296)[0]+8,y:Q(47.518,-122.296)[1],class:'geo'},sea,'I-5 (approx.)');
mk('text',{x:8,y:Q(47.565,0)[1],class:'geo'},sea,'Elliott Bay');
mk('text',{x:8,y:Q(47.565,0)[1]+11,class:'geo'},sea,'and Puget Sound');
mk('text',{x:SW-8,y:Q(47.565,0)[1],'text-anchor':'end',class:'geo'},sea,'Lake');
mk('text',{x:SW-8,y:Q(47.565,0)[1]+11,'text-anchor':'end',class:'geo'},sea,'Washington');
mk('text',{x:SW-10,y:SH-10,'text-anchor':'end',class:'geo'},sea,'N ↑  schematic, no shoreline');
/* scale: 1 mile */
(function(){const deg=1/69.0,len=deg*SS*0.0+ (1/(69.0*SK))*SK*SS; const x=12,y=SH-12;
  mk('line',{x1:x,x2:x+len,y1:y,y2:y,stroke:'var(--fg)','stroke-width':2},sea);
  mk('line',{x1:x,x2:x,y1:y-4,y2:y+4,stroke:'var(--fg)','stroke-width':2},sea);
  mk('line',{x1:x+len,x2:x+len,y1:y-4,y2:y+4,stroke:'var(--fg)','stroke-width':2},sea);
  mk('text',{x:x+len+5,y:y+4,class:'lbl2',style:'font-size:10.5px'},sea,'1 mi');
})();
/* LPN pilot areas (centers, approximate) */
const LPN=[{n:'South Park / Georgetown',lat:47.536,lon:-122.318,rkm:1.9,lx:'right'},{n:'Capitol Hill',lat:47.6185,lon:-122.3205,rkm:1.3,lx:'right'}];
LPN.forEach(a=>{const [x,y]=Q(a.lat,a.lon),r=a.rkm/111*SS;
  mk('circle',{cx:x,cy:y,r:r,fill:'color-mix(in srgb,var(--operating) 12%,transparent)',stroke:'var(--operating)','stroke-width':1.6,'stroke-dasharray':'5 4'},sea);
  mk('text',{x:Math.max(x,90),y:a.n==='Capitol Hill'?y-r-6:y+r+12,'text-anchor':'middle',class:'lbl2',style:'fill:var(--operating);font-weight:600'},sea,'LPN pilot: '+a.n)});
/* off-inset note for Lake City */
(function(){const mi=hav(47.6185,-122.3205,47.7186,-122.2950);
  mk('text',{x:SW/2,y:14,'text-anchor':'middle',class:'lbl2',style:'fill:var(--operating);font-weight:600'},sea,`↑ Lake City LPN pilot, about ${Math.round(mi)} mi north`)})();
/* context points */
const CTX=[
 {n:'Pioneer Sq. / Sound Break',lat:47.6020,lon:-122.3340,side:'right'},
 {n:'Pike Place',lat:47.6097,lon:-122.3425,side:'left'},
 {n:'Starbucks HQ',lat:47.5813,lon:-122.3347,side:'left'}
];
CTX.forEach(p=>{const [x,y]=Q(p.lat,p.lon);
  mk('rect',{x:x-3.5,y:y-3.5,width:7,height:7,fill:'var(--muted)',stroke:'var(--card)','stroke-width':1.2},sea);
  mk('text',p.side==='right'?{x:x+8,y:y+3.5,class:'lbl2'}:{x:x-8,y:y+3.5,'text-anchor':'end',class:'lbl2'},sea,p.n)});
/* candidates */
const CANDS=[
 {id:1,name:'SODO logistics hub',lat:47.5800,lon:-122.3280,meta:'Strategy 2 · about 2,000 SF · logistics-only',
  detail:'Lease about 2,000 SF in SODO and run it as a pure last-mile hub. Launch with existing customers IKEA, Puget Sound Food Hub and Grand Central Bakery, then grow with the SODO BIA. Aim to get noticed by Starbucks HQ and to push for bigger plays such as a logistics hotel at the new Sound Transit station.',
  score:'Preliminary: strong anchor customers and freight access. Rent, zoning, power and bike routes are still unknown.'},
 {id:2,name:'Stadium District back of house',lat:47.5925,lon:-122.3345,meta:'Strategy 3 · Utah Ave S · back-of-house',
  detail:'Back of house on Utah Ave S near T-Mobile Park and Lumen Field, with the new quadricycle at game days. Uses the proximity to Sound Break and Pioneer Square, delivers to and from Pike Place, and links to a Capitol Hill front of house.',
  score:'Preliminary: strong visibility and density. No site, size or anchor customers yet.'},
 {id:3,name:'Capitol Hill front of house',lat:47.6155,lon:-122.3205,meta:'Strategy 3 · storefront in an LPN pilot area',
  detail:'A neighborhood storefront as the community-facing "front of house", promoted alongside the Low Pollution Neighborhoods. Liz Dunn, a developer who refurbishes older buildings with a community focus, is the contact; the Office of Economic Development (Seattle Restored) may know vacant storefronts.',
  score:'Preliminary: strong policy fit and density. Rent, loading and hills are the open questions.'},
 {id:4,name:'Georgetown / South Park',lat:47.5486,lon:-122.3216,meta:'Added by Claude · LPN pilot area',
  detail:'A Low Pollution Neighborhood pilot area with heavy freight and one of Seattle\'s highest environmental health burdens (SDOT). Added as a candidate by Claude; Emi and Franklin have not proposed it. Georgetown Brewing lead via Jemal, unconfirmed.',
  score:'Preliminary: strong policy and community fit. Truck routes and available space are unknown.'}
];
const candG={};
CANDS.forEach(c=>{
  const [x,y]=Q(c.lat,c.lon);
  const g=mk('g',{class:'cand',tabindex:0,role:'button','aria-label':`Candidate ${c.id}: ${c.name}`,style:'cursor:pointer;outline:none'},sea);
  mk('circle',{cx:x,cy:y,r:16,class:'ring'},g);
  mk('circle',{cx:x,cy:y,r:11,fill:'var(--active)',stroke:'var(--card)','stroke-width':2},g);
  mk('text',{x:x,y:y+4.5,'text-anchor':'middle',style:'font:700 12px var(--font-body);fill:#1A1100'},g,String(c.id));
  g.addEventListener('click',()=>pick(c.id));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(c.id)}});
  candG[c.id]=g;
});
const cands=document.getElementById('cands'),cdet=document.getElementById('cdetail');
const btns={};
CANDS.forEach(c=>{
  const b=document.createElement('button');b.className='cbtn';b.type='button';b.setAttribute('aria-pressed','false');
  b.innerHTML=`<span class="num">${c.id}</span><span><span class="cname">${esc(c.name)}</span><br><span class="cmeta">${esc(c.meta)}</span></span>`;
  b.addEventListener('click',()=>pick(c.id));cands.appendChild(b);btns[c.id]=b;
});
function pick(id){
  const c=CANDS.find(x=>x.id===id);
  for(const k in btns){btns[k].setAttribute('aria-pressed',String(+k===id));candG[k].classList.toggle('sel',+k===id)}
  cdet.innerHTML=`<p>${esc(c.detail)}</p><p><b>Scorecard read:</b> ${esc(c.score)}</p><p><a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}">Open the area in Google Maps</a></p>`;
}
pick(1);
select('sea');
})();
