// Calendar helpers. Dates are whole-day numbers (days since 1970-01-01, counted in UTC) so a
// daylight saving change can't shift a run onto the wrong day. The programme start is always a Monday.

const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dayNum(y,m,d){return Math.round(Date.UTC(y,m-1,d)/864e5);}
function isoToNum(s){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(s||'').trim()); return m?dayNum(+m[1],+m[2],+m[3]):null;}
function numToIso(n){return new Date(n*864e5).toISOString().slice(0,10);}
function todayNum(){const t=new Date(); return dayNum(t.getFullYear(),t.getMonth()+1,t.getDate());}
function weekdayOf(n){return (new Date(n*864e5).getUTCDay()+6)%7;} // 0 = Monday
function fmtDate(n){const d=new Date(n*864e5); return String(d.getUTCDate()).padStart(2,'0')+'-'+MON[d.getUTCMonth()]+'-'+d.getUTCFullYear();}
function fmtShort(n){const d=new Date(n*864e5); return String(d.getUTCDate()).padStart(2,'0')+'-'+MON[d.getUTCMonth()];}

// Programme dates. These return null when no start date is set.
function startNum(){return state.start?isoToNum(state.start):null;}
function dateOf(w,i){const s=startNum(); return s==null?null:s+(w-1)*7+i;}
function weekOfToday(){const s=startNum(); if(s==null) return null; const w=Math.floor((todayNum()-s)/7)+1; return w>=1&&w<=8?w:null;}
