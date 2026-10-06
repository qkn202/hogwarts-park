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
  standingDeathTicks: 120,
  minPlatformWidth: 40,
  mountainPeakY: 270,
  mountainWindForce: 1.2
};

const classicLevels = [
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

classicLevels.forEach((lv, idx) => {
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
  lv.classic = true;
  lv.standingDeath = true;
  lv.name = 'Cổ điển · ' + lv.name;
});

// =====================================================================================
// V2 MAPS — 6 dense co-op chapters per map. Every module is calibrated against measured
// physics (see tests/maps_v2.test.cjs): solo jump ~60px high / ~65px far, 2-stack jump ~104px,
// toss ~125px high / ≤~98px far, 3-stack ~148px, catapult ~170px.
// =====================================================================================
const V2 = {
  tossGap: 112,          // > solo reach (~94 incl. overhang), < toss reach (~125)
  window: 20,            // drum plates must all be landed on within this many ticks
  launchVy: -17,         // seesaw catapult launch (~170px)
  ropeFray: 150,         // dangling longer than this snaps the rope (team wipe)
  respawn: 40,
  fogSpeed: n => n <= 2 ? 1.6 : n <= 4 ? 1.9 : 2.2,
  shrinkRest: 80, shrinkMax: 120,
  houseSpacing: 160,     // same-colour platforms 160px apart: solo can't, a teammate's toss can
  blockH: { stack2: 95, toss: 115, cat: 160 }
};

function blockHeight(kind, n) {
  if (kind === 'stack') return n >= 3 ? 140 : 95;
  return V2.blockH[kind] || 95;
}

const PARTS = {
  // Gap a single elf cannot jump; a teammate's toss can. The rest are hauled over by rope.
  tossGap(lv, gaps, x) {
    gaps.push([x, x + V2.tossGap]);
    lv.tossGaps.push([x, x + V2.tossGap]);
    return x + V2.tossGap + 170;
  },
  // Drum plates + full-height gate. Plates: 0 = floor, 'stack2'|'stack'|'toss'|'cat' = floating ledge.
  drums(lv, gaps, x, part) {
    let cur = x;
    const plates = [];
    for (const h of part.plates) {
      if (h === 'cat') { lv.catapults.push({ x: cur, y: 556, w: 150 }); cur += 150; }
      if (h) {
        lv.blocks.push({ x: cur, w: 70, kind: h });
        plates.push({ x: cur + 5, w: 60, block: lv.blocks.length - 1 });
        cur += 70 + 25;
      } else {
        plates.push({ x: cur, w: 60 });
        cur += 60 + 45;
      }
    }
    const gate = { x: cur + 10, w: 40 };
    lv.drums.push({ plates, gate, min: part.min || 2, max: part.max || plates.length, open: part.open || 0 });
    return gate.x + gate.w + 150;
  },
  // Leapfrog bridge over a gap: each colour of platform is only solid for elves of that house.
  house(lv, gaps, x, part) {
    const L = part.cycles * V2.houseSpacing + 60;
    // First cycle hovers over solid floor so every colour can board; the leapfrog starts on cycle 2.
    gaps.push([x + V2.houseSpacing + 30, x + L]);
    lv.houseBridges.push({ x, cycles: part.cycles });
    return x + L + 170;
  },
  // Pulsing fan over a gap: jump in while it blows, or dangle.
  fanGap(lv, gaps, x) {
    gaps.push([x, x + 320]);
    lv.fans.push([x - 20, 420, 360, 1.5, 150]);
    return x + 320 + 170;
  },
  // Stepping stones inside a rope-shrink zone (rope 80/120): the team must hop in lockstep.
  shrink(lv, gaps, x, part) {
    gaps.push([x, x + 640]);
    for (let j = 0; j < 7; j++) lv.platforms.push([x + 40 + j * 90, 540 - (j % 2) * 30, 50, 18]);
    lv.shrinkZones.push([x - 80, x + 720]);
    if (part.rotors) lv.rotors.push([x + 215, 400, 75], [x + 485, 400, 75]);
    return x + 640 + 170;
  },
  rotor(lv, gaps, x) {
    lv.rotors.push([x + 130, 465, 80]);
    return x + 300;
  },
  // Overlays: do not advance the cursor.
  pumpkins(lv, gaps, x) {
    lv.pumpkins.push([x + 160, 526, 120], [x + 470, 526, 110]);
    return x;
  },
  conveyor(lv, gaps, x, part) {
    lv.conveyors.push([x, x + (part.len || 600)]);
    return x;
  }
};

const T = (k, extra = {}) => ({ k, ...extra });
const v2Specs = [
  { map: 'common-room', name: 'Phòng sinh hoạt chung', hint: 'Nhập môn: NÉM bạn qua vực · CHỒNG VAI lên bục · NHẢY CÙNG NHỊP!', toast: 'Không ai qua được một mình đâu.', chapters: [
    { label: 'Thảm bị thủng', tip: 'X để ném bạn qua vực, rồi kéo nhau qua', parts: [T('tossGap')] },
    { label: 'Trống phòng ngủ', tip: 'Cùng đáp xuống 2 phiến TRONG 1 NHỊP', parts: [T('drums', { plates: [0, 0], max: 2 })] },
    { label: 'Bục lò sưởi', tip: 'Chồng vai đưa 1 bạn lên bục, rồi nhảy cùng nhịp', parts: [T('drums', { plates: ['stack2', 0], max: 2 })] },
    { label: 'Hai lần bay', tip: 'Ném — kéo — ném — kéo', parts: [T('tossGap'), T('tossGap')] },
    { label: 'Nhịp cả hội', tip: 'Mỗi người 1 phiến! Cửa chỉ mở 2,5 giây', parts: [T('drums', { plates: [0, 0, 0, 0], max: 4, open: 150 })] },
    { label: 'BOSS · Tháp & Vực', tip: 'Tháp lên bục → nhịp → lao qua cửa → ném qua vực', parts: [T('drums', { plates: ['stack', 0, 0], max: 3, open: 150 }), T('tossGap')] }
  ] },
  { map: 'great-hall', name: 'Đại Sảnh Đường', hint: '🥁 PHIẾN NHỊP TRỐNG: cả đội phải tiếp đất cùng lúc!', toast: '3–2–1… NHẢY! Ai trễ nhịp phải khao bí ngô.', chapters: [
    { label: 'Trống khai tiệc', tip: 'Học nhịp: 2 phiến, 1 nhịp', parts: [T('drums', { plates: [0, 0], max: 2 })] },
    { label: 'Bàn giáo sư', tip: 'Lên bục rồi mới nhảy nhịp', parts: [T('drums', { plates: ['stack2', 0, 0], max: 3 })] },
    { label: 'Cửa sảnh đóng nhanh', tip: 'Nhịp → chạy → ném qua vực trước khi cửa đóng', parts: [T('drums', { plates: [0, 0, 0, 0], max: 4, open: 110 }), T('tossGap')] },
    { label: 'Băng chuyền đĩa', tip: 'Giữ vị trí trên băng chuyền rồi nhảy nhịp', parts: [T('conveyor', { len: 640 }), T('drums', { plates: [0, 0, 0], max: 3 })] },
    { label: 'Giám Ngục dự tiệc', tip: 'SƯƠNG ĐUỔI! Nhịp dưới áp lực', fog: true, parts: [T('drums', { plates: [0, 0], max: 2 }), T('tossGap')] },
    { label: 'BOSS · Trống trần nhà', tip: 'Ném 1 bạn lên phiến cao, cả đội nhảy cùng nhịp', parts: [T('drums', { plates: ['toss', 0, 0, 0], max: 4, open: 120 })] }
  ] },
  { map: 'charms', name: 'Lớp học Bùa chú', hint: '🎨 BỤC NHÀ: chỉ đứng được trên bục cùng màu khăn!', toast: 'Đỏ lên trước! Xanh đứng chờ ném!', chapters: [
    { label: 'Cầu màu nhập môn', tip: 'Nhảy cóc: ném bạn sang bục màu của họ', parts: [T('house', { cycles: 2 })] },
    { label: 'Bùa đồng bộ', tip: 'Nhảy cùng nhịp', parts: [T('drums', { plates: [0, 0], max: 2 })] },
    { label: 'Cầu Wingardium', tip: '4 nhịp ném liên tục, rơi là đứt dây', parts: [T('house', { cycles: 4 })] },
    { label: 'Cầu rồi vực', tip: 'Hết cầu màu là vực ném', parts: [T('house', { cycles: 3 }), T('tossGap')] },
    { label: 'Bục giáo sư Flitwick', tip: 'Chồng vai + nhịp, cửa đóng sau 2,5 giây', parts: [T('drums', { plates: ['stack2', 0, 0], max: 3, open: 150 })] },
    { label: 'BOSS · Cầu đũa phép quay', tip: 'Cầu màu dưới cánh quạt — canh nhịp mà ném', parts: [T('rotor'), T('house', { cycles: 4 })] }
  ] },
  { map: 'greenhouse', name: 'Nhà kính Thảo dược', hint: '💨 QUẠT BẬT/TẮT: nhảy vào đúng lúc gió thổi!', toast: 'Cây quạt hắt hơi theo nhịp. Đừng hắt hơi theo nó.', chapters: [
    { label: 'Quạt hắt hơi', tip: 'Đợi gió rồi CÙNG nhảy', parts: [T('fanGap')] },
    { label: 'Luống cây nhà', tip: 'Cầu màu', parts: [T('house', { cycles: 3 })] },
    { label: 'Gió rồi trống', tip: 'Bay qua vực rồi nhảy nhịp', parts: [T('fanGap'), T('drums', { plates: [0, 0], max: 2 })] },
    { label: 'Cầu rêu dài', tip: 'Cầu màu 4 nhịp', parts: [T('house', { cycles: 4 })] },
    { label: 'Sương mù nhà kính', tip: 'SƯƠNG ĐUỔI! Quạt + vực ném', fog: true, parts: [T('fanGap'), T('tossGap')] },
    { label: 'BOSS · Nấm bật tung', tip: 'Dậm bập bênh bắn bạn lên bục cao, rồi cầu màu', parts: [T('drums', { plates: ['cat', 0, 0], max: 3, open: 150 }), T('house', { cycles: 2 })] }
  ] },
  { map: 'stairs', name: 'Cầu thang Hogwarts', hint: '🧗 THÁP NGƯỜI: đưa 1 bạn lên bục cao rồi cả đội nhảy nhịp mở cửa!', toast: 'Cầu thang đổi hướng. Vai bạn thì không.', chapters: [
    { label: 'Bậc chồng vai', tip: 'Tháp 2 + nhịp', parts: [T('drums', { plates: ['stack2', 0], max: 2 })] },
    { label: 'Chiếu nghỉ thủng', tip: 'Ném — kéo — ném — kéo', parts: [T('tossGap'), T('tossGap')] },
    { label: 'Tháp pháo đài', tip: '3 người trở lên: THÁP 3 TẦNG', parts: [T('drums', { plates: ['stack', 0, 0], max: 3 })] },
    { label: 'Nhịp cầu thang', tip: 'Mỗi người 1 phiến, cửa 2 giây', parts: [T('drums', { plates: [0, 0, 0, 0], max: 4, open: 120 })] },
    { label: 'Bục chỉ ném tới', tip: 'Chỉ cú NÉM mới lên nổi, rồi lao qua vực', parts: [T('drums', { plates: ['toss', 0], max: 2, open: 150 }), T('tossGap')] },
    { label: 'BOSS · Hai pháo đài', tip: 'Tháp → nhịp → ném → nhịp', parts: [T('drums', { plates: ['stack', 0, 0], max: 3 }), T('drums', { plates: ['toss', 0, 0], max: 3, open: 150 })] }
  ] },
  { map: 'kitchen', name: 'Nhà bếp gia tinh', hint: '⚖️ BẬP BÊNH MÁY BẮN: dậm đầu này, bạn bay đầu kia!', toast: 'Bí ngô đang tuyển gia tinh làm bóng bowling.', chapters: [
    { label: 'Thớt bập bênh', tip: 'Nhảy DẬM xuống đầu trái → bạn đứng đầu phải bay lên', parts: [T('drums', { plates: ['cat', 0], max: 2 })] },
    { label: 'Bí ngô lăn', tip: 'Né bí ngô rồi ném nhau qua vực', parts: [T('pumpkins'), T('tossGap'), T('tossGap')] },
    { label: 'Lò nướng bật tưng', tip: '3+ người: cần 2 người dậm CÙNG LÚC', parts: [T('pumpkins'), T('drums', { plates: ['cat', 0, 0], max: 3 })] },
    { label: 'Bí ngô trên trống', tip: 'Nhảy nhịp giữa bí ngô đang lăn', parts: [T('pumpkins'), T('drums', { plates: [0, 0, 0], max: 3, open: 120 })] },
    { label: 'Giám Ngục vào bếp', tip: 'SƯƠNG ĐUỔI! Bí ngô + 2 vực', fog: true, parts: [T('pumpkins'), T('tossGap'), T('tossGap')] },
    { label: 'BOSS · Dây chuyền bắn', tip: 'Bắn → nhịp → bắn → nhịp', parts: [T('drums', { plates: ['cat', 0], max: 2 }), T('drums', { plates: ['cat', 0, 0], max: 3, open: 150 })] }
  ] },
  { map: 'chamber', name: 'Phòng Chứa Bí Mật', hint: '🪢 BÙA RÚT DÂY: dây ngắn lại, cả đội phải nhảy cùng nhịp!', toast: 'Dây ngắn. Kiên nhẫn còn ngắn hơn.', chapters: [
    { label: 'Mương rắn', tip: 'Dây ngắn — nhảy từng đá CÙNG NHAU', parts: [T('shrink')] },
    { label: 'Cửa rắn quay', tip: 'Canh cánh cửa rồi nhảy nhịp', parts: [T('rotor'), T('drums', { plates: [0, 0], max: 2 })] },
    { label: 'Cống ngầm quay', tip: 'Dây ngắn dưới 2 cánh cửa quay', parts: [T('shrink', { rotors: true })] },
    { label: 'Bẫy đá đôi', tip: 'Ném — né — ném', parts: [T('tossGap'), T('rotor'), T('tossGap')] },
    { label: 'Tượng Slytherin', tip: 'Cửa 1,8 giây sau cánh quạt', parts: [T('rotor'), T('drums', { plates: [0, 0, 0], max: 3, open: 110 })] },
    { label: 'BOSS · Hàm Tử Xà', tip: 'Dây ngắn + 2 cánh quay + vực ném', parts: [T('shrink', { rotors: true }), T('tossGap')] }
  ] },
  { map: 'courtyard', name: 'Sân lâu đài Hogwarts', hint: '🌫️ FINALE: sương Giám Ngục đuổi · vớ SNITCH bay!', toast: 'Lấy vớ, kéo bạn, cùng tự do!', snitch: true, par: 300, chapters: [
    { label: 'Giám Ngục ở cổng', tip: 'SƯƠNG ĐUỔI! Né bí ngô, ném qua vực', fog: true, parts: [T('pumpkins'), T('tossGap'), T('tossGap')] },
    { label: 'Cầu bốn nhà', tip: 'Cầu màu', parts: [T('house', { cycles: 3 })] },
    { label: 'Máy bắn sân trường', tip: 'Dậm → bay → nhịp', parts: [T('drums', { plates: ['cat', 0, 0], max: 3 })] },
    { label: 'Tháp đồng hồ', tip: 'Ném lên bục, cửa 2 giây', parts: [T('drums', { plates: ['toss', 0, 0], max: 3, open: 120 })] },
    { label: 'Hành lang bão', tip: 'SƯƠNG + DÂY NGẮN + CÁNH QUẠT', fog: true, parts: [T('shrink', { rotors: true })] },
    { label: 'BOSS · Vớ Snitch', tip: 'Tháp → nhịp → NÉM bạn chộp vớ đang bay', parts: [T('drums', { plates: ['stack', 0, 0, 0], max: 4 })] }
  ] }
];

function buildV2Level(spec) {
  const lv = {
    map: spec.map, name: spec.name, hint: spec.hint, toast: spec.toast, v2: true,
    standingDeath: false, respawnTimer: V2.respawn, ropeFray: V2.ropeFray, par: spec.par || 240,
    platforms: [], pumpkins: [], rotors: [], fans: [], springs: [], iceZones: [], seesaws: [], movers: [],
    checkpoints: [], stops: [], conveyors: [], crumbling: [], spikes: [],
    blocks: [], drums: [], houseBridges: [], catapults: [], fogs: [], shrinkZones: [], tossGaps: []
  };
  const gaps = [];
  let cx = 300;
  spec.chapters.forEach((ch, i) => {
    if (i) lv.checkpoints.push(cx + 20);
    lv.stops.push({ x: cx + 60, label: ch.label, kind: ch.parts[0].k, instruction: ch.tip });
    (lv.chapterX = lv.chapterX || []).push(cx);
    let cur = cx + 320;
    for (const part of ch.parts) cur = PARTS[part.k](lv, gaps, cur, part);
    const end = Math.max(cur + 120, cx + 900);
    if (ch.fog) lv.fogs.push({ start: cx + 320, end });
    cx = end;
  });
  gaps.sort((a, b) => a[0] - b[0]);
  let fs = 0;
  for (const [a, b] of gaps) { lv.platforms.push([fs, 570, a - fs, 90]); fs = b; }
  lv.key = [cx + 120, 515];
  lv.door = [cx + 300, 498];
  lv.width = cx + 420;
  lv.platforms.push([fs, 570, lv.width - fs, 90]);
  if (spec.snitch) lv.snitch = { x: lv.key[0], y: 400, ax: 140, ay: 25 };
  return lv;
}

const levels = [...v2Specs.map(buildV2Level), ...classicLevels];

// Bonus socks along the route (+points). Placed where only a co-op move gets you:
// V2 — on every raised ledge, deep inside each toss/fan gap (anchor + dangle-grab + haul), at the end of
// house bridges and on a shrink-zone stone. Classic — on elevated platforms. Sock centre = standing elf centre.
const SOCK_R = 30, SOCK_POINTS = 100, SOCK_SET_BONUS = 300;
function placeSocks(lv) {
  const socks = [];
  const onTop = (x, y) => socks.push({ x: Math.round(x), y: y - PH / 2 });
  if (lv.v2) {
    lv.blocks.forEach((b, bi) => socks.push({ x: Math.round(b.x + b.w / 2), y: 570 - blockHeight(b.kind, 2) - PH / 2, block: bi }));
    lv.tossGaps.forEach(([a, b]) => socks.push({ x: Math.round((a + b) / 2), y: 622, dangle: true }));
    lv.fans.forEach(f => socks.push({ x: f[0] + 100, y: 622, dangle: true }));
    lv.houseBridges.forEach(hb => onTop(hb.x + 40 + (hb.cycles - 1) * V2.houseSpacing + 25, 530));
    lv.shrinkZones.forEach(([z]) => onTop(z + 80 + 40 + 3 * 90 + 25, 510));
    // One high sock per chapter over safe floor: solo jump peaks ~60px short, a 2-stack jump or a toss grabs it.
    (lv.chapterX || []).forEach(cx => socks.push({ x: cx + 170, y: 440, high: true }));
  } else {
    let last = -1e9;
    lv.platforms
      .filter(([x, y, w, h]) => y < 560 && h <= 20 &&
        !lv.platforms.some(([x2, y2, w2]) => y2 < y && y2 > y - PH - 8 && x2 < x + w / 2 + PW && x2 + w2 > x + w / 2 - PW))
      .sort((a, b) => a[0] - b[0])
      .forEach(([x, y, w]) => { if (x - last >= 250 && socks.length < 12) { onTop(x + w / 2, y); last = x; } });
  }
  return socks.sort((a, b) => a.x - b.x);
}
levels.forEach(lv => { lv.bonusSocks = placeSocks(lv); });
// Current sock centre (ledge socks follow the team-size-dependent ledge height).
function sockPos(lv, s, n) {
  return s.block != null ? { x: s.x, y: 570 - blockHeight(lv.blocks[s.block].kind, n) - PH / 2 } : s;
}
const nHouses = room => Math.max(1, Math.min(4, room.players.length));
function fanOn(f, t) { return !f[4] || Math.sin((t || 0) / f[4] * Math.PI) > 0; }

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
  // Canonical house = slot index, so elf colour always matches house-platform colour.
  room.players.forEach((p, i) => { p.house = i; });
  room.checkpoint = 80;
  room.checkpointsPassed = 0;
  room.socksBanked = [];
  room.socksCarried = [];
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
  room.drumHits = 0;
  room.dangleTotal = 0;
  room.variant = Math.floor(Math.random() * 3);
  room.started = Date.now();
  room.crumblingPlatforms = {};
  const lv = levels[room.level];
  if (lv.crumbling) {
    lv.crumbling.forEach((c, idx) => {
      room.crumblingPlatforms[idx] = { crumbling: false, collapsed: false, timer: 0 };
    });
  }
  room.drumState = (lv.drums || []).map(() => ({ hits: {}, open: false, until: 0 }));
  room.catState = (lv.catapults || []).map(() => ({ stomps: {}, launch: -999 }));
  room.fogState = (lv.fogs || []).map(f => ({ active: false, done: false, x: f.start - 480 }));
}

