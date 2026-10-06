const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../engine.cjs');

// Run the real frontend loop with a controlled clock and a minimal DOM.
// Browser smoke checks cover pixels/touch; these regressions cover simulation timing.
function frontend(){
  let now=0,calls=0;
  const context=new Proxy({}, {get(target,key){
    if(key in target)return target[key];
    return (...args)=>{
      calls++;
      for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),`${key}: non-finite canvas coordinate`);
      if(key==='measureText')return {width:String(args[0]).length*7};
      if(String(key).startsWith('create'))return {addColorStop(){}};
    };
  }});
  const elements=new Map();
  function element(id=''){
    return {id,width:1200,height:660,clientWidth:800,hidden:false,open:false,value:'',dataset:{},style:{},textContent:'',
      classList:{toggle(){},remove(){},add(){}},getContext:()=>context,addEventListener(){},setAttribute(){},append(){},replaceChildren(){},cloneNode:()=>element(),
    };
  }
  const get=id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id);};
  const storage={getItem:()=>null,setItem(){},removeItem(){}};
  const sandbox={console,performance:{now:()=>now},devicePixelRatio:2,matchMedia:()=>({matches:true,addEventListener(){}}),ResizeObserver:class{observe(){}},
    document:{hidden:false,body:element(),activeElement:{tagName:'BODY'},getElementById:get,querySelector:get,querySelectorAll:()=>[],createElement:element,createTextNode:x=>x,addEventListener(){}},
    localStorage:storage,sessionStorage:storage,location:{search:'',origin:'http://localhost'},URLSearchParams,
    addEventListener(){},setTimeout(){},clearTimeout(){},setInterval(){},requestAnimationFrame(){},ElfEngine:E,
  };
  sandbox.window=sandbox;vm.createContext(sandbox);
  for(const file of ['map-scenes.js','game.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),sandbox);
  const run=code=>vm.runInContext(code,sandbox);
  run("$('local-start').onclick();");
  return {run,advance(t){now=t;run(`loop(${t})`);},callCount:()=>calls};
}

for(const hz of [30,60,120])test(`mobile: ${hz} Hz callbacks keep the simulation at 60 Hz, including low graphics`,()=>{
  for(const low of [false,true]){
    const f=frontend();f.run(`renderQuality.low=${low};resizeRenderer();const actualDraw=draw;let renderCount=0;draw=(...args)=>{renderCount++;return actualDraw(...args);};`);
    for(let frame=1;frame<=hz*2;frame++)f.advance(frame*1000/hz);
    const ticks=f.run('localRoom.ticks');assert.ok(ticks>=119&&ticks<=120,`${hz} Hz, low=${low}: ${ticks} ticks`);
    assert.equal(f.run('canvas.dataset.quality'),low?'low':'mobile');
    const expected=2*Math.min(hz,low?30:60);
    assert.ok(Math.abs(f.run('renderCount')-expected)<=2,`${hz} Hz render pacing, low=${low}`);
  }
});

test('mobile: online host keeps ticking and broadcasting while own controls are paused',()=>{
  const f=frontend();
  f.run("SupabaseNet.onlineRoom=localRoom;localRoom=null;session={isOnline:true,id:'p0'};SupabaseNet.isHost=true;SupabaseNet.playerId='p0';let sent=0;SupabaseNet.broadcastState=()=>sent++;paused=true;renderQuality.low=true;");
  for(let frame=1;frame<=60;frame++)f.advance(frame*1000/30);
  assert.ok(f.run('SupabaseNet.onlineRoom.ticks')>=119);
  assert.ok(f.run('sent')>=25);
});

test('mobile: culling removes offscreen platforms and bounds decoration work on long floors',()=>{
  const f=frontend();f.run('viewLeft=5000;viewRight=6200;');
  const start=f.callCount();f.run('platform(0,570,1000,90)');assert.equal(f.callCount(),start);
  f.run('platform(0,570,20000,90)');const normal=f.callCount()-start;
  f.run('platform(0,570,200000,90)');assert.equal(f.callCount()-start-normal,normal);
});

test('mobile: all 16 maps render at start, middle and end with 2 or 8 players and camera zoom',()=>{
  const f=frontend();
  f.run(`for(let n of [2,8])for(let level=0;level<16;level++){
    localRoom.players=Array.from({length:n},(_,i)=>({id:'p'+i,name:'Elf '+i,house:i,connected:true}));
    localRoom.level=level;E.init(localRoom);
    for(const portion of [0,.5,.95]){
      localRoom.players.forEach((p,i)=>{p.x=portion*(levels[level].width-1200)+100+i*170;});
      state=E.snapshot(localRoom);cameraLevel=level;cameraX=portion*(levels[level].width-1200);cameraZoom=.65;
      draw(10,2);
    }
  }`);
});

test('mobile: terminal and spectator HUD transitions bypass the update throttle',()=>{
  const f=frontend();
  f.run("receive({...state,level:7,status:'won'});");assert.equal(f.run("$('result').hidden"),false);
  f.run("localRoom=null;session={role:'spectator'};receive({...state,status:'playing'});");
  assert.equal(f.run("$('touch').hidden"),true);
  assert.equal(f.run("$('result').hidden"),true);
});
