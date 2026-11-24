// State, localStorage persistence, rendering and event handling.
// Depends on globals from plan.js (EX, PLAN, howHTML, howOpen), dates.js, month.js (renderMonth, DAY_FULL)
// garmin.js (handleGarminFile, showGarmin, applyGarmin) and backup.js (backUp, handleRestoreFile, applyRestore).

// Keep every saved log, but repair top-level fields so bad data can't break rendering.
// Used when loading from storage and when restoring a backup.
function normalise(s){
  const saved=s&&typeof s==='object';
  // Data saved before plan versions existed belongs to plan 1.
  const st=Object.assign({week:1,base:3,start:null,lastBackup:null,weeks:{},plan:saved?1:PLAN_VERSION},saved?s:{});
  const w=parseInt(st.week,10); st.week=w>=1&&w<=8?w:1;
  const b=parseFloat(st.base); st.base=b>0?b:3;
  if(!st.weeks||typeof st.weeks!=='object'||Array.isArray(st.weeks)) st.weeks={};
  if(isoToNum(st.start)==null) st.start=null;
  if(isoToNum(st.lastBackup)==null) st.lastBackup=null;
  return migrate(st);
}
// Move logs from older plans onto the current one. Task ticks are stored by position, so each step maps old
// positions to new ones. Run logs (km, pain) follow the runs.
function migrate(st){
  if(!(st.plan<2)) return st;
  // Plan 1 → 2. Mon and Thu keep their tasks in the same order (Thu gains dead bug at the end). Tue keeps its
  // warm-up and run. Wed's mobility ticks map onto the new stretches and ball release. The old Fri and Sun runs
  // were the long ones, so Sunday's run (or Friday's, if Sunday has none) becomes Saturday's 5k. Fri and Sun
  // are gym days now and start empty. Sat was rest, so its old tick is dropped.
  const isRun=d=>d&&typeof d==='object'&&(d.pd!=null||parseFloat(d.km)>0);
  Object.keys(st.weeks).forEach(k=>{
    const W=st.weeks[k]; if(!W||typeof W!=='object') return;
    const T=i=>W[i]&&Array.isArray(W[i].tasks)?W[i].tasks:[];
    if(W[2]&&typeof W[2]==='object'){const t=T(2); W[2]={tasks:[false,false,!!(t[1]&&t[2]),!!t[0]]};}
    const src=[6,4].find(i=>isRun(W[i]));
    const sat={tasks:[]};
    if(src!=null){
      sat.tasks=[!!T(src)[0],!!T(src)[1],false];
      ['km','pd','pn'].forEach(f=>{if(W[src][f]!=null) sat[f]=W[src][f];});
    }
    W[5]=sat;
    if(W[4]) W[4]={tasks:[]};
    if(W[6]) W[6]={tasks:[]};
  });
  st.plan=2;
  return st;
}
let state=normalise(null);
try{
  const raw=localStorage.getItem(KEY), parsed=raw?JSON.parse(raw):null;
  // Before a plan migration rewrites the logs, keep an untouched copy under its own key.
  if(parsed&&typeof parsed==='object'&&!(parsed.plan>=PLAN_VERSION)) localStorage.setItem(KEY+'-before-plan'+PLAN_VERSION,raw);
  state=normalise(parsed);
  if(parsed&&parsed.plan!==state.plan) save();
}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
// dayAt creates the entry if it's missing; use peek() from month.js to read without creating.
function dayAt(wn,i){
  const k='w'+wn; if(!state.weeks[k]||typeof state.weeks[k]!=='object') state.weeks[k]={};
  const w=state.weeks[k]; if(!w[i]||typeof w[i]!=='object') w[i]={tasks:[]}; if(!Array.isArray(w[i].tasks)) w[i].tasks=[];
  return w[i];
}
function dayData(i){return dayAt(state.week,i);}
// Saturday is a fixed 5k. The short Tuesday run starts at `base` and adds about 10% a week, capped so it stays short.
const FIVE_K=5, SHORT_CAP=4;
function runTarget(w,p){return p.run==='5k'?FIVE_K:Math.min(SHORT_CAP,state.base*Math.pow(1.1,w-1));}
function weekTarget(w){return PLAN.reduce((a,p)=>a+(p.run?runTarget(w,p):0),0);}
function fmtKm(k){return k===FIVE_K?String(k):k.toFixed(1);}
function cls(p){return p<=3?'g':p<=5?'a':'r';}
function verdict(dd){
  if(dd.pd==null) return null;
  const worst=Math.max(dd.pd, dd.pn==null?0:dd.pn);
  if(worst<=3) return ['g', dd.pn==null ? 'Within limits so far. Log how it feels tomorrow morning.' : 'Within limits. Keep to plan.'];
  if(worst<=5) return ['a','Back off. Halve the next run or swap it for run/walk.'];
  return ['r','Stop running for 2–3 days and keep the strength work going. If this repeats, book a physio.'];
}
function isDone(i){const dd=dayData(i);return PLAN[i].tasks.every((_,j)=>dd.tasks[j]);}

