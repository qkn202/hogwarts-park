// V2 maps: mechanic unit tests + geometry solvability probes ("bot giải được").
// Each probe runs the real engine on the real level geometry and searches over simple input timings:
// an obstacle must be IMPOSSIBLE for the "solo" strategy and POSSIBLE for its intended co-op combo.
const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine.cjs');
const {PW,PH,V2}=E;
const V2L=E.levels.map((l,i)=>[l,i]).filter(([l])=>l.v2);

function room(n,level){const r={code:'T',level,host:'p0',players:Array.from({length:n},(_,i)=>({id:'p'+i,name:'E'+i,connected:true})),deaths:0};E.init(r);r.variant=0;r.players.forEach(p=>p.invincible=1e9);return r;}
function put(p,x,feetY){Object.assign(p,{x,y:feetY-PH,vx:0,vy:0,kickX:0,ground:true,keys:{},dangling:false,coyote:0,jumpHeld:false,tossHeld:false,tossCooldown:0,dangleTicks:0});}
const floorAt=(lv,x)=>lv.platforms.some(([px,py,pw])=>py===570&&x>=px&&x<=px+pw);
const onSurface=(p,y)=>p.ground&&Math.abs(p.y+PH-y)<1.5;

// ---------------------------------------------------------------- structure
test('v2: 8 dense maps, 6 chapters, 5 checkpoints, safe spawn zones',()=>{
 assert.equal(V2L.length,8);
 for(const[lv]of V2L){
  assert.equal(lv.stops.length,6,lv.name);
  assert.equal(lv.checkpoints.length,5,lv.name);
  assert.ok(lv.width<9500,`${lv.name} too long: ${lv.width}`);
  assert.equal(lv.standingDeath,false);
  for(const cp of [80,...lv.checkpoints]){
   for(let x=Math.max(10,cp-140);x<=cp+280;x+=10)assert.ok(floorAt(lv,x),`${lv.name}: no floor at spawn x=${x} (cp ${cp})`);
   const busy=[...lv.blocks.map(b=>[b.x,b.x+b.w]),...lv.drums.map(d=>[d.gate.x,d.gate.x+d.gate.w]),...lv.catapults.map(c=>[c.x,c.x+c.w]),...lv.rotors.map(([x,,r])=>[x-r,x+r])];
   for(const[a,b]of busy)assert.ok(b<cp-140||a>cp+280,`${lv.name}: obstacle [${a},${b}] inside spawn zone of cp ${cp}`);
  }
  assert.ok(floorAt(lv,lv.door[0]),`${lv.name}: door not on floor`);
 }
});

// ---------------------------------------------------------------- mechanics
function drumRoom(){const i=V2L[0][1],lv=E.levels[i];const r=room(2,i);return{r,lv,d:lv.drums[0],di:0};}
function landOn(r,p,x,feetY){Object.assign(p,{x,y:feetY-PH-10,vx:0,kickX:0,vy:4,ground:false,keys:{}});}

test('drums: landing on all active plates within the window opens the gate',()=>{
 const{r,lv,d}=drumRoom();const[a,b]=r.players;
 put(a,d.plates[0].x+15,570);put(b,d.plates[1].x+15,570);E.tick(r);
 assert.equal(r.drumState[0].open,false,'standing still must not open');
 landOn(r,a,d.plates[0].x+15,570);landOn(r,b,d.plates[1].x+15,570);
 for(let i=0;i<4;i++)E.tick(r);
 assert.equal(r.drumState[0].open,true);
 assert.ok(!E.solidsFor(r).some(s=>s.gate===0),'gate solid removed');
});

test('drums: out-of-sync landings (> window) do not open',()=>{
 const{r,d}=drumRoom();const[a,b]=r.players;
 put(a,d.plates[0].x+15,570);put(b,d.plates[1].x+15,570);
 landOn(r,a,d.plates[0].x+15,570);for(let i=0;i<V2.window+10;i++)E.tick(r);
 landOn(r,b,d.plates[1].x+15,570);for(let i=0;i<4;i++)E.tick(r);
 assert.equal(r.drumState[0].open,false);
});

