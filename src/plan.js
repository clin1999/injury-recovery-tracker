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
function DB(x,y){return '<rect class="prop" x="'+(x-8)+'" y="'+(y-3)+'" width="16" height="7" rx="2"/>';} // a dumbbell centred on (x, y)
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
 bike:{n:'Bike warm-up',pic:null,st:['Ride 5 minutes at an easy pace to warm up your legs.'],cue:null},

 // Upper body, core, cardio and badminton (added with plan version 2).
 dbpress:{n:'Dumbbell bench press',pic:S('<rect class="prop" x="30" y="80" width="96" height="8" rx="2"/><rect class="prop" x="38" y="88" width="8" height="20"/><rect class="prop" x="108" y="88" width="8" height="20"/>'+F({h:[40,70],s:[56,76],p:[108,76],kn:[132,82],fn:[134,106],en:[56,56],hn:[56,40]})+DB(56,38),'Person lying on a flat bench pressing two dumbbells straight up'),
  st:['Lie on a flat bench with a dumbbell in each hand and your feet flat on the floor.','Start with the dumbbells beside your chest, elbows about 45° out from your body.','Press up until your arms are straight, then lower slowly over 2 to 3 seconds.'],
  cue:'Keep your shoulder blades squeezed together and your feet planted.'},
 ohp:{n:'Seated shoulder press',pic:S('<rect class="prop" x="58" y="30" width="8" height="50" rx="2"/><rect class="prop" x="58" y="80" width="44" height="8" rx="2"/><rect class="prop" x="74" y="88" width="8" height="20"/>'+F({h:[74,28],s:[74,42],p:[76,76],kn:[100,80],fn:[104,106],en:[84,26],hn:[82,8]})+DB(82,8),'Person sitting on an upright bench pressing dumbbells overhead'),
  st:['Sit on an upright bench with your back supported and dumbbells at shoulder height, palms forward.','Press the dumbbells overhead until your arms are almost straight.','Lower slowly back to shoulder height.'],
  cue:'Brace your stomach so your lower back doesn’t arch as you press.'},
 pushup:{n:'Push-up',pic:S(F({h:[164,54],s:[148,64],p:[90,84],kn:[57,95],fn:[24,104],en:[148,85],hn:[148,106]}),'Person in a push-up position with arms straight and body in a straight line'),
  st:['Start in a high plank with your hands slightly wider than your shoulders.','Lower your chest towards the floor, keeping your body in one straight line.','Push back up. If your form slips, do them with your hands on a bench or your knees down.'],
  cue:'Squeeze your glutes so your hips don’t sag.'},
 pushdown:{n:'Triceps pushdown',pic:S('<rect class="prop" x="150" y="8" width="12" height="100" rx="2"/><line class="cable" x1="150" y1="14" x2="110" y2="70"/>'+F({h:[104,18],s:[102,32],p:[98,66],kn:[100,86],fn:[98,106],kf:[94,86],ff:[90,106],en:[104,52],hn:[110,70]}),'Person at a cable machine pushing a rope down with elbows tucked at their sides'),
  st:['Attach a rope to a high cable pulley and stand facing it.','Tuck your elbows in at your sides and grip the rope.','Push down until your arms are straight, spreading the rope ends at the bottom, then let it rise slowly.'],
  cue:'Only your forearms move. Keep your elbows pinned to your sides.'},
 pulldown:{n:'Lat pulldown',pic:S('<rect class="prop" x="150" y="8" width="12" height="100" rx="2"/><rect class="prop" x="80" y="80" width="36" height="8" rx="2"/><rect class="prop" x="94" y="88" width="8" height="20"/><rect class="prop" x="116" y="62" width="16" height="8" rx="3"/><line class="cable" x1="150" y1="12" x2="112" y2="46"/>'+F({h:[90,30],s:[92,44],p:[96,78],kn:[120,76],fn:[124,104],en:[100,62],hn:[112,46]}),'Person seated at a lat pulldown machine pulling the bar down to their upper chest'),
  st:['Sit with your thighs under the pad and grip the bar a little wider than your shoulders.','Lean back slightly and pull the bar down to your upper chest, driving your elbows down.','Let the bar rise slowly until your arms are straight.'],
  cue:'Pull with your back, not by swinging your body.'},
 row:{n:'Seated cable row',pic:S('<rect class="prop" x="150" y="60" width="12" height="48" rx="2"/><rect class="prop" x="56" y="86" width="52" height="8" rx="2"/><rect class="prop" x="76" y="94" width="8" height="14"/><rect class="prop" x="130" y="78" width="6" height="26" rx="2"/><line class="cable" x1="150" y1="80" x2="94" y2="70"/>'+F({h:[76,32],s:[78,46],p:[82,82],kn:[106,74],fn:[128,86],en:[72,64],hn:[94,70]}),'Person seated at a low cable, pulling a handle to their stomach'),
  st:['Sit with your feet on the footplate, knees slightly bent, holding the handle with straight arms.','Sit tall and pull the handle to your stomach, squeezing your shoulder blades together.','Let your arms straighten slowly without rounding your back.'],
  cue:'Keep your torso still. Don’t rock back to move the weight.'},
 facepull:{n:'Face pull',pic:S('<rect class="prop" x="160" y="8" width="12" height="100" rx="2"/><line class="cable" x1="160" y1="20" x2="104" y2="16"/>'+F({h:[94,18],s:[95,32],p:[98,66],kn:[110,86],fn:[114,106],kf:[88,86],ff:[82,106],en:[86,26],hn:[104,16]}),'Person pulling a rope from a cable at face height towards their face, elbows high'),
  st:['Set a rope on a cable at about face height and grip it with your thumbs pointing back at you.','Step back and pull the rope towards your face, splitting the ends and driving your elbows high and wide.','Pause, then return slowly.'],
  cue:'Finish with your hands beside your ears, like a double-biceps pose.'},
 curl:{n:'Dumbbell curl',pic:S(F({h:[100,18],s:[100,32],p:[100,66],kn:[102,86],fn:[100,106],kf:[96,86],ff:[94,106],en:[102,52],hn:[116,40],ef:[98,52],hf:[98,70]})+DB(116,38)+DB(98,72),'Person standing and curling a dumbbell up to the shoulder with the elbow at their side'),
  st:['Stand tall with a dumbbell in each hand, palms facing forward.','Keeping your elbows at your sides, curl the dumbbells up towards your shoulders.','Lower slowly until your arms are straight.'],
  cue:'No swinging. If you have to lean back, the weight is too heavy.'},
 pallof:{n:'Pallof press',pic:S('<rect class="prop" x="20" y="8" width="12" height="100" rx="2"/><line class="cable" x1="32" y1="46" x2="136" y2="46"/>'+F({h:[100,18],s:[100,32],p:[100,66],kn:[108,86],fn:[110,106],kf:[92,86],ff:[90,106],en:[118,40],hn:[136,46]}),'Person standing side-on to a cable machine, pressing the handle straight out from the chest'),
  st:['Stand side-on to a cable set at chest height, holding the handle at your chest with both hands.','Step away until the cable pulls you sideways, feet hip-width apart.','Press the handle straight out, hold 2 seconds without twisting, then bring it back. Do all reps, then face the other way.'],
  cue:'Keep your hips and shoulders square the whole time. Resisting the twist is the point.'},
 deadbug:{n:'Dead bug',pic:S(F({h:[40,98],s:[56,100],p:[106,100],kn:[132,96],fn:[158,92],kf:[106,76],ff:[130,76],en:[40,88],hn:[24,80],ef:[58,80],hf:[60,62]}),'Person lying on their back with one arm reaching overhead and the opposite leg stretched out low'),
  st:['Lie on your back with your arms pointing at the ceiling and your knees bent at 90° above your hips.','Press your lower back into the floor, then slowly lower one arm overhead and the opposite leg towards the floor.','Return to the start and switch sides.'],
  cue:'Only go as low as you can without your lower back lifting off the floor.'},
 incline:{n:'Incline dumbbell press',pic:S('<polygon class="prop" points="24,44 32,38 70,80 60,86"/><rect class="prop" x="56" y="80" width="44" height="8" rx="2"/><rect class="prop" x="72" y="88" width="8" height="20"/>'+F({h:[36,40],s:[44,52],p:[72,78],kn:[96,82],fn:[100,106],en:[46,32],hn:[48,16]})+DB(48,14),'Person on an incline bench pressing dumbbells up over their chest'),
  st:['Set a bench to about 30° and sit back with a dumbbell in each hand at shoulder height.','Press the dumbbells up over your upper chest until your arms are straight.','Lower slowly back to shoulder height.'],
  cue:'Keep your lower back against the bench rather than arching.'},
 dbrow:{n:'One-arm dumbbell row',pic:S('<rect class="prop" x="40" y="72" width="84" height="8" rx="2"/><rect class="prop" x="48" y="80" width="8" height="28"/><rect class="prop" x="108" y="80" width="8" height="28"/>'+F({h:[128,44],s:[114,50],p:[80,50],kf:[82,70],ff:[58,70],kn:[76,77],fn:[72,104],ef:[113,61],hf:[112,72],en:[102,38],hn:[102,58]})+DB(102,60),'Person with one knee and hand on a bench, rowing a dumbbell up towards their hip'),
  st:['Put one knee and the same-side hand on a bench, back flat, other foot on the floor.','Hold a dumbbell in your free hand with your arm hanging straight down.','Row it up towards your hip, then lower slowly. Do all reps, then switch sides.'],
  cue:'Pull your elbow back towards your hip rather than straight up to your shoulder.'},
 carry:{n:'Farmer’s carry',pic:S(F({h:[100,18],s:[100,32],p:[100,66],kn:[110,86],fn:[114,106],kf:[90,86],ff:[84,106],en:[102,50],hn:[102,68],ef:[98,50],hf:[98,68]})+DB(100,70),'Person walking tall with a heavy dumbbell in each hand'),
  st:['Pick up a heavy dumbbell or kettlebell in each hand.','Stand tall with your shoulders back and walk with short, steady steps.','Walk the set distance, put them down with control, rest and repeat.'],
  cue:'Don’t lean to either side. Keeping your hips level also trains the muscles that steady your knee.'},
 fplank:{n:'Front plank',pic:S(F({h:[162,70],s:[146,80],p:[90,88],kn:[57,96],fn:[24,104],en:[146,104],hn:[166,104]}),'Person holding a plank on their forearms with body straight'),
  st:['Rest on your forearms with your elbows under your shoulders.','Lift your hips so your body forms a straight line from head to heels.','Hold for the set time, breathing steadily.'],
  cue:'Squeeze your glutes and don’t let your hips sag or pike up.'},
 rower:{n:'Rowing machine',pic:S('<rect class="prop" x="20" y="100" width="140" height="6" rx="2"/><circle class="prop" cx="172" cy="90" r="14"/><rect class="prop" x="56" y="92" width="22" height="7" rx="2"/><rect class="prop" x="118" y="82" width="6" height="18" rx="2"/><line class="cable" x1="160" y1="86" x2="64" y2="64"/>'+F({h:[50,44],s:[56,58],p:[66,90],kn:[92,86],fn:[116,92],en:[44,70],hn:[64,64]}),'Person on a rowing machine at the finish, legs straight and handle pulled to the chest'),
  st:['Strap your feet in and hold the handle with straight arms.','Push with your legs first, then lean back slightly and pull the handle to your lower ribs.','Return in reverse order: arms, then body, then knees. Keep it easy and steady.'],
  cue:'Legs, body, arms on the way out. Arms, body, legs on the way back.'},
 badminton:{n:'Badminton',pic:S(F({h:[124,26],s:[118,40],p:[108,72],kn:[132,84],fn:[146,106],kf:[88,92],ff:[66,106],en:[134,30],hn:[150,20],ef:[104,54],hf:[92,62]})+'<line class="rod" x1="150" y1="20" x2="162" y2="12"/><ellipse class="prop" cx="168" cy="9" rx="5" ry="7" transform="rotate(50 168 9)"/><circle class="ball" cx="188" cy="16" r="3"/>','Person lunging forward to play a badminton shot'),
  st:['Do the hip warm-up first. Band walks and clamshells wake up the muscles that steady your knee.','Ease in for the first 10 minutes before full-speed lunges and jumps.','Afterwards, do the stretches below while you’re still warm.'],
  cue:'Badminton is full of side lunges and quick changes of direction. If your outside knee aches past 3/10, switch to doubles or stop for the day.'}
};
// Plan version 2: gym most days, badminton on Wednesday, a short Tuesday run and a 5k on Saturday.
// If you change the days or reorder tasks, bump PLAN_VERSION and add a step to migrate() in app.js.
const PLAN_VERSION=2;
const PLAN=[
 {d:'Mon',t:'Legs A',s:'Gym, about 45 minutes',tasks:[
   ['Warm-up','5 min bike, band walks 2 × 10 each way',['bike','band']],
   ['Single-leg Romanian deadlift','3 × 8 per side',['rdl']],
   ['Bulgarian split squat','3 × 8 per side',['bss']],
   ['Hip thrust','3 × 10, last 2 reps hard',['thrust']],
   ['Side plank','3 × 30–40 s per side',['plank']]]},
 {d:'Tue',t:'Push and short run',s:'Gym, run first while you’re fresh',run:'short',tasks:[
   ['Warm-up','Band walks 2 × 10, glute bridges 1 × 15',['band','bridge']],
   ['Run','Easy pace on the treadmill, stop before your usual pain point',['run']],
   ['Dumbbell bench press','3 × 8–10',['dbpress']],
   ['Seated shoulder press','3 × 8–10',['ohp']],
   ['Push-ups','2 × as many as you can with good form',['pushup']],
   ['Triceps pushdown','2 × 12',['pushdown']]]},
 {d:'Wed',t:'Badminton',s:'Hip warm-up before, stretches after',tasks:[
   ['Hip warm-up','Band walks 2 × 10, clamshells 1 × 15 per side',['band','clam']],
   ['Badminton','Ease in for the first 10 minutes',['badminton']],
   ['Stretches','Figure-4 and hip flexor, 2 × 30 s per side',['fig4','hipflex']],
   ['Ball release','Glutes and front of hip, 60–90 s each',['ball']]]},
 {d:'Thu',t:'Legs B',s:'Gym, about 45 minutes',tasks:[
   ['Warm-up','5 min bike, clamshells 1 × 15 per side',['bike','clam']],
   ['Step-downs','3 × 10 per side, knee over toes',['step']],
   ['Cable hip abduction','3 × 12 per side',['cable']],
   ['Lateral lunge','3 × 8 per side',['lunge']],
   ['Single-leg bridge','3 × 10 per side',['slbridge']],
   ['Dead bug','3 × 8 per side',['deadbug']]]},
 {d:'Fri',t:'Pull and core',s:'Gym, easy on the legs before Saturday',tasks:[
   ['Warm-up','5 min rower, easy',['rower']],
   ['Lat pulldown','3 × 10',['pulldown']],
   ['Seated cable row','3 × 10',['row']],
   ['Face pull','3 × 15',['facepull']],
   ['Dumbbell curl','2 × 12',['curl']],
   ['Pallof press','3 × 10 per side',['pallof']]]},
 {d:'Sat',t:'5k run',s:'Flat and steady',run:'5k',tasks:[
   ['Warm-up','Band walks 2 × 10, glute bridges 1 × 15',['band','bridge']],
   ['Run','Switch to run/walk if pain starts creeping up',['run']],
   ['Stretches','Figure-4 and hip flexor, 2 × 30 s per side',['fig4','hipflex']]]},
 {d:'Sun',t:'Full body, lighter',s:'Gym, about 40 minutes',tasks:[
   ['Cardio','15 min rower or bike, easy',['rower']],
   ['Incline dumbbell press','3 × 10',['incline']],
   ['One-arm dumbbell row','3 × 10 per side',['dbrow']],
   ['Farmer’s carry','3 × 30 m',['carry']],
   ['Front plank','3 × 30–45 s',['fplank']]]}
];
function howHTML(keys){
  return keys.map(k=>{const e=EX[k];let h='<div class="ex"><h3>'+e.n+'</h3>';
    if(e.pic) h+=e.pic;
    h+='<ol>'+e.st.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
    if(e.cue) h+='<div class="cue">'+e.cue+'</div>';
    return h+'</div>';}).join('');
}
const howOpen=new Set();
