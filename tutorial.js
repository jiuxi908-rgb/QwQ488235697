/* 新手引导：首次进入江湖 5 步 */
(function(){
  var STEPS=[
    {id:0,title:"踏入清河",body:"你初到【清河镇】。上方是气血、内力、银两与战力；下方地图可点邻地前往，或点「游历」在本地历事。",hint:"先熟悉主界面即可。"},
    {id:1,title:"学一门武",body:"清河镇可学破风拳、青锋剑诀等黄阶武学（按钮在地点说明下方）。无银也可学免费的。",hint:"点学武按钮，学会第一门武学。"},
    {id:2,title:"第一次游历",body:"点工具栏「游历」。可能遇平静见闻、机缘，也可能遇敌——战力越高越稳。",hint:"完成一次游历。"},
    {id:3,title:"认识人物",body:"地点栏「人物」可与 NPC 交谈、切磋、送礼。好感高了可结缘、邀入住家园。",hint:"点开任意人物看一眼。"},
    {id:4,title:"任务与主线",body:"工具栏「任务」可接江湖委托。界面上方「主线」会提示下一步目标，跟着走就不会迷路。",hint:"引导结束，江湖路远，多加小心。"}
  ];

  function ensureTut(p){
    if(!p.flags)p.flags={};
    if(p.flags.tutorialDone)return p;
    if(p.flags.tutorialStep==null)p.flags.tutorialStep=0;
    return p;
  }

  function checkProgress(p){
    ensureTut(p);
    if(p.flags.tutorialDone)return;
    var step=p.flags.tutorialStep|0;
    if(step===1 && p.skills && p.skills.length>0)p.flags.tutorialStep=2;
    if(step===2 && p.flags._tutExplored)p.flags.tutorialStep=3;
    if(step===3 && p.flags._tutNpc)p.flags.tutorialStep=4;
  }

  window.showTutorial=function(force){
    var p=state&&state.player;if(!p)return;
    ensureTut(p);
    if(!force && p.flags.tutorialDone)return;
    checkProgress(p);
    var step=Math.min(STEPS.length-1,p.flags.tutorialStep|0);
    var s=STEPS[step];
    var last=step>=STEPS.length-1;
    openModal(
      '<div class="modal-head"><h2 class="section-title">江湖指引 · '+(step+1)+'/'+STEPS.length+
      '</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small" style="color:var(--gold)">'+s.title+'</p>'+
      '<div class="talk-bubble">'+s.body+'</div>'+
      '<p class="small">'+s.hint+'</p>'+
      '<div class="row" style="margin-top:10px">'+
        (last
          ?'<button class="btn primary" id="tutDone">开始闯荡</button>'
          :'<button class="btn primary" id="tutNext">下一步</button>')+
        '<button class="btn sm" id="tutSkip">跳过引导</button></div>'
    );
    var close=function(){closeModal();if(typeof renderGame==="function")renderGame();};
    qs("#mClose").onclick=close;
    if(qs("#tutNext"))qs("#tutNext").onclick=function(){
      p.flags.tutorialStep=Math.min(STEPS.length-1,(p.flags.tutorialStep|0)+1);
      if(typeof saveGame==="function")saveGame(state);
      showTutorial(true);
    };
    if(qs("#tutDone"))qs("#tutDone").onclick=function(){
      p.flags.tutorialDone=true;p.flags.tutorialStep=STEPS.length;
      p.logs.unshift("你已明白入门门道，自此自行闯荡江湖。");
      if(typeof saveGame==="function")saveGame(state);close();
    };
    if(qs("#tutSkip"))qs("#tutSkip").onclick=function(){
      p.flags.tutorialDone=true;
      if(typeof saveGame==="function")saveGame(state);close();
    };
  };

  function wireTips(){
    var p=state&&state.player;if(!p)return;
    ensureTut(p);
    checkProgress(p);
    if(p.flags.tutorialDone)return;
    var bar=document.querySelector(".toolbar");
    if(bar && !qs("#tutBtn",bar)){
      var b=document.createElement("button");
      b.className="btn sm primary";b.id="tutBtn";b.textContent="指引";
      b.onclick=function(){showTutorial(true);};
      bar.insertBefore(b,bar.firstChild);
    }
  }

  if(typeof Game!=="undefined"&&Game.on){
    Game.on("player:ensure",function(p){
      if(!p.flags)p.flags={};
      if(p.flags.tutorialDone==null && p.day<=1 && (!p.skills||!p.skills.length))
        p.flags.tutorialStep=p.flags.tutorialStep||0;
    });
    Game.on("render:after",function(p){
      wireTips();
      if(!p||p.flags.tutorialDone)return;
      if(p.flags._tutAutoShown)return;
      p.flags._tutAutoShown=true;
      setTimeout(function(){if(!p.flags.tutorialDone)showTutorial(true);},280);
    });
  }

  var _learn=typeof learnSkill==="function"?learnSkill:null;
  if(_learn){
    window.learnSkill=function(player,skill){
      var r=_learn(player,skill);
      if(r&&r.ok){ensureTut(player);if((player.flags.tutorialStep|0)===1)player.flags.tutorialStep=2;}
      return r;
    };
  }
  window._tutorialHookExplore=function(player,r){
    if(r&&r.ok){ensureTut(player);player.flags._tutExplored=true;
      if((player.flags.tutorialStep|0)===2)player.flags.tutorialStep=3;}
  };
  var _mn=typeof modalNpc==="function"?modalNpc:null;
  if(_mn){
    window.modalNpc=function(id){
      var p=state&&state.player;
      if(p){ensureTut(p);p.flags._tutNpc=true;if((p.flags.tutorialStep|0)===3)p.flags.tutorialStep=4;}
      return _mn(id);
    };
  }

  var _cp=typeof createPlayer==="function"?createPlayer:null;
  if(_cp){
    window.createPlayer=function(opts){
      var p=_cp(opts);
      if(!p.flags)p.flags={};
      p.flags.tutorialStep=0;p.flags.tutorialDone=false;p.flags._tutAutoShown=false;
      return p;
    };
  }
})();
