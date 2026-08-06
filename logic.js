const app=document.querySelector("#app");
let state={player:null};

function formatLog(text){
  if(!text)return"";
  const dayMatch=text.match(/^(第\d+日)/);const day=dayMatch?dayMatch[1]:"";
  let body=day?text.slice(day.length).replace(/^，/,""):text;
  let cls="log-normal";
  if(/完胜|银两\+|气血\+|内力\+|经验\+|突破|拜入|贡献\+|完成任务|学会|购得|指点|休整|求医|赢了/.test(body))cls="log-gain";
  else if(/惨败|受挫|气血-|银两-|失败|损失|输了/.test(body))cls="log-loss";
  body=body.replace(/（([^）]+)）/g,`<span class="${cls}">（$1）</span>`);
  body=body.replace(/【战力(\d+) vs 难度(\d+) · (完胜|险胜|受挫|惨败)】/g,'<span class="power">【战力$1 vs 难度$2 · $3】</span>');
  return`<div class="log-item"><span class="log-day">${day}</span><span class="${cls}">${body}</span></div>`;
}
function qs(s){return document.querySelector(s);}

function renderStart(){
  app.innerHTML=`<main class="hero"><section class="hero-card"><h1 class="title">${world.title}</h1><p class="subtitle">像素风文字武侠 · 门派 · 地图 · NPC<br>${world.background}</p><div class="row" style="justify-content:center"><button class="btn primary" id="newGame">新入江湖</button><button class="btn" id="continue" ${hasSave()?"":"disabled"}>读取存档</button><button class="btn" id="worldBtn">说明</button></div><p class="small">六大门派 · 15地图 · 16NPC</p></section></main>`;
  qs("#newGame").onclick=renderCreate;
  qs("#continue").onclick=()=>{state=loadGame();if(state.player){if(!state.player.skills)state.player.skills=[];if(state.player.contrib==null)state.player.contrib=0;if(!state.player.flags)state.player.flags={};}renderGame();};
  qs("#worldBtn").onclick=renderWorldDoc;
}
function renderCreate(){
  app.innerHTML=`<section class="panel"><h2 class="section-title">创建角色</h2><div class="form-grid"><label>姓名<input id="name" maxlength="8" placeholder="例如：沈听澜"></label><label>性别<select id="gender"><option>男</option><option>女</option><option>其他</option></select></label></div><h3 class="section-title" style="margin-top:10px">出身</h3><div class="row">${origins.map(o=>choice(o,"origin")).join("")}</div><h3 class="section-title" style="margin-top:8px">天赋</h3><div class="row">${talents.map(t=>choice(t,"talent")).join("")}</div><div class="row" style="margin-top:10px"><button class="btn primary" id="begin">踏入江湖</button><button class="btn" id="back">返回</button></div></section>`;
  let selected={origin:origins[0].id,talent:talents[0].id};markChoices(selected);
  document.querySelectorAll(".choice").forEach(el=>el.onclick=()=>{selected[el.dataset.kind]=el.dataset.id;markChoices(selected);});
  qs("#begin").onclick=()=>{state.player=createPlayer({name:qs("#name").value.trim(),gender:qs("#gender").value,...selected});if(!state.player.flags)state.player.flags={};saveGame(state);renderGame();};
  qs("#back").onclick=renderStart;
}
function choice(o,kind){return`<div class="choice" data-kind="${kind}" data-id="${o.id}"><b>${o.name}</b><p class="small">${o.desc}</p></div>`;}
function markChoices(sel){document.querySelectorAll(".choice").forEach(el=>el.classList.toggle("active",sel[el.dataset.kind]===el.dataset.id));}

