const defs={
  gold18:{name:'طلای ۱۸ عیار',short:'18K',icon:'18'},
  gold24:{name:'طلای ۲۴ عیار',short:'24K',icon:'24'},
  full_coin:{name:'سکه امامی',short:'EMAMI',icon:'Au'},
  half_coin:{name:'نیم سکه',short:'HALF',icon:'½'},
  quarter_coin:{name:'ربع سکه',short:'QUARTER',icon:'¼'}
};
let rows=[], chart, activeMarket='gold18';
const toman=v=>v?Math.round(Number(v)/10):0;
const fmt=v=>new Intl.NumberFormat('fa-IR').format(Number(v)||0);
const pct=(a,b)=>b?((a-b)/b*100):0;
const signed=x=>`${x>0?'+':''}${x.toFixed(2)}%`;
function deltaClass(x){return x>0?'up':x<0?'down':'flat'}
function latestPair(){return [rows.at(-1)||{},rows.at(-2)||{}]}
function renderCards(){
  const [latest,prev]=latestPair();
  document.querySelector('#cards').innerHTML=Object.entries(defs).map(([k,d])=>{
    const p=toman(latest[k]), q=toman(prev[k]), x=pct(p,q), c=deltaClass(x);
    return `<article class="market-card">
      <div class="card-top"><div class="asset"><div class="asset-icon">${d.icon}</div><div class="asset-name"><b>${d.name}</b><small>${d.short}</small></div></div><div class="change-badge ${c}">${x? signed(x):'0.00%'}</div></div>
      <div class="price">${p?fmt(p):'—'}</div><div class="unit">تومان</div><div class="card-spark">AURUM · LIVE</div>
    </article>`}).join('');
  document.querySelector('#updated').textContent=latest.timestamp?`آخرین ثبت ${latest.timestamp.replace('T',' ')}`:'در انتظار اولین داده…';
  document.querySelector('#lastFetch').textContent=latest.timestamp?latest.timestamp.slice(11):'—';
}
function renderTicker(){
  const [latest,prev]=latestPair();
  document.querySelector('#ticker').innerHTML=Object.entries(defs).map(([k,d])=>{
    const p=toman(latest[k]),x=pct(p,toman(prev[k])),c=deltaClass(x);
    return `<div class="ticker-item"><span>${d.name}</span><b>${p?fmt(p):'—'}</b><em class="${c}">${x?signed(x):'0.00%'}</em></div>`}).join('');
}
function marketTabs(){
  document.querySelector('#marketTabs').innerHTML=Object.entries(defs).map(([k,d])=>`<button data-market="${k}" class="${k===activeMarket?'active':''}">${d.icon}</button>`).join('');
  document.querySelectorAll('#marketTabs button').forEach(b=>b.onclick=()=>{activeMarket=b.dataset.market;marketTabs();draw()});
}
function draw(){
  const n=+document.querySelector('#range').value;
  const src=n?rows.slice(-n):rows;
  const values=src.map(r=>toman(r[activeMarket])).filter(Boolean);
  document.querySelector('#chartSubtitle').textContent=`${defs[activeMarket].name} · ${src.length} رکورد اخیر`;
  const empty=document.querySelector('#chartEmpty');
  if(!values.length){empty.classList.add('show');if(chart){chart.destroy();chart=null}return}else empty.classList.remove('show');
  const first=values[0],last=values.at(-1),change=pct(last,first);
  document.querySelector('#currentPrice').textContent=fmt(last);
  document.querySelector('#periodChange').textContent=signed(change);
  document.querySelector('#periodChange').className=deltaClass(change);
  document.querySelector('#periodHigh').textContent=fmt(Math.max(...values));
  document.querySelector('#periodLow').textContent=fmt(Math.min(...values));
  const ctx=document.querySelector('#chart').getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,340);gradient.addColorStop(0,'rgba(229,183,73,.22)');gradient.addColorStop(1,'rgba(229,183,73,0)');
  if(chart)chart.destroy();
  chart=new Chart(ctx,{type:'line',data:{labels:src.map(r=>r.timestamp.slice(5).replace('T',' ')),datasets:[{data:src.map(r=>toman(r[activeMarket])),borderColor:'#e5b749',backgroundColor:gradient,fill:true,borderWidth:2,pointRadius:0,pointHoverRadius:4,pointHoverBackgroundColor:'#ffda77',pointHoverBorderColor:'#0b0f19',pointHoverBorderWidth:3,tension:.34}]},options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:'index'},plugins:{legend:{display:false},tooltip:{backgroundColor:'#121826',borderColor:'rgba(229,183,73,.25)',borderWidth:1,titleColor:'#8e98aa',bodyColor:'#fff',padding:12,displayColors:false,callbacks:{label:c=>`${fmt(c.raw)} تومان`}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:'#697386',maxTicksLimit:7,font:{size:9}}},y:{position:'left',grid:{color:'rgba(255,255,255,.055)'},border:{display:false},ticks:{color:'#697386',font:{size:9},callback:v=>new Intl.NumberFormat('fa-IR',{notation:'compact'}).format(v)}}}}});
}
function renderSnapshot(){
  if(!rows.length){document.querySelector('#snapshot').innerHTML='<div class="snapshot-row"><span>هنوز داده‌ای ثبت نشده</span></div>';return}
  const [latest,prev]=latestPair();
  document.querySelector('#snapshot').innerHTML=Object.entries(defs).map(([k,d])=>{const p=toman(latest[k]),x=pct(p,toman(prev[k]));return `<div class="snapshot-row"><span>${d.name}</span><b>${fmt(p)}</b><small class="${deltaClass(x)}">${signed(x)} · تومان</small></div>`}).join('');
}
function renderTable(){
  document.querySelector('#tbody').innerHTML=rows.slice(-12).reverse().map(r=>`<tr><td>${r.timestamp.replace('T',' ')}</td>${Object.keys(defs).map(k=>`<td>${r[k]?fmt(toman(r[k])):'—'}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="6">هنوز داده‌ای ثبت نشده است.</td></tr>';
}
function showToast(){const t=document.querySelector('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
async function load(manual=false){
  const btn=document.querySelector('#refresh'); if(manual)btn.classList.add('spinning');
  try{const res=await fetch('/api/history/',{cache:'no-store'});if(!res.ok)throw new Error('API error');rows=await res.json();renderCards();renderTicker();renderSnapshot();renderTable();draw();if(manual)showToast()}
  catch(e){console.error(e);document.querySelector('#chartEmpty').classList.add('show')}
  finally{btn.classList.remove('spinning')}
}
marketTabs();document.querySelector('#range').onchange=draw;document.querySelector('#refresh').onclick=()=>load(true);
document.querySelector('#themeToggle').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('aurum-theme',document.body.classList.contains('light')?'light':'dark')};
if(localStorage.getItem('aurum-theme')==='light')document.body.classList.add('light');
setInterval(()=>document.querySelector('#clock').textContent=new Date().toLocaleTimeString('fa-IR'),1000);
setInterval(()=>load(false),60000);load(false);
