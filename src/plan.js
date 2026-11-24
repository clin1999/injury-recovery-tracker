// Exercise library (EX), the figure and muscle-map drawing helpers, and the weekly plan (PLAN).
// Loaded before app.js as a classic script so the page works from file://.

const KEY='itb-tracker-v1';

// ---- Figure drawing ----
// A pose is joint coordinates in a 0 0 200 112 viewBox (ground at y = 108): h head centre, s shoulder, p hip,
// kn/fn near knee/foot, en/hn near elbow/hand, and optional far-side kf/ff (leg) and ef/hf (arm).
// f is 1 when the person faces right (the default) and -1 when they face left.
// F() draws a person in a T-shirt, shorts and trainers: far-side limbs behind and shaded darker, an outline
// around each layer, and the near arm on top. Colours are CSS variables, so figures follow the theme.
const r1=n=>Math.round(n*10)/10;
const pt=a=>r1(a[0])+' '+r1(a[1]);
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const unit=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return [dx/L,dy/L];};
// A tapered capsule from a (radius ra) to b (radius rb).
function cap(a,b,ra,rb,cls){
  const [ux,uy]=unit(a,b), nx=-uy, ny=ux;
  return '<path class="'+cls+'" d="M'+pt([a[0]+nx*ra,a[1]+ny*ra])+'L'+pt([b[0]+nx*rb,b[1]+ny*rb])
    +'A'+r1(rb)+' '+r1(rb)+' 0 0 0 '+pt([b[0]-nx*rb,b[1]-ny*rb])+'L'+pt([a[0]-nx*ra,a[1]-ny*ra])
    +'A'+r1(ra)+' '+r1(ra)+' 0 0 0 '+pt([a[0]+nx*ra,a[1]+ny*ra])+'Z"/>';
}
function dot(c,r,cls){return '<circle class="'+cls+'" cx="'+r1(c[0])+'" cy="'+r1(c[1])+'" r="'+r1(r)+'"/>';}
// Draw a list of parts twice: once slightly bigger in the outline colour, then filled.
function layer(parts){
  const OL=1.3;
  const draw=(q,grow,cls)=>q[0]==='c'?cap(q[1],q[2],q[3]+grow,q[4]+grow,cls||q[5]):dot(q[1],q[2]+grow,cls||q[3]);
  return parts.map(q=>draw(q,OL,'ol')).join('')+parts.map(q=>draw(q,0)).join('');
}
function legParts(p,k,ft,f){
  const [dx,dy]=unit(k,ft), toe=f>0?[dy,-dx]:[-dy,dx];
  return [['c',p,k,6.8,5,'sk'],['c',k,ft,4.8,3.4,'sk'],
    ['c',[ft[0]-toe[0],ft[1]-toe[1]],[ft[0]+toe[0]*7,ft[1]+toe[1]*7],3.3,2.9,'shoe'],
    ['c',p,mix(p,k,0.55),7.6,6.3,'so']];
}
function armParts(s,e,h){
  return [['c',s,e,4.4,3.6,'sk'],['c',e,h,3.6,2.8,'sk'],['d',h,3.2,'sk'],['c',s,mix(s,e,0.45),5.2,4.6,'sh']];
}
function F(o){
  const f=o.f||1, [ux,uy]=unit(o.s,o.h), front=f>0?[-uy,ux]:[uy,-ux];
  const top=mix(o.s,o.p,0.18);
  let g='<g class="fig">';
  if(o.kf) g+='<g class="far">'+layer(legParts(o.p,o.kf,o.ff,f))+'</g>';
  if(o.ef) g+='<g class="far">'+layer(armParts(o.s,o.ef,o.hf))+'</g>';
  const face=[o.h[0]+front[0]*1.6-ux*0.9,o.h[1]+front[1]*1.6-uy*0.9];
  g+=layer([
    ['c',o.s,mix(o.s,o.h,0.7),3.4,3.4,'sk'],                 // neck
    ['c',top,o.p,9.2,8.6,'sh'],                               // T-shirt
    ['c',o.p,mix(o.p,o.s,0.2),8.8,8.8,'so'],                  // waistband of the shorts
    ...legParts(o.p,o.kn,o.fn,f),
    ['d',o.h,8,'hr'],['d',face,7,'sk']                        // hair, then face over it
  ]);
  g+=dot([o.h[0]+front[0]*5.2+ux*0.6,o.h[1]+front[1]*5.2+uy*0.6],0.9,'eye');
  g+=layer(armParts(o.s,o.en,o.hn))+'</g>';
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
 rdl:{n:'Single-leg Romanian deadlift',pic:S('<rect class="prop" x="50" y="92" width="16" height="6" rx="2"/>'+F({f:-1,h:[42,56],s:[56,60],p:[100,62],kn:[102,84],fn:[100,106],kf:[134,62],ff:[168,64],en:[56,78],hn:[58,92]}),'Person balancing on one leg, torso tipped forward and other leg straight behind, holding a dumbbell'),
  st:['Stand on one leg with a slight bend in the knee, holding a dumbbell in the opposite hand.','Hinge at the hip, pushing your free leg straight back as your chest lowers.','Lower the weight towards mid-shin with your back flat, then squeeze the standing-side glute to stand up.'],
  cue:'Keep both hips square to the floor. Don’t let the back leg twist outward.'},
 bss:{n:'Bulgarian split squat',pic:S('<rect class="prop" x="150" y="78" width="44" height="30" rx="3"/>'+'<rect class="prop" x="104" y="66" width="14" height="6" rx="2"/>'+F({f:-1,h:[104,18],s:[104,34],p:[108,70],kn:[72,70],fn:[70,106],kf:[132,100],ff:[162,78],en:[108,52],hn:[110,66]}),'Person in a split squat with the back foot on a bench'),
  st:['Rest the top of your back foot on a bench about one stride behind you.','Drop straight down until your front thigh is close to parallel with the floor.','Push through your front heel to stand back up.'],
  cue:'Your front knee should track over your middle toes and not cave inward.'},
 plank:{n:'Side plank',pic:S(F({h:[36,52],s:[52,64],p:[110,84],kn:[143,95],fn:[176,104],en:[54,104],hn:[82,104],ef:[80,66],hf:[106,80]}),'Person in a side plank on one forearm with body straight'),
  st:['Lie on your side with your elbow directly under your shoulder.','Lift your hips so your body forms a straight line from head to feet.','Hold for the set time, then switch sides.'],
  cue:'Easier version: keep your knees bent and on the floor. Stop the set when your hips start to sag.'},
 clam:{n:'Clamshell',pic:S(F({h:[24,90],s:[48,96],p:[104,96],kf:[138,102],ff:[162,104],kn:[134,74],fn:[162,100],ef:[34,104],hf:[24,100],en:[72,88],hn:[96,90]})+'<line class="band" x1="138" y1="100" x2="134" y2="76"/>','Person lying on their side with knees bent, opening the top knee against a band'),
  st:['Lie on your side with hips and knees bent and a band just above your knees.','Keep your feet together and lift your top knee as far as you can without moving your pelvis.','Pause, then lower slowly.'],
  cue:'If your pelvis rolls backwards, you’re lifting too far.'},
 step:{n:'Step-down',pic:S('<rect class="prop" x="100" y="84" width="60" height="24" rx="3"/>'+F({f:-1,h:[118,12],s:[120,26],p:[126,54],kn:[112,68],fn:[124,84],kf:[100,74],ff:[94,102],en:[104,36],hn:[88,38]}),'Person standing on one leg on a box, lowering the other heel towards the floor'),
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
 hipflex:{n:'Hip flexor stretch',pic:S(F({f:-1,h:[105,22],s:[104,38],p:[100,70],kn:[66,72],fn:[64,106],kf:[122,104],ff:[152,106],en:[88,54],hn:[70,66]}),'Person half-kneeling with hips pushed gently forward'),
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
// ---- More exercises, used as replacements (Replace on any task) ----
Object.assign(EX,{
 gobletsq:{n:'Goblet squat',pic:S(F({h:[100,30],s:[98,44],p:[84,74],kn:[110,78],fn:[106,106],kf:[106,80],ff:[102,106],en:[106,58],hn:[110,46]})+DB(111,46),'Person squatting with a dumbbell held at their chest'),
  st:['Hold one dumbbell upright against your chest, feet a little wider than your hips.','Sit down between your heels until your thighs are about parallel, chest up.','Drive back up through your whole foot.'],
  cue:'Push your knees out over your toes on the way down.'},
 legpress:{n:'Leg press',pic:S('<polygon class="prop" points="28,50 38,46 72,92 62,98"/><rect class="prop" x="60" y="92" width="40" height="8" rx="2"/><polygon class="prop" points="124,46 132,42 142,88 134,92"/><line class="rod" x1="80" y1="100" x2="80" y2="108"/>'+F({h:[40,60],s:[52,68],p:[80,88],kn:[100,66],fn:[126,72],en:[70,82],hn:[84,92]}),'Person reclined in a leg press machine pushing the platform with their feet'),
  st:['Sit back in the machine with your feet hip-width apart in the middle of the platform.','Release the safety and lower the platform until your knees are bent to about 90°.','Press it away without locking your knees at the top.'],
  cue:'Keep your lower back flat against the pad. If it lifts, you’re going too deep.'},
 revlunge:{n:'Reverse lunge',pic:S(F({h:[100,26],s:[100,40],p:[102,74],kn:[124,80],fn:[126,106],kf:[88,96],ff:[64,104],en:[102,58],hn:[102,76]})+DB(102,78),'Person stepping back into a lunge holding dumbbells'),
  st:['Stand tall holding a dumbbell in each hand, or none to start.','Step one foot back and lower until your back knee nearly touches the floor.','Push through your front heel to return. Alternate legs.'],
  cue:'Keep your front knee over your middle toes and your torso upright.'},
 stepup:{n:'Step-up',pic:S('<rect class="prop" x="108" y="86" width="56" height="22" rx="3"/>'+F({h:[108,10],s:[106,24],p:[104,58],kn:[126,64],fn:[128,86],kf:[96,82],ff:[92,106],en:[110,42],hn:[112,58]}),'Person stepping up onto a box'),
  st:['Stand facing a box or bench about knee height or lower.','Put one whole foot on the box and drive through that heel to stand up on it.','Lower slowly with control. Do all reps on one leg, then switch.'],
  cue:'Let the top leg do the work. Don’t push off the bottom foot.'},
 legcurl:{n:'Seated leg curl',pic:S('<rect class="prop" x="58" y="34" width="8" height="46" rx="2"/><rect class="prop" x="56" y="80" width="50" height="8" rx="2"/><rect class="prop" x="74" y="88" width="8" height="20"/><circle class="prop" cx="100" cy="97" r="5"/>'+F({h:[72,24],s:[74,40],p:[78,74],kn:[104,78],fn:[94,100],en:[86,56],hn:[98,68]}),'Person on a seated leg curl machine bending their knees against a pad'),
  st:['Sit with the pad just above your heels and the thigh pad snug above your knees.','Curl your heels down and back as far as you can.','Let the pad return slowly.'],
  cue:'Keep your hips down on the seat the whole time.'},
 legext:{n:'Leg extension',pic:S('<rect class="prop" x="58" y="34" width="8" height="46" rx="2"/><rect class="prop" x="56" y="80" width="50" height="8" rx="2"/><rect class="prop" x="74" y="88" width="8" height="20"/><circle class="prop" cx="126" cy="80" r="5"/>'+F({h:[72,24],s:[74,40],p:[78,74],kn:[104,78],fn:[128,72],en:[86,56],hn:[98,68]}),'Person on a leg extension machine straightening their knees'),
  st:['Sit with the pad on the front of your lower shins and your knees in line with the machine’s pivot.','Straighten your legs, squeezing your quads at the top.','Lower slowly.'],
  cue:'Use a light weight and a smooth tempo. No kicking.'},
 pullthrough:{n:'Cable pull-through',pic:S('<rect class="prop" x="20" y="64" width="12" height="44" rx="2"/><line class="cable" x1="32" y1="100" x2="98" y2="96"/>'+F({h:[134,68],s:[118,64],p:[88,52],kn:[96,80],fn:[94,106],kf:[92,80],ff:[90,106],en:[112,84],hn:[98,96]}),'Person facing away from a low cable, hinging at the hips with the rope between their legs'),
  st:['Face away from a low cable with a rope between your legs, feet wider than your hips.','Hinge at the hips, letting the rope pull your hands back between your legs.','Drive your hips forward to stand tall, squeezing your glutes.'],
  cue:'It’s a hinge, not a squat. Push your hips back rather than bending your knees.'},
 chestpress:{n:'Machine chest press',pic:S('<rect class="prop" x="58" y="30" width="8" height="50" rx="2"/><rect class="prop" x="58" y="80" width="44" height="8" rx="2"/><rect class="prop" x="74" y="88" width="8" height="20"/><rect class="prop" x="146" y="18" width="10" height="90" rx="2"/><line class="rod" x1="146" y1="32" x2="114" y2="44"/>'+F({h:[74,28],s:[74,42],p:[76,76],kn:[100,80],fn:[104,106],en:[94,46],hn:[112,44]}),'Person seated at a chest press machine pushing the handles forward'),
  st:['Set the seat so the handles line up with the middle of your chest.','Press the handles forward until your arms are almost straight.','Let them come back slowly until you feel a light stretch across your chest.'],
  cue:'Keep your shoulder blades back against the pad.'},
 latraise:{n:'Lateral raise',pic:S(F({h:[100,18],s:[100,32],p:[100,66],kn:[104,86],fn:[106,106],kf:[96,86],ff:[94,106],en:[118,34],hn:[134,36],ef:[82,34],hf:[66,36]})+DB(136,36)+DB(64,36),'Person facing forward raising dumbbells out to the sides to shoulder height'),
  st:['Stand with a light dumbbell in each hand at your sides.','Raise your arms out to the sides with a slight bend in the elbows, up to shoulder height.','Lower slowly.'],
  cue:'Lead with your elbows and keep your shoulders down away from your ears.'},
 hammercurl:{n:'Hammer curl',pic:S(F({h:[100,18],s:[100,32],p:[100,66],kn:[102,86],fn:[100,106],kf:[96,86],ff:[94,106],en:[102,52],hn:[116,40],ef:[98,52],hf:[98,70]})+'<rect class="prop" x="113" y="30" width="7" height="16" rx="2"/><rect class="prop" x="95" y="64" width="7" height="16" rx="2"/>','Person curling dumbbells with palms facing in'),
  st:['Stand with a dumbbell in each hand, palms facing your sides.','Keeping your elbows at your sides, curl the dumbbells up with your palms still facing in.','Lower slowly.'],
  cue:'No swinging. Your upper arms stay still.'},
 ohtricep:{n:'Overhead triceps extension',pic:S(F({h:[98,24],s:[100,38],p:[100,72],kn:[102,89],fn:[100,106],kf:[96,89],ff:[94,106],en:[116,22],hn:[96,10]})+DB(93,9),'Person holding a dumbbell behind their head with elbows pointing up'),
  st:['Hold one dumbbell with both hands above your head, arms straight.','Bend your elbows to lower it behind your head.','Straighten your arms to press it back up.'],
  cue:'Keep your elbows pointing forward, not flaring out to the sides.'},
 assistpull:{n:'Assisted pull-up',pic:S('<line class="rod" x1="76" y1="8" x2="136" y2="8"/><line class="rod" x1="78" y1="8" x2="78" y2="108"/><line class="rod" x1="134" y1="8" x2="134" y2="108"/>'+F({h:[116,30],s:[104,40],p:[102,74],kn:[98,92],fn:[84,100],en:[108,24],hn:[106,10],ef:[98,24],hf:[98,10]}),'Person hanging from a bar, pulling themselves up'),
  st:['Use the assisted pull-up machine, or loop a band over the bar and kneel or stand in it.','Grip the bar a little wider than your shoulders and pull your chest towards it.','Lower all the way down with control.'],
  cue:'Think about pulling your elbows down to your back pockets.'},
 kneeraise:{n:'Hanging knee raise',pic:S('<line class="rod" x1="76" y1="8" x2="136" y2="8"/><line class="rod" x1="78" y1="8" x2="78" y2="108"/><line class="rod" x1="134" y1="8" x2="134" y2="108"/>'+F({h:[106,26],s:[104,40],p:[102,74],kn:[124,70],fn:[122,94],kf:[122,72],ff:[120,96],en:[108,24],hn:[106,10]}),'Person hanging from a bar lifting their knees up to hip height'),
  st:['Hang from a bar, or use the elbow supports on a captain’s chair.','Lift your knees up towards your chest by curling your pelvis up.','Lower slowly without swinging.'],
  cue:'If you start swinging, pause at the bottom before the next rep.'},
 sidelegraise:{n:'Side-lying leg raise',pic:S(F({h:[24,92],s:[48,96],p:[104,96],kf:[130,100],ff:[158,104],kn:[130,86],fn:[156,76],ef:[34,104],hf:[24,100],en:[72,88],hn:[96,90]}),'Person lying on their side lifting the straight top leg'),
  st:['Lie on your side with your bottom knee bent for balance and your top leg straight.','Lift the top leg up towards the ceiling, leading with your heel and keeping your toes pointing forward.','Lower slowly.'],
  cue:'Keep the leg slightly behind your body line. This targets the side glute that steadies your knee.'},
 crosstrainer:{n:'Cross-trainer',pic:S('<rect class="prop" x="50" y="98" width="110" height="8" rx="2"/><line class="rod" x1="128" y1="98" x2="132" y2="30"/><circle class="prop" cx="148" cy="88" r="10"/>'+F({h:[100,18],s:[100,32],p:[98,64],kn:[110,82],fn:[104,98],kf:[90,84],ff:[84,98],en:[114,42],hn:[128,34],ef:[110,46],hf:[126,48]}),'Person on a cross-trainer holding the moving handles'),
  st:['Step onto the pedals and hold the moving handles.','Push and pull smoothly at an easy, conversational effort.','Keep a steady rhythm for the planned time.'],
  cue:'No impact, so it’s a good swap for a run when your knee needs a break.'},
 bikeride:{n:'Exercise bike',pic:S('<line class="rod" x1="88" y1="58" x2="96" y2="100"/><line class="rod" x1="70" y1="100" x2="146" y2="100"/><line class="rod" x1="132" y1="50" x2="140" y2="96"/><circle class="prop" cx="144" cy="90" r="10"/>'+F({h:[126,20],s:[114,30],p:[88,52],kn:[110,70],fn:[104,94],kf:[100,76],ff:[112,96],en:[124,42],hn:[134,48]}),'Person riding an exercise bike'),
  st:['Set the seat so your knee is slightly bent at the bottom of each pedal stroke.','Ride at an easy, conversational effort.','Keep a steady cadence for the planned time.'],
  cue:'Low impact and kind to the knee. A seat that’s too low can irritate the front or outside of the knee.'},
 pigeon:{n:'Pigeon stretch',pic:S(F({h:[96,48],s:[96,62],p:[98,94],kn:[122,98],fn:[104,104],kf:[72,102],ff:[46,106],en:[108,78],hn:[112,96]}),'Person in a pigeon stretch, front leg folded in front and back leg stretched behind'),
  st:['From all fours, bring one knee forward behind your wrist and let that foot rest towards the opposite hip.','Slide the other leg straight back.','Sit tall or lean forward over the front leg. Hold 30 seconds, then switch.'],
  cue:'Use a cushion under the hip of the front leg if it doesn’t reach the floor.'},
 foamroll:{n:'Foam roller',pic:S('<circle class="prop" cx="100" cy="96" r="12"/>'+F({h:[62,46],s:[72,60],p:[100,82],kf:[136,74],ff:[156,106],kn:[132,62],fn:[148,70],en:[60,84],hn:[54,106]}),'Person sitting on a foam roller under one buttock, leaning back on one hand'),
  st:['Sit on a foam roller with it under one buttock and cross that ankle over the other knee.','Roll slowly over the glute and pause on tender spots for 20 to 30 seconds.','Spend 60 to 90 seconds per side.'],
  cue:'Roll the glutes and front of the hip, not the outside of the thigh, which tends to irritate the band.'}
});
// Bike was text-only; give it the exercise bike picture.
EX.bike.pic=EX.bikeride.pic;

// ---- Muscles ----
// Main (p) and supporting (s) muscles per exercise, and the kind used to suggest replacements.
const MUSCLE_NAMES={glutes:'Glutes',gluteMed:'Hip abductors',hamstrings:'Hamstrings',quads:'Quads',adductors:'Inner thighs',calves:'Calves',
  hipFlexors:'Hip flexors',abs:'Abs',obliques:'Obliques',lowerBack:'Lower back',chest:'Chest',shoulders:'Shoulders',rearDelts:'Rear shoulders',
  triceps:'Triceps',biceps:'Biceps',forearms:'Forearms',lats:'Lats',upperBack:'Upper back',traps:'Traps'};
const MUS={
 band:['gluteMed','glutes quads'], bridge:['glutes','hamstrings'], slbridge:['glutes','hamstrings gluteMed abs'], thrust:['glutes','hamstrings quads'],
 rdl:['hamstrings glutes','gluteMed lowerBack'], bss:['quads glutes','hamstrings adductors gluteMed'], plank:['obliques gluteMed','abs shoulders'],
 clam:['gluteMed','glutes'], step:['quads','glutes gluteMed'], cable:['gluteMed','glutes'], lunge:['quads glutes','adductors gluteMed'],
 fig4:['glutes',''], hipflex:['hipFlexors','quads'], ball:['glutes hipFlexors',''], run:['quads hamstrings calves','glutes abs'],
 bike:['quads','hamstrings calves glutes'], dbpress:['chest','shoulders triceps'], ohp:['shoulders','triceps traps'], pushup:['chest','triceps shoulders abs'],
 pushdown:['triceps',''], pulldown:['lats','biceps upperBack'], row:['upperBack lats','biceps rearDelts'], facepull:['rearDelts upperBack','traps'],
 curl:['biceps','forearms'], pallof:['abs obliques','gluteMed'], deadbug:['abs','hipFlexors'], incline:['chest','shoulders triceps'],
 dbrow:['lats upperBack','biceps rearDelts'], carry:['forearms traps','abs obliques gluteMed'], fplank:['abs','shoulders glutes'],
 rower:['upperBack quads','lats hamstrings glutes biceps'], badminton:['quads calves shoulders','gluteMed obliques'],
 gobletsq:['quads glutes','adductors abs'], legpress:['quads glutes','hamstrings'], revlunge:['quads glutes','hamstrings gluteMed'],
 stepup:['quads glutes','gluteMed'], legcurl:['hamstrings','calves'], legext:['quads',''], pullthrough:['glutes hamstrings','lowerBack'],
 chestpress:['chest','shoulders triceps'], latraise:['shoulders','traps'], hammercurl:['biceps forearms',''], ohtricep:['triceps',''],
 assistpull:['lats','biceps upperBack'], kneeraise:['abs hipFlexors','forearms'], sidelegraise:['gluteMed','glutes'],
 crosstrainer:['quads glutes','hamstrings calves shoulders'], bikeride:['quads','hamstrings calves glutes'], pigeon:['glutes','hipFlexors'],
 foamroll:['glutes','']
};
const KIND={run:'cardio',bike:'cardio',rower:'cardio',badminton:'cardio',crosstrainer:'cardio',bikeride:'cardio',
  fig4:'mobility',hipflex:'mobility',ball:'mobility',pigeon:'mobility',foamroll:'mobility'};
Object.keys(MUS).forEach(k=>{const [p,s]=MUS[k]; EX[k].m={p:p.split(' ').filter(Boolean),s:s.split(' ').filter(Boolean)}; EX[k].kind=KIND[k]||'strength';});

// Front and back body map with the exercise's muscles highlighted. Each region is drawn on the figure's
// right side and mirrored, unless it sits on the centre line. Coordinates are for one 50 × 106 body.
function muscleMap(m){
  const lvl=id=>m.p.includes(id)?' p':m.s.includes(id)?' s':'';
  const mir=x=>50-x;
  const E=(cx,cy,rx,ry)=>[['e',cx,cy,rx,ry],['e',mir(cx),cy,rx,ry]];
  const C=(a,b,ra,rb)=>[['c',a,b,ra,rb],['c',[mir(a[0]),a[1]],[mir(b[0]),b[1]],ra,rb]];
  const P=pts=>[['g',pts],['g',pts.map(([x,y])=>[mir(x),y])]];
  const shape=(q,cls)=>q[0]==='e'?'<ellipse class="'+cls+'" cx="'+q[1]+'" cy="'+q[2]+'" rx="'+q[3]+'" ry="'+q[4]+'"/>'
    :q[0]==='c'?cap(q[1],q[2],q[3],q[4],cls)
    :q[0]==='r'?'<rect class="'+cls+'" x="'+q[1]+'" y="'+q[2]+'" width="'+q[3]+'" height="'+q[4]+'" rx="1.4"/>'
    :'<polygon class="'+cls+'" points="'+q[1].map(p=>p.join(',')).join(' ')+'"/>';
  const base=[['e',25,8,6,6.4],['c',[25,12],[25,18],3,3],['g',[[13,18],[37,18],[40.5,23],[37.5,46],[38.5,60],[11.5,60],[12.5,46],[9.5,23]]],
    ...C([10,21],[6.5,39],3.6,3),...C([6.5,39],[4.6,55],2.9,2.2),...E(4.2,58.5,2.4,2.6),
    ...C([18.6,58],[17.6,82],5.8,4),...C([17.6,82],[17.4,99],3.9,2.6),...E(16.8,102,3.4,1.9)];
  const front={shoulders:E(11.4,22.6,3.9,4.5),chest:E(19.6,26.2,5.4,4.3),biceps:C([8.7,26.5],[7.3,36.5],2.4,2),forearms:C([6,42],[4.9,53],2.1,1.6),
    abs:[20.6,25.4].flatMap(x=>[32,38,44].map(y=>['r',x,y,4,5])),obliques:P([[14.6,33],[19.6,32],[19.6,50],[16,47.5]]),
    hipFlexors:P([[19.2,53],[24.2,56],[21.6,60.5]]),gluteMed:E(13.7,57,2.2,3.2),quads:C([18.2,63],[17.9,79],4.2,3.1),adductors:C([22.6,62],[21.7,72],1.9,1.3)};
  const back={traps:[['g',[[25,13],[33.6,19.6],[25,23.4],[16.4,19.6]]]],rearDelts:E(11.4,22.6,3.9,4.5),
    upperBack:[['g',[[18.6,22.6],[25,24.6],[31.4,22.6],[30.6,31],[25,33.6],[19.4,31]]]],lats:P([[13.6,25],[19,31],[23.4,34],[22,45],[16,41]]),
    lowerBack:C([23,37],[23,49],1.9,1.9),triceps:C([8.7,26.5],[7.3,36.5],2.4,2),forearms:C([6,42],[4.9,53],2.1,1.6),
    gluteMed:E(14.6,53.4,3,2.8),glutes:E(20.2,58,5,4.6),hamstrings:C([18.4,65],[17.8,80],3.9,3),adductors:C([22.6,64],[22,73],1.6,1.2),
    calves:C([17.3,85],[17.3,96],3.1,2.2)};
  const body=(regions,dx)=>'<g transform="translate('+dx+' 0)">'+base.map(q=>shape(q,'mb')).join('')
    +Object.keys(regions).map(id=>regions[id].map(q=>shape(q,'mm'+lvl(id))).join('')).join('')+'</g>';
  const names=ids=>ids.map(id=>MUSCLE_NAMES[id]).join(', ');
  return '<svg class="mmap" viewBox="0 0 108 106" role="img" aria-label="Muscle map. Main: '+names(m.p)+(m.s.length?'. Also: '+names(m.s):'')+'">'
    +body(front,0)+body(back,58)+'</svg>';
}
function muscleText(ids){return ids.map((id,i)=>i?MUSCLE_NAMES[id].toLowerCase():MUSCLE_NAMES[id]).join(', ');}

// Replacement suggestions for a task: the same kind of exercise (strength, cardio or mobility) sharing at least one
// main muscle. Ranked by how closely the main muscles match (shared ÷ combined), then by supporting muscles that hit
// the task's main ones.
function alternatives(keys){
  const main=new Set(keys.flatMap(k=>EX[k].m?EX[k].m.p:[]));
  const kinds=new Set(keys.map(k=>EX[k].kind));
  // The run and badminton are sessions in their own right, and "Bike warm-up" duplicates the exercise bike.
  return Object.keys(EX).filter(k=>!keys.includes(k)&&EX[k].m&&kinds.has(EX[k].kind)&&!['bike','run','badminton'].includes(k))
    .map(k=>{
      const p=EX[k].m.p, shared=p.filter(x=>main.has(x)).length, union=new Set([...main,...p]).size;
      return {k,shared,score:10*shared/union+EX[k].m.s.filter(x=>main.has(x)).length};
    })
    .filter(a=>a.shared>0).sort((a,b)=>b.score-a.score).slice(0,6).map(a=>a.k);
}

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
    if(e.m){
      const stretch=e.kind==='mobility';
      h+='<div class="exmus">'+muscleMap(e.m)+'<div class="mlist">'
        +'<div class="mrow"><i class="mdot p" aria-hidden="true"></i><span><b>'+(stretch?'Stretches':'Main')+'</b> '+muscleText(e.m.p)+'</span></div>'
        +(e.m.s.length?'<div class="mrow"><i class="mdot s" aria-hidden="true"></i><span><b>Also</b> '+muscleText(e.m.s)+'</span></div>':'')
        +'</div></div>';
    }
    h+='<ol>'+e.st.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
    if(e.cue) h+='<div class="cue">'+e.cue+'</div>';
    return h+'</div>';}).join('');
}
const howOpen=new Set();
