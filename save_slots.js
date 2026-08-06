/* 三槽位备用存档 */
const SAVE_SLOT_KEYS=["yijian_yisuo_slot_1","yijian_yisuo_slot_2","yijian_yisuo_slot_3"];
const SAVE_SLOT_NAMES=["存档一","存档二","存档三"];
function slotKey(i){return SAVE_SLOT_KEYS[i];}
function saveToSlot(state,slotIndex){
  if(slotIndex<0||slotIndex>2)return{ok:false,msg:"无效档位"};
  const payload={...state,savedAt:new Date().toISOString(),slot:slotIndex};
  localStorage.setItem(slotKey(slotIndex),JSON.stringify(payload));
  saveGame(state);
  return{ok:true,msg:"已写入"+SAVE_SLOT_NAMES[slotIndex]};
}
function loadFromSlot(slotIndex){
  if(slotIndex<0||slotIndex>2)return null;
  const raw=localStorage.getItem(slotKey(slotIndex));
  if(!raw)return null;
  try{const data=JSON.parse(raw);saveGame(data);return data;}catch(e){return null;}
}
function deleteSlot(slotIndex){
  if(slotIndex<0||slotIndex>2)return{ok:false,msg:"无效档位"};
  localStorage.removeItem(slotKey(slotIndex));
  return{ok:true,msg:"已清空"+SAVE_SLOT_NAMES[slotIndex]};
}
function hasSlot(slotIndex){return Boolean(localStorage.getItem(slotKey(slotIndex)));}
function hasAnySlot(){return SAVE_SLOT_KEYS.some(function(k){return Boolean(localStorage.getItem(k));})||hasSave();}
function getSlotMeta(slotIndex){
  const raw=localStorage.getItem(slotKey(slotIndex));
  if(!raw)return null;
  try{
    const data=JSON.parse(raw);
    const p=data.player||{};
    const loc=typeof getMapById==="function"?getMapById(p.location):null;
    let power="—";
    try{if(typeof calcCombatPower==="function"&&p.stats)power=String(calcCombatPower(p));}catch(e){}
    let timeStr="";
    if(p.clock&&typeof formatClockShort==="function"){try{timeStr=formatClockShort(p);}catch(e){}}
    if(!timeStr&&p.day)timeStr="第"+p.day+"日";
    return{name:p.name||"无名",day:p.day||1,location:loc?loc.name:(p.location||"—"),silver:p.silver||0,power:power,sect:p.sect||null,timeStr:timeStr,savedAt:data.savedAt||"",hp:p.hp,maxHp:p.maxHp};
  }catch(e){return null;}
}
function formatSavedAt(iso){
  if(!iso)return"";
  try{
    const d=new Date(iso);
    const m=d.getMonth()+1,day=d.getDate();
    const h=String(d.getHours()).padStart(2,"0"),mi=String(d.getMinutes()).padStart(2,"0");
    return m+"月"+day+"日 "+h+":"+mi;
  }catch(e){return"";}
}

