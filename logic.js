const app=document.querySelector("#app");
let state={player:null};

function formatLog(text){
  if(!text)return"";
  const dayMatch=text.match(/^(第\d+日)/);const day=dayMatch?dayMatch[1]:"";
  let body=day?text.slice(day.length).replace(/^，/,""):text;
  let cls="log-normal";
  if(/完胜|银两\+|气血\+|内力\+|经验\+|突破|拜入|贡献\+|完成任务|学会/.test(body))cls="log-gain";
  else if(/惨败|受挫|气血-|银两-|失败|损失/.test(body))cls="log-loss";
  body=body.replace(/（([^）]+)）/g,`<span class="${cls}">（$1）</span>`);
  body=body.replace(/【战力(\d+) vs 难度(\d+) · (完胜|险胜|受挫|惨败)】/g,'<span class="power">【战力$1 vs 难度$2 · $3】</span>');
  return`<div class="log-item"><span class="log-day">${day}</span><span class="${cls}">${body}</span></div>`;
}
function qs(s){return document.querySelector(s);}

function renderStart(){
  app.innerHTML=`<main class="hero"><section class="hero-card"><h1 class="title">${world.title}</h1><p class="subtitle">像素风文字武侠RPG · 门派 · 大地图 · 战力判定<br>${world.background}</p><div class="row" style="justify-content:center"><button class="btn primary" id="newGame">新入江湖</button><button class="btn" id="continue" ${hasSave()?"":"disabled"}>读取存档</button><button class="btn" id="worldBtn">门派与地图说明</button></div><p class="small">六大门派 · 15处地图 · 秘境可扩展</p></section></main>`;
  qs("#newGame").onclick=renderCreate;
  qs("#continue").onclick=()=>{state=loadGame();if(state.player){if(!state.player.skills)state.player.skills=[];if(state.player.contrib==null)state.player.contrib=0;}renderGame();};
  qs("#worldBtn").onclick=renderWorldDoc;
}
function renderCreate(){
  app.innerHTML=`<section class="panel"><h2 class="section-title">创建角色</h2><div class="grid"><div><div class="form-grid"><label>姓名<input id="name" maxlength="8" placeholder="例如：沈听澜"></label><label>性别<select id="gender"><option>男</option><option>女</option><option>其他</option></select></label></div><h3>出身</h3><div class="row">${origins.map(o=>choice(o,"origin")).join("")}</div><h3>天赋</h3><div class="row">${talents.map(t=>choice(t,"talent")).join("")}</div><div class="row" style="margin-top:10px"><button class="btn primary" id="begin">踏入江湖</button><button class="btn" id="back">返回</button></div></div><aside class="panel"><h3 class="section-title">属性说明</h3>${Object.entries(STAT_LABELS).map(([k,v])=>`<div class="stat"><b>${v}</b><span>${STAT_HELP[k]}</span></div>`).join("")}</aside></div></section>`;
  let selected={origin:origins[0].id,talent:talents[0].id};markChoices(selected);
  document.querySelectorAll(".choice").forEach(el=>el.onclick=()=>{selected[el.dataset.kind]=el.dataset.id;markChoices(selected);});
  qs("#begin").onclick=()=>{state.player=createPlayer({name:qs("#name").value.trim(),gender:qs("#gender").value,...selected});saveGame(state);renderGame();};
  qs("#back").onclick=renderStart;
}
function choice(o,kind){return`<div class="choice" data-kind="${kind}" data-id="${o.id}"><b>${o.name}</b><p class="small">${o.desc}</p></div>`;}
function markChoices(sel){document.querySelectorAll(".choice").forEach(el=>el.classList.toggle("active",sel[el.dataset.kind]===el.dataset.id));}