const open=new Set();
// The Week / Month tab isn't saved: the app always opens on the week, where logging happens.
let view='week', month=state.week<=4?1:2;
// render() rebuilds the day list and month grid, so note which control had focus and put focus back afterwards.
function focusKey(){
  const a=document.activeElement;
  if(!a||!(document.getElementById('days').contains(a)||document.getElementById('view-month').contains(a))) return null;
  if(a.id) return '#'+a.id;
  if(a.dataset.cell!=null) return '[data-cell="'+a.dataset.cell+'"]';
  if(a.dataset.head!=null) return '[data-head="'+a.dataset.head+'"]';
  if(a.dataset.how!=null) return '[data-how="'+a.dataset.how+'"]';
  if(a.dataset.f!=null) return '.chip[data-d="'+a.dataset.d+'"][data-f="'+a.dataset.f+'"][data-v="'+a.dataset.v+'"]';
  if(a.dataset.t!=null) return 'input[data-d="'+a.dataset.d+'"][data-t="'+a.dataset.t+'"]';
  return null;
}
function render(){
  const fk=focusKey(), isMonth=view==='month';
  document.getElementById('view-week').hidden=isMonth;
  document.getElementById('view-month').hidden=!isMonth;
  document.getElementById('reset').closest('.field').hidden=isMonth;
  renderSettings();
  [['tab-week',!isMonth],['tab-month',isMonth]].forEach(([id,on])=>{
    const t=document.getElementById(id); t.setAttribute('aria-selected',on); t.tabIndex=on?0:-1;
  });
  const prev=document.getElementById('prev'), next=document.getElementById('next');
  prev.setAttribute('aria-label',isMonth?'Previous month':'Previous week');
  next.setAttribute('aria-label',isMonth?'Next month':'Next week');
  if(isMonth){
    prev.disabled=month<=1; next.disabled=month>=2;
    renderMonth(month);
    if(fk){const el=document.querySelector(fk); if(el) el.focus({preventScroll:true});}
    return;
  }
  document.getElementById('wk').innerHTML='Week '+state.week+'<small>of 8</small>';
  prev.disabled=state.week<=1;
  next.disabled=state.week>=8;
  document.getElementById('target').textContent=PLAN.filter(p=>p.run).map(p=>p.d+' '+fmtKm(runTarget(state.week,p))+' km').join(', ');

  const b=document.getElementById('banner');
  b.innerHTML = state.week>=4
    ? '<div class="note warn">Week '+state.week+': if pain isn’t clearly easing compared with week 1, or it starts earlier in your runs, see a physio before adding distance.</div>'
    : '<div class="note">Pain up to 3/10 that settles within a few hours is fine. Check how your knee feels the next morning.</div>';

  const wrap=document.getElementById('days'); wrap.innerHTML='';
  let done=0;
  const today=todayNum();
  PLAN.forEach((p,i)=>{
    const dd=dayData(i); const fin=isDone(i); if(fin) done++;
    const date=dateOf(state.week,i), isToday=date===today;
    const el=document.createElement('section');
    el.className='day'+(fin?' done':'')+(open.has(i)?' open':'')+(isToday?' today':'');
    const sub = p.run==='5k' ? p.s+', 5 km' : p.run ? p.s+'. About '+fmtKm(runTarget(state.week,p))+' km' : p.s;
    const dlabel = date==null ? '' : '<small>'+(isToday?'Today':fmtShort(date))+'</small>';
    let html='<button class="head" data-head="'+i+'" aria-expanded="'+open.has(i)+'"><span class="dname">'+p.d+dlabel+'</span><span class="dtitle">'+p.t+'<span>'+sub+'</span></span><span class="tick" aria-hidden="true">✓</span></button><div class="body">';
    p.tasks.forEach((tk,j)=>{
      const hk=i+'-'+j, hasHow=tk[2]&&tk[2].length, isOpen=howOpen.has(hk);
      html+='<div class="task"><div class="trow"><label><input type="checkbox" data-d="'+i+'" data-t="'+j+'"'+(dd.tasks[j]?' checked':'')+'><span><b>'+tk[0]+'</b><small>'+tk[1]+'</small></span></label>';
      if(hasHow) html+='<button class="howbtn" data-how="'+hk+'" aria-expanded="'+isOpen+'">How to</button>';
      html+='</div>';
      if(hasHow&&isOpen) html+='<div class="how">'+howHTML(tk[2])+'</div>';
      html+='</div>';
    });
    if(p.run){
      html+='<div class="log"><label for="km'+i+'">Distance run (km)</label><input class="km" id="km'+i+'" data-km="'+i+'" type="number" step="0.1" min="0" inputmode="decimal" value="'+(dd.km??'')+'">';
      html+='<label>Pain during the run (0–10)</label><div class="chips">'+chips(i,'pd',dd.pd)+'</div>';
      html+='<label>Pain next morning (0–10)</label><div class="chips">'+chips(i,'pn',dd.pn)+'</div>';
      const v=verdict(dd); if(v) html+='<div class="verdict '+v[0]+'">'+v[1]+'</div>';
      html+='</div>';
    }
    html+='</div>';
    el.innerHTML=html;
    el.querySelector('.head').onclick=()=>{open.has(i)?open.delete(i):open.add(i);render();};
    wrap.appendChild(el);
  });
  document.getElementById('barfill').style.width=(done/7*100)+'%';
  document.getElementById('progtxt').textContent=done+' of 7 days done';
  renderSummary();
  if(fk){const el=document.querySelector(fk); if(el) el.focus({preventScroll:true});}
}
function chips(i,f,val){
  let s='';for(let n=0;n<=10;n++){s+='<button class="chip '+cls(n)+(val===n?' on':'')+'" data-d="'+i+'" data-f="'+f+'" data-v="'+n+'" aria-pressed="'+(val===n)+'" aria-label="Pain '+n+'">'+n+'</button>';}
  return s;
}
function renderSummary(){
  const runs=PLAN.map((p,i)=>p.run?dayData(i):null).filter(Boolean);
  const logged=runs.filter(r=>r.pd!=null);
  // A run only counts as fully logged once next-morning pain is in, matching the per-run verdict.
  const complete=logged.filter(r=>r.pn!=null);
  const total=runs.reduce((a,r)=>a+(parseFloat(r.km)||0),0);
  let msg;
  if(!logged.length) msg='Log your runs to see what to do next week.';
  else{
    const worst=Math.max(...logged.map(r=>Math.max(r.pd,r.pn??0)));
    const shortDay=PLAN.find(p=>p.run==='short'), sd=DAY_FULL[PLAN.indexOf(shortDay)];
    if(worst<=3 && complete.length===runs.length) msg=state.week>=8
      ? 'All runs within limits. That’s the whole programme done.'
      : 'All runs within limits. Next week: '+sd+' about '+fmtKm(runTarget(state.week+1,shortDay))+' km and the Saturday 5k.';
    else if(worst<=3) msg='So far, so good. Log every run, including next-morning pain, before deciding on next week.';
    else if(worst<=5) msg='Some runs went over 3/10. Next week, repeat this '+sd+'’s distance rather than adding more, and run/walk the 5k.';
    else msg='Pain hit '+worst+'/10 this week. Drop '+sd+' back to last week’s distance, walk or skip the 5k, and book a physio if it happens again.';
  }
  const lb=isoToNum(state.lastBackup);
  const nudge=backupDue()
    ?'<div class="nudge">'+(lb==null?'You haven’t backed up your logs yet.':'Last backup was '+fmtDate(lb)+'.')+' <button class="link" id="backup-now" type="button">Back up now</button></div>'
    :'';
  document.getElementById('summary').innerHTML='<h2 class="cond">This week</h2><div>'+total.toFixed(1)+' km run across '+logged.length+' logged run'+(logged.length===1?'':'s')+'.</div><div style="margin-top:6px">'+msg+'</div>'+nudge;
}
// Celebrate a day when its last task is ticked, and the whole week when all 7 days are done.
function reducedMotion(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function buzz(p){try{if(navigator.vibrate) navigator.vibrate(p);}catch(e){}}
let toastTimer;
function toast(msg){
  const t=document.getElementById('toast');
  t.classList.remove('show');
  t.innerHTML='<span class="ck" aria-hidden="true">✓</span><span></span>';
  t.lastChild.textContent=msg;
  void t.offsetWidth; // restart the slide-in if a toast is already showing
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),Math.max(2600,msg.length*60)); // longer messages stay up longer
}
function burst(x,y,n,dMin,dMax,opts){
  opts=opts||{};
  const b=document.createElement('div');
  b.className='burst'; b.setAttribute('aria-hidden','true');
  b.style.left=x+'px'; b.style.top=y+'px';
  const cols=opts.cols||['var(--ok)','var(--accent)','var(--warn)'];
  let h='';
  for(let k=0;k<n;k++){
    const a=Math.round(k*360/n+Math.random()*360/n);
    const d=Math.round(dMin+Math.random()*(dMax-dMin));
    const r=Math.round(Math.random()*360-180);
    h+='<i class="'+(k%3===0?'bar':'')+'" style="--a:'+a+'deg;--d:'+d+'px;--r:'+r+'deg;--c:'+cols[k%cols.length]+';--fall:'+(opts.fall||14)+'px;--t:'+(opts.time||.8)+'s;animation-delay:'+Math.round(Math.random()*80)+'ms"></i>';
  }
  b.innerHTML=h;
  document.body.appendChild(b);
  setTimeout(()=>b.remove(),(opts.time||.8)*1000+300);
}
function celebrate(i){
  const done=PLAN.filter((_,j)=>isDone(j)).length;
  const weekDone=done===7;
  if(weekDone) toast(state.week===8?'Week 8 done. That’s the whole programme!':'Week '+state.week+' done. All 7 days ticked off!');
  else toast(DAY_FULL[i]+' done. '+done+' of 7 this week.');
  buzz(weekDone?[20,60,20,60,45]:[15,50,25]);
  if(reducedMotion()) return;
  const sec=document.querySelectorAll('#days .day')[i];
  if(sec){
    sec.classList.add('pop');
    setTimeout(()=>sec.classList.remove('pop'),1000);
    const r=sec.querySelector('.tick').getBoundingClientRect();
    burst(r.left+r.width/2,r.top+r.height/2,16,26,62);
  }
  if(weekDone){
    const hd=document.querySelector('header'), h=document.getElementById('wk').getBoundingClientRect();
    setTimeout(()=>{
      hd.classList.add('cheer'); setTimeout(()=>hd.classList.remove('cheer'),900);
      burst(h.left+h.width/2,h.top+h.height/2,44,70,190,{time:1.3,fall:70,cols:['var(--accent-ink)','var(--warn)','var(--ok)']});
    },220);
  }
}

