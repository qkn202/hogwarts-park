/* Sockbound: authoritative LAN co-op and entirely local shared-keyboard play. */
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d');
const E=window.ElfEngine,levels=E.levels,colors=['#b65344','#72884f','#5d8cac','#d2af55'],houses=['Gryffindor','Slytherin','Ravenclaw','Hufflepuff'];
let state=null,session=null,source=null,localRoom=null,count=2,keys={},pulses={},paused=false,lastSend=0,pending=false,sound=false,audioCtx=null,lastStatus='',lastKey=false, lastFrame=performance.now(),accumulator=0,localHudAt=0,shownControls=0,lastDeaths=0,lastPranks=0,lastBumps=0,lastCheckpoint=80,lastLevel=-1,lastDanglingCount=0;
const mappings=[['KeyA','KeyD','KeyW','KeyX'],['ArrowLeft','ArrowRight','ArrowUp','Slash'],['KeyJ','KeyL','KeyI','KeyO'],['KeyF','KeyH','KeyT','KeyY'],['KeyZ','KeyC','KeyS','KeyV'],['KeyB','KeyM','KeyN','Comma'],['Digit1','Digit3','Digit2','Digit4'],['Digit7','Digit9','Digit8','Digit0']];
const controlLabels=['A D W · X','← → ↑ · /','J L I · O','F H T · Y','Z C S · V','B M N · ,','1 3 2 · 4','7 9 8 · 0'];

const SUPABASE_URL = 'https://fxucyrofcsuqtlkukcrx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zEiG2Py5kDmGhkTgw0uWIA_We0rOCGu';
// Network input comes from untrusted peers: coerce to plain booleans before it reaches the engine.
function cleanKeys(k){return {left:k?.left===true,right:k?.right===true,jump:k?.jump===true,toss:k?.toss===true};}

const SupabaseNet = {
  client: null,
  roomChannel: null,
  lobbyChannel: null,
  broadcastChannel: null,
  roomCode: '',
  isHost: false,
  role: 'player',
  playerId: '',
  playerName: 'Dobby',
  openRooms: new Map(),
  onlineRoom: null,

  init() {
    if (this.client) return;
    this.playerId = sessionStorage.getItem('sockbound-player-id');
    if (!this.playerId) {
      this.playerId = 'elf_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem('sockbound-player-id', this.playerId);
    }
    if (window.supabase) {
      try {
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          realtime: { params: { eventsPerSecond: 40 } }
        });
        this.initLobby();
      } catch (err) {
        console.warn('[SupabaseNet] Init error:', err);
      }
    }
  },

  initLobby() {
    if (!this.client || this.lobbyChannel) return;
    try {
      this.lobbyChannel = this.client.channel('sockbound-global-lobby', {
        config: { presence: { key: this.playerId } }
      });

      this.lobbyChannel.on('presence', { event: 'sync' }, () => {
        const pstate = this.lobbyChannel.presenceState();
        this.openRooms.clear();
        for (const k in pstate) {
          const list = pstate[k];
          if (list && list.length) {
            for (const r of list) {
              if (r.roomCode && r.isHost && r.status === 'lobby') {
                this.openRooms.set(r.roomCode, r);
              }
            }
          }
        }
        this.renderLobbyRooms();
      });

      this.lobbyChannel.on('broadcast', { event: 'room_event' }, ({ payload }) => {
        if (!payload) return;
        if (payload.action === 'room_opened' && payload.room?.code) {
          this.openRooms.set(payload.room.code, payload.room);
          this.renderLobbyRooms();
        } else if (payload.action === 'room_closed' && payload.room?.code) {
          this.openRooms.delete(payload.room.code);
          this.renderLobbyRooms();
        }
      });

      this.lobbyChannel.subscribe((status) => {
        const badge = $('supabase-status');
        if (badge) {
          badge.textContent = status === 'SUBSCRIBED' ? '🟢 Supabase Online' : '🟡 Đang kết nối';
          badge.className = 'status-badge ' + (status === 'SUBSCRIBED' ? 'connected' : 'connecting');
        }
      });
    } catch (e) {
      console.warn('[SupabaseNet] Lobby error:', e);
    }
  },

  renderLobbyRooms() {
    const listEl = $('online-rooms-list');
    if (!listEl) return;
    const rooms = Array.from(this.openRooms.values()).filter(r => r.code !== this.roomCode);
    if (rooms.length === 0) {
      listEl.innerHTML = '<div class="no-rooms-msg">Chưa có phòng nào. Hãy tạo phòng mới!</div>';
      return;
    }
    listEl.innerHTML = '';
    rooms.forEach(r => {
      // Room data arrives from any peer on the public lobby channel: build DOM with textContent (no innerHTML) to avoid XSS.
      const code = String(r.code || '').replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();
      if (!code) return;
      const item = document.createElement('div');
      item.className = 'room-item';
      const lvlName = levels[Number(r.level) || 0]?.name || 'Hogwarts';
      const info = document.createElement('div');
      info.className = 'room-info';
      const tag = document.createElement('strong');
      tag.className = 'room-code-tag';
      tag.textContent = code;
      const desc = document.createElement('span');
      desc.textContent = `${String(r.hostName || 'Gia tinh').slice(0, 18)} · ${lvlName}`;
      const cnt = document.createElement('small');
      cnt.textContent = `${Math.min(8, Math.max(1, Number(r.playerCount) || 1))}/8 gia tinh`;
      info.append(tag, desc, cnt);
      const btn = document.createElement('button');
      btn.className = 'join-quick-btn';
      btn.dataset.code = code;
      btn.textContent = 'Vào ngay ✦';
      btn.onclick = () => {
        $('online-code').value = code;
        enterOnline('join', code);
      };
      item.append(info, btn);
      listEl.appendChild(item);
    });
  },

  announceRoom(status = 'lobby') {
    if (!this.lobbyChannel || !this.isHost) return;
    try {
      this.lobbyChannel.track({
        roomCode: this.roomCode,
        isHost: true,
        hostName: this.playerName,
        level: this.onlineRoom ? this.onlineRoom.level : 0,
        playerCount: this.onlineRoom ? this.onlineRoom.players.length : 1,
        status: status,
        createdAt: Date.now()
      });
      this.lobbyChannel.send({
        type: 'broadcast',
        event: 'room_event',
        payload: {
          action: status === 'closed' ? 'room_closed' : 'room_opened',
          room: {
            code: this.roomCode,
            hostName: this.playerName,
            level: this.onlineRoom ? this.onlineRoom.level : 0,
            playerCount: this.onlineRoom ? this.onlineRoom.players.length : 1
          }
        }
      });
    } catch (e) {}
  },

  async createRoom(name, level = 0) {
    this.init();
    this.playerName = name || 'Dobby';
    this.role = 'player';
    this.isHost = true;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    this.roomCode = code;

    this.onlineRoom = {
      code: code,
      host: this.playerId,
      players: [
        { id: this.playerId, name: this.playerName, house: 0, connected: true, keys: {} }
      ],
      spectators: [],
      level: level,
      status: 'lobby',
      deaths: 0,
      checkpoint: 80,
      checkpointsPassed: 0,
      runDeaths: 0,
      key: false,
      gateOpen: true,
      teamRespawn: 0,
      ropeLength: 185,
      ropeMax: 300,
      ticks: 0,
      pranks: 0,
      bumps: 0,
      variant: 0
    };

    session = { id: this.playerId, code: code, role: 'player', name: this.playerName, isOnline: true };
    sessionStorage.setItem('sockbound-session', JSON.stringify(session));

    await this.setupRoomChannel(true);
    this.announceRoom('lobby');

    state = E.snapshot(this.onlineRoom);
    receive(state);
    toast(`Đã tạo phòng Online ${code}! Hãy gửi mã hoặc link cho bạn bè.`);
    return code;
  },

  async joinRoom(code, name, role = 'player') {
    this.init();
    this.playerName = name || 'Dobby';
    this.role = role;
    this.isHost = false;
    this.roomCode = code.toUpperCase().trim();
    this.onlineRoom = null;

    session = { id: this.playerId, code: this.roomCode, role: role, name: this.playerName, isOnline: true };
    sessionStorage.setItem('sockbound-session', JSON.stringify(session));

    const ok = await this.setupRoomChannel(false);
    if (!ok && this.client) {
      throw new Error(`Không thể kết nối phòng ${this.roomCode}. Vui lòng thử lại.`);
    }

    toast(role === 'spectator' ? `Đang xem trực tiếp phòng ${this.roomCode}…` : `Đã vào phòng ${this.roomCode}! Chờ chủ phòng bắt đầu…`);
  },

  async setupRoomChannel(isHost) {
    if (this.roomChannel) {
      try { this.client?.removeChannel(this.roomChannel); } catch (e) {}
      this.roomChannel = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }

    const chanName = `sockbound-room-${this.roomCode}`;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(chanName);
        this.broadcastChannel.onmessage = (e) => this.handleMessage(e.data);
      } catch (err) {}
    }

    if (!this.client) return true;

    return new Promise((resolve) => {
      try {
        this.roomChannel = this.client.channel(chanName, {
          config: {
            presence: { key: this.playerId },
            broadcast: { ack: false, self: false }
          }
        });

        this.roomChannel.on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        });

        this.roomChannel.on('presence', { event: 'leave' }, ({ key }) => {
          this.handlePlayerLeave(key);
        });

        this.roomChannel.on('broadcast', { event: 'state' }, ({ payload }) => {
          if (!this.isHost && payload) {
            $('connection').hidden = true;
            receive(payload);
          }
        });

        this.roomChannel.on('broadcast', { event: 'input' }, ({ payload }) => {
          if (this.isHost && payload && this.onlineRoom) {
            const p = this.onlineRoom.players.find(x => x.id === payload.id);
            if (p) p.keys = cleanKeys(payload.keys);
          }
        });

        this.roomChannel.on('broadcast', { event: 'action' }, ({ payload }) => {
          this.handleAction(payload);
        });

        this.roomChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            $('connection').hidden = true;
            await this.roomChannel.track({
              id: this.playerId,
              name: this.playerName,
              role: this.role,
              isHost: this.isHost,
              joinedAt: Date.now()
            });
            if (!this.isHost) {
              this.sendAction({ type: 'request_state', senderId: this.playerId, name: this.playerName, role: this.role });
            }
            resolve(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            $('connection').hidden = false;
            resolve(false);
          }
        });
      } catch (err) {
        console.warn('[SupabaseNet] Channel setup error:', err);
        resolve(false);
      }
    });
  },

  handleMessage(data) {
    if (!data || data.senderId === this.playerId) return;
    if (data.event === 'state' && !this.isHost && data.payload) {
      receive(data.payload);
    } else if (data.event === 'input' && this.isHost && data.payload && this.onlineRoom) {
      const p = this.onlineRoom.players.find(x => x.id === data.payload.id);
      if (p) p.keys = cleanKeys(data.payload.keys);
    } else if (data.event === 'action' && data.payload) {
      this.handleAction(data.payload);
    }
  },

  handlePresenceSync() {
    if (!this.roomChannel) return;
    const pState = this.roomChannel.presenceState();
    const joinedUsers = [];
    for (const k in pState) {
      const arr = pState[k];
      if (arr && arr.length) joinedUsers.push(arr[0]);
    }

    if (this.isHost && this.onlineRoom) {
      const activePlayers = joinedUsers.filter(u => u.role === 'player');
      activePlayers.forEach((u) => {
        let p = this.onlineRoom.players.find(x => x.id === u.id);
        // Only add new players in the lobby: a player pushed mid-run has no x/y and NaN-poisons the rope physics.
        if (!p && this.onlineRoom.status === 'lobby' && this.onlineRoom.players.length < 8) {
          p = { id: u.id, name: u.name || 'Gia tinh', house: this.onlineRoom.players.length % 4, connected: true, keys: {} };
          this.onlineRoom.players.push(p);
          toast(`${p.name} vừa bước vào phòng!`);
        } else if (p) {
          p.connected = true;
          delete p.leftAt;
          p.name = u.name || p.name;
        }
      });
      this.onlineRoom.spectators = joinedUsers.filter(u => u.role === 'spectator').map(u => ({ id: u.id, name: u.name, connected: true }));
      const snap = E.snapshot(this.onlineRoom);
      receive(snap);
      this.broadcastState(snap);
      this.announceRoom(this.onlineRoom.status);
    } else {
      const hostPresent = joinedUsers.some(u => u.isHost);
      if (!hostPresent && joinedUsers.length > 0) {
        const players = joinedUsers.filter(u => u.role === 'player');
        if (players.length > 0) {
          players.sort((a, b) => a.id.localeCompare(b.id));
          if (players[0].id === this.playerId) {
            this.becomeHost(joinedUsers);
          }
        }
      }
    }
  },

  handlePlayerLeave(key) {
    if (this.isHost && this.onlineRoom) {
      const p = this.onlineRoom.players.find(x => x.id === key);
      if (p) {
        if (this.onlineRoom.status === 'lobby') {
          this.onlineRoom.players = this.onlineRoom.players.filter(x => x.id !== key);
          this.onlineRoom.players.forEach((x, i) => x.house = i % 4);
        } else {
          p.connected = false;
          p.leftAt = Date.now();
        }
        const snap = E.snapshot(this.onlineRoom);
        receive(snap);
        this.broadcastState(snap);
        this.announceRoom(this.onlineRoom.status);
      }
    }
  },

  becomeHost(joinedUsers = []) {
    this.isHost = true;
    toast('Chủ phòng đã rời đi. Bạn hiện là Chủ phòng mới! 👑');
    if (state) {
      const present = new Set(joinedUsers.map(u => u.id));
      present.add(this.playerId);
      const status = state.status || 'lobby';
      let players = state.players.map(p => ({
        ...p,
        connected: present.has(p.id),
        leftAt: present.has(p.id) ? undefined : Date.now(),
        keys: {}
      }));
      // The old host is gone: drop absent players in the lobby, keep them as disconnected mid-run (same as handlePlayerLeave).
      if (status === 'lobby') players = players.filter(p => p.connected).map((p, i) => ({ ...p, house: i % 4 }));
      this.onlineRoom = {
        code: this.roomCode,
        host: this.playerId,
        players,
        spectators: [],
        level: state.level || 0,
        status,
        deaths: state.deaths || 0,
        runDeaths: state.runDeaths || 0,
        checkpoint: state.checkpoint || 80,
        checkpointsPassed: state.checkpointsPassed || 0,
        teamRespawn: state.teamRespawn || 0,
        crumblingPlatforms: state.crumblingPlatforms || {},
        elapsed: state.elapsed,
        ticks: state.ticks || 0,
        key: state.key || false,
        gateOpen: true,
        ropeLength: state.ropeLength || 185,
        ropeMax: state.ropeMax || 300,
        pranks: state.pranks || 0,
        bumps: state.bumps || 0,
        variant: state.variant || 0,
        drumState: state.drumState || [],
        catState: (state.catState || []).map(c => ({ stomps: {}, launch: c.launch ?? -999 })),
        fogState: state.fogState || [],
        drumHits: state.drumHits || 0,
        dangleTotal: state.dangleTotal || 0,
        socksBanked: state.socksBanked || [],
        socksCarried: state.socksCarried || []
      };
    }
    if (this.roomChannel) {
      this.roomChannel.track({
        id: this.playerId,
        name: this.playerName,
        role: this.role,
        isHost: true,
        joinedAt: Date.now()
      });
    }
    this.announceRoom(this.onlineRoom ? this.onlineRoom.status : 'lobby');
    if (this.onlineRoom) {
      const snap = E.snapshot(this.onlineRoom);
      receive(snap);
      this.broadcastState(snap);
    }
  },

  handleAction(action) {
    if (!action) return;
    if (this.isHost && action.type === 'request_state') {
      if (this.onlineRoom) {
        if (action.role === 'player' && this.onlineRoom.status === 'lobby' && !this.onlineRoom.players.some(p => p.id === action.senderId)) {
          if (this.onlineRoom.players.length < 8) {
            this.onlineRoom.players.push({
              id: action.senderId,
              name: action.name || 'Gia tinh',
              house: this.onlineRoom.players.length % 4,
              connected: true,
              keys: {}
            });
            toast(`${action.name || 'Gia tinh'} vừa bước vào phòng!`);
          }
        }
        const snap = E.snapshot(this.onlineRoom);
        receive(snap);
        this.broadcastState(snap);
        this.announceRoom(this.onlineRoom.status);
      }
    } else if (!this.isHost) {
      if (action.type === 'start') {
        tone(330);
      } else if (action.type === 'retry') {
        tone(440);
      }
    }
  },

  broadcastState(snap) {
    if (this.roomChannel) {
      try {
        this.roomChannel.send({
          type: 'broadcast',
          event: 'state',
          payload: snap
        });
      } catch (e) {}
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.playerId,
          event: 'state',
          payload: snap
        });
      } catch (e) {}
    }
  },

  sendInput(keys) {
    const payload = { id: this.playerId, keys };
    if (this.roomChannel) {
      try {
        this.roomChannel.send({
          type: 'broadcast',
          event: 'input',
          payload
        });
      } catch (e) {}
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.playerId,
          event: 'input',
          payload
        });
      } catch (e) {}
    }
  },

  sendAction(action) {
    if (this.roomChannel) {
      try {
        this.roomChannel.send({
          type: 'broadcast',
          event: 'action',
          payload: action
        });
      } catch (e) {}
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.playerId,
          event: 'action',
          payload: action
        });
      } catch (e) {}
    }
  },

  startHostGame(level) {
    if (!this.isHost || !this.onlineRoom) return;
    this.onlineRoom.level = level;
    E.init(this.onlineRoom);
    this.onlineRoom.status = 'playing';
    const snap = E.snapshot(this.onlineRoom);
    receive(snap);
    this.broadcastState(snap);
    this.sendAction({ type: 'start', level });
    this.announceRoom('playing');
    tone(330);
  },

  retryHostGame() {
    if (!this.isHost || !this.onlineRoom) return;
    E.init(this.onlineRoom);
    this.onlineRoom.status = 'playing';
    const snap = E.snapshot(this.onlineRoom);
    receive(snap);
    this.broadcastState(snap);
    this.sendAction({ type: 'retry' });
    tone(440);
  },

  nextHostGame() {
    if (!this.isHost || !this.onlineRoom) return;
    this.onlineRoom.status = 'lobby';
    const snap = E.snapshot(this.onlineRoom);
    receive(snap);
    this.broadcastState(snap);
    this.sendAction({ type: 'next' });
    this.announceRoom('lobby');
  },

  // A player who stays disconnected mid-run would freeze the engine forever (tick needs everyone connected).
  // After a grace period, drop them; fall back to the lobby if fewer than 2 remain.
  pruneDisconnected(graceMs = 15000) {
    const r = this.onlineRoom;
    if (!this.isHost || !r || r.status !== 'playing') return;
    const now = Date.now();
    const gone = r.players.filter(p => !p.connected && p.id !== this.playerId && now - (p.leftAt || now) > graceMs);
    if (!gone.length) return;
    r.players = r.players.filter(p => !gone.includes(p));
    if (r.players.length < 2) r.status = 'lobby';
    toast(`${gone.map(p => p.name).join(', ')} đã rời trận. ${r.status === 'lobby' ? 'Quay về sảnh.' : 'Cả đội tiếp tục!'}`);
    const snap = E.snapshot(r);
    receive(snap);
    this.broadcastState(snap);
    this.announceRoom(r.status);
  },

  leave() {
    this.announceRoom('closed');
    if (this.roomChannel) {
      try {
        this.roomChannel.untrack();
        this.client?.removeChannel(this.roomChannel);
      } catch (e) {}
      this.roomChannel = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }
    this.onlineRoom = null;
    this.isHost = false;
    this.roomCode = '';
  }
};

