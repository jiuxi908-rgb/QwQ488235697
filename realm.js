/** realm.js — 人物境界
 * 使用 Game.hook / Game.on，不直接覆盖业务函数，避免脚本加载顺序导致的多层包装。
 */
(function(g){
  "use strict";
  var RANKS=[
    {id:0,name:"未入流",min:0,color:"#8a7a6a"},{id:1,name:"三流",min:45,color:"#9a8a6a"},{id:2,name:"二流",min:90,color:"#b9a58a"},{id:3,name:"一流",min:145,color:"#d9ad62"},{id:4,name:"超一流",min:225,color:"#e8c878"},{id:5,name:"宗师",min:330,color:"#f5e8cf"}
  ];
  var QUALITY_NEED={"黄阶":0,"玄阶":1,"地阶":2,"天阶":3};
  function auxScore(p){var skills=p.skills||[],maxR=0,ng=false,qg=false;skills.forEach(function(s){maxR=Math.max(maxR,s.realm|0);if(s.type==="内功")ng=true;if(s.type==="轻功")qg=true;});var f=p.flags||{},n=maxR*6;if(ng)n+=8;if(qg)n+=8;if(f.mq_secret)n+=10;if(f.mainDone)n+=12;if(p.sect)n+=5;return n;}
  function scoreOf(p){return (typeof calcCombatPower==="function"?calcCombatPower(p):0)+auxScore(p);}
  function rankByScore(score){var r=RANKS[0];for(var i=0;i<RANKS.length;i++)if(score>=RANKS[i].min)r=RANKS[i];return r;}
  g.getPlayerRank=function(p){return p?rankByScore(scoreOf(p)):RANKS[0];};
  g.getPlayerRankName=function(p){return g.getPlayerRank(p).name;};
  g.getPlayerRankScore=function(p){return p?scoreOf(p):0;};
  g.getPlayerRankProgress=function(p){var r=g.getPlayerRank(p),score=scoreOf(p),next=RANKS[r.id+1];if(!next)return{current:score,next:null,need:0,percent:100};var span=next.min-r.min;return{current:score,next:next,need:Math.max(0,next.min-score),percent:Math.max(0,Math.min(100,Math.floor((score-r.min)/span*100)))};};
  g.syncPlayerRank=function(p){if(!p)return false;if(!p.flags)p.flags={};var r=g.getPlayerRank(p),prev=p.rankId==null?-1:p.rankId|0;p.rankId=r.id;p.rankName=r.name;if(r.id>prev){if(!Array.isArray(p.logs))p.logs=[];p.logs.unshift("【境界】你已跻身「"+r.name+"」之列。");p.logs=p.logs.slice(0,50);if(g.Game&&Game.emit)Game.emit("realm:up",{player:p,rank:r});return true;}return false;};
  function gate(p,skill){if(!skill)return{ok:true};var need=QUALITY_NEED[skill.quality];if(need==null)return{ok:true};var r=g.getPlayerRank(p);if(r.id>=need)return{ok:true};return{ok:false,msg:"人物境界不足：学【"+(skill.quality||"?")+"】需达到「"+(RANKS[need]?RANKS[need].name:"境界"+need)+"」（当前「"+r.name+"」）"};}
  g.canLearnByRank=gate;g.PLAYER_RANKS=RANKS;
  function registerHooks(){
    if(!g.Game||typeof Game.hook!=="function")return;
    Game.hook("canLearn",function(next){return function(player,skill){var r=next.apply(this,arguments);return r&&r.ok===false?r:gate(player,skill).ok?r:gate(player,skill);};});
    Game.hook("learnSkill",function(next){return function(player,skill){var gateResult=gate(player,skill);if(!gateResult.ok)return gateResult;var r=next.apply(this,arguments);if(r&&r.ok)g.syncPlayerRank(player);return r;};});
    Game.hook("trainSkill",function(next){return function(player,skillId,amount){var r=next.apply(this,arguments);if(r&&r.ok)g.syncPlayerRank(player);return r;};});
    Game.hook("resolveThreat",function(next){return function(player,diff,baseDamage,opts){var r=g.getPlayerRank(player),d=diff|0;if(r.id>=5)d=Math.max(1,Math.floor(d*.88));else if(r.id>=4)d=Math.max(1,Math.floor(d*.92));else if(r.id>=3)d=Math.max(1,Math.floor(d*.96));return next.call(this,player,d,baseDamage,opts);};});
    Game.on("player:ensure",function(p){g.syncPlayerRank(p);});
    Game.on("render:after",function(p){if(p)injectHud(p);});
    Game.on("city:explore",function(e){if(e&&e.player)g.syncPlayerRank(e.player);});
  }
  function rankTag(r){return '<span class="rank-tag" style="border-color:'+r.color+';color:'+r.color+'">'+r.name+'</span>';}
  function injectHud(p){var hud=document.querySelector(".hud");if(!hud)return;var r=g.getPlayerRank(p),old=document.getElementById("rankTagHud");if(old)old.remove();var el=document.createElement("span");el.id="rankTagHud";el.className="rank-tag";el.style.borderColor=r.color;el.style.color=r.color;el.textContent=r.name;hud.appendChild(el);}
  function injectPanel(p){var modal=document.querySelector(".modal-panel");if(!modal)return;var old=modal.querySelector("#rankBlock");if(old)old.remove();var r=g.getPlayerRank(p),pg=g.getPlayerRankProgress(p),block=document.createElement("div");block.id="rankBlock";block.style.cssText="margin:10px 0;padding:10px 12px;border:1px solid rgba(217,173,98,.25);border-radius:8px;background:rgba(255,255,255,.025)";block.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between"><b>人物境界</b>'+rankTag(r)+'</div><div style="height:5px;margin:8px 0 5px;background:rgba(255,255,255,.08);border-radius:5px;overflow:hidden"><div style="width:'+pg.percent+'%;height:100%;background:'+r.color+'"></div></div><div class="small" style="display:flex;justify-content:space-between"><span>综合值 '+pg.current+'</span><span>'+(pg.next?"下一境界："+pg.next.name+" · 还需约 "+pg.need:"已达当前人物境界上限")+'</span></div><div class="small" style="margin-top:6px">人物境界影响学武门槛、展示与高境界遇敌修正；功法境界独立计算。</div>';var grid=modal.querySelector(".stat-grid");if(grid)grid.parentNode.insertBefore(block,grid.nextSibling);else modal.appendChild(block);}
  function installUiHook(){if(!g.Game||typeof Game.hook!=="function")return;Game.hook("openModal",function(next){return function(){var r=next.apply(this,arguments);setTimeout(function(){var p=g.state&&g.state.player;if(p)injectPanel(p);},0);return r;};});}
  function ready(){registerHooks();installUiHook();var p=g.state&&g.state.player;if(p)g.syncPlayerRank(p);}
  if(g.Game&&Game.on){Game.on("core:ready",ready);Game.on("data:ready",ready);}setTimeout(ready,100);setTimeout(ready,500);
})(typeof window!=="undefined"?window:this);
