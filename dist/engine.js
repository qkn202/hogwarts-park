(()=>{
const W=1200,H=660,PW=30,PH=44;
const floor=[[0,570,1200,90]];
// ===== NO WALKING CHALLENGE - FIXED COLLISION =====
const HARD = {
  gravity: 0.85,
  jumpPower: -12,
  springPower: -16,
  maxFallSpeed: 14,
  moveSpeed: 1.3,
  friction: 0.52,
  ropeLength: 185,
  ropeMax: 300,
  abyssGap: 550,
  checkpointSpacing: 80,
  respawnTimer: 32,
  obstacleSpeed: 1.6,
  pumpkinBounce: -8,
  rotorKnockback: -11.5,
  maxPlatformTime: 75,
  standingDeathTicks: 120,
  minPlatformWidth: 40,
  mountainPeakY: 270,
  mountainWindForce: 1.2,
};
const levels=[
 {map:'common-room',name:'Phòng sinh hoạt chung',hint:'VỰC CỰC RỘNG!',platforms:[...floor,[350,510,80,18],[670,495,70,18]],key:[870,515],door:[1100,498],spikes:[],pumpkins:[[630,515,110]]},
 {map:'great-hall',name:'Đại Sảnh Đường',hint:'SÀN RUNG - ĐỨNG YÊN LÀ CHẾT!',platforms:[...floor,[530,500,100,18]],key:[920,505],door:[1100,498],spikes:[],ice:[200,1050],pumpkins:[[680,520,130]]},
 {map:'charms',name:'Lớp học Bùa chú',hint:'NÚI CAO NHẤT!',platforms:[...floor,[420,490,80,18],[780,450,130,18]],key:[865,418],door:[1100,498],spikes:[],springs:[[360,570,90],[695,570,100]]},
 {map:'greenhouse',name:'Nhà kính Thảo dược',hint:'QUẠT THỔI!',platforms:[...floor,[540,505,75,18]],key:[905,495],door:[1100,498],spikes:[],fans:[[340,425,200,1.4],[680,415,170,1.4]],pumpkins:[[840,525,60]]},
 {map:'stairs',name:'Cầu thang Hogwarts',hint:'NÚI THAY THANG!',platforms:[...floor,[285,495,75,18],[690,510,55,18]],key:[915,500],door:[1100,498],spikes:[],seesaw:[420,490,290],moving:[800,500,100,18,42]},
 {map:'kitchen',name:'Nhà bếp gia tinh',hint:'NHIỀU BÍ NGÔ!',platforms:[...floor,[420,505,90,18]],key:[930,505],door:[1100,498],spikes:[],pumpkins:[[450,515,140],[780,520,130],[980,525,65]],ice:[350,1040]},
 {map:'chamber',name:'Phòng Chứa Bí Mật',hint:'CÁNH CỬA QUAY!',platforms:[...floor,[285,500,75,18],[750,500,60,18]],key:[945,505],door:[1100,498],spikes:[],rotors:[[580,475,80],[870,475,72]],springs:[[420,570,85]]},
 {map:'courtyard',name:'Sân lâu đài Hogwarts',hint:'TẤT CẢ OBSTACLES!',platforms:[[0,570,480,90],[650,570,550,90]],key:[925,485],door:[1100,498],spikes:[],springs:[[430,570,90],[730,570,85]],fans:[[650,410,150,1.4]],pumpkins:[[900,525,85]],ice:[680,1070]}
];
const routes=[
 ['steps','pumpkin','gap','bounce','wind','bridge','ice','rotor','conveyor','bouncegap','bowling','finale'],
 ['ice','bowling','steps','gap','icewind','bridge','bounce','conveyor','rotor','wind','bouncegap','finale'],
 ['bounce','steps','wind','gap','rotor','ice','bridge','bouncegap','bowling','conveyor','icewind','finale'],
 ['wind','pumpkin','gap','steps','icewind','bridge','bouncegap','rotor','conveyor','pumpkin','bowling','finale'],
 ['steps','bridge','gap','rotor','conveyor','bouncegap','wind','ice','bounce','pumpkin','icewind','finale'],
 ['bowling','ice','gap','steps','pumpkin','wind','bridge','rotor','bouncegap','conveyor','icewind','finale'],
 ['rotor','steps','gap','bridge','bowling','ice','bouncegap','wind','conveyor','pumpkin','icewind','finale'],
 ['gap','wind','ice','steps','bowling','bridge','bouncegap','rotor','conveyor','bounce','icewind','finale']
];
const stopNames={steps:'NÚI KHỔNG LỒ!',pumpkin:'Bí ngô thích ôm',gap:'Kéo bạn qua vực',bounce:'Cả hội thành tên lửa',wind:'Tai dài bắt gió',bridge:'Cầu nghiêng, hội nghiêng',bowling:'Gia tinh bowling',ice:'Ai bôi bơ lên sàn?',icewind:'Trượt rồi bay luôn',rotor:'Cửa xoay KHÔNG XUYÊN ĐƯỢC!',bouncegap:'Boing qua vực',conveyor:'Băng chuyền đổi chiều',finale:'Vớ ở cuối đường!'};
const chapterNames=[
 ['Đỉnh núi chót vót','Bí ngô giành ghế','Thảm bị thủng!','Ghế sofa BOING','Ống khói hắt hơi','Cầu bàn trà nghiêng','Bơ đổ trên thảm','Cánh quạt trần quay','Băng chuyền dọn dẹp','Vực sâu sàn gỗ','Bí ngô đánh bowling','Vớ sau lò sưởi'],
 ['Bơ đổ trên sàn','Bữa tiệc bí ngô','Leo núi đá','Sàn thiếu một miếng','Khăn bàn hóa diều','Bàn tiệc bập bênh','Đệm bánh pudding','Băng chuyền đĩa thức ăn','Cánh quạt trần quay','Gió lốc trần sảnh','Hào nước cống ngầm','Vớ tráng miệng'],
 ['Bùa bật tung người','Đỉnh núi chót vót','Leviosa thổi tai','Sàn tàng hình','Đũa phép quay cuồng','Sàn bơ Wingardium','Bàn học bập bênh','Phóng qua hố mực','Cánh quạt trần quay','Băng chuyền cuộn giấy','Gió lốc bùa chú','Vớ biết bay'],
 ['Cây quạt hắt hơi','Bí ngô cần ôm','Mương tưới cây','Đỉnh núi chót vót','Sương trơn bắt gió','Cầu gỗ tưới nước','Nấm phóng qua mương','Cánh quạt thông gió','Băng rêu trôi ngược','Nấm nổ tung người','Thu hoạch bowling','Vớ giữa luống cây'],
 ['Bậc thang chồng vai','Cầu thang lắc lư','Núi cao chót vót','Lan can xoay tròn','Thang cuốn trái tính','Cầu thang bật tung','Gió lùa hành lang','Sàn đá trơn trượt','Đệm lò xo cứu nguy','Bí ngô ngáng bậc','Cầu thang bão tuyết','Vớ trên tầng cuối'],
 ['Bí ngô trốn nồi','Bơ không có phanh','Ống thoát nước hở','Đỉnh núi chót vót','Bí ngô đuổi đầu bếp','Máy hút mùi quá mạnh','Cầu thớt bập bênh','Cánh quạt trộn bột','Lò nướng bật tưng','Băng chuyền rửa chén','Bơ trượt gặp bão','Vớ khỏi dây phơi'],
 ['Đuôi rắn quay vòng','Tượng đá xếp tầng','Mương nước bí mật','Đỉnh núi chót vót','Cánh quạt trần quay','Rêu trơn bóng đêm','Bật qua cống sâu','Luồng khí lạnh rít','Nền đá chạy ngược','Bẫy đá dội ngược','Cống ngầm gió tuyết','Vớ sau cửa rắn'],
 ['Cống sân lâu đài','Gió giật tai dài','Sân phủ sương trơn','Đỉnh núi chót vót','Bí ngô đá bóng','Cầu gỗ chòng chành','Hào sâu trắc trở','Cánh quạt trần quay','Băng chuyền lát đá','Đệm hoa chuông BOING','Bão tuyết sân thượng','Vớ dưới ánh trăng']
];
levels.forEach((l,index)=>{
 const stride=1800+index*30;
 l.width=180+stride*12+520;
 l.platforms=[];l.pumpkins=[];l.rotors=[];l.fans=[];l.springs=[];l.iceZones=[];l.seesaws=[];l.movers=[];l.checkpoints=[];l.stops=[];l.conveyors=[];l.spikes=[];l.crumbling=[];l.mountains=[];
 delete l.ice;delete l.moving;delete l.seesaw;
 let floorStart=0;
 const gap=(a,b)=>{l.platforms.push([floorStart,570,a-floorStart,90]);floorStart=b;};
 routes[index].forEach((kind,i)=>{
  const x=180+i*stride;
  l.stops.push({x,label:chapterNames[index][i],kind,instruction:stopNames[kind]});
  if(i)l.checkpoints.push(x-HARD.checkpointSpacing);

  if(kind==='steps'){
   // Majestic Hogwarts Bastion Tower & Steps
   l.platforms.push(
    [x+150,528,85,42],
    [x+230,486,85,84],
    [x+310,444,85,126],
    [x+390,402,85,168],
    [x+470,360,85,210],
    [x+550,318,85,252],
    [x+630,HARD.mountainPeakY,115,18] // Bastion Peak at y=270!
   );
   l.fans.push([x+450,HARD.mountainPeakY+40,200,HARD.mountainWindForce]);
   gap(x+750,x+1330); // 580px massive abyss!
   // Stepping ledges across the grand abyss:
   l.platforms.push([x+780,510,80,18],[x+900,470,80,18]);l.crumbling.push([x+1020,435,75,18]);l.platforms.push([x+1140,475,75,18],[x+1260,510,80,18]);
  }
  if(kind==='pumpkin'||kind==='bowling'){
   l.pumpkins.push([x+300,526,95],[x+600,526,85],[x+1150,526,100],[x+1450,526,90]);
   if(kind==='bowling')l.pumpkins.push([x+430,526,70],[x+1300,526,70],[x+1600,526,80]);
   gap(x+680,x+1280);
   l.platforms.push([x+350,455,50,18]);
   l.platforms.push([x+480,455,50,18]);
   l.platforms.push([x+720,510,75,18],[x+840,470,75,18],[x+960,435,75,18],[x+1080,475,75,18],[x+1200,510,75,18]);
  }
  
  if(kind==='gap'||kind==='bouncegap'){
   gap(x+320,x+860);
   l.platforms.push([x+330,510,85,18],[x+450,470,85,18],[x+570,430,85,18],[x+690,470,85,18],[x+800,510,85,18]);
   gap(x+920,x+1400);
   l.platforms.push([x+930,510,85,18],[x+1050,470,85,18],[x+1170,430,85,18],[x+1290,470,85,18]);
   if(kind==='bouncegap')l.springs.push([x+220,570,75],[x+870,570,75]);
  }
  
  if(kind==='bounce'){
   l.springs.push([x+170,570,70],[x+380,570,70],[x+600,570,70],[x+820,570,70],[x+1050,570,70],[x+1280,570,70],[x+1460,570,70]);
   gap(x+280,x+860);
   l.platforms.push([x+350,510,75,18],[x+470,465,75,18],[x+590,420,75,18],[x+710,465,75,18],[x+830,510,75,18]);
  }
  
  if(kind==='wind'||kind==='icewind'){
   l.fans.push([x+180,400,250,1.6],[x+600,400,250,1.6],[x+1030,400,250,1.6]);
   if(kind!=="icewind"){gap(x+280,x+860);l.platforms.push([x+360,510,75,18],[x+480,465,75,18],[x+600,420,75,18],[x+720,465,75,18],[x+830,510,75,18]);}
  }
  
  if(kind==='ice'||kind==='icewind'){
   l.iceZones.push([x+130,x+620],[x+960,x+1520]);
   l.pumpkins.push([x+430,526,85],[x+1350,526,85]);
   gap(x+600,x+1200);
   l.platforms.push([x+680,510,75,18],[x+800,470,75,18],[x+920,430,75,18],[x+1040,480,75,18]);
  }
  
  if(kind==='bridge'){
   gap(x+190,x+680);
   l.seesaws.push([x+180,540,480]);
   l.movers.push([x+690,460,110,18,40]);
   gap(x+910,x+1400);
   l.seesaws.push([x+900,540,480]);
   l.movers.push([x+1410,460,110,18,40]);
  }
  
  if(kind==='rotor'){
   l.rotors.push([x+260,465,85],[x+1120,465,85]);
   gap(x+300,x+880);
   l.platforms.push([x+380,510,75,18],[x+500,465,75,18],[x+620,420,75,18],[x+740,475,75,18],[x+850,510,75,18]);
  }
  
  if(kind==='conveyor'){
   l.conveyors.push([x+120,x+520],[x+860,x+1420]);
   gap(x+500,x+1100);
   l.platforms.push([x+580,510,75,18],[x+700,470,75,18],[x+820,430,75,18],[x+940,480,75,18],[x+1050,510,75,18]);
  }
  
  if(kind==='finale'){
   l.springs.push([x+140,570,70],[x+600,570,70],[x+1030,570,70]);
   l.pumpkins.push([x+400,526,85],[x+1300,526,85]);
   l.rotors.push([x+630,455,85],[x+1530,455,85]);
   l.iceZones.push([x+230,x+620]);
   gap(x+600,x+1220);
   l.platforms.push([x+680,510,75,18],[x+800,470,75,18],[x+920,430,75,18],[x+1040,480,75,18],[x+1160,510,75,18]);
  }

 });
 l.platforms.push([floorStart,570,l.width-floorStart,90]);
 l.key=[l.width-330,515];
 l.door=[l.width-115,498];
 l.hint='VỰC CỰC RỘNG! ĐỨNG YÊN = CHẾT! LUÔN LUÔN NHẢY!';
});
function worldWidth(room){return levels[room.level].width;}
function spawn(room){
 const base=Math.max(15,(room.checkpoint||80)-Math.max(0,room.players.length-4)*35);
 room.players.forEach((p,i)=>Object.assign(p,{
  x:base+i*35,y:526,vx:0,vy:0,kickX:0,ground:false,dead:0,keys:{},jumpHeld:false,
  tossHeld:false,tossCooldown:0,ready:false,spin:0,invincible:100,facing:1,coyote:0,
  dangling:false,hauling:false,bumpCooldown:0,stacked:false,stackHeight:0,onMountain:false,
  standingTicks:0,lastY:526
 }));
}
function init(room){
 room.checkpoint=80;room.checkpointsPassed=0;room.runDeaths=0;room.elapsed=undefined;
 spawn(room);room.key=false;room.gateOpen=true;room.teamRespawn=0;
 room.ropeLength=HARD.ropeLength;
 room.ropeMax=HARD.ropeMax;
 room.status='playing';room.ticks=0;room.movingY=undefined;
 room.deaths=room.deaths||0;room.pranks=0;room.bumps=0;
 room.variant=Math.floor(Math.random()*3);room.started=Date.now();
 room.crumblingPlatforms = {};
 const l = levels[room.level];
 if(l.crumbling) {
  l.crumbling.forEach((c, idx) => {
   room.crumblingPlatforms[idx] = { crumbling: false, collapsed: false, timer: 0 };
  });
 }
}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

// Kiểm tra va chạm với CÁNH QUẠT (rotor blade) - kiểm tra 4 điểm trên cánh quạt
function checkRotorBladeCollision(px, py, pw, ph, rotorX, rotorY, rotorR, rotorAngle) {
 const bladeLength = rotorR;
 const playerCenterX = px + pw / 2;
 const playerCenterY = py + ph / 2;
 
 // Kiểm tra 4 cánh quạt tại các góc 0, 90, 180, 270 độ
 for(let i = 0; i < 4; i++) {
  const bladeAngle = rotorAngle + (i * Math.PI / 2);
  // Tính vị trí đầu mút của cánh quạt
  const bladeEndX = rotorX + Math.cos(bladeAngle) * bladeLength;
  const bladeEndY = rotorY + Math.sin(bladeAngle) * bladeLength;
  
  // Kiểm tra va chạm giữa player và đoạn thẳng từ tâm đến đầu mút cánh quạt
  // Sử dụng kiểm tra khoảng cách từ điểm đến đoạn thẳng
  const dist = pointToSegmentDistance(playerCenterX, playerCenterY, rotorX, rotorY, bladeEndX, bladeEndY);
  if(dist < 30) { // 30px = bán kính va chạm của cánh quạt
   // Tính hướng đẩy - đẩy ra ngoài từ tâm rotor
   const pushDirX = playerCenterX - rotorX;
   const pushDirY = playerCenterY - rotorY;
   const pushDist = Math.sqrt(pushDirX * pushDirX + pushDirY * pushDirY);
   return {
    hit: true,
    pushX: pushDist > 0 ? (pushDirX / pushDist) : 1,
    pushY: pushDist > 0 ? (pushDirY / pushDist) : 0,
    fromLeft: playerCenterX < rotorX
   };
  }
 }
 return { hit: false };
}

// Tính khoảng cách từ điểm đến đoạn thẳng
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
 const dx = x2 - x1;
 const dy = y2 - y1;
 const lenSq = dx * dx + dy * dy;
 if(lenSq === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
 
 let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
 t = Math.max(0, Math.min(1, t));
 
 const nearestX = x1 + t * dx;
 const nearestY = y1 + t * dy;
 
 return Math.sqrt((px - nearestX) * (px - nearestX) + (py - nearestY) * (py - nearestY));
}

// Kiểm tra player có đang đứng trên đầu người khác không (chống nhảy xuyên qua)
function checkPlayerStackingCollision(p, other, oldY) {
 // Nếu player đang rơi xuống và người khác đang ở dưới
 if(p.vy > 0 && other.vy <= 0 && p.x + PW > other.x + 3 && p.x < other.x + PW - 3) {
  const playerBottom = oldY + PH;
  const otherTop = other.y;
  const otherBottom = other.y + PH;
  
  // Kiểm tra nếu player sẽ đi qua đầu người khác
  if(playerBottom >= otherTop && playerBottom <= otherBottom + 10) {
   // Player đang cố nhảy xuyên qua đầu người khác - CHẶN!
   return true;
  }
 }
 return false;
}

function obstacles(room){
 const l=levels[room.level],t=room.ticks||0,v=room.variant||0;
 return {
  pumpkins:(l.pumpkins||[]).map(([x,y,amp],i)=>({x:x+Math.sin(t/(55+i*8)+v)*amp,y:y+Math.sin(t/12+i)*3,w:40,h:40,phase:t/10+i})),
  rotors:(l.rotors||[]).map(([x,y,r],i)=>({x,y,r,angle:t/(35+i*7)+v})),
  slope:l.seesaw?Math.sin(t/75+v)*.4:0
 };
}
function solidsFor(room){
 const l=levels[room.level],s=l.platforms.map(([x,y,w,h])=>({x,y,w,h}));
 for(const[x,y,w,h,a]of l.movers)s.push({x,y:y+Math.sin(room.ticks/80+x)*a,w,h,moving:true,baseY:y,amp:a});
 for(const[x,y,w]of l.seesaws)s.push({x,y,w,h:16,slope:Math.sin(room.ticks/75+(room.variant||0)+x)*.2});
 
 if(l.crumbling && room.crumblingPlatforms) {
  l.crumbling.forEach((c, idx) => {
   const state = room.crumblingPlatforms[idx];
   if(state && !state.collapsed) {
    const shakeX = state.crumbling ? (Math.random() - 0.5) * 3 : 0;
    const shakeY = state.crumbling ? (Math.random() - 0.5) * 2 : 0;
    s.push({x: c[0] + shakeX, y: c[1] + shakeY, w: c[2], h: c[3], crumbling: state.crumbling});
   }
  });
 }
 return s;
}
function top(b,p){return b.y+(b.slope||0)*(p.x+PW/2-b.x-b.w/2);}
function isOnMountain(p, l) {
 const stop = (l.stops||[]).find(s => s.kind === 'steps');
 if(!stop) return false;
 return p.x >= stop.x + 140 && p.x <= stop.x + 640 && p.y > HARD.mountainPeakY && p.y < 570 - 30;
}
function tick(room){
 if(room.status!=='playing')return;
 const l=levels[room.level],ps=room.players;
 if(ps.length<2||ps.some(p=>!p.connected))return;
 room.ticks++;
 if(room.teamRespawn>0){
  room.teamRespawn--;
  ps.forEach(p=>p.dead=room.teamRespawn);
  if(!room.teamRespawn)spawn(room);
  return;
 }
 
 if(l.crumbling && room.crumblingPlatforms) {
  l.crumbling.forEach((c, idx) => {
   const state = room.crumblingPlatforms[idx];
   if(!state) return;
   
   const playerOnPlatform = ps.some(p => 
    p.dead <= 0 &&
    p.ground && 
    p.x + PW > c[0] && 
    p.x < c[0] + c[2] && 
    Math.abs(p.y + PH - c[1]) < 20
   );
   
   if(playerOnPlatform && !state.crumbling && !state.collapsed) {
    state.crumbling = true;
    state.timer = room.ticks;
   }
   
   if(state.crumbling && !state.collapsed) {
    const crumbleDuration = room.ticks - state.timer;
    if(crumbleDuration > HARD.maxPlatformTime) {
     state.collapsed = true;
     room.deaths++;
     room.runDeaths++;
     ps.forEach(p => {
      if(p.ground && p.x + PW > c[0] && p.x < c[0] + c[2] && Math.abs(p.y + PH - c[1]) < 20) {
       p.dead = 100;
      }
     });
    }
   }
  });
 }
 
 const solids=solidsFor(room);
 room.movingY=solids.find(b=>b.moving)?.y;
 const obs=obstacles(room);
 const anyGrounded=ps.some(p=>p.ground&&p.y<580);
 
 const calcStackHeight = (p, ps) => {
  let height = 0;
  for(const other of ps) {
   if(other === p || other.dead > 0) continue;
   if(Math.abs(other.y + PH - p.y) < 8 && other.x < p.x + PW && other.x + PW > p.x) {
    height += PH - 4;
   }
  }
  return height;
 };
 
 for(const p of [...ps].sort((a,b)=>b.y-a.y)){
  if(p.dead > 0) continue;
  const k = p.keys || {}, dir = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  
  const oldX = p.x;
  const oldY = p.y;
  
  p.invincible=Math.max(0,p.invincible-1);
  p.spin=Math.max(0,p.spin-1);
  p.tossCooldown=Math.max(0,p.tossCooldown-1);
  p.bumpCooldown=Math.max(0,(p.bumpCooldown||0)-1);
  
  p.stackHeight = calcStackHeight(p, ps);
  p.anchor = !!k.down && p.ground;
  p.onMountain = isOnMountain(p, l);
  
  const isMoving = Math.abs(p.vx) > 0.1 || Math.abs(p.kickX || 0) > 0.1 || k.left || k.right || !p.ground;
  if(p.ground && !isMoving) {
   p.standingTicks++;
  } else {
   p.standingTicks = 0;
  }
  
  // DEATH BY STANDING STILL
  if(p.standingTicks > HARD.standingDeathTicks && p.ground) {
   p.dead = 100;
   room.deaths++;
   room.runDeaths++;
   continue;
  }
  
  p.dangling=!p.ground&&p.y>528&&anyGrounded;
  if(p.dangling){
   p.y=Math.min(H+50,p.y);if(p.y>=H+50)p.vy=Math.min(0,p.vy);
   p.abyssTimer=(p.y>=620)?(p.abyssTimer||0)+1:0;
   if(p.abyssTimer>180){p.dead=HARD.respawnTimer;}
  }else{p.abyssTimer=0;}
  
  // XỬ LÝ RỌT CÁNH QUẠT ĐẦU TIÊN - trước khi di chuyển
  for(const b of obs.rotors){
   const collision = checkRotorBladeCollision(p.x, p.y, PW, PH, b.x, b.y, b.r, b.angle);
   if(collision.hit) {
    // Đẩy player ra ngoài ngay lập tức!
    const pushDist = 30;
    p.x = b.x + collision.pushX * (b.r + 35) - PW / 2;
    p.y = b.y + collision.pushY * (b.r + 35) - PH / 2;
    p.vx = collision.pushX * 5;
    p.vy = collision.pushY * 5 - 8; // Đẩy lên một chút
    p.spin = 45;
    p.standingTicks = 0;
    if(!p.bumpCooldown){p.bumpCooldown=15;room.bumps++;}
   }
  }
  
  for(const moving of solids.filter(b=>b.moving)){
   const prevY=moving.baseY+Math.sin((room.ticks-1)/80+moving.x)*moving.amp;
   if(p.ground&&Math.abs(p.y+PH-prevY)<4&&p.x+PW>moving.x&&p.x<moving.x+moving.w)p.y+=moving.y-prevY;
  }
  
  const icy=(l.iceZones||[]).some(([a,b])=>p.x>a&&p.x<b)&&p.y>480;
  if(dir)p.facing=dir;
  
  const mountainSlow = p.onMountain ? 0.6 : 1.0;
  p.vx=p.anchor?p.vx*0.15:(icy?p.vx*.93+dir*.3:p.vx*HARD.friction+dir*HARD.moveSpeed*mountainSlow);
  if(p.anchor)p.kickX=(p.kickX||0)*0.2;
  p.vx=Math.max(-5.5,Math.min(5.5,p.vx));
  p.kickX=(p.kickX||0)*.82;
  
  p.coyote=p.ground?4:Math.max(0,(p.coyote||0)-1);
  
  const jumpMod = p.onMountain ? 0.75 : (p.stackHeight > 0 ? 1.15 : 1.0);
  if(k.jump&&!p.jumpHeld&&(p.ground||p.coyote)&&!p.dangling){
   p.vy=p.dangling?-11:-Math.abs(HARD.jumpPower * jumpMod);
   p.ground=false;p.coyote=0;
   p.standingTicks = 0;
   if(p.dangling)p.kickX=(p.kickX||0)*1.2+p.facing*3;
  }
  p.jumpHeld=!!k.jump;
  if(p.dangling&&dir)p.kickX=Math.max(-12,Math.min(12,(p.kickX||0)+dir*1.8));
  
  if(p.onMountain && p.y < 570 - 120) {
   const windStrength = HARD.mountainWindForce * (1 - (p.y - HARD.mountainPeakY) / (570 - HARD.mountainPeakY - 120));
   p.kickX += Math.sin(room.ticks / 25) * windStrength;
   p.vy -= windStrength * 0.4;
  }
  
  if(k.toss&&!p.tossHeld&&!p.tossCooldown){
   const q=ps.filter(q=>q!==p&&q.dead<=0&&Math.hypot(q.x-p.x,q.y-p.y)<85).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
   if(q){
    q.kickX=p.facing*13;
    q.vy=-15;
    q.ground=false;
    q.spin=55;
    p.kickX=-p.facing*4;
    p.tossCooldown=65;
    room.pranks++;
    p.standingTicks = 0;
   }
  }
  p.tossHeld=!!k.toss;
  
  for(const[x,y,w,direction]of l.fans||[]){
   if(p.x+PW>x&&p.x<x+w&&p.y+PH>y&&p.y<570){
    p.kickX=Math.max(-10,Math.min(10,p.kickX+direction*1.8));
    if(p.y>y)p.vy-=1.2;
    p.standingTicks = 0;
   }
  }
  for(const[a,b]of l.conveyors){
   if(p.ground&&p.x+PW>a&&p.x<b)p.kickX=Math.max(-8,Math.min(8,p.kickX+Math.sin(room.ticks/110)*3.5));
  }
  
  // XỬ LÝ CHỒNG NGƯỜI - kiểm tra trước khi di chuyển ngang
  for(const q of ps){
   if(q===p||q.dead>0||(room.key&&p.x>l.door[0]-120&&q.x>l.door[0]-120))continue;
   // Chặn nhảy xuyên qua đầu người khác
   if(checkPlayerStackingCollision(p, q, oldY)) {
    // Đẩy player lên trên đầu người khác
    p.y = q.y - PH;
    p.vy = 0;
    p.ground = true;
    p.standingTicks = 0;
    continue;
   }
   // Va chạm ngang với người khác
   if(Math.abs(p.y+PH-q.y)<=4&&p.x+PW>q.x+3&&p.x<q.x+PW-3){
    p.x+=(q.vx+(q.kickX||0));
   }
  }
  
  const dx=p.vx+p.kickX;
  p.x=Math.max(8,Math.min(l.width-PW-8,p.x+dx));
  for(const b of solids){
   if(b.slope)continue;
   if(overlap({x:p.x,y:p.y,w:PW,h:PH},b)&&(oldX+PW<=b.x+1||oldX>=b.x+b.w-1)){
    p.x=dx>0?b.x-PW:b.x+b.w;
    p.kickX=-p.kickX*.1;
    p.vx=0;
   }
  }
  
  for(const q of ps){
   if(q===p||q.dead>0||(room.key&&p.x>l.door[0]-120&&q.x>l.door[0]-120))continue;
   if(p.y+PH<=q.y+2||q.y+PH<=p.y+2)continue;
   if(overlap({x:p.x,y:p.y,w:PW,h:PH},{x:q.x,y:q.y,w:PW,h:PH})){
    if((dx>0&&oldX<q.x)||(dx<0&&oldX>q.x))p.x=oldX;
    if(Math.abs(dx)>2)q.kickX=Math.max(-8,Math.min(8,(q.kickX||0)+Math.sign(dx)*.9));
   }
  }
  
  p.vy=Math.min(HARD.maxFallSpeed,p.vy+HARD.gravity);
  p.y+=p.vy;p.ground=false;
  
  // XỬ LÝ RỌT CÁNH QUẠT LẦN 2 - sau khi rơi
  for(const b of obs.rotors){
   const collision = checkRotorBladeCollision(p.x, p.y, PW, PH, b.x, b.y, b.r, b.angle);
   if(collision.hit) {
    p.x = b.x + collision.pushX * (b.r + 35) - PW / 2;
    p.y = b.y + collision.pushY * (b.r + 35) - PH / 2;
    p.vx = collision.pushX * 5;
    p.vy = collision.pushY * 5 - 8;
    p.spin = 45;
    p.standingTicks = 0;
    if(!p.bumpCooldown){p.bumpCooldown=15;room.bumps++;}
   }
  }
  
  for(const b of solids){
   if(p.x+PW<=b.x||p.x>=b.x+b.w)continue;
   const y=top(b,p);
   if(p.vy>=0&&oldY+PH<=y+8&&p.y+PH>=y){p.y=y-PH;p.vy=0;p.ground=true;p.standingTicks = 0;}
   else if(!b.slope&&p.vy<0&&oldY>=b.y+b.h&&p.y<b.y+b.h){p.y=b.y+b.h;p.vy=0;}
  }
  
  for(const q of ps){
   if(q===p||q.dead>0||(room.key&&p.x>l.door[0]-120&&q.x>l.door[0]-120))continue;
   if(p.x+PW>q.x+3&&p.x<q.x+PW-3){
    if(p.vy>=0&&oldY+PH<=q.y+8&&p.y+PH>=q.y){p.y=q.y-PH;p.vy=0;p.ground=true;p.standingTicks = 0;}
    else if(q.vy<0&&Math.abs(oldY+PH-q.y)<=16){p.y=q.y-PH;p.vy=q.vy;p.ground=true;}
   }
  }
  
  for(const[x,y,w]of l.springs||[]){
   if(p.ground&&p.x+PW>x&&p.x<x+w&&Math.abs(p.y+PH-y)<5){p.vy=HARD.springPower;p.ground=false;p.spin=30;p.standingTicks = 0;}
  }
  for(const b of obs.pumpkins){
   if(overlap({x:p.x,y:p.y,w:PW,h:PH},b)){
    const fromLeft=(p.x+PW/2)<=(b.x+b.w/2);
    if(fromLeft){
     p.x=Math.max(8,b.x-PW-6);
     p.vx=Math.min(-5,p.vx);
     p.kickX=HARD.pumpkinBounce;
    }else{
     p.x=Math.min(l.width-PW-8,b.x+b.w+6);
     p.vx=Math.max(5,p.vx);
     p.kickX=-HARD.pumpkinBounce;
    }
    p.vy=HARD.pumpkinBounce;
    p.spin=38;
    p.standingTicks = 0;
    if(!p.bumpCooldown){p.bumpCooldown=10;room.bumps++;}
   }
  }
  
  // XỬ LÝ RỌT CÁNH QUẠT LẦN 3 - sau khi đáp đất
  for(const b of obs.rotors){
   const collision = checkRotorBladeCollision(p.x, p.y, PW, PH, b.x, b.y, b.r, b.angle);
   if(collision.hit) {
    p.x = b.x + collision.pushX * (b.r + 35) - PW / 2;
    p.y = b.y + collision.pushY * (b.r + 35) - PH / 2;
    p.vx = collision.pushX * 5;
    p.vy = collision.pushY * 5 - 8;
    p.spin = 45;
    p.standingTicks = 0;
    if(!p.bumpCooldown){p.bumpCooldown=15;room.bumps++;}
   }
  }
  
  if(!room.key&&Math.hypot(p.x+15-l.key[0],p.y+22-l.key[1])<80)room.key=true;
 }
 
 for(const q of ps){
  if(!q.ground||q.y>=580){q.hauling=false;continue;}
  const danglingList=ps.filter(o=>o.dangling&&o.dead<=0);
  if(danglingList.length>0){
   const avgX=danglingList.reduce((s,o)=>s+o.x,0)/danglingList.length;
   const pullDir=Math.sign(avgX-q.x);
   q.kickX=Math.max(-6,Math.min(6,(q.kickX||0)+pullDir*0.5));
   const pullingAway=(q.keys?.left&&pullDir>0)||(q.keys?.right&&pullDir<0)||q.keys?.jump;
   q.hauling=!!pullingAway;
   if(q.hauling){
    q.kickX*=0.45;
    danglingList.forEach(o=>{o.vy=Math.min(o.vy,-10);o.y=Math.max(520,o.y-4.5);});
   }
  }else{q.hauling=false;}
 }
 constrainRopes(room,solids.filter(b=>!b.slope));
 
 if(ps.every(p=>p.dead>0||p.y>H+20)){
  room.teamRespawn=HARD.respawnTimer;room.deaths++;room.runDeaths++;
  ps.forEach(p=>{p.dead=HARD.respawnTimer;p.keys={};p.kickX=0;p.vx=0;p.vy=0;p.dangling=false;p.hauling=false;p.stackHeight=0;p.standingTicks=0;});
  return;
 }
 for(const x of l.checkpoints){if(x>room.checkpoint&&ps.every(p=>p.dead<=0&&p.x>=x&&p.y<580)){room.checkpoint=x;room.checkpointsPassed++;}}
 ps.forEach(p=>p.ready=room.key&&p.x>l.door[0]-95&&p.y+PH>l.door[1]-15&&p.dead<=0);
 if(room.key&&ps.every(p=>p.ready)){room.status='won';room.elapsed=room.ticks/60;}
}
function constrainRopes(room,solids){
 const ps=room.players.filter(p=>p.dead<=0),rest=HARD.ropeLength||140,max=HARD.ropeMax||220;
 function move(p,dx,dy){
  const oldY=p.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3));
  for(let i=0;i<steps;i++){
   const x=Math.max(8,Math.min(worldWidth(room)-PW-8,p.x+dx/steps));
   if(!solids.some(b=>overlap({x,y:p.y,w:PW,h:PH},b)))p.x=x;
   const y=p.y+dy/steps;
   if(!solids.some(b=>overlap({x:p.x,y,w:PW,h:PH},b)))p.y=y;
  }
  if(p.y<oldY-.1){p.ground=false;p.vy=Math.min(p.vy,-2);}
 }
 for(let i=0;i<ps.length-1;i++){
  const a=ps[i],b=ps[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d<=rest||a.dead>0||b.dead>0)continue;
  const f=Math.min(2.5,(d-rest)*.04),nx=dx/d,ny=dy/d;
  if(b.dangling&&a.ground){b.vy=Math.min(b.vy,-ny*f*2.7);b.kickX=Math.max(-10,Math.min(10,(b.kickX||0)-nx*f*1.8));a.kickX=a.anchor?Math.max(-2,Math.min(2,(a.kickX||0)+nx*f*0.1)):Math.max(-9,Math.min(9,(a.kickX||0)+nx*f*0.6));if(a.anchor)a.ground=true;if(a.hauling){b.vy=Math.min(b.vy,-11);b.y-=4.5;b.y=Math.min(H+10,b.y);}}
  else if(a.dangling&&b.ground){a.vy=Math.min(a.vy,ny*f*2.7);a.kickX=Math.max(-10,Math.min(10,(a.kickX||0)+nx*f*1.8));b.kickX=b.anchor?Math.max(-2,Math.min(2,(b.kickX||0)-nx*f*0.1)):Math.max(-9,Math.min(9,(b.kickX||0)-nx*f*0.6));if(b.anchor)b.ground=true;if(b.hauling){a.vy=Math.min(a.vy,-11);a.y-=4.5;a.y=Math.min(H+10,a.y);}}
  else{a.kickX=Math.max(-11,Math.min(11,(a.kickX||0)+nx*f));b.kickX=Math.max(-11,Math.min(11,(b.kickX||0)-nx*f));if(ny<-.15){a.vy=Math.max(-15,a.vy+ny*f);a.ground=false;}if(ny>.15){b.vy=Math.max(-15,b.vy-ny*f);b.ground=false;}}
 }
 for(let it=0;it<10;it++)
  for(let i=0;i<ps.length-1;i++){
   const a=ps[i],b=ps[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
   if(d<=max)continue;
   const nx=dx/d,ny=dy/d,e=d-max,ax=a.x,ay=a.y;
   const aRatio=a.ground?0.15:0.5;
   const bRatio=1-aRatio;
   move(a,nx*e*aRatio,ny*e*aRatio);
   const moved=(a.x-ax)*nx+(a.y-ay)*ny;
   move(b,-nx*(e-moved),-ny*(e-moved));
  }
}
function scoring(r){
 const won=r.status==='won',seconds=(r.ticks||0)/60;
 const checkpoints=(r.checkpointsPassed||0)*200,sock=r.key?500:0,finish=won?1000:0;
 const speed=won?Math.max(0,1000-Math.floor(seconds*3)):0,care=won?Math.max(0,600-(r.runDeaths||0)*50):0;
 const total=checkpoints+sock+finish+speed+care;
 return {checkpoints,sock,finish,speed,care,total,stars:won?(total>=5000?3:total>=4200?2:1):0};
}
function snapshot(r){
 return {
  code:r.code,status:r.status,score:scoring(r),runDeaths:r.runDeaths||0,seconds:(r.ticks||0)/60,
  spectatorCount:(r.spectators||[]).filter(p=>p.connected).length,level:r.level,key:r.key,gateOpen:true,
  ropeLength:r.ropeLength||HARD.ropeLength,ropeMax:r.ropeMax||HARD.ropeMax,
  teamRespawn:r.teamRespawn||0,checkpoint:r.checkpoint||80,variant:r.variant||0,
  pranks:r.pranks||0,bumps:r.bumps||0,movingY:r.movingY,deaths:r.deaths||0,ticks:r.ticks||0,elapsed:r.elapsed,
  obstacles:obstacles(r),
  crumblingPlatforms: r.crumblingPlatforms,
  players:r.players.map(({id,name,x,y,vx,vy,dead,ready,connected,house,spin,facing,invincible,dangling,hauling,stackHeight,onMountain,standingTicks,anchor})=>({id,name,x,y,vx,vy,dead,ready,connected,house,spin,facing,invincible,dangling:!!dangling,hauling:!!hauling,stackHeight,onMountain,standingTicks,anchor:!!anchor})),
  host:r.host
 };
}
const api={W,H,PW,PH,levels,init,tick,snapshot,constrainRopes,obstacles,solidsFor,scoring,HARD,checkRotorBladeCollision,pointToSegmentDistance,checkPlayerStackingCollision};
if(typeof module!=='undefined')module.exports=api;else window.ElfEngine=api;
})();