// After a wipe: fog chases restart and gates beyond the respawn checkpoint close again.
function resetV2(room) {
  const lv = levels[room.level];
  (lv.fogs || []).forEach((f, i) => {
    const st = room.fogState && room.fogState[i];
    if (st && !st.done) Object.assign(st, { active: false, x: f.start - 480 });
  });
  (lv.drums || []).forEach((d, i) => {
    if (room.drumState && room.drumState[i] && d.gate.x > (room.checkpoint || 80)) room.drumState[i] = { hits: {}, open: false, until: 0 };
  });
  (room.catState || []).forEach(st => { st.stomps = {}; });
}

function resetCrumbling(room) {
  const lv = levels[room.level];
  room.crumblingPlatforms = {};
  (lv.crumbling || []).forEach((c, idx) => {
    room.crumblingPlatforms[idx] = { crumbling: false, collapsed: false, timer: 0 };
  });
}

// Any death wipes the whole team: everyone respawns together at the last checkpoint.
function teamWipe(room) {
  const lv = levels[room.level];
  const timer = lv.respawnTimer || HARD.respawnTimer;
  room.deaths = (room.deaths || 0) + 1;
  room.runDeaths = (room.runDeaths || 0) + 1;
  room.teamRespawn = timer;
  room.socksCarried = [];
  room.players.forEach(p => {
    p.dead = timer;
    p.dangleTicks = 0;
    p.keys = {};
    p.kickX = 0;
    p.vx = 0;
    p.vy = 0;
    p.dangling = false;
    p.hauling = false;
    p.stackHeight = 0;
    p.standingTicks = 0;
  });
  resetV2(room);
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
    slope: lv.seesaw ? Math.sin(t / 75 + v) * 0.4 : 0,
    keyPos: lv.snitch
      ? { x: lv.snitch.x + Math.sin(t / 90) * lv.snitch.ax, y: lv.snitch.y + Math.sin(t / 47) * lv.snitch.ay }
      : { x: lv.key[0], y: lv.key[1] }
  };
}

