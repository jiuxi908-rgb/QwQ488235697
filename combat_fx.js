/* 战斗过程展示 · 完胜/溃逃反馈 · 低血警告 */
(function(){
  var SKILL_NAMES=["破风拳","青锋一刺","横刀斩","点穴手","踏雪步","掌风","肘击","扫腿","剑花","刀芒"];

  function pickSkill(player){
    if(player.skills&&player.skills.length){
      var s=player.skills[Math.floor(Math.random()*player.skills.length)];
      return s.name||"无名招式";
    }
    return SKILL_NAMES[Math.floor(Math.random()*SKILL_NAMES.length)];
  }

  window.buildBattleLog=function(result,player){
    var foe=result.foe||"对手";
    var my=pickSkill(player);
    var lines=[];
    if(result.ratio>=1||Math.random()>0.45)lines.push("你抢先一步，使出【"+my+"】。");
    else lines.push(foe+"先行攻来，你侧身换步。");

    if(result.outcome==="完胜"){
      lines.push("招式连环，"+foe+"难以招架。");
      lines.push("最后一击干净利落，对方兵器脱手。");
      lines.push("【完胜】你几乎未损。");
    }else if(result.outcome==="险胜"){
      lines.push(foe+"一记狠招擦身而过。");
      lines.push("你咬牙以【"+my+"】硬拼，险险占了上风。");
      lines.push("【险胜】气血小损。");
    }else if(result.outcome==="受挫"){
      lines.push("双方僵持数合，你渐落下风。");
      lines.push(foe+"抓住破绽，你挨了一记。");
      lines.push("【受挫】只得抽身。");
    }else if(result.outcome==="惨败"){
      lines.push("你连出三招，皆被化解。");
      lines.push(foe+"反手重创于你。");
      lines.push("【惨败】几乎无力再战。");
    }else{
      lines.push("杀意如潮，你完全不是对手。");
      lines.push("刀风贴着后心，你连滚带爬离开。");
      lines.push("【溃逃】今日之耻，来日再雪。");
    }
    return lines;
  };

  function outcomeClass(outcome){
    if(outcome==="完胜")return"outcome-perfect";
    if(outcome==="险胜")return"outcome-win";
    if(outcome==="受挫")return"outcome-mid";
    if(outcome==="惨败"||outcome==="溃逃")return"outcome-lose";
    return"";
  }

  window.showBattleModal=function(result,player,contextMsg){
    var lines=buildBattleLog(result,player);
    var oc=outcomeClass(result.outcome);
    var gain="";
    if(result.gain){
      if(result.gain.value>0)gain+="银两+"+result.gain.value+" ";
      if(result.gain.value<0)gain+="银两"+result.gain.value+" ";
      if(result.gain.exp)gain+="【"+result.gain.skill+"】经验+"+result.gain.exp+" ";
      if(result.gain.breakthrough)gain+="武学突破！";
    }
    if(result.damage)gain+="气血-"+result.damage;
    var tier=result.tier?result.tier.name:"";
    var rounds=lines.map(function(l,i){
      return '<div class="battle-round"><span class="br-n">第'+(i+1)+'合</span> '+l+"</div>";
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">遭遇 · '+(result.foe||"对手")+
      '</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      (contextMsg?'<p class="small">'+contextMsg+"</p>":"")+
      '<div class="battle-log">'+rounds+"</div>"+
      '<div class="battle-result '+oc+'">【'+tier+(tier?"·":"")+(result.foe||"")+
      " · 战力"+result.power+" vs 难"+result.diff+" · "+result.outcome+"】"+
      (gain?('<div class="small">'+gain+"</div>"):"")+"</div>"+
      '<button class="btn primary" id="battleOk" style="margin-top:8px;width:100%">继 续</button>'
    );
    var done=function(){closeModal();if(typeof renderGame==="function")renderGame();};
    qs("#mClose").onclick=done;
    qs("#battleOk").onclick=done;
  };

  if(typeof resolveThreat==="function"){
    var _rt=resolveThreat;
    window.resolveThreat=function(player,diff,baseDamage,opts){
      var r=_rt(player,diff,baseDamage,opts);
      if(r){
        r.rounds=buildBattleLog(r,player);
        window.__lastCombatResult=r;
      }
      return r;
    };
  }

  setTimeout(function(){
    if(typeof exploreLocation!=="function")return;
    var _ex=exploreLocation;
    exploreLocation=function(player){
      var r=_ex(player);
      if(r&&r.ok&&r.kind==="combat"){
        var cr=window.__lastCombatResult;
        if(cr)setTimeout(function(){showBattleModal(cr,player,"");},50);
      }
      if(r&&r.ok&&typeof window._tutorialHookExplore==="function")
        window._tutorialHookExplore(player,r);
      return r;
    };
  },30);

  function applyHpWarn(p){
    if(!p)return;
    var ratio=(p.hp|0)/Math.max(1,p.maxHp|0);
    document.body.classList.toggle("hp-danger",ratio>0&&ratio<=0.3);
    document.body.classList.toggle("hp-critical",ratio>0&&ratio<=0.15);
    var hud=document.querySelector(".hud");
    if(!hud)return;
    var span=hud.querySelector(".hp-warn");
    if(ratio<=0.3){
      if(!span){
        span=document.createElement("span");
        span.className="hp-warn";
        hud.appendChild(span);
      }
      span.textContent=ratio<=0.15?"⚠ 气血危急，速速疗伤！":"⚠ 气血低落，注意休整";
    }else if(span)span.remove();
  }

  if(typeof Game!=="undefined"&&Game.on){
    Game.on("render:after",function(p){applyHpWarn(p);});
  }

  if(typeof formatLog==="function"){
    var _fl=formatLog;
    window.formatLog=function(text){
      var html=_fl(text);
      if(/完胜/.test(text))html=html.replace(/class="log-gain"/,'class="log-gain log-perfect"');
      if(/溃逃/.test(text))html=html.replace(/class="log-loss"/,'class="log-loss log-flee"');
      return html;
    };
  }
})();
