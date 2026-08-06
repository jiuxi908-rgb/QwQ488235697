const origins=[{id:"farmer",name:"田舍少年",desc:"耐苦，根骨较高。",stats:{arm:1,agi:0,bone:3,qi:0,wit:0,luck:1}},{id:"merchant",name:"行商子弟",desc:"见多识广，福缘较高。",stats:{arm:0,agi:1,bone:0,qi:0,wit:1,luck:3}},{id:"orphan",name:"市井孤儿",desc:"机敏善逃，身法较高。",stats:{arm:0,agi:3,bone:0,qi:0,wit:1,luck:1}},{id:"scholar",name:"寒窗书生",desc:"悟性出众，体魄稍弱。",stats:{arm:0,agi:0,bone:0,qi:1,wit:4,luck:0}}];
const talents=[{id:"quick_learner",name:"过目不忘",desc:"悟性+2。",stats:{wit:2}},{id:"iron_body",name:"铁骨",desc:"根骨+2。",stats:{bone:2}},{id:"wind_step",name:"踏风",desc:"身法+2。",stats:{agi:2}},{id:"lucky_star",name:"天眷",desc:"福缘+2。",stats:{luck:2}}];
const skills=[
{id:"basic_fist",name:"破风拳",type:"拳掌",quality:"黄阶",req:{arm:6},cost:0,mp:0,power:8,effect:"破绽",maxExp:50},
{id:"basic_sword",name:"青锋剑诀",type:"剑法",quality:"黄阶",req:{agi:6},cost:0,mp:5,power:12,effect:null,maxExp:60},
{id:"basic_blade",name:"开山刀法",type:"刀法",quality:"黄阶",req:{arm:8},cost:0,mp:6,power:15,effect:"流血",maxExp:70},
{id:"basic_qinggong",name:"踏雪无痕",type:"轻功",quality:"黄阶",req:{agi:7},cost:0,mp:0,power:0,effect:"dodge+3",maxExp:50},
{id:"basic_neigong",name:"养气诀",type:"内功",quality:"黄阶",req:{qi:6},cost:0,mp:0,power:0,effect:"maxMp+20",maxExp:80},
{id:"throwing_needle",name:"飞星针",type:"暗器",quality:"黄阶",req:{agi:8,wit:5},cost:20,mp:3,power:10,effect:"破绽",maxExp:55},
{id:"crush_leg",name:"碎石腿",type:"拳掌",quality:"黄阶",req:{arm:7,bone:6},cost:15,mp:4,power:11,effect:"迟滞",maxExp:55},
{id:"point_finger",name:"点穴手",type:"拳掌",quality:"黄阶",req:{wit:7,agi:6},cost:18,mp:6,power:9,effect:"破绽",maxExp:55},
{id:"flow_sword",name:"流水剑",type:"剑法",quality:"黄阶",req:{agi:7,qi:5},cost:16,mp:6,power:13,effect:null,maxExp:60},
{id:"yanlan_sword",name:"烟岚十三剑",type:"剑法",quality:"玄阶",req:{agi:12,wit:10},cost:80,mp:12,power:28,effect:"迟滞",maxExp:120},
{id:"chilu_blade",name:"赤炉烈刀",type:"刀法",quality:"玄阶",req:{arm:14,qi:8},cost:100,mp:15,power:35,effect:"流血",maxExp:140},
{id:"huichun_palm",name:"回春掌",type:"拳掌",quality:"玄阶",req:{bone:12,qi:10},cost:90,mp:18,power:22,effect:"heal",maxExp:130},
{id:"xuanjing_neigong",name:"玄鲸息海",type:"内功",quality:"玄阶",req:{qi:15,bone:10},cost:120,mp:0,power:0,effect:"maxMp+60,qi+2",maxExp:160},
{id:"baique_qinggong",name:"白雀掠影",type:"轻功",quality:"玄阶",req:{agi:16},cost:110,mp:8,power:0,effect:"dodge+8",maxExp:150},
{id:"iron_shirt",name:"铁布衫",type:"内功",quality:"玄阶",req:{bone:14,arm:10},cost:100,mp:0,power:0,effect:"maxHp+80,bone+1",maxExp:140},
{id:"falling_leaf",name:"落叶刀法",type:"刀法",quality:"玄阶",req:{arm:12,agi:10},cost:85,mp:12,power:30,effect:"流血",maxExp:125},
{id:"frost_palm",name:"寒霜掌",type:"拳掌",quality:"玄阶",req:{qi:12,wit:10},cost:95,mp:16,power:26,effect:"迟滞",maxExp:130},
{id:"cloud_step",name:"云踪步",type:"轻功",quality:"玄阶",req:{agi:14,luck:6},cost:90,mp:6,power:0,effect:"dodge+6,first+3",maxExp:140},
{id:"wuxiang_finger",name:"无相指",type:"拳掌",quality:"地阶",req:{wit:18,qi:16},cost:250,mp:25,power:45,effect:"内伤",maxExp:250},
{id:"jiwu_sword",name:"缉武断罪剑",type:"剑法",quality:"地阶",req:{arm:16,wit:14,luck:8},cost:280,mp:22,power:50,effect:"破绽",maxExp:280},
{id:"night_shadow",name:"夜行影步",type:"轻功",quality:"地阶",req:{agi:20,luck:10},cost:260,mp:12,power:0,effect:"dodge+12,first+5",maxExp:260},
{id:"blood_blade",name:"血海狂刀",type:"刀法",quality:"地阶",req:{arm:20,bone:12},cost:300,mp:30,power:60,effect:"流血",maxExp:300},
{id:"star_throw",name:"摘星手",type:"暗器",quality:"地阶",req:{agi:18,wit:15},cost:220,mp:15,power:38,effect:"破绽",maxExp:240},
{id:"gold_bell",name:"金钟罩",type:"内功",quality:"地阶",req:{bone:18,arm:14},cost:240,mp:0,power:0,effect:"maxHp+120,bone+2",maxExp:260},
{id:"split_cloud",name:"裂云枪",type:"刀法",quality:"地阶",req:{arm:18,agi:12},cost:270,mp:24,power:55,effect:"破绽",maxExp:270},
{id:"tian_jian",name:"天问一剑",type:"剑法",quality:"天阶",req:{agi:25,wit:22,qi:20},cost:800,mp:50,power:100,effect:"破绽",maxExp:500},
{id:"dragon_neigong",name:"潜龙吐息",type:"内功",quality:"天阶",req:{qi:28,bone:20},cost:900,mp:0,power:0,effect:"maxMp+150,attack+15",maxExp:550},
{id:"phantom_palm",name:"千影幻掌",type:"拳掌",quality:"天阶",req:{agi:24,wit:20},cost:850,mp:40,power:80,effect:"迟滞",maxExp:520},
{id:"wan_jian",name:"万剑归宗",type:"剑法",quality:"天阶",req:{agi:26,wit:20,arm:18},cost:880,mp:55,power:95,effect:"破绽",maxExp:530},
{id:"taixu",name:"太虚神功",type:"内功",quality:"天阶",req:{qi:30,wit:22,bone:18},cost:950,mp:0,power:0,effect:"maxMp+180,maxHp+100,qi+3",maxExp:560}
];

