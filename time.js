/* 农历时辰系统 · 兼容旧存档 day 字段 */
const SHICHEN_NAMES=["子时","丑时","寅时","卯时","辰时","巳时","午时","未时","申时","酉时","戌时","亥时"];
const MONTH_NAMES=["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
const XUN_NAMES=["上旬","中旬","下旬"];
const ERA_NAME="大雍";
const TIME_COST={move:1,explore:2,train:4,sectTask:2,npcAct:1,chat:0,gift:0};

const JIEQI=[
  {m:1,d:5,name:"立春"},{m:1,d:20,name:"雨水"},
  {m:2,d:5,name:"惊蛰"},{m:2,d:20,name:"春分"},
  {m:3,d:5,name:"清明"},{m:3,d:20,name:"谷雨"},
  {m:4,d:5,name:"立夏"},{m:4,d:20,name:"小满"},
  {m:5,d:5,name:"芒种"},{m:5,d:21,name:"夏至"},
  {m:6,d:7,name:"小暑"},{m:6,d:22,name:"大暑"},
  {m:7,d:7,name:"立秋"},{m:7,d:23,name:"处暑"},
  {m:8,d:8,name:"白露"},{m:8,d:23,name:"秋分"},
  {m:9,d:8,name:"寒露"},{m:9,d:23,name:"霜降"},
  {m:10,d:7,name:"立冬"},{m:10,d:22,name:"小雪"},
  {m:11,d:7,name:"大雪"},{m:11,d:22,name:"冬至"},
  {m:12,d:6,name:"小寒"},{m:12,d:21,name:"大寒"}
];
const JIEQI_EVENTS={
  "立春":"立春一到，草木未醒，江湖却已有人出门讨春。",
  "雨水":"雨水连绵，山路泥泞，轻功好的人反而讨巧。",
  "惊蛰":"惊蛰雷动，虫蛇出穴，野外遇袭的可能大了。",
  "春分":"春分昼夜均，吐纳格外顺畅。",
  "清明":"清明时节，坟前纸灰，正邪都忌妄动杀生。",
  "谷雨":"谷雨采茶，药草也肥，医馆的草药略便宜些。",
  "立夏":"立夏心火易旺，比武者增多。",
  "小满":"小满江河涨，渡口生意兴隆。",
  "芒种":"芒种农忙，市集雇工银价上浮。",
  "夏至":"夏至一阴生，午时燥热，修炼效率反而下降。",
  "小暑":"小暑伏中，内息易散，夜里练功更稳。",
  "大暑":"大暑酷热，白日赶路易耗气血。",
  "立秋":"立秋金风起，刀兵之气稍盛。",
  "处暑":"处暑余热未消，夜行仍需小心。",
  "白露":"白露为霜前，山中晨练极佳。",
  "秋分":"秋分收成，商路银货往来频繁。",
  "寒露":"寒露侵体，体弱者易伤，根骨高的人无碍。",
  "霜降":"霜降草木枯，追踪足迹反而容易。",
  "立冬":"立冬闭藏，门派多闭关，外门事务减少。",
  "小雪":"小雪初飘，秘境入口或因寒气显露异状。",
  "大雪":"大雪封山，部分山道难行。",
  "冬至":"冬至一阳生，子时吐纳事半功倍。",
  "小寒":"小寒冷峭，暖炉与热药走俏。",
  "大寒":"大寒岁末，各门盘点年功，贡献奖励略丰。"
};

function defaultClock(){
  return{year:17,month:3,day:1,shi:4};
}
function ensureClock(player){
  if(!player)return defaultClock();
  if(!player.clock||typeof player.clock!=="object"){
    const d=Math.max(1,player.day|0);
    const totalDays=d-1;
    const year=17+Math.floor(totalDays/360);
    const rem=totalDays%360;
    const month=1+Math.floor(rem/30);
    const day=1+(rem%30);
    player.clock={year:year,month:month,day:day,shi:4};
  }
  const c=player.clock;
  c.year=c.year|0||17;
  c.month=Math.min(12,Math.max(1,c.month|0||1));
  c.day=Math.min(30,Math.max(1,c.day|0||1));
  c.shi=((c.shi|0)%12+12)%12;
  return c;
}
function xunOf(day){
  if(day<=10)return 0;
  if(day<=20)return 1;
  return 2;
}
function formatClock(player){
  const c=ensureClock(player);
  const xun=XUN_NAMES[xunOf(c.day)];
  return ERA_NAME+c.year+"年 "+MONTH_NAMES[c.month-1]+" "+xun+" "+SHICHEN_NAMES[c.shi];
}
function formatClockShort(player){
  const c=ensureClock(player);
  return MONTH_NAMES[c.month-1]+XUN_NAMES[xunOf(c.day)]+"·"+SHICHEN_NAMES[c.shi];
}
function getJieqi(month,day){
  for(let i=0;i<JIEQI.length;i++){
    if(JIEQI[i].m===month&&JIEQI[i].d===day)return JIEQI[i];
  }
  return null;
}
function currentJieqi(player){
  const c=ensureClock(player);
  return getJieqi(c.month,c.day);
}

function advanceTime(player,shiCost){
  ensureClock(player);
  const cost=Math.max(0,shiCost|0);
  if(cost===0)return{msgs:[],dayChanged:false,jieqi:null};
  const c=player.clock;
  c.shi+=cost;
  let daysPassed=0;
  while(c.shi>=12){
    c.shi-=12;
    c.day+=1;
    daysPassed++;
  }
  while(c.day>30){
    c.day-=30;
    c.month+=1;
  }
  while(c.month>12){
    c.month-=12;
    c.year+=1;
  }
  if(daysPassed>0)player.day=(player.day|0)+daysPassed;
  const msgs=[];
  let jq=null;
  if(daysPassed>0){
    jq=getJieqi(c.month,c.day);
    if(jq){
      const tip=JIEQI_EVENTS[jq.name]||"";
      msgs.push("今日"+jq.name+"。"+tip);
      player.flags=player.flags||{};
      player.flags["jieqi_"+c.year+"_"+c.month+"_"+c.day]=1;
      applyJieqiBonus(player,jq.name);
    }
  }
  return{msgs:msgs,dayChanged:daysPassed>0,jieqi:jq};
}

function applyJieqiBonus(player,name){
  if(!player)return;
  if(name==="春分"||name==="冬至"){
    player.mp=Math.min(player.maxMp,(player.mp|0)+15);
  }
  if(name==="大寒"){
    if(player.sect)player.contrib=(player.contrib|0)+3;
  }
}

function shiThreatMod(player){
  const shi=ensureClock(player).shi;
  if(shi===0||shi===1||shi===11)return 1.25;
  if(shi===9||shi===10)return 1.1;
  if(shi===3||shi===4)return 0.9;
  return 1;
}
function shiTrainMod(player){
  const shi=ensureClock(player).shi;
  if(shi===3)return 1.35;
  if(shi===2)return 1.2;
  if(shi===4||shi===5)return 1.1;
  if(shi===0)return 1.15;
  if(shi===6||shi===7)return 0.85;
  return 1;
}
function shiExploreDangerBias(player){
  const shi=ensureClock(player).shi;
  if(shi===0||shi===1)return 0.25;
  if(shi===11)return 0.2;
  if(shi===3||shi===4)return -0.1;
  return 0;
}
function xunPriceMod(player){
  const x=xunOf(ensureClock(player).day);
  const jq=currentJieqi(player);
  let m=1;
  if(x===0)m=1.1;
  else if(x===1)m=1.0;
  else m=0.92;
  if(jq&&jq.name==="谷雨")m*=0.9;
  if(jq&&(jq.name==="小寒"||jq.name==="大寒"))m*=1.08;
  return m;
}
function xunTaskMod(player){
  const x=xunOf(ensureClock(player).day);
  const jq=currentJieqi(player);
  let m=1;
  if(x===2)m=1.15;
  if(jq&&jq.name==="大寒")m*=1.2;
  if(jq&&jq.name==="立冬")m*=0.9;
  return m;
}
function pickExploreEvent(pool,player){
  if(!pool||!pool.length)return null;
  const bias=shiExploreDangerBias(player);
  if(bias===0)return pool[Math.floor(Math.random()*pool.length)];
  const danger=pool.filter(function(e){return e.type==="damage"||(e.type==="silver"&&e.value<0);});
  const safe=pool.filter(function(e){return !(e.type==="damage"||(e.type==="silver"&&e.value<0));});
  const roll=Math.random();
  if(bias>0&&danger.length&&roll<Math.min(0.55,0.3+bias))return danger[Math.floor(Math.random()*danger.length)];
  if(bias<0&&safe.length&&roll<Math.min(0.55,0.3-bias))return safe[Math.floor(Math.random()*safe.length)];
  return pool[Math.floor(Math.random()*pool.length)];
}

(function patchTimeActions(){
  if(typeof movePlayer==="function"){
    var _move=movePlayer;
    movePlayer=function(player,targetId){
      const r=_move(player,targetId);
      if(r&&r.ok){
        if(player.day>1)player.day=Math.max(1,(player.day|0)-1);
        const t=advanceTime(player,TIME_COST.move);
        if(t.msgs&&t.msgs.length)t.msgs.forEach(function(m){player.logs.unshift(m);});
        if(player.logs&&player.logs[0]){
          player.logs[0]=formatClockShort(player)+" · "+String(player.logs[0]).replace(/^第\d+日[，,]?/,"");
        }
      }
      return r;
    };
  }
  if(typeof exploreLocation==="function"){
    exploreLocation=function(player){
      const here=getMapById(player.location);
      if(!here)return{ok:false,message:"此地不存在。"};
      const pool=(typeof getExploreEvents==="function"?getExploreEvents(here.id,here.explore):here.explore)||[];
      if(!pool.length)return{ok:false,message:"此地暂无游历。"};
      const evt=pickExploreEvent(pool,player);
      const t=advanceTime(player,TIME_COST.explore);
      let msg=formatClockShort(player)+"，【"+here.name+"】"+evt.text;
      const threatMul=shiThreatMod(player);
      if(evt.type==="damage"||(evt.type==="silver"&&evt.value<0&&evt.diff)){
        const diff=Math.floor((evt.diff||30)*threatMul);
        const baseDmg=evt.type==="damage"?evt.value:Math.abs(evt.value);
        const r=resolveThreat(player,diff,baseDmg);
        const flavor=(typeof flavorThreat==="function"?flavorThreat(r.outcome):"")||"";
        if(flavor)msg+=" "+flavor;
        if(r.outcome==="完胜"){
          msg+=" 【战力"+r.power+" vs 难度"+r.diff+" · 完胜】";
          if(r.gain){msg+="（银两+"+r.gain.value+(r.gain.exp?"，【"+r.gain.skill+"】经验+"+r.gain.exp:"")+"）";}
        }else if(r.outcome==="险胜"){
          msg+=" 【战力"+r.power+" vs 难度"+r.diff+" · 险胜】（气血-"+r.damage+"）";
        }else if(r.outcome==="受挫"){
          msg+=" 【战力"+r.power+" vs 难度"+r.diff+" · 受挫】（气血-"+r.damage+"）";
          if(evt.type==="silver"&&evt.value<0){player.silver=Math.max(0,player.silver+evt.value);msg+="（银两"+evt.value+"）";}
        }else{
          msg+=" 【战力"+r.power+" vs 难度"+r.diff+" · 惨败】（气血-"+r.damage+"）";
          if(evt.type==="silver"&&evt.value<0){const loss=Math.floor(Math.abs(evt.value)*1.5);player.silver=Math.max(0,player.silver-loss);msg+="（银两-"+loss+"）";}
        }
      }else{
        switch(evt.type){
          case"silver":player.silver=Math.max(0,player.silver+evt.value);msg+=evt.value>0?"（银两+"+evt.value+"）":"（银两"+evt.value+"）";break;
          case"heal":player.hp=Math.min(player.maxHp,player.hp+evt.value);msg+="（气血+"+evt.value+"）";break;
          case"mp":player.mp=Math.min(player.maxMp,player.mp+evt.value);msg+="（内力+"+evt.value+"）";break;
          case"exp":
            if(player.skills&&player.skills.length){
              const s=player.skills[Math.floor(Math.random()*player.skills.length)];
              const gain=Math.floor(evt.value*shiTrainMod(player));
              s.exp+=gain;msg+="（【"+s.name+"】经验+"+gain+(gain>evt.value?" · 时辰加持":"")+"）";
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
              msg+="（"+lab+"+"+evt.value+"）";
            }
            break;
        }
      }
      if(t.msgs)t.msgs.forEach(function(m){player.logs.unshift(m);});
      player.logs.unshift(msg);player.logs=player.logs.slice(0,50);
      return{ok:true,message:msg};
    };
  }
  if(typeof trainSkill==="function"){
    var _train=trainSkill;
    trainSkill=function(player,skillId,amount){
      const mod=shiTrainMod(player);
      const base=amount==null?10:amount;
      const adj=Math.max(1,Math.floor(base*mod));
      const r=_train(player,skillId,adj);
      if(r&&r.ok){
        const t=advanceTime(player,TIME_COST.train);
        if(t.msgs)t.msgs.forEach(function(m){player.logs.unshift(m);});
        if(mod>1.05)player.logs.unshift(formatClockShort(player)+"修炼事半功倍（经验×"+mod.toFixed(2)+"）");
        else if(mod<0.95)player.logs.unshift(formatClockShort(player)+"心神略散，修炼效率偏低。");
      }
      return r;
    };
  }
  if(typeof doSectTask==="function"){
    var _task=doSectTask;
    doSectTask=function(player,task){
      const mod=xunTaskMod(player);
      const tCopy=Object.assign({},task);
      if(tCopy.contrib)tCopy.contrib=Math.max(1,Math.floor(tCopy.contrib*mod));
      if(tCopy.silver)tCopy.silver=Math.max(0,Math.floor(tCopy.silver*mod));
      const before=player.day;
      const r=_task(player,tCopy);
      if(player.day>before)player.day=before;
      advanceTime(player,TIME_COST.sectTask);
      return r;
    };
  }
})();

var _xunPriceCache=1;
(function(){
  if(typeof createPlayer==="function"){
    var _cp=createPlayer;
    createPlayer=function(opts){
      var p=_cp(opts);
      p.clock=defaultClock();
      p.day=1;
      if(p.logs&&p.logs.length)p.logs[0]=formatClock(p)+"。十六岁这年，你背起旧包袱，踏入清河镇。";
      return p;
    };
  }
  if(typeof interactPerson==="function"){
    var _ip=interactPerson;
    interactPerson=function(player,npc,actId){
      _xunPriceCache=xunPriceMod(player);
      var r=_ip(player,npc,actId);
      _xunPriceCache=1;
      if(r&&r.ok)advanceTime(player,TIME_COST.npcAct);
      return r;
    };
  }
  if(typeof giftNpc==="function"){
    var _gf=giftNpc;
    giftNpc=function(player,npc){
      var r=_gf(player,npc);
      if(r&&r.ok)advanceTime(player,TIME_COST.gift);
      return r;
    };
  }
  if(typeof chatWithNpc==="function"){
    var _ch=chatWithNpc;
    chatWithNpc=function(player,npc,topicId){
      var r=_ch(player,npc,topicId);
      if(r&&r.ok)advanceTime(player,TIME_COST.chat);
      return r;
    };
  }
  if(typeof favorCostDiscount==="function"){
    var _disc=favorCostDiscount;
    favorCostDiscount=function(favor){
      return _disc(favor)*(typeof _xunPriceCache==="number"?_xunPriceCache:1);
    };
  }
})();