function activePlates(d, n) {
  return Math.min(d.plates.length, Math.max(d.min, Math.min(d.max, n)));
}

function plateY(lv, pl, n) {
  return pl.block != null ? 570 - blockHeight(lv.blocks[pl.block].kind, n) : 570;
}

// House platforms are only solid for elves whose slot colour matches.
function usable(b, p, nh) {
  return b.house == null || b.house === ((p.house || 0) % nh);
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
  const n = room.players ? room.players.length : 2;
  (lv.blocks || []).forEach(bk => s.push({ x: bk.x, y: 570 - blockHeight(bk.kind, n), w: bk.w, h: 18, block: true }));
  (lv.catapults || []).forEach((c, i) => s.push({ x: c.x, y: c.y, w: c.w, h: 14, catapult: i }));
  (lv.drums || []).forEach((d, i) => {
    const st = room.drumState && room.drumState[i];
    if (!st || !st.open) s.push({ x: d.gate.x, y: 0, w: d.gate.w, h: 570, gate: i });
  });
  const nh = Math.max(1, Math.min(4, n));
  (lv.houseBridges || []).forEach(hb => {
    for (let c = 0; c < nh; c++) {
      for (let k = 0; k < hb.cycles; k++) {
        s.push({ x: hb.x + 40 + Math.round(c * V2.houseSpacing / nh) + k * V2.houseSpacing, y: 530 - (c % 2) * 50, w: 50, h: 18, house: c });
      }
    }
  });
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
  room.socksBanked = room.socksBanked || [];
  room.socksCarried = room.socksCarried || [];

  if (room.teamRespawn > 0) {
    room.teamRespawn--;
    ps.forEach(p => p.dead = room.teamRespawn);
    if (!room.teamRespawn) {
      spawn(room);
      resetCrumbling(room);
    }
    return;
  }

  if (lv.crumbling && room.crumblingPlatforms) {
    let crushed = false;
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
        if (onPl) crushed = true;
      }
    });
    if (crushed) {
      teamWipe(room);
      return;
    }
  }

  const solids = solidsFor(room);
  room.movingY = solids.find(b => b.moving)?.y;
  const obs = obstacles(room);
  const anyGrounded = ps.some(p => p.ground && p.y < 580);
  const n = ps.length;
  const nh = nHouses(room);

  // Timed drum gates close again once nobody is standing inside them.
  (lv.drums || []).forEach((d, i) => {
    const st = room.drumState && room.drumState[i];
    if (st && st.open && st.until >= 0 && room.ticks > st.until) {
      const inside = ps.some(p => p.dead <= 0 && p.x + PW > d.gate.x && p.x < d.gate.x + d.gate.w);
      if (!inside) room.drumState[i] = { hits: {}, open: false, until: 0 };
    }
  });

  // Dementor fog: triggered when someone enters the chase, advances steadily, wipes laggards.
  for (let i = 0; i < (lv.fogs || []).length; i++) {
    const f = lv.fogs[i], st = room.fogState && room.fogState[i];
    if (!st || st.done) continue;
    const alive = ps.filter(p => p.dead <= 0);
    if (!st.active && alive.some(p => p.x >= f.start)) st.active = true;
    if (!st.active) continue;
    st.x = Math.min(f.end, st.x + V2.fogSpeed(n));
    if (alive.every(p => p.x >= f.end)) { st.done = true; st.active = false; }
    else if (alive.some(p => p.x + PW / 2 < st.x)) { teamWipe(room); return; }
  }

  const landed = (p, vyPre) => {
    const feet = p.y + PH;
    (lv.drums || []).forEach((d, i) => {
      const st = room.drumState[i];
      if (!st || st.open) return;
      const k = activePlates(d, n);
      for (let j = 0; j < k; j++) {
        const pl = d.plates[j];
        if (Math.abs(feet - plateY(lv, pl, n)) < 2 && p.x + PW > pl.x + 4 && p.x < pl.x + pl.w - 4) {
          st.hits[j] = room.ticks;
          room.drumHits = (room.drumHits || 0) + 1;
          let all = true;
          for (let m = 0; m < k; m++) if (st.hits[m] == null || room.ticks - st.hits[m] > V2.window) all = false;
          if (all) { st.open = true; st.until = d.open ? room.ticks + d.open : -1; st.openedAt = room.ticks; }
        }
      }
    });
    (lv.catapults || []).forEach((c, i) => {
      const cxp = p.x + PW / 2;
      if (Math.abs(feet - c.y) < 2 && cxp >= c.x && cxp < c.x + c.w / 2 && vyPre >= 3) room.catState[i].stomps[p.id] = room.ticks;
    });
  };

  for (const p of [...ps].sort((a, b) => b.y - a.y)) {
    if (p.dead > 0) continue;

    const oldX = p.x;
    const oldY = p.y;
    const wasGround = p.ground;

    p.invincible = Math.max(0, p.invincible - 1);
    p.spin = Math.max(0, p.spin - 1);
    p.tossCooldown = Math.max(0, p.tossCooldown - 1);
    p.bumpCooldown = Math.max(0, (p.bumpCooldown || 0) - 1);

    p.onMountain = isOnMountain(p, lv);
    p.lastY = p.y;

    if (lv.standingDeath && (p.standingTicks || 0) > HARD.standingDeathTicks && p.ground) {
      teamWipe(room);
      return;
    }

    p.dangling = !p.ground && p.y > 545 && anyGrounded;
    if (p.dangling) {
      p.y = Math.min(H + 50, p.y);
      if (p.y >= H + 50) p.vy = Math.min(0, p.vy);
      // Rope fray: dangle too long and the rope snaps.
      p.dangleTicks = (p.dangleTicks || 0) + 1;
      room.dangleTotal = (room.dangleTotal || 0) + 1;
      if (lv.ropeFray && p.dangleTicks > lv.ropeFray) {
        teamWipe(room);
        return;
      }
    } else {
      p.dangleTicks = 0;
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

    for (const f of lv.fans || []) {
      if (!fanOn(f, room.ticks)) continue;
      const [x, y, w, d] = f;
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
      if (b.slope || !usable(b, p, nh)) continue;
      if (overlap({ x: p.x, y: p.y, w: PW, h: PH }, b) && (oldX + PW <= b.x + 1 || oldX >= b.x + b.w - 1)) {
        // Push back to the side we came from (not the input direction) so kicks/ropes can't tunnel through walls.
        p.x = oldX + PW <= b.x + 1 ? b.x - PW : b.x + b.w;
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
    const vyPre = p.vy;
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
      if (p.x + PW <= b.x || p.x >= b.x + b.w || !usable(b, p, nh)) continue;
      const y = top(b, p);
      if (p.vy >= 0 && oldY + PH <= y + 8 && p.y + PH >= y) {
        p.y = y - PH;
        p.vy = 0;
        p.ground = true;
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
        } else if (q.vy < 0 && Math.abs(oldY + PH - q.y) <= 16) {
          p.y = q.y - PH;
          p.vy = q.vy;
          p.ground = true;
        }
      }
    }

    if (p.ground && !wasGround) landed(p, vyPre);

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

    if (!room.key && Math.hypot(p.x + 15 - obs.keyPos.x, p.y + 22 - obs.keyPos.y) < (lv.snitch ? 42 : 80)) {
      room.key = true;
    }

    // Bonus socks: picked up = carried; banked at the next checkpoint (or the finish), lost on a team wipe.
    (lv.bonusSocks || []).forEach((sk, si) => {
      if (room.socksBanked.includes(si) || room.socksCarried.includes(si)) return;
      const sp = sockPos(lv, sk, n);
      if (Math.hypot(p.x + PW / 2 - sp.x, p.y + PH / 2 - sp.y) < SOCK_R) room.socksCarried.push(si);
    });

    // Standing Death timer: counts only while grounded and not moving.
    // Exempt: tower base (someone standing on you), hauling the rope, spawn grace, waiting at the door with the sock.
    const moved = Math.abs(p.x - oldX) > 0.25 || Math.abs(p.y - oldY) > 0.25;
    const supporting = ps.some(q => q !== p && q.dead <= 0 && Math.abs(q.y + PH - p.y) <= 6 && q.x + PW > p.x + 3 && q.x < p.x + PW - 3);
    const atDoor = room.key && p.x > lv.door[0] - 95;
    const exempt = supporting || p.hauling || p.invincible > 0 || atDoor;
    p.standingTicks = (p.ground && !moved && !exempt) ? (p.standingTicks || 0) + 1 : 0;
  }

  // Catapults: enough stomps on the left half within the window launch everyone on the right half.
  (lv.catapults || []).forEach((c, i) => {
    const st = room.catState[i];
    const need = n >= 3 ? 2 : 1;
    const recent = Object.values(st.stomps).filter(t => room.ticks - t <= V2.window).length;
    if (recent < need) return;
    const riders = ps.filter(p => p.dead <= 0 && p.ground && Math.abs(p.y + PH - c.y) < 2 && p.x + PW / 2 >= c.x + c.w / 2 && p.x + PW / 2 <= c.x + c.w + 4);
    if (!riders.length) return;
    riders.forEach(p => { p.vy = V2.launchVy; p.ground = false; p.kickX = 3; p.spin = 30; });
    st.launch = room.ticks;
    st.stomps = {};
  });

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
    teamWipe(room);
    return;
  }

  for (const x of lv.checkpoints) {
    if (x > room.checkpoint && ps.every(p => p.dead <= 0 && p.x >= x && p.y < 580)) {
      room.checkpoint = x;
      room.checkpointsPassed++;
      room.socksBanked.push(...room.socksCarried);
      room.socksCarried = [];
    }
  }

  ps.forEach(p => p.ready = room.key && p.x > lv.door[0] - 95 && p.y + PH > lv.door[1] - 15 && p.dead <= 0);
  if (room.key && ps.every(p => p.ready)) {
    room.status = 'won';
    room.elapsed = room.ticks / 60;
    room.socksBanked.push(...room.socksCarried);
    room.socksCarried = [];
  }
}