test('drums: timed gate closes after its time unless someone stands in it',()=>{
 const li=V2L[0][1],lv=E.levels[li];const di=lv.drums.findIndex(d=>d.open);const d=lv.drums[di];
 const r=room(2,li);const[a,b]=r.players;
 r.drumState[di]={hits:{},open:true,until:r.ticks+5};
 put(a,d.gate.x+5,570);put(b,d.gate.x-40,570);
 for(let i=0;i<20;i++){a.x=d.gate.x+5;E.tick(r);}
 assert.equal(r.drumState[di].open,true,'stays open while occupied');
 put(a,d.gate.x-80,570);for(let i=0;i<3;i++)E.tick(r);
 assert.equal(r.drumState[di].open,false,'closes when empty');
});

test('drums: closed gate blocks passage; plates scale with team size',()=>{
 const{r,d}=drumRoom();const[a,b]=r.players;
 put(a,d.gate.x-35,570);put(b,d.gate.x-80,570);
 for(let i=0;i<30;i++){a.keys={right:true};E.tick(r);}
 assert.ok(a.x+PW<=d.gate.x+0.01);
 const big=E.levels[V2L[0][1]].drums.find(x=>x.max===4);
 assert.equal(E.activePlates(big,2),2);assert.equal(E.activePlates(big,3),3);assert.equal(E.activePlates(big,8),4);
});

test('house platforms are solid only for elves of the matching slot colour',()=>{
 const li=V2L.find(([l])=>l.houseBridges.length)[1];const r=room(2,li);
 const plat=E.solidsFor(r).find(s=>s.house===1);
 const[a,b]=r.players;// a = colour 0, b = colour 1
 put(a,plat.x+10,plat.y);put(b,plat.x+10,plat.y);
 for(let i=0;i<5;i++)E.tick(r);
 assert.ok(onSurface(b,plat.y),'own colour holds');
 assert.ok(a.y+PH>plat.y+5,'other colour falls through');
});

test('fog: triggers, wipes the laggard, resets on wipe, clears when everyone passes',()=>{
 const li=V2L.find(([l])=>l.fogs.length)[1],lv=E.levels[li],f=lv.fogs[0];
 const r=room(2,li);const[a,b]=r.players;
 put(a,f.start+5,570);put(b,f.start-130,570);
 E.tick(r);assert.equal(r.fogState[0].active,true);
 let t=0;while(!r.teamRespawn&&t<2000){E.tick(r);t++;}
 assert.ok(r.teamRespawn>0,'idle laggard is caught');
 assert.equal(r.fogState[0].active,false,'fog resets');
 assert.equal(r.fogState[0].x,f.start-480);
 const r2=room(2,li);put(r2.players[0],f.end+5,570);put(r2.players[1],f.end+40,570);r2.fogState[0].active=true;E.tick(r2);
 assert.equal(r2.fogState[0].done,true);
});

test('catapult: 1 stomp launches for 2 players, 3+ players need 2 synchronized stomps',()=>{
 const li=V2L.find(([l])=>l.catapults.length)[1],lv=E.levels[li],c=lv.catapults[0];
 const r=room(2,li);const[a,b]=r.players;
 put(b,c.x+c.w-40,c.y);landOn(r,a,c.x+20,c.y);
 let launched=false;for(let i=0;i<6;i++){E.tick(r);if(b.vy<-10)launched=true;}
 assert.ok(launched,'single stomp launches with 2 players');
 const r3=room(3,li);const[x,y,z]=r3.players;
 put(z,c.x+c.w-40,c.y);put(y,c.x-200,570);landOn(r3,x,c.x+20,c.y);
 let l3=false;for(let i=0;i<6;i++){E.tick(r3);if(z.vy<-10)l3=true;}
 assert.equal(l3,false,'one stomp is not enough for 3+');
 put(z,c.x+c.w-40,c.y);landOn(r3,x,c.x+20,c.y);landOn(r3,y,c.x+50,c.y);
 for(let i=0;i<6;i++){E.tick(r3);if(z.vy<-10)l3=true;}
 assert.ok(l3,'two synced stomps launch');
});

