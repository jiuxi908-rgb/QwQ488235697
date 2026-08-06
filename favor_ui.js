/* favor UI patch — overrides after logic.js */
(function(){
  var _ensure=ensurePlayer;
  ensurePlayer=function(p){
    p=_ensure(p);
    if(!p.favor)p.favor={};
    return p;
  };
  formatLog=function(text){
    if(!text)return"";
    var dayMatch=text.match(/^(第\d+日)/);var day=dayMatch?dayMatch[1]:"";
    var body=day?text.slice(day.length).replace(/^，/,""):text;
    var cls="log-normal";
    if(/完胜|银两\+|气血\+|内力\+|经验\+|突破|拜入|贡献\+|完成任务|学会|购得|指点|休整|求医|赢了|晋升|师父|好感\+/.test(body))cls="log-gain";
    else if(/惨败|受挫|气血-|银两-|失败|损失|输了|好感-/.test(body))cls="log-loss";
    body=body.replace(/（([^）]+)）/g,'<span class="'+cls+'">（$1）</span>');
    body=body.replace(/【战力(\d+) vs 难度(\d+) · (完胜|险胜|受挫|惨败)】/g,'<span class="power">【战力$1 vs 难度$2 · $3】</span>');
    return'<div class="log-item"><span class="log-day">'+day+'</span><span class="'+cls+'">'+body+'</span></div>';
  };

  modalNpc=function(npcId){
    var p=ensurePlayer(state.player);
    var npc=findPerson(npcId);
    if(!npc)return;
    var fav=(typeof getFavor==="function"?getFavor(p,npc.id):(p.favor[npc.id]|0));
    var rank=(typeof favorRank==="function"?favorRank(fav):{name:"陌生",color:"#b9a58a"});
    var talk=(typeof getDialogueLine==="function"?getDialogueLine(npc,fav):(typeof enrichTalk==="function"?enrichTalk(npc):npc.talks[0]));
    var topics=(typeof CHAT_TOPICS!=="undefined"?CHAT_TOPICS:[{id:"weather",name:"闲聊",favor:2}]);
    var dayKey="chat_"+npc.id+"_"+p.day;
    var chatLeft=Math.max(0,3-((p.flags[dayKey]|0)));

    var topicHtml="";
    topics.forEach(function(t){
      var locked=t.need&&fav<t.need;
      var dis=(locked||chatLeft<=0)?"disabled":"";
      var need=locked?("（需"+t.need+"）"):"";
      topicHtml+='<button class="btn sm chat-topic" data-id="'+t.id+'" '+dis+'>'+t.name+need+'</button>';
    });
    topicHtml+='<button class="btn sm" id="giftBtn">送礼（15两）</button>';

    var actHtml="";
    (npc.acts||[]).forEach(function(a){
      var flagKey=npc.id+"_"+a.id;
      var done=a.once&&p.flags[flagKey];
      var cost=a.cost||0;
      var extra="";
      if(a.type==="duel")extra=" · 难度"+a.diff;
      if(a.type==="skill")extra=" · 学武";
      if(done)extra=" · 已完成";
      if(a.favorNeed)extra+=" · 好感≥"+a.favorNeed;
      var disc=(typeof favorCostDiscount==="function"?favorCostDiscount(fav):1);
      var shopType=a.type==="heal"||a.type==="rest"||a.type==="item"||a.type==="exp";
      var showCost=(cost>0&&shopType)?Math.max(1,Math.floor(cost*disc)):cost;
      var priceNote="";
      if(showCost)priceNote=(disc<1&&shopType)?("（"+showCost+"两·熟客）"):("（"+showCost+"两）");
      actHtml+='<button class="btn primary npc-act" data-act="'+a.id+'" '+(done?"disabled":"")+'>'+a.name+priceNote+'<span class="small">'+extra+'</span></button>';
    });

    openModal(
      '<div class="modal-head"><h2 class="section-title">'+npc.name+' <span class="tag">'+npc.title+'</span></h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">'+npc.desc+'</p>'+
      '<div class="favor-row"><span class="small">好感</span><div class="favor-bar"><div class="favor-fill" style="width:'+fav+'%;background:'+rank.color+'"></div></div>'+
      '<span class="rank-tag" style="border-color:'+rank.color+';color:'+rank.color+'">'+rank.name+' '+fav+'</span></div>'+
      '<div class="talk-bubble">「'+talk+'」</div>'+
      '<h3 class="section-title">交谈 <span class="small">今日还可聊 '+chatLeft+' 次</span></h3>'+
      '<div class="row" style="margin-bottom:8px">'+topicHtml+'</div>'+
      '<h3 class="section-title">互动</h3>'+
      '<div class="row" style="flex-direction:column;gap:5px;align-items:stretch">'+actHtml+'</div>'
    );

    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qsa(".chat-topic").forEach(function(el){
      el.onclick=function(){
        var r=chatWithNpc(p,npc,el.dataset.id);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);
        modalNpc(npcId);
      };
    });
    if(qs("#giftBtn"))qs("#giftBtn").onclick=function(){
      var r=giftNpc(p,npc);
      if(!r.ok)p.logs.unshift(r.msg);
      saveGame(state);
      modalNpc(npcId);
    };
    qsa(".npc-act").forEach(function(el){
      el.onclick=function(){
        var r=interactPerson(p,npc,el.dataset.act);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);
        modalNpc(npcId);
      };
    });
  };
})();