const SKILL_DESIGN={qualities:["黄阶","玄阶","地阶","天阶"],types:["内功","剑法","刀法","拳掌","轻功","暗器"],realms:["初窥门径","登堂入室","融会贯通","炉火纯青","返璞归真"]};
const BASE_STATS={arm:5,agi:5,bone:5,qi:5,wit:5,luck:5};
const STAT_LABELS={arm:"臂力",agi:"身法",bone:"根骨",qi:"内力",wit:"悟性",luck:"福缘"};
const STAT_HELP={arm:"外功伤害。",agi:"闪避先手。",bone:"气血抗性。",qi:"内力招式。",wit:"读谱经验。",luck:"奇遇。"};
const LOCAL_SKILLS={qinghe:["basic_fist","basic_sword","basic_neigong","crush_leg"],bamboo:["basic_qinggong","basic_blade","flow_sword"],market:["throwing_needle","basic_fist","point_finger"],mist_gate:["yanlan_sword","basic_qinggong","cloud_step"],ferry:["basic_blade","flow_sword"],salt_road:["night_shadow","blood_blade","falling_leaf"],hearth:["chilu_blade","iron_shirt","split_cloud"],herb_valley:["huichun_palm","frost_palm"],whale_port:["xuanjing_neigong","cloud_step"],sparrow_den:["baique_qinggong","night_shadow","star_throw"],void_temple:["wuxiang_finger","gold_bell"],cloud_peak:["wan_jian","taixu"],blood_ravine:["blood_blade","split_cloud"],secret_reef:["dragon_neigong","xuanjing_neigong"],secret_cave:["night_shadow","phantom_palm"]};