test('rope shrink zone caps rope at 120px',()=>{
 const li=V2L.find(([l])=>l.shrinkZones.length)[1],lv=E.levels[li],[z1]=lv.shrinkZones[0];
 const r=room(2,li);const[a,b]=r.players;
 put(a,z1+10,570);put(b,z1+190,570);E.constrainRopes(r,[]);
 assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<=V2.shrinkMax+1);
});

test('rope fray: dangling too long snaps the rope (team wipe)',()=>{
 const li=V2L[0][1],lv=E.levels[li],[g0,g1]=lv.tossGaps[0];
 const r=room(2,li);const[a,b]=r.players;
 put(a,g0-40,570);Object.assign(b,{x:g0+30,y:640,vy:0,ground:false});
 let t=0;while(!r.teamRespawn&&t<lv.ropeFray+20){Object.assign(a,{x:g0-40,kickX:0,vx:0});E.tick(r);t++;}// anchor braced at the edge
 assert.ok(r.teamRespawn>0&&t>=lv.ropeFray-2,`snapped at ${t}`);
});

test('v2 has no standing death; pulsing fans; moving Snitch',()=>{
 const r=room(2,V2L[0][1]);for(let i=0;i<400;i++)E.tick(r);assert.equal(r.deaths,0);
 const fan=V2L.find(([l])=>l.fans.length)[0].fans[0];
 let on=0;for(let t=0;t<600;t++)if(E.fanOn(fan,t))on++;assert.ok(on>200&&on<400);
 const fin=V2L.find(([l])=>l.snitch)[1];const k1=E.obstacles({level:fin,ticks:0}).keyPos,k2=E.obstacles({level:fin,ticks:120}).keyPos;
 assert.ok(Math.hypot(k1.x-k2.x,k1.y-k2.y)>20);
 assert.ok(570-(k1.y+25)>100,'snitch is out of solo jump reach');
});

// ---------------------------------------------------------------- solvability probes
// Solo running jump over every toss gap: try every take-off point.
function soloCrossGap(li,g0,g1){
 for(let k=0;k<=32;k+=2){
  const r=room(2,li);const[a,b]=r.players;put(a,g0-170,570);put(b,g0-210,570);
  let jumped=false;
  for(let t=0;t<200;t++){
   a.keys={right:true,jump:!jumped&&a.x+PW>=g0-k+30};if(a.keys.jump)jumped=true;b.keys={right:t<25};
   E.tick(r);if(onSurface(a,570)&&a.x+PW>g1+2)return true;if(r.teamRespawn)break;
  }
 }
 return false;
}
function tossCrossGap(li,g0,g1){
 for(const off of [55,65,75])for(let hold=0;hold<=40;hold+=4){
  const r=room(2,li);const[a,b]=r.players;put(a,g0-off,570);put(b,g0-8,570);a.facing=1;E.tick(r);
  a.keys={toss:true};
  for(let t=0;t<120;t++){b.keys={right:t<hold};E.tick(r);a.keys={};if(onSurface(b,570)&&b.x>g1-PW+2)return true;}
 }
 return false;
}
function haulAcross(li,g0,g1){
 const r=room(2,li);const[a,b]=r.players;put(b,g1+50,570);Object.assign(a,{x:(g0+g1)/2-15,y:600,vy:0,ground:false});
 for(let t=0;t<240;t++){b.keys={right:true};a.keys={right:true};E.tick(r);if(r.teamRespawn)return false;if(onSurface(a,570)&&a.x>g1-PW)return true;}
 return false;
}

test('every toss gap: solo jump fails, a teammate toss crosses, the rest get hauled',()=>{
 for(const[lv,li]of V2L)for(const[g0,g1]of lv.tossGaps){
  assert.equal(soloCrossGap(li,g0,g1),false,`${lv.name} gap@${g0} is solo-jumpable`);
  assert.ok(tossCrossGap(li,g0,g1),`${lv.name} gap@${g0} cannot be crossed by toss`);
  assert.ok(haulAcross(li,g0,g1),`${lv.name} gap@${g0}: teammate cannot be hauled over`);
 }
});

