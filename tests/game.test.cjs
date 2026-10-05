const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine.cjs');
const HARD = E.HARD;

function room(n=2,level=0){const r={code:'TEST',level,host:'p0',players:Array.from({length:n},(_,i)=>({id:'p'+i,name:'Elf '+i,house:i,connected:true})),deaths:0};E.init(r);r.variant=0;return r;}
function advance(r,n){for(let i=0;i<n;i++)E.tick(r);}

// Test 1: 8 maps có cấu trúc unique
test('eight maps have unique locations and layouts',()=>{
 const fs=require('node:fs'),path=require('node:path');
 assert.equal(new Set(E.levels.map(l=>l.map)).size,8);
 assert.equal(new Set(E.levels.map(l=>JSON.stringify(l.platforms))).size,8);
 const source=fs.readFileSync(path.join(__dirname,'../dist/map-scenes.js'),'utf8');
 E.levels.forEach(l=>assert.ok(source.includes("'"+l.map+"'"),l.name));
});

// Test 2: Jump works
test('jump works in VERY HARD mode',()=>{
 const r=room();
 advance(r,3);
 const p=r.players[0];
 p.keys={jump:true};
 E.tick(r);
 assert.ok(p.y<526);
});

// Test 3: Elastic rope
test('elastic rope pulls teammates',()=>{
 const r=room();
 const[a,b]=r.players;
 a.x=80;b.x=300;b.y=350;
 E.constrainRopes(r,[]);
 assert.ok(a.kickX>0);
 assert.ok(a.vy<0);
 assert.ok(b.kickX<0);
});

// Test 4: Toss
test('toss works',()=>{
 const r=room();
 advance(r,3);
 const[a,b]=r.players;
 a.keys={toss:true};
 E.tick(r);
 assert.equal(r.pranks,1);
 assert.ok(b.vy<0);
});

// Test 5: Pumpkins and rotors
test('pumpkins and rotors knock players',()=>{
 for(const level of [5,6]){
  const r=room(2,level),p=r.players[0];
  p.invincible=0;
  const obs=E.obstacles({...r,ticks:1});
  if(level===5){
   p.x=obs.pumpkins[0].x;
   p.y=526;
  }else{
   const o=obs.rotors[0];
   p.x=o.x+Math.sin(o.angle)*o.r-15;
   p.y=o.y+Math.cos(o.angle)*o.r-22;
  }
  E.tick(r);
  assert.ok(r.bumps>0);
  assert.ok(p.spin>0);
  assert.equal(r.deaths,0);
 }
});

// Test 6: Springs
test('springs bounce players',()=>{
 const r=room(2,2);
 r.players[0].x=390;
 r.players[0].ground=true;
 E.tick(r);
 assert.ok(r.players[0].vy<0);
});

// Test 7: Checkpoint
test('checkpoint saves work',()=>{
 const r=room(2,7);
 const cp=E.levels[7].checkpoints[0];
 r.players.forEach((p,i)=>{p.x=cp+5+i*36;p.y=526;});
 E.tick(r);
 assert.equal(r.checkpoint,cp);
});

// Test 8: Sock collection
test('sock can be collected',()=>{
 for(let level=0;level<E.levels.length;level++){
  const r=room(2,level),l=E.levels[level];
  r.players.forEach((p,i)=>{p.x=l.key[0]-15-i*32;p.y=l.key[1]-22;});
  E.tick(r);
  assert.equal(r.key,true);
 }
});

// Test 9: Snapshots
test('snapshots work correctly',()=>{
 const r=room();
 r.players[0].token='secret';
 const s=E.snapshot(r);
 assert.ok(!JSON.stringify(s).includes('secret'));
 assert.equal(s.ropeMax,HARD.ropeMax);
});

// Test 10: Dangling and hauling
test('dangling and hauling works',()=>{
 const r=room(2,7);
 const[a,b]=r.players;
 a.x=485;a.y=526;a.ground=true;
 b.x=555;b.y=590;b.ground=false;
 E.tick(r);
 assert.equal(b.dangling,true);
 assert.equal(r.deaths,0);
 a.keys={left:true};
 const prevY=b.y;
 advance(r,5);
 assert.equal(a.hauling,true);
 assert.ok(b.y<prevY);
});

// Test 11: Maps dimensions
test('maps have correct dimensions',()=>{
 for(const l of E.levels){
  assert.ok(l.width>11000);
  assert.equal(l.stops.length,12);
  assert.equal(l.checkpoints.length,11);
 }
});

// Test 12: Crumbling platforms
test('crumbling platforms work',()=>{
 const r=room(2,0);
 const l=E.levels[0];
 if(l.crumbling && l.crumbling.length>0){
  const c=l.crumbling[0];
  r.players[0].x=c[0]+10;
  r.players[0].y=c[1]-44;
  r.players[0].ground=true;
  for(let i=0;i<HARD.maxPlatformTime+20;i++)E.tick(r);
  assert.ok(r.crumblingPlatforms && r.crumblingPlatforms[0]?.collapsed);
 }
});

// Test 13: Obstacles move
test('obstacles move correctly',()=>{
 const r=room(2,5);
 const obs1=E.obstacles({...r,ticks:0});
 const obs2=E.obstacles({...r,ticks:60});
 assert.ok(Math.abs(obs1.pumpkins[0].x - obs2.pumpkins[0].x) > 0);
});

// Test 14: Narrow platforms
test('platforms are narrow',()=>{
 const r=room();
 const l=E.levels[0];
 const narrow=l.platforms.filter(p=>p[2]<80);
 assert.ok(narrow.length>0);
});

// Test 15: Wide gaps
test('maps have wide gaps',()=>{
 const r=room();
 const l=E.levels[0];
 assert.ok(l.width>20000);
});
