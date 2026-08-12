/**
 * 人物境界（与功法境界并行）
 * 功法境界 = 单一技能强度；人物境界 = 整体档次
 * 挂钩：面板标签 / 学地阶·天阶门槛 / 高境界遇敌轻修正
 * 不砍功法突破上限。
 */
(function(){
  "use strict";
  var RANKS=[
    {id:0,name:"未入流",min:0,color:"#8a7a6a"},
    {id:1,name:"三流",min:45,color:"#9a8a6a"},
    {id:2,name:"二流",min:90,color:"#b9a58a"},
    {id:3,name:"一流",min:145,color:"#d9ad62"},
    {id:4,name:"超一流",min:225,color:"#e8c878"},
    {id:5,name:"宗师",min:330,color:"#f5e8cf"}
  ];
  var QUALITY_NEED={"黄阶":0,"玄阶":1,"地阶":2,"天阶":3};

  function auxScore(player){
    var skills=player.skills||[],maxR=0,hasNg=false,hasQg=false;
    for(var i=0;i<skills.length;i++){
      var s=skills[i];
      if((s.realm|0)>maxR)maxR=s.realm|0;
      if(s.type==="内功")hasNg=true;
      if(s.type==="轻功")hasQg=true;
    }
    var f=player.flags||{},n=maxR*6;
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
    for(var i=0;i<RANKS.length;i++)if(score>=RANKS[i].min)r=RANKS[i];
    return r;
  }
  window.getPlayerRank=function(player){return player?rankByScore(scoreOf(player)):RANKS[0];};
  window.getPlayerRankName=function(player){return getPlayerRank(player).name;};
  window.getPlayerRankScore=function(player){return player?scoreOf(player):0;};
  window.getPlayerRankProgress=function(player){
    var rank=getPlayerRank(player),score=scoreOf(player),next=RANKS[rank.id+1];
    if(!next)return{current:score,next:null,need:0,percent:100};
    var span=next.min-rank.min;
    return{current:score,next:next,need:Math.max(0,next.min-score),percent:Math.max(0,Math.min(100,Math.floor((score-rank.min)/span*100)))};
  };
  window.syncPlayerRank=function(player){
    if(!player)return false;
    if(!player.flags)player.flags={};
    var rank=getPlayerRank(player),prev=player.rankId==null?-1:(player.rankId|0);
    player.rankId=rank.id;player.rankName=rank.name;
    if(rank.id>prev){
      if(!Array.isArray(player.logs))player.logs=[];
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
    return{ok:false,msg:"人物境界不足：学【"+(skill.quality||"?")+"】需达到「"+needName+"」（当前「"+rank.name+"」）"};
  }
  window.canLearnByRank=canLearnByRank;
  window.PLAYER_RANKS=RANKS;

  function wrapCanLearn(){
    if(typeof canLearn!=="function"||canLearn._rankWrapped)return;
    var _can=canLearn;
    window.canLearn=function(player,skill){var r=_can(player,skill);return r.ok?canLearnByRank(player,skill):r;};
    window.canLearn._rankWrapped=true;
  }
  function wrapProgress(){
    if(typeof learnSkill==="function"&&!learnSkill._rankHook){
      var _ls=learnSkill;
      window.learnSkill=function(player,skill){var gate=canLearnByRank(player,skill);if(!gate.ok)return gate;var r=_ls(player,skill);if(r&&r.ok)syncPlayerRank(player);return r;};
      window.learnSkill._rankHook=true;
    }
    if(typeof trainSkill==="function"&&!trainSkill._rankHook){
      var _ts=trainSkill;
      window.trainSkill=function(player,skillId,amount){var r=_ts(player,skillId,amount);if(r&&r.ok)syncPlayerRank(player);return r;};
      window.trainSkill._rankHook=true;
    }
  }
  function wrapCombat(){
    if(typeof resolveThreat!=="function"||resolveThreat._rankHook)return;
    var _rt=resolveThreat;
    window.resolveThreat=function(player,diff,baseDamage,opts){
      var rank=getPlayerRank(player),d=diff|0;
      if(rank.id>=5)d=Math.max(1,Math.floor(d*0.88));
      else if(rank.id>=4)d=Math.max(1,Math.floor(d*0.92));
      else if(rank.id>=3)d=Math.max(1,Math.floor(d*0.96));
      return _rt(player,d,baseDamage,opts);
    };
    window.resolveThreat._rankHook=true;
  }
  function rankTag(rank){
    return '<span class="rank-tag" style="border-color:'+rank.color+';color:'+rank.color+'">'+rank.name+'</span>';
  }
  function injectHud(player){
    if(!player)return;
    syncPlayerRank(player);
    var rank=getPlayerRank(player),hud=document.querySelector(".hud");
    if(!hud)return;
    var old=document.getElementById("rankTagHud");if(old)old.remove();
    var el=document.createElement("span");el.id="rankTagHud";el.className="rank-tag";el.style.borderColor=rank.color;el.style.color=rank.color;el.title="人物境界：整体战力、武学与经历综合";el.textContent=rank.name;
    var first=hud.querySelector("span");
    if(first&&first.parentNode===hud)hud.insertBefore(el,first.nextSibling);else hud.appendChild(el);
  }
  function injectCharPanel(player){
    if(!player)return;
    syncPlayerRank(player);
    var rank=getPlayerRank(player),pg=getPlayerRankProgress(player),modal=document.querySelector(".modal-panel");
    if(!modal)return;
    var old=modal.querySelector("#rankBlock");if(old)old.remove();
    var block=document.createElement("div");block.id="rankBlock";block.style.cssText="margin:10px 0;padding:10px 12px;border:1px solid rgba(217,173,98,.25);border-radius:8px;background:rgba(255,255,255,.025)";
    var nextText=pg.next?"下一境界："+pg.next.name+" · 还需约 "+pg.need+" 综合值":"已达当前人物境界上限";
    var percent=pg.percent;
    block.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b>人物境界</b>'+rankTag(rank)+'</div>'+
      '<div style="height:5px;margin:8px 0 5px;background:rgba(255,255,255,.08);border-radius:5px;overflow:hidden"><div style="width:'+percent+'%;height:100%;background:'+rank.color+';border-radius:5px"></div></div>'+
      '<div class="small" style="display:flex;justify-content:space-between;gap:8px"><span>综合值 '+pg.current+'</span><span>'+nextText+'</span></div>'+
      '<div class="small" style="margin-top:6px">功法境界独立计算；人物境界只影响学武门槛、展示与高境界遇敌修正。</div>';
    var powerStat=null;
    modal.querySelectorAll(".stat").forEach(function(s){if(s.textContent&&s.textContent.indexOf("战力")>=0)powerStat=s;});
    if(powerStat&&powerStat.parentNode)powerStat.parentNode.insertBefore(block,powerStat.nextSibling);
    else{var grid=modal.querySelector(".stat-grid");if(grid)grid.parentNode.insertBefore(block,grid.nextSibling);else modal.appendChild(block);}
  }
  function hookModal(){
    var _om=typeof openModal==="function"?openModal:null;
    if(!_om||_om._rankHook)return;
    window.openModal=function(html){_om.apply(this,arguments);setTimeout(function(){if(window.state&&state.player)injectCharPanel(state.player);},0);};
    window.openModal._rankHook=true;
  }
  setTimeout(function(){
    wrapCanLearn();wrapProgress();wrapCombat();hookModal();
    if(typeof Game!=="undefined"&&Game.on){
      Game.on("player:ensure",function(p){if(p)syncPlayerRank(p);});
      Game.on("render:after",function(p){if(p)injectHud(p);});
    }
  },40);
})();
