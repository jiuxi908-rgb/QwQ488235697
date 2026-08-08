/* NPC 交互 + 好感度 */
function ensureFavor(player){
  if(!player.favor)player.favor={};
  if(!player.flags)player.flags={};
  if(!player.bonds)player.bonds={};
  return player;
}
function getFavor(player,npcId){
  ensureFavor(player);
  return player.favor[npcId]|0;
}
function addFavor(player,npcId,delta){
  ensureFavor(player);
  const old=player.favor[npcId]|0;
  const next=Math.max(0,Math.min(100,old+(delta|0)));
  player.favor[npcId]=next;
  return next-old;
}
function favorCostDiscount(favor){
  if(favor>=80)return 0.8;
  if(favor>=60)return 0.85;
  if(favor>=40)return 0.9;
  if(favor>=20)return 0.95;
  return 1;
}
function hasBond(player,npcId){
  ensureFavor(player);
  return Boolean(player.bonds[npcId]);
}
function getBondCount(player){
  ensureFavor(player);
  return Object.keys(player.bonds).filter(function(k){return player.bonds[k];}).length;
}

/** 私定终身：好感≥90 且可结缘NPC，一生一次每人 */
function pledgeLifelong(player,npc){
  ensureFavor(player);
  const conf=(typeof ROMANCE_NPCS!=="undefined"?ROMANCE_NPCS[npc.id]:null);
  if(!conf)return{ok:false,msg:npc.name+"与你无此缘分。"};
  if(hasBond(player,npc.id))return{ok:false,msg:conf.already};
  const fav=getFavor(player,npc.id);
  if(fav<90)return{ok:false,msg:conf.rejectNeed+"（需好感≥90，当前"+fav+"）"};
  /* 允许与多人结缘，但每人仅一次；若想限制只结一人可改 getBondCount */
  player.bonds[npc.id]={
    name:conf.name||npc.name,
    at:player.day||1,
    buff:conf.buff||null
  };
  addFavor(player,npc.id,100-fav); /* 拉满到100 */
  if(conf.buff){
    const b=conf.buff;
    if(b.luck)player.stats.luck=(player.stats.luck||0)+b.luck;
    if(b.agi)player.stats.agi=(player.stats.agi||0)+b.agi;
    if(b.wit)player.stats.wit=(player.stats.wit||0)+b.wit;
    if(b.arm)player.stats.arm=(player.stats.arm||0)+b.arm;
  }
  const line=conf.lines[Math.floor(Math.random()*conf.lines.length)];
  const msg=line+" 「"+conf.accept+"」"+(conf.buff?"（"+conf.buff.desc+"）":"");
  player.logs.unshift(msg);
  player.logs=player.logs.slice(0,50);
  return{ok:true,msg:msg};
}

function chatWithNpc(player,npc,topicId){
  ensureFavor(player);
  const topics=(typeof CHAT_TOPICS!=="undefined"?CHAT_TOPICS:[{id:"weather",name:"闲聊",favor:2}]);
  const topic=topics.find(function(t){return t.id===topicId;})||topics[0];
  const fav=getFavor(player,npc.id);
  if(topic.need&&fav<topic.need){
    return{ok:false,msg:npc.name+"不愿多谈。（需好感≥"+topic.need+"）"};
  }
  const dayKey="chat_"+npc.id+"_"+player.day;
  const count=player.flags[dayKey]|0;
  if(count>=3){
    return{ok:false,msg:npc.name+"今日话已尽，明日再来。"};
  }
  player.flags[dayKey]=count+1;
  let gain=topic.favor||2;
  if(count===1)gain=Math.max(1,Math.floor(gain*0.7));
  if(count>=2)gain=Math.max(1,Math.floor(gain*0.5));
  /* 已结缘额外+1 */
  if(hasBond(player,npc.id))gain+=1;
  const d=addFavor(player,npc.id,gain);
  const line=(typeof getDialogueLine==="function"?getDialogueLine(npc,getFavor(player,npc.id)):enrichTalk(npc));
  const rank=(typeof favorRank==="function"?favorRank(getFavor(player,npc.id)).name:"");
  const msg=npc.name+"：「"+line+"」（好感+"+d+" → "+rank+" "+getFavor(player,npc.id)+"）";
  player.logs.unshift(msg);
  player.logs=player.logs.slice(0,50);
  return{ok:true,msg:msg,line:line};
}

function giftNpc(player,npc){
  ensureFavor(player);
  const cost=15;
  if(player.silver<cost)return{ok:false,msg:"银两不足（需"+cost+"）"};
  player.silver-=cost;
  let base=8+Math.floor(Math.random()*5);
  if(hasBond(player,npc.id))base+=3;
  const d=addFavor(player,npc.id,base);
  const msg="你送了些礼物给"+npc.name+"（银两-"+cost+"，好感+"+d+" → "+getFavor(player,npc.id)+"）";
  player.logs.unshift(msg);
  player.logs=player.logs.slice(0,50);
  return{ok:true,msg:msg};
}