function tone(freq=440,time=.09){if(!sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.045,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+time);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+time);}catch{}}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
async function api(action,data={}){const res=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...session,...data})});const value=await res.json();if(!res.ok)throw Error(value.error||'Không thể kết nối máy chủ.');return value;}
function showError(e){$('error').textContent=e.message;toast(e.message);}
function toggleMode(mode){
  const isOnline = mode === 'online';
  const isLocal = mode === 'local';
  const isLan = mode === 'lan';
  $('online-tab')?.classList.toggle('active', isOnline);
  $('local-tab')?.classList.toggle('active', isLocal);
  $('lan-tab')?.classList.toggle('active', isLan);
  if($('online-setup')) $('online-setup').hidden = !isOnline;
  if($('local-setup')) $('local-setup').hidden = !isLocal;
  if($('lan-setup')) $('lan-setup').hidden = !isLan;
  $('error').textContent = '';
  if(isOnline && typeof SupabaseNet !== 'undefined') SupabaseNet.init();
}
levels.forEach((level,index)=>{const option=document.createElement('option');option.value=index;option.textContent=String(index+1).padStart(2,'0')+' · '+level.name;$('map-select').append(option);$('lan-map-select').append(option.cloneNode(true));});
$('online-tab')?.addEventListener('click', ()=>toggleMode('online'));
$('local-tab')?.addEventListener('click', ()=>toggleMode('local'));
$('lan-tab')?.addEventListener('click', ()=>toggleMode('lan'));

if($('online-name')){
  $('online-name').value = localStorage.getItem('sockbound-name') || 'Dobby';
  $('online-name').oninput = e => {
    localStorage.setItem('sockbound-name', e.target.value.trim());
    if($('name')) $('name').value = e.target.value;
  };
}
if($('name')){
  $('name').value = localStorage.getItem('sockbound-name') || 'Dobby';
  $('name').oninput = e => {
    localStorage.setItem('sockbound-name', e.target.value.trim());
    if($('online-name')) $('online-name').value = e.target.value;
  };
}

async function enterOnline(action, customCode){
  if(pending) return;
  pending = true;
  const btn = action === 'create' ? $('online-create') : action === 'spectate' ? $('online-spectate') : $('online-join');
  if(btn) btn.disabled = true;
  const name = ($('online-name')?.value.trim() || 'Dobby');
  const code = (customCode || $('online-code')?.value.trim().toUpperCase() || '');
  try{
    if(action === 'create'){
      await SupabaseNet.createRoom(name, Number($('map-select').value || 0));
    } else if(action === 'join'){
      if(!code) throw new Error('Vui lòng nhập mã phòng 6 ký tự.');
      await SupabaseNet.joinRoom(code, name, 'player');
    } else if(action === 'spectate'){
      if(!code) throw new Error('Vui lòng nhập mã phòng cần xem.');
      await SupabaseNet.joinRoom(code, name, 'spectator');
    }
  }catch(err){
    showError(err);
  }finally{
    pending = false;
    if(btn) btn.disabled = false;
  }
}

$('online-create')?.addEventListener('click', ()=>enterOnline('create'));
$('online-join')?.addEventListener('click', ()=>enterOnline('join'));
$('online-code')?.addEventListener('keydown', e=>{if(e.key==='Enter') enterOnline('join');});
$('online-spectate')?.addEventListener('click', ()=>enterOnline('spectate'));

