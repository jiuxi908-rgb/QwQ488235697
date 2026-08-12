/**
 * 人物境界（与功法境界并行）
 * 功法境界 = 单一技能强度；人物境界 = 整体档次
 * 挂钩：面板标签 / 学地阶·天阶门槛 / 一流起遇敌略占优
 * 不砍功法突破上限（避免卡死）
 */
(function(){
  var RANKS=[
    {id:0,name:"未入流",min:0,color:"#8a7a6a"},
    {id:1,name:"三流",min:45,color:"#9a8a6a"},
    {id:2,name:"二流",min:90,color:"#b9a58a"},
    {id:3,name:"一流",min:140,color:"#d9ad62"},
    {id:4,name:"超一流",min:210,color:"#e8c878"},
    {id:5,name:"宗师",min:290,color:"#f5e8cf"}
  ];

  /* 学武门槛：品质 → 最低人物境界 id */
  var QUALITY_NEED={
    "黄阶":0,
    "玄阶":1,
    "地阶":2,
    "天阶":3
  };

  function auxScore(player){
    var skills=player.skills||[];
    var maxR=0,hasNg=false,hasQg=false;
    for(var i=0;i<skills.length;i++){
      var s=skills[i];
      if((s.realm|0)>maxR)maxR=s.realm|0;
      if(s.type==="内功")hasNg=true;
      if(s.type==="轻功")hasQg=true;
    }
    var f=player.flags||{};
    var n=maxR*6;
    if(hasNg)n+=8;
    if(hasQg)n+=8;
    if(f.mq_secret)n+=10;
    if(f.mainDone)n+=12;
    if(player.sect)n+=5;
    return n;
  }

  function scoreOf(player){
    var power=typeof calcCombatPower==="function"?calcCombatPower(player):0;
    return power+auxScore(player);
  }

  function rankByScore(score){
    var r=RANKS[0];
    for(var i=0;i<RANKS.length;i++){
      if(score>=RANKS[i].min)r=RANKS[i];
    }
    return r;
  }

  window.getPlayerRank=function(player){
    if(!player)return RANKS[0];
    return rankByScore(scoreOf(player));
  };

  window.getPlayerRankName=function(player){
    return getPlayerRank(player).name;
  };

  /** 同步并写晋升日志；返回是否晋升 */
  window.syncPlayerRank=function(player){
    if(!player)return false;
    if(!player.flags)player.flags={};
    var rank=getPlayerRank(player);
    var prev=player.rankId|0;
    player.rankId=rank.id;
    player.rankName=rank.name;
    if(rank.id>prev){
      player.logs.unshift("【境界】你已跻身「"+rank.name+"」之列。");
      player.logs=player.logs.slice(0,50);
      return true;
    }
    return false;
  };

  function canLearnByRank(player,skill){
    if(!skill)return{ok:true};
    var need=QUALITY_NEED[skill.quality];
    if(need==null)return{ok:true};
    var rank=getPlayerRank(player);
    if(rank.id>=need)return{ok:true};
    var needName=RANKS[need]?RANKS[need].name:("境界"+need);
    return{
      ok:false,
      msg:"人物境界不足：学【"+(skill.quality||"?")+"】需达到「"+needName+"」（当前「"+rank.name+"」）"
    };
  }

  window.canLearnByRank=canLearnByRank;
  window.PLAYER_RANKS=RANKS;

  /* 挂钩 canLearn */
  function wrapCanLearn(){
    if(typeof canLearn!=="function")return;
    if(canLearn._rankWrapped)return;
    var _can=canLearn;
    window.canLearn=function(player,skill){
      var r=_can(player,skill);
      if(!r.ok)return r;
      return canLearnByRank(player,skill);
    };
    window.canLearn._rankWrapped=true;
  }

  /* 学成 / 修炼 / 战力变化后同步境界 */
  function wrapProgress(){
    function after(fn){
      return function(player){
        var r=fn.apply(this,arguments);
        if(player)syncPlayerRank(player);
        return r;
      };
    }
    if(typeof learnSkill==="function"&&!learnSkill._rankHook){
      var _ls=learnSkill;
      window.learnSkill=function(player,skill){
        var gate=canLearnByRank(player,skill);
        if(!gate.ok)return gate;
        var r=_ls(player,skill);
        if(r&&r.ok)syncPlayerRank(player);
        return r;
      };
      window.learnSkill._rankHook=true;
    }
    if(typeof trainSkill==="function"&&!trainSkill._rankHook){
      var _ts=trainSkill;
      window.trainSkill=function(player,skillId,amount){
        var r=_ts(player,skillId,amount);
        if(r&&r.ok)syncPlayerRank(player);
        return r;
      };
      window.trainSkill._rankHook=true;
    }
  }

  /* 一流起：有效难度略降（不改战力公式，只动判定） */
  function wrapCombat(){
    if(typeof resolveThreat!=="function"||resolveThreat._rankHook)return;
    var _rt=resolveThreat;
    window.resolveThreat=function(player,diff,baseDamage,opts){
      var rank=getPlayerRank(player);
      var d=diff|0;
      if(rank.id>=5)d=Math.max(1,Math.floor(d*0.88));
      else if(rank.id>=4)d=Math.max(1,Math.floor(d*0.92));
      else if(rank.id>=3)d=Math.max(1,Math.floor(d*0.96));
      return _rt(player,d,baseDamage,opts);
    };
    window.resolveThreat._rankHook=true;
  }

  function injectHud(player){
    if(!player)return;
    syncPlayerRank(player);
    var rank=getPlayerRank(player);
    var hud=document.querySelector(".hud");
    if(!hud)return;
    var old=document.getElementById("rankTagHud");
    if(old)old.remove();
    var el=document.createElement("span");
    el.id="rankTagHud";
    el.className="rank-tag";
    el.style.borderColor=rank.color;
    el.style.color=rank.color;
    el.title="人物境界（战力+功法/经历综合）";
    el.textContent=rank.name;
    /* 插到战力附近：优先跟在第一个 span 后 */
    var first=hud.querySelector("span");
    if(first&&first.parentNode===hud)hud.insertBefore(el,first.nextSibling);
    else hud.appendChild(el);
  }

  function injectCharPanel(player){
    if(!player)return;
    var rank=getPlayerRank(player);
    var score=scoreOf(player);
    var next=RANKS[rank.id+1];
    var tip=next?("距「"+next.name+"」约需综合"+Math.max(0,next.min-score)):"已至当前上限";
    var host=document.querySelector(".modal-panel .stat-grid, .panel .stat-grid");
    /* 角色弹窗：在战力行旁补一行 */
    var modal=document.querySelector(".modal-panel");
    if(!modal)return;
    if(modal.querySelector("#rankRow"))return;
    var row=document.createElement("div");
    row.id="rankRow";
    row.className="stat";
    row.innerHTML='<b>境界</b><span class="rank-tag" style="border-color:'+rank.color+';color:'+rank.color+'">'+rank.name+'</span>';
    var powerStat=null;
    modal.querySelectorAll(".stat").forEach(function(s){
      if(s.textContent&&s.textContent.indexOf("战力")>=0)powerStat=s;
    });
    if(powerStat&&powerStat.parentNode)powerStat.parentNode.insertBefore(row,powerStat.nextSibling);
    else{
      var grid=modal.querySelector(".stat-grid");
      if(grid)grid.appendChild(row);
    }
    var hint=document.createElement("p");
    hint.className="small";
    hint.id="rankHint";
    hint.textContent="人物境界 · "+tip+"。学地阶需二流、天阶需一流；不限制功法突破。";
    if(powerStat&&powerStat.parentNode)powerStat.parentNode.appendChild(hint);
  }

  setTimeout(function(){
    wrapCanLearn();
    wrapProgress();
    wrapCombat();
    if(typeof Game!=="undefined"&&Game.on){
      Game.on("player:ensure",function(p){if(p)syncPlayerRank(p);});
      Game.on("render:after",function(p){if(p)injectHud(p);});
    }else if(typeof renderGame==="function"){
      var _rg=renderGame;
      renderGame=function(){
        _rg();
        if(state&&state.player)injectHud(state.player);
      };
    }
    /* 角色面板打开后再补境界行 */
    var _om=typeof openModal==="function"?openModal:null;
    if(_om&&!_om._rankHook){
      window.openModal=function(html){
        _om(html);
        setTimeout(function(){
          if(state&&state.player)injectCharPanel(state.player);
        },0);
      };
      window.openModal._rankHook=true;
    }
  },40);
})();