document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.t!=null){
    const d=+t.dataset.d, was=isDone(d);
    dayData(d).tasks[+t.dataset.t]=t.checked; save(); render();
    if(!was&&isDone(d)) celebrate(d);
  }
  else if(t.dataset.km!=null){dayData(+t.dataset.km).km=t.value;save();renderSummary();}
  else if(t.id==='base'){const v=parseFloat(t.value);if(v>0){state.base=v;save();render();}}
  else if(t.id==='start'){
    // The programme runs Monday to Sunday, so any date snaps back to the Monday of its week.
    const n=isoToNum(t.value);
    state.start=n==null?null:numToIso(n-weekdayOf(n));
    save(); render();
  }
  else if(t.id==='gfile'){const f=t.files&&t.files[0]; t.value=''; handleGarminFile(f);}
  else if(t.id==='rfile'){const f=t.files&&t.files[0]; t.value=''; handleRestoreFile(f);}
  else if(t.name==='gunit'){gData.miles=t.value==='mi'; showGarmin(); document.querySelector('input[name="gunit"][value="'+t.value+'"]').focus();}
});
function renderSettings(){
  document.getElementById('base').value=state.base;
  const s=startNum(), si=document.getElementById('start');
  if(document.activeElement!==si) si.value=state.start||'';
  const note=document.getElementById('startnote');
  if(s==null) note.textContent='Used to show dates and to put Garmin runs on the right day.';
  else{
    const tw=weekOfToday();
    note.innerHTML='Week 1 starts Monday '+fmtDate(s)+'. Week 8 ends Sunday '+fmtDate(s+55)+'.'
      +(tw?' Today is in week '+tw+'.'+(view==='week'&&tw!==state.week?' <button class="link" id="gotoday">Go to week '+tw+'</button>':''):'');
  }
  const gf=document.getElementById('gfile');
  gf.disabled=s==null;
  document.getElementById('gpick').classList.toggle('disabled',s==null);
  document.getElementById('gnote').textContent=s==null
    ?'Set a programme start date first.'
    :'Fills in run distances from a Garmin Connect export.';
  const lb=isoToNum(state.lastBackup);
  document.getElementById('bnote').textContent=(lb==null?'Not backed up yet.':'Last backed up '+fmtDate(lb)+'.')
    +' Your logs are stored only on this device, so keep a backup before you change or reset your phone.';
}
document.addEventListener('click',e=>{
  if(e.target.id==='gotoday'){openDay(weekOfToday(),Math.max(0,Math.min(6,todayNum()-dateOf(weekOfToday(),0)))); return;}
  if(e.target.id==='gok'){applyGarmin(); return;}
  if(e.target.id==='gcancel'){closeSheet('gdlg'); return;}
  if(e.target.id==='backup'||e.target.id==='backup-now'){backUp(); return;}
  if(e.target.id==='rok'){applyRestore(); return;}
  if(e.target.id==='rcancel'){closeSheet('rdlg'); return;}
  const cell=e.target.closest('.cell');
  if(cell){openDay(...cell.dataset.cell.split('-').map(Number)); return;}
  const hb=e.target.closest('.howbtn');
  if(hb){const k=hb.dataset.how; howOpen.has(k)?howOpen.delete(k):howOpen.add(k); render(); return;}
  const c=e.target.closest('.chip'); if(!c) return;
  const dd=dayData(+c.dataset.d); const v=+c.dataset.v; const f=c.dataset.f;
  dd[f]= dd[f]===v ? null : v; save(); render();
});
// The arrows step weeks in the Week tab and 4-week blocks in the Month tab.
// If an arrow disables itself (first or last), move focus to the other one so it isn't lost.
function step(d){
  if(view==='month') month=Math.min(2,Math.max(1,month+d));
  else{state.week=Math.min(8,Math.max(1,state.week+d));open.clear();howOpen.clear();save();}
  render();
  const p=document.getElementById('prev'),n=document.getElementById('next');
  if(p.disabled&&document.activeElement!==n&&d<0) n.focus();
  if(n.disabled&&document.activeElement!==p&&d>0) p.focus();
}
document.getElementById('prev').onclick=()=>step(-1);
document.getElementById('next').onclick=()=>step(1);