document.querySelectorAll('[data-count]').forEach(b=>b.onclick=()=>{count=Number(b.dataset.count);document.querySelectorAll('[data-count]').forEach(x=>x.classList.toggle('active',x===b));});
$('local-start').onclick=()=>{localRoom={code:'LOCAL',host:'p0',players:Array.from({length:count},(_,i)=>({id:'p'+i,name:['Dobby','Winky','Kreacher','Hokey','Topsy','Tipsy','Binky','Pip'][i],house:i,connected:true})),level:Number($('map-select').value),deaths:0,status:'lobby'};session={id:'p0',code:'LOCAL'};E.init(localRoom);keys={};pulses={};paused=false;lastStatus='';receive(E.snapshot(localRoom));tone(330);};
async function enter(action){if(pending)return;pending=true;const button=$(action);button.disabled=true;try{session=await api(action,{name:$('name').value,code:$('code').value.trim()});sessionStorage.setItem('sockbound-session',JSON.stringify(session));connect();}catch(e){showError(e);}finally{pending=false;button.disabled=false;}}
function connect(){source?.close();source=new EventSource('/api/events?'+new URLSearchParams(session));source.onmessage=e=>{try{$('connection').hidden=true;receive(JSON.parse(e.data));}catch{}};source.onerror=()=>{$('connection').hidden=false;keys={};pulses={};};source.onopen=()=>{$('connection').hidden=true;};}
function scoreUI(s,watching){
 const points=s.score||{},won=s.status==='won';$('score-bar').hidden=!['playing','won'].includes(s.status);
 $('team-score').textContent=(points.total||0).toLocaleString('vi-VN');
 const sec=Math.floor(s.seconds||0);$('run-clock').textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
 $('run-falls').textContent=`${s.runDeaths||0} lần ngã`;
 if(!won)return;
 $('result-score').textContent=(points.total||0).toLocaleString('vi-VN');$('score-stars').textContent='★'.repeat(points.stars||1)+'☆'.repeat(3-(points.stars||1));$('score-stars').setAttribute('aria-label',`${points.stars||1} trên 3 sao`);
 const list=$('score-breakdown');list.replaceChildren();for(const[key,label]of [['checkpoints','Cờ nghỉ đã vượt'],['sock','Tìm được vớ'],['finish','Cả đội cùng thoát'],['speed','Thưởng tốc độ'],['care','Thưởng ít ngã'],['bonus','Huy hiệu'],['socks',`Vớ dọc đường (${points.sockCount||0}/${points.sockTotal||0})`]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent='+'+(points[key]||0).toLocaleString('vi-VN');list.append(dt,dd);}
 if(points.badges&&(points.badges.sync||points.badges.rope)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=[points.badges.sync&&'🥁 Nhịp hoàn hảo',points.badges.rope&&'🪢 Không ai treo dây'].filter(Boolean).join(' · ');dd.textContent='★';list.append(dt,dd);}
  $('score-best').textContent='';if(watching)return;
 try{const key=`sockbound-best-${s.level}-${s.players.length}`,previous=Number(localStorage.getItem(key)||0),best=Math.max(previous,points.total||0);if(lastStatus!=='won'&&best>previous)localStorage.setItem(key,String(best));$('score-best').textContent=`Kỷ lục trên máy này · ${s.players.length} người: ${best.toLocaleString('vi-VN')} điểm`;}catch{}
}
let lastDrumHits=0,lastLaunch={},lastOpen={},lastCarried=0,lastBanked=0;
// V2 audio/toast cues: drum beat on each plate landing, fanfare when a gate opens, whoosh on catapult launch.
function v2Cues(s){
 if((s.drumHits||0)>lastDrumHits)tone(520+((s.drumHits||0)%4)*90,.07);lastDrumHits=s.drumHits||0;
 (s.drumState||[]).forEach((d,i)=>{if(d.open&&!lastOpen[i]){tone(660,.1);setTimeout(()=>tone(880,.14),90);toast(d.until>0?`Cửa mở! Chạy mau — ${((d.until-s.ticks)/60).toFixed(1)} giây!`:'Đúng nhịp! Cửa đã mở cho cả đội 🥁');}lastOpen[i]=!!d.open;});
 const carried=(s.socksCarried||[]).length,banked=(s.socksBanked||[]).length;
 if(carried>lastCarried){tone(990,.06);setTimeout(()=>tone(1320,.08),50);toast(`🧦 Nhặt được vớ! Qua cờ nghỉ tiếp theo để cất (+${E.SOCK_POINTS} điểm/chiếc)`);}
 else if(carried<lastCarried&&banked<=lastBanked)toast(`💨 Cả đội ngã — rơi mất ${lastCarried} chiếc vớ chưa cất!`);
 if(banked>lastBanked&&lastBanked>=0&&s.status!=='lobby'){const tot=(levels[s.level].bonusSocks||[]).length;toast(banked>=tot?`🧦✨ Đủ bộ ${tot} chiếc vớ! +${E.SOCK_SET_BONUS} thưởng`:`🧦 Đã cất ${banked}/${tot} chiếc vớ`);}
 lastCarried=carried;lastBanked=banked;
 (s.catState||[]).forEach((c,i)=>{if(c.launch>(lastLaunch[i]??-999)&&s.ticks-c.launch<10){tone(300,.08);setTimeout(()=>tone(900,.16),60);}lastLaunch[i]=c.launch;});
}
function receive(s){state=s;const watching=session?.role==='spectator',ended=s.status==='ended',local=!!localRoom,online=!!session?.isOnline,host=!watching&&(local?true:online?SupabaseNet.isHost:s.host===session?.id),waiting=s.status==='lobby',won=s.status==='won';$('lobby').hidden=true;$('ended').hidden=!ended;$('spectator-badge').hidden=!watching;$('exit').textContent=watching?'Thoát xem':'Rời phòng';document.querySelector('.control-guide').hidden=watching;$('waiting').hidden=!waiting;$('result').hidden=!won;$('exit').hidden=false;$('retry').hidden=waiting||!host;$('pause').hidden=waiting||watching||ended;$('start').hidden=!host;$('lan-map-select').hidden=!host;$('lan-map-label').hidden=!host;$('start').disabled=s.players.filter(p=>p.connected).length<2;$('room-code').textContent=s.code;$('chapter').textContent=String(s.level+1).padStart(2,'0');$('level-title').textContent=levels[s.level].name;$('sock-status').textContent=s.key?'🧦 Đã tìm được vớ':'♧ Tìm chiếc vớ';$('sock-status').style.color=s.key?'#e8c885':'';$('hint').textContent=waiting?'Mời bạn bè vào phòng. Hành trình cần ít nhất 2 gia tinh.':levels[s.level].hint;$('death-count').textContent=s.deaths?`${s.deaths} lần vấp · vẫn cùng nhau`:'Dây đàn hồi · X ném bạn';$('wait-note').textContent=host?(s.players.length<2?'Cần ít nhất 2 gia tinh.':'Mọi người đã sẵn sàng? Chủ phòng bắt đầu nhé.'):'Đợi chủ phòng bắt đầu…';$('room-label').textContent=local?`✧ ${count} gia tinh · chung bàn phím`:(online?`ONLINE SUPABASE · PHÒNG ${s.code} · ${s.players.length}/8 GIA TINH · ${s.spectatorCount||0} khán giả`:`PHÒNG ${s.code} · ${s.players.length}/8 GIA TINH · ${s.spectatorCount||0} khán giả`);
 scoreUI(s,watching);
 document.querySelector('.stage').classList.toggle('playing',!waiting);
 if(waiting){const members=$('members');members.replaceChildren();for(let i=0;i<8;i++){const p=s.players[i],el=document.createElement('div');el.className='member'+(p?'':' empty');const icon=document.createElement('b');icon.textContent=p?'✦':'+';icon.style.color=colors[(p?.house??i)%4];el.append(icon,document.createTextNode(p?p.name:'Chờ bạn'));if(p){const small=document.createElement('small');small.textContent=!p.connected?'Mất kết nối':p.id===s.host?'Chủ phòng':'Đã tham gia';el.append(small);}members.append(el);}}
 if(won){$('result-title').textContent='Cả hội đã tự do!';$('result-copy').textContent=`${levels[s.level].name} · ${s.players.length} gia tinh cùng thoát · ${Math.round(s.elapsed||0)} giây · ${s.pranks||0} cú ném bạn · ${s.bumps||0} cú va chạm`;$('next').textContent='Chọn hành trình khác';$('next').hidden=!host;$('result-note').textContent=host?'Hành trình hoàn thành! Chọn một map mới hoặc chơi lại.':'Đợi chủ phòng chọn hành trình mới…';}
 if(s.status==='playing'&&s.level!==lastLevel){toast(levels[s.level].toast||levels[s.level].hint);lastDrumHits=s.drumHits||0;lastCarried=0;lastBanked=0;lastLaunch={};lastOpen={};lastLevel=s.level;lastPranks=0;lastBumps=0;lastCheckpoint=80;}if(s.deaths>lastDeaths){tone(160,.12);lastDeaths=s.deaths;}if(s.pranks>lastPranks){tone(700,.12);toast(['Gửi đồng đội bằng đường hàng không!','Bạn ơi, bay trước đi!','Đồng đội đã được nâng cấp thành tên lửa.'][s.pranks%3]);}if(s.bumps>lastBumps){tone(220,.1);(s.players||[]).forEach(p=>{if(p.spin>15){for(let k=0;k<5;k++)spawnParticle(p.x+15,p.y+22,(Math.random()-.5)*7,-1.5-Math.random()*4.5,'#ffd700',8,24,'star');}});if(s.bumps%3===1)toast('Va trúng vật cản! Bị đẩy lùi rồi — nhớ nhảy qua nhé! 🎃');}if(s.checkpoint>lastCheckpoint){const pts=Math.round(2200/Math.max(1,levels[s.level].checkpoints.length));toast(`+${pts} điểm đội! Đã lưu điểm nghỉ cho cả hội.`);}v2Cues(s);const danglingElves=(s.players||[]).filter(p=>p.dangling);if(danglingElves.length>lastDanglingCount){tone(250,.22);toast(`${danglingElves[0].name} đang treo lơ lửng bên bờ vực! Kéo bạn lên mau! 🪢`);}lastDanglingCount=danglingElves.length;lastPranks=s.pranks||0;lastBumps=s.bumps||0;lastCheckpoint=s.checkpoint||80;
 if(s.status==='won'&&lastStatus!=='won'){tone(660,.2);setTimeout(()=>tone(880,.3),180);}if(s.key&&!lastKey){tone(880,.18);toast('+500 điểm đội! Đã tìm được vớ, cùng tới cửa nhé.');}lastStatus=s.status;lastKey=s.key;
 $('touch').hidden=waiting||won||watching||ended;
 if(watching)$('hint').textContent=ended?'Các gia tinh đã rời phòng.':waiting?'Khán giả đang chờ chủ phòng bắt đầu.':'Bạn đang xem trực tiếp · '+s.players.length+' gia tinh · '+(s.spectatorCount||0)+' khán giả';
 if(ended){source?.close();$('connection').hidden=true;sessionStorage.removeItem('sockbound-session');keys={};pulses={};}
 if(local&&shownControls!==count){shownControls=count;document.querySelector('.control-guide').innerHTML='<span class="local-controls">'+controlLabels.slice(0,count).map((label,i)=>'<span>P'+(i+1)+': <b>'+label+'</b></span>').join('')+'<span class="control-legend">Đi · nhảy · ném bạn</span></span>'; }
}
$('spectate').onclick=()=>enter('spectate');$('create').onclick=()=>enter('create');$('join').onclick=()=>enter('join');$('code').onkeydown=e=>{if(e.key==='Enter')enter('join');};
$('start').onclick=()=>{const lvl=Number($('lan-map-select').value);if(session?.isOnline){SupabaseNet.startHostGame(lvl);}else{api('start',{level:lvl}).catch(showError);}};
$('retry').onclick=()=>{keys={};pulses={};paused=false;if(localRoom){E.init(localRoom);receive(E.snapshot(localRoom));}else if(session?.isOnline){SupabaseNet.retryHostGame();}else api('retry').catch(showError);};
$('next').onclick=()=>{keys={};pulses={};if(localRoom){localRoom=null;session=null;state=null;$('result').hidden=true;$('score-bar').hidden=true;$('lobby').hidden=false;$('exit').hidden=true;$('retry').hidden=true;$('pause').hidden=true;document.querySelector('.stage').classList.remove('playing');toggleMode('online');}else if(session?.isOnline){SupabaseNet.nextHostGame();}else api('next').catch(showError);};
$('exit').onclick=async()=>{if(session?.isOnline){SupabaseNet.leave();}else if(!localRoom&&session){try{await api('leave');}catch{}}source?.close();source=null;localRoom=null;state=null;session=null;sessionStorage.removeItem('sockbound-session');location.reload();};
$('back-lobby').onclick=()=>$('exit').click();
$('pause').onclick=()=>{paused=!paused;keys={};pulses={};$('pause').textContent=paused?'▶':'Ⅱ';toast(paused?(localRoom?'Tạm dừng. Bấm ▶ để tiếp tục.':'Bạn đang dừng điều khiển. Đồng đội vẫn tiếp tục.'): 'Tiếp tục cuộc phiêu lưu.');};
$('copy').onclick=async()=>{const isOnline=!!session?.isOnline,shareUrl=`${location.origin}/?room=${state.code}`,copyText=isOnline?shareUrl:state.code;try{await navigator.clipboard.writeText(copyText);$('copy-label').textContent=isOnline?'ĐÃ SAO CHÉP LINK':'ĐÃ SAO CHÉP MÃ';setTimeout(()=>$('copy-label').textContent='SAO CHÉP MÃ',1800);toast(isOnline?`Đã sao chép link phòng: ${shareUrl}`:`Đã sao chép mã phòng: ${state.code}`);}catch{toast('Mã phòng: '+state.code);}};
if($('lan-map-select')) $('lan-map-select').onchange=()=>{if(session?.isOnline&&SupabaseNet.isHost&&SupabaseNet.onlineRoom){SupabaseNet.onlineRoom.level=Number($('lan-map-select').value);const snap=E.snapshot(SupabaseNet.onlineRoom);receive(snap);SupabaseNet.broadcastState(snap);SupabaseNet.announceRoom(SupabaseNet.onlineRoom.status);}};
$('help').onclick=()=>{keys={};pulses={};$('help-dialog').showModal();};$('close-help').onclick=()=>$('help-dialog').close();$('help-dialog').onclick=e=>{if(e.target===$('help-dialog'))$('help-dialog').close();};
$('sound').onclick=()=>{sound=!sound;$('sound').style.color=sound?'#e6c782':'';$('sound').setAttribute('aria-label',sound?'Tắt âm thanh':'Bật âm thanh');$('sound').title=sound?'Tắt âm thanh':'Bật âm thanh';tone(523);};
function pressed(key){return !!keys[key]||performance.now()<(pulses[key]||0);}
const actionKeys=new Set(mappings.flatMap(m=>m.slice(2)).concat('Space'));
const gameKeys=new Set([...mappings.flat(),'Space']);addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName)||$('help-dialog').open)return;if(gameKeys.has(e.code)&&state?.status==='playing'&&session?.role!=='spectator'){e.preventDefault();if(actionKeys.has(e.code)&&!e.repeat)pulses[e.code]=performance.now()+140;keys[e.code]=true;}});addEventListener('keyup',e=>{delete keys[e.code];});addEventListener('blur',()=>{keys={};pulses={};if(session&&!localRoom&&session.role!=='spectator')api('input',{left:false,right:false,jump:false,toss:false}).catch(()=>{});});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys={};pulses={};}});
document.querySelectorAll('[data-key]').forEach(button=>{const key={left:'KeyA',right:'KeyD',jump:'KeyW',toss:'KeyX'}[button.dataset.key];button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);if(actionKeys.has(key))pulses[key]=performance.now()+140;keys[key]=true;};button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>{delete keys[key];};});
setInterval(()=>{
  if(!session||localRoom||session.role==='spectator'||state?.status!=='playing')return;
  const left=!paused&&(keys.KeyA||keys.ArrowLeft),right=!paused&&(keys.KeyD||keys.ArrowRight),jump=!paused&&(pressed("KeyW")||pressed("ArrowUp")||pressed("Space")),toss=!paused&&(pressed("KeyX")||pressed("Slash"));
  const inputData={left:!!left,right:!!right,jump:!!jump,toss:!!toss};
  if(session.isOnline){
    if(!SupabaseNet.isHost) SupabaseNet.sendInput(inputData);
  } else {
    api('input',inputData).catch(()=>{});
  }
},50);
// --- UPGRADED GRAPHICS ENGINE: HIGH-FIDELITY PROCEDURAL ART & PARTICLES ---
const scarfColors=[['#800b14','#e5b73b'],['#154726','#b8c6b9'],['#0d2346','#cd8b38'],['#f4c430','#2d2926']];
let particles=[];
function spawnParticle(x,y,vx,vy,color,size,life,type='dot'){
  if(particles.length>140)particles.shift();
  particles.push({x,y,vx,vy,color,size,maxLife:life,life,type});
}

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function line(x,y,x2,y2,c,width=1){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function arch(x,y,w,h,fill,stroke){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w/2);ctx.bezierCurveTo(x,y,x+w,y,x+w,y+w/2);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=8;ctx.stroke();}}
let seed=8721;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
const stars=Array.from({length:85},()=>[rand()*1200,rand()*510,rand()]);

