// Backup and restore. A backup is a small JSON file the user keeps somewhere safe (iCloud Drive,
// Google Drive, an email to themselves). Restoring replaces everything on this device, after a confirmation.
// Depends on PLAN (plan.js), dates.js, openSheet/closeSheet (garmin.js) and, at call time,
// app.js (state, normalise, save, render, toast).

const BACKUP_APP='itb-tracker';

// Days done, km logged and days with anything logged, for any saved data (not just the current state).
function statsOf(data){
  let done=0,km=0,days=0;
  const W=data&&data.weeks&&typeof data.weeks==='object'?data.weeks:{};
  for(let w=1;w<=8;w++){
    const wk=W['w'+w]; if(!wk||typeof wk!=='object') continue;
    PLAN.forEach((p,i)=>{
      const d=wk[i]; if(!d||typeof d!=='object') return;
      const t=Array.isArray(d.tasks)?d.tasks:[];
      if(p.tasks.every((_,j)=>t[j])) done++;
      km+=parseFloat(d.km)||0;
      if(t.some(Boolean)||d.pd!=null||parseFloat(d.km)>0) days++;
    });
  }
  return {done,km,days};
}
function statsText(s){return s.days?s.done+' day'+(s.done===1?'':'s')+' done, '+s.km.toFixed(1)+' km logged':'nothing logged';}
function backupDue(){
  if(!statsOf(state).days) return false;
  const n=isoToNum(state.lastBackup);
  return n==null||todayNum()-n>=7;
}

// On a phone, hand the file to the share sheet (Save to Files, Drive, email). Elsewhere, download it.
async function backUp(){
  const prev=state.lastBackup;
  state.lastBackup=numToIso(todayNum());
  const json=JSON.stringify({app:BACKUP_APP,version:1,exported:new Date().toISOString(),data:state});
  const file=new File([json],'itb-tracker-backup-'+state.lastBackup+'.json',{type:'application/json'});
  let how=null;
  const touch=window.matchMedia&&matchMedia('(pointer: coarse)').matches;
  if(touch&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'ITB tracker backup'}); how='shared';}
    catch(e){ if(e&&e.name==='AbortError'){state.lastBackup=prev; return;} } // cancelled: nothing saved
  }
  if(!how){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(file); a.download=file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),10000);
    how='downloaded';
  }
  save(); render();
  toast(how==='shared'?'Backup ready. Keep it somewhere safe, like iCloud Drive or Google Drive.':'Backup downloaded. Keep the file somewhere safe.');
}

let pendingRestore=null;
function restoreSheet(html,canRestore){
  document.getElementById('rdlg-body').innerHTML=html;
  document.getElementById('rok').hidden=!canRestore;
  document.getElementById('rcancel').textContent=canRestore?'Cancel':'Close';
  openSheet('rdlg');
}
async function handleRestoreFile(file){
  if(!file) return;
  let obj=null;
  try{obj=JSON.parse(await file.text());}catch(e){}
  // Accept the backup wrapper, or the raw saved data on its own.
  const data=obj&&obj.app===BACKUP_APP?obj.data:obj;
  if(!data||typeof data!=='object'||!data.weeks||typeof data.weeks!=='object'){
    pendingRestore=null;
    restoreSheet('<p>This isn’t an ITB tracker backup. Choose a file with a name like itb-tracker-backup-2026-11-23.json.</p>',false);
    return;
  }
  pendingRestore=data;
  let when=isoToNum(data.lastBackup);
  if(when==null&&obj.exported){const d=new Date(obj.exported); if(!isNaN(d)) when=dayNum(d.getFullYear(),d.getMonth()+1,d.getDate());}
  restoreSheet(
    '<p><b>Backup'+(when!=null?' from '+fmtDate(when):'')+':</b> '+statsText(statsOf(data))+'.</p>'
    +'<p><b>This device now:</b> '+statsText(statsOf(state))+'.</p>'
    +'<p>Restoring replaces everything on this device with the backup, and can’t be undone. If you might want what’s here now, back it up first.</p>',true);
}
function applyRestore(){
  if(!pendingRestore) return;
  state=normalise(pendingRestore); pendingRestore=null;
  month=state.week<=4?1:2;
  save(); closeSheet('rdlg'); render();
  toast('Backup restored.');
}
