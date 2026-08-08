/* 战斗判定重做 · 分级遇敌 · 战斗/特殊事件分流 */
(function(){

  /** 遇敌等级：名称、基准难度、基础伤害系数、完胜银两与经验 */
  var ENEMY_TIERS=[
    {id:"trivial",name:"微末",diff:18,dmg:0.35,reward:0.6,color:"#7aae6a",
      foes:["地痞","野狗","醉汉","小偷"]},
    {id:"normal",name:"寻常",diff:32,dmg:0.55,reward:1.0,color:"#d9ad62",
      foes:["劫匪","水贼","散修","山贼"]},
    {id:"elite",name:"精锐",diff:48,dmg:0.75,reward:1.4,color:"#c47a5a",
      foes:["镖师", "门派外门", "刀客", "影卫"]},
    {id:"deadly",name:"凶险",diff:65,dmg:1.0,reward:1.9,color:"#b85b53",
      foes:["邪修", "内门高手", "匪首", "机关傀"]},
    {id:"fatal",name:"绝境",diff:85,dmg:1.35,reward:2.6,color:"#9b3a3a",
      foes:["掌门级", "秘境守护", "血海修士", "古遗物灵"]}
  ];

  function tierByDiff(diff){
    diff=diff|0;
    if(diff<=24)return ENEMY_TIERS[0];
    if(diff<=40)return ENEMY_TIERS[1];
    if(diff<=56)return ENEMY_TIERS[2];
    if(diff<=72)return ENEMY_TIERS[3];
    return ENEMY_TIERS[4];
  }
  function tierById(id){
    return ENEMY_TIERS.find(function(t){return t.id===id;})||ENEMY_TIERS[1];
  }
  function pickFoe(tier){
    var list=tier.foes||["对手"];
    return list[Math.floor(Math.random()*list.length)];
  }

  /**
   * 事件分类
   * combat  — 武力对抗（走战斗判定）
   * special — 非战斗奇遇/异常（福缘、时辰、属性影响结果）
   * calm    — 日常平静（银两/疗伤/修炼/见闻）
   */
  function classifyEvent(evt){
    if(!evt)return"calm";
    if(evt.kind==="combat"||evt.kind==="special"||evt.kind==="calm")return evt.kind;
    if(evt.type==="damage")return"combat";
    if(evt.type==="silver"&&evt.value<0&&evt.diff)return"combat";
    if(evt.type==="duel")return"combat";
    if(evt.type==="special"||evt.special)return"special";
    if(evt.type==="stat"&&evt.risk)return"special";
    if(evt.type==="log"&&evt.risk)return"special";
    return"calm";
  }

  /** 战斗判定：战力 vs 分级难度，含先手/闪避/福缘微扰 */
  window.resolveThreat=function(player,diff,baseDamage,opts){
    opts=opts||{};
    var power=typeof calcCombatPower==="function"?calcCombatPower(player):30;
    var tier=tierByDiff(diff);
    var effDiff=Math.max(1,diff|0);

    /* 身法：先手降低有效难度，闪避减轻伤害 */
    var sf=typeof sumShenfa==="function"?sumShenfa(player):{dodge:0,first:0};
    if(sf.first>0)effDiff=Math.max(1,Math.floor(effDiff*(1-Math.min(0.22,sf.first*0.012))));
    if(sf.dodge>0)effDiff=Math.max(1,Math.floor(effDiff*(1-Math.min(0.12,sf.dodge*0.006))));

    /* 福缘：微扰 */
    var luck=(player.stats&&player.stats.luck)||5;
    var luckRoll=(Math.random()-0.5)*(luck*0.8);
    var score=power+luckRoll;
    var ratio=score/effDiff;

    var result={
      power:power,
      diff:diff,
      effDiff:effDiff,
      ratio:ratio,
      tier:tier,
      foe:opts.foe||pickFoe(tier),
      damage:0,
      outcome:"",
      gain:null,
      kind:"combat"
    };

    var base=baseDamage!=null?baseDamage:Math.floor(effDiff*tier.dmg*0.45);

    if(ratio>=1.35){
      result.outcome="完胜";
      result.damage=0;
      var sil=Math.floor((6+Math.random()*10)*tier.reward);
      player.silver=(player.silver|0)+sil;
      result.gain={type:"silver",value:sil};
      if(player.skills&&player.skills.length){
        var s=player.skills[Math.floor(Math.random()*player.skills.length)];
        var ex=Math.floor((6+tier.reward*4));
        s.exp=(s.exp||0)+ex;
        result.gain.exp=ex;
        result.gain.skill=s.name;
        while(s.exp>=s.maxExp&&s.realm<4){
          s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);
          s.power=Math.floor((s.power||0)*1.25);
          result.gain.breakthrough=true;
        }
      }
    }else if(ratio>=1.05){
      result.outcome="险胜";
      result.damage=Math.max(1,Math.floor(base*0.35*(1-Math.min(0.4,sf.dodge*0.02))));
      var sil2=Math.floor((3+Math.random()*6)*tier.reward*0.7);
      player.silver=(player.silver|0)+sil2;
      result.gain={type:"silver",value:sil2};
      if(player.skills&&player.skills.length&&Math.random()<0.6){
        var s2=player.skills[Math.floor(Math.random()*player.skills.length)];
        var ex2=Math.floor(4+tier.reward*2);
        s2.exp=(s2.exp||0)+ex2;
        result.gain.exp=ex2;result.gain.skill=s2.name;
      }
    }else if(ratio>=0.75){
      result.outcome="受挫";
      result.damage=Math.max(2,Math.floor(base*(1-Math.min(0.3,sf.dodge*0.015))));
    }else if(ratio>=0.45){
      result.outcome="惨败";
      result.damage=Math.max(4,Math.floor(base*1.4*(1-Math.min(0.25,sf.dodge*0.01))));
    }else{
      result.outcome="溃逃";
      result.damage=Math.max(6,Math.floor(base*1.8));
      /* 溃逃额外丢银 */
      var loss=Math.min(player.silver|0,Math.floor(8+tier.reward*6+Math.random()*10));
      if(loss>0){player.silver-=loss;result.gain={type:"silver",value:-loss};}
    }

    player.hp=Math.max(1,(player.hp|0)-result.damage);
    return result;
  };

  window.ENEMY_TIERS=ENEMY_TIERS;
  window.tierByDiff=tierByDiff;
  window.classifyEvent=classifyEvent;

  /** 特殊事件：不走战力碾压，走福缘/属性/随机分支 */
  function resolveSpecial(player,evt){
    var luck=(player.stats&&player.stats.luck)||5;
    var wit=(player.stats&&player.stats.wit)||5;
    var roll=Math.random()*100+luck*1.5+wit*0.5;
    var result={kind:"special",outcome:"",msg:"",gain:null};

    if(evt.type==="stat"){
      /* 带 risk 的属性事件：可能成功也可能反噬 */
      if(roll>=55){
        player.stats[evt.key]=(player.stats[evt.key]||0)+(evt.value||1);
        var lab=(STAT_LABELS&&STAT_LABELS[evt.key])||evt.key;
        result.outcome="奇遇";
        result.msg="机缘落在你身上（"+lab+"+"+(evt.value||1)+"）";
      }else if(roll>=35){
        result.outcome="无事";
        result.msg="机缘擦肩而过，只留下一声叹息。";
      }else{
        var dmg=evt.failDmg||Math.floor(8+Math.random()*12);
        player.hp=Math.max(1,player.hp-dmg);
        result.outcome="波折";
        result.msg="强求不得，反受其扰（气血-"+dmg+"）";
      }
      return result;
    }

    if(evt.type==="silver"&&!evt.diff){
      if(roll>=50){
        var gain=Math.abs(evt.value||10);
        player.silver+=gain;
        result.outcome="得利";
        result.msg="意外收获（银两+"+gain+"）";
      }else{
        result.outcome="落空";
        result.msg="空欢喜一场。";
      }
      return result;
    }

    /* 默认特殊：见闻 + 小概率福缘/疗伤 */
    if(roll>=70){
      player.mp=Math.min(player.maxMp,player.mp+10+Math.floor(luck));
      result.outcome="感悟";
      result.msg="心神澄明，内力+