function applyBonus(stats,bonus={}){Object.entries(bonus).forEach(([k,v])=>stats[k]+=v);}
function createPlayer({name,gender,origin,talent}){
  const stats={...BASE_STATS};
  applyBonus(stats,origins.find(o=>o.id===origin)?.stats);
  applyBonus(stats,talents.find(t=>t.id===talent)?.stats);
  return{name:name||"无名少侠",gender,age:16,origin,talent,stats,hp:stats.bone*20+80,maxHp:stats.bone*20+80,mp:stats.qi*15+60,maxMp:stats.qi*15+60,silver:120,location:"qinghe",reputation:0,day:1,skills:[],sect:null,contrib:0,logs:["十六岁这年，你背起旧包袱，踏入清河镇。"]};
}
function derived(player){
  let dodgeBonus=0,attackBonus=0;
  for(const s of player.skills||[]){
    if(s.effect&&typeof s.effect==="string"){
      const dm=s.effect.match(/dodge\+(\d+)/);if(dm)dodgeBonus+=parseInt(dm[1])*(1+s.realm*0.15);
      const am=s.effect.match(/attack\+(\d+)/);if(am)attackBonus+=parseInt(am[1])*(1+s.realm*0.15);
    }
  }
  return{attack:Math.floor(player.stats.arm*2+player.stats.qi/2+attackBonus),dodge:Math.floor(player.stats.agi*2+dodgeBonus)};
}
function calcCombatPower(player){
  const d=derived(player);
  let skillPower=0;
  for(const s of player.skills||[]) skillPower+=(s.power||0)*(1+s.realm*0.25);
  return Math.floor(d.attack*2+d.dodge+skillPower+player.stats.bone+player.stats.qi/2);
}
function resolveThreat(player,diff,baseDamage){
  const power=calcCombatPower(player);
  const ratio=power/Math.max(diff,1);
  let result={power,diff,damage:0,outcome:"",gain:null};
  if(ratio>=1.2){
    result.damage=0;result.outcome="完胜";
    const bonus=Math.floor(5+Math.random()*10);player.silver+=bonus;result.gain={type:"silver",value:bonus};
    if(player.skills&&player.skills.length){const s=player.skills[Math.floor(Math.random()*player.skills.length)];s.exp+=8;result.gain.exp=8;result.gain.skill=s.name;}
  }else if(ratio>=1.0){result.damage=Math.max(1,Math.floor(baseDamage*0.4));result.outcome="险胜";}
  else if(ratio>=0.6){result.damage=baseDamage;result.outcome="受挫";}
  else{result.damage=Math.floor(baseDamage*1.5);result.outcome="惨败";}
  player.hp=Math.max(1,player.hp-result.damage);
  return result;
}

const SAVE_KEY="yijian_yisuo_save_v2";
function saveGame(state){localStorage.setItem(SAVE_KEY,JSON.stringify({...state,savedAt:new Date().toISOString()}));}
function loadGame(){const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null;}
function hasSave(){return Boolean(localStorage.getItem(SAVE_KEY));}
function deleteSave(){localStorage.removeItem(SAVE_KEY);localStorage.removeItem("yijian_yisuo_save_v1");}

function getMapById(id){return maps.find(m=>m.id===id);}
function getSectById(id){return sects.find(s=>s.id===id);}
function getSectByLoc(locId){const m=getMapById(locId);return m&&m.sect?getSectById(m.sect):null;}

function movePlayer(player,targetId){
  const here=getMapById(player.location);
  if(!here||!here.neighbors.includes(targetId))return{ok:false,message:"道路未通。"};
  player.location=targetId;player.day+=1;
  const next=getMapById(targetId);
  const base=next.events[Math.floor(Math.random()*next.events.length)];
  const flavor=(typeof flavorArrival==="function"?flavorArrival(next.id,base):base)||base;
  player.logs.unshift(`第${player.day}日，你来到【${next.name}】。${flavor}`);
  player.logs=player.logs.slice(0,50);
  return{ok:true,message:flavor};
}