function glow(x,y,r,color){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,color);
  g.addColorStop(1,'transparent');
  ctx.fillStyle=g;
  ctx.fillRect(x-r,y-r,r*2,r*2);
}

function candle(x,y,t){
  // Candle stick with wax drip
  rect(x-4,y,8,22,'#e8dec0');
  rect(x-5,y+2,2,8,'#d5c9a6');
  rect(x-9,y+20,18,5,'#6d5f3f');
  rect(x-11,y+23,22,3,'#4a402a');
  // Wick
  line(x,y,x,y-5,'#2c2419',1.5);
  // Flickering Flame
  const flick=Math.sin(t*14+x)*1.8;
  const flameH=15+Math.sin(t*18)*2;
  // Outer warm halo
  glow(x+flick*0.5,y-8,38+Math.sin(t*8)*4,'rgba(240, 185, 70, 0.22)');
  // Teardrop outer flame
  ctx.fillStyle='#f5a623';
  ctx.beginPath();
  ctx.moveTo(x-4,y-3);
  ctx.quadraticCurveTo(x-5+flick,y-flameH*0.6,x+flick,y-flameH);
  ctx.quadraticCurveTo(x+5+flick,y-flameH*0.6,x+4,y-3);
  ctx.closePath();
  ctx.fill();
  // Inner white-hot core
  ctx.fillStyle='#fffbee';
  ctx.beginPath();
  ctx.moveTo(x-2,y-4);
  ctx.quadraticCurveTo(x-2+flick*0.5,y-flameH*0.5,x+flick*0.5,y-flameH*0.75);
  ctx.quadraticCurveTo(x+2+flick*0.5,y-flameH*0.5,x+2,y-4);
  ctx.closePath();
  ctx.fill();
}