/* UI: 存档按钮与角色同列 */
(function(){
  function slotCardHtml(i, meta, mode){
    const name=SAVE_SLOT_NAMES[i];
    if(!meta){
      return '<div class="master-card" data-slot="'+i+'"><b>'+name+'</b> <span class="tag">空</span><p class="small">尚无存档</p><div class="row" style="margin-top:6px">'+(mode==="save"?'<button class="btn primary sm slot-write" data-slot="'+i+'">写入</button>':'')+(mode==="load"?'<button class="btn sm" disabled>空档</button>':'')+'</div></div>';
    }
    const when=formatSavedAt(meta.savedAt);
    return '<div class="master-card" data-slot="'+i+'"><b>'+name+'</b> <span class="tag">'+meta.name+'</span><p class="small">'+(meta.timeStr||("第"+meta.day+"日"))+' · '+meta.location+' · 战力'+meta.power+' · 银'+meta.silver+(when?" · "+when:"")+'</p><div class="row" style="margin-top:6px">'+(mode==="save"?'<button class="btn primary sm slot-write" data-slot="'+i+'">覆盖写入</button>':'')+(mode==="load"?'<button class="btn primary sm slot-read" data-slot="'+i+'">读取</button>':'')+'<button class="btn sm slot-clear" data-slot="'+i+'">清空</button></div></div>';
  }
  window.modalSaves=function(){
    const p=state.player?ensurePlayer(state.player):null;
    if(!p){modalLoadSlots();return;}
    saveGame(state);
    const cards=[0,1,2].map(function(i){return slotCardHtml(i,getSlotMeta(i),"save");}).join("");
    openModal('<div class="modal-head"><h2 class="section-title">备用存档</h2><button class="modal-close" id="mClose">关闭</button></div><p class="small">当前进度会自动写入临时档。可将进度备份到下列三处，互不影响。</p><p class="small">当前：<b>'+p.name+'</b> · 第'+p.day+'日 · '+(getMapById(p.location)?getMapById(p.location).name:p.location)+' · 战力 '+calcCombatPower(p)+'</p>'+cards+'<div class="row" style="margin-top:10px"><button class="btn sm" id="quickSave">仅保存临时档</button></div>');
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qs("#quickSave").onclick=function(){saveGame(state);p.logs.unshift("已保存临时档。");closeModal();renderGame();};
    qsa(".slot-write").forEach(function(el){el.onclick=function(){const i=parseInt(el.dataset.slot,10);const r=saveToSlot(state,i);p.logs.unshift(r.msg);saveGame(state);modalSaves();};});
    qsa(".slot-clear").forEach(function(el){el.onclick=function(){const i=parseInt(el.dataset.slot,10);if(!hasSlot(i))return;if(!confirm("确定清空「"+SAVE_SLOT_NAMES[i]+"」？"))return;const r=deleteSlot(i);p.logs.unshift(r.msg);modalSaves();};});
  };
  window.modalLoadSlots=function(){
    const cards=[0,1,2].map(function(i){return slotCardHtml(i,getSlotMeta(i),"load");}).join("");
    const main=hasSave()?loadGame():null;
    let mainHtml="";
    if(main&&main.player){
      const mp=main.player;
      const loc=getMapById(mp.location);
      let power="—";
      try{power=String(calcCombatPower(mp));}catch(e){}
      const when=formatSavedAt(main.savedAt);
      mainHtml='<div class="master-card active"><b>临时档</b> <span class="tag">'+(mp.name||"无名")+'</span><p class="small">第'+(mp.day||1)+'日 · '+(loc?loc.name:(mp.location||"—"))+' · 战力'+power+(when?" · "+when:"")+'</p><div class="row" style="margin-top:6px"><button class="btn primary sm" id="loadMain">读取临时档</button></div></div>';
    }
    openModal('<div class="modal-head"><h2 class="section-title">读取存档</h2><button class="modal-close" id="mClose">关闭</button></div><p class="small">选择要继续的足迹。</p>'+mainHtml+cards+'<div class="row" style="margin-top:10px"><button class="btn sm" id="backStart">返回</button></div>');
    qs("#mClose").onclick=function(){closeModal();if(!state.player)renderStart();};
    if(qs("#backStart"))qs("#backStart").onclick=function(){closeModal();renderStart();};
    if(qs("#loadMain"))qs("#loadMain").onclick=function(){state=loadGame();if(state&&state.player){ensurePlayer(state.player);closeModal();renderGame();}};
    qsa(".slot-read").forEach(function(el){el.onclick=function(){const i=parseInt(el.dataset.slot,10);const data=loadFromSlot(i);if(!data||!data.player){alert("此档无效");return;}state=data;ensurePlayer(state.player);closeModal();renderGame();};});
    qsa(".slot-clear").forEach(function(el){el.onclick=function(){const i=parseInt(el.dataset.slot,10);if(!hasSlot(i))return;if(!confirm("确定清空「"+SAVE_SLOT_NAMES[i]+"」？"))return;deleteSlot(i);modalLoadSlots();};});
  };
  function wireSaveBtn(){
    var bar=document.querySelector(".toolbar");
    if(!bar||qs("#saveBtn",bar))return;
    var b=document.createElement("button");
    b.className="btn sm";b.id="saveBtn";b.textContent="存档";
    b.onclick=function(){modalSaves();};
    var bag=qs("#bagBtn",bar)||qs("#skillBtn",bar)||qs("#charBtn",bar);
    if(bag&&bag.nextSibling)bar.insertBefore(b,bag.nextSibling);
    else if(bag)bar.appendChild(b);
    else bar.appendChild(b);
    var old=qs("#save",bar);if(old)old.style.display="none";
  }
  var _rg=typeof renderGame==="function"?renderGame:null;
  if(_rg){
    renderGame=function(){_rg();wireSaveBtn();};
  }
  var tries=0;
  var t=setInterval(function(){
    tries++;
    var cont=document.querySelector("#continue");
    if(cont){
      cont.disabled=!(typeof hasAnySlot==="function"?hasAnySlot():hasSave());
      cont.onclick=function(){modalLoadSlots();};
      clearInterval(t);
    }
    if(tries>50)clearInterval(t);
  },100);
})();