function exploreLocation(player){
  const here=getMapById(player.location);
  if(!here)return{ok:false,message:"此地不存在。"};
  const pool=(typeof getExploreEvents==="function"?getExploreEvents(here.id,here.explore):here.explore)||[];
  if(!pool.length)return{ok:false,message:"此地暂无游历。"};
  player.day+=1;
  const evt=pool[Math.floor(Math.random()*pool.length)];
  let msg=`第${player.day}日，【${here.name}】${evt.text}`;
  if(evt.type==="damage"||(evt.type==="silver"&&evt.value<0&&evt.diff)){
    const r=resolveThreat(player,evt.diff||30,evt.type==="damage"?evt.value:Math.abs(evt.value));
    const flavor=(typeof flavorThreat==="function"?flavorThreat(r.outcome):"")||"";
    if(flavor)msg+=" "+flavor;
    if(r.outcome==="完胜"){
      msg+=` 【战力${r.power} vs 难度${r.diff} · 完胜】`;
      if(r.gain){msg+=`（银两+${r.gain.value}`+(r.gain.exp?`，【${r.gain.skill}】经验+${r.gain.exp}`:"")+"）";}
    }else if(r.outcome==="险胜"){
      msg+=` 【战力${r.power} vs 难度${r.diff} · 险胜】（气血-${r.damage}）`;
    }else if(r.outcome==="受挫"){
      msg+=` 【战力${r.power} vs 难度${r.diff} · 受挫】（气血-${r.damage}）`;
      if(evt.type==="silver"&&evt.value<0){player.silver=Math.max(0,player.silver+evt.value);msg+=`（银两${evt.value}）`;}
    }else{
      msg+=` 【战力${r.power} vs 难度${r.diff} · 惨败】（气血-${r.damage}）`;
      if(evt.type==="silver"&&evt.value<0){const loss=Math.floor(Math.abs(evt.value)*1.5);player.silver=Math.max(0,player.silver-loss);msg+=`（银两-${loss}）`;}
    }
  }else{
    switch(evt.type){
      case"silver":player.silver=Math.max(0,player.silver+evt.value);msg+=evt.value>0?`（银两+${evt.value}）`:`（银两${evt.value}）`;break;
      case"heal":player.hp=Math.min(player.maxHp,player.hp+evt.value);msg+=`（气血+${evt.value}）`;break;
      case"mp":player.mp=Math.min(player.maxMp,player.mp+evt.value);msg+=`（内力+${evt.value}）`;break;
      case"exp":
        if(player.skills&&player.skills.length){
          const s=player.skills[Math.floor(Math.random()*player.skills.length)];
          s.exp+=evt.value;msg+=`（【${s.name}】经验+${evt.value}）`;
          while(s.exp>=s.maxExp&&s.realm<4){
            s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);
            s.power=Math.floor((s.power||0)*1.25);msg+=" → 武学突破！";
          }
        }else msg+="（尚无武学可练，此行只作见识）";
        break;
      case"stat":
        if(player.stats[evt.key]!==undefined){
          player.stats[evt.key]+=evt.value;
          const lab=(typeof STAT_LABELS!=="undefined"&&STAT_LABELS[evt.key])?STAT_LABELS[evt.key]:evt.key;
          msg+=`（${lab}+${evt.value}）`;
        }
        break;
      default:break;
    }
  }
  player.logs.unshift(msg);player.logs=player.logs.slice(0,50);
  return{ok:true,message:msg};
}