function constrainRopes(room, solids) {
  const ps = room.players.filter(p => p.dead <= 0);
  const lv = levels[room.level];
  const nh = nHouses(room);
  const limits = (a, b) => {
    const mid = (a.x + b.x) / 2;
    const shrunk = (lv.shrinkZones || []).some(([z1, z2]) => mid >= z1 && mid <= z2);
    if (shrunk) return [V2.shrinkRest, V2.shrinkMax];
    // In gaps/dangling: keep strict rest 140 to prevent void wipeouts and preserve gap sock grabs
    if (a.dangling || b.dangling || a.y > 530 || b.y > 530) return [HARD.ropeLength, HARD.ropeMax];
    // On elevated ledges/blocks (dy > 70): expand rope so drum plates on ledges have comfortable slack
    const dy = Math.abs(a.y - b.y);
    if (dy > 70) {
      const rest = Math.max(HARD.ropeLength, Math.round(Math.hypot(110, dy)));
      const max = Math.max(HARD.ropeMax, rest + 80);
      return [rest, max];
    }
    return [HARD.ropeLength, HARD.ropeMax];
  };

  function move(p, dx, dy) {
    const oldY = p.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
    for (let i = 0; i < steps; i++) {
      const nx = Math.max(8, Math.min(worldWidth(room) - PW - 8, p.x + dx / steps));
      if (!solids.some(b => usable(b, p, nh) && overlap({ x: nx, y: p.y, w: PW, h: PH }, b))) p.x = nx;
      const ny = p.y + dy / steps;
      if (!solids.some(b => usable(b, p, nh) && overlap({ x: p.x, y: ny, w: PW, h: PH }, b))) p.y = ny;
    }
    if (p.y < oldY - 0.1) {
      p.ground = false;
      p.vy = Math.min(p.vy, -2);
    }
  }

  for (let i = 0; i < ps.length - 1; i++) {
    const a = ps[i];
    const b = ps[i + 1];
    const [rest] = limits(a, b);
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
      const [, max] = limits(a, b);
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
  const lv = levels[r.level] || levels[0];
  const n = (r.players || []).length || 2;
  // Checkpoint pool is 2200 regardless of how many flags a map has (classic: 11 × 200).
  const checkpoints = Math.round((r.checkpointsPassed || 0) * 2200 / Math.max(1, lv.checkpoints.length));
  const sock = r.key ? 500 : 0;
  const finish = won ? 1000 : 0;
  // Speed bonus vs a per-level par time (classic: ~width/100 s).
  const par = lv.par || Math.round(lv.width / 100);
  const speed = won ? Math.max(0, 1000 - Math.floor(Math.max(0, seconds - par) * 3)) : 0;
  const care = won ? Math.max(0, 600 - (r.runDeaths || 0) * 50) : 0;
  // Badges (V2 maps): perfect sync = drums opened with few wasted landings; nobody ever dangled.
  const required = (lv.drums || []).reduce((s, d) => s + activePlates(d, n), 0);
  const syncBadge = won && required > 0 && (r.drumHits || 0) <= required * 2;
  const ropeBadge = won && !!lv.v2 && !(r.dangleTotal || 0);
  const bonus = (syncBadge ? 250 : 0) + (ropeBadge ? 250 : 0);
  // Bonus socks collected along the way (banked only) + a set bonus for collecting every one.
  const sockTotal = (lv.bonusSocks || []).length, sockCount = (r.socksBanked || []).length;
  const socks = sockCount * SOCK_POINTS + (sockTotal && sockCount >= sockTotal ? SOCK_SET_BONUS : 0);
  const total = checkpoints + sock + finish + speed + care + bonus + socks;
  return { checkpoints, sock, finish, speed, care, bonus, socks, sockCount, sockTotal, badges: { sync: syncBadge, rope: ropeBadge }, total, stars: won ? (total >= 5000 ? 3 : total >= 4200 ? 2 : 1) : 0 };
}

function snapshot(r) {
  return {
    code: r.code,
    status: r.status,
    score: scoring(r),
    runDeaths: r.runDeaths || 0,
    checkpointsPassed: r.checkpointsPassed || 0,
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
    drumState: r.drumState || [],
    catState: (r.catState || []).map(c => ({ launch: c.launch })),
    fogState: r.fogState || [],
    drumHits: r.drumHits || 0,
    dangleTotal: r.dangleTotal || 0,
    socksBanked: r.socksBanked || [],
    socksCarried: r.socksCarried || [],
    players: r.players.map(({ id, name, x, y, vx, vy, dead, ready, connected, house, spin, facing, invincible, dangling, hauling, stackHeight, onMountain, standingTicks }) => ({
      id, name, x, y, vx, vy, dead, ready, connected, house, spin, facing, invincible,
      dangling: !!dangling, hauling: !!hauling, stackHeight, onMountain, standingTicks
    })),
    host: r.host
  };
}

const api = { W, H, PW, PH, levels, init, tick, snapshot, constrainRopes, obstacles, solidsFor, scoring, HARD, V2, checkRotorCollision, blockHeight, activePlates, plateY, fanOn, nHouses, sockPos, SOCK_R, SOCK_POINTS, SOCK_SET_BONUS };
if (typeof module !== 'undefined') module.exports = api; else window.ElfEngine = api;
})();
