(() => {
const W = 1200, H = 660, PW = 30, PH = 44;
const floor = [[0, 570, 1200, 90]];

const HARD = {
  gravity: 0.85,
  jumpPower: -10.5,
  springPower: -13.5,
  maxFallSpeed: 14,
  moveSpeed: 1.3,
  friction: 0.52,
  ropeLength: 140,
  ropeMax: 220,
  abyssGap: 550,
  checkpointSpacing: 180,
  respawnTimer: 65,
  obstacleSpeed: 1.6,
  pumpkinBounce: -11,
  rotorKnockback: -11.5,
  maxPlatformTime: 75,
  standingDeathTicks: 100,
  minPlatformWidth: 40,
  mountainPeakY: 270,
  mountainWindForce: 1.2
};

const levels = [
  {map:'common-room', name:'Phòng sinh hoạt chung', hint:'VỰC CỰC RỘNG!', platforms:[...floor,[350,510,80,18],[670,495,70,18]], key:[870,515], door:[1100,498], spikes:[], pumpkins:[[630,515,110]]},
  {map:'great-hall', name:'Đại Sảnh Đường', hint:'SÀN RUNG!', platforms:[...floor,[530,500,100,18]], key:[920,505], door:[1100,498], spikes:[], ice:[200,1050], pumpkins:[[680,520,130]]},
  {map:'charms', name:'Lớp học Bùa chú', hint:'NÚI CAO NHẤT!', platforms:[...floor,[420,490,80,18],[780,450,130,18]], key:[865,418], door:[1100,498], spikes:[], springs:[[360,570,90],[695,570,100]]},
  {map:'greenhouse', name:'Nhà kính Thảo dược', hint:'QUẠT THỔI!', platforms:[...floor,[540,505,75,18]], key:[905,495], door:[1100,498], spikes:[], fans:[[340,425,200,1.4],[680,415,170,1.4]], pumpkins:[[840,525,60]]},
  {map:'stairs', name:'Cầu thang Hogwarts', hint:'NÚI THAY THANG!', platforms:[...floor,[285,495,75,18],[690,510,55,18]], key:[915,500], door:[1100,498], spikes:[], seesaw:[420,490,290], moving:[800,500,100,18,42]},
  {map:'kitchen', name:'Nhà bếp gia tinh', hint:'NHIỀU BÍ NGÔ!', platforms:[...floor,[420,505,90,18]], key:[930,505], door:[1100,498], spikes:[], pumpkins:[[450,515,140],[780,520,130],[980,525,65]], ice:[350,1040]},
  {map:'chamber', name:'Phòng Chứa Bí Mật', hint:'CÁNH CỬA QUAY!', platforms:[...floor,[285,500,75,18],[750,500,60,18]], key:[945,505], door:[1100,498], spikes:[], rotors:[[580,475,80],[870,475,72]], springs:[[420,570,85]]},
  {map:'courtyard', name:'Sân lâu đài Hogwarts', hint:'TẤT CẢ OBSTACLES!', platforms:[[0,570,480,90],[650,570,550,90]], key:[925,485], door:[1100,498], spikes:[], springs:[[430,570,90],[730,570,85]], fans:[[650,410,150,1.4]], pumpkins:[[900,525,85]], ice:[680,1070]}
];

const routes = [
  ['steps','pumpkin','gap','bounce','wind','bridge','ice','rotor','conveyor','bouncegap','bowling','finale'],
  ['ice','bowling','steps','gap','icewind','bridge','bounce','conveyor','rotor','wind','bouncegap','finale'],
  ['bounce','steps','wind','gap','rotor','ice','bridge','bouncegap','bowling','conveyor','icewind','finale'],
  ['wind','pumpkin','gap','steps','icewind','bridge','bouncegap','rotor','conveyor','pumpkin','bowling','finale'],
  ['wall','bridge','gap','rotor','conveyor','bouncegap','wind','ice','bounce','pumpkin','icewind','finale'],
  ['bowling','ice','gap','steps','pumpkin','wind','bridge','rotor','bouncegap','conveyor','icewind','finale'],
  ['rotor','wall','gap','bridge','bowling','ice','bouncegap','wind','conveyor','pumpkin','icewind','finale'],
  ['gap','wind','ice','steps','bowling','bridge','bouncegap','rotor','conveyor','bounce','icewind','finale']
];

const stopNames = {steps:'NÚI KHỔNG LỒ!', wall:'VÁCH TƯỜNG CAO · CẦN 3 NGƯỜI CHỒNG THÁP!', pumpkin:'Bí ngô thích ôm', gap:'Kéo bạn qua vực', bounce:'Cả hội thành tên lửa', wind:'Tai dài bắt gió', bridge:'Cầu nghiêng', bowling:'Gia tinh bowling', ice:'Ai bôi bơ lên sàn?', icewind:'Trượt rồi bay luôn', rotor:'Cửa xoay KHÔNG XUYÊN!', bouncegap:'Boing qua vực', conveyor:'Băng chuyền đổi chiều', finale:'Vớ ở cuối đường!'};

const chapterNames = [
  ['Đỉnh núi chót vót','Bí ngô giành ghế','Thảm bị thủng!','Ghế sofa BOING','Ống khói hắt hơi','Cầu bàn trà nghiêng','Bơ đổ trên thảm','Cánh quạt trần quay','Băng chuyền dọn dẹp','Vực sâu sàn gỗ','Bí ngô đánh bowling','Vớ sau lò sưởi'],
  ['Bơ đổ trên sàn','Bữa tiệc bí ngô','Leo núi đá','Sàn thiếu một miếng','Khăn bàn hóa diều','Bàn tiệc bập bênh','Đệm bánh pudding','Băng chuyền đĩa thức ăn','Cánh quạt trần quay','Gió lốc trần sảnh','Hào nước cống ngầm','Vớ tráng miệng'],
  ['Bùa bật tung người','Đỉnh núi chót vót','Leviosa thổi tai','Sàn tàng hình','Đũa phép quay cuồng','Sàn bơ Wingardium','Bàn học bập bênh','Phóng qua hố mực','Cánh quạt trần quay','Băng chuyền cuộn giấy','Gió lốc bùa chú','Vớ biết bay'],
  ['Cây quạt hắt hơi','Bí ngô cần ôm','Mương tưới cây','Đỉnh núi chót vót','Sương trơn bắt gió','Cầu gỗ tưới nước','Nấm phóng qua mương','Cánh quạt thông gió','Băng rêu trôi ngược','Nấm nổ tung người','Thu hoạch bowling','Vớ giữa luống cây'],
  ['Bậc thang chồng vai','Cầu thang lắc lư','Núi cao chót vót','Lan can xoay tròn','Thang cuốn trái tính','Cầu thang bật tung','Gió lùa hành lang','Sàn đá trơn trượt','Đệm lò xo cứu nguy','Bí ngô ngáng bậc','Cầu thang bão tuyết','Vớ trên tầng cuối'],
  ['Bí ngô trốn nồi','Bơ không có phanh','Ống thoát nước hở','Đỉnh núi chót vót','Bí ngô đuổi đầu bếp','Máy hút mùi quá mạnh','Cầu thớt bập bênh','Cánh quạt trộn bột','Lò nướng bật tưng','Băng chuyền rửa chén','Bơ trượt gặp bão','Vớ khỏi dây phơi'],
  ['Đuôi rắn quay vòng','Tượng đá xếp tầng','Mương nước bí mật','Đỉnh núi chót vót','Cánh quạt trần quay','Rêu trơn bóng đêm','Bật qua cống sâu','Luồng khí lạnh rít','Nền đá chạy ngược','Bẫy đá dội ngược','Cống ngầm gió tuyết','Vớ sau cửa rắn'],
  ['Cống sân lâu đài','Gió giật tai dài','Sân phủ sương trơn','Đỉnh núi chót vót','Bí ngô đá bóng','Cầu gỗ chòng chành','Hào sâu trắc trở','Cánh quạt trần quay','Băng chuyền lát đá','Đệm hoa chuông BOING','Bão tuyết sân thượng','Vớ dưới ánh trăng']
];

levels.forEach((lv, idx) => {
  const stride = 1700 + idx * 40;
  lv.width = 180 + stride * 12 + 520;
  lv.platforms = [];
  lv.pumpkins = [];
  lv.rotors = [];
  lv.fans = [];
  lv.springs = [];
  lv.iceZones = [];
  lv.seesaws = [];
  lv.movers = [];
  lv.checkpoints = [];
  lv.stops = [];
  lv.conveyors = [];
  lv.crumbling = [];

  let floorStart = 0;
  const gap = (a, b) => {
    lv.platforms.push([floorStart, 570, a - floorStart, 90]);
    floorStart = b;
  };

  routes[idx].forEach((kind, i) => {
    const x = 180 + i * stride;
    lv.stops.push({x, label: chapterNames[idx][i], kind, instruction: stopNames[kind]});
    if (i) lv.checkpoints.push(x - HARD.checkpointSpacing);

    if (kind === 'steps') {
      const mx = x + 160, baseY = 570, peakY = HARD.mountainPeakY, numSteps = 14, stepH = (baseY - peakY) / numSteps;
      for (let m = 0; m < numSteps; m++) {
        const y = baseY - (m + 1) * stepH;
        const w = Math.max(32, 80 - m * 4);
        const ox = m * 18;
        lv.platforms.push([mx + ox, y, w, 18]);
      }
      lv.platforms.push([mx + numSteps * 18, peakY, 38, 18]);
      lv.fans.push([mx + 80, peakY + 60, 250, 1.5]);
      const ax = mx + numSteps * 18 + 80;
      if (!lv.mountains) lv.mountains = [];
      lv.mountains.push([mx - 40, ax + 40]);
      gap(ax + 40, ax + 650);
      const cs = ax + 650 + 60;
      for (let c = 0; c < 5; c++) lv.crumbling.push([cs + c * 130, 520 - c * 25, 50, 18]);
      lv.platforms.push([cs + 650, 400, 55, 18], [cs + 750, 350, 55, 18], [cs + 870, 400, 55, 18], [cs + 990, 450, 55, 18]);
    }

    if (kind === 'wall') {
      // 3-Player Human Tower Bastion Wall (Height 140px, top at y=430)
      const wall1X = x + 360, wall1Y = 430, wall1W = 55, wall1H = 140;
      lv.platforms.push([wall1X, wall1Y, wall1W, wall1H]);
      lv.platforms.push([wall1X + wall1W + 40, 485, 55, 18]);

      // Massive abyss gap right after the wall (580px wide)
      gap(x + 580, x + 1160);
      // Floating stepping stones across the abyss
      lv.platforms.push([x + 660, 520, 45, 18], [x + 790, 460, 45, 18], [x + 920, 520, 45, 18]);

      // Wall 2: Second Bastion Wall before the checkpoint
      const wall2X = x + 1280, wall2Y = 430, wall2W = 55, wall2H = 140;
      lv.platforms.push([wall2X, wall2Y, wall2W, wall2H]);
      lv.platforms.push([wall2X + wall2W + 40, 485, 55, 18]);

      if (!lv.walls) lv.walls = [];
      lv.walls.push({ x: wall1X, y: wall1Y, w: wall1W, h: wall1H });
      lv.walls.push({ x: wall2X, y: wall2Y, w: wall2W, h: wall2H });
    }

    if (kind === 'pumpkin' || kind === 'bowling') {
      lv.pumpkins.push([x + 300, 526, 95], [x + 600, 526, 85], [x + 1150, 526, 100], [x + 1450, 526, 90]);
      if (kind === 'bowling') lv.pumpkins.push([x + 430, 526, 70], [x + 1300, 526, 70], [x + 1600, 526, 80]);
      gap(x + 680, x + 1280);
      lv.platforms.push([x + 350, 455, 50, 18], [x + 480, 455, 50, 18], [x + 780, 520, 45, 18], [x + 920, 520, 45, 18], [x + 1150, 440, 50, 18], [x + 1500, 400, 50, 18]);
    }

    if (kind === 'gap' || kind === 'bouncegap') {
      gap(x + 320, x + 900);
      lv.platforms.push([x + 400, 520, 40, 18], [x + 530, 520, 40, 18], [x + 680, 380, 45, 18], [x + 900, 430, 45, 18]);
      gap(x + 1030, x + 1620);
      lv.platforms.push([x + 1110, 520, 40, 18], [x + 1240, 520, 40, 18], [x + 1340, 420, 45, 18], [x + 1560, 380, 45, 18]);
      if (kind === 'bouncegap') lv.springs.push([x + 220, 570, 75], [x + 950, 570, 75]);
    }

    if (kind === 'bounce') {
      lv.springs.push([x + 170, 570, 70], [x + 380, 570, 70], [x + 600, 570, 70], [x + 820, 570, 70], [x + 1050, 570, 70], [x + 1280, 570, 70], [x + 1460, 570, 70]);
      gap(x + 280, x + 860);
      lv.platforms.push([x + 350, 520, 40, 18], [x + 480, 520, 40, 18], [x + 660, 330, 45, 18], [x + 1130, 340, 50, 18], [x + 1540, 350, 50, 18]);
    }

    if (kind === 'wind' || kind === 'icewind') {
      lv.fans.push([x + 180, 400, 250, 1.6], [x + 600, 400, 250, 1.6], [x + 1030, 400, 250, 1.6]);
      gap(x + 280, x + 860);
      lv.platforms.push([x + 365, 520, 40, 18], [x + 500, 520, 40, 18], [x + 780, 400, 45, 18], [x + 1220, 450, 45, 18], [x + 1620, 410, 45, 18]);
    }

    if (kind === 'ice' || kind === 'icewind') {
      lv.iceZones.push([x + 130, x + 620], [x + 960, x + 1520]);
      lv.pumpkins.push([x + 430, 526, 85], [x + 1350, 526, 85]);
      gap(x + 600, x + 1200);
      lv.platforms.push([x + 685, 520, 45, 18], [x + 815, 520, 45, 18], [x + 500, 430, 50, 18], [x + 1400, 420, 50, 18]);
    }

    if (kind === 'bridge') {
      gap(x + 180, x + 780);
      lv.seesaws.push([x + 170, 540, 460]);
      lv.movers.push([x + 720, 450, 85, 18, 52]);
      gap(x + 920, x + 1620);
      lv.seesaws.push([x + 910, 540, 460]);
      lv.movers.push([x + 1460, 440, 85, 18, 52]);
    }

    if (kind === 'rotor') {
      lv.rotors.push([x + 260, 465, 85], [x + 1120, 465, 85]);
      gap(x + 300, x + 880);
      lv.platforms.push([x + 385, 520, 40, 18], [x + 520, 520, 40, 18], [x + 760, 410, 45, 18], [x + 1200, 450, 45, 18], [x + 1600, 410, 45, 18]);
    }

    if (kind === 'conveyor') {
      lv.conveyors.push([x + 120, x + 520], [x + 860, x + 1420]);
      gap(x + 500, x + 1100);
      lv.platforms.push([x + 585, 520, 45, 18], [x + 720, 520, 45, 18], [x + 380, 450, 50, 18], [x + 840, 500, 55, 55], [x + 1280, 430, 50, 18]);
    }

    if (kind === 'finale') {
      lv.springs.push([x + 140, 570, 70], [x + 600, 570, 70], [x + 1030, 570, 70]);
      lv.pumpkins.push([x + 400, 526, 85], [x + 1300, 526, 85]);
      lv.rotors.push([x + 630, 455, 85], [x + 1530, 455, 85]);
      lv.iceZones.push([x + 230, x + 620]);
      gap(x + 600, x + 1220);
      lv.platforms.push([x + 685, 520, 45, 18], [x + 815, 520, 45, 18], [x + 460, 420, 50, 18], [x + 1360, 400, 50, 18]);
    }
  });

  lv.platforms.push([floorStart, 570, lv.width - floorStart, 90]);
  lv.key = [lv.width - 330, 515];
  lv.door = [lv.width - 115, 498];
  lv.hint = 'VỰC CỰC RỘNG! ĐỨNG YÊN = CHẾT!';
});

function worldWidth(room) { return levels[room.level].width; }

function spawn(room) {
  const base = Math.max(15, (room.checkpoint || 80) - Math.max(0, room.players.length - 4) * 35);
  room.players.forEach((p, i) => Object.assign(p, {
    x: base + i * 35, y: 526, vx: 0, vy: 0, kickX: 0, ground: false, dead: 0,
    keys: {}, jumpHeld: false, tossHeld: false, tossCooldown: 0, ready: false,
    spin: 0, invincible: 100, facing: 1, coyote: 0, dangling: false, hauling: false,
    bumpCooldown: 0, stackHeight: 0, onMountain: false, standingTicks: 0, lastY: 526
  }));
}

function init(room) {
  room.checkpoint = 80;
  room.checkpointsPassed = 0;
  room.runDeaths = 0;
  room.elapsed = undefined;
  spawn(room);
  room.key = false;
  room.gateOpen = true;
  room.teamRespawn = 0;
  room.ropeLength = HARD.ropeLength;
  room.ropeMax = HARD.ropeMax;
  room.status = 'playing';
  room.ticks = 0;
  room.movingY = undefined;
  room.deaths = room.deaths || 0;
  room.pranks = 0;
  room.bumps = 0;
  room.variant = Math.floor(Math.random() * 3);
  room.started = Date.now();
  room.crumblingPlatforms = {};
  const lv = levels[room.level];
  if (lv.crumbling) {
    lv.crumbling.forEach((c, idx) => {
      room.crumblingPlatforms[idx] = { crumbling: false, collapsed: false, timer: 0 };
    });
  }
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function checkRotorCollision(px, py, pw, ph, rx, ry, rr, ra) {
  const pcx = px + pw / 2;
  const pcy = py + ph / 2;
  for (let i = 0; i < 4; i++) {
    const ba = ra + i * Math.PI / 2;
    const ex = rx + Math.cos(ba) * rr;
    const ey = ry + Math.sin(ba) * rr;
    const dx = ex - rx;
    const dy = ey - ry;
    const ls = dx * dx + dy * dy;
    if (ls === 0) continue;
    let t = ((pcx - rx) * dx + (pcy - ry) * dy) / ls;
    t = Math.max(0, Math.min(1, t));
    const nx = rx + t * dx;
    const ny = ry + t * dy;
    const dist = Math.sqrt((pcx - nx) * (pcx - nx) + (pcy - ny) * (pcy - ny));
    if (dist < 30) {
      const ddx = pcx - rx;
      const ddy = pcy - ry;
      const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
      return { hit: true, pushX: ddx / d, pushY: ddy / d, fromLeft: pcx < rx };
    }
  }
  return { hit: false };
}

function obstacles(room) {
  const lv = levels[room.level];
  const t = room.ticks || 0;
  const v = room.variant || 0;
  return {
    pumpkins: (lv.pumpkins || []).map(([x, y, amp], i) => ({
      x: x + Math.sin(t / (55 + i * 8) + v) * amp,
      y: y + Math.sin(t / 12 + i) * 3,
      w: 40, h: 40, phase: t / 10 + i
    })),
    rotors: (lv.rotors || []).map(([x, y, r], i) => ({ x, y, r, angle: t / (35 + i * 7) + v })),
    slope: lv.seesaw ? Math.sin(t / 75 + v) * 0.4 : 0
  };
}

function solidsFor(room) {
  const lv = levels[room.level];
  const s = lv.platforms.map(([x, y, w, h]) => ({ x, y, w, h }));
  for (const [x, y, w, h, a] of lv.movers) {
    s.push({ x, y: y + Math.sin(room.ticks / 80 + x) * a, w, h, moving: true, baseY: y, amp: a });
  }
  for (const [x, y, w] of lv.seesaws) {
    s.push({ x, y, w, h: 16, slope: Math.sin(room.ticks / 75 + (room.variant || 0) + x) * 0.2 });
  }
  if (lv.walls && room && room.players && room.players.length < 3) {
    for (const w of lv.walls) {
      s.push({ x: w.x - 70, y: 505, w: 45, h: 65, helper: true });
    }
  }
  if (lv.crumbling && room.crumblingPlatforms) {
    lv.crumbling.forEach((c, idx) => {
      const st = room.crumblingPlatforms[idx];
      if (st && !st.collapsed) {
        const sx = st.crumbling ? (Math.random() - 0.5) * 3 : 0;
        const sy = st.crumbling ? (Math.random() - 0.5) * 2 : 0;
        s.push({ x: c[0] + sx, y: c[1] + sy, w: c[2], h: c[3], crumbling: st.crumbling });
      }
    });
  }
  return s;
}

function top(b, p) {
  return b.y + (b.slope || 0) * (p.x + PW / 2 - b.x - b.w / 2);
}

function isOnMountain(p, lv) {
  if (!lv || !lv.mountains) return false;
  return lv.mountains.some(([x1, x2]) => p.x >= x1 && p.x <= x2) && p.y > HARD.mountainPeakY && p.y < 570 - 50;
}

function tick(room) {
  if (room.status !== 'playing') return;
  const lv = levels[room.level];
  const ps = room.players;
  if (ps.length < 2 || ps.some(p => !p.connected)) return;

  room.ticks++;

  if (room.teamRespawn > 0) {
    room.teamRespawn--;
    ps.forEach(p => p.dead = room.teamRespawn);
    if (!room.teamRespawn) spawn(room);
    return;
  }

  if (lv.crumbling && room.crumblingPlatforms) {
    lv.crumbling.forEach((c, idx) => {
      const st = room.crumblingPlatforms[idx];
      if (!st) return;
      const onPl = ps.some(p => p.dead <= 0 && p.ground && p.x + PW > c[0] && p.x < c[0] + c[2] && Math.abs(p.y + PH - c[1]) < 20);
      if (onPl && !st.crumbling && !st.collapsed) {
        st.crumbling = true;
        st.timer = room.ticks;
      }
      if (st.crumbling && !st.collapsed && room.ticks - st.timer > HARD.maxPlatformTime) {
        st.collapsed = true;
        room.deaths++;
        room.runDeaths++;
        ps.forEach(p => {
          if (p.ground && p.x + PW > c[0] && p.x < c[0] + c[2] && Math.abs(p.y + PH - c[1]) < 20) {
            p.dead = 100;
          }
        });
      }
    });
  }

  const solids = solidsFor(room);
  room.movingY = solids.find(b => b.moving)?.y;
  const obs = obstacles(room);
  const anyGrounded = ps.some(p => p.ground && p.y < 580);

  for (const p of [...ps].sort((a, b) => b.y - a.y)) {
    if (p.dead > 0) continue;

    const oldX = p.x;
    const oldY = p.y;

    p.invincible = Math.max(0, p.invincible - 1);
    p.spin = Math.max(0, p.spin - 1);
    p.tossCooldown = Math.max(0, p.tossCooldown - 1);
    p.bumpCooldown = Math.max(0, (p.bumpCooldown || 0) - 1);

    p.onMountain = isOnMountain(p, lv);

    if (p.ground && Math.abs(p.y - (p.lastY || p.y)) < 0.1) {
      p.standingTicks++;
    } else {
      p.standingTicks = 0;
    }
    p.lastY = p.y;

    if (p.standingTicks > HARD.standingDeathTicks && p.ground) {
      p.dead = 100;
      room.deaths++;
      room.runDeaths++;
      continue;
    }

    p.dangling = !p.ground && p.y > 545 && anyGrounded;
    if (p.dangling) {
      p.y = Math.min(H + 50, p.y);
      if (p.y >= H + 50) p.vy = Math.min(0, p.vy);
    }

    for (const b of obs.rotors) {
      const c = checkRotorCollision(p.x, p.y, PW, PH, b.x, b.y, b.r, b.angle);
      if (c.hit) {
        p.x = b.x + c.pushX * (b.r + 35) - PW / 2;
        p.y = b.y + c.pushY * (b.r + 35) - PH / 2;
        p.vx = c.pushX * 5;
        p.vy = c.pushY * 5 - 8;
        p.spin = 45;
        p.standingTicks = 0;
        if (!p.bumpCooldown) {
          p.bumpCooldown = 15;
          room.bumps++;
        }
      }
    }

    const keys = p.keys || {};
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const icy = (lv.iceZones || []).some(([a, b]) => p.x > a && p.x < b) && p.y > 480;
    if (dir) p.facing = dir;

    const mountainSlow = p.onMountain ? 0.6 : 1;
    p.vx = icy ? p.vx * 0.93 + dir * 0.3 : p.vx * HARD.friction + dir * HARD.moveSpeed * mountainSlow;
    p.vx = Math.max(-5.5, Math.min(5.5, p.vx));
    p.kickX = (p.kickX || 0) * 0.82;

    p.coyote = p.ground ? 4 : Math.max(0, (p.coyote || 0) - 1);

    if (keys.jump && !p.jumpHeld && ((p.ground || p.coyote) && !p.dangling)) {
      p.vy = -Math.abs(HARD.jumpPower * (p.onMountain ? 0.75 : 1));
      p.ground = false;
      p.coyote = 0;
      p.standingTicks = 0;
    }
    p.jumpHeld = !!keys.jump;

    if (p.dangling && dir) p.kickX = Math.max(-8, Math.min(8, (p.kickX || 0) + dir * 0.5));

    if (p.onMountain && p.y < 570 - 120) {
      const ws = HARD.mountainWindForce * (1 - (p.y - HARD.mountainPeakY) / (570 - HARD.mountainPeakY - 120));
      p.kickX += Math.sin(room.ticks / 25) * ws;
      p.vy -= ws * 0.4;
    }

    if (keys.toss && !p.tossHeld && !p.tossCooldown) {
      const q = ps.filter(q => q !== p && q.dead <= 0 && Math.hypot(q.x - p.x, q.y - p.y) < 85)
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (q) {
        q.kickX = p.facing * 13;
        q.vy = -15;
        q.ground = false;
        q.spin = 55;
        p.kickX = -p.facing * 4;
        p.tossCooldown = 65;
        room.pranks++;
        p.standingTicks = 0;
      }
    }
    p.tossHeld = !!keys.toss;

    for (const [x, y, w, d] of lv.fans || []) {
      if (p.x + PW > x && p.x < x + w && p.y + PH > y && p.y < 570) {
        p.kickX = Math.max(-10, Math.min(10, p.kickX + d * 1));
        if (p.y > y) p.vy -= 1.2;
        p.standingTicks = 0;
      }
    }

    for (const [a, b] of lv.conveyors || []) {
      if (p.ground && p.x + PW > a && p.x < b) {
        p.kickX = Math.max(-8, Math.min(8, p.kickX + Math.sin(room.ticks / 110) * 1));
      }
    }

    for (const q of ps) {
      if (q === p || q.dead > 0) continue;
      if (Math.abs(p.y + PH - q.y) <= 4 && p.x + PW > q.x + 3 && p.x < q.x + PW - 3) {
        p.x += (q.vx + (q.kickX || 0));
      }
    }

    p.x = Math.max(8, Math.min(lv.width - PW - 8, p.x + p.vx + p.kickX));

    for (const b of solids) {
      if (b.slope) continue;
      if (overlap({ x: p.x, y: p.y, w: PW, h: PH }, b) && (oldX + PW <= b.x + 1 || oldX >= b.x + b.w - 1)) {
        p.x = dir > 0 ? b.x - PW : b.x + b.w;
        p.kickX = -p.kickX * 0.1;
        p.vx = 0;
      }
    }

    for (const q of ps) {
      if (q === p || q.dead > 0) continue;
      if (p.y + PH <= q.y + 2 || q.y + PH <= p.y + 2) continue;
      if (overlap({ x: p.x, y: p.y, w: PW, h: PH }, { x: q.x, y: q.y, w: PW, h: PH })) {
        if ((dir > 0 && oldX < q.x) || (dir < 0 && oldX > q.x)) p.x = oldX;
        if (Math.abs(dir) > 2) q.kickX = Math.max(-8, Math.min(8, (q.kickX || 0) + Math.sign(dir) * 0.9));
      }
    }

    p.vy = Math.min(HARD.maxFallSpeed, p.vy + HARD.gravity);
    p.y += p.vy;
    p.ground = false;

    for (const b of obs.rotors) {
      const c = checkRotorCollision(p.x, p.y, PW, PH, b.x, b.y, b.r, b.angle);
      if (c.hit) {
        p.x = b.x + c.pushX * (b.r + 35) - PW / 2;
        p.y = b.y + c.pushY * (b.r + 35) - PH / 2;
        p.vx = c.pushX * 5;
        p.vy = c.pushY * 5 - 8;
        p.spin = 45;
        p.standingTicks = 0;
        if (!p.bumpCooldown) {
          p.bumpCooldown = 15;
          room.bumps++;
        }
      }
    }

    for (const b of solids) {
      if (p.x + PW <= b.x || p.x >= b.x + b.w) continue;
      const y = top(b, p);
      if (p.vy >= 0 && oldY + PH <= y + 8 && p.y + PH >= y) {
        p.y = y - PH;
        p.vy = 0;
        p.ground = true;
        p.standingTicks = 0;
      } else if (!b.slope && p.vy < 0 && oldY >= b.y + b.h && p.y < b.y + b.h) {
        p.y = b.y + b.h;
        p.vy = 0;
      }
    }

    for (const q of ps) {
      if (q === p || q.dead > 0) continue;
      if (p.x + PW > q.x + 3 && p.x < q.x + PW - 3) {
        if (p.vy >= 0 && oldY + PH <= q.y + 8 && p.y + PH >= q.y) {
          p.y = q.y - PH;
          p.vy = 0;
          p.ground = true;
          p.standingTicks = 0;
        } else if (q.vy < 0 && Math.abs(oldY + PH - q.y) <= 16) {
          p.y = q.y - PH;
          p.vy = q.vy;
          p.ground = true;
        }
      }
    }

    for (const [x, y, w] of lv.springs || []) {
      if (p.ground && p.x + PW > x && p.x < x + w && Math.abs(p.y + PH - y) < 5) {
        p.vy = HARD.springPower;
        p.ground = false;
        p.spin = 30;
        p.standingTicks = 0;
      }
    }

    for (const b of obs.pumpkins) {
      if (overlap({ x: p.x, y: p.y, w: PW, h: PH }, b)) {
        const fl = (p.x + PW / 2) <= (b.x + b.w / 2);
        if (fl) {
          p.x = Math.max(8, b.x - PW - 6);
          p.vx = Math.min(-5, p.vx);
          p.kickX = HARD.pumpkinBounce;
        } else {
          p.x = Math.min(lv.width - PW - 8, b.x + b.w + 6);
          p.vx = Math.max(5, p.vx);
          p.kickX = -HARD.pumpkinBounce;
        }
        p.vy = HARD.pumpkinBounce;
        p.spin = 38;
        p.standingTicks = 0;
        if (!p.bumpCooldown) {
          p.bumpCooldown = 10;
          room.bumps++;
        }
      }
    }

    for (const b of obs.rotors) {
      const c = checkRotorCollision(p.x, p.y, PW, PH, b.x, b.y, b.r, b.angle);
      if (c.hit) {
        p.x = b.x + c.pushX * (b.r + 35) - PW / 2;
        p.y = b.y + c.pushY * (b.r + 35) - PH / 2;
        p.vx = c.pushX * 5;
        p.vy = c.pushY * 5 - 8;
        p.spin = 45;
        p.standingTicks = 0;
        if (!p.bumpCooldown) {
          p.bumpCooldown = 15;
          room.bumps++;
        }
      }
    }

    if (!room.key && Math.hypot(p.x + 15 - lv.key[0], p.y + 22 - lv.key[1]) < 80) {
      room.key = true;
    }
  }

  for (const q of ps) {
    if (!q.ground || q.y >= 580) {
      q.hauling = false;
      continue;
    }
    const dl = ps.filter(o => o.dangling && o.dead <= 0);
    if (dl.length > 0) {
      const avgX = dl.reduce((s, o) => s + o.x, 0) / dl.length;
      const pullDir = Math.sign(avgX - q.x);
      q.kickX = Math.max(-6, Math.min(6, (q.kickX || 0) + pullDir * 0.5));
      const pullingAway = (q.keys?.left && pullDir > 0) || (q.keys?.right && pullDir < 0) || q.keys?.jump;
      q.hauling = !!pullingAway;
      if (q.hauling) {
        q.kickX *= 0.45;
        dl.forEach(o => {
          o.vy = Math.min(o.vy, -10);
          o.y = Math.max(520, o.y - 4.5);
        });
      }
    } else {
      q.hauling = false;
    }
  }

  // Calculate player stack heights (1, 2, 3+ tiers)
  ps.forEach(p => {
    p.stackHeight = 1;
    p.stackedOn = null;
  });
  for (const p of ps) {
    if (p.dead > 0) continue;
    for (const q of ps) {
      if (q === p || q.dead > 0) continue;
      if (Math.abs(p.y + PH - q.y) <= 6 && p.x + PW > q.x + 3 && p.x < q.x + PW - 3) {
        p.stackedOn = q;
        break;
      }
    }
  }
  for (let iter = 0; iter < 4; iter++) {
    for (const p of ps) {
      if (p.stackedOn) {
        p.stackHeight = (p.stackedOn.stackHeight || 1) + 1;
      }
    }
  }

  constrainRopes(room, solids.filter(b => !b.slope));

  if (ps.every(p => p.dead > 0 || p.y > H + 20)) {
    room.teamRespawn = HARD.respawnTimer;
    ps.forEach(p => {
      p.dead = HARD.respawnTimer;
      p.keys = {};
      p.kickX = 0;
      p.vx = 0;
      p.vy = 0;
      p.dangling = false;
      p.hauling = false;
      p.stackHeight = 0;
      p.standingTicks = 0;
    });
    return;
  }

  for (const x of lv.checkpoints) {
    if (x > room.checkpoint && ps.every(p => p.dead <= 0 && p.x >= x && p.y < 580)) {
      room.checkpoint = x;
      room.checkpointsPassed++;
    }
  }

  ps.forEach(p => p.ready = room.key && p.x > lv.door[0] - 95 && p.y + PH > lv.door[1] - 15 && p.dead <= 0);
  if (room.key && ps.every(p => p.ready)) {
    room.status = 'won';
    room.elapsed = room.ticks / 60;
  }
}

function constrainRopes(room, solids) {
  const ps = room.players.filter(p => p.dead <= 0);
  const rest = HARD.ropeLength;
  const max = HARD.ropeMax;

  function move(p, dx, dy) {
    const oldY = p.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
    for (let i = 0; i < steps; i++) {
      const nx = Math.max(8, Math.min(worldWidth(room) - PW - 8, p.x + dx / steps));
      if (!solids.some(b => overlap({ x: nx, y: p.y, w: PW, h: PH }, b))) p.x = nx;
      const ny = p.y + dy / steps;
      if (!solids.some(b => overlap({ x: p.x, y: ny, w: PW, h: PH }, b))) p.y = ny;
    }
    if (p.y < oldY - 0.1) {
      p.ground = false;
      p.vy = Math.min(p.vy, -2);
    }
  }

  for (let i = 0; i < ps.length - 1; i++) {
    const a = ps[i];
    const b = ps[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    if (d <= rest || a.dead > 0 || b.dead > 0) continue;
    const f = Math.min(2.5, (d - rest) * 0.04);
    const nx = dx / d;
    const ny = dy / d;
    if (b.dangling && a.ground) {
      b.vy = Math.min(b.vy, -ny * f * 2.7);
      a.kickX = Math.max(-9, Math.min(9, (a.kickX || 0) + nx * f));
      if (a.hauling) {
        b.vy = Math.min(b.vy, -11);
        b.y -= 4.5;
        b.y = Math.min(H + 10, b.y);
      }
    } else if (a.dangling && b.ground) {
      a.vy = Math.min(a.vy, ny * f * 2.7);
      b.kickX = Math.max(-9, Math.min(9, (b.kickX || 0) - nx * f));
      if (b.hauling) {
        a.vy = Math.min(a.vy, -11);
        a.y -= 4.5;
        a.y = Math.min(H + 10, a.y);
      }
    } else {
      a.kickX = Math.max(-11, Math.min(11, (a.kickX || 0) + nx * f));
      b.kickX = Math.max(-11, Math.min(11, (b.kickX || 0) - nx * f));
      if (ny < -0.15) {
        a.vy = Math.max(-15, a.vy + ny * f);
        a.ground = false;
      }
      if (ny > 0.15) {
        b.vy = Math.max(-15, b.vy - ny * f);
        b.ground = false;
      }
    }
  }

  for (let it = 0; it < 10; it++) {
    for (let i = 0; i < ps.length - 1; i++) {
      const a = ps[i];
      const b = ps[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d <= max) continue;
      const nx = dx / d;
      const ny = dy / d;
      const e = d - max;
      const ax = a.x;
      const ay = a.y;
      const ar = a.ground ? 0.15 : 0.5;
      const br = 1 - ar;
      move(a, nx * e * ar, ny * e * ar);
      const mv = (a.x - ax) * nx + (a.y - ay) * ny;
      move(b, -nx * (e - mv), -ny * (e - mv));
    }
  }
}

function scoring(r) {
  const won = r.status === 'won';
  const seconds = (r.ticks || 0) / 60;
  const checkpoints = (r.checkpointsPassed || 0) * 200;
  const sock = r.key ? 500 : 0;
  const finish = won ? 1000 : 0;
  const speed = won ? Math.max(0, 1000 - Math.floor(seconds * 3.5)) : 0;
  const care = won ? Math.max(0, 600 - (r.runDeaths || 0) * 50) : 0;
  const total = checkpoints + sock + finish + speed + care;
  return { checkpoints, sock, finish, speed, care, total, stars: won ? (total >= 5000 ? 3 : total >= 4200 ? 2 : 1) : 0 };
}

function snapshot(r) {
  return {
    code: r.code,
    status: r.status,
    score: scoring(r),
    runDeaths: r.runDeaths || 0,
    seconds: (r.ticks || 0) / 60,
    spectatorCount: (r.spectators || []).filter(p => p.connected).length,
    level: r.level,
    key: r.key,
    gateOpen: true,
    ropeLength: r.ropeLength || HARD.ropeLength,
    ropeMax: r.ropeMax || HARD.ropeMax,
    teamRespawn: r.teamRespawn || 0,
    checkpoint: r.checkpoint || 80,
    variant: r.variant || 0,
    pranks: r.pranks || 0,
    bumps: r.bumps || 0,
    movingY: r.movingY,
    deaths: r.deaths || 0,
    ticks: r.ticks || 0,
    elapsed: r.elapsed,
    obstacles: obstacles(r),
    crumblingPlatforms: r.crumblingPlatforms,
    players: r.players.map(({ id, name, x, y, vx, vy, dead, ready, connected, house, spin, facing, invincible, dangling, hauling, stackHeight, onMountain, standingTicks }) => ({
      id, name, x, y, vx, vy, dead, ready, connected, house, spin, facing, invincible,
      dangling: !!dangling, hauling: !!hauling, stackHeight, onMountain, standingTicks
    })),
    host: r.host
  };
}

const api = { W, H, PW, PH, levels, init, tick, snapshot, constrainRopes, obstacles, solidsFor, scoring, HARD, checkRotorCollision };
if (typeof module !== 'undefined') module.exports = api; else window.ElfEngine = api;
})();
