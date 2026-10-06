// Bonus socks along the route: placement, pickup, banking at checkpoints, loss on wipe, scoring.
const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine.cjs');
const {PW,PH}=E;
const V2L=E.levels.map((l,i)=>[l,i]).filter(([l])=>l.v2);

function room(n,level){const r={code:'T',level,host:'p0',players:Array.from({length:n},(_,i)=>({id:'p'+i,name:'E'+i,connected:true})),deaths:0};E.init(r);r.players.forEach(p=>p.invincible=1e9);return r;}
function put(p,x,feetY){Object.assign(p,{x,y:feetY-PH,vx:0,vy:0,kickX:0,ground:true,keys:{},dangling:false,coyote:0,jumpHeld:false,tossHeld:false,tossCooldown:0,dangleTicks:0});}
// Stand an elf so its centre is on the sock (feet = sock centre + PH/2).
const standOn=(p,sp)=>put(p,sp.x-PW/2,sp.y+PH/2);
// Teleporting past checkpoints banks socks in the same tick, so accept carried or banked.
const got=(r,si)=>r.socksCarried.includes(si)||r.socksBanked.includes(si);

test('every map has bonus socks inside the world; V2 maps have at least 8',()=>{
 for(const lv of E.levels){
  assert.ok(lv.bonusSocks.length>0,`${lv.name}: no socks`);
  for(const s of lv.bonusSocks)assert.ok(s.x>0&&s.x<lv.width&&s.y>150&&s.y<E.H,`${lv.name}: sock out of world ${s.x},${s.y}`);
 }
 for(const[lv]of V2L)assert.ok(lv.bonusSocks.length>=8,`${lv.name}: only ${lv.bonusSocks.length} socks`);
});

test('pickup → carried; checkpoint banks; score +100 each',()=>{
 const li=V2L[0][1],lv=E.levels[li],r=room(2,li);const[a,b]=r.players;
 const si=lv.bonusSocks.findIndex(s=>s.x<lv.checkpoints[0]);const sp=E.sockPos(lv,lv.bonusSocks[si],2);
 standOn(a,sp);put(b,sp.x-60,570);E.tick(r);
 assert.deepEqual(r.socksCarried,[si]);assert.equal(E.scoring(r).socks,0,'carried socks are not points yet');
 const cp=lv.checkpoints[0];put(a,cp+40,570);put(b,cp+10,570);E.tick(r);
 assert.deepEqual(r.socksBanked,[si]);assert.equal(r.socksCarried.length,0);
 assert.equal(E.scoring(r).socks,E.SOCK_POINTS);
});

test('team wipe drops unbanked socks (they reappear), banked ones stay',()=>{
 const li=V2L[0][1],lv=E.levels[li],r=room(2,li);
 r.socksBanked=[0];r.socksCarried=[1,2];
 const[a,b]=r.players;put(a,100,570);put(b,140,570);a.y=H2();b.y=H2();E.tick(r);
 assert.ok(r.teamRespawn>0);assert.deepEqual(r.socksBanked,[0]);assert.deepEqual(r.socksCarried,[]);
 function H2(){return E.H+40;}
});

test('finishing banks carried socks; collecting all gives the set bonus',()=>{
 const li=V2L[0][1],lv=E.levels[li],r=room(2,li);
 const all=lv.bonusSocks.map((_,i)=>i);r.socksBanked=all.slice(1);r.socksCarried=[0];r.key=true;
 const[a,b]=r.players;put(a,lv.door[0]-20,570);put(b,lv.door[0]-50,570);E.tick(r);
 assert.equal(r.status,'won');assert.equal(r.socksBanked.length,all.length);
 assert.equal(E.scoring(r).socks,all.length*E.SOCK_POINTS+E.SOCK_SET_BONUS);
});

