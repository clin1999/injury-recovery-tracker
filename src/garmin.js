// Garmin Connect import. Reads the CSV from Garmin Connect's Activities list (Export CSV) on this
// device, nothing is uploaded. Runs are matched to programme run days by date. Pain is still logged by hand.
// Depends on globals from plan.js (PLAN), dates.js and month.js, and at call time app.js (state, dayAt, save, render, toast).

function parseCSV(text){
  const rows=[]; let row=[], f='', q=false;
  text=String(text).replace(/^﻿/,'');
  for(let k=0;k<text.length;k++){
    const c=text[k];
    if(q){ if(c==='"'){ if(text[k+1]==='"'){f+='"';k++;} else q=false; } else f+=c; }
    else if(c==='"') q=true;
    else if(c===','){row.push(f); f='';}
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[k+1]==='\n') k++; row.push(f); rows.push(row); row=[]; f=''; }
    else f+=c;
  }
  if(f!==''||row.length){row.push(f); rows.push(row);}
  return rows.filter(r=>r.some(x=>x.trim()!==''));
}
// "5.02", "5,02" (decimal comma), "1,234.5" (thousands) and "--" (no value).
function csvNum(s){
  s=String(s||'').trim(); if(!s||s==='--') return NaN;
  s=/^\d+,\d{1,2}$/.test(s)?s.replace(',','.'):s.replace(/,/g,'');
  return parseFloat(s);
}
function csvDate(s){
  s=String(s||'').trim();
  const n=isoToNum(s); if(n!=null) return n;
  const t=Date.parse(s); if(isNaN(t)) return null;
  const d=new Date(t); return dayNum(d.getFullYear(),d.getMonth()+1,d.getDate());
}
// Returns {acts:[{type,date,dist}], miles} or throws 'empty' / 'columns'.
function readGarmin(text){
  const rows=parseCSV(text); if(rows.length<2) throw new Error('empty');
  const head=rows[0].map(h=>h.trim().toLowerCase());
  const col=re=>head.findIndex(h=>re.test(h));
  const cType=col(/^activity type$|^type$|^sport$/), cDate=col(/^date$|^start time|^begin/), cDist=col(/^distance/);
  if(cType<0||cDate<0||cDist<0) throw new Error('columns');
  return {
    miles:/\(mi\)|miles/.test(head[cDist]),
    acts:rows.slice(1).map(r=>({type:(r[cType]||'').trim(),date:csvDate(r[cDate]),dist:csvNum(r[cDist])}))
  };
}

function runTaskIdx(i){return PLAN[i].tasks.findIndex(t=>t[0]==='Run');}

// Work out what an import would change, without changing anything.
function planImport(acts,miles){
  const s=startNum(), factor=miles?1.609344:1;
  const res={rows:[],before:0,after:0,other:0,bad:0,extra:0};
  const runDays=PLAN.map((p,i)=>p.run?i:-1).filter(i=>i>=0);
  // Add up every run on the same date first (a warm-up jog saved separately, for example).
  const byDate=new Map();
  acts.forEach(a=>{
    if(!/run/i.test(a.type)){res.other++; return;}
    if(a.date==null||!(a.dist>0)){res.bad++; return;}
    const diff=a.date-s;
    if(diff<0){res.before++; return;}
    if(diff>=56){res.after++; return;}
    const e=byDate.get(a.date)||{date:a.date,km:0,n:0};
    e.km+=a.dist*factor; e.n++; byDate.set(a.date,e);
  });
  const slots={};
  const put=(w,i,e,moved)=>{slots[w+'-'+i]={w,i,km:e.km,n:e.n,date:e.date,moved};};
  const dates=[...byDate.values()].sort((a,b)=>a.date-b.date);
  // Runs on a planned run day go straight there.
  const off=[];
  dates.forEach(e=>{const diff=e.date-s, w=Math.floor(diff/7)+1, i=diff%7; if(PLAN[i].run) put(w,i,e,false); else off.push({w,i,e});});
  // A run on another day counts as the nearest free run day in that week (the earlier one if tied).
  off.forEach(o=>{
    const free=runDays.filter(r=>!slots[o.w+'-'+r]).sort((a,b)=>Math.abs(a-o.i)-Math.abs(b-o.i)||a-b);
    if(free.length) put(o.w,free[0],o.e,true); else res.extra++;
  });
  Object.values(slots).sort((a,b)=>a.w-b.w||a.i-b.i).forEach(sl=>{
    const d=peek(sl.w,sl.i), km=String(+sl.km.toFixed(2)), ri=runTaskIdx(sl.i);
    const same=parseFloat(d.km)===+km, ticked=!!tasksOf(d)[ri];
    res.rows.push(Object.assign(sl,{km,old:d.km&&!same?d.km:null,change:!same||!ticked}));
  });
  return res;
}