function blockTop(li,n,bi){const lv=E.levels[li],bk=lv.blocks[bi];return 570-E.blockHeight(bk.kind,n);}
function reachSolo(li,bi){
 const lv=E.levels[li],bk=lv.blocks[bi],y=blockTop(li,2,bi);
 for(const off of [35,45,60,80])for(let hold=0;hold<=30;hold+=5){
  const r=room(2,li);const[a,b]=r.players;put(a,bk.x-off,570);put(b,bk.x-off-40,570);
  a.keys={jump:true,right:true};
  for(let t=0;t<60;t++){E.tick(r);a.keys={right:t<hold};if(onSurface(a,y)&&a.x+PW>bk.x)return true;}
 }
 return false;
}
function reachStack(li,bi,n){
 const lv=E.levels[li],bk=lv.blocks[bi],y=blockTop(li,n,bi);
 for(const off of [32,40,50])for(let hold=0;hold<=30;hold+=3){
  const r=room(n,li);const ps=r.players;
  ps.forEach((p,i)=>put(p,bk.x-off,570-i*PH));
  ps.forEach(p=>p.ground=true);E.tick(r);
  const top=ps[n-1];top.keys={jump:true,right:true};
  for(let t=0;t<70;t++){E.tick(r);top.keys={right:t<hold};if(onSurface(top,y)&&top.x+PW>bk.x)return true;}
 }
 return false;
}
function reachToss(li,bi,n=2){
 const lv=E.levels[li],bk=lv.blocks[bi],y=blockTop(li,n,bi);
 for(const off of [40,55,70,90])for(let hold=0;hold<=40;hold+=4){
  const r=room(n,li);const ps=r.players;const[a,b]=ps;
  put(a,bk.x-off-45,570);put(b,bk.x-off,570);ps.slice(2).forEach((p,i)=>put(p,bk.x-off-90-i*35,570));a.facing=1;E.tick(r);
  a.keys={toss:true};
  for(let t=0;t<90;t++){b.keys={right:t<hold};E.tick(r);a.keys={};if(onSurface(b,y)&&b.x+PW>bk.x)return true;}
 }
 return false;
}
function reachCatapult(li,bi){
 const lv=E.levels[li],bk=lv.blocks[bi],y=blockTop(li,2,bi);
 const c=lv.catapults.find(c=>c.x+c.w===bk.x);
 for(const pos of [c.w-35,c.w-50,c.w-65])for(let hold=0;hold<=40;hold+=4){
  const r=room(2,li);const[a,b]=r.players;put(b,c.x+pos,c.y);put(a,c.x-45,570);
  let flying=false,h=hold;
  for(let t=0;t<120;t++){
   if(b.vy<-10)flying=true;
   a.keys=t===0?{jump:true,right:true}:(t<14||flying)?{right:true}:{};b.keys={right:flying&&h-->0};
   E.tick(r);if(onSurface(b,y)&&b.x+PW>bk.x)return true;
  }
 }
 return false;
}

test('every ledge: unreachable solo, reachable by exactly its co-op combo',()=>{
 for(const[lv,li]of V2L)lv.blocks.forEach((bk,bi)=>{
  const tag=`${lv.name} ${bk.kind}@${bk.x}`;
  assert.equal(reachSolo(li,bi),false,`${tag}: solo jump reaches it`);
  if(bk.kind==='stack2'||bk.kind==='stack'){
   assert.ok(reachStack(li,bi,2),`${tag}: 2-stack cannot reach (2 players)`);
  }
  if(bk.kind==='stack'){
   assert.ok(reachStack(li,bi,3),`${tag}: 3-stack cannot reach (3 players)`);
   assert.equal(reachToss(li,bi,3),false,`${tag}: plain toss shortcut with 3 players`);
  }
  if(bk.kind==='toss'){
   assert.equal(reachStack(li,bi,2),false,`${tag}: 2-stack shortcut`);
   assert.ok(reachToss(li,bi),`${tag}: toss cannot reach`);
  }
  if(bk.kind==='cat'){
   assert.equal(reachToss(li,bi),false,`${tag}: toss shortcut`);
   assert.equal(reachStack(li,bi,3),false,`${tag}: 3-stack shortcut`);
   assert.ok(reachCatapult(li,bi),`${tag}: catapult cannot reach`);
  }
 });
});

