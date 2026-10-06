// Regression tests for the 2026-10 audit fixes.
const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine.cjs');
const HARD=E.HARD;
const C=E.levels.findIndex(l=>l.classic); // standing death / walls / crumbling live on classic maps

function room(n=2,level=0){const r={code:'TEST',level,host:'p0',players:Array.from({length:n},(_,i)=>({id:'p'+i,name:'Elf '+i,house:i,connected:true})),deaths:0};E.init(r);r.variant=0;r.players.forEach(p=>p.invincible=0);return r;}

test('standing death: idle on the floor wipes the team and counts one death',()=>{
 const r=room(2,C);
 for(let i=0;i<HARD.standingDeathTicks+5&&!r.teamRespawn;i++)E.tick(r);
 assert.ok(r.teamRespawn>0,'team should be respawning');
 assert.equal(r.deaths,1);
 assert.equal(r.runDeaths,1);
 assert.ok(r.players.every(p=>p.dead>0));
});

test('standing death: players who keep moving survive',()=>{
 const r=room(2,C);
 for(let i=0;i<HARD.standingDeathTicks*2;i++){
  const dir=Math.floor(i/20)%2?'left':'right';
  r.players.forEach(p=>p.keys={[dir]:true});
  E.tick(r);
 }
 assert.equal(r.deaths,0);
 assert.equal(r.teamRespawn,0);
});

test('standing death: spawn grace (invincible) does not kill',()=>{
 const r=room(2,C);
 r.players.forEach(p=>p.invincible=100);
 for(let i=0;i<HARD.standingDeathTicks;i++)E.tick(r);
 assert.equal(r.deaths,0);
});

test('standing death: waiting at the door with the sock is safe',()=>{
 const r=room(2,C),l=E.levels[C];
 r.key=true;
 // first elf waits at the door, second is still far behind and keeps moving
 Object.assign(r.players[0],{x:l.door[0]-60,y:526});
 Object.assign(r.players[1],{x:l.door[0]-260,y:526});
 for(let i=0;i<HARD.standingDeathTicks+20;i++){r.players[1].keys={[Math.floor(i/20)%2?'left':'right']:true};E.tick(r);}
 assert.equal(r.deaths,0);
});

test('side collision pushes back to the side you came from (no tunneling through walls)',()=>{
 const r=room(2,C+4),wall=E.levels[C+4].walls[0];
 const p=r.players[0];
 Object.assign(r.players[1],{x:wall.x-150,y:526});
 Object.assign(p,{x:wall.x-PWsafe(),y:526,kickX:10,vx:0,keys:{}});
 E.tick(r);
 assert.ok(p.x+E.PW<=wall.x+0.001,`elf tunneled: x=${p.x}, wall.x=${wall.x}`);
});
function PWsafe(){return E.PW+1;}

test('falling off the map counts as a team death',()=>{
 const r=room();
 r.players.forEach(p=>{p.y=E.H+40;p.ground=false;});
 E.tick(r);
 assert.ok(r.teamRespawn>0);
 assert.equal(r.deaths,1);
});

test('collapsing platform under an elf wipes the team and platforms reset on respawn',()=>{
 const r=room(2,C),c=E.levels[C].crumbling[0];
 Object.assign(r.players[0],{x:c[0]+10,y:c[1]-E.PH,ground:true});
 Object.assign(r.players[1],{x:c[0]+15,y:c[1]-E.PH*2,ground:true});
 let i=0;for(;i<HARD.maxPlatformTime+30&&!r.teamRespawn;i++){r.players[0].y=c[1]-E.PH;r.players[0].ground=true;E.tick(r);}
 assert.ok(r.teamRespawn>0,'team should be wiped when platform collapses under them');
 assert.ok(r.crumblingPlatforms[0].collapsed);
 for(let k=0;k<HARD.respawnTimer+1;k++)E.tick(r);
 assert.equal(r.teamRespawn,0);
 assert.equal(r.crumblingPlatforms[0].collapsed,false);
});

test('3 stars are reachable: fast, deathless clear',()=>{
 const r=room(2,0),l=E.levels[0];
 r.status='won';r.key=true;r.checkpointsPassed=l.checkpoints.length;r.runDeaths=0;
 r.ticks=Math.round(l.width/100)*60;
 assert.equal(E.scoring(r).stars,3);
});

test('snapshot exposes checkpointsPassed for host migration',()=>{
 const r=room();
 r.checkpointsPassed=4;
 assert.equal(E.snapshot(r).checkpointsPassed,4);
});
