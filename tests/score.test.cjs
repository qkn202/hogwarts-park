const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../engine.cjs');
const HARD = E.HARD;

function room(n=2){const r={level:0,players:Array.from({length:n},(_,i)=>({id:'p'+i,connected:true})),deaths:0};E.init(r);return r;}
function flag(r,index){const cp=E.levels[0].checkpoints[index];r.players.forEach((p,i)=>Object.assign(p,{x:cp+i*35+5,y:526,vy:0,kickX:0,keys:{}}));E.tick(r);}

// Test: Flags award once
test('team flags award once in HARD mode',()=>{
 const r=room();
 flag(r,0);
 const score1 = E.scoring(r).total;
 // Flag again - should not increase
 flag(r,0);
 const score2 = E.scoring(r).total;
 assert.equal(score1, score2);
});

// Test: Score calculation works
test('score calculation works in HARD mode',()=>{
 const r=room();
 // Pass a checkpoint
 flag(r,0);
 assert.ok(E.scoring(r).total >= 200);
 
 // Get sock
 r.key = true;
 assert.ok(E.scoring(r).sock === 500);
});

// Test: HARD mode produces valid scores
test('HARD mode scoring produces valid results',()=>{
 const r=room();
 for(let i=0;i<E.levels[0].checkpoints.length;i++)flag(r,i);
 r.key=true;
 r.ticks=1;
 r.runDeaths=0;
 const s = E.scoring(r);
 assert.ok(s.total >= 0);
 assert.ok(s.stars >= 0);
 assert.ok(s.stars <= 3);
});

// Test: Scoring function returns correct structure
test('scoring returns correct structure',()=>{
 const r=room();
 const s = E.scoring(r);
 assert.ok(typeof s.checkpoints === 'number');
 assert.ok(typeof s.sock === 'number');
 assert.ok(typeof s.finish === 'number');
 assert.ok(typeof s.speed === 'number');
 assert.ok(typeof s.care === 'number');
 assert.ok(typeof s.total === 'number');
 assert.ok(typeof s.stars === 'number');
});