function renderGame(){
  const p=state.player;if(!p.skills)p.skills=[];if(p.contrib==null)p.contrib=0;if(!p.flags)p.flags={};
  const here=getMapById(p.location);const d=derived(p);const power=calcCombatPower(p);
  const local=(LOCAL_SKILLS[p.location]||[]).map(getSkillById).filter(Boolean);
  const sectHere=getSectByLoc(p.location);
  const mySect=p.sect?getSectById(p.sect):null;
  const hereNpcs=typeof getNpcsAt==="function"?getNpcsAt(p.location):[];
  const near=new Set(here.neighbors||[]);

  app.innerHTML=`
  <section class="panel">
    <div class="hud">
      <b>${p.name}</b>
      <span>第${p.day}日</span>
      ${mySect?`<span class="tag">${mySect.name}</span>`:""}
      <span class="sep">|</span>
      <span>血 <b>${p.hp}</b>/${p.maxHp}</span>
      <span>内 <b>${p.mp}</b>/${p.maxMp}</span>
      <span>银 <b>${p.silver}</b></span>
      <span>战力 <b class="power">${power}</b></span>
    </div>
    <div class="toolbar">
      <button class="btn primary sm" id="charBtn">角色</button>
      <button class="btn sm" id="skillBtn">武学</button>
      ${sectHere?`<button class="btn sm" id="sectBtn">门派</button>`:""}
      <button class="btn sm" id="save">保存</button>
      <button class="btn sm" id="exploreBtn">游历</button>
    </div>
  </section>

  <section class="panel">
    <div class="loc-head">
      <h2 class="section-title">${here.name}</h2>
      <span class="tag">${here.type}</span>
    </div>
    <p class="small" style="margin:0 0 6px">${here.desc}</p>
    <div class="pixel-map">${maps.map(m=>{
      let cls="map-node";
      if(m.id===p.location)cls+=" current";
      else if(near.has(m.id))cls+=" near";
      else cls+=" far";
      return`<div class="${cls}" data-id="${m.id}"><b>${m.name}</b><span class="small">${m.type}</span></div>`;
    }).join("")}</div>
    <div class="row compact-block">
      <span class="small">可前往：</span>
      ${here.neighbors.map(id=>`<button class="btn primary sm move" data-id="${id}">${getMapById(id).name}</button>`).join("")}
    </div>
    ${local.length?`<div class="row compact-block">${local.map(s=>{const owned=p.skills.some(x=>x.id===s.id);return`<button class="btn sm ${owned?"":"primary"} learn" data-id="${s.id}" ${owned?"disabled":""}>${s.name}${s.cost?` ${s.cost}两`:""}</button>`;}).join("")}</div>`:""}
    ${hereNpcs.length?`<div class="row compact-block"><span class="small">人物：</span>${hereNpcs.map(n=>`<button class="btn primary sm npc-btn" data-id="${n.id}">${n.name}</button>`).join("")}</div>`:""}
  </section>

  <section class="panel">
    <h3 class="section-title">江湖见闻</h3>
    <div class="log">${p.logs.map(formatLog).join("")}</div>
  </section>`;

  document.querySelectorAll(".move").forEach(el=>el.onclick=()=>{if(movePlayer(p,el.dataset.id).ok){saveGame(state);renderGame();}});
  document.querySelectorAll(".map-node.near,.map-node.current").forEach(el=>el.onclick=()=>{
    if(el.dataset.id===p.location)return;
    if(movePlayer(p,el.dataset.id).ok){saveGame(state);renderGame();}
  });
  document.querySelectorAll(".learn").forEach(el=>el.onclick=()=>{const res=learnSkill(p,getSkillById(el.dataset.id));p.logs.unshift(res.msg);saveGame(state);renderGame();});
  qs("#exploreBtn").onclick=()=>{exploreLocation(p);saveGame(state);renderGame();};
  qs("#save").onclick=()=>{saveGame(state);p.logs.unshift("保存了江湖足迹。");renderGame();};
  qs("#skillBtn").onclick=renderSkills;
  qs("#charBtn").onclick=renderChar;
  if(qs("#sectBtn"))qs("#sectBtn").onclick=()=>renderSect(sectHere);
  document.querySelectorAll(".npc-btn").forEach(el=>el.onclick=()=>renderNpc(el.dataset.id));
}

