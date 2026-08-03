import { createPlayer, STAT_LABELS, STAT_HELP, derived } from './player.js';
import { saveGame, loadGame, hasSave, deleteSave } from './save.js';
import { getMapById, movePlayer } from './map.js';
import { SKILL_DESIGN } from './skill.js';
import { NPC_DESIGN } from './npc.js';
import { ITEM_DESIGN } from './item.js';
import { BATTLE_DESIGN } from './battle.js';

const app = document.querySelector('#app');
const [world, maps, origins, talents] = await Promise.all(['world','maps','origins','talents'].map(n => fetch(`./json/${n}.json`).then(r => r.json())));
let state = { player: null };

function renderStart() {
  app.innerHTML = `<main class="hero"><section class="hero-card"><h1 class="title">${world.title}</h1><p class="subtitle">像素风文字武侠RPG · 放置养成 · 无唯一主线<br>${world.background}</p><div class="row" style="justify-content:center"><button class="btn primary" id="newGame">新入江湖</button><button class="btn" id="continue" ${hasSave() ? '' : 'disabled'}>读取存档</button><button class="btn" id="worldBtn">查看完整方案</button></div><p class="small">当前版本完成：开始界面、创建角色、玩家数据、LocalStorage存档、基础地图移动。</p></section></main>`;
  qs('#newGame').onclick = renderCreate;
  qs('#continue').onclick = () => { state = loadGame(); renderGame(); };
  qs('#worldBtn').onclick = renderWorldDoc;
}
function renderCreate() {
  app.innerHTML = `<section class="panel"><h2 class="section-title">创建角色</h2><div class="grid"><div><div class="form-grid"><label>姓名<input id="name" maxlength="8" placeholder="例如：沈听澜"></label><label>性别<select id="gender"><option>男</option><option>女</option><option>其他</option></select></label></div><h3>出身</h3><div id="origins" class="row">${origins.map(o => choice(o,'origin')).join('')}</div><h3>天赋</h3><div id="talents" class="row">${talents.map(t => choice(t,'talent')).join('')}</div><div class="row"><button class="btn primary" id="begin">踏入江湖</button><button class="btn" id="back">返回</button></div></div><aside class="panel"><h3 class="section-title">属性说明</h3>${Object.entries(STAT_LABELS).map(([k,v])=>`<div class="stat"><b>${v}</b><span>${STAT_HELP[k]}</span></div>`).join('')}</aside></div></section>`;
  let selected = { origin: origins[0].id, talent: talents[0].id }; markChoices(selected);
  document.querySelectorAll('.choice').forEach(el => el.onclick = () => { selected[el.dataset.kind] = el.dataset.id; markChoices(selected); });
  qs('#begin').onclick = () => { state.player = createPlayer({ name: qs('#name').value.trim(), gender: qs('#gender').value, ...selected }, origins, talents); saveGame(state); renderGame(); };
  qs('#back').onclick = renderStart;
}
function choice(o, kind) { return `<div class="choice" data-kind="${kind}" data-id="${o.id}"><b>${o.name}</b><p class="small">${o.desc}</p></div>`; }
function markChoices(sel) { document.querySelectorAll('.choice').forEach(el => el.classList.toggle('active', sel[el.dataset.kind] === el.dataset.id)); }
function renderGame() {
  const p = state.player; const here = getMapById(maps, p.location); const d = derived(p);
  app.innerHTML = `<div class="layout"><aside class="panel"><h2 class="section-title">${p.name}</h2><p>${p.gender} · ${p.age}岁 · 第${p.day}日</p>${Object.entries(STAT_LABELS).map(([k,v])=>`<div class="stat"><b>${v}</b><span>${p.stats[k]}</span></div>`).join('')}<hr><div class="stat"><b>气血</b><span>${p.hp}/${p.maxHp}</span></div><div class="stat"><b>内力</b><span>${p.mp}/${p.maxMp}</span></div><div class="stat"><b>银两</b><span>${p.silver}</span></div><div class="stat"><b>攻击/闪避</b><span>${d.attack}/${d.dodge}</span></div><div class="row"><button class="btn" id="save">保存</button><button class="btn" id="del">删档</button></div></aside><main class="panel"><h2 class="section-title">${here.name}</h2><p>${here.desc}</p><p><span class="tag">${here.type}</span><span class="tag">坐标 ${here.x},${here.y}</span></p><div class="pixel-map">${maps.map(m => `<div class="map-node ${m.id===p.location?'current':''}" data-id="${m.id}"><b>${m.name}</b><p class="small">${m.type}</p><p>${m.desc}</p></div>`).join('')}</div></main><aside class="panel"><h3 class="section-title">江湖见闻</h3><div class="log">${p.logs.map(l=>`<div>· ${l}</div>`).join('')}</div><h3>可前往</h3><div class="row">${here.neighbors.map(id=>`<button class="btn move" data-id="${id}">${getMapById(maps,id).name}</button>`).join('')}</div></aside></div>`;
  document.querySelectorAll('.move,.map-node').forEach(el => el.onclick = () => { if (movePlayer(p, maps, el.dataset.id).ok) saveGame(state); renderGame(); });
  qs('#save').onclick = () => { saveGame(state); p.logs.unshift('你整理行囊，保存了当前江湖足迹。'); renderGame(); };
  qs('#del').onclick = () => { deleteSave(); renderStart(); };
}
function renderWorldDoc() {
  app.innerHTML = `<section class="panel worlddoc"><h2 class="section-title">完整游戏方案</h2><h3>1. 世界观</h3><p>${world.background}</p><ul>${world.states.concat(world.rules, world.factions).map(x=>`<li>${x}</li>`).join('')}</ul><h3>2. 玩家系统</h3><p>玩家16岁开始，可通过出身和天赋形成初始差异。成长路线包括名门正派、江湖散人、镖师商路、缉武司客卿、隐秘邪道等。</p><h3>3. 武学系统</h3><p>品质：${SKILL_DESIGN.qualities.join('、')}；类型：${SKILL_DESIGN.types.join('、')}；境界：${SKILL_DESIGN.realms.join('、')}。${SKILL_DESIGN.combo}</p><h3>4. 门派系统</h3><p>原创门派示例：烟岚剑斋、赤炉刀社、回春谷、玄鲸帮、白雀楼、无相寺。每派包含收徒条件、师父NPC、贡献、商店、独门武学与分支剧情。</p><h3>5. NPC系统</h3><p>${NPC_DESIGN.memory}关系包括${NPC_DESIGN.relation.join('、')}。</p><h3>6-10. 地图/战斗/任务/经济/长期玩法</h3><p>地图按区域扩展；${BATTLE_DESIGN.logic}状态有${BATTLE_DESIGN.states.join('、')}。经济包含${ITEM_DESIGN.categories.join('、')}。长期目标包含境界突破、江湖排名、武林大会、隐藏秘籍与多结局。</p><h3>11. 技术实现</h3><p>HTML承载界面，JS按 player/battle/map/npc/skill/save/item 模块拆分，JSON管理世界、地图、出身、天赋。存档使用LocalStorage，新增系统时追加JSON字段并保持版本号迁移。</p><button class="btn" id="back">返回</button></section>`;
  qs('#back').onclick = renderStart;
}
function qs(s) { return document.querySelector(s); }
renderStart();
