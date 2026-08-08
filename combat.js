/* 战斗判定重做 · 分级遇敌 · 战斗/特殊事件分流 */
(function(){

  var ENEMY_TIERS=[
    {id:"trivial",name:"微末",diff:18,dmg:0.35,reward:0.6,color:"#7aae6a",
      foes:["地痞","野狗","醉汉","小偷"]},
    {id:"normal",name:"寻常",diff:32,dmg:0.55,reward:1.0,color:"#d9ad62",
      foes:["劫匪","水贼","散修","山贼"]},
    {id:"elite",name:"精锐",diff:48,dmg:0.75,reward:1.4,color:"#c47a5a",
      foes:["镖师","门派外门","刀客","影卫"]},
    {id:"deadly",name:"凶险",diff:65,dmg:1.0,reward:1.9,color:"#b85b53",
      foes:["邪修","内门高手","匪首","机关傀"]},
    {id:"fatal",name:"绝境",diff:85,dmg:1.35,reward:2.6,color:"#9b3a3a",
      foes:["掌门级","秘境守护","血海修士","古遗物灵"]}
  ];

  function tierByDiff(diff){
    diff=diff|0;
    if(diff<=24)return ENEMY_TIERS[0];
    if(diff<=40)return ENEMY_TIERS[1];
    if(diff<=56)return ENEMY_TIERS[2];
    if(diff<=72)return ENEMY_TIERS[3];
    return ENEMY_TIERS[4];
  }
  function pickFoe(tier){
    var list=tier.foes||["对手"];
    return list[Math.floor(Math.random()*list.length)];
  }

  /** combat | special | calm */
  function classifyEvent(evt){
    if(!evt)return"calm";
    if(evt.kind==="combat"||evt.kind==="special"||evt.kind==="calm")return evt.kind;
    if(evt.type==="damage")return"combat";
    if(evt.type==="silver"&&evt.value<0&&evt.diff)return"combat";
    if(evt.type==="duel")return"combat";
    if(evt.type==="special"||evt.special)return"special";
    if(evt.type==="stat"&&evt.risk)return"special";
    return"calm";
  }

  window.resolveThreat=function(player,diff,baseDamage,opts){
    opts=opts||{};
    var power=typeof calcCombatPower==="function"?calcCombatPower(player):30;
    var tier=tierByDiff(diff);
    var effDiff=Math.max(1,diff|0);
    var sf=typeof sumShenfa==="function"?sumShenfa(player):{dodge:0,first:0};
    if(sf.first>0)effDiff=Math.max(1,Math.floor(effDiff*(1-Math.min(0.22,sf.first*0.012))));
    if(sf.dodge>0)effDiff=Math.max(1,Math.floor(effDiff*(1-Math.min(0.12,sf.dodge*0.006))));
    var luck=(player.stats&&player.stats.luck)||5;
    var luckRoll=(Math.random()-0.5)*(luck*0.8);
    var score=power+luckRoll;
    var ratio=score/effDiff;
    var result={
      power:power,diff:diff,effDiff:effDiff,ratio:ratio,tier:tier,
      foe:opts.foe||pickFoe(tier),damage:0,outcome:"",gain:null,kind:"combat"
    };
    var base=baseDamage!=null?baseDamage:Math.floor(effDiff*tier.dmg*0.45);

    if(ratio>=1.35){
      result.outcome="完胜";result.damage=0;
      var sil=Math.floor((6+Math.random()*10)*tier.reward);
      player.silver=(player.silver|0)+sil;
      result.gain={type:"silver",value:sil};
      if(player.skills&&player.skills.length){
        var s=player.skills[Math.floor(Math.random()*player.skills.length)];
        var ex=Math.floor(6+tier.reward*4);
        s.exp=(s.exp||0)+ex;
        result.gain.exp=ex;result.gain.skill=s.name;
        while(s.exp>=s.maxExp&&s.realm<4){
          s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);
          s.power=Math.floor((s.power||0)*1.25);result.gain.breakthrough=true;
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
      var loss=Math.min(player.silver|0,Math.floor(8+tier.reward*6+Math.random()*10));
      if(loss>0){player.silver-=loss;result.gain={type:"silver",value:-loss};}
    }
    player.hp=Math.max(1,(player.hp|0)-result.damage);
    return result;
  };

  window.ENEMY_TIERS=ENEMY_TIERS;
  window.tierByDiff=tierByDiff;
  window.classifyEvent=classifyEvent;

  function resolveSpecial(player,evt){
    var luck=(player.stats&&player.stats.luck)||5;
    var wit=(player.stats&&player.stats.wit)||5;
    var roll=Math.random()*100+luck*1.5+wit*0.5;
    var result={kind:"special",outcome:"",msg:""};

    if(evt.type==="stat"){
      if(roll>=55){
        player.stats[evt.key]=(player.stats[evt.key]||0)+(evt.value||1);
        var lab=(typeof STAT_LABELS!=="undefined"&&STAT_LABELS[evt.key])?STAT_LABELS[evt.key]:evt.key;
        result.outcome="奇遇";
        result.msg="机缘落在你身上（"+lab+"+"+(evt.value||1)+"）";
      }else if(roll>=35){
        result.outcome="无事";
        result.msg="机缘擦肩而过。";
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
        result.outcome="得利";result.msg="意外收获（银两+"+gain+"）";
      }else{
        result.outcome="落空";result.msg="空欢喜一场。";
      }
      return result;
    }
    if(roll>=70){
      var mpG=10+Math.floor(luck/2);
      player.mp=Math.min(player.maxMp,(player.mp|0)+mpG);
      result.outcome="感悟";result.msg="心神澄明（内力+"+mpG+"）";
    }else if(roll>=40){
      result.outcome="见闻";result.msg="记下了一段江湖传闻。";
    }else{
      result.outcome="平淡";result.msg="无事发生。";
    }
    return result;
  }

  function formatCombatResult(r){
    var tierName=r.tier?r.tier.name:"";
    var head="【"+tierName+"·"+r.foe+" · 战力"+r.power+" vs 难"+r.diff+" · "+r.outcome+"】";
    var tail="";
    if(r.damage)tail+="（气血-"+r.damage+"）";
    if(r.gain){
      if(r.gain.value>0)tail+="（银两+"+r.gain.value+(r.gain.exp?"，【"+r.gain.skill+"】经验+"+r.gain.exp:"")+"）";
      else if(r.gain.value<0)tail+="（银两"+r.gain.value+"）";
      if(r.gain.breakthrough)tail+=" → 武学突破！";
    }
    return head+tail;
  }

  function applyCalm(player,evt){
    var msg="";
    switch(evt.type){
      case"silver":
        player.silver=Math.max(0,player.silver+evt.value);
        msg=evt.value>0?("（银两+"+evt.value+"）"):("（银两"+evt.value+"）");
        break;
      case"heal":
        player.hp=Math.min(player.maxHp,player.hp+evt.value);
        msg="（气血+"+evt.value+"）";
        break;
      case"mp":
        player.mp=Math.min(player.maxMp,player.mp+evt.value);
        msg="（内力+"+evt.value+"）";
        break;
      case"exp":
        if(player.skills&&player.skills.length){
          var s=player.skills[Math.floor(Math.random()*player.skills.length)];
          var gain=evt.value|0;
          if(typeof shiTrainMod==="function")gain=Math.floor(gain*shiTrainMod(player));
          s.exp=(s.exp||0)+gain;
          msg="（【"+s.name+"】经验+"+gain+"）";
          while(s.exp>=s.maxExp&&s.realm<4){
            s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);
            s.power=Math.floor((s.power||0)*1.25);msg+=" → 武学突破！";
          }
        }else msg="（尚无武学可练）";
        break;
      case"stat":
        if(player.stats[evt.key]!==undefined){
          player.stats[evt.key]+=evt.value;
          var lab=(typeof STAT_LABELS!=="undefined"&&STAT_LABELS[evt.key])?STAT_LABELS[evt.key]:evt.key;
          msg="（"+lab+"+"+evt.value+"）";
        }
        break;
      default:break;
    }
    return msg;
  }

  /* 标记原有探索池中的战斗/特殊 */
  function annotateExplorePools(){
    if(typeof EXPLORE_POOL==="undefined")return;
    Object.keys(EXPLORE_POOL).forEach(function(mapId){
      (EXPLORE_POOL[mapId]||[]).forEach(function(e){
        if(e.kind)return;
        if(e.type==="damage"||(e.type==="silver"&&e.value<0&&e.diff)){
          e.kind="combat";
          if(!e.tier){
            var t=tierByDiff(e.diff||30);
            e.tier=t.id;
          }
        }else if(e.type==="stat"&&e.value>0){
          /* 属性提升视为特殊机缘，带轻微风险标记可选 */
          e.kind="special";
          e.risk=true;
        }else{
          e.kind="calm";
        }
      });
    });
    /* 补充各地战斗与特殊事件 */
    var extra={
      qinghe:[
        {kind:"combat",tier:"trivial",type:"damage",value:10,diff:20,text:"巷口地痞寻衅，不由分说便动手。"},
        {kind:"special",type:"stat",key:"luck",value:1,risk:true,failDmg:8,text:"庙前求签，签文模糊，你心里一动。"}
      ],
      bamboo:[
        {kind:"combat",tier:"normal",type:"damage",value:22,diff:36,text:"竹林中窜出劫道的散人，刀光霍霍。"},
        {kind:"special",type:"log",text:"雨后竹笋旁现出半块残碑，字迹被青苔吞去大半。"}
      ],
      salt_road:[
        {kind:"combat",tier:"deadly",type:"damage",value:34,diff:58,text:"盐道匪首带人拦路，明火执仗。"},
        {kind:"combat",tier:"elite",type:"damage",value:26,diff:48,text:"一队刀客护送商货，误认你为匪探，刀已出鞘。"}
      ],
      blood_ravine:[
        {kind:"combat",tier:"deadly",type:"damage",value:40,diff:70,text:"邪修拦住去路，血腥气扑面。"},
        {kind:"combat",tier:"fatal",type:"damage",value:48,diff:88,text:"峡谷深处有人祭刀，杀意凝成实质。"},
        {kind:"special",type:"stat",key:"arm",value:1,risk:true,failDmg:20,text:"你强行观摩血刃轨迹，刀意反噬心神。"}
      ],
      cloud_peak:[
        {kind:"combat",tier:"fatal",type:"damage",value:36,diff:80,text:"云中隐约有人试剑，剑意逼得你几乎站不稳。"},
        {kind:"special",type:"stat",key:"wit",value:1,risk:true,failDmg:15,text:"残碑忽然发热，天机一线，稍纵即逝。"}
      ],
      secret_reef:[
        {kind:"combat",tier:"fatal",type:"damage",value:38,diff:86,text:"潮门开启时，水下有影扑来。"},
        {kind:"special",type:"mp",value:25,text:"古法潮息灌体，你勉强接下半缕。"}
      ],
      secret_cave:[
        {kind:"combat",tier:"deadly",type:"damage",value:30,diff:62,text:"机关人骤然活化，金属关节咔咔作响。"},
        {kind:"special",type:"stat",key:"agi",value:1,risk:true,failDmg:18,text:"你在影中试步，机关齿合声贴着耳廓擦过。"}
      ],
      mist_gate:[
        {kind:"combat",tier:"elite",type:"damage",value:20,diff:45,text:"外门弟子以剑试你，雾中只见剑光。"}
      ],
      ferry:[
        {kind:"combat",tier:"normal",type:"damage",value:18,diff:40,text:"水贼小船贴岸，钩索甩来。"}
      ],
      market:[
        {kind:"combat",tier:"trivial",type:"silver",value:-12,diff:28,text:"扒手团伙围上来，有人已经摸到钱袋。"},
        {kind:"special",type:"log",text:"黑市角落有人低声叫卖“真天阶残页”，转眼人已不见。"}
      ]
    };
    Object.keys(extra).forEach(function(id){
      if(!EXPLORE_POOL[id])EXPLORE_POOL[id]=[];
      extra[id].forEach(function(e){
        EXPLORE_POOL[id].push(e);
      });
    });
  }
  annotateExplorePools();

  /* 重写游历：分类处理 */
  window.exploreLocation=function(player){
    var here=getMapById(player.location);
    if(!here)return{ok:false,message:"此地不存在。"};
    var pool=(typeof getExploreEvents==="function"?getExploreEvents(here.id,here.explore):here.explore)||[];
    if(!pool.length)return{ok:false,message:"此地暂无游历。"};

    var evt;
    if(typeof pickExploreEvent==="function")evt=pickExploreEvent(pool,player);
    else evt=pool[Math.floor(Math.random()*pool.length)];

    var t={msgs:[]};
    if(typeof advanceTime==="function"&&typeof TIME_COST!=="undefined"){
      t=advanceTime(player,TIME_COST.explore||2);
    }else{
      player.day=(player.day|0)+1;
    }

    var clock=(typeof formatClockShort==="function"?formatClockShort(player)+"，":"第"+player.day+"日，");
    var kind=classifyEvent(evt);
    var msg=clock+"【"+here.name+"】"+evt.text;

    if(kind==="combat"){
      var threatMul=typeof shiThreatMod==="function"?shiThreatMod(player):1;
      var rawDiff=evt.diff||(evt.tier?tierById(evt.tier).diff:32);
      var diff=Math.floor(rawDiff*threatMul);
      var baseDmg=evt.type==="damage"?evt.value:Math.abs(evt.value||Math.floor(diff*0.4));
      var foe=evt.foe||null;
      if(!foe&&evt.tier)foe=pickFoe(tierById(evt.tier));
      var r=resolveThreat(player,diff,baseDmg,{foe:foe});
      var flavor=(typeof flavorThreat==="function"?flavorThreat(r.outcome==="溃逃"?"惨败":r.outcome):"")||"";
      if(flavor)msg+=" "+flavor;
      msg+=" "+formatCombatResult(r);
      if(evt.type==="silver"&&evt.value<0&&(r.outcome==="受挫"||r.outcome==="惨败"||r.outcome==="溃逃")){
        var loss=Math.floor(Math.abs(evt.value)*(r.outcome==="溃逃"?1.5:1));
        player.silver=Math.max(0,player.silver-loss);
        msg+="（再失银两-"+loss+"）";
      }
    }else if(kind==="special"){
      if(evt.type==="mp"){
        player.mp=Math.min(player.maxMp,player.mp+(evt.value||15));
        msg+=" 【特殊】（内力+"+(evt.value||15)+"）";
      }else if(evt.type==="heal"){
        player.hp=Math.min(player.maxHp,player.hp+(evt.value||20));
        msg+=" 【特殊】（气血+"+(evt.value||20)+"）";
      }else if(evt.type==="log"){
        msg+=" 【特殊·见闻】";
      }else{
        var sp=resolveSpecial(player,evt);
        msg+=" 【特殊·"+sp.outcome+"】"+sp.msg;
      }
    }else{
      msg+=applyCalm(player,evt);
    }

    if(t.msgs)t.msgs.forEach(function(m){player.logs.unshift(m);});
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,message:msg,kind:kind};
  };

  function tierById(id){
    return ENEMY_TIERS.find(function(t){return t.id===id;})||ENEMY_TIERS[1];
  }
  window.tierById=tierById;
  window.formatCombatResult=formatCombatResult;

  /* 更新威胁文案：增加溃逃 */
  if(typeof THREAT_LINES!=="undefined"){
    THREAT_LINES["溃逃"]=["你完全不是对手，只能不要脸地逃。","刀风贴着后心，你连滚带爬离开战场。","今日之耻，来日再雪——前提是你还活着。"];
  }

})();
