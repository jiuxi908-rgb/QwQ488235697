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
