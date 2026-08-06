function interactPerson(player,npc,actId){
  if(!player.flags)player.flags={};
  const act=(npc.acts||[]).find(function(a){return a.id===actId;});
  if(!act)return{ok:false,msg:"无此选项"};
  const flagKey=npc.id+"_"+act.id;
  if(act.once&&player.flags[flagKey])return{ok:false,msg:"已经做过了"};
  const cost=act.cost||0;
  if(cost>0&&player.silver<cost)return{ok:false,msg:"银两不足（需"+cost+"）"};
  let msg="";
  switch(act.type){
    case"talk":{const t=npc.talks[Math.floor(Math.random()*npc.talks.length)];msg=npc.name+"："+t;break;}
    case"heal":{player.silver-=cost;player.hp=Math.min(player.maxHp,player.hp+act.value);msg="向"+npc.name+"求医，气血+"+act.value+"（银两-"+cost+"）";break;}
    case"rest":{player.silver-=cost;if(act.hp)player.hp=Math.min(player.maxHp,player.hp+act.hp);if(act.mp)player.mp=Math.min(player.maxMp,player.mp+act.mp);msg="在"+npc.name+"处休整"+(act.hp?"，气血+"+act.hp:"")+(act.mp?"，内力+"+act.mp:"")+(cost?"（银两-"+cost+"）":"");break;}
    case"item":{player.silver-=cost;if(act.effect==="heal"){player.hp=Math.min(player.maxHp,player.hp+act.value);msg="购得药品，气血+"+act.value;}else if(act.effect==="mp"){player.mp=Math.min(player.maxMp,player.mp+act.value);msg="购得丹药，内力+"+act.value;}else msg="购得物品";msg+="（银两-"+cost+"）";break;}
    case"skill":{const sk=getSkillById(act.skill);if(!sk)return{ok:false,msg:"武学不存在"};if(player.skills.some(function(s){return s.id===sk.id;}))return{ok:false,msg:"已学会"};player.silver-=cost;const r=learnSkill(player,Object.assign({},sk,{cost:0}));msg=r.ok?("从"+npc.name+"处购得【"+sk.name+"】（银两-"+cost+"）"):r.msg;if(!r.ok)player.silver+=cost;break;}
    case"exp":{player.silver-=cost;if(player.skills&&player.skills.length){const s=player.skills[Math.floor(Math.random()*player.skills.length)];s.exp=(s.exp||0)+(act.value||10);msg=npc.name+"指点，【"+s.name+"】经验+"+act.value+(cost?"（银两-"+cost+"）":"");while(s.exp>=s.maxExp&&s.realm<4){s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);s.power=Math.floor((s.power||0)*1.25);msg+=" → 突破！";}}else msg="你还不会武学，无法请教。";break;}
    case"train_stat":{player.silver-=cost;player.stats[act.stat]=(player.stats[act.stat]||0)+act.value;player.flags[flagKey]=true;msg=npc.name+"传授心得，"+act.stat+"+"+act.value+"（银两-"+cost+"）";break;}
    case"silver":{player.silver+=act.value;msg="帮"+npc.name+"办事，银两+"+act.value;break;}
    case"duel":{const r=resolveThreat(player,act.diff||40,act.dmg||20);if(r.outcome==="完胜"||r.outcome==="险胜"){player.silver+=(act.reward||10);msg="与"+npc.name+"交手【"+r.outcome+"】，银两+"+(act.reward||10)+(r.damage?"，气血-"+r.damage:"");}else msg="与"+npc.name+"交手【"+r.outcome+"】，气血-"+r.damage;break;}
    case"gamble":{player.silver-=cost;if(Math.random()<0.45){const win=cost*2;player.silver+=win;msg="与"+npc.name+"对赌，赢了！银两+"+win;}else msg="与"+npc.name+"对赌，输了（银两-"+cost+"）";break;}
    default:msg="无事发生";
  }
  player.logs.unshift(msg);player.logs=player.logs.slice(0,40);
  return{ok:true,msg:msg};
}