function getSkillById(id){return skills.find(s=>s.id===id);}
function canLearn(player,skill){
  if(player.skills.some(s=>s.id===skill.id))return{ok:false,msg:"已学会。"};
  if(player.silver<skill.cost)return{ok:false,msg:`银两不足（${skill.cost}）`};
  for(const[k,v]of Object.entries(skill.req||{}))if((player.stats[k]||0)<v)return{ok:false,msg:`${k}不足${v}`};
  return{ok:true};
}
function learnSkill(player,skill){
  const check=canLearn(player,skill);if(!check.ok)return check;
  player.silver-=skill.cost;
  player.skills.push({id:skill.id,name:skill.name,type:skill.type,quality:skill.quality,realm:0,exp:0,maxExp:skill.maxExp||100,power:skill.power,mp:skill.mp,effect:skill.effect});
  applyPassive(player,skill);
  player.logs.unshift(`学会【${skill.name}】！`);
  return{ok:true,msg:`学会【${skill.name}】`};
}
function applyPassive(player,skill){
  if(!skill.effect||typeof skill.effect!=="string")return;
  skill.effect.split(",").forEach(p=>{
    const m=p.trim().match(/(\w+)\+(\d+)/);if(!m)return;
    const[,key,val]=m;const n=parseInt(val);
    if(key==="maxHp"){player.maxHp+=n;player.hp=Math.min(player.hp+n,player.maxHp);}
    else if(key==="maxMp"){player.maxMp+=n;player.mp=Math.min(player.mp+n,player.maxMp);}
    else if(player.stats[key]!==undefined)player.stats[key]+=n;
  });
}
function trainSkill(player,skillId,amount=10){
  const s=player.skills.find(x=>x.id===skillId);
  if(!s)return{ok:false,msg:"未学会"};
  if(s.realm>=4)return{ok:false,msg:"已满境"};
  s.exp+=amount;
  while(s.exp>=s.maxExp&&s.realm<4){s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);s.power=Math.floor((s.power||0)*1.25);player.logs.unshift(`【${s.name}】突破至【${SKILL_DESIGN.realms[s.realm]}】！`);}
  return{ok:true,msg:`修炼【${s.name}】`};
}

function canJoinSect(player,sect){
  if(player.sect)return{ok:false,msg:"你已有门派。"};
  for(const[k,v]of Object.entries(sect.req||{})){
    if(k==="reputation"){if((player.reputation||0)<v)return{ok:false,msg:`声望不足${v}`};}
    else if((player.stats[k]||0)<v)return{ok:false,msg:`${STAT_LABELS[k]||k}不足${v}`};
  }
  return{ok:true};
}
function joinSect(player,sect){
  const c=canJoinSect(player,sect);if(!c.ok)return c;
  player.sect=sect.id;player.contrib=0;
  player.logs.unshift(`你拜入【${sect.name}】，师父是${sect.master.name}（${sect.master.title}）。`);
  return{ok:true,msg:`拜入${sect.name}`};
}
function doSectTask(player,task){
  if(!player.sect)return{ok:false,msg:"无门派"};
  player.day+=1;
  if(task.diff){
    const r=resolveThreat(player,task.diff,Math.floor(task.diff*0.4));
    if(r.outcome==="惨败"){player.logs.unshift(`任务【${task.name}】失败：惨败（气血-${r.damage}）`);return{ok:false,msg:"任务失败"};}
    player.contrib+=task.contrib;
    if(task.silver)player.silver+=task.silver;
    player.logs.unshift(`完成任务【${task.name}】（${r.outcome}）贡献+${task.contrib}`+(task.silver?` 银两+${task.silver}`:""));
  }else{
    player.contrib+=task.contrib;
    if(task.silver)player.silver+=task.silver;
    player.logs.unshift(`完成任务【${task.name}】贡献+${task.contrib}`+(task.silver?` 银两+${task.silver}`:""));
  }
  player.logs=player.logs.slice(0,50);
  return{ok:true};
}
function buySectItem(player,sect,item){
  if(player.sect!==sect.id)return{ok:false,msg:"非本门弟子"};
  if((player.contrib||0)<item.contribNeed)return{ok:false,msg:`贡献不足${item.contribNeed}`};
  if(player.silver<item.cost)return{ok:false,msg:"银两不足"};
  player.silver-=item.cost;
  if(item.skill){
    const sk=getSkillById(item.skill);
    if(sk&&!player.skills.some(s=>s.id===sk.id)){learnSkill(player,{...sk,cost:0});player.logs.unshift(`以贡献换取独门武学【${sk.name}】！`);}
    else return{ok:false,msg:"已拥有或无效"};
  }else if(item.effect==="heal"){player.hp=Math.min(player.maxHp,player.hp+item.value);player.logs.unshift(`使用【${item.name}】气血+${item.value}`);}
  else if(item.effect==="mp"){player.mp=Math.min(player.maxMp,player.mp+item.value);player.logs.unshift(`使用【${item.name}】内力+${item.value}`);}
  else if(item.effect==="exp"&&player.skills.length){const s=player.skills[0];s.exp+=item.value;player.logs.unshift(`【${item.name}】武学经验+${item.value}`);}
  else if(item.effect==="stat"){player.stats[item.key]=(player.stats[item.key]||0)+item.value;player.logs.unshift(`【${item.name}】${item.key}+${item.value}`);}
  return{ok:true};
}