function sock(x,y,t,size=1){
  ctx.save();
  const floatY=y+Math.sin(t*3)*7;
  ctx.translate(x,floatY);
  ctx.scale(size,size);
  // Magical rotating sparkle aura
  glow(0,0,50,'rgba(235, 205, 110, 0.35)');
  for(let i=0;i<4;i++){
    const ang=t*2+i*(Math.PI/2);
    const sx=Math.cos(ang)*28,sy=Math.sin(ang)*16;
    ctx.fillStyle='rgba(255, 240, 160, 0.7)';
    ctx.beginPath();ctx.arc(sx,sy,2.2,0,Math.PI*2);ctx.fill();
  }
  // Sock silhouette with wool stripes
  poly([[-11,-22],[11,-22],[11,6],[3,14],[-12,22],[-22,17],[-22,8],[-11,0]],'#f2e8cf');
  // Wool stripes
  rect(-11,-15,22,4,'#c44536');
  rect(-11,-7,22,4,'#c44536');
  poly([[-12,14],[-4,8],[-1,11],[-8,18]],'#c44536');
  // Fluffy white cuff
  ctx.fillStyle='#ffffff';
  ctx.beginPath();
  ctx.ellipse(0,-22,13,5,0,0,Math.PI*2);
  ctx.fill();
  rect(-13,-24,26,4,'#ffffff');
  // Golden heel & toe reinforcement
  poly([[-22,8],[-14,9],[-11,18],[-16,21],[-22,17]],'#e0a96d');
  poly([[1,7],[11,6],[7,12],[3,14]],'#e0a96d');
  // Little hanging pom-pom
  line(-8,-20,-14,-14,'#e0d8c3',2);
  ctx.fillStyle='#ffffff';
  ctx.beginPath();ctx.arc(-14,-13,3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function elf(p,t,demo=false){
  const x=p.x+15,y=p.y+22,houseIdx=p.house%4;
  const col=colors[houseIdx],scarf=scarfColors[houseIdx];
  if(p.dead){
    glow(x,y,28,'rgba(190, 225, 200, 0.45)');
    ctx.fillStyle='rgba(235, 215, 170, 0.6)';
    ctx.font='bold 11px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('💫',x,y-8);
    return;
  }
  ctx.save();
  ctx.translate(Math.round(x),Math.round(y));

  const facing=p.facing||1;
  // Dynamic Squash & Stretch
  let sx=1,sy=1;
  if(p.dangling){
    sy=1.18;sx=0.88;
  }else if(p.hauling){
    sy=0.92;sx=1.08;
  }else if(!p.ground){
    if(p.vy<-1.5){
      sy=Math.min(1.22,1-p.vy*0.016);
      sx=1/Math.sqrt(sy);
    }else if(p.vy>3){
      sy=Math.max(0.85,1-p.vy*0.012);
      sx=1/Math.sqrt(sy);
    }
  }else if(Math.abs(p.vx||0)>0.6){
    sy=1+Math.sin(t*18)*0.045;
    sx=1/sy;
  }
  ctx.scale(sx*facing,sy);
  if(p.spin)ctx.rotate(Math.sin(p.spin*0.25)*0.6);
  if(p.dangling){
    const swing=Math.sin(t*12+(p.kickX||0)*0.35)*0.22;
    ctx.rotate(swing);
  }else if(p.hauling){
    ctx.rotate(-facing*0.22);
    ctx.translate((Math.random()-0.5)*1.5,0);
  }
  if(p.invincible&&Math.floor(t*14)%2)ctx.globalAlpha=0.65;

  // 1. Dynamic Ground Contact Shadow (hide shadow if dangling far over abyss)
  if(!p.dangling){
    const groundDist=Math.max(0,570-(p.y+44));
    const shW=Math.max(4,18-groundDist*0.12),shH=Math.max(2,5-groundDist*0.04);
    ctx.fillStyle='rgba(4, 15, 18, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0,24+groundDist*0.3,shW,shH,0,0,Math.PI*2);
    ctx.fill();
  }

  // Walking or dangling gait cycle
  const isMoving=Math.abs(p.vx||0)>0.5;
  const gait=isMoving?Math.sin(t*16)*4:0;
  const kickL=p.dangling?Math.sin(t*26)*7:gait;
  const kickR=p.dangling?-Math.cos(t*26)*7:-gait;

  // 2. Cute Elf Boots & Legs
  ctx.fillStyle='#99ac8f';
  rect(-9,14+kickL,6,9,'#99ac8f');
  rect(3,14+kickR,6,9,'#99ac8f');
  // Curled leather shoes
  ctx.fillStyle='#5a4834';
  poly([[-11,21+kickL],[-2,21+kickL],[-1,24+kickL],[-9,24+kickL],[-13,22+kickL]],'#5a4834');
  poly([[1,21+kickR],[10,21+kickR],[12,22+kickR],[3,24+kickR],[1,24+kickR]],'#5a4834');

  // 3. Burlap Tunic Body
  poly([[-11,-1],[11,-1],[15,17],[-15,17]],'#c2ad82');
  // Robe shading & stitches
  poly([[-15,17],[15,17],[12,19],[-12,19]],'#9b8762');
  line(-8,4,8,4,'#7a6747',1);
  line(0,0,0,16,'#7a6747',1.2);
  // Little stitched patch
  rect(4,8,6,5,'#ad9871');
  line(4,8,10,8,'#5c4a30',0.8);
  line(4,13,10,13,'#5c4a30',0.8);
  // Belt with brass buckle
  rect(-13,11,26,3,'#54432d');
  rect(-3,10,6,5,'#dfbe6e');
  rect(-1,11,2,3,'#54432d');

  // 4. Arms & Hands
  if(p.dangling){
    // Arms reaching straight UP to clutch rope
    rect(-15,-18,5,16,'#99ac8f');
    rect(10,-18,5,16,'#99ac8f');
    ctx.fillStyle='#b8cbb0';
    ctx.beginPath();ctx.arc(-12.5,-20,3.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(12.5,-20,3.5,0,Math.PI*2);ctx.fill();
  }else if(p.hauling){
    // Arms pulling back tight to chest
    rect(-14,2,10,6,'#99ac8f');
    rect(4,2,10,6,'#99ac8f');
    ctx.fillStyle='#b8cbb0';
    ctx.beginPath();ctx.arc(-4,5,3.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(14,5,3.8,0,Math.PI*2);ctx.fill();
  }else{
    rect(-16,3+gait,5,10,'#99ac8f');
    rect(11,3-gait,5,10,'#99ac8f');
    ctx.fillStyle='#b8cbb0';
    ctx.beginPath();ctx.arc(-13,13+gait,3.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(14,13-gait,3.2,0,Math.PI*2);ctx.fill();
  }

  // 5. House Scarf (Knitted stripes & fluttering tails)
  rect(-11,-3,22,6,scarf[0]);
  rect(-9,-3,18,6,scarf[1]);
  rect(-5,-3,10,6,scarf[0]);
  const scarfWave=p.dangling?Math.sin(t*18)*5:Math.sin(t*12)*3-(Math.abs(p.vx||0)*2);
  poly([[-9,1],[-15+scarfWave,7],[-13+scarfWave,16],[-7,4]],scarf[0]);
  poly([[-14+scarfWave,8],[-13+scarfWave,14],[-10+scarfWave,15],[-11+scarfWave,9]],scarf[1]);

  // 6. Iconic House-Elf Ears
  const earBounce=Math.sin(t*16)*(isMoving||p.dangling?2.5:0.5)-(p.vy||0)*0.35;
  poly([[-9,-17],[-28,-19+earBounce],[-21,-7+earBounce*0.5],[-9,-5]],'#a8bfa0');
  poly([[-11,-15],[-23,-17+earBounce],[-18,-9+earBounce*0.5]],'#cda59b');
  poly([[9,-17],[28,-19+earBounce],[21,-7+earBounce*0.5],[9,-5]],'#a8bfa0');
  poly([[11,-15],[23,-17+earBounce],[18,-9+earBounce*0.5]],'#cda59b');

  // 7. Head & Adorable Big Eyes
  rect(-12,-22,24,20,'#b4caa9');
  rect(-9,-24,18,4,'#b4caa9');
  // Blush
  ctx.fillStyle='rgba(215, 140, 130, 0.45)';
  ctx.beginPath();ctx.arc(-8,-8,4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(8,-8,4,0,Math.PI*2);ctx.fill();

  // Big Expressive Eyes & Facial Expressions
  const blink=Math.sin(t*2.8+houseIdx*1.7)>0.96;
  if(p.dangling){
    // Terrified wide anime panic eyes with tears flying
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.ellipse(-5.5,-12,5,6,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(5.5,-12,5,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1b2c1e';
    ctx.beginPath();ctx.arc(-5.5,-12,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5.5,-12,2,0,Math.PI*2);ctx.fill();
    // Flying panic tears/sweat
    glow(-16,-18,10,'rgba(100, 210, 255, 0.45)');
    ctx.fillStyle='#6dd3f7';
    ctx.beginPath();ctx.ellipse(-15,-16,2.5,4,0.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(15,-16,2.5,4,-0.4,0,Math.PI*2);ctx.fill();
  }else if(p.hauling){
    // Determined gritted squint with furrowed brow
    line(-9,-15,-2,-13,'#1f3022',2.5);
    line(9,-15,2,-13,'#1f3022',2.5);
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.ellipse(-5.5,-12,4,3,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(5.5,-12,4,3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1b2c1e';
    ctx.beginPath();ctx.arc(-5,-12,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5,-12,2,0,Math.PI*2);ctx.fill();
  }else if(blink){
    line(-8,-12,-3,-12,'#283d2c',2);
    line(3,-12,8,-12,'#283d2c',2);
  }else if(state?.key){
    ctx.strokeStyle='#243c29';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(-5.5,-10,4,Math.PI*1.15,Math.PI*1.85);ctx.stroke();
    ctx.beginPath();ctx.arc(5.5,-10,4,Math.PI*1.15,Math.PI*1.85);ctx.stroke();
  }else if(p.spin||p.dead){
    line(-8,-14,-3,-9,'#243c29',2);line(-3,-14,-8,-9,'#243c29',2);
    line(3,-14,8,-9,'#243c29',2);line(8,-14,3,-9,'#243c29',2);
  }else{
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.ellipse(-5.5,-12,4.5,5.5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(5.5,-12,4.5,5.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2b3c2e';
    ctx.beginPath();ctx.ellipse(-5,-12,3,4,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(6,-12,3,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.arc(-6,-14,1.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5,-14,1.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(-4,-11,0.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(7,-11,0.8,0,Math.PI*2);ctx.fill();
  }

  // Nose and Mouth
  poly([[-1.5,-9],[1.5,-9],[0,-6]],'#8fa585');
  if(p.dangling){
    // Screaming open gasp mouth
    ctx.fillStyle='#6b1c1c';
    ctx.beginPath();ctx.ellipse(0,-3,4.5,5.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff9999';
    ctx.beginPath();ctx.arc(0,0,3,0,Math.PI);ctx.fill();
  }else if(p.hauling){
    // Gritted teeth
    rect(-6,-5,12,4,'#ffffff');
    ctx.strokeStyle='#3a2d1d';ctx.lineWidth=1;
    ctx.strokeRect(-6,-5,12,4);
    line(-6,-3,6,-3,'#3a2d1d',1);
    line(-2,-5,-2,-1,'#3a2d1d',1);
    line(2,-5,2,-1,'#3a2d1d',1);
  }else{
    ctx.strokeStyle='#587053';ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.arc(0,-4,3,0.1,Math.PI-0.1);
    ctx.stroke();
  }

  // 8. House Cap / Hair Accent
  rect(-10,-25,20,3,scarf[0]);
  rect(-5,-27,10,3,scarf[1]);

  // 9. Comic Badges, Name Tag & Unmirrored Speech Bubble
  ctx.save();
  ctx.scale(facing, 1); // unmirror text so it's always readable

  if(p.dangling){
    const bubbleBob=Math.sin(t*18)*3;
    const by=-66+bubbleBob;
    ctx.fillStyle='#ffffff';
    ctx.strokeStyle='#1b2c1e';
    ctx.lineWidth=2;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(-30,by,60,19,6);
    else ctx.rect(-30,by,60,19);
    ctx.fill();ctx.stroke();
    poly([[-4,by+19],[4,by+19],[0,by+25]],'#ffffff');
    line(-4,by+19,0,by+25,'#1b2c1e',1.8);
    line(4,by+19,0,by+25,'#1b2c1e',1.8);
    ctx.fillStyle='#c82333';
    ctx.font='bold 11px Arial, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('CỨU! 💦',0,by+14);
  }else if(p.hauling){
    const badgeBob=Math.sin(t*14)*2;
    const by=-66+badgeBob;
    ctx.fillStyle='#ffc107';
    ctx.strokeStyle='#b23b00';
    ctx.lineWidth=2;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(-32,by,64,19,6);
    else ctx.rect(-32,by,64,19);
    ctx.fill();ctx.stroke();
    poly([[-4,by+19],[4,by+19],[0,by+25]],'#ffc107');
    line(-4,by+19,0,by+25,'#b23b00',1.8);
    line(4,by+19,0,by+25,'#b23b00',1.8);
    ctx.fillStyle='#7e1a00';
    ctx.font='bold 11px Arial, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('GỒNG! 💪',0,by+14);
  }else if(p.stackHeight >= 3){
    const by=-66+Math.sin(t*14)*2;
    ctx.fillStyle='#ffd700';
    ctx.strokeStyle='#8b6914';
    ctx.lineWidth=2;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(-42,by,84,19,6);
    else ctx.rect(-42,by,84,19);
    ctx.fill();ctx.stroke();
    poly([[-4,by+19],[4,by+19],[0,by+25]],'#ffd700');
    line(-4,by+19,0,by+25,'#8b6914',1.8);
    line(4,by+19,0,by+25,'#8b6914',1.8);
    ctx.fillStyle='#3d2700';
    ctx.font='bold 11px Arial, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('🌟 3 TẦNG! LÊN! 🚀',0,by+14);
  }else if(p.stackHeight === 2){
    const by=-66+Math.sin(t*14)*2;
    ctx.fillStyle='#98fb98';
    ctx.strokeStyle='#2e8b57';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(-36,by,72,18,5);
    else ctx.rect(-36,by,72,18);
    ctx.fill();ctx.stroke();
    poly([[-4,by+18],[4,by+18],[0,by+23]],'#98fb98');
    ctx.fillStyle='#004d20';
    ctx.font='bold 10px Arial, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('🪜 2/3 TẦNG',0,by+13);
  }

  // Local Player Indicator & Name Tag
  ctx.font='bold 10px Arial, sans-serif';
  const label=(demo?'':p.name)+(p.ready?' ✓':'');
  const txtW=ctx.measureText(label).width;
  const tagW=Math.max(34,txtW+12);

  if(p.id===session?.id&&!localRoom){
    const arrowFloat=Math.sin(t*5)*3;
    glow(0,-54+arrowFloat,16,'rgba(235, 205, 110, 0.4)');
    poly([[-6,-56+arrowFloat],[6,-56+arrowFloat],[0,-49+arrowFloat]],'#f5d376');
    poly([[-4,-56+arrowFloat],[4,-56+arrowFloat],[0,-51+arrowFloat]],'#fffbee');
  }

  ctx.fillStyle='rgba(6, 20, 24, 0.82)';
  ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(-tagW/2,-43,tagW,14,4);
  else ctx.rect(-tagW/2,-43,tagW,14);
  ctx.fill();
  ctx.strokeStyle=p.ready?'#ffd56b88':'rgba(100, 130, 110, 0.45)';
  ctx.lineWidth=1;
  ctx.stroke();
  ctx.fillStyle=p.ready?'#ffd56b':'#dbe6d2';
  ctx.textAlign='center';
  ctx.fillText(label,0,-32);

  ctx.restore();
  ctx.restore();
}

function platform(x,y,w,h,moving=false){
  // Beveled Castle Stone Block
  const baseGrad=ctx.createLinearGradient(x,y,x,y+h);
  baseGrad.addColorStop(0,moving?'#2a4a45':'#2d3f35');
  baseGrad.addColorStop(1,moving?'#172f2a':'#192821');
  rect(x,y,w,h,baseGrad);

  // Top highlight edge (Carved flagstone cap)
  rect(x,y,w,5,moving?'#65d2b7':'#7a936a');
  rect(x,y+5,w,2,'#1b2e25');
  rect(x,y+h-3,w,3,'#101a15');

  // Brick seams & vertical masonry mortar
  for(let a=0;a<w;a+=38){
    line(x+a,y+7,x+a,y+h-3,'rgba(20, 36, 28, 0.65)',1.2);
  }
  if(h>30){
    for(let b=22;b<h;b+=22){
      line(x,y+b,x+w,y+b,'rgba(16, 30, 24, 0.75)',1.5);
      for(let a=((b/22)%2)*19;a<w;a+=44){
        line(x+a,y+b,x+a,y+b+22,'rgba(20, 38, 30, 0.6)',1.2);
      }
    }
  }

  // Decorative Hanging Moss / Creeping Ivy
  for(let a=12;a<w-12;a+=28){
    poly([[x+a,y+5],[x+a+4,y+11],[x+a+8,y+5]],'#627d54');
    poly([[x+a+2,y+5],[x+a+4,y+8]],'#7d9b6c');
  }

  // Moving platform glowing teal runic pulse
  if(moving){
    glow(x+w/2,y+h/2,50,'rgba(60, 220, 185, 0.15)');
    ctx.strokeStyle='rgba(100, 245, 215, 0.55)';
    ctx.lineWidth=1.5;
    for(let rx=x+15;rx<x+w-10;rx+=26){
      ctx.strokeRect(rx,y+10,8,8);
    }
  }

  // High Bastion Wall (3-Player Human Tower)
  if(h >= 120){
    for(let cx = x; cx < x + w - 8; cx += 22){
      rect(cx, y - 6, 14, 6, '#435848');
      rect(cx + 2, y - 8, 10, 2, '#7a936a');
    }
    ctx.save();
    ctx.fillStyle = '#edd4a0';
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲ CHỒNG 3 TẦNG ▲', x + w / 2, y + 36);
    ctx.fillStyle = 'rgba(215, 235, 220, 0.45)';
    ctx.fillText('HOGWARTS WALL', x + w / 2, y + 52);
    ctx.restore();
  }
}

function drawGreatHall(t){
  // 1. Great Hall Midnight Atmosphere Background
  const bg=ctx.createLinearGradient(0,0,0,660);
  bg.addColorStop(0,'#0a131e');
  bg.addColorStop(0.55,'#122426');
  bg.addColorStop(1,'#0d1a18');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,1200,660);

  // Subtle Ashlar Stone Wall Grid
  for(let y=0;y<570;y+=46){
    line(0,y,1200,y,'rgba(110, 150, 130, 0.05)',1);
    for(let x=((y/46)%2)*52;x<1200;x+=104){
      line(x,y,x,y+46,'rgba(110, 150, 130, 0.04)',1);
    }
  }

  // 2. Tall Gothic Arched Windows with Moonlight & Volumetric Godrays
  for(const x of [95,505,1015]){
    // Window Stone Frame
    arch(x,75,100,275,'#060e17','#344840');
    // Outer sky outside window
    const skyGrad=ctx.createLinearGradient(x,80,x,350);
    skyGrad.addColorStop(0,'#1e3650');
    skyGrad.addColorStop(1,'#0c1b26');
    arch(x+7,82,86,262,skyGrad);

    // Glowing Moon in center window
    if(x===505){
      glow(x+46,140,45,'rgba(220, 240, 255, 0.3)');
      ctx.fillStyle='#eaf2f8';
      ctx.beginPath();ctx.arc(x+46,140,16,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#c8d9e6';
      ctx.beginPath();ctx.arc(x+50,138,13,0,Math.PI*2);ctx.fill();
    }

    // Mountain silhouettes in background
    poly([[x+6,310],[x+25,255],[x+44,275],[x+65,225],[x+78,280],[x+93,344],[x+6,344]],'#091720');

    // Gothic Tracery Bars & Rose Mullion
    rect(x+47,80,6,270,'#273731');
    rect(x,215,100,6,'#273731');
    ctx.strokeStyle='#273731';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(x+50,135,22,0,Math.PI*2);ctx.stroke();

    // VOLUMETRIC MOONLIGHT SHAFTS (GODRAYS)
    const ray=ctx.createLinearGradient(x+50,220,x-20,570);
    ray.addColorStop(0,'rgba(195, 230, 255, 0.16)');
    ray.addColorStop(0.6,'rgba(165, 215, 245, 0.08)');
    ray.addColorStop(1,'transparent');
    poly([[x+8,220],[x+92,220],[x+160,570],[x-50,570]],ray);
  }

  // 3. 4 Grand House Banners (Gryffindor, Slytherin, Ravenclaw, Hufflepuff)
  const bannerPalettes=[
    {bg:'#741217',border:'#dcb44a',crest:'🦁'},
    {bg:'#124024',border:'#a8bba8',crest:'🐍'},
    {bg:'#102746',border:'#be853b',crest:'🦅'},
    {bg:'#bf8f24',border:'#2c2825',crest:'🦡'}
  ];
  for(let i=0;i<4;i++){
    const bx=270+i*185;
    // Hanging cord & brass rings
    line(bx+30,0,bx+30,82,'rgba(160, 140, 90, 0.45)',2);
    rect(bx-2,82,64,7,'#7a653c');
    // Banner body with swallowtail cutout
    const bp=bannerPalettes[i];
    poly([[bx+2,89],[bx+60,89],[bx+60,215],[bx+31,238],[bx+2,215]],bp.bg+'dd');
    // Ornate gold/silver borders
    rect(bx+8,91,2,118,bp.border+'66');
    rect(bx+52,91,2,118,bp.border+'66');
    // Gold fringe hem
    line(bx+2,216,bx+31,239,bp.border,2);
    line(bx+60,216,bx+31,239,bp.border,2);
    // House Crest Icon
    ctx.font='24px serif';
    ctx.textAlign='center';
    ctx.fillText(bp.crest,bx+31,160);
  }

  // 4. Carved Stone Columns
  for(const x of [28,235,453,687,928,1170]){
    rect(x,0,14,570,'#1d302a');
    rect(x-6,46,26,12,'#36473e');
    rect(x-6,415,26,12,'#36473e');
    rect(x-8,552,30,18,'#36473e');
  }

  // 5. Floating Great Hall Candles
  const candleNodes=[[160,110],[330,95],[440,125],[550,89],[585,81],[620,89],[760,115],[880,95],[1050,120]];
  for(const [cx,cy] of candleNodes){
    candle(cx,cy+Math.sin(t*1.6+cx)*6,t);
  }

  // 6. Ambient Floating Magic Dust Particles
  stars.forEach(([x,y,r],i)=>{
    const a=0.15+Math.sin(t*0.9+i)*0.11;
    const dy=(y+t*(4+r*5))%555;
    ctx.fillStyle=`rgba(235, 230, 165, ${a})`;
    ctx.beginPath();
    ctx.arc(x+Math.sin(t*0.2+i)*8,dy,1+r*1.5,0,Math.PI*2);
    ctx.fill();
  });

}

let cameraX=0,cameraY=0,cameraZoom=1,cameraLevel=-1;
// ---- V2 co-op mechanics. Geometry always comes from E.solidsFor()/engine helpers so drawings match hitboxes.
const KIND_LABEL={stack2:'🧗 CHỒNG VAI',stack:'🧗 THÁP NGƯỜI',toss:'🤾 NÉM LÊN',cat:'⚖️ BẮN LÊN'};
function drawV2(s,l,t){
  if(!l.v2)return;
  const st=s||{level:levels.indexOf(l),ticks:0,players:[{},{}]},ticks=st.ticks||0,n=(st.players||[]).length||2;
  const solids=E.solidsFor({...st,players:st.players||[{},{}]});
  // Rope-shrink zones: violet tint over the whole stretch.
  for(const[a,b]of l.shrinkZones||[]){
    const g=ctx.createLinearGradient(0,300,0,570);g.addColorStop(0,'rgba(120,70,190,0)');g.addColorStop(1,'rgba(120,70,190,0.22)');
    rect(a,300,b-a,270,g);ctx.fillStyle='#cdb6f2';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText('🪢 BÙA RÚT DÂY · DÂY NGẮN',(a+b)/2,322);
  }
  // Floating ledges.
  solids.filter(b=>b.block).forEach(b=>{
    const bk=l.blocks.find(k=>k.x===b.x);
    rect(b.x+8,b.y+18,6,570-b.y-18,'#3c4f45');rect(b.x+b.w-14,b.y+18,6,570-b.y-18,'#3c4f45');
    platform(b.x,b.y,b.w,b.h);
    ctx.fillStyle='#f0dca6';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText(KIND_LABEL[bk?.kind]||'',b.x+b.w/2,b.y-30);
  });
  // Drum plates + gates.
  (l.drums||[]).forEach((d,i)=>{
    const ds=st.drumState?.[i]||{hits:{}},k=E.activePlates(d,n);
    d.plates.forEach((pl,j)=>{
      const y=E.plateY(l,pl,n),on=j<k,hit=ds.hits?.[j]!=null&&ticks-ds.hits[j]<=E.V2.window;
      const beat=on&&!ds.open?(Math.sin(ticks/10)+1)/2:0;
      rect(pl.x,y-5,pl.w,5,ds.open?'#7fc48a':hit?'#ffe27a':on?`rgba(214,160,80,${0.55+beat*0.4})`:'#45524c');
      if(hit||ds.open)glow(pl.x+pl.w/2,y-4,34,ds.open?'rgba(120,220,140,0.35)':'rgba(255,220,110,0.5)');
      if(on&&!ds.open){ctx.fillStyle='#ffe9b0';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🥁',pl.x+pl.w/2,y-10);}
    });
    const g=d.gate,closed=solids.some(b=>b.gate===i);
    if(closed){
      rect(g.x,300,g.w,270,'#2b2433');for(let yy=310;yy<570;yy+=26)rect(g.x+4,yy,g.w-8,4,'#6b5a7a');
      ctx.fillStyle='#e9d6ff';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText(`🔒 ${k} NHỊP`,g.x+g.w/2,292);
    }else if(ds.until>0){
      const left=Math.max(0,ds.until-ticks);rect(g.x,560,g.w,10,'#4b6b52');
      ctx.fillStyle=left<40?'#ff8a6b':'#bfe8c4';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText(`⏳ ${(left/60).toFixed(1)}s`,g.x+g.w/2,548);
    }
  });
  // Catapult planks: tilt for a moment after a launch.
  (l.catapults||[]).forEach((c,i)=>{
    const since=ticks-(st.catState?.[i]?.launch??-999),tilt=since>=0&&since<15?(1-since/15)*0.25:0;
    ctx.save();ctx.translate(c.x+c.w/2,c.y+7);ctx.rotate(-tilt);
    rect(-c.w/2,-7,c.w,14,'#8d6a3e');rect(-c.w/2,-7,c.w/2,4,'#d98a55');rect(0,-7,c.w/2,4,'#9fd28c');ctx.restore();
    poly([[c.x+c.w/2-16,570],[c.x+c.w/2+16,570],[c.x+c.w/2,c.y+12]],'#4a614e');
    ctx.fillStyle='#f3d9a8';ctx.font='bold 10px Arial';ctx.textAlign='center';
    ctx.fillText(n>=3?'DẬM ×2':'DẬM',c.x+c.w/4,c.y-8);ctx.fillText('BAY ↑',c.x+c.w*3/4,c.y-8);
  });
  // House bridges: each colour is only solid for its own elf.
  solids.filter(b=>b.house!=null).forEach(b=>{
    const col=colors[b.house%colors.length];
    ctx.globalAlpha=0.9;rect(b.x,b.y,b.w,b.h,col);ctx.globalAlpha=1;
    rect(b.x,b.y,b.w,3,'rgba(255,255,255,0.45)');glow(b.x+b.w/2,b.y+8,30,col+'55');
  });
}
// Dementor fog: dark wall chasing the team (drawn above the elves).
function drawFog(s,l,t){
  (l.fogs||[]).forEach((f,i)=>{
    const fs=s?.fogState?.[i];if(!fs||!fs.active)return;
    const x=fs.x,g=ctx.createLinearGradient(x-260,0,x+40,0);
    g.addColorStop(0,'rgba(8,10,18,0.95)');g.addColorStop(0.75,'rgba(20,24,40,0.85)');g.addColorStop(1,'rgba(40,50,70,0)');
    rect(x-1400,0,1440,660,g);
    for(let k=0;k<3;k++){const yy=200+k*110+Math.sin(t*2+k)*20,xx=x-40-k*30;
      ctx.fillStyle='rgba(12,14,22,0.9)';ctx.beginPath();ctx.ellipse(xx,yy,18,30,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(170,200,230,0.5)';ctx.fillRect(xx-8,yy-10,4,3);ctx.fillRect(xx+4,yy-10,4,3);}
    ctx.fillStyle='#c4d4ef';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('🌫️ GIÁM NGỤC ĐUỔI!',x-80,150);
  });
}
function fogShake(s,l){
  let d=1e9;(l.fogs||[]).forEach((f,i)=>{const fs=s?.fogState?.[i];if(fs?.active)for(const p of s.players||[])d=Math.min(d,p.x-fs.x);});
  return d<160?(160-d)/160*5:0;
}
function draw(t){
  const s=state,l=levels[s?.level||0];

  const active=!!s&&s.status!=='lobby',team=s?.players||[];
  const minX=team.length?Math.min(...team.map(p=>p.x)):0,maxX=team.length?Math.max(...team.map(p=>p.x+30)):0;
  const minY=team.length?Math.min(...team.map(p=>p.y)):526;
  const targetZoom=active?Math.min(1,1000/Math.max(1000,maxX-minX+220)):1;
  const targetY=active&&minY<380?Math.min(125,(380-minY)*.65):0;
  if(cameraLevel!==s?.level||!active){cameraX=0;cameraY=0;cameraZoom=targetZoom;cameraLevel=s?.level;particles=[];}
  cameraZoom+=(targetZoom-cameraZoom)*.08;
  cameraY+=(targetY-cameraY)*.08;
  const viewWidth=1200/cameraZoom;
  const targetX=active?Math.max(0,Math.min(l.width-viewWidth,(minX+maxX)/2-viewWidth*.43)):0;
  cameraX+=(targetX-cameraX)*.09;
  // Scenery scrolls more slowly than the physical route.
  ctx.save();const drift=cameraX*.28;ctx.translate(-drift%1200,0);
  drawMapScene(l.map,t);ctx.translate(1200,0);drawMapScene(l.map,t);ctx.restore();
  const shake=active?fogShake(s,l):0;
  ctx.save();ctx.translate(-cameraX*cameraZoom+(Math.random()-.5)*shake,570*(1-cameraZoom)+cameraY+(Math.random()-.5)*shake);ctx.scale(cameraZoom,cameraZoom);
  for(const [i,stop] of l.stops.entries()){
    line(stop.x,570,stop.x,400,'#ac9161',3);rect(stop.x-12,395,240,48,'#20332eee');
    ctx.textAlign='left';ctx.fillStyle='#edd4a0';ctx.font='bold 15px Georgia';ctx.fillText(`${i+1}/${l.stops.length} · ${stop.label}`,stop.x,416);ctx.font='12px Arial';ctx.fillStyle='#b6c9b8';ctx.fillText(stop.instruction,stop.x,433);
  }

  // Clearly visible pits between the safe stretches of floor.
  const floors=l.platforms.filter(([,y])=>y===570).sort((a,b)=>a[0]-b[0]);
  for(let i=0;i<floors.length-1;i++){const left=floors[i][0]+floors[i][2],right=floors[i+1][0];
    rect(left,570,right-left,90,'#08181ddd');ctx.textAlign='center';ctx.fillStyle='#aac6c2';ctx.font='12px Arial';ctx.fillText('🪢 KÉO BẠN!',(left+right)/2,628);
  }
  // 7. Platforms
  for(const [x,y,w,h] of l.platforms)platform(x,y,w,h);
  // Must match engine solidsFor(): sin(ticks/80 + x) * amp
  for(const[x,y,w,h,amp]of l.movers)platform(x,y+Math.sin((s?.ticks||0)/80+x)*amp,w,h,true);
  // Crumbling platforms (engine solids that were previously invisible): shake while crumbling, vanish when collapsed.
  (l.crumbling||[]).forEach(([x,y,w,h],idx)=>{
    const st=s?.crumblingPlatforms?.[idx];
    if(st?.collapsed)return;
    const shaking=!!st?.crumbling;
    const ox=shaking?(Math.random()-.5)*3:0,oy=shaking?(Math.random()-.5)*2:0;
    platform(x+ox,y+oy,w,h);
    rect(x+ox,y+oy,w,h,shaking?'rgba(220, 90, 60, 0.45)':'rgba(190, 150, 90, 0.25)');
    line(x+ox+w*.3,y+oy+3,x+ox+w*.45,y+oy+h-2,'#1a120c',1.2);line(x+ox+w*.65,y+oy+2,x+ox+w*.55,y+oy+h-3,'#1a120c',1.2);
  });
  // Helper blocks next to bastion walls (engine adds them only for teams of fewer than 3).
  if(l.walls&&(s?.players?.length||0)<3){for(const wl of l.walls){platform(wl.x-70,505,45,65);ctx.fillStyle='#e8d29a';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('BỆ ĐỠ',wl.x-47,498);}}
  drawV2(s,l,t);

  // 8. Sàn Bơ Trơn (Ice / Butter Slide)
  for(const [ix1,ix2]of l.iceZones){
    const butterGrad=ctx.createLinearGradient(ix1,568,ix1,582);
    butterGrad.addColorStop(0,'#ffe17d');
    butterGrad.addColorStop(1,'#d4a637');
    rect(ix1,570,ix2-ix1,8,butterGrad);
    // Specular shine highlights
    ctx.fillStyle='rgba(255, 255, 220, 0.75)';
    for(let x=ix1+10;x<ix2-20;x+=50){
      rect(x+Math.sin(t*2+x)*8,571,18,2,'rgba(255, 255, 230, 0.65)');
    }
    glow((ix1+ix2)/2,574,80,'rgba(255, 215, 80, 0.2)');
    ctx.fillStyle='#f5d376';
    ctx.textAlign='center';
    ctx.font='bold 11px Arial, sans-serif';
    ctx.fillText('🧈 SÀN BƠ TRƠN TRƯỢT · COI CHỪNG PHANH GẤP!',(ix1+ix2)/2,602);
  }

  for(const[a,b]of l.conveyors){
    rect(a,570,b-a,12,'#426865');const dir=Math.sin((s?.ticks||0)/130)>0?1:-1;
    ctx.fillStyle='#c9ded1';ctx.font='bold 20px Arial';ctx.textAlign='center';
    for(let x=a+20;x<b;x+=42)ctx.fillText(dir>0?'›':'‹',x,584);
    ctx.font='bold 11px Arial';ctx.fillText('BĂNG CHUYỀN ĐỔI CHIỀU',(a+b)/2,607);
  }
  // 9. Đệm Lò Xo Boing (Springs)
  for(const[x,y,w] of l.springs||[]){
    // Brass compression coil base
    rect(x+6,y-4,w-12,4,'#5c4a28');
    for(let i=0;i<4;i++){
      line(x+10+i*18,y,x+18+i*18,y-7,'#dcb258',3);
      line(x+18+i*18,y-7,x+26+i*18,y,'#dcb258',3);
    }
    // Royal velvet bouncy cushion
    const squish=Math.abs(Math.sin(t*5))*2;
    const cushionGrad=ctx.createLinearGradient(x,y-14+squish,x,y-4);
    cushionGrad.addColorStop(0,'#9973c7');
    cushionGrad.addColorStop(1,'#5f3f87');
    rect(x+2,y-15+squish,w-4,11-squish,cushionGrad);
    rect(x+4,y-16+squish,w-8,3,'#c9a8ed');
    // Golden Tufted buttons
    for(let i=0;i<3;i++){
      ctx.fillStyle='#f5d376';
      ctx.beginPath();ctx.arc(x+16+i*22,y-10+squish,2,0,Math.PI*2);ctx.fill();
    }
    glow(x+w/2,y-12,35,'rgba(175, 120, 240, 0.25)');
    ctx.fillStyle='#d7bcf0';
    ctx.textAlign='center';
    ctx.font='bold 11px Arial, sans-serif';
    ctx.fillText('BOING! ✦',x+w/2,y-24);
  }

  // 10. Bẫy Gai (Spikes)
  for(const [x,y,w,h] of l.spikes){
    rect(x,y+h-3,w,4,'#31473b');
    for(let a=0;a<w;a+=16){
      poly([[x+a,y+h],[x+a+8,y],[x+a+16,y+h]],'#859c91');
      poly([[x+a+8,y],[x+a+16,y+h],[x+a+12,y+h]],'#a8beaf'); // metallic glint
    }
  }

  // 11. Dynamic Obstacles (Pumpkins, Fans, Seesaw, Rotors)
  const obs=s?.obstacles||E.obstacles({level:0,ticks:t*60,variant:0});

  // Seesaw
  for(const[x,y,w]of l.seesaws){
    // Must match engine solidsFor() seesaw slope: sin(ticks/75 + variant + x) * 0.2
    const k=Math.sin((s?.ticks||0)/75+(s?.variant||0)+x)*.2;
    poly([[x,y-k*w/2],[x+w,y+k*w/2],[x+w,y+k*w/2+16],[x,y-k*w/2+16]],'#8d784a');
    line(x,y-k*w/2,x+w,y+k*w/2,'#ecd28c',4);
    poly([[x+w/2-24,570],[x+w/2+24,570],[x+w/2,y+15]],'#4a614e');
  }

  // Steampunk Wind Fans
  for(const f of l.fans||[]){
    const[x,y,w,dir]=f;
    rect(x-10,552,32,18,'#5b6f79');
    // Pulsing fans (V2): only blow while on — must match engine fanOn().
    if(!E.fanOn(f,s?.ticks||0)){ctx.save();ctx.translate(x+8,534);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);poly([[0,0],[7,-28],[18,-20],[8,3]],'#6b7f7c');}ctx.restore();ctx.fillStyle='#8aa09c';ctx.font='bold 11px Arial, sans-serif';ctx.textAlign='center';ctx.fillText('… quạt nghỉ',x+w/2,y-8);continue;}
    const rotor=t*8;
    ctx.save();ctx.translate(x+8,534);ctx.rotate(rotor);
    for(let i=0;i<4;i++){
      ctx.rotate(Math.PI/2);
      poly([[0,0],[7,-28],[18,-20],[8,3]],'#b6d4cf');
    }
    ctx.restore();
    glow(x+w/2,510,w,'rgba(140, 205, 215, 0.16)');
    for(let i=0;i<8;i++){
      const xx=x+((t*110+i*31)%w),yy=y+20+i*13;
      line(xx,yy,xx+dir*26,yy,'rgba(200, 240, 235, 0.45)',2);
    }
    ctx.fillStyle='#c0deda';
    ctx.font='bold 11px Arial, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('💨 PHÙÙÙ!',x+w/2,y-8);
  }

  // Glowing Jack-o'-Lantern Pumpkins
  for(const b of obs.pumpkins){
    ctx.save();
    ctx.translate(b.x+20,b.y+20);
    ctx.rotate(b.phase);
    // Pumpkin body
    glow(0,0,32,'rgba(240, 140, 40, 0.35)');
    ctx.fillStyle='#e08528';
    ctx.beginPath();ctx.ellipse(0,0,21,19,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#aa551a';ctx.lineWidth=2;
    for(const px of [-11,0,11]){
      ctx.beginPath();ctx.ellipse(px*0.4,0,8,18,0,0,Math.PI*2);ctx.stroke();
    }
    rect(-3,-23,6,7,'#627e47'); // green stem
    // Carved Glowing Eyes & Grin
    ctx.fillStyle='#ffe45e';
    poly([[-11,-3],[-4,-7],[-4,1]],'#ffe45e');
    poly([[11,-3],[4,-7],[4,1]],'#ffe45e');
    line(-7,8,7,8,'#ffe45e',3);
    ctx.restore();
  }

  // Rotors
  for(const b of obs.rotors){
    rect(b.x-5,b.y,10,570-b.y,'#4c6145');
    // Engine checks 4 blades at angle + i*90° (rotating with +angle); draw the same cross so hitboxes are visible.
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);
    rect(-b.r,-10,b.r*2,20,'#8c764e');rect(-10,-b.r,20,b.r*2,'#8c764e');
    rect(-b.r+4,-6,b.r*2-8,12,'#c7ad6e');rect(-6,-b.r+4,12,b.r*2-8,'#c7ad6e');
    ctx.fillStyle='#ffde85';
    ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  // Checkpoints
  for(const x of l.checkpoints){
    const reached=(s?.checkpoint||80)>=x;
    line(x,570,x,532,reached?'#e2c86e':'#62806c',2.5);
    poly([[x,532],[x+26,539],[x,548]],reached?'#f3d472':'#698b76');
    if(reached)glow(x+10,540,24,'rgba(235, 205, 110, 0.3)');
  }

  // 12. Hogwarts Oak Exit Door
  const[dx,dy]=l.door;
  arch(dx-16,dy-11,76,85,'#1f362c','#3e5645');
  arch(dx-6,dy,56,74,s?.key?'#4f7253':'#182c24');
  if(s?.key){
    // Golden rays pouring out when unlocked
    glow(dx+22,dy+35,110,'rgba(235, 210, 120, 0.45)');
    const doorBeam=ctx.createLinearGradient(dx+22,dy,dx-40,dy+74);
    doorBeam.addColorStop(0,'rgba(255, 240, 180, 0.55)');
    doorBeam.addColorStop(1,'transparent');
    poly([[dx+8,dy+10],[dx+36,dy+10],[dx+50,dy+74],[dx-10,dy+74]],doorBeam);
    for(let i=0;i<4;i++)rect(dx+8+i*10,dy+14,2,52,'rgba(255, 245, 200, 0.45)');
  }else{
    rect(dx+20,dy+34,8,12,'#9d8852');
    ctx.fillStyle='#b89e5a';ctx.font='20px Georgia, serif';
    ctx.fillText('🗝',dx+24,dy+29);
  }
  rect(dx-20,dy+72,84,6,'#556549');
  ctx.fillStyle='#c7d6b8';ctx.font='bold 10px Arial, sans-serif';
  ctx.textAlign='center';ctx.fillText('🚪 CÙNG NHAU THOÁT',dx+22,dy-22);

  // 12b. Bonus socks along the route (engine: lv.bonusSocks / E.sockPos). Banked = gone, carried = gone (shown in HUD).
  {const nP=(s?.players||[]).length||2,taken=new Set([...(s?.socksBanked||[]),...(s?.socksCarried||[])]);
   (l.bonusSocks||[]).forEach((bs,i)=>{
    if(taken.has(i))return;const sp=E.sockPos(l,bs,nP);
    glow(sp.x,sp.y,26,bs.dangle?'rgba(120,200,255,0.35)':'rgba(255,215,120,0.35)');
    sock(sp.x,sp.y-6,t*2+i,0.55);
    if(bs.dangle){ctx.fillStyle='#bfe4ff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('🪢 ĐU XUỐNG NHẶT',sp.x,sp.y+30);}
   });}
  // 13. The Sock Prop
  if(!s?.key){
    // The sock may move (V2 finale Snitch): always draw at the engine's keyPos.
    const kp=obs.keyPos||{x:l.key[0],y:l.key[1]};
    sock(kp.x,kp.y,t*2,1.35);
    ctx.fillStyle='#f5d98b';ctx.font='bold 12px Arial, sans-serif';
    ctx.textAlign='center';ctx.fillText(l.snitch?'🧦✨ VỚ SNITCH — NÉM BẠN LÊN CHỘP!':'🧦 LẤY VỚ!',kp.x,kp.y-44);
    // Spawn ambient stardust around the sock
    if(Math.random()<0.25){
      spawnParticle(kp.x+(Math.random()-0.5)*30,kp.y+(Math.random()-0.5)*30,(Math.random()-0.5)*0.5,-0.6-Math.random()*0.5,'#ffe07d',2.5,45,'star');
    }
  }

  // 14. MAGICAL LUMINESCENT ROPE (DÂY TRÓI PHÉP THUẬT)
  const players=s?.players||[{x:80,y:526,vx:0,house:0,id:'demo',name:'Dobby'},{x:950,y:526,vx:0,house:2,id:'demo2',name:'Winky'}];
  for(let i=0;i<players.length-1;i++){
    const a=players[i],b=players[i+1];
    if(a.dead||b.dead)continue;
    const ax=a.x+15,ay=a.y+30,bx=b.x+15,by=b.y+30;
    const dist=Math.hypot(bx-ax,by-ay);
    const ropeLimit=s?.ropeLength||185;
    const tension=dist/ropeLimit;
    const isDanglePair=a.dangling||b.dangling;
    const isHaulPair=a.hauling||b.hauling;
    const isStrained=tension>0.88||isDanglePair||isHaulPair;
    const slack=isDanglePair?2:Math.max(4,Math.min(46,(ropeLimit-dist)*0.22));

    // Tension jitter when strained or dangling
    let jx=0,jy=0;
    if(isStrained){
      const jit=Math.sin(t*55+i*3)*(isDanglePair?3:Math.min(5,(tension-0.88)*25));
      jx=-(by-ay)/dist*jit;
      jy=(bx-ax)/dist*jit;
      if(Math.random()<0.35){
        const rx=ax+(bx-ax)*Math.random(),ry=ay+(by-ay)*Math.random();
        spawnParticle(rx+jx,ry+jy,(Math.random()-0.5)*2.5,(Math.random()-0.5)*2.5,isDanglePair?'#ffd447':'#ff8833',2.5,22,'star');
      }
    }

    const midX=(ax+bx)/2+jx;
    const midY=Math.min(575,(ay+by)/2+slack)+jy;

    // 14.1 Drop shadow
    ctx.beginPath();
    ctx.moveTo(ax,ay+4);
    ctx.quadraticCurveTo(midX,midY+4,bx,by+4);
    ctx.strokeStyle='rgba(4, 15, 16, 0.4)';
    ctx.lineWidth=5;ctx.stroke();

    // 14.2 Outer Glowing Halo
    const glowCol=isStrained?'rgba(255, 75, 45, 0.65)':'rgba(235, 195, 80, 0.45)';
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.quadraticCurveTo(midX,midY,bx,by);
    ctx.strokeStyle=glowCol;
    ctx.lineWidth=isStrained?8:6;ctx.stroke();

    // 14.3 Braided Golden Strand
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.quadraticCurveTo(midX,midY,bx,by);
    ctx.strokeStyle=isStrained?'#ff6b4a':'#dcb048';
    ctx.lineWidth=3.5;
    ctx.setLineDash([6,3]);
    ctx.lineDashOffset=-t*18;
    ctx.stroke();
    ctx.setLineDash([]);

    // 14.4 Core Luminous White Strand
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.quadraticCurveTo(midX,midY,bx,by);
    ctx.strokeStyle='#fffdee';
    ctx.lineWidth=1.5;ctx.stroke();

    // 14.5 Golden Rune Attachment Carabiners
    rect(ax-4,ay-3,8,7,'#f5d376');
    rect(bx-4,by-3,8,7,'#f5d376');
  }

  // 15. Render Elves
  players.forEach(p=>{
    elf(p,t,!s);
    // Running dust particles
    if(p.ground&&Math.abs(p.vx||0)>2&&Math.random()<0.3){
      spawnParticle(p.x+15-(p.facing||1)*10,p.y+42,-(p.facing||1)*0.8,-0.4,'rgba(180, 195, 175, 0.5)',3.5,20,'dot');
    }
    // Hauling dust puffs & strain particles
    if(p.hauling&&Math.random()<0.45){
      spawnParticle(p.x+15+(Math.random()-0.5)*16,p.y+42,(Math.random()-0.5)*1.8,-0.8,'rgba(215, 205, 175, 0.7)',4,24,'dot');
    }
    // Dangling sweat droplets falling
    if(p.dangling&&Math.random()<0.35){
      spawnParticle(p.x+15+(Math.random()-0.5)*12,p.y+10,(Math.random()-0.5)*1.5,1.2,'#6dd3f7',2.5,25,'dot');
    }
  });
  drawFog(s,l,t);

  // 16. Dynamic Particles Update & Draw
  for(let i=particles.length-1;i>=0;i--){
    const pt=particles[i];
    pt.x+=pt.vx;pt.y+=pt.vy;pt.life--;
    const progress=pt.life/pt.maxLife;
    if(pt.life<=0){particles.splice(i,1);continue;}
    ctx.save();
    ctx.globalAlpha=progress*0.85;
    ctx.fillStyle=pt.color;
    if(pt.type==='star'){
      ctx.translate(pt.x,pt.y);
      ctx.rotate(pt.life*0.1);
      const r=pt.size*progress;
      ctx.beginPath();
      ctx.moveTo(0,-r);ctx.lineTo(r*0.3,-r*0.3);ctx.lineTo(r,0);ctx.lineTo(r*0.3,r*0.3);
      ctx.lineTo(0,r);ctx.lineTo(-r*0.3,r*0.3);ctx.lineTo(-r,0);ctx.lineTo(-r*0.3,-r*0.3);
      ctx.closePath();ctx.fill();
    }else{
      ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size*progress,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
  if(active){
    const progress=Math.min(1,Math.max(0,(minX-80)/(l.door[0]-80)));
    rect(28,24,1144,40,'#102c29dc');rect(42,49,1116,4,'#496259');rect(42,49,1116*progress,4,'#e0c477');
    ctx.textAlign='left';ctx.fillStyle='#edddb8';ctx.font='bold 14px Arial';
    const stop=Math.min(l.stops.length-1,Math.max(0,l.stops.findLastIndex(v=>minX>=v.x)));
    ctx.fillText(`CHẶNG ${stop+1}/${l.stops.length} · ${l.stops[stop]?.label||''}`,43,42);
    const sb=(s.socksBanked||[]).length,sc=(s.socksCarried||[]).length,st=(l.bonusSocks||[]).length;
    ctx.textAlign='right';ctx.fillText(`🧦 ${sb}/${st}${sc?` (+${sc} đang giữ)`:''} · ${Math.round(progress*100)}% · ${Math.max(0,l.checkpoints.filter(x=>x<=s.checkpoint).length)} điểm nghỉ`,1155,42);
  }
  // 17. HUD Messages
  if(s?.status==='playing'&&!localRoom&&s.players.some(p=>!p.connected)){
    ctx.fillStyle='rgba(18, 36, 28, 0.92)';
    ctx.fillRect(340,25,520,45);
    ctx.fillStyle='#e4d4a8';
    ctx.textAlign='center';
    ctx.font='14px Arial, sans-serif';
    ctx.fillText('Tạm dừng cả đội — đợi đồng đội kết nối lại hoặc rời phòng.',600,53);
  }
  if(s?.teamRespawn){
    ctx.fillStyle='rgba(8, 24, 21, 0.88)';
    ctx.fillRect(340,220,520,90);
    ctx.fillStyle='#f5e4b2';
    ctx.textAlign='center';
    ctx.font='bold 24px Georgia, serif';
    ctx.fillText(['Đồng đội là để… cùng ngã!','Gia tinh: 0. Sàn nhà: 1.','Chúng ta đang tập… tiếp đất.','Ai kéo? Không ai nhận.','Ngã cùng nhau cũng là teamwork!','Vớ chưa tự do, đầu gối đã tự do.'][((s.deaths||1)-1)%6],600,260);
    ctx.font='14px Arial, sans-serif';
    ctx.fillText('Hồi sinh ngay tại điểm nghỉ gần nhất. Vớ vẫn giữ!',600,289);
  }
  if(paused){
    ctx.fillStyle='rgba(6, 22, 22, 0.75)';
    ctx.fillRect(0,0,1200,660);
    ctx.fillStyle='#f5e3b5';
    ctx.textAlign='center';
    ctx.font='bold 32px Georgia, serif';
    ctx.fillText('Tạm dừng điều khiển',600,300);
  }
}
function loop(now){
  const delta=Math.min(now-lastFrame,100);
  lastFrame=now;
  if(localRoom&&localRoom.status==='playing'&&!paused&&!$('help-dialog').open){
    accumulator+=delta;
    while(accumulator>=1000/60){
      localRoom.players.forEach((p,i)=>{
        const [left,right,jump,toss]=mappings[i];
        p.keys={left:!!keys[left],right:!!keys[right],jump:!!(pressed(jump)||(i===0&&pressed("Space"))),toss:pressed(toss)};
      });
      E.tick(localRoom);
      accumulator-=1000/60;
    }
    state=E.snapshot(localRoom);
    if(now-localHudAt>100||state.status!==lastStatus){receive(state);localHudAt=now;}
  }
  // Online host is authoritative for everyone: pausing or opening help only stops the host's own input (keys are zeroed
  // via `paused`/help), it must never freeze the whole room.
  if(session?.isOnline&&SupabaseNet.isHost&&SupabaseNet.onlineRoom&&SupabaseNet.onlineRoom.status==='playing'){
    SupabaseNet.pruneDisconnected();
  }
  if(session?.isOnline&&SupabaseNet.isHost&&SupabaseNet.onlineRoom&&SupabaseNet.onlineRoom.status==='playing'){
    accumulator+=delta;
    while(accumulator>=1000/60){
      const hp = SupabaseNet.onlineRoom.players.find(p => p.id === SupabaseNet.playerId);
      if(hp){
        const left=!paused&&(keys.KeyA||keys.ArrowLeft),right=!paused&&(keys.KeyD||keys.ArrowRight),jump=!paused&&(pressed("KeyW")||pressed("ArrowUp")||pressed("Space")),toss=!paused&&(pressed("KeyX")||pressed("Slash"));
        hp.keys = { left: !!left, right: !!right, jump: !!jump, toss: !!toss };
      }
      E.tick(SupabaseNet.onlineRoom);
      accumulator-=1000/60;
    }
    state=E.snapshot(SupabaseNet.onlineRoom);
    if(now-localHudAt>50||state.status!==lastStatus){
      receive(state);
      SupabaseNet.broadcastState(state);
      localHudAt=now;
    }
  }
  draw(now/1000);
  requestAnimationFrame(loop);
}requestAnimationFrame(loop);
try{
  const saved=JSON.parse(sessionStorage.getItem('sockbound-session'));
  if(saved?.isOnline&&saved.code){
    session=saved;
    toggleMode('online');
    SupabaseNet.joinRoom(saved.code, saved.name||'Dobby', saved.role||'player').catch(()=>{});
  } else if(saved?.token){
    session=saved;
    toggleMode('lan');
    connect();
  } else {
    toggleMode('online');
  }
}catch{
  toggleMode('online');
}
const fromURL=new URLSearchParams(location.search).get('room');
if(fromURL){
  toggleMode('online');
  if($('online-code')) $('online-code').value=fromURL.slice(0,6).toUpperCase();
  if($('code')) $('code').value=fromURL.slice(0,6).toUpperCase();
  setTimeout(()=>enterOnline('join', fromURL.slice(0,6).toUpperCase()), 400);
}
const fromWatch=new URLSearchParams(location.search).get('watch');
if(fromWatch){
  toggleMode('online');
  if($('online-code')) $('online-code').value=fromWatch.slice(0,6).toUpperCase();
  if($('code')) $('code').value=fromWatch.slice(0,6).toUpperCase();
  setTimeout(()=>enterOnline('spectate', fromWatch.slice(0,6).toUpperCase()), 400);
}
const urlLevel=new URLSearchParams(location.search).get('level');if(urlLevel!==null&&$('map-select')){const targetLvl=Math.max(0,Math.min(levels.length-1,Number(urlLevel)));$('map-select').value=targetLvl;if($('lan-map-select'))$('lan-map-select').value=targetLvl;}
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'read_sockbound_room',description:'Read the current Sockbound game room, players, and level.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>state?{code:state.code,status:state.status,level:state.level+1,players:state.players.map(p=>p.name)}:{status:'start-screen'}});}catch{}}