function renderChar(){
  const p=state.player;if(!p.skills)p.skills=[];if(!p.flags)p.flags={};
  const d=derived(p);const power=calcCombatPower(p);
  const mySect=p.sect?getSectById(p.sect):null;
  app.innerHTML=`<section class="panel">
    <h2 class="section-title">角色 · ${p.name}</h2>
    <p class="small">${p.gender} · ${p.age}岁 · 第${p.day}日 ${mySect?`· ${mySect.name}（贡献${p.contrib}）`:""}</p>
    <div class="stat-grid" style="margin-top:8px">
      ${Object.entries(STAT_LABELS).map(([k,v])=>`<div class="stat"><b>${v}</b><span>${p.stats[k]}</span></div>`).join("")}
    </div>
    <hr>
    <div class="stat-grid">
      <div class="stat"><b>气血</b><span>${p.hp}/${p.maxHp}</span></div>
      <div class="stat"><b>内力</b><span>${p.mp}/${p.maxMp}</span></div>
      <div class="stat"><b>银两</b><span>${p.silver}</span></div>
      <div class="stat"><b>攻/闪</b><span>${d.attack}/${d.dodge}</span></div>
      <div class="stat"><b>战力</b><span class="power">${power}</span></div>
      <div class="stat"><b>武学数</b><span>${p.skills.length}</span></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn primary" id="back">返回</button>
      <button class="btn" id="skillBtn">武学</button>
      <button class="btn" id="save">保存</button>
      <button class="btn" id="del">删档</button>
    </div>
  </section>`;
  qs("#back").onclick=renderGame;
  qs("#skillBtn").onclick=renderSkills;
  qs("#save").onclick=()=>{saveGame(state);p.logs.unshift("保存了江湖足迹。");renderChar();};
  qs("#del").onclick=()=>{deleteSave();renderStart();};
}

function renderNpc(npcId){
  const p=state.player;if(!p.flags)p.flags={};
  const npc=findPerson(npcId);
  if(!npc){renderGame();return;}
  const talk=npc.talks[Math.floor(Math.random()*npc.talks.length)];
  app.innerHTML=`<section class="panel">
    <h2 class="section-title">${npc.name} <span class="tag">${npc.title}</span></h2>
    <p class="small">${npc.desc}</p>
    <p style="color:var(--gold);margin:8px 0">「${talk}」</p>
    <h3 class="section-title">互动</h3>
    <div class="row" style="flex-direction:column;gap:5px;align-items:stretch">
      ${npc.acts.map(a=>{
        const flagKey=npc.id+"_"+a.id;
        const done=a.once&&p.flags[flagKey];
        const cost=a.cost||0;
        let extra="";
        if(a.type==="duel")extra=" · 难度"+a.diff;
        if(a.type==="skill")extra=" · 学武";
        if(done)extra=" · 已完成";
        return `<button class="btn primary npc-act" data-act="${a.id}" ${done?"disabled":""}>${a.name}${cost?`（${cost}两）`:""}<span class="small">${extra}</span></button>`;
      }).join("")}
    </div>
    <div class="row" style="margin-top:10px"><button class="btn" id="back">返回</button></div>
  </section>`;
  document.querySelectorAll(".npc-act").forEach(el=>el.onclick=()=>{
    const r=interactPerson(p,npc,el.dataset.act);
    if(!r.ok)p.logs.unshift(r.msg);
    saveGame(state);
    renderNpc(npcId);
  });
  qs("#back").onclick=renderGame;
}