// House bridge leapfrog: for each team size, every colour must be able to advance one cycle
// by a teammate's toss, and must NOT be able to jump it solo.
function housePlats(r,hb){
 return E.solidsFor(r).filter(s=>s.house!=null&&s.x>=hb.x&&s.x<hb.x+hb.cycles*V2.houseSpacing+60);
}
function leapStep(li,n,hb,c,k){
 const r0=room(n,li);const plats=housePlats(r0,hb),nh=E.nHouses(r0);
 const P=(cc,kk)=>plats.filter(s=>s.house===cc).sort((a,b)=>a.x-b.x)[kk];
 const from=P(c,k),to=P(c,k+1);if(!to)return{solo:false,toss:true};
 const tc=(c+1)%nh,tk=c+1<nh?k:k+1,tp=P(tc,tk);
 // Teammates wait on their own colour in leapfrog formation (lower colours already advanced), not far behind on the floor.
 const park=(p,i)=>{const hp=i<nh&&(P(i,i<c?k+1:k)||P(i,k));if(hp)put(p,hp.x+10,hp.y);else put(p,from.x-60-i*20,570);};
 let solo=false,toss=false;
 for(let hold=0;hold<=30&&!solo;hold+=3){
  const r=room(n,li);const me=r.players[c];r.players.forEach((p,i)=>{if(i!==c)park(p,i);});
  put(me,from.x+from.w-PW+18,from.y);me.keys={jump:true,right:true};
  for(let t=0;t<60;t++){E.tick(r);me.keys={right:t<hold};if(onSurface(me,to.y)&&me.x+PW>to.x)solo=true;}
 }
 if(!tp)return{solo,toss:false};
 for(const tOff of [-20,-10,0,10])for(const mOff of [18,10,0])for(let hold=0;hold<=36&&!toss;hold+=3){
  const r=room(n,li);const me=r.players[c],th=r.players[tc];
  r.players.forEach((p,i)=>{if(i!==c&&i!==tc)park(p,i);});
  put(me,from.x+from.w-PW+mOff,from.y);put(th,tp.x+tOff,tp.y);th.facing=1;
  if(Math.hypot(th.x-me.x,th.y-me.y)>=85)continue;
  E.tick(r);th.keys={toss:true};
  for(let t=0;t<90;t++){me.keys={right:t<hold};E.tick(r);th.keys={};if(onSurface(me,to.y)&&me.x+PW>to.x){toss=true;break;}}
 }
 return{solo,toss};
}
test('house bridges: every leapfrog step needs a teammate toss (2, 3, 4 players)',()=>{
 for(const[lv,li]of V2L)for(const hb of lv.houseBridges)for(const n of [2,3,4]){
  const nh=Math.min(4,n);
  for(let c=0;c<nh;c++)for(let k=0;k<hb.cycles-1;k++){
   const{solo,toss}=leapStep(li,n,hb,c,k);
   assert.equal(solo,false,`${lv.name} bridge@${hb.x} n=${n} colour ${c} step ${k}: solo-jumpable`);
   assert.ok(toss,`${lv.name} bridge@${hb.x} n=${n} colour ${c} step ${k}: no toss solution`);
  }
 }
});

test('fog chases leave a fair time budget even for 8 players',()=>{
 for(const[lv]of V2L)for(const f of lv.fogs){
  const L=f.end-f.start,budget=(480+L)/V2.fogSpeed(8),walk=L/2.7;
  assert.ok(budget>walk*1.15,`${lv.name} fog@${f.start}: budget ${budget|0} vs walk ${walk|0}`);
 }
});