let gData=null, gPlan=null;
// Shared by the Garmin and restore dialogs.
function openSheet(id){const d=document.getElementById(id||'gdlg'); if(!d.open){ if(d.showModal) d.showModal(); else d.setAttribute('open',''); }}
function closeSheet(id){const d=document.getElementById(id||'gdlg'); if(d.close) d.close(); else d.removeAttribute('open');}

function garminError(msg){
  gData=null;
  document.getElementById('gdlg-body').innerHTML='<p>'+msg+'</p>';
  const ok=document.getElementById('gok'); ok.hidden=true;
  document.getElementById('gcancel').textContent='Close';
  openSheet();
}
async function handleGarminFile(file){
  if(!file) return;
  if(startNum()==null){garminError('Set your programme start date first, so runs land on the right days.'); return;}
  let text;
  try{text=await file.text();}catch(e){garminError('Couldn’t read that file. Try saving it again from Garmin Connect.'); return;}
  try{gData=readGarmin(text);}
  catch(e){garminError(e.message==='columns'
    ?'This doesn’t look like a Garmin Connect activities export. It needs Activity Type, Date and Distance columns.'
    :'That file has no activities in it.'); return;}
  showGarmin();
  openSheet();
}
function showGarmin(){
  gPlan=planImport(gData.acts,gData.miles);
  const p=gPlan, changes=p.rows.filter(r=>r.change).length, s=startNum();
  const plural=(n,w)=>n+' '+w+(n===1?'':'s');
  let h='<p>'+(p.rows.length
      ?'Found '+plural(p.rows.length,'run')+' between '+fmtDate(s)+' and '+fmtDate(s+55)+'.'
      :'No runs found between '+fmtDate(s)+' and '+fmtDate(s+55)+'.')+'</p>';
  h+='<fieldset class="units"><legend>Distances in the file are</legend>'
    +'<label><input type="radio" name="gunit" value="km"'+(gData.miles?'':' checked')+'> km</label>'
    +'<label><input type="radio" name="gunit" value="mi"'+(gData.miles?' checked':'')+'> miles</label></fieldset>';
  if(p.rows.length){
    h+='<ul class="glist">';
    p.rows.forEach(r=>{
      const notes=[fmtDate(r.date)+'.'];
      if(r.moved) notes.push('Ran on '+DAY_FULL[weekdayOf(r.date)]+', counted as this run.');
      if(r.n>1) notes.push(r.n+' activities added together.');
      if(r.old) notes.push('Replaces '+r.old+' km.');
      if(!r.change) notes.push('Already up to date.');
      h+='<li'+(r.change?'':' class="same"')+'><b>Week '+r.w+', '+DAY_FULL[r.i]+'</b><span class="gkm">'+(+r.km).toFixed(2).replace(/0$/,'')+' km</span><small>'+notes.join(' ')+'</small></li>';
    });
    h+='</ul>';
  }
  const skip=[];
  if(p.before) skip.push(plural(p.before,'run')+' before the start date');
  if(p.after) skip.push(plural(p.after,'run')+' after week 8');
  if(p.extra) skip.push(plural(p.extra,'extra run')+' in weeks that already had '+PLAN.filter(d=>d.run).length);
  if(p.bad) skip.push(plural(p.bad,'run')+' with no date or distance');
  let foot='';
  if(skip.length) foot+='Skipped '+skip.join(', ')+'. ';
  if(p.other) foot+=(p.other===1?'1 other activity':p.other+' other activities')+' (cycling, strength and so on) ignored. ';
  foot+='Importing fills in distance and ticks the Run task. Pain scores are still yours to add.';
  h+='<p class="gfoot">'+foot+'</p>';
  document.getElementById('gdlg-body').innerHTML=h;
  const ok=document.getElementById('gok');
  ok.hidden=false; ok.disabled=!changes;
  ok.textContent=changes?'Import '+plural(changes,'run'):'Nothing new to import';
  document.getElementById('gcancel').textContent='Cancel';
}
function applyGarmin(){
  if(!gPlan) return;
  let n=0, completed=0;
  gPlan.rows.filter(r=>r.change).forEach(r=>{
    const was=doneIn(r.w,r.i), d=dayAt(r.w,r.i), ri=runTaskIdx(r.i);
    d.km=r.km; if(ri>=0) d.tasks[ri]=true; n++;
    if(!was&&doneIn(r.w,r.i)) completed++;
  });
  save(); closeSheet(); render();
  toast('Imported '+n+' run'+(n===1?'':'s')+(completed?', '+completed+' day'+(completed===1?'':'s')+' completed':'')+'. Add your pain scores.');
}