function setView(v,focusTab){
  if(v===view) return;
  view=v;
  if(v==='month') month=state.week<=4?1:2;
  render();
  if(focusTab) document.getElementById('tab-'+v).focus();
}
document.getElementById('tab-week').onclick=()=>setView('week');
document.getElementById('tab-month').onclick=()=>setView('month');
document.querySelector('.tabs').addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault();
    setView(e.key==='Home'?'week':e.key==='End'?'month':view==='week'?'month':'week',true);
  }
});
// Tapping a day in the month grid opens that week with the day expanded.
function openDay(w,i){
  view='week'; state.week=w; open.clear(); howOpen.clear(); open.add(i); save(); render();
  const h=document.querySelector('[data-head="'+i+'"]');
  if(h){
    h.focus({preventScroll:true});
    const top=h.closest('.day').getBoundingClientRect().top+scrollY-document.querySelector('header').getBoundingClientRect().bottom-10;
    window.scrollTo({top:Math.max(0,top),behavior:reducedMotion()?'auto':'smooth'});
  }
}
document.getElementById('reset').onclick=()=>{if(confirm('Clear everything logged for week '+state.week+'?')){state.weeks['w'+state.week]={};save();render();}};
// Tap the backdrop (outside the dialog box) to close a dialog.
document.querySelectorAll('dialog.sheet').forEach(d=>d.addEventListener('click',e=>{
  if(e.target!==d) return;
  const r=d.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeSheet(d.id);
}));
render();

// Offline support once hosted (GitHub Pages is https). Skipped on file:// and, so edits show up straight away,
// on localhost unless the address ends in ?sw.
(function(){
  const local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if(!('serviceWorker' in navigator)||location.protocol==='file:'||(local&&!/[?&]sw\b/.test(location.search))) return;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