function renderGame(){
  const p=state.player;if(!p.skills)p.skills=[];if(p.contrib==null)p.contrib=0;
  const here=getMapById(p.location);const d=derived(p);const power=calcCombatPower(p);
  const local=(LOCAL_SKILLS[p.location]||[]).map(getSkillById).filter(Boolean);
  const sectHere=getSectByLoc(p.location);
  const mySect=p.sect?getSectById(p.sect):null;

  app.innerHTML=`
  <div class="layout">
    <aside class="panel">
      <h2 class="section-title">${p.name}</h2>
      <p class="small">${p.gender} · ${p.age}岁 · 第${p.day}日 ${mySect?`· <span class="tag">${mySect.name}</span>`:""}</p>
      ${Object.entries(STAT_LABELS).map(([k,v])=>`<div class="stat"><b>${v}</b><span>${p.stats[k]}</span></div>`).join("")}
      <hr>
      <div class="stat"><b>气血</b><span>${p.hp}/${p.maxHp}</span></div>
      <div class="stat"><b>内力</b><span>${p.mp}/${p.maxMp}</span></div>
      <div class="stat"><b>银两</b><span>${p.silver}</span></div>
      <div class="stat"><b>攻/闪</b><span>${d.attack}/${d.dodge}</span></div>
      <div class="stat"><b>战力</b><span class="power">${power}</span></div>
      ${mySect?`<div class="stat"><b>贡献</b><span>${p.contrib}</span></div>`:""}
      <div class="row" style="margin-top:8px">
        <button class="btn" id="save">保存</button>
        <button class="btn" id="del">删档</button>
        <button class="btn primary" id="skillBtn">武学</button>
        ${sectHere?`<button class="btn primary" id="sectBtn">门派</button>`:""}
      </div>
    </aside>
    <main class="panel">
      <div class="loc-head">
        <h2 class="section-title">${here.name}</h2>
        <button class="btn primary" id="exploreBtn">游历此地</button>
      </div>
      <p class="small">${here.desc} · <span class="tag">${here.type}</span> <span class="tag">${here.region||""}</span></p>
      <div class="pixel-map" style="margin:8px 0">${maps.map(m=>`<div class="map-node ${m.id===p.location?"current":""}" data-id="${m.id}"><b>${m.name}</b><p class="small">${m.type}</p></div>`).join("")}</div>
      ${local.length?`<div class="row" style="margin-top:6px">${local.map(s=>{const owned=p.skills.some(x=>x.id===s.id);return`<button class="btn ${owned?"":"primary"} learn" data-id="${s.id}" ${owned?"disabled":""}>${s.name} <span class="small">${s.cost}两</span></button>`;}).join("")}</div>`:""}
    </main>
    <aside class="panel">
      <h3 class="section-title">江湖见闻</h3>
      <div class="log">${p.logs.map(formatLog).join("")}</div>
      <h3 class="section-title" style="margin-top:10px">可前往</h3>
      <div class="row">${here.neighbors.map(id=>`<button class="btn move" data-id="${id}">${getMapById(id).name}</button>`).join("")}</div>
    </aside>
  </div>`;

  document.querySelectorAll(".move,.map-node").forEach(el=>el.onclick=()=>{if(movePlayer(p,el.dataset.id).ok){saveGame(state);renderGame();}});
  document.querySelectorAll(".learn").forEach(el=>el.onclick=()=>{const res=learnSkill(p,getSkillById(el.dataset.id));p.logs.unshift(res.msg);saveGame(state);renderGame();});
  qs("#exploreBtn").onclick=()=>{exploreLocation(p);saveGame(state);renderGame();};
  qs("#save").onclick=()=>{saveGame(state);p.logs.unshift("保存了江湖足迹。");renderGame();};
  qs("#del").onclick=()=>{deleteSave();renderStart();};
  qs("#skillBtn").onclick=renderSkills;
  if(qs("#sectBtn"))qs("#sectBtn").onclick=()=>renderSect(sectHere);
}