function renderSect(sect){
  const p=state.player;
  const joined=p.sect===sect.id;
  const can=canJoinSect(p,sect);
  app.innerHTML=`<section class="panel">
    <h2 class="section-title">${sect.name} <span class="tag">${sect.align}</span></h2>
    <p class="small">${sect.bg}</p>
    <p class="small">师父：${sect.master.name}（${sect.master.title}）—— ${sect.master.desc}</p>
    <p class="small">收徒：${Object.entries(sect.req).map(([k,v])=>`${STAT_LABELS[k]||k}≥${v}`).join("，")}</p>
    <h3 class="section-title">门派剧情</h3>
    <ul class="small">${sect.story.map(s=>`<li>${s}</li>`).join("")}</ul>
    ${!p.sect?`<button class="btn primary" id="join" ${can.ok?"":"disabled"}>拜师入门 ${can.ok?"":"("+can.msg+")"}</button>`:
      joined?`
        <p class="small">贡献：<b class="power">${p.contrib}</b></p>
        <h3 class="section-title">任务</h3>
        <div class="row" style="flex-direction:column;gap:5px;align-items:stretch">${sect.tasks.map(t=>`<div class="choice" style="display:flex;justify-content:space-between;align-items:center;gap:6px"><div><b>${t.name}</b><p class="small">${t.desc} · 贡献+${t.contrib}${t.silver?` · 银+${t.silver}`:""}${t.diff?` · 难${t.diff}`:""}</p></div><button class="btn primary sm task" data-id="${t.id}">接取</button></div>`).join("")}</div>
        <h3 class="section-title">商店</h3>
        <div class="row">${sect.shop.map(it=>`<button class="btn sm shop" data-id="${it.id}">${it.name} ${it.cost}两/贡≥${it.contribNeed}</button>`).join("")}</div>
        <p class="small" style="margin-top:6px">独门：${sect.skills.map(id=>{const s=getSkillById(id);return s?s.name:id;}).join("、")}</p>
      `:`<p class="small">你已是【${getSectById(p.sect).name}】弟子。</p>`}
    <div class="row" style="margin-top:10px"><button class="btn" id="back">返回</button></div>
  </section>`;
  if(qs("#join"))qs("#join").onclick=()=>{const r=joinSect(p,sect);p.logs.unshift(r.msg);saveGame(state);renderSect(sect);};
  document.querySelectorAll(".task").forEach(el=>el.onclick=()=>{const t=sect.tasks.find(x=>x.id===el.dataset.id);doSectTask(p,t);saveGame(state);renderSect(sect);});
  document.querySelectorAll(".shop").forEach(el=>el.onclick=()=>{const it=sect.shop.find(x=>x.id===el.dataset.id);const r=buySectItem(p,sect,it);if(!r.ok)p.logs.unshift(r.msg);saveGame(state);renderSect(sect);});
  qs("#back").onclick=renderGame;
}

function renderSkills(){
  const p=state.player;if(!p.skills)p.skills=[];
  app.innerHTML=`<section class="panel"><h2 class="section-title">武学（${p.skills.length}） · 战力 ${calcCombatPower(p)}</h2>
    ${p.skills.length===0?'<p class="small">还不会武学。</p>':`<div class="row" style="flex-direction:column;gap:6px;align-items:stretch">${p.skills.map(s=>`<div class="choice" style="display:flex;justify-content:space-between;align-items:center;gap:6px"><div><b>${s.name}</b> <span class="tag">${s.quality}</span><p class="small">${SKILL_DESIGN.realms[s.realm]} · ${s.exp}/${s.maxExp} · 威${s.power||0}</p></div><button class="btn sm train" data-id="${s.id}" ${s.realm>=4?"disabled":""}>修炼</button></div>`).join("")}</div>`}
    <div class="row" style="margin-top:10px"><button class="btn" id="back">返回</button></div></section>`;
  document.querySelectorAll(".train").forEach(el=>el.onclick=()=>{trainSkill(p,el.dataset.id,15+Math.floor(p.stats.wit/2));saveGame(state);renderSkills();});
  qs("#back").onclick=renderGame;
}

function renderWorldDoc(){
  app.innerHTML=`<section class="panel worlddoc"><h2 class="section-title">说明</h2>
    <h3>六大门派</h3>
    ${sects.map(s=>`<p><b>${s.name}</b>（${s.align}）@${getMapById(s.loc)?.name||s.loc}<br>${s.bg}</p>`).join("")}
    <h3>操作</h3>
    <p>主界面精简：属性在「角色」；地图金色为当前位置，亮边为可前往。</p>
    <button class="btn" id="back">返回</button></section>`;
  qs("#back").onclick=renderStart;
}

renderStart();
