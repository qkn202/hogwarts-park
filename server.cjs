const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {levels,init,tick,snapshot}=require('./engine.cjs');
const rooms=new Map(),streams=new Map();const PORT=Number(process.env.PORT||3017);
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(value));};
function push(r){const data=`data: ${JSON.stringify(snapshot(r))}\n\n`;for(const p of [...r.players,...(r.spectators||[])]){const s=streams.get(p.id);if(s&&!s.destroyed)s.write(data);}}
function auth(body){const r=rooms.get(String(body.code||'').toUpperCase()),p=r&&[...r.players,...(r.spectators||[])].find(p=>p.id===body.id&&p.token===body.token);return {r,p};}
function closeRoom(r){const data=`data: ${JSON.stringify({...snapshot(r),status:'ended'})}\n\n`;for(const p of [...r.players,...(r.spectators||[])]){const stream=streams.get(p.id);if(stream){stream.write(data);stream.end();streams.delete(p.id);}}rooms.delete(r.code);}
function createPlayer(name,index){return {id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),name:String(name||'Phù thủy').trim().slice(0,18)||'Phù thủy',house:index,role:"player",connected:true,x:90+index*43,y:526,vx:0,vy:0,dead:0,keys:{},lastSeen:Date.now()};}
const server=http.createServer(async(req,res)=>{const u=new URL(req.url,'http://localhost');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(u.pathname==='/api/health')return json(res,200,{ok:true});
 if(u.pathname==='/api/levels')return json(res,200,levels);
 if(u.pathname==='/api/events'){
  const {r,p}=auth(Object.fromEntries(u.searchParams));if(!p)return json(res,403,{error:'Phiên chơi không hợp lệ.'});
  streams.get(p.id)?.end();res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(': connected\n\n');streams.set(p.id,res);p.connected=true;p.lastSeen=Date.now();push(r);req.on('close',()=>{if(streams.get(p.id)===res){streams.delete(p.id);p.keys={};p.connected=false;p.lastSeen=Date.now();push(r);}});return;
 }
 if(req.method==='POST'&&u.pathname.startsWith('/api/')){
  let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>4096){return json(res,413,{error:'Dữ liệu quá lớn.'});}}const body=JSON.parse(raw||'{}');
   if(u.pathname==='/api/create'){if(rooms.size>=300)return json(res,503,{error:'Máy chủ đang đầy. Thử lại sau nhé.'});let code;do{code=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase();}while(rooms.has(code));const p=createPlayer(body.name,0),r={code,host:p.id,players:[p],spectators:[],status:'lobby',level:0,created:Date.now()};rooms.set(code,r);return json(res,200,{code,id:p.id,token:p.token,role:p.role});}
   if(u.pathname==='/api/join'){const r=rooms.get(String(body.code||'').toUpperCase());if(!r)return json(res,404,{error:'Không tìm thấy phòng. Kiểm tra lại mã nhé.'});if(r.status!=='lobby')return json(res,409,{error:'Phòng đang chơi. Hãy đợi chủ phòng quay về sảnh.'});if(r.players.length>=8)return json(res,409,{error:'Phòng đã đủ 8 người.'});const p=createPlayer(body.name,r.players.length);r.players.push(p);push(r);return json(res,200,{code:r.code,id:p.id,token:p.token,role:p.role});}
   if(u.pathname==='/api/spectate'){const r=rooms.get(String(body.code||'').toUpperCase());if(!r)return json(res,404,{error:'Không tìm thấy phòng để xem. Kiểm tra mã phòng nhé.'});r.spectators??=[];if(r.spectators.length>=100)return json(res,409,{error:'Khán đài đang đầy. Thử lại sau nhé.'});const p={id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),role:'spectator',connected:false,lastSeen:Date.now()};r.spectators.push(p);return json(res,200,{code:r.code,id:p.id,token:p.token,role:p.role});}
   const {r,p}=auth(body);if(!p)return json(res,403,{error:'Phiên chơi đã hết hạn. Vào lại phòng nhé.'});p.lastSeen=Date.now();
   if(p.role==='spectator'){if(u.pathname==='/api/leave'){streams.get(p.id)?.end();streams.delete(p.id);r.spectators=r.spectators.filter(q=>q!==p);push(r);return json(res,200,{ok:true});}return json(res,403,{error:'Khán giả chỉ xem, không điều khiển trận đấu.'});}
   if(u.pathname==='/api/input'){p.keys={left:body.left===true,right:body.right===true,jump:body.jump===true,toss:body.toss===true};return json(res,200,{ok:true});}
   if(u.pathname==='/api/leave'){streams.get(p.id)?.end();streams.delete(p.id);r.players=r.players.filter(q=>q!==p);if(!r.players.length)closeRoom(r);else{r.host=r.players[0].id;if(r.status==='playing')r.status='lobby';push(r);}return json(res,200,{ok:true});}
   if(p.id!==r.host)return json(res,403,{error:'Chỉ chủ phòng có thể thực hiện.'});
   if(u.pathname==='/api/start'){r.players=r.players.filter(p=>p.connected);if(r.players.length<2)return json(res,409,{error:'Cần ít nhất 2 người đã kết nối.'});if(r.status!=='lobby'&&r.status!=='won')return json(res,409,{error:'Phòng đã bắt đầu.'});const selected=Number(body.level??r.level);if(!Number.isInteger(selected)||selected<0||selected>=levels.length)return json(res,400,{error:'Map không hợp lệ.'});r.level=selected;if(r.status==='lobby')r.deaths=0;init(r);}
   else if(u.pathname==='/api/retry'){if(r.status==='lobby')return json(res,409,{error:'Phòng chưa bắt đầu.'});init(r);}
   else if(u.pathname==='/api/next'){if(r.status!=='won')return json(res,409,{error:'Hãy hoàn thành màn hiện tại.'});r.status='lobby';}
   else if(u.pathname==='/api/lobby'){r.players=r.players.filter(p=>p.connected);r.status='lobby';}
   else return json(res,404,{error:'Không tìm thấy thao tác.'});push(r);return json(res,200,{ok:true});
  }catch(e){return json(res,400,{error:'Yêu cầu không hợp lệ.'});}
 }
 if(u.pathname==='/engine.js'){res.writeHead(200,{'Content-Type':'text/javascript'});return fs.createReadStream(path.join(__dirname,'engine.cjs')).pipe(res);}
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/game.js':'game.js','/map-scenes.js':'map-scenes.js','/favicon.svg':'favicon.svg'};const file=files[u.pathname];if(!file)return json(res,404,{error:'Not found'});const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};res.writeHead(200,{'Content-Type':types[path.extname(file)]+'; charset=utf-8'});fs.createReadStream(path.join(__dirname,'dist',file)).pipe(res);
});
// A player disconnected mid-run freezes tick() for everyone; after 15s grace drop them (only while someone is still connected).
function pruneDisconnected(r){if(r.status!=='playing'||!r.players.some(p=>p.connected))return;const gone=r.players.filter(p=>!p.connected&&Date.now()-p.lastSeen>15000);if(!gone.length)return;r.players=r.players.filter(p=>!gone.includes(p));if(!r.players.some(p=>p.id===r.host))r.host=r.players[0].id;if(r.players.length<2)r.status='lobby';push(r);}
let frame=0;setInterval(()=>{for(const r of rooms.values()){for(const p of r.players){if(Date.now()-p.lastSeen>2000)p.keys={};}pruneDisconnected(r);tick(r);if(frame%2===0)push(r);if(r.players.every(p=>!p.connected)&&Date.now()-Math.max(...r.players.map(p=>p.lastSeen))>600000){closeRoom(r);}r.spectators=(r.spectators||[]).filter(p=>p.connected||Date.now()-p.lastSeen<600000); }frame++;},1000/60).unref();
if(require.main===module)server.listen(PORT,'0.0.0.0',()=>console.log(`Hogwarts Park: http://localhost:${PORT}`));
module.exports={server,rooms};
