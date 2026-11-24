// Month view: the 8-week programme shown as two 4-week blocks (weeks 1–4 and 5–8).
// Reads saved logs without creating empty entries. Depends on globals from plan.js (PLAN)
// and, at call time, from app.js (state, cls, weekTarget).

// Column labels for the grid, one per PLAN day. Keep them to about 6 characters so they fit at phone width.
const SHORT=['Legs A','Push','Badm.','Legs B','Pull','5k','Full'];
const DAY_FULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function peek(w,i){
  const W=state.weeks['w'+w], d=W&&typeof W==='object'?W[i]:null;
  return d&&typeof d==='object'?d:{tasks:[]};
}
function tasksOf(d){return Array.isArray(d.tasks)?d.tasks:[];}
function doneIn(w,i){const t=tasksOf(peek(w,i));return PLAN[i].tasks.every((_,j)=>t[j]);}
function startedIn(w,i){const d=peek(w,i);return tasksOf(d).some(Boolean)||d.pd!=null||parseFloat(d.km)>0;}
function worstOf(d){return d.pd==null?null:Math.max(d.pd,d.pn??0);}
function weekStats(w){
  let done=0,km=0,runs=0,logged=0,worst=null,target=0;
  PLAN.forEach((p,i)=>{
    if(doneIn(w,i)) done++;
    if(!p.run) return;
    const d=peek(w,i);
    if(runReplaced(d,i)) return; // a run swapped for something else doesn't count towards running
    runs++; target+=runTarget(w,p);
    km+=parseFloat(d.km)||0;
    const wp=worstOf(d); if(wp!=null){logged++; worst=worst==null?wp:Math.max(worst,wp);}
  });
  return {done,km,runs,logged,worst,target};
}
function painBadge(p){return '<span class="pb '+cls(p)+'">'+p+'</span>';}

function renderMonth(month){
  const w0=(month-1)*4+1, weeks=[w0,w0+1,w0+2,w0+3];
  const stats=weeks.map(weekStats);
  const sum=k=>stats.reduce((a,s)=>a+s[k],0);
  const done=sum('done'), km=sum('km'), runs=sum('runs'), logged=sum('logged');

  document.getElementById('wk').innerHTML='Month '+month+'<small>of 2</small>';
  document.getElementById('barfill').style.width=(done/28*100)+'%';
  document.getElementById('progtxt').textContent=done+' of 28 days done';
  const d0=dateOf(w0,0);
  document.getElementById('target').textContent=d0==null?'Weeks '+w0+'–'+(w0+3):fmtShort(d0)+' to '+fmtShort(d0+27);
  const today=todayNum();

  // Calendar grid: one row per week, Monday to Sunday.
  let g='<table class="mgrid"><caption class="sr">Weeks '+w0+' to '+(w0+3)+'. Select a day to open it.</caption><thead><tr><th scope="col"><span class="sr">Week</span></th>';
  PLAN.forEach((p,i)=>{g+='<th scope="col"><abbr title="'+DAY_FULL[i]+'">'+p.d[0]+'</abbr><small>'+SHORT[i]+'</small></th>';});
  g+='</tr></thead><tbody>';
  weeks.forEach(w=>{
    g+='<tr'+(w===state.week?' class="now"':'')+'><th scope="row"><span class="sr">Week </span>'+w+'</th>';
    PLAN.forEach((p,i)=>{
      const d=peek(w,i), fin=doneIn(w,i), st=!fin&&startedIn(w,i);
      const k=parseFloat(d.km)>0?(+d.km).toFixed(1):'', wp=worstOf(d);
      const date=dateOf(w,i), isToday=date===today;
      const label='Week '+w+', '+DAY_FULL[i]+(date!=null?' '+fmtDate(date):'')+(isToday?' (today)':'')+', '+p.t.toLowerCase()+': '+(fin?'done':st?'started':'not started')
        +(k?', '+k+' km':'')+(wp!=null?', worst pain '+wp+' out of 10':'');
      g+='<td><button class="cell'+(fin?' done':st?' part':'')+(k?' has-km':'')+(isToday?' today':'')+'" data-cell="'+w+'-'+i+'" aria-label="'+label+'">'
        +(fin?'<span class="ck" aria-hidden="true">✓</span>':'')
        +(wp!=null?'<span aria-hidden="true">'+painBadge(wp)+'</span>':'')
        +(k?'<span class="ckm" aria-hidden="true">'+k+'</span>':'')
        +'</button></td>';
    });
    g+='</tr>';
  });
  g+='</tbody></table>';
  const showToday=weeks.some(w=>{const s=dateOf(w,0); return s!=null&&today>=s&&today<s+7;});
  g+='<div class="legend" aria-hidden="true"><span><i class="lg done">✓</i>Done</span><span><i class="lg part"></i>Started</span>'
    +(showToday?'<span><i class="lg today"></i>Today</span>':'')
    +'<span>'+painBadge(2)+painBadge(4)+painBadge(6)+'Worst pain</span></div>';

  let h='<div class="card">'+g+'</div>';

  // Headline numbers for the block.
  h+='<div class="stats">'
    +'<div class="stat"><b>'+done+'<small>/28</small></b><span>Days done</span></div>'
    +'<div class="stat"><b>'+km.toFixed(1)+'</b><span>Km run</span></div>'
    +'<div class="stat"><b>'+logged+'<small>/'+runs+'</small></b><span>Runs logged</span></div></div>';

  // Week by week: distance against the week's target, and the worst pain logged.
  h+='<div class="card"><h2 class="cond">Week by week</h2>';
  weeks.forEach((w,n)=>{
    const s=stats[n], pct=s.target?Math.min(100,s.km/s.target*100):0;
    const ws=dateOf(w,0);
    h+='<div class="wrow'+(w===state.week?' now':'')+'"><b>Week '+w+'</b><span class="wmeta">'+(ws==null?'':fmtShort(ws)+', ')+s.done+' of 7 days</span>'
      +'<span class="wpain">'+(s.worst==null?'<span class="muted">No runs logged</span>':painBadge(s.worst)+'Worst pain')+'</span>'
      +'<div class="meter" aria-hidden="true"><span style="width:'+pct.toFixed(1)+'%"></span></div>'
      +'<span class="wkm">'+(s.runs?s.km.toFixed(1)+' of '+s.target.toFixed(1)+' km':'Runs replaced')+'</span></div>';
  });
  h+='<p class="trend">'+trendText(weeks)+'</p></div>';

  document.getElementById('view-month').innerHTML=h;
}

// Compare the worst pain in the first logged week of the programme with the latest logged week in this block.
function trendText(weeks){
  let first=null,last=null;
  for(let w=1;w<=weeks[3];w++){const s=weekStats(w); if(s.worst==null) continue; if(!first) first={w,p:s.worst}; if(weeks.includes(w)) last={w,p:s.worst};}
  if(!last) return 'No runs logged in these weeks yet.';
  if(first.w===last.w) return 'Log runs in at least two weeks to see how your pain is trending.';
  if(last.p===0) return 'No pain logged in week '+last.w+'. Nice work.';
  const physio=last.w>=4?' See a physio before adding distance.':'';
  if(last.p<first.p) return 'Pain is easing: worst pain went from '+first.p+'/10 in week '+first.w+' to '+last.p+'/10 in week '+last.w+'.';
  if(last.p===first.p) return 'Pain isn’t clearly easing: worst pain was '+last.p+'/10 in both week '+first.w+' and week '+last.w+'.'+physio;
  return 'Pain is higher than at the start: '+first.p+'/10 in week '+first.w+', '+last.p+'/10 in week '+last.w+'.'+physio;
}