test('ledge socks sit on the ledge (follow its team-size height) and are collected by standing there',()=>{
 for(const[lv,li]of V2L)lv.bonusSocks.forEach((s,si)=>{
  if(s.block==null)return;
  for(const n of [2,3]){
   const r=room(n,li);const sp=E.sockPos(lv,s,n);const top=570-E.blockHeight(lv.blocks[s.block].kind,n);
   assert.equal(sp.y+PH/2,top,`${lv.name} sock ${si} n=${n} not on ledge`);
   r.players.forEach((p,i)=>put(p,s.x-200-i*35,570));put(r.players[0],s.x-PW/2,top);E.tick(r);
   assert.ok(got(r,si),`${lv.name} ledge sock ${si} n=${n} not collected`);
  }
 });
});

test('gap socks: grabbed by a teammate dangling in the gap, who is then hauled out alive',()=>{
 for(const[lv,li]of V2L)lv.bonusSocks.forEach((s,si)=>{
  if(!s.dangle)return;
  const r=room(2,li);const[a,b]=r.players;
  const edge=lv.platforms.filter(([x,y,w])=>y===570&&x+w<=s.x).sort((p,q)=>q[0]-p[0])[0];
  put(b,edge[0]+edge[2]-40,570);Object.assign(a,{x:s.x-PW/2,y:s.y-PH/2,vx:0,vy:0,ground:false,keys:{}});
  let ok=false;
  for(let t=0;t<200;t++){b.keys={left:true};a.keys={left:true};E.tick(r);if(r.teamRespawn)break;if(a.ground&&a.y+PH<=571){ok=true;break;}}
  assert.ok(got(r,si),`${lv.name} gap sock ${si} not grabbed`);
  assert.ok(ok,`${lv.name} gap sock ${si}: grabber not hauled out`);
 });
});

test('platform socks (house bridges, shrink stones, classic) are collected by standing on the platform',()=>{
 for(const lv of E.levels){const li=E.levels.indexOf(lv);
  lv.bonusSocks.forEach((s,si)=>{
   if(s.block!=null||s.dangle||s.high)return;
   const r=room(2,li);const[a,b]=r.players;standOn(a,s);put(b,s.x-40,s.y+PH/2);E.tick(r);
   assert.ok(got(r,si),`${lv.name} sock ${si} @${s.x},${s.y} not collected`);
   // Sock floats exactly one elf-height-half above a real surface (fans may lift the elf, that's fine).
   const feet=s.y+PH/2,onPlat=lv.platforms.some(([x,y,w])=>Math.abs(y-feet)<0.01&&s.x>=x&&s.x<=x+w)||E.solidsFor(r).some(b=>b.house!=null&&Math.abs(b.y-feet)<0.01&&s.x>=b.x&&s.x<=b.x+b.w);
   assert.ok(onPlat,`${lv.name} sock ${si} @${s.x},${s.y}: not above a surface`);
  });
 }
});

test('high chapter socks: solo jumps never reach them, a 2-stack jump does',()=>{
 for(const[lv,li]of V2L)lv.bonusSocks.forEach((s,si)=>{
  if(!s.high)return;
  // Solo: running jumps from many take-off points, holding through the arc.
  for(let off=-120;off<=60;off+=10){
   const r=room(2,li);const[a,b]=r.players;put(a,s.x-PW/2+off-60,570);put(b,a.x-40,570);
   for(let t=0;t<60;t++){a.keys={right:true,jump:t>=6&&t<9};b.keys={right:true};E.tick(r);}
   assert.equal(got(r,si),false,`${lv.name} high sock ${si} solo-reachable (off ${off})`);
  }
  // 2-stack: bottom stands under it, top jumps straight up.
  let ok=false;
  for(const dx of [-10,0,10]){
   const r=room(2,li);const[a,b]=r.players;put(a,s.x-PW/2+dx,570);put(b,s.x-PW/2+dx,570-PH);E.tick(r);
   b.keys={jump:true};for(let t=0;t<40;t++){E.tick(r);b.keys={};}
   if(got(r,si)){ok=true;break;}
  }
  assert.ok(ok,`${lv.name} high sock ${si}: 2-stack cannot reach`);
 });
});