function renderSect(sect){
  const p=state.player;
  const joined=p.sect===sect.id;
  const can=canJoinSect(p,sect);
  app.innerHTML=`<section class="panel">
    <h2 class="section-title">${sect.name} <span class="tag">${sect.align}</span></h2>
    <p>${sect.bg}</p>
    <p class="small">师父：${sect.master.name}（${sect.master.title}）—— ${sect.master.desc}</p>
    <p class="small">收徒条件：${Object.entries(sect.req).map(([k,v])=>`${STAT_LABELS[k]||k}≥${v}`).join("，")}</p>
    <h3 class="section-title">门派剧情</h3>
    <ul class="small">${sect.story.map(s=>`<li>${s}</li>`).join("")}</ul>
    ${!p.sect?`<button class="btn primary" id="join" ${can.ok?"":"disabled"}>拜师入门 ${can.ok?"":"("+can.msg+")"}</button>`:
      joined?`
        <p>你的贡献：<b class="power">${p.contrib}</b></p>
        <h3 class="section-title">门派任务</h3>
        <div class="row" style="flex-direction:column;gap:6px">${sect.tasks.map(t=>`<div class="choice" style="display:flex;justify-content:space-between;align-items:center"><div><b>${t.name}</b><p class="small">${t.desc} · 贡献+${t.contrib}${t.silver?` · 银+${t.silver}`:""}${t.diff?` · 难度${t.diff}`:""}</p></div><button class="btn primary task" data-id="${t.id}">接取</button></div>`).join("")}</div>
        <h3 class="section-title">门派商店</h3>
        <div class="row">${sect.shop.map(it=>`<button class="btn shop" data-id="${it.id}">${it.name}<br><span class="small">${it.cost}两 · 贡献≥${it.contribNeed}</span></button>`).join("")}</div>
        <h3 class="section-title">独门武学</h3>
        <p class="small">${sect.skills.map(id=>{const s=getSkillById(id);return s?s.name:id;}).join("、")}</p>
      `:`<p class="small">你已是【${getSectById(p.sect).name}】弟子，无法再拜他派。</p>`}
    <div class="row" style="margin-top:12px"><button class="btn" id="back">返回</button></div>
  </section>`;
  if(qs("#join"))qs("#join").onclick=()=>{const r=joinSect(p,sect);p.logs.unshift(r.msg);saveGame(state);renderSect(sect);};
  document.querySelectorAll(".task").forEach(el=>el.onclick=()=>{const t=sect.tasks.find(x=>x.id===el.dataset.id);doSectTask(p,t);saveGame(state);renderSect(sect);});
  document.querySelectorAll(".shop").forEach(el=>el.onclick=()=>{const it=sect.shop.find(x=>x.id===el.dataset.id);const r=buySectItem(p,sect,it);if(!r.ok)p.logs.unshift(r.msg);saveGame(state);renderSect(sect);});
  qs("#back").onclick=renderGame;
}

function renderSkills(){
  const p=state.player;if(!p.skills)p.skills=[];
  app.innerHTML=`<section class="panel"><h2 class="section-title">已学武学（${p.skills.length}） · 战力 ${calcCombatPower(p)}</h2>
    ${p.skills.length===0?'<p class="small">还不会武学。</p>':`<div class="row" style="flex-direction:column;gap:8px">${p.skills.map(s=>`<div class="choice" style="display:flex;justify-content:space-between;align-items:center"><div><b>${s.name}</b> <span class="tag">${s.quality}</span> <span class="tag">${s.type}</span><p class="small">${SKILL_DESIGN.realms[s.realm]} · ${s.exp}/${s.maxExp} · 威力${s.power||0}</p></div><button class="btn train" data-id="${s.id}" ${s.realm>=4?"disabled":""}>修炼</button></div>`).join("")}</div>`}
    <div class="row" style="margin-top:12px"><button class="btn" id="back">返回</button></div></section>`;
  document.querySelectorAll(".train").forEach(el=>el.onclick=()=>{trainSkill(p,el.dataset.id,15+Math.floor(p.stats.wit/2));saveGame(state);renderSkills();});
  qs("#back").onclick=renderGame;
}

function renderWorldDoc(){
  app.innerHTML=`<section class="panel worlddoc"><h2 class="section-title">门派与地图</h2>
    <h3>六大门派</h3>
    ${sects.map(s=>`<p><b>${s.name}</b>（${s.align}）@${getMapById(s.loc)?.name||s.loc}<br>${s.bg}<br>师父：${s.master.name} · 条件：${Object.entries(s.req).map(([k,v])=>k+">="+v).join(", ")} · 独门：${s.skills.join(", ")}</p>`).join("")}
    <h3>地图结构（可扩展）</h3>
    <p>区域：中原 / 南海 / 西陲 / 北境。类型：城镇、渡口、野外、门派、秘境。当前 ${maps.length} 处，通过 neighbors 连接，后续只需追加地点即可扩展。</p>
    <h3>战力判定</h3>
    <p>战力=攻×2+闪+武学威力×(1+境界×0.25)+根骨+内力/2。有害事件带难度，完胜可反赚。</p>
    <button class="btn" id="back">返回</button></section>`;
  qs("#back").onclick=renderStart;
}

renderStart();
