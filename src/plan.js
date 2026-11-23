// Exercise library (EX), stick-figure drawing helpers (L, F, S) and the weekly plan (PLAN).
// Loaded before app.js as a classic script so the page works from file://.

const KEY='itb-tracker-v1';
function L(pts,c){return '<polyline'+(c?' class="'+c+'"':'')+' points="'+pts.map(p=>p.join(',')).join(' ')+'"/>';}
function F(o){
  let g='<g class="fig">';
  if(o.ef) g+=L([o.s,o.ef,o.hf],'far');
  if(o.kf) g+=L([o.p,o.kf,o.ff],'far');
  g+=L([o.s,o.p])+L([o.p,o.kn,o.fn])+L([o.s,o.en,o.hn]);
  g+='<circle cx="'+o.h[0]+'" cy="'+o.h[1]+'" r="8"/></g>';
  return g;
}
function S(inner,label){return '<svg viewBox="0 0 200 112" role="img" aria-label="'+label+'"><line class="ground" x1="0" y1="108" x2="200" y2="108"/>'+inner+'</svg>';}
const arrow='<polyline class="band" points="150,52 182,52"/><polyline class="band" points="175,46 182,52 175,58"/>';
const EX={
 band:{n:'Banded lateral walk',pic:S(F({h:[100,18],s:[100,32],p:[100,66],kn:[80,84],fn:[70,106],kf:[120,84],ff:[130,106],en:[86,50],hn:[92,64],ef:[114,50],hf:[108,64]})+'<line class="band" x1="72" y1="100" x2="128" y2="100"/>'+arrow,'Person in a quarter squat with a band around the ankles, stepping sideways'),
  st:['Loop a band around your ankles or the balls of your feet.','Sink into a quarter squat with feet hip-width apart.','Step sideways 10 steps, then come back the other way, keeping tension on the band the whole time.'],
  cue:'Keep your toes pointing forward and don’t let your knees cave in.'},
 bridge:{n:'Glute bridge',pic:S(F({h:[30,98],s:[46,100],p:[100,80],kn:[134,62],fn:[150,106],kf:[128,64],ff:[144,106],en:[70,105],hn:[92,106]}),'Person lying on their back with hips lifted and knees bent'),
  st:['Lie on your back, knees bent, feet flat and hip-width apart.','Push through your heels and lift your hips until you form a straight line from shoulders to knees.','Squeeze your glutes for 2 seconds at the top, then lower slowly.'],
  cue:'Lift with your glutes, not by arching your lower back.'},
 slbridge:{n:'Single-leg bridge',pic:S(F({h:[30,98],s:[46,100],p:[100,80],kf:[134,62],ff:[150,106],kn:[136,68],fn:[170,58],en:[70,105],hn:[92,106]}),'Person bridging on one leg with the other leg straight'),
  st:['Start as for a glute bridge, then straighten one leg so it lines up with the other thigh.','Push through the planted heel and lift your hips.','Hold 1 to 2 seconds at the top and lower slowly. Finish all reps, then switch sides.'],
  cue:'Keep your hips level. Don’t let the side with the lifted leg drop.'},
 thrust:{n:'Hip thrust',pic:S('<rect class="prop" x="8" y="80" width="40" height="28" rx="3"/>'+'<circle class="prop" cx="98" cy="66" r="12"/>'+F({h:[24,66],s:[42,78],p:[98,78],kn:[132,62],fn:[144,106],kf:[128,64],ff:[140,106],en:[70,70],hn:[94,64]}),'Person with upper back on a bench and a barbell across the hips, hips raised level'),
  st:['Sit with your upper back against the edge of a bench, just below your shoulder blades, and a padded bar across your hip crease.','Plant your feet flat, so your shins are vertical when your hips are up.','Drive your hips up until your torso and thighs are level, squeeze, then lower with control.'],
  cue:'Keep your chin tucked and your ribs down so the movement comes from your hips.'},
 rdl:{n:'Single-leg Romanian deadlift',pic:S('<rect class="prop" x="50" y="92" width="16" height="6" rx="2"/>'+F({h:[42,56],s:[56,60],p:[100,62],kn:[102,84],fn:[100,106],kf:[134,62],ff:[168,64],en:[56,78],hn:[58,92]}),'Person balancing on one leg, torso tipped forward and other leg straight behind, holding a dumbbell'),
  st:['Stand on one leg with a slight bend in the knee, holding a dumbbell in the opposite hand.','Hinge at the hip, pushing your free leg straight back as your chest lowers.','Lower the weight towards mid-shin with your back flat, then squeeze the standing-side glute to stand up.'],
  cue:'Keep both hips square to the floor. Don’t let the back leg twist outward.'},
 bss:{n:'Bulgarian split squat',pic:S('<rect class="prop" x="150" y="78" width="44" height="30" rx="3"/>'+'<rect class="prop" x="104" y="66" width="14" height="6" rx="2"/>'+F({h:[104,18],s:[104,34],p:[108,70],kn:[72,70],fn:[70,106],kf:[132,100],ff:[162,78],en:[108,52],hn:[110,66]}),'Person in a split squat with the back foot on a bench'),
  st:['Rest the top of your back foot on a bench about one stride behind you.','Drop straight down until your front thigh is close to parallel with the floor.','Push through your front heel to stand back up.'],
  cue:'Your front knee should track over your middle toes and not cave inward.'},
 plank:{n:'Side plank',pic:S(F({h:[36,52],s:[52,64],p:[110,84],kn:[143,95],fn:[176,104],en:[54,104],hn:[82,104],ef:[80,66],hf:[106,80]}),'Person in a side plank on one forearm with body straight'),
  st:['Lie on your side with your elbow directly under your shoulder.','Lift your hips so your body forms a straight line from head to feet.','Hold for the set time, then switch sides.'],
  cue:'Easier version: keep your knees bent and on the floor. Stop the set when your hips start to sag.'},
 clam:{n:'Clamshell',pic:S(F({h:[24,90],s:[48,96],p:[104,96],kf:[138,102],ff:[162,104],kn:[134,74],fn:[162,100],ef:[34,104],hf:[24,100],en:[72,88],hn:[96,90]})+'<line class="band" x1="138" y1="100" x2="134" y2="76"/>','Person lying on their side with knees bent, opening the top knee against a band'),
  st:['Lie on your side with hips and knees bent and a band just above your knees.','Keep your feet together and lift your top knee as far as you can without moving your pelvis.','Pause, then lower slowly.'],
  cue:'If your pelvis rolls backwards, you’re lifting too far.'},
 step:{n:'Step-down',pic:S('<rect class="prop" x="100" y="84" width="60" height="24" rx="3"/>'+F({h:[118,12],s:[120,26],p:[126,54],kn:[112,68],fn:[124,84],kf:[100,74],ff:[94,102],en:[104,36],hn:[88,38]}),'Person standing on one leg on a box, lowering the other heel towards the floor'),
  st:['Stand on a 15 to 20 cm box on one leg, with the other foot hanging off the front.','Bend your standing knee and slowly lower until your free heel taps the floor, taking about 3 seconds.','Push back up through your standing heel.'],
  cue:'Watch your knee: it should stay over your middle toes, with your hips level.'},
 cable:{n:'Cable hip abduction',pic:S('<rect class="prop" x="40" y="8" width="12" height="100" rx="2"/>'+'<line class="cable" x1="52" y1="100" x2="148" y2="100"/>'+F({h:[110,16],s:[110,30],p:[110,62],kf:[106,84],ff:[104,106],kn:[130,82],fn:[148,100],en:[90,40],hn:[54,44],ef:[124,46],hf:[122,62]}),'Person holding a cable column and sweeping the outside leg out to the side'),
  st:['Attach an ankle strap to your outside leg and stand side-on to a low cable pulley.','Hold the column for balance.','Sweep the strapped leg out to the side with toes pointing forward, then return slowly.'],
  cue:'Move only the leg. Don’t lean or swing your body to lift it higher.'},
 lunge:{n:'Lateral lunge',pic:S(F({h:[97,20],s:[96,34],p:[92,66],kn:[64,80],fn:[58,106],kf:[124,86],ff:[154,106],en:[86,48],hn:[96,56],ef:[106,48],hf:[98,56]}),'Person in a side lunge with one knee bent and the other leg straight'),
  st:['Stand with your feet wide apart, toes forward.','Shift your weight to one side, bending that knee and sitting your hips back while the other leg stays straight.','Push back to the centre and repeat.'],
  cue:'Keep both feet flat and your chest up.'},
 fig4:{n:'Figure-4 stretch',pic:S(F({h:[28,98],s:[44,100],p:[96,100],kf:[118,66],ff:[146,72],kn:[132,86],fn:[118,68],en:[72,84],hn:[114,70]}),'Person lying on their back with one ankle crossed over the other knee, pulling the leg in'),
  st:['Lie on your back and cross one ankle over the opposite knee.','Hold the back of the uncrossed thigh and pull it gently towards your chest.','Hold 30 seconds, breathing slowly, then switch sides.'],
  cue:'You should feel the stretch deep in the buttock of the crossed leg.'},
 hipflex:{n:'Hip flexor stretch',pic:S(F({h:[105,22],s:[104,38],p:[100,70],kn:[66,72],fn:[64,106],kf:[122,104],ff:[152,106],en:[88,54],hn:[70,66]}),'Person half-kneeling with hips pushed gently forward'),
  st:['Half-kneel with a cushion under your back knee.','Tuck your tailbone under and squeeze the glute of your back leg.','Shift your hips forward slightly until you feel a stretch at the front of the hip. Hold 30 seconds per side.'],
  cue:'Keep your torso upright and don’t arch your lower back to get more stretch.'},
 ball:{n:'Ball release',pic:S('<circle class="ball" cx="100" cy="99" r="8"/>'+F({h:[62,46],s:[72,60],p:[100,86],kf:[136,74],ff:[156,106],kn:[132,62],fn:[148,70],en:[60,84],hn:[54,106]}),'Person sitting on a small ball under one buttock, leaning back on one hand'),
  st:['Sit on a massage or lacrosse ball under one buttock. For the front of the hip, lie face down with the ball just in front of your hip bone.','Roll slowly and pause on tender spots for 20 to 30 seconds.','Spend 60 to 90 seconds on each area.'],
  cue:'Use moderate pressure. Don’t roll the outside of the thigh or knee, as that tends to irritate the band.'},
 run:{n:'Easy run',pic:S(F({h:[104,16],s:[100,30],p:[96,60],kn:[116,74],fn:[110,96],kf:[82,78],ff:[64,72],en:[112,44],hn:[124,36],ef:[88,46],hf:[80,58]}),'Person running with short, quick strides'),
  st:['Run at a conversational pace on a flat, even route.','Shorten your stride by raising your step rate 5 to 10%. A metronome app makes this easy.','Stop just before the point where pain usually starts, then log your distance and pain below.'],
  cue:'Avoid downhills, running the same direction on a track, and one side of a cambered road.'},
 bike:{n:'Bike warm-up',pic:null,st:['Ride 5 minutes at an easy pace to warm up your legs.'],cue:null}
};
const PLAN=[
 {d:'Mon',t:'Strength A',s:'Gym, about 45 minutes',tasks:[
   ['Warm-up','5 min bike, band walks 2 × 10 each way',['bike','band']],
   ['Single-leg Romanian deadlift','3 × 8 per side',['rdl']],
   ['Bulgarian split squat','3 × 8 per side',['bss']],
   ['Hip thrust','3 × 10, last 2 reps hard',['thrust']],
   ['Side plank','3 × 30–40 s per side',['plank']]]},
 {d:'Tue',t:'Easy run',s:'Flat route, short stride',run:'base',tasks:[
   ['Warm-up','Band walks 2 × 10, glute bridges 1 × 15',['band','bridge']],
   ['Run','Stop before your usual pain point, step rate up 5–10%',['run']]]},
 {d:'Wed',t:'Mobility',s:'Recovery day',tasks:[
   ['Ball release','Glutes and front of hip, 60–90 s each',['ball']],
   ['Figure-4 glute stretch','2 × 30 s per side',['fig4']],
   ['Hip flexor stretch','2 × 30 s per side',['hipflex']],
   ['Optional','20–30 min easy bike or swim',[]]]},
 {d:'Thu',t:'Strength B',s:'Gym, about 40 minutes',tasks:[
   ['Warm-up','5 min bike, clamshells 1 × 15 per side',['bike','clam']],
   ['Step-downs','3 × 10 per side, knee over toes',['step']],
   ['Cable hip abduction','3 × 12 per side',['cable']],
   ['Lateral lunge','3 × 8 per side',['lunge']],
   ['Single-leg bridge','3 × 10 per side',['slbridge']]]},
 {d:'Fri',t:'Easy run',s:'Same distance as Tuesday',run:'base',tasks:[
   ['Warm-up','Band walks 2 × 10, glute bridges 1 × 15',['band','bridge']],
   ['Run','Flat, even surface, avoid downhills',['run']]]},
 {d:'Sat',t:'Rest',s:'Or easy bike or swim',tasks:[
   ['Rest or cross-train','Nothing that brings on knee pain',[]]]},
 {d:'Sun',t:'Longer easy run',s:'About 10% longer than Tuesday',run:'long',tasks:[
   ['Warm-up','Band walks 2 × 10, glute bridges 1 × 15',['band','bridge']],
   ['Run','Run/walk is fine if pain starts creeping up',['run']]]}
];
function howHTML(keys){
  return keys.map(k=>{const e=EX[k];let h='<div class="ex"><h3>'+e.n+'</h3>';
    if(e.pic) h+=e.pic;
    h+='<ol>'+e.st.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
    if(e.cue) h+='<div class="cue">'+e.cue+'</div>';
    return h+'</div>';}).join('');
}
const howOpen=new Set();