function interactPerson(player,npc,actId){
  ensureFavor(player);
  const act=(npc.acts||[]).find(function(a){return a.id===actId;});
  if(!act)return{ok:false,msg:"无此选项"};
  const flagKey=npc.id+"_"+act.id;
  if(act.once&&player.flags[flagKey])return{ok:false,msg:"已经做过了"};
  const fav=getFavor(player,npc.id);
  if(act.favorNeed&&fav<act.favorNeed){
    return{ok:false,msg:npc.name+"还不够信任你。（需好感≥"+act.favorNeed+"）"};
  }
  let cost=act.cost||0;
  const disc=favorCostDiscount(fav);
  if(cost>0&&(act.type==="heal"||act.type==="rest"||act.type==="item"||act.type==="exp")){
    cost=Math.max(1,Math.floor(cost*disc));
  }
  if(cost>0&&player.silver<cost)return{ok:false,msg:"银两不足（需"+cost+"）"};
  let msg="";
  let favorDelta=0;
  switch(act.type){
    case"talk":{
      const line=(typeof getDialogueLine==="function"?getDialogueLine(npc,fav):npc.talks[Math.floor(Math.random()*npc.talks.length)]);
      favorDelta=addFavor(player,npc.id,1+(hasBond(player,npc.id)?1:0));
      msg=npc.name+"：「"+line+"」"+(favorDelta?("（好感+"+favorDelta+"）"):"");
      break;
    }
    case"heal":{
      player.silver-=cost;
      player.hp=Math.min(player.maxHp,player.hp+act.value);
      favorDelta=addFavor(player,npc.id,2);
      msg="向"+npc.name+"求医，气血+"+act.value+"（银两-"+cost+(disc<1?" 熟客价":"")+"，好感+"+favorDelta+"）";
      break;
    }
    case"rest":{
      player.silver-=cost;
      if(act.hp)player.hp=Math.min(player.maxHp,player.hp+act.hp);
      if(act.mp)player.mp=Math.min(player.maxMp,player.mp+act.mp);
      favorDelta=addFavor(player,npc.id,2);
      msg="在"+npc.name+"处休整"+(act.hp?"，气血+"+act.hp:"")+(act.mp?"，内力+"+act.mp:"")+"（银两-"+cost+"，好感+"+favorDelta+"）";
      break;
    }
    case"item":{
      player.silver-=cost;
      if(act.effect==="heal"){player.hp=Math.min(player.maxHp,player.hp+act.value);msg="购得药品，气血+"+act.value;}
      else if(act.effect==="mp"){player.mp=Math.min(player.maxMp,player.mp+act.value);msg="购得丹药，内力+"+act.value;}
      else msg="购得物品";
      favorDelta=addFavor(player,npc.id,1);
      msg+="（银两-"+cost+"，好感+"+favorDelta+"）";
      break;
    }
    case"skill":{
      const sk=getSkillById(act.skill);
      if(!sk)return{ok:false,msg:"武学不存在"};
      if(player.skills.some(function(s){return s.id===sk.id;}))return{ok:false,msg:"已学会"};
      player.silver-=cost;
      const r=learnSkill(player,Object.assign({},sk,{cost:0}));
      if(r.ok){favorDelta=addFavor(player,npc.id,5);msg="从"+npc.name+"处购得【"+sk.name+"】（银两-"+cost+"，好感+"+favorDelta+"）";}
      else{player.silver+=cost;msg=r.msg;}
      break;
    }
    case"exp":{
      player.silver-=cost;
      if(player.skills&&player.skills.length){
        const s=player.skills[Math.floor(Math.random()*player.skills.length)];
        s.exp=(s.exp||0)+(act.value||10);
        favorDelta=addFavor(player,npc.id,3);
        msg=npc.name+"指点，【"+s.name+"】经验+"+act.value+"（银两-"+cost+"，好感+"+favorDelta+"）";
        while(s.exp>=s.maxExp&&s.realm<4){
          s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);
          s.power=Math.floor((s.power||0)*1.25);msg+=" → 突破！";
        }
      }else msg="你还不会武学，无法请教。";
      break;
    }
    case"train_stat":{
      player.silver-=cost;
      player.stats[act.stat]=(player.stats[act.stat]||0)+act.value;
      player.flags[flagKey]=true;
      favorDelta=addFavor(player,npc.id,6);
      const lab=(typeof STAT_LABELS!=="undefined"&&STAT_LABELS[act.stat])?STAT_LABELS[act.stat]:act.stat;
      msg=npc.name+"传授心得，"+lab+"+"+act.value+"（银两-"+cost+"，好感+"+favorDelta+"）";
      break;
    }
    case"silver":{
      player.silver+=act.value;
      favorDelta=addFavor(player,npc.id,4);
      msg="帮"+npc.name+"办事，银两+"+act.value+"（好感+"+favorDelta+"）";
      break;
    }
    case"duel":{
      const r=resolveThreat(player,act.diff||40,act.dmg||20);
      if(r.outcome==="完胜"||r.outcome==="险胜"){
        player.silver+=(act.reward||10);
        favorDelta=addFavor(player,npc.id,r.outcome==="完胜"?5:3);
        msg="与"+npc.name+"交手【"+r.outcome+"】，银两+"+(act.reward||10)+(r.damage?"，气血-"+r.damage:"")+"（好感+"+favorDelta+"）";
      }else if(r.outcome==="受挫"){
        favorDelta=addFavor(player,npc.id,1);
        msg="与"+npc.name+"交手【受挫】，气血-"+r.damage+"（好感+"+favorDelta+"，对方略有敬意）";
      }else{
        favorDelta=addFavor(player,npc.id,-2);
        msg="与"+npc.name+"交手【惨败】，气血-"+r.damage+"（好感"+favorDelta+"）";
      }
      break;
    }
    case"gamble":{
      player.silver-=cost;
      if(Math.random()<0.45){
        const win=cost*2;player.silver+=win;
        favorDelta=addFavor(player,npc.id,2);
        msg="与"+npc.name+"对赌，赢了！银两+"+win+"（好感+"+favorDelta+"）";
      }else{
        favorDelta=addFavor(player,npc.id,-1);
        msg="与"+npc.name+"对赌，输了（银两-"+cost+"，好感"+favorDelta+"）";
      }
      break;
    }
    default:msg="无事发生";
  }
  player.logs.unshift(msg);player.logs=player.logs.slice(0,50);
  return{ok:true,msg:msg};
}